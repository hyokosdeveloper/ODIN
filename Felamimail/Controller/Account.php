<?php
/**
 * Tine 2.0
 *
 * @package     Felamimail
 * @subpackage  Controller
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: Account.php,v 1.1 2009/12/08 23:14:32 hyokos Exp $
 * 
 * @todo        make it possible to switch back to smtp creds = imap creds even if extra smtp creds have been created
 * @todo        reset default account preference if default account has been deleted
 */

/**
 * Account controller for Felamimail
 *
 * @package     Felamimail
 * @subpackage  Controller
 */
class Felamimail_Controller_Account extends Tinebase_Controller_Record_Abstract
{
    /**
     * application name (is needed in checkRight())
     *
     * @var string
     */
    protected $_applicationName = 'Felamimail';
    
    /**
     * we need this for the searchCount -> set to true if default account has been added
     *
     * @var boolean
     */
    protected $_addedDefaultAccount = FALSE;
    
    /**
     * holds the instance of the singleton
     *
     * @var Felamimail_Controller_Account
     */
    private static $_instance = NULL;
    
    /**
     * the constructor
     *
     * don't use the constructor. use the singleton
     */
    private function __construct() {
        $this->_modelName = 'Felamimail_Model_Account';
        $this->_doContainerACLChecks = FALSE;
        $this->_backend = new Felamimail_Backend_Account();
        
        $this->_currentAccount = Tinebase_Core::getUser();
    }
    
    /**
     * don't clone. Use the singleton.
     *
     */
    private function __clone() 
    {        
    }
    
    /**
     * the singleton pattern
     *
     * @return Felamimail_Controller_Account
     */
    public static function getInstance() 
    {
        if (self::$_instance === NULL) {            
            self::$_instance = new Felamimail_Controller_Account();
        }
        
        return self::$_instance;
    }

    /******************************** overwritten funcs *********************************/
    
    /**
     * get list of records
     *
     * @param Tinebase_Model_Filter_FilterGroup|optional $_filter
     * @param Tinebase_Model_Pagination|optional $_pagination
     * @param bool $_getRelations
     * @param boolean $_onlyIds
     * @return Tinebase_Record_RecordSet|array
     */
    public function search(Tinebase_Model_Filter_FilterGroup $_filter = NULL, Tinebase_Record_Interface $_pagination = NULL, $_getRelations = FALSE, $_onlyIds = FALSE)
    {
        if ($_filter === NULL) {
            $_filter = new Felamimail_Model_AccountFilter(array());
        }
        
        $result = parent::search($_filter, $_pagination, $_getRelations, $_onlyIds);
        
        // check preference / config if we should add default account with tine user credentials or from config.inc.php 
        $this->_addDefaultAccount($result);
        
        return $result;
    }

    /**
     * Gets total count of search with $_filter
     * 
     * @param Tinebase_Model_Filter_FilterGroup $_filter
     * @return int
     */
    public function searchCount(Tinebase_Model_Filter_FilterGroup $_filter) 
    {
        $count = parent::searchCount($_filter);        
        if ($this->_addedDefaultAccount) {
            $count++;
        }
        return $count;
    }
    
    /**
     * get by id
     *
     * @param string $_id
     * @param int $_containerId
     * @return Tinebase_Record_Interface
     */
    public function get($_id, $_containerId = NULL)
    {
        if ($_id === Felamimail_Model_Account::DEFAULT_ACCOUNT_ID) {
            if (! isset(Tinebase_Core::getConfig()->imap)) {
                throw new Felamimail_Exception('No default imap account defined in config.inc.php!');
            }
            
            // get account data from config file    
            $record = new Felamimail_Model_Account(Tinebase_Core::getConfig()->imap->toArray());
            
            if (! isset(Tinebase_Core::getConfig()->smtp)) {
                // just warn
                //throw new Felamimail_Exception('No default smtp account defined in config.inc.php!');
                Tinebase_Core::getLogger()->warn(__METHOD__ . '::' . __LINE__ . ' No default smtp account defined in config.inc.php!');
            } else {
                $record->smtp_hostname  = Tinebase_Core::getConfig()->smtp->hostname;
                $record->smtp_user      = Tinebase_Core::getConfig()->smtp->username;
                $record->smtp_password  = Tinebase_Core::getConfig()->smtp->password;
            }
            
            $record->setId(Felamimail_Model_Account::DEFAULT_ACCOUNT_ID);
        } else {
            $record = parent::get($_id, $_containerId);
        }
        
        return $record;    
    }
    
    /**
     * add one record
     *
     * @param   Tinebase_Record_Interface $_record
     * @return  Tinebase_Record_Interface
     * 
     * @todo do we really want to add new account as default account pref?
     */
    public function create(Tinebase_Record_Interface $_record)
    {
        $result = parent::create($_record);
        
        // set as default account
        Tinebase_Core::getPreference('Felamimail')->{Felamimail_Preference::DEFAULTACCOUNT} = $result->getId();
        
        // update account capabilities
        $result = $this->updateCapabilities($result);
        
        return $result;
    }
    
    /**
     * Removes accounts where current user has no access to
     * 
     * @param Tinebase_Model_Filter_FilterGroup $_filter
     * @param string $_action get|update
     */
    protected function _checkFilterACL(/*Tinebase_Model_Filter_FilterGroup */$_filter, $_action = 'get')
    {        
        foreach ($_filter->getFilterObjects() as $filter) {
            if ($filter->getField() === 'user_id') {
                $userFilter = $filter;
                $userFilter->setValue($this->_currentAccount->getId());
            }
        }
        
        if (! isset($userFilter)) {
            // force a $userFilter filter (ACL)
            $userFilter = $_filter->createFilter('user_id', 'equals', $this->_currentAccount->getId());
            $_filter->addFilter($userFilter);
            
            Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' Adding user_id filter.');
        }
    }

    /**
     * inspect creation of one record
     * - add credentials and user id here
     * 
     * @param   Tinebase_Record_Interface $_record
     * @return  void
     */
    protected function _inspectCreate(Tinebase_Record_Interface $_record)
    {
        // add user id
        $_record->user_id = $this->_currentAccount->getId();
        
        // use the imap host as smtp host if empty
        if (! $_record->smtp_hostname) {
            $_record->smtp_hostname = $_record->host;
        }
        
        if (! $_record->user || ! $_record->password) {
            Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' No username or password given for new account.');
            return;    
        }
        
        // add imap & smtp credentials
        $_record->credentials_id = $this->_createCredentials($_record->user, $_record->password);
        if ($_record->smtp_user && $_record->smtp_password) {
            Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' Create SMTP credentials.');
            $_record->smtp_credentials_id = $this->_createCredentials($_record->smtp_user, $_record->smtp_password);
        } else {
            $_record->smtp_credentials_id = $_record->credentials_id;
        }
    }

    /**
     * inspect update of one record
     * - update credentials here
     * 
     * @param   Tinebase_Record_Interface $_record      the update record
     * @param   Tinebase_Record_Interface $_oldRecord   the current persistent record
     * @return  void
     */
    protected function _inspectUpdate($_record, $_oldRecord)
    {
        // get old credentials
        $credentialsBackend = Tinebase_Auth_CredentialCache::getInstance();
        $userCredentialCache = Tinebase_Core::get(Tinebase_Core::USERCREDENTIALCACHE);
        
        if ($userCredentialCache !== NULL) {
                $credentialsBackend->getCachedCredentials($userCredentialCache);
        } else {
            Tinebase_Core::getLogger()->crit(__METHOD__ . '::' . __LINE__ 
                . ' Something went wrong with the CredentialsCache / use given username/password instead.'
            );
            return;
        }
        
        if ($_oldRecord->credentials_id) {
            $credentials = $credentialsBackend->get($_oldRecord->credentials_id);
            $credentials->key = substr($userCredentialCache->password, 0, 24);
            $credentialsBackend->getCachedCredentials($credentials);
        } else {
            $credentials = new Tinebase_Model_CredentialCache(array(
                'username'  => '',
                'password'  => ''
            ));
        }
        
        // check if something changed
        if (
            ! $_oldRecord->credentials_id
            ||  (! empty($_record->user) && $_record->user !== $credentials->username)
            ||  (! empty($_record->password) && $_record->password !== $credentials->password)
        ) {
            $newPassword = ($_record->password) ? $_record->password : $credentials->password;
            $newUsername = ($_record->user) ? $_record->user : $credentials->username;

            $_record->credentials_id = $this->_createCredentials($newUsername, $newPassword);
            $imapCredentialsChanged = TRUE;
        } else {
            $imapCredentialsChanged = FALSE;
        }
        
        if ($_record->smtp_user && $_record->smtp_password) {
            // create extra smtp credentials
            Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' Update/create SMTP credentials.');
            $_record->smtp_credentials_id = $this->_createCredentials($_record->smtp_user, $_record->smtp_password);
            
        } else if (
            $imapCredentialsChanged 
            && (! $_record->smtp_credentials_id || $_record->smtp_credentials_id == $_oldRecord->credentials_id)
        ) {
            // use imap credentials for smtp auth as well
            $_record->smtp_credentials_id = $_record->credentials_id;
        }
    }

    /******************************** public funcs ************************************/
    
    /**
     * change account password
     *
     * @param string $_accountId
     * @param string $_username
     * @param string $_password
     * @return boolean
     */
    public function changeCredentials($_accountId, $_username, $_password)
    {
        Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' Changing credentials for account id ' . $_accountId);
        
        // get account and set pwd
        $account = $this->get($_accountId);
        
        $account->user = $_username;
        $account->password = $_password;
        
        // update account
        $this->update($account);
        
        return TRUE;
    }
    
    /**
     * get imap server capabilities and save delimiter / personal namespace in account
     *
     * @param Felamimail_Model_Account $_account
     * @param Felamimail_Backend_Imap $_imapBackend
     * @param string $_delimiter
     * @return Felamimail_Model_Account
     */
    public function updateCapabilities($_account, $_imapBackend = NULL, $_delimiter = NULL)
    {
        if ($_imapBackend === NULL) {
            try {
                $_imapBackend = Felamimail_Backend_ImapFactory::factory($_account);
            } catch (Zend_Mail_Storage_Exception $zmse) {
                Tinebase_Core::getLogger()->warn(__METHOD__ . '::' . __LINE__ 
                    . ' Wrong user credentials ... '
                    . '(' . $zmse->getMessage() . ')'
                );
                return $_account;
            } catch (Zend_Mail_Protocol_Exception $zmpe) {
                Tinebase_Core::getLogger()->warn(__METHOD__ . '::' . __LINE__ 
                    . ' No connection to imap server ...'
                    . '(' . $zmpe->getMessage() . ')'
                );
                return $_account;
            }
        }
        
        // get imap server capabilities and save delimiter / personal namespace in account
        $capabilities = $_imapBackend->getCapabilityAndNamespace();
        
        //Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' ' . print_r($capabilities, TRUE));
        
        if (isset($capabilities['namespace'])) {
            $_account->delimiter     = $capabilities['namespace']['personal']['delimiter'];
            $_account->ns_personal   = (! empty($capabilities['namespace']['personal'])) ? $capabilities['namespace']['personal']['name']: '';
            $_account->ns_other      = (! empty($capabilities['namespace']['other']))    ? $capabilities['namespace']['other']['name']   : '';
            $_account->ns_shared     = (! empty($capabilities['namespace']['shared']))   ? $capabilities['namespace']['shared']['name']  : '';
            
            if ($_account->ns_personal == 'NIL') {
                Tinebase_Core::getLogger()->warn(__METHOD__ . '::' . __LINE__ . ' No personal namespace available!');
            } else {
                Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' Setting personal namespace: "' . $_account->ns_personal . '"');
            }
            
        } else if ($_delimiter !== NULL) {
            // get delimiter from params
            if ($_delimiter != $_account->delimiter) {
                $_account->delimiter = $_delimiter;
                Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' Setting new delimiter: ' . $_delimiter);
            }
        }
        
        // don't update default account
        if (! $_account->id || $_account->id == Felamimail_Model_Account::DEFAULT_ACCOUNT_ID) {
            $result = $_account;
        } else {
            $result = $this->update($_account);
        }
        
        return $result;
    }
    
    /******************************** protected funcs *********************************/

    /**
     * add default account with tine user credentials or from config.inc.php 
     *
     * @param Tinebase_Record_RecordSet $_accounts
     * 
     * @todo get default account data (host, port, ...) from preferences?
     */
    protected function _addDefaultAccount($_accounts)
    {
        // add account from config.inc.php if available
        if (isset(Tinebase_Core::getConfig()->imap) && Tinebase_Core::getConfig()->imap->useAsDefault) {
            
            try {
                $defaultAccount = new Felamimail_Model_Account(
                    Tinebase_Core::getConfig()->imap->toArray()
                );
                $defaultAccount->setId('default');
                $_accounts->addRecord($defaultAccount);
                $this->_addedDefaultAccount = TRUE;
                
            } catch (Tinebase_Exception $e) {
                Tinebase_Core::getLogger()->warn(__METHOD__ . '::' . __LINE__ . $e->getMessage());
            }
            
        // create new account with user credentials (if preference is set)
        } else if (count($_accounts) == 0 && Tinebase_Core::getPreference('Felamimail')->userEmailAccount) {
            
            $accountData = (Tinebase_Core::getConfig()->imap) ? Tinebase_Core::getConfig()->imap->toArray() : array();
            $defaultAccount = new Felamimail_Model_Account($accountData, TRUE);
            
            $userId = $this->_currentAccount->getId();
            $defaultAccount->user_id = $userId;
            
            $fullUser = Tinebase_User::getInstance()->getFullUserById($userId);
            $defaultAccount->user   = $fullUser->accountLoginName;
            
            // only create account if email address is set
            if ($fullUser->accountEmailAddress) {
                $defaultAccount->email  = $fullUser->accountEmailAddress;
                $defaultAccount->name   = $fullUser->accountEmailAddress;
                $defaultAccount->from   = $fullUser->accountFullName;
                
                // get password from credentials cache and create account credentials
                $defaultAccount->credentials_id = $this->_createCredentials();
                $defaultAccount->smtp_credentials_id = $defaultAccount->credentials_id;

                // add smtp server settings
                if (Tinebase_Core::getConfig()->smtp) {
                    $smtpConfig = Tinebase_Core::getConfig()->smtp;
                    $defaultAccount->smtp_port              = $smtpConfig->port;
                    $defaultAccount->smtp_hostname          = $smtpConfig->hostname;
                    $defaultAccount->smtp_auth              = $smtpConfig->auth;
                    $defaultAccount->smtp_secure_connection = $smtpConfig->ssl;             
                }
                
                // create new account
                $defaultAccount = $this->_backend->create($defaultAccount);
                $_accounts->addRecord($defaultAccount);
                $this->_addedDefaultAccount = TRUE;
                
                // set as default account preference
                Tinebase_Core::getPreference('Felamimail')->{Felamimail_Preference::DEFAULTACCOUNT} = $defaultAccount->getId();
                
                Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' Created new default account ' . $defaultAccount->name);
            }
        }
    }
    
    /**
     * create account credentials and return new credentials id
     *
     * @param string $_username
     * @param string $_password
     * @return string
     */
    protected function _createCredentials($_username = NULL, $_password = NULL)
    {
        Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' Create new account credentials for username ' . $_username);
        
        if (Tinebase_Core::isRegistered(Tinebase_Core::USERCREDENTIALCACHE)) {
            $userCredentialCache = Tinebase_Core::get(Tinebase_Core::USERCREDENTIALCACHE);
            Tinebase_Auth_CredentialCache::getInstance()->getCachedCredentials($userCredentialCache);
        } else {
            Tinebase_Core::getLogger()->crit(__METHOD__ . '::' . __LINE__ 
                . ' Something went wrong with the CredentialsCache / use given username/password instead.'
            );
            $userCredentialCache = new Tinebase_Model_CredentialCache(array(
                'username' => $_username,
                'password' => $_password,
            ));
        }

        $accountCredentials = Tinebase_Auth_CredentialCache::getInstance()->cacheCredentials(
            ($_username !== NULL) ? $_username : $userCredentialCache->username,
            ($_password !== NULL) ? $_password : $userCredentialCache->password,
            $userCredentialCache->password
        );
        
        return $accountCredentials->getId();
    }
}

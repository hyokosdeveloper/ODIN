<?php
/**
 * Tine 2.0
 *
 * @package     Admin
 * @subpackage  Controller
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2007-2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: User.php,v 1.1 2009/12/08 23:15:37 hyokos Exp $
 * 
 * @todo        extend Tinebase_Controller_Record_Abstract
 */

/**
 * User Controller for Admin application
 *
 * @package     Admin
 */
class Admin_Controller_User extends Tinebase_Controller_Abstract
{
	/**
	 * @var Tinebase_User_Abstract
	 */
	protected $_userBackend = NULL;
	
	/**
	 * @var bool
	 */
	protected $_manageSAM = false;
	
	/**
	 * @var Tinebase_SambaSAM_Ldap
	 */
	protected $_samBackend = NULL;

    /**
     * the constructor
     *
     * don't use the constructor. use the singleton 
     */
    private function __construct() 
    {
        $this->_currentAccount = Tinebase_Core::getUser();        
        $this->_applicationName = 'Admin';
		
		$this->_userBackend = Tinebase_User::getInstance();
		
		// manage samba sam?
		if(isset(Tinebase_Core::getConfig()->samba)) {
			$this->_manageSAM = Tinebase_Core::getConfig()->samba->get('manageSAM', false); 
			if ($this->_manageSAM) {
				$this->_samBackend = Tinebase_SambaSAM::getInstance();
			}
		}
    }

    /**
     * don't clone. Use the singleton.
     *
     */
    private function __clone() 
    {        
    }

    /**
     * holds the instance of the singleton
     *
     * @var Admin_Controller_User
     */
    private static $_instance = NULL;

    /**
     * the singleton pattern
     *
     * @return Admin_Controller_User
     */
    public static function getInstance() 
    {
        if (self::$_instance === NULL) {
            self::$_instance = new Admin_Controller_User;
        }
        
        return self::$_instance;
    }

    /**
     * get list of full accounts -> renamed to search full users
     *
     * @param string $_filter string to search accounts for
     * @param string $_sort
     * @param string $_dir
     * @param int $_start
     * @param int $_limit
     * @return Tinebase_Record_RecordSet with record class Tinebase_Model_FullUser
     */
    public function searchFullUsers($_filter, $_sort = NULL, $_dir = 'ASC', $_start = NULL, $_limit = NULL)
    {
        $this->checkRight('VIEW_ACCOUNTS');
        
        $result = $this->_userBackend->getUsers($_filter, $_sort, $_dir, $_start, $_limit, 'Tinebase_Model_FullUser');
        
        return $result;
    }
    
    /**
     * count users
     *
     * @param string $_filter string to search user accounts for
     * @return int total user count
     */
    public function searchCount($_filter)
    {
        $this->checkRight('VIEW_ACCOUNTS');
        
        $users = $this->_userBackend->getUsers($_filter);
        $result = count($users);
        
        return $result;
    }
    
    /**
     * get account
     *
     * @param   int $_accountId account id to get
     * @return  Tinebase_Model_FullUser
     */
    public function get($_accountId)
    {        
        $this->checkRight('VIEW_ACCOUNTS');
        
        $user = $this->_userBackend->getUserById($_accountId, 'Tinebase_Model_FullUser');
        
        if ($this->_manageSAM) {
            $samUser = $this->_samBackend->getUserById($_accountId);
            $user->sambaSAM = $samUser;
        }
        
        return $user;
    }
    
    /**
     * set account status
     *
     * @param   string $_accountId  account id
     * @param   string $_status     status to set
     * @return  array with success flag
     */
    public function setAccountStatus($_accountId, $_status)
    {
        $this->checkRight('MANAGE_ACCOUNTS');
        
        $result = $this->_userBackend->setStatus($_accountId, $_status);
        
        if ($this->_manageSAM) {
            $samResult = $this->_samBackend->setStatus($_accountId, $_status);
        }

        return $result;
    }
    
    /**
     * set the password for a given account
     *
     * @param Tinebase_Model_FullUser $_account the account
     * @param string $_password the new password
     * @param string $_passwordRepeat the new password again
     * @param bool $_mustChange
     * @return void
     * 
     * @todo add must change pwd info to normal tine user accounts
     * @todo add Admin_Event_ChangePassword?
     */
    public function setAccountPassword(Tinebase_Model_FullUser $_account, $_password, $_passwordRepeat, $_mustChange = FALSE)
    {
        $this->checkRight('MANAGE_ACCOUNTS');
        
        if ($_password != $_passwordRepeat) {
            throw new Admin_Exception("Passwords don't match.");
        }
        
        $this->_userBackend->setPassword($_account->accountLoginName, $_password);
        
        Tinebase_Core::getLogger()->debug(
            __METHOD__ . '::' . __LINE__ . 
            ' Set new password for user ' . $_account->accountLoginName . '. Must change:' . $_mustChange
        );
        
        if ($this->_manageSAM) {
            $samResult = $this->_samBackend->setPassword($_account, $_password, TRUE, $_mustChange);
        }
        
        // fire change password event
        /*
        $event = new Admin_Event_ChangePassword();
        $event->userId = $_account->getId();
        $event->password = $_password;
        Tinebase_Event::fireEvent($event);
        */
    }
    
    /**
     * save or update account
     *
     * @param Tinebase_Model_FullUser $_account the account
     * @param string $_password the new password
     * @param string $_passwordRepeat the new password again
     * @return Tinebase_Model_FullUser
     */
    public function update(Tinebase_Model_FullUser $_account, $_password, $_passwordRepeat)
    {
        $this->checkRight('MANAGE_ACCOUNTS');
        
        $account = $this->_userBackend->updateUser($_account);
        Tinebase_Group::getInstance()->addGroupMember($account->accountPrimaryGroup, $account);
        
        // fire needed events
        $event = new Admin_Event_UpdateAccount;
        $event->account = $account;
        Tinebase_Event::fireEvent($event);
        
        if ($this->_manageSAM) {
            $samResult = $this->_samBackend->updateUser($_account, $_account->sambaSAM);
            $account->sambaSAM = $samResult;
        }
        
        if (!empty($_password) && !empty($_passwordRepeat)) {
            $this->setAccountPassword($_account, $_password, $_passwordRepeat);
        }

        return $account;
    }
    
    /**
     * save or update account
     *
     * @param Tinebase_Model_FullUser $_account the account
     * @param string $_password the new password
     * @param string $_passwordRepeat the new password again
     * @return Tinebase_Model_FullUser
     */
    public function create(Tinebase_Model_FullUser $_account, $_password, $_passwordRepeat)
    {
        $this->checkRight('MANAGE_ACCOUNTS');
        
        // avoid forging accountId, get's created in backend
        unset($_account->accountId);
        
        $account = $this->_userBackend->addUser($_account);
        Tinebase_Group::getInstance()->addGroupMember($account->accountPrimaryGroup, $account);
        
        $event = new Admin_Event_AddAccount();
        $event->account = $account;
        Tinebase_Event::fireEvent($event);
        
        if ($this->_manageSAM) {
            $samResult = $this->_samBackend->addUser($account, $_account->sambaSAM);
            $account->sambaSAM = $samResult;
        }
        
        if (!empty($_password) && !empty($_passwordRepeat)) {
            $this->setAccountPassword($account, $_password, $_passwordRepeat);
        }

        return $account;
    }
    
    /**
     * delete accounts
     *
     * @param   array $_accountIds  array of account ids
     * @return  array with success flag
     */
    public function delete(array $_accountIds)
    {
        $this->checkRight('MANAGE_ACCOUNTS');
        
        $groupsBackend = Tinebase_Group::getInstance();
        foreach ((array)$_accountIds as $accountId) {
            Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . " about to remove user with id: {$accountId}");
            
            $memberships = $groupsBackend->getGroupMemberships($accountId);
            Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . " removeing user from groups: " . print_r($memberships, true));
            
            foreach ((array)$memberships as $groupId) {
                $groupsBackend->removeGroupMember($groupId, $accountId);
            }
            
            $this->_userBackend->deleteUser($accountId);
            if ($this->_manageSAM) {
                $this->_samBackend->deleteUser($accountId);
            }
        }
    }
}

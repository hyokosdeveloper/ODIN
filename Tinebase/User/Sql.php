<?php
/**
 * Tine 2.0
 * 
 * @package     Tinebase
 * @subpackage  User
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Lars Kneschke <l.kneschke@metaways.de>
 * @version     $Id: Sql.php,v 1.1 2009/12/08 23:14:33 hyokos Exp $
 * 
 * @todo        extend Tinebase_Application_Backend_Sql and replace some functions
 */

/**
 * sql implementation of the SQL users interface
 * 
 * @package     Tinebase
 * @subpackage  User
 */
class Tinebase_User_Sql extends Tinebase_User_Abstract
{
    /**
     * the constructor
     */
    public function __construct() {
        $this->_db = Tinebase_Core::getDb();
    }
    
    /**
     * copy of Tinebase_Core::get('dbAdapter')
     *
     * @var Zend_Db_Adapter_Abstract
     */
    private $_db;
    
    protected $rowNameMapping = array(
        'accountId'             => 'id',
        'accountDisplayName'    => 'n_fileas',
        'accountFullName'       => 'n_fn',
        'accountFirstName'      => 'n_given',
        'accountLastName'       => 'n_family',
        'accountLoginName'      => 'login_name',
        'accountLastLogin'      => 'last_login',
        'accountLastLoginfrom'  => 'last_login_from',
        'accountLastPasswordChange' => 'last_password_change',
        'accountStatus'         => 'status',
        'accountExpires'        => 'expires_at',
        'accountPrimaryGroup'   => 'primary_group_id',
        'accountEmailAddress'   => 'email',
        'accountHomeDirectory'  => 'home_dir',
        'accountLoginShell'     => 'login_shell',
    );
    
    /**
     * get list of users
     *
     * @param string $_filter
     * @param string $_sort
     * @param string $_dir
     * @param int $_start
     * @param int $_limit
     * @param string $_accountClass the type of subclass for the Tinebase_Record_RecordSet to return
     * @return Tinebase_Record_RecordSet with record class Tinebase_Model_User
     */
    public function getUsers($_filter = NULL, $_sort = NULL, $_dir = 'ASC', $_start = NULL, $_limit = NULL, $_accountClass = 'Tinebase_Model_User')
    {        
        $select = $this->_getUserSelectObject()
            ->limit($_limit, $_start);
            
        if($_sort !== NULL) {
            $select->order($this->rowNameMapping[$_sort] . ' ' . $_dir);
        }

        if($_filter !== NULL) {
        
            $whereStatement = array();
            $defaultValues = array('n_family', 'n_given', 'login_name');
            foreach ($defaultValues as $defaultValue) {
                $whereStatement[] = $this->_db->quoteIdentifier($defaultValue) . 'LIKE ?';
            }
        
            $select->where('(' . implode(' OR ', $whereStatement) . ')', '%' . $_filter . '%');
        }
        // return only active users, when searching for simple users
        if($_accountClass == 'Tinebase_Model_User') {
            $select->where($this->_db->quoteInto($this->_db->quoteIdentifier('status') . ' = ?', 'enabled'));
        }
        //error_log("getUsers:: " . $select->__toString());

        $stmt = $select->query();

        $rows = $stmt->fetchAll(Zend_Db::FETCH_ASSOC);

        $result = new Tinebase_Record_RecordSet($_accountClass, $rows);
        
        return $result;
    }
    
    /**
     * get user by login name
     *
     * @param string $_loginName the loginname of the user
     * @return Tinebase_Model_User the user object
     *
     * @throws Tinebase_Exception_NotFound when row is empty
     */
    public function getUserByLoginName($_loginName, $_accountClass = 'Tinebase_Model_User')
    {
        $select = $this->_getUserSelectObject()
            ->where($this->_db->quoteInto($this->_db->quoteIdentifier(SQL_TABLE_PREFIX . 'accounts.login_name') . ' = ?', $_loginName));

        $stmt = $select->query();

        $row = $stmt->fetch(Zend_Db::FETCH_ASSOC);
        
        // throw exception if data is empty (if the row is no array, the setFromArray function throws a fatal error 
        // because of the wrong type that is not catched by the block below)
        if ( $row === false ) {
            throw new Tinebase_Exception_NotFound("User $_loginName not found.");
        } else {
            try {
                $account = new $_accountClass();
                $account->setFromArray($row);
            } catch (Exception $e) {
                $validation_errors = $account->getValidationErrors();
                Tinebase_Core::getLogger()->debug( 'Tinebase_User_Sql::getUserByLoginName: ' . $e->getMessage() . "\n" .
                    "Tinebase_Model_User::validation_errors: \n" .
                    print_r($validation_errors,true));
                throw ($e);
            }
        }
        
        return $account;
    }
    
    /**
     * get user by userId
     *
     * @param   int $_accountId the user id
     * @return  Tinebase_Model_User the user object
     * @throws  Tinebase_Exception_NotFound
     * @throws  Tinebase_Exception_Record_Validation
     */
    public function getUserById($_accountId, $_accountClass = 'Tinebase_Model_User')
    {
        $accountId = Tinebase_Model_User::convertUserIdToInt($_accountId);
        
        $select = $this->_getUserSelectObject()
            ->where($this->_db->quoteInto($this->_db->quoteIdentifier( SQL_TABLE_PREFIX . 'accounts.id') . ' = ?', $accountId));
        
        $stmt = $select->query();

        $row = $stmt->fetch(Zend_Db::FETCH_ASSOC);
        if ($row === false) {
            throw new Tinebase_Exception_NotFound('User with id ' . $accountId . ' not found.');           
        } else {
            try {
                $account = new $_accountClass();
                $account->setFromArray($row);
            } catch (Tinebase_Exception_Record_Validation $e) {
                $validation_errors = $account->getValidationErrors();
                Tinebase_Core::getLogger()->debug( 'Tinebase_User_Sql::_getUserFromSQL: ' . $e->getMessage() . "\n" .
                    "Tinebase_Model_User::validation_errors: \n" .
                    print_r($validation_errors,true));
                throw ($e);
            }
        }
        
        return $account;
    }
    
    /**
     * get full user by id
     *
     * @param   int         $_accountId
     * @return  Tinebase_Model_FullUser full user
     */
    public function getFullUserById($_accountId)
    {
        return $this->getUserById($_accountId, 'Tinebase_Model_FullUser');
    }
    
    /**
     * get user select
     *
     * @return Zend_Db_Select
     */
    protected function _getUserSelectObject()
    {
        $select = $this->_db->select()
            ->from(SQL_TABLE_PREFIX . 'accounts', 
                array(
                    'accountId'             => $this->rowNameMapping['accountId'],
                    'accountLoginName'      => $this->rowNameMapping['accountLoginName'],
                    'accountLastLogin'      => $this->rowNameMapping['accountLastLogin'],
                    'accountLastLoginfrom'  => $this->rowNameMapping['accountLastLoginfrom'],
                    'accountLastPasswordChange' => $this->rowNameMapping['accountLastPasswordChange'],
                    'accountStatus'         => $this->rowNameMapping['accountStatus'],
                    'accountExpires'        => $this->rowNameMapping['accountExpires'],
                    'accountPrimaryGroup'   => $this->rowNameMapping['accountPrimaryGroup'],
                    'accountHomeDirectory'  => $this->rowNameMapping['accountHomeDirectory'],
                    'accountLoginShell'     => $this->rowNameMapping['accountLoginShell']
                )
            )
            ->join(
               SQL_TABLE_PREFIX . 'addressbook',
               $this->_db->quoteIdentifier(SQL_TABLE_PREFIX . 'accounts.id') . ' = ' 
                . $this->_db->quoteIdentifier(SQL_TABLE_PREFIX . 'addressbook.account_id'), 
                array(
                    'accountDisplayName'    => $this->rowNameMapping['accountDisplayName'],
                    'accountFullName'       => $this->rowNameMapping['accountFullName'],
                    'accountFirstName'      => $this->rowNameMapping['accountFirstName'],
                    'accountLastName'       => $this->rowNameMapping['accountLastName'],
                    'accountEmailAddress'   => $this->rowNameMapping['accountEmailAddress'],
                    'contact_id'            => 'id'
                )
            );
                
        return $select;
    }
    
    /**
     * set the password for given account
     *
     * @param   int $_accountId
     * @param   string $_password
     * @param   bool $_encrypt encrypt password
     * @return  void
     * @throws  Tinebase_Exception_InvalidArgument
     */
    public function setPassword($_loginName, $_password, $_encrypt = TRUE)
    {
        if(empty($_loginName)) {
            throw new Tinebase_Exception_InvalidArgument('$_loginName can not be empty');
        }
        
        $accountsTable = new Tinebase_Db_Table(array('name' => SQL_TABLE_PREFIX . 'accounts'));
        
        $accountData['password'] = ( $_encrypt ) ? md5($_password) : $_password;
        $accountData['last_password_change'] = Zend_Date::now()->get(Tinebase_Record_Abstract::ISO8601LONG);
        
        $where = array(
            $accountsTable->getAdapter()->quoteInto($accountsTable->getAdapter()->quoteIdentifier('login_name') . ' = ?', $_loginName)
        );
        
        $result = $accountsTable->update($accountData, $where);
        if ($result != 1) {
            throw new Tinebase_Exception_NotFound('Unable to update password! account not found in authentication backend.');
        }
    }
    
    /**
     * set the status of the user
     *
     * @param int $_accountId
     * @param unknown_type $_status
     * @return unknown
     */
    public function setStatus($_accountId, $_status)
    {
        $accountId = Tinebase_Model_User::convertUserIdToInt($_accountId);
        
        switch($_status) {
            case 'enabled':
            case 'disabled':
                $accountData['status'] = $_status;
                break;
                
            case 'expired':
                $accountData['expires_at'] = Zend_Date::getTimestamp();
                break;
            
            default:
                throw new Tinebase_Exception_InvalidArgument('$_status can be only enabled, disabled or expired');
                break;
        }
        
        $accountsTable = new Tinebase_Db_Table(array('name' => SQL_TABLE_PREFIX . 'accounts'));

        $where = array(
            $this->_db->quoteInto($this->_db->quoteIdentifier('id') . ' = ?', $accountId)
        );
        
        $result = $accountsTable->update($accountData, $where);
        
        return $result;
    }

    /**
     * sets/unsets expiry date 
     *
     * @param     int         $_accountId
     * @param     Zend_Date     $_expiryDate set to NULL to disable expirydate
    */
    public function setExpiryDate($_accountId, $_expiryDate)
    {
        $accountId = Tinebase_Model_User::convertUserIdToInt($_accountId);
        
        if($_expiryDate instanceof Zend_Date) {
            $accountData['expires_at'] = $_expiryDate->get(Tinebase_Record_Abstract::ISO8601LONG);
        } else {
            $accountData['expires_at'] = NULL;
        }
        
        $accountsTable = new Tinebase_Db_Table(array('name' => SQL_TABLE_PREFIX . 'accounts'));

        $where = array(
            $this->_db->quoteInto($this->_db->quoteIdentifier('id') . ' = ?', $accountId)
        );
        
        $result = $accountsTable->update($accountData, $where);
        
        return $result;
    }

    /**
     * sets blocked until date 
     *
     * @param     int         $_accountId
     * @param     Zend_Date     $_blockedUntilDate set to NULL to disable blockedDate
    */
    public function setBlockedDate($_accountId, $_blockedUntilDate)
    {
        $accountId = Tinebase_Model_User::convertUserIdToInt($_accountId);
        
        if($_blockedUntilDate instanceof Zend_Date) {
            $accountData['blocked_until'] = $_blockedUntilDate->get(Tinebase_Record_Abstract::ISO8601LONG);
        } else {
            $accountData['blocked_until'] = NULL;
        }
        
        $accountsTable = new Tinebase_Db_Table(array('name' => SQL_TABLE_PREFIX . 'accounts'));

        $where = array(
            $this->_db->quoteInto($this->_db->quoteIdentifier('id') . ' = ?', $accountId)
        );
        
        $result = $accountsTable->update($accountData, $where);
        
        return $result;
    }    
    /**
     * update the lastlogin time of user
     *
     * @param int $_accountId
     * @param string $_ipAddress
     * @return void
     */
    public function setLoginTime($_accountId, $_ipAddress) 
    {
        $accountId = Tinebase_Model_User::convertUserIdToInt($_accountId);
        
        $accountsTable = new Tinebase_Db_Table(array('name' => SQL_TABLE_PREFIX . 'accounts'));
        
        $accountData['last_login_from'] = $_ipAddress;
        $accountData['last_login']      = Zend_Date::now()->get(Tinebase_Record_Abstract::ISO8601LONG);
        
        $where = array(
            $this->_db->quoteInto($this->_db->quoteIdentifier('id') . ' = ?', $accountId)
        );
        
        $result = $accountsTable->update($accountData, $where);
        
        return $result;
    }
    
    /**
     * updates an user
     * 
     * this function updates an user 
     *
     * @param Tinebase_Model_FullUser $_account
     * @return Tinebase_Model_FullUser
     */
    public function updateUser(Tinebase_Model_FullUser $_account)
    {
        if(!$_account->isValid()) {
            throw(new Exception('invalid user object'));
        }

        $accountId = Tinebase_Model_User::convertUserIdToInt($_account);

        $accountsTable = new Tinebase_Db_Table(array('name' => SQL_TABLE_PREFIX . 'accounts'));

        $accountData = array(
            'login_name'        => $_account->accountLoginName,
            'status'            => $_account->accountStatus,
            'expires_at'        => ($_account->accountExpires instanceof Zend_Date ? $_account->accountExpires->get(Tinebase_Record_Abstract::ISO8601LONG) : NULL),
            'primary_group_id'  => $_account->accountPrimaryGroup,
            'home_dir'          => $_account->accountHomeDirectory,
            'login_shell'       => $_account->accountLoginShell,
        );
        
        $contactData = array(
            'n_family'      => $_account->accountLastName,
            'n_given'       => $_account->accountFirstName,
            'n_fn'          => $_account->accountFullName,
            'n_fileas'      => $_account->accountDisplayName,
            'email'         => $_account->accountEmailAddress
        );

        try {
            $transactionId = Tinebase_TransactionManager::getInstance()->startTransaction($this->_db);
            
            $accountsTable = new Tinebase_Db_Table(array('name' => SQL_TABLE_PREFIX . 'accounts'));
            $contactsTable = new Tinebase_Db_Table(array('name' => SQL_TABLE_PREFIX . 'addressbook'));
            
            
            $where = array(
                $this->_db->quoteInto($this->_db->quoteIdentifier('id') . ' = ?', $accountId)
            );
            $accountsTable->update($accountData, $where);
            
            $where = array(
                $this->_db->quoteInto($this->_db->quoteIdentifier('account_id') . ' = ?', $accountId)
            );
            $contactsTable->update($contactData, $where);
            
            Tinebase_TransactionManager::getInstance()->commitTransaction($transactionId);
            
        } catch (Exception $e) {
            Tinebase_TransactionManager::getInstance()->rollBack();
            throw($e);
        }
        
        return $this->getUserById($accountId, 'Tinebase_Model_FullUser');
    }
    
    /**
     * add an user
     * 
     * this function adds an user 
     *
     * @param Tinebase_Model_FullUser $_account
     * @todo fix $contactData['container_id'] = 1;
     * @return Tinebase_Model_FullUser
     */
    public function addUser(Tinebase_Model_FullUser $_account)
    {
        if(!$_account->isValid()) {
            throw(new Exception('invalid user object'));
        }
        
        $accountsTable = new Tinebase_Db_Table(array('name' => SQL_TABLE_PREFIX . 'accounts'));
        
        if(!isset($_account->accountId)) {
            $accountId = $_account->generateUID();
            $_account->setId($accountId);
        }
        
        $accountData = array(
            'id'                => $_account->accountId,
            'login_name'        => $_account->accountLoginName,
            'status'            => $_account->accountStatus,
            'expires_at'        => ($_account->accountExpires instanceof Zend_Date ? $_account->accountExpires->get(Tinebase_Record_Abstract::ISO8601LONG) : NULL),
            'primary_group_id'  => $_account->accountPrimaryGroup,
            'home_dir'          => $_account->accountHomeDirectory,
            'login_shell'       => $_account->accountLoginShell,
        );
        
        $contact = new Addressbook_Model_Contact(array(
            'n_family'      => $_account->accountLastName,
            'n_given'       => $_account->accountFirstName,
            'n_fn'          => $_account->accountFullName,
            'n_fileas'      => $_account->accountDisplayName,
            'email'         => $_account->accountEmailAddress
        ));

        try {
            $transactionId = Tinebase_TransactionManager::getInstance()->startTransaction($this->_db);
            
            // add new user
            $accountsTable->insert($accountData);
            
            $contact->account_id = $_account->getId();
            //$contact->tid = 'n';
            $contact->container_id = Tinebase_Container::getInstance()->getContainerByName('Addressbook', 'Internal Contacts', Tinebase_Model_Container::TYPE_INTERNAL)->getId();
            
            // add modlog info
            Tinebase_Timemachine_ModificationLog::setRecordMetaData($contact, 'create');

            // create new contact
            $contactsBackend = Addressbook_Backend_Factory::factory(Addressbook_Backend_Factory::SQL);
            $contactsBackend->create($contact);
            
            Tinebase_TransactionManager::getInstance()->commitTransaction($transactionId);
            
        } catch (Exception $e) {
            Tinebase_TransactionManager::getInstance()->rollBack();
            throw($e);
        }
        
        return $this->getUserById($_account->getId(), 'Tinebase_Model_FullUser');
    }
    
    /**
     * delete a user
     *
     * @param int $_accountId
     */
    public function deleteUser($_accountId)
    {
        $accountId = Tinebase_Model_User::convertUserIdToInt($_accountId);
        $account = $this->getFullUserById($accountId);
        
        $accountsTable = new Tinebase_Db_Table(array('name' => SQL_TABLE_PREFIX . 'accounts'));
        $contactsTable = new Tinebase_Db_Table(array('name' => SQL_TABLE_PREFIX . 'addressbook'));
        $groupMembersTable = new Tinebase_Db_Table(array('name' => SQL_TABLE_PREFIX . 'group_members'));
        $roleMembersTable = new Tinebase_Db_Table(array('name' => SQL_TABLE_PREFIX . 'role_accounts'));
        $userRegistrationsTable = new Tinebase_Db_Table(array('name' => SQL_TABLE_PREFIX . 'registrations'));
        
        try {
            $transactionId = Tinebase_TransactionManager::getInstance()->startTransaction($this->_db);
            
            $where  = array(
                $this->_db->quoteInto($this->_db->quoteIdentifier('account_id') . ' = ?', $accountId),
            );
            $contactsTable->delete($where);

            $where  = array(
                $this->_db->quoteInto($this->_db->quoteIdentifier('account_id') . ' = ?', $accountId),
            );
            $groupMembersTable->delete($where);

            $where  = array(
                $this->_db->quoteInto($this->_db->quoteIdentifier('account_id') . ' = ?', $accountId),
                $this->_db->quoteInto($this->_db->quoteIdentifier('account_type') . ' = ?', Tinebase_Acl_Rights::ACCOUNT_TYPE_USER),
                );
            $roleMembersTable->delete($where);
            
            $where  = array(
                $this->_db->quoteInto($this->_db->quoteIdentifier('id') . ' = ?', $accountId),
            );
            $accountsTable->delete($where);

            $where  = array(
                $this->_db->quoteInto($this->_db->quoteIdentifier('login_name') . ' = ?', $account->accountLoginName),
            );
            $userRegistrationsTable->delete($where);
            
            Tinebase_TransactionManager::getInstance()->commitTransaction($transactionId);
        } catch (Exception $e) {
            Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' error while deleting account ' . $e->__toString());
            Tinebase_TransactionManager::getInstance()->rollBack();
            throw($e);
        }
        
    }
    
    /**
     * delete users
     * 
     * @param array $_accountIds
     */
    public function deleteUsers(array $_accountIds) {
        foreach ( $_accountIds as $accountId ) {
            $this->deleteUser($accountId);
        }
    }

    /**
     * Get multiple users
     *
     * @param string|array $_id Ids
     * @return Tinebase_Record_RecordSet of 'Tinebase_Model_User'
     */
    public function getMultiple($_id) 
    {
        if (empty($_id)) {
            return new Tinebase_Record_RecordSet('Tinebase_Model_User');
        }

        $select = $this->_getUserSelectObject()            
            ->where($this->_db->quoteIdentifier(SQL_TABLE_PREFIX . 'accounts.id') . ' in (?)', (array) $_id);
        
        $stmt = $this->_db->query($select);
        $queryResult = $stmt->fetchAll();
        
        $result = new Tinebase_Record_RecordSet('Tinebase_Model_User', $queryResult);
        
        /*
        // add unknown users if not found in database
        foreach($_id as $id) {
            if (!isset($result[$result->getIndexById($id)])) {
                $result->addRecord($this->getNonExistentUser('Tinebase_Model_User', $id));
            }
        }
        */
        
        return $result;
    }
}

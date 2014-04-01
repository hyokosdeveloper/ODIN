<?php
/**
 * Tine 2.0
 * 
 * @package     Tinebase
 * @subpackage  Group
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Lars Kneschke <l.kneschke@metaways.de>
 * @version     $Id: Sql.php,v 1.1 2009/12/08 23:14:27 hyokos Exp $
 */

/**
 * sql implementation of the groups interface
 * 
 * @package     Tinebase
 * @subpackage  Group
 */
class Tinebase_Group_Sql extends Tinebase_Group_Abstract
{
	/**
     * @var Zend_Db_Adapter_Abstract
     */
    protected $_db;
    
    /**
     * the groups table
     *
     * @var Tinebase_Db_Table
     */
    protected $groupsTable;
    
    /**
     * the groupmembers table
     *
     * @var Tinebase_Db_Table
     */
    protected $groupMembersTable;
    
    /**
     * the constructor
     */
    public function __construct() {
    	$this->_db = Tinebase_Core::getDb();
        $this->groupsTable = new Tinebase_Db_Table(array('name' => SQL_TABLE_PREFIX . 'groups'));
        $this->groupMembersTable = new Tinebase_Db_Table(array('name' => SQL_TABLE_PREFIX . 'group_members'));
    }
    
    /**
     * return all groups an account is member of
     *
     * @param mixed $_accountId the account as integer or Tinebase_Model_User
     * @return array
     */
    public function getGroupMemberships($_accountId)
    {
        $accountId = Tinebase_Model_User::convertUserIdToInt($_accountId);
        
        $cache = Tinebase_Core::get('cache');
        $cacheId = 'getGroupMemberships' . $accountId;
        $memberships = $cache->load($cacheId);

        if (! $memberships) {
            $memberships = array();
            $colName = $this->groupsTable->getAdapter()->quoteIdentifier('account_id');
            $select = $this->groupMembersTable->select();
            $select->where($colName . ' = ?', $accountId);

            $rows = $this->groupMembersTable->fetchAll($select);

            foreach($rows as $membership) {
                $memberships[] = $membership->group_id;
            }

            $cache->save($memberships, $cacheId, array('group'));
        }

        return $memberships;
    }
    
    /**
     * get list of groupmembers
     *
     * @param int $_groupId
     * @return array with account ids
     */
    public function getGroupMembers($_groupId)
    {
        $groupId = Tinebase_Model_Group::convertGroupIdToInt($_groupId);
        
        $cache = Tinebase_Core::get('cache');
        $cacheId = 'getGroupMembers' . $groupId;
        $members = $cache->load($cacheId);

        if (! $members) {
            $members = array();

            $select = $this->groupMembersTable->select();
            $select->where('group_id = ?', $groupId);

            $rows = $this->groupMembersTable->fetchAll($select);

            foreach($rows as $member) {
                $members[] = $member->account_id;
            }

            $cache->save($members, $cacheId, array('group'));
        }

        return $members;
    }
    
    /**
     * replace all current groupmembers with the new groupmembers list
     *
     * @param int $_groupId
     * @param array $_groupMembers
     */
    public function setGroupMembers($_groupId, $_groupMembers)
    {
        $groupId = Tinebase_Model_Group::convertGroupIdToInt($_groupId);
        
        // remove old members
        $where = $this->_db->quoteInto($this->_db->quoteIdentifier('group_id') . ' = ?', $groupId);
        $this->groupMembersTable->delete($where);
        
        // add new members
        foreach ($_groupMembers as $accountId) {
            $this->addGroupMember($_groupId, $accountId);
        }
        
        // invalidate cache (no memcached support yet)
        Tinebase_Core::get(Tinebase_Core::CACHE)->clean(Zend_Cache::CLEANING_MODE_MATCHING_TAG, array('group'));
    }

    /**
     * add a new groupmember to a group
     *
     * @param int $_groupId
     * @param int $_accountId
     * @return void
     */
    public function addGroupMember($_groupId, $_accountId)
    {
        $groupId = Tinebase_Model_Group::convertGroupIdToInt($_groupId);
        $accountId = Tinebase_Model_User::convertUserIdToInt($_accountId);

        $data = array(
            'group_id'      => $groupId,
            'account_id'    => $accountId
        );
        
        try {
            $this->groupMembersTable->insert($data);
            
            // invalidate cache (no memcached support yet)
            Tinebase_Core::get(Tinebase_Core::CACHE)->clean(Zend_Cache::CLEANING_MODE_MATCHING_TAG, array('group'));     
                   
        } catch (Zend_Db_Statement_Exception $e) {
            // account is already member of this group
        }
    }
        
    /**
     * remove one groupmember from the group
     *
     * @param int $_groupId
     * @param int $_accountId
     * @return void
     */
    public function removeGroupMember($_groupId, $_accountId)
    {
        $groupId = Tinebase_Model_Group::convertGroupIdToInt($_groupId);
        $accountId = Tinebase_Model_User::convertUserIdToInt($_accountId);
        
        $where = array(
        
            $this->_db->quoteInto($this->_db->quoteIdentifier('group_id') . '= ?', $groupId),
            $this->_db->quoteInto($this->_db->quoteIdentifier('account_id') . '= ?', $accountId),
        );
         
        $this->groupMembersTable->delete($where);
    }
    
    /**
     * create a new group
     *
     * @param   string $_groupName
     * @return  Tinebase_Model_Group
     * @throws  Tinebase_Exception_Record_Validation
     */
    public function addGroup(Tinebase_Model_Group $_group)
    {
        if(!$_group->isValid()) {
            throw new Tinebase_Exception_Record_Validation('invalid group object');
        }
        
        Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ 
            . ' Creating new group ' . $_group->name 
            //. print_r($_group->toArray(), true)
        );
        
        if(!isset($_group->id)) {
            $groupId = $_group->generateUID();
            $_group->setId($groupId);
        }
        
        $data = $_group->toArray();
        
        unset($data['members']);
        
        $this->groupsTable->insert($data);
                
        return $_group;
    }
    
    /**
     * create a new group
     *
     * @param string $_groupName
     * @return unknown
     */
    public function updateGroup(Tinebase_Model_Group $_group)
    {
        $groupId = Tinebase_Model_Group::convertGroupIdToInt($_group);
        
        $data = array(
            'name'          => $_group->name,
            'description'   => $_group->description
        );
        
        $where = $this->_db->quoteInto($this->_db->quoteIdentifier('id') . ' = ?', $groupId);
        
        $this->groupsTable->update($data, $where);
        
        return $this->getGroupById($groupId);
    }
    
    /**
     * delete groups
     *
     * @param   int|Tinebase_Model_Group $_groupId
     * @return  void
     * @throws  Tinebase_Exception_Backend
     */
    public function deleteGroups($_groupId)
    {
        $groupIds = array();
        
        if(is_array($_groupId) or $_groupId instanceof Tinebase_Record_RecordSet) {
            foreach($_groupId as $groupId) {
                $groupIds[] = Tinebase_Model_Group::convertGroupIdToInt($groupId);
            }
        } else {
            $groupIds[] = Tinebase_Model_Group::convertGroupIdToInt($_groupId);
        }        
        
        try {
            $transactionId = Tinebase_TransactionManager::getInstance()->startTransaction(Tinebase_Core::getDb());
            
            $where = $this->_db->quoteInto($this->_db->quoteIdentifier('group_id') . ' IN (?)', $groupIds);
            $this->groupMembersTable->delete($where);
            $where = $this->_db->quoteInto($this->_db->quoteIdentifier('id') . ' IN (?)', $groupIds);
            $this->groupsTable->delete($where);
            
            Tinebase_TransactionManager::getInstance()->commitTransaction($transactionId);
            
        } catch (Exception $e) {
            Tinebase_TransactionManager::getInstance()->rollBack();            
            throw new Tinebase_Exception_Backend($e->getMessage());
        }
    }
    
    /**
     * get list of groups
     *
     * @param string $_filter
     * @param string $_sort
     * @param string $_dir
     * @param int $_start
     * @param int $_limit
     * @return Tinebase_Record_RecordSet with record class Tinebase_Model_Group
     */
    public function getGroups($_filter = NULL, $_sort = 'name', $_dir = 'ASC', $_start = NULL, $_limit = NULL)
    {        
        $select = $this->groupsTable->select();
        
        if($_filter !== NULL) {
        
            $select->where($this->_db->quoteIdentifier('name') . ' LIKE ?', '%' . $_filter . '%');
        }
        if($_sort !== NULL) {
            $select->order("$_sort $_dir");
        }
        if($_start !== NULL) {
            $select->limit($_limit, $_start);
        }
        
        $rows = $this->groupsTable->fetchAll($select);

        $result = new Tinebase_Record_RecordSet('Tinebase_Model_Group', $rows->toArray());
        
        return $result;
    }
    
    /**
     * get group by name
     *
     * @param   string $_name
     * @return  Tinebase_Model_Group
     * @throws  Tinebase_Exception_Record_NotDefined
     */
    public function getGroupByName($_name)
    {        
        $select = $this->groupsTable->select();
                
        $select->where($this->_db->quoteIdentifier('name') . ' = ?', $_name);
        
        $row = $this->groupsTable->fetchRow($select);

        if($row === NULL) {
            throw new Tinebase_Exception_Record_NotDefined('Group not found.');
        }
        
        $result = new Tinebase_Model_Group($row->toArray());
        
        return $result;
    }
    
    /**
     * get group by id
     *
     * @param   string $_name
     * @return  Tinebase_Model_Group
     * @throws  Tinebase_Exception_Record_NotDefined
     */
    public function getGroupById($_groupId)
    {   
        $groupdId = Tinebase_Model_Group::convertGroupIdToInt($_groupId);     
        
        $select = $this->groupsTable->select();
                
        $select->where($this->_db->quoteIdentifier('id') . ' = ?', $groupdId);
        
        $row = $this->groupsTable->fetchRow($select);
        
        if($row === NULL) {
            throw new Tinebase_Exception_Record_NotDefined('Group not found.');
        }

        $result = new Tinebase_Model_Group($row->toArray());
        
        return $result;
    }
}

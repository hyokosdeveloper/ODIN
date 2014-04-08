<?php
/**
 * Tine 2.0
 * 
 * @package     Tinebase
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Lars Kneschke <l.kneschke@metaways.de>
 * @version     $Id: AccessLog.php,v 1.1 2010/04/13 21:55:29 hyokos Exp $
 */ 

/**
 * this class provides functions to get, add and remove entries from/to the access log
 * 
 * @package     Tinebase
 */
class Tinebase_AccessLog
{
    /**
     * @var Zend_Db_Adapter_Abstract
     */
    protected $_db;
    
    /**
     * holds the instance of the singleton
     *
     * @var Tinebase_AccessLog
     */
    private static $_instance = NULL;
    
    /**
     * the table object for the SQL_TABLE_PREFIX . applications table
     *
     * @var Tinebase_Db_Table
     */
    protected $_accessLogTable;

    /**
     * the constructor
     *
     */
    private function __construct()
    {
        $this->_accessLogTable = new Tinebase_Db_Table(array('name' => SQL_TABLE_PREFIX . 'access_log'));
        $this->_db = Tinebase_Core::getDb();
    }
    
    /**
     * the singleton pattern
     *
     * @return Tinebase_AccessLog
     */
    public static function getInstance() 
    {
        if (self::$_instance === NULL) {
            self::$_instance = new Tinebase_AccessLog;
        }
        
        return self::$_instance;
    }
    
    /**
     * add login entry to the access log
     *
     * @param string $_sessionId the session id
     * @param string $_loginId the loginname as provided by the user
     * @param string $_ipAddress the ip address the user connects from
     * @param int $_result the result of the login
     * @param int $_accountId OPTIONAL the accountId of the user, if the login was successfull
     */
    public function addLoginEntry($_sessionId, $_loginId, $_ipAddress, $_result, $_accountId = NULL)
    {
        $data = array(
            'sessionid'     => $_sessionId,
            'login_name'    => $_loginId,
            'ip'            => $_ipAddress,
            'li'            => Zend_Date::now()->get(Tinebase_Record_Abstract::ISO8601LONG),
            'result'        => $_result
        );
        if ($_accountId !== NULL) {
            $data['account_id'] = Tinebase_Model_User::convertUserIdToInt($_accountId);
        }
        
        $this->_accessLogTable->insert($data);
    }

    /**
     * add logout entry to the access log
     *
     * @param string $_sessionId the session id
     * @param string $_ipAddress the ip address the user connects from
     *      
     */
    public function addLogoutEntry($_sessionId, $_ipAddress)
    {
        $data = array(
            'lo' => Zend_Date::now()->get(Tinebase_Record_Abstract::ISO8601LONG)
        );
        
        $where = array(
            $this->_accessLogTable->getAdapter()->quoteInto($this->_accessLogTable->getAdapter()->quoteIdentifier('sessionid') . ' = ?', $_sessionId),
            $this->_accessLogTable->getAdapter()->quoteInto($this->_accessLogTable->getAdapter()->quoteIdentifier('ip') . ' = ?', $_ipAddress)
        );
        
        $this->_accessLogTable->update($data, $where);
    }
    
    /**
     * delete entries from the access log
     *
     * @param array $_logIds the id of the rows which should get deleted
     * 
     * @return int the number of deleted rows
     */
    public function deleteEntries(array $_logIds)
    {
        $where  = array(
            $this->_accessLogTable->getAdapter()->quoteInto($this->_accessLogTable->getAdapter()->quoteIdentifier('id') . ' IN (?)', $_logIds, 'INTEGER')
        );
         
        $result = $this->_accessLogTable->delete($where);

        return $result;
    }
    
    /**
     * Search for acceslog entries
     *
     * @param Zend_Date $_from the date from which to fetch the access log entries from
     * @param Zend_Date $_to the date to which to fetch the access log entries to
     * @param Tinebase_Model_Pagination|optional $_pagination
     * @param string $_sort OPTIONAL the column name to sort by
     * @param string $_dir OPTIONAL the sort direction can be ASC or DESC only
     * @param string $_filter OPTIONAL search parameter
     * @param int $_limit OPTIONAL how many applications to return
     * @param int $_start OPTIONAL offset for applications
     * 
     * @return Tinebase_RecordSet_AccessLog set of matching access log entries
     */
    public function getEntries($_filter = NULL, $_pagination = NULL, $_from = NULL, $_to = NULL)
    {
        $select = $this->_db->select()
            ->from(SQL_TABLE_PREFIX . 'access_log');
            
        if($_pagination instanceof Tinebase_Model_Pagination) {
            $_pagination->appendPaginationSql($select);
        }
        
        if ($_from instanceof Zend_Date && $_to instanceof Zend_Date) {
            $select->where(
                $this->_db->quoteInto($this->_accessLogTable->getAdapter()->quoteIdentifier('li') . ' BETWEEN ? ', $_from->get(Tinebase_Record_Abstract::ISO8601LONG)) .
                $this->_db->quoteInto('AND ?', $_to->get(Tinebase_Record_Abstract::ISO8601LONG))
            );
        } elseif ($_from instanceof Zend_Date) {
            $select->where(
                $this->_db->quoteInto($this->_accessLogTable->getAdapter()->quoteIdentifier('li') . ' > ?', $_from->get(Tinebase_Record_Abstract::ISO8601LONG))
            );
        }
                
        if(!empty($_filter)) {
            $select->where(
                $this->_db->quoteInto($this->_accessLogTable->getAdapter()->quoteIdentifier('login_name') . ' LIKE ?', '%' . $_filter . '%')
            );
        }
        
        $stmt = $select->query();

        $rows = $stmt->fetchAll(Zend_Db::FETCH_ASSOC);
        foreach ($rows as $rowId => &$row) {
            if ($row['lo'] >= $row['li']) {
                $row['lo'] = new Zend_Date($row['lo'], Tinebase_Record_Abstract::ISO8601LONG);
            } else {
                $row['lo'] = NULL;
            }
            $row['li'] = new Zend_Date($row['li'], Tinebase_Record_Abstract::ISO8601LONG);
        }

        $result = new Tinebase_Record_RecordSet('Tinebase_Model_AccessLog', $rows);

        return $result;
    }

    /**
     * get the total number of accesslog entries
     * 
     * @param Zend_Date $_from the date from which to fetch the access log entries from
     * @param Zend_Date $_to the date to which to fetch the access log entries to
     * @param string $_filter OPTIONAL search parameter
     * 
     * @return int
     */
    public function getTotalCount(Zend_Date $_from, Zend_Date $_to, $_filter = NULL)
    {
        $where = array(
           $this->_accessLogTable->getAdapter()->quoteIdentifier('li') .  ' BETWEEN ' .$this->_accessLogTable->getAdapter()->quote($_from->get(Tinebase_Record_Abstract::ISO8601LONG)) . ' AND ' . $this->_accessLogTable->getAdapter()->quote($_to->get(Tinebase_Record_Abstract::ISO8601LONG))
        );
        if( !empty($_filter) ) {
            $where[] = $this->_accessLogTable->getAdapter()->quoteInto($this->_accessLogTable->getAdapter()->quoteIdentifier('login_name') . ' LIKE ?', '%' . $_filter . '%');
        }

        $count = $this->_accessLogTable->getTotalCount($where);

        return $count;
    }
}

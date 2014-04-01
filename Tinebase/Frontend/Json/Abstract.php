<?php
/**
 * Tine 2.0
 * 
 * @package     Tinebase
 * @subpackage  Application
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2007-2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @version     $Id: Abstract.php,v 1.1 2009/12/08 23:15:31 hyokos Exp $
 */


/**
 * Abstract class for an Tine 2.0 application with Json interface
 * Each tine application must extend this class to gain an native tine 2.0 user
 * interface.
 * 
 * @package     Tinebase
 * @subpackage  Application
 */
abstract class Tinebase_Frontend_Json_Abstract extends Tinebase_Frontend_Abstract implements Tinebase_Frontend_Json_Interface
{
    /**
     * Returns registry data of the application.
     *
     * Each application has its own registry to supply static data to the client.
     * Registry data is queried only once per session from the client.
     *
     * This registry must not be used for rights or ACL purposes. Use the generic
     * rights and ACL mechanisms instead!
     * 
     * @return mixed array 'variable name' => 'data'
     */
    public function getRegistryData()
    {
        return array();
    }
    
    /************************** protected functions **********************/    
    
    /**
     * Return a single record
     *
     * @param   string $_uid
     * @param   Tinebase_Controller_Record_Interface $_controller the record controller
     * @return  array record data
     */
    protected function _get($_uid, Tinebase_Controller_Record_Interface $_controller)
    {
        $record = $_controller->get($_uid);
        return $this->_recordToJson($record);
    }

    /**
     * Returns all records
     *
     * @param   Tinebase_Controller_Record_Interface $_controller the record controller
     * @return  array record data
     * 
     * @todo    add sort/dir params here?
     * @todo    add translation here? that is needed for example for getSalutations() in the addressbook
     */
    protected function _getAll(Tinebase_Controller_Record_Interface $_controller)
    {
        $records = $_controller->getAll();
        
        return array(
            'results'       => $records->toArray(),
            'totalcount'    => count($records)
        );        
    }
    
    /**
     * Search for records matching given arguments
     *
     * @param string $_filter json encoded
     * @param string $_paging json encoded
     * @param Tinebase_Controller_SearchInterface $_controller the record controller
     * @param string $_filterModel the class name of the filter model to use
     * @return array
     */
    protected function _search($_filter, $_paging, Tinebase_Controller_SearchInterface $_controller, $_filterModel)
    {
        $decodedFilter = Zend_Json::decode($_filter);
        
        if (is_array($decodedFilter)) {
            $filter = new $_filterModel(array());
            $filter->setFromArrayInUsersTimezone($decodedFilter);
        } else if (!empty($decodedFilter) && strlen($decodedFilter) == 40) {
            $persistentFilterJson = new Tinebase_Frontend_Json_PersistentFilter(); 
            $filter = $persistentFilterJson->get($decodedFilter);
        } else {
            // filter is empty
            $filter = new $_filterModel(array());
        }

        $pagination = new Tinebase_Model_Pagination(Zend_Json::decode($_paging));
        
        $records = $_controller->search($filter, $pagination);
        
        $result = $this->_multipleRecordsToJson($records, $filter);
        
        return array(
            'results'       => $result,
            'totalcount'    => $_controller->searchCount($filter),
            'filter'        => $filter->toArray(TRUE),
        );
    }
    
    /**
     * creates/updates a record
     *
     * @param   $_recordData
     * @param   Tinebase_Controller_Record_Interface $_controller the record controller
     * @param   $_modelName for example: 'Task' for Tasks_Model_Task
     * @param   $_identifier of the record (default: id)
     * @return  array created/updated record
     */
    protected function _save($_recordData, Tinebase_Controller_Record_Interface $_controller, $_modelName, $_identifier = 'id')
    {
        $modelClass = $this->_applicationName . "_Model_" . $_modelName;
        $record = new $modelClass(array(), TRUE);
        $record->setFromJsonInUsersTimezone($_recordData);
        
        //Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . "recordData: ". print_r($record->toArray(), true));
        
        $savedRecord = (empty($record->$_identifier)) ? 
            $_controller->create($record): 
            $_controller->update($record);

        return $this->_recordToJson($savedRecord);
    }

    /**
     * update multiple records
     *
     * @param string $_filter json encoded filter
     * @param string $_data json encoded key/value pairs 
     * @param Tinebase_Controller_Record_Interface $_controller
     * @param string FilterGroup name
     * @return array with number of updated records
     */
    protected function _updateMultiple($_filter, $_data, Tinebase_Controller_Record_Interface $_controller, $_filterModel)
    {
        $filter = new $_filterModel(Zend_Json::decode($_filter));
        
        $result = $_controller->updateMultiple($filter, Zend_Json::decode($_data));
        
        return array(
            'count'       => $result,
        );
    }
    
    /**
     * deletes existing records
     *
     * @param array $_ids 
     * @param Tinebase_Controller_Record_Interface $_controller the record controller
     * @return array
     */
    protected function _delete($_ids, Tinebase_Controller_Record_Interface $_controller)
    {
        if (strpos($_ids, '[') !== false) {
            $_ids = Zend_Json::decode($_ids);
        }
        $_controller->delete($_ids);
        return array(
            'status'    => 'success'
        );  
    }
    
    /**
     * deletes existing records by filter
     *
     * @param string $_filter json encoded filter
     * @param Tinebase_Controller_Record_Interface $_controller the record controller
     * @return array
     */
    protected function _deleteByFilter($_filter, Tinebase_Controller_Record_Interface $_controller, $_filterModel)
    {
        $filter = new $_filterModel(Zend_Json::decode($_filter));
        
        $_controller->deleteByFilter($filter);
        return array(
            'status'    => 'success'
        );  
    }
    
    /**
     * returns record prepared for json transport
     *
     * @param Tinebase_Record_Interface $_record
     * @return array record data
     * 
     * @todo move that to Tinebase_Record_Abstract
     */
    protected function _recordToJson($_record)
    {
        $_record->setTimezone(Tinebase_Core::get('userTimeZone'));
        $_record->bypassFilters = true;
        
        // add alarms
        if ($_record->has('alarms')) {
            Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' Get alarms for record ... ');
            Tinebase_Alarm::getInstance()->getAlarmsOfRecord(get_class($_record), $_record, FALSE, TRUE);
        }
        
        $recordArray = $_record->toArray();

        if ($_record->has('container_id')) {
            $recordArray['container_id'] = Tinebase_Container::getInstance()->getContainerById($_record->container_id)->toArray();
            $recordArray['container_id']['account_grants'] = Tinebase_Container::getInstance()->getGrantsOfAccount(Tinebase_Core::getUser(), $_record->container_id)->toArray();
        }

        return $recordArray;
    }

    /**
     * returns multiple records prepared for json transport
     *
     * @param Tinebase_Record_RecordSet $_records Tinebase_Record_Abstract
     * @param Tinebase_Model_Filter_FilterGroup
     * @return array data
     * 
     * @todo move that to Tinebase_Record_RecordSet
     */
    protected function _multipleRecordsToJson(Tinebase_Record_RecordSet $_records, $_filter=NULL)
    {       
        if (count($_records) == 0) {
            return array();
        }
        
        //Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' ' . print_r($_records, true));
        
        // get acls for records
        if ($_records[0]->has('container_id')) {
            Tinebase_Container::getInstance()->getGrantsOfRecords($_records, Tinebase_Core::getUser());
        }
        
        // add alarms
        if ($_records[0]->has('alarms')) {
            Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' Get alarms for multiple records ... ');
            Tinebase_Alarm::getInstance()->getAlarmsOfRecord($_records->getRecordClassName(), $_records, FALSE, TRUE);
        }
        
        $_records->setTimezone(Tinebase_Core::get('userTimeZone'));
        $_records->convertDates = true;
        
        $result = $_records->toArray();
        
        return $result;
    }

}

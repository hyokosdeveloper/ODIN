<?php
/**
 * Crm csv generation class
 *
 * @package     Crm
 * @subpackage	Export
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: Csv.php,v 1.1 2010/04/13 21:27:28 hyokos Exp $
 * 
 * @todo        add products
 */

/**
 * Crm csv generation class
 * 
 * @package     Crm
 * @subpackage	Export
 * 
 */
class Crm_Export_Csv extends Tinebase_Export_Csv
{
    /**
     * lead relation types
     * 
     * @var array
     */
    protected $_relationsTypes = array('CUSTOMER', 'PARTNER', 'RESPONSIBLE', 'TASK');

    /**
     * special fields
     * 
     * @var array
     */
    protected $_specialFields = array('leadstate_id' => 'Leadstate', 'leadtype_id' => 'Leadtype', 'leadsource_id' => 'Leadsource');
    
    /**
     * export leads to csv file
     *
     * @param Crm_Model_LeadFilter $_filter
     * @return string filename
     */
    public function generate(Crm_Model_LeadFilter $_filter, $_toStdout = FALSE) {
        
        $pagination = new Tinebase_Model_Pagination(array(
            'start' => 0,
            'limit' => 0,
            'sort' => 'lead_name',
            'dir' => 'ASC',
        ));
        
        Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' ' . print_r($_filter->toArray(), true));
        
        $leads = Crm_Controller_Lead::getInstance()->search($_filter, $pagination, TRUE, FALSE, 'export');
        if (count($leads) < 1) {
            throw new Tinebase_Exception_NotFound('No Leads found.');
        }

        $skipFields = array(
            'id'                    ,
            'created_by'            ,
            'creation_time'         ,
            'last_modified_by'      ,
            'last_modified_time'    ,
            'is_deleted'            ,
            'deleted_time'          ,
            'deleted_by'            ,
        );
        
        $filename = $this->exportRecords($leads, $_toStdout, $skipFields);
        return $filename;
    }
    
    /**
     * special field value function
     * 
     * @param Tinebase_Record_Abstract $_record
     * @param string $_fieldName
     * @return string
     */
    protected function _addSpecialValue(Tinebase_Record_Abstract $_record, $_fieldName)
    {
        return Tinebase_Config::getOptionString($_record, preg_replace('/_id/', '', $_fieldName));
    }
}

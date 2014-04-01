<?php
/**
 * lead types controller for CRM application
 * 
 * @package     Crm
 * @subpackage  Controller
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Lars Kneschke <l.kneschke@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: LeadTypes.php,v 1.1 2009/12/08 23:15:45 hyokos Exp $
 *
 * @todo        extend Tinebase_Controller_Record_Abstract
 */

/**
 * lead types controller class for CRM application
 * 
 * @package     Crm
 * @subpackage  Controller
 */
class Crm_Controller_LeadTypes extends Tinebase_Controller_Abstract
{
    /**
     * the constructor
     *
     * don't use the constructor. use the singleton 
     */
    private function __construct() 
    {
        $this->_currentAccount = Tinebase_Core::getUser();        
        $this->_applicationName = 'Crm';
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
     * @var Crm_Controller_LeadTypes
     */
    private static $_instance = NULL;
    
    /**
     * the singleton pattern
     *
     * @return Crm_Controller_LeadTypes
     */
    public static function getInstance() 
    {
        if (self::$_instance === NULL) {
            self::$_instance = new Crm_Controller_LeadTypes();
        }
        
        return self::$_instance;
    }    
    
    /**
     * get one leadtype identified by id
     *
     * @param int $_typeId
     * @return Crm_Model_Leadtype
     */
    public function getLeadType($_typeId)
    {
        $backend = Crm_Backend_Factory::factory(Crm_Backend_Factory::LEAD_TYPES);
        $result = $backend->get($_typeId);
        $result->translate();

        return $result;    
    }
    
    /**
     * get lead types
     *
     * @param string $_sort
     * @param string $_dir
     * @return Tinebase_Record_RecordSet of subtype Crm_Model_Leadtype
     */
    public function getLeadTypes($_sort = 'id', $_dir = 'ASC')
    {
        $backend = Crm_Backend_Factory::factory(Crm_Backend_Factory::LEAD_TYPES);
        $result = $backend->getAll($_sort, $_dir);

        return $result;    
    }    
    
    /**
     * saves lead types
     *
     * Saving lead types means to calculate the difference between posted data
     * and existing data and than deleting, creating or updating as needed.
     * Every change is done one by one.
     * 
     * @param Tinebase_Record_Recordset $_leadTypes Lead types to save
     * @return Tinebase_Record_Recordset Exactly the same record set as in argument $_leadTypes
     */
    public function saveLeadtypes(Tinebase_Record_Recordset $_leadTypes)
    {
        $backend = Crm_Backend_Factory::factory(Crm_Backend_Factory::LEAD_TYPES);
        $existingLeadTypes = $backend->getAll();
        
        $migration = $existingLeadTypes->getMigration($_leadTypes->getArrayOfIds());
        
        // delete
        foreach ($migration['toDeleteIds'] as $id) {
            $backend->delete($id);
        }
        
        // add / create
        foreach ($_leadTypes as $leadType) {
            if (in_array($leadType->id, $migration['toCreateIds'])) {
                $backend->create($leadType);
            }
        }
        
        // update
        foreach ($_leadTypes as $leadType) {
            if (in_array($leadType->id, $migration['toUpdateIds'])) {
                $backend->update($leadType);
            }
        }
        
        return $_leadTypes;
    }      
}

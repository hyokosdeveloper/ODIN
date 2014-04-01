<?php
/**
 * lead sources controller for CRM application
 * 
 * @package     Crm
 * @subpackage  Controller
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: LeadSources.php,v 1.1 2009/12/08 23:15:45 hyokos Exp $
 *
 * @todo        extend Tinebase_Controller_Record_Abstract
 */

/**
 * lead sources controller class for CRM application
 * 
 * @package     Crm
 * @subpackage  Controller
 */
class Crm_Controller_LeadSources extends Tinebase_Controller_Abstract
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
     * @var Crm_Controller_LeadSources
     */
    private static $_instance = NULL;
    
    /**
     * the singleton pattern
     *
     * @return Crm_Controller_LeadSources
     */
    public static function getInstance() 
    {
        if (self::$_instance === NULL) {
            self::$_instance = new Crm_Controller_LeadSources();
        }
        
        return self::$_instance;
    }    
        
    /**
     * get one leadsource identified by id
     *
     * @return Crm_Model_Leadsource
     */
    public function getLeadSource($_sourceId)
    {
        $backend = Crm_Backend_Factory::factory(Crm_Backend_Factory::LEAD_SOURCES);
        $result = $backend->get($_sourceId);
        $result->translate();

        return $result;    
    }    
    
    /**
     * get lead sources
     *
     * @param string $_sort
     * @param string $_dir
     * @return Tinebase_Record_RecordSet of subtype Crm_Model_Leadsource
     */
    public function getLeadSources($_sort = 'id', $_dir = 'ASC')
    {
        $backend = Crm_Backend_Factory::factory(Crm_Backend_Factory::LEAD_SOURCES);
    	$result = $backend->getAll($_sort, $_dir);

        return $result;    
    }
        
    /**
     * saves lead sources
     *
     * Saving lead source means to calculate the difference between posted data
     * and existing data and than deleting, creating or updating as needed.
     * Every change is done one by one.
     * 
     * @param Tinebase_Record_Recordset $_leadSources Lead states to save
     * @return Tinebase_Record_Recordset Exactly the same record set as in argument $_leadSources
     */
    public function saveLeadsources(Tinebase_Record_Recordset $_leadSources)
    {
        $backend = Crm_Backend_Factory::factory(Crm_Backend_Factory::LEAD_SOURCES);
        $existingLeadSources = $backend->getAll();
        
        $migration = $existingLeadSources->getMigration($_leadSources->getArrayOfIds());
        
        // delete
        foreach ($migration['toDeleteIds'] as $id) {
            $backend->delete($id);
        }
        
        // add / create
        foreach ($_leadSources as $leadSource) {
            if (in_array($leadSource->id, $migration['toCreateIds'])) {
                $backend->create($leadSource);
            }
        }
        
        // update
        foreach ($_leadSources as $leadSource) {
            if (in_array($leadSource->id, $migration['toUpdateIds'])) {
                $backend->update($leadSource);
            }
        }
        
        return $_leadSources;
    }
    
}

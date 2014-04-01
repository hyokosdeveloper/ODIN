<?php
/**
 * Snom_Location controller for Voipmanager Management application
 *
 * @package     Voipmanager
 * @subpackage  Controller
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: Location.php,v 1.1 2009/12/08 23:15:15 hyokos Exp $
 *
 */

/**
 * Snom_Location controller class for Voipmanager Management application
 * 
 * @package     Voipmanager
 * @subpackage  Controller
 */
class Voipmanager_Controller_Snom_Location extends Voipmanager_Controller_Abstract
{    
    /**
     * the constructor
     *
     * don't use the constructor. use the singleton 
     */
    private function __construct() {
        $this->_modelName = 'Voipmanager_Model_Snom_Location';
        $this->_backend      = new Voipmanager_Backend_Snom_Location($this->getDatabaseBackend());
        $this->_cache        = Zend_Registry::get('cache');        
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
     * @var Voipmanager_Controller_Snom_Location
     */
    private static $_instance = NULL;
    
    /**
     * the singleton pattern
     *
     * @return Voipmanager_Controller_Snom_Location
     */
    public static function getInstance() 
    {
        if (self::$_instance === NULL) {
            self::$_instance = new Voipmanager_Controller_Snom_Location();
        }
        
        return self::$_instance;
    }

    /**
     * get snom location by id
     *
     * @param string $_id the id of the peer
     * @return Voipmanager_Model_Snom_Location
     * 
     * @todo move that to Voipmanager_Controller_Abstract ?
     */
    public function get($_id)
    {
        $id = Voipmanager_Model_Snom_Location::convertSnomLocationIdToInt($_id);
        if (($result = $this->_cache->load('snomLocation_' . $id)) === false) {
            $result = $this->_backend->get($id);
            $this->_cache->save($result, 'snomLocation_' . $id, array('snomLocation'), 5);
        }

        return $result;    
    }
    
    public function update(Tinebase_Record_Interface $_record)
    {
        $this->_cache->clean('all', array('snomLocation'));
        return parent::update($_record);
    }
}

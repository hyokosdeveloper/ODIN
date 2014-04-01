<?php
/**
 * Snom_Xml controller for Voipmanager Management application
 * 
 * @package     Voipmanager
 * @subpackage  Controller
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: Xml.php,v 1.1 2009/12/08 23:15:15 hyokos Exp $
 *
 */

/**
 * Snom_Xml controller class for Voipmanager Management application
 * 
 * @package     Voipmanager
 * @subpackage  Controller
 */
class Voipmanager_Controller_Snom_Xml extends Voipmanager_Controller_Abstract
{
    /**
     * Voipmanager backend class
     *
     * @var Voipmanager_Backend_Snom_Xml
     */
    protected $_backend;
    
    /**
     * the constructor
     *
     * don't use the constructor. use the singleton 
     */
    private function __construct() {
        $this->_backend     = new Voipmanager_Backend_Snom_Xml($this->getDatabaseBackend());
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
     * @var Voipmanager_Controller_Snom_Xml
     */
    private static $_instance = NULL;
    
    /**
     * the singleton pattern
     *
     * @return Voipmanager_Controller_Snom_Xml
     */
    public static function getInstance() 
    {
        if (self::$_instance === NULL) {
            self::$_instance = new Voipmanager_Controller_Snom_Xml();
        }
        
        return self::$_instance;
    }
    
    /**
     * get xml configurationfile for snom phones
     *
     * @param Voipmanager_Model_Snom_Phone $_phone
     * @return string the xml formated configuration file
     */
    public function getConfig($_phone)
    {
        $xml = $this->_backend->getConfig($_phone);
        
        return $xml;
    }   
    
    /**
     * get phone firmware
     *
     * @param Voipmanager_Model_Snom_Phone $_phone
     * @return string the firmware as xml string
     */
    public function getFirmware(Voipmanager_Model_Snom_Phone $_phone)
    {
        $xml = $this->_backend->getFirmware($_phone);
        
        return $xml;
    }
}

<?php
/**
 * asterisk context controller for Voipmanager Management application
 * 
 * @package     Voipmanager
 * @subpackage  Controller
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: Context.php,v 1.1 2010/04/13 21:56:18 hyokos Exp $
 *
 */

/**
 * asterisk context controller class for Voipmanager Management application
 * 
 * @package     Voipmanager
 * @subpackage  Controller
 */
class Voipmanager_Controller_Asterisk_Context extends Voipmanager_Controller_Abstract
{   
    /**
     * holds the instance of the singleton
     *
     * @var Voipmanager_Controller_Asterisk_Context
     */
    private static $_instance = NULL;
    
    /**
     * the constructor
     *
     * don't use the constructor. use the singleton 
     */
    private function __construct() 
    {
        $this->_modelName   = 'Voipmanager_Model_Asterisk_Context';        
        $this->_backend     = new Voipmanager_Backend_Asterisk_Context();          
    }
    
    /**
     * don't clone. Use the singleton.
     *
     */
    private function __clone() 
    {        
    }
            
    /**
     * the singleton pattern
     *
     * @return Voipmanager_Controller_Asterisk_Context
     */
    public static function getInstance() 
    {
        if (self::$_instance === NULL) {
            self::$_instance = new Voipmanager_Controller_Asterisk_Context();
        }
        
        return self::$_instance;
    }
}

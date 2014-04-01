<?php
/**
 * AsteriskMeetme controller for Voipmanager Management application
 * 
 * @package     Voipmanager
 * @subpackage  Controller
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: Meetme.php,v 1.1 2009/12/08 23:15:37 hyokos Exp $
 *
 */

/**
 * AsteriskMeetme controller class for Voipmanager Management application
 * 
 * @package     Voipmanager
 * @subpackage  Controller
 */
class Voipmanager_Controller_Asterisk_Meetme extends Voipmanager_Controller_Abstract
{    
    /**
     * the constructor
     *
     * don't use the constructor. use the singleton 
     */
    private function __construct() {
        $this->_modelName = 'Voipmanager_Model_Asterisk_Meetme';
		$this->_backend		= new Voipmanager_Backend_Asterisk_Meetme($this->getDatabaseBackend());
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
     * @var Voipmanager_Controller_Asterisk_Meetme
     */
    private static $_instance = NULL;
    
    /**
     * the singleton pattern
     *
     * @return Voipmanager_Controller_Asterisk_Meetme
     */
    public static function getInstance() 
    {
        if (self::$_instance === NULL) {
            self::$_instance = new Voipmanager_Controller_Asterisk_Meetme();
        }
        
        return self::$_instance;
    }
}

<?php
/**
 * Abstract controller for Voipmanager Management application
 * 
 * @package     Voipmanager
 * @subpackage  Controller
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: Abstract.php,v 1.1 2009/12/08 23:15:42 hyokos Exp $
 */

/**
 * abstract controller class for Voipmanager Management application
 * 
 * @package     Voipmanager
 * @subpackage  Controller
 */
abstract class Voipmanager_Controller_Abstract extends Tinebase_Controller_Record_Abstract
{
    /**
     * application name (is needed in checkRight())
     *
     * @var string
     */
    protected $_applicationName = 'Voipmanager';
    
    /**
     * check for container ACLs?
     *
     * @var boolean
     */
    protected $_doContainerACLChecks = FALSE;
    
    /**
     * the central caching object
     *
     * @var Zend_Cache_Core
     */
    protected $_cache;
    
    /**
     * initialize the database backend
     *
     * @return Zend_Db_Adapter_Abstract
     * @throws  Voipmanager_Exception_UnexpectedValue
     */
    public function getDatabaseBackend() 
    {
        if(isset(Zend_Registry::get('configFile')->voipmanager) && isset(Zend_Registry::get('configFile')->voipmanager->database)) {
            $dbConfig = Tinebase_Core::get('configFile')->voipmanager->database;
        
            $dbBackend = constant('Tinebase_Core::' . strtoupper($dbConfig->get('backend', Tinebase_Core::PDO_MYSQL)));
            
            //Tinebase_Core::set('voipdbTablePrefix', (isset($dbConfig->tableprefix)) ? $dbConfig->tableprefix : SQL_TABLE_PREFIX);
            
            switch($dbBackend) {
                case Tinebase_Core::PDO_MYSQL:
                    $db = Zend_Db::factory('Pdo_Mysql', $dbConfig->toArray());
                    break;
                case Tinebase_Core::PDO_OCI:
                    $db = Zend_Db::factory('Pdo_Oci', $dbConfig->toArray());
                    break;
                default:
                    throw new Voipmanager_Exception_UnexpectedValue('Invalid database backend type defined. Please set backend to ' . Tinebase_Core::PDO_MYSQL . ' or ' . Tinebase_Core::PDO_OCI . ' in config file.');
                    break;
            }
            
            // add table prefix to adapter
            $db->table_prefix = (isset($dbConfig->tableprefix)) ? $dbConfig->tableprefix : SQL_TABLE_PREFIX;
            
        } else {
            //Tinebase_Core::set('voipdbTablePrefix', SQL_TABLE_PREFIX);
            $db = Zend_Registry::get('dbAdapter');
        }
        
        return $db;
    }
}

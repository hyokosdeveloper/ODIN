<?php
/**
 * Tine 2.0
 * 
 * @package     Tinebase
 * @subpackage  Config
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2007-2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @version     $Id: Config.php,v 1.1 2010/04/13 21:55:29 hyokos Exp $
 * 
 */

/**
 * the class provides functions to handle config options
 * 
 * @package     Tinebase
 * @subpackage  Config
 */
class Tinebase_Config
{
    /**
     * @var Tinebase_Backend_Sql
     */
    protected $_backend;
    
    /**
     * holds the instance of the singleton
     *
     * @var Tinebase_Config
     */
    private static $_instance = NULL;
    
    /**
     * the constructor
     *
     * don't use the constructor. use the singleton 
     */    
    private function __construct() 
    {
        $this->_backend = new Tinebase_Backend_Sql('Tinebase_Model_Config', 'config');
    }

    /**
     * don't clone. Use the singleton.
     *
     */
    private function __clone() 
    {        
    }

    /**
     * Returns instance of Tinebase_Config
     *
     * @return Tinebase_Config
     */
    public static function getInstance() 
    {
        if (self::$_instance === NULL) {
            self::$_instance = new Tinebase_Config();
        }
        
        return self::$_instance;
    }
    
    
    /**
     * returns one config value identified by config name and application id
     * -> value in config.inc.php overwrites value in db if $_fromFile is TRUE
     * 
     * @param   string      $_name config name/key
     * @param   string      $_applicationId application id [optional]
     * @param   mixed       $_default the default value [optional]
     * @param   boolean     $_fromFile get from config.inc.php [optional]
     * @return  Tinebase_Model_Config  the config record
     * @throws  Tinebase_Exception_NotFound
     */
    public function getConfig($_name, $_applicationId = NULL, $_default = NULL, $_fromFile = TRUE)
    {
        $applicationId = ($_applicationId !== NULL ) 
            ? Tinebase_Model_Application::convertApplicationIdToInt($_applicationId) 
            : Tinebase_Application::getInstance()->getApplicationByName('Tinebase')->getId();
            
        $filter = new Tinebase_Model_ConfigFilter(array(
            array(
                'field'     => 'application_id', 
                'operator'  => 'equals', 
                'value'     => $applicationId
            ),
            array(
                'field'     => 'name', 
                'operator'  => 'equals', 
                'value'     => $_name
            ),
        ));
        
        $records = $this->_backend->search($filter);
        
        if (count($records) > 0) {
            $result = $records->getFirstRecord();
        } else {
            if ($_default !== NULL) {
                Setup_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' Config setting "' . $_name . '" not found, using default (' . $_default . ').');
            }
            $result = new Tinebase_Model_Config(array(
                'application_id'    => $applicationId,
                'name'              => $_name,
                'value'             => $_default,
            ), TRUE);            
        }
            
        // check config.inc.php and get value from there
        if ($_fromFile && isset(Tinebase_Core::getConfig()->{$_name})) {
            Setup_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' Overwriting config setting "' . $_name . '" with value from config.inc.php.');
            $result->value = (is_object(Tinebase_Core::getConfig()->{$_name}))
                ? Tinebase_Core::getConfig()->{$_name}->toArray() 
                : Tinebase_Core::getConfig()->{$_name};
        } else if ($result->value === NULL) {
            throw new Tinebase_Exception_NotFound("Application config setting with name $_name not found and no default value given!");
        }
        
        //Setup_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' Setting config ' . print_r($value, TRUE));
        
        return $result;
    }

    /**
     * returns one config value identified by config name and application name as array (it was json encoded in db)
     * 
     * @param   string      $_name config name/key
     * @param   string      $_applicationName
     * @param   array       $_default the default value
     * @return  array       the config array
     */
    public function getConfigAsArray($_name, $_applicationName = 'Tinebase', $_default = array())
    {
        $config = $this->getConfig($_name, Tinebase_Application::getInstance()->getApplicationByName($_applicationName)->getId(), $_default);
        
        $result = (is_array($config->value)) ? $config->value : Zend_Json::decode($config->value);
        return $result;
    }
    
    /**
     * returns all config settings for one application
     * 
     * @param   string $_applicationId application id
     * @return  array with config name => value pairs
     */
    public function getConfigForApplication($_applicationId)
    {
        $applicationId = Tinebase_Model_Application::convertApplicationIdToInt($_applicationId);
            
        $filter = new Tinebase_Model_ConfigFilter(array(
            array(
                'field'     => 'application_id', 
                'operator'  => 'equals', 
                'value'     => $applicationId
            ),
        ));
        
        $records = $this->_backend->search($filter);
        
        $result = array();
        foreach ($records as $config) {
            $result[$config->name] = $config->value;
        }

        return $result;
    }
    
    /**
     * sets one config value identified by config name and application id
     * 
     * @param   Tinebase_Model_Config $_config record to set
     * @return  Tinebase_Model_Config
     */
    public function setConfig(Tinebase_Model_Config $_config)
    {
        Setup_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' Setting config ' . $_config->name);
        
        try {
            $config = $this->getConfig($_config->name, $_config->application_id, NULL, FALSE);

            // update
            $config->value = $_config->value;
            $result = $this->_backend->update($config);
            
        } catch (Tinebase_Exception_NotFound $e) {
            // create new
            $result = $this->_backend->create($_config);
        }
        
        return $result;
    }
    
    /**
     * set config for application (simplified setConfig())
     *
     * @param string $_name
     * @param string $_value
     * @param string $_applicationName [optional]
     * @return Tinebase_Model_Config
     */
    public function setConfigForApplication($_name, $_value, $_applicationName = 'Tinebase')
    {
        $configRecord = new Tinebase_Model_Config(array(
            "application_id"    => Tinebase_Application::getInstance()->getApplicationByName($_applicationName)->getId(),
            "name"              => $_name,
            "value"             => $_value,              
        ));
        
        return $this->setConfig($configRecord);
    }

    /**
     * deletes one config setting
     * 
     * @param   Tinebase_Model_Config $_config record to delete
     * @return void
     */
    public function deleteConfig(Tinebase_Model_Config $_config)
    {
        $this->_backend->delete($_config->getId());
    }
    
    /**
     * Delete config for application (simplified deleteConfig())
     *
     * @param string $_name
     * @param string $_applicationName [optional]
     * @return void
     */
    public function deleteConfigForApplication($_name, $_applicationName = 'Tinebase')
    {
        try {
            $configRecord = $this->getConfig($_name, Tinebase_Application::getInstance()->getApplicationByName($_applicationName)->getId());
            $this->deleteConfig($configRecord);
        } catch (Tinebase_Exception_NotFound $e) {
            //no config found => nothing to delete
        }
    }
    
    /**
     * Delete config for application (simplified deleteConfig())
     *
     * @param string $_applicationId
     * @return integer number of deleted configs
     */
    public function deleteConfigByApplicationId($_applicationId)
    {
        return $this->_backend->deleteByProperty($_applicationId, 'application_id');
    }
    
    /**
     * get option setting string
     * 
     * @param Tinebase_Record_Interface $_record
     * @param string $_id
     * @param string $_label
     * @return string
     */
    public static function getOptionString($_record, $_label)
    {
        $controller = Tinebase_Core::getApplicationInstance($_record->getApplication());
        $settings = $controller->getSettings();
        $idField = $_label . '_id';
        
        $option = $settings->getOptionById($_record->{$idField}, $_label . 's');
        
        $result = (isset($option[$_label])) ? $option[$_label] : '';
        return $result;
    }    
}

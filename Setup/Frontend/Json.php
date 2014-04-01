<?php
/**
 * Tine 2.0
 * @package     Tinebase
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2008-2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: Json.php,v 1.1 2009/12/08 23:16:22 hyokos Exp $
 * 
 */

/**
 * Setup json frontend
 *
 * @package     Setup
 * @subpackage  Frontend
 */
class Setup_Frontend_Json extends Tinebase_Frontend_Abstract
{
    /**
     * the internal name of the application
     *
     * @var string
     */
    protected $_applicationName = 'Setup';

    /**
     * setup controller
     *
     * @var Setup_Controller
     */
    protected $_controller = NULL;
    
    /**
     * the constructor
     *
     */
    public function __construct()
    {
        $this->_controller = Setup_Controller::getInstance();
    }
    
    /**
     * authenticate user by username and password
     *
     * @param string $username the username
     * @param string $password the password
     * @return array
     */
    public function login($username, $password)
    {
        if (Setup_Controller::getInstance()->login($username, $password)) {
            $response = array(
                'success'       => TRUE,
                //'account'       => Tinebase_Core::getUser()->getPublicUser()->toArray(),
                //'jsonKey'       => Setup_Core::get('jsonKey'),
                'welcomeMessage' => "Welcome to Tine 2.0 Setup!"
            );
        } else {
            $response = array(
                'success'      => FALSE,
                'errorMessage' => "Wrong username or password!"
            );
        }

        return $response;
    }

    /**
     * destroy session
     *
     * @return array
     */
    public function logout()
    {
        Setup_Controller::getInstance()->logout();

        return array(
            'success'=> true,
        );
    }
    
    /**
     * install new applications
     *
     * @param string $applicationNames application names to install
     */
    public function installApplications($applicationNames)
    {
        $decodedNames = Zend_Json::decode($applicationNames);
        
        if (is_array($decodedNames)) {
            $this->_controller->installApplications($decodedNames);
    
            if(in_array('Tinebase', $decodedNames)) {
                if (isset(Tinebase_Core::getConfig()->authentication)) {
                    $authType = Tinebase_Core::getConfig()->authentication->get('backend', Tinebase_Auth_Factory::SQL);
                } else {
                    $authType = Tinebase_Auth_Factory::SQL;
                }
                
                switch(ucfirst($authType)) {
                    case Tinebase_Auth_Factory::SQL:
                        $import = new Setup_Import_TineInitial();
                        break;
                    case Tinebase_Auth_Factory::LDAP:
                        $import = new Setup_Import_TineInitialLdap();
                        break;
                    //$import = new Setup_Import_Egw14();
                }
                $import->import();
            }
            
            $result = TRUE;
        } else {
            Setup_Core::getLogger()->warn(__METHOD__ . '::' . __LINE__ . ' Could not handle param $applicationNames: ' . $decodedNames);
            $result = FALSE;
        }
        
        return array(
            'success' => $result,
        );
    }

    /**
     * update existing applications
     *
     * @param string $applicationNames application names to update
     */
    public function updateApplications($applicationNames)
    {
        $applications = new Tinebase_Record_RecordSet('Tinebase_Model_Application');
        foreach (Zend_Json::decode($applicationNames) as $applicationName) {
            $applications->addRecord(Tinebase_Application::getInstance()->getApplicationByName($applicationName));
        }
        
        if(count($applications) > 0) {
            $this->_controller->updateApplications($applications);
        }
        
        return array(
            'success'=> true,
        );
    }

    /**
     * uninstall applications
     *
     * @param string $applicationNames application names to uninstall
     */
    public function uninstallApplications($applicationNames)
    {
        $decodedNames = Zend_Json::decode($applicationNames);
        $this->_controller->uninstallApplications($decodedNames);
        
        return array(
            'success'=> true,
        );
    }
    
    /**
     * search for installed and installable applications
     *
     * @return array
     */
    public function searchApplications()
    {
        // get installable apps
        $installable = $this->_controller->getInstallableApplications();
        
        // get installed apps
        if (Setup_Core::get(Setup_Core::CHECKDB)) {
            try {
                $installed = Tinebase_Application::getInstance()->getApplications(NULL, 'id')->toArray();
                
                // merge to create result array
                $applications = array();
                foreach ($installed as $application) {
                    $depends = (array) $installable[$application['name']]->depends;
                    if (isset($depends['application'])) {
                        $depends = implode(', ', (array) $depends['application']);
                    }
                    
                    $application['current_version'] = (string) $installable[$application['name']]->version;
                    $application['install_status'] = (version_compare($application['version'], $application['current_version']) === -1) ? 'updateable' : 'uptodate';
                    $application['depends'] = $depends;
                    $applications[] = $application;
                    unset($installable[$application['name']]);
                }
            } catch (Zend_Db_Statement_Exception $zse) {
                // no tables exist
            }
        }
        
        foreach ($installable as $name => $setupXML) {
            $depends = (array) $setupXML->depends;
            if (isset($depends['application'])) {
                $depends = implode(', ', (array) $depends['application']);
            }
            
            $applications[] = array(
                'name'              => $name,
                'current_version'   => (string) $setupXML->version,
                'install_status'    => 'uninstalled',
                'depends'           => $depends,
            );
        }
        
        return array(
            'results'       => $applications,
            'totalcount'    => count($applications)
        );
    }
    
    /**
     * do the environment check
     *
     * @return array
     */
    public function envCheck()
    {
        return Setup_Controller::getInstance()->checkRequirements();
    }

    /**
     * load config data from config file / default data
     *
     * @return array
     */
    public function loadConfig()
    {
        $result = (!Setup_Core::configFileExists()) 
                ? Setup_Controller::getInstance()->getConfigDefaults()
                : Setup_Controller::getInstance()->getConfigData();

        return $result;
    }
    
    /**
     * save config data in config file
     *
     * @param string $data
     * @return array with config data
     */
    public function saveConfig($data)
    {
        $configData = Zend_Json::decode($data);
        Setup_Controller::getInstance()->saveConfigData($configData);
        
        return $this->checkConfig();
    }
    
    /**
     * check config and return status
     *
     * @return array
     * 
     * @todo add check if db settings have changed?
     */
    public function checkConfig()
    {
        // check first if db settings have changed?
        //if (!Setup_Core::get(Setup_Core::CHECKDB))
        Setup_Core::setupDatabaseConnection();
        
        $result = array(
            'configExists'     => Setup_Core::configFileExists(),
            'configWritable'   => Setup_Core::configFileWritable(),
            'checkDB'          => Setup_Core::get(Setup_Core::CHECKDB),
        );
        
        return $result;        
    }
    
    /**
     * Returns registry data of tinebase.
     * @see Tinebase_Application_Json_Abstract
     * 
     * @return mixed array 'variable name' => 'data'
     */
    public function getRegistryData()
    {
    // anonymous registry
        $registryData =  array(
            'configExists'     => Setup_Core::configFileExists(),
            'version'          => array(
                'buildType'     => TINE20SETUP_BUILDTYPE,
                'codeName'      => TINE20SETUP_CODENAME,
                'packageString' => TINE20SETUP_PACKAGESTRING,
                'releaseTime'   => TINE20SETUP_RELEASETIME
            ),
        );
        
        // authenticated or non existent config
        if (! Setup_Core::configFileExists() || Setup_Core::isRegistered(Setup_Core::USER)) {
            $registryData = array_merge($registryData, array(
                'configWritable'     => Setup_Core::configFileWritable(),
                'checkDB'            => Setup_Core::get(Setup_Core::CHECKDB),
                'setupChecks'        => $this->envCheck(),
                'configData'         => $this->loadConfig(),
            ));
        }
        
        // if setup user is logged in
        if (Setup_Core::isRegistered(Setup_Core::USER)) {
            $registryData += array(
                'currentAccount'   => Setup_Core::getUser(),
            );
        }
        
        return $registryData;
    }
    
    /**
     * Returns registry data of all applications current user has access to
     * @see Tinebase_Application_Json_Abstract
     * 
     * @return mixed array 'variable name' => 'data'
     */
    public function getAllRegistryData()
    {
        $registryData['Setup'] = $this->getRegistryData();
        
        // setup also need some core tinebase regdata
        $locale = Tinebase_Core::get('locale');
        $registryData['Tinebase'] = array(
            'timeZone'         => Setup_Core::get('userTimeZone'),
            'jsonKey'       => Setup_Core::get('jsonKey'),
            'locale'           => array(
                'locale'   => $locale->toString(), 
                'language' => $locale->getLanguageTranslation($locale->getLanguage()),
                'region'   => $locale->getCountryTranslation($locale->getRegion()),
            ),
        );
        
        die(Zend_Json::encode($registryData));
    }
}

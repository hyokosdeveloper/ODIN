<?php
/**
 * Tine 2.0
 * @package     Tinebase
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: Cli.php,v 1.1 2009/12/08 23:16:22 hyokos Exp $
 * 
 * @todo        add ext check again
 */

/**
 * cli server
 *
 * This class handles all requests from cli scripts
 *
 * @package     Tinebase
 */
class Setup_Frontend_Cli
{
    /**
     * the internal name of the application
     *
     * @var string
     */
    protected $_appname = 'Setup';

    /**
     * authentication
     *
     * @param string $_username
     * @param string $_password
     */
    public function authenticate($_username, $_password)
    {
        return false;
    }
    
    /**
     * handle request (call -ApplicationName-_Cli.-MethodName- or -ApplicationName-_Cli.getHelp)
     *
     * @param Zend_Console_Getopt $_opts
     * @return boolean success
     */
    public function handle(Zend_Console_Getopt $_opts)
    {
        if(isset($_opts->install)) {
            $this->_install($_opts);
        } elseif(isset($_opts->update)) {
            $this->_update($_opts);
        } elseif(isset($_opts->uninstall)) {
            $this->_uninstall($_opts);
        } elseif(isset($_opts->list)) {
            $this->_listInstalled();
        } elseif(isset($_opts->import_accounts)) {
            $this->_importAccounts($_opts);
        }
    }
    
    /**
     * install new applications
     *
     * @param Zend_Console_Getopt $_opts
     */
    protected function _install(Zend_Console_Getopt $_opts)
    {
        $controller = Setup_Controller::getInstance();
        
        if($_opts->install === true) {
            $applications = $controller->getInstallableApplications();
            $applications = array_keys($applications);
        } else {
            $applications = array();
            $applicationNames = explode(',', $_opts->install);
            foreach($applicationNames as $applicationName) {
                $applicationName = ucfirst(trim($applicationName));
                try {
                    $controller->getSetupXml($applicationName);
                    $applications[] = $applicationName;
                } catch (Setup_Exception_NotFound $e) {
                    echo "Application $applicationName not found! Skipped...\n";
                }
            }
        }
        
        $controller->installApplications($applications);
        
        if(in_array('Tinebase', $applications)) {
            $authType = Tinebase_Core::getConfig()->authentication->get('backend', Tinebase_Auth_Factory::SQL);
            
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
        
        echo "Successfully installed " . count($applications) . " applications.\n";        
    }

    /**
     * update existing applications
     *
     * @param Zend_Console_Getopt $_opts
     */
    protected function _update(Zend_Console_Getopt $_opts)
    {
        $controller = Setup_Controller::getInstance();
        
        if($_opts->update === true) {
            $applications = Tinebase_Application::getInstance()->getApplications(NULL, 'id');
        } else {
            $applications = new Tinebase_Record_RecordSet('Tinebase_Model_Application');
            $applicationNames = explode(',', $_opts->update);
            foreach($applicationNames as $applicationName) {
                $applicationName = ucfirst(trim($applicationName));
                try {
                    $application = Tinebase_Application::getInstance()->getApplicationByName($applicationName);
                    $applications->addRecord($application);
                } catch (Tinebase_Exception_NotFound $e) {
                    //echo "Application $applicationName is not installed! Skipped...\n";
                }
            }
        }
        
        foreach($applications as $key => &$application) {
            if(!$controller->updateNeeded($application)) {
                //echo "Application $application is already up to date! Skipped...\n";
                unset($applications[$key]);
            }
        }

        if(count($applications) > 0) {
            $controller->updateApplications($applications);
        }
        
        echo "Updated " . count($applications) . " applications.\n";        
    }

    /**
     * uninstall applications
     *
     * @param Zend_Console_Getopt $_opts
     */
    protected function _uninstall(Zend_Console_Getopt $_opts)
    {
        $controller = Setup_Controller::getInstance();
        
        if($_opts->uninstall === true) {
            $applications = Tinebase_Application::getInstance()->getApplications(NULL, 'id');
        } else {
            $applications = new Tinebase_Record_RecordSet('Tinebase_Model_Application');
            $applicationNames = explode(',', $_opts->uninstall);
            foreach($applicationNames as $applicationName) {
                $applicationName = ucfirst(trim($applicationName));
                try {
                    $application = Tinebase_Application::getInstance()->getApplicationByName($applicationName);
                    $applications->addRecord($application);
                } catch (Tinebase_Exception_NotFound $e) {
                    //echo "Application $applicationName is not installed! Skipped...\n";
                }
            }
        }
        
        $controller->uninstallApplications($applications->name);

        echo "Successfully uninstalled " . count($applications) . " applications.\n";        
    }

    /**
     * list installed apps
     *
     */
    protected function _listInstalled()
    {
        try {
            $applications = Tinebase_Application::getInstance()->getApplications(NULL, 'id');
        } catch (Zend_Db_Statement_Exception $e) {
            echo "No applications installed\n";
            return;
        }
        
        echo "Currently installed applications:\n";
        foreach($applications as $application) {
            echo "* $application\n";
        }
    }
    
    /**
     * import accounts from ldap
     *
     * @param Zend_Console_Getopt $_opts
     */
    protected function _importAccounts(Zend_Console_Getopt $_opts)
    {
        // import groups
        Tinebase_Group::getInstance()->importGroups();
        
        // import users
        Tinebase_User::getInstance()->importUsers();
        
        // import group memberships
        Tinebase_Group::getInstance()->importGroupMembers();
    }
}

<?php
/**
 * Tine 2.0
 * 
 * @package     Tinebase
 * @subpackage  Server
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @version     $Id: Json.php,v 1.1 2009/12/08 23:15:36 hyokos Exp $
 * 
 */

/**
 * JSON Server class with handle() function
 * 
 * @package     Tinebase
 * @subpackage  Server
 */
class Tinebase_Server_Json extends Tinebase_Server_Abstract
{
    /**
     * handler for JSON api requests
     * @todo session expire handling
     * 
     * @return JSON
     */
    public function handle()
    {
        try {
            $this->_initFramework();
            
            // 2008-09-12 temporary bug hunting for FF or library/ExtJS bug. 
            if ($_SERVER['HTTP_X_TINE20_REQUEST_TYPE'] !== $_POST['requestType']) {
                Tinebase_Core::getLogger()->debug('HEADER - POST API REQUEST MISMATCH! Header is:"' . $_SERVER['HTTP_X_TINE20_REQUEST_TYPE'] .
                    '" whereas POST is "' . $_POST['requestType'] . '"' . ' HTTP_USER_AGENT: "' . $_SERVER['HTTP_USER_AGENT'] . '"');
            }
            
            Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ .' is json request. method: ' . $_REQUEST['method']);
            
            $anonymnousMethods = array(
                'Tinebase.getRegistryData',
                'Tinebase.getAllRegistryData',
                'Tinebase.login',
                'Tinebase.getAvailableTranslations',
                'Tinebase.getTranslations',
                'Tinebase.setLocale'
            );
            // check json key for all methods but some exceptions
            if ( !(in_array($_POST['method'], $anonymnousMethods) || preg_match('/Tinebase_UserRegistration/', $_POST['method']))  
                    && $_POST['jsonKey'] != Tinebase_Core::get('jsonKey') ) {
    
                if (! Tinebase_Core::isRegistered(Tinebase_Core::USER)) {
                    Tinebase_Core::getLogger()->INFO('Attempt to request a privileged Json-API method without autorisation from "' . $_SERVER['REMOTE_ADDR'] . '". (seesion timeout?)');
                    
                    throw new Tinebase_Exception_AccessDenied('Not Autorised', 401);
                } else {
                    Tinebase_Core::getLogger()->WARN('Fatal: got wrong json key! (' . $_POST['jsonKey'] . ') Possible CSRF attempt!' .
                        ' affected account: ' . print_r(Tinebase_Core::getUser()->toArray(), true) .
                        ' request: ' . print_r($_REQUEST, true)
                    );
                    
                    throw new Tinebase_Exception_AccessDenied('Not Authorised', 401);
                    //throw new Exception('Possible CSRF attempt detected!');
                }
            }
    
            $server = new Zend_Json_Server();
            
            // add json apis which require no auth
            $server->setClass('Tinebase_Frontend_Json', 'Tinebase');
            $server->setClass('Tinebase_Frontend_Json_UserRegistration', 'Tinebase_UserRegistration');
            
            // register additional Json apis only available for authorised users
            if (Zend_Auth::getInstance()->hasIdentity()) {
                //Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . " user data: " . print_r(Tinebase_Core::getUser()->toArray(), true));
                
                if (array_key_exists('stateInfo', $_REQUEST) && ! empty($_REQUEST['stateInfo'])) {
                    Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . " About to save clients appended stateInfo ... ");
                    // save state info here (and return in with getAllRegistryData)
                    Tinebase_State::getInstance()->saveStateInfo($_REQUEST['stateInfo']);
                }
                
                $applicationParts = explode('.', $_REQUEST['method']);
                $applicationName = ucfirst($applicationParts[0]);
                
                switch($applicationName) {
                    // additional Tinebase json apis
                    case 'Tinebase_Container':
                        $server->setClass('Tinebase_Frontend_Json_Container', 'Tinebase_Container');                
                        break;
                    case 'Tinebase_PersistentFilter':
                        $server->setClass('Tinebase_Frontend_Json_PersistentFilter', 'Tinebase_PersistentFilter');                
                        break;
                        
                    default;
                        if(Tinebase_Core::getUser()->hasRight($applicationName, Tinebase_Acl_Rights_Abstract::RUN)) {
                            try {
                                $server->setClass($applicationName.'_Frontend_Json', $applicationName);
                            } catch (Exception $e) {
                                Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . " Failed to add JSON API for application '$applicationName' Exception: \n". $e);
                            }
                        }
                        break;
                }
            }
            
            $server->handle($_REQUEST);
            
        } catch (Exception $exception) {
            
            // handle all kind of session exceptions as 'Not Authorised'
            if ($exception instanceof Zend_Session_Exception) {
                $exception = new Tinebase_Exception_AccessDenied('Not Authorised', 401);
            }
            
            Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . " got exception code" . $exception->getCode());
            $server = new Zend_Json_Server();
            $server->fault($exception, $exception->getCode());
            exit;
        }
    }
}

<?php
/**
 * Tine 2.0
 * 
 * @package     Tinebase
 * @subpackage  Server
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @version     $Id: Json.php,v 1.1 2010/04/13 21:56:16 hyokos Exp $
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
     * handle request
     * 
     * @return void
     */	
	public function handle()
	{
	    try {
    	    $this->_initFramework();
    	    $exception = FALSE;
	    } catch (Exception $exception) {
	        Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ .' initFramework exception: ' . $exception);
            
	        // handle all kind of session exceptions as 'Not Authorised'
	        if ($exception instanceof Zend_Session_Exception) {
                $exception = new Tinebase_Exception_AccessDenied('Not Authorised', 401);
            }
        }
        
        $server = new Zend_Json_Server();
        $server->setAutoEmitResponse(false);
        $server->setAutoHandleExceptions(false);
        //$server->setUseNamedParams(true);
        
        $json = file_get_contents('php://input');
        if (substr($json, 0, 1) == '[') {
        	Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' batched request'); 
        	$isBatchedRequest = true;
        	$requests = Zend_Json::decode($json);
        } else {
        	$isBatchedRequest = false;
        	$requests = array(Zend_Json::decode($json));
        }
        Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ .' is JSON request. rawdata: ' . print_r($requests, true));
        $response = array();
        foreach ($requests as $requestOptions) {
        	$request = new Zend_Json_Server_Request();
        	$request->setOptions($requestOptions);
        	
        	$response[] = $exception ? 
        	   $this->_handleException($server, $request, $exception) :
        	   $this->_handle($server, $request);
        }
        
        echo $isBatchedRequest ? '['. implode(',', $response) .']' : $response[0];
	}
	
    /**
     * handler for JSON api requests
     * @todo session expire handling
     * 
     * @return JSON
     */
    protected function _handle($server, $request)
    {
        try {
            $method  = $request->getMethod();
            Tinebase_Core::getLogger()->INFO(__METHOD__ . '::' . __LINE__ .' is JSON request. method: ' . $method);
            
            $jsonKey = (isset($_SERVER['HTTP_X_TINE20_JSONKEY'])) ? $_SERVER['HTTP_X_TINE20_JSONKEY'] : '';
            $this->_checkJsonKey($method, $jsonKey);
            
            // add json apis which require no auth
            $server->setClass('Tinebase_Frontend_Json', 'Tinebase');
            $server->setClass('Tinebase_Frontend_Json_UserRegistration', 'Tinebase_UserRegistration');
            
            if(empty($method)) {
                // SMD request
                return self::getServiceMap();
            }
            
            // register additional Json apis only available for authorised users
            if (Zend_Auth::getInstance()->hasIdentity()) {
                
                //Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . " user data: " . print_r(Tinebase_Core::getUser()->toArray(), true));
                
                $applicationParts = explode('.', $method);
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
                        if(Tinebase_Core::getUser() && Tinebase_Core::getUser()->hasRight($applicationName, Tinebase_Acl_Rights_Abstract::RUN)) {
                            try {
                                $server->setClass($applicationName.'_Frontend_Json', $applicationName);
                            } catch (Exception $e) {
                                Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . " Failed to add JSON API for application '$applicationName' Exception: \n". $e);
                            }
                        }
                        break;
                }
            }

            // handle response
            return $server->handle($request);
            
        } catch (Exception $exception) {
            return $this->_handleException($server, $request, $exception);
        }
    }
    
    /**
     * handle exceptions
     * 
     * @param Zend_Json_Server $server
     * @param Zend_Json_Server_Request_Http $request
     * @param Exception $exception
     * @return string json data
     */
    protected function _handleException($server, $request, $exception)
    {
        $exceptionData = method_exists($exception, 'toArray')? $exception->toArray() : array();
        $exceptionData['message'] = $exception->getMessage();
        $exceptionData['code']    = $exception->getCode();
        if (Tinebase_Core::getConfig()->suppressExceptionTraces !== TRUE) {
            $exceptionData['trace']   = $exception->getTrace();
        }
        
        $server->fault($exceptionData['message'], $exceptionData['code'], $exceptionData);
        
        $response = $server->getResponse();
        if (null !== ($id = $request->getId())) {
            $response->setId($id);
        }
        if (null !== ($version = $request->getVersion())) {
            $response->setVersion($version);
        }
    
        Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' ' . $exception);
        
        return $response;
    }
    
    /**
     * return service map
     * 
     * @return Zend_Json_Server_Smd
     */
    public static function getServiceMap()
    {
        $server = new Zend_Json_Server();
        
        $server->setClass('Tinebase_Frontend_Json', 'Tinebase');
        $server->setClass('Tinebase_Frontend_Json_UserRegistration', 'Tinebase_UserRegistration');
        
        if (Tinebase_Core::isRegistered(Tinebase_Core::USER)) { 
            $server->setClass('Tinebase_Frontend_Json_Container', 'Tinebase_Container');
            $server->setClass('Tinebase_Frontend_Json_PersistentFilter', 'Tinebase_PersistentFilter');
            
            $userApplications = Tinebase_Core::getUser()->getApplications(TRUE);
            foreach($userApplications as $application) {
                $jsonAppName = $application->name . '_Frontend_Json';
                $server->setClass($jsonAppName, $application->name);
            }
        }
        
        $server->setTarget('index.php')
               ->setEnvelope(Zend_Json_Server_Smd::ENV_JSONRPC_2);
            
        $smd = $server->getServiceMap();
        
        return $smd;
    }
    
    /**
     * check json key
     *
     * @param string $method
     * @param string $jsonKey
     */
    protected function _checkJsonKey($method, $jsonKey)
    {
        $anonymnousMethods = array(
            '', //empty method
            'Tinebase.getRegistryData',
            'Tinebase.getAllRegistryData',
            'Tinebase.authenticate',
            'Tinebase.login',
            'Tinebase.getAvailableTranslations',
            'Tinebase.getTranslations',
            'Tinebase.setLocale'
        );
        // check json key for all methods but some exceptions
        if ( !(in_array($method, $anonymnousMethods) || preg_match('/Tinebase_UserRegistration/', $method))  
                && $jsonKey != Tinebase_Core::get('jsonKey')) {
        
            if (! Tinebase_Core::isRegistered(Tinebase_Core::USER)) {
                Tinebase_Core::getLogger()->INFO('Attempt to request a privileged Json-API method without authorisation from "' . $_SERVER['REMOTE_ADDR'] . '". (session timeout?)');
                
                throw new Tinebase_Exception_AccessDenied('Not Authorised', 401);
            } else {
                Tinebase_Core::getLogger()->WARN('Fatal: got wrong json key! (' . $jsonKey . ') Possible CSRF attempt!' .
                    ' affected account: ' . print_r(Tinebase_Core::getUser()->toArray(), true) .
                    ' request: ' . print_r($_REQUEST, true)
                );
                
                throw new Tinebase_Exception_AccessDenied('Not Authorised', 401);
            }
        }
    }
}

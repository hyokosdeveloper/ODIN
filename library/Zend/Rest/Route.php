<?php
/**
 * Zend Framework
 *
 * LICENSE
 *
 * This source file is subject to the new BSD license that is bundled
 * with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * http://framework.zend.com/license/new-bsd
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@zend.com so we can send you a copy immediately.
 *
 * @package    Zend_Rest
 * @copyright  Copyright (c) 2005-2009 Zend Technologies USA Inc. (http://www.zend.com)
 * @license    http://framework.zend.com/license/new-bsd     New BSD License
 * @version    $Id: Route.php,v 1.1 2010/04/13 21:53:15 hyokos Exp $
 */

/** 
 * @see Zend_Controller_Router_Route_Interface 
 */
require_once 'Zend/Controller/Router/Route/Interface.php';

/** 
 * @see Zend_Controller_Router_Route_Module
 */
require_once 'Zend/Controller/Router/Route/Module.php';

/** 
 * @see Zend_Controller_Dispatcher_Interface
 */
require_once 'Zend/Controller/Dispatcher/Interface.php';

/** 
 * @see Zend_Controller_Request_Abstract
 */
require_once 'Zend/Controller/Request/Abstract.php';

/**
 * Rest Route
 *
 * Request-aware route for RESTful modular routing
 *
 * @package    Zend_Rest
 * @copyright  Copyright (c) 2005-2008 Zend Technologies USA Inc. (http://www.zend.com)
 * @license    http://framework.zend.com/license/new-bsd     New BSD License
 */
class Zend_Rest_Route extends Zend_Controller_Router_Route_Module
{
    /**
     * Specific Modules to receive RESTful routes
     * @var array
     */ 
    protected $_restfulModules = null; 
 
    /**
     * Specific Modules=>Controllers to receive RESTful routes
     * @var array
     */ 
    protected $_restfulControllers = null; 
     
    /**
     * Constructor
     *
     * @param Zend_Controller_Front $front Front Controller object
     * @param array $defaults Defaults for map variables with keys as variable names
     * @param array $responders Modules or controllers to receive RESTful routes
     */ 
    public function __construct(Zend_Controller_Front $front, 
        array $defaults = array(),  
        array $responders = array()) 
    { 
        $this->_defaults = $defaults; 
 
        if($responders) 
            $this->_parseResponders($responders); 
 
        if (isset($front)) { 
            $this->_request = $front->getRequest(); 
            $this->_dispatcher = $front->getDispatcher(); 
        } 
    } 
 
    /**
     * Matches a user submitted request. Assigns and returns an array of variables
     * on a successful match.
     *
     * If a request object is registered, it uses its setModuleName(),
     * setControllerName(), and setActionName() accessors to set those values.
     * Always returns the values as an array.
     *
     * @param Zend_Controller_Request_Http $request Request used to match against this routing ruleset
     * @return array An array of assigned values or a false on a mismatch
     */  
    public function match($request) 
    {  
        $this->_setRequestKeys(); 
 
        $path = $request->getPathInfo(); 
        $values = array();  
        $params = array();  
        $path   = trim($path, self::URI_DELIMITER);  
  
        if ($path != '') {  
              
            $path = explode(self::URI_DELIMITER, $path);  
             
            // Determine Module 
            $moduleName = $this->_defaults[$this->_moduleKey]; 
            if ($this->_dispatcher && $this->_dispatcher->isValidModule($path[0])) { 
                $moduleName = $path[0]; 
                if ($this->_checkRestfulModule($moduleName)) { 
                    $values[$this->_moduleKey] = array_shift($path);  
                    $this->_moduleValid = true;                          
                } 
            }  
              
            // Determine Controller 
            $controllerName = $this->_defaults[$this->_controllerKey]; 
            if (count($path) && !empty($path[0])) { 
                if ($this->_checkRestfulController($moduleName, $path[0])) { 
                    $controllerName = $path[0]; 
                    $values[$this->_controllerKey] = array_shift($path); 
                    $values[$this->_actionKey] = 'get'; 
                } else { 
                    // If Controller in URI is not found to be a RESTful 
                    // Controller, return false to fall back to other routes 
                    return false; 
                } 
            } 
            
            //Store path count for method mapping
            $pathElementCount = count($path);
            
            // Check for leading "special get" URI's 
            $specialGetTarget = false;
            if ($pathElementCount && array_search($path[0], array('index', 'new')) > -1) { 
                $specialGetTarget = array_shift($path);
            } elseif ($pathElementCount == 1) {
                 $params['id'] = array_shift($path);
            } elseif ($pathElementCount == 0 || $pathElementCount > 1) {
                $specialGetTarget = 'list';
            }
 
            // Digest URI params 
            if ($numSegs = count($path)) {  
                for ($i = 0; $i < $numSegs; $i = $i + 2) {  
                    $key = urldecode($path[$i]);  
                    $val = isset($path[$i + 1]) ? urldecode($path[$i + 1]) : null;  
                    $params[$key] = $val;  
                }  
            } 
             
            // Check for trailing "special get" URI 
            if (array_key_exists('edit', $params)) 
                $specialGetTarget = 'edit'; 
 
            // Determine Action 
            $requestMethod = strtolower($request->getMethod()); 
            if ($requestMethod != 'get') { 
                if ($request->getParam('_method')) { 
                    $values[$this->_actionKey] = strtolower($request->getParam('_method')); 
                } elseif ( $this->_request->getHeader('X-HTTP-Method-Override') ) {
                    $values[$this->_actionKey] = strtolower($this->_request->getHeader('X-HTTP-Method-Override'));
                } else { 
                    $values[$this->_actionKey] = $requestMethod; 
                }

                //Map PUT and POST to actual create/update actions
                //based on parameter count (posting to resource or collection)
                switch( $values[$this->_actionKey] ){
                    case 'post':
                        if ($pathElementCount > 0) {
                            $values[$this->_actionKey] = 'put';
                        } else {
                            $values[$this->_actionKey] = 'post';
                        }
                        break;
                    case 'put':
                        $values[$this->_actionKey] = 'put';
                        break;
                }
                
            } elseif ($specialGetTarget) {  
                $values[$this->_actionKey] = $specialGetTarget; 
            } 
              
        }  
        $this->_values = $values + $params;
         
        return $this->_values + $this->_defaults;  
    } 
  
    /**
     * Assembles user submitted parameters forming a URL path defined by this route
     *
     * @param array $data An array of variable and value pairs used as parameters
     * @param bool $reset Weither to reset the current params
     * @param bool $encode Weither to return urlencoded string
     * @return string Route path with user submitted parameters
     */  
    public function assemble($data = array(), $reset = false, $encode = true)  
    {  
        if (!$this->_keysSet) {  
            $this->_setRequestKeys();  
        }  
  
        $params = (!$reset) ? $this->_values : array();  
  
        foreach ($data as $key => $value) {  
            if ($value !== null) {  
                $params[$key] = $value;  
            } elseif (isset($params[$key])) {  
                unset($params[$key]);  
            }  
        }  
  
        $params += $this->_defaults;  
  
        $url = '';  
  
        if ($this->_moduleValid || array_key_exists($this->_moduleKey, $data)) {  
            if ($params[$this->_moduleKey] != $this->_defaults[$this->_moduleKey]) {  
                $module = $params[$this->_moduleKey];  
            }  
        }  
        unset($params[$this->_moduleKey]);  
  
        $controller = $params[$this->_controllerKey];  
        unset($params[$this->_controllerKey]);

        unset($params[$this->_actionKey]);
        
        if (isset($params['index']) && $params['index']) {
            unset($params['index']);
            $url .= '/index';
            foreach ($params as $key => $value) {  
                $url .= '/' . $key;  
                $url .= '/' . $value;  
            }
        } else {
            if (isset($params['id']))
                $url .= '/' . $params['id'];        	
        }
  
        if (!empty($url) || $controller !== $this->_defaults[$this->_controllerKey]) {  
            $url = '/' . $controller . $url;  
        }  
  
        if (isset($module)) {  
            $url = '/' . $module . $url;  
        }  
  
        return ltrim($url, self::URI_DELIMITER);  
    } 
     
    /**
     * Tells Rewrite Router which version this Route is
     *
     * @return int Route "version"
     */ 
    public function getVersion() 
    { 
        return 2; 
    } 

    /**
     * Parses the responders array sent to constructor to know
     * which modules and/or controllers are RESTful
     *
     * @param array $responders
     */
    private function _parseResponders($responders) 
    { 
        $modulesOnly = true; 
        foreach ($responders as $responder) { 
            if(is_array($responder)) 
                $modulesOnly = false; 
        } 
        if ($modulesOnly) { 
            $this->_restfulModules = $responders; 
        } else { 
            $this->_restfulControllers = $responders; 
        } 
    } 

    /**
     * Determine if a specified module supports RESTful routing
     *
     * @param string $moduleName
     * @return bool
     */
    private function _checkRestfulModule($moduleName) 
    { 
        if ($this->_allRestful()) 
            return true; 
        if ($this->_fullRestfulModule($moduleName)) 
            return true; 
        if ($this->_restfulControllers && array_key_exists($moduleName, $this->_restfulControllers)) 
            return true; 
        return false; 
    } 

    /**
     * Determine if a specified module + controller combination supports
     * RESTful routing
     *
     * @param string $moduleName
     * @param string $controllerName
     * @return bool
     */
    private function _checkRestfulController($moduleName, $controllerName) 
    { 
        if ($this->_allRestful()) 
            return true; 
        if ($this->_fullRestfulModule($moduleName)) 
            return true; 
        if ($this->_checkRestfulModule($moduleName) 
            && $this->_restfulControllers 
            && array_search($controllerName, $this->_restfulControllers[$moduleName]) !== false) 
            return true; 
        return false; 
    } 

    /**
     * Determines if RESTful routing applies to the entire app
     *
     * @return bool
     */
    private function _allRestful() 
    { 
        return (!$this->_restfulModules && !$this->_restfulControllers); 
    } 

    /**
     * Determines if RESTful routing applies to an entire module
     *
     * @param string $moduleName
     * @return bool
     */
    private function _fullRestfulModule($moduleName) 
    { 
        return ($this->_restfulModules && array_search($moduleName, $this->_restfulModules) !== false); 
    } 
 
} 
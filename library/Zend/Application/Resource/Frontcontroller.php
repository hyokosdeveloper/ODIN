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
 * @category   Zend
 * @package    Zend_Application
 * @subpackage Resource
 * @copyright  Copyright (c) 2005-2009 Zend Technologies USA Inc. (http://www.zend.com)
 * @license    http://framework.zend.com/license/new-bsd     New BSD License
 * @version    $Id: Frontcontroller.php,v 1.1 2010/04/13 21:51:14 hyokos Exp $
 */

/**
 * Front Controller resource
 *
 * @category   Zend
 * @package    Zend_Application
 * @subpackage Resource
 * @copyright  Copyright (c) 2005-2009 Zend Technologies USA Inc. (http://www.zend.com)
 * @license    http://framework.zend.com/license/new-bsd     New BSD License
 */
class Zend_Application_Resource_Frontcontroller extends Zend_Application_Resource_ResourceAbstract
{
    /**
     * @var Zend_Controller_Front
     */
    protected $_front;

    /**
     * Initialize Front Controller
     * 
     * @return Zend_Controller_Front
     */
    public function init()
    {
        $front = $this->getFrontController();
        
        foreach ($this->getOptions() as $key => $value) {
            switch (strtolower($key)) {
                case 'controllerdirectory':
                    if (is_string($value)) {
                        $front->setControllerDirectory($value);
                    } elseif (is_array($value)) {
                        foreach ($value as $module => $directory) {
                            $front->addControllerDirectory($directory, $module);
                        }
                    }
                    break;
                    
                case 'modulecontrollerdirectoryname':
                    $front->setModuleControllerDirectoryName($value);
                    break;
                    
                case 'moduledirectory':
                    $front->addModuleDirectory($value);
                    break;
                    
                case 'defaultcontrollername':
                    $front->setDefaultControllerName($value);
                    break;
                    
                case 'defaultaction':
                    $front->setDefaultAction($value);
                    break;
                    
                case 'defaultmodule':
                    $front->setDefaultModule($value);
                    break;
                    
                case 'baseurl':
                    $front->setBaseUrl($value);
                    break;
                    
                case 'params':
                    $front->setParams($value);
                    break;
                    
                case 'plugins':
                    foreach ((array) $value as $pluginClass) {
                        $plugin = new $pluginClass();
                        $front->registerPlugin($plugin);
                    }
                    break;

                case 'throwexceptions':
                    $front->throwExceptions((bool) $value);
                    break;

                case 'actionhelperpaths':
                    if (is_array($value)) {
                        foreach ($value as $helperPrefix => $helperPath) {
                            Zend_Controller_Action_HelperBroker::addPath($helperPath, $helperPrefix);
                        }
                    }
                    break;

                default:
                    $front->setParam($key, $value);
                    break;
            }
        }

        if (null !== ($bootstrap = $this->getBootstrap())) {
            $this->getBootstrap()->frontController = $front;
        }

        return $front;
    }

    /**
     * Retrieve front controller instance
     * 
     * @return Zend_Controller_Front
     */
    public function getFrontController()
    {
        if (null === $this->_front) {
            $this->_front = Zend_Controller_Front::getInstance();
        }
        return $this->_front;
    }
}

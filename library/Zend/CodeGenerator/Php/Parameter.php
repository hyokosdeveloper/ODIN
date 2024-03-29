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
 * @package    Zend_CodeGenerator
 * @subpackage PHP
 * @copyright  Copyright (c) 2005-2009 Zend Technologies USA Inc. (http://www.zend.com)
 * @license    http://framework.zend.com/license/new-bsd     New BSD License
 * @version    $Id: Parameter.php,v 1.1 2010/04/13 21:50:57 hyokos Exp $
 */

/**
 * @see Zend_CodeGenerator_Php_Abstract
 */
require_once 'Zend/CodeGenerator/Php/Abstract.php';

/**
 * @category   Zend
 * @package    Zend_CodeGenerator
 * @copyright  Copyright (c) 2005-2009 Zend Technologies USA Inc. (http://www.zend.com)
 * @license    http://framework.zend.com/license/new-bsd     New BSD License
 */
class Zend_CodeGenerator_Php_Parameter extends Zend_CodeGenerator_Php_Abstract
{
    /**
     * @var string
     */
    protected $_type = null;
    
    /**
     * @var string
     */
    protected $_name = null;
    
    /**
     * @var string
     */
    protected $_defaultValue = null;
    
    /**
     * @var int
     */
    protected $_position = null;
    
    /**
     * fromReflection()
     *
     * @param Zend_Reflection_Parameter $reflectionParameter
     * @return Zend_CodeGenerator_Php_Parameter
     */
    public static function fromReflection(Zend_Reflection_Parameter $reflectionParameter)
    {
        // @todo Research this
        return new self();
    }
    
    /**
     * setType()
     *
     * @param string $type
     * @return Zend_CodeGenerator_Php_Parameter
     */
    public function setType($type)
    {
        $this->_type = $type;
        return $this;
    }
    
    /**
     * getType()
     *
     * @return string
     */
    public function getType()
    {
        return $this->_type;
    }
    
    /**
     * setName()
     *
     * @param string $name
     * @return Zend_CodeGenerator_Php_Parameter
     */
    public function setName($name)
    {
        $this->_name = $name;
        return $this;
    }
    
    /**
     * getName()
     *
     * @return string
     */
    public function getName()
    {
        return $this->_name;
    }
    
    /**
     * setDefaultValue()
     *
     * @param string $defaultValue
     * @return Zend_CodeGenerator_Php_Parameter
     */
    public function setDefaultValue($defaultValue)
    {
        $this->_defaultValue = $defaultValue;
        return $this;
    }
    
    /**
     * getDefaultValue()
     *
     * @return string
     */
    public function getDefaultValue()
    {
        return $this->_defaultValue;
    }
    
    /**
     * setPosition()
     *
     * @param int $position
     * @return Zend_CodeGenerator_Php_Parameter
     */
    public function setPosition($position)
    {
        $this->_position = $position;
        return $this;
    }
    
    /**
     * getPosition()
     *
     * @return int
     */
    public function getPosition()
    {
        return $this->_position;
    }
    
    /**
     * generate()
     *
     * @return string
     */
    public function generate()
    {
        $output = '';
        
        if ($this->_type) {
            $output .= $this->_type . ' '; 
        }
        
        $output .= '$' . $this->_name;
        
        if ($this->_defaultValue) {
            $output .= ' = ';
            if (is_string($this->_defaultValue)) {
                $output .= '\'' . $this->_defaultValue . '\'';
            } else {
                $output .= $this->_defaultValue;
            }
        }

        return $output;
    }
    
}
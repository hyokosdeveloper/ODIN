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
 * @package    Zend_Filter
 * @copyright  Copyright (c) 2005-2009 Zend Technologies USA Inc. (http://www.zend.com)
 * @license    http://framework.zend.com/license/new-bsd     New BSD License
 * @version    $Id: StringTrim.php,v 1.1 2010/04/13 21:52:56 hyokos Exp $
 */

/**
 * @see Zend_Filter_Interface
 */
require_once 'Zend/Filter/Interface.php';

/**
 * @category   Zend
 * @package    Zend_Filter
 * @copyright  Copyright (c) 2005-2009 Zend Technologies USA Inc. (http://www.zend.com)
 * @license    http://framework.zend.com/license/new-bsd     New BSD License
 */
class Zend_Filter_StringTrim implements Zend_Filter_Interface
{
    /**
     * List of characters provided to the trim() function
     *
     * If this is null, then trim() is called with no specific character list,
     * and its default behavior will be invoked, trimming whitespace.
     *
     * @var string|null
     */
    protected $_charList;

    /**
     * Sets filter options
     *
     * @param  string $charList
     * @return void
     */
    public function __construct($charList = null)
    {
        $this->_charList = $charList;
    }

    /**
     * Returns the charList option
     *
     * @return string|null
     */
    public function getCharList()
    {
        return $this->_charList;
    }

    /**
     * Sets the charList option
     *
     * @param  string|null $charList
     * @return Zend_Filter_StringTrim Provides a fluent interface
     */
    public function setCharList($charList)
    {
        $this->_charList = $charList;
        return $this;
    }

    /**
     * Defined by Zend_Filter_Interface
     *
     * Returns the string $value with characters stripped from the beginning and end
     *
     * @param  string $value
     * @return string
     */
    public function filter($value)
    {
        if (null === $this->_charList) {
            return $this->_unicodeTrim((string) $value);
        } else {
            return $this->_unicodeTrim((string) $value, $this->_charList);
        }
    }

    /**
     * Unicode aware trim method
     * Fixes a PHP problem
     *
     * @param string $value
     * @param string $charlist
     * @return string
     */
    protected function _unicodeTrim($value, $charlist = '\\\\s')
    {
        $chars = preg_replace(
            array( '/[\^\-\]\\\]/S', '/\\\{4}/S' ),
            array( '\\\\\\0', '\\' ),
            $charlist
        );

        $pattern = '^[' . $chars . ']*|[' . $chars . ']*$';
        return preg_replace("/$pattern/sSD", '', $value);
    }
}

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
 * @package    Zend_Session
 * @copyright  Copyright (c) 2005-2008 Zend Technologies USA Inc. (http://www.zend.com)
 * @license    http://framework.zend.com/license/new-bsd     New BSD License
 * @version    $Id: IpAddress.php,v 1.1 2010/04/13 21:56:30 hyokos Exp $
 * @since      Preview Release 0.2
 */

/**
 * @see Zend_Session_Validator_Abstract
 */
require_once 'Zend/Session/Validator/Abstract.php';

/**
 * Zend_Session_Validator_IpAddress
 *
 * @category   Zend
 * @package    Zend_Session
 * @subpackage Validator
 * @copyright  Copyright (c) 2005-2008 Zend Technologies USA Inc. (http://www.zend.com)
 * @license    http://framework.zend.com/license/new-bsd     New BSD License
 */
class Zend_Session_Validator_IpAddress extends Zend_Session_Validator_Abstract
{

    /**
     * Setup() - this method will get the remote ip address and store it in the session
     * as 'valid data'
     *
     * @return void
     */
    public function setup()
    {
        $this->setValidData( (isset($_SERVER['REMOTE_ADDR'])
            ? $_SERVER['REMOTE_ADDR'] : null) );
    }

    /**
     * Validate() - this method will determine if the remote ip address matches the
     * remote ip address we stored when we initialized this variable.
     *
     * @return bool
     */
    public function validate()
    {
        $currentIpAddress = (isset($_SERVER['REMOTE_ADDR'])
            ? $_SERVER['REMOTE_ADDR'] : null);

        return $currentIpAddress === $this->getValidData();
    }

}

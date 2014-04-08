<?php
/**
 * Tine 2.0
 * 
 * @package     Tinebase
 * @subpackage  Auth
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @version     $Id: Interface.php,v 1.1 2010/04/13 21:55:34 hyokos Exp $
 */

/**
 * authentication backend interface
 *  
 * @package     Tinebase
 * @subpackage  Auth
 */
interface Tinebase_Auth_Interface
{
    
    /**
     * setIdentity() - set the value to be used as the identity
     *
     * @param  string $value
     * @return Zend_Auth_Adapter_Interface Provides a fluent interface
     */
    public function setIdentity($value);
    
    /**
     * setCredential() - set the credential value to be used
     *
     * @param  string $credential
     * @return Zend_Auth_Adapter_Interface Provides a fluent interface
     */
    public function setCredential($credential);
}
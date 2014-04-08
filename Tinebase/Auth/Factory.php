<?php
/**
 * Tine 2.0
 * 
 * @package     Tinebase
 * @subpackage  Auth
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Lars Kneschke <l.kneschke@metaways.de>
 * @version     $Id: Factory.php,v 1.1 2010/04/13 21:55:34 hyokos Exp $
 */

/**
 * authentication backend factory class
 *  
 * @package     Tinebase
 * @subpackage  Auth
 */
class Tinebase_Auth_Factory
{
    /**
     * constant for Sql contacts backend class
     *
     */
    const SQL = 'Sql';
    
    /**
     * constant for LDAP contacts backend class
     *
     */
    const LDAP = 'Ldap';
    
    /**
     * factory function to return a selected authentication backend class
     *
     * @param   string $type
     * @return  Zend_Auth_Adapter_Interface
     * @throws  Tinebase_Exception_InvalidArgument
     */
    static public function factory($_type)
    {
        switch($_type) {
            case self::LDAP:
                $options = array('ldap' => Tinebase_Auth::getBackendConfiguration()); //only pass ldap options without e.g. sql options
                $instance = new Tinebase_Auth_Ldap($options);
                break;
                
            case self::SQL:
                $instance = new Tinebase_Auth_Sql(
                    Tinebase_Core::getDb(),
                    SQL_TABLE_PREFIX . 'accounts',
                    'login_name',
                    'password',
                    'MD5(?)'
                );
                break;
                
            default:
                throw new Tinebase_Exception_InvalidArgument('Unknown authentication backend');
                break;
        }
        
        return $instance;
    }
}

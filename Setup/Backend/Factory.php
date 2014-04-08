<?php
/**
 * backend factory class for the Setup
 * 
 * @package     Setup
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Matthias Greiling <m.greiling@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: Factory.php,v 1.1 2010/04/13 21:55:56 hyokos Exp $ *
 */

/**
 * backend factory class for the Setup
 * 
 * an instance of the Setup backendclass should be created using this class
 * 
 * $contacts = Setup_Backend::factory(Setup_Backend::$type);
 * 
 * currently implemented backend classes: Setup_Backend::MySql
 * 
 * @package     Setup
 */
class Setup_Backend_Factory
{

    /**
     * factory function to return a selected setup backend class
     *
     * @param string | optional $type
     * @return object
     */
    static public function factory($_type = null)
    {
        if (empty($_type)) {
            $db = Tinebase_Core::getDb();
            switch(get_class($db)) {
                case 'Zend_Db_Adapter_Pdo_Mysql':
                    return self::factory('Mysql');
                    
                case 'Zend_Db_Adapter_Oracle':
                    return self::factory(Tinebase_Core::ORACLE);
                    
                default:
                    throw new InvalidArgumentException('Invalid database backend type defined.');
            }
        }
     
        $className = 'Setup_Backend_' . ucfirst($_type);
        $instance = new $className();

        return $instance;
    }
}

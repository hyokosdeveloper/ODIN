<?php
/**
 * Tine 2.0
 * 
 * @package     Tinebase
 * @subpackage  Server
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @version     $Id: Abstract.php,v 1.1 2010/04/13 21:55:59 hyokos Exp $
 * 
 */

/**
 * Abstract Server class with handle and _initFramework functions
 * 
 * @package     Tinebase
 * @subpackage  Server
 */
abstract class Setup_Server_Abstract
{
    /**
     * init setup framework
     *
     */
    protected function _initFramework()
    {
        Setup_Core::setupConfig();
        
        Setup_Core::setupTempDir();
                
        // Server Timezone must be setup before logger, as logger has timehandling!
        Setup_Core::setupServerTimezone();

        Setup_Core::setupLogger();

        //Database Connection must be setup before cache because setupCache uses constant "SQL_TABLE_PREFIX"
        Setup_Core::setupDatabaseConnection();

        //Cache must be setup before User Locale because otherwise Zend_Locale tries to setup 
        //its own cache handler which might result in a open_basedir restriction depending on the php.ini settings 
        Setup_Core::setupCache();

        Setup_Core::setupSession();
        
        // setup a temporary user locale/timezone. This will be overwritten later but we 
        // need to handle exceptions during initialisation process such as seesion timeout
        Setup_Core::set('locale', new Zend_Locale('en_US'));
        Setup_Core::set('userTimeZone', 'UTC');
        
        #Tinebase_Core::setupMailer();


        //Setup_Core::setupUserTimezone();
        
        Setup_Core::setupUserLocale();
        
        
        header('X-API: http://www.tine20.org/apidocs/tine20/');
    }
    
    
    /**
     * handler for tine requests
     * 
     * @return boolean
     */
    abstract public function handle();
}

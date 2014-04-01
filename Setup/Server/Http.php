<?php
/**
 * Tine 2.0
 * 
 * @package     Tinebase
 * @subpackage  Server
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @version     $Id: Http.php,v 1.1 2009/12/08 23:15:45 hyokos Exp $
 * 
 */

/**
 * HTTP Server class with handle() function
 * 
 * @package     Tinebase
 * @subpackage  Server
 */
class Setup_Server_Http extends Setup_Server_Abstract
{
    /**
     * handler for HTTP api requests
     * @todo session expire handling
     * 
     * @return HTTP
     */
    public function handle()
    {
        $this->_initFramework();
        Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ .' is http request. method: ' . (isset($_REQUEST['method']) ? $_REQUEST['method'] : 'EMPTY'));
        
        $setupServer = new Setup_Frontend_Http();
        #$setupServer->authenticate($opts->username, $opts->password);
        return $setupServer->handle();        
    }
}

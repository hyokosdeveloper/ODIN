<?php
/**
 * Tine 2.0
 *
 * @package     Tinebase
 * @subpackage  AsyncJob
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: Backend.php,v 1.1 2009/12/08 23:16:36 hyokos Exp $
 * 
 */

/**
 * backend for async event management
 *
 * @package     Tinebase
 * @subpackage  AsyncJob
 */
class Tinebase_AsyncJob_Backend extends Tinebase_Backend_Sql_Abstract
{
    /**************************** backend settings *********************************/
    
    /**
     * Table name without prefix
     *
     * @var string
     */
    protected $_tableName = 'async_job';
    
    /**
     * Model name
     *
     * @var string
     */
    protected $_modelName = 'Tinebase_Model_AsyncJob';
    
}

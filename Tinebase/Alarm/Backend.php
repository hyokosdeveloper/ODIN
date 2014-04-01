<?php
/**
 * Tine 2.0
 *
 * @package     Tinebase
 * @subpackage  Alarm
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: Backend.php,v 1.1 2009/12/08 23:16:33 hyokos Exp $
 * 
 */

/**
 * backend for alarms / reminder messages
 *
 * @package     Tinebase
 * @subpackage  Alarm
 */
class Tinebase_Alarm_Backend extends Tinebase_Backend_Sql_Abstract
{
    /**************************** backend settings *********************************/
    
    /**
     * Table name without prefix
     *
     * @var string
     */
    protected $_tableName = 'alarm';
    
    /**
     * Model name
     *
     * @var string
     */
    protected $_modelName = 'Tinebase_Model_Alarm';
    
}

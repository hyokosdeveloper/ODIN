<?php
/**
 * Tine 2.0
 * 
 * @package     Tinebase
 * @subpackage  Alarm
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @version     $Id: Interface.php,v 1.1 2009/12/08 23:15:28 hyokos Exp $
 */

/**
 * alarms controller interface
 *  
 * @package     Tinebase
 * @subpackage  Auth
 */
interface Tinebase_Controller_Alarm_Interface
{
    /**
     * sendAlarm - send an alarm and update alarm status/sent_time/...
     *
     * @param  Tinebase_Model_Alarm $_alarm
     * @return Tinebase_Model_Alarm
     */
    public function sendAlarm(Tinebase_Model_Alarm $_alarm);
    
}

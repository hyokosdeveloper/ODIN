<?php
/**
 * Sql Calendar 
 * 
 * @package     Calendar
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: Attendee.php,v 1.1 2009/12/08 23:16:31 hyokos Exp $
 */

/**
 * native tine 2.0 events sql backend attendee class
 *
 * @package Calendar
 */
class Calendar_Backend_Sql_Attendee extends Tinebase_Backend_Sql_Abstract
{
    /**
     * event foreign key column
     */
    const FOREIGNKEY_EVENT = 'cal_event_id';
    
    /**
     * Table name without prefix
     *
     * @var string
     */
    protected $_tableName = 'cal_attendee';
    
    /**
     * Model name
     *
     * @var string
     */
    protected $_modelName = 'Calendar_Model_Attender';
    
}
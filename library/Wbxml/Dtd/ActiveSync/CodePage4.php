<?php
/**
 * Tine 2.0
 *
 * @package     Wbxml
 * @subpackage  ActiveSync
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2008-2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Lars Kneschke <l.kneschke@metaways.de>
 * @version     $Id: CodePage4.php,v 1.1 2010/04/13 21:50:56 hyokos Exp $
 */

/**
 * class documentation
 *
 * @package     Wbxml
 * @subpackage  ActiveSync
 */
 
class Wbxml_Dtd_ActiveSync_CodePage4 extends Wbxml_Dtd_ActiveSync_Abstract
{
    protected $_codePageNumber  = 4;
    
    protected $_codePageName    = 'Calendar';
        
    protected $_tags = array(     
        'Timezone'                => 0x05,
        'AllDayEvent'             => 0x06,
        'Attendees'               => 0x07,
        'Attendee'                => 0x08,
        'Email'                   => 0x09,
        'Name'                    => 0x0a,
        'Body'                    => 0x0b,
        'BodyTruncated'           => 0x0c,
        'BusyStatus'              => 0x0d,
        'Categories'              => 0x0e,
        'Category'                => 0x0f,
        'Rtf'                     => 0x10,
        'DtStamp'                 => 0x11,
        'EndTime'                 => 0x12,
        'Exception'               => 0x13,
        'Exceptions'              => 0x14,
        'Deleted'                 => 0x15,
        'ExceptionStartTime'      => 0x16,
        'Location'                => 0x17,
        'MeetingStatus'           => 0x18,
        'OrganizerEmail'          => 0x19,
        'OrganizerName'           => 0x1a,
        'Recurrence'              => 0x1b,
        'Type'                    => 0x1c,
        'Until'                   => 0x1d,
        'Occurrences'             => 0x1e,
        'Interval'                => 0x1f,
        'DayOfWeek'               => 0x20,
        'DayOfMonth'              => 0x21,
        'WeekOfMonth'             => 0x22,
        'MonthOfYear'             => 0x23,
        'Reminder'                => 0x24,
        'Sensitivity'             => 0x25,
        'Subject'                 => 0x26,
        'StartTime'               => 0x27,
        'UID'                     => 0x28,
        'AttendeeStatus'          => 0x29,
        'AttendeeType'            => 0x2a
    );
}
<?php
/**
 * Tine 2.0
 *
 * @package     Wbxml
 * @subpackage  ActiveSync
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2008-2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Lars Kneschke <l.kneschke@metaways.de>
 * @version     $Id: CodePage9.php,v 1.1 2010/04/13 21:50:56 hyokos Exp $
 */

/**
 * class documentation
 *
 * @package     Wbxml
 * @subpackage  ActiveSync
 */
 
class Wbxml_Dtd_ActiveSync_CodePage9 extends Wbxml_Dtd_ActiveSync_Abstract
{
    protected $_codePageNumber  = 9;
    
    protected $_codePageName    = 'Tasks';
        
    protected $_tags = array(     
        'Body'                    => 0x05,
        'BodySize'                => 0x06,
        'BodyTruncated'           => 0x07,
        'Categories'              => 0x08,
        'Category'                => 0x09,
        'Complete'                => 0x0a,
        'DateCompleted'           => 0x0b,
        'DueDate'                 => 0x0c,
        'UtcDueDate'              => 0x0d,
        'Importance'              => 0x0e,
        'Recurrence'              => 0x0f,
        'Type'                    => 0x10,
        'Start'                   => 0x11,
        'Until'                   => 0x12,
        'Occurrences'             => 0x13,
        'Interval'                => 0x14,
        'DayOfWeek'               => 0x16,
        'DayOfMonth'              => 0x15,
        'WeekOfMonth'             => 0x17,
        'MonthOfYear'             => 0x18,
        'Regenerate'              => 0x19,
        'DeadOccur'               => 0x1a,
        'ReminderSet'             => 0x1b,
        'ReminderTime'            => 0x1c,
        'Sensitivity'             => 0x1d,
        'StartDate'               => 0x1e,
        'UtcStartDate'            => 0x1f,
        'Subject'                 => 0x20,
        'Rtf'                     => 0x21,
        'OrdinalDate'             => 0x22,
        'SubOrdinalDate'          => 0x23
    );
}
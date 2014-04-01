<?php
/**
 * Tine 2.0
 *
 * @package     Wbxml
 * @subpackage  ActiveSync
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2008-2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Lars Kneschke <l.kneschke@metaways.de>
 * @version     $Id: CodePage8.php,v 1.1 2009/12/08 23:15:02 hyokos Exp $
 */

/**
 * class documentation
 *
 * @package     Wbxml
 * @subpackage  ActiveSync
 */
 
class Wbxml_Dtd_ActiveSync_CodePage8 extends Wbxml_Dtd_ActiveSync_Abstract
{
    protected $_codePageNumber  = 8;
    
    protected $_codePageName    = 'MeetingResponse';
        
    protected $_tags = array(     
        'CalendarId'              => 0x05,
        'CollectionId'            => 0x06,
        'MeetingResponse'         => 0x07,
        'RequestId'               => 0x08,
        'Request'                 => 0x09,
        'Result'                  => 0x0a,
        'Status'                  => 0x0b,
        'UserResponse'            => 0x0c,
        'Version'                 => 0x0d
    );
}
<?php
/**
 * Tine 2.0
 *
 * @package     Wbxml
 * @subpackage  ActiveSync
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2008-2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Lars Kneschke <l.kneschke@metaways.de>
 * @version     $Id: CodePage20.php,v 1.1 2009/12/08 23:15:02 hyokos Exp $
 */

/**
 * class documentation
 *
 * @package     Wbxml
 * @subpackage  ActiveSync
 */
 
class Wbxml_Dtd_ActiveSync_CodePage20 extends Wbxml_Dtd_ActiveSync_Abstract
{
    protected $_codePageNumber  = 20;
    
    protected $_codePageName    = 'ItemOperations';
        
    protected $_tags = array(     
        'ItemOperations'        => 0x05,
        'Fetch'                 => 0x06,
        'Store'                 => 0x07,
        'Options'               => 0x08,
        'Range'                 => 0x09,
        'Total'                 => 0x0a,
        'Properties'            => 0x0b,
        'Data'                  => 0x0c,
        'Status'                => 0x0d,
        'Response'              => 0x0e,
        'Version'               => 0x0f,
        'Schema'                => 0x10,
        'Part'                  => 0x11,
        'EmptyFolderContents'   => 0x12,
        'DeleteSubFolders'      => 0x13
    );
}
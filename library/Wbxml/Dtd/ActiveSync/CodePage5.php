<?php
/**
 * Tine 2.0
 *
 * @package     Wbxml
 * @subpackage  ActiveSync
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2008-2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Lars Kneschke <l.kneschke@metaways.de>
 * @version     $Id: CodePage5.php,v 1.1 2009/12/08 23:15:02 hyokos Exp $
 */

/**
 * class documentation
 *
 * @package     Wbxml
 * @subpackage  ActiveSync
 */
 
class Wbxml_Dtd_ActiveSync_CodePage5 extends Wbxml_Dtd_ActiveSync_Abstract
{
    protected $_codePageNumber  = 5;
    
    protected $_codePageName    = 'Move';
        
    protected $_tags = array(     
        'Moves'                   => 0x05,
        'Move'                    => 0x06,
        'SrcMsgId'                => 0x07,
        'SrcFldId'                => 0x08,
        'DstFldId'                => 0x09,
        'Response'                => 0x0a,
        'Status'                  => 0x0b,
        'DstMsgId'                => 0x0c
    );
}
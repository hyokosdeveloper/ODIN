<?php
/**
 * Tine 2.0
 *
 * @package     Wbxml
 * @subpackage  Syncml
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2008-2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Lars Kneschke <l.kneschke@metaways.de>
 * @version     $Id: Syncml.php,v 1.1 2010/04/13 21:51:16 hyokos Exp $
 */

/**
 * class documentation
 *
 * @package     Wbxml
 * @subpackage  Syncml
 */

class Wbxml_Dtd_Syncml
{
    /**
     * factory function to return a selected contacts backend class
     *
     * @param string $type
     * @return Addressbook_Backend_Interface
     */
    static public function factory ($_type)
    {
        switch ($_type) {
            case 'syncml:syncml1.1':
            case 'syncml:syncml1.2':
            case 'syncml:metinf1.1':
            case 'syncml:metinf1.2':
            case 'syncml:devinf1.1':
            case 'syncml:devinf1.2':
                throw new Exception('unsupported DTD: ' . $_type);
                break;
        }
        return $instance;
    }
}    

<?php
/**
 * Addressbook Ods generation class
 *
 * @package     Addressbook
 * @subpackage	Export
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2010 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: Ods.php,v 1.1 2010/04/13 21:27:28 hyokos Exp $
 * 
 */

/**
 * Addressbook Ods generation class
 * 
 * @package     Addressbook
 * @subpackage	Export
 * 
 */
class Addressbook_Export_Ods extends Tinebase_Export_Ods
{
    /**
     * @var string application of this export class
     */
    protected $_applicationName = 'Addressbook';

    /**
     * default export definition name
     * 
     * @var string
     */
    protected $_defaultExportname = 'adb_default_ods';
}

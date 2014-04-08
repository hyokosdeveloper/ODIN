<?php
/**
 * Tine 2.0
 *
 * @package     Tinebase
 * @subpackage  Setup
 * @license     http://www.gnu.org/licenses/agpl.html AGPL3
 * @copyright   Copyright (c) 2010 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @version     $Id: Release3.php,v 1.1 2010/04/13 21:27:29 hyokos Exp $
 */

class Crm_Setup_Update_Release3 extends Setup_Update_Abstract
{
    /**
     * update from 3.0 -> 3.1
     * - add new xls export definition
     * 
     * @return void
     */
    public function update_0()
    {
        // get import export definitions and save them in db
        Setup_Controller::getInstance()->createImportExportDefinitions(Tinebase_Application::getInstance()->getApplicationByName('Crm'));
        
        $this->setApplicationVersion('Crm', '3.1');
    }
}

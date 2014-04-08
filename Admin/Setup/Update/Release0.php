<?php
/**
 * Tine 2.0
 *
 * @package     Admin
 * @license     http://www.gnu.org/licenses/agpl.html AGPL3
 * @copyright   Copyright (c) 2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @version     $Id: Release0.php,v 1.1 2010/04/13 21:27:31 hyokos Exp $
 */

class Admin_Setup_Update_Release0 extends Setup_Update_Abstract
{
    /**
     * update to 2.0
     * @return void
     */
    public function update_1()
    {
        $this->setApplicationVersion('Admin', '2.0');
    }
}

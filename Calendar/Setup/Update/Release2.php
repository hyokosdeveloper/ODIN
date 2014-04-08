<?php
/**
 * Tine 2.0
 *
 * @package     Calendar
 * @license     http://www.gnu.org/licenses/agpl.html AGPL3
 * @copyright   Copyright (c) 2010 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @version     $Id: Release2.php,v 1.1 2010/04/13 21:27:29 hyokos Exp $
 */

class Calendar_Setup_Update_Release2 extends Setup_Update_Abstract
{
    /**
     * update to version 3.0
     */
    public function update_0()
    {
        $this->setApplicationVersion('Calendar', '3.0');
    }
}

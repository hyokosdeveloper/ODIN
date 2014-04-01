<?php
/**
 * Tine 2.0
 *
 * @package     Admin
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @version     $Id: ChangePassword.php,v 1.1 2009/12/08 23:15:27 hyokos Exp $
 */

/**
 * event class for change password
 *
 * @package     Admin
 */
class Admin_Event_ChangePassword extends Tinebase_Event_Abstract
{
    /**
     * the user id
     *
     * @var string
     */
    public $userId;

    /**
     * the new password
     *
     * @var string
     */
    public $password;
}

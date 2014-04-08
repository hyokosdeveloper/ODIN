<?php
/**
 * Tine 2.0
 *
 * @package     Admin
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Lars Kneschke <l.kneschke@metaways.de>
 * @version     $Id: UpdateAccount.php,v 1.1 2010/04/13 21:27:27 hyokos Exp $
 */

/**
 * event class for updated account
 *
 * @package     Admin
 */
class Admin_Event_UpdateAccount extends Tinebase_Event_Abstract
{
    /**
     * the just added account
     *
     * @var Tinebase_Model_FullUser
     */
    public $account;
}
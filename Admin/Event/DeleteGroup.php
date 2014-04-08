<?php
/**
 * Tine 2.0
 *
 * @package     Admin
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Lars Kneschke <l.kneschke@metaways.de>
 * @version     $Id: DeleteGroup.php,v 1.1 2010/04/13 21:27:27 hyokos Exp $
 */

/**
 * event class for deleted groups
 *
 * @package     Admin
 */
class Admin_Event_DeleteGroup extends Tinebase_Event_Abstract
{
    /**
     * array of groupids
     *
     * @var array
     */
    public $groupIds;

}

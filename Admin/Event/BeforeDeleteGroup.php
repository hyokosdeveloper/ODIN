<?php
/**
 * Tine 2.0
 *
 * @package     Admin
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @version     $Id: BeforeDeleteGroup.php,v 1.1 2010/04/13 21:27:27 hyokos Exp $
 */

/**
 * event class for deleted groups (this is fired before the deletion)
 *
 * @package     Admin
 */
class Admin_Event_BeforeDeleteGroup extends Tinebase_Event_Abstract
{
    /**
     * array of groupids
     *
     * @var array
     */
    public $groupIds;

}

<?php
/**
 * Tine 2.0
 *
 * @package     Timetracker
 * @subpackage  Backend
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2008-2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: Timeaccount.php,v 1.1 2010/04/13 21:56:29 hyokos Exp $
 */


/**
 * backend for Timeaccounts
 *
 * @package     Timetracker
 * @subpackage  Backend
 */
class Timetracker_Backend_Timeaccount extends Tinebase_Backend_Sql_Abstract
{
    /**
     * Table name without prefix
     *
     * @var string
     */
    protected $_tableName = 'timetracker_timeaccount';
    
    /**
     * Model name
     *
     * @var string
     */
    protected $_modelName = 'Timetracker_Model_Timeaccount';

    /**
     * if modlog is active, we add 'is_deleted = 0' to select object in _getSelect()
     *
     * @var boolean
     */
    protected $_modlogActive = TRUE;
}

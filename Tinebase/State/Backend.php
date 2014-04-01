<?php
/**
 * Tine 2.0
 *
 * @package     Tinebase
 * @subpackage  State
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: Backend.php,v 1.1 2009/12/08 23:16:35 hyokos Exp $
 * 
 * @todo        could be replaced by a 'non-abstract' Tinebase_Backend_Sql_Abstract
 */

/**
 * backend for State
 *
 * @package     Tinebase
 * @subpackage  State
 */
class Tinebase_State_Backend extends Tinebase_Backend_Sql_Abstract
{
    /**************************** backend settings *********************************/
    
    /**
     * Table name without prefix
     *
     * @var string
     */
    protected $_tableName = 'state';
    
    /**
     * Model name
     *
     * @var string
     */
    protected $_modelName = 'Tinebase_Model_State';
}

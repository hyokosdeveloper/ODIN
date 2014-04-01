<?php
/**
 * Tine 2.0
 *
 * @package     Tinebase
 * @subpackage  Container
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: Backend.php,v 1.1 2009/12/08 23:15:41 hyokos Exp $
 * 
 * @todo        move some (backend-)functionality from Tinebase_Container to this class
 */

/**
 * backend for Container
 *
 * @package     Tinebase
 * @subpackage  Container
 */
class Tinebase_Container_Backend extends Tinebase_Backend_Sql_Abstract
{
    /**************************** backend settings *********************************/
    
    /**
     * Table name without prefix
     *
     * @var string
     */
    protected $_tableName = 'container';
    
    /**
     * Model name
     *
     * @var string
     */
    protected $_modelName = 'Tinebase_Model_Container';
    
    /**
     * if modlog is active, we add 'is_deleted = 0' to select object in _getSelect()
     *
     * @var boolean
     */
    protected $_modlogActive = TRUE;    
}

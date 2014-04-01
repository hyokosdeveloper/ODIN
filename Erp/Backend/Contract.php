<?php
/**
 * Tine 2.0
 *
 * @package     Erp
 * @subpackage  Backend
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2007-2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: Contract.php,v 1.1 2009/12/08 23:16:42 hyokos Exp $
 */


/**
 * backend for contracts
 *
 * @package     Erp
 * @subpackage  Backend
 */
class Erp_Backend_Contract extends Tinebase_Backend_Sql_Abstract
{
    /**
     * Table name without prefix
     *
     * @var string
     */
    protected $_tableName = 'erp_contracts';
    
    /**
     * Model name
     *
     * @var string
     */
    protected $_modelName = 'Erp_Model_Contract';
}

<?php
/**
 * Tine 2.0
 * 
 * @package     Tinebase
 * @subpackage  Filter
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @version     $Id: Text.php,v 1.1 2009/12/08 23:15:39 hyokos Exp $
 */

/**
 * Tinebase_Model_Filter_Text
 * 
 * @package     Tinebase
 * @subpackage  Filter
 * 
 * filters one filterstring in one property
 */
class Tinebase_Model_Filter_Text extends Tinebase_Model_Filter_Abstract
{
    /**
     * @var array list of allowed operators
     */
    protected $_operators = array(
        0 => 'equals',
        1 => 'contains',
        2 => 'startswith',
        3 => 'endswith',
        4 => 'not',
        5 => 'in',
        6 => 'isnull',
        7 => 'notnull'
    );
    
    /**
     * @var array maps abstract operators to sql operators
     */
    protected $_opSqlMap = array(
        'equals'     => array('sqlop' => ' LIKE ?',      'wildcards' => '?'  ),
        'contains'   => array('sqlop' => ' LIKE ?',      'wildcards' => '%?%'),
        'startswith' => array('sqlop' => ' LIKE ?',      'wildcards' => '?%' ),
        'endswith'   => array('sqlop' => ' LIKE ?',      'wildcards' => '%?' ),
        'not'        => array('sqlop' => ' NOT LIKE ?',  'wildcards' => '?'  ),
        'in'         => array('sqlop' => ' IN (?)',      'wildcards' => '?'  ),
        'isnull'     => array('sqlop' => ' IS NULL',     'wildcards' => '?'  ),
        'notnull'    => array('sqlop' => ' IS NOT NULL', 'wildcards' => '?'  ),
    );
    
    /**
     * appends sql to given select statement
     *
     * @param  Zend_Db_Select                $_select
     * @param  Tinebase_Backend_Sql_Abstract $_backend
     * @throws Tinebase_Exception_NotFound
     */
     public function appendFilterSql($_select, $_backend)
     {
         $action = $this->_opSqlMap[$this->_operator];
         
         // quote field identifier
         $field = $this->_getQuotedFieldName($_backend);
         
         // replace wildcards from user
         $value = str_replace(array('*', '_'), array('%', '\_'), $this->_value);
         
         // add wildcard to value according to operator
         $value = str_replace('?', $value, $action['wildcards']);
         
         $where = Tinebase_Core::getDb()->quoteInto($field . $action['sqlop'], $value);
         
         if ($this->_operator == 'not') {
             $where = "( $where OR $field IS NULL)";
         }
         
         // finally append query to select object
         $_select->where($where);
     }
}
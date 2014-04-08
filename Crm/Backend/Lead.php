<?php
/**
 * Tine 2.0
 *
 * @package     Crm
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2007-2010 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: Lead.php,v 1.1 2010/04/13 21:27:32 hyokos Exp $
 * 
 */


/**
 * backend for leads
 *
 * @package     Crm
 */
class Crm_Backend_Lead extends Tinebase_Backend_Sql_Abstract
{
    /**
     * the constructor
     *
     * @param Zend_Db_Adapter_Abstract $_db optional
     * @param string $_modelName
     * @param string $_tableName
     * @param string $_tablePrefix
     *
     */
    public function __construct ($_dbAdapter = NULL, $_modelName = NULL, $_tableName = NULL, $_tablePrefix = NULL)
    {
        parent::__construct($_dbAdapter, 'Crm_Model_Lead', 'metacrm_lead', $_tablePrefix);
        
        $this->_modlogActive = TRUE;
    }

    /**
     * getGroupCountForField
     * 
     * @param $_filter
     * @param $_field
     * @return unknown_type
     * 
     * @todo generalize
     */
    public function getGroupCountForField($_filter, $_field)
    {     
        $select = $this->_db->select();
        
        if ($this->_modlogActive) {
            // don't fetch deleted objects
            $select->where($this->_db->quoteIdentifier($this->_tableName . '.is_deleted') . ' = 0');                        
        }
                
        $select->from(array($this->_tableName => $this->_tablePrefix . $this->_tableName), array(
            $_field             => $_field,
            'count'             => 'COUNT(' . $_field . ')',
        ));
        $select->group($_field);
        $this->_addFilter($select, $_filter);
        
        $stmt = $this->_db->query($select);
        $rows = (array)$stmt->fetchAll(Zend_Db::FETCH_ASSOC);

        $result = array();
        foreach ($rows as $row) {
            $result[$row[$_field]] = $row['count'];
        }
        
        return $result;
    }

    /**
     * get the basic select object to fetch records from the database
     *  
     * @param array|string|Zend_Db_Expr $_cols columns to get, * per default
     * @param boolean $_getDeleted get deleted records (if modlog is active)
     * @return Zend_Db_Select
     */
    protected function _getSelect($_cols = '*', $_getDeleted = FALSE)
    {
        $select = parent::_getSelect($_cols, $_getDeleted);
        
        // return probableTurnover (turnover * probability)
        if ($_cols == '*' || array_key_exists('probableTurnover', (array)$_cols)) {
            $select->columns(
                array('probableTurnover' => '(' . $this->_db->quoteIdentifier($this->_tableName . '.turnover') 
                    . '*' . $this->_db->quoteIdentifier($this->_tableName . '.probability') . '*0.01)'
                )
            );
        }
        
        return $select;
    }    
}

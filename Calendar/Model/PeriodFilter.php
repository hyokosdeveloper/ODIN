<?php
/**
 * Tine 2.0
 * 
 * @package     Calendar
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: PeriodFilter.php,v 1.1 2009/12/08 23:15:24 hyokos Exp $
 *
 */

/**
 * filters for events in the given period
 * 
 * 
 * @package     Calendar
 * @todo: period should filter [start, end[ at the moment its ]start, end[
 */
class Calendar_Model_PeriodFilter extends Tinebase_Model_Filter_Abstract 
{
    /**
     * @var array list of allowed operators
     */
    protected $_operators = array(
        0 => 'within',
    );
    
    /**
     * @var string
     */
    protected $_from = NULL;
    
    /**
     * @var string
     */
    protected $_until = NULL;
    
    /**
     * returns from datetime
     *
     * @return Zend_Date
     */
    public function getFrom()
    {
        return new Zend_Date($this->_from, Tinebase_Record_Abstract::ISO8601LONG);
    }
    
    /**
     * returns until datetime
     *
     * @return Zend_Date
     */
    public function getUntil()
    {
        return new Zend_Date($this->_until, Tinebase_Record_Abstract::ISO8601LONG);
    }
    
    /**
     * sets value
     *
     * @param mixed $_value
     */
    public function setValue($_value)
    {
        if (is_array($_value) && (isset($_value['from']) && isset($_value['until']))) {
            $from = $_value['from'] instanceof Zend_Date ? $_value['from']->get(Tinebase_Record_Abstract::ISO8601LONG) : $_value['from'];
            $until = $_value['until'] instanceof Zend_Date ? $_value['until']->get(Tinebase_Record_Abstract::ISO8601LONG) : $_value['until'];
            
            $this->_from = $this->_convertStringToUTC($from);
            $this->_until = $this->_convertStringToUTC($until);
        } else {
            throw new Tinebase_Exception_UnexpectedValue('Period must be an array with from and until properties');
        }
    }
    
    /**
     * appends sql to given select statement
     *
     * @param  Zend_Db_Select                    $_select
     * @param  Tinebase_Backend_Sql_Abstract     $_backend
     */
    public function appendFilterSql($_select, $_backend)
    {
        $filter = new Calendar_Model_EventFilter(array(
            array('condition' => Tinebase_Model_Filter_FilterGroup::CONDITION_AND, 'filters' => array(
               array('field' => 'rrule', 'operator' => 'isnull',  'value' => NULL),
               array('field' => 'dtstart', 'operator' => 'before',  'value' => $this->_until),
               array('field' => 'dtend',   'operator' => 'after',   'value' => $this->_from),
            )),
            array('condition' => Tinebase_Model_Filter_FilterGroup::CONDITION_AND, 'filters' => array(
                array('field' => 'rrule',        'operator' => 'notnull', 'value' => NULL),
                array('field' => 'dtstart',      'operator' => 'before',  'value' => $this->_until),
                array('condition' => Tinebase_Model_Filter_FilterGroup::CONDITION_OR, 'filters' => array(
                    array('field' => 'rrule_until',  'operator' => 'after',   'value' => $this->_from),
                    array('field' => 'rrule_until',  'operator' => 'isnull',  'value' => NULL),
                )),
            ))
        ), Tinebase_Model_Filter_FilterGroup::CONDITION_OR);
        
        Tinebase_Backend_Sql_Filter_FilterGroup::appendFilters($_select, $filter, $_backend);
    }
}
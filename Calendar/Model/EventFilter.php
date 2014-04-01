<?php
/**
 * Tine 2.0
 * 
 * @package     Calendar
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: EventFilter.php,v 1.1 2009/12/08 23:15:24 hyokos Exp $
 *
 */

/**
 * Calendar Event Filter
 * 
 * @package Calendar
 */
class Calendar_Model_EventFilter extends Tinebase_Model_Filter_FilterGroup 
{
    /**
     * @var string application of this filter group
     */
    protected $_applicationName = 'Calendar';
    
    /**
     * @var string class name of this filter group
     *      this is needed to overcome the static late binding
     *      limitation in php < 5.3
     */
    protected $_className = 'Calendar_Model_EventFilter';
    
    /**
     * @var array filter model fieldName => definition
     */
    protected $_filterModel = array(
        'id'                    => array('filter' => 'Tinebase_Model_Filter_Id'),
        'uid'                   => array('filter' => 'Tinebase_Model_Filter_Text'),
        'container_id'          => array('filter' => 'Calendar_Model_EventAclFilter', 'options' => array('applicationName' => 'Calendar')),
        'query'                 => array('filter' => 'Tinebase_Model_Filter_Query', 'options' => array('fields' => array('summary', 'description'))),
        'period'                => array('filter' => 'Calendar_Model_PeriodFilter'),
        //'class_id'            => array('filter' => 'Tinebase_Model_Filter_Text'),
        //'status'              => array('filter' => 'Tinebase_Model_Filter_Text'),
        'tag'                   => array('filter' => 'Tinebase_Model_Filter_Tag', 'options' => array('idProperty' => 'cal_events.id')),
    
        // NOTE using dtdstart and dtend filters may not lead to the desired result. 
        //      you need to use the period filter to filter for events in a given period
        'dtstart'               => array('filter' => 'Tinebase_Model_Filter_DateTime'),
        'dtend'                 => array('filter' => 'Tinebase_Model_Filter_DateTime'),
        'rrule'                 => array('filter' => 'Tinebase_Model_Filter_Text'),
        'recurid'               => array('filter' => 'Tinebase_Model_Filter_Text'),
        'rrule_until'           => array('filter' => 'Tinebase_Model_Filter_DateTime'),
        'last_modified_time'    => array('filter' => 'Tinebase_Model_Filter_DateTime'),
        'summary'               => array('filter' => 'Tinebase_Model_Filter_Text'),
        'location'              => array('filter' => 'Tinebase_Model_Filter_Text'),
    );
}
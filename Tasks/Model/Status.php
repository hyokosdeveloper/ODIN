<?php
/**
 * Tine 2.0
 * 
 * @package     Tasks
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: Status.php,v 1.1 2009/12/08 23:15:17 hyokos Exp $
 *
 */

/**
 * Task-Status Record Class
 * @package Tasks
 */
class Tasks_Model_Status extends Tinebase_Record_Abstract
{
	/**
     * key in $_validators/$_properties array for the filed which 
     * represents the identifier
     * 
     * @var string
     */
    protected $_identifier = 'id';
    
    /**
     * application the record belongs to
     *
     * @var string
     */
    protected $_application = 'Tasks';
    
    /**
     * zend validators
     *
     * @var array
     */
    protected $_validators = array(
        'id'                   => array('allowEmpty' => true,  'Int' ),
        'created_by'           => array('allowEmpty' => true,        ),
        'creation_time'        => array('allowEmpty' => true         ),
        'last_modified_by'     => array('allowEmpty' => true         ),
        'last_modified_time'   => array('allowEmpty' => true         ),
        'is_deleted'           => array('allowEmpty' => true         ),
        'deleted_time'         => array('allowEmpty' => true         ),
        'deleted_by'           => array('allowEmpty' => true         ),
        'status_name'          => array('allowEmpty' => false        ),
        'status_is_open'       => array('allowEmpty' => false, 'Int' ),
        'status_icon'          => array('allowEmpty' => true         ),
    );
    
    /**
     * datetime fields
     *
     * @var array
     */
    protected $_datetimeFields = array(
        'creation_time',
        'last_modified_time',
        'deleted_time',
    );
    
    /**
     * fields to translate
     *
     * @var array
     */
    protected $_toTranslate = array(
        'status_name'
    );    
}

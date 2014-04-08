<?php
/**
 * Tine 2.0
 * 
 * @package     Tinebase
 * @subpackage  Record
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @version     $Id: AsyncJob.php,v 1.1 2010/04/13 21:55:51 hyokos Exp $
 * 
 */

/**
 * class Tinebase_Model_AsyncJob
 * 
 * @package     Tinebase
 * @subpackage  Record
 */
class Tinebase_Model_AsyncJob extends Tinebase_Record_Abstract 
{
    /**
     * pending status
     *
     */
    const STATUS_RUNNING = 'running';
    
    /**
     * failure status
     *
     */
    const STATUS_FAILURE = 'failure';

    /**
     * success status
     *
     */
    const STATUS_SUCCESS = 'success';

    /**
     * identifier field name
     *
     * @var string
     */
    protected $_identifier = 'id';
    
    /**
     * application the record belongs to
     *
     * @var string
     */
    protected $_application = 'Tinebase';
    
    /**
     * record validators
     *
     * @var array
     */
    protected $_validators = array(
        'id'                => array('allowEmpty' => TRUE),
        'name'              => array('presence' => 'required'),
        'start_time'        => array('presence' => 'required'),
        'end_time'          => array('allowEmpty' => TRUE),
        'status'            => array('presence' => 'required', 'allowEmpty' => FALSE, 'InArray' => array(
            self::STATUS_RUNNING, 
            self::STATUS_FAILURE, 
            self::STATUS_SUCCESS,
        )),
        'message'           => array('allowEmpty' => TRUE),
    );
    
    /**
     * datetime fields
     *
     * @var array
     */
    protected $_datetimeFields = array(
        'start_time',
        'end_time',
    );
}

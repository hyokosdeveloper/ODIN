<?php
/**
 * Tine 2.0
 * 
 * @package     Tinebase
 * @subpackage  Record
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @version     $Id: TempFile.php,v 1.1 2009/12/08 23:13:05 hyokos Exp $
 */

/**
 * class Tinebase_Model_TempFile
 * 
 * @package     Tinebase
 * @subpackage  Record
 */
class Tinebase_Model_TempFile extends Tinebase_Record_Abstract 
{

    protected $_identifier = 'id';
    
    /**
     * application the record belongs to
     *
     * @var string
     */
    protected $_application = 'Tinebase';
    
    protected $_validators = array(
        'id'         => array('presence' => 'required', 'allowEmpty' => false, 'Alnum' ),
        'session_id' => array('allowEmpty' => false, 'Alnum' ),
        'time'       => array('allowEmpty' => false),
        'path'       => array('allowEmpty' => false),
        'name'       => array('allowEmpty' => false),
        'type'       => array('allowEmpty' => false),
        'error'      => array('allowEmpty' => false, 'Int'),
        'size'       => array('allowEmpty' => false, 'Int')
    );
    
    protected $_datetimeFields = array(
        'time'
    );
} // end of Tinebase_Model_TempFile

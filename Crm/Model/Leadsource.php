<?php
/**
 * class to hold option data
 * 
 * @package     Crm
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Thomas Wadewitz <t.wadewitz@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: Leadsource.php,v 1.1 2009/12/08 23:14:26 hyokos Exp $
 *
 */

/**
 * class to hold option / lead source data
 * 
 * @package     Crm
 */
class Crm_Model_Leadsource extends Tinebase_Record_Abstract
{
    /**
     * key in $_validators/$_properties array for the field which 
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
    protected $_application = 'Crm';
    
    /**
     * list of zend inputfilter
     * 
     * this filter get used when validating user generated content with Zend_Input_Filter
     *
     * @var array
     */
    protected $_filters = array(
        'leadsource'    => 'StringTrim'
    );
    
    /**
     * list of zend validator
     * 
     * this validators get used when validating user generated content with Zend_Input_Filter
     *
     * @var array
     */
    protected $_validators = array(
        'id'            => array(Zend_Filter_Input::ALLOW_EMPTY => true, Zend_Filter_Input::DEFAULT_VALUE => NULL),
        'leadsource'    => array(Zend_Filter_Input::ALLOW_EMPTY => false, 'presence' => 'required')
    );
    
    /**
     * fields to translate
     *
     * @var array
     */
    protected $_toTranslate = array(
        'leadsource'
    );    
}
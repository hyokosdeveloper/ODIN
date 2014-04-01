<?php
/**
 * Tine 2.0
 * 
 * @package     Addressbook
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Lars Kneschke <l.kneschke@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: Contact.php,v 1.1 2009/12/08 23:15:22 hyokos Exp $
 *
 * @todo        rename some fields (modified, ...)
 * @todo        add relations as contact attribute
 */

/**
 * class to hold contact data
 * 
 * @package     Addressbook
 */
class Addressbook_Model_Contact extends Tinebase_Record_Abstract
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
    protected $_application = 'Addressbook';
    
    /**
     * list of zend inputfilter
     * 
     * this filter get used when validating user generated content with Zend_Input_Filter
     *
     * @var array
     */
    protected $_filters = array(
        //'*'                   => 'StringTrim',
        'adr_one_countryname'   => array('StringTrim', 'StringToUpper'),
        'adr_two_countryname'   => array('StringTrim', 'StringToUpper'),
        'email'                 => array('StringTrim', 'StringToLower'),
        'email_home'            => array('StringTrim', 'StringToLower'),
        'url'                   => array('StringTrim', 'StringToLower'),
        'url_home'              => array('StringTrim', 'StringToLower'),
    );
    
    /**
     * list of zend validator
     * 
     * this validators get used when validating user generated content with Zend_Input_Filter
     *
     * @var array
     */
    protected $_validators = array(
        'created_by'            => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'creation_time'         => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'last_modified_by'      => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'last_modified_time'    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'is_deleted'            => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'deleted_time'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'deleted_by'            => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'adr_one_countryname'   => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'adr_one_locality'      => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'adr_one_postalcode'    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'adr_one_region'        => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'adr_one_street'        => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'adr_one_street2'       => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'adr_two_countryname'   => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'adr_two_locality'      => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'adr_two_postalcode'    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'adr_two_region'        => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'adr_two_street'        => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'adr_two_street2'       => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'assistent'             => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'bday'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'calendar_uri'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
 /*       'email'     => array(
            array(
                'Regex', 
                '/^[^0-9][a-z0-9_]+([.][a-z0-9_]+)*[@][a-z0-9_]+([.][a-z0-9_]+)*[.][a-z]{2,4}$/'
            ), 
            Zend_Filter_Input::ALLOW_EMPTY => true
        ),
        'email_home'     => array(
            array(
                'Regex', 
                '/^[^0-9][a-z0-9_]+([.][a-z0-9_]+)*[@][a-z0-9_]+([.][a-z0-9_]+)*[.][a-z]{2,4}$/'
            ), 
            Zend_Filter_Input::ALLOW_EMPTY => true
        ),*/
        'email'                 => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'email_home'            => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'jpegphoto'             => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'freebusy_uri'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'id'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true, Zend_Filter_Input::DEFAULT_VALUE => NULL),
        'account_id'            => array(Zend_Filter_Input::ALLOW_EMPTY => true, Zend_Filter_Input::DEFAULT_VALUE => NULL),
        'note'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'container_id'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'role'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'salutation_id'         => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'title'                 => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'url'                   => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'url_home'              => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'n_family'              => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'n_fileas'              => array(Zend_Filter_Input::ALLOW_EMPTY => false, 'presence'=>'required'),
        'n_fn'                  => array(Zend_Filter_Input::ALLOW_EMPTY => false, 'presence'=>'required'),
        'n_given'               => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'n_middle'              => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'n_prefix'              => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'n_suffix'              => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'org_name'              => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'org_unit'              => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'pubkey'                => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'room'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'tel_assistent'         => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'tel_car'               => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'tel_cell'              => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'tel_cell_private'      => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'tel_fax'               => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'tel_fax_home'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'tel_home'              => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'tel_pager'             => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'tel_work'              => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'tags'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'tz'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'notes'                 => array(Zend_Filter_Input::ALLOW_EMPTY => true)
    );
    
    /**
     * name of fields containing datetime or or an array of datetime information
     *
     * @var array list of datetime fields
     */
    protected $_datetimeFields = array(
        'bday',
        'creation_time',
        'last_modified_time',
        'deleted_time'
    );
    
    /**
     * returns prefered email address of given contact
     * 
     * @return string
     */
    public function getPreferedEmailAddress()
    {
        // prefer work mail over private mail till we have prefs for this
        return $this->email ? $this->email : $this->email_home;
    }
    
    /**
     * sets the record related properties from user generated input.
     * 
     * Input-filtering and validation by Zend_Filter_Input can enabled and disabled
     *
     * @param array $_data the new data to set
     * @param bool $_bypassFilters enabled/disable validation of data. set to NULL to use state set by the constructor 
     */
    public function setFromArray(array $_data)
    {
        if (!isset($_data['n_family']) && !isset($_data['org_name'])) {
            $_data['org_name'] = '';
        }
        
        // always update fileas and fn
        $_data['n_fileas'] = (!empty($_data['n_family'])) ? $_data['n_family'] : $_data['org_name'];
        if (!empty($_data['n_given'])) {
            $_data['n_fileas'] .= ', ' . $_data['n_given'];
        }
            
        $_data['n_fn'] = (!empty($_data['n_family'])) ? $_data['n_family'] : $_data['org_name'];
        if (!empty($_data['n_given'])) {
            $_data['n_fn'] = $_data['n_given'] . ' ' . $_data['n_fn'];
        }
        
        parent::setFromArray($_data);
    }
    
    /**
     * converts a int, string or Addressbook_Model_Contact to an contact id
     *
     * @param   int|string|Addressbook_Model_Contact $_contactId the contact id to convert
     * @return  int
     * @throws  UnexpectedValueException if no contact id set or 0 
     */
    static public function convertContactIdToInt($_contactId)
    {
        if ($_contactId instanceof Addressbook_Model_Contact) {
            if (empty($_contactId->id)) {
                throw new UnexpectedValueException('No contact id set.');
            }
            $id = (string) $_contactId->id;
        } else {
            $id = (string) $_contactId;
        }
        
        if ($id == '') {
            throw new UnexpectedValueException('Contact id can not be 0.');
        }
        
        return $id;
    }
    
    /**
     * fills a contact from json data
     *
     * @todo timezone conversion for birthdays?
     * @param string $_data json encoded data
     * @return void
     * 
     * @todo check in calling functions where these tags/notes/container arrays are coming from and get down to the root of the trouble    
     */
    public function setFromJson($_data)
    {
        $contactData = Zend_Json::decode($_data);
        
        if (isset($contactData['jpegphoto'])) {
            if ($contactData['jpegphoto'] != '') {
                $imageParams = Tinebase_ImageHelper::parseImageLink($contactData['jpegphoto']);
                if ($imageParams['isNewImage']) {
                    $contactData['jpegphoto'] = Tinebase_ImageHelper::getImageData($imageParams);
                } else {
                    unset($contactData['jpegphoto']);
                }
            }
        }
        
        // unset if empty
        if (empty($contactData['id'])) {
            unset($contactData['id']);
        }
        
        // sanitize container id / container_id
        if (isset($contactData['container_id']) && is_array($contactData['container_id'])) {
            $contactData['container_id'] = $contactData['container_id']['id'];
        }        
        
        $this->setFromArray($contactData);
        return;
    }
    
}
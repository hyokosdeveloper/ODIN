<?php
/**
 * Tine 2.0
 *
 * @package     Addressbook
 * @subpackage  Frontend
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Lars Kneschke <l.kneschke@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: Json.php,v 1.1 2009/12/08 23:16:36 hyokos Exp $
 *
 * @todo        use functions from Tinebase_Frontend_Json_Abstract
 *              -> get/save/getAll
 * @todo        remove deprecated functions afterwards
 */

/**
 * backend class for Zend_Json_Server
 *
 * This class handles all Json requests for the addressbook application
 *
 * @package     Addressbook
 * @subpackage  Frontend
 * @todo        handle timezone management
 */
class Addressbook_Frontend_Json extends Tinebase_Frontend_Json_Abstract
{
    protected $_applicationName = 'Addressbook';
    
    /****************************************** get contacts *************************************/

    /**
     * get one contact identified by contactId
     *
     * @param int $contactId
     * @return array
     */
    public function getContact($contactId)
    {
        $result = array();
               
        $contact = Addressbook_Controller_Contact::getInstance()->get($contactId);
        $result = $this->_contactToJson($contact);
        
        return $result;
        //return $this->_get($contactId, Addressbook_Controller_Contact::getInstance());
    }
    
    /**
     * Search for contacts matching given arguments
     *
     * @param string $filter json encoded
     * @param string $paging json encoded
     * @return array
     */
    public function searchContacts($filter, $paging)
    {
        return $this->_search($filter, $paging, Addressbook_Controller_Contact::getInstance(), 'Addressbook_Model_ContactFilter');
    }    

    /****************************************** save / delete contacts ****************************/
    
    /**
     * delete multiple contacts
     *
     * @param array $ids list of contactId's to delete
     * @return array
     */
    public function deleteContacts($ids)
    {
        return $this->_delete($ids, Addressbook_Controller_Contact::getInstance());
    }
    
    /**
     * save one contact
     *
     * if $contactData['id'] is empty the contact gets added, otherwise it gets updated
     *
     * @param string $contactData a JSON encoded array of contact properties
     * @return array
     */
    public function saveContact($contactData)
    {
        $contact = new Addressbook_Model_Contact();
        $contact->setFromJsonInUsersTimezone($contactData);
        
        if (empty($contact->id)) {
            $contact = Addressbook_Controller_Contact::getInstance()->create($contact);
        } else {
            $contact = Addressbook_Controller_Contact::getInstance()->update($contact);
        }
        
        $result =  $this->getContact($contact->getId());
        return $result;
    }
    
    /****************************************** get salutations ****************************/
    
    /**
     * get salutations
     *
     * @return array
     * @todo   use _getAll() from Tinebase_Frontend_Json_Abstract
     */
   public function getSalutations()
    {
         $result = array(
            'results'     => array(),
            'totalcount'  => 0
        );
        
        if($rows = Addressbook_Controller_Salutation::getInstance()->getSalutations()) {
            $rows->translate();
            $result['results']      = $rows->toArray();
            $result['totalcount']   = count($result['results']);
        }

        return $result;
    }  
    
    /****************************************** helper functions ***********************************/
    
    /**
     * returns multiple records prepared for json transport
     *
     * @param Tinebase_Record_RecordSet $_leads Crm_Model_Lead
     * @return array data
     */
    protected function _multipleRecordsToJson(Tinebase_Record_RecordSet $_records)
    {
        $result = parent::_multipleRecordsToJson($_records);
        
        foreach ($result as &$contact) {
            $contact['jpegphoto'] = $this->_getImageLink($contact);
        }
        
        return $result;
    }
    

    /**
     * returns contact prepared for json transport
     *
     * @param Addressbook_Model_Contact $_contact
     * @return array contact data
     * 
     * @deprecated
     */
    protected function _contactToJson($_contact)
    {   
        $_contact->setTimezone(Tinebase_Core::get('userTimeZone'));
        $result = $_contact->toArray();
        
        $result['container_id'] = Tinebase_Container::getInstance()->getContainerById($_contact->container_id)->toArray();
        $result['container_id']['account_grants'] = Tinebase_Container::getInstance()->getGrantsOfAccount(Tinebase_Core::get('currentAccount'), $_contact->container_id)->toArray();
        
        $result['jpegphoto'] = $this->_getImageLink($_contact);
        
        return $result;
    }

    

    /**
     * returns a image link
     * 
     * @param  Addressbook_Model_Contact|array
     * @return string
     */
    protected function _getImageLink($contact)
    {
        if (!empty($contact->jpegphoto)) {
            $link =  'index.php?method=Tinebase.getImage&application=Addressbook&location=&id=' . $contact['id'] . '&width=90&height=90&ratiomode=0';
        } else {
            $link = 'images/empty_photo.png';
        }
        return $link;
    }

    /**
     * Returns registry data of addressbook.
     * @see Tinebase_Application_Json_Abstract
     * 
     * @return mixed array 'variable name' => 'data'
     */
    public function getRegistryData()
    {   
        $registryData = array(
            'Salutations' => $this->getSalutations(),
        );        
        return $registryData;    
    }
}
<?php
/**
 * Tine 2.0
 *
 * @package     Addressbook
 * @subpackage  Controller
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Lars Kneschke <l.kneschke@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: Contact.php,v 1.1 2009/12/08 23:16:42 hyokos Exp $
 * 
 */

/**
 * contact controller for Addressbook
 *
 * @package     Addressbook
 * @subpackage  Controller
 */
class Addressbook_Controller_Contact extends Tinebase_Controller_Record_Abstract
{
    /**
     * the constructor
     *
     * don't use the constructor. use the singleton 
     */
    private function __construct() {
        $this->_applicationName = 'Addressbook';
        $this->_modelName = 'Addressbook_Model_Contact';
        $this->_backend = Addressbook_Backend_Factory::factory(Addressbook_Backend_Factory::SQL);
        $this->_currentAccount = Tinebase_Core::getUser();
        $this->_purgeRecords = FALSE;
    }
    
    /**
     * don't clone. Use the singleton.
     *
     */
    private function __clone() 
    {        
    }
    
    /**
     * holds the instance of the singleton
     *
     * @var Addressbook_Controller_Contact
     */
    private static $_instance = NULL;
    
    /**
     * the singleton pattern
     *
     * @return Addressbook_Controller_Contact
     */
    public static function getInstance() 
    {
        if (self::$_instance === NULL) {
            self::$_instance = new Addressbook_Controller_Contact();
        }
        
        return self::$_instance;
    }
    
    /**
     * gets binary contactImage
     *
     * @param int $_contactId
     * @return blob
     */
    public function getImage($_contactId) {
        // ensure user has rights to see image
        $this->get($_contactId);
        
        $image = $this->_backend->getImage($_contactId);
        return $image;
    }
    
    /****************************** overwritten functions ************************/
    
    /**
     * delete one record
     * - don't delete if it belongs to an user account
     *
     * @param Tinebase_Record_Interface $_record
     * @throws Addressbook_Exception_AccessDenied
     */
    protected function _deleteRecord(Tinebase_Record_Interface $_record)
    {
        if (!empty($_record->account_id)) {
            throw new Addressbook_Exception_AccessDenied('It is not allowed to delete a contact linked to an user account!');
        }
        
        parent::_deleteRecord($_record);
    }
    
    /****************************** public functions ************************/
            
    /**
     * fetch one contact identified by $_userId
     *
     * @param   int $_userId
     * @return  Addressbook_Model_Contact
     * @throws  Addressbook_Exception_AccessDenied if user has no read grant
     */
    public function getContactByUserId($_userId)
    {
        $contact = $this->_backend->getByUserId($_userId);
        if (!$this->_currentAccount->hasGrant($contact->container_id, Tinebase_Model_Container::GRANT_READ)) {
            throw new Addressbook_Exception_AccessDenied('read access to contact denied');
        }            
        return $contact;            
    }    
}

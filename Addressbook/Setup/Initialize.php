<?php
/**
 * Tine 2.0
  * 
 * @package     Addressbook
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Jonas Fischer <j.fischer@metaways.de>
 * @copyright   Copyright (c) 2008-2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: Initialize.php,v 1.1 2010/04/13 21:27:25 hyokos Exp $
 *
 */

/**
 * class for Addressbook initialization
 * 
 * @todo move {@see _createInitialAdminAccount} to a better place (resolve dependency from addressbook)
 * 
 * @package Addressbook
 */
class Addressbook_Setup_Initialize extends Setup_Initialize
{

    /**
     * Override method: Setup needs additional initialisation
     * 
     * @see tine20/Setup/Setup_Initialize#_initialize($_application)
     */
    public function _initialize(Tinebase_Model_Application $_application, $_options = null)
    {
        $initialAdminUserOptions = $this->_parseInitialAdminUserOptions($_options);
        Tinebase_User::getInstance()->importUsers($initialAdminUserOptions); //import users(ldap)/create initial users(sql)
        Tinebase_Group::getInstance()->importGroupMembers(); //import groups members(ldap)

        parent::_initialize($_application, $_options);
    }
    /**
     * Override method because this app requires special rights
     * @see tine20/Setup/Setup_Initialize#_createInitialRights($_application)
     * 
     */
    protected function _createInitialRights(Tinebase_Model_Application $_application)
    {
        parent::_createInitialRights($_application);

        $groupsBackend = Tinebase_Group::factory(Tinebase_Group::SQL);
        $adminGroup = $groupsBackend->getDefaultAdminGroup();
        
        // give anyone read rights to the internal addressbook
        // give Adminstrators group read/edit/admin rights to the internal addressbook
        $internalAddressbook = Tinebase_Container::getInstance()->getContainerByName('Addressbook', 'Internal Contacts', Tinebase_Model_Container::TYPE_INTERNAL);
        //Tinebase_Container::getInstance()->addGrants($internalAddressbook, Tinebase_Acl_Rights::ACCOUNT_TYPE_GROUP, $userGroup, array(
        Tinebase_Container::getInstance()->addGrants($internalAddressbook, Tinebase_Acl_Rights::ACCOUNT_TYPE_ANYONE, '0', array(
            Tinebase_Model_Grants::GRANT_READ
        ), TRUE);
        Tinebase_Container::getInstance()->addGrants($internalAddressbook, Tinebase_Acl_Rights::ACCOUNT_TYPE_GROUP, $adminGroup, array(
            Tinebase_Model_Grants::GRANT_READ,
            Tinebase_Model_Grants::GRANT_EDIT,
            Tinebase_Model_Grants::GRANT_ADMIN
        ), TRUE);               
    }
    
    /**
     * Extract default group name settings from {@param $_options}
     * 
     * @param array $_options
     * @return array
     */
    protected function _parseInitialAdminUserOptions($_options)
    {
        $result = array();
        $accounts = isset($_options['authenticationData']['authentication'][Tinebase_User::getConfiguredBackend()]) ? $_options['authenticationData']['authentication'][Tinebase_User::getConfiguredBackend()] : array();
        $keys = array('adminLoginName', 'adminPassword');
        foreach ($keys as $key) {
            if (isset($_options[$key])) {
                $result[$key] = $_options[$key];
            } elseif (isset($accounts[$key])) {
                $result[$key] = $accounts[$key];
            }
        }
        return $result;
    }

}
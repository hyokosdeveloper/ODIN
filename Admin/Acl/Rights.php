<?php
/**
 * Tine 2.0
 * 
 * @package     Admin
 * @subpackage  Acl
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2007-2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @version     $Id: Rights.php,v 1.1 2010/04/13 21:27:29 hyokos Exp $
 * 
 */

/**
 * this class handles the rights for the admin application
 * 
 * a right is always specific to an application and not to a record
 * examples for rights are: admin, run
 * 
 * to add a new right you have to do these 3 steps:
 * - add a constant for the right
 * - add the constant to the $addRights in getAllApplicationRights() function
 * . add getText identifier in getTranslatedRightDescriptions() function
 * 
 * @package     Tinebase
 * @subpackage  Acl
 */
class Admin_Acl_Rights extends Tinebase_Acl_Rights_Abstract
{
    /**
     * the right to manage roles
     * @staticvar string
     */
    const MANAGE_ACCESS_LOG = 'manage_access_log';
    
    /**
     * the right to manage accounts
     * @staticvar string
     */
    const MANAGE_ACCOUNTS = 'manage_accounts';
    
   /**
     * the right to manage applications
     * @staticvar string
     */
    const MANAGE_APPS = 'manage_apps';
    
    /**
     * the right to manage shared tags
     * @staticvar string
     */
    const MANAGE_SHARED_TAGS = 'manage_shared_tags';
   
    /**
     * the right to manage roles
     * @staticvar string
     */
    const MANAGE_ROLES = 'manage_roles';
    
    /**
     * the right to manage roles
     * @staticvar string
     */
    const MANAGE_COMPUTERS = 'manage_computers';
    
    /**
     * the right to view roles
     * @staticvar string
     */
    const VIEW_ACCESS_LOG = 'view_access_log';
    
    /**
     * the right to view accounts
     * @staticvar string
     */
    const VIEW_ACCOUNTS = 'view_accounts';
    
    /**
     * the right to view applications
     * @staticvar string
     */
    const VIEW_APPS = 'view_apps';
    
    /**
     * the right to view roles
     * @staticvar string
     */
    const VIEW_ROLES = 'view_roles';
    
    /**
     * the right to manage roles
     * @staticvar string
     */
    const VIEW_COMPUTERS = 'view_computers';
    
    /**
     * holds the instance of the singleton
     *
     * @var Admin_Acl_Rights
     */
    private static $_instance = NULL;
    
    /**
     * the clone function
     *
     * disabled. use the singleton
     */
    private function __clone() 
    {
        
    }
    
    /**
     * the constructor
     *
     */
    private function __construct()
    {
        
    }    
    
    /**
     * the singleton pattern
     *
     * @return Admin_Acl_Rights
     */
    public static function getInstance() 
    {
        if (self::$_instance === NULL) {
            self::$_instance = new Admin_Acl_Rights;
        }
        
        return self::$_instance;
    }
    
    /**
     * get all possible application rights
     *
     * @return  array   all application rights
     */
    public function getAllApplicationRights()
    {
        $allRights = parent::getAllApplicationRights();
        
        $addRights = array (
            self::MANAGE_ACCESS_LOG, 
            self::MANAGE_ACCOUNTS,
            self::MANAGE_APPS, 
            self::MANAGE_SHARED_TAGS,
            self::MANAGE_ROLES,
            self::MANAGE_COMPUTERS,
            self::VIEW_ACCESS_LOG,
            self::VIEW_ACCOUNTS,
            self::VIEW_APPS, 
            self::VIEW_ROLES,
            self::VIEW_COMPUTERS
        );
        $allRights = array_merge($allRights, $addRights);
        
        return $allRights;
    }

    /**
     * get translated right descriptions
     * 
     * @return  array with translated descriptions for this applications rights
     */
    private function getTranslatedRightDescriptions()
    {
        $translate = Tinebase_Translation::getTranslation('Admin');
        
        $rightDescriptions = array(
            self::MANAGE_ACCESS_LOG   => array(
                'text'          => $translate->_('manage access log'),
                'description'   => $translate->_('delete access log entries'),
            ),
            self::MANAGE_ACCOUNTS   => array(
                'text'          => $translate->_('manage accounts'),
                'description'   => $translate->_('add and edit users and groups, add group members, change user passwords'),
            ),
            self::MANAGE_APPS   => array(
                'text'          => $translate->_('manage applications'),
                'description'   => $translate->_('enable and disable applications, edit application settings'),
            ),
            self::MANAGE_ROLES  => array(
                'text'          => $translate->_('manage roles'),
                'description'   => $translate->_('add and edit roles, add new members to roles, add application rights to roles'),
            ),
            self::MANAGE_SHARED_TAGS    => array(
                'text'          => $translate->_('manage shared tags'),
                'description'   => $translate->_('add, delete and edit shared tags'),
            ),
            self::MANAGE_COMPUTERS => array(
                'text'          => $translate->_('manage computers'),
                'description'   => $translate->_('add, delete and edit (samba) computers'),
            ),
            self::VIEW_ACCESS_LOG   => array(
                'text'          => $translate->_('view access log'),
                'description'   => $translate->_('view access log list'),
            ),
            self::VIEW_ACCOUNTS   => array(
                'text'          => $translate->_('view accounts'),
                'description'   => $translate->_('view accounts list and details'),
            ),
            self::VIEW_APPS   => array(
                'text'          => $translate->_('view applications'),
                'description'   => $translate->_('view applications list and details'),
            ),
            self::VIEW_ROLES  => array(
                'text'          => $translate->_('view roles'),
                'description'   => $translate->_('view roles list and details'),
            ),
            self::VIEW_COMPUTERS  => array(
                'text'          => $translate->_('view computers'),
                'description'   => $translate->_('view computers list and details'),
            ),
        );
        
        return $rightDescriptions;
    }

    /**
     * get right description
     * 
     * @param   string right
     * @return  array with text + description
     */
    public function getRightDescription($_right)
    {        
        $result = parent::getRightDescription($_right);
        
        $rightDescriptions = self::getTranslatedRightDescriptions();
        
        if ( isset($rightDescriptions[$_right]) ) {
            $result = $rightDescriptions[$_right];
        }

        return $result;
    }
    
}

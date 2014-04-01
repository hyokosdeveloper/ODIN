<?php
/**
 * Tine 2.0
 * 
 * @package     Tasks
 * @subpackage  Controller
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: Task.php,v 1.1 2009/12/08 23:16:36 hyokos Exp $
 *
 */

/**
 * Tasks Controller for Tasks
 * 
 * The Tasks 2.0 Controller manages access (acl) to the different backends and supports
 * a common interface to the servers/views
 * 
 * @package Tasks
 * @subpackage  Controller
 */
class Tasks_Controller_Task extends Tinebase_Controller_Record_Abstract implements Tinebase_Controller_Alarm_Interface
{
    /**
     * the constructor
     *
     * don't use the constructor. use the singleton 
     */
    private function __construct() {
        $this->_applicationName = 'Tasks';
        $this->_modelName = 'Tasks_Model_Task';
        $this->_backend = Tasks_Backend_Factory::factory(Tasks_Backend_Factory::SQL);
        $this->_currentAccount = Tinebase_Core::getUser();
    }

    /**
     * don't clone. Use the singleton.
     *
     */
    private function __clone() 
    {        
    }

    /**
     * holds self
     * @var Tasks_Controller_Task
     */
    private static $_instance = NULL;
    
    /**
     * holds backend instance
     * (only sql atm.)
     *
     * @var Tasks_Backend_Sql
     */
    protected $_backend;
    
    /**
     * singleton
     *
     * @return Tasks_Controller_Task
     */
    public static function getInstance() 
    {
        if (self::$_instance === NULL) {
            self::$_instance = new Tasks_Controller_Task();
        }
        return self::$_instance;
    }
    
    /****************************** overwritten functions ************************/

    /**
     * add one record
     *
     * @param   Tinebase_Record_Interface $_record
     * @return  Tinebase_Record_Interface
     * @throws  Tinebase_Exception_AccessDenied
     * @throws  Tinebase_Exception_Record_Validation
     */
    public function create(Tinebase_Record_Interface $_task)
    {
        if(empty($_task->class_id)) {
            $_task->class_id = NULL;
        }
        $this->_handleCompletedDate($_task);
        return parent::create($_task);
    }
    
    /**
     * update one record
     *
     * @param   Tinebase_Record_Interface $_record
     * @return  Tinebase_Record_Interface
     * @throws  Tinebase_Exception_AccessDenied
     * @throws  Tinebase_Exception_Record_Validation
     */
    public function update(Tinebase_Record_Interface $_task)
    {
        $this->_handleCompletedDate($_task);
        return parent::update($_task);
    }
    
    /**
     * handles completed date
     * 
     * @param Tasks_Model_Task $_task
     */
    protected function _handleCompletedDate($_task)
    {
        $allStatus = Tasks_Controller_Status::getInstance()->getAllStatus();
        
        $statusId = $allStatus->getIndexById($_task->status_id);
        
        if (is_int($statusId)){
            $status = $allStatus[$statusId];
            
            if($status->status_is_open) {
                $_task->completed = NULL;
            } elseif (! $_task->completed instanceof Zend_Date) {
                $_task->completed = Zend_Date::now();
            }
        }
    }

    /**
     * send an alarm (to responsible person and if it does not exist, to creator)
     *
     * @param  Tinebase_Model_Alarm $_alarm
     * @return void
     */
    public function sendAlarm(Tinebase_Model_Alarm $_alarm) 
    {
        Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ 
            . " About to send alarm " . print_r($_alarm->toArray(), TRUE)
        );

        $task = $this->get($_alarm->record_id);
        
        if ($task->organizer) {
            $organizerContact = Addressbook_Controller_Contact::getInstance()->getContactByUserId($task->organizer);
        } else {
            // use creator as organizer
            $organizerContact = Addressbook_Controller_Contact::getInstance()->getContactByUserId($task->created_by);
        }
        
        // create message
        $translate = Tinebase_Translation::getTranslation($this->_applicationName);
        $messageSubject = $translate->_('Notification for Task ' . $task->summary);
        $messageBody = $task->getNotificationMessage();
        
        $notificationsBackend = Tinebase_Notification_Factory::getBackend(Tinebase_Notification_Factory::SMTP);
        
        // send message
        if ($organizerContact->email && ! empty($organizerContact->email)) {
            Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' Trying to send alarm email to ' . $organizerContact->email);
            $notificationsBackend->send(NULL, $organizerContact, $messageSubject, $messageBody);
        } else {
            Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' Organizer has no email address.');
        }
    }
}

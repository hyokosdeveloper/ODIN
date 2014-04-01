<?php
/**
 * Timesheet controller for Timetracker application
 * 
 * @package     Timetracker
 * @subpackage  Controller
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: Timesheet.php,v 1.1 2009/12/08 23:16:36 hyokos Exp $
 */

/**
 * Timesheet controller class for Timetracker application
 * 
 * @package     Timetracker
 * @subpackage  Controller
 */
class Timetracker_Controller_Timesheet extends Tinebase_Controller_Record_Abstract
{
    /**
     * the constructor
     *
     * don't use the constructor. use the singleton 
     */
    private function __construct() {        
        $this->_applicationName = 'Timetracker';
        $this->_backend = new Timetracker_Backend_Timesheet();
        $this->_modelName = 'Timetracker_Model_Timesheet';
        $this->_currentAccount = Tinebase_Core::getUser();   
        
        // disable container ACL checks as we don't init the 'Shared Timesheets' grants in the setup
        $this->_doContainerACLChecks = FALSE; 
        
        // use modlog and don't completely delete records
        $this->_purgeRecords = FALSE;
    }    
    
    /**
     * field grants for specific timesheet fields
     *
     * @var array
     */
    protected $_fieldGrants = array(
        'is_billable' => array('default' => 1,  'requiredGrant' => Timetracker_Model_TimeaccountGrants::MANAGE_BILLABLE),
        'billed_in'   => array('default' => '', 'requiredGrant' => Timetracker_Model_TimeaccountGrants::MANAGE_ALL),
        'is_cleared'  => array('default' => 0,  'requiredGrant' => Timetracker_Model_TimeaccountGrants::MANAGE_ALL),
    );
    
    /**
     * holds the instance of the singleton
     *
     * @var Timetracker_Controller_Timesheet
     */
    private static $_instance = NULL;
    
    /**
     * the singleton pattern
     *
     * @return Timetracker_Controller_Timesheet
     */
    public static function getInstance() 
    {
        if (self::$_instance === NULL) {
            self::$_instance = new Timetracker_Controller_Timesheet();
        }
        
        return self::$_instance;
    }        

    /****************************** functions ************************/

    /**
     * get all timesheets for a timeaccount
     *
     * @param string $_timeaccountId
     * @return Tinebase_Record_RecordSet of Timetracker_Model_Timesheet records
     */
    public function getTimesheetsByTimeaccountId($_timeaccountId)
    {
        $filter = new Timetracker_Model_TimesheetFilter(array(
            array('field' => 'timeaccount_id', 'operator' => 'AND', 'value' => array(
                array('field' => 'id', 'operator' => 'equals', 'value' => $_timeaccountId),
            ))           
        ));
        
        $records = $this->search($filter);
        
        return $records;
    }
    
    /****************************** overwritten functions ************************/    
            
    /**
     * check grant for action
     *
     * @param Timetracker_Model_Timeaccount $_record
     * @param string $_action
     * @param boolean $_throw
     * @param string $_errorMessage
     * @param Timetracker_Model_Timesheet $_oldRecord
     * @return boolean
     * @throws Tinebase_Exception_AccessDenied
     */
    protected function _checkGrant($_record, $_action, $_throw = TRUE, $_errorMessage = 'No Permission.', $_oldRecord = NULL)
    {
        // users with MANAGE_TIMEACCOUNTS have all grants here
        if ( $this->checkRight(Timetracker_Acl_Rights::MANAGE_TIMEACCOUNTS, FALSE)
             || Timetracker_Model_TimeaccountGrants::hasGrant($_record->timeaccount_id, Timetracker_Model_TimeaccountGrants::MANAGE_ALL)) {
            return TRUE;
        }
        
        //Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' action: ' . print_r($_action, true));
        
        // only TA managers are allowed to alter TS of closed TAs
        if ($_action != 'get') {
            $timeaccount = Timetracker_Controller_Timeaccount::getInstance()->get($_record->timeaccount_id);
            if (! $timeaccount->is_open) {
                return FALSE;
            }
            
            // check if timeaccount->is_billable is false => set default in fieldGrants to 0 and allow only managers to change it
            if (!$timeaccount->is_billable) {
                $this->_fieldGrants['is_billable']['default'] = 0;
                $this->_fieldGrants['is_billable']['requiredGrant'] = Timetracker_Model_TimeaccountGrants::MANAGE_ALL;
                //Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' ' . print_r($this->_fieldGrants, true));
            }
        }
        
        $hasGrant = FALSE;
        
        switch ($_action) {
            case 'get':
                $hasGrant = (
                    Timetracker_Model_TimeaccountGrants::hasGrant($_record->timeaccount_id, Timetracker_Model_TimeaccountGrants::VIEW_ALL)
                    || (Timetracker_Model_TimeaccountGrants::hasGrant($_record->timeaccount_id, Timetracker_Model_TimeaccountGrants::BOOK_OWN)
                        && $_record->account_id == $this->_currentAccount->getId()
                    )
                    || Timetracker_Model_TimeaccountGrants::hasGrant($_record->timeaccount_id, Timetracker_Model_TimeaccountGrants::BOOK_ALL) 
                    );
                break;
            case 'create':
                $hasGrant = (
                    (Timetracker_Model_TimeaccountGrants::hasGrant($_record->timeaccount_id, Timetracker_Model_TimeaccountGrants::BOOK_OWN)
                        && $_record->account_id == $this->_currentAccount->getId()
                    )
                    || Timetracker_Model_TimeaccountGrants::hasGrant($_record->timeaccount_id, Timetracker_Model_TimeaccountGrants::BOOK_ALL) 
                );
                
                // check field grants
                foreach ($this->_fieldGrants as $field => $config) {
                    if (isset($_record->$field) && $_record->$field != $config['default']) {
                        $hasGrant &= Timetracker_Model_TimeaccountGrants::hasGrant($_record->timeaccount_id, $config['requiredGrant']);
                    }
                }

                break;
            case 'update':
                $hasGrant = (
                    (Timetracker_Model_TimeaccountGrants::hasGrant($_record->timeaccount_id, Timetracker_Model_TimeaccountGrants::BOOK_OWN)
                        && $_record->account_id == $this->_currentAccount->getId())
                    || Timetracker_Model_TimeaccountGrants::hasGrant($_record->timeaccount_id, Timetracker_Model_TimeaccountGrants::BOOK_ALL) 
                );
                
                // check field grants
                foreach ($this->_fieldGrants as $field => $config) {
                    if (isset($_record->$field) && $_record->$field != $_oldRecord->$field) {
                        $hasGrant &= Timetracker_Model_TimeaccountGrants::hasGrant($_record->timeaccount_id, $config['requiredGrant']);
                    }
                }

                break;
            case 'delete':
                $hasGrant = (
                    (Timetracker_Model_TimeaccountGrants::hasGrant($_record->timeaccount_id, Timetracker_Model_TimeaccountGrants::BOOK_OWN)
                        && $_record->account_id == $this->_currentAccount->getId()
                    )
                    || Timetracker_Model_TimeaccountGrants::hasGrant($_record->timeaccount_id, Timetracker_Model_TimeaccountGrants::BOOK_ALL) 
                );
                break;
        }
        
        if ($_throw && !$hasGrant) {
            throw new Tinebase_Exception_AccessDenied($_errorMessage);
        }
        
        return $hasGrant;
    }
    
    /**
     * Removes timeaccounts where current user has no access to
     * 
     * @param Tinebase_Model_Filter_FilterGroup $_filter
     * @param string $_action get|update
     */
    protected function _checkFilterACL(/*Tinebase_Model_Filter_FilterGroup*/ $_filter, $_action = 'get')
    {
        switch ($_action) {
            case 'get':
                $_filter->setRequiredGrants(array(
                    Timetracker_Model_TimeaccountGrants::BOOK_OWN,
                    Timetracker_Model_TimeaccountGrants::BOOK_ALL,
                    Timetracker_Model_TimeaccountGrants::VIEW_ALL,
                    Timetracker_Model_TimeaccountGrants::MANAGE_ALL,
                ));
                break;
            case 'update':
                $_filter->setRequiredGrants(array(
                    Timetracker_Model_TimeaccountGrants::BOOK_OWN,
                    Timetracker_Model_TimeaccountGrants::BOOK_ALL,
                    Timetracker_Model_TimeaccountGrants::MANAGE_ALL,
                ));
                break;
            default:
                throw new Timetracker_Exception_UnexpectedValue('Unknown action: ' . $_action);
        }
    }     
}

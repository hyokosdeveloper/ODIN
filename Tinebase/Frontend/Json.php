<?php
/**
 * Tine 2.0
 * 
 * @package     Tinebase
 * @subpackage  Server
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2007-2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Lars Kneschke <l.kneschke@metaways.de>
 * @version     $Id: Json.php,v 1.1 2009/12/08 23:15:29 hyokos Exp $
 * 
 */

/**
 * Json interface to Tinebase
 * 
 * @package     Tinebase
 * @subpackage  Server
 */
class Tinebase_Frontend_Json extends Tinebase_Frontend_Json_Abstract
{
    /**
     * wait for changes
     *
     */
	public function ping()
	{
	    Zend_Session::writeClose(true);
	    sleep(10);
	    return array('changes' => 'contacts');
	}
	
    /**
     * get list of translated country names
     * 
     * Wrapper for {@see Tinebase_Core::getCountrylist}
     * 
     *
     * @return array list of countrys
     */
    public function getCountryList()
    {
        return Tinebase_Translation::getCountryList();
    }

    /**
     * returns list of all available translations
     * NOTE available are those, having a Tinebase translation
     * 
     * @return array list of all available translations
     */
    public function getAvailableTranslations()
    {
        $availableTranslations = Tinebase_Translation::getAvailableTranslations();
        return array(
            'results'    => $availableTranslations,
            'totalcount' => count($availableTranslations)
        );
    }
    
    /**
     * sets locale
     *
     * @param  string $localeString
     * @param  bool   $saveaspreference
     * @param  bool   $setcookie
     * @return array
     */
    public function setLocale($localeString, $saveaspreference, $setcookie)
    {
        Tinebase_Core::setupUserLocale($localeString, $saveaspreference);
        $locale = Tinebase_Core::get('locale');
        
        // save in cookie (expires in 30 days)
        if ($setcookie) {
            setcookie('TINE20LOCALE', $localeString, time()+60*60*24*30);
        }
        
        return array(
            'success'      => TRUE
        );
    }

    /**
     * sets timezone
     *
     * @param  string $timezoneString
     * @param  bool   $saveaspreference
     * @return string
     */
    public function setTimezone($timezoneString, $saveaspreference)
    {
        $timezone = Tinebase_Core::setupUserTimezone($timezoneString, $saveaspreference);
        
        return $timezone;
    }
    
    /**
     * get users
     *
     * @param string $filter
     * @param string $sort
     * @param string $dir
     * @param int $start
     * @param int $limit
     * @return array with results array & totalcount (int)
     */
    public function getUsers($filter, $sort, $dir, $start, $limit)
    {
        $result = array(
            'results'     => array(),
            'totalcount'  => 0
        );
        
        if($rows = Tinebase_User::getInstance()->getUsers($filter, $sort, $dir, $start, $limit)) {
            $result['results']    = $rows->toArray();
            if($start == 0 && count($result['results']) < $limit) {
                $result['totalcount'] = count($result['results']);
            } else {
                //$result['totalcount'] = $backend->getCountByAddressbookId($addressbookId, $filter);
            }
        }
        
        return $result;
    }
    
    /**
     * get list of groups
     *
     * @param string $_filter
     * @param string $_sort
     * @param string $_dir
     * @param int $_start
     * @param int $_limit
     * @return array with results array & totalcount (int)
     */
    public function getGroups($filter, $sort, $dir, $start, $limit)
    {
        $result = array(
            'results'     => array(),
            'totalcount'  => 0
        );
        
        $groups = Tinebase_Group::getInstance()->getGroups($filter, $sort, $dir, $start, $limit);

        $result['results'] = $groups->toArray();
        $result['totalcount'] = count($groups);
        
        return $result;
    }
    
    /**
     * change password of user 
     *
     * @param string $oldPassword the old password
     * @param string $newPassword the new password
     * @return array
     */
    public function changePassword($oldPassword, $newPassword)
    {
        $response = array(
            'success'      => TRUE
        );
        
        try {
            Tinebase_Controller::getInstance()->changePassword($oldPassword, $newPassword, $newPassword);
        } catch (Tinebase_Exception $e) {
            $response = array(
                'success'      => FALSE,
                'errorMessage' => "New password could not be set! Error: " . $e->getMessage()
            );   
        }
        
        return $response;        
    }    
    
    /**
     * adds a new personal tag
     */
    public function saveTag($tag)
    {
        $tagData = Zend_Json::decode($tag);
        $inTag = new Tinebase_Model_Tag($tagData);
        
        if (strlen($inTag->getId()) < 40) {
            Tinebase_Core::getLogger()->debug('creating tag: ' . print_r($inTag->toArray(), true));
            $outTag = Tinebase_Tags::getInstance()->createTag($inTag);
        } else {
            Tinebase_Core::getLogger()->debug('updating tag: ' .print_r($inTag->toArray(), true));
            $outTag = Tinebase_Tags::getInstance()->updateTag($inTag);
        }
        return $outTag->toArray();
    }
    
    /**
     * search tags
     *
     * @param string $filter json encoded filter array
     * @param string $paging json encoded pagination info
     * @return array
     */
    public function searchTags($filter, $paging)
    {
        $filter = new Tinebase_Model_TagFilter(Zend_Json::decode($filter));
        $paging = new Tinebase_Model_Pagination(Zend_Json::decode($paging));
        
        return array(
            'results'    => Tinebase_Tags::getInstance()->searchTags($filter, $paging)->toArray(),
            'totalCount' => Tinebase_Tags::getInstance()->getSearchTagsCount($filter)
        );
    }
    
    /**
     * search / get notes
     * - used by activities grid
     *
     * @param string $filter json encoded filter array
     * @param string $paging json encoded pagination info
     */
    public function searchNotes($filter, $paging)
    {
        $filter = new Tinebase_Model_NoteFilter(Zend_Json::decode($filter));
        $paging = new Tinebase_Model_Pagination(Zend_Json::decode($paging));
        
        $records = Tinebase_Notes::getInstance()->searchNotes($filter, $paging);
        $result = $this->_multipleRecordsToJson($records);
        
        return array(
            'results'       => $result,
            'totalcount'    => Tinebase_Notes::getInstance()->searchNotesCount($filter)
        );        
    }
    
    /**
     * get note types
     *
     */
    public function getNoteTypes()
    {
        $noteTypes = Tinebase_Notes::getInstance()->getNoteTypes();
        $noteTypes->translate();
        
        return array(
            'results'       => $noteTypes->toArray(),
            'totalcount'    => count($noteTypes)
        );        
    }
    
    /**
     * deletes tags identified by an array of identifiers
     * 
     * @param  array $ids
     * @return array 
     */
    public function deleteTags($ids)
    {
        Tinebase_Tags::getInstance()->deleteTags(Zend_Json::decode($ids));
        return array('success' => true);
    }
    
    /**
     * authenticate user by username and password
     *
     * @param string $username the username
     * @param string $password the password
     * @return array
     */
    public function login($username, $password)
    {
        // try to login user
        $success = (Tinebase_Controller::getInstance()->login($username, $password, $_SERVER['REMOTE_ADDR']) === TRUE); 
        
        if ($success) {
            $response = array(
				'success'       => TRUE,
                'account'       => Tinebase_Core::getUser()->getPublicUser()->toArray(),
				'jsonKey'       => Tinebase_Core::get('jsonKey'),
                'welcomeMessage' => "Welcome to Tine 2.0!"
            );
            
            if (Tinebase_Core::isRegistered(Tinebase_Core::USERCREDENTIALCACHE)) {
                $cacheId = Tinebase_Core::get(Tinebase_Core::USERCREDENTIALCACHE)->getCacheId();
                setcookie('usercredentialcache', base64_encode(Zend_Json::encode($cacheId)));
            } else {
                Tinebase_Core::getLogger()->warn(__METHOD__ . '::' . __LINE__ . ' Something went wrong with the CredentialCache / no CC registered.');
                $success = FALSE;
            }
        
        }

        if (! $success) {
            
            // reset credentials cache
            setcookie('usercredentialcache');
            
            $response = array(
				'success'      => FALSE,
				'errorMessage' => "Wrong username or password!"
			);
        }

        return $response;
    }

    /**
     * destroy session
     *
     * @return array
     */
    public function logout()
    {
        Tinebase_Controller::getInstance()->logout($_SERVER['REMOTE_ADDR']);
        
        setcookie('usercredentialcache');
        $result = array(
			'success'=> true,
        );

        return $result;
    }
    
    /**
     * Returns registry data of tinebase.
     * @see Tinebase_Application_Json_Abstract
     * 
     * @return mixed array 'variable name' => 'data'
     */
    public function getRegistryData()
    {
        $locale = Tinebase_Core::get('locale');
        
        // default credentials
        if(isset(Tinebase_Core::getConfig()->login)) {
            $loginConfig = Tinebase_Core::getConfig()->login;
            $defaultUsername = (isset($loginConfig->username)) ? $loginConfig->username : '';
            $defaultPassword = (isset($loginConfig->password)) ? $loginConfig->password : '';
        } else {
            $defaultUsername = '';
            $defaultPassword = '';
        }
        
        $registryData =  array(
            'timeZone'         => Tinebase_Core::get(Tinebase_Core::USERTIMEZONE),
            'locale'           => array(
                'locale'   => $locale->toString(), 
                'language' => $locale->getLanguageTranslation($locale->getLanguage()),
                'region'   => $locale->getCountryTranslation($locale->getRegion()),
            ),
            'version'          => array(
                'buildType'     => TINE20_BUILDTYPE,
                'codeName'      => TINE20_CODENAME,
                'packageString' => TINE20_PACKAGESTRING,
                'releaseTime'   => TINE20_RELEASETIME
            ),
            'defaultUsername' => $defaultUsername,
            'defaultPassword' => $defaultPassword
        );
        
        if (Tinebase_Core::isRegistered(Tinebase_Core::USER)) {
            $registryData += array(    
                'currentAccount'   => Tinebase_Core::getUser()->toArray(),
                'accountBackend'   => Tinebase_User::getConfiguredBackend(),
                'jsonKey'          => Tinebase_Core::get('jsonKey'),
                'userApplications' => Tinebase_Core::getUser()->getApplications()->toArray(),
                'NoteTypes'        => $this->getNoteTypes(),
                'CountryList'      => $this->getCountryList(),
                'stateInfo'        => Tinebase_State::getInstance()->loadStateInfo(),
                'changepw'         => (isset(Tinebase_Core::getConfig()->accounts)
                                        && isset(Tinebase_Core::getConfig()->accounts->changepw))
                                            ? Tinebase_Core::getConfig()->accounts->changepw
                                            : true
            );
        }
        
        return $registryData;
    }
    
    /**
     * Returns registry data of all applications current user has access to
     * @see Tinebase_Application_Json_Abstract
     * 
     * @return mixed array 'variable name' => 'data'
     */
    public function getAllRegistryData()
    {
        $registryData = array();
        
        if (Tinebase_Core::isRegistered(Tinebase_Core::USER)) { 
            $userApplications = Tinebase_Core::getUser()->getApplications(TRUE);
            
            foreach($userApplications as $application) {
                
                $jsonAppName = $application->name . '_Frontend_Json';
                
                if(class_exists($jsonAppName)) {
                    $applicationJson = new $jsonAppName;
                    
                    $registryData[$application->name] = $applicationJson->getRegistryData();
                    $registryData[$application->name]['rights'] = Tinebase_Core::getUser()->getRights($application->name);
                    $registryData[$application->name]['config'] = Tinebase_Config::getInstance()->getConfigForApplication($application);
                    $registryData[$application->name]['customfields'] = Tinebase_Config::getInstance()->getCustomFieldsForApplication($application)->toArray();
                    
                    // add preferences for app
                    $appPrefs =Tinebase_Core::getPreference($application->name);
                    if ($appPrefs !== NULL) {
                        $allPrefs = $appPrefs->getAllApplicationPreferences();
                        foreach($allPrefs as $pref) {
                            $registryData[$application->name]['preferences'][$pref] = $appPrefs->{$pref};
                        }
                    }
                }
            }
        } else {
            $registryData['Tinebase'] = $this->getRegistryData();
        }
        
        Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' returning registry data by dying to avoid servers success property to be part of the registry.');
        die(Zend_Json::encode($registryData));
    }

    /************************ preferences functions ***************************/
    
    /**
     * search preferences
     *
     * @param string $applicationName
     * @param string $filter json encoded
     * @return array
     */
    public function searchPreferencesForApplication($applicationName, $filter)
    {
        $decodedFilter = Zend_Json::decode($filter);
        
        $filter = new Tinebase_Model_PreferenceFilter(array());
        
        if (! empty($decodedFilter)) {
            $filter->setFromArrayInUsersTimezone($decodedFilter);
        }
        
        // make sure account is set in filter
        $userId = Tinebase_Core::getUser()->getId();
        if (! $filter->isFilterSet('account')) {
            $accountFilter = $filter->createFilter('account', 'equals', array(
                'accountId' => $userId, 
                'accountType' => Tinebase_Acl_Rights::ACCOUNT_TYPE_USER
            ));
            $filter->addFilter($accountFilter);
        } else {
            // only admins can search for other users prefs
            $accountFilter = $filter->getAccountFilter();
            $accountFilterValue = $accountFilter->getValue(); 
            if ($accountFilterValue['accountId'] != $userId && $accountFilterValue['accountType'] == Tinebase_Acl_Rights::ACCOUNT_TYPE_USER) {
                if (!Tinebase_Acl_Roles::getInstance()->hasRight($applicationName, Tinebase_Core::getUser()->getId(), Tinebase_Acl_Rights_Abstract::ADMIN)) {
                    return array(
                        'results'       => array(),
                        'totalcount'    => 0
                    );
                }
            }
        }
        
        // check if application has preference class
        if ($backend = Tinebase_Core::getPreference($applicationName)) {
            
            //Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' ' . print_r($filter->toArray(), true));
            
            $paging = new Tinebase_Model_Pagination(array(
                'dir'       => 'ASC',
                'sort'      => array('name')
            ));
            $allPrefs = $backend->search($filter, $paging);
            
            // get single matching preferences for each different pref
            $records = $backend->getMatchingPreferences($allPrefs);
            
            // add default prefs if not already in array
            if (! $filter->isFilterSet('name')) {
                $missingDefaultPrefs = array_diff($backend->getAllApplicationPreferences(), $records->name);
                foreach ($missingDefaultPrefs as $prefName) {
                    $records->addRecord($backend->getPreferenceDefaults($prefName));
                }
            }
            
            //Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' ' . print_r($records->toArray(), true));
            
            $result = $this->_multipleRecordsToJson($records);
            
            // add translated labels and descriptions
            $translations = $backend->getTranslatedPreferences();
            foreach ($result as &$prefArray) {
                if (isset($translations[$prefArray['name']])) {
                    $prefArray = array_merge($prefArray, $translations[$prefArray['name']]);
                } else {
                    $prefArray = array_merge($prefArray, array('label' => $prefArray['name']));
                }
            }
        } else {
            $result = array();
        }
        
        return array(
            'results'       => $result,
            'totalcount'    => count($result)
        );
    }
    
    /**
     * save preferences for application
     *
     * @param string    $data       json encoded preferences data
     * @param bool      $adminMode  submit in admin mode?
     * @return array with the changed prefs
     */
    public function savePreferences($data, $adminMode)
    {
        $decodedData = Zend_Json::decode($data);
        
        //Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' ' . print_r($decodedData, true));
        //Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' ' . print_r($adminMode, true));
        
        $result = array();
        foreach ($decodedData as $applicationName => $data) {
            
            $backend = Tinebase_Core::getPreference($applicationName); 
            
            if (! $backend instanceof Tinebase_Preference_Abstract) {
                Tinebase_Core::getLogger()->warn(__METHOD__ . '::' . __LINE__ . ' No preferences class found for app ' . $applicationName);
                continue;
            }
            
            if ($adminMode == TRUE) {
                // only admins are allowed to update app pref defaults/forced prefs
                if (!Tinebase_Acl_Roles::getInstance()->hasRight($applicationName, Tinebase_Core::getUser()->getId(), Tinebase_Acl_Rights_Abstract::ADMIN)) {
                    throw new Tinebase_Exception_AccessDenied('You are not allowed to change the preference defaults.');
                }
                
                // create prefs that don't exist in the db
                foreach($data as $id => $prefData) {
                    if (preg_match('/^default/', $id)) {
                        $newPref = $backend->getPreferenceDefaults($prefData['name']);
                        $newPref->value = $prefData['value'];
                        $newPref->type = $prefData['type'];
                        unset($newPref->id);
                        $backend->create($newPref);
                        
                        unset($data[$id]);
                    }
                }
                
                // update default/forced preferences
                $records = $backend->getMultiple(array_keys($data));
                foreach ($records as $preference) {
                    $preference->value = $data[$preference->getId()]['value'];
                    $preference->type = $data[$preference->getId()]['type'];
                    $backend->update($preference);
                }
                
            } else {
                //Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' ' . print_r($data, true));

                // set user prefs
                foreach ($data as $name => $value) {
                    $backend->doSpecialJsonFrontendActions($this, $name, $value['value'], $applicationName);
                    $backend->$name = $value['value'];
                    $result[$applicationName][] = array('name' => $name, 'value' => $value['value']);
                }
            }
        }
        
        return array(
            'status'    => 'success',
            'results'   => $result
        );
    }
    
    /************************ protected functions ***************************/
    
    /**
     * returns multiple records prepared for json transport
     *
     * @param Tinebase_Record_RecordSet $_records Tinebase_Record_Abstract
     * @return array data
     */
    protected function _multipleRecordsToJson(Tinebase_Record_RecordSet $_records)
    {
        if (count($_records) == 0) {
            return array();
        }
        
        switch ($_records->getRecordClassName()) {
            case 'Tinebase_Model_Preference':
                // get application name from first record
                $firstPref = $_records->getFirstRecord();
                $app = Tinebase_Application::getInstance()->getApplicationById($firstPref->application_id);
                
                foreach ($_records as $record) {
                    // convert options xml to array
                    $preference = Tinebase_Core::getPreference($app->name);
                    if ($preference) {
                        $preference->convertOptionsToArray($record);
                    } else {
                        throw new Tinebase_Exception_NotFound('No preference class found for app ' . $app->name);
                    }
                }
                break;
        }
        
        $result = parent::_multipleRecordsToJson($_records);
        return $result;
    }
}

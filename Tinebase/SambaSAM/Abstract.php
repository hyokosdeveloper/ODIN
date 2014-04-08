<?php
/**
 * Tine 2.0
 * 
 * @package     Tinebase
 * @subpackage  Samba
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @version     $Id: Abstract.php,v 1.1 2010/04/13 21:55:59 hyokos Exp $
 */

/**
 * abstract class SambaSAM_Abstract
 * 
 * Samba Account Managing
 * 
 * @package Tinebase
 * @subpackage Samba
 */
abstract class Tinebase_SambaSAM_Abstract
{

	/**
     * holds crypt engine
     *
     * @var Crypt_CHAP_MSv1
     */
    protected $_cryptEngine = NULL;
    
    /**
     * get user by id
     *
     * @param   int $_userId
     * @return  Tinebase_Model_SAMUser
     */
    abstract public function getUserById($_userId);
 
    /**
     * adds sam properties for a new user
     *
     * @param  Tinebase_Model_FullUser $_user 
     * @param  Tinebase_Model_SAMUser  $_samUser
     * @return Tinebase_Model_SAMUser
     */
	abstract public function addUser($_user, Tinebase_Model_SAMUser $_samUser);
	
	/**
     * updates sam properties for an existing user
     *
     * @param  Tinebase_Model_FullUser $_user 
     * @param  Tinebase_Model_SAMUser  $_samUser
     * @return Tinebase_Model_SAMUser
     */
	abstract public function updateUser($_user, Tinebase_Model_SAMUser $_samUser);
	
	/**
     * delete sam user
     *
     * @param int $_userId
     */
	abstract public function deleteUser($_userId);

    /**
     * set the password for given user 
     * 
     * @param   Tinebase_Model_FullUser $_user
     * @param   string                  $_password
     * @param   bool                    $_encrypt encrypt password
     * @return  void
     * @throws  Tinebase_Exception_InvalidArgument
     */
    abstract public function setPassword($_user, $_password, $_encrypt = TRUE);

	/**
     * update user status
     *
     * @param   int         $_userId
     * @param   string      $_status
     */
    abstract public function setStatus($_userId, $_status);

	/**
     * adds sam properties to a new group
     *
	 * @param  Tinebase_Model_Group    $_group
     * @return Tinebase_Model_SAMGroup
     */
	abstract public function addGroup($_group);

	/**
	 * updates sam properties on an updated group
	 *
	 * @param  Tinebase_Model_Group    $_group
	 * @return Tinebase_Model_SAMGroup
	 */
	abstract public function updateGroup($_group);

	/**
	 * deletes sam groups
	 * 
	 * @param  array $_groupIds
	 * @return void
	 */
	abstract public function deleteGroups(array $_groupIds);
	
	/**
     * returns crypt engine for NT/LMPasswords
     *
     * @return Crypt_CHAP_MSv1
     */
    protected function _getCryptEngine()
    {
        if (! $this->_cryptEngine) {
            $this->_cryptEngine = new Crypt_CHAP_MSv1();
        }
        
        return $this->_cryptEngine;
    }
    
    /**
     * generates LM password
     *
     * @param  string $_password uncrypted original password
     * @return string LM password
     */        
    protected function _generateLMPassword($_password)
    {
        $lmPassword = strtoupper(bin2hex($this->_getCryptEngine()->lmPasswordHash($_password)));
        
        Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . '  $lmPassword: ' . $lmPassword);
        
        return $lmPassword;
    }
    
    /**
     * generates NT password
     *
     * @param  string $_password uncrypted original password
     * @return string NT password
     */ 
    protected function _generateNTPassword($_password)
    {
        $ntPassword = strtoupper(bin2hex($this->_getCryptEngine()->ntPasswordHash($_password)));
        
        Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . '  $ntPassword: ' . $ntPassword);
        
        return $ntPassword;
    }

}  

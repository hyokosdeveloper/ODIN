<?php
/**
 * Tine 2.0
 * 
 * @package     Tinebase
 * @subpackage  Auth
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Lars Kneschke <l.kneschke@metaways.de>
 * @version     $Id: Sql.php,v 1.1 2010/04/13 21:55:34 hyokos Exp $
 */ 

/**
 * SQL authentication backend
 * 
 * @package     Tinebase
 * @subpackage  Auth 
 */
class Tinebase_Auth_Sql extends Zend_Auth_Adapter_DbTable implements Tinebase_Auth_Interface
{    
    /**
     * authenticate() - defined by Zend_Auth_Adapter_Interface.
     *
     * @throws Zend_Auth_Adapter_Exception if answering the authentication query is impossible
     * @return Zend_Auth_Result
     */
    public function authenticate()
    {
        Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' Trying to authenticate '. $this->_identity);
        
        $result = parent::authenticate();
        
        if($result->isValid()) {
            // username and password are correct, let's do some additional tests
            
            if($this->_resultRow['status'] != 'enabled') {
                Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' Account: '. $this->_identity . ' is disabled');
                // account is disabled
                $authResult['code'] = Zend_Auth_Result::FAILURE_UNCATEGORIZED;
                $authResult['messages'][] = 'Account disabled.';
                return new Zend_Auth_Result($authResult['code'], $result->getIdentity(), $authResult['messages']);
            }
            
            //if(($this->_resultRow['expires_at'] !== NULL) && $this->_resultRow['expires_at'] < Zend_Date::now()->getTimestamp()) {
            if(($this->_resultRow['expires_at'] !== NULL) && Zend_Date::now()->isLater($this->_resultRow['expires_at'])) {
                // account is expired
                Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' Account: '. $this->_identity . ' is expired');
                $authResult['code'] = Zend_Auth_Result::FAILURE_UNCATEGORIZED;
                $authResult['messages'][] = 'Account expired.';
                return new Zend_Auth_Result($authResult['code'], $result->getIdentity(), $authResult['messages']);
            }
            
            Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' Authentication of '. $this->_identity . ' succeeded');
        } else {
            Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' Authentication of '. $this->_identity . ' failed');
        }
        
        return $result;
    }
}
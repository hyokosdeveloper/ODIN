<?php
/**
 * factory class for imap backends
 * 
 * @package     Felamimail
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: ImapFactory.php,v 1.1 2010/04/13 21:27:23 hyokos Exp $
 * 
 */

/**
 * An instance of the imap backendclass should be created using this class
 * 
 * @package     Felamimail
 */
class Felamimail_Backend_ImapFactory
{
    /**
     * backend object instances
     */
    private static $_backends = array();
    
    /**
     * factory function to return a selected account/imap backend class
     *
     * @param   string|Felamimail_Model_Account $_accountId
     * @return  Felamimail_Backend_ImapProxy
     */
    static public function factory($_accountId)
    {
        $accountId = ($_accountId instanceof Felamimail_Model_Account) ? $_accountId->getId() : $_accountId;
        
        if (!isset(self::$_backends[$accountId])) {
            // get imap config from account
            if ($_accountId instanceof Felamimail_Model_Account) {
                $imapConfig = $_accountId->getImapConfig();
            } else {
                $imapConfig = Felamimail_Controller_Account::getInstance()->get($_accountId)->getImapConfig();
            }
            
            // we need to instantiate a new imap backend
            Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ 
                . ' Connecting to server ' . $imapConfig['host'] . ':' . $imapConfig['port'] 
                . ' (' . ((array_key_exists('ssl', $imapConfig)) ? $imapConfig['ssl'] : 'none') . ')'
                . ' with username ' . $imapConfig['user']);
            
            self::$_backends[$accountId] = new Felamimail_Backend_ImapProxy($imapConfig);
        }
        
        return self::$_backends[$accountId];
    }
}    

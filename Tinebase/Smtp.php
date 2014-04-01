<?php
/**
 * Tine 2.0
 * 
 * @package     Tinebase
 * @subpackage  Smtp
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Lars Kneschke <l.kneschke@metaways.de>
 * @version     $Id: Smtp.php,v 1.1 2009/12/08 23:14:27 hyokos Exp $
 */

/**
 * class Tinebase_Smtp
 * 
 * send emails using smtp
 * 
 * @package Tinebase
 * @subpackage Smtp
 */
class Tinebase_Smtp
{
    /**
     * holds the instance of the singleton
     *
     * @var Tinebase_Smtp
     */
    private static $_instance = NULL;
    
    /**
     * the default smtp transport
     *
     * @var Zend_Mail_Transport_Smtp
     */
    protected $_defaultTransport;
    
    /**
     * the constructor
     *
     * don't use the constructor. use the singleton 
     */
    private function __construct() 
    {
        if(isset(Tinebase_Core::getConfig()->smtp)) {
            $config = Tinebase_Core::getConfig()->smtp;
        } else {
            $config = new Zend_Config(array(
                'hostname' => 'localhost', 
                'port' => 25
            ));
        }
        
        $this->_defaultTransport = new Zend_Mail_Transport_Smtp($config->hostname, $config->toArray());
    }
    
    /**
     * don't clone. Use the singleton.
     *
     */
    private function __clone() 
    {   
    }
    
    /**
     * the singleton pattern
     *
     * @return Tinebase_Smtp
     */
    public static function getInstance() 
    {
		if (self::$_instance === NULL) {
            self::$_instance = new Tinebase_Smtp();
        }
        
        return self::$_instance;
    }

    /**
     * send message using default transport or an instance of Zend_Mail_Transport_Abstract
     *
     * @param Zend_Mail $_mail
     * @param Zend_Mail_Transport_Abstract $_transport
     * @return void
     */
    public function sendMessage(Zend_Mail $_mail, $_transport = NULL)
    {
        $transport = $_transport instanceof Zend_Mail_Transport_Abstract ? $_transport : $this->_defaultTransport;
        
        $_mail->addHeader('X-MailGenerator', 'Tine 2.0');
        
        $_mail->send($transport); 
    }
    
    public function sendRawMessage($_mail, $_transport = NULL)
    {
        $transport = $_transport instanceof Zend_Mail_Transport_Abstract ? $_transport : $this->_defaultTransport;
        $connection = $transport->getConnection();
        
        if (!($connection instanceof Zend_Mail_Protocol_Smtp)) {
            // Check if authentication is required and determine required class
            $connectionClass = 'Zend_Mail_Protocol_Smtp';
            if ($this->_auth) {
                $connectionClass .= '_Auth_' . ucwords($this->_auth);
            }
            Zend_Loader::loadClass($connectionClass);
            $this->setConnection(new $connectionClass($this->_host, $this->_port, $this->_config));
            $connection->connect();
            $connection->helo($this->_name);
        } else {
            // Reset connection to ensure reliable transaction
            $connection->rset();
        }
        
        // Set mail return path from sender email address
        $connection->mail($this->_mail->getReturnPath());
        
        // Set recipient forward paths
        foreach ($this->_mail->getRecipients() as $recipient) {
            $connection->rcpt($recipient);
        }
        
        // Issue DATA command to client
        $connection->data($_mail);
        
    }
}

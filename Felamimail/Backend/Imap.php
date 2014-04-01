<?php
/**
 * Tine 2.0
 * 
 * @package     Felamimail
 * @subpackage  Backend
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Lars Kneschke <l.kneschke@metaways.de>
 * @copyright   Copyright (c) 2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: Imap.php,v 1.1 2009/12/08 23:15:33 hyokos Exp $
 * 
 */

/**
 * Felamimail IMAP backend
 *
 * @package     Felamimail
 * @subpackage  Backend
 */
class Felamimail_Backend_Imap extends Zend_Mail_Storage_Imap
{
    /**
     * protocol handler
     * @var null|Felamimail_Protocol_Imap
     */
    protected $_protocol;

    /**
     * wheter to use UID as message identifier
     *
     * @var bool
     */
    protected $_useUid;
    
    /**
     * create instance with parameters
     * Supported parameters are
     *   - user username
     *   - host hostname or ip address of IMAP server [optional, default = 'localhost']
     *   - password password for user 'username' [optional, default = '']
     *   - port port for IMAP server [optional, default = 110]
     *   - ssl 'SSL' or 'TLS' for secure sockets
     *   - folder select this folder [optional, default = 'INBOX']
     *
     * @param  array $params mail reader specific parameters
     * @throws Zend_Mail_Storage_Exception
     * @throws Zend_Mail_Protocol_Exception
     */
    public function __construct($params)
    {
        if (is_array($params)) {
            $params = (object)$params;
        }

        $this->_has['flags'] = true;

        if ($params instanceof Zend_Mail_Protocol_Imap) {
            $this->_protocol = $params;
            try {
                $this->selectFolder('INBOX');
            } catch(Zend_Mail_Storage_Exception $e) {
                /**
                 * @see Zend_Mail_Storage_Exception
                 */
                require_once 'Zend/Mail/Storage/Exception.php';
                throw new Zend_Mail_Storage_Exception('cannot select INBOX, is this a valid transport?');
            }
            return;
        }

        if (!isset($params->user)) {
            /**
             * @see Zend_Mail_Storage_Exception
             */
            require_once 'Zend/Mail/Storage/Exception.php';
            throw new Zend_Mail_Storage_Exception('need at least user in params');
        }

        $this->_messageClass = 'Felamimail_Message';
        $this->_useUid = true;
        
        $host     = isset($params->host)     ? $params->host     : 'localhost';
        $password = isset($params->password) ? $params->password : '';
        $port     = isset($params->port)     ? $params->port     : null;
        $ssl      = isset($params->ssl)      ? $params->ssl      : false;

        $this->_protocol = new Felamimail_Protocol_Imap();
        $this->_protocol->connect($host, $port, $ssl);
        if (!$this->_protocol->login($params->user, $password)) {
            /**
             * @see Zend_Mail_Storage_Exception
             */
            require_once 'Zend/Mail/Storage/Exception.php';
            throw new Zend_Mail_Storage_Exception('cannot login, user or password wrong');
        }
        $this->selectFolder(isset($params->folder) ? $params->folder : 'INBOX');
    }
    
    /**
     * select given folder
     * 
     * - overwritten to get results (UIDNEXT, UIDVALIDITY, ...)
     *
     * folder must be selectable!
     *
     * @param  Zend_Mail_Storage_Folder|string $globalName global name of folder or instance for subfolder
     * @return array with folder values
     * @throws Zend_Mail_Storage_Exception
     * @throws Zend_Mail_Protocol_Exception
     */
    public function selectFolder($globalName)
    {
        $this->_currentFolder = $globalName;
        if (!$result = $this->_protocol->select($this->_currentFolder)) {
            $this->_currentFolder = '';
            /**
             * @see Zend_Mail_Storage_Exception
             */
            require_once 'Zend/Mail/Storage/Exception.php';
            throw new Zend_Mail_Storage_Exception('cannot change folder, maybe it does not exist');
        }
        
        return $result;
    }
    
    /**
     * examine given folder
     * 
     * @param  Zend_Mail_Storage_Folder|string $globalName global name of folder or instance for subfolder
     * @return array with folder values
     */
    public function examineFolder($globalName)
    {
        $this->_currentFolder = $globalName;
        $result = $this->_protocol->examine($this->_currentFolder);        
        return $result;
    }
    
    /**
     * get folder status
     * 
     * @param  Zend_Mail_Storage_Folder|string $globalName global name of folder or instance for subfolder
     * @return array with folder values
     */
    public function getFolderStatus($globalName)
    {
        $this->_currentFolder = $globalName;
        $result = $this->_protocol->getFolderStatus($this->_currentFolder);        
        return $result;
    }
    
    /**
     * create a new folder
     *
     * This method also creates parent folders if necessary. Some mail storages may restrict, which folder
     * may be used as parent or which chars may be used in the folder name
     *
     * @param  string                          $name         global name of folder, local name if $parentFolder is set
     * @param  string|Zend_Mail_Storage_Folder $parentFolder parent folder for new folder, else root folder is parent
     * @param  string                          
     * @return null
     * @throws Zend_Mail_Storage_Exception
     */
    public function createFolder($name, $parentFolder = null, $_delimiter = '/')
    {
        if ($parentFolder instanceof Zend_Mail_Storage_Folder) {
            $folder = $parentFolder->getGlobalName() . $_delimiter . $name;
        } else if ($parentFolder != null) {
            $folder = $parentFolder . $_delimiter . $name;
        } else {
            $folder = $name;
        }

        if (!$this->_protocol->create($folder)) {
            /**
             * @see Zend_Mail_Storage_Exception
             */
            require_once 'Zend/Mail/Storage/Exception.php';
            throw new Zend_Mail_Storage_Exception('cannot create folder ' . $folder);
        }
    }
    
    /**
     * Fetch a message
     *
     * @param int $id number of message
     * @return Zend_Mail_Message
     * @throws Zend_Mail_Protocol_Exception
     */
    public function getMessage($id)
    {
        $data = $this->_protocol->fetch(array('FLAGS', 'RFC822.HEADER'), $id, null, $this->_useUid);
        $header = $data['RFC822.HEADER'];

        $flags = array();
        foreach ($data['FLAGS'] as $flag) {
            $flags[] = isset(self::$_knownFlags[$flag]) ? self::$_knownFlags[$flag] : $flag;
        }

        return new $this->_messageClass(array('handler' => $this, 'id' => $id, 'headers' => $header, 'flags' => $flags));
    }
    
    /**
     * Get raw content of message or part
     *
     * @param  int               $id   number of message
     * @param  null|array|string $part path to part or null for messsage content
     * @return string raw content
     * @throws Zend_Mail_Protocol_Exception
     * @throws Zend_Mail_Storage_Exception
     */
    public function getRawContent($id, $part = null)
    {
        if ($part !== null) {
            // TODO: implement
            /**
             * @see Zend_Mail_Storage_Exception
             */
            require_once 'Zend/Mail/Storage/Exception.php';
            throw new Zend_Mail_Storage_Exception('not implemented');
        }

        return $this->_protocol->fetch('RFC822.TEXT', $id, null, $this->_useUid);
    }
    
    /**
     * set flags for message
     *
     * NOTE: this method can't set the recent flag.
     *
     * @param  int   $id    number of message
     * @param  array $flags new flags for message
     * @throws Zend_Mail_Storage_Exception
     */
    public function setFlags($id, $flags)
    {
        if (!$this->_protocol->store($flags, $id, null, null, true, $this->_useUid)) {
            /**
             * @see Zend_Mail_Storage_Exception
             */
            require_once 'Zend/Mail/Storage/Exception.php';
            throw new Zend_Mail_Storage_Exception('cannot set flags, have you tried to set the recent flag or special chars?');
        }
    }
    
    /**
     * add flags
     *
     * @param int $id
     * @param array $flags
     */
    public function addFlags($id, $flags)
    {
        if (!$this->_protocol->store($flags, $id, null, '+', true, $this->_useUid)) {
            /**
             * @see Zend_Mail_Storage_Exception
             */
            require_once 'Zend/Mail/Storage/Exception.php';
            throw new Zend_Mail_Storage_Exception('cannot set flags, have you tried to set the recent flag or special chars?');
        }
    }
    
    /**
     * clear flags
     *
     * @param int $id
     * @param array $flags
     */
    public function clearFlags($id, $flags)
    {
        if (!$this->_protocol->store($flags, $id, null, '-', true, $this->_useUid)) {
            /**
             * @see Zend_Mail_Storage_Exception
             */
            require_once 'Zend/Mail/Storage/Exception.php';
            throw new Zend_Mail_Storage_Exception('cannot set flags, have you tried to set the recent flag or special chars?');
        }
    }
    
    /**
     * get root folder or given folder
     *
     * @param  string $reference mailbox reference for list
     * @param  string $mailbox   mailbox name match with wildcards
     * @return Zend_Mail_Storage_Folder root or wanted folder
     * @throws Zend_Mail_Storage_Exception
     * @throws Zend_Mail_Protocol_Exception
     */
    public function getFolders($reference = '', $mailbox = '*')
    {
        $folders = $this->_protocol->listMailbox((string)$reference, $mailbox);
        if (!$folders) {
            throw new Zend_Mail_Storage_Exception('folder not found');
        }

        ksort($folders, SORT_STRING);
        
        $result = array();
        
        foreach ($folders as $globalName => $data) {
            $pos = strrpos($globalName, $data['delim']);
            if ($pos === false) {
                $localName = $globalName;
            } else {
                $localName = substr($globalName, $pos + 1);
            }
            if($data['flags']) {
                $selectable  = in_array('\\Noselect', $data['flags']) ? false : true;
                $hasChildren = in_array('\\haschildren', $data['flags']) ? true : false;
            }
            $folder = array(
                'localName'    => $localName,
                'globalName'   => $globalName,
                'delimiter'    => $data['delim'],
                'isSelectable' => $selectable,
                'hasChildren'  => $hasChildren
            );
            
            $result[$globalName] = $folder;
        }
        
        return $result;
    }
    
    /**
     * return uid for given message numbers
     *
     * @param int $from
     * @param int|null $to
     * @return array
     */
    public function getUid($from, $to = null)
    {
        $data = $this->_protocol->fetch('UID', $from, $to);
        
        if(!is_array($data)) {
            return array($from => $data);
        } else {
            return $data;
        }
    }
    
    /**
     * get messages summary
     *
     * @param int $from
     * @param int|null $to
     * @return array with $this->_messageClass (Felamimail_Message)
     */
    public function getSummary($from, $to = null)
    {
        $summary = $this->_protocol->fetch(array('FLAGS', 'RFC822.HEADER', 'INTERNALDATE', 'RFC822.SIZE'), $from, $to, $this->_useUid);
        
        //print_r($summary);
        
        $messages = array();
        
        foreach($summary as $id => $data) {
            $header = $data['RFC822.HEADER'];
    
            $flags = array();
            foreach ($data['FLAGS'] as $flag) {
                $flags[] = isset(self::$_knownFlags[$flag]) ? self::$_knownFlags[$flag] : $flag;
            }
    
            if($this->_useUid === true) {
                $key = $data['UID'];
            } else {
                $key = $id;
            }
            $messages[$key] = array(
                'message' => new $this->_messageClass(array(
                    'handler' => $this, 
                    'id' => $id, 
                    'headers' => $header, 
                    'flags' => $flags,
                )),
                'received' => $data['INTERNALDATE'],
                'size' => $data['RFC822.SIZE'],
            );
        }
        
        return $messages;
        
        //$data = $this->_protocol->fetch(array('INTERNALDATE', 'RFC822.SIZE', 'UID', 'FLAGS', 'ENVELOPE'), $from, $to);
        
    }
    
    /**
     * Remove a message from server. If you're doing that from a web enviroment
     * you should be careful and use a uniqueid as parameter if possible to
     * identify the message.
     *
     * @param   int $id number of message
     * @return  null
     * @throws  Zend_Mail_Storage_Exception
     */
    public function removeMessage($id)
    {
        if (!$this->_protocol->store(array(Zend_Mail_Storage::FLAG_DELETED), $id, null, '+', true, $this->_useUid)) {
            /**
             * @see Zend_Mail_Storage_Exception
             */
            require_once 'Zend/Mail/Storage/Exception.php';
            throw new Zend_Mail_Storage_Exception('cannot set deleted flag');
        }
        // TODO: expunge here or at close? we can handle an error here better and are more fail safe
        if (!$this->_protocol->expunge()) {
            /**
             * @see Zend_Mail_Storage_Exception
             */
            require_once 'Zend/Mail/Storage/Exception.php';
            throw new Zend_Mail_Storage_Exception('message marked as deleted, but could not expunge');
        }
    }
    
    /**
     * copy an existing message
     *
     * @param  int                             $id     number of message
     * @param  string|Zend_Mail_Storage_Folder $folder name or instance of targer folder
     * @return null
     * @throws Zend_Mail_Storage_Exception
     */
    public function copyMessage($id, $folder)
    {
        if (!$this->_protocol->copy($folder, $id, null, $this->_useUid)) {
            /**
             * @see Zend_Mail_Storage_Exception
             */
            require_once 'Zend/Mail/Storage/Exception.php';
            throw new Zend_Mail_Storage_Exception('cannot copy message, does the folder exist?');
        }
    }
    
    public function getCapabilityAndNamespace()
    {
        $capabilities = $this->_protocol->capability();
        
        $result = array('capabilities' => $capabilities);
        if (in_array('NAMESPACE', $capabilities)) {
            if ($namespace = $this->_protocol->getNamespace()) {
                $result['namespace'] = $namespace;
            }
        }
        
        return $result;
    }
}

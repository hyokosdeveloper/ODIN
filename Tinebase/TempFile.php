<?php
/**
 * Tine 2.0
 *
 * @package     Tinebase
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: TempFile.php,v 1.1 2009/12/08 23:14:27 hyokos Exp $
 */

/**
 * class of persistant temp files
 * 
 * This class handles generation of tempfiles and registers them in a tempFile table.
 * To access a tempFile, the session of the client must match
 * 
 * @todo automatic garbage collection via cron
 *
 */
class Tinebase_TempFile extends Tinebase_Backend_Sql_Abstract
{
    /**
     * Table name without prefix
     *
     * @var string
     */
    protected $_tableName = 'temp_files';
    
    /**
     * Model name
     *
     * @var string
     */
    protected $_modelName = 'Tinebase_Model_TempFile';
    
    /**
     * get temp file description from db
     *
     * @param string $_fileId
     * @return Tinebase_Model_TempFile
     */
    public function getTempFile($_fileId)
    {
        $select = $this->_getSelect('*');
        $select->where($this->_db->quoteIdentifier('id') . ' = ?', $_fileId)
               ->where($this->_db->quoteIdentifier('session_id') . ' = ?', session_id());

        //Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' ' . $select->__toString());
            
        $stmt = $this->_db->query($select);
        $queryResult = $stmt->fetch();
        $stmt->closeCursor();
                
        if (!$queryResult) {
            Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . " Could not fetch row with id $_fileId from temp_files table.");
            return NULL;
        }

        $result = new Tinebase_Model_TempFile($queryResult);
        return $result;
    }
    
    /**
     * uploads a file and saves it in the db
     *
     * @return Tinebase_Model_TempFile
     * @throws Tinebase_Exception_NotFound
     * @throws Tinebase_Exception_UnexpectedValue
     */
    public function uploadTempFile()
    {
        $uploadedFile = $_FILES['file'];
        
        $path = tempnam(session_save_path(), 'tine_tempfile_');
        if ($uploadedFile['error'] == UPLOAD_ERR_FORM_SIZE) {
            throw new Tinebase_Exception('The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form.');
        }
        if (!$path) {
            throw new Tinebase_Exception_UnexpectedValue('Can not upload file, tempnam() could not return a valid filename!');
        }
        if (! move_uploaded_file($uploadedFile['tmp_name'], $path)) {
            throw new Tinebase_Exception_NotFound('No valid upload file found or some other error occurred while uploading! ' . print_r($uploadedFile, true));
        }
        
        $id = Tinebase_Model_TempFile::generateUID();
        $tempFile = new Tinebase_Model_TempFile(array(
           'id'          => $id,
           'session_id'  => session_id(),
           'time'        => Zend_Date::now()->get(Tinebase_Record_Abstract::ISO8601LONG),
           'path'        => $path,
           'name'        => $uploadedFile['name'],
           'type'        => ! empty($uploadedFile['type']) ? $uploadedFile['type'] : 'unknown',
           'error'       => $uploadedFile['error'],
           'size'        => $uploadedFile['size'],
        ));
        
        $this->create($tempFile);
        
        return $tempFile;
    }
}

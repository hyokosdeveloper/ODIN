<?php
/**
 * Tine 2.0
 * 
 * @package     Tinebase
 * @subpackage  Notes
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @version     $Id: Notes.php,v 1.1 2009/12/08 23:14:27 hyokos Exp $
 * 
 * @todo        delete notes completely or just set the is_deleted flag?
 */

/**
 * Class for handling notes
 * 
 * @package     Tinebase
 * @subpackage  Notes 
 */
class Tinebase_Notes implements Tinebase_Backend_Sql_Interface 
{
    /**
     * @var Zend_Db_Adapter_Pdo_Mysql
     */
    protected $_db;

    /**
     * @var Tinebase_Db_Table
     */
    protected $_notesTable;
    
    /**
     * @var Tinebase_Db_Table
     */
    protected $_noteTypesTable;
    
    /**
     * default record backend
     */
    const DEFAULT_RECORD_BACKEND = 'Sql';

    /**
     * number of notes per record for activities panel
     * (NOT the tab panel)
     */
    const NUMBER_RECORD_NOTES = 8;
        
    /**
     * don't clone. Use the singleton.
     */
    private function __clone()
    {
        
    }

    /**
     * holds the instance of the singleton
     *
     * @var Tinebase_Notes
     */
    private static $_instance = NULL;
        
    /**
     * the singleton pattern
     *
     * @return Tinebase_Notes
     */
    public static function getInstance() 
    {
        if (self::$_instance === NULL) {
            self::$_instance = new Tinebase_Notes;
        }
        
        return self::$_instance;
    }

    /**
     * the private constructor
     *
     */
    private function __construct()
    {

        $this->_db = Tinebase_Core::getDb();
        
        $this->_notesTable = new Tinebase_Db_Table(array(
            'name' => SQL_TABLE_PREFIX . 'notes',
            'primary' => 'id'
        ));
        
        $this->_noteTypesTable = new Tinebase_Db_Table(array(
            'name' => SQL_TABLE_PREFIX . 'note_types',
            'primary' => 'id'
        ));        
    }
    
    /************************** sql backend interface ************************/
    
    /**
     * get table name
     *
     * @return string
     */
    public function getTableName()
    {
        return 'notes';
    }
    
    /**
     * get table prefix
     *
     * @return string
     */
    public function getTablePrefix()
    {
        return $this->_db->table_prefix;
    }
    
    /**
     * get db adapter
     *
     * @return Zend_Db_Adapter_Abstract
     */
    public function getAdapter()
    {
        return $this->_db;
    }
    
    /************************** get notes ************************/

    /**
     * search for notes
     *
     * @param Tinebase_Model_NoteFilter $_filter
     * @param Tinebase_Model_Pagination $_pagination
     * @return Tinebase_Record_RecordSet subtype Tinebase_Model_Note
     */
    public function searchNotes(Tinebase_Model_NoteFilter $_filter, Tinebase_Model_Pagination $_pagination)
    {
        $select = $this->_db->select()
            ->from(array('notes' => SQL_TABLE_PREFIX . 'notes'));
        
        Tinebase_Backend_Sql_Filter_FilterGroup::appendFilters($select, $_filter, $this);
        //$_filter->appendFilterSql($select);
        $_pagination->appendPaginationSql($select);
        
        //Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' ' . $select->__toString());
        
        $rows = $this->_db->fetchAssoc($select);
        $result = new Tinebase_Record_RecordSet('Tinebase_Model_Note', $rows, true);

        return $result;
    }
    
    /**
     * count notes
     *
     * @param Tinebase_Model_NoteFilter $_filter
     * @return int notes count
     */
    public function searchNotesCount(Tinebase_Model_NoteFilter $_filter)
    {
        $select = $this->_db->select()
            ->from(array('notes' => SQL_TABLE_PREFIX . 'notes'), array('count' => 'COUNT(id)'));
        
        Tinebase_Backend_Sql_Filter_FilterGroup::appendFilters($select, $_filter, $this);
        //$_filter->appendFilterSql($select);
        
        $result = $this->_db->fetchOne($select);
        return $result;        
    }
    
    /**
     * get a single note
     *
     * @param   string $_noteId
     * @return  Tinebase_Model_Note
     * @throws  Tinebase_Exception_NotFound
     */
    public function getNote($_noteId)
    {
        $row = $this->_notesTable->fetchRow($this->_db->quoteInto('id = ?', $_noteId));
        
        if (!$row) {
            throw new Tinebase_Exception_NotFound('Note not found.');
        }
        
        return new Tinebase_Model_Note($row->toArray());
    }
    
    /**
     * get all notes of a given record (calls searchNotes)
     * 
     * @param  string $_model     model of record
     * @param  string $_id        id of record
     * @param  string $_backend   backend of record
     * @return Tinebase_Record_RecordSet of Tinebase_Model_Note
     */
    public function getNotesOfRecord($_model, $_id, $_backend = 'Sql')
    {
        $backend = ucfirst(strtolower($_backend));

        $cache = Tinebase_Core::get('cache');
        $cacheId = 'getNotesOfRecord' . $_model . $_id . $backend;
        $result = $cache->load($cacheId);
        
        if (!$result) {
            $filter = new Tinebase_Model_NoteFilter(array(
                array(
                    'field' => 'record_model',
                    'operator' => 'equals',
                    'value' => $_model
                ),
                array(
                    'field' => 'record_backend',
                    'operator' => 'equals',
                    'value' => $backend
                ),
                array(
                    'field' => 'record_id',
                    'operator' => 'equals',
                    'value' => $_id
                ),
                array(
                    'field' => 'note_type_id',
                    'operator' => 'in',
                    'value' => $this->getNoteTypes(TRUE)->getArrayOfIds()
                )
            ));
            
            $pagination = new Tinebase_Model_Pagination(array(
                'limit' => Tinebase_Notes::NUMBER_RECORD_NOTES,
                'sort'  => 'creation_time',
                'dir'   => 'DESC'
            ));
            
            $result = $this->searchNotes($filter, $pagination);
            
            $cache->save($result, $cacheId, array('notes'));
        }        
        
        return $result;          
    }
    
    /**
     * get all notes of all given records (calls searchNotes)
     * 
     * @todo implement this in one sql query!
     * 
     * @param  Tinebase_Record_RecordSet  $_records       the recordSet
     * @param  string                     $_notesProperty  the property in the record where the notes are in (defaults: 'notes')
     * @param  string                     $_backend   backend of record
     * @return Tinebase_Record_RecordSet of Tinebase_Model_Note
     */
    public function getMultipleNotesOfRecords($_records, $_notesProperty='notes', $_backend = 'Sql')
    {
        $modelName = $_records->getRecordClassName();
        
        foreach($_records as $record) {
            $record->notes = Tinebase_Notes::getInstance()->getNotesOfRecord($modelName, $record->getId(), $_backend);
        }
        
    }
    
    /************************** set / add / delete notes ************************/
    
    /**
     * sets notes of a record
     * 
     * @param Tinebase_Record_Abstract  $_record            the record object
     * @param string                    $_backend           backend (default: 'Sql')
     * @param string                    $_notesProperty     the property in the record where the tags are in (default: 'notes')
     * 
     * @todo add update notes ?
     */
    public function setNotesOfRecord($_record, $_backend = 'Sql', $_notesProperty = 'notes')
    {
        $model = get_class($_record);
        $backend = ucfirst(strtolower($_backend));        
        
        $currentNotesIds = $this->getNotesOfRecord($model, $_record->getId(), $backend)->getArrayOfIds();
        $notes = $_record->$_notesProperty;
                
        if ($notes instanceOf Tinebase_Record_RecordSet) {
            $notesToSet = $notes;
        } else {
            if (count($notes) > 0 && $notes[0] instanceOf Tinebase_Record_Abstract) {
                // array of notes records given
                $notesToSet = new Tinebase_Record_RecordSet('Tinebase_Model_Note', $notes);
            } else {
                // array of arrays given
                $notesToSet = new Tinebase_Record_RecordSet('Tinebase_Model_Note');
                foreach($notes as $noteData) {
                    if (!empty($noteData)) {
                        $noteArray = (!is_array($noteData)) ? array('note' => $noteData) : $noteData;
                        if (!isset($noteArray['note_type_id'])) {
                            // get default note type
                            $defaultNote = $this->getNoteTypeByName('note');
                            $noteArray['note_type_id'] = $defaultNote->getId();
                        }
                        $note = new Tinebase_Model_Note($noteArray);
                        $notesToSet->addRecord($note);
                    }
                }
                
            }
        }
        
        //$toAttach = array_diff($notesToSet->getArrayOfIds(), $currentNotesIds);
        $toDetach = array_diff($currentNotesIds, $notesToSet->getArrayOfIds());

        // delete detached/deleted notes
        $this->deleteNotes($toDetach);
        
        // add new notes        
        foreach ($notesToSet as $note) {
            //if (in_array($note->getId(), $toAttach)) {
            if (!$note->getId()) {
                $note->record_model = $model;
                $note->record_backend = $backend;
                $note->record_id = $_record->getId();                
                $this->addNote($note);
            }
        }
        
        // invalidate cache
        Tinebase_Core::get('cache')->remove('getNotesOfRecord' . $model . $_record->getId() . $backend);
    }
    
    /**
     * add new note
     *
     * @param Tinebase_Model_Note $_note
     */
    public function addNote(Tinebase_Model_Note $_note)
    {
        if (!$_note->getId()) {
            $id = $_note->generateUID();
            $_note->setId($id);
        }

        Tinebase_Timemachine_ModificationLog::getInstance()->setRecordMetaData($_note, 'create');
        
        $data = $_note->toArray(FALSE, FALSE);

        $this->_notesTable->insert($data);        
    }

    /**
     * add new system note
     *
     * @param Tinebase_Model_Record $_record
     * @param int $_userId
     * @param string $_type (created|changed)
     * @param Tinebase_Record_RecordSet RecordSet $_mods (Tinebase_Model_ModificationLog)
     * @param string $_backend   backend of record
     * 
     * @todo get field translations from application?
     */
    public function addSystemNote($_record, $_userId, $_type, $_mods = NULL, $_backend = 'Sql')
    {
        $translate = Tinebase_Translation::getTranslation('Tinebase');
        $backend = ucfirst(strtolower($_backend));
        
        $noteType = $this->getNoteTypeByName($_type);
        $user = Tinebase_User::getInstance()->getUserById($_userId);
        
        $noteText = $translate->_($_type) . ' ' . $translate->_('by') . ' ' . $user->accountDisplayName;
        
        if ($_mods !== NULL && count($_mods) > 0) {
            
            //Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ .' mods to log: ' . $_mods);
            
            $noteText .= ' | ' .$translate->_('Changed fields:');
            foreach ($_mods as $mod) {
                $noteText .= ' ' . $translate->_($mod->modified_attribute) .' (' . $mod->old_value . ' -> ' . $mod->new_value . ')';
            }
        } else if ($_type === 'changed') {
            // nothing changed -> don't add note
            return FALSE;
        }
        
        $note = new Tinebase_Model_Note(array(
            'note_type_id'      => $noteType->getId(),
            'note'              => $noteText,    
            'record_model'      => get_class($_record),
            'record_backend'    => $backend,       
            'record_id'         => $_record->getId()        
        ));
        
        $this->addNote($note);
    }
    
    /**
     * delete notes
     *
     * @param array $_noteIds
     */
    public function deleteNotes(array $_noteIds)
    {
        if (!empty($_noteIds)) {
            $where = array($this->_db->quoteInto($this->_db->quoteIdentifier('id') . ' in (?)', $_noteIds));
            $this->_notesTable->delete($where);
        }
    }

    /**
     * delete notes
     *
     * @param  string $_model     model of record
     * @param  string $_backend   backend of record
     * @param  string $_id        id of record
     */
    public function deleteNotesOfRecord($_model, $_backend, $_id)
    {
        $backend = ucfirst(strtolower($_backend));
        
        $notes = $this->getNotesOfRecord($_model, $_id, $backend);
        
        $this->deleteNotes($notes->getArrayOfIds());
        
        // invalidate cache
        Tinebase_Core::get('cache')->remove('getNotesOfRecord' . $_model . $_id . $backend);
    }
    
    /************************** note types *******************/
    
    /**
     * get all note types
     *
     * @param boolean|optional $onlyNonSystemNotes
     * @return Tinebase_Record_RecordSet of Tinebase_Model_NoteType
     */
    public function getNoteTypes($onlyNonSystemNotes = FALSE)
    {
        $types = new Tinebase_Record_RecordSet('Tinebase_Model_NoteType');
        foreach ($this->_noteTypesTable->fetchAll() as $type) {
            if (!$onlyNonSystemNotes || $type->is_user_type) {
                $types->addRecord(new Tinebase_Model_NoteType($type->toArray(), true));
            }
        }
        return $types;         
    }

    /**
     * get note type by name
     *
     * @param string $_name
     * @return Tinebase_Model_NoteType
     * @throws  Tinebase_Exception_NotFound
     */
    public function getNoteTypeByName($_name)
    {        
        $row = $this->_noteTypesTable->fetchRow($this->_db->quoteInto('name = ?', $_name));
        
        if (!$row) {
            throw new Tinebase_Exception_NotFound('Note type not found.');
        }
        
        return new Tinebase_Model_NoteType($row->toArray());        
    }
    
    /**
     * add new note type
     *
     * @param Tinebase_Model_NoteType $_noteType
     */
    public function addNoteType(Tinebase_Model_NoteType $_noteType)
    {
        if (!$_noteType->getId()) {
            $id = $_noteType->generateUID();
            $_noteType->setId($id);
        }
        
        $data = $_noteType->toArray();

        $this->_noteTypesTable->insert($data);
    }

    /**
     * update note type
     *
     * @param Tinebase_Model_NoteType $_noteType
     */
    public function updateNoteType(Tinebase_Model_NoteType $_noteType)
    {
        $data = $_noteType->toArray();

        $where  = array(
            $this->_noteTypesTable->getAdapter()->quoteInto($this->_db->quoteIdentifier('id') . ' = ?', $_noteType->getId()),
        );
        
        $this->_noteTypesTable->update($data, $where);
    }
    
    /**
     * delete note type
     *
     * @param integer $_noteTypeId
     */
    public function deleteNoteType($_noteTypeId)
    {
        $this->_noteTypesTable->delete($this->_db->quoteInto('id = ?', $_noteTypeId));
    }
    
}
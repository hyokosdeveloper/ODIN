<?php
/**
 * Tine 2.0
 * 
 * @package     Tinebase
 * @subpackage  Acl
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: RoleFilter.php,v 1.1 2009/12/08 23:13:05 hyokos Exp $
 *
 * @todo        add role members and rights
 * @todo        extend Tinebase_Model_Filter_FilterGroup
 */

/**
 * Role Filter Class
 * @package     Tinebase
 * @subpackage  Acl
 * 
 */
class Tinebase_Model_RoleFilter extends Tinebase_Record_Abstract
{
    /**
     * key in $_validators/$_properties array for the field which 
     * represents the identifier
     * 
     * @var string
     */    
    protected $_identifier = 'id';
    
    /**
     * application the record belongs to
     *
     * @var string
     * 
     * @todo    is this needed?
     */
    protected $_application = 'Tinebase';
    
    /**
     * filter validators
     *
     * @var array
     */
    protected $_validators = array(
        'id'                   => array('allowEmpty' => true,  'Alnum'),

        //'name'                 => array('presence'   => 'required'),
        'name'                 => array('allowEmpty' => true),
        'description'          => array('allowEmpty' => true),
    );
    
    /**
     * Returns a select object according to this filter
     * 
     * @return Zend_Db_Select
     */
    public function getSelect()
    {
        $db = Tinebase_Core::getDb();
        $select = $db->select()
            ->from(array('roles' => SQL_TABLE_PREFIX . 'roles'));
        
        if (!empty($this->name)) {
            $select->where($db->quoteInto($db->quoteIdentifier('roles.name') . ' LIKE ?', $this->name));
        }
        if (!empty($this->description)) {
            $select->where($db->quoteInto($db->quoteIdentifier('roles.description') . ' LIKE ?', $this->description));
        }
        return $select;
    }
    
}
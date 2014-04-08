<?php
/**
 * Tine 2.0
 * 
 * @package     Tinebase
 * @license     http://www.gnu.org/licenses/agpl.html AGPL3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: Pagination.php,v 1.1 2010/04/13 21:55:50 hyokos Exp $
 *
 */

/**
 * Pagination Class
 * @package Tinebase
 */
class Tinebase_Model_Pagination extends Tinebase_Record_Abstract
{
	/**
     * key in $_validators/$_properties array for the filed which 
     * represents the identifier
     * 
     * @var string
     */    
    protected $_identifier = 'id';
    
    protected $_validators = array(
        'id'                   => array('allowEmpty'    => true,  
                                        'Int'                           ),
        
        'start'                => array('allowEmpty'    => true,
                                        'Int',
                                        'default'       => 0            ),
    
        'limit'                => array('allowEmpty'    => true,  
                                        'Int',
                                        'default'       => 0            ),
    
        'sort'                 => array('allowEmpty'    => true,
                                        'default'       => NULL         ),
    
        'dir'                  => array('presence'      => 'required',
                                        'allowEmpty'    => false,
                                        'InArray'       => array('ASC', 'DESC'),
                                        'default'       => 'ASC'        )
    );
    
    /**
     * Appends pagination statements to a given select object
     * 
     * @param  Zend_Db_Select
     * @return void
     */
    public function appendPaginationSql($_select)
    {
        if ($this->isValid()) {
            if (!empty($this->limit)) {
                $_select->limit($this->limit, $this->start);
            }
            if (!empty($this->sort) && !empty($this->dir)){
                if (is_array($this->sort)) {
                    $order = array();
                    foreach ($this->sort as $sort) {
                        $order[] = $sort . ' ' . $this->dir;
                    }
                } else {
                    $order = $this->sort . ' ' . $this->dir;
                }
                $_select->order($order);
            }
        }
    }
}
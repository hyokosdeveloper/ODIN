<?php
/**
 * Tine 2.0
 * 
 * @package     Tinebase
 * @subpackage  Group
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: GroupFilter.php,v 1.1 2009/12/08 23:13:05 hyokos Exp $
 * 
 * @todo        this isn't used yet because the group backends don't have search / filter functionality
 */

/**
 *  Groups filter class
 * 
 * @package     Tinebase
 * @subpackage  Groups 
 */
class Tinebase_Model_GroupFilter extends Tinebase_Model_Filter_FilterGroup
{    
    /**
     * @var string application of this filter group
     */
    protected $_applicationName = 'Tinebase';
    
    /**
     * @var array filter model fieldName => definition
     */
    protected $_filterModel = array(
        'name'           => array('filter' => 'Tinebase_Model_Filter_Text'),
        'query'          => array('filter' => 'Tinebase_Model_Filter_Query', 'options' => array('fields' => array('name', 'description'))),
    );
}

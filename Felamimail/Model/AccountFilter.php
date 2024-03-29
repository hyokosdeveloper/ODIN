<?php
/**
 * Tine 2.0
 * 
 * @package     Felamimail
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: AccountFilter.php,v 1.1 2010/04/13 21:27:08 hyokos Exp $
 *
 */

/**
 * Account filter Class
 * @package     Felamimail
 */
class Felamimail_Model_AccountFilter extends Tinebase_Model_Filter_FilterGroup 
{
    /**
     * @var string application of this filter group
     */
    protected $_applicationName = 'Felamimail';
    
    /**
     * @var string name of model this filter group is designed for
     */
    protected $_modelName = 'Felamimail_Model_Account';
    
    /**
     * @var array filter model fieldName => definition
     */
    protected $_filterModel = array(
        'id'            => array('filter' => 'Tinebase_Model_Filter_Id'),
        'user_id'       => array('filter' => 'Tinebase_Model_Filter_Id'),
        'name'          => array('filter' => 'Tinebase_Model_Filter_Text'),
    );
}

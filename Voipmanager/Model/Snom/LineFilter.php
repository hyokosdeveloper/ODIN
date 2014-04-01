<?php
/**
 * Tine 2.0
 * 
 * @package     Voipmanager
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Lars Kneschke <l.kneschke@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: LineFilter.php,v 1.1 2009/12/08 23:14:40 hyokos Exp $
 *
 */

/**
 * Phone Filter Class
 * @package Voipmanager
 */
class Voipmanager_Model_Snom_LineFilter extends Tinebase_Model_Filter_FilterGroup
{
    /**
     * @var string application of this filter group
     */
    protected $_applicationName = 'Voipmanager';
    
    /**
     * @var array filter model fieldName => definition
     */
    protected $_filterModel = array(
        'snomphone_id'         => array('filter' => 'Tinebase_Model_Filter_Id'),
    );    
}

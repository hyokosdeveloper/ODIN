<?php
/**
 * Tine 2.0
 * 
 * @package     Voipmanager
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Thomas Wadewitz <t.wadewitz@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: VoicemailFilter.php,v 1.1 2009/12/08 23:14:40 hyokos Exp $
 *
 */

/**
 * Asterisk Voicemail Filter Class
 * @package Voipmanager
 */
class Voipmanager_Model_Asterisk_VoicemailFilter extends Tinebase_Model_Filter_FilterGroup
{
    /**
     * application the record belongs to
     *
     * @var string
     */
    protected $_applicationName = 'Voipmanager';
    
    /**
     * @var array filter model fieldName => definition
     */
    protected $_filterModel = array(
        'query'                => array(
            'filter' => 'Tinebase_Model_Filter_Query', 
            'options' => array(
                'fields' => array('context', 'mailbox', 'fullname', 'email', 'pager')
            )
        ),
    );
}
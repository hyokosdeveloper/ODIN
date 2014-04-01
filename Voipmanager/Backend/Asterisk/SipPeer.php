<?php
/**
 * Tine 2.0
 *
 * @package     Voipmanager Management
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Lars Kneschke <l.kneschke@metaways.de>
 * @copyright   Copyright (c) 2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: SipPeer.php,v 1.1 2009/12/08 23:15:12 hyokos Exp $
 *
 */

/**
 * Asterisk peer sql backend
 *
 * @package  Voipmanager
 */
class Voipmanager_Backend_Asterisk_SipPeer extends Tinebase_Backend_Sql_Abstract
{
    /**
     * Table name without prefix
     *
     * @var string
     */
    protected $_tableName = 'asterisk_sip_peers';
    
    /**
     * Model name
     *
     * @var string
     */
    protected $_modelName = 'Voipmanager_Model_Asterisk_SipPeer';
}

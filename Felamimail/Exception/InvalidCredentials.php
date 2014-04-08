<?php
/**
 * Tine 2.0
 * 
 * @package     Felamimail
 * @subpackage  Exception
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @version     $Id: InvalidCredentials.php,v 1.1 2010/04/13 21:27:28 hyokos Exp $
 *
 */

/**
 * Felamimail_Exception_InvalidCredentials
 * 
 * @package     Felamimail
 * @subpackage  Exception
 */
class Felamimail_Exception_InvalidCredentials extends Felamimail_Exception
{
    /**
     * construct
     * 
     * @param string $_message
     * @param integer $_code
     * @return void
     */
    public function __construct($_message = 'Invalid Credentials.', $_code = 902) {
        parent::__construct($_message, $_code);
    }
}

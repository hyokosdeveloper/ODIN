<?php
/**
 * Tine 2.0
 * 
 * @package     Tinebase
 * @subpackage  Exception
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @version     $Id: NotFound.php,v 1.1 2010/04/13 21:55:50 hyokos Exp $
 *
 */

/**
 * NotFound exception
 * 
 * @package     Tinebase
 * @subpackage  Exception
 */
class Tinebase_Exception_NotFound extends Tinebase_Exception
{
    
    public function __construct($_message, $_code=404) {
    	parent::__construct($_message, $_code);
    }
}

<?php
/**
 * Tine 2.0
 * 
 * @package     Tinebase
 * @subpackage  Application
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @version     $Id: Interface.php,v 1.1 2009/12/08 23:16:37 hyokos Exp $
 */

/**
 * Interface for application rights
 *
 * @package     Tinebase
 * @subpackage  Application
 */
interface Tinebase_Acl_Rights_Interface
{
    /**
     * get all possible application rights
     *
     * @return  array   all application rights
     */
    public function getAllApplicationRights();
    
    /**
     * get right description
     * 
     * @param   string right
     * @return  array with text + description
     */
    public function getRightDescription($_right);            
}

<?php
/**
 * Tine 2.0
 * 
 * @package     Tinebase
 * @subpackage  Application
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @version     $Id: Interface.php,v 1.1 2009/12/08 23:16:36 hyokos Exp $
 * 
 * @deprecated
 */

/**
 * Interface class for an Tine 2.0 application with Http interface
 * 
 * Note, that the Http inerface in tine 2.0 is used to generate the base layouts
 * in new browser windows.
 * 
 * Each tine application must extend this class to gain an native tine 2.0 user
 * interface.
 * @package     Tinebase
 * @subpackage  Application
 */
Interface Tinebase_Frontend_Http_Interface extends Tinebase_Frontend_Interface
{
    /**
     * Returns all JS files which must be included for this app
     *
     * @return array Array of filenames
     */
    public function getJsFilesToInclude();
    
    /**
     * Retruns all CSS files which must be inclued for this app
     *
     * @return array Array of filenames
     */
    public function getCssFilesToInclude();
    
}
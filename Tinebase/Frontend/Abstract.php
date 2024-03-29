<?php
/**
 * Tine 2.0
 * 
 * @package     Tinebase
 * @subpackage  Application
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @version     $Id: Abstract.php,v 1.1 2010/04/13 21:56:18 hyokos Exp $
 */

/**
 * Abstract class for an Tine 2.0 application
 * 
 * @package     Tinebase
 * @subpackage  Application
 */
abstract class Tinebase_Frontend_Abstract implements Tinebase_Frontend_Interface
{
    /**
     * Application name
     *
     * @var string
     */
    protected $_applicationName;
}

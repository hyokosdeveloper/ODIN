#!/usr/bin/env php
<?php
/**
 * tine cli script 
 *
 * @package     Cli
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: odin-v.1.1.php,v 1.1 2009/12/08 23:15:25 hyokos Exp $
 */

if (php_sapi_name() != 'cli') {
    die('not allowed!');
}

set_include_path('.' . PATH_SEPARATOR . dirname(__FILE__) . '/library' . PATH_SEPARATOR . get_include_path());

require_once 'Zend/Loader.php';
Zend_Loader::registerAutoload();

/**
 * path to tine 2.0 checkout
 */
$tine20path = dirname(__FILE__);

/**
 * options
 */
try {
    $opts = new Zend_Console_Getopt(
    array(
        'help|h'                => 'Display this help Message',
        'verbose|v'             => 'Output messages',
        'dry|d'                 => "Dry run - don't change anything",    
        'info|i'                => 'Get usage description of method',
    
        'method=s'              => 'Method to call [required]',              
        'username=s'            => 'Username [required]',              
        'password=s'            => 'Password [required]',              
    ));
    $opts->parse();
} catch (Zend_Console_Getopt_Exception $e) {
   echo $e->getUsageMessage();
   exit;
}

if (count($opts->toArray()) === 0 || $opts->h || empty($opts->method) || empty($opts->username) || empty($opts->password)) {
    echo $opts->getUsageMessage();
    exit;
}

Tinebase_Core::set('opts', $opts);
Tinebase_Core::dispatchRequest();

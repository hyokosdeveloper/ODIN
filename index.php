<?php

/**
 * magic_quotes_gpc Hack!!!
 * @author hyokos
 * 
 * If you are on a shared host you may not able to change the php setting for magic_quotes_gpc
 * this hack will solve this BUT this takes performance (speed)!
 */
/**
if (ini_get('magic_quotes_gpc')) {
    function __magic_quotes_gpc($requests) {
        foreach($requests AS $k=>&$v) {
            if (is_array($v)) {
                $requests[stripslashes($k)] = __magic_quotes_gpc($v);
            } else {
                $requests[stripslashes($k)] = stripslashes($v);
            }
        }
        return $requests;
    } 
    
    // Change the incomming data if needed
    $_GET = __magic_quotes_gpc( $_GET );
    $_POST = __magic_quotes_gpc( $_POST );
    $_COOKIE = __magic_quotes_gpc( $_COOKIE );
    $_ENV = __magic_quotes_gpc( $_ENV );
    $_REQUEST = __magic_quotes_gpc( $_REQUEST );
} // end magic_quotes_gpc Hack
*/

$time_start = microtime(true);

set_include_path('.' . PATH_SEPARATOR . dirname(__FILE__) . '/library' . PATH_SEPARATOR . get_include_path());

require_once 'Zend/Loader.php';

Zend_Loader::registerAutoload();
Tinebase_Core::dispatchRequest();

// log profiling information
$time_end = microtime(true);
$time = $time_end - $time_start;

if(function_exists('memory_get_peak_usage')) {
    $memory = memory_get_peak_usage(true);
} else {
    $memory = memory_get_usage(true);
}

Tinebase_Core::getLogger()->debug('index.php ('. __LINE__ . ') TIME: ' . $time . ' seconds ' . $memory/1024/1024 . ' MBytes');

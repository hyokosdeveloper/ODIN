<?php
return array (
  'buildtype' => 'RELEASE',
  'database' =>
  array (
    'host' => 'mysql.zeusframework.com',
    'dbname' => 'vulcan_dev',
    'username' => 'hyokos',
    'password' => 'jcmlives',
    'adapter' => 'pdo_mysql',
    'tableprefix' => 'vulcan_'
    //'port' => 3306,
  ),
  'setupuser' => 
  array (
    'username' => 'vulcansetup',
    'password' => 'setup',
  ),
  'sessiondir' => '/home/zeuswebserver/tinlab/Apps/Vulcan/vulcan.tinlabapps.com/Office/SESSION',
  'session.save_path' => '/home/zeuswebserver/tinlab/Apps/Vulcan/vulcan.tinlabapps.com/Office/SESSION',
  'logger' =>
  array (
    'filename' => '/home/zeuswebserver/tinlab/Apps/Vulcan/vulcan.tinlabapps.com/Office/FRAMEWORK-LOG/vulcan-framework.log',
    'priority' => '7',
    'active' => 1,
  ),
  'login' => 
  array (
    'username' => '',
    'password' => '',
  ),
  'caching' => 
  array (
    'active' => false,
    'lifetime' => '',
  ),
  'tmpdir' => '/home/zeuswebserver/tinlab/Apps/Vulcan/vulcan.tinlabapps.com/Office/TEMP',
  'mapPanel' => 1
);
?>

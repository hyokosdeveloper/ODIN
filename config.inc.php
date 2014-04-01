<?php


// minimal configuration
return array(
	'database' => array(
        'host'		=> 'mysql.zeusframework.com',
        'dbname'	=> 'odin_demo',
        'username'	=> 'hyokos',
        'password'	=> 'jcmlives',
        'adapter'	=> 'pdo_mysql',
        'tableprefix'	=> 'odin_prod_'
	),
    'setupuser' => array(
        'username'      => 'odinsetup',
        'password'      => 'setup' 
    ),
   'session.save_path' => '/home/zeuswebserver/tinlab/Apps/Odin/odin.tinlabapps.com/SESSIONS',
   'logger' => array(
       'filename' => '/home/zeuswebserver/tinlab/Apps/Odin/odin.tinlabapps.com/FRAMEWORK-LOGS/odin-framework.log',
       'priority' => '7',
       'active' => 1
   ),	   
   
   'smtp' => array(
       'hostname' => 'mail.tinlab.com',
       'ssl' => 'tls',
       'port' => 25
   ),   
	'caching' => array(
		   'active' => 1,
		   'lifetime' => 3600,
		   'backend' => 'File',
      	   'path' => '/home/zeuswebserver/tinlab/Apps/Odin/odin.tinlabapps.com/tmp'
	)

   
	
);
?>

<?php


// minimal configuration
return array(
	'database' => array(
        'host'		=> 'localhost',
        'dbname'	=> 'odin_demo',
        'username'	=> 'hyokos',
        'password'	=> 'jcmlives',
        'adapter'	=> 'pdo_mysql',
        'tableprefix'	=> 'odin_prod_'
	),
    'setupuser' => array(
        'username'      => 'setup',
        'password'      => 'setup' 
    ),
   'session.save_path' =>  '/opt/local/apache2/htdocs/Projects/ODIN/SESSIONS',
   'logger' => array(
       'filename' => '/opt/local/apache2/htdocs/Projects/ODIN/FRAMEWORK-LOGS/odin-framework.log',
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
      	   'path' => '/opt/local/apache2/htdocs/Projects/ODIN/tmp'
	)

   
	
);
?>

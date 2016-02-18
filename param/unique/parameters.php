<?php

namespace param\unique;

//Insure the the folder is writable by chown apache:apache slim.api/logs and is in share(=writable) path in gluster mode.
//chown apache:apache /path/to/applilogs
$app->lincko->logPath = '/var/www/lincko/slim.web/logs';

//Insure the the folder is writable by chown apache:apache slim.api/public and is in share(=writable) path in gluster mode.
//chown apache:apache /path/to/applipublic
$app->lincko->publicPath = '/var/www/lincko/slim.web/public';

//List all mysql servers to use in master-master (galera cluster) replication configuration
$hosts = array(
	'mariadbweb',
);
$app->lincko->hosts = $hosts[array_rand($hosts)];

$app->lincko->databases = array(
	'default' => array(
		'driver' => 'mysql',
		'host' => $app->lincko->hosts,
		'database' => 'dev_lincko_default',
		'username' => 'dev_lincko_default',
		'password' => 'qazwsxedc',
	),
	'sessions' => array(
		'driver' => 'mysql',
		'host' => $app->lincko->hosts,
		'database' => 'dev_lincko_sessions',
		'username' => 'dev_lincko_sessions',
		'password' => 'qazwsxedc',
	),
	'wrapper' => array(
		'driver' => 'mysql',
		'host' => $app->lincko->hosts,
		'database' => 'dev_lincko_wrapper',
		'username' => 'dev_lincko_wrapper',
		'password' => 'qazwsxedc',
	),
	'web' => array(
		'driver' => 'mysql',
		'host' => $app->lincko->hosts,
		'database' => 'dev_lincko_web',
		'username' => 'dev_lincko_web',
		'password' => 'qazwsxedc',
	),
	'app' => array(
		'driver' => 'mysql',
		'host' => $app->lincko->hosts,
		'database' => 'dev_lincko_app',
		'username' => 'dev_lincko_app',
		'password' => 'qazwsxedc',
	),
);

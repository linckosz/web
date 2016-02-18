<?php

namespace param\unique;

//Insure the the folder is writable by chown apache:apache slim.api/logs and is in share(=writable) path in gluster mode.
//chown apache:apache /path/to/applilogs
$app->lincko->logPath = '/glusterfs/.lincko.co/www/share/slim.web/shared/logs';

//Insure the the folder is writable by chown apache:apache slim.api/public and is in share(=writable) path in gluster mode.
//chown apache:apache /path/to/applipublic
$app->lincko->publicPath = '/glusterfs/.lincko.co/www/share/slim.web/shared/logs';

//List all mysql servers to use in master-master (galera cluster) replication configuration
$hosts = array(
	'mariadbweb',
);
$app->lincko->hosts = $hosts[array_rand($hosts)];

$app->lincko->databases = array(
	'default' => array(
		'driver' => 'mysql',
		'host' => $app->lincko->hosts,
		'database' => 'stage_lincko_default',
		'username' => 'stage_lincko_default',
		'password' => 'hy6SYh87Jujs6S',
	),
	'sessions' => array(
		'driver' => 'mysql',
		'host' => $app->lincko->hosts,
		'database' => 'stage_lincko_sessions',
		'username' => 'stage_lincko_sessions',
		'password' => 'ksj7gjs7YUshh1',
	),
	'wrapper' => array(
		'driver' => 'mysql',
		'host' => $app->lincko->hosts,
		'database' => 'stage_lincko_wrapper',
		'username' => 'stage_lincko_wrapper',
		'password' => 'knxiUYs5js109s',
	),
	'web' => array(
		'driver' => 'mysql',
		'host' => $app->lincko->hosts,
		'database' => 'stage_lincko_web',
		'username' => 'stage_lincko_web',
		'password' => 'JKO87Stdfj201x',
	),
	'app' => array(
		'driver' => 'mysql',
		'host' => $app->lincko->hosts,
		'database' => 'stage_lincko_app',
		'username' => 'stage_lincko_app',
		'password' => 'spqodKJuso71d9',
	),
);

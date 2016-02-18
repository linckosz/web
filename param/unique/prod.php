<?php

namespace param\unique;

//Insure the the folder is writable by chown apache:apache slim.api/logs and is in share(=writable) path in gluster mode.
//chown apache:apache /path/to/applilogs
$app->lincko->logPath = '/glusterfs/.lincko.com/www/share/slim.web/shared/logs';

//Insure the the folder is writable by chown apache:apache slim.api/public and is in share(=writable) path in gluster mode.
//chown apache:apache /path/to/applipublic
$app->lincko->publicPath = '/glusterfs/.lincko.com/www/share/slim.web/shared/logs';

//List all mysql servers to use in master-master (galera cluster) replication configuration
$hosts = array(
	'mariadbweb',
);
$app->lincko->hosts = $hosts[array_rand($hosts)];

$app->lincko->databases = array(
	'default' => array(
		'driver' => 'mysql',
		'host' => $app->lincko->hosts,
		'database' => 'prod_lincko_default',
		'username' => 'prod_lincko_default',
		'password' => 'hs917SHJbhs761',
	),
	'sessions' => array(
		'driver' => 'mysql',
		'host' => $app->lincko->hosts,
		'database' => 'prod_lincko_sessions',
		'username' => 'prod_lincko_sessions',
		'password' => 'kxnjSKj719S2jb',
	),
	'wrapper' => array(
		'driver' => 'mysql',
		'host' => $app->lincko->hosts,
		'database' => 'prod_lincko_wrapper',
		'username' => 'prod_lincko_wrapper',
		'password' => '910jbh719sSS2c',
	),
	'web' => array(
		'driver' => 'mysql',
		'host' => $app->lincko->hosts,
		'database' => 'prod_lincko_web',
		'username' => 'prod_lincko_web',
		'password' => 'kJh761Sndj12hD',
	),
	'app' => array(
		'driver' => 'mysql',
		'host' => $app->lincko->hosts,
		'database' => 'prod_lincko_app',
		'username' => 'prod_lincko_app',
		'password' => 'lkcjH71S91mCmw',
	),
);

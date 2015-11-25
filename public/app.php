<?php

$path = dirname(__FILE__).'/..';

require_once $path.'/vendor/autoload.php';

$app = new \Slim\Slim();

function my_autoload($pClassName){
	$app = \Slim\Slim::getInstance();
	$pClassName = str_replace('\\', '/', $pClassName);
	if(file_exists($app->lincko->path.'/'.$pClassName.'.php')){
		include_once($app->lincko->path.'/'.$pClassName.'.php');
	}
}

spl_autoload_register('my_autoload');

require_once $path.'/config/language.php';
require_once $path.'/param/parameters.php';

// Only invoked if mode is "production"
$app->configureMode('production', function () use ($app) {
	$app->config(array(
		'log.enable' => true,
	));
	ini_set('display_errors', '0');
});

// Only invoked if mode is "development"
$app->configureMode('development', function () use ($app) {
	$app->config(array(
		'log.enable' => false,
	));
	ini_set('display_errors', '1');
	ini_set('opcache.enable', '0');
	//Only useful in rendering mode, useless in JSON mode
	//$debugbar = new \Slim\Middleware\DebugBar();
	//$app->add($debugbar);
});

require_once $path.'/config/autoload.php' ;
require_once $path.'/error/errorPHP.php';
require_once $path.'/config/eloquent.php';
require_once $path.'/config/session.php';
\libs\Watch::php($path, '$path', __FILE__, false, false, true);
$app->run();
//Checking $app (print_r) after run can make php crashed out of memory because it contains files data

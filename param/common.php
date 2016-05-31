<?php

namespace param;

////////////////////////////////////
// FOLDER PERMISSIONS
////////////////////////////////////
/*
cd /path/to/appli
chown -R apache:apache logs
chown -R apache:apache public
*/

////////////////////////////////////
// CALLBACK ORDER
////////////////////////////////////
/*
Before run (no $app | no environment)
MyMiddleware Before (with $app | no environment)
slim.before (with environment)
MyMiddleware After
slim.before.router
slim.before.dispatch
Before render
[render]
After render
slim.after.dispatch
slim.after.router (before buffer rendering)
slim.after (after buffer rendering)
After run
*/

////////////////////////////////////
// DEFAULT SETTING
////////////////////////////////////

//Create a default class to store special data
$app->lincko = new \stdClass;

//Used to track operation time
$app->lincko->time_record = false;
$app->lincko->time_start = 0;

//Application title
$app->lincko->title = 'Lincko';

//Domain name
if(isset($_SERVER["SERVER_HOST"])){
	$app->lincko->domain = $_SERVER["SERVER_HOST"];
} else if(strpos($_SERVER["HTTP_HOST"], ':')){
	$app->lincko->domain = strstr($_SERVER["HTTP_HOST"], ':', true);
} else {
	$app->lincko->domain = $_SERVER["HTTP_HOST"];
}

$app->lincko->domain_restriction = "/^(?:.{1,3}|(?:api|cloud|dc|file|info|lincko|mail|mx|ns|pop|smtp|tp|debug|www)\d*)$/ui";

//Do not enable debug when we are using json ajax respond
$app->config(array(
	'debug' => false,
	'mode' => 'production',
	'cookies.encrypt' => true, //Must use $app->getCookie('foo', false);
	'cookies.secret_key' => 'au6G7dbSh87Ws',
	'cookies.lifetime' => '365 days',
	'cookies.secure' => true,
	'cookies.path' => '/',
	'cookies.httponly' => true,
	'templates.path' => '..',
	'debug' => false,
));

//Root directory (which is different from landing page which is in public folder)
$app->lincko->path = $path;

//Insure the the folder is writable by chown apache:apache slim.api/logs and is in share(=writable) path in gluster mode.
//chown apache:apache /path/to/applilogs
$app->lincko->logPath = $app->lincko->path.'/logs';

//Insure the the folder is writable by chown apache:apache slim.api/public and is in share(=writable) path in gluster mode.
//chown apache:apache /path/to/applipublic
$app->lincko->publicPath = $app->lincko->path.'/public';

//False if we want to use Slim error display, use True for json application
$app->lincko->jsonException = false;

$app->lincko->enableSession = true;

//Use true for development to show error message on browser screen
//Do not allow that for production, in case of any single bug, all users will see the message
$app->lincko->showError = false;

//List all bundles to load (routes are loaded in the order of appearance)
$app->lincko->bundles = array(
	//'bundle name'
	'lincko/wrapper', //Must for front end server
	//'lincko/web',
	'lincko/launch',
	'lincko/app',
);

//List all middlewares to load in the order of appearance
$app->lincko->middlewares = array_reverse(array(
	//Full path of classes (including namespace)
	//['bundle name', 'subfolder\class name'],
	['lincko/wrapper', 'Twig'],
));

//List all hooks to load in the order of appearance and pound
$app->lincko->hooks = array(
	//Full path of classes (including namespace)
	//['bundle name', 'subfolder\function name', 'the.hook.name', priority value],
	['lincko/wrapper', 'SetData', 'slim.before', 10],
	['lincko/wrapper', 'SetCookies', 'slim.after.router', 10],
	['lincko/wrapper', 'SendEmail', 'slim.after', 20],
);

$app->lincko->security = array(
	'public_key' => 'Bruno Martin', //Value for Sign out
	'private_key' => 'Zhang Xiaorui', //Value for Sign out
	'expired' => '7200', //Expiration time in seconds (2H)
);

//Class with email default parameters, it use local Sendmail.postfix function
$app->lincko->email = new \stdClass;
$app->lincko->email->CharSet = 'utf-8';
$app->lincko->email->Abuse = 'abuse@'.$app->lincko->domain;
$app->lincko->email->Sender = 'noreply@'.$app->lincko->domain;
$app->lincko->email->From = 'noreply@'.$app->lincko->domain;
$app->lincko->email->FromName = $app->lincko->title.' server';
$app->lincko->email->List = array();

//Translator parameters
//brunoocto@gmail.com / m*m*3*
$app->lincko->translator = array(
	'client_id' => 'bd0c3bc3-d917-4a1c-810a-74835f62674f',
	'client_secret' => 'q7gZN2eqcX7TJo83+OOgXBc8mQhj2NuaNCYoZGVECZQ=',
);

//Translation list
$app->lincko->translation = array(
	'domain' => $app->lincko->domain,
	'title' => $app->lincko->title,
);

//Some generic data for translation word conversion
$app->lincko->data = array(
	'domain' => $app->lincko->domain,
	'title' => $app->lincko->title,
	'workspace' => '',
	'lincko_back' => '', //Only used for development purpose "master-[bruno.]lincko.cafe"
	'lincko_front' => '', //Only used for development purpose "[master-]bruno.lincko.cafe"
	'lincko_show_error' => 'false', //Display some error for developpers on JS (NOTE: it has to be a string because of Twig conversion to JS)
	'api_upload' => 'lknscklb798w98eh9cwde8bc897q09wj',
);

if(isset($_SERVER["LINCKO_FRONT"])){
	$app->lincko->data['lincko_front'] = $_SERVER["LINCKO_FRONT"].'-';
}

if(isset($_SERVER["LINCKO_BACK"])){
	$app->lincko->data['lincko_back'] = $_SERVER["LINCKO_BACK"].'.';
}

if(isset($_SERVER["LINCKO_WORKSPACE"])){
	$app->lincko->data['workspace'] = $_SERVER["LINCKO_WORKSPACE"];
}

////////////////////////////////////
// BUNDLE lincko/wrapper
////////////////////////////////////

//Parameters of API
$app->lincko->wrapper = array(
	'url' => 'https://'.$app->lincko->data['lincko_back'].'api.'.$app->lincko->domain.':10443/',
	'api_key' => '87f1eb12192652c8f1811804a7e18ef8', //API key for www.lincko.net
	'captcha_timing' => 300, //How many second we avoid the same IP to creation account without Captcha
);

////////////////////////////////////
// BUNDLE lincko/web
////////////////////////////////////

$app->lincko->data = array_merge(
	$app->lincko->data,
	array(
		'terms' => \bundles\lincko\web\models\Terms::getTerm(),
	)
);

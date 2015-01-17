<?php
/*
	Write here anything you need as debugging information to be display on main page
	For twig display use: {{ _debug() }} or {{ _debug(data) }}
	For php display use: include($app->lincko->path.'/error/debug.php');

	To get data
	print_r($data);
*/
$app = \Slim\Slim::getInstance();
//print_r($data);

//echo $app->urlFor('hello', array('name' => 'Josh','toto' => 'Ji'));

$req = $app->request;

echo $req->getRootUri();
echo '<br />';
echo $req->getResourceUri();
echo '<br />';
echo $req->getPath();
echo '<br />';

<?php
/*
	Write here anything you need as debugging information to be display on main page
	For twig display use: {{ _debug() }} or {{ _debug(data) }}
	For php display use: include($app->lincko->path.'/error/debug.php');
	Or simply open the link http://{domain}/debug

	To get data
	print_r($data);
*/
$app = \Slim\Slim::getInstance();
//print_r($data);

//echo $app->urlFor('hello', array('name' => 'Josh','toto' => 'Ji'));



$a = array(
	'A' => 'a',
);

echo $a['A'];

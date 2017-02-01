<?php
use \libs\STR;
/*
	Write here anything you need as debugging information to be display on main page
	For twig display use: {{ _debug() }} or {{ _debug(data) }}
	For php display use: include($app->lincko->path.'/error/debug.php');
	Or simply open the link http://{domain}/debug

	To get data
	print_r($data);

	Then open the link (change the domain name according to dev(.net)/stage(.co)/production(.com) server)
	https://lincko.co/debug
*/
$app = \Slim\Slim::getInstance();
//print_r($data);
//phpinfo();

$arr = array(
	'account' => '',
	'password' => ''
);
$w = new Weixin($arr);
var_dump($w->getAllUserInfo());//获取所有用户信息
$a = $w->sendMessage('test');
var_dump($a);

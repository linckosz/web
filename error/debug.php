<?php

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
=======
 use \libs\Wechat;
// /*
// 	Write here anything you need as debugging information to be display on main page
// 	For twig display use: {{ _debug() }} or {{ _debug(data) }}
// 	For php display use: include($app->lincko->path.'/error/debug.php');
// 	Or simply open the link http://{domain}/debug

// 	To get data
// 	print_r($data);

// 	Then open the link (change the domain name according to dev(.net)/stage(.co)/production(.com) server)
// 	https://lincko.co/debug
// */
// $app = \Slim\Slim::getInstance();
// //print_r($data);
// //phpinfo();

// /*
// //COM
// $option['appid'] = 'wx268709cdc1a8e280';
// $option['secret'] = '03fab389a36166cd1f75a2c94f5257a0';
// $open_id = 'og2amv--gbQqK3Pz4LUTtOsprWx4';
// $union_id = 'WqxPHuGPg2O4ND38AatZ8vi7U';
// */

//CO
$option['appid'] = 'wx70102f778f06a3dd';
$option['secret'] = '9f064b94cbb18ca75ae0c9fd079ce496';
// //$open_id = 'og2amv--gbQqK3Pz4LUTtOsprWx4';
// //$union_id = 'WqxPHuGPg2O4ND38AatZ8vi7U';

 // $wechat = new Wechat($option);
 // $wechat->getToken();
 // $url = $wechat->getQRUrl('123');

// //1.token
// $url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='.$option['appid'].'&secret='.$option['secret'];
// $response = file_get_contents($url);
// //2.
// $url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='.$option['appid'].'&secret='.$option['secret'];

\libs\Watch::php($_GET, '$wechat', __FILE__, __LINE__, false, false, true);
//\libs\Watch::php($url, '$url', __FILE__, __LINE__, false, false, true);




<?php
use \libs\Wechat;
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

/*
//COM
$option['appid'] = 'wx268709cdc1a8e280';
$option['secret'] = '03fab389a36166cd1f75a2c94f5257a0';
$open_id = 'og2amv--gbQqK3Pz4LUTtOsprWx4';
$union_id = 'WqxPHuGPg2O4ND38AatZ8vi7U';
*/

//CO
$option['appid'] = 'wxb315b38a8267ad72';
$option['secret'] = 'e0a658f9d2b907ddb4bd61c3827542da';
//$open_id = 'og2amv--gbQqK3Pz4LUTtOsprWx4';
//$union_id = 'WqxPHuGPg2O4ND38AatZ8vi7U';


/*
$wechat = new Wechat($option);
$wechat->getToken();
$url = $wechat->getQRUrl('123');

\libs\Watch::php($wechat, '$wechat', __FILE__, __LINE__, false, false, true);
\libs\Watch::php($url, '$url', __FILE__, __LINE__, false, false, true);
*/

$wechat = new Wechat($option);
$wechat->getJsapiTicket();



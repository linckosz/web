<?php

namespace bundles\lincko\app\routes;

use \libs\OneSeventySeven;
use \libs\Wechat;
use \bundles\lincko\wrapper\models\WechatPublic;
use \bundles\lincko\app\models\Data;
use \bundles\lincko\wrapper\controllers\ControllerWrapper;

$app = \Slim\Slim::getInstance();

$app->get('/', function () use ($app) {
	if($app->lincko->data['logged']){
		
		$_SESSION['workspace'] = $app->lincko->data['workspace'];
		$app->lincko->data['force_open_website'] = false;
		$app->lincko->translation['workspace'] = $app->lincko->data['workspace'];
		$app->lincko->data['reset_data'] = OneSeventySeven::get('reset_data');
		if($app->lincko->data['reset_data']){
			OneSeventySeven::unsetKey('reset_data');
		}
		if($app->lincko->data['user_info_2'] == 'Wechat' && $app->request->isGet()){
			if($wechat_package = WechatPublic::getPackage()){
				foreach ($wechat_package as $key => $value) {
					$app->lincko->data['wechat_package_'.$key] = $value;
				}
			}
			if($openid = OneSeventySeven::get('wxpukoid')){
				$app->lincko->data['integration_wechat_show_official'] = true; //true; keeping it at true is annoying because it logs to Lincko then forward to wechat (so leaving Lincko)
				$option['appid'] = $app->lincko->integration->wechat['public_appid'];
				$option['secret'] = $app->lincko->integration->wechat['public_secretapp'];
				$option['access_token'] = WechatPublic::access_token();
				$wechat = new Wechat($option);
				if($result = $wechat->users()){
					if(isset($result['openid']) && in_array($openid, $result['openid'])){
						$app->lincko->data['integration_wechat_show_official'] = false;
					}
				}
			}
		}

		//Auto add the open project
		if(isset($_SESSION['project_qrcode'])){
			$data = new \stdClass;
			$data->{'id'} = $_SESSION['project_qrcode'][1];
			$data->{'users>access'} = new \stdClass;
			$data->{'users>access'}->{$app->lincko->data['uid']} = true;
			$controller = new ControllerWrapper($data, 'post', false);
			if($response = $controller->wrap_multi('project/update')){
				if(isset($response->status) && $response->status==200){
					unset($_SESSION['project_qrcode']);
				}
			}
		}

		$app->render('/bundles/lincko/app/templates/app/application.twig');
	} else {
		$app->lincko->data['force_open_website'] = false;
		$app->router->getNamedRoute('home')->dispatch();
	}
})
->name('root');

//Open password to connect automatically to a workspace (security thread)
$app->get('/workspace/access/:code', function ($code) use ($app) {
	$_SESSION['workspace_access_code'] = $code;
	$app->router->getNamedRoute('root')->dispatch();
})
->conditions(array(
	'code' => '[a-z\d]+',
))
->name('workspace_access_code');

//Keep a NoSQL of the user data for faster login
$app->post('/nosql/data', function () use ($app) {
	$sha = OneSeventySeven::get('sha');
	if(OneSeventySeven::get('sha') && $post = $app->request->post()) {
		if(isset($post['lastvisit']) && isset($post['data'])){
			$data = Data::find($sha);
			if(!$data){
				$data = new Data;
				$data->sha = $sha;
			}
			$data->lastvisit = $post['lastvisit'];
			$data->data = gzcompress(json_encode($post['data']));
			$data->save();
		}
	}
	echo '{nosql: "saved", }';
})
->name('nosql_data_post');

$app->get('/cache/nosql/data.js', function () use ($app) {
	$expire_seconds = 7*86400; //Last for one week
	$expire_string = gmdate(DATE_RFC1123, time()+$expire_seconds);
	$app->response->headers->set('Content-Type', 'application/javascript');
	$app->response->headers->set('Cache-Control', 'public, no-transform , max-age='.$expire_seconds); //This will be overwriten by nginx (must be setup from nginx)
	$app->response->headers->set('Expires', $expire_string);
	$sha = OneSeventySeven::get('sha');
	if($sha){
		$data = Data::find($sha);
		if($data){
			$decompressed_data = gzuncompress($data->data);
			if($decompressed_data){
				echo 'Lincko.storage.last_visit = '.$data->lastvisit.";\n";
				echo 'Lincko.storage.data = '.$decompressed_data.";\n";
			}
		}
	}
})
->name('nosql_data_get');

/*
toto => only use this way if user complain about speed or access to HK DC
$app->get(
	'/file/:type/:id/:name',
	'\bundles\lincko\app\controllers\ControllerFile:file_open_get'
)
->conditions(array(
	'type' => 'link|thumbnail',
	'id' => '\d+',
	'name' => '.+\.\w+',
))
->name('file_open_get');
*/

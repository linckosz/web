<?php

namespace bundles\lincko\app\routes;

use \libs\OneSeventySeven;
use \libs\Wechat;
use \bundles\lincko\wrapper\models\WechatPublic;
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

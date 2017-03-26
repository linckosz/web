<?php

namespace bundles\lincko\app\routes;

use \libs\OneSeventySeven;
use \libs\Wechat;
use \bundles\lincko\wrapper\models\WechatPublic;

$app = \Slim\Slim::getInstance();

$app->get('/', function () use ($app) {
	if($app->lincko->data['logged']){
		$app->lincko->data['force_open_website'] = false;
		$_SESSION['workspace'] = $app->lincko->data['workspace'];
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
				$app->lincko->data['integration_wechat_show_official'] = true;
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
		$app->render('/bundles/lincko/app/templates/app/application.twig');
	} else {
		$app->lincko->data['force_open_website'] = false;
		$app->router->getNamedRoute('home')->dispatch();
	}
})
->name('root');

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

<?php

namespace bundles\lincko\wrapper\routes;

use \bundles\lincko\wrapper\models\Action;
use GeoIp2\Database\Reader;

$app = \Slim\Slim::getInstance();

$app->group('/wrapper', function () use ($app) {

	$app->map(
		'(/):action',
		'\bundles\lincko\wrapper\controllers\ControllerWrapper:wrap_multi'
	)
	->conditions(array('action' => '[\w\d\/]*'))
	->via('GET', 'POST', 'PUT', 'DELETE')
	->name('wrapper_action_all');

	$app->map(
		'(/):action',
		'\bundles\lincko\wrapper\controllers\ControllerWrapper:wrap_ok'
	)
	->conditions(array('action' => '[\w\d\/]*'))
	->via('OPTIONS')
	->name('wrapper_action_options');

});

$app->group('/appstore', function () use ($app) {

	//This is default behavior to redirect properly according to the IP location of the user
	$app->get('(/:isoCode)/', function ($isoCode=false) use($app) {
		
		$myip = $app->request->getIp();
		if(isset($_SERVER) && isset($_SERVER['REMOTE_ADDR'])){
			$myip = $_SERVER['REMOTE_ADDR'];
		}
		
		$get = $app->request->get();
		$get['ip'] = $myip;

		Action::record(-14, $get); //Access Lincko appstore link
		
		if(!$isoCode && filter_var($myip, FILTER_VALIDATE_IP)){
			try {
				$geoip_reader = new Reader($app->lincko->path.'/bundles/lincko/wrapper/models/geoip2/GeoLite2-Country.mmdb');
				$geoip_record = $geoip_reader->country($myip);
				$isoCode = $geoip_record->country->isoCode;
			} catch (\Exception $e) {
				$isoCode = false;
			}
		}
		//ISO alpha-2 => http://www.nationsonline.org/oneworld/country_code_list.htm
		$isoCode = mb_strtolower($isoCode);

		$user_info = Action::getUserInfo();

		$app->lincko->data['appstore'] = 'https://play.google.com/store/apps/details?id=com.lincko.lincko'; //Use Android by default (Google play)
		if($user_info[0]=='Macintosh'){ //All Apple products
			$app->lincko->data['appstore'] = 'https://itunes.apple.com/us/app/lincko/id1194913804?mt=8'; //(Apple US)
			if($isoCode=='cn' && $user_info[0]=='Macintosh' && $user_info[2]=='Wechat'){
				$app->lincko->data['appstore'] = 'http://a.app.qq.com/o/simple.jsp?pkgname=com.lincko.lincko'; //(QQ redirect to Apple China)
			}
		} else if($isoCode=='cn'){ //China
			$app->lincko->data['appstore'] = 'http://app.xiaomi.com/detail/443977';
		}

		$app->render('/bundles/lincko/wrapper/templates/appstore.twig');
	})
	->name('appstore');

});

$app->get(
	'/captcha(/:total_num(/:width(/:height)))',
	'\bundles\lincko\wrapper\controllers\ControllerCaptcha:get_captcha'
)
->conditions(array(
	'total_num' => '\d+',
	'width' => '\d+',
	'height' => '\d+',
))
->name('captcha');

$app->group('/info', function () use ($app) {
	
	$app->get('/nonetwork', function () use($app) {
		$app->render('/bundles/lincko/wrapper/templates/nonetwork.twig');
	})
	->name('info_nonetwork_get');

	$app->get('/integration', function () use($app) {
		$app->render('/bundles/lincko/wrapper/templates/integration.twig');
	})
	->name('info_integration_get');

});

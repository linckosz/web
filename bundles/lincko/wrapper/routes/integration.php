<?php

namespace bundles\lincko\wrapper\routes;

$app = \Slim\Slim::getInstance();

$app->group('/integration', function () use ($app) {

	$app->group('/wechat', function () use ($app) {

		//Opened on Mobile within Wechat browser (Wechat JS API)
		$app->get(
			'/lincko(/:timeoffset)',
			'\bundles\lincko\wrapper\controllers\integration\ControllerWechat:lincko_get'
		)
		->conditions(array(
			'timeoffset' => '\d*',
		))
		->name('integration_wechat_lincko_get');

		//Opened by Desktop browser after Wechat confirmation on mobile (Wechat Native API)
		$app->get(
			'/weixinjs(/:timeoffset)',
			'\bundles\lincko\wrapper\controllers\integration\ControllerWechat:weixinjs_get'
		)
		->conditions(array(
			'timeoffset' => '\d*',
		))
		->name('integration_wechat_dev_get');

		$app->get(
			'/wxqrcode',
			'\bundles\lincko\wrapper\controllers\integration\ControllerWechat:wxqrcode_get'
		)
		->name('integration_wechat_wxqrcode_get');

		$app->get(
			'/wxofficial',
			'\bundles\lincko\wrapper\controllers\integration\ControllerWechat:official_get'
		)
		->name('integration_wechat_official_get');

		$app->post(
			'/wxofficial',
			'\bundles\lincko\wrapper\controllers\integration\ControllerWechat:official_post'
		)
		->name('integration_wechat_official_post');


		$app->get(
			'/wxgetmedia',
			'\bundles\lincko\wrapper\controllers\integration\ControllerWechat:media_get'
		)
		->name('integration_wechat_media_get');

	});

	//Opened on Mobile after scanning after scanning Lincko integration QR code
	$app->get(
		'/code/:code',
		'\bundles\lincko\wrapper\controllers\integration\ControllerIntegration:code_get'
	)
	->conditions(array(
		'var' => '^\S{8}$',
	))
	->name('integration_code_get');

});

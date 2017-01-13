<?php

namespace bundles\lincko\wrapper\routes;

$app = \Slim\Slim::getInstance();

$app->group('/integration', function () use ($app) {

	$app->group('/wechat', function () use ($app) {

		$app->get(
			'/lincko:var',
			'\bundles\lincko\wrapper\controllers\integration\ControllerWechat:lincko_get'
		)
		->conditions(array(
			'var' => '\S*',
		))
		->name('integration_wechat_public_get');

		$app->get(
			'/weixinjs:var',
			'\bundles\lincko\wrapper\controllers\integration\ControllerWechat:weixinjs_get'
		)
		->conditions(array(
			'var' => '\S*',
		))
		->name('integration_wechat_dev_get');

	});

	$app->get(
		'/code/:code',
		'\bundles\lincko\wrapper\controllers\integration\ControllerIntegration:code_get'
	)
	->conditions(array(
		'var' => '^\S{8}$',
	))
	->name('integration_code_get');

});

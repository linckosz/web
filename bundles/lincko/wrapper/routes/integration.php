<?php

namespace bundles\lincko\wrapper\routes;

$app = \Slim\Slim::getInstance();

$app->group('/integration', function () use ($app) {

	$app->group('/wechat', function () use ($app) {

		$app->get(
			'/public:var',
			'\bundles\lincko\wrapper\controllers\integration\ControllerWechat:public_get'
		)
		->conditions(array(
			'var' => '\S*',
		))
		->name('integration_wechat_public_get');

		$app->get(
			'/dev:var',
			'\bundles\lincko\wrapper\controllers\integration\ControllerWechat:dev_get'
		)
		->conditions(array(
			'var' => '\S*',
		))
		->name('integration_wechat_dev_get');

	});

});

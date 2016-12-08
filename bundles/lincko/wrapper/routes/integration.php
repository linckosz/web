<?php

namespace bundles\lincko\wrapper\routes;

$app = \Slim\Slim::getInstance();

$app->group('/integration', function () use ($app) {

	$app->group('/wechat', function () use ($app) {

		$app->get(
			'/connect:var',
			'\bundles\lincko\wrapper\controllers\integration\ControllerWechat:connect_get'
		)
		->conditions(array(
			'var' => '\S*',
		))
		->name('integration_wechat_connect_get');

	});

});

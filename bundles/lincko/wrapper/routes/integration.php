<?php

namespace bundles\lincko\wrapper\routes;

$app = \Slim\Slim::getInstance();

$app->group('/integration', function () use ($app) {

	$app->group('/wechat', function () use ($app) {

		$app->get(
			'/token:var',
			'\bundles\lincko\wrapper\controllers\integration\ControllerWechat:token_get'
		)
		->conditions(array(
			'var' => '\S*',
		))
		->name('integration_wechat_token_get');

	});

});

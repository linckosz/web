<?php

namespace bundles\lincko\wrapper\routes;

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
	$app->get('/', function () use($app) {
		$app->render('/bundles/lincko/wrapper/templates/appstore.twig');
	})
	->name('appstore');

	//Make sure that we reach us app stores, not foreign country ones
	$app->get('/us', function () use($app) {
		$app->lincko->data['appstore'] = $app->lincko->data['appstore_default'];
		$app->render('/bundles/lincko/wrapper/templates/appstore.twig');
	})
	->name('appstore_us');

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

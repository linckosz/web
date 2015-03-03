<?php

namespace bundles\lincko\wrapper\routes;

$app = \Slim\Slim::getInstance();

$app->group('/wrapper', function () use ($app) {

	$app->map(
		'(/):action',
		'\bundles\lincko\wrapper\controllers\ControllerWrapper:wrap_multi'
	)
	->conditions(array('action' => '[\w\d\/]*'))
	->via('GET', 'POST', 'PUT', 'DELETE');

});

$app->get(
	'/captcha(/:total_num(/:width(/:height)))',
	'\bundles\lincko\wrapper\controllers\ControllerCaptcha:get_captcha'
)
->conditions(array(
	'total_num' => '\d+',
	'width' => '\d+',
	'height' => '\d+'
))
->name('captcha');

$app->group('/debug', function () use ($app) {
	
	if($app->getMode()==='development'){
		$app->get('/', function () use($app) {
			$data = NULL; //Just in order to avoid a bug if we call it in debug.php
			include($app->lincko->path.'/error/debug.php');
		});
		$app->get('/twig', function () use($app) {
			$app->render('/bundles/lincko/wrapper/templates/debug.twig', array(
				'data' => 'a data',
			));
		});
	}

	//Catch JS message error
	$app->post('/js', function () use($app) {
		\libs\Watch::js();
	});

	
});

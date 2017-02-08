<?php

namespace bundles\lincko\wrapper\routes;

$app = \Slim\Slim::getInstance();

$app->group('/debug', function () use ($app) {
	
	if($app->getMode()==='development'){
		$app->get('/', function () use($app) {
			$data = NULL; //Just in order to avoid a bug if we call it in debug.php
			include($app->lincko->path.'/error/debug.php');
		});
		$app->get('/md5', function () use($app) {
			include($app->lincko->path.'/error/md5.php');
		});
		$app->get('/twig', function () use($app) {
			$app->render('/bundles/lincko/wrapper/templates/debug.twig', array(
				'data' => 'a data',
			))
			->name('debug_md5_get');
		});
	}

	//Catch JS message error
	$app->post('/js', function () use($app) {
		\libs\Watch::js();
	});

});

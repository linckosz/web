<?php

namespace bundles\lincko\app\routes;

use \libs\OneSeventySeven;

$app = \Slim\Slim::getInstance();

$app->get('/', function () use($app) {
	if($app->lincko->data['logged']){
		$_SESSION['workspace'] = $app->lincko->data['workspace'];
		$app->lincko->translation['workspace'] = $app->lincko->data['workspace'];
		$app->lincko->data['reset_data'] = OneSeventySeven::get('reset_data');
		if($app->lincko->data['reset_data']){
			OneSeventySeven::unsetKey('reset_data');
		}
		$app->render('/bundles/lincko/app/templates/app/application.twig');
	} else {
		$app->router->getNamedRoute('home')->dispatch();
	}
})
->name('root');

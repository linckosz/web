<?php

namespace bundles\lincko\app\routes;

$app = \Slim\Slim::getInstance();

$app->get('/', function () use($app) {
	
	if($app->lincko->data['logged']){
		$app->lincko->data['user'] = \bundles\lincko\wrapper\models\Session::getData('yonghu');
		$app->render('/bundles/lincko/app/templates/app/application.twig');
	} else {
		$app->router->getNamedRoute('home')->dispatch();
	}

})
->name('root');


<?php

namespace bundles\lincko\app\routes;

$app = \Slim\Slim::getInstance();

$app->get('/', function () use($app) {
	
	if(
		\bundles\lincko\wrapper\models\Session::getData('yonghu')
		&& \bundles\lincko\wrapper\models\Session::getData('youjian')
		&& \bundles\lincko\wrapper\models\Session::getData('mima')
		&& \bundles\lincko\wrapper\models\Session::getData('jizhu')
	){
		$app->render('/bundles/lincko/app/templates/app/application.twig');
	} else {
		$app->router->getNamedRoute('home')->dispatch();
	}

})
->name('root');

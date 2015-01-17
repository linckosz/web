<?php

namespace bundles\lincko\app\routes;

$app = \Slim\Slim::getInstance();

$app->get('/', function () use($app) {
	
	if($app->getCookie('yonghu', false) && $app->getCookie('youjian', false) && $app->getCookie('mima', false) && $app->getCookie('jizhu', false)){
		$app->render('/bundles/lincko/app/templates/application.twig');
	} else {
		$app->router->getNamedRoute('home')->dispatch();
	}

})
->name('root');

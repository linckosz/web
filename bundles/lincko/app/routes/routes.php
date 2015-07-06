<?php

namespace bundles\lincko\app\routes;

$app = \Slim\Slim::getInstance();

$app->get('/(workspace/:company)', function ($company = null) use($app) {
	$company = strtolower($company);
	if($app->lincko->data['logged']){
		$app->setCookie('gongsi', $company);
		$app->lincko->data['company'] = $company;
		$app->lincko->data['user'] = \bundles\lincko\wrapper\models\Session::getData('yonghu');
		$app->render('/bundles/lincko/app/templates/app/application.twig');
	} else {
		$app->router->getNamedRoute('home')->dispatch();
	}

})
->conditions(array('company' => '[a-zA-Z0-9]{3,104}'))
->name('root');


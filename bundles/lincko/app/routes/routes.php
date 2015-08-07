<?php

namespace bundles\lincko\app\routes;

use \libs\OneSeventySeven;

$app = \Slim\Slim::getInstance();

$app->get('/', function () use($app) {
	$app->router->getNamedRoute('root_workspace_company')->dispatch();
})
->name('root');

$app->get('/(workspace/:company)', function ($company = null) use($app) {
	$company = strtolower($company);
	if($app->lincko->data['logged']){
		$app->lincko->data['company'] = $_SESSION['company'] = $company;
		$app->lincko->translation['company'] = $company;
		$app->lincko->data['reset_data'] = OneSeventySeven::get('reset_data');
		if($app->lincko->data['reset_data']){
			OneSeventySeven::unsetKey('reset_data');
		}
		$app->render('/bundles/lincko/app/templates/app/application.twig');
	} else {
		$app->router->getNamedRoute('home')->dispatch();
	}

})
->conditions(array('company' => '[a-zA-Z0-9]{3,104}'))
->name('root_workspace_company');


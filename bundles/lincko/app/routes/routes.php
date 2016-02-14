<?php

namespace bundles\lincko\app\routes;

use \libs\OneSeventySeven;

$app = \Slim\Slim::getInstance();

$app->get('/', function () use($app) {
	$app->router->getNamedRoute('root_workspace_company')->dispatch();
})
->name('root');

$app->get('/(:space/:company(/:username))', function ($space = null, $company = null, $username = null) use($app) {
	$company = strtolower($company);
	$space = strtolower($space);
	$username = strtolower($username);
	if($app->lincko->data['logged']){
		$app->lincko->data['company'] = $_SESSION['company'] = $company;
		$app->lincko->translation['company'] = $company;
		if($space=='user'){
			$app->lincko->data['space'] = 'user';
			$app->lincko->translation['company'] = 'private_'.$username;
		}
		if($space=='workspace'){
			$app->lincko->data['space'] = 'workspace';
		}
		$app->lincko->data['reset_data'] = OneSeventySeven::get('reset_data');
		if($app->lincko->data['reset_data']){
			OneSeventySeven::unsetKey('reset_data');
		}
		$app->render('/bundles/lincko/app/templates/app/application.twig');
	} else {
		$app->router->getNamedRoute('home')->dispatch();
	}

})
->conditions(array('space' => 'user|workspace'))
->conditions(array('company' => '[a-zA-Z0-9]{3,104}|\d+'))
->conditions(array('username' => '\S{1,104}'))
->name('root_workspace_company');

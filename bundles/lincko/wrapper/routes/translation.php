<?php

namespace bundles\lincko\wrapper\routes;

$app = \Slim\Slim::getInstance();

$app->group('/translation', function () use ($app) {

	$app->get(
		'/list.js',
		'\bundles\lincko\wrapper\controllers\ControllerTranslation:list_get'
	)
	->name('translation_list');

	$app->get(
		'/date.js',
		'\bundles\lincko\wrapper\controllers\ControllerDate:date_get'
	)
	->name('translation_date');

	$app->post(
		'/language',
		'\bundles\lincko\wrapper\controllers\ControllerTranslation:language_set'
	)
	->name('translation_language');

});

$app->post('/language/(:route)', function ($route = NULL) use($app) {
	$ControllerTranslation = new \bundles\lincko\wrapper\controllers\ControllerTranslation();
	$ControllerTranslation->language_set();
	$app->response->redirect('/'.$route, 303);
})
->conditions(array('route' => '[\w\d\/]*'));
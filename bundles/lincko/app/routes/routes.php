<?php

namespace bundles\lincko\app\routes;

use \libs\OneSeventySeven;

$app = \Slim\Slim::getInstance();

$app->get('/', function () use ($app) {
	if($app->lincko->data['logged']){
		$_SESSION['workspace'] = $app->lincko->data['workspace'];
		$app->lincko->translation['workspace'] = $app->lincko->data['workspace'];
		$app->lincko->data['reset_data'] = OneSeventySeven::get('reset_data');
		if($app->lincko->data['reset_data']){
			OneSeventySeven::unsetKey('reset_data');
		}
		$app->render('/bundles/lincko/app/templates/app/application.twig');
	} else {
		$app->lincko->data['force_open_website'] = false;
		$app->router->getNamedRoute('home')->dispatch();
	}
})
->name('root');

/*
toto => only use this way if user complain about speed or access to HK DC
$app->get(
	'/file/:type/:id/:name',
	'\bundles\lincko\app\controllers\ControllerFile:file_open_get'
)
->conditions(array(
	'type' => 'link|thumbnail',
	'id' => '\d+',
	'name' => '.+\.\w+',
))
->name('file_open_get');
*/

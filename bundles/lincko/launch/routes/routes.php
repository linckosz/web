<?php

namespace bundles\lincko\launch\routes;

use \bundles\lincko\wrapper\models\Creation;

$app = \Slim\Slim::getInstance();

function web_wrapper_user_created(){
	$app = \Slim\Slim::getInstance();
	//We need to insure we are working outside a workspace
	$app->lincko->data['workspace'] = $_SESSION['workspace'] = '';
	$app->lincko->data = array_merge( $app->lincko->data, array('wrapper_user_created' => Creation::exists(),) );
}

$app->get('/home', function () use($app) {
	web_wrapper_user_created();
	$app->render('/bundles/lincko/launch/templates/launch/home.twig');
})
->name('home');

$app->get('/beta/:beta_code', function ($beta_code) use ($app) {
	$app = \Slim\Slim::getInstance();
	//We need to insure we are working outside a workspace
	$app->lincko->data['beta_code'] = $_SESSION['beta_code'] = $beta_code;
	$app->router->getNamedRoute('home')->dispatch();
})
->conditions(array(
	'total_num' => '[a-z0-9]{6}',
))
->name('beta');

$app->get(
	'/mailchimp',
	'\bundles\lincko\launch\controllers\ControllerMailchimp:subscribe'
)
->via('POST')
->name('mailchimp');

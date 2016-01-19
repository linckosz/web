<?php

namespace bundles\lincko\web\routes;

use \bundles\lincko\wrapper\models\Creation;

$app = \Slim\Slim::getInstance();

function web_wrapper_user_created(){
	$app = \Slim\Slim::getInstance();
	//We need to insure we are working outside a workspace
	$app->lincko->data['company'] = $_SESSION['company'] = '';
	$app->lincko->data = array_merge( $app->lincko->data, array('wrapper_user_created' => Creation::exists(),) );
}

$app->get('/sample/', function () use($app) {
	web_wrapper_user_created();
	$app->render('/bundles/lincko/web/templates/sample.twig');
})
->name('sample');

$app->get('/home', function () use($app) {
	web_wrapper_user_created();
	$app->render('/bundles/lincko/web/templates/web/home.twig');
})
->name('home');

$app->get('/features', function () use($app) {
	web_wrapper_user_created();
	$app->render('/bundles/lincko/web/templates/web/features.twig');
})
->name('features');

$app->get('/price', function () use($app) {
	web_wrapper_user_created();
	$app->render('/bundles/lincko/web/templates/web/price.twig');
})
->name('price');

$app->get('/download', function () use($app) {
	web_wrapper_user_created();
	$app->render('/bundles/lincko/web/templates/web/download.twig');
})
->name('download');

$app->get('/help', function () use($app) {
	web_wrapper_user_created();
	$app->render('/bundles/lincko/web/templates/web/help.twig');
})
->name('help');

$app->group('/account', function () use ($app) {

	$app->get('/forgot', function () use($app) {
		web_wrapper_user_created();
		$app->render('/bundles/lincko/web/templates/account/forgot.twig');
	})
	->name('account_forgot');

});

/*
$app->get('/test', function () use($app) {
	web_wrapper_user_created();
	$app->render('/bundles/lincko/web/templates/generic/test.twig');
})
->name('test');
*/
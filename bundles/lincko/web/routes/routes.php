<?php

namespace bundles\lincko\web\routes;

$app = \Slim\Slim::getInstance();

$app->get('/sample/', function () use($app) {
	$app->render('/bundles/lincko/web/templates/sample.twig');
})
->name('sample');

$app->get('/home', function () use($app) {
	$app->render('/bundles/lincko/web/templates/web/home.twig');
})
->name('home');

$app->get('/features', function () use($app) {
	$app->render('/bundles/lincko/web/templates/web/features.twig');
})
->name('features');

$app->get('/price', function () use($app) {
	$app->render('/bundles/lincko/web/templates/web/price.twig');
})
->name('price');

$app->get('/download', function () use($app) {
	$app->render('/bundles/lincko/web/templates/web/download.twig');
})
->name('download');

$app->get('/help', function () use($app) {
	$app->render('/bundles/lincko/web/templates/web/help.twig');
})
->name('help');

$app->get('/test', function () use($app) {
	$app->render('/bundles/lincko/web/templates/generic/test.twig');
})
->name('test');

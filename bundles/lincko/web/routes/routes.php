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

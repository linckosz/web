<?php

namespace bundles\lincko\wrapper\routes;

$app = \Slim\Slim::getInstance();

$app->group('/export', function () use ($app) {

	$app->get(
		'/data.csv',
		'\bundles\lincko\wrapper\controllers\ControllerExport:csv_get'
	)
	->name('export_csv');

});

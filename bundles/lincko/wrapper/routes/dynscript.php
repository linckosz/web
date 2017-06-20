<?php

namespace bundles\lincko\wrapper\routes;

$app = \Slim\Slim::getInstance();

$app->get(
	'/dynscript/:md5.js',
	'\bundles\lincko\wrapper\controllers\ControllerDynscript:regroup_get'
)
->conditions(array(
	'md5' => '\w+',
))
->name('dynscript_regroup_get');

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
	$app->lincko->data['page_redirect'] = '';
	$app->render('/bundles/lincko/launch/templates/launch/home.twig');
})
->name('home');

$app->get('/page(/:page_redirect)', function ($page_redirect='') use($app) {
	web_wrapper_user_created();
	$app->lincko->data['page_redirect'] = $page_redirect;
	$app->render('/bundles/lincko/launch/templates/launch/home.twig');
})
->conditions(array(
	'page_redirect' => '.*',
))
->name('page');

$app->get('/invitation/:invitation_code', function ($invitation_code) use ($app) {
	$app->lincko->data['invitation_code'] = $_SESSION['invitation_code'] = $invitation_code;
	$app->router->getNamedRoute('home')->dispatch();
})
->conditions(array(
	'invitation_code' => '[a-z0-9]{8}',
))
->name('invitation');

$app->get('/uid/:user_code', function ($user_code) use ($app) {
	$app->lincko->data['user_code'] = $_SESSION['user_code'] = $user_code;
	$app->router->getNamedRoute('home')->dispatch();
})
->conditions(array(
	'user_code' => '\S+',
))
->name('uid');

$app->get('/user/:user_action', function ($user_action='') use ($app) {
	web_wrapper_user_created();
	$app->lincko->data['user_action'] = $user_action;
	$app->render('/bundles/lincko/launch/templates/launch/home.twig');
})
->conditions(array(
	'user_action' => '\S+',
))
->name('user');

$app->get(
	'/mailchimp',
	'\bundles\lincko\launch\controllers\ControllerMailchimp:subscribe'
)
->via('POST')
->name('mailchimp');

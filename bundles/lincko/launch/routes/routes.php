<?php

namespace bundles\lincko\launch\routes;

use \libs\OneSeventySeven;
use \bundles\lincko\wrapper\models\Creation;
use \bundles\lincko\wrapper\controllers\ControllerWrapper;

$app = \Slim\Slim::getInstance();

function web_wrapper_user_created(){
	$app = \Slim\Slim::getInstance();
	$app->lincko->data = array_merge( $app->lincko->data, array('wrapper_user_created' => Creation::exists(),) );
}

//Return at the home page
$app->get('/home', function () use($app) {
	web_wrapper_user_created();
	$app->lincko->data['page_redirect'] = '';
	$app->lincko->data['link_reset'] = true;
	$app->render('/bundles/lincko/launch/templates/launch/home.twig');
})
->name('home');

//Page redirection for blog
$app->get('/page(/:page_redirect)', function ($page_redirect='') use($app) {
	web_wrapper_user_created();
	$app->lincko->data['page_redirect'] = $page_redirect;
	$app->lincko->data['link_reset'] = true;
	$app->render('/bundles/lincko/launch/templates/launch/home.twig');
})
->conditions(array(
	'page_redirect' => '.*',
))
->name('page');

//URL invitation to login that include a user connection
$app->get('/invitation/:invitation_code', function ($invitation_code) use ($app) {
	$app->lincko->data['invitation_code'] = $_SESSION['invitation_code'] = $invitation_code;
	$app->lincko->data['link_reset'] = true;
	$app->lincko->data['force_open_website'] = false;
	if($app->lincko->data['logged']){
		$app->router->getNamedRoute('root')->dispatch();
	} else {
		//It helps to fillin the field with proper email
		if(!OneSeventySeven::get('youjian')){
			$data = new \stdClass;
			$data->invitation_code = $invitation_code;
			$controller = new ControllerWrapper($data, 'post', false);
			if($response = $controller->wrap_multi('invitation/email')){
				if(isset($response->msg) && !empty($response->msg)){
					$email = trim($response->msg);
					if(filter_var($email, FILTER_VALIDATE_EMAIL)){
						$app->lincko->data['new_email'] = $email;
					}
				}
			}
		}
		$app->router->getNamedRoute('home')->dispatch();
	}
})
->conditions(array(
	'invitation_code' => '[a-z0-9]{8}',
))
->name('invitation');

//URL invitation to login that include a user connection
$app->get('/v/:sales_code', function ($sales_code) use ($app) {
	$app->lincko->data['sales_code'] = $_SESSION['sales_code'] = $sales_code;
	$app->lincko->data['link_reset'] = true;
	$app->lincko->data['force_open_website'] = false;
	if($app->lincko->data['logged']){
		$app->router->getNamedRoute('root')->dispatch();
	} else {
		$app->router->getNamedRoute('home')->dispatch();
	}
})
->conditions(array(
	'sales_code' => '[a-z\d]+',
))
->name('sales');

//Link of user URL for direct connection (like scanning a QR code)
$app->get('/uid/:user_code(_:guest_access)', function ($user_code, $guest_access=false) use ($app) {
	//Need to grab the uri ourself because slim has a bug and convert "+" into a space
	$user_code = str_replace(' ', '+', $user_code);
	if($guest_access){
		$guest_access = str_replace(' ', '+', $guest_access);
	}
	$app->lincko->data['user_code'] = $_SESSION['user_code'] = $user_code;
	if($guest_access){
		if($guest_access = base64_decode($guest_access)){
			$app->lincko->data['guest_access'] = $_SESSION['guest_access'] = $guest_access;
		}
	}
	$app->lincko->data['link_reset'] = true;
	$app->lincko->data['force_open_website'] = false;
	if($app->lincko->data['logged']){
		$app->router->getNamedRoute('root')->dispatch();
	} else {
		$app->router->getNamedRoute('home')->dispatch();
	}
})
->conditions(array(
	'user_code' => '[A-Za-z0-9+/=]+',
	'guest_access' => '[A-Za-z0-9+/=]+',
))
->name('uid');

//Link of user URL for direct connection (like scanning a QR code)
$app->get('/pid/:wid/:pid/:qrcode', function ($wid, $pid, $qrcode) use ($app) {
	//Record the information to enter the opened project
	$_SESSION['project_qrcode'] = array(
		$wid,
		$pid,
		$qrcode,
	);
	$app->lincko->data['link_reset'] = true;
	$app->lincko->data['force_open_website'] = false;
	if($app->lincko->data['logged']){
		$app->router->getNamedRoute('root')->dispatch();
	} else {
		$app->router->getNamedRoute('home')->dispatch();
	}
})
->conditions(array(
	'wid' => '\d+',
	'pid' => '\d+',
	'qrcode' => '\w{8}',
))
->name('pid');

//used for direct linked "forgot password", "sigin", etc
$app->get('/user/:user_action', function ($user_action='') use ($app) {
	web_wrapper_user_created();
	$app->lincko->data['user_action'] = $user_action;
	$app->lincko->data['link_reset'] = true;
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

//It helps to save the hashtag into PHP session because nginx is not able to see hashtag (so PHP does)
$app->get('/hashtag/:hashtag', function ($hashtag='') use ($app) {
	setcookie('hashtag', $hashtag, time()+3600, '/'); //Valid 1H
	echo $hashtag;
	return exit(0);
})
->conditions(array(
	'hashtag' => '\S+',
))
->name('hashtag');


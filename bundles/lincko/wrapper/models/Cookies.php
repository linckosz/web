<?php

namespace bundles\lincko\wrapper\models;


class Cookies {

	public static function getCookie($cookie){
		$app = \Slim\Slim::getInstance();
		if($app->getCookie($cookie, false)){
			return $app->getCookie($cookie, false);
		} else if(!$app->getCookie('yonghu', false) && $cookie==='jizhu'){
			//By default we allow the user to remember his credential, to be setup only if the user name is not saved in cookies (= first time)
			return true;
		}

	}

}
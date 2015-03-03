<?php

namespace bundles\lincko\wrapper\models;


class Session {

	public static function getData($cookie){
		$app = \Slim\Slim::getInstance();
		if(isset($_SESSION[$cookie])){
			return $_SESSION[$cookie];
		}
		if($app->getCookie($cookie, false)){
			return $app->getCookie($cookie, false);
		} else if(!$app->getCookie('yonghu', false) && $cookie==='jizhu'){
			//By default we allow the user to remember his credential, to be setup only if the user name is not saved in cookies (= first time)
			return true;
		}
		return false;
	}

}
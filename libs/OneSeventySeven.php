<?php

namespace libs;

use \Exception;
use \Slim\Http\Util;

class OneSeventySeven {

	//This variable keep track of all cookies set and then run setCookie by a hook function at alim.after
	protected static $cookies = array();

	//Help to not run many time the data fetching for cookies
	protected static $first = true;

	//Tell if there is any change. Only if yes, we modify the cookie
	protected static $change = false;

	//We set values in memory first, then at slim.after we set the cookie
	public static function set($array){
		$app = \Slim\Slim::getInstance();
		if(!is_array($array) && !empty($array)){
			throw new Exception("OneSeventySeven::set => The variable must be an array not empty.");
			return false;
		}
		self::getCookies();
		//Add or Update key/value
		foreach($array as $key => $value) {
			self::$cookies[$key] = $value;
			$_SESSION['one_seventy_seven'][$key] = $value;
		}
		self::$change = true;
		return true;
	}

	public static function get($key){
		$app = \Slim\Slim::getInstance();
		if(!is_string($key) && !empty($key)){
			throw new Exception("OneSeventySeven::get => The variable must be a string not empty.");
			return null;
		}
		self::getCookies();
		if(isset(self::$cookies[$key])){
			return self::$cookies[$key];
		}
		return null;
	}

	public static function getCookies(){
		//Assign only once all real cookies to memory
		if(self::$first || count(self::$cookies)<=0){
			$app = \Slim\Slim::getInstance();
			if($one_seventy_seven = $app->getCookie('one_seventy_seven', false)){
				$one_seventy_seven = json_decode($one_seventy_seven);
				foreach($one_seventy_seven as $key => $value) {
					if(!isset(self::$cookies[$key])){
						self::$cookies[$key] = $value;
					}
				}
			}
			if(isset($_SESSION['one_seventy_seven'])){
				foreach($_SESSION['one_seventy_seven'] as $key => $value) {
					//The session overwrite cookies
					self::$cookies[$key] = $value;
				}
			}
			if(isset($_SESSION)){
				//Stop checking only once the session (=database) is available
				self::$first = false;
			}
			return self::$cookies;
		}
		return false;
	}

	public static function unsetKey($key){
		$app = \Slim\Slim::getInstance();
		if(!is_string($key) && !empty($key)){
			throw new Exception("OneSeventySeven::unsetKey => The variable must be a string not empty.");
			return false;
		}
		self::getCookies();
		unset(self::$cookies[$key]);
		if(isset($_SESSION['one_seventy_seven'])){
			unset($_SESSION['one_seventy_seven'][$key]);
		}
		self::$change = true;
		return true;
	}

	public static function unsetAll($array_exception = array()){
		if(!is_array($array_exception)){
			throw new Exception("OneSeventySeven::unsetAll => The variable must be an array.");
			return false;
		}
		foreach(self::$cookies as $key => $value) {
			if(!in_array($key, $array_exception)){
				unset(self::$cookies[$key]);
			}
		}
		if(isset($_SESSION['one_seventy_seven'])){
			foreach($_SESSION['one_seventy_seven'] as $key => $value) {
				if(!in_array($key, $array_exception)){
					unset($_SESSION['one_seventy_seven'][$key]);
				}
			}
		}
		self::$change = true;
		return true;
	}

	//To be launch after we finish to set all cookies value, at slim.after as a hook
	public static function setCookies(){
		if(self::$change){
			$app = \Slim\Slim::getInstance();
			//Re/create the cookie
			if(!empty(self::$cookies)){
				$_SESSION['one_seventy_seven'] = self::$cookies;
				//Do no use " $app->setCookie('one_seventy_seven', json_encode(self::$cookies)); " avoid cookie issue that keep its status accross non-ssl and ssl site and different subdomains
				$json = self::encodeSecureCookie(json_encode(self::$cookies), $app->lincko->cookies_lifetime);
				setcookie('one_seventy_seven', $json, $app->lincko->cookies_lifetime, '/', '.'.$app->lincko->domain);
			} else {
				unset($_SESSION['one_seventy_seven']);
				$app->deleteCookie('one_seventy_seven');
				setcookie('one_seventy_seven', null, time()-3600, '/', '.'.$app->lincko->domain);
				self::$first = true;
			}
		}
		return true;
	}

	public static function encodeSecureCookie($data, $expire){
		$app = \Slim\Slim::getInstance();
		$data = Util::encodeSecureCookie(
			$data,
			$expire,
			$app->config('cookies.secret_key'),
			$app->config('cookies.cipher'),
			$app->config('cookies.cipher_mode')
		);
		return $data;
	}

}

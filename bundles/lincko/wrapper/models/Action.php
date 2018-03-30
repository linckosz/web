<?php


namespace bundles\lincko\wrapper\models;

use \bundles\lincko\wrapper\controllers\ControllerWrapper;

class Action {

	protected static $user_info_done = false;
	protected static $user_info = array(
		'Windows', //[OS] Windows, Macintosh, Android
		'Desktop', //[Device] Desktop, Tablet, Mobile
		'Browser', //[Platform] Browser, Wechat, App (can only from JS)
		false, //[IP]
	);

	//Add these functions to insure that nobody can make them disappear
	public function delete(){ return false; }
	public function restore(){ return false; }

	public static function record($action, $info=null){
		if(!is_numeric($action)){
			return false;
		}
		if($action>0){
			$action = -$action; //Make sure e send negative value as front indication
		}
		$data = new \stdClass;
		$data->action = $action;
		$data->info = $info;
		$controller = new ControllerWrapper($data, 'post', false);
		return $controller->wrap_multi('info/action');
	}

	public static function getUserInfo(){
		$app = \Slim\Slim::getInstance();
		if(!self::$user_info_done && isset($_SERVER) && isset($_SERVER['HTTP_USER_AGENT'])){
			if(stripos($_SERVER['HTTP_USER_AGENT'], 'MicroMessenger')){
				self::$user_info[2] = 'Wechat';
			}
			if(preg_match("/iPhone|iPad|iPod|Macintosh|iOS/ui", $_SERVER['HTTP_USER_AGENT'])){
				self::$user_info[0] = 'Macintosh';
				if(stripos($_SERVER['HTTP_USER_AGENT'], 'iPhone')){
					self::$user_info[1] = 'Mobile';
				} else if(preg_match("/iPad|iPod/ui", $_SERVER['HTTP_USER_AGENT'])){
					self::$user_info[1] = 'Tablet';
				}
			} else if(stripos($_SERVER['HTTP_USER_AGENT'], 'BlackBerry')){
				self::$user_info[0] = 'BlackBerry';
				self::$user_info[1] = 'Mobile';
			} else if(stripos($_SERVER['HTTP_USER_AGENT'], 'Palm')){
				self::$user_info[0] = 'Palm';
				self::$user_info[1] = 'Mobile';
			} else if(stripos($_SERVER['HTTP_USER_AGENT'], 'Android')){
				self::$user_info[0] = 'Android';
				self::$user_info[1] = 'Mobile';
			} else if(stripos($_SERVER['HTTP_USER_AGENT'], 'Linux')){
				self::$user_info[0] = 'Linux';
			}
			if(self::$user_info[1] == 'Desktop' && preg_match("/webOS|iPhone|iPad|BlackBerry|Windows Phone|Opera Mini|IEMobile|Mobile/ui", $_SERVER['HTTP_USER_AGENT'])){
				self::$user_info[1] = 'Mobile';
			}
			if(isset($_COOKIE['ip'])){
				self::$user_info[3] = $_COOKIE['ip'];
			} else if(isset($_SERVER['REMOTE_ADDR'])){
				self::$user_info[3] = $_SERVER['REMOTE_ADDR'];
			} else {
				self::$user_info[3] = $app->request->getIp();
			}
			self::$user_info_done = true;
		}
		return self::$user_info;
	}

}

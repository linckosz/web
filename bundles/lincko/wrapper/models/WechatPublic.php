<?php


namespace bundles\lincko\wrapper\models;

use \bundles\lincko\wrapper\controllers\ControllerWrapper;
use \libs\Wechat;
use \libs\STR;

//This class help to reuse token and ticket stored in backend
class WechatPublic {

	protected static $access_token = false;
	protected static $expire_access_token = 0;

	protected static $jsapi_ticket = false;
	protected static $expire_jsapi_ticket = 0;

	protected static function refresh(){
		$app = \Slim\Slim::getInstance();
		$controller = new ControllerWrapper(null, 'post', false);
		if($response = $controller->wrap_multi('integration/get_wechat_token')){
			if(isset($response->msg)){
				if(isset($response->msg->access_token) && isset($response->msg->expire_access_token)){
					self::$access_token = $response->msg->access_token;
					self::$expire_access_token = $response->msg->expire_access_token;
				}
				if(isset($response->msg->jsapi_ticket) && isset($response->msg->expire_jsapi_ticket)){
					self::$jsapi_ticket = $response->msg->jsapi_ticket;
					self::$expire_jsapi_ticket = $response->msg->expire_jsapi_ticket;
				}
			}
		}
	}

	public static function access_token(){
		$app = \Slim\Slim::getInstance();
		if(self::$expire_access_token <= time() || !self::$access_token){
			self::refresh();
			if(self::$expire_access_token <= time() || !self::$access_token){
				self::$access_token = false;
				self::$expire_access_token = 0;
				$option = array();
				$option['appid'] = $app->lincko->integration->wechat['public_appid'];
				$option['secret'] = $app->lincko->integration->wechat['public_secretapp'];
				$wechat = new Wechat($option);
				if(self::$access_token = $wechat->getToken()){
					self::$expire_access_token = time() + 3600;
				}
			}
		}
		return self::$access_token;
	}

	public static function jsapi_ticket(){
		$app = \Slim\Slim::getInstance();
		if(self::$expire_jsapi_ticket <= time() || !self::$jsapi_ticket){
			self::refresh();
			if(self::$expire_jsapi_ticket <= time() || !self::$jsapi_ticket){
				self::$jsapi_ticket = false;
				self::$expire_jsapi_ticket = 0;
				$option = array();
				$option['appid'] = $app->lincko->integration->wechat['public_appid'];
				$option['secret'] = $app->lincko->integration->wechat['public_secretapp'];
				if($option['access_token'] = self::access_token()){
					$wechat = new Wechat($option);
					if(self::$jsapi_ticket = $wechat->getJsapiTicket()){
						self::$expire_jsapi_ticket = time() + 3600;
					}
				}
			}
		}
		return self::$jsapi_ticket;
	}

	//added by Sky Park
	//used for wechat JSSDK, for javascript wx.config parameters
	public static function getPackage(){
		$app = \Slim\Slim::getInstance();
		$ticket = self::jsapi_ticket();
		$url = $_SERVER['REQUEST_SCHEME'].'://'.$_SERVER['HTTP_HOST'].'/';
		$nonceStr = STR::random(16);
		$timestamp = time();
		$signature = sha1("jsapi_ticket=$ticket&noncestr=$nonceStr&timestamp=$timestamp&url=$url");
		$result['appId'] = $app->lincko->integration->wechat['public_appid'];
		$result['timestamp'] = $timestamp;
		$result['nonceStr'] = $nonceStr;
		$result['signature'] = $signature;
		return $result;
	}

}

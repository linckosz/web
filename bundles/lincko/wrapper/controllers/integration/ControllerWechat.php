<?php

namespace bundles\lincko\wrapper\controllers\integration;

use \bundles\lincko\wrapper\controllers\ControllerWrapper;
use \bundles\lincko\wrapper\models\WechatPublic;
use \libs\Controller;
use \libs\OneSeventySeven;
use \libs\Wechat;
use WideImage\WideImage;


class ControllerWechat extends Controller {

	protected $app = NULL;
	protected $get = NULL;
	protected $appid = NULL;
	protected $secret = NULL;

	public function __construct(){
		$app = $this->app = \Slim\Slim::getInstance();
		$this->get = $app->request->get();
		return true;
	}

	public function weixinjs_get($timeoffset=0){
		$app = $this->app;
		$this->appid = $app->lincko->integration->wechat['dev_appid'];
		$this->secret = $app->lincko->integration->wechat['dev_secretapp'];
		$this->process('dev', $timeoffset);
	}

	public function lincko_get($timeoffset=0){
		$app = $this->app;
		$app->lincko->data['force_open_website'] = false;
		$this->appid = $app->lincko->integration->wechat['public_appid'];
		$this->secret = $app->lincko->integration->wechat['public_secretapp'];
		$this->process('pub', $timeoffset);
	}

	protected function process($account, $timeoffset=0){
		$app = $this->app;
		$response = $this->get;
		$access_token = false;
		$unionid = false;
		$openid = false;
		$state = false;
		$valid = false;

		$timeoffset = (int) $timeoffset;
		if($timeoffset<0){
			$timeoffset = 24 + $timeoffset;
		}
		if($timeoffset>=24){
			$timeoffset = 0;
		}

		if($response && isset($response['code']) && isset($response['state'])){
			$state = $response['state'];
			$param = array(
				'appid' => $this->appid,
				'secret' => $this->secret,
				'code' => $response['code'],
			);
			$response = $this->curl_get('authorization_code', $param);
			if($response && $result = json_decode($response)){
				if(isset($result->errcode)){
					$response = false;
				}
			}
		} else {
			$response = false;
		}

		if($state == 'snsapi_userinfo'){
			if($response && $result = json_decode($response)){
				if(isset($result->unionid)){
					$unionid = $result->unionid;
				}
				if(isset($result->access_token) && isset($result->openid) && !empty($result->openid)){
					$access_token = $result->access_token;
					$openid = $result->openid;
					$param = array(
						'access_token' => $access_token,
						'openid' => $openid,
						'lang' => $app->trans->getClientLanguage(),
					);
					$response = $this->curl_get('snsapi_userinfo', $param);
					if($response && $result = json_decode($response)){
						if(isset($result->errcode)){
							$response = false;
						}
					}
				}
			} else {
				$response = false;
			}

			if($response && $access_token && $unionid && !empty($unionid) && $result = json_decode($response)){
				$data = new \stdClass;
				
				/*
					Using OpenID is more restrictive because it's different from DEV and PUBLIC account (UnionID is same),
					but the advantage is that it will work on .cafe and .co (sandbox bruno wechat), and we can skip a confirmation because snsapi_base is providing OpenID without notification instead of snsapi_userinfo
				$data->party = 'wechat_'.$account;
				$data->party_id = 'oid.'.$account.'.'.$openid;
				*/
				$data->party = 'wechat';
				$data->party_id = 'uid.'.$unionid;
				$data->timeoffset = $timeoffset;
				$result->account = $account;
				$data->data = $result;
				$controller = new ControllerWrapper($data, 'post', false);
				if($response = $controller->wrap_multi('integration/connect')){
					$valid = false;
					if(!isset($response->status) || $response->status != 200){
						$response = false;
					} else {
						$valid = true;
						if(isset($response->flash->username_sha1) && isset($response->flash->uid)){
							OneSeventySeven::set(array('sha' => substr($response->flash->username_sha1, 0, 20))); //Truncate to 20 character because phone alias notification limitation
							OneSeventySeven::set(array('uid' => $response->flash->uid));
						} else {
							$valid = false;
						}
						//Helps to not keep real creadential information on user computer, but only an encrypted code
						if(isset($response->flash->log_id)){
							OneSeventySeven::set(array('hahaha' => $response->flash->log_id));
						} else {
							$valid = false;
						}
						//After signin, it return the username, it's only used once to display the user name faster than the local storage.
						//It's almost useless
						if(isset($response->flash->username)){
							OneSeventySeven::set(array('yonghu' => $response->flash->username));
						}
						//Used to display/download files in a secured way and keep browser cache enable (same url)
						if(isset($response->flash->pukpic)){
							setcookie('pukpic', $response->flash->pukpic, time()+intval($app->lincko->cookies_lifetime), '/', $app->lincko->domain);
							OneSeventySeven::set(array('pukpic' => $response->flash->pukpic));
						} else {
							$valid = false;
						}
					}
					\bundles\lincko\wrapper\hooks\SetData(); //used to help log in immediatly
				}
			} else {
				$response = false;
			}

		} else {
			$app->lincko->data['integration_wechat_new'] = true; //Check if OpenID exists, if not it redirect to create an account
			if($response && $result = json_decode($response)){
				if(isset($result->access_token) && isset($result->openid) && !empty($result->openid) && isset($result->unionid) && !empty($result->unionid)){
					$access_token = $result->access_token;
					$openid = $result->openid;
					$unionid = $result->unionid;

					$data = new \stdClass;
					/*
						Using OpenID is more restrictive because it's different from DEV and PUBLIC account (UnionID is same),
						but the advantage is that it will work on .cafe and .co (sandbox bruno wechat), and we can skip a confirmation because snsapi_base is providing OpenID without notification instead of snsapi_userinfo
					$data->party = 'wechat_'.$account;
					$data->party_id = 'oid.'.$account.'.'.$openid;
					*/
					$data->party = 'wechat';
					$data->party_id = 'uid.'.$unionid;
					$data->timeoffset = $timeoffset;
					$result->account = $account;
					$data->data = $result;
					$controller = new ControllerWrapper($data, 'post', false);
					if($response = $controller->wrap_multi('integration/connect')){
						if(!isset($response->status) || $response->status != 200){
							$response = false;
						} else {
							$valid = false;
							if(!isset($response->status) || $response->status != 200){
								$response = false;
							} else {
								$valid = true;
								if(isset($response->flash->username_sha1) && isset($response->flash->uid)){
									OneSeventySeven::set(array('sha' => substr($response->flash->username_sha1, 0, 20))); //Truncate to 20 character because phone alias notification limitation
									OneSeventySeven::set(array('uid' => $response->flash->uid));
								} else {
									$valid = false;
								}
								//Helps to not keep real creadential information on user computer, but only an encrypted code
								if(isset($response->flash->log_id)){
									OneSeventySeven::set(array('hahaha' => $response->flash->log_id));
								} else {
									$valid = false;
								}
								//After signin, it return the username, it's only used once to display the user name faster than the local storage.
								//It's almost useless
								if(isset($response->flash->username)){
									OneSeventySeven::set(array('yonghu' => $response->flash->username));
								}
								//Used to display/download files in a secured way and keep browser cache enable (same url)
								if(isset($response->flash->pukpic)){
									setcookie('pukpic', $response->flash->pukpic, time()+intval($app->lincko->cookies_lifetime), '/', $app->lincko->domain);
									OneSeventySeven::set(array('pukpic' => $response->flash->pukpic));
								} else {
									$valid = false;
								}
							}
							if($valid){
								$app->lincko->data['integration_wechat_new'] = false;
							}
							\bundles\lincko\wrapper\hooks\SetData(); //used to help log in immediatly
						}
					}
				}
			} else {
				$response = false;
			}

		}

		if($valid && $account=='pub' && $openid){
			$app->lincko->data['integration_wechat_show_official'] = true;
			$app = \Slim\Slim::getInstance();
			$option['appid'] = $app->lincko->integration->wechat['public_appid'];
			$option['secret'] = $app->lincko->integration->wechat['public_secretapp'];
			$option['access_token'] = WechatPublic::access_token();
			$wechat = new Wechat($option);
			if($result = $wechat->users()){
				if(isset($result->data) && isset($result->data->openid) && isset($result->data->openid[$openid])){
					$app->lincko->data['integration_wechat_show_official'] = false;
				}
			}
		}

		$app->lincko->data['link_reset'] = true;
		if(!$response){
			$app->lincko->data['integration_connection_error'] = true;
			$app->lincko->translation['party'] = 'Wechat';
		}
		$app->lincko->data['link_reset'] = true;
		$app->router->getNamedRoute('root')->dispatch();

		return true;
	}

	public function curl_get($grant_type=false, $param=array()){
		$app = $this->app;
		if($grant_type=='authorization_code'){
			$url = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid='.$param['appid'].'&secret='.$param['secret'].'&code='.$param['code'].'&grant_type=authorization_code';
		} else if($grant_type=='snsapi_userinfo'){
			$url = 'https://api.weixin.qq.com/sns/userinfo?access_token='.$param['access_token'].'&openid='.$param['openid'].'&lang='.$param['lang'].'&grant_type=snsapi_userinfo'; //Need confirmation from user (used only the first time)
		} else {
			return false;
		}
		//\libs\Watch::php($url, '$url', __FILE__, __LINE__, false, false, true);
		$timeout = 8;
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url); //Port used is 10443 only
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
		curl_setopt($ch, CURLOPT_FRESH_CONNECT, true);
		curl_setopt($ch, CURLOPT_FORBID_REUSE, true);
		curl_setopt($ch, CURLOPT_ENCODING, 'gzip');

		$verbose_show = false;
		if($verbose_show){
			$verbose = fopen('php://temp', 'w+');
			curl_setopt($ch, CURLOPT_VERBOSE, true);
			curl_setopt($ch, CURLOPT_STDERR, $verbose);
		}

		$result = curl_exec($ch);

		if($verbose_show){
			\libs\Watch::php(curl_getinfo($ch), '$ch', __FILE__, __LINE__, false, false, true);
			$error = '['.curl_errno($ch)."] => ".htmlspecialchars(curl_error($ch));
			\libs\Watch::php($error, '$error', __FILE__, __LINE__, false, false, true);
			rewind($verbose);
			\libs\Watch::php(stream_get_contents($verbose), '$verbose', __FILE__, __LINE__, false, false, true);
			fclose($verbose);
			\libs\Watch::php(json_decode($result), '$result', __FILE__, __LINE__, false, false, true);
		}

		@curl_close($ch);
		return $result;
	}

	public function curl_post($grant_type=false, $param=array(), $data=false){
		$app = $this->app;
		if(!is_object($data)){
			$data = new \stdClass;
		}
		if($grant_type=='send_message'){
			//http://admin.wechat.com/wiki/index.php?title=Customer_Service_Messages
			$url = 'https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token='.$param['access_token'];
		} else {
			return false;
		}
		$data = json_encode($data, JSON_FORCE_OBJECT);
		//\libs\Watch::php($data, $url, __FILE__, __LINE__, false, false, true);
		$timeout = 8;
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url); //Port used is 10443 only
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
		curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
		curl_setopt($ch, CURLOPT_POST, true);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
		curl_setopt($ch, CURLOPT_FRESH_CONNECT, true);
		curl_setopt($ch, CURLOPT_FORBID_REUSE, true);
		curl_setopt($ch, CURLOPT_ENCODING, 'gzip');
		curl_setopt($ch, CURLOPT_HTTPHEADER, array(
				'Content-Type: application/json; charset=UTF-8',
				'Content-Length: ' . mb_strlen($data),
			)
		);

		$verbose_show = true;
		if($verbose_show){
			$verbose = fopen('php://temp', 'w+');
			curl_setopt($ch, CURLOPT_VERBOSE, true);
			curl_setopt($ch, CURLOPT_STDERR, $verbose);
		}

		$result = curl_exec($ch);

		if($verbose_show){
			\libs\Watch::php(curl_getinfo($ch), '$ch', __FILE__, __LINE__, false, false, true);
			$error = '['.curl_errno($ch)."] => ".htmlspecialchars(curl_error($ch));
			\libs\Watch::php($error, '$error', __FILE__, __LINE__, false, false, true);
			rewind($verbose);
			\libs\Watch::php(stream_get_contents($verbose), '$verbose', __FILE__, __LINE__, false, false, true);
			fclose($verbose);
			\libs\Watch::php(json_decode($result), '$result', __FILE__, __LINE__, false, false, true);
		}

		@curl_close($ch);
		return $result;
	}

	public function wxqrcode_get(){
		$app = \Slim\Slim::getInstance();
		$data = json_decode(json_encode($_GET, JSON_FORCE_OBJECT)); //convert to object
		$loop = 3; //number of try
		while($loop>0 && $loop){
			$loop--;
			$controller = new ControllerWrapper($data, 'post', false);
			if($response = $controller->wrap_multi('integration/set_wechat_qrcode')){
				if(isset($response->msg) && isset($response->msg->code) && isset($response->msg->url) && !empty($response->msg->url)){
					$_SESSION['integration_code'] = $response->msg->code;
					$_SESSION['integration_code_expire'] = time() + 180; //valid 3 minutes only (the unset after expiration is handle by ControllerWrapper already)
					$loop = false;
					WideImage::load($response->msg->url)->output('png');
					return exit(0);
				}
			}
		}
		return exit(0);
	}

	public function official_get(){
		$app = \Slim\Slim::getInstance();
		$option['token'] = $app->lincko->integration->wechat['public_token'];
		$wechat = new Wechat($option);
		$wechat->valid();
		return exit(0);
	}

	public function official_post(){
		$app = \Slim\Slim::getInstance();
		$app->trans->getList('default');
		$lang = $app->trans->getClientLanguage(); //Will be "en" by default
		$timeoffset = 16; //Chinese time is mostly probable to be used for wechat account
		$option['appid'] = $app->lincko->integration->wechat['public_appid'];
		$option['secret'] = $app->lincko->integration->wechat['public_secretapp'];
		$option['access_token'] = WechatPublic::access_token();
		$wechat = new Wechat($option);
		$wechat->getToken();

		$body = $app->request->getBody();
		$data = simplexml_load_string($body, null, LIBXML_NOCDATA);

		if(isset($data->MsgType) && isset($data->Event) && strtolower($data->MsgType) == 'event'){
			$user = false;
			$scene_str = false;
			if(strtolower($data->Event) == 'subscribe'){
				$open_id = (string) $data->FromUserName;
				if(isset($data->EventKey)){
					$integration_code = $_SESSION['integration_code'] = substr($data->EventKey, strlen('qrscene_'), strlen($data->EventKey)-strlen('qrscene_')+1);
					if(strlen($integration_code) > 4){
						$lang = $app->trans->setLanguageNumber(intval(substr($integration_code, -2, 2))); //set user laguage
						$timeoffset = intval(substr($integration_code, -4, 2)); //set user timeoffset
					}
					$wechat->sendMsg($open_id, $app->trans->getBRUT('wrapper', 1, 4, array(), $lang)); //[toto] follow msg
					$wechat->sendMsg($open_id, $app->trans->getBRUT('wrapper', 1, 4, array(), $lang)); //[toto] login msg
					$user = $wechat->user($open_id);
				} else {
					$wechat->sendMsg($open_id, $app->trans->getBRUT('wrapper', 1, 4, array(), $lang)); //[toto] follow msg
				}
			} else if(strtolower($data->Event) == 'scan'){
				$open_id = (string) $data->FromUserName;
				$integration_code = $_SESSION['integration_code'] = (string) $data->EventKey;
				if(strlen($integration_code) > 4){
					$lang = $app->trans->setLanguageNumber(intval(substr($integration_code, -2, 2))); //set user laguage
					$timeoffset = intval(substr($integration_code, -4, 2)); //set user timeoffset
				}
				$wechat->sendMsg($open_id, $app->trans->getBRUT('wrapper', 1, 4, array(), $lang)); //[toto] login msg
				$user = $wechat->user($open_id);
			}

			if($user && isset($user['unionid'])){
				$data = new \stdClass;
				/*
					Using OpenID is more restrictive because it's different from DEV and PUBLIC account (UnionID is same),
					but the advantage is that it will work on .cafe and .co (sandbox bruno wechat), and we can skip a confirmation because snsapi_base is providing OpenID without notification instead of snsapi_userinfo
				$data->party = 'wechat_'.$account;
				$data->party_id = 'oid.'.$account.'.'.$openid;
				*/
				$data->party = 'wechat';
				$data->party_id = 'uid.'.$user['unionid'];
				$data->timeoffset = $timeoffset; //Chinese time is mostly probable to be used for wechat account
				$data->data = (object) $user;
				$data->data->account = 'pub';
				$controller = new ControllerWrapper($data, 'post', false);
				$response = $controller->wrap_multi('integration/connect');
			}
		}

	}

}

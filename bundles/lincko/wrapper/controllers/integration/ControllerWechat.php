<?php

namespace bundles\lincko\wrapper\controllers\integration;

use \bundles\lincko\wrapper\controllers\ControllerWrapper;
use \libs\Controller;
use \libs\OneSeventySeven;

class ControllerWechat extends Controller {

	protected $app = NULL;
	protected $get = NULL;

	public function __construct(){
		$app = $this->app = \Slim\Slim::getInstance();
		$this->get = $app->request->get();
		return true;
	}

	public function token_get(){
		$app = $this->app;
		$response = $this->get;
		$access_token = false;
		$openid = false;

		if($response && isset($response['code'])){
			$param = array(
				'appid' => $app->lincko->integration->wechat['appid'],
				'secret' => $app->lincko->integration->wechat['secretapp'],
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

		if($response && $result = json_decode($response)){
			if(isset($result->access_token) && isset($result->openid)){
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

		if($response && $access_token && $openid && $result = json_decode($response)){
			$data = new \stdClass;
			$data->party = 'wechat';
			$data->party_id = $openid;
			$data->data = $result;
			$controller = new ControllerWrapper($data, 'post', false);
			if($response = $controller->wrap_multi('integration/connect')){
				if(!isset($response->status) || $response->status != 200){
					$response = false;
				} else {
					if(isset($response->flash->username_sha1) && isset($response->flash->uid)){
						OneSeventySeven::set(array('sha' => substr($response->flash->username_sha1, 0, 20))); //Truncate to 20 character because phone alias notification limitation
						OneSeventySeven::set(array('uid' => $response->flash->uid));
					}
					if(isset($response->flash->username)){
						OneSeventySeven::set(array('yonghu' => $response->flash->username));
					}
					if(isset($response->flash->youjian) && isset($response->flash->lianke)){
						OneSeventySeven::set(array(
							'youjian' => $response->flash->youjian,
							'lianke' => $response->flash->lianke,
						));
					}
				}
				\bundles\lincko\wrapper\hooks\SetData(); //used to help log in immediatly
			}
		} else {
			$response = false;
		}

		if(!$response){
			$app->lincko->data['integration_connection_error'] = true;
			$app->lincko->translation['party'] = 'Wechat';
		}
		$app->lincko->data['link_reset'] = true;
		$app->router->getNamedRoute('root')->dispatch();
	}

	public function curl_get($grant_type=false, $param=array()){
		$app = $this->app;
		if($grant_type=='authorization_code'){
			$url = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid='.$param['appid'].'&secret='.$param['secret'].'&code='.$param['code'].'&grant_type=authorization_code';
		} else if($grant_type=='snsapi_userinfo'){
			$url = 'https://api.weixin.qq.com/sns/userinfo?access_token='.$param['access_token'].'&openid='.$param['openid'].'&lang='.$param['lang'].'&grant_type=snsapi_userinfo';
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
			if($result){
				\libs\Watch::php(json_decode($result), '$result', __FILE__, __LINE__, false, false, true);
			} else {
				\libs\Watch::php(curl_getinfo($ch), '$ch', __FILE__, __LINE__, false, false, true);
				$error = '['.curl_errno($ch)."] => ".htmlspecialchars(curl_error($ch));
				\libs\Watch::php($error, '$error', __FILE__, __LINE__, false, false, true);
				rewind($verbose);
				\libs\Watch::php(stream_get_contents($verbose), '$verbose', __FILE__, __LINE__, false, false, true);
				fclose($verbose);
			}
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
			$url = 'https://api.wechat.com/cgi-bin/message/custom/send?access_token='.$param['access_token'];
		} else {
			return false;
		}
		$data = json_encode($data);
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

		$verbose_show = false;
		if($verbose_show){
			$verbose = fopen('php://temp', 'w+');
			curl_setopt($ch, CURLOPT_VERBOSE, true);
			curl_setopt($ch, CURLOPT_STDERR, $verbose);
		}

		$result = curl_exec($ch);

		if($verbose_show){
			if($result){
				\libs\Watch::php(json_decode($result), '$result', __FILE__, __LINE__, false, false, true);
			} else {
				\libs\Watch::php(curl_getinfo($ch), '$ch', __FILE__, __LINE__, false, false, true);
				$error = '['.curl_errno($ch)."] => ".htmlspecialchars(curl_error($ch));
				\libs\Watch::php($error, '$error', __FILE__, __LINE__, false, false, true);
				rewind($verbose);
				\libs\Watch::php(stream_get_contents($verbose), '$verbose', __FILE__, __LINE__, false, false, true);
				fclose($verbose);
			}
		}

		@curl_close($ch);
		return $result;
	}

}

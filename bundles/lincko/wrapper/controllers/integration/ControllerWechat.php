<?php

namespace bundles\lincko\wrapper\controllers\integration;

use \libs\Controller;

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
		$this->curl('authorization_code');
		$app->lincko->data['link_reset'] = true;
		$app->router->getNamedRoute('home')->dispatch();
	}

	public function curl($grant_type=false){
		$app = $this->app;
		$get = $this->get;
		\libs\Watch::php($get, '$get', __FILE__, false, false, true);
		$resut = false;
		if(isset($get['code'])){
			
			if($grant_type=='authorization_code'){
				$url = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid='.$app->lincko->integration->wechat['appid'].'&secret='.$app->lincko->integration->wechat['secretapp'].'&code='.$get['code'].'&grant_type=authorization_code';
			} else {
				return false;
			}
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

			$verbose = fopen('php://temp', 'w+');
			curl_setopt($ch, CURLOPT_VERBOSE, true);
			curl_setopt($ch, CURLOPT_STDERR, $verbose);

			if($result = curl_exec($ch)){
				\libs\Watch::php(json_decode($result), '$result', __FILE__, false, false, true);
			} else {
				\libs\Watch::php(curl_getinfo($ch), '$ch', __FILE__, false, false, true);
				$error = '['.curl_errno($ch)."] => ".htmlspecialchars(curl_error($ch));
				\libs\Watch::php($error, '$error', __FILE__, false, false, true);
				rewind($verbose);
				\libs\Watch::php(stream_get_contents($verbose), '$verbose', __FILE__, false, false, true);
				fclose($verbose);
			}

			@curl_close($ch);
			
		}
		return $result;
	}

}

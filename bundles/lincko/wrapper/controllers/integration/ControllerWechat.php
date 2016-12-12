<?php

namespace bundles\lincko\wrapper\controllers\integration;

use \libs\Controller;

class ControllerWechat extends Controller {

	protected $app = NULL;
	protected $data = NULL;

	public function __construct(){
		$app = $this->app = \Slim\Slim::getInstance();
		$this->data = json_decode($app->request->getBody());
		return true;
	}

	public function token_get($var=false){
		$app = $this->app;
		$data = $app->request->get();
		\libs\Watch::php($data, '$data', __FILE__, false, false, true);
		if(isset($data['code'])){
			$url = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid='.$app->lincko->integration->wechat['appid'].'&secret='.$app->lincko->integration->wechat['secretapp'].'&code='.$data['code'].'&grant_type=authorization_code';
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
				\libs\Watch::php($result, '$result', __FILE__, false, false, true);
			} else {
				//echo "cURL error!\n";
				\libs\Watch::php(curl_getinfo($ch), '$ch', __FILE__, false, false, true);
				$error = '['.curl_errno($ch)."] => ".htmlspecialchars(curl_error($ch));
				\libs\Watch::php($error, '$error', __FILE__, false, false, true);
				rewind($verbose);
				\libs\Watch::php(stream_get_contents($verbose), '$verbose', __FILE__, false, false, true);
				fclose($verbose);
			}

			@curl_close($ch);
			$app->lincko->data['link_reset'] = true;
			$app->router->getNamedRoute('home')->dispatch();
		}
	}

}

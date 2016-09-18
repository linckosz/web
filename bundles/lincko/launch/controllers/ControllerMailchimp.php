<?php

namespace bundles\lincko\launch\controllers;

use \libs\OneSeventySeven;
use \libs\Controller;
use \libs\Datassl;

class ControllerMailchimp extends Controller {

	protected $app = NULL;
	protected $action = NULL;
	protected $resignin = false; //It should not, but avoid to loop
	protected $form_id = false;
	protected $show_error = true;

	protected $json = array(
		'apikey' => '585a0991ce18b4a45d38812383971b62-us13',
		'email_address' => '',
		'status' => 'subscribed',
	);

	public function __construct(){
		$app = $this->app = \Slim\Slim::getInstance();
		$datatp = (array)json_decode($app->request->getBody());
		\libs\Watch::php($datatp, '$datatp', __FILE__, false, false, true);
		if(isset($datatp['email_address'])){\libs\Watch::php('yes', '$datatp', __FILE__, false, false, true);
			$this->json['email_address'] = $datatp['email_address'];
		}
		return true;
	}

	public function subscribe(){
		$app = $this->app;
		$data = json_encode($this->json);
		$auth = base64_encode( 'user:'.$this->json['apikey'] );
		$url = 'https://us13.api.mailchimp.com/3.0/lists/050321d5ad/members/';
		$timeout = 2;
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
		curl_setopt($ch, CURLOPT_HTTPHEADER, array(
				'Authorization: Basic '.$auth,
				'Access-Control-Allow-Origin: *',
				'Access-Control-Request-Method: POST',
				'Content-Type: application/json; charset=UTF-8',
				'Content-Length: ' . mb_strlen($data),
			)
		);

		$verbose = fopen('php://temp', 'w+');
		curl_setopt($ch, CURLOPT_VERBOSE, true);
		curl_setopt($ch, CURLOPT_STDERR, $verbose);

		$json_result = false;
		if($result = curl_exec($ch)){
			$json_result = json_decode($result);
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

		if($json_result){
			print_r(json_encode($json_result));
			return true;
		}

		return false;
	}

}

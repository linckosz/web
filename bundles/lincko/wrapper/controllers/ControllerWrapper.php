<?php

namespace bundles\lincko\wrapper\controllers;

use \bundles\lincko\wrapper\models\Creation;
use \libs\Controller;
use \libs\Datassl;

class ControllerWrapper extends Controller {

	protected $app = NULL;
	protected $action = NULL;
	protected $resignin = false; //It should not, but avoid to loop

	protected $json = array(
		'api_key' => '', //Software authorization key
		'public_key' => '', //User public key
		'checksum' => '', //Checksum data + private key
		'data' => array(), //Form data
		'method' => 'GET', //Record the type of request (GET, POST, DELETE, etc.)
		'language' => 'en', //By default use English
	);

	public function __construct(){
		$app = $this->app = \Slim\Slim::getInstance();
		$datatp = (array)json_decode($app->request->getBody());
		foreach ($datatp as $value) {
			$this->json['data'][$value->name] = $value->value;
		}
		$this->json['api_key'] = $app->lincko->wrapper['api_key'];
		$this->json['method'] = mb_strtoupper($app->request->getMethod());
		$this->json['language'] = $app->trans->getClientLanguage();
		if(!$app->getCookie('yuyan', false)) {
			$app->setCookie('yuyan', $this->json['language']);
		}
		return true;
	}

	protected function sendCurl(){
		$app = $this->app;

		$data = json_encode($this->json);

		$url = $app->lincko->wrapper['url'].$this->action;

		$timeout = 8;
		if($this->action==='translation/auto'){
			$timeout = 18; //Need more time because requesting a thrid party for translation
		}
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
		curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
		curl_setopt($ch, CURLOPT_FRESH_CONNECT, true);
		curl_setopt($ch, CURLOPT_FORBID_REUSE, true);
		curl_setopt($ch, CURLOPT_HTTPHEADER, array(
				'Content-Type: application/json; charset=UTF-8',
				'Content-Length: ' . mb_strlen($data),
			)
		);

		$json_result = false;
		if($result = curl_exec($ch)){
			$json_result = json_decode($result);
		}
		@curl_close($ch);

		if($json_result && isset($json_result->msg) && isset($json_result->error)){
			
			if(isset($json_result->flash)){
				//In case we accept to try to relog
				if(!$this->resignin && isset($json_result->flash) && isset($json_result->flash->resignin) && $json_result->flash->resignin===true){
					return $this->reSignIn();
				}
				//In case of Access unauthorize, we force to sign out the user
				else if(isset($json_result->flash->signout) && $json_result->flash->signout===true){
					$this->signOut();
				}
				//In case of first Sign in (public key and private key must be a pair)
				else if(isset($json_result->flash->public_key) && isset($json_result->flash->private_key)){
					$_SESSION['public_key'] = $json_result->flash->public_key;
					$_SESSION['private_key'] = $json_result->flash->private_key;
					$this->uploadKeys();
				}

				//After signin, it return the username
				if(isset($json_result->flash->username)){
					$app->setCookie('yonghu', $json_result->flash->username);
					$_SESSION['yonghu'] = $json_result->flash->username;
				}

				unset($json_result->flash);
			}
			print_r(json_encode($json_result)); //production output
			//print_r($json_result->msg); //for test
			//print_r($result); //for test
			//print_r($json_result); //for test
			return !$json_result->error;
		} else {
			//echo '{"msg":"Wrapper error","error":true,"status":500}';
			echo '{"msg":"'.$app->trans->getJSON('wrapper', 1, 3).'","error":true,"status":500}';
			return false;
		}
		
		return false;
	}

	protected function autoSign(){
		$app = $this->app;
		$this->setupKeys();
		if($_SESSION['public_key'] == $app->lincko->security['public_key'] && $_SESSION['private_key'] == $app->lincko->security['private_key']){
			if(isset($_SESSION['youjian']) && isset($_SESSION['mima']) && false){
				$this->json['data']['email'] = $_SESSION['youjian'];
				$this->json['data']['password'] = $_SESSION['mima'];
				return true;
			} else if($app->getCookie('jizhu', false) && $app->getCookie('youjian', false) && $app->getCookie('mima', false)){
				$this->json['data']['email'] = $app->getCookie('youjian', false);
				$this->json['data']['password'] = $app->getCookie('mima', false);
				$this->json['remember'] = true;
				return true;
			}
			$this->signOut();
			return false;
		}
		return true;
	}

	protected function reSignIn(){
		$app = $this->app;
		$this->resetKeys();
		if(!$this->resignin){ //Avoid a loop
			$this->resignin = true;
			$this->autoSign();
			$this->prepareJson();
			return $this->sendCurl();
		} else {
			//echo '{"msg":"Wrapper error","error":true,"status":500}';
			echo '{"msg":"'.$app->trans->getJSON('wrapper', 1, 3).'","error":true,"status":500}';
			return true;
		}
	}

	protected function uploadKeys(){
		$app = $this->app;
		$checksum = md5($_SESSION['private_key'].$_SESSION['public_key']);
		//Upload user public key
		$app->setCookie('shangzai_puk', $_SESSION['public_key'], null, null, null, null, false);
		//Secret code built with user private code which must e equal to public key after conversion on server side
		//WARNING: slim 'cookies.secret_key' must be the same on client and server side!
		$app->setCookie('shangzai_cs', $checksum, null, null, null, null, false);
	}

	protected function setupKeys(){
		$app = $this->app;
		if(!isset($_SESSION['public_key'])){
			$_SESSION['public_key'] = $app->lincko->security['public_key'];
		}
		if(!isset($_SESSION['private_key'])){
			$_SESSION['private_key'] = $app->lincko->security['private_key'];
		}
		$this->uploadKeys();
		return true;
	}

	protected function resetKeys(){
		$app = $this->app;
		$_SESSION['public_key'] = $app->lincko->security['public_key'];
		$_SESSION['private_key'] = $app->lincko->security['private_key'];
		$this->uploadKeys();
		return true;
	}

	protected function signOut(){
		$app = $this->app;
		$app->deleteCookie('yonghu');
		$app->deleteCookie('jizhu');
		$app->deleteCookie('mima');
		$app->deleteCookie('shangzai_puk');
		$app->deleteCookie('shangzai_cs');
		unset($_SESSION['yonghu']);
		unset($_SESSION['youjian']);
		unset($_SESSION['mima']);
		unset($_SESSION['jizhu']);
		unset($_SESSION['public_key']);
		unset($_SESSION['private_key']);
		return true;
	}

	protected function prepareJson(){
		$this->setupKeys();
		$this->json['public_key'] = $_SESSION['public_key'];
		$this->json['checksum'] = md5($_SESSION['private_key'].json_encode($this->json['data']));
	}

	public function wrap_multi($action = NULL){
		
		$app = $this->app;

		$type = $this->json['method'];

		$this->action = $action;

		$log_action = false;

		if($action==='user/autosign' && $type==='POST' && isset($this->json['data']['email']) && isset($this->json['data']['password'])){

		} else if($action==='user/signin' && $type==='POST' && isset($this->json['data']['email']) && isset($this->json['data']['password'])){

			$log_action = true;

			$this->signOut();
			
			$this->json['data']['password'] = Datassl::encrypt($this->json['data']['password'], $this->json['data']['email']);

			$_SESSION['youjian'] = $this->json['data']['email'];
			$_SESSION['mima'] = $this->json['data']['password'];
			$_SESSION['jizhu'] = true;

			//Add Cookies if Remember
			if(isset($this->json['data']['remember'])){
				$app->setCookie('jizhu', true);
				$app->setCookie('youjian', $this->json['data']['email']);
				$app->setCookie('mima', $this->json['data']['password']);
			} else {
				$app->deleteCookie('jizhu');
				$app->deleteCookie('mima');
			}
		
		} else if($action==='user/create' && $type==='POST' && isset($this->json['data']['email']) && isset($this->json['data']['password'])){

			if(Creation::exists()){
				if(isset($this->json['data']['captcha']) && isset($_SESSION['wrapper_captcha'])){
					if(intval($this->json['data']['captcha']) !== $_SESSION['wrapper_captcha']){
						echo '{"msg":{ "msg": "'.$app->trans->getJSON('wrapper', 1, 4).'", "field": "captcha" }, "error":true, "status":400}'; //The Captcha code does not match.
						return true;
					}
				} else {
					$app->lincko->translation['captcha_timing'] = Creation::remainTime();
					echo '{"msg":{ "msg": "'.$app->trans->getJSON('wrapper', 1, 5).'", "field": "captcha" }, "error":true, "status":400}'; //You need to wait 5 minutes before to be able to create another account. Thank you for your patience.
					return true;
				}
			}

			$log_action = true;

			$this->json['data']['password'] = Datassl::encrypt($this->json['data']['password'], $this->json['data']['email']);

			$this->signOut();
			$app->setCookie('youjian', $this->json['data']['email']);
			$app->setCookie('mima', $this->json['data']['password']);
			$this->json['remember'] = true;
			$app->setCookie('jizhu', true);

		} else {

			//We autosign if available
			$this->autoSign();
			
		}

		$this->prepareJson();

		//This action must be after prepareJson() to force the client side to sign out, and then the server will sign out too. Like that we don't have to wait the response from server (back) to be able to sign out.
		if($action==='user/signout' && $type==='POST'){

			$this->signOut();

		}

		if($log_action){
			if(!$this->sendCurl()){
				$this->signOut();
			} else if($action==='user/create'){
				Creation::record();
			}
		} else {
			$this->sendCurl();
		}

		//Do not return false, it forces wrapper.js to send error message
		//We keep using true because we want to handle PHP error action in Ajax success
		return true;
	}

}
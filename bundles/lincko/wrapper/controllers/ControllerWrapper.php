<?php

namespace bundles\lincko\wrapper\controllers;

use \bundles\lincko\wrapper\models\Creation;
use \libs\OneSeventySeven;
use \libs\Controller;
use \libs\Datassl;

class ControllerWrapper extends Controller {

	protected $app = NULL;
	protected $action = NULL;
	protected $resignin = false; //It should not, but avoid to loop
	protected $form_id = false;
	protected $show_error = false;
	protected $print = true;

	protected $json = array(
		'api_key' => '', //Software authorization key
		'public_key' => '', //User public key
		'checksum' => '', //Checksum data + private key
		'data' => array(), //Form data
		'method' => 'GET', //Record the type of request (GET, POST, DELETE, etc.)
		'language' => 'en', //By default use English
		'fingerprint' => '', //A way to identify which browser the user is using, help to avoid cookies copy/paste fraud
		'workspace' => '', //the url (=ID unique string) of the workspace, by default use "Shared workspace"
	);

	public function __construct($data_bis=false, $force_method=false, $print=true){
		$app = $this->app = \Slim\Slim::getInstance();
		$this->print = $print;
		$data = (array)json_decode($app->request->getBody());
		foreach ($data as $value) {
			$this->json['data'][$value->name] = $value->value;
		}
		if(is_object($data_bis)){
			foreach ($data_bis as $key => $value) {
				$this->json['data'][$key] = $value;
			}
		}
		$this->json['api_key'] = $app->lincko->wrapper['api_key'];
		if($force_method && in_array(mb_strtoupper($force_method), array('GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'))){
			$this->json['method'] = mb_strtoupper($force_method);
		} else {
			$this->json['method'] = mb_strtoupper($app->request->getMethod());
		}
		$this->json['language'] = $app->trans->getClientLanguage();
		$this->json['fingerprint'] = $app->lincko->data['fingerprint'];
		$this->json['workspace'] = $app->lincko->data['workspace'];
		if(isset($_SESSION['workspace'])){
			$this->json['workspace'] = $_SESSION['workspace'];
		}
		if(isset($_SESSION['invitation_code'])){
			$this->json['data']['invitation_code'] = $_SESSION['invitation_code'];
		}
		if(isset($_SESSION['user_code'])){
			$this->json['data']['user_code'] = $_SESSION['user_code'];
		}
		if(!OneSeventySeven::get('yuyan')) {
			OneSeventySeven::set(array('yuyan' => $this->json['language']));
		}
		if(isset($this->json['data']['form_id'])){
			$this->form_id = $this->json['data']['form_id'];
			unset($this->json['data']['form_id']);
		}
		if(isset($this->json['data']['show_error'])){
			$this->show_error = $this->json['data']['show_error'];
			unset($this->json['data']['show_error']);
		}
		if(isset($this->json['data']['foilautofill'])){
			unset($this->json['data']['foilautofill']);
		}
		return true;
	}

	protected function sendCurl($reset_shangzai=false){
		$app = $this->app;

		$data = json_encode($this->json);

		$url = $app->lincko->wrapper['url'].$this->action;

		$timeout = 36;
		if($this->action==='translation/auto'){
			$timeout = 66; //Need more time because requesting a third party for translation
		}
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url); //Port used is 10443 only
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
		curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
		curl_setopt($ch, CURLOPT_POST, true);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
		curl_setopt($ch, CURLOPT_COOKIE, 'PHPSESSID=' . $_COOKIE['PHPSESSID']);
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

		$json_result = false;
		if($result = curl_exec($ch)){
			$json_result = json_decode($result);
		}

		if($verbose_show){
			\libs\Watch::php(curl_getinfo($ch), '$ch', __FILE__, __LINE__, false, false, true);
			rewind($verbose);
			\libs\Watch::php(stream_get_contents($verbose), '$verbose', __FILE__, __LINE__, false, false, true);
			fclose($verbose);
		}

		@curl_close($ch);

		if($json_result && isset($json_result->msg) && isset($json_result->error)){
			
			if($reset_shangzai){
				if(!isset($json_result->shangzai)){ $json_result->shangzai = new \stdClass; }
				$json_result->shangzai->puk = NULL;
			}

			if(isset($json_result->flash)){

				//In case we accept to try to relog
				if(!$this->resignin && isset($json_result->flash) && isset($json_result->flash->resignin) && $json_result->flash->resignin===true){
					return $this->reSignIn();
				}
				//In case of Access unauthorize, we force to sign out the user
				else if(isset($json_result->flash->signout) && $json_result->flash->signout===true){
					$this->signOut(true);
					$json_result->signout = true;
				}
				//In case of first Sign in (public key and private key must be a pair)
				else if(isset($json_result->flash->public_key) && isset($json_result->flash->private_key)){
					$_SESSION['public_key'] = $json_result->flash->public_key;
					$_SESSION['private_key'] = $json_result->flash->private_key;
					if(!isset($json_result->shangzai)){ $json_result->shangzai = new \stdClass; }
					$json_result->shangzai->puk = Datassl::encrypt($_SESSION['public_key'], $app->lincko->security['private_key']);
				}

				//"username_sha1" is a password used to encrypt data
				//"uid" is the main user ID
				if(isset($json_result->flash->username_sha1) && isset($json_result->flash->uid)){
					OneSeventySeven::set(array('sha' => $json_result->flash->username_sha1));
					OneSeventySeven::set(array('uid' => $json_result->flash->uid));
				}
				
				//After signin, it return the username, it's only used once to display the user name faster than the local storage.
				//It's almost useless
				if(isset($json_result->flash->username)){
					OneSeventySeven::set(array('yonghu' => $json_result->flash->username));
				}

				unset($json_result->flash);
			}
			//If the request comes from a form, we add it's ID
			if($this->form_id){
				$json_result->form_id = $this->form_id;
			}
			//We add current language to refresh the application if the settings changed
			$json_result->language = $this->json['language'];
			
			if($this->print){
				print_r(json_encode($json_result)); //production output
				//print_r($json_result->msg); //for test
				//print_r($result); //for test
				//print_r($json_result); //for test
				return !$json_result->error;
			} else {
				return $json_result;
			}
		} else if($this->show_error){
			if($this->print){
				//echo '{"show":"Communication error","msg":"Wrapper error","error":true,"status":500}';
				echo '{"show":"'.$app->trans->getJSON('wrapper', 1, 6).'","msg":"'.$app->trans->getJSON('wrapper', 1, 3).'","error":true,"status":500}';
			}
			return false;
		} else {
			if($this->print){
				//echo '{"show":false,"msg":"Wrapper error","error":true,"status":500}';
				echo '{"show":false,"msg":"'.$app->trans->getJSON('wrapper', 1, 3).'","error":true,"status":500}';
			}
			return false;
		}
		
		return false;
	}

	protected function autoSign(){
		$app = $this->app;
		$this->setupKeys();
		if($_SESSION['public_key'] == $app->lincko->security['public_key'] && $_SESSION['private_key'] == $app->lincko->security['private_key']){
			if(OneSeventySeven::get('youjian') && OneSeventySeven::get('lianke')){
				$this->json['data']['email'] = OneSeventySeven::get('youjian');
				$this->json['data']['password'] = OneSeventySeven::get('lianke');
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
			return $this->sendCurl(true);
		} else {
			//echo '{"show":"Communication error","msg":"Wrapper error","error":true,"status":500}';
			echo '{"show":"'.$app->trans->getJSON('wrapper', 1, 6).'","msg":"'.$app->trans->getJSON('wrapper', 1, 3).'","error":true,"status":500}';
			return true;
		}
	}

	protected function setupKeys(){
		$app = $this->app;
		if(!isset($_SESSION['public_key'])){
			$_SESSION['public_key'] = $app->lincko->security['public_key'];
		}
		if(!isset($_SESSION['private_key'])){
			$_SESSION['private_key'] = $app->lincko->security['private_key'];
		}
		return true;
	}

	protected function resetKeys(){
		$app = $this->app;
		$_SESSION['public_key'] = $app->lincko->security['public_key'];
		$_SESSION['private_key'] = $app->lincko->security['private_key'];
		return true;
	}

	protected function signOut($clear=false){
		$app = $this->app;
		if($clear){ //Do not keep user info
			OneSeventySeven::unsetAll(array('jizhu', 'yuyan'));
		} else {
			OneSeventySeven::unsetAll(array('jizhu', 'yuyan', 'youjian'));
		}
		unset($_SESSION['public_key']);
		unset($_SESSION['private_key']);
		unset($_SESSION['workspace']);
		return true;
	}

	protected function prepareJson(){
		$this->setupKeys();
		$this->json['public_key'] = $_SESSION['public_key'];
		$this->json['checksum'] = md5($_SESSION['private_key'].json_encode($this->json['data'], JSON_UNESCAPED_UNICODE));
	}

	public function wrap_ok($action = NULL){
		return true;
	}

	public function wrap_multi($action = NULL){
		
		$app = $this->app;

		$type = $this->json['method'];

		$this->action = $action;

		$log_action = false;

		$reset_shangzai = false;

		if($action==='user/integration' && $type==='POST' && isset($this->json['data']['party']) && isset($this->json['data']['data'])){

			$log_action = true;

			$this->signOut(true);

			//Add Cookies if Remember
			if(isset($this->json['data']['remember'])){
				OneSeventySeven::set(array('jizhu' => true));
			} else {
				OneSeventySeven::set(array('jizhu' => false));
			}
		
		} else if($action==='user/signin' && $type==='POST' && isset($this->json['data']['email']) && isset($this->json['data']['password'])){

			$log_action = true;

			$this->signOut(true);
			
			$this->json['data']['password'] = Datassl::encrypt($this->json['data']['password'], $this->json['data']['email']);

			OneSeventySeven::set(array(
				'youjian' => $this->json['data']['email'],
				'lianke' => $this->json['data']['password'],
			));

			//Add Cookies if Remember
			if(isset($this->json['data']['remember'])){
				OneSeventySeven::set(array('jizhu' => true));
			} else {
				OneSeventySeven::set(array('jizhu' => false));
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

			$this->signOut(true);
			OneSeventySeven::set(array(
				'youjian' => $this->json['data']['email'],
				'lianke' => $this->json['data']['password'],
				'jizhu' => true,
			));

		} else if($action==='user/reset' && $type==='POST' && isset($this->json['data']['email']) && isset($this->json['data']['password'])){
			$this->json['data']['password'] = Datassl::encrypt($this->json['data']['password'], $this->json['data']['email']);
		} else {
			//We autosign if available
			$this->autoSign();
		}

		$this->prepareJson();

		//This action must be after prepareJson() to force the client side to sign out, and then the server will sign out too. Like that we don't have to wait the response from server (back) to be able to sign out.
		if($action==='user/signout' && $type==='POST'){

			$this->signOut(true);
			$reset_shangzai = true;

		}

		if($log_action){
			if(!$this->sendCurl($reset_shangzai)){
				$this->signOut();
			} else if($action==='user/create'){
				Creation::record();
			}
		} else {
			$this->sendCurl($reset_shangzai);
		}

		//Do not return false, it forces wrapper.js to send error message
		//We keep using true because we want to handle PHP error action in Ajax success
		return true;
	}

}

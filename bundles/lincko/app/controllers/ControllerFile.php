<?php

namespace bundles\lincko\app\controllers;

use \libs\Controller;
use \libs\OneSeventySeven;

class ControllerFile extends Controller {

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

	public function __construct(){
		$app = $this->app = \Slim\Slim::getInstance();
		$datatp = (array)json_decode($app->request->getBody());
		foreach ($datatp as $value) {
			$this->json['data'][$value->name] = $value->value;
		}
		$this->json['api_key'] = $app->lincko->wrapper['api_key'];
		$this->json['method'] = mb_strtoupper($app->request->getMethod());
		$this->json['language'] = $app->trans->getClientLanguage();
		$this->json['fingerprint'] = $app->lincko->data['fingerprint'];
		$this->json['workspace'] = $app->lincko->data['workspace'];
		if(isset($_SESSION['workspace'])){
			$this->json['workspace'] = $_SESSION['workspace'];
		}
		if(!OneSeventySeven::get('yuyan')) {
			OneSeventySeven::set(array('yuyan' => $this->json['language']));
		}
		return true;
	}

	public function file_open_get($type, $id){
		$app = $this->app;

		$data = json_encode($this->json);

		$this->json['data']['type'] = $type;
		$this->json['data']['id'] = $id;

		$url = $app->lincko->wrapper['url'].'file/read';

		$timeout = 360; //6 minutes
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url); //Port used is 10443 only
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
		
		return false;
	}

}

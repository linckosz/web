<?php

namespace bundles\lincko\wrapper\controllers;

use \bundles\lincko\wrapper\models\TranslationListJS;
use \libs\OneSeventySeven;
use \libs\Controller;
use \libs\STR;

class ControllerTranslation extends Controller {

	protected $app = NULL;

	public function __construct(){
		$this->app = \Slim\Slim::getInstance();
		return true;
	}

	public function list_get(){
		$app = $this->app;
		$app->response->headers->set('Content-Type', 'application/javascript');
		$app->response->headers->set('Cache-Control', 'no-cache, must-revalidate');
		$app->response->headers->set('Expires', 'Fri, 12 Aug 2011 14:57:00 GMT');
		$this->setList();
	}

	public function language_set(){
		$app = $this->app;
		$data = NULL;
		if($app->request->isPost()){
			$data = $app->request->post('translation_language');
		} else {
			$data = json_decode($app->request->getBody());
		}
		if(is_string($data)){
			if(preg_match("/([\w-]{2,})(?:$|\W)/ui", $data)){
				OneSeventySeven::set(array('yuyan' => $data));
				OneSeventySeven::set(array('reset_data' => true));
			}
		}
	}

	public function setList(){
		echo TranslationListJS::setList();
	}

}

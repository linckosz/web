<?php

namespace bundles\lincko\wrapper\controllers;

use \libs\Controller;
use \libs\STR;

class ControllerTranslation extends Controller {

	protected $app = NULL;

	public function __construct(){
		$app = $this->app = \Slim\Slim::getInstance();
		return true;
	}

	public function list_get(){
		$app = $this->app;
		$app->response->headers->set('Content-Type', 'application/javascript');
		$app->response->headers->set('Cache-Control', 'no-cache, must-revalidate');
		$app->response->headers->set('Expires', 'Fri, 12 Aug 2011 14:57:00 GMT');
		echo "Lincko.Translation = {};\n";
		$this->setList();
		$this->setData();
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
				$app->setCookie('yuyan', $data);
			}
		}
	}

	protected function setList(){
		$app = $this->app;
		$list = $app->trans->getList(true, 8000);
		echo "Lincko.Translation._list = [];\n";
		foreach ($list as $bundle => $list_bundles) {
			foreach ($list_bundles as $category => $list_categories) {
				foreach ($list_categories as $phrase => $value) {
					echo 'Lincko.Translation._list["'.$bundle.'_'.$category.'_'.$phrase.'"] = "'.STR::sql_to_js($value)."\";\n";
				}
			}
		}
		echo "
		Lincko.Translation.get = function(bundle, phrase){
			var category = '8000'; //Default category for JS sentences
			if(bundle+'_'+category+'_'+phrase in Lincko.Translation._list){
				var text = Lincko.Translation._list[bundle+'_'+category+'_'+phrase];
				return text;
				//return Lincko.Translation.pushData(text);
			} else {
				return \"[".$app->trans->getJS('wrapper', 1, 2)."]\"; //[unknown value]  
			}
		};\n";
	}

	public function setData(){
		/*
		$app = $this->app;
		$app->lincko->translation['browser_title'] = $app->trans->getJS('wrapper', 1, 1); //Lincko - Team collaboration tool
		$list = $app->lincko->translation;
		echo "Lincko.Translation._data = [];\n";
		foreach ($list as $key => $value) {
					echo 'Lincko.Translation._data["'.$key.'"] = "'.STR::sql_to_js($value)."\";\n";
		}
		echo "
		Lincko.Translation.pushData = function(text){
			var Regexp = /@@(.+?)~~/;
			while (match = Regexp.exec(text)) {
				if(match[1] in Lincko.Translation._data){
					text = text.replace('@@'+match[1]+'~~', Lincko.Translation._data[match[1]]);
				} else {
					JSerror.sendError('The word could not be converted: '+match[1]+' \\n'+text, '/translation/list.js', '0');
					text = text.replace('@@'+match[1]+'~~', \"[".$app->trans->getJS('wrapper', 1, 2)."]\"); //[unknown value]
				}

			}
			return text;
		};\n";
		*/
	}

}

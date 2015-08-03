<?php

namespace bundles\lincko\wrapper\controllers;

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

	protected function setList(){
		$app = $this->app;
		$list = $app->trans->getList(true, 8000);
		echo "Lincko.Translation = {};\n";
		echo "Lincko.Translation._list = {};\n";
		foreach ($list as $bundle => $list_bundles) {
			foreach ($list_bundles as $category => $list_categories) {
				foreach ($list_categories as $phrase => $value) {
					echo 'Lincko.Translation._list["'.$bundle.'_'.$category.'_'.$phrase.'"] = {
						js: "'.STR::sql_to_js($value).'",
						html: "'.STR::sql_to_html($value).'",
					};'."\n";
				}
			}
		}
		echo "
		Lincko.Translation.get = function(bundle, phrase, format){
			var format_tp = 'js';
			var category = '8000'; //Default category for JS sentences
			if(bundle+'_'+category+'_'+phrase in Lincko.Translation._list){
				if(typeof format !== 'undefined') {
					if(format in Lincko.Translation._list[bundle+'_'+category+'_'+phrase]){
						format_tp = format;
					}
				}
				var text = Lincko.Translation._list[bundle+'_'+category+'_'+phrase][format_tp];
				return text;
			} else {
				return \"[".$app->trans->getJS('wrapper', 1, 2)."]\"; //[unknown value]  
			}
		};\n";
	}

}

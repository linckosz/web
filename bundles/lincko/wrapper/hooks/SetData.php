<?php

namespace bundles\lincko\wrapper\hooks;

use \bundles\lincko\wrapper\models\Session;
use \bundles\lincko\wrapper\models\Creation;
use \bundles\lincko\wrapper\models\TranslationListJS;


function SetData(){
	$app = \Slim\Slim::getInstance();
	$app->lincko->data = array_merge(
		$app->lincko->data,
		array(
			'yonghu' => Session::getData('yonghu'),
			'youjian' => Session::getData('youjian'),
			'jizhu' => Session::getData('jizhu'),
			'wrapper_user_created' => Creation::exists(),
			'translation_list_js' => TranslationListJS::setList(),
		)
	);
	return true;
}

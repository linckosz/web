<?php

namespace bundles\lincko\wrapper\hooks;

use \bundles\lincko\wrapper\models\Session;
use \bundles\lincko\wrapper\models\Creation;
use \bundles\lincko\wrapper\models\TranslationListJS;


function SetData(){
	$app = \Slim\Slim::getInstance();
	
	$logged = false;
	if(\bundles\lincko\wrapper\models\Session::getData('yonghu')
		&& \bundles\lincko\wrapper\models\Session::getData('youjian')
		&& \bundles\lincko\wrapper\models\Session::getData('mima')
		&& \bundles\lincko\wrapper\models\Session::getData('jizhu')
		&& \bundles\lincko\wrapper\models\Session::getData('shangzai_puk')
		&& \bundles\lincko\wrapper\models\Session::getData('shangzai_cs')){
		$logged = true;
	} else {
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
	}

	$app->lincko->data = array_merge(
		$app->lincko->data,
		array(
			'yonghu' => Session::getData('yonghu'),
			'youjian' => Session::getData('youjian'),
			'jizhu' => Session::getData('jizhu'),
			'wrapper_user_created' => Creation::exists(),
			'translation_list_js' => TranslationListJS::setList(),
			'logged' => $logged,
		)
	);
	return true;
}

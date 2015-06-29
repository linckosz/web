<?php

namespace bundles\lincko\wrapper\hooks;

use \bundles\lincko\wrapper\models\Session;
use \bundles\lincko\wrapper\models\Creation;
use \bundles\lincko\wrapper\models\TranslationListJS;


function SetData(){
	$app = \Slim\Slim::getInstance();
	
	$logged = false;
	if(Session::getData('yonghu')
		&& Session::getData('youjian')
		&& Session::getData('mima')
		&& Session::getData('jizhu')
		&& Session::getData('sha')
		&& Session::getData('uid')
		&& Session::getData('shangzai_puk')
		&& Session::getData('shangzai_cs')){
		$logged = true;
	} else {
		$app->deleteCookie('yonghu');
		$app->deleteCookie('jizhu');
		$app->deleteCookie('mima');
		$app->deleteCookie('sha');
		$app->deleteCookie('uid');
		$app->deleteCookie('shangzai_puk');
		$app->deleteCookie('shangzai_cs');
		unset($_SESSION['yonghu']);
		unset($_SESSION['youjian']);
		unset($_SESSION['mima']);
		unset($_SESSION['jizhu']);
		unset($_SESSION['public_key']);
		unset($_SESSION['private_key']);
		unset($_SESSION['sha']);
		unset($_SESSION['uid']);
	}

	$app->lincko->data = array_merge(
		$app->lincko->data,
		array(
			'yonghu' => Session::getData('yonghu'),
			'youjian' => Session::getData('youjian'),
			'jizhu' => Session::getData('jizhu'),
			'uid' => Session::getData('uid'),
			'sha' => Session::getData('sha'),
			'wrapper_user_created' => Creation::exists(),
			'translation_list_js' => TranslationListJS::setList(),
			'logged' => $logged,
		)
	);
	return true;
}

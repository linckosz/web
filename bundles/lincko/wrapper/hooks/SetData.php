<?php

namespace bundles\lincko\wrapper\hooks;

use \bundles\lincko\wrapper\models\Creation;
use \bundles\lincko\wrapper\models\TranslationListJS;
use \libs\OneSeventySeven;

function getFingerprint(){
	$http = \Slim\Environment::getInstance();
	return md5( 'salt'.$http['HTTP_USER_AGENT'] );
}

function SetData(){
	$app = \Slim\Slim::getInstance();
	$logged = false;
	
	if(
		   //Minimum fields required to display offline
		   OneSeventySeven::get('youjian') //resign & display
		&& OneSeventySeven::get('lianke') //resign
		&& ( OneSeventySeven::get('jizhu') || ( isset($_SESSION['public_key']) && isset($_SESSION['private_key']) ) ) //resign & display
		&& OneSeventySeven::get('sha') //data
		&& OneSeventySeven::get('uid') //data
	){
		//It help to keep a trace of those values
		$jizhu = OneSeventySeven::get('jizhu');
		$youjian = OneSeventySeven::get('youjian');
		$logged = true;
	} else {
		//If there is a record for 'remember me', we keep it to check the box or not as user defaut selection
		//Also Keep at least the email address force quicker completion (even if set to off the 'remember me')
		OneSeventySeven::unsetAll(array('jizhu', 'yuyan', 'youjian'));
	}
	

	//The below lines will give null if previously unsetAll
	$yonghu = OneSeventySeven::get('yonghu');
	$youjian = OneSeventySeven::get('youjian');
	$jizhu = OneSeventySeven::get('jizhu');
	$uid = OneSeventySeven::get('uid');
	$sha = OneSeventySeven::get('sha');

	//This will force the checkbox 'remember me' to be checked as default
	if(is_null($jizhu)){
		$jizhu = true;
	}
	
	if($logged){
		$app->lincko->translation['username'] = $yonghu;
	}

	$app->lincko->data = array_merge(
		$app->lincko->data,
		array(
			'yonghu' => $yonghu,
			'youjian' => $youjian,
			'jizhu' => $jizhu,
			'uid' => $uid,
			'sha' => $sha,
			'logged' => $logged,
			'fingerprint' => getFingerprint(), //fingerprint of the browser
		)
	);
	return true;
}

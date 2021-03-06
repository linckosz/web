<?php

namespace bundles\lincko\wrapper\hooks;

use \bundles\lincko\app\models\Data;
use \bundles\lincko\wrapper\models\Creation;
use \bundles\lincko\wrapper\models\TranslationListJS;
use \libs\OneSeventySeven;
use \libs\Datassl;

function getFingerprint(){
	$http = \Slim\Environment::getInstance();
	return md5( 'salt'.$http['HTTP_USER_AGENT'] );
}

function SetData(){
	$app = \Slim\Slim::getInstance();
	$logged = false;

	if(
		   //Minimum fields required to display offline
		   OneSeventySeven::get('hahaha') //resign
		&& ( OneSeventySeven::get('jizhu') || ( isset($_SESSION['public_key']) && isset($_SESSION['private_key']) ) ) //resign & display
		&& OneSeventySeven::get('sha') //data
		&& OneSeventySeven::get('uid') //data
	){
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
	$styling = OneSeventySeven::get('styling');
	$ucode = Datassl::encrypt($uid, 'invitation');
	$hashtag = false;
	$data_js = 0;
	$data_nosql = 0;

	$shangzai = false;
	if($pukpic = OneSeventySeven::get('pukpic')){
		$shangzai = Datassl::encrypt($pukpic);
	}
	
	//Place in cookies for upload and download files
	$fingerprint = getFingerprint(); //fingerprint of the device
	OneSeventySeven::set(array('fingerprint' => $fingerprint));

	//This will force the checkbox 'remember me' to be checked as default
	if(is_null($jizhu)){
		$jizhu = true;
	}
	
	if($logged){
		$app->lincko->translation['username'] = $yonghu;
		//Trigger hashtag only once in the application
		if(isset($_COOKIE['hashtag'])){
			$hashtag = $_COOKIE['hashtag'];
			//Clean hashtag once we are sure to be inside the application (= when the first latVisist call is done)
			if($app->request->getResourceUri()=='/wrapper/data/latest'){
				unset($_COOKIE['hashtag']);
				setcookie('hashtag', $hashtag, time()-3600, '/');
			}
		}
		if($sha){
			if($data = Data::where('sha', $sha)->where('workspace', $app->lincko->data['workspace'])->first()){
				$data_nosql = $data->lastvisit;
				if(isset($_SESSION['get_nosql'])){
					unset($_SESSION['get_nosql']);
					$data_js = $data->lastvisit;
				}
			}
		}
		if($sha && isset($_SESSION['get_nosql'])){
			unset($_SESSION['get_nosql']);
			if($data = Data::find($sha)){
				$data_js = $data->lastvisit;
			}
		}
	}

	$app->lincko->data = array_merge(
		$app->lincko->data,
		array(
			'yonghu' => $yonghu,
			'youjian' => $youjian,
			'jizhu' => $jizhu,
			'uid' => $uid,
			'sha' => $sha,
			'styling' => $styling,
			'ucode' => $ucode,
			'hashtag' => $hashtag,
			'logged' => $logged,
			'fingerprint' => $fingerprint,
			'shangzai' => $shangzai,
			'data_js' => $data_js, //receive
			'data_nosql' => $data_nosql, //send
		)
	);
	return true;
}

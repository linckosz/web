<?php

namespace bundles\lincko\wrapper\controllers;

use \libs\Controller;
use \libs\File;

class ControllerDynscript extends Controller {

	//toto => I am not sure how to generate this file with cache enable in header yet
	public function regroup_get($md5){
		$app = \Slim\Slim::getInstance();
		$script = '';
		$expire_seconds = 86400;
		$expire_string = gmdate(DATE_RFC1123, time()+$expire_seconds);
		$app->response->headers->set('Content-Type', 'application/javascript');
		$app->response->headers->set('Cache-Control', 'public, no-transform , max-age='.$expire_seconds); //This will be overwriten by nginx (must be setup from nginx)
		$app->response->headers->set('Expires', $expire_string);

		if($get = $app->request->get()){
			if($files = json_decode($get)){
				\libs\Watch::php($files, $md5, __FILE__, __LINE__, false, false, true);
				//Make sure to delete the ?123abc after the file name
				$script = File::getGroupLatest($md5.'.js', array(
					//'/lincko/wrapper/scripts/test1.js',
					//'/lincko/wrapper/scripts/test2.js',
				), true);
			}
		}

		echo $script;
	}

}

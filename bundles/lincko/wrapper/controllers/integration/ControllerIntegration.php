<?php

namespace bundles\lincko\wrapper\controllers\integration;

use \libs\Controller;

class ControllerIntegration extends Controller {

	//Used by Lincko integration QR code
	public function code_get($code){
		$app = \Slim\Slim::getInstance();
		$_SESSION['integration_code'] = $code;
		$app->lincko->data['link_reset'] = true;
		$_SESSION['integration_check'] = true;
		unset($_SESSION['integration_check']);
		if($app->lincko->data['logged']){
			$app->lincko->data['integration_connected'] = true;
		}
		$app->router->getNamedRoute('root')->dispatch();
	}

}

<?php

namespace bundles\lincko\wrapper\controllers\integration;

use \libs\Controller;

class ControllerIntegration extends Controller {

	//Used by Lincko integration QR code
	public function code_get($code){
		$app = \Slim\Slim::getInstance();
		$_SESSION['integration_code'] = $code;
		$app->lincko->data['link_reset'] = true;
		$app->lincko->data['force_open_website'] = false;
		$app->router->getNamedRoute('root')->dispatch();
	}

}

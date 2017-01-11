<?php

namespace bundles\lincko\wrapper\controllers\integration;

use \libs\Controller;

class ControllerIntegration extends Controller {

	public function code_get($code){
		$app = \Slim\Slim::getInstance();
		$_SESSION['integration_code'] = $code;
		$app->lincko->data['link_reset'] = true;
		$_SESSION['integration_check'] = true;
		unset($_SESSION['integration_check']);
		$app->router->getNamedRoute('root')->dispatch();
	}

}

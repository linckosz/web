<?php
//Category 2
namespace bundles\lincko\wrapper\controllers;

use \libs\Controller;
use \libs\STR;

class ControllerDate extends Controller {

	protected $app = NULL;

	public function __construct(){
		$app = $this->app = \Slim\Slim::getInstance();
		return true;
	}

	public function date_get(){
		$app = $this->app;
		$app->response->headers->set('Content-Type', 'application/javascript');
		$app->response->headers->set('Cache-Control', 'no-cache, must-revalidate');
		$app->response->headers->set('Expires', 'Fri, 12 Aug 2011 14:57:00 GMT');
		$this->setDate();
	}

	protected function setDate(){
		$app = $this->app;
		$app->trans->setDefaultLanguage('wrapper');

		echo "
		//timestamp (optional) default is current UTC
		function wrapper_date(timestamp) {

			if(typeof this.Constructor === 'function'){
				this.Constructor(timestamp);
			}
		};

		wrapper_date.prototype = {
	
			day: [";
			for($i=0; $i<=6; $i++){
				echo '"'.strftime('%A', strtotime('Sunday +'.$i.' days'))."\", ";
			}
		echo "],
			
			day_short: [";
			for($i=0; $i<=6; $i++){
				echo '"'.strftime('%a', strtotime('Sunday +'.$i.' days'))."\", ";
			}
		echo "],
			
			month: [";
			for($i=0; $i<=11; $i++){
				echo '"'.strftime('%B', strtotime('January +'.$i.' months'))."\", ";
			}
		echo "],
			
			month_short: [";
			for($i=0; $i<=11; $i++){
				echo '"'.strftime('%b', strtotime('January +'.$i.' months'))."\", ";
			}
		echo "],

			//The first key '0' is actually 31st of last month because JS table start from 0, not 1.
			ordinal: [";
			for($i=-1; $i<=30; $i++){
				echo '"'.date('S', strtotime($i.' days', 0))."\", ";
			}
		echo "],

			format: {
				date_short: \"".$app->trans->getJS('wrapper', 2, 1)."\", //Jul 8th (Default)

				date_medium: \"".$app->trans->getJS('wrapper', 2, 2)."\", //July 8th, 2015

				date_long: \"".$app->trans->getJS('wrapper', 2, 3)."\", //8 Jul 2015 01:51 PM

				date_full: \"".$app->trans->getJS('wrapper', 2, 4)."\", //Sat 08 Jul 2015 01:51 PM

				time_short: \"".$app->trans->getJS('wrapper', 2, 5)."\", //01:51 PM

				time_full: \"".$app->trans->getJS('wrapper', 2, 6)."\", //01:51:31 PM
			},

		};
		\n";
	}

}

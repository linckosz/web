<?php

namespace bundles\lincko\wrapper\models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\SoftDeletingTrait;

class Creation extends Model {

	protected $connection = 'wrapper';

	protected $table = 'creation';

	protected $primaryKey = 'IP';

	public $timestamps = true;

	protected $visible = array();

	/////////////////////////////////////

	public static function record(){
		$app = \Slim\Slim::getInstance();
		$IP = $app->request->getIp();
		$fingerprint = $app->lincko->data['fingerprint'];
		$creation = self::where('IP', $IP)->where('fingerprint', $fingerprint)->first();
		if($creation){
			$creation->updated_at = new \DateTime();
			$creation->save();
			return true;
		} else {
			$creation = new self;
			$creation->IP = $IP;
			$creation->fingerprint = $app->lincko->data['fingerprint'];
			$creation->save();
			return true;
		}
		return false;
	}

	public static function exists(){
		$app = \Slim\Slim::getInstance();
		$limit = new \DateTime();
		$limit->sub(new \DateInterval('PT'.$app->lincko->wrapper['captcha_timing'].'S'));
		
		$IP = $app->request->getIp();
		$fingerprint = $app->lincko->data['fingerprint'];

		$creation = self::where('IP', $IP)->where('fingerprint', $fingerprint)->where('updated_at', '>', $limit)->first();
		if($creation){
			return true;
		}
		return false;
	}

	//Return the remaining timing in minutes from the last account creation date to the date to allow the new account creation
	public static function remainTime(){
		$app = \Slim\Slim::getInstance();
		$limit = new \DateTime();
		$limit->sub(new \DateInterval('PT'.$app->lincko->wrapper['captcha_timing'].'S'));
		
		$IP = $app->request->getIp();

		$creation = self::find($IP);
		if($creation){
			$diff = date_diff($limit, $creation->updated_at);
			return 1+intval($diff->format('%r%i'));
		}
		return 0;
	}


}
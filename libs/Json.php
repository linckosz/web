<?php

namespace libs;

class Json {

	protected $json = array(
		'msg' => '',
		'error' => true,
		'status' => 500,
	);

	public function __construct($msg, $error=true, $status=500, $signout=false, $resignin=false, $files=array(), $show=true){
		if(!$error){
			$this->json['error'] = false;
		}
		$this->json['status'] = intval($status);
		$this->json['msg'] = (string)$msg;

		$this->json['show'] = $show;

		//optional parameters for front end server
		if($signout || $resignin){
			$this->json['flash'] = array(
					'signout' => (boolean)$signout,
					'resignin' => (boolean)$resignin,
			);
		}
		if(count($files)){
			$this->json['files'] = (array)$files;
		}
		return true;
	}

	public function render(){
		ob_clean();
		header("Content-type: application/json; charset=UTF-8");
		echo json_encode($this->json);
		return exit(0);
	}
	
}

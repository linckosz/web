<?php

namespace bundles\lincko\wrapper\controllers\integration;

use \bundles\lincko\wrapper\controllers\ControllerWrapper;
use \bundles\lincko\wrapper\models\WechatPublic;
use \libs\Controller;
use \libs\OneSeventySeven;
use \libs\Wechat;
use \libs\Json;
use WideImage\WideImage;
use \bundles\lincko\wrapper\models\Wechatcb;

class ControllerWechat extends Controller {

	protected $app = NULL;
	protected $get = NULL;
	protected $appid = NULL;
	protected $secret = NULL;

	public function __construct(){
		$app = $this->app = \Slim\Slim::getInstance();
		$this->get = (array) $app->request->get();
		if(isset($this->get['wechat_response'])){
			if($response = base64_decode($this->get['wechat_response'])){
				if($response = json_decode($response)){
					$this->get = (array) $response;
				}
			}
		}
		return true;
	}

	public function weixinjs_get($timeoffset=0){
		$app = $this->app;
		$this->appid = $app->lincko->integration->wechat['dev_appid'];
		$this->secret = $app->lincko->integration->wechat['dev_secretapp'];
		$this->process('dev', $timeoffset);
	}

	public function lincko_get($timeoffset=0){
		$app = $this->app;
		$app->lincko->data['force_open_website'] = false;
		$this->appid = $app->lincko->integration->wechat['public_appid'];
		$this->secret = $app->lincko->integration->wechat['public_secretapp'];
		$this->process('pub', $timeoffset);
	}

	public function redirect_get($account, $redirect){
		$app = $this->app;
		$app->response->headers->set('Content-Type', 'text/html; charset=UTF-8');
		$app->response->headers->set('Cache-Control', 'no-cache, must-revalidate');
		$app->response->headers->set('Expires', 'Fri, 12 Aug 2011 14:57:00 GMT');
		$url = base64_decode($redirect);
		if(strpos($url, '?')){
			$url .= '&';
		} else {
			$url .= '?';
		}
		$url .= 'wechat_account='.$account.'&wechat_response='.base64_encode(json_encode($_GET));
		echo '
			<script>
				window.location.href = "'.$url.'";
			</script>
		';
		return true;
	}

	protected function process($account, $timeoffset=0){
		$app = $this->app;
		$response = $this->get;
		$access_token = false;
		$unionid = false;
		$openid = false;
		$state = false;
		$valid = false;

		$timeoffset = (int) $timeoffset;
		if($timeoffset<0){
			$timeoffset = 24 + $timeoffset;
		}
		if($timeoffset>=24){
			$timeoffset = 0;
		}

		if($response && isset($response['code']) && isset($response['state'])){
			$state = $response['state'];
			$param = array(
				'appid' => $this->appid,
				'secret' => $this->secret,
				'code' => $response['code'],
			);
			$response = $this->curl_get('authorization_code', $param);
			if($response && $result = json_decode($response)){
				if(isset($result->errcode)){
					$response = false;
				}
			}
		} else {
			$response = false;
		}

		if($state == 'snsapi_userinfo'){
			if($response && $result = json_decode($response)){
				if(isset($result->unionid)){
					$unionid = $result->unionid;
				}
				if(isset($result->access_token) && isset($result->openid) && !empty($result->openid)){
					$access_token = $result->access_token;
					$openid = $result->openid;
					$param = array(
						'access_token' => $access_token,
						'openid' => $openid,
						'lang' => $app->trans->getClientLanguage(),
					);
					$response = $this->curl_get('snsapi_userinfo', $param);
					if($response && $result = json_decode($response)){
						if(isset($result->errcode)){
							$response = false;
						}
					}
				}
			} else {
				$response = false;
			}

			if($response && $access_token && $unionid && !empty($unionid) && $result = json_decode($response)){
				$data = new \stdClass;
				
				/*
					Using OpenID is more restrictive because it's different from DEV and PUBLIC account (UnionID is same),
					but the advantage is that it will work on .cafe and .co (sandbox bruno wechat), and we can skip a confirmation because snsapi_base is providing OpenID without notification instead of snsapi_userinfo
				$data->party = 'wechat_'.$account;
				$data->party_id = 'oid.'.$account.'.'.$openid;
				*/
				$data->party = 'wechat';
				$data->party_id = 'uid.'.$unionid;
				$data->timeoffset = $timeoffset;
				$result->account = $account;
				$data->data = $result;
				$controller = new ControllerWrapper($data, 'post', false);
				if($response = $controller->wrap_multi('integration/connect')){
					$valid = false;
					if(!isset($response->status) || $response->status != 200){
						$response = false;
					} else {
						$valid = $this->setSession($response);
					}
					\bundles\lincko\wrapper\hooks\SetData(); //used to help log in immediatly
				}
			} else {
				$response = false;
			}

		} else {
			$app->lincko->data['integration_wechat_new'] = true; //Check if OpenID exists, if not it redirect to create an account
			if($response && $result = json_decode($response)){
				if(isset($result->access_token) && isset($result->openid) && !empty($result->openid) && isset($result->unionid) && !empty($result->unionid)){
					$access_token = $result->access_token;
					$openid = $result->openid;
					$unionid = $result->unionid;

					$data = new \stdClass;
					/*
						Using OpenID is more restrictive because it's different from DEV and PUBLIC account (UnionID is same),
						but the advantage is that it will work on .cafe and .co (sandbox bruno wechat), and we can skip a confirmation because snsapi_base is providing OpenID without notification instead of snsapi_userinfo
					$data->party = 'wechat_'.$account;
					$data->party_id = 'oid.'.$account.'.'.$openid;
					*/
					$data->party = 'wechat';
					$data->party_id = 'uid.'.$unionid;
					$data->timeoffset = $timeoffset;
					$result->account = $account;
					$data->data = $result;
					$controller = new ControllerWrapper($data, 'post', false);
					if($response = $controller->wrap_multi('integration/connect')){
						if(!isset($response->status) || $response->status != 200){
							$response = false;
						} else {
							$valid = false;
							if(!isset($response->status) || $response->status != 200){
								$response = false;
							} else {
								$valid = $this->setSession($response);
							}
							if($valid){
								$app->lincko->data['integration_wechat_new'] = false;
							}
							\bundles\lincko\wrapper\hooks\SetData(); //used to help log in immediatly
						}
					}
				}
			} else {
				$response = false;
			}

		}

		if($valid && $account=='pub' && $openid){
			//It helps to track if we are using wechat browser and launch official account reminder
			OneSeventySeven::set(array('wxpukoid' => $openid));
		}

		$app->lincko->data['link_reset'] = true;
		if(!$response && !$app->lincko->data['integration_wechat_new']){
			$app->lincko->data['integration_connection_error'] = true;
			$app->lincko->translation['party'] = 'Wechat';
		}
		
		$app->router->getNamedRoute('root')->dispatch();

		return true;
	}

	public function applog_get(){
		$app = $this->app;
		return $this->applog($app->request->get());
	}

	public function applog_post(){
		$app = $this->app;
		return $this->applog($app->request->post());
	}

	protected function applog($obj){
		$app = $this->app;
		$app->lincko->http_code_ok = true;
		if($obj = (object) $obj){
			if(isset($obj->data)){
				if($temp = json_decode($obj->data)){
					if(isset($temp->data) && isset($temp->data->unionid)){
						$data = new \stdClass;
						$data->party = 'wechat';
						$data->party_id = 'uid.'.$temp->data->unionid;
						$data->timeoffset = 16; //Default is 16 for china
						if(isset($temp->timeoffset)){
							$data->timeoffset = $temp->timeoffset;
						}
						$data->data = $temp->data;
						$controller = new ControllerWrapper($data, 'post', false);
						if($response = $controller->wrap_multi('integration/connect')){
							if(!isset($response->status) || $response->status != 200){
								$response = false;
							} else {
								$valid = false;
								if(!isset($response->status) || $response->status != 200){
									$response = false;
								} else {
									$valid = $this->setSession($response);
								}
								if($valid){
									$app->lincko->data['integration_wechat_new'] = false;
									OneSeventySeven::set(array('jizhu' => true));
									OneSeventySeven::setCookies();
								}
							}
						}
						if($response){
							\bundles\lincko\wrapper\hooks\SetData(); //used to help log in immediatly
							$app->lincko->data['link_reset'] = true;
							$app->router->getNamedRoute('root')->dispatch();
							return true;
						}
					}
				}
			}
		}
		$json = new Json('problem', false, 406, false, false, array(), false);
		$json->render(406);
		return exit(0);
	}

	protected function setSession($response){
		$app = $this->app;
		$valid = true;
		if(isset($response->flash->username_sha1) && isset($response->flash->uid)){
			OneSeventySeven::set(array('sha' => substr($response->flash->username_sha1, 0, 20))); //Truncate to 20 character because phone alias notification limitation
			OneSeventySeven::set(array('uid' => $response->flash->uid));
		} else {
			$valid = false;
		}
		//Helps to not keep real creadential information on user computer, but only an encrypted code
		if(isset($response->flash->log_id)){
			OneSeventySeven::set(array('hahaha' => $response->flash->log_id));
		} else {
			$valid = false;
		}
		//After signin, it return the username, it's only used once to display the user name faster than the local storage.
		//It's almost useless
		if(isset($response->flash->username)){
			OneSeventySeven::set(array('yonghu' => $response->flash->username));
		}
		//Used to display/download files in a secured way and keep browser cache enable (same url)
		if(isset($response->flash->pukpic)){
			setcookie('pukpic', $response->flash->pukpic, time()+intval($app->lincko->cookies_lifetime), '/', $app->lincko->domain);
			OneSeventySeven::set(array('pukpic' => $response->flash->pukpic));
		} else {
			$valid = false;
		}
		return $valid;
	}

	public function curl_get($grant_type=false, $param=array()){
		$app = $this->app;
		if($grant_type=='authorization_code'){
			$url = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid='.$param['appid'].'&secret='.$param['secret'].'&code='.$param['code'].'&grant_type=authorization_code';
		} else if($grant_type=='snsapi_userinfo'){
			$url = 'https://api.weixin.qq.com/sns/userinfo?access_token='.$param['access_token'].'&openid='.$param['openid'].'&lang='.$param['lang'].'&grant_type=snsapi_userinfo'; //Need confirmation from user (used only the first time)
		} else {
			return false;
		}
		//\libs\Watch::php($url, '$url', __FILE__, __LINE__, false, false, true);
		$timeout = 8;
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url); //Port used is 10443 only
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
		curl_setopt($ch, CURLOPT_FRESH_CONNECT, true);
		curl_setopt($ch, CURLOPT_FORBID_REUSE, true);
		curl_setopt($ch, CURLOPT_ENCODING, 'gzip');

		$verbose_show = false;
		if($verbose_show){
			$verbose = fopen('php://temp', 'w+');
			curl_setopt($ch, CURLOPT_VERBOSE, true);
			curl_setopt($ch, CURLOPT_STDERR, $verbose);
		}

		$result = curl_exec($ch);

		if($verbose_show){
			\libs\Watch::php(curl_getinfo($ch), '$ch', __FILE__, __LINE__, false, false, true);
			$error = '['.curl_errno($ch)."] => ".htmlspecialchars(curl_error($ch));
			\libs\Watch::php($error, '$error', __FILE__, __LINE__, false, false, true);
			rewind($verbose);
			\libs\Watch::php(stream_get_contents($verbose), '$verbose', __FILE__, __LINE__, false, false, true);
			fclose($verbose);
			\libs\Watch::php(json_decode($result), '$result', __FILE__, __LINE__, false, false, true);
		}

		@curl_close($ch);
		return $result;
	}

	public function curl_post($grant_type=false, $param=array(), $data=false){
		$app = $this->app;
		if(!is_object($data)){
			$data = new \stdClass;
		}
		if($grant_type=='send_message'){
			//http://admin.wechat.com/wiki/index.php?title=Customer_Service_Messages
			$url = 'https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token='.$param['access_token'];
		} else {
			return false;
		}
		$data = json_encode($data, JSON_FORCE_OBJECT);
		//\libs\Watch::php($data, $url, __FILE__, __LINE__, false, false, true);
		$timeout = 8;
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url); //Port used is 10443 only
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
		curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
		curl_setopt($ch, CURLOPT_POST, true);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
		curl_setopt($ch, CURLOPT_FRESH_CONNECT, true);
		curl_setopt($ch, CURLOPT_FORBID_REUSE, true);
		curl_setopt($ch, CURLOPT_ENCODING, 'gzip');
		curl_setopt($ch, CURLOPT_HTTPHEADER, array(
				'Content-Type: application/json; charset=UTF-8',
				'Content-Length: ' . mb_strlen($data),
			)
		);

		$verbose_show = false;
		if($verbose_show){
			$verbose = fopen('php://temp', 'w+');
			curl_setopt($ch, CURLOPT_VERBOSE, true);
			curl_setopt($ch, CURLOPT_STDERR, $verbose);
		}

		$result = curl_exec($ch);

		if($verbose_show){
			\libs\Watch::php(curl_getinfo($ch), '$ch', __FILE__, __LINE__, false, false, true);
			$error = '['.curl_errno($ch)."] => ".htmlspecialchars(curl_error($ch));
			\libs\Watch::php($error, '$error', __FILE__, __LINE__, false, false, true);
			rewind($verbose);
			\libs\Watch::php(stream_get_contents($verbose), '$verbose', __FILE__, __LINE__, false, false, true);
			fclose($verbose);
			\libs\Watch::php(json_decode($result), '$result', __FILE__, __LINE__, false, false, true);
		}

		@curl_close($ch);
		return $result;
	}

	public function wxqrcode_get(){
		$app = \Slim\Slim::getInstance();
		$data = json_decode(json_encode($_GET, JSON_FORCE_OBJECT)); //convert to object
		$loop = 3; //number of try
		while($loop>0 && $loop){
			$loop--;
			$controller = new ControllerWrapper($data, 'post', false);
			if($response = $controller->wrap_multi('integration/set_wechat_qrcode')){
				if(isset($response->msg) && isset($response->msg->code) && isset($response->msg->url) && !empty($response->msg->url)){
					$_SESSION['integration_code'] = $response->msg->code;
					$_SESSION['integration_code_expire'] = time() + 180; //valid 3 minutes only (the unset after expiration is handle by ControllerWrapper already)
					$loop = false;
					WideImage::load($response->msg->url)->output('png');
					return exit(0);
				}
			}
		}
		return exit(0);
	}

	public function official_get(){
		$app = \Slim\Slim::getInstance();
		$option['token'] = $app->lincko->integration->wechat['public_token'];
		$wechat = new Wechat($option);
		$wechat->valid();
		return exit(0);
	}

	public function official_post(){
		$app = \Slim\Slim::getInstance();
		$body = $app->request->getBody();
		$data = simplexml_load_string($body, null, LIBXML_NOCDATA);
		
		$ignore_cb = false; //this is flipped true if the same call has been repeated within the given time
		$ignore_cb_duration = 30; //30s
		$delete_cb_record_age = 60; //1min
		$curtime = time();

		foreach (Wechatcb::all() as $cb) {
			if($curtime - $cb->first_cb_time > $delete_cb_record_age){
				//delete record on database
				$cb->forceDelete();
			}
		}

		//primary key for wechatcb database
		$id = (string) $data->FromUserName.'_';
		$EventKey = (string) $data->EventKey;
		if(strlen($EventKey) < 1){
			$id .= (string) $data->Event;
		} else {
			$id .= $EventKey;
		}
		
		$prev_cb = Wechatcb::where('id', $id)->first();
		
		if(isset($prev_cb)){
			if($curtime - $prev_cb->first_cb_time < $ignore_cb_duration){ //same call was recently made
				$ignore_cb = true;
			}
			else{
				//it has been too long since last call, so just update timestamp
				$prev_cb->first_cb_time = $curtime;
				$prev_cb->save();
			}
		}
		else{
			//add current cb to database
			$new_cb = new Wechatcb;
			$new_cb->id = $id;
			$new_cb->first_cb_time = $curtime;
			$new_cb->save();
		}

		//dont go past here for repeat cbs
		if($ignore_cb){
			return;
		}

		//\libs\Watch::php($data->EventKey, '$data', __FILE__, __LINE__, false, false, false);

		$app->trans->getList('default');
		$lang = $app->trans->getClientLanguage(); //Will be "en" by default
		$timeoffset = 16; //Chinese time is mostly probable to be used for wechat account
		$option['appid'] = $app->lincko->integration->wechat['public_appid'];
		$option['secret'] = $app->lincko->integration->wechat['public_secretapp'];
		$option['access_token'] = WechatPublic::access_token();

		$wechat = new Wechat($option);
		$wechat->getToken();

		if(isset($data->MsgType) && isset($data->Event) && strtolower($data->MsgType) == 'event'){
			$user = false;
			$scene_str = false;
			if(strtolower($data->Event) == 'subscribe'){
				$open_id = (string) $data->FromUserName;
				$user = $wechat->user($open_id);
				$event = false;
				if(isset($data->EventKey)){
					$integration_code = $_SESSION['integration_code'] = substr($data->EventKey, strlen('qrscene_'), strlen($data->EventKey)-strlen('qrscene_')+1);
					if(strlen($integration_code) > 4){
						$event = true;
						$lang = $app->trans->setLanguageNumber(intval(substr($integration_code, -2, 2))); //set user laguage
						$timeoffset = intval(substr($integration_code, -4, 2)); //set user timeoffset
					}

				}
				if($event){
					$wechat->sendMsg($open_id, $app->trans->getBRUT('wrapper', 5, 1, array(), $lang)); //Welcome to Lincko Use the Lincko button to login...
					$wechat->sendMsg($open_id, $app->trans->getBRUT('wrapper', 5, 2, array(), $lang)); //Login successful!
					
				} else {
					$wechat->sendMsg($open_id, $app->trans->getBRUT('wrapper', 5, 1, array(), $lang)); //Welcome to Lincko Use the Lincko button to login...
					$wechat->sendMsg($open_id, 'Ldywd-FyXd--19nkgvmNMBM3ELB8z1YIuPiKUFgkP-w','image');
				}
			} else if(strtolower($data->Event) == 'scan'){
				$open_id = (string) $data->FromUserName;
				$integration_code = $_SESSION['integration_code'] = (string) $data->EventKey;
				if(strlen($integration_code) > 4){
					$lang = $app->trans->setLanguageNumber(intval(substr($integration_code, -2, 2))); //set user laguage
					$timeoffset = intval(substr($integration_code, -4, 2)); //set user timeoffset
				}
				$wechat->sendMsg($open_id, $app->trans->getBRUT('wrapper',5 , 2, array(), $lang)."\n\n".$app->trans->getBRUT('app', 8000, rand(9901, 9946), array(), $lang)); //Login successful!
				$user = $wechat->user($open_id);
			}

			//\libs\Watch::php($user, '$user', __FILE__, __LINE__, false, false, true);

			if($user && isset($user['unionid'])){
				$data = new \stdClass;
				/*
					Using OpenID is more restrictive because it's different from DEV and PUBLIC account (UnionID is same),
					but the advantage is that it will work on .cafe and .co (sandbox bruno wechat), and we can skip a confirmation because snsapi_base is providing OpenID without notification instead of snsapi_userinfo
				$data->party = 'wechat_'.$account;
				$data->party_id = 'oid.'.$account.'.'.$openid;
				*/
				$data->party = 'wechat';
				$data->party_id = 'uid.'.$user['unionid'];
				$data->timeoffset = $timeoffset; //Chinese time is mostly probable to be used for wechat account
				$data->data = (object) $user;
				$data->data->account = 'pub';
				$controller = new ControllerWrapper($data, 'post', false);
				$response = $controller->wrap_multi('integration/connect', 1); //1s helps to close faster the connection, we don't need the response from the backend here, wechat only need a 200 OK
			}
		}

	}


	public function media_get(){
		$app = \Slim\Slim::getInstance();

		$option['appid'] = 'wx268709cdc1a8e280';
		$option['secret'] = '03fab389a36166cd1f75a2c94f5257a0';
		$wechat = new Wechat($option);
		$wechat->getToken();


		ob_clean();
		http_response_code(200);
		
		$list = $wechat->menus();
		echo '<table>';
		echo '<tr><td>title</td><td>type</td><td>subtitle</td><td>subtype</td><td>value</td></tr>';
		\libs\Watch::php($list['button'], '$files', __FILE__, __LINE__, false, false, true);
		 foreach ($list['button'] as $key => $value) {
		 	echo '<tr>';
		 	echo '<td>' . $value['name'] . '</td>';
		 	echo '<td>' . (isset($value['type']) ? $value['type'] : '') . '</td>'; 
		 
		 	
		 	if(isset($value['type'])){
		 		echo '<td></td>';
				echo '<td></td>';
				echo '<td>' . $value['url'] . '</td>';
				echo '</tr>';
		 	}
		 	else{

			 	if(isset($value['sub_button'])){
			 		foreach ($value['sub_button'] as $sub_key => $sub_value) {
			 			if($sub_key == 0)
			 			{
			 				echo '<td>' . $sub_value['name'] . '</td>';
							echo '<td>' . $sub_value['type'] . '</td>';
							echo '<td>' . $sub_value['media_id'] . '</td>';
							echo '</tr>';
			 			}
			 			else
			 			{
			 				echo '<tr>';
		 					echo '<td></td>'; 
		 					echo '<td></td>';
					 		echo '<td>' . $sub_value['name'] . '</td>';
							echo '<td>' . $sub_value['type'] . '</td>';
							echo '<td>' . $sub_value['media_id'] . '</td>';
							echo '</tr>';
			 			}
		 			}
			 	}
			 	else
			 	{
			 		echo '<td></td>';
					echo '<td></td>';
					echo '<td></td>';
					echo '</tr>';
	 			}
		 		
		 	}
		 	
		 }
		 echo '</table>';
		



		echo '<style>
			table {
				border: none;
				border-spacing: 0;
				border-collapse: collapse;
				padding: 4px;
				white-space: nowrap;
			}
			tr, td {
				border: solid 1px;
				border-spacing: 0;
				border-collapse: collapse;
				padding: 4px 8px;
			}
			.perc {
				float: left;
				color:#979797;
				padding-right: 20px;
			}
		</style>';



		


		$list = $wechat->material_lists('image', 0, 20);
		$wechat->sendMsg('og2amv2BiSiKMoDyYmpY7AmvJzxo', 'Ldywd-FyXd--19nkgvmNMBM3ELB8z1YIuPiKUFgkP-w','image');
		echo '<table>';
		foreach ($list['item'] as $key => $value) {
			echo '<tr>';
			echo "<td>$key</td>";
			echo ('<td>' . $value['media_id'] . '</td>');
			echo '<td>';


			// echo '<table>';
			// foreach ($value['content']['news_item'] as $item_key => $item_value) {
			// 	echo '<tr>';
			// 		echo '<td>'.$item_value["title"].'</td>';
			// 	echo '</tr>';
			// }
			// echo '</table>';

			echo '</td>';
			echo '</tr>';
		}
		echo '</table>';
		return exit(0);
	}

}

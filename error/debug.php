<?php
/**
  * wechat php test
  */
namespace libs;
use \libs\Wechat;
//define your token
define('TOKEN', 'weixin');


$option['account'] = 'gh_4a4fa1a22c02';
$option['appid'] = 'wx1d84f13b1addb1ba';
$option['secret'] = 'c35d9afab164b528d927db8cb0c394a1';
$wechat = new Wechat($option);
$wechat->getToken();

if ($_SERVER['REQUEST_METHOD'] == 'POST'){
	$app = \Slim\Slim::getInstance();
	$body = $app->request->getBody();
	$data = simplexml_load_string($body,null, LIBXML_NOCDATA);

	//\libs\Watch::php($body, 'Body', __FILE__, __LINE__, false, false, true);
	\libs\Watch::php($data, 'Data', __FILE__, __LINE__, false, false, true);
	
	switch($data->MsgType)
	{
		case 'text':
			break;
		case 'image':
			break;
		case 'voice':
			break;
		case 'video':
			break;
		case 'shortvideo':
			break;
		case 'event':
			switch($data->Event)
			{
				case 'subscribe':
					//if qrcode created by api,there is an "EventKey" with data
					if(isset($data->EventKey)){
						$open_id = (string)$data->FromUserName;
						$scene_str = substr($data->EventKey,strlen('qrscene_'),strlen($data->EventKey)-strlen('qrscene_')+1);
						$wechat->sendMsg($open_id,'欢迎关注lincko!');
						$wechat->sendMsg($open_id,'欢迎登录lincko!');
					}
					else{
						$open_id = (string)$data->FromUserName;
						$wechat->sendMsg($open_id,'欢迎关注lincko!');
					}
					break;
				case 'unsubscribe':
					break;
				case 'SCAN':
					//send msg
					$open_id = (string)$data->FromUserName;
					$scene_str = $data->EventKey;
					$wechat->sendMsg($open_id,'欢迎登录lincko!'. $scene_str );
					
					//login
					break;
				case 'LOCATION':
					break;
				case 'CLICK'://menu:click
					break;
				case 'VIEW'://menu:goto url
					break;
				default :
					break;
			}
			break;
		case 'location':
			break;
		default:
			break;
	}
	
} else if ($_SERVER['REQUEST_METHOD'] == "GET"){
	if(isset($_GET["lincko_request"])){
		switch($_GET["lincko_request"])
		{
			case 'qr_code' :
				$ticket = $wechat->getJsapiTicket();
				$md5 = md5(time() . mt_rand(0,1000));
				//toto,should insert it to database;don't forget to remove the used scene_str;

				$url = $wechat->getQRUrlStr($md5,1800);
				echo "<img src='$url'>";
				echo "<span>$md5:".$md5.'</span>';
				break;
			case '2' :
				
				break;
			default:
				echo 'nothing';
				break;
		}
	}
	else
	{
		$wechatToken = new WechatTokenVerification();
		$wechatToken->valid();
	}
}



class WechatTokenVerification
{
	public function valid()
    {
        $echoStr = $_GET["echostr"];

        //valid signature , option
        if($this->checkSignature()){
        	echo $echoStr;
        	exit;
        }
    }

    public function responseMsg()
    {
		//get post data, May be due to the different environments
		$postStr = $GLOBALS["HTTP_RAW_POST_DATA"];

      	//extract post data
		if (!empty($postStr)){
                /* libxml_disable_entity_loader is to prevent XML eXternal Entity Injection,
                   the best way is to check the validity of xml by yourself */
                libxml_disable_entity_loader(true);
              	$postObj = simplexml_load_string($postStr, 'SimpleXMLElement', LIBXML_NOCDATA);
                $fromUsername = $postObj->FromUserName;
                $toUsername = $postObj->ToUserName;
                $keyword = trim($postObj->Content);
                $time = time();
                $textTpl = "<xml>
							<ToUserName><![CDATA[%s]]></ToUserName>
							<FromUserName><![CDATA[%s]]></FromUserName>
							<CreateTime>%s</CreateTime>
							<MsgType><![CDATA[%s]]></MsgType>
							<Content><![CDATA[%s]]></Content>
							<FuncFlag>0</FuncFlag>
							</xml>";             
				if(!empty( $keyword ))
                {
              		$msgType = "text";
                	$contentStr = "Welcome to wechat world!";
                	$resultStr = sprintf($textTpl, $fromUsername, $toUsername, $time, $msgType, $contentStr);
                	echo $resultStr;
                }else{
                	echo "Input something...";
                }

        }else {
        	echo "";
        	exit;
        }
    }
		
	private function checkSignature()
	{
        // you must define TOKEN by yourself
        if (!defined("TOKEN")) {
            throw new Exception('TOKEN is not defined!');
        }
        
        $signature = $_GET["signature"];
        $timestamp = $_GET["timestamp"];
        $nonce = $_GET["nonce"];
        		
		$token = TOKEN;
		$tmpArr = array($token, $timestamp, $nonce);
        // use SORT_STRING rule
		sort($tmpArr, SORT_STRING);
		$tmpStr = implode( $tmpArr );
		$tmpStr = sha1( $tmpStr );
		
		if( $tmpStr == $signature ){
			return true;
		}else{
			return false;
		}
	}
}

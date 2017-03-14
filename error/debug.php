<?php
use \libs\Wechat;
/*
    Write here anything you need as debugging information to be display on main page
    For twig display use: {{ _debug() }} or {{ _debug(data) }}
    For php display use: include($app->lincko->path.'/error/debug.php');
    Or simply open the link http://{domain}/debug

    To get data
    print_r($data);

    Then open the link (change the domain name according to dev(.net)/stage(.co)/production(.com) server)
    https://lincko.co/debug
*/
$app = \Slim\Slim::getInstance();
//print_r($data);
//phpinfo();

/*
//COM
$option['appid'] = 'wx268709cdc1a8e280';
$option['secret'] = '03fab389a36166cd1f75a2c94f5257a0';
$open_id = 'og2amv--gbQqK3Pz4LUTtOsprWx4';
$union_id = 'WqxPHuGPg2O4ND38AatZ8vi7U';
*/

//CO
$option['appid'] = 'wxb315b38a8267ad72';
$option['secret'] = 'e0a658f9d2b907ddb4bd61c3827542da';
//$open_id = 'og2amv--gbQqK3Pz4LUTtOsprWx4';
//$union_id = 'WqxPHuGPg2O4ND38AatZ8vi7U';



$wechat = new Wechat($option);
//$wechat->getToken();
//$url = $wechat->getQRUrl('123');

//echo $url;
//\libs\Watch::php($wechat, '$wechat', __FILE__, __LINE__, false, false, true);
//\libs\Watch::php($url, '$url', __FILE__, __LINE__, false, false, true);

/*

$wechat = new Wechat($option);
$wechat->getJsapiTicket();
*/

\libs\Watch::php($_GET, '$_GET', __FILE__, __LINE__, false, false, true);
\libs\Watch::php($_POST, '$_POST', __FILE__, __LINE__, false, false, true);
\libs\Watch::php($app->request->getBody(), '$getBody', __FILE__, __LINE__, false, false, true);
\libs\Watch::php($GLOBALS, '$GLOBALS', __FILE__, __LINE__, false, false, true);

//define your token
define("TOKEN", "1234");
$wechatObj = new wechatCallbackapiTest();
if(isset($_GET["echostr"])){
    $wechatObj->valid();
    $wechatObj->responseMsg();
}
//$wechatObj->valid();
class wechatCallbackapiTest
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

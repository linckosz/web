<?php
//你好 Léo & Luka

namespace libs;

use Illuminate\Database\Eloquent\Model;

class Email extends \PHPMailer {

	protected $param = NULL;

	//Construct and setup basic parameters
	public function __construct(){
		parent::__construct(true); //"true" will throw exceptions on errors
		$app = \Slim\Slim::getInstance();
		$param = $this->param = $app->lincko->email;
		$this->IsSendmail(true);
		$this->CharSet = $param->CharSet;
		$this->Abuse = $param->Abuse;
		$this->Sender = $param->Sender;
		$this->From = $param->From;
		$this->FromName = $param->FromName;
		$this->Timeout = 6;
		$this->IsHTML(true);
	}

	//Convert special HTML entities back to characters, email subject does not recognize special HTML entities
	public function setSubject($subject, $decode=true){
		if($decode){
			$this->Subject = htmlspecialchars_decode($subject);
		} else {
			$this->Subject = $subject;
		}
	}

	public static function UrlToShortLink($text){
		//https://mathiasbynens.be/demo/url-regex
		$pattern = "`((?:https?|ftp)://\S+?)(?=[[:punct:]]?(?:\s|\Z)|\Z|<)`"; 
		$target = '<a href="${0}" target="_blank" style="cursor:pointer;cursor:hand;">${0}</a>';
		$text = preg_replace($pattern, $target, $text);
		return $text;
	}

	//Keep a record of the Mail object to be sent later after rendering
	public function sendLater($mail_template){
		$this->msgHTML($mail_template);
		$html = new \Html2Text\Html2Text($mail_template);
		$this->AltBody = $html->getText();
		$param = $this->param;
		$param->List[] = $this;
		return true;
	}

}

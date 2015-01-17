<?php
//你好 Léo & Luka

namespace bundles\lincko\wrapper\hooks;

//Special functions to manage errors
function SendEmail(){
	$app = \Slim\Slim::getInstance();
	$List = $app->lincko->email->List;
	foreach($List as $i => $email){
		return $email->send();
	}
}

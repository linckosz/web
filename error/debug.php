<?php
use \libs\STR;
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

$complex = "   ZH   个人 call\\ned Léonardo &       Брюс l'a \"ù« <script>alert('ok');</script><?php\n
ZH-CHS\r
";

$arr = new \stdClass;
$arr->a = 123;
$arr->b = $complex;
$arr->c = new \stdClass;
$arr->c->ca = 456;
$arr->c->cb = $complex;
$arr->d = array(
	'da' => 789,
	'db' => $complex,
);
$arr->e = true;
$arr->f = false;

//print_r($arr);

//echo convertToJS($arr);
function convertToJS(&$arr, &$echo='response', $first=true){
	if($first && !empty($echo)){
		$echo .= '=';
	}
	if((is_object($arr) || is_array($arr)) && !empty($arr)){
		$echo .= '{';
		foreach ($arr as $key => $value) {
			if(is_bool($value)){
				if($value){
					$echo .= $key.':true,';
				} else {
					$echo .= $key.':false,';
				}
			} else if(is_integer($value)){
				$echo .= $key.':'.$value.',';
			} else if(is_string($value)){
				$echo .= $key.':"'.STR::sql_to_js($value).'",';
			} else if((is_object($value) || is_array($value)) && !empty($value)){
				$echo .= $key.':';
				convertToJS($value, $echo, false);
			}
		}
		$echo .= '}';
		if(!$first){
			$echo .= ',';
		} else {
			return $echo .= ';';
		}
	}
}
echo convertToJS($arr);

/*
var arr = {
	a: 123,
	b: 'abc',
	c: {
		ca: 123,
		cb: def,
	},
	d: [
		'da' => 789,
		'db' => 'ghi',
	],
}
*/

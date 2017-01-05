
if(!wrapper_localstorage.logged && navigator.userAgent.match(/MicroMessenger/i) && account_integration){
	window.location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?appid="+account_integration.wechat.public_appid+"&redirect_uri=https%3A%2F%2F"+document.domain+"/debug/twig&response_type=code&scope=snsapi_userinfo&state=lincko#wechat_redirect";
}

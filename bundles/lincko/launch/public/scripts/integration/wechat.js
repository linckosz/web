if(!wrapper_force_open_website && !wrapper_localstorage.logged && navigator.userAgent.match(/MicroMessenger/i) && account_integration && account_integration.wechat){
	if(account_integration.wechat.base){
		window.location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?appid="+account_integration.wechat.public_appid+"&redirect_uri=https%3A%2F%2F"+document.linckoFront+document.linckoBack+document.domain+"/integration/wechat/lincko/"+account_timeoffset()+"&response_type=code&scope=snsapi_base&state=snsapi_base#wechat_redirect";
	} else {
		window.location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?appid="+account_integration.wechat.public_appid+"&redirect_uri=https%3A%2F%2F"+document.linckoFront+document.linckoBack+document.domain+"/integration/wechat/lincko/"+account_timeoffset()+"&response_type=code&scope=snsapi_userinfo&state=snsapi_userinfo#wechat_redirect";
	}
}

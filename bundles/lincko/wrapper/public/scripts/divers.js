wrapper_broswer = function(ua) {
	if(typeof ua==="undefined"){
		return false;
	}
	return navigator.userAgent.toUpperCase().indexOf(ua.toUpperCase())>=0;
};
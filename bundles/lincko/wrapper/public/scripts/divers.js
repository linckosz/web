wrapper_browser = function(ua) {
	if(typeof ua==="undefined"){
		return false;
	}
	return navigator.userAgent.toUpperCase().indexOf(ua.toUpperCase())>=0;
};

wrapper_compareObjects = function(o1, o2) {
	var k = '';
	for(k in o1) if(o1[k] != o2[k]) return false;
	for(k in o2) if(o1[k] != o2[k]) return false;
	return true;
};

wrapper_itemExists = function(haystack, needle) {
	for(var i=0; i<haystack.length; i++) if(wrapper_compareObjects(haystack[i], needle)) return true;
	return false;
}
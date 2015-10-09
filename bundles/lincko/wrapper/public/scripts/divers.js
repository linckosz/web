wrapper_browser = function(ua) {
	if(typeof ua==="undefined"){
		return false;
	}
	return true;
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

//Polyfill of Date.now(), because of IE8-
if (!Date.now) {
	Date.now = function() { return new Date().getTime(); }
}

String.prototype.ucfirst = function() {
	if(this.length > 0){
		return this.charAt(0).toUpperCase() + this.slice(1);
	} else {
		return this;
	}
}

String.prototype.replaceAll = function(find, replace) {
	find = find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
	return this.replace(new RegExp(find, 'gi'), replace);
}

$.fn.hasScrollBar = function() {
	return this.get(0).scrollHeight > this.height();
}
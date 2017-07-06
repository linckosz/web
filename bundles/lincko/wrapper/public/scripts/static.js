var wrapper_compareObjects = function(o1, o2) {
	var k = '';
	for(k in o1) if(o1[k] != o2[k]) return false;
	for(k in o2) if(o1[k] != o2[k]) return false;
	return true;
};

var wrapper_itemExists = function(haystack, needle) {
	for(var i=0; i<haystack.length; i++) if(wrapper_compareObjects(haystack[i], needle)) return true;
	return false;
};

var wrapper_to_html = function(text){
	//text = php_htmlentities(text, true); //Need to enable double encoding
	if(typeof text == 'undefined'){
		text = '';
	}
	text = parseHTML(text);
	text = php_nl2br(text);
	return text;
};

var html_to_wrapper = function(text){
	if(typeof text == 'undefined'){
		text = '';
	}
	text = php_br2nl(text);
	text = restoreHTML(text);
	return text;
};

var wrapper_flat_text = function(text){
	if(typeof text == 'undefined'){
		text = '';
	}
	text = text.replace(/\r\n|\n\r|\r|\n/g, '&nbsp;');
	return text;
}

var wrapper_to_url = function(text){
	// based on the rules here: http://www.mtu.edu/umc/services/web/cms/characters-avoid/
	text = text.replace(/[#%&{}\/\\<>*? $!'":@+`|=_]/g,'-');
	return text;
}

var wrapper_timeoffset = function(){
	//Important: Note that getTimezoneOffset() is return posit value number (-8H for China instead of 8H)
	//Reason is specs: http://stackoverflow.com/questions/21102435/why-does-javascript-date-gettimezoneoffset-consider-0500-as-a-positive-off
	var timeoffset = (new Date()).getTimezoneOffset();
	timeoffset = Math.floor(timeoffset/60);
	if(timeoffset<0){
		timeoffset = 24 + timeoffset; //24H - offset
	}
	if(timeoffset>=24){
		timeoffset = 0;
	}
	return timeoffset;
}

//Help to detach all Nodes
jQuery.prototype.recursiveEmpty = function(delay){
	if(typeof delay == 'undefined'){ delay = 1000; } //By default delay by 1s
	if(delay>0){
		var Children = this.contents();
		setTimeout(function(Children){
			if(Children){
				Children
					.contents().each(function () {
						$(this).not('iframe')
							.recursiveEmpty(0)
							.removeData()
							.remove();
						$(this)
							.removeData()
							.remove();
					});
			}
		}, delay, Children);
	} else {
		this
			.contents().each(function () { 
				$(this).not('iframe')
					.recursiveEmpty(0)
					.removeData()
					.remove();
				$(this)
					.removeData()
					.remove();
			});
	}

	this
		.off()
		.removeAttr()
		.empty();

	return this;
}

//Help to detach all Nodes
jQuery.prototype.recursiveRemove = function(delay){
	if(typeof delay == 'undefined'){ delay = 1000; } //By default delay by 1s
	this
		.recursiveEmpty(delay)
		.removeData()
		.remove();
	return this;
}

//Help to bloc all Nodes event
jQuery.prototype.recursiveOff = function(delay){
	if(typeof delay == 'undefined'){ delay = 0; }
	if(delay>0){
		var Children = this.contents();
		setTimeout(function(Children){
			if(Children){
				Children
					.contents().each(function () {
						$(this)
							.recursiveOff(0)
					});
			}
		}, delay, Children);
	} else {
		this
			.contents().each(function () {
				$(this)
					.recursiveOff(0)
			});
	}

	this
		.off();

	return this;
}

function encode_utf8(s) {
	return unescape(encodeURIComponent(s));
}

function decode_utf8(s) {
	return decodeURIComponent(escape(s));
}

var parseHTML = function(text) {
	text = ''+text;
	return text
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;')
		.replaceAll('  ', '&nbsp;&nbsp;')
	;
};

var restoreHTML = function(text) {
	text = ''+text;
	return text
		.replaceAll('&lt;', '<')
		.replaceAll('&gt;', '>')
		.replaceAll('&quot;', '"')
		.replaceAll('&#39;', "'")
		.replaceAll('&nbsp;&nbsp;', '  ')
	;
};

String.prototype.ucfirst = function() {
	if(this.length > 0){
		return this.charAt(0).toUpperCase() + this.slice(1);
	} else {
		return this;
	}
};

String.prototype.replaceAll = function(find, replace) {
	find = find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
	return this.replace(new RegExp(find, 'gi'), replace);
};

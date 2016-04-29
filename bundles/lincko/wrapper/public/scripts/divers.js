var wrapper_browser = function(ua) {
	if(typeof ua==="undefined"){
		return false;
	}
	return navigator.userAgent.toUpperCase().indexOf(ua.toUpperCase())>=0;
};

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
	text = php_htmlentities(text, true); //Need to enable double encoding
	text = php_nl2br(text);
	return text;
}

var supportsTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints;

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

$.fn.hasScrollBar = function() {
	return this.get(0).scrollHeight > this.height();
};


/*



function wrapper_test(type, RCUD){
	if(typeof type==="undefined"){ type = null; }
	if(typeof RCUD==="undefined"){ RCUD = -1; }
	if(type==null || RCUD==-1){
		console.log('Wrong parameter');
	}

	function wrapper_test_display(msg, data_error, data_status, data_msg){
		console.log(data_msg);
	}

	if(type=='*' || type=='chats'){
		if(RCUD==0){
			wrapper_sendAction(
				{
					"id": 1,
				},
				'post',
				'chat/read',
				wrapper_test_display
			);
		}
		else if(RCUD==1){
			wrapper_sendAction(
				{
					"parent_type": "",
					"parent_id": null,
					"title": "It's a chat room title",
				},
				'post',
				'chat/create',
				wrapper_test_display
			);
		}
		else if(RCUD==2){
			wrapper_sendAction(
				{
					"id": 4,
					"title": "你好, No: "+Math.floor(Math.random() * 20),
				},
				'post',
				'chat/update',
				wrapper_test_display
			);
		}
		else if(RCUD==3){
			wrapper_sendAction(
				{
					"id": 7,
				},
				'post',
				'chat/delete',
				wrapper_test_display
			);
		}
	}

	if(type=='*' || type=='comments'){
		if(RCUD==0){
			wrapper_sendAction(
				{
					"id": 124,
				},
				'post',
				'comment/read',
				wrapper_test_display
			);
		}
	}

	if(type=='*' || type=='notes'){
		if(RCUD==0){
			wrapper_sendAction(
				{
					"id": 10,
				},
				'post',
				'note/read',
				wrapper_test_display
			);
		}
	}

	if(type=='*' || type=='projects'){
		if(RCUD==0){
			wrapper_sendAction(
				{
					"id": 99,
				},
				'post',
				'project/read',
				wrapper_test_display
			);
		}
	}

	if(type=='*' || type=='roles'){
		if(RCUD==0){
			wrapper_sendAction(
				{
					"id": 2,
				},
				'post',
				'role/read',
				wrapper_test_display
			);
		}
	}

	if(type=='*' || type=='tasks'){
		if(RCUD==0){
			wrapper_sendAction(
				{
					"id": 146,
				},
				'post',
				'task/read',
				wrapper_test_display
			);
		}
	}

	if(type=='*' || type=='users'){
		if(RCUD==0){
			wrapper_sendAction(
				{
					"id": 5,
				},
				'post',
				'user/read',
				wrapper_test_display
			);
		}
	}

	if(type=='*' || type=='workspaces'){
		if(RCUD==0){
			wrapper_sendAction(
				{
					"id": 1,
				},
				'post',
				'workspace/read',
				wrapper_test_display
			);
		}
	}

}

*/

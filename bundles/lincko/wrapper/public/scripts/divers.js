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



//Help to detach all Nodes
jQuery.prototype.recursiveEmpty = function(delay){
	if(typeof delay == 'undefined'){ delay = 1000; } //By default delay by 1s
	if(delay>0){
		var Children = this.contents();
		setTimeout(function(Children){
			if(Children){
				Children
					.contents().each(function () {
						$(this)
							.recursiveEmpty(0)
							.removeData()
							.remove();
					});
			}
		}, delay, Children);
	} else {
		this
			.contents().each(function () {
				$(this)
					.recursiveEmpty(0)
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

var supportsTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints;

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

$.fn.hasScrollBar = function() {
	return this.get(0).scrollHeight > this.height();
};

//http://artsy.github.io/blog/2012/10/18/so-you-want-to-do-a-css3-3d-transform/
var hasGood3Dsupport =
	   'WebkitPerspective' in document.body.style
	|| 'MozPerspective' in document.body.style
	|| 'msPerspective' in document.body.style
	|| 'OPerspective' in document.body.style
	|| 'perspective' in document.body.style
;

if(navigator.userAgent.match(/iPhone|iPad|iPod/i)){
	hasGood3Dsupport = false;
}

//Safari is
var isSafariIOS = false;
if(navigator.userAgent.match(/iPhone|iPad|iPod/i) && navigator.userAgent.match(/Safari/i)){
	isSafariIOS = true;
}

var wrapper_test_result = null;
function wrapper_test(type, RCUD){
	if(typeof type==="undefined"){ type = null; }
	if(typeof RCUD==="undefined"){ RCUD = -1; }
	if(type==null || RCUD==-1){
		console.log('Wrong parameter');
	}

	function wrapper_test_display(msg, data_error, data_status, data_msg){
		console.log(data_msg);
		wrapper_test_result = data_msg;
	}

	function wrapper_test_begin(jqXHR, settings, temp_id){
		console.log(temp_id);
		var param = {};
		if(settings.data){
			var data = JSON.parse(settings.data);
			if(typeof data == 'object'){
				for(var i in data){
					if(typeof data[i].name == 'string' && typeof data[i].value != 'undefined'){
						param[data[i].name] = data[i].value;
					}
				}
			}
		}
		console.log(param);
	}

	if(type=='test'){
		if(RCUD==0){
			wrapper_sendAction(
				null,
				'get',
				'test',
				wrapper_test_display
			);
		}
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
					"parent_type": "projects",
					"parent_id": "47",
					"title": "It's a chat room talking about 项目, c'est testé en français",
					"users>access": {
						6: true, //Give access
						12: true, //Give access
					},
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
					//"parent_type": "projects", //OPTIONAL
					//"parent_id": 59, //OPTIONAL
					"title": "你好, No: "+Math.floor(Math.random() * 20), //OPTIONAL
				},
				'post',
				'chat/update',
				wrapper_test_display
			);
		}
		else if(RCUD==3){
			wrapper_sendAction(
				{
					"id": 4,
				},
				'post',
				'chat/delete',
				wrapper_test_display
			);
		}
		else if(RCUD==4){
			wrapper_sendAction(
				{
					"id": 4,
				},
				'post',
				'chat/restore',
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
		else if(RCUD==1){
			wrapper_sendAction(
				{
					"parent_type": "users",
					"parent_id": 5,
					"comment": "안녕하세요",
				},
				'post',
				'comment/create',
				wrapper_test_display
			);
		}
		else if(RCUD==2){ //Work within 2 minutes
			wrapper_sendAction(
				{
					"id": 147,
				},
				'post',
				'comment/recall',
				wrapper_test_display
			);
		}
		else if(RCUD==3){
			wrapper_sendAction(
				{
					"id": 137,
				},
				'post',
				'comment/delete',
				wrapper_test_display
			);
		}
		else if(RCUD==4){
			wrapper_sendAction(
				{
					"id": 137,
				},
				'post',
				'comment/restore',
				wrapper_test_display
			);
		}
	}

	if(type=='*' || type=='messages'){
		if(RCUD==0){
			wrapper_sendAction(
				{
					"id": 124,
				},
				'post',
				'message/read',
				wrapper_test_display
			);
		}
		else if(RCUD==1){
			wrapper_sendAction(
				{
					"parent_id": 5,
					"comment": "안녕하세요",
				},
				'post',
				'message/create',
				wrapper_test_display
			);
		}
		else if(RCUD==2){ //Work within 2 minutes
			wrapper_sendAction(
				{
					"id": 6095,
				},
				'post',
				'message/recall',
				wrapper_test_display
			);
		}
		else if(RCUD==3){
			wrapper_sendAction(
				{
					"id": 137,
				},
				'post',
				'message/delete',
				wrapper_test_display
			);
		}
		else if(RCUD==4){
			wrapper_sendAction(
				{
					"id": 137,
				},
				'post',
				'message/restore',
				wrapper_test_display
			);
		}
		else if(RCUD==5){
			wrapper_sendAction(
				{
					"parent_id": 580, //Chats ID
					"id_max": 6100, //OPTIONAL {false} Get all IDs below this ID (not included) , false value returns from the newest
					"row_number": 15, //OPTIONAL {30} Number of rows to get
				},
				'post',
				'message/collect',
				wrapper_test_display
			);
		}
	}

	if(type=='*' || type=='notes'){
		if(RCUD==0){
			wrapper_sendAction(
				{
					"id": 176,
				},
				'post',
				'note/read',
				wrapper_test_display
			);
		}
		else if(RCUD==1){
			wrapper_sendAction(
				{
					"parent_id": 3,
					"title": "It's a note title", //OPTIONAL {''}
					"comment": "It's a note content",
				},
				'post',
				'note/create',
				wrapper_test_display
			);
		}
		else if(RCUD==2){
			wrapper_sendAction(
				{
					"id": 176,
					//"parent_id": 4, //OPTIONAL
					//"title": "It's a note title"+Math.floor(Math.random() * 20), //OPTIONAL
					"comment": "It's a note content"+Math.floor(Math.random() * 20), //OPTIONAL
					//"locked_by": null, //OPTION (Only null value will be meanful)
				},
				'post',
				'note/update',
				wrapper_test_display
			);
		}
		else if(RCUD==3){
			wrapper_sendAction(
				{
					"id": 176,
				},
				'post',
				'note/delete',
				wrapper_test_display
			);
		}
		else if(RCUD==4){
			wrapper_sendAction(
				{
					"id": 176,
				},
				'post',
				'note/restore',
				wrapper_test_display
			);
		}
		else if(RCUD==5){
			wrapper_sendAction(
				{
					"id": 176,
				},
				'post',
				'note/lock/start',
				wrapper_test_display
			);
		}
		else if(RCUD==6){
			wrapper_sendAction(
				{
					"id": 176,
				},
				'post',
				'note/lock/unlock',
				wrapper_test_display
			);
		}
		else if(RCUD==7){
			wrapper_sendAction(
				{
					"id": 176,
				},
				'post',
				'note/lock/check',
				wrapper_test_display
			);
		}
	}

	if(type=='*' || type=='spaces'){
		if(RCUD==0){
			wrapper_sendAction(
				{
					"id": 10,
				},
				'post',
				'space/read',
				wrapper_test_display
			);
		}
		else if(RCUD==1){
			wrapper_sendAction(
				{
					"parent_id": 3,
					"name": "Perso space name", //OPTIONAL {''}
					//"tasks": false, //OPTIONAL {true}
					//"notes": false, //OPTIONAL {true}
					//"files": true, //OPTIONAL {true}
					//"chats": true, //OPTIONAL {true}
					//"color": "14", //OPTIONAL {null}
					//"icon": "fa-angle-double-down", //OPTIONAL {null}
				},
				'post',
				'space/create',
				wrapper_test_display
			);
		}
		else if(RCUD==2){
			wrapper_sendAction(
				{
					"id": 46,
					//"parent_id": 4, //OPTIONAL
					//"name": "It's a space name"+Math.floor(Math.random() * 20), //OPTIONAL
					//"tasks": false, //OPTIONAL {true}
					//"notes": false, //OPTIONAL {true}
					//"files": true, //OPTIONAL {true}
					//"chats": true, //OPTIONAL {true}
					//"color": "#9E9DAA", //OPTIONAL {null}
					//"icon": "fa-angle-double-down", //OPTIONAL {null}
				},
				'post',
				'space/update',
				wrapper_test_display
			);
		}
		else if(RCUD==3){
			wrapper_sendAction(
				{
					"id": 16,
				},
				'post',
				'space/delete',
				wrapper_test_display
			);
		}
		else if(RCUD==4){
			wrapper_sendAction(
				{
					"id": 16,
				},
				'post',
				'space/restore',
				wrapper_test_display
			);
		}
	}

	if(type=='*' || type=='files'){
		if(RCUD==0){
			wrapper_sendAction(
				{
					"id": 10,
				},
				'post',
				'file/read',
				wrapper_test_display
			);
		}
		else if(RCUD==1){
			console.log("Cannot create, have to use form upload.");
		}
		else if(RCUD==2){
			wrapper_sendAction(
				{
					"id": 2371,
					"parent_id": 5876, //OPTIONAL
					"parent_type": "comments", //OPTIONAL
					//"name": "It's a file name"+Math.floor(Math.random() * 20), //OPTIONAL
					//"comment": "It's a file description"+Math.floor(Math.random() * 20), //OPTIONAL
				},
				'post',
				'file/update',
				wrapper_test_display
			);
		}
		else if(RCUD==3){
			wrapper_sendAction(
				{
					"id": 493,
				},
				'post',
				'file/delete',
				wrapper_test_display
			);
		}
		else if(RCUD==4){
			wrapper_sendAction(
				{
					"id": 493,
				},
				'post',
				'file/restore',
				wrapper_test_display
			);
		}
	}

	if(type=='*' || type=='projects'){
		if(RCUD==0){
			wrapper_sendAction(
				{
					"id": 13,
				},
				'post',
				'project/read',
				wrapper_test_display
			);
		}
		else if(RCUD==1){
			wrapper_sendAction(
				{
					"parent_id": 0,
					"title": "It's a project title",
					"description": "It's a project content", //OPTIONAL {''}
				},
				'post',
				'project/create',
				wrapper_test_display
			);
		}
		else if(RCUD==2){
			wrapper_sendAction(
				{
					"id": 61,
					//"parent_id": 0, //OPTIONAL
					//"title": "项目 "+Math.floor(Math.random() * 20), //OPTIONAL
					//"description": "It's a project content"+Math.floor(Math.random() * 20), //OPTIONAL
					"users>access": {
						15:  true,//[true,false][Math.round(Math.random())],
					},
					"diy": JSON.stringify([ //Must be a array of multiple arrays [key, value], and stringified
						['field 1', 123],
						['field 2', 'abc def'],
						['field 3', true],
						['field 4', ['a', 'b', 'c']], //Every value as array will be converted as an object {0:'a', 1:'b', 2:'c'}
						['field 5', {a:1, b:2, c:3}],
					]),
				},
				'post',
				'project/update',
				wrapper_test_display
			);
		}
		else if(RCUD==3){
			wrapper_sendAction(
				{
					"id": 13,
				},
				'post',
				'project/delete',
				wrapper_test_display
			);
		}
		else if(RCUD==4){
			wrapper_sendAction(
				{
					"id": 13,
				},
				'post',
				'project/restore',
				wrapper_test_display
			);
		}
		else if(RCUD==5){
			wrapper_sendAction(
				null,
				'get',
				'project/my_project',
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
		else if(RCUD==1){ //To run in a company workspace
			wrapper_sendAction(
				{
					"parent_id": 1,
					"name": "It's a role title",
					//"perm_grant": false, //OPTIONAL {0}
					"perm_all": 0, //OPTIONAL {0}
					//"perm_workspaces": 0, //OPTIONAL {0}
					//"perm_projects": 0, //OPTIONAL {0}
					"perm_tasks": 2, //OPTIONAL {0}
					"perm_notes": 2, //OPTIONAL {0}
					"perm_files": 0, //OPTIONAL {0}
					//"perm_chats": 0, //OPTIONAL {0}
					//"perm_comments": 0, //OPTIONAL {0}
				},
				'post',
				'role/create',
				wrapper_test_display
			);
		}
		else if(RCUD==2){ //To run in a company workspace
			wrapper_sendAction(
				{
					"id": 4,
					"parent_id": 1, //OPTIONAL
					"name": "Role "+Math.floor(Math.random() * 20), //OPTIONAL
					//"perm_grant": false, //OPTIONAL
					"perm_all": 0, //OPTIONAL
					//"perm_workspaces": 0, //OPTIONAL
					"perm_projects": 0, //OPTIONAL
					"perm_tasks": 1, //OPTIONAL
					"perm_notes": 2, //OPTIONAL
					//"perm_files": 0, //OPTIONAL
					//"perm_chats": 0, //OPTIONAL
					//"perm_comments": 0, //OPTIONAL
				},
				'post',
				'role/update',
				wrapper_test_display
			);
		}
		else if(RCUD==3){ //To run in a company workspace
			wrapper_sendAction(
				{
					"id": 4,
				},
				'post',
				'role/delete',
				wrapper_test_display
			);
		}
		else if(RCUD==4){ //To run in a company workspace
			wrapper_sendAction(
				{
					"id": 4,
				},
				'post',
				'role/restore',
				wrapper_test_display
			);
		}
	}

	if(type=='*' || type=='tasks'){
		if(RCUD==0){
			wrapper_sendAction(
				{
					"id": 4543,
				},
				'post',
				'task/read',
				wrapper_test_display
			);
		}
		else if(RCUD==1){
			wrapper_sendAction(
				{
					"parent_id": 3,
					"title": "It's a task title",
					"comment": "It's a task content", //OPTIONAL {''}
					//"start": 1462110422, //OPTIONAL { current_timestamp }
					"duration": 86400, //OPTIONAL {86400}
					//"fixed": 1, //OPTIONAL {0}
					"status": 0, //OPTIONAL {0}
					"progress": 50, //OPTIONAL {0}
					"tasksup>access": {
						57: true,
					},
				},
				'post',
				'task/create',
				wrapper_test_display,
				null,
				wrapper_test_begin
			);
		}
		else if(RCUD==2){
			wrapper_sendAction(
				{
					"id": 264,
					//"parent_id": 4,
					"title": "Title "+Math.floor(Math.random() * 20), //OPTIONAL
					//"comment": "Content "+Math.floor(Math.random() * 20), //OPTIONAL
					//"start": 1462110422, //OPTIONAL
					//"duration": 86400, //OPTIONAL
					//"fixed": 1, //OPTIONAL
					"approved": !Lincko.storage.data.tasks[32]['approved'], //OPTIONAL
					//"status": 0, //OPTIONAL
					//"progress":  Math.floor(Math.random() * 10), //OPTIONAL
					//"locked_by": null, //OPTION (Only null value will be meanful)
					"users>approver": {
						6: [true,false][Math.round(Math.random())],
						12: [true,false][Math.round(Math.random())],
					},
					"users>in_charge": {
						3: [true,false][Math.round(Math.random())],
						12: [true,false][Math.round(Math.random())],
					},
					"tasks>delay": {
						85: Math.floor(Math.random() * 20000),
					},
				},
				'post',
				'task/update',
				wrapper_test_display
			);
		}
		else if(RCUD==3){
			wrapper_sendAction(
				{
					"id": 10,
				},
				'post',
				'task/delete',
				wrapper_test_display
			);
		}
		else if(RCUD==4){
			wrapper_sendAction(
				{
					"id": 10,
				},
				'post',
				'task/restore',
				wrapper_test_display
			);
		}
		else if(RCUD==5){
			wrapper_sendAction(
				{
					"id": 10,
				},
				'post',
				'task/lock/start',
				wrapper_test_display
			);
		}
		else if(RCUD==6){
			wrapper_sendAction(
				{
					"id": 10,
				},
				'post',
				'task/lock/unlock',
				wrapper_test_display
			);
		}
		else if(RCUD==7){
			wrapper_sendAction(
				{
					"id": 10,
				},
				'post',
				'task/lock/check',
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
		else if(RCUD==1){
			wrapper_sendAction(
				{
					"email": "test"+Math.floor(Math.random() * 20)+"@lincko.cafe",
					"password": "123456",
					//"username": "test"+Math.floor(Math.random() * 20), //OPTIONAL { email_basename }
					"firstname": "Albert", //OPTIONAL {''}
					//"lastname": "Dupond", //OPTIONAL {''}
					"gender": 1, //OPTIONAL {0}
				},
				'post',
				'user/create',
				wrapper_test_display
			);
		}
		else if(RCUD==2){
			wrapper_sendAction(
				{
					"id": 3,
					//"username": "test"+Math.floor(Math.random() * 20), //OPTIONAL
					//"firstname": "Bruno"+Math.floor(Math.random() * 20), //OPTIONAL
					//"lastname": "Martin", //OPTIONAL
					//"gender": 1, //OPTIONAL
					"usersLinked>access": {
						6: true,
					},
				},
				'post',
				'user/update',
				wrapper_test_display
			);
		}
		else if(RCUD==3){
			wrapper_sendAction(
				{
					"id": 3,
				},
				'post',
				'user/delete',
				wrapper_test_display
			);
		}
		else if(RCUD==4){
			wrapper_sendAction(
				{
					"id": 3,
				},
				'post',
				'user/restore',
				wrapper_test_display
			);
		}
		else if(RCUD==5){
			wrapper_sendAction(
				null,
				'get',
				'user/my_user',
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
		else if(RCUD==1){
			wrapper_sendAction(
				{
					"name": "DONGKEY",
					"domain": "www.truc.com", //OPTIONAL {''}
					"url": "abcdef", //OPTIONAL { name }
				},
				'post',
				'workspace/create',
				wrapper_test_display
			);
		}
		else if(RCUD==2){
			wrapper_sendAction(
				{
					"id": 1,
					"name": "DONGKEY "+Math.floor(Math.random() * 20), //OPTIONAL
					//"domain": "www.truc.com", //OPTIONAL
					//"url": "abcdef", //OPTIONAL
				},
				'post',
				'workspace/update',
				wrapper_test_display
			);
		}
		else if(RCUD==3){
			wrapper_sendAction(
				{
					"id": 1,
				},
				'post',
				'workspace/delete',
				wrapper_test_display
			);
		}
		else if(RCUD==4){
			wrapper_sendAction(
				{
					"id": 1,
				},
				'post',
				'workspace/restore',
				wrapper_test_display
			);
		}
	}

	if(type=='*' || type=='data'){
		if(RCUD==0){
			wrapper_sendAction(
				{
					"tasks_313": true,
				},
				'post',
				'data/viewed',
				wrapper_test_display
			);
		}
		else if(RCUD==1){
			wrapper_sendAction(
				{
					"tasks_1141": true,
					//"tasks_287": 1463564993,
				},
				'post',
				'data/noticed',
				wrapper_test_display
			);
		}
		else if(RCUD==2){
			wrapper_sendAction(
				{
					"settings": JSON.stringify({a: 1+Math.floor(Math.random() * 20)}),
				},
				'post',
				'data/settings',
				wrapper_test_display
			);
		}
	}

	if(type=='*' || type=='translate'){
		if(RCUD==0){
			wrapper_sendAction(
				{
					"text": "Я наступил на Cornflake, \nи теперь я зерновых убийца!",
				},
				'post',
				'translation/auto',
				wrapper_test_display
			);
		}
	}

}

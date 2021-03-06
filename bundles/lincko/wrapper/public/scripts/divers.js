var wrapper_browser = function(ua) {
	if(typeof ua==="undefined"){
		return false;
	}
	return navigator.userAgent.toUpperCase().indexOf(ua.toUpperCase())>=0;
};

//http://www.opentechguides.com/how-to/article/javascript/98/detect-mobile-device.html
var isMobileBrowser = function(){
	return /webOS|iPhone|iPad|BlackBerry|Windows Phone|Opera Mini|IEMobile|Mobile/i.test(navigator.userAgent);
}

//Check connection type
//https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API
var wrapper_connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
var wrapper_connection_type = false;
if(typeof wrapper_connection != "undefined" && typeof wrapper_connection.type != "undefined"){
	wrapper_connection_type = wrapper_connection.type;
	wrapper_connection.addEventListener('typechange', function(){
		wrapper_connection_type = wrapper_connection.type;
	});
}

//https://www.w3schools.com/js/js_cookies.asp
function getCookie(cname) {
	var name = cname + "=";
	var decodedCookie = decodeURIComponent(document.cookie);
	var ca = decodedCookie.split(';');
	for(var i = 0; i <ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

var supportsTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints;

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

var isIOS = false;
if(navigator.userAgent.match(/iPhone|iPad|iPod/i)){
	isIOS = true;
	hasGood3Dsupport = false;
}

//Safari is
var isSafariIOS = false;
if(navigator.userAgent.match(/iPhone|iPad|iPod/i) && navigator.userAgent.match(/Safari/i)){
	isSafariIOS = true;
}

var wrapper_limit_json = false;
if(
	   isSafariIOS
	|| navigator.userAgent.match(/MSIE/i)
	|| navigator.userAgent.match(/EDGE/i)
){
	//wrapper_limit_json = 500; //Allow chunking for for ios crash (it seems working after reworking the database)
}

/*
	This commands help to track time spent in some functions
	wrapper_time_checkpoint(false, true);
	wrapper_time_checkpoint('01');
	wrapper_time_checkpoint('02');
*/
var	wrapper_time_checkpoint_time = false;
var wrapper_time_checkpoint = function(msg, reset, show){
	if(typeof msg != 'undefined' && msg){
		msg = '['+msg+'] ';
	} else {
		msg = '';
	}
	if(typeof reset == 'boolean' && reset){ 
		wrapper_time_checkpoint_time = false;
	} else {
		reset = false;
	}
	if(typeof show == 'undefined'){
		show = true;
		if(reset){
			show = false;
		}
	}
	var now = Math.round(performance.now()); //round ms
	var delay = false;
	if(wrapper_time_checkpoint_time){
		if(show){
			var delay = now - wrapper_time_checkpoint_time;
			console.log(msg+'time: '+delay);
		}
	} else {
		if(show){
			console.log(msg+'start')
		}
	}
	wrapper_time_checkpoint_time = now;
	return delay;
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
		/*
		else if(RCUD==5){
			wrapper_sendAction(
				{
					"parent_type": 'chats',
					"parent_id": 1370,
					"data": divers_mp3_base64,
				},
				'post',
				'file/voice',
				wrapper_test_display
			);
		}
		*/
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
					"id": 64,
					//"parent_id": 0, //OPTIONAL
					//"title": "项目 "+Math.floor(Math.random() * 20), //OPTIONAL
					//"description": "It's a project content"+Math.floor(Math.random() * 20), //OPTIONAL
					"users>access": {
						197: [true,false][Math.round(Math.random())],
					},
					/*
					"diy": JSON.stringify([ //Must be a array of multiple arrays [key, value], and stringified
						['field 1', 123],
						['field 2', 'abc def'],
						['field 3', true],
						['field 4', ['a', 'b', 'c']], //Every value as array will be converted as an object {0:'a', 1:'b', 2:'c'}
						['field 5', {a:1, b:2, c:3}],
					]),
					*/
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
		else if(RCUD==1){ //To run in a company workspace (0, 2, 3) Create goes with edit for items allowed
			wrapper_sendAction(
				{
					"parent_id": Lincko.storage.getWORKID(),
					"name": "Member",
					//"perm_grant": false, //OPTIONAL {0}
					"perm_all": 0, //OPTIONAL {0}
					//"perm_projects": 0, //OPTIONAL {0}
					"perm_tasks": 2, //OPTIONAL {0}
					"perm_notes": 2, //OPTIONAL {0}
					"perm_files": 0, //OPTIONAL {0}
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
					"parent_id": Lincko.storage.getWORKID(), //OPTIONAL
					"name": "Role "+Math.floor(Math.random() * 20), //OPTIONAL
					//"perm_grant": false, //OPTIONAL
					"perm_all": 0, //OPTIONAL
					"perm_projects": 0, //OPTIONAL
					"perm_tasks": 2, //OPTIONAL
					"perm_notes": 2, //OPTIONAL
					//"perm_files": 0, //OPTIONAL
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
					"parent_id": 3923,
					"title": "It's a task title",
					"comment": "It's a task content", //OPTIONAL {''}
					//"start": 1462110422, //OPTIONAL { current_timestamp }
					"start": null,
					//"duration": 86400, //OPTIONAL {86400}
					//"fixed": 1, //OPTIONAL {0}
					//"status": 0, //OPTIONAL {0}
					//"progress": 50, //OPTIONAL {0}
					//"tasksup>access": {
					//	57: true,
					//},
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
					"id": 124,
					//"parent_id": 4,
					//"title": "Title "+Math.floor(Math.random() * 20), //OPTIONAL
					//"comment": "Content "+Math.floor(Math.random() * 20), //OPTIONAL
					//"start": 1462110422, //OPTIONAL
					//"duration": 86400, //OPTIONAL
					//"fixed": 1, //OPTIONAL
					//"approved": !Lincko.storage.data.tasks[32]['approved'], //OPTIONAL
					//"status": 0, //OPTIONAL
					//"progress":  Math.floor(Math.random() * 10), //OPTIONAL
					//"locked": true, //OPTIONAL
					/*
					"users>approver": {
						6: [true,false][Math.round(Math.random())],
						12: [true,false][Math.round(Math.random())],
					},
					*/
					"users>in_charge": {
						1057: [true,false][Math.round(Math.random())],
						//12: [true,false][Math.round(Math.random())],
					},
					/*
					"tasks>delay": {
						85: Math.floor(Math.random() * 20000),
					},
					*/
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
					"id": 14597,
				},
				'post',
				'task/lock/start',
				wrapper_test_display
			);
		}
		else if(RCUD==6){
			wrapper_sendAction(
				{
					"id": 14597,
				},
				'post',
				'task/lock/unlock',
				wrapper_test_display
			);
		}
		else if(RCUD==7){
			wrapper_sendAction(
				{
					"id": 14597,
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
					"id": 1223,
					//"username": "test"+Math.floor(Math.random() * 20), //OPTIONAL
					//"firstname": "Bruno"+Math.floor(Math.random() * 20), //OPTIONAL
					//"lastname": "Martin", //OPTIONAL
					//"gender": 1, //OPTIONAL
					"users>access": {
						1220: [true,false][Math.round(Math.random())],
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

	if(type=='*' || type=='integration'){
		if(RCUD==0){
			wrapper_sendAction(
				null,
				'get',
				'integration/code',
				wrapper_test_display
			);
		}
	}

}

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


function wrapper_test(type, RCUD){
	if(typeof type==="undefined"){ type = null; }
	if(typeof RCUD==="undefined"){ RCUD = -1; }
	if(type==null || RCUD==-1){
		console.log('Wrong parameter');
	}

	function wrapper_test_display(msg, data_error, data_status, data_msg){
		console.log(data_msg);
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
		else if(RCUD==1){
			wrapper_sendAction(
				{
					"parent_id": 4,
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
					"id": 46,
					//"parent_id": 4, //OPTIONAL
					//"title": "It's a note title"+Math.floor(Math.random() * 20), //OPTIONAL
					"comment": "It's a note content"+Math.floor(Math.random() * 20), //OPTIONAL
				},
				'post',
				'note/update',
				wrapper_test_display
			);
		}
		else if(RCUD==3){
			wrapper_sendAction(
				{
					"id": 16,
				},
				'post',
				'note/delete',
				wrapper_test_display
			);
		}
		else if(RCUD==4){
			wrapper_sendAction(
				{
					"id": 16,
				},
				'post',
				'note/restore',
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
					"id": 493,
					//"parent_id": 3, //OPTIONAL
					//"parent_type": "projects", //OPTIONAL
					//"name": "It's a file name"+Math.floor(Math.random() * 20), //OPTIONAL
					"comment": "It's a file description"+Math.floor(Math.random() * 20), //OPTIONAL
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
					"id": 47,
					//"parent_id": 0, //OPTIONAL
					//"title": "项目 "+Math.floor(Math.random() * 20), //OPTIONAL
					//"description": "It's a project content"+Math.floor(Math.random() * 20), //OPTIONAL
					"users>access": {
						15:  true,//[true,false][Math.round(Math.random())],
					},
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
					"id": 6,
				},
				'post',
				'task/read',
				wrapper_test_display
			);
		}
		else if(RCUD==1){
			wrapper_sendAction(
				{
					"parent_id": 4,
					"title": "It's a note title",
					"comment": "It's a note content", //OPTIONAL {''}
					//"start": 1462110422, //OPTIONAL { current_timestamp }
					"duration": 86400, //OPTIONAL {86400}
					//"fixed": 1, //OPTIONAL {0}
					"status": 0, //OPTIONAL {0}
					"progress": 50, //OPTIONAL {0}
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

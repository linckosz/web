submenu_list['app_task_new'] = {
	//Set the title of the top
	"_title": {
		"style": "customized_title",
		"title": Lincko.Translation.get('app', 2201, 'html'), //New task
	},
	"left_button": {
		"style": "title_left_button",
		"title": Lincko.Translation.get('app', 25, 'html'), //Close
		'hide': true,
		"class": "base_pointer",
	},
	//Add HTML/JS checking input format
	"_input": {
		"style": "prefix",
		"title": "task",
	},
	"form_create": {
		"style": "form",
		"title": Lincko.Translation.get('app', 41, 'html'), //Create
		"action": "task/create",
		"submit": function(that){
			return wrapper_sendForm(
				that,
				submenu_form_cb_success,
				submenu_form_cb_error,
				submenu_form_cb_begin,
				submenu_form_cb_complete,
				{
					'lastvisit': Lincko.storage.getLastVisit(),
				}
			);
		},
	},
	"form_cancel": {
		"style": "form_button",
		"title": Lincko.Translation.get('app', 7, 'html'), //Cancel
		"hide": true,
	},
	"required_fields": {
		"style": "title_small",
		"title": Lincko.Translation.get('app', 27, 'html'), //Required
	},
	"title": {
		"style": "input_text",
		"title": Lincko.Translation.get('app', 28, 'html'), //Title
		"name": "task_title_text",
		"value": "",
		"class": "submenu_input_text",
	},
	"optional_fields": {
		"style": "title_small",
		"title": Lincko.Translation.get('app', 29, 'html'), //Optional
		"class": "submenu_title_small_top",
	},
	"comment": {
		"style": "input_textarea",
		"title": Lincko.Translation.get('app', 30, 'html'), //Comment
		"name": "task_comment_textarea",
		"value": "",
		"class": "submenu_input_textarea",
	},
	"projects_id": {
		"style": "input_hidden",
		"title": "",
		"name": "task_parent_id_hidden",
		"value": "",
		"now": function(Elem, subm){
			Elem.find("[find=submenu_input]").prop('value', app_content_menu.projects_id);
		},
		"class": "",
	},
};

var tasks_get_inCharge_id = function(task_id, resultType){
	var result = [];
	var item = Lincko.storage.get('tasks', task_id);
	if(item['_users']){
		for (var i in item['_users']){
			if( i && item['_users'][i]['in_charge']==true ){
				if(resultType == 'username'){
					var username = Lincko.storage.get("users", i ,"username");
					if(username){ result.push(username); }
				}
				else{
					result.push(i);
				}
			}
		}
	}
	return result;
}

var tasks_calcDuedate = function(id){
	var duedate;
	var task;
	if(typeof id == 'object'){
		task = id;
	} else {
		task = Lincko.storage.get('tasks', id);
	}
	if(!task){ return false; }


	if(!task.start){
		duedate = null;
	} else {
		duedate = new wrapper_date(parseInt(task.start,10) + parseInt(task.duration,10));
	}

	return duedate;
}

var tasks_isOverdue = function(id){
	var duedate = tasks_calcDuedate(id);
	var now = new wrapper_date();
	if( now.time > duedate.time ){
		return true;
	}
	else{
		return false;
	}
}

submenu_list['app_project_new'] = {
	//Set the title of the top
	 "_title": {
		"style": "customized_title",
		"title": Lincko.Translation.get('app', 2001, 'html'), //New project
	},
	"left_button": {
		"style": "title_left_button",
		"title": Lincko.Translation.get('app', 7, 'html'), //Cancel
		'hide': true,
		"class": "base_pointer",
	},
	"right_button": {
		"style": "title_right_button",
		"title": Lincko.Translation.get('app', 41, 'html'), //Create
		"class": "base_pointer",
		"action": function(Elem, that) {
			$('#' + that.id + '_submenu_form').submit();
		},
	},
	"_pre_action": {
		"style": "preAction",
		"action": function(){
			app_projects_users_contacts_init();
		},
	},
	//Add HTML/JS checking input format
	"_input": {
		"style": "prefix",
		"title": "project",
	},
	
	"form_create": {
		"style": "form",
		"title": Lincko.Translation.get('app', 41, 'html'), //Create
		"action": "project/create",
		"submit": function(that){
			var param = {
				//"lastvisit": Lincko.storage.getLastVisit(),
				"parent_id": Lincko.storage.getWORKID(),
				"users>access": {},
			};
			var users_access = {};
			param["users>access"][wrapper_localstorage.uid] = true;
			for(var users_id in app_projects_users_contacts_list){
				param["users>access"][users_id] = true;
			}
			return wrapper_sendForm(
				$('#'+that.id+'_submenu_form'),
				submenu_form_cb_success,
				submenu_form_cb_error,
				submenu_form_cb_begin,
				submenu_form_cb_complete,
				param
			);
			
		},
	},
	
	"title": {
		"style": "input_text",
		"title": Lincko.Translation.get('app', 28, 'html'), //Title
		"name": "title",
		"value": "",
		"class": "submenu_input_text",
	},
	"team": {
		"style": "select_multiple",
		"title": Lincko.Translation.get('app', 31, 'html'), //Team
		"name": "project_team_select_multiple",
		"value": "",
		"class": "submenu_input_select_multiple",
		"next": "app_projects_users_contacts",
	},
	"description": {
		"style": "input_textarea",
		"title": Lincko.Translation.get('app', 30, 'html'), //Short description
		"name": "description",
		"value": "",
		"class": "submenu_input_textarea",
	},
};


submenu_list['app_project_edit'] = {
	//Set the title of the top
	 "_title": {
		"style": "customized_title",
		"title": Lincko.Translation.get('app', 2001, 'html'), //New project
	},
	"left_button": {
		"style": "title_left_button",
		"title": Lincko.Translation.get('app', 7, 'html'), //Cancel
		'hide': true,
		"class": "base_pointer",
	},
	"right_button": {
		"style": "title_right_button",
		"title": Lincko.Translation.get('app', 41, 'html'), //Create
		"class": "base_pointer",
		"action": function(Elem, that) {
			$('#' + that.id + '_submenu_form').submit();
		},
	},
	"_pre_action": {
		"style": "preAction",
		"action": function(){
			app_projects_users_contacts_init();
		},
	},
	//Add HTML/JS checking input format
	"_input": {
		"style": "prefix",
		"title": "project",
	},
	
	"form_create": {
		"style": "form",
		"title": Lincko.Translation.get('app', 41, 'html'), //Create
		"action": "project/create",
		"submit": function(that){
			console.log(that);
			/*
			var param = {
				//"lastvisit": Lincko.storage.getLastVisit(),
				"parent_id": Lincko.storage.getWORKID(),
				"users>access": {},
			};
			var users_access = {};
			param["users>access"][wrapper_localstorage.uid] = true;
			for(var users_id in app_projects_users_contacts_list){
				param["users>access"][users_id] = true;
			}
			return wrapper_sendForm(
				$('#'+that.id+'_submenu_form'),
				submenu_form_cb_success,
				submenu_form_cb_error,
				submenu_form_cb_begin,
				submenu_form_cb_complete,
				param
			);
			*/
		},
	},
	
	"title": {
		"style": "input_text",
		"title": Lincko.Translation.get('app', 28, 'html'), //Title
		"name": "title",
		"value": function(){console.log(this);
			return "toto";
		},
		"class": "submenu_input_text",
	},
	"team": {
		"style": "select_multiple",
		"title": Lincko.Translation.get('app', 31, 'html'), //Team
		"name": "project_team_select_multiple",
		"value": "",
		"class": "submenu_input_select_multiple",
		"next": "app_projects_users_contacts",
	},
	"description": {
		"style": "input_textarea",
		"title": Lincko.Translation.get('app', 30, 'html'), //Short description
		"name": "description",
		"value": function(){
			return "toto2";
		},
		"class": "submenu_input_textarea",
	},
};

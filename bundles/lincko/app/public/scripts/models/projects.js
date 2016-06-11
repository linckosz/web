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
		"action": function(subm){
			app_projects_users_contacts_list = {};
			app_projects_users_contacts_init(subm);
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
		"title": Lincko.Translation.get('app', 25, 'html'), //Close
		'hide': true,
		"class": "base_pointer",
	},
	"title": {
		"style": "project_title_edit",
		"title": Lincko.Translation.get('app', 28, 'html'), //Title
		"name": "title",
		"value": "",
		"class": "submenu_input_text",
	},
	"team": {
		"style": "project_team_edit",
		"title": Lincko.Translation.get('app', 31, 'html'), //Team
		"name": "project_team_select_multiple",
		"value": "",
		"class": "submenu_input_select_multiple",
		"next": "app_projects_users_contacts",
	},
	"description": {
		"style": "project_description_edit",
		"title": Lincko.Translation.get('app', 30, 'html'), //Short description
		"name": "description",
		"value": "",
		"class": "submenu_input_textarea",
	},
};

Submenu_select.project_title_edit = function(subm) {
	subm.Add_ProjectTitleEdit(subm);
};

Submenu_select.project_description_edit = function(subm){
	subm.Add_ProjectDescriptionEdit(subm);
};

Submenu_select.project_team_edit = function(subm){
	subm.Add_ProjectTeamEdit(subm);
};


Submenu.prototype.Add_ProjectTitleEdit = function(subm) {
	var Elem = subm.Add_InputText();
	var that = this;
	var project = Lincko.storage.get("projects", this.param);
	var title = project["+title"];
	var input = Elem.find("[find=submenu_input]");
	input
		.prop('value', title)
		.blur(
			[project["_id"], input],
			function(event){
				event.stopPropagation();
				var param = {
					id: event.data[0],
					title: event.data[1].val(),
				}
				wrapper_sendAction(
					param,
					'post',
					'project/update'
				);
			}
		);
	return Elem;
};

Submenu.prototype.Add_ProjectDescriptionEdit = function() {
	var Elem = this.Add_InputTextarea();
	var that = this;
	var project = Lincko.storage.get("projects", this.param);
	var description = project["-description"];
	var input = Elem.find("[find=submenu_input_textarea]");
	input
		.html(description)
		.blur(
			[project["_id"], input],
			function(event){
				event.stopPropagation();
				var param = {
					id: event.data[0],
					description: event.data[1].val(),
				}
				wrapper_sendAction(
					param,
					'post',
					'project/update'
				);
			}
		);
	return Elem;
};

Submenu.prototype.Add_ProjectTeamEdit = function() {
	this.attribute.param = this.param; //Pass project id to next submenu
	var Elem = this.Add_SelectMultiple();
	var that = this;
	var wrapper_content_id = this.id+"_project_team";
	var project = Lincko.storage.get("projects", this.param);
	var projects_id = project["_id"];
	var Elem = $("#"+this.id);
	var users_access = Lincko.storage.whoHasAccess("projects", projects_id);
	Elem.find("[find=submenu_select_value]")
		.prop("id", wrapper_content_id)
		.html(users_access.length);
	app_application_lincko.add(wrapper_content_id, "projects_"+project["_id"], function(){
		var projects_id = this.action_param;
		var Elem = $("#"+this.id);
		var users_access = Lincko.storage.whoHasAccess("projects", projects_id);
		Elem.html(users_access.length);
	}, project["_id"]);

	app_application_lincko.prepare("projects_"+project["_id"], true);

	return Elem;
};

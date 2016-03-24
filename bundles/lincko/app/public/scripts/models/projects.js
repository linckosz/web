submenu_list['app_project_new'] = {
	//Set the title of the top
	"_title": {
		"style": "title",
		"title": Lincko.Translation.get('app', 2001, 'html'), //New project
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
		"name": "project_title_text",
		"value": "",
		"class": "submenu_input_text",
	},
	"team": {
		"style": "select_multiple",
		"title": Lincko.Translation.get('app', 31, 'html'), //Team
		"name": "project_team_select_multiple",
		"value": "",
		"class": "submenu_input_select_multiple",
		"next": "app_users_contacts",
	},
	"optional_fields": {
		"style": "title_small",
		"title": Lincko.Translation.get('app', 29, 'html'), //Optional
		"class": "submenu_title_small_top",
	},
	"description": {
		"style": "input_textarea",
		"title": Lincko.Translation.get('app', 30, 'html'), //Short description
		"name": "project_description_textarea",
		"value": "",
		"class": "submenu_input_textarea",
	},
};
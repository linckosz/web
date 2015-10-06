submenu_list['app_task_new'] = {
	//Set the title of the top
	"_title": {
		"style": "title",
		"title": Lincko.Translation.get('app', 2201, 'html'), //New task
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
					'projects_id': app_content_menu.projects_id,
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
};

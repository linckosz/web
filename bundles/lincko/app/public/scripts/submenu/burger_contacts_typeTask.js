submenu_list['burger_contacts_typeTask'] = {
	"_title": {
		"style": "customized_title",
		"title": Lincko.Translation.get('app', 3601, 'html'),//   "Task Assignment",
		"class": function(Elem) {
				return 'submenu_wrapper_taskdetail_tasks';
		},
	},
	"left_button": {
		"style": "title_left_button",
		"title": Lincko.Translation.get('app', 7, 'html'), //'Cancel',
		'hide': true,
		"class": "base_pointer",
	},
	"right_button": {
		"style": "title_right_button",
		"title": Lincko.Translation.get('app', 52, 'html'), //"Select", 
		"class": "base_pointer",
		"action": function(Elem, subm) {
			subm.param.elem_typeTask.attr('contenteditable',true);
			var userid = submenu_contacts_get(Elem)[0];
			if(userid){
				subm.param.userClick_fn(userid);
			}
		},
		hide: true,
	},

	'contacts': {
		"style": "contacts",
		"title": "contacts",
	}
};

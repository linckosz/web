submenu_list['burger_calendar_typeTask'] = {
	//Set the title of the top
	"_title": {
		"style": "customized_title",
		"title": Lincko.Translation.get('app', 2202, 'html'), //Due Date
		"class": function(that){
			var className = 'submenu_wrapper_taskdetail_'+'tasks';
			return className;
		},
	},
	"calendar":{
		"style": "calendar",
		"title": "calendar",
	},
	"left_button": {
		"style": "title_left_button",
		"title": Lincko.Translation.get('app', 7, 'html'), //Cancel
		'hide': true,
		"class": "base_pointer",
		"action": function(Elem, subm){
			burgerN.placeCaretAtEnd(subm.param.elem_typeTask);
		},
		"now": function(Elem, subm){
			//remove keyboard for mobile
			subm.param.elem_typeTask.blur();
		},
	},
	"right_button": {
		"style": "title_right_button",
		"title": Lincko.Translation.get('app', 52, 'html'), //Select
		'hide': true,
		"class": "base_pointer",
		'action': function(Elem, subm){
			subm.param.dateClick_fn(null, null, subm.param.elem_inputTarget.val()/1000);
		},
	},
};

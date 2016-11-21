submenu_list['burger_clickHandler_inCharge'] = {
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

			var data_select = {
				//preSelect: --> not necessary, taken care of in cb_select
				//val:
			};

			var IDList = submenu_contacts_get(Elem);
			if(IDList.length == 1){ //single select
				var uid = IDList[0];
				data_select.val = uid;
			}
			else{ //multi select

			}

			if(subm.param && typeof subm.param.cb_select == 'function'){
				subm.param.cb_select(data_select);
			}
		},
		hide: true,
	},

	'contacts': {
		"style": "contacts",
		"title": "contacts",
	}
};

submenu_list['burger_clickHandler_calendar'] = {
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
		"title": Lincko.Translation.get('app', 7, 'html'), //'Cancel',
		'hide': true,
		"class": "base_pointer",
	},
	"right_button": {
		"style": "title_right_button",
		"title": Lincko.Translation.get('app', 52, 'html'), //Select
		'hide': true,
		"class": "base_pointer",
		'action': function(Elem, subm){
			var timestamp = subm.param.elem_inputTarget.val()/1000;
			if(subm.param && typeof subm.param.cb_select == 'function'){
				subm.param.cb_select(timestamp);
			}
		},
	},
};

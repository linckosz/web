//Category 36
submenu_list['burger_contacts'] = {
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
			var param = subm.param;
			var userList = {};
			var nameList = "";
			var IDList = submenu_contacts_get(Elem);
			param.elem_input.val('');
			$.each(IDList, function(i,val){
				param.elem_input.val(param.elem_input.val()+val+' ');
			});				
			param.elem_input.change();
			if(param.item_obj['_id'] != 'new'){
				burger_contacts_sendAction(param.contactsID, IDList, param.item_obj);
			}
		},
		hide: true,
	},

	'contacts': {
		"style": "contacts",
		"title": "contacts",
	}
};

//Category 36
submenu_list['burger_contacts'] = {
	"_title": {
		"style": "customized_title",
		"title": "Task Assignment",//toto
		"class": function(elem) {
				return 'submenu_wrapper_taskdetail_tasks';
		},
	},
	"left_button": {
		"style": "title_left_button",
		"title": 'Cancel',//toto
		'hide': true,
		"class": "base_pointer",
	},
	"right_button": {
		"style": "title_right_button",
		"title": "Select", //toto
		"class": "base_pointer",
		"action": function(elem, submenuInst) {
			var param = submenuInst.param;
			var userList = {};
			var nameList = "";
			var IDList = _submenu_get_contacts(elem);
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

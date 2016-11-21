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

			//var lincko_item = Lincko.storage.get(subm.param.lincko_type, subm.param.lincko_id);
			var IDList = submenu_contacts_get(Elem);
			if(IDList.length == 1){
				var uid = IDList[0];
				data_select.val = uid;
			}
			else{ //multi select

			}

			subm.param.cb_select(data_select);
		},
		hide: true,
	},

	'contacts': {
		"style": "contacts",
		"title": "contacts",
	}
};

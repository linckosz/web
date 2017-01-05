submenu_list['burger_clickHandler_inCharge'] = {
	"_title": {
		"style": "customized_title",
		"title": Lincko.Translation.get('app', 3601, 'html'),//   "Task Assignment",
		"class": function(Elem) {
				return 'submenu_wrapper_taskdetail_tasks';
		},
		"now": function(Elem, subm){
			//remove keyboard for mobile
			if(subm.param.elem_toBlur){
				subm.param.elem_toBlur.blur();
			}
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
			if(!IDList.length){ //nothing is selected
				//look for any DESELECT
				$.each(subm.param.contactsID, function(userid, obj){
					if(obj.checked){// if previously checked, this was deselected
						data_select.val = userid;
						data_select.preSelect = true;
						return false;
					}
				});
			}
			else if(IDList.length == 1){ //single select
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

submenu_list['burger_clickHandler_projects'] = {
	//Set the title of the top
	"_title": {
		"style": "customized_title",
		"title": Lincko.Translation.get('app', 2203, 'html'), //Select Project
		"class": 'submenu_wrapper_burger_projects',
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
			if(subm.param.burgerData && typeof subm.param.cb_select == 'function'){				
				subm.param.cb_select(subm.param.burgerData);
			}
		},
		hide: true,
	},
	"burger_clickHandler_projects": {
		"style": "burger_clickHandler_projects",
		"title": "burger_clickHandler_projects",
		"class": "",
	},
}

Submenu_select.burger_clickHandler_projects = function(subm){
	subm.Add_burger_clickHandler_projects();
};

Submenu.prototype.Add_burger_clickHandler_projects = function() {
	var that = this;
	var submenu_wrapper = this.Wrapper();
	var submenu_content = submenu_wrapper.find("[find=submenu_wrapper_content]").addClass('submenu_burger_projects');

	var elem_input = that.param.input;
	var list = that.param.list;

	var fn_click = function(event){
		var burgerData = event.data;
		submenu_content.find('.burger_option').removeClass('burger_option_selected').removeClass('burger_option_preSelect');
		$(this).addClass('burger_option_selected');
		that.param.burgerData = burgerData;
	}

	$.each(list, function(i, burgerData){
		var elem_option = $('<div>').addClass('burger_option burger_option_projects').text(burgerData.text).click(burgerData, fn_click);
		if(burgerData.preSelect){
			elem_option.addClass('burger_option_preSelect');
		}
		submenu_content.append(elem_option);
	});

	//Free memory
	//submenu_wrapper = null; //In some placea it bugs because it's used in a lower scope
	delete submenu_wrapper;
	return true;
}

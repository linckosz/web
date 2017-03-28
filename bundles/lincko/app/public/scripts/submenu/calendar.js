submenu_list['calendar'] = {
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
	},
	"right_button": {
		"style": "title_right_button",
		"title": Lincko.Translation.get('app', 52, 'html'), //Select
		'hide': true,
		"class": "base_pointer",
		'action': function(Elem, subm){
			if(subm.param && subm.param.elem_inputOrig && subm.param.elem_inputTarget){
				//subm.param.elem_inputOrig.val(subm.param.elem_inputTarget.val()-86399000).change(); //subtract 23hrs59min59sec
				subm.param.elem_inputOrig.val(subm.param.elem_inputTarget.val()).change();
			}
		},
	},
	"projects_id": {
		"style": "input_hidden",
		"title": "",
		"name": "task_parent_id_hidden",
		"value": "",
		"now": function(Elem, subm){
			Elem.find("[find=submenu_input]").prop('value', app_content_menu.projects_id);
		},
		"class": "",
	},
};

Submenu_select.calendar = function(subm){
	subm.Add_calendar();
};

Submenu.prototype.Add_calendar = function() {
	$('#base_input_focusHelper').focus(); //lose any previous focus (to get rid of mobile keyboard)
	var that = this;
	var submenu_wrapper = this.Wrapper();
	var submenu_content = submenu_wrapper.find("[find=submenu_wrapper_content]").addClass('submenu_calendar').removeClass('overthrow');
	
	var defaultDate = (new wrapper_date().getEndofDay() + 86400)*1000; //end of day tomorrow

	var elem_timestamp = $('<input find="timestamp" type="text" readonly="readonly"/>');
	if(that.param.defaultDate){ 
		defaultDate = that.param.defaultDate; 
	}
	else if(that.param && that.param.elem_inputOrig){
		defaultDate = that.param.elem_inputOrig.val();
	} 

	elem_timestamp.val(defaultDate);
	that.param.elem_inputTarget = elem_timestamp;

	
	var fn_onSelect = function(timestamp, datepickerInst){
		elem_timestamp.val(timestamp*1000);
	}
	var elem_datepicker = burger_renderCalendar(null, defaultDate, fn_onSelect);

	submenu_content.append(elem_timestamp).append(elem_datepicker);


	$(document).on("submenuHide.calendar", function(){
		elem_datepicker.datepicker('destroy');
		$(document).off('submenuHide.calendar');
	});


	//Free memory
	//submenu_wrapper = null; //In some placea it bugs because it's used in a lower scope
	delete submenu_wrapper;
	return true;
}

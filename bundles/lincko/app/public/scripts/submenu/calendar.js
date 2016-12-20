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
			//subm.param.elem_inputOrig.val(subm.param.elem_inputTarget.val()-86399000).change(); //subtract 23hrs59min59sec
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
	var that = this;
	var submenu_wrapper = this.Wrapper();
	var submenu_content = submenu_wrapper.find("[find=submenu_wrapper_content]").addClass('submenu_calendar').removeClass('overthrow');
	var elem_timestamp = $('<input find="timestamp" type="text" readonly="readonly"/>');
	var elem_datepicker = $('<div>elem_datepicker</div>');
	var elem_datepicker_inline = null;

	if(that.param && that.param.elem_inputOrig){
		elem_timestamp.val(that.param.elem_inputOrig.val());
	}
	that.param.elem_inputTarget = elem_timestamp;

	var calendar_inst = {};
	calendar_inst.input = [];
	calendar_inst.input[0] = elem_datepicker;
	calendar_inst.lastVal = elem_timestamp.val();
	
	elem_datepicker.datepicker(
	{
		//altFormat: "M d",
		//altField: elem_alt,
		dayNamesMin: (new wrapper_date()).day_very_short,
		monthNames: (new wrapper_date()).month,
		showOtherMonths: true,
		dateFormat: '@',
		gotoCurrent: true,
		minDate: 0,
		showAnim: "slideDown",
		beforeShow: function(input, inst){
			console.log('beforeShow');
			//console.log(inst);
			// submenu_content.find('.ui-datepicker-inline').addClass('burger_calendar');
			//burger_calendar_linckofy(inst);
		},
		onChangeMonthYear: function(year, month, inst){
			elem_datepicker_inline.addClass('burger_calendar');
			burger_calendar_linckofy(calendar_inst, elem_datepicker_inline);
		},
		onSelect: function(dateText, inst){
			var year = inst.selectedYear;
			var month = inst.selectedMonth;
			var day = inst.selectedDay;
			var timestamp = new Date(year, month, day).getTime() + 86399000;
			elem_timestamp.val(timestamp);
			calendar_inst.lastVal = timestamp;
			burger_calendar_linckofy(calendar_inst, elem_datepicker_inline);
		},
	});

	submenu_content.append(elem_timestamp).append(elem_datepicker);

	elem_datepicker_inline = submenu_content.find('.ui-datepicker-inline').addClass('burger_calendar');
	elem_datepicker.datepicker('setDate',elem_timestamp.val());
	burger_calendar_linckofy(calendar_inst, elem_datepicker_inline);





	$(document).on("submenuHide.calendar", function(){
		elem_datepicker.datepicker('destroy');
		$(document).off('submenuHide.calendar');
	});


	//Free memory
	//submenu_wrapper = null; //In some placea it bugs because it's used in a lower scope
	delete submenu_wrapper;
	return true;
}

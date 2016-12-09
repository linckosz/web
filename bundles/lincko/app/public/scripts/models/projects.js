submenu_list['app_project_new'] = {
	//Set the title of the top
	 "_title": {
		"style": "customized_title",
		"title": Lincko.Translation.get('app', 2001, 'html'), //New project
	},
	"left_button": {
		"style": "title_left_button",
		"title": Lincko.Translation.get('app', 7, 'html'), //Cancel
		'hide': true,
		"class": "base_pointer",
	},
	"right_button": {
		"style": "title_right_button",
		"title": Lincko.Translation.get('app', 41, 'html'), //Create
		"class": "base_pointer",
		"action": function(Elem, subm) {
			base_showProgress(Elem);
			Elem.recursiveOff();
			$('#' + subm.id + '_submenu_form').submit();
		},
		"now": function(Elem, subm){
			//Add loading bar
			var loading_bar = $("#-submit_progress_bar").clone();
			loading_bar.prop('id', '');
			Elem.append(loading_bar);
		},
	},
	"_pre_action": {
		"style": "preAction",
		"action": function(Elem, subm){
			app_projects_users_contacts_list = {};
			app_projects_users_contacts_init(subm);
		},
	},
	//Add HTML/JS checking input format
	"_input": {
		"style": "prefix",
		"title": "project",
	},
	
	"form_create": {
		"style": "form",
		"title": Lincko.Translation.get('app', 41, 'html'), //Create
		"action": "project/create",
		"submit": function(subm){
			var param = {
				"parent_id": Lincko.storage.getWORKID(),
				"users>access": {},
			};
			var users_access = {};
			param["users>access"][wrapper_localstorage.uid] = true;
			for(var users_id in app_projects_users_contacts_list){
				param["users>access"][users_id] = true;
			}
			var tmpID = null;
			return wrapper_sendForm(
				$('#'+subm.id+'_submenu_form'),
				app_models_projects_create_cb_success,
				submenu_form_cb_error,
				app_models_projects_create_cb_begin,
				submenu_form_cb_complete,
				param
			);
		},
	},
	
	"title": {
		"style": "input_text",
		"title": Lincko.Translation.get('app', 28, 'html'), //Title
		"name": "title",
		"value": "",
		"class": "submenu_input_text",
	},
	"team": {
		"style": "select_multiple",
		"title": Lincko.Translation.get('app', 31, 'html'), //Team
		"name": "project_team_select_multiple",
		"value": "",
		"class": "submenu_input_select_multiple submenu_deco_borders",
		"next": "app_projects_users_contacts",
	},
	"description": {
		"style": "input_textarea",
		"title": Lincko.Translation.get('app', 30, 'html'), //Short description
		"name": "description",
		"value": "",
		"class": "submenu_input_textarea submenu_projects_description",
	},
};

submenu_list['app_project_edit'] = {
	//Set the title of the top
	 "_title": {
		"style": "customized_title",
		"title": Lincko.Translation.get('app', 2002, 'html'), //Project settings
	},
	"left_button": {
		"style": "title_left_button",
		"title": Lincko.Translation.get('app', 25, 'html'), //Close
		'hide': true,
		"class": "base_pointer",
	},
	"id": {
		"style": "project_id",
		"title": "ID",
		"name": "id",
		"value": "",
		"class": "models_projects_id",
	},
	"title": {
		"style": "project_title_edit",
		"title": Lincko.Translation.get('app', 28, 'html'), //Title
		"name": "title",
		"value": "",
		"class": "submenu_input_text",
	},
	"team": {
		"style": "project_team_edit",
		"title": Lincko.Translation.get('app', 31, 'html'), //Team
		"name": "project_team_select_multiple",
		"value": "",
		"class": "submenu_input_select_multiple models_projects_tab",
		"next": "app_projects_users_contacts",
	},
	"mute": {
		"style": "button",
		"title": Lincko.Translation.get('app', 74, 'html'), //Mute notifications
		"value": Lincko.Translation.get('app', 76, 'html'), //Off
		"now": function(Elem, subm){
			var projects_id = subm.param;
			var users = Lincko.storage.get('projects', projects_id, '_users');
			var on_off = Lincko.Translation.get('app', 76, 'html'); //Off
			if(users[wrapper_localstorage.uid] && users[wrapper_localstorage.uid]['silence']){
				on_off = Lincko.Translation.get('app', 75, 'html'); //On
			}
			Elem.find("[find=submenu_button_value]").html(on_off);
			Elem.removeClass('submenu_deco').addClass('submenu_select');
		},
		"class": "models_projects_tab submenu_select submenu_deco_borders",
		"action": function(Elem, subm){
			var projects_id = subm.param;
			var users = Lincko.storage.get('projects', projects_id, '_users');
			var on_off_invert = true;
			if(users[wrapper_localstorage.uid] && users[wrapper_localstorage.uid]['silence']){
				on_off_invert = false;
			}
			var on_off = Lincko.Translation.get('app', 76, 'html'); //Off
			if(on_off_invert){
				on_off = Lincko.Translation.get('app', 75, 'html'); //On
			}
			var param = {
				id: projects_id,
				"users>silence": {},
			}
			param["users>silence"][wrapper_localstorage.uid] = on_off_invert;
			wrapper_sendAction(
				param,
				'post',
				'project/update'
			);
			Elem.find("[find=submenu_button_value]").html(on_off);
		},
	},
	"description": {
		"style": "project_description_edit",
		"title": Lincko.Translation.get('app', 30, 'html'), //Short description
		"name": "description",
		"value": "",
		"class": "submenu_input_textarea submenu_projects_description",
	},
	"deletion": {
		"style": "project_deletion",
		"title": Lincko.Translation.get('app', 2503, 'html'), //Archive the project
		"name": "deletion",
		"class": "models_projects_deletion",
		"action": function(Elem, subm){
			var projects_id = subm.param;
			submenu_Hideall(subm.preview);
			wrapper_sendAction(
				{
					"id": projects_id
				},
				'post',
				'project/delete'
			);
		},
	},
	/*
	"optional_fields": {
		"style": "title_small",
		"title": Lincko.Translation.get('app', 65, 'html'), //Custom fields
		"class": "submenu_title_small_top",
	},
	"new_field": {
		"style": "project_new_field",
		"title": Lincko.Translation.get('app', 66, 'html'), //Add a new field
		"name": "newfield",
		"class": "models_projects_new_field",
		"action": function(Elem, subm){
			var projects_id = subm.param;
			var diy = Lincko.storage.get('projects', subm.param, 'diy');
			if(diy.length>0){
				diy = JSON.parse(diy);
				if($.isArray(diy)){
					var i = diy.length;
					var tab = subm.Add_ProjectDIY(subm, ['',''], i, true);
					tab.find("[find=submenu_input_text]").focus();
				}
			}
		},
	},
	"post_action": {
		"style": "postAction",
		"action": function(Elem, subm){
			app_models_projects_build_diy(Elem, subm);
		},
	},
	*/
};

var app_models_projects_build_diy = function(Elem, subm){
	var projects_id = subm.param;
	var diy = Lincko.storage.get('projects', subm.param, 'diy');
	if(diy.length>0){
		diy = JSON.parse(diy);
		if($.isArray(diy)){
			for(var i in diy){
				if($.isArray(diy[i]) && diy[i].length==2){
					subm.Add_ProjectDIY(subm, diy[i], i);
				}
			}
		}
	}
};

var app_models_projects_build_diy_value = function(subm){
	var Elem = subm.Wrapper();
	var list = Elem.find("[diy]").get();
	var type, key, field, value;
	var temp = {};
	var result = [];
	for(var i in list){
		if(list[i].attributes){
			diy = list[i].attributes.diy;
			if(diy){
				diy = diy.value.split("_");
				type = diy[1];
				key = diy[0];
				field = false;
				value = false;
				if(type && key){
					key = parseInt(key, 10);
					if(!result[key]){
						result[key] = [];
					}
					if(type=="key"){
						temp[key][0] = $(list[i]).val();
					}
					if(type=="val"){
						temp[key][1] = $(list[i]).val();
					}
				}
			}
		}
	}
	for(var i in temp){
		if($.isArray(result[i]) && result[i].length!=2){
			result[i] = temp[i];
		}
	}
	console.log(result);
	result = JSON.stringify(result);
	return result;
}

var app_models_projects_build_diy_update = function(subm){
	var param = {
		id: subm.param,
		diy: app_models_projects_build_diy_value(subm),
	}
	wrapper_sendAction(
		param,
		'post',
		'project/update'
	);
}

Submenu.prototype.Add_ProjectDIY = function(subm, diy, i, animation) {
	var that = this;
	var submenu_wrapper = this.Wrapper();
	var attribute = this.attribute;
	var Elem = $('#-submenu_diy').clone();
	var project_id = this.param;
	if(typeof animation == "undefined"){ animation = false; }
	Elem.prop("id", '');
	Elem.css('height', 'auto').css('display', 'block');
	if($.isArray(diy) && diy.length==2){
		if(typeof diy[1] == "object"){
			diy[1] = JSON.stringify(diy[1]);
		}
		var input = Elem.find("[find=submenu_input_text]")
			.val(diy[0]) //Key
			.attr("diy", i+"_key")
			.blur(
				subm,
				function(event){
					event.stopPropagation();
					app_models_projects_build_diy_update(event.data);
				}
			);
		var textarea = Elem.find("[find=submenu_input_textarea]")
			.attr("diy", i+"_val")
			.html(diy[1]) //Value
			.blur(
				subm,
				function(event){
					event.stopPropagation();
					app_models_projects_build_diy_update(event.data);
				}
			);
		Elem.find("[find=submenu_diy_delete]").click([Elem, subm], function(event){
			var Elem = event.data[0];
			var subm = event.data[1];
			Elem.velocity('slideUp',{
				mobileHA: hasGood3Dsupport,
				complete: function(){
					this.recursiveRemove();
					app_models_projects_build_diy_update(subm);
					submenu_resize_content();
					$(window).resize();
				}
			});
		});
		var position = submenu_wrapper.find("[find=newfield]");
		position.first().before(Elem);
		if(animation){
			Elem.velocity('slideDown',{
				mobileHA: hasGood3Dsupport,
				complete: function(){
					submenu_resize_content();
					$(window).resize();
				}
			});
		} else {
			submenu_resize_content();
			$(window).resize();
		}
		//submenu_wrapper = null; //In some placea it bugs because it's used in a lower scope
		delete submenu_wrapper;
		return Elem;
	}
	return false;	
}

Submenu.prototype.Add_ProjectDeletion = function(subm) {
	var that = this;
	var submenu_wrapper = this.Wrapper();
	var attribute = this.attribute;
	var Elem = $('#-submenu_button').clone();
	var preview = this.preview;
	Elem.prop("id", '');
	Elem.find("[find=submenu_button_title]").addClass("models_projects_deletion_button").html(attribute.title);
	Elem.find("[find=submenu_button_value]").recursiveRemove();
	if ("action" in attribute) {
		if (!("action_param" in attribute)) {
			attribute.action_param = null;
		}
		Elem.find("[find=submenu_button_title]").click(attribute.action_param, function(event){
			attribute.action(Elem, that, event.data);
		});
	}
	if ("class" in attribute) {
		Elem.addClass(attribute['class']);
	}
	submenu_wrapper.find("[find=submenu_wrapper_content]").append(Elem);
	//submenu_wrapper = null; //In some placea it bugs because it's used in a lower scope
	delete submenu_wrapper;
	return Elem;
};

Submenu.prototype.Add_ProjectNewField = function(subm) {
	var that = this;
	var submenu_wrapper = this.Wrapper();
	var attribute = this.attribute;
	var Elem = $('#-submenu_button').clone();
	var preview = this.preview;
	Elem.prop("id", '').attr("find", "newfield");
	Elem.find("[find=submenu_button_title]").addClass("models_projects_new_field_button").html(attribute.title);
	Elem.find("[find=submenu_button_value]").recursiveRemove();
	if ("action" in attribute) {
		if (!("action_param" in attribute)) {
			attribute.action_param = null;
		}
		Elem.find("[find=submenu_button_title]").click(attribute.action_param, function(event){
			attribute.action(Elem, that, event.data);
		});
	}
	if ("class" in attribute) {
		Elem.addClass(attribute['class']);
	}
	submenu_wrapper.find("[find=submenu_wrapper_content]").append(Elem);
	//submenu_wrapper = null; //In some placea it bugs because it's used in a lower scope
	delete submenu_wrapper;
	return Elem;
};

Submenu_select.project_title_edit = function(subm) {
	subm.Add_ProjectTitleEdit(subm);
};

Submenu_select.project_description_edit = function(subm){
	subm.Add_ProjectDescriptionEdit(subm);
};

Submenu_select.project_team_edit = function(subm){
	subm.Add_ProjectTeamEdit(subm);
};

Submenu_select.project_deletion = function(subm){
	subm.Add_ProjectDeletion(subm);
};

Submenu_select.project_new_field = function(subm){
	subm.Add_ProjectNewField(subm);
};

Submenu_select.project_id = function(subm){
	var Elem = subm.Add_TitleSmall();
	Elem.find("[find=submenu_title]").html("ID: "+subm.param);
};


Submenu.prototype.Add_ProjectTitleEdit = function(subm) {
	var Elem = subm.Add_InputText();
	var that = this;
	var project = Lincko.storage.get("projects", this.param);
	var title = project["+title"];
	var input = Elem.find("[find=submenu_input]");
	input
		.prop('value', title)
		.blur(
			[project["_id"], input],
			function(event){
				event.stopPropagation();
				var param = {
					id: event.data[0],
					title: event.data[1].val(),
				}
				//toto => improve to not sendAction if no change
				wrapper_sendAction(
					param,
					'post',
					'project/update'
				);
			}
		)
		.keypress(
			[project["_id"], input],
			function(event){
				event.stopPropagation();
				if (event.which == 13) {
					var param = {
						id: event.data[0],
						title: event.data[1].val(),
					}
					//toto => improve to not sendAction if no change
					wrapper_sendAction(
						param,
						'post',
						'project/update'
					);
				}
			}
		);
	return Elem;
};

Submenu.prototype.Add_ProjectDeletion = function(subm) {
	var that = this;
	var submenu_wrapper = this.Wrapper();
	var attribute = this.attribute;
	var Elem = $('#-submenu_button').clone();
	var preview = this.preview;
	Elem.prop("id", '');
	Elem.find("[find=submenu_button_title]").addClass("models_projects_deletion_button").html(attribute.title);
	Elem.find("[find=submenu_button_value]").recursiveRemove();
	if ("action" in attribute) {
		if (!("action_param" in attribute)) {
			attribute.action_param = null;
		}
		Elem.find("[find=submenu_button_title]").click(attribute.action_param, function(event){
			attribute.action(Elem, that, event.data);
		});
	}
	if ("class" in attribute) {
		Elem.addClass(attribute['class']);
	}
	submenu_wrapper.find("[find=submenu_wrapper_content]").append(Elem);
	//submenu_wrapper = null; //In some placea it bugs because it's used in a lower scope
	delete submenu_wrapper;
	return Elem;
};

Submenu.prototype.Add_ProjectDescriptionEdit = function() {
	var Elem = this.Add_InputTextarea();
	var that = this;
	var project = Lincko.storage.get("projects", this.param);
	var description = project["-description"];
	var input = Elem.find("[find=submenu_input_textarea]");
	input
		.html(description)
		.blur(
			[project["_id"], input],
			function(event){
				event.stopPropagation();
				var param = {
					id: event.data[0],
					description: event.data[1].val(),
				}
				//toto => improve to not sendAction if no change
				wrapper_sendAction(
					param,
					'post',
					'project/update'
				);
			}
		);
	return Elem;
};

Submenu.prototype.Add_ProjectTeamEdit = function() {
	this.attribute.param = this.param; //Pass project id to next submenu
	var Elem = this.Add_SelectMultiple();
	var that = this;
	var project = Lincko.storage.get("projects", this.param);
	var projects_id = project["_id"];
	var Elem = $("#"+this.id);
	var users_access = Lincko.storage.whoHasAccess("projects", projects_id);
	var Elem_sub = Elem.find("[find=submenu_select_value]");
	var wrapper_content_id = Elem_sub.prop("id");
	if(!wrapper_content_id){
		wrapper_content_id = this.id+"_project_team";
		Elem_sub.prop("id", wrapper_content_id)
	}
	Elem.find("[find=submenu_select_value]").html(users_access.length);
	app_application_lincko.add(wrapper_content_id, "projects_"+project["_id"], function(){
		var projects_id = this.action_param;
		var Elem = $("#"+this.id);
		var users_access = Lincko.storage.whoHasAccess("projects", projects_id);
		Elem.html(users_access.length);
	}, project["_id"]);

	app_application_lincko.prepare("projects_"+project["_id"], true);

	return Elem;
};

var app_models_projects_create_cb_begin = function(jqXHR, settings, temp_id){
	submenu_form_cb_begin();
	tmpID = temp_id;
};
var app_models_projects_create_cb_success = function(){
	submenu_form_cb_success();
	if(tmpID){
		var item = Lincko.storage.list("projects", 1 , {temp_id: tmpID});
		if(item[0]){
			app_content_menu.selection(item[0]['_id']);
		}
		tmpID = null;
	}
};

var app_models_projects_chart_tasks_data = function(Elem_id, id, chart_display_replace, chart_options_replace){
	if(typeof chart_display_replace != "object"){ chart_display_replace = false; }
	if(typeof chart_options_replace != "object"){ chart_options_replace = false; }
	wrapper_clean_chart();

	if(typeof Lincko.storage.data["_history_title"] == "undefined" || typeof Lincko.storage.data["_history_title"]["tasks"] == "undefined" || Lincko.storage.data["_history_title"]["tasks"][0] == null){
		return false;
	}

	//Chart default
	var chart_display = {
		labels: [],
		datasets: [
			{
				label: Lincko.Translation.get('app', 2101, 'html'), //total
				fillColor: "rgba(250,250,250,0.2)",
				strokeColor: "rgba(250,250,250,0.35)",
				pointColor: "rgba(250,250,250,0)",
				pointStrokeColor: "rgba(250,250,250,0)",
				pointHighlightFill: "#FFFFFF",
				pointHighlightStroke: "rgba(230,230,230,0.8)",
				data: [],
			},
			{
				label: Lincko.Translation.get('app', 2102, 'html'), //me
				fillColor: "rgba(250,250,250,0.5)",
				strokeColor: "rgba(250,250,250,1)",
				pointColor: "rgba(250,250,250,0)",
				pointStrokeColor: "rgba(250,250,250,0)",
				pointHighlightFill: "#FFFFFF",
				pointHighlightStroke: "rgba(230,230,230,0.8)",
				data: [],
			}
		]
	};
	if(chart_display_replace){
		chart_display = $.extend(true, {}, chart_display, chart_display_replace);
	}

	var chart_options = {
		animation: true,
		animationSteps: 12,
		animationEasing: "easeInOutCirc",
		responsive: false,
		maintainAspectRatio: false,
		showScale: false,
		scaleBeginAtZero: true,
		tooltipFontSize: 10,
		tooltipTitleFontSize: 10,
		tooltipTitleFontStyle: "normal",
		tooltipTemplate: "<%= value %> ( <%=datasetLabel%> )",
		multiTooltipTemplate: "<%= value %> ( <%=datasetLabel%> )",
		tooltipFillColor: "rgba(0,0,0,0.2)",
		tooltipCornerRadius: 3,
		scaleShowGridLines : false,
		pointDotRadius : 2,
		pointDotStrokeWidth : 1,
		datasetStroke : true,
		pointHitDetectionRadius : 10,
		multiTooltipKeyBackground: "rgba(250,250,250,0.2)",
		datasetStrokeWidth : 1,
	};
	if(chart_options_replace){
		chart_options = $.extend(true, {}, chart_options, chart_options_replace);
	}

	if(!wrapper_performance.powerfull){ //If not powerfull enough, we don't animate the charts
		chart_options.animation = false;
		chart_options.animationSteps = 0;
	}

	var chart_data = {
		labels: [],
		data_total: [],
		data_me: [],
	};
	var label = Lincko.storage.data["_history_title"]["tasks"][0].ucfirst(); //Tasks
	var data_total = 0;
	var data_me = 0;
	var created_at;
	var approved_at;
	var deleted_at;
	var in_charge = false;
	var project = Lincko.storage.get("projects", id);
	var tasks = Lincko.storage.list('tasks', -1, { _tasksup: null,}, 'projects', id);


	if(tasks.length<=3){ //Start to display a graphic after 3 tasks created
		return false;
	}
	//Cut in 10 slices the time to make a curve smooth
	var start = false;
	var end = Math.floor((new Date()).getTime() / 1000);
	for(var i in tasks){
		created_at = tasks[i]["created_at"];
		approved_at = tasks[i]["approved_at"];
		deleted_at = tasks[i]["deleted_at"];
		if(created_at!=null && (!start || created_at<start)){
			start = created_at;
		}
		if(approved_at!=null && (!end || approved_at>end)){
			end = approved_at;
		}
		if(deleted_at!=null && (!end || deleted_at>end)){
			end = deleted_at;
		}
	}

	var range_total = {}
	var range_me = {}
	range_total[start] = 0;
	range_me[start] = 0;
	if(start){
		var cut = 10;
		var range_cut = Math.floor((end-start)/cut);
		for(var i=1; i<cut; i++){
			range_total[start+(i*range_cut)] = 0;
			range_me[start+(i*range_cut)] = 0;
		}
		range_total[end] = 0;
		range_me[end] = 0;
	}

	var plus;
	var less = false;
	for(var i in tasks){
		plus = tasks[i]["created_at"];
		approved_at = tasks[i]["approved_at"];
		deleted_at = tasks[i]["deleted_at"];
		in_charge = false;
		if(tasks[i]["_users"] && tasks[i]["_users"][wrapper_localstorage.uid] && tasks[i]["_users"][wrapper_localstorage.uid]["in_charge"]==true){
			in_charge = true;
		}
		less = false;
		if(deleted_at!=null){
			less = deleted_at;
		}
		if(approved_at!=null){
			less = approved_at;
		}
		if(plus){
			for(var timestamp in range_total){
				if(plus<=timestamp){
					range_total[timestamp]++;
					if(in_charge){
						range_me[timestamp]++;
					}
				}
			}
		}
		if(less){
			for(var timestamp in range_total){
				if(less<=timestamp){
					range_total[timestamp]--;
					if(in_charge){
						range_me[timestamp]--;
					}
				}
			}
		}
	}

	var date = new wrapper_date();
	var temp = 0;
	for(var i in range_total){
		date.setTime(i);
		label = date.display("date_very_short");
		chart_data.labels.push(label);
		temp = range_total[i];
		if(temp<0){ temp = 0; }
		chart_data.data_total.push(temp);
		temp = range_me[i];
		if(temp<0){ temp = 0; }
		chart_data.data_me.push(temp);
	}

	Elem = $('#'+Elem_id);
	if(Elem.length>0 && Elem.find("[find=tasks_statistics]")){
		//Chart generator
		var ctx = Elem.find("[find=tasks_statistics]").get(0).getContext("2d");
		chart_display.labels = chart_data.labels;
		chart_display.datasets[0].data = chart_data.data_total;
		chart_display.datasets[1].data = chart_data.data_me;
		var chart = new Chart(ctx).Line(chart_display, chart_options);
		return chart;
	}
	return false;
}

var app_models_projects_list = function(limit, recents){
	if(typeof limit != "number"){ limit = false; }
	if(typeof recents != "number"){ recents = 5; }
	var projects_personal = Lincko.storage.getMyPlaceholder();
	var projects_recents = [];
	var projects_alphabet = [];
	var project;
	projects_personal["+title"] = Lincko.Translation.get('app', 2502, 'html'); //Personal Space
	var projectList_conditions = {
		_id: ['!in', [projects_personal['_id']]],
	};
	var settings = Lincko.storage.getSettings();
	if(settings.latestvisitProjects && settings.latestvisitProjects.length>0){
		for(var i in settings.latestvisitProjects){
			if(settings.latestvisitProjects[i] != projects_personal['_id']){
				project = Lincko.storage.get('projects', settings.latestvisitProjects[i]);
				if(project && project["deleted_at"]==null){
					projects_recents.push(
						Lincko.storage.get('projects', settings.latestvisitProjects[i])
					);
					projectList_conditions._id[1].push(
						settings.latestvisitProjects[i]
					);
				}
			}
			if(projects_recents.length>=recents){ break; } //Limit to 5 most recent opened projects
		}
	}

	projects_alphabet = Lincko.storage.list('projects', null, projectList_conditions); //Do not include personal space, it has to be show separatly fro projects list (separate on top of list)
	projects_alphabet = Lincko.storage.sort_items(projects_alphabet, 'title'); //Alphabetic order for remaining projects

	var total = 1 + projects_recents.length + projects_alphabet.length;
	var result = [];
	result.push(projects_personal);
	if(limit && limit>0){
		limit--; //It includes already personal space
		if(limit<0){ limit = 0; }
		if(projects_recents.length >= limit){
			projects_recents.length = limit;
			projects_alphabet.length = 0;
		}
		limit = limit - projects_recents.length;
		if(limit<0){ limit = 0; }
		if(projects_alphabet.length >= limit){
			projects_alphabet.length = limit;
		}
	}
	result.push(projects_recents);
	result.push(projects_alphabet);
	result.push(total);

	return result;
}

var app_models_projects_list_archived = function(limit){
	if(typeof limit != "number"){ limit = null; }
	var result = Lincko.storage.list('projects', null, {'deleted_at': ['!=', null]}, null, null, false, true);
	result = Lincko.storage.sort_items(result, 'title'); //Alphabetic order for remaining projects
	return result;
}

var app_models_projects_adjust_format = function(num){
	num = parseInt(num, 10);
	var str = num;
	if(num<100){
		str = "&nbsp;"+str;
	}
	if(num<10){
		str = "&nbsp;"+str;
	}
	if(num<1){
		str = "&nbsp;&nbsp;0";
	}
	return str;
}

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
		"action": function(Elem, that) {
			$('#' + that.id + '_submenu_form').submit();
		},
	},
	"_pre_action": {
		"style": "preAction",
		"action": function(subm){
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
		"submit": function(that){
			var param = {
				//"lastvisit": Lincko.storage.getLastVisit(),
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
				$('#'+that.id+'_submenu_form'),
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
		"class": "submenu_input_select_multiple",
		"next": "app_projects_users_contacts",
	},
	"description": {
		"style": "input_textarea",
		"title": Lincko.Translation.get('app', 30, 'html'), //Short description
		"name": "description",
		"value": "",
		"class": "submenu_input_textarea",
	},
};

submenu_list['app_project_edit'] = {
	//Set the title of the top
	 "_title": {
		"style": "customized_title",
		"title": Lincko.Translation.get('app', 2001, 'html'), //New project
	},
	"left_button": {
		"style": "title_left_button",
		"title": Lincko.Translation.get('app', 25, 'html'), //Close
		'hide': true,
		"class": "base_pointer",
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
		"class": "submenu_input_select_multiple",
		"next": "app_projects_users_contacts",
	},
	"description": {
		"style": "project_description_edit",
		"title": Lincko.Translation.get('app', 30, 'html'), //Short description
		"name": "description",
		"value": "",
		"class": "submenu_input_textarea",
	},
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
	var wrapper_content_id = this.id+"_project_team";
	var project = Lincko.storage.get("projects", this.param);
	var projects_id = project["_id"];
	var Elem = $("#"+this.id);
	var users_access = Lincko.storage.whoHasAccess("projects", projects_id);
	Elem.find("[find=submenu_select_value]")
		.prop("id", wrapper_content_id)
		.html(users_access.length);
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
	var tasks = Lincko.storage.list('tasks', -1, null, 'projects', id);


	if(tasks.length<=0){
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


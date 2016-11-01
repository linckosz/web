
submenu_list['projects_list'] = {
	"_title": {
		"style": "customized_title",
		"title": Lincko.Translation.get('app', 2501, 'html'), //Projects list
	},
	"left_button": {
		"style": "title_left_button",
		"title": Lincko.Translation.get('app', 25, 'html'), //Close
		'hide': true,
		"class": "base_pointer",
	},
};

var submenu_projects_build_list = function(){
	
	var projects = {};
	var projects_id;
	var title;

	app_layers_projects_charts = {};

	//Clear the list to rebuild it then
	for(var i in submenu_list['projects_list']){
		if(
			   submenu_list['projects_list'][i]["style"] != "title"
			&& submenu_list['projects_list'][i]["style"] != "customized_title"
			&& submenu_list['projects_list'][i]["style"] != "title_left_button"
			&& submenu_list['projects_list'][i]["style"] != "title_right_button"
			&& submenu_list['projects_list'][i]["style"] != "preAction"
			&& submenu_list['projects_list'][i]["style"] != "postAction"
		){
			delete submenu_list['projects_list'][i];
		}
	}

	var projects_all = app_models_projects_list();
	var projects_personal = projects_all[0];
	var projectList = $.merge(projects_all[1], projects_all[2]);
	var projects_total = projects_all[3];
	delete projects_all;

	var MyPlaceholderID = projects_personal['_id'];
	//My personal space
	submenu_list['projects_list'][MyPlaceholderID] = {
		"style": "projects",
		"title": Lincko.Translation.get('app', 2502, 'html'), //Personal Space
		"hide": true,
		"action_param": { projects_id: MyPlaceholderID, },
		"action": function(){
			app_content_menu.selection(MyPlaceholderID, 'tasks');
		},
		"selected": false,
	};

	for(var i in projectList){
		title = projectList[i]['+title'].ucfirst();
		projects_id = projectList[i]['_id'];
		if(typeof submenu_list['projects_list'][projects_id] == 'undefined'){
			submenu_list['projects_list']['projects_'+i+'_'+projects_id] = {
				"style": "projects",
				"title": title,
				"hide": true,
				"action_param": { projects_id: projects_id, },
				"action": function(Elem, subm, action_param){
					app_content_menu.selection(action_param.projects_id, 'tasks');
				},
			};
		}
	}
	
};

Submenu_select.projects = function(Elem){
	Elem.Add_MenuProjects();
	//NOTE: the list is not updated in case of appearance of a new project, but do we have to allow it?
};

Submenu.prototype.Add_MenuProjects = function() {
	var attribute = this.attribute;
	var that = this;
	var Elem = $('#-submenu_projects').clone();
	var preview = this.preview;
	var projects_id = attribute.action_param.projects_id;
	Elem.prop("id", "submenu_projects_title_"+that.id+"_"+projects_id);

	var tasks = app_models_projects_adjust_format(Lincko.storage.list('tasks', null, {approved: false, _tasksup: null,}, 'projects', projects_id, true).length);
	var notes = app_models_projects_adjust_format(Lincko.storage.list('notes', null, null, 'projects', projects_id, true).length);
	var files = app_models_projects_adjust_format(Lincko.storage.list('files', null, null, 'projects', projects_id, true).length);

	Elem.find("[find=submenu_projects_statistics_tasks]").html(wrapper_to_html(tasks));
	Elem.find("[find=submenu_projects_statistics_notes]").html(wrapper_to_html(notes));
	Elem.find("[find=submenu_projects_statistics_files]").html(wrapper_to_html(files));

	var project = Lincko.storage.get("projects", projects_id);
	var MyPlaceholderID = Lincko.storage.getMyPlaceholder()['_id'];

	if(projects_id != MyPlaceholderID && project){
		Elem.find("[find=submenu_projects_settings]").click([projects_id, that], function(event){
			event.stopPropagation();
			var projects_id = event.data[0];
			var subm = event.data[1];
			subm.Wrapper().find(".submenu_projects_selected").removeClass("submenu_projects_selected");
			$("#submenu_projects_title_"+subm.id+"_"+projects_id).addClass("submenu_projects_selected");
			var next = submenu_get("app_project_edit", preview);
			if(next && next.param == projects_id){
				next.Hide(true);
			} else {
				submenu_Build("app_project_edit", -1, false, projects_id, preview);
			}
		});
		Elem.find("[find=submenu_projects_title]").html(wrapper_to_html(project["+title"]));
	} else {
		Elem.find("[find=submenu_projects_settings]").css("visibility", "hidden");
		Elem.find("[find=submenu_projects_title]").html(attribute.title);
	}

	if ("action" in attribute) {
		if (!("action_param" in attribute)) {
			attribute.action_param = null;
		}
		Elem.click(attribute.action_param, function(event){
			attribute.action(Elem, that, event.data);
		});
	}
	if ("hide" in attribute) {
		if (attribute.hide) {
			Elem.click(function() {
				submenu_Clean(this.layer, false, preview);
			});
		}
	}
	if ("class" in attribute) {
		Elem.addClass(attribute['class']);
	}
	this.Wrapper().find("[find=submenu_wrapper_content]").append(Elem);

	var statistics_id = this.id+"_tasks_statistics_container_"+projects_id;
	Elem.find("[find=tasks_statistics_container]").prop("id", statistics_id);

	app_application_lincko.add(statistics_id, ['projects_'+projects_id, 'submenu_show_'+that.preview+'_'+that.id], function() {
		app_models_projects_chart_tasks_data(this.id, this.action_param, null, submenu_projects_charts_options);
	}, projects_id);

	app_application_lincko.add("submenu_projects_title_"+that.id+"_"+projects_id, 'projects_'+projects_id, function() {
		var Elem = $("#"+this.id);
		var projects_id = this.action_param;
		var project = Lincko.storage.get("projects", projects_id);
		if(project && project["deleted_at"]!=null){
			Elem.recursiveRemove();
			return true;
		}
		if(projects_id == Lincko.storage.getMyPlaceholder()['_id']){
			var name = Lincko.Translation.get('app', 2502, 'html'); //Personal Space
		} else {
			var name = wrapper_to_html(project["+title"]);
		}
		Elem.find("[find=submenu_projects_title]").html(name);
		var tasks = app_models_projects_adjust_format(Lincko.storage.list('tasks', null, {approved: false, _tasksup: null,}, 'projects', projects_id, true).length);
		var notes = app_models_projects_adjust_format(Lincko.storage.list('notes', null, null, 'projects', projects_id, true).length);
		var files = app_models_projects_adjust_format(Lincko.storage.list('files', null, null, 'projects', projects_id, true).length);
		Elem.find("[find=submenu_projects_statistics_tasks]").html(wrapper_to_html(tasks));
		Elem.find("[find=submenu_projects_statistics_notes]").html(wrapper_to_html(notes));
		Elem.find("[find=submenu_projects_statistics_files]").html(wrapper_to_html(files));
	}, projects_id);

	return true;
};

JSfiles.finish(function(){
	submenu_projects_build_list();
	app_application_lincko.add(submenu_projects_build_list, ['projects', 'first_launch']);
});

var submenu_projects_charts_options = {
	showTooltips: false,
};

if(responsive.minTablet){
	submenu_projects_charts_options.animation = true;
}
enquire.register(responsive.maxMobileL, function() {
	submenu_projects_charts_options.animation = true; //Turn to false if the display is slow on mobile
});
enquire.register(responsive.minTablet, function() {
	submenu_projects_charts_options.animation = true;
});

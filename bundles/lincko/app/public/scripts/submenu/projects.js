
submenu_list['projects_list'] = {
	"_title": {
		"style": "title",
		"title": Lincko.Translation.get('app', 2501, 'html'), //Projects list
	},
};

var submenu_projects_build_list = function(){
	
	var projects = {};
	var projects_id;
	var title;

	app_layers_projects_charts = {};

	//Clear the list to rebuild it then
	for(var key in submenu_list['projects_list']){
		if(key != "_title"){
			delete submenu_list['projects_list'][key];
		}
	}

	projects = Lincko.storage.getMyPlaceholder();
	var MyPlaceholderID = projects['_id'];
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

	projects = Lincko.storage.list('projects', null, {_id:['!=', MyPlaceholderID]});
	for(var i in projects){
		title = projects[i]['+title'].ucfirst();
		projects_id = projects[i]['_id'];
		if(typeof submenu_list['projects_list'][projects_id] == 'undefined'){
			submenu_list['projects_list']['projects_'+i+'_'+projects_id] = {
				"style": "projects",
				"title": title,
				"hide": true,
				"action_param": { projects_id: projects_id, },
				"action": function(event){
					app_content_menu.selection(event.data.projects_id, 'tasks');
				},
			};
		}
	}
	
};

Submenu_select.projects = function(Elem){
	Elem.Add_MenuProjects();
};

Submenu.prototype.Add_MenuProjects = function() {
	var attribute = this.attribute;
	var that = this;
	var Elem = $('#-submenu_projects').clone();
	Elem.prop("id", '');
	var preview = this.preview;

	var projects_id = attribute.action_param.projects_id;

	var tasks = Lincko.storage.list('tasks', null, {approved: false,}, 'projects', projects_id, true).length;
	var notes = Lincko.storage.list('notes', null, null, 'projects', projects_id, true).length;
	var files = Lincko.storage.list('files', null, null, 'projects', projects_id, true).length;

	Elem.find("[find=submenu_projects_statistics_tasks]").html(tasks);
	Elem.find("[find=submenu_projects_statistics_notes]").html(notes);
	Elem.find("[find=submenu_projects_statistics_files]").html(files);

	var project = Lincko.storage.get("projects", projects_id);
	var MyPlaceholderID = Lincko.storage.getMyPlaceholder()['_id'];

	if(projects_id != MyPlaceholderID && project){
		Elem.find("[find=submenu_projects_settings]").click(projects_id, function(event){
			event.stopPropagation();
			submenu_Build("app_project_edit", true, true, event.data, preview);
		});
	} else {
		Elem.find("[find=submenu_projects_settings]").css("visibility", "hidden");
	}

	
	Elem.find("[find=submenu_projects_title]").html(attribute.title);
	if ("action" in attribute) {
		if ("action_param" in attribute) {
			Elem.click(attribute.action_param, attribute.action);
		} else {
			Elem.click(attribute.action);
		}
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

	app_application_lincko.add(statistics_id, 'submenu_show', function() {
		app_models_projects_chart_tasks_data(this.id, this.action_param, null, submenu_projects_charts_options);
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


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
	var preview = this.preview;

	var tasks = Lincko.storage.list('tasks', null, {approved: false,}, 'projects', attribute.action_param.projects_id, true).length;
	var notes = Lincko.storage.list('notes', null, null, 'projects', attribute.action_param.projects_id, true).length;
	var files = Lincko.storage.list('files', null, null, 'projects', attribute.action_param.projects_id, true).length;

	Elem.find("[find=submenu_projects_statistics_tasks]").html(tasks);
	Elem.find("[find=submenu_projects_statistics_notes]").html(notes);
	Elem.find("[find=submenu_projects_statistics_files]").html(files);

	Elem.find("[find=submenu_projects_settings]").click(function(event){
		event.stopPropagation();
		submenu_Build("app_project_edit", true, true, attribute.action_param.projects_id, preview);
	});

	Elem.prop("id", '');
	Elem.find("[find=submenu_projects_title]").html(attribute.title);
	if ("hide" in attribute) {
		if (attribute.hide) {
			Elem.click(function() {
				submenu_Clean(this.layer, false, preview);
			});
		}
	}
	if ("action" in attribute) {
		if ("action_param" in attribute) {
			Elem.click(attribute.action_param, attribute.action);
		} else {
			Elem.click(attribute.action);
		}
	}
	if ("class" in attribute) {
		Elem.addClass(attribute['class']);
	}
	this.Wrapper().find("[find=submenu_wrapper_content]").append(Elem);
	return true;
};

JSfiles.finish(function(){
	submenu_projects_build_list();
	app_application_lincko.add(submenu_projects_build_list, ['projects', 'first_launch']);
});

var submenu_projects_charts_data = {
	labels: [],
	datasets: [
		{
			label: "", //Lincko.Translation.get('app', 2101, 'html'), //total
			fillColor: "rgba(250,250,250,0.2)",
			strokeColor: "rgba(250,250,250,0.35)",
			pointColor: "rgba(250,250,250,0)",
			pointStrokeColor: "rgba(250,250,250,0)",
			pointHighlightFill: "#FFFFFF",
			pointHighlightStroke: "rgba(230,230,230,0.8)",
			data: [],
		},
		{
			label: "", //Lincko.Translation.get('app', 2102, 'html'), //me
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

var submenu_projects_charts_options = {
	animation: false,
	animationSteps: 12,
	animationEasing: "easeInOutCirc",
	responsive: true,
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

if(responsive.minTablet){
	submenu_projects_charts_options.animation = true;
}
enquire.register(responsive.maxMobileL, function() {
	submenu_projects_charts_options.animation = false;
});
enquire.register(responsive.minTablet, function() {
	submenu_projects_charts_options.animation = true;
});

var submenu_projects_charts = {};

var submenu_projects_charts_resize_timing = false;
function submenu_projects_charts_resize(){
	clearTimeout(submenu_projects_chart_resize_timing);
	submenu_projects_charts_resize_timing = setTimeout(function(){
		var instance;
		wrapper_clean_chart();
		for(var i in Chart.instances){
			instance = Chart.instances[i];
			if (instance.options.responsive){
				instance.resize(instance.render, true);
			}
		}
	}, 100);
}

var submenu_projects_charts_resize_timer;
$(window).resize(function(){
	clearTimeout(submenu_projects_charts_resize_timer);
	submenu_projects_charts_resize_timer = setTimeout(submenu_projects_charts_resize, wrapper_timeout_timer);
});



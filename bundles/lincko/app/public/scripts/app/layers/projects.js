/* Category 21xx */

function app_layers_projects_createPage(param){
	if(typeof param === 'undefined'){ param = null; }
	var layer = $('#app_layers_content');
	var Elem = $('#-app_layers_projects').clone();
	Elem.prop('id', 'app_layers_projects');
	Elem.appendTo(layer);
	app_layers_projects_feedPage(param);
	app_application_lincko.add("app_layers_projects", "projects", function(){
		app_layers_projects_feedPage(null, false);
	});
}

var app_layers_projects_data = {
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

var app_layers_projects_options = {
	animation: true,
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

var app_layers_projects_charts = {};

var app_layers_projects_charts_resize_timing = false;
function app_layers_projects_charts_resize(){
	clearTimeout(app_layers_projects_charts_resize_timing);
	app_layers_projects_charts_resize_timing = setTimeout(function(){
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
$(window).resize(app_layers_projects_charts_resize);


function app_layers_projects_icon_add_visibility(){
	if($("#app_content_dynamic_sub").hasScrollBar()){
		$('#app_layers_projects').find(".app_layers_projects_add_corner").show();
	} else {
		$('#app_layers_projects').find(".app_layers_projects_add_corner").hide();
	}
}
$(window).resize(app_layers_projects_icon_add_visibility);


var app_layers_projects_feedPage = function(param, animation){
	if(typeof param === 'undefined'){ param = null; }
	if(typeof animation === 'undefined'){ animation = true; } //Animate te graph by default
	var position = $('#app_layers_projects');
	position.empty();
	var items = Lincko.storage.getFavorites('projects', null, true);
	var item;
	var tasks;
	var progress = 0;
	var tasks_total = 0;
	var tasks_remain = 0;
	var ctx;
	var projectChart;
	var Elem;
	app_layers_projects_charts = {};
	for(var i in items){
		item = items[i];
		if(item['personal_private']==1){ continue; } //Do not display personal folder
		Elem = $('#-models_projects').clone();
		Elem.prop('id', 'models_projects_'+item['_id']);
		Elem.find("[find=title]").html( php_nl2br(item['+title']) );
		if(Lincko.storage.favorite('projects', item['_id'])){
			Elem.find("[find=favorite]").css('visibility', 'visible');
		}
		
		tasks = Lincko.storage.list('tasks', null, { 'projects_id': item['_id'] });
		for(var j in tasks){
			//Do not count canceled tasks
			if(tasks[j]['status'] == 3){
				delete tasks[j];
			}
		}
		
		progress = 0;
		tasks_remain = 0;
		tasks_total = tasks.length;
		if(tasks_total > 0){
			for(var j in tasks){
				if(tasks[j]['status'] == 1){ //Done
					progress = progress + 100;
				} else { //Pause || Ongoing
					tasks_remain++;
					progress = progress + parseInt(tasks[j]['progress'], 10);
				}
			}
			progress = Math.floor(progress/tasks.length);
		}

		app_layers_projects_charts[Elem.prop('id')] = {
			labels: [],
			data_total: [],
			data_me: [],
		};
		
		for(var k=0; k<6; k++){
			data_total = Math.floor(Math.random() * 20);
			data_me = Math.floor(Math.random() * data_total);
			if(k==5){
				data_me = tasks_remain;
				if(data_me > data_total){
					data_total = data_me;
				}
			}
			app_layers_projects_charts[Elem.prop('id')].labels[k] = "Tasks";
			app_layers_projects_charts[Elem.prop('id')].data_total[k] = data_total;
			app_layers_projects_charts[Elem.prop('id')].data_me[k] = data_me;
		}

		Elem.click(
			{projects_id: item['_id']}, function(event){
				app_content_menu.selection(event.data.projects_id, 'tasks');
			}
		);

		Elem.appendTo(position);
	}

	Elem = $('#-app_layers_projects_add_icon').clone();
	Elem.prop('id', 'app_layers_projects_add_icon');
	Elem.click(function(){
		submenu_Build("app_project_new");
	});
	Elem.appendTo(position);

	Elem = $('#-app_layers_projects_add_corner').clone();
	Elem.prop('id', 'app_layers_projects_add_corner');
	Elem.click(function(){
		submenu_Build("app_project_new");
	});
	Elem.appendTo(position);

	//Delete the last border in Mobile mode
	position.find('.models_projects_standard').last().addClass('models_projects_standard_last');

	app_layers_projects_icon_add_visibility();

	app_layers_projects_options.animation = animation;
	
	setTimeout(function(){
		var ctx;
		var projectChart;
		var Elem;
		var data;
		wrapper_clean_chart();
		for(var Elem_id in app_layers_projects_charts){
			Elem = $('#'+Elem_id);
			if(Elem.length>0){
				ctx = Elem.find("[find=tasks_statistics]").get(0).getContext("2d");
				var data = app_layers_projects_data;
				data.labels = app_layers_projects_charts[Elem_id].labels;
				data.datasets[0].data = app_layers_projects_charts[Elem_id].data_total;
				data.datasets[1].data = app_layers_projects_charts[Elem_id].data_me;
				projectChart = new Chart(ctx).Line(data, app_layers_projects_options);
			}
		}
	}, 100); //Must be after app_layers_changePage timing (50ms)

}

position
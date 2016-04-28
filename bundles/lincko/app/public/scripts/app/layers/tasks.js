/* Category 22xx */

function app_layers_tasks_launchPage(param){
	if(typeof param === 'undefined'){ param = null; }
	app_application_lincko.add("app_layers_tasks", "tasks", function(){
		app_layers_tasks_feedPage();
	});
	app_layers_tasks_feedPage();
}

function app_layers_tasks_icon_add_visibility(){
	if($("#app_content_dynamic_sub").hasScrollBar()){
		$('#app_layers_tasks').find(".app_layers_tasks_add_corner").show();
	} else {
		$('#app_layers_taskss').find(".app_layers_tasks_add_corner").hide();
	}
}
var app_layers_tasks_icon_add_visibility_timer;
$(window).resize(function(){
	clearTimeout(app_layers_tasks_icon_add_visibility_timer);
	app_layers_tasks_icon_add_visibility_timer = setTimeout(app_layers_tasks_icon_add_visibility, wrapper_timeout_timer);
});

var app_layers_tasks_feedPage = function(param){
	if(typeof param === 'undefined'){ param = null; }
	var position = $('#app_layers_tasks');
	position.addClass('overthrow');
	position.empty();
	if(app_content_menu.projects_id == Lincko.storage.getMyPlaceholder()['_id']){
		var items = Lincko.storage.list('tasks', null, true);
	} else {
		var items = Lincko.storage.list('tasks', null, {'_parent': ['projects', app_content_menu.projects_id]});
	}
	var item;
	var Elem;
	for(var i in items){
		item = items[i];
		Elem = $('#-models_tasks').clone();
		Elem.prop('id', 'models_tasks_'+item['_id']);
		Elem.find("[find=title]").html( wrapper_to_html(item['+title']) );
		Elem.find("[find=comment]").html( wrapper_to_html(item['-comment']) );
		if(item['-comment'] == ''){
			Elem.find(".models_tasks_standard_line").hide();
		}
		Elem.appendTo(position);
	}

	Elem = $('#-app_layers_tasks_add_icon').clone();
	Elem.prop('id', 'app_layers_tasks_add_icon');
	Elem.click(function(){
		submenu_Build("app_task_new");
	});
	Elem.appendTo(position);

	Elem = $('#-app_layers_tasks_add_corner').clone();
	Elem.prop('id', 'app_layers_tasks_add_corner');
	Elem.click(function(){
		submenu_Build("app_task_new");
	});
	Elem.appendTo(position);

	//Delete the last border in Mobile mode
	position.find('.models_tasks_standard').last().addClass('models_tasks_standard_last');

	app_layers_tasks_icon_add_visibility();


	app_application_lincko.add(
		'app_layers_tasks',
		'tasks',
		function(){
			console.log('tasklist update function');
		}
	);

}

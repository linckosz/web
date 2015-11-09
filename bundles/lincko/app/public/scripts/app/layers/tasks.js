/* Category 22xx */

function app_layers_tasks_registerPage(param){
	if(typeof param === 'undefined'){ param = null; }
	app_application_lincko.add("app_layers_tasks", "tasks", function(){
		app_layers_tasks_feedPage();
	});
}

function app_layers_tasks_icon_add_visibility(){
	if($("#app_content_dynamic_sub").hasScrollBar()){
		$('#app_layers_tasks').find(".app_layers_tasks_add_corner").show();
	} else {
		$('#app_layers_taskss').find(".app_layers_tasks_add_corner").hide();
	}
}
$(window).resize(app_layers_tasks_icon_add_visibility);


var app_layers_tasks_feedPage = function(param){
	if(typeof param === 'undefined'){ param = null; }
	var position = $('#app_layers_tasks');
	position.empty();
	if(app_content_menu.projects_id == Lincko.storage.getMyPlaceholder()['_id']){
		var items = Lincko.storage.list('tasks', null, true);
	} else {
		var items = Lincko.storage.list('tasks', null, { 'projects_id': app_content_menu.projects_id });
	}
	var item;
	var Elem;
	for(var i in items){
		item = items[i];
		Elem = $('#-models_tasks').clone();
		Elem.prop('id', 'models_tasks_'+item['_id']);
		Elem.find("[find=title]").html( php_nl2br(item['+title']) );
		Elem.find("[find=comment]").html( php_nl2br(item['-comment']) );
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

}

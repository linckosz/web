var app_layers = true;

var app_layers_changePage = function(menu, param){
	if(typeof param === 'undefined'){ param = null; }
	var timing = 150;
	var layer = $('#app_layers_content');
	if(!layer.html()){ timing = 0; }
	var Sequence = [
		{ e: layer, p: { opacity: 0, }, o: { duration: timing, } },
		{ e: layer, p: { opacity: 1, }, o: { duration: 50, sequenceQueue: true,
			begin: function(){
				app_layers_launchMenu(menu, param);
				wrapper_perfectScrollbar();
			},
		} },
	];
	$.Velocity.RunSequence(Sequence);
}


var app_layers_launchMenu = function(menu, param){
	if(typeof param === 'undefined'){ param = null; }
	var launch = [];
	var layer = $('#app_layers_content');
	layer.html('');
	menu = menu.toLowerCase();

	launch['error'] = function(restriction){
		layer.html('Page not found');
	};

	launch['dashboard'] = function(restriction){
		
	};

	launch['projects'] = function(){
		app_layers_projects_createPage(param);
	};

	launch['tasks'] = function(){
		app_layers_tasks_createPage(param);
	};

	launch['notes'] = function(){
		
	};

	launch['calendar'] = function(){
		
	};

	launch['statistics'] = function(){
		
	};

	launch['history'] = function(){
		app_layers_history_createPage(param);
	};

	if(typeof launch[menu] === 'function'){
		launch[menu]();
		return true;
	} else {
		launch['error']();
		return false;
	}

};
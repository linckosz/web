var app_layers = true;

var app_layers_cleanPage = function(category, conditions){console.log('category');
	if($.type(conditions) !== 'object'){ conditions = null; }
	var timing = 200;
	var layer = $('#app_layers_content');
	if(!layer.html()){ timing = 0; }
	var Sequence = [
		{ e: layer, p: { opacity: 0, }, o: { duration: timing, } },
		{ e: layer, p: { opacity: 1, }, o: { duration: 50, sequenceQueue: true,
			begin: function(){
				app_layers_feedPage(category, conditions);
			},
		} },
	];
	$.Velocity.RunSequence(Sequence);
}

var app_layers_feedPage = function(category, conditions){
	if(typeof category === 'string'){ category = category.toLowerCase(); }
	if($.type(conditions) !== 'object'){ conditions = null; }
	var layer = $('#app_layers_content');
	layer.html('');

	if(category === 'projects'){
		var items = Lincko.storage.list(category, null, conditions);
		var item;
		var tasks;
		if(!$.isEmptyObject(items)){
			for(i in items){
				item = items[i];
				tasks = Lincko.storage.list('tasks', null, { projects_id: item['_id'], });
				var Elem = $('#-app_layers_projects').clone();
				Elem.prop('id', 'app_layers_projects_'+item['_id']);
				Elem.find("[find=app_layers_projects_title]").html( php_nl2br(item['+title']) );
				Elem.find("[find=app_layers_projects_tasks]").html( 'tasks: '+tasks.length );
				Elem.click(function(){
					app_layers_cleanPage('tasks', { projects_id: item['_id'] });
				});
				Elem.appendTo(layer);
			}
		} else {
			layer.html('No project');
		}
	}

	else if(category === 'tasks'){
		var items = Lincko.storage.list(category, null, conditions);
		var item;
		if(!$.isEmptyObject(items)){
			for(i in items){
				item = items[i];
				var Elem = $('#-app_layers_tasks').clone();
				Elem.prop('id', 'app_layers_tasks_'+item['_id']);
				Elem.find("[find=app_layers_tasks_title]").html( php_nl2br(item['+title']) );
				Elem.find("[find=app_layers_tasks_comment]").html( php_nl2br(item['-comment']) );
				Elem.appendTo(layer);
			}
		} else {
			layer.html('No task');
		}
	}
}

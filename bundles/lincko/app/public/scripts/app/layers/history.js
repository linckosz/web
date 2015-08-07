/* Category ? */

function app_layers_history_createPage(param){
	if(typeof param === 'undefined'){ param = null; }
	var layer = $('#app_layers_content');
	var Elem = $('#-app_layers_history').clone();
	Elem.prop('id', 'app_layers_history');
	Elem.appendTo(layer);
	app_layers_history_feedPage(param);
	app_application_lincko.add("app_layers_history", "history", function(){
		app_layers_history_feedPage(null, false);
	});
}

var app_layers_history_feedPage = function(param){
	if(typeof param === 'undefined'){ param = null; }
	var position = $('#app_layers_history');
	position.html('');
	var items = Lincko.storage.time('recent');
	var history;
	var item;
	var Elem;
	for(var i in items){
		item = items[i];console.log(item);
		Elem = $('#-models_history').clone();
		Elem.prop('id', 'models_thistory_'+item['id']);
		history = Lincko.storage.getHistoryInfo(item);
		Elem.find("[find=title]").html( php_nl2br(history.title) );
		Elem.find("[find=content]").html( php_nl2br(history.content) );
		Elem.appendTo(position);
	}

}

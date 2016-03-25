/* Category ? */

function app_layers_history_launchPage(param){
	if(typeof param === 'undefined'){ param = null; }
	app_application_lincko.add("app_layers_history", null, function(){
		app_layers_history_feedPage();
	});
	app_layers_history_feedPage();
}

var app_layers_history_feedPage = function(param){
	if(typeof param === 'undefined'){ param = null; }
	var position = $('#app_layers_history');
	position.addClass('overthrow');
	position.empty();
	var items = Lincko.storage.time('recent');
	var history;
	var item;
	var Elem;
	for(var i in items){
		item = items[i];
		Elem = $('#-models_history').clone();
		Elem.prop('id', 'models_thistory_'+item['id']);
		history = Lincko.storage.getHistoryInfo(item);
		if(history.title===null){ continue; }
		// We don't need to use wrapper_to_html for 'history' because the text is already protected in history format method
		Elem.find("[find=title]").html( php_nl2br(history.title) );
		Elem.find("[find=content]").html( php_nl2br(history.content) );
		Elem.appendTo(position);
		Elem.click(function() {
			submenu_Build("test", true, false, null, true);
		});
	}

}

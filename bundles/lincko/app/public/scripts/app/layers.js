var app_layers = true;

var app_layers_changePage = function(menu, param){
	if(typeof param === 'undefined'){ param = null; }
	var timing = 150;
	var delay = 60;
	var layer = $('#app_layers_content');
	if(!layer.html()){ timing = 0; }
	var Sequence = [
		{ e: layer, p: { opacity: 0, }, o: { duration: timing, delay: delay, } },
		{ e: layer, p: { opacity: 1, }, o: { duration: 50, sequenceQueue: true,
			begin: function(){
				app_layers_launchMenu(menu, param);
				wrapper_IScroll();
			},
		} },
	];
	$.Velocity.RunSequence(Sequence);
}

var app_layers_launchMenu = function(menu, param){
	if(typeof param === 'undefined'){ param = null; }
	var layer = $('#app_layers_content');
	layer.empty();
	menu = menu.toLowerCase();

	if($('#-app_layers_'+menu).length>0) {
		var Elem = $('#-app_layers_'+menu).clone();
		Elem.prop('id', 'app_layers_'+menu);
		Elem.appendTo(layer);
		if(typeof window['app_layers_'+menu+'_launchPage'] === 'function'){
			window['app_layers_'+menu+'_launchPage'](param);
		}
		return true;
	} else {
		layer.html(Lincko.Translation.get('app', 42, 'html')); //Page not found
		return false;
	}

};

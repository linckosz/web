var app_models_notifier = {

	getViewed: function(type, id) {
		return Lincko.storage.list(null, null, {new: true}, type, id, false).length;
	},

	clearViewed: function(type, id) {
		var tmp = {};
		var items = Lincko.storage.list(null, null, {new: true}, type, id, false);
		if(items.length>0)
		{
			for(var i in items) {
				tmp[items[i]["_type"]+"_" + items[i]._id] = true;
			}			
			wrapper_sendAction(tmp, 'post','data/viewed', function() {
				app_application_lincko.prepare([type, type+"_"+id]);
			});
		}
	},

}

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
			wrapper_sendAction(tmp,'post','data/viewed', function() {
				app_application_lincko.prepare([type, type+"_"+id]);
			});
		}
	},	

	getNotification: function(type, id) {
		return Lincko.storage.hist(null, null, {not: true}, type, id, true, true, true).length;
	},

	clearNotification: function(type, id) {
		var tmp = {};
		var items = Lincko.storage.hist(null, null, {not: true}, type, id, true, true, true);
		if(items.length>0){
			for (var i in items){
				tmp[items[i]["type"]+"_"+items[i]["id"]] = true;
			}
			//toto => not clearing notifications some notifications?
			wrapper_sendAction(tmp, 'post', 'data/noticed', function() {
				app_application_lincko.prepare([type, type+"_"+id]);
			});
		}
	},

}

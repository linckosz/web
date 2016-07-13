var notifier = (
	function() {
		function getChatNotification(id) {
			var cnt = Lincko.storage.list(null,-1, {"new": true}, 'chats', id, false).length;
			return cnt;
		}

		function clearChatNotification(id) {
			var notifications = Lincko.storage.list(null, -1, {'new': true}, 'chats', id, false); //toto => clearing so many at a time on backend can crash the SQL 
			if(notifications.length>0)
			{
				for(var i in notifications) {
					var tmp = {};
					tmp[notifications[i]["_type"]+"_" + notifications[i]._id] = true;
				}			
				wrapper_sendAction(tmp,'post','data/viewed', function() {
					app_application_lincko.prepare("chats_"+id); //toto => sync loop
				});
			}
		}

		function getProjectNotification(id) {
			var cnt = Lincko.storage.hist(null, -1, {not: true}, 'projects', id, true).length;
			return cnt;
		}

		function clearProjectNotification(id) {
			var tmp = {};
			var children = Lincko.storage.hist(null, -1, {not: true}, 'projects', id, true); //toto => clearing so many at a time on backend can crash the SQL query
			if(children.length>0){
				for (var i in children)
				{
					tmp[children[i]["type"]+"_"+children[i]["id"]] = true;
				}
				//toto => not clearing notifications
				wrapper_sendAction(tmp, 'post', 'data/noticed', function() {
					app_application_lincko.prepare("history_"+id); //toto => sync loop
				});
			}
		}

		function getHistoryNotification(id) {
			var cnt = Lincko.storage.hist(null, -1, {not: true}, 'projects', id, true).length;
			return cnt;
		}

		function clearHistoryNotification(id) {
			var tmp = {};
			var children = Lincko.storage.hist(null, -1, {not: true}, 'projects', id, true); //toto => clearing so many at a time on backend can crash the SQL query
			if(children.length>0){
				for (var i in children)
				{
					tmp[children[i]["type"]+"_"+children[i]["id"]] = true;
				}
				//toto => not clearing notifications
				wrapper_sendAction(tmp, 'post', 'data/noticed', function() {
					app_application_lincko.prepare("history_"+id); //toto => sync loop
				});
			}
		}

		return {
			'chats': {
				'get': getChatNotification,
				'clear': clearChatNotification,
			},
			'projects': {
				'get': getProjectNotification,
				'clear': clearProjectNotification,
			},
			'history': {
				'get': getHistoryNotification,
				'clear': clearHistoryNotification,
			}
		};
	}
)();

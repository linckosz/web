var notifier = (
	function() {
		function getChatNotification(id) {
			var cnt = Lincko.storage.list('comments',-1, {"new": true}, 'chats', id, false).length;
			return cnt;
		}

		function clearChatNotification(id) {
			var comments = Lincko.storage.list('comments', -1, {'new': true}, 'chats', id, false);
			var tmp = {};
			for(var i in comments) {
				tmp["comments_" + comments[i]._id] = true;
			}
			wrapper_sendAction(tmp,'post','data/viewed', function() {
				app_application_lincko.prepare("chats_"+id);
			});
		}

		function getProjectNotification(id) {
			var cnt = Lincko.storage.hist(null, -1, {not: true}, 'projects', id, true).length;
			return cnt;
		}

		function clearProjectNotification(id) {
			var tmp = {};
			var children = Lincko.storage.hist(null, -1, {not: true}, 'projects', id, true);
			for (var i in children)
			{
				tmp[children[i]["type"]+"_"+children[i]["id"]] = true;
			}
			//toto => not clearing notifications
			wrapper_sendAction(tmp, 'post', 'data/noticed', function() {
				app_application_lincko.prepare("history_"+id);
			});
		}

		function getHistoryNotification(id) {
			var cnt = Lincko.storage.hist(null, -1, {not: true}, 'projects', id, true).length;
			return cnt;
		}

		function clearHistoryNotification(id) {
			var tmp = {};
			var children = Lincko.storage.hist(null, -1, {not: true}, 'projects', id, true);
			for (var i in children)
			{
				tmp[children[i]["type"]+"_"+children[i]["id"]] = true;
			}
			//toto => not clearing notifications
			wrapper_sendAction(tmp, 'post', 'data/noticed', function() {
				app_application_lincko.prepare("history_"+id);
			});
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

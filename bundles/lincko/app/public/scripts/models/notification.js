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
			tmp["projects_"+ id] = true;

			var children = Lincko.storage.tree('projects', id, 'children');
			for (var c_type in children)
			{
				for (var c_id in children[c_type])
				{
					var t_id = c_type + "_" + c_id;
					tmp[t_id] = true;
				}
			}
			wrapper_sendAction(tmp, 'post', 'data/noticed', function() {
				app_application_lincko.prepare("history_"+id);
			});
		}

		return {
			'chats': {
				'get': getChatNotification,
				'clear': clearChatNotification,
			},
			'history': {
				'get': getProjectNotification,
				'clear': clearProjectNotification,
			}
		};
	}
)();

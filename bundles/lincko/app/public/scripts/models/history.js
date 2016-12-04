var app_models_cache_history = {};

var app_models_history = {

	hist_root: {},
	hist_root_recent: [],
	notified: {},

	//Ready the worker for browsers that does not support native Notification
	serviceWorker: false,

	reset: function(){
		app_models_history.hist_root = {};
		app_models_history.hist_root_recent = [];
	},

	refresh: function(type, id){
		var parent = this.getRoot(type, id);
		if(parent){
			type = parent['_type'];
			id = parent['_id'];
			if(app_models_history.hist_root[type+'_'+id]){
				app_models_history.hist_root[type+'_'+id] = null;
				delete app_models_history.hist_root[type+'_'+id];
				app_models_history.hist_root_recent = [];
			}
		}
	},

	notify: function(message, title, link, timeout, icon){
		if(typeof title == "undefined"){ title = "Lincko"; }
		if(typeof link == "undefined"){ link = false; }
		if(typeof timeout == "undefined"){ timeout = 8; }
		if(typeof icon == "undefined"){ icon = "favicon.png"; }
		var options = {
			body: title,
			icon: icon,
			lang: app_language_short,
			vibrate: [200, 100, 200], //Work only on android webview
			timeout: timeout,
			notifyClick: function(event){
				event.preventDefault();
				if(link){
					window.location.href = top.location.protocol+'//'+document.linckoFront+document.linckoBack+document.domain+"/#"+link;
				}
				this.close();
			},
		};
		var notif = new Notify(
			message,
			options
		);
		try {
			notif.show();
		} catch(e) {
			if (app_models_history.serviceWorker) {
				app_models_history.serviceWorker.then(function (registration) {
					registration.showNotification(message, options);
				});
			} else {
				base_show_error(title+"\n"+message, false);
			}
		}
	},

	notification: function(items, lastvisit){
		if(typeof items == 'undefined'){ items = {}; }
		if(typeof lastvisit == 'undefined'){ lastvisit = Lincko.storage.getLastVisit(); }
		var hist;
		var item = false;
		var users;
		var parent;
		var title;
		var username;
		var msg;
		var sentence;
		if(lastvisit>0){

			//Grab Task notifications
			if(typeof items['tasks'] != 'undefined'){
				hist = Lincko.storage.hist('tasks', null, {not: true, by: ['!=', wrapper_localstorage.uid], timestamp: ['>', lastvisit]});
				//hist = Lincko.storage.hist('tasks', null, {timestamp: ['>', lastvisit]});  //For debugging only
				if(hist.length>0){
					for(var i in hist){
						//Avoid to double the same notification
						if(app_models_history.notified["tasks_"+hist[i]['id']+"_"+hist[i]['hist']]){
							continue;
						}
						app_models_history.notified["tasks_"+hist[i]['id']+"_"+hist[i]['hist']] = true;
						//Do not display if the project is silence
						users = Lincko.storage.get('projects', hist["par_id"], "_users");
						if(users && users[wrapper_localstorage.uid] && users[wrapper_localstorage.uid]["silence"]){
							continue;
						} else if(!users){
							continue;
						}
						item = Lincko.storage.get("tasks", hist[i]['id']);
						if(!item){
							continue;
						}
						users = item['_users'];
						if(users && users[wrapper_localstorage.uid] && (users[wrapper_localstorage.uid]["in_charge"] || users[wrapper_localstorage.uid]["approver"])){
							app_models_history.notify(
								wrapper_to_html(item["+title"]),
								Lincko.storage.getHistoryInfo(hist[i]).title,
								"tasks-"+hist[i]['id']
							);
						}
					}
				}
			}

			//Grab Messages notifications
			if(typeof items['messages'] != 'undefined'){
				hist = Lincko.storage.hist('messages', null, {att: 'created_at', by: ['!=', wrapper_localstorage.uid], timestamp: ['>', lastvisit]});
				//hist = Lincko.storage.hist('messages', null, {att: 'created_at', timestamp: ['>', lastvisit]}); //For debugging only
				if(hist.length>0){
					for(var i in hist){
						//Avoid to double the same notification
						if(app_models_history.notified["messages_"+hist[i]['id']+"_"+hist[i]['hist']]){
							continue;
						}
						app_models_history.notified["messages_"+hist[i]['id']+"_"+hist[i]['hist']] = true;
						//Do not display if the parent is silence
						users = false;
						parent = Lincko.storage.get(hist[i]["par_type"], hist[i]["par_id"]);
						if(parent){
							users = parent["_users"];
							if(users && users[wrapper_localstorage.uid] && users[wrapper_localstorage.uid]["silence"]){
								continue;
							} else if(!users){
								continue;
							}
						} else {
							continue;
						}
						item = Lincko.storage.get("messages", hist[i]['id']);
						if(!item){
							continue;
						}
						if(users && users[wrapper_localstorage.uid]){
							if(hist[i]['by']){
								username = Lincko.storage.get("users", hist[i]['by'], "username");
							} else {
								username = Lincko.Translation.get('app', 0, 'html'); //LinckoBot
							}
							if(parent["single"]){
								title = username;
								msg = wrapper_to_html(item["+comment"]);
							} else {
								title = wrapper_to_html(parent["+title"]);
								msg = username+": "+wrapper_to_html(item["+comment"]);
							}
							app_models_history.notify(
								title,
								msg,
								"messages-"+hist[i]['id']
							);
						}
					}
				}
			}

			//Grab Comments notifications
			if(typeof items['comments'] != 'undefined'){
				hist = Lincko.storage.hist('comments', null, {att: 'created_at', par_type: 'projects', by: ['!=', wrapper_localstorage.uid], timestamp: ['>', lastvisit]});
				//hist = Lincko.storage.hist('comments', null, {att: 'created_at', par_type: 'projects', timestamp: ['>', lastvisit]}); //For debugging only
				if(hist.length>0){
					for(var i in hist){
						//Avoid to double the same notification
						if(app_models_history.notified["comments_"+hist[i]['id']+"_"+hist[i]['hist']]){
							continue;
						}
						app_models_history.notified["comments_"+hist[i]['id']+"_"+hist[i]['hist']] = true;
						//Do not display if the parent is silence
						users = false;
						parent = Lincko.storage.get(hist[i]["par_type"], hist[i]["par_id"]);
						if(parent){
							users = parent["_users"];
							if(users && users[wrapper_localstorage.uid] && users[wrapper_localstorage.uid]["silence"]){
								continue;
							} else if(!users){
								continue;
							}
						} else {
							continue;
						}
						item = Lincko.storage.get("comments", hist[i]['id']);
						if(!item){
							continue;
						}
						if(users && users[wrapper_localstorage.uid]){
							sentence = $(app_models_resume_format_sentence(hist[i]['id'])).text();
							if(hist[i]['by']){
								username = Lincko.storage.get("users", hist[i]['by'], "username");
								msg = wrapper_to_html(username)+": "+sentence;
							} else {
								username = Lincko.Translation.get('app', 0, 'html'); //LinckoBot
								msg = sentence;
							}
							app_models_history.notify(
								wrapper_to_html(parent["+title"]),
								msg,
								"comments-"+hist[i]['id']
							);
						}
					}
				}
			}

			//Grab Files notifications
			if(typeof items['files'] != 'undefined'){
				hist = Lincko.storage.hist('files', null,
					[
						{att: 'created_at', par_type: 'chats', by: ['!=', wrapper_localstorage.uid], timestamp: ['>', lastvisit]},
						{att: 'created_at', par_type: 'projects', by: ['!=', wrapper_localstorage.uid], timestamp: ['>', lastvisit]},
					]
				);
				/*
				//For debugging only
				hist = Lincko.storage.hist('files', null,
					[
						{att: 'created_at', par_type: 'chats', by: ['==', wrapper_localstorage.uid], timestamp: ['>', lastvisit]},
						{att: 'created_at', par_type: 'projects', by: ['==', wrapper_localstorage.uid], timestamp: ['>', lastvisit]},
					]
				);
				*/
				if(hist.length>0){
					for(var i in hist){
						//Avoid to double the same notification
						if(app_models_history.notified["files_"+hist[i]['id']+"_"+hist[i]['hist']]){
							continue;
						}
						app_models_history.notified["files_"+hist[i]['id']+"_"+hist[i]['hist']] = true;
						//Do not display if the parent is silence
						users = false;
						parent = Lincko.storage.get(hist[i]["par_type"], hist[i]["par_id"]);
						if(parent){
							users = parent["_users"];
							if(users && users[wrapper_localstorage.uid] && users[wrapper_localstorage.uid]["silence"]){
								continue;
							} else if(!users){
								continue;
							}
						} else {
							continue;
						}
						item = Lincko.storage.get("files", hist[i]['id']);
						if(!item){
							continue;
						}
						if(users && users[wrapper_localstorage.uid]){
							app_models_history.notify(
								wrapper_to_html(parent["+title"]),
								Lincko.storage.getHistoryInfo(hist[i]).title
								+":\n  "+wrapper_to_html(item["+name"]),
								"files-"+hist[i]['id']
							);
						}
					}
				}
			}

			//Grab Users notifications
			var profile_pic;
			if(typeof items['users'] != 'undefined'){
				list = Lincko.storage.list('users', null, {_invitation: true, _id: ['!=', wrapper_localstorage.uid]});
				//list = Lincko.storage.list('users', null, {_invitation: false, _id: ['!=', wrapper_localstorage.uid]}); //For debugging only
				if(list.length>0){
					for(var i in list){
						//Avoid to double the same notification
						if(app_models_history.notified["users_"+list[i]['_id']+"_invitation"]){
							continue;
						}
						app_models_history.notified["users_"+list[i]['_id']+"_invitation"] = true;
						var profile_pic = Lincko.storage.getLinkThumbnail(list[i]['profile_pic']);
						if(!profile_pic){
							profile_pic = "favicon.png";
						}
						app_models_history.notify(
							Lincko.Translation.get('app', 72, 'html'), //You have an invitation request
							wrapper_to_html(list[i]["-username"]),
							"submenu-chat_list",
							20,
							profile_pic
						);
					}
				}
			}

		}
	},

	getList: function(limit, parent_type, parent_id){
		if(typeof limit != 'number' || limit<=0){ limit = false; }
		if(typeof parent_type == 'undefined'){ parent_type = false; }
		if(typeof parent_id == 'undefined'){ parent_id = false; }

		var histList = [];
		var item;

		if(app_models_history.hist_root_recent.length==0){
			app_models_history.tabList();
		}

		if(limit){
			for(var i in app_models_history.hist_root_recent){
				if(parent_type && parent_id && parent_type=="projects"){
					if(app_models_history.hist_root_recent[i]['root_type']==parent_type && app_models_history.hist_root_recent[i]['root_id']==parent_id){
						histList.push(app_models_history.hist_root_recent[i]);
					} else {
						//Check if the chat belongs to the project
						item = Lincko.storage.get(app_models_history.hist_root_recent[i]['root_type'], app_models_history.hist_root_recent[i]['root_id']);
						if(item && item['_parent'][0]==parent_type && item['_parent'][1]==parent_id){
							histList.push(app_models_history.hist_root_recent[i]);
						}
					}
				} else {
					histList.push(app_models_history.hist_root_recent[i]);
				}
				if(histList.length>=limit){
					break;
				}
			}
		} else {
			if(parent_type && parent_id && parent_type=="projects"){
				for(var i in app_models_history.hist_root_recent){
					if(app_models_history.hist_root_recent[i]['root_type']==parent_type && app_models_history.hist_root_recent[i]['root_id']==parent_id){
						histList.push(app_models_history.hist_root_recent[i]);
					} else {
						//Check if the chat belongs to the project
						item = Lincko.storage.get(app_models_history.hist_root_recent[i]['root_type'], app_models_history.hist_root_recent[i]['root_id']);
						if(item && item['_parent'][0]==parent_type && item['_parent'][1]==parent_id){
							histList.push(app_models_history.hist_root_recent[i]);
						}
					}
				}
			} else {
				histList = app_models_history.hist_root_recent;
			}
		}

		return histList;
	},

	//This return projects or chats item
	getRoot: function(type, id){
		if(type=="projects" || type=="chats"){
			return Lincko.storage.get(type, id);
		}
		var parent = Lincko.storage.getParent(type, id);
		while(parent){
			type = parent["_type"];
			id = parent["_id"];
			if(type=="projects" || type=="chats"){
				return parent;
			}
			parent = Lincko.storage.getParent(type, id);
		}
		return false;
	},

	tabList: function(limit, parent_type, parent_id){
		if(typeof limit != 'number' || limit<=0){ limit = false; }
		if(typeof parent_type == 'undefined'){ parent_type = false; }
		if(typeof parent_id == 'undefined'){ parent_id = false; }

		var histList = [];
		var hist_num = {};
		var item;
		var deleted_at;
		var root_item;
		var root_name;
		var name;
		var comment;
		var message;
		var content;
		var src;
		var perso;
		var user_icon = false;
		var date = new wrapper_date();
		var startOfDay = date.getDayStartTimestamp(); //timestamp of beginning of the day taking in account the timezone
		var reset_order = false; //At true we sort the list for faster operation to grab information
		var info = {};

		var exclude = false;
		if(parent_type && parent_id && parent_type=="projects"){
			//If parent is a project, .hist will reject automatically all chats activity inside it
			// "Lincko.storage.cache.getExcludeProjects" is internally used in .hist()
			var hist_all = Lincko.storage.hist(null, -1, null, parent_type, parent_id, true, true, false);
		} else {
			var hist_all = Lincko.storage.hist();
			exclude = Lincko.storage.cache.getExcludeChats();
		}

		for(var i in hist_all){
			root_item = this.getRoot(hist_all[i]["type"], hist_all[i]["id"]); //Accept only Chats and Projects
			root_name = root_item["_type"]+"_"+root_item["_id"];
			name = hist_all[i]["type"]+"_"+hist_all[i]["id"];
			if(root_item && typeof hist_num[root_name] == "undefined" && root_item['deleted_at']==null){
				if(root_item["_type"]=="projects" && !hist_all[i]["by"] && hist_all[i]["type"]=="comments"){
					comment = Lincko.storage.get('comments', hist_all[i]["id"], 'comment');
					if(comment=="" || comment=="100" || comment=="700"){
						//Exclude everything about chats inside project activity
						continue;
					}
				}

				//Skip recalled for projects
				if(root_item["_type"]=="projects" && hist_all[i]["type"]=="comments"){
					comment = Lincko.storage.get("comments", hist_all[i]["id"]);
					if(comment['recalled_by']){
						//We don't display recalled messages in activity short description
						continue;
					}
				}

				//Skip recalled for chats
				if(root_item["_type"]=="chats" && hist_all[i]["type"]=="messages"){
					message = Lincko.storage.get("messages", hist_all[i]["id"]);
					if(message['recalled_by']){
						//We don't display recalled messages in activity short description
						continue;
					}
				}

				//Skip deleted items for chats
				if(root_item["_type"]=="chats"){
					if(hist_all[i]["type"]=='chats'){
						if(hist_all[i]["cod"]!=101 || Lincko.storage.get("chats", hist_all[i]["id"], "single")){
							//We don't display in chats the chats itself (expect creation for shared group)
							continue;
						}
					}
					deleted_at = Lincko.storage.get(hist_all[i]["type"], hist_all[i]["id"], 'deleted_at');
					if(deleted_at){
						//We don't display deleted items in activity short description
						continue;
					}
				}
				
				if(exclude && exclude[hist_all[i]["type"]] && exclude[hist_all[i]["type"]][hist_all[i]["id"]]){
					//We exclude what we need to exclude
					continue;
				}

				if(app_models_history.hist_root[root_name] && app_models_history.hist_root[root_name].name == name && app_models_history.hist_root[root_name].timestamp == hist_all[i]["timestamp"]){
					date.setTime(app_models_history.hist_root[root_name].timestamp);
					if(hist_all[i]["timestamp"] < startOfDay){ //Previous date
						app_models_history.hist_root[root_name].date = date.display('date_very_short');
					} else {
						app_models_history.hist_root[root_name].date = date.display('time_short');
					}
					app_models_history.hist_root[root_name].notif = false;
					if(Lincko.storage.cache.getNotify(root_item["_type"], root_item["_id"])){
						app_models_history.hist_root[root_name].notif = true;
					}
				} else {
					reset_order = true;
					info[i] = {};
					info[i].name = name;
					info[i].type = hist_all[i]["type"];
					info[i].id = hist_all[i]["id"];
					info[i].root_type = root_item["_type"];
					info[i].root_id = root_item["_id"];
					info[i].by = false;

					info[i].notif = false;
					if(Lincko.storage.cache.getNotify(root_item["_type"], root_item["_id"])){
						info[i].notif = true;
					}

					if(root_item["_type"]=="projects" && root_item["_id"]==Lincko.storage.getMyPlaceholder()['_id']){
						info[i].title = Lincko.Translation.get('app', 2502, 'html'); //Personal Space
					} else {
						info[i].title = Lincko.storage.getPlus(root_item["_type"], root_item["_id"]);
					}

					info[i].picture = $('<span />');
					info[i].picture.attr('find', 'history_picture');
					if(root_item["_type"]=="projects"){
						info[i].picture.addClass('icon-projectActivity');
					} else if(root_item["single"]){
						if(root_item["_perm"][wrapper_localstorage.uid]){
							perso = Lincko.storage.get('users', wrapper_localstorage.uid);
							info[i].title = perso["-username"];
							src = Lincko.storage.getLinkThumbnail(perso['profile_pic']);
						}
						for(var j in root_item["_perm"]){
							if(j!=wrapper_localstorage.uid){
								perso = Lincko.storage.get('users', j);
								info[i].title = perso["-username"];
								src = Lincko.storage.getLinkThumbnail(perso['profile_pic']);
								if(j==0){
									src = app_application_icon_roboto.src;
								} else if(j==1){
									src = app_application_icon_monkeyking.src;
								}
								break;
							}
						}
						if(src){
							info[i].picture
								.css('background-image', 'url(' + src + ')')
								.addClass('models_history_profile_pic');
						} else {
							info[i].picture.addClass('icon-largerIndividual');
						}
					} else {
						//toto => use multi picture if group of users
						info[i].picture.addClass('icon-largerGroup');
					}

					info[i].timestamp = hist_all[i]["timestamp"];
					date.setTime(hist_all[i]["timestamp"]);
					if(hist_all[i]["timestamp"] < startOfDay){ //Previous date
						info[i].date = date.display('date_very_short');
					} else {
						info[i].date = date.display('time_short');
					}
					if(hist_all[i]["type"]=="comments"){
						if(hist_all[i]["by"]==0 || hist_all[i]["by"]==1){ //Projects
							var sentence = app_models_resume_format_sentence(hist_all[i]["id"]);
							if(sentence===false){
								//We don't display the message that the user is not concerned
								continue;
							}
							info[i].content = sentence.text();
						} else if(root_item["single"]){ //Single user to Single User
							comment = Lincko.storage.get("comments", hist_all[i]["id"]);
							if(comment['recalled_by']){
								var uname = wrapper_to_html(Lincko.storage.get('users', hist_all[i]["by"])['-username']);
								info[i].content = Lincko.Translation.get('app', 3101, 'html', {username: uname }); //has recalled a message
							} else {
								info[i].content = comment['+comment'];
							}
						} else { //Chats and Projects
							comment = Lincko.storage.get("comments", hist_all[i]["id"]);
							if(comment['recalled_by']){
								var uname = wrapper_to_html(Lincko.storage.get('users', hist_all[i]["by"])['-username']);
								info[i].content = Lincko.Translation.get('app', 3101, 'html', {username: uname }); //has recalled a message
							} else {
								if(hist_all[i]['par_type']=='projects'){
									info[i].by = hist_all[i]["by"];
									info[i].content = comment['+comment'];
								} else {
									var hist_info = Lincko.storage.getHistoryInfo(hist_all[i]);
									if(hist_info.content===false){
										//We don't display the message that the user is not concerned
										continue;
									}
									if(root_item["_type"]=="projects"){
										info[i].content = hist_info.title;
									} else {
										info[i].by = hist_all[i]["by"];
										info[i].content = hist_info.content;
									}
								}
							}
						}
						//For user answers, convert object to test
						info[i].content = app_models_resume_format_answer(info[i].content);
					} else if(hist_all[i]["type"]=="messages"){
						if(root_item["single"]){ //Single user to Single User
							message = Lincko.storage.get("messages", hist_all[i]["id"]);
							if(message['recalled_by']){
								var uname = wrapper_to_html(Lincko.storage.get('users', hist_all[i]["by"])['-username']);
								info[i].content = Lincko.Translation.get('app', 3101, 'html', {username: uname }); //has recalled a message
							} else {
								info[i].content = message['+comment'];
							}
						} else { //Chats and Projects
							message = Lincko.storage.get("messages", hist_all[i]["id"]);
							if(message['recalled_by']){
								var uname = wrapper_to_html(Lincko.storage.get('users', hist_all[i]["by"])['-username']);
								info[i].content = Lincko.Translation.get('app', 3101, 'html', {username: uname }); //has recalled a message
							} else {
								var hist_info = Lincko.storage.getHistoryInfo(hist_all[i]);
								if(hist_info.content===false){
									//We don't display the message that the user is not concerned
									continue;
								}
								info[i].by = hist_all[i]["by"];
								info[i].content = hist_info.content;
							}
						}
					} else {
						var hist_info = Lincko.storage.getHistoryInfo(hist_all[i]);
						if(hist_info.content===false){
							//We don't display the message that the user is not concerned
							continue;
						}
						info[i].content = hist_info.title;
					}

					app_models_history.hist_root[root_name] = info[i];
				}
				hist_num[root_name] = true;
				//Accept only not deleted items
				if(root_item["deleted_at"]==null){
					histList.push(app_models_history.hist_root[root_name]);
					if(limit && histList.length>=limit){
						break;
					}
				}
			}
		}

		if(app_models_history.hist_root_recent.length==0 || reset_order){
			//This is stored as an array
			app_models_history.hist_root_recent = Lincko.storage.sort_items(app_models_history.hist_root, 'timestamp', 0 , -1, false);
		}

		return histList;
	},
};

if('serviceWorker' in navigator) {
	app_models_history.serviceWorker = navigator.serviceWorker.register('/scripts/libs/sw.js');
}

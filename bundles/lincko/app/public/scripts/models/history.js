//Category 41
var app_models_cache_history = {};

var app_models_history = {

	hist_root: {},
	hist_root_recent: [],
	notified: {},
	first_check_invitation: true,
	list_reset: {},

	//Ready the worker for browsers that does not support native Notification
	serviceWorker: false,

	reset: function(){
		app_models_history.hist_root = {};
		app_models_history.hist_root_recent = [];
		app_models_history.list_reset = {};
	},

	refresh: function(type, id){
		var parent = this.getRoot(type, id);
		if(parent){
			type = parent['_type'];
			id = parent['_id'];
			if(app_models_history.hist_root[type+'_'+id]){
				app_models_history.hist_root[type+'_'+id] = null;
				delete app_models_history.hist_root[type+'_'+id];
			}
			app_models_history.list_reset[type+'_'+id] = true;
		}
	},

	notify: function(message, title, link, timeout, icon){
		if(typeof title == "undefined"){ title = "Lincko"; }
		if(typeof link == "undefined"){ link = false; }
		if(typeof timeout == "undefined" || !timeout){ timeout = 12; }
		if(typeof icon == "undefined" || !icon){ icon = "favicon.png"; }
		if(typeof message == 'string' || typeof message == 'number'){
			message = $('<div>'+message+'</div>').text();
		} else {
			message = message.text();
		}
		if(typeof title == 'string' || typeof title == 'number'){
			title = $('<div>'+title+'</div>').text();
		} else {
			title = title.text();
		}
		if(isMobileApp()){
			var device = device_type();
			var obj = {
				action: 'notification',
				title: title,
				content: message,
				url: top.location.protocol+'//'+document.linckoFront+document.linckoBack+document.domain+"/#"+link,
				reddot: Lincko.storage.cache.notify_total + 1,
			}
			if(device=='ios'){
				window.webkit.messageHandlers.iOS.postMessage(obj);
			} else if(device=='android' && typeof android.notification == 'function'){
				android.notification(obj.title, obj.content, obj.url, obj.reddot);
			}
		} else {
			var options = {
				body: message,
				icon: icon,
				lang: app_language_short,
				vibrate: [200, 100, 200], //Work only on android webview
				timeout: timeout,
				notifyClick: function(event){
					event.preventDefault();
					if(link){
						window.location.href = top.location.protocol+'//'+document.linckoFront+document.linckoBack+document.domain+"/#"+link;
						window.focus();
					}
					this.close();
				},
			};
			var notif = new Notify(
				title,
				options
			);
			try {
				notif.show();
			} catch(e) {
				if (app_models_history.serviceWorker) {
					app_models_history.serviceWorker.then(function (registration) {
						registration.showNotification(title, options);
					});
				} else {
					base_show_error(title+"\n"+message, false);
				}
			}
		}
	},

	notification: function(items, lastvisit){
		//Skip notification if inside an app because we do mobile push
		if(useMobileNotification()){
			Lincko.storage.iosHideNotif.set(false);
			return true;
		}
		if(typeof items == 'undefined'){ items = {}; }
		if(typeof lastvisit == 'undefined'){ lastvisit = Lincko.storage.getLastVisit(); }
		var hist;
		var list;
		var item = false;
		var users;
		var parent;
		var task;
		var title;
		var username;
		var msg;
		var sentence;
		var keep;
		if(lastvisit>0){
			//Grab Task notifications
			if(typeof items['tasks'] != 'undefined'){
				hist = Lincko.storage.hist('tasks', null, {by: ['!=', wrapper_localstorage.uid], timestamp: ['>', lastvisit]});
				//hist = Lincko.storage.hist('tasks', null, {timestamp: ['>', lastvisit]});  //For debugging only
				if(hist.length>0){
					for(var i in hist){
						//Avoid to double the same notification
						if(app_models_history.notified["tasks_"+hist[i]['id']+"_"+hist[i]['hist']]){
							continue;
						}
						app_models_history.notified["tasks_"+hist[i]['id']+"_"+hist[i]['hist']] = true;
						//Do not display if the project is silence
						users = Lincko.storage.get('projects', hist[i]["par_id"], "_users");
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
						if(
							   users
							&& users[wrapper_localstorage.uid]
							&& (
								   users[wrapper_localstorage.uid]["in_charge"]
								|| users[wrapper_localstorage.uid]["approver"]
								//|| item['created_by'] == wrapper_localstorage.uid
								|| (
									hist[i]['par'] && hist[i]['par']['pvid'] && hist[i]['par']['pvid'] == wrapper_localstorage.uid && (hist[i]['cod'] == 551 || hist[i]['cod'] == 552)
								)
							)
						){
							if(hist[i]['par'] && hist[i]['par']['pvid'] && hist[i]['par']['pvid'] != wrapper_localstorage.uid && (hist[i]['cod'] == 551 || hist[i]['cod'] == 552)){
								continue;
							}
							app_models_history.notify(
								Lincko.storage.getHistoryInfo(hist[i]).title,
								wrapper_to_html(item["+title"]),
								"tasks-"+btoa(hist[i]['id'])
							);
						}
					}
				}
			}

			//Grab Task notifications
			if(typeof items['projects'] != 'undefined'){
				hist = Lincko.storage.hist('projects', null, {by: ['!=', wrapper_localstorage.uid], timestamp: ['>', lastvisit]});
				//hist = Lincko.storage.hist('tasks', null, {timestamp: ['>', lastvisit]});  //For debugging only
				if(hist.length>0){
					for(var i in hist){
						//Avoid to double the same notification
						if(app_models_history.notified["projects_"+hist[i]['id']+"_"+hist[i]['hist']]){
							continue;
						}
						app_models_history.notified["projects_"+hist[i]['id']+"_"+hist[i]['hist']] = true;
						//Only display about moving tasks
						if(hist[i]['cod']!=405 && hist[i]['cod']!=406){
							continue;
						}
						//Do not display if the project is silence
						users = Lincko.storage.get('projects', hist[i]["id"], "_users");
						if(users && users[wrapper_localstorage.uid] && users[wrapper_localstorage.uid]["silence"]){
							continue;
						} else if(!users){
							continue;
						}
						item = Lincko.storage.get("projects", hist[i]['id']);
						if(!item){
							continue;
						}
						users = item['_users'];
						target = "projects-"+btoa(hist[i]['id']);
						if(hist[i]["par"] && hist[i]["par"]["tid"] && Lincko.storage.get("tasks", hist[i]["par"]["tid"])){
							target = "tasks-"+btoa(hist[i]["par"]["tid"]);
						}
						if(users && users[wrapper_localstorage.uid]){
							app_models_history.notify(
								Lincko.storage.getHistoryInfo(hist[i]).title,
								wrapper_to_html(item["+title"]),
								target
							);
						}
					}
				}
			}

			/*
			//Grab Messages notifications (by hist)
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
						if(parent && parent["_type"]=="chats"){
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
								var profile_pic = Lincko.storage.getLinkThumbnail(Lincko.storage.get("users", hist[i]['by'], "profile_pic"));
								if(hist[i]['by']==0){
									profile_pic = app_application_icon_roboto.src;
								} else if(hist[i]['by']==1){
									profile_pic = app_application_icon_monkeyking.src;
								}
							} else {
								title = wrapper_to_html(parent["+title"]);
								msg = username+": "+wrapper_to_html(item["+comment"]);
							}
							app_models_history.notify(
								msg,
								title,
								"messages-"+btoa(hist[i]['id'])
							);
						}
					}
				}
			}
			*/

			//Grab Messages notifications (by list)
			if(typeof items['messages'] != 'undefined'){
				list = Lincko.storage.list('messages', null, {created_by: ['!=', wrapper_localstorage.uid], created_at: ['>', lastvisit]});
				//list = Lincko.storage.list('messages', null, {created_at: ['>', lastvisit]}); //For debugging only
				if(list.length>0){
					for(var i in list){
						//Avoid to double the same notification
						if(app_models_history.notified["messages_"+list[i]['_id']]){
							continue;
						}
						app_models_history.notified["messages_"+list[i]['_id']] = true;
						//Do not display if the parent is silence
						users = false;
						parent = Lincko.storage.getParent(list[i]["_type"], list[i]["_id"]);
						if(parent && parent["_type"]=="chats"){
							users = parent["_users"];
							if(users && users[wrapper_localstorage.uid] && users[wrapper_localstorage.uid]["silence"]){
								continue;
							} else if(!users){
								continue;
							}
						} else {
							continue;
						}
						item = Lincko.storage.get(list[i]["_type"], list[i]["_id"]);
						if(!item){
							continue;
						}
						if(users && users[wrapper_localstorage.uid]){
							if(item['created_by']){
								username = Lincko.storage.get("users", item['created_by'], "username");
							} else {
								username = Lincko.Translation.get('app', 0, 'html'); //LinckoBot
							}
							if(parent["single"]){
								title = username;
								msg = wrapper_to_html(item["+comment"]);
								var profile_pic = Lincko.storage.getLinkThumbnail(Lincko.storage.get("users", item['created_by'], "profile_pic"));
								if(item['created_by']==0){
									profile_pic = app_application_icon_roboto.src;
								} else if(item['created_by']==1){
									profile_pic = app_application_icon_monkeyking.src;
								}
							} else {
								title = wrapper_to_html(parent["+title"]);
								msg = username+": "+wrapper_to_html(item["+comment"]);
							}
							app_models_history.notify(
								msg,
								title,
								"messages-"+btoa(list[i]['_id'])
							);
						}
					}
				}
			}

			//Grab Comments notifications
			var resume = false; //Avoid too many LinckoBot resumes to be displayed at a time
			if(typeof items['comments'] != 'undefined'){
				hist = Lincko.storage.hist('comments', null, {att: 'created_at', par_type: ['in', ['projects', 'comments', 'tasks']], by: ['!=', wrapper_localstorage.uid], timestamp: ['>', lastvisit]});
				//hist = Lincko.storage.hist('comments', null, {att: 'created_at', par_type: 'projects', timestamp: ['>', lastvisit]}); //For debugging only
				/*
				hist = Lincko.storage.hist('comments', null, 
					[
						{att: 'created_at', par_type: ['in', ['projects', 'comments', 'tasks']], by: ['!=', wrapper_localstorage.uid], timestamp: ['>', lastvisit]},
						{att: 'created_at', par_type: ['in', ['projects', 'comments', 'tasks']], by: 0}
					]
				);
				*/
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
						var project_id = Lincko.storage.isProjectActivity('comments', hist[i]['id']);
						var project = false;
						if(project_id){
							var project = Lincko.storage.get('projects', project_id);
						}
						if(project){
							users = project["_users"];
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
						var profile_pic = null;
						if(users && users[wrapper_localstorage.uid]){
							msg = '';
							if(hist[i]['by']){
								username = wrapper_to_html(Lincko.storage.get("users", hist[i]['by'], "username"));
								title = username;
								/*
								//We don't need to show picture for comments
								if(hist[i]['by']==1){
									profile_pic = app_application_icon_monkeyking.src;
								} else {
									var temp_pic = Lincko.storage.getLinkThumbnail(Lincko.storage.get("users", hist[i]['by'], "profile_pic"));
									if(temp_pic){
										profile_pic = temp_pic;
									}
								} 
								*/
								if($.inArray(hist[i]['cod'], [202, 203, 298, 299]) < 0){
									msg = username+": "+item['+comment'];
								} else {
									sentence = app_models_resume_format_sentence(hist[i]['id']);
									if(typeof sentence == 'string' || typeof sentence == 'number'){
										sentence = $('<div>'+sentence+'</div>').text();
									} else {
										sentence = sentence.text();
									}
									msg = username+": "+sentence;
								}
								//Any comment on projects itself => no restriction
								if(parent["_type"]=='projects'){
									title = wrapper_to_html(parent["+title"]);
								}
								//Any comment on a task assigned or in_charge
								else if(parent["_type"]=='tasks'){
									title = wrapper_to_html(parent["+title"]);
									task = Lincko.storage.get('tasks', parent["_id"]);
									users = task['_users'];
									if(users && users[wrapper_localstorage.uid] && (users[wrapper_localstorage.uid]["in_charge"] || users[wrapper_localstorage.uid]["approver"])){
										//Do nothing to make sure we keep the comment
									} else {
										continue;
									}
								}
								//Any reply on a comment
								else if(parent["_type"]=='comments'){
									keep = false;
									var k = 1000;
									while(k>0 && !keep && parent["_type"]=='comments'){
										k--; //Make sur we don't go inside an infnte loop
										if(parent["created_by"]==wrapper_localstorage.uid){
											keep = true;
										}
										parent = Lincko.storage.getParent(parent["_type"], parent["_id"]);
										if(parent["_type"]=='tasks'){
											title = wrapper_to_html(parent["+title"]);
											msg = username+": "+item['+comment'];
											task = Lincko.storage.get('tasks', parent["_id"]);
											users = task['_users'];
											if(users && users[wrapper_localstorage.uid] && (users[wrapper_localstorage.uid]["in_charge"] || users[wrapper_localstorage.uid]["approver"])){
												keep = true;
											} else {
												continue;
											}
										} else if(parent["_type"]=='projects'){
											title = wrapper_to_html(parent["+title"]);
											msg = username+": "+item['+comment'];
										}
									}
									if(!keep){
										continue;
									}
								}
							} else { //LinckoBot
								if(resume){
									continue; //We already send it once
								}
								if(item['+comment'].indexOf('{"0":{')!==0 && item['+comment'].indexOf('"'+wrapper_localstorage.uid+'":{')){
									continue;
								}

								profile_pic = app_application_icon_roboto.src;

								msg = false;
								if(item['+comment'].indexOf('{"'+wrapper_localstorage.uid+'":{"700":')===0){ //weekly individual
									//What a week! Check out what you did last week and what next week has in store. But don't forget to enjoy the weekend!
									msg = wrapper_to_html(Lincko.Translation.get('app', 4104, 'html'));
								} else if(item['+comment'].indexOf('{"'+wrapper_localstorage.uid+'":{"100":')===0){ //daily individual
									//Want to see what you did today and what's coming tomorrow. Your daily update from the LinckoBot has arrived.
									msg = wrapper_to_html(Lincko.Translation.get('app', 4103, 'html'));
								} else if(item['+comment'].indexOf('{"0":{"700":')===0){ //weekly team
									//Your weekly progress update is here! See how the team did last week and what's coming this week.
									msg = wrapper_to_html(Lincko.Translation.get('app', 4102, 'html'));
								} else if(item['+comment'].indexOf('{"0":{"100":')===0){ //daily team
									//Check out the daily team progress! Your Project Activity summaries have arrived. Go team!
									msg = wrapper_to_html(Lincko.Translation.get('app', 4101, 'html'));
								}

								if(msg){
									resume = true;
								} else {
									continue; //Skip because not concerned
								}

								username = wrapper_to_html(Lincko.Translation.get('app', 0, 'html')); //LinckoBot
								title = username;

								/*
								//This give the resume text, but it's not valuable
								msg = app_models_resume_format_sentence(hist[i]['id']);
								if(typeof msg == 'string' || typeof msg == 'number'){
									msg = $('<div>'+msg+'</div>').text();
								} else {
									msg = msg.text();
								}
								*/
							}
							app_models_history.notify(
								msg,
								title,
								"comments-"+btoa(hist[i]['id']),
								false,
								profile_pic
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
						//{att: 'created_at', par_type: 'projects', by: ['==', wrapper_localstorage.uid], timestamp: ['>', lastvisit]},
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
							title = wrapper_to_html(parent["+title"]);
							profile_pic = null;
							if(parent["single"]){
								for(var j in parent["_perm"]){
									if(j!=wrapper_localstorage.uid){
										perso = Lincko.storage.get('users', j);
										title = wrapper_to_html(perso["-username"]);
										profile_pic = Lincko.storage.getLinkThumbnail(perso['profile_pic']);
										if(j==0){
											profile_pic = app_application_icon_roboto.src;
										} else if(j==1){
											profile_pic = app_application_icon_monkeyking.src;
										}
										break;
									}
								}
							}
							app_models_history.notify(
								Lincko.storage.getHistoryInfo(hist[i]).title + ":\n  "+wrapper_to_html(item["+name"]),
								title,
								"files-"+btoa(hist[i]['id']),
								false,
								profile_pic
							);
						}
					}
				}
			}

			//Grab Users notifications
			var profile_pic;
			if(app_models_history.first_check_invitation || typeof items['users'] != 'undefined'){
				if(!wrapper_localstorage.workspace){ //Only available in shared workspace
					//Invitation request
					app_models_history.first_check_invitation = false;
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
								wrapper_to_html(list[i]["-username"]),
								Lincko.Translation.get('app', 72, 'html'), //You have an invitation request
								"submenu-"+btoa("chat_list%false%false%true"),
								24,
								profile_pic
							);
						}
					}
				}
				if(!wrapper_localstorage.workspace){//Only available in shared workspace
					//Invitation accepted
					hist = Lincko.storage.hist('users', null, {cod: 697, by: ['!=', wrapper_localstorage.uid], timestamp: ['>', lastvisit]});
					//hist = Lincko.storage.hist('users', null, {cod: 697, by: ['!=', wrapper_localstorage.uid]}); //For debugging only
					if(hist.length>0){
						for(var i in hist){
							//Avoid to double the same notification
							if(app_models_history.notified["users_"+hist[i]['id']+"_"+hist[i]['hist']]){
								continue;
							}
							app_models_history.notified["users_"+hist[i]['id']+"_"+hist[i]['hist']] = true;
							item = Lincko.storage.get("users", hist[i]['id']);
							if(
								   !item
								|| !item['_visible']
								|| typeof hist[i]['par'] == "undefined"
								|| typeof hist[i]['par']['pvid'] == "undefined"
								|| hist[i]['par']['pvid'] != wrapper_localstorage.uid
							){
								continue;
							}
							var profile_pic = Lincko.storage.getLinkThumbnail(item['profile_pic']);
							if(!profile_pic){
								profile_pic = "favicon.png";
							}
							if(hist[i]['by']==0){
								profile_pic = app_application_icon_roboto.src;
							} else if(hist[i]['by']==1){
								profile_pic = app_application_icon_monkeyking.src;
							}
							app_models_history.notify(
								wrapper_to_html(item["-username"]),
								Lincko.Translation.get('app', 79, 'html'), //Invitation accepted
								"submenu-"+btoa("chat_list%false%false%true"),
								24,
								profile_pic
							);
						}
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
		} else {
			for(var i in app_models_history.list_reset){
				app_models_history.tabList(limit, parent_type, parent_id);
				delete app_models_history.list_reset[parent_type+"_"+parent_id];
			}
		}

		if(limit){
			for(var i in app_models_history.hist_root_recent){
				if(parent_type && parent_id && (parent_type=="projects" || parent_type=="chats")){
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
			if(parent_type && parent_id && (parent_type=="projects" || parent_type=="chats")){
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

	validHist: function(root_item, item, hist){
		if(root_item["_type"]=="projects" && !hist["by"] && item["_type"]=="comments"){
			comment = item['+comment'];
			if(comment==""){
				//Exclude every empty comments
				return false;
			}
		}
		//Skip recalled for projects
		if(root_item["_type"]=="projects" && item["_type"]=="comments"){
			if(item['recalled_by']){
				//We don't display recalled messages in activity short description
				return false;
			}
		}

		//Skip recalled for chats
		if(root_item["_type"]=="chats" && item["_type"]=="messages"){
			if(item['recalled_by']){
				//We don't display recalled messages in activity short description
				return false;
			}
		}

		//Skip deleted items for chats
		if(root_item["_type"]=="chats"){
			if(item["_type"]=='chats'){
				if(hist["cod"]!=101 || item['single']){
					//We don't display in chats the chats itself (expect creation for shared group)
					return false;
				}
			}
			if(item['deleted_at']){
				//We don't display deleted items in activity short description
				if(item['_type'] != "files")
				{
					return false;
				}
				else{
					hist["cod"] = 999;
				}

			}
		}

		//Skip useless resume
		if(item["_type"]=="comments"){
			if(hist["by"]==0 || hist["by"]==1){ //Projects
				var sentence = app_models_resume_format_sentence(hist["id"]);
				if(sentence===false){
					//We don't display the message that the user is not concerned
					return false;
				}
			}
		}

		return true;
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
		var reset_order_obj = {}; //A list a item to reorder
		var info = {};
		var parent_name = false;

		var exclude = false;


		if(parent_type && parent_id && parent_type=="projects"){
			//If parent is a project, .hist will reject automatically all chats activity inside it
			// "Lincko.storage.cache.getExcludeProjects" is internally used in .hist()
			var hist_all = Lincko.storage.hist(null, -1, null, parent_type, parent_id, true, true, false);
			parent_name = parent_type+"_"+parent_id;
		} else {
			if(parent_type && parent_id){
				var hist_all = Lincko.storage.hist(null, -1, null, parent_type, parent_id, true, true, false);
				parent_name = parent_type+"_"+parent_id;
			} else {
				var hist_all = Lincko.storage.hist();
			}
			exclude = Lincko.storage.cache.getExcludeChats();
		}

		for(var i in hist_all){
			root_item = this.getRoot(hist_all[i]["type"], hist_all[i]["id"]); //Accept only Chats and Projects
			root_name = root_item["_type"]+"_"+root_item["_id"];
			name = hist_all[i]["type"]+"_"+hist_all[i]["id"];
			

			if(parent_name && root_name!=parent_name){
				continue;
			}
			
			if(root_item && typeof hist_num[root_name] == "undefined" && root_item['deleted_at']==null){
				item = Lincko.storage.get(hist_all[i]["type"], hist_all[i]["id"]);
				if(!this.validHist(root_item, item, hist_all[i])){
					//We skip some
					continue;
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
					reset_order_obj[root_name] = true;
					info[i] = {};
					info[i].name = name;
					info[i].type = hist_all[i]["type"];
					info[i].id = hist_all[i]["id"];
					info[i].root_type = root_item["_type"];
					info[i].root_id = root_item["_id"];
					info[i].by = false;
					info[i].root_created_at = root_item["created_at"];

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
						var add_circle = true;
						for(var j in root_item["_perm"]){
							if(j!=wrapper_localstorage.uid){
								perso = Lincko.storage.get('users', j);
								info[i].title = perso["-username"];
								src = Lincko.storage.getLinkThumbnail(perso['profile_pic']);
								if(j==0){
									src = app_application_icon_roboto.src;
									add_circle = false;
								} else if(j==1){
									src = app_application_icon_monkeyking.src;
								}
								break;
							}
						}
						if(src){
							info[i].picture.css('background-image', 'url(' + src + ')');
							if(add_circle){
								info[i].picture.addClass('models_history_profile_pic');
							}
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
								info[i].content = ''; //thanks to validHist, we should never reach it
							}
							if(typeof sentence == 'string' || typeof sentence == 'number'){
								info[i].content = $('<div>'+sentence+'</div>').text();
							} else {
								info[i].content = sentence.text();
							}
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
										info[i].content = ''; //This should not happen
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
									info[i].content = ''; //This should not happen
								}
								info[i].by = hist_all[i]["by"];
								info[i].content = hist_info.content;
							}
						}
					} else {
						var hist_info = Lincko.storage.getHistoryInfo(hist_all[i]);
						if(hist_info.content===false){
							info[i].content = ''; //This should not happen
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

		if(app_models_history.hist_root_recent.length==0 && !limit){
			//This is stored as an array
			app_models_history.hist_root_recent = Lincko.storage.sort_items(app_models_history.hist_root, 'timestamp', 0 , -1, false);
		} else if(reset_order && app_models_history.hist_root_recent.length>0){
			for(var j in app_models_history.hist_root_recent){
				root_name = app_models_history.hist_root_recent[j]["root_type"]+"_"+app_models_history.hist_root_recent[j]["root_id"];
				if(reset_order_obj[root_name]){
					delete app_models_history.hist_root_recent[j];
				}
				if(app_models_history.hist_root[root_name]){
					app_models_history.hist_root_recent[j] = app_models_history.hist_root[root_name];
				}
			}
			app_models_history.hist_root_recent = Lincko.storage.sort_items(app_models_history.hist_root_recent, 'timestamp', 0 , -1, false);
		}

		return histList;
	},
};

if('serviceWorker' in navigator) {
	app_models_history.serviceWorker = navigator.serviceWorker.register('/scripts/libs/sw.js');
}

var app_models_history_garbage = app_application_garbage.add();
app_application_lincko.add(app_models_history_garbage, 'first_launch', function() {
	app_models_history.notification()
	app_application_garbage.remove(app_models_history_garbage);
});

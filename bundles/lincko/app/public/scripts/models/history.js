var app_models_cache_history = {};

var app_models_history = {

	hist_root: {},
	hist_root_recent: [],

	reset: function(){
		app_models_history.hist_root = {};
		app_models_history.hist_root_recent = [];
	},

	refresh: function(type, id){
		if(app_models_history.hist_root[type+'_'+id]){
			app_models_history.hist_root[type+'_'+id] = null;
			delete app_models_history.hist_root[type+'_'+id];
			app_models_history.hist_root_recent = [];
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

		//This return projects or chats item
		var getRoot = function(type, id){
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
		};

		for(var i in hist_all){
			root_item = getRoot(hist_all[i]["type"], hist_all[i]["id"]); //Accept only Chats and Projects
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
						//We don't display in chats the chats itself
						continue;
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

		if(reset_order){
			//This is stored as an array
			app_models_history.hist_root_recent = Lincko.storage.sort_items(app_models_history.hist_root, 'timestamp',0 , -1, false);
		}

		return histList;
	},
};


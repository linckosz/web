var app_models_history = {

	hist_root: {},

	tabList: function(limit, parent_type, parent_id){
		if(typeof limit != 'number' || limit<=0){ limit = false; }
		if(typeof parent_type == 'undefined'){ parent_type = false; }
		if(typeof parent_id == 'undefined'){ parent_id = false; }
		
		var exclude = false;
		if(parent_type && parent_id){
			//If parent is a project, .hist will reject all chats activity inside it
			var hist_all = Lincko.storage.hist(null, -1, null, parent_type, parent_id, true, true, false);
		} else {
			var hist_all = Lincko.storage.hist();
			exclude = Lincko.storage.itemsNotInProjectActivity();
		}
		
		var histList = [];
		var hist_num = {};
		var item;
		var root_item;
		var root_name;
		var name;
		var comment;
		var content;
		var src;
		var perso;
		var user_icon = false;
		var date = new wrapper_date();
		var startOfDay = date.getDayStartTimestamp(); //timestamp of beginning of the day taking in account the timezone

		var info = {};

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
			if(root_item && typeof hist_num[root_name] == "undefined"){
				if(root_item["_type"]=="projects" && exclude && exclude[hist_all[i]["type"]] && exclude[hist_all[i]["id"]]){
					//Exclude everything about chats inside project activity
					continue;
				}
				if(root_item["_type"]=="projects" && !hist_all[i]["by"] && hist_all[i]["type"]=="comments"){
					comment = Lincko.storage.get('comments', hist_all[i]["id"], 'comment');
					if(comment=="" || comment=="100" || comment=="700"){
						//Exclude everything about chats inside project activity
						continue;
					}
				}
				if(app_models_history.hist_root[root_name] && app_models_history.hist_root[root_name].name == name && app_models_history.hist_root[root_name].timestamp == hist_all[i]["timestamp"]){
					date.setTime(app_models_history.hist_root[root_name].timestamp);
					if(hist_all[i]["timestamp"] < startOfDay){ //Previous date
						app_models_history.hist_root[root_name].date = date.display('date_very_short');
					} else {
						app_models_history.hist_root[root_name].date = date.display('time_short');
					}
					app_models_history.hist_root[root_name].notif = false;
					if(Lincko.storage.hist(null, 1, {not: true}, root_item["_type"], root_item["_id"], true).length > 0){
						app_models_history.hist_root[root_name].notif = true;
					}
				} else {
					info[i] = {};
					info[i].name = name;
					info[i].type = hist_all[i]["type"];
					info[i].id = hist_all[i]["id"];
					info[i].root_type = root_item["_type"];
					info[i].root_id = root_item["_id"];
					info[i].by = false;

					info[i].notif = false;
					if(Lincko.storage.hist(null, 1, {not: true}, root_item["_type"], root_item["_id"], true).length > 0){
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
						if(hist_all[i]["by"]==0){
							info[i].content = app_models_resume_format_sentence(hist_all[i]["id"]).text();
						} else if(root_item["single"]){
							comment = Lincko.storage.get("comments", hist_all[i]["id"]);
							if(comment['recalled_by']){
								if(root_item["_type"]=="projects"){
									//We don't display recalled messages in activity short description
									continue;
								}
								var uname = wrapper_to_html(Lincko.storage.get('users', hist_all[i]["by"])['-username']);
								info[i].content = Lincko.Translation.get('app', 3101, 'html', {username: uname }); //has recalled a message
							} else {
								info[i].content = comment['+comment'];
							}
						} else {
							comment = Lincko.storage.get("comments", hist_all[i]["id"]);
							if(comment['recalled_by']){
								if(root_item["_type"]=="projects"){
									//We don't display recalled messages in activity short description
									continue;
								}
								var uname = wrapper_to_html(Lincko.storage.get('users', hist_all[i]["by"])['-username']);
								info[i].content = Lincko.Translation.get('app', 3101, 'html', {username: uname }); //has recalled a message
							} else {
								info[i].by = hist_all[i]["by"];
								info[i].content = comment['+comment'];
							}
						}
					} else {
						info[i].content = Lincko.storage.getHistoryInfo(hist_all[i])["title"];
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

		return histList;
	},
};

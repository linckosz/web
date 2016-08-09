var app_models_history = {

	hist_root: {},

	tabList: function(limit){
		if(typeof limit != 'number' || limit<=0){
			limit = false;
		}
		var hist_all = Lincko.storage.hist(null, -1);
		var histList = [];
		var hist_num = {};
		var item;
		var root_item;
		var root_name;
		var name;
		var src;
		var perso;
		var user_icon = false;
		var date = new wrapper_date();
		var info = {};

		var now = new Date;
		now.setHours(0);
		now.setMinutes(0);
		now.setSeconds(0);
		var startOfDay = Math.floor(now / 1000); //timestamp of beginning of teh day taking in account the timezone

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
			root_item = getRoot(hist_all[i]["type"], hist_all[i]["id"]);
			root_name = root_item["_type"]+"_"+root_item["_id"];
			name = hist_all[i]["type"]+"_"+hist_all[i]["id"];
			if(typeof hist_num[root_name] == "undefined"){
				hist_num[root_name] = true;
				if(app_models_history.hist_root[root_name] && app_models_history.hist_root[root_name].name == name && app_models_history.hist_root[root_name].timestamp == hist_all[i]["timestamp"]){
					date.setTime(app_models_history.hist_root[root_name].timestamp);
					if(hist_all[i]["timestamp"] < startOfDay){ //Previous date
						app_models_history.hist_root[root_name].date = date.display('date_very_short');
					} else {
						app_models_history.hist_root[root_name].date = date.display('time_short');
					}
					app_models_history.hist_root[root_name].notif = hist_all[i].not;
				} else {
					info[i] = {};
					info[i].name = name;
					info[i].root_type = root_item["_type"];
					info[i].root_id = root_item["_id"];
					info[i].notif = hist_all[i].not;

					if(root_item["_type"]=="projects" && root_item["_id"]==Lincko.storage.getMyPlaceholder()['_id']){
						info[i].title = Lincko.Translation.get('app', 2502, 'html'); //Personal Space
					} else {
						info[i].title = Lincko.storage.getPlus(root_item["_type"], root_item["_id"]);
					}

					info[i].picture = $('<span />');
					info[i].picture.attr('find', 'history_picture');
					if(root_item["_type"]=="projects"){
						info[i].picture.addClass('fa fa-globe');
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
							info[i].picture.css('background-image', 'url(' + src + ')');
						} else {
							info[i].picture.addClass('icon-Single-Person');
						}
					} else {
						info[i].picture.addClass('icon-Multiple-People');
					}

					info[i].timestamp = hist_all[i]["timestamp"];
					date.setTime(hist_all[i]["timestamp"]);
					if(hist_all[i]["timestamp"] < startOfDay){ //Previous date
						info[i].date = date.display('date_very_short');
					} else {
						info[i].date = date.display('time_short');
					}

					if(hist_all[i]["type"]=="comments"){
						info[i].content = Lincko.storage.get("comments", hist_all[i]["id"], "comment");
					} else {
						info[i].content = Lincko.storage.getHistoryInfo(hist_all[i])["title"];
					}

					app_models_history.hist_root[root_name] = info[i];
				}
				histList.push(app_models_history.hist_root[root_name]);
				if(limit && histList.length>=limit){ //Limit to five history
					break;
				}
			}
		}

		return histList;
	},
};

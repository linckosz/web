submenu_list['app_projects_users_contacts'] = {
	"_title": {
		"style": "customized_title",
		"title": Lincko.Translation.get('app', 31, 'html'), //Add Teammates
	},
	"left_button": {
		"style": "title_left_button",
		"title": Lincko.Translation.get('app', 25, 'html'), //Close
		'hide': true,
		"class": "base_pointer",
	},
	"_pre_action": {
		"style": "preAction",
		"action": function(Elem, subm){
			app_projects_users_contacts_init(subm);
		},
	},
	"right_button": {
		"style": "title_right_button",
		"title": "",
		"class": "base_pointer icon-AddPerson submenu_app_chat_title_right_button",
		"action": function(Elem, subm) {
			var param = {
				prevSub: subm,
				invite_access: {
					projects: subm.param, //toto => need to be careful, this should always be a project id, but need to follow closely
				}
			};
			if(subm.param && subm.param.invite_access){
				param.invite_access = subm.param.invite_access;
			}
			submenu_Build('chat_add_user', subm.layer+1, true, param, subm.preview);
		},
		"now": function(Elem, subm){
			//hide invite new user button if no invite_access (because can't auto add them to project after invite)
			if(!subm.param || (typeof subm.param == 'object' && !subm.param.invite_access)){
				Elem.addClass('display_none');
			}
		},
	},
};

var app_projects_users_contacts_list = {}; //toto => this is a bad design to store multiple selection, we should send value to previous submenu in somehow

var app_projects_users_contacts_init = function(subm){
	for(var i in submenu_list['app_projects_users_contacts']){
		if(
			   submenu_list['app_projects_users_contacts'][i]["style"] != "title"
			&& submenu_list['app_projects_users_contacts'][i]["style"] != "customized_title"
			&& submenu_list['app_projects_users_contacts'][i]["style"] != "title_left_button"
			&& submenu_list['app_projects_users_contacts'][i]["style"] != "title_right_button"
			&& submenu_list['app_projects_users_contacts'][i]["style"] != "preAction"
			&& submenu_list['app_projects_users_contacts'][i]["style"] != "postAction"
		){
			delete submenu_list['app_projects_users_contacts'][i];
		}
	}
	var me = Lincko.storage.list('users', 1, { _id: wrapper_localstorage.uid, });

	submenu_list['app_projects_users_contacts']['users_'+me[0]['_id']] = {
		"style": "radio",
		"title": Lincko.Translation.get('app', 2401, 'html')+" ("+Lincko.storage.get('users', +me[0]['_id'], 'username')+")", //Me
		"selected": true,
		"hide": false,
		"class": "submenu_deco_info submenu_deco_fix",
	};

	var pid = subm.param;
	if(subm.param && subm.param.pid){
		pid = subm.param.pid;
	}
	var project = Lincko.storage.get("projects", pid);
	var projects_id = project["_id"];
	if(project){ //Editing

		var users_access = Lincko.storage.whoHasAccess("projects", projects_id);
		var param = [
			{ _id: ['!=', wrapper_localstorage.uid], _visible: true, },
		];
		for(var i in users_access){
			users_id = users_access[i];
			if(users_id != wrapper_localstorage.uid){
				param.push(
					{ _id: users_id, }
				);
			}
		}

		var others = Lincko.storage.list('users', null, param);

		//Add alphabetic username
		for(var l in others){
			others[l]['alphabet_order'] = Pinyin.GetQP(others[l]['-username']);
		}
		others = Lincko.storage.sort_items(others, 'alphabet_order');

		for(var i=0; i<=1; i++){
			for(var j in others){
				var selected = false;
				//Place on top the selected
				if(i==0 && $.inArray(others[j]['_id'], users_access) >= 0){
						selected = true;
				} else if(i==0 || $.inArray(others[j]['_id'], users_access) >= 0){
					continue;
				}
				submenu_list['app_projects_users_contacts']['users_'+others[j]['_id']] = {
					"style": "radio",
					"title": Lincko.storage.get('users', others[j]['_id'], 'username'),
					"selected": selected,
					"action_param": { value: others[j]['_id'], },
					"action": function(){
						this.selected = !this.selected;
						var project = Lincko.storage.get('projects', projects_id);
						if(project){
							if(this.selected){
								project['_perm'][this.action_param.value] = [0, 0];
								app_projects_users_contacts_list[this.action_param.value] = true;
							} else {
								delete project['_perm'][this.action_param.value];
								app_projects_users_contacts_list[this.action_param.value] = false;
							}
						}
						app_application_lincko.prepare(["select_multiple", "form_radio", "projects_"+projects_id], true);
					},
					"hide": false,
					"class": "submenu_deco_info",
				};
			}
		}

		//submenu hide syncfunction
		app_application_lincko.add(
			subm.id,
			"submenu_hide_"+subm.preview+"_"+subm.id,
			function(){
				var param = {
					id: projects_id,
				}
				param["users>access"] = {};
				var action = false;
				for(var i in app_projects_users_contacts_list){
					param["users>access"][i] = app_projects_users_contacts_list[i];
					action = true;
				}
				if(action){
					wrapper_sendAction(
						param,
						'post',
						'project/update'
					);
				}
			}
		);

	} else { //New
		var others = Lincko.storage.list('users', null, { _id: ['!=', wrapper_localstorage.uid], _visible: true, });

		//Add alphabetic username
		//[unknow bug, already solved] => if use "var i" it become sometimes "users_?" instead of an integer, it seems that the scope was not taken into account
		for(var k in others){
			others[k]['alphabet_order'] = Pinyin.GetQP(others[k]['-username']);
		}
		others = Lincko.storage.sort_items(others, 'alphabet_order');

		for(var j in others){
			submenu_list['app_projects_users_contacts']['users_'+others[j]['_id']] = {
				"style": "radio",
				"title": Lincko.storage.get('users', others[j]['_id'], 'username'),
				"selected": false,
				"action_param": { value: others[j]['_id'], },
				"action": function(Elem, subm){
					this.selected = !this.selected;
					if(this.selected){
						app_projects_users_contacts_list[this.action_param.value] = true;
					} else {
						delete app_projects_users_contacts_list[this.action_param.value];
					}
					app_application_lincko.prepare(["select_multiple", "form_radio"], true);
				},
				"hide": false,
				"class": "submenu_deco_info",
			};
			if(app_projects_users_contacts_list[others[j]['_id']]){
				submenu_list['app_projects_users_contacts']['users_'+others[j]['_id']]["selected"] = true;
			}
		}
	}

};

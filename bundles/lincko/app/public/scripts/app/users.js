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

			//hide invite new user button if no invite_access (because can't auto add them to project after invite)
			if(!subm.param || !subm.param.invite_access || subm.obj.right_button || subm.obj.right_button.class){
				subm.obj.right_button.class += ' display_none';
			}
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
		for(var i in others){
			submenu_list['app_projects_users_contacts']['users_'+others[i]['_id']] = {
				"style": "radio",
				"title": Lincko.storage.get('users', others[i]['_id'], 'username'),
				"selected": false,
				"action_param": { value: others[i]['_id'], },
				"action": function(){
					this.selected = !this.selected;
					var param = {
						id: projects_id,
					}
					param["users>access"] = {};
					param["users>access"][this.action_param.value] = this.selected;
					wrapper_sendAction(
						param,
						'post',
						'project/update'
					);
					app_application_lincko.prepare(["select_multiple", "form_radio"], true);
				},
				"hide": false,
				"class": "submenu_deco_info",
			};
			if($.inArray(others[i]['_id'], users_access) >= 0){
				submenu_list['app_projects_users_contacts']['users_'+others[i]['_id']]["selected"] = true;
			}
		}
	} else { //New
		var others = Lincko.storage.list('users', null, { _id: ['!=', wrapper_localstorage.uid], _visible: true, });
		for(var i in others){
			submenu_list['app_projects_users_contacts']['users_'+others[i]['_id']] = {
				"style": "radio",
				"title": Lincko.storage.get('users', others[i]['_id'], 'username'),
				"selected": false,
				"action_param": { value: others[i]['_id'], },
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
			if(app_projects_users_contacts_list[others[i]['_id']]){
				submenu_list['app_projects_users_contacts']['users_'+others[i]['_id']]["selected"] = true;
			}
		}
	}

};

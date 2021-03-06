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
		"class": "base_pointer icon-AddPerson submenu_app_chat_title_right_button display_none",
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
			if(Lincko.storage.getWORKID()==0 || Lincko.storage.amIadmin()){
				Elem.removeClass('display_none');
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

	var project = false;

	var pid = subm.param;
	if(subm.param && subm.param.pid){
		pid = subm.param.pid;
	}
	if(pid){
		project = Lincko.storage.get("projects", pid);
	}
	
	if(project){ //Editing

		var projects_id = project["_id"];

		submenu_list['app_projects_users_contacts']['users_'+me[0]['_id']] = {
			"style": "radio",
			"title": "<span>"+Lincko.Translation.get('app', 2401, 'html')+" ("+Lincko.storage.get('users', +me[0]['_id'], 'username')+")" + "</span><br /><span find='logs' class='app_projects_users_contacts_users_logs'><span class='fa fa-circle-o-notch fa-spin'></span></span>", //Me
			"selected": true,
			"action_param": { value: me[0]['_id'], },
			"hide": false,
			"class": "submenu_deco_info submenu_deco_fix",
			"value": function(){
				if(Lincko.storage.getWORKID()>0){
					var role = Lincko.storage.userRole(this.action_param.value, 'projects', projects_id);
					if(role['_id']==1){
						return Lincko.Translation.get('app', 111, 'html'); //Administrator
					} else if(role['_id']==2){
						return Lincko.Translation.get('app', 110, 'html'); //Teammate
					} else if(role['_id']==3){
						return Lincko.Translation.get('app', 109, 'html'); //Guest
					}
					return role['+name'];
				}
				return '';
			},
			"now": function(Elem, subm){
				Elem.find("[find=submenu_radio_title]").addClass("app_projects_users_contacts_users");
				Elem.find("[find=submenu_radio_value]").addClass("app_projects_users_contacts_users_value");
				var subm_bis = subm;
				wrapper_sendAction({uid: this.action_param.value}, 'post', 'user/connection', function(msg, err, status, data){
					if(typeof data.logs == "undefined" || data.last == "undefined"){
						Elem.find("[find=logs]").html(Lincko.Translation.get('app', 131, 'html')); //no login record found
						return true;
					}
					var logs = data.logs;
					var last = (new wrapper_date(data.last)).display('date_long');
					if(logs>1){
						var text = Lincko.Translation.get('app', 129, 'js', {logs: logs, last: last});// [{logs}] logins - Last seen: [{last}]
					} else {
						var text = Lincko.Translation.get('app', 130, 'js', {logs: logs, last: last});// [{logs}] login - Last seen: [{last}]
					}
					Elem.find("[find=logs]").html(text);
				});
			},
		};

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

		//Add alphabetic username
		var others = Lincko.storage.sort_items(Lincko.storage.list('users', null, param), '-username');

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
					"title": "<span>"+Lincko.storage.get('users', others[j]['_id'], 'username')+ "</span><br /><span find='logs' class='app_projects_users_contacts_users_logs'><span class='fa fa-circle-o-notch fa-spin'></span></span>", //Me
					"selected": selected,
					"action_param": { value: others[j]['_id'], },
					"action": function(Elem, subm){
						this.selected = !this.selected;
						var project = Lincko.storage.get('projects', projects_id);
						if(project){
							if(this.selected){
								Elem.find("[find=submenu_radio_text]").removeClass('display_none');
								project['_perm'][this.action_param.value] = [0, 0];
								app_projects_users_contacts_list[this.action_param.value] = true;
							} else {
								Elem.find("[find=submenu_radio_text]").addClass('display_none');
								delete project['_perm'][this.action_param.value];
								app_projects_users_contacts_list[this.action_param.value] = false;
							}
						}
						app_application_lincko.prepare(["select_multiple", "form_radio", "projects_"+projects_id], true);
					},
					"hide": false,
					"class": "submenu_deco_info",
					"value": function(){
						if(Lincko.storage.getWORKID()>0){
							var role = Lincko.storage.userRole(this.action_param.value, 'projects', projects_id);
							if(role['_id']==1){
								return Lincko.Translation.get('app', 111, 'html'); //Administrator
							} else if(role['_id']==2){
								return Lincko.Translation.get('app', 110, 'html'); //Teammate
							} else if(role['_id']==3){
								return Lincko.Translation.get('app', 109, 'html'); //Guest
							}
							return role['+name'];
						}
						return '';
					},
					"now": function(Elem, subm){
						//Logins
						Elem.find("[find=submenu_radio_title]").addClass("app_projects_users_contacts_users");
						Elem.find("[find=submenu_radio_value]").addClass("app_projects_users_contacts_users_value");
						var subm_bis = subm;
						wrapper_sendAction({uid: this.action_param.value}, 'post', 'user/connection', function(msg, err, status, data){
							if(typeof data.logs == "undefined" || data.last == "undefined"){
								Elem.find("[find=logs]").html(Lincko.Translation.get('app', 131, 'html')); //no login record found
								return true;
							}
							var logs = data.logs;
							var last = (new wrapper_date(data.last)).display('date_long');
							if(logs>1){
								var text = Lincko.Translation.get('app', 129, 'js', {logs: logs, last: last});// [{logs}] logins - Last seen: [{last}]
							} else {
								var text = Lincko.Translation.get('app', 130, 'js', {logs: logs, last: last});// [{logs}] login - Last seen: [{last}]
							}
							Elem.find("[find=logs]").html(text);
						});

						var grant = false;
						if(Lincko.storage.getWORKID()>0){
							var role = Lincko.storage.userRole(wrapper_localstorage.uid, 'projects', projects_id);
							if(role && role.perm_grant){
								grant = true;
							}
						}
						if(Lincko.storage.getWORKID()>0 && Lincko.storage.canI('edit', 'projects', projects_id) && this.action_param.value != wrapper_localstorage.uid){
							Elem.removeClass('display_none');
							Elem.find("[find=submenu_radio_text]");
							var select_id = subm.id+"_"+md5(Math.random());
							var select_elem = Elem.find("[find=submenu_radio_text]");
							select_elem.prop("id", select_id);
							app_application_lincko.add(select_id, "role_select_"+this.action_param.value, function(){
								var Elem = this.action_param[0];
								var tab = this.action_param[1];
								if(typeof tab.value == 'function'){
									Elem.find("[find=submenu_radio_text]").html(tab.value());
								}
							}, [Elem, this] );
							if(grant){
								var pid = subm.param;
								if(subm.param && subm.param.pid){
									pid = subm.param.pid;
								}
								Elem.find("[find=submenu_radio_text]")
								.addClass('submenu_radio_text_sub_click')
								.on('click', [pid, this.action_param.value], function(event){
									event.stopPropagation();
									var pid = event.data[0];
									var uid = event.data[1];
									submenu_role_build_list(uid, 'projects', pid);
									submenu_Build("role_select", true, true, {users_id: uid, parent_type: 'projects', parent_id: pid, });
								});
							}
						} else if(Lincko.storage.getWORKID()>0){
							Elem.off('click');
						}
						if(this.selected){
							Elem.find("[find=submenu_radio_text]").removeClass('display_none');
						} else {
							Elem.find("[find=submenu_radio_text]").addClass('display_none');
						}
					},
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

		submenu_list['app_projects_users_contacts']['users_'+me[0]['_id']] = {
			"style": "radio",
			"title": Lincko.Translation.get('app', 2401, 'html')+" ("+Lincko.storage.get('users', +me[0]['_id'], 'username')+")", //Me
			"selected": true,
			"action_param": { value: me[0]['_id'], },
			"hide": false,
			"class": "submenu_deco_info submenu_deco_fix",
			"value": function(){
				if(Lincko.storage.getWORKID()>0){
					var role = Lincko.storage.userRole(this.action_param.value, 'workspaces', Lincko.storage.getWORKID());
					if(role['_id']==1){
						return Lincko.Translation.get('app', 111, 'html'); //Administrator
					} else if(role['_id']==2){
						return Lincko.Translation.get('app', 110, 'html'); //Teammate
					} else if(role['_id']==3){
						return Lincko.Translation.get('app', 109, 'html'); //Guest
					}
					return role['+name'];
				}
				return '';
			},
		};

		//Add alphabetic username
		//[unknow bug, already solved] => if use "var i" it become sometimes "users_?" instead of an integer, it seems that the scope was not taken into account
		var others = Lincko.storage.sort_items(Lincko.storage.list('users', null, { _id: ['!=', wrapper_localstorage.uid], _visible: true, }), '-username');

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

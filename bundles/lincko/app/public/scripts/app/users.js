submenu_list['app_projects_users_contacts'] = {
	"_title": {
		"style": "title",
		"title": Lincko.Translation.get('app', 31, 'html'), //Team
	},
	"_pre_action": {
		"style": "preAction",
		"action": function(){
			app_projects_users_contacts_init();
		},
	},
};

var app_projects_users_contacts_list = {}; //toto => this is a bad design to store multiple selection, we should send value to previous submenu in somehow

var app_projects_users_contacts_init = function(){
	for(var i in submenu_list['app_projects_users_contacts']){
		if(submenu_list['app_projects_users_contacts'][i]["style"] != "title" && submenu_list['app_projects_users_contacts'][i]["style"] != "preAction"){
			delete submenu_list['app_projects_users_contacts'][i];
		}
	}
	var me = Lincko.storage.list('users', 1, { _id: wrapper_localstorage.uid, });
	var others = Lincko.storage.list('users', null, { _id: ['!=', wrapper_localstorage.uid], _visible: true, });

	//Initialize the list
	app_projects_users_contacts_list = {};

	submenu_list['app_projects_users_contacts']['users_'+me[0]['_id']] = {
		"style": "radio",
		"title": Lincko.Translation.get('app', 2401, 'html')+" ("+Lincko.storage.get('users', +me[0]['_id'], 'username')+")", //Me
		"selected": true,
		"hide": false,
		"class": "submenu_deco_info submenu_deco_fix",
	};

	for(var i in others){
		submenu_list['app_projects_users_contacts']['users_'+others[i]['_id']] = {
			"style": "radio",
			"title": Lincko.storage.get('users', +others[i]['_id'], 'username'),
			"selected": false,
			"action_param": { value: others[i]['_id'], },
			"action": function(){
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
	}

};


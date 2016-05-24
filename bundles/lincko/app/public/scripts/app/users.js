submenu_list['app_users_contacts'] = {
	"_title": {
		"style": "title",
		"title": Lincko.Translation.get('app', 31, 'html'), //Team
	},
	"_pre_action": {
		"style": "preAction",
		"action": function(){
			app_users_contacts_init();
		},
	},
};

var app_users_contacts_init = function(){
	for(var i in submenu_list['app_users_contacts']){
		if(submenu_list['app_users_contacts'][i]["style"] != "title" && submenu_list['app_users_contacts'][i]["style"] != "preAction"){
			delete submenu_list['app_users_contacts'][i];
		}
	}
	var me = Lincko.storage.list('users', 1, { _id: wrapper_localstorage.uid, });
	var others = Lincko.storage.list('users', null, { _id: ['!=', wrapper_localstorage.uid], _visible: true, });

	submenu_list['app_users_contacts']['users_'+me[0]['_id']] = {
		"style": "radio",
		"title": Lincko.Translation.get('app', 2401, 'html')+" ("+Lincko.storage.get('users', +me[0]['_id'], 'username')+")", //Me
		"selected": true,
		"hide": false,
		"class": "",
	};

	for(var i in others){
		submenu_list['app_users_contacts']['users_'+others[i]['_id']] = {
			"style": "radio",
			"title": Lincko.storage.get('users', +others[i]['_id'], 'username'),
			"selected": true,
			"action_param": { value:'users_'+others[i]['_id'], },
			"action": function(event){
				console.log(this);
				console.log(event.data.value);
				if(this.selected){
					this.selected = false;
				} else {
					this.selected = true;
				}
				app_application_lincko.prepare("select_multiple", true);
			},
			"hide": false,
			"class": "",
		};
	}

};


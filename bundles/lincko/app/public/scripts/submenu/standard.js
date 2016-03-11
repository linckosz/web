/*
//Only "style" and "title" must exist, other fields are optional
submenu_list['sample'] = {
	//Set the title of the top
	"_title": {
		"style": "title",
		"title": "Sample",
	},
	//Add HTML/JS checking input format
	"_input": {
		"style": "prefix",
		"title": "sample",
	},
	//Just do an action (need to hide al menus manually by the function submenu_Hideall)
	"action": {
		"style": "button",
		"title": "Single action",
		"action": function(){
			alert('An action');
		},
		"now": function(that, Elem){ //An action to launch at element creation
			alert('An action');
			console.log(that);
			console.log(Elem);
		},
		"class": "",
		"hide": true, //By default 'false', it hides all submenu after the click ( equivalent to submenu_Hideall(); )
	},
	//It will open a sub menu
	"Submenu": {
		"style": "next",
		"title": "Submenu", //The name of the next menu we will access
		"next": "anothermenu",
		"value": "Un truc", //This will ne replace by the title of the sub menu if it exists
		"class": "",
	},
	//It will create a form with a validation button
	"form": {
		"style": "form",
		"title": Lincko.Translation.get('app', 3, 'html'), //Confirm
		"hide": true, //By default 'false', it hides all submenu after the click ( equivalent to submenu_Hideall(); )
	},
};
*/

submenu_list['test'] = {
	//Set the title of the top
	"_title": {
		"style": "title",
		"title": 'Test', //Settings
	},
};

submenu_list['settings'] = {
	//Set the title of the top
	"_title": {
		"style": "title",
		"title": Lincko.Translation.get('app', 2, 'html'), //Settings
	},
	//Change the workspace
	"workspace": {
		"style": "next",
		"title": Lincko.Translation.get('app', 39, 'html'), //Workspace
		"next": "workspace",
		"value": function(){ return Lincko.storage.COMNAME; },
		"class": "",
	},
	//Change the language
	"language": {
		"style": "next",
		"title": Lincko.Translation.get('app', 1, 'html'), //Language
		"next": "language",
		"value": submenu_language_full,
		"class": "",
	},
	"home": {
		"style": "button",
		"title": Lincko.Translation.get('app', 43, 'html'), //Home page
		"action": function(){
			window.location.href = wrapper_link['home'];
		},
		"class": "",
	},
	"signout": {
		"style": "button",
		"title": Lincko.Translation.get('app', 38, 'html'), //Sign out
		"action": function(){
			wrapper_sendAction('','post','user/signout', null, null, wrapper_signout_cb_begin, wrapper_signout_cb_complete);
		},
		"class": "",
	},
};

submenu_list['workspace'] = {
	"_title": {
		"style": "title",
		"title": Lincko.Translation.get('app', 39, 'html'), //Workspace
	},
};


JSfiles.finish(function(){
	app_application_lincko.add(function(){
		var companies = Lincko.storage.list('companies');
		var url;
		var name;
		var username;
		var select;
		//My workspace
		for(var i in companies){
			if(companies[i].personal_private!=null && companies[i].personal_private==wrapper_localstorage.uid && companies[i].url==''){
				name = Lincko.Translation.get('app', 40, 'html'), //My workspace
				url = companies[i].personal_private+'/'+username;
				if(typeof submenu_list['workspace']['_0_'+url] == 'undefined'){
					submenu_list['workspace']['_0_'+companies[i]['_id']] = {
						"style": "radio",
						"title": name,
						"hide": true,
						"action_param": { workspace:url, },
						"action": function(event){
							app_application_change_private(event.data.workspace);
						},
						"selected": false,
					};
					if(companies[i]['_id']==Lincko.storage.COMID){
						submenu_list['workspace']['_0_'+companies[i]['_id']].selected = true;
					}
				}
			}
		}
		//List first Companies' workspace
		for(var i in companies){
			if(companies[i].personal_private==null && companies[i].url!=''){
				name = companies[i].name.ucfirst();
				url = companies[i].url;
				if(typeof submenu_list['workspace']['_1_'+companies[i]['_id']] == 'undefined'){
					submenu_list['workspace']['_1_'+companies[i]['_id']] = {
						"style": "radio",
						"title": name,
						"hide": true,
						"action_param": { workspace:url, },
						"action": function(event){
							app_application_change_workspace(event.data.workspace);
						},
						"selected": false,
					};
					if(companies[i]['_id']==Lincko.storage.COMID){
						submenu_list['workspace']['_1_'+companies[i]['_id']].selected = true;
					}
				}
			}
		}
		
		//List others' Private workspace
		for(var i in companies){
			if(companies[i].personal_private!=null && companies[i].personal_private!=wrapper_localstorage.uid && companies[i].url==''){
				username = Lincko.storage.get("users", companies[i].personal_private, "username");
				name = Lincko.Translation.get('app', 44, 'js', {username: username.ucfirst(),});
				url = companies[i].personal_private+'/'+username;
				if(typeof submenu_list['workspace']['_2_'+companies[i]['_id']] == 'undefined'){
					submenu_list['workspace']['_2_'+companies[i]['_id']] = {
						"style": "radio",
						"title": name,
						"hide": true,
						"action_param": { workspace:url, },
						"action": function(event){
							app_application_change_private(event.data.workspace);
						},
						"selected": false,
					};
					if(companies[i]['_id']==Lincko.storage.COMID){
						submenu_list['workspace']['_2_'+companies[i]['_id']].selected = true;
					}
				}
			}
		}
		
	}, 'companies');
});

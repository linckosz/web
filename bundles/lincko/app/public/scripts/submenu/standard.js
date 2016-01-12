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
		"value": Lincko.storage.COMNAME,
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
	"_myworkspace_": {
		"style": "button",
		"title": Lincko.Translation.get('app', 40, 'html'), //My workspace
		"action": function(){
			app_application_change_workspace();
		},
	},
};


JSfiles.finish(function(){
	app_application_lincko.add(function(){
		for(var menu in submenu_list['workspace']){
			if(menu != "_title" && menu != "_myworkspace_"){
				delete submenu_list['workspace'][menu];
			}
		}
		var companies = Lincko.storage.list('companies');
		for(var i in companies){
			if(companies[i].url){
				submenu_list['workspace'][companies[i].url] = {
					"style": "button",
					"title": companies[i].name,
					"action_param": { workspace:companies[i].url, },
					"action": function(event){
						app_application_change_workspace(event.data.workspace);
					},
				};
			}
		}
	}, 'companies');
});

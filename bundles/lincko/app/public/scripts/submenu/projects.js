
submenu_list['projects_list'] = {
	"_title": {
		"style": "title",
		"title": Lincko.Translation.get('app', 2501, 'html'), ///Projects list
	},
};

var submenu_projects_build_list = function(){
	
	var projects = Lincko.storage.list('projects');
	var projects_id;
	var title;

	//Clear the list to rebuild it then
	for(var key in submenu_list['projects_list']){
		if(key != "_title"){
			delete submenu_list['projects_list'][i];
		}
	}

	projects = Lincko.storage.getMyPlaceholder();
	var MyPlaceholderID = projects['_id'];
	//My personal space
	submenu_list['projects_list'][MyPlaceholderID] = {
		"style": "button",
		"title": Lincko.Translation.get('app', 2502, 'html'), //Personal Space
		"hide": true,
		"action": function(){
			app_content_menu.selection(MyPlaceholderID, 'tasks');
		},
		"selected": false,
	};

	projects = Lincko.storage.list('projects', null, {_id:['!=', MyPlaceholderID]});
	for(var i in projects){
		title = projects[i]['+title'].ucfirst();
		projects_id = projects[i]['_id'];
		if(typeof submenu_list['projects_list'][projects_id] == 'undefined'){
			submenu_list['projects_list']['projects_'+i+'_'+projects_id] = {
				"style": "button",
				"title": title,
				"hide": true,
				"action_param": { projects_id: projects_id, },
				"action": function(event){
					app_content_menu.selection(event.data.projects_id, 'tasks');
				},
			};
		}
	}
	
};


JSfiles.finish(function(){
	submenu_projects_build_list();
	app_application_lincko.add(submenu_projects_build_list, ['projects', 'first_launch']);
});

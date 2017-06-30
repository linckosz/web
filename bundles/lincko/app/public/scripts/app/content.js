$('#app_content_top_contacts').click(function(){
	submenu_Build('chat_add_user');
});

function app_content_menu_position() {
	$('#app_content_menu').height(function(){
		if(responsive.test("maxMobileL")){
			return 48;
		} else {
			return $(window).height() - $('#app_content_top').height();
		}
	});
}
app_content_menu_position();
var app_content_menu_position_timer;
$(window).resize(function(){
	clearTimeout(app_content_menu_position_timer);
	app_content_menu_position_timer = setTimeout(app_content_menu_position, wrapper_timeout_timer);
});

function app_content_dynamic_position() {
	$('#app_content_dynamic, #app_content_dynamic_sub').height(function(){
		if(responsive.test("maxMobileL")){
			return $(window).height() - $('#app_content_top').height() - $('#app_content_menu').height();
		} else {
			return $(window).height() - $('#app_content_top').height();
		}
	});
	$('#app_content_dynamic_sub').width($('#app_content_dynamic').width());
}
app_content_dynamic_position();
var app_content_dynamic_position_timer;
$(window).resize(function(){
	clearTimeout(app_content_dynamic_position_timer);
	app_content_dynamic_position_timer = setTimeout(app_content_dynamic_position, wrapper_timeout_timer);
});

var app_content_menu = {

	projects_id: null,

	onboarding_id: false,

	menu: null,

	param: null,

	change: function(menu){
		if(app_content_menu.menu != menu){
			app_content_menu.selection(app_content_menu.projects_id, menu, app_content_menu.param);
		}
	},

	selection: function(projects_id, menu, param, hide_preview){
		//We do not allow to display anything until the personal project is available
		if(typeof projects_id === 'undefined'){ return false; }
		if(typeof menu === 'undefined'){ menu = 'tasks'; }
		if(typeof param === 'undefined'){ param = null; }
		if(typeof hide_preview === 'undefined'){ hide_preview = true; }

		//Clean all submenu before opening a new project (even if the same as current one)
		submenu_Hideall();

		var list = [];
		var title = base_myplaceholder;
		var new_project = false;

		if(!this.onboarding_id){
			var ob_settings = Lincko.storage.getOnboarding();
			if(ob_settings && typeof ob_settings.sequence != 'undefined'){
				this.onboarding_id = ob_settings.projects[1];
			}
		}

		if(app_content_menu.projects_id != projects_id){
			new_project = true;
			if(this.onboarding_id == app_content_menu.projects_id){
				app_application_action(15); //Exit onboarding project
			} else if(this.onboarding_id == projects_id){
				app_application_action(16); //Enter onboarding project
			} else {
				app_application_action(17); //Switch the project
			}
		}

		if(projects_id > 0){
			var project = Lincko.storage.get("projects", projects_id);
			if(project && project["deleted_at"]!=null){
				projects_id = Lincko.storage.getMyPlaceholder()['_id'];
			}
		}

		if(projects_id == 0){ //Workspace
			// title = Lincko.storage.WORKNAME;
			// list = [
			// 	'projects',
			// ];
			title = Lincko.Translation.get('app', 201, 'js');//Global View
			list = [
				'tasks',
				'notes',
				'files',
			];
			$('#app_content_submenu_preview_statistics').addClass('display_none');

		} else if(
			   $.type(Lincko.storage.data['projects']) === 'object'
			&& $.type(Lincko.storage.data['projects'][projects_id]) === 'object'
			&& (Lincko.storage.data['projects'][projects_id]['personal_private'] == 0
				|| Lincko.storage.data['projects'][projects_id]['personal_private'] == null)
		){
			title = Lincko.storage.data['projects'][projects_id]['+title'];
			list = [
				'tasks',
				'notes',
				'chats',
				'files',
				'dashboard',
			];
			$('#app_content_submenu_preview_statistics').removeClass('display_none');
		} else { //Personal space (default)
			title = base_myplaceholder;
			list = [
				'tasks',
				'notes',
				'chats',
				'files',
			];
			$('#app_content_submenu_preview_statistics').removeClass('display_none');
		}

		if($.inArray(menu, list) < 0){
			menu = list[0];
		}

		//preload project pictures
		var extend = false;
		if(menu=='files'){
			//extend = true;
		}
		var files = Lincko.storage.list('files', null, null, 'projects', projects_id);
		for(var i in files){
			Lincko.storage.thumbnailPreload(files[i]['_id'], extend);
		}

		//Do nothing if we are in the same menu of the same project
		if(app_content_menu.projects_id == projects_id && app_content_menu.menu == menu){
			if(responsive.test("maxMobileL")){ app_application.forceClose(); }
			return false;
		} else {
			submenu_Hideall(true);
		}

		app_generic_state.change(
			{
				projects_id: projects_id,
				menu: menu,
			},
			{
				param: param,
			}
		);

		app_content_menu.projects_id = projects_id;
		app_content_menu.menu = menu;
		app_content_menu.param = param;

		var Elem = $('#app_content_menu');
		$('#app_content_menu_table').removeClass('display_none');
		Elem.find(".app_content_menu_icon_active").removeClass('app_content_menu_icon_active');
		Elem.find(".app_content_menu_cell").addClass('display_none');
		Elem.find(".app_content_menu_icon").off('click');

		for(var i in list){
			$('#app_content_menu_'+list[i]).removeClass('display_none');
			$('#app_content_menu_'+list[i]).find(".app_content_menu_icon").click(
				{menu: list[i]}, function(event){
					app_content_menu.change(event.data.menu);
				}
			);
		}

		$('#app_content_menu_'+menu+' div:first-child').addClass('app_content_menu_icon_active');
		$('#app_content_menu_'+menu).find(".app_content_menu_icon").off('click');

		if(projects_id == Lincko.storage.getMyPlaceholder()['_id'] || projects_id == 0){
			$('#app_content_top_title_menu').addClass('app_content_cursor_default');
			$('#app_content_top_title_settings').addClass('display_none');
			//$('#app_content_statistics_settings').addClass('display_none');
		} else {
			$('#app_content_top_title_menu').removeClass('app_content_cursor_default');
			$('#app_content_top_title_settings').removeClass('display_none');
			//$('#app_content_statistics_settings').removeClass('display_none');
		}

		$('#app_content_top_title_settings').velocity('fadeIn', 100);
		
		$('#app_content_top_title_project').html(wrapper_to_html(title));
		app_application_lincko.add('app_content_top_title_project', 'projects_' + projects_id, function() {
			var project = Lincko.storage.get("projects", app_content_menu.projects_id);
			var projects_id = app_content_menu.projects_id;
			if(project && project["deleted_at"]==null){
				var title = project["+title"];
				if(projects_id == Lincko.storage.getMyPlaceholder()['_id']){
					title = base_myplaceholder;
				}
				$('#app_content_top_title_project').html(wrapper_to_html(title));
			} else {
				if(projects_id != 0)
				{
					var hist = Lincko.storage.hist("projects", 1, null, "projects", projects_id);
					projects_id = Lincko.storage.getMyPlaceholder()['_id'];
					if(hist.length>0 && hist[0]["att"]=="_delete"){
						var msg = Lincko.storage.getHistoryInfo(hist[0]);
						if(msg.content===false){ msg.content = ''; }
						base_show_error(msg.title+"\n"+msg.content);
					}
					var proid = projects_id;
					//The Timeout will help to avoid a loop.
					setTimeout(function(){
						app_content_menu.selection(proid);
					}, 100);
				}
			}
		});

		

		if(responsive.test("maxMobileL")){
			app_layers_changePage(menu, param, new_project, hide_preview);
			setTimeout(function(){
				app_application.forceClose();
			}, 0);
		} else {
			app_layers_changePage(menu, param, false, hide_preview);
		}

		//Keep a record offline for future page opening
		var old_page = {
			projects_id: projects_id,
			menu: menu,
			param: param,
		};
		wrapper_localstorage.encrypt('old_page', old_page);

		//keep track of visited projects (offline)
		/*if(!Lincko.storage.settings.latestvisitProjects.length || Lincko.storage.settings.latestvisitProjects[0] != projects_id){
			var i = $.inArray(projects_id, Lincko.storage.settings.latestvisitProjects);
			if(i > -1){ Lincko.storage.settings.latestvisitProjects.splice(i,1) }

			Lincko.storage.settings.latestvisitProjects.unshift(projects_id);
			wrapper_localstorage.encrypt('settings', Lincko.storage.settings);
		}*/

		//keep track of visited projects (online)
		var settings_new = Lincko.storage.getSettings();
		if(!settings_new){
			settings_new = {};
		}
		if(!settings_new.latestvisitProjects || !settings_new.latestvisitProjects.length){
			settings_new.latestvisitProjects = [];
		}
		if(settings_new.latestvisitProjects[0] != projects_id){
			var i = $.inArray(projects_id, settings_new.latestvisitProjects);
			if(i > -1){ settings_new.latestvisitProjects.splice(i,1) }

			settings_new.latestvisitProjects.unshift(projects_id);
			Lincko.storage.setSettings(settings_new);
			app_application_lincko.prepare("settings");
		}

		if(new_project){
			app_application_lincko.prepare("projects", true);
		} else {
			app_application_lincko.prepare(false, true);
		}

		return true;
	},
}

$('#app_content_top_home').click(function(){
	submenu_Build('projects_list');
});

$('#app_content_top_title_menu, #app_content_statistics_settings').click(function(){
	if(!(app_content_menu.projects_id == Lincko.storage.getMyPlaceholder()['_id']  || app_content_menu.projects_id == 0)){
		//evan_prepare
		var menu_data = [
			{
				icon:'icon-AddPerson',
				title : Lincko.Translation.get('app', 31, 'html'), //Add Teammates
				action : function(project_id){
					var param = {
						pid: project_id,
						invite_access: {
							projects: project_id,
							//tasks: task_id, //null if not available (i.e. brand new task) toto - not ready yet
						},
					}
					submenu_Build('app_projects_users_contacts', true, false, param);
				},
			},
			{
				icon:function(projects_id){
					var users = Lincko.storage.get('projects', projects_id, '_users');
					var icon = 'icon-audio';
					if(users[wrapper_localstorage.uid] && users[wrapper_localstorage.uid]['silence']){
						icon = 'icon-audiomute';
					}
					return icon;
				},
				title : Lincko.Translation.get('app', 74, 'html'),//'Mute notifications'
				action : function(projects_id,elem){
					var users = Lincko.storage.get('projects', projects_id, '_users');
					var on_off_invert = true;
					if(users[wrapper_localstorage.uid] && users[wrapper_localstorage.uid]['silence']){
						on_off_invert = false;
					}
					var param = {
						id: projects_id,
						"users>silence": {},
					}
					param["users>silence"][wrapper_localstorage.uid] = on_off_invert;
					wrapper_sendAction(
						param,
						'post',
						'project/update'
					);
					users[wrapper_localstorage.uid]['silence'] = on_off_invert;
					if(on_off_invert){
						elem.find('[find=icon]').removeClass('icon-audio');
						elem.find('[find=icon]').addClass('icon-audiomute');
					}
					else{
						elem.find('[find=icon]').removeClass('icon-audiomute');
						elem.find('[find=icon]').addClass('icon-audio');
					}
				},
			},
			{
				icon:'icon-Settings',
				title : Lincko.Translation.get('app', 2002, 'html'), //Project settings
				action : function(project_id){
					submenu_Build("app_project_edit", 1, false, project_id, false);
				},
			},

			{
				icon:null,
				title:'line',
			},
			{
				icon:'icon-createproject',
				title : Lincko.Translation.get('app', 116, 'html'), //'Create a new project',
				action : function(){
					submenu_Build("app_project_new");
				},
			},
			{
				icon: 'fa fa-clone',
				title : Lincko.Translation.get('app', 202, 'html'), //Copy the project
				action : function(project_id){
					wrapper_sendAction(
						{
							"id": project_id,
						},
						'post',
						'project/clone'
					);
				},
			},
			{
				icon:'icon-projectBlack',
				title : Lincko.Translation.get('app', 117, 'html'),//'Open another project',
				action : function(){
					submenu_Build("projectsDeck");
				},
			},
		];

		var elems;
		if($('#app_content_top_title_drop_down_menu').length == 0)
		{
			elems = $('#-submenu_menu_list_container').clone();
			elems.prop('id', 'app_content_top_title_drop_down_menu');
			//$('#app_content_top_title_menu').closest('.app_content_top_title').css('overflow','visible');
			//$('#app_content_top_title_menu').closest('.app_content_top_title').append(elems);
			$('body').append(elems);

			elems.find('.submenu_menu_list_more').remove();
			var offset = $('#app_content_top_title_menu').closest('.app_content_top_title').offset();
			var height = $('#app_content_top_title_menu').closest('.app_content_top_title').height();
			elems.css('top',offset.top + height - 20);
			elems.css('left',offset.left);


			for(var i in menu_data)
			{
				if(menu_data[i].icon == null){
					var elems_item = $('#-submenu_menu_list_line').clone();
					elems_item.prop("id","");
					elems.find("ul").eq(0).append(elems_item);
				}else{
					var elems_item = $('#-submenu_menu_list_item').clone();
					elems_item.prop("id","");

					if(typeof menu_data[i].icon === 'function'){
						elems_item.find("[find=icon]").addClass(menu_data[i].icon(app_content_menu.projects_id));
					}
					else{
						elems_item.find("[find=icon]").addClass(menu_data[i].icon);
					}
					
					elems_item.find("[find=title]").html(menu_data[i].title);
					elems_item.click(i,function(event){
						var i = event.data;
						menu_data[i].action(app_content_menu.projects_id,$(this));
					});
					elems.find("ul").eq(0).append(elems_item);
				}
			}

			
			elems.velocity('slideDown', {
				duration: 400,
				mobileHA: hasGood3Dsupport,
				complete: function(){
					elems.find("ul").focus();
				}
			});

			elems.find("ul").on("blur",function(){
				elems.velocity('slideUp', {
					duration: 400,
					mobileHA: hasGood3Dsupport,
				});
			});
		}
		else{
			elems = $("#app_content_top_title_drop_down_menu");
			var offset = $('#app_content_top_title_menu').closest('.app_content_top_title').offset();
			var height = $('#app_content_top_title_menu').closest('.app_content_top_title').height();
			elems.css('top',offset.top + height - 20);
			elems.css('left',offset.left);
			if(elems.css("display") == "none")
			{
				for(var i in menu_data)
				{
					if(typeof menu_data[i].icon == 'function')
					{
						elems.find('li').eq(i).find("[find=icon]").removeAttr('class');
						elems.find('li').eq(i).find("[find=icon]").addClass(menu_data[i].icon(app_content_menu.projects_id));
					}
				}
				elems.velocity('slideDown', {
					duration: 400,
					mobileHA: hasGood3Dsupport,
					complete: function(){
						elems.find("ul").focus();
					}
				});
			}
			else
			{
				elems.velocity('slideUp', {
					duration: 400,
					mobileHA: hasGood3Dsupport,
				});
			}
			
		}


		
	}
});

app_application_lincko.add("app_content_submenu_preview_statistics", ["hide_progress_wall", "projects"], function() {
	var Elem = $("#"+this.id);
	var projects_id = app_content_menu.projects_id;
	if(projects_id){
		var project = Lincko.storage.get("projects", projects_id);
		if(project){
			var chart_options = {
				animation: false,
				animationSteps: 0,
			}

			Elem.find("[find=tasks_statistics]").css("visibility", "visible");
			if(!app_models_projects_chart_tasks_data("app_content_submenu_preview_statistics", projects_id, false, chart_options)){
				Elem.find("[find=tasks_statistics]").css("visibility", "hidden");
			}
			var tasks = Lincko.storage.cache.getStatistics('projects', projects_id, 'tasks');
			var notes = Lincko.storage.cache.getStatistics('projects', projects_id, 'notes');
			var files = Lincko.storage.cache.getStatistics('projects', projects_id, 'files');
			Elem.find("[find=app_content_statistics_stats_tasks]").html(wrapper_to_html(tasks));
			Elem.find("[find=app_content_statistics_stats_notes]").html(wrapper_to_html(notes));
			Elem.find("[find=app_content_statistics_stats_files]").html(wrapper_to_html(files));
		}
	}
});

app_application_lincko.add("app_content_menu_notif", "projects", function() {
	if(app_content_menu.projects_id>0 && Lincko.storage.get('projects', app_content_menu.projects_id)){
		var histList = app_models_history.getList(false, 'projects', app_content_menu.projects_id);
		var notif = 0;
		for(var i in histList){
			if(histList[i].notif > 0){
				notif = notif + histList[i].notif;
			}
		}
		if(notif>0){
			$("#app_content_menu_notif")
				.removeClass('display_none')
				.text(notif);
			return true;
		}
	}
	$("#app_content_menu_notif")
		.addClass('display_none')
		.text('');
});

var app_content_menu_first_launch = true;

var app_content_menu_default = function(){
	if(app_content_menu_first_launch && Lincko.storage.getMyPlaceholder() !== false){
		app_content_menu_first_launch = false;
		if(onboarding.on){
			return false; 
		}
		var old_page = wrapper_localstorage.decrypt('old_page');
		if(old_page){
			app_content_menu.selection(old_page.projects_id, old_page.menu, old_page.param);
		} else {
			app_content_menu.selection(Lincko.storage.getMyPlaceholder()['_id']);
		}
		return false;
	}
	return true;
};

//Scroll additional parameters
wrapper_IScroll_options_new['app_content_menu'] = {
	scrollX: true,
};

var app_content_resize_timer;
var app_content_resize = function(){
	clearTimeout(app_content_resize_timer);
	app_content_resize_timer = setTimeout(function(){
		if($("#app_content_dynamic_sub").length > 0){
			if($("#app_content_dynamic_sub").width() <= 900)
			{
				$("#app_content_dynamic_sub").addClass("max-width-900");
			}
			else
			{
				$("#app_content_dynamic_sub").removeClass("max-width-900");
			}
		}
	}, 400);
};

$(window).resize(function(){
	app_content_resize();
});

JSfiles.finish(function(){
	app_application_lincko.add("body_lincko", "projects", null, null, app_content_menu_default);
	app_content_menu_default();
});


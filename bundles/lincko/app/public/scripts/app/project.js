var mainMenu = {

	check_open: false,

	projectSelect: function(){
		pid = app_content_menu.projects_id;
		$("#app_project_projects_tab").find("[pid]").removeClass("app_project_projects_item_selected");
		if(pid != Lincko.storage.getMyPlaceholder()['_id']){
			$("#app_project_placeholder").removeClass("app_project_projects_item_selected");
			var item = $("#app_project_projects_tab").find("[pid="+pid+"]");
			if(item.length>0){
				item.addClass("app_project_projects_item_selected");
			}
		} else {
			$("#app_project_placeholder").addClass("app_project_projects_item_selected");
		}
	},

	chatsSelect: function(){
		$("#app_project_chats_tab").find("[cid]").removeClass("app_project_chats_item_selected");
		var subm = submenu_get('newchat', false);
		if(subm){
			var type = subm.param.type;
			if(type == 'history'){
				type = 'projects';
			}
			cid = type+"_"+subm.param.id;
			var item = $("#app_project_chats_tab").find("[cid="+cid+"]");
			if(item.length>0){
				item.addClass("app_project_chats_item_selected");
			}
		}
	},

	initProjectTab_timer: false,
	initProjectTab: function(force, timing){
		if(typeof timing == "undefined"){
			timing = 1500;
		}
		if(!force && mainMenu.initProjectTab_timer){
			return false;
		}
		clearTimeout(mainMenu.initProjectTab_timer);
		mainMenu.initProjectTab_timer = setTimeout(function(force){
			var projects_all = app_models_projects_list(false, 5); //5 = 1 personal + 5 others
			var projectList = $.merge(projects_all[1], projects_all[2]);
			var projects_total = projects_all[3];
			delete projects_all;
			
			var tasks;
			var notes;
			var files;

			var projects_length = "";
			if(projects_total>2){
				$("#app_project_projects_all").removeClass('app_project_tab_force_radius');
				projects_length = "("+projects_total+")";
			} else {
				$("#app_project_projects_all").addClass('app_project_tab_force_radius');
			}
			$("#app_project_projects_all").find("[find=app_project_projects_all_number]").html(wrapper_to_html(projects_length));
			//For new user, open the mainmenu by default
			if(!storage_first_launch && !this.check_open){
				this.check_open = true; //Only check once
				if(!app_application_hashtag && projects_total<=2 && !onboarding.on){
					app_application.forceOpen();
				}
			}

			for (i = 0; i < 5; i++) {
				var item = $("#app_project_item_projects_"+i);
				if(item.length<=0){
					continue;
				}
				if(i<projectList.length-1){
					item.removeClass('app_project_tab_force_radius');
				} else {
					item.addClass('app_project_tab_force_radius');
				}
				if(projectList[i]){
					item.removeClass('display_none');
				} else {
					item.addClass('display_none');
					continue;
				}
				var pid = parseInt(projectList[i]['_id'], 10);
				var timestamp = parseInt(projectList[i]['updated_at'], 10);
				if(pid!=parseInt(item.attr('pid'), 10)){
					item.off('click');
					item.click(pid, function(event){
						app_content_menu.selection(event.data, 'tasks');
					});
				}

				//dashboard shortcut button
				item.find('[find=icon_dashboard]').off('click').click(pid, function(event){
					event.stopPropagation();
					app_content_menu.selection(event.data, 'dashboard');
				});

				if(force || pid!=parseInt(item.attr('pid'), 10) || timestamp!=parseInt(item.attr('timestamp'), 10)){
					item.find("[find=app_project_projects_title]").html(wrapper_to_html(projectList[i]['+title']));

					item.find('[find=app_project_projects_progress]').html(app_models_projects_progressBar(app_models_projects_getPercentComplete(pid)));

					item.attr('pid', pid);
					item.attr('timestamp', timestamp);
				}
			}
			mainMenu.projectSelect();
			clearTimeout(mainMenu.initProjectTab_timer);
			mainMenu.initProjectTab_timer = false;
		}, timing, force);
	},

	initChatTab_timer: false,
	initChatTab: function(force, timing){
		if(typeof timing == "undefined"){
			timing = 2000;
		}
		if(!force && mainMenu.initChatTab_timer){
			return false;
		}
		clearTimeout(mainMenu.initChatTab_timer);
		mainMenu.initChatTab_timer = setTimeout(function(force){
			if(typeof force == 'undefined'){ force=false; }
			var not_all = false;
			var content;
			var temp_histList = app_models_history.getList();
			var histList = [];
			for(var i in temp_histList){
				if(temp_histList[i].notif){
					not_all = true;
					break;
				}
			}

			for(var i in temp_histList){
				var style = Lincko.storage.get(temp_histList[i].root_type,temp_histList[i].root_id,"style");
				if(style)
				{
					if(style == 0)
					{
						histList.push(temp_histList[i]);
					}
				}
				else
				{
					histList.push(temp_histList[i]);
				}
			}



			
			if(histList.length>0){
				$("#app_project_chats_all").removeClass('app_project_tab_force_radius');
			} else {
				$("#app_project_chats_all").addClass('app_project_tab_force_radius');
			}
			if(not_all){
				$("#app_project_chats_all").find("[find=app_project_chats_notif]").removeClass('display_none');
			} else {
				$("#app_project_chats_all").find("[find=app_project_chats_notif]").addClass('display_none');
			}
			for (i = 0; i < 5; i++) { //5 have to be a fix integer to make sure we hide other tabs
				var item = $("#app_project_item_chats_"+i);
				if(item.length<=0){
					continue;
				}
				if(i<histList.length-1){
					item.removeClass('app_project_tab_force_radius');
				} else {
					item.addClass('app_project_tab_force_radius');
				}
				if(histList[i]){
					item.removeClass('display_none');
				} else {
					item.addClass('display_none');
					continue;
				}
				var name = histList[i]['name'];
				var cid = histList[i]['root_type']+"_"+histList[i]['root_id'];
				var timestamp = parseInt(histList[i]['timestamp'], 10);
				var timestamp_root = parseInt(Lincko.storage.get(histList[i]['root_type'], histList[i]['root_id'], 'updated_at'), 10);
				if(name!=item.attr('name')){
					item.off('click');
					item.click(histList[i], function(event){
						var type = 'chats';
						if(event.data.root_type == 'projects'){
							type = 'history';
						}
						submenu_Build("newchat", false, false, {
							type: type,
							id: event.data.root_id,
							title: event.data.title,
						});
					});
				}
				//var last_notif_root = Lincko.storage.getLastNotif(histList[i]['root_type'], histList[i]['root_id']);
				//if(histList[i]['timestamp'] > last_notif_root){
				if(histList[i]['notif']){
					item.find("[find=app_project_chats_notif]").removeClass('display_none');
				} else {
					item.find("[find=app_project_chats_notif]").addClass('display_none');
				}
				if(force || name!=item.attr('name') || timestamp!=parseInt(item.attr('timestamp'), 10) || timestamp_root!=parseInt(item.attr('timestamp_root'), 10)){
					item.find("[find=app_project_chats_title]").html(wrapper_to_html(histList[i]['title']));
					item.find("[find=app_project_chats_date]").html(wrapper_to_html(histList[i]['date']));
					content = wrapper_to_html(wrapper_flat_text(histList[i]['content']));
					if(content==""){ content = "&nbsp;"; } //This helps to keep the tab high consistant
					item.find("[find=app_project_chats_content]").html(content);
					if(histList[i]['by']>0){
						var username = $('<span>').addClass('app_project_chats_content_username').html(Lincko.storage.get('users', histList[i]["by"], "username")+": ");
						item.find("[find=app_project_chats_content]").prepend(username);
					}
					item.find("[find=history_picture]").addClass('display_none');
					item.find("[find=app_project_chats_picture]").append(histList[i]['picture'].clone());
					item.attr('name', name);
					item.attr('cid', cid);
					item.attr('timestamp', timestamp);
					item.attr('timestamp_root', timestamp_root);
				}
				
			}
			mainMenu.chatsSelect();
			clearTimeout(mainMenu.initChatTab_timer);
			mainMenu.initChatTab_timer = false;
		}, timing, force);
	},

};

$("#app_project_chats_all").click(function(event){
	submenu_Build('chat');
});

$("#app_project_projects_all").click(function(event){
	//submenu_Build("projects_list"); //- old method (by bruno)
	submenu_Build("projectsDeck");
});

$('#app_project_settings').click(function(){
	submenu_Build("settings");
});

$('#app_project_projects_new').click(function(event){
	event.stopPropagation();
	submenu_Build("app_project_new");
})
.mouseenter(function(){
	$('#app_project_projects_all').addClass('app_project_projects_all_reset');
})
.mouseleave(function(){
	$('#app_project_projects_all').removeClass('app_project_projects_all_reset');
});

$('#app_project_chats_new').click(function(event){
	event.stopPropagation();
	submenu_Build("app_chat_new");
})
.mouseenter(function(){
	$('#app_project_chats_all').addClass('app_project_chats_all_reset');
})
.mouseleave(function(){
	$('#app_project_chats_all').removeClass('app_project_chats_all_reset');
});

$('#app_project_quick_access_plus').click(function(){
	alert('Customize your quick access'); //toto
});

$('#app_project_quick_access_chat').click(function(){
	submenu_Build('chat_list', false, true, true);
});

$('#app_project_placeholder').click(function(){
	app_content_menu.selection(Lincko.storage.getMyPlaceholder()['_id'], 'tasks');
});

$('#app_project_quick_access_title').click(function(){
	if($('#app_project_quick_access_title').find("[find=app_project_progress_all]").is(':visible')){
		submenu_Build("app_upload_all", true);
	}
});

function app_project_quick_access_title(){
	Elem = $('#'+this.id);
	if(app_upload_files.lincko_numberOfFiles <= 0){
		Elem.find("[find=app_project_upload]").hide();
		Elem.removeClass('app_project_quick_access_title_prog');
		Elem.find("[find=app_project_progress_all]").hide().css('width', 0);
	} else {
		Elem.find("[find=app_project_upload]").show();
		Elem.addClass('app_project_quick_access_title_prog');
		Elem.find("[find=app_project_progress_all]").show().css('width', app_upload_files.lincko_progressall+'%');
	}
	delete Elem;
}

app_application_lincko.add("app_project_projects_tab", ["first_launch", "projects", "settings"], function() {
	mainMenu.projectSelect();
	if(this.updated.first_launch || this.updated.projects){
		if(app_project_update_block){
			app_project_update_launch_projects = true;
		}
		else{
			var force;
			if(storage_first_launch){ force = true; }
			if(this.updated.projects && this.updated.projects._children){ force = true; }
			mainMenu.initProjectTab(force);
		}
	}
});
//toto => the range of this function need to be adjusted over the time according to new items if any more
app_application_lincko.add("app_project_chats_tab", ["first_launch", "projects", "chats", "tasks", "files", "notes", "comments"], function() {
	if(app_project_update_block){
		app_project_update_launch_chats = true;
	} else if(!storage_first_launch){
		mainMenu.initChatTab();
	} else {
		mainMenu.initChatTab(true);
	}
});

app_application_lincko.add("app_project_chats_tab", "notification", function() {
	if(app_project_update_block){
		app_project_update_launch_chats = true;
	} else {
		mainMenu.initChatTab(true, 0);
	}
});

app_application_lincko.add("app_project_quick_access_chat", "users", function() {
	if(Lincko.storage.list('users', 1, {_invitation: true, _id: ['!=', wrapper_localstorage.uid]}).length > 0){
		$('#app_project_quick_access_chat').find("[find=notif]").removeClass('display_none');
	} else {
		$('#app_project_quick_access_chat').find("[find=notif]").addClass('display_none');
	}
	app_models_history.reset();
	if(app_project_update_block){
		app_project_update_launch_chats = true;
	} else {
		mainMenu.initChatTab(true);
	}
});

app_application_lincko.add("app_project_chats_all", ["submenu_hide", "submenu_show"], function() {
	mainMenu.chatsSelect();
});

//This help to wait the update while the mouse is over, it avoids click on wrong tab while a list update
var app_project_update_block = false;
var app_project_update_launch_projects = false;
var app_project_update_launch_chats = false;
$('#app_project_top')
.mouseenter(function(){
	app_project_update_block = true;
})
.mouseleave(function(){
	app_project_update_block = false;
	if(app_project_update_launch_projects){
		mainMenu.initProjectTab();
		app_project_update_launch_projects = false;
	}
	if(app_project_update_launch_chats){
		mainMenu.initChatTab();
		app_project_update_launch_chats = false;
	}
});


/* ++ quick upload ++ */
function app_project_quick_upload_display(Elem, show) {
	var Obj_div = $('#app_project_quick_upload');
	var Obj_img = $('#app_project_quick_upload > div > img');
	var timing = 300;
	var delay = 100;
	if(typeof show === 'undefined') { show = true; }
	if(Elem !== null) {
		if(Elem.length > 0){
			Obj_div.css('margin-bottom', $(window).height() - Elem.offset().top);
		}
	}
	if(Obj_div.is(':visible')){
		$('#app_project_quick_upload_block').hide();
		$.Velocity.RunSequence([
			{ e: Obj_img, p: "transition.expandOut", o: { duration: timing, delay: delay } },
			{ e: Obj_div, p: "transition.slideDownOut", o: { duration: timing, sequenceQueue: false } },
		]);
	} else if(Obj_div.is(':hidden') && show){
		$('#app_project_quick_upload_block').show();
		$.Velocity.RunSequence([
			{ e: Obj_img, p: "transition.expandIn", o: { duration: timing, delay: delay } },
			{ e: Obj_div, p: "transition.slideUpIn", o: { duration: timing, sequenceQueue: false } },
		]);
	}
}

$('#app_project_quick_access_upload').click(function(){
	if(supportsTouch && responsive.test("maxTablet") && navigator.platform.toLowerCase()!="iphone"){
		app_project_quick_upload_display($(this));
	} else {
		app_upload_open_files();
	}
});

$('#app_project_quick_upload_block').click(function(){
	app_project_quick_upload_display(null, false);
	$('#app_project_quick_upload_block').hide();
});

$('#app_project_quick_upload').click(function(){
	app_project_quick_upload_display(null, false);
	$('#app_project_quick_upload_block').hide();
});

var app_project_quick_upload = false;
$('#app_project_quick_upload').children().hover(function(){
	app_project_quick_upload = true;
});
$('#app_project_quick_upload').children().mouseleave(function(){
	app_project_quick_upload = false;
});

$('#app_project_quick_upload_video').click(function(){
	app_upload_open_video();
});

$('#app_project_quick_upload_photo').click(function(){
	app_upload_open_photo();
});

$('#app_project_quick_upload_files').click(function(){
	app_upload_open_files();
});
/* -- quick upload -- */


JSfiles.finish(function() {
	mainMenu.initProjectTab();
	mainMenu.initChatTab();
	app_application_lincko.add("app_project_quick_access_title", "upload", app_project_quick_access_title);
});

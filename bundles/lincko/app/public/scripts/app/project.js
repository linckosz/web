var mainMenu = {

	initProjectTab: function(){
		var projectList = Lincko.storage.list('projects', null, {_id:['!=', Lincko.storage.getMyPlaceholder()['_id']]});
		var tasks;
		var notes;
		var files;

		var adjust_format = function(num){
			num = parseInt(num, 10);
			var str = num;
			if(num<100){
				str = "&nbsp;"+str;
			}
			if(num<10){
				str = "&nbsp;"+str;
			}
			if(num<1){
				str = "&nbsp;&nbsp;0";
			}
			return str;
		}

		var projects_length = projectList.length;
		if(projects_length>0){
			projects_length = "("+projects_length+")";
		} else {
			projects_length = "";
		}
		$("#app_project_projects_all").find("[find=app_project_projects_all_number]").html(wrapper_to_html(projects_length));

		for (i = 0; i < 5; i++) {
			var item = $("#app_project_item_projects_"+i);
			if(item.length<=0){
				continue;
			}
			if(projectList[i]){
				item.removeClass('display_none');
			} else {
				item.addClass('display_none');
				continue;
			}
			var pid = parseInt(projectList[i]['_id'], 10);
			var timestamp = parseInt(projectList[i]['updated'], 10);
			if(pid!=parseInt(item.attr('pid'), 10)){
				item.click(pid, function(event){
					app_content_menu.selection(event.data, 'tasks');
				});
			}
			if(pid!=parseInt(item.attr('pid'), 10) || timestamp!=parseInt(item.attr('timestamp'), 10)){
				item.find("[find=app_project_projects_title]").html(wrapper_to_html(projectList[i]['+title']));
				tasks = adjust_format(Lincko.storage.list('tasks', null, {approved: false,}, 'projects', pid, true).length);
				notes = adjust_format(Lincko.storage.list('notes', null, null, 'projects', pid, true).length);
				files = adjust_format(Lincko.storage.list('files', null, null, 'projects', pid, true).length);
				item.find("[find=app_project_projects_tasks]").html(wrapper_to_html(tasks));
				item.find("[find=app_project_projects_notes]").html(wrapper_to_html(notes));
				item.find("[find=app_project_projects_files]").html(wrapper_to_html(files));
				item.attr('pid', pid);
				item.attr('timestamp', timestamp);
			}
		}
	},

	initChatTab: function(){
		var histList = app_models_history.tabList(5);
		var content;
		for (i = 0; i < 5; i++) {
			var item = $("#app_project_item_chats_"+i);
			if(item.length<=0){
				continue;
			}
			if(histList[i]){
				item.removeClass('display_none');
			} else {
				item.addClass('display_none');
				continue;
			}
			var name = histList[i]['name'];
			var timestamp = parseInt(histList[i]['timestamp'], 10);
			if(name!=item.attr('name')){
				item.click(histList[i], function(event){
					submenu_Build("newchat", false, false, {
						type: event.data.root_type,
						id: event.data.root_id,
						title: event.data.title,
					});
				});
			}
			if(histList[i]['notif']){
				item.find("[find=app_project_chats_notif]").removeClass('display_none');
			} else {
				item.find("[find=app_project_chats_notif]").addClass('display_none');
			}
			if(name!=item.attr('name') || timestamp!=parseInt(item.attr('timestamp'), 10)){
				item.find("[find=app_project_chats_title]").html(wrapper_to_html(histList[i]['title']));
				item.find("[find=app_project_chats_date]").html(wrapper_to_html(histList[i]['date']));
				content = wrapper_flat_text(histList[i]['content']);
				item.find("[find=app_project_chats_content]").html(wrapper_to_html(content));
				item.find("[find=history_picture]").remove();
				item.find("[find=app_project_chats_picture]").append(histList[i]['picture']);
				item.attr('name', name);
				item.attr('timestamp', timestamp);
			}
		}
	},

};

$("#app_project_chats_all").click(function(event){
	submenu_Build('chat');
});

$("#app_project_projects_all").click(function(event){
	submenu_Build("projects_list");
});

$('#app_project_settings').click(function(){
	submenu_Build("settings");
});

$('#app_project_projects_new').click(function(event){
	event.stopPropagation();
	submenu_Build("app_project_new");
});

$('#app_project_chats_new').click(function(event){
	event.stopPropagation();
	submenu_Build("app_chat_new");
});

$('#app_project_quick_access_plus').click(function(){
	alert('Customize your quick access'); //toto
});

$('#app_project_quick_access_chat').click(function(){
	submenu_Build('chat', false, true, true);
});

$('#app_project_quick_access_upload').click(function(){
	submenu_Build("app_upload_all", true);
});

$('#app_project_placeholder').click(function(){
	app_content_menu.selection(Lincko.storage.getMyPlaceholder()['_id'], 'tasks');
});

JSfiles.finish(function() {
	mainMenu.initProjectTab();
	mainMenu.initChatTab();
});

app_application_lincko.add("app_project_projects_tab", "projects", function() {
	if(app_project_update_block){
		app_project_update_launch_projects = true;
	} else {
		mainMenu.initProjectTab();
	}
});
//toto => the range of this function need to be adjusted over the time accoring to new items if any more
app_application_lincko.add("app_project_chats_tab", ["projects", "chats", "tasks", "files", "notes", "comments"], function() {
	if(app_project_update_block){
		app_project_update_launch_chats = true;
	} else {
		mainMenu.initChatTab();
	}
});


// START - ANIMATED MENU FOR ULOAD FILES

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
	if(responsive.test("maxTablet")){
		app_project_quick_upload_display($(this));
	} else {
		$('#app_project_quick_upload_files').click();
	}
});

$('#app_project_quick_upload_block').click(function(){
	if($('#app_project_quick_upload').is(':visible') && !app_project_quick_upload){
		app_project_quick_upload_display(null, false);
	}
});

$('#app_project_quick_upload').click(function(){
	if($('#app_project_quick_upload').is(':visible') && !app_project_quick_upload){
		app_project_quick_upload_display(null, false);
	}
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

// END - ANIMATED MENU FOR ULOAD FILES


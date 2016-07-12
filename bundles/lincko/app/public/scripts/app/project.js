var mainMenu = (function() {
	var init = false;
	function orderList(list) {
		return list.sort(function(a, b) {
			return b.timestamp - a.timestamp;
		});
	}

	function feedChatItem(position, data) { //This function is called too many times
		var item = $("#-app_project_chat_item").clone();
		var name = '';
		$(position).append(item);
		item.prop("id", 'app_project_chat_item_'+data.id);
		item.removeAttr('style', '');
		var cnt = notifier[data.type]['get'](data.id);
		if (cnt) {
			if (cnt > 999) {
				item.find('.notification').html('...').show();
			} else {
				item.find('.notification').html(cnt).show();
			}
		}

		if (data.type == "history") {
			data.comment = php_nl2br(data.comment);
			name = Lincko.storage.get("projects", data.id, "+title");
			item.find('img.logo_img').remove();
			item.find('span.logo').addClass('fa fa-globe');
		} else if (data.type == 'chats') {
			data.comment = wrapper_to_html(data.comment);
			var chat = Lincko.storage.get('chats', data.id);
			if(chat["single"]){
				name = "";
				user_icon = false;
				var src = app_application_icon_single_user.src;
				if(chat["_perm"][wrapper_localstorage.uid]){
					var perso = Lincko.storage.get('users', wrapper_localstorage.uid);
					name = perso["-username"];
					src = Lincko.storage.getLinkThumbnail(perso['profile_pic']);
					if(!src){
						src = app_application_icon_single_user.src;
					} else {
						user_icon = true;
					}
				}
				for(var i in chat["_perm"]){
					if(i!=wrapper_localstorage.uid){
						var perso = Lincko.storage.get('users', i);
						name = perso["-username"];
						src = Lincko.storage.getLinkThumbnail(perso['profile_pic']);
						if(!src){
							src = app_application_icon_single_user.src;
						} else {
							user_icon = true;
						}
						break;
					}
				}
				if(user_icon){
					item.find('img.logo_img').removeClass("display_none");
					item.find('img.logo_img').attr('src', src);
					item.find('span.logo').addClass("display_none");
				} else {
					item.find('span.logo').removeClass("display_none");
					item.find('span.logo').addClass('icon-Single-Person');
					item.find('img.logo_img').addClass("display_none");
				}
			} else {
				name = Lincko.storage.get('chats', data.id, '+title');
				item.find('span.logo').removeClass("display_none");
				item.find('span.logo').addClass('icon-Multiple-People');
				item.find('img.logo_img').addClass("display_none");
			}
		}
		app_application_lincko.add('app_project_chat_item_'+data.id, data.type + "_" + data.id, function() {
			var range = Object.keys(this.range)[0].split("_");
			var type = range[0];
			var id = range[1];
			var item = $("#"+this.id);
			var cnt = notifier[type]['get'](id);
			if (type == "chats") {
				var chat = Lincko.storage.get('chats', id);
				if(chat["single"]){
					name = "";
					user_icon = false;
					var src = app_application_icon_single_user.src;
					if(chat["_perm"][wrapper_localstorage.uid]){
						var perso = Lincko.storage.get('users', wrapper_localstorage.uid);
						name = perso["-username"];
						src = Lincko.storage.getLinkThumbnail(perso['profile_pic']);
						if(!src){
							src = app_application_icon_single_user.src;
						} else {
							user_icon = true;
						}
					}
					for(var i in chat["_perm"]){
						if(i!=wrapper_localstorage.uid){
							var perso = Lincko.storage.get('users', i);
							name = perso["-username"];
							src = Lincko.storage.getLinkThumbnail(perso['profile_pic']);
							if(!src){
								src = app_application_icon_single_user.src;
							} else {
								user_icon = true;
							}
							break;
						}
					}
					if(user_icon){
						item.find('img.logo_img').removeClass("display_none");
						item.find('img.logo_img').attr('src', src);
						item.find('span.logo').addClass("display_none");
					} else {
						item.find('span.logo').removeClass("display_none");
						item.find('span.logo').addClass('icon-Single-Person');
						item.find('img.logo_img').addClass("display_none");
					}
				} else {
					name = Lincko.storage.get('chats', data.id, '+title');
					item.find('span.logo').removeClass("display_none");
					item.find('span.logo').addClass('icon-Multiple-People');
					item.find('img.logo_img').addClass("display_none");
				}
				$("#"+this.id).find('header').html(wrapper_to_html(name));
				var comment = Lincko.storage.list("comments", 1, null, "chats", id);
				if(typeof comment[0] == "object"){
					$("#"+this.id).find('[find=description]').html(wrapper_to_html(comment[0]["+comment"]));
				}
				$("#"+this.id).find('[find=description]').html('');
			}
			if (cnt) {
				if (cnt > 999) {
					$("#"+this.id).find('.notification').html('...').show();
				} else {
					$("#"+this.id).find('.notification').html(cnt).show();
				}
			}
			else {
				$("#"+this.id).find('.notification').hide();
			}
		});
		item.find('header').html(wrapper_to_html(name));
		item.find('article').html(data.comment);
		return item;
	}
	function initChatTab() {
		$("#app_project_chat").find(".app_project_chat_item").remove();
		//get list
		var chatHistoryList = orderChatList(4);

		//caculate
		for (var c in chatHistoryList) {
			var item = feedChatItem('#app_project_chat', chatHistoryList[c]);
			var data = chatHistoryList[c];
			if(data.type == "chats"){
				item.addClass("app_project_chat_item_chats");
			} else if(data.type == "history"){
				item.addClass("app_project_chat_item_history");
			}
			item.on("click", data, function(event) {
				var title;
				if (event.data.type == 'chats') {
					title = $(this).find('header').text();
				} else {
					title = Lincko.storage.get("projects", event.data.id, "+title");
				}
				//render
				submenu_Build("newchat", false, false, {
					type: event.data.type,
					id: event.data.id,
					title: title,
				});
			});
		}
	}

	function initProjectTab() {
		$("#app_project_tab").find(".app_project_item").remove();
		var projectList = Lincko.storage.list('projects', 4, {_id:['!=', Lincko.storage.getMyPlaceholder()['_id']]});
		var tasks;
		var notes;
		var files;

		var projects_all = Lincko.storage.list('projects').length;
		$("#app_project_tab").find("[find=app_project_all_number]").html("("+projects_all+")");

		//caculate
		for (var p in projectList) {
				var item = $("#-app_project_item").clone();
				item.prop("id", '');
				$('#app_project_tab').append(item);
				var pid = projectList[p]._id;
				item.click(pid, function(event){
					app_content_menu.selection(event.data, 'tasks');
				});
				item.removeAttr('id', '');
				item.removeAttr('style', '');
				item.find('p').text(projectList[p]['+title']);

				tasks = Lincko.storage.list('tasks', null, {approved: false,}, 'projects', pid, true).length;
				notes = Lincko.storage.list('notes', null, null, 'projects', pid, true).length;
				files = Lincko.storage.list('files', null, null, 'projects', pid, true).length;

				item.find("[find=submenu_projects_statistics_tasks]").html(wrapper_to_html(tasks));
				item.find("[find=submenu_projects_statistics_notes]").html(wrapper_to_html(notes));
				item.find("[find=submenu_projects_statistics_files]").html(wrapper_to_html(files));
		}
	}

	function initMainMenuEvents() {
		$("#app_project_content .icon-Settings").off("click").on("click", function() {
			submenu_Build("settings");
		});

		$("#app_project_chat header").off("click").on("click", function() {
			submenu_Build('chat');
		});

	}

	/*
		Get an ordered chat history list for unlimited number
		or limited number.
		number: limit of rows of items which will report
		project_id: given if just target a specific project not the main menu
	*/
	function orderChatList(number, project_id) {
		var merge_list = [];
		// each item should be:
		// {'type': ['history'|'chat'], 'id': ['project_id'|'chat_id'], 'timestamp': 'the_latest_update_history_or_chat'}
		//get project list
		if(typeof number == "undefined"){
			number = null;
		} else {
			number = Math.floor(number/2);
		}
		var project_list = Lincko.storage.list('projects', number);

		//get the most recent history for each project
		for (var p in project_list) {
			if (project_id && project_list[p]._id != project_id) {
				continue;
			}
			//var e1 = Lincko.storage.hist('recent', project_list[p]._id, 1)[0];
			var e1 = Lincko.storage.hist(null, 1, {cod:['!=', 203]}, 'projects', project_list[p]._id, true)[0];
			var e2 = Lincko.storage.list('comments', 1, {recalled_by: ['<',1]}, 'projects', project_list[p]._id, false)[0];
			if (e1) {
				var timestamp = e1.timestamp;
				var txt = Lincko.storage.getHistoryInfo(e1).title;
			}
			if (e2 && e1.timestamp < e2.created_at) {
				var timestamp = e2.created_at;
				var txt = e2['+comment'];
			}
			if (e1) {
				merge_list.push({
					'type': 'history',
					'id': project_list[p]._id,
					'timestamp': timestamp,
					'comment': txt,
				});
			}
		}
		if (project_id) {
			 // Get chats belong to specific project
			var chat_list = Lincko.storage.list('chats', number, null, 'projects', project_id, false);
		}
		else {
			 // Get all chats
			var chat_list = Lincko.storage.list('chats', number, null, null, null, false);
		}
		//get the most recent comment for each project
		for (var c in chat_list) {
			var timestamp = chat_list[c].updated_at;
			var comment = Lincko.storage.list('comments', 1, {recalled_by: null}, 'chats', chat_list[c]._id);
			if(comment.length>0){
				merge_list.push({
					'type': 'chats',
					'id': chat_list[c]._id,
					'timestamp': timestamp,
					'comment': comment[0]['+comment'],
				});
			}
			else {
				merge_list.push({
					'type': 'chats',
					'id': chat_list[c]._id,
					'timestamp': timestamp,
					'comment': "",
				});
			}
		}
		return orderList(merge_list);
	}
	function initTabs() {
		if (!init) {
			initProjectTab();
			initChatTab();
			initMainMenuEvents();
			init = true;
		}
		return;
	}
	return {
		'init': initTabs,
		'getlist': orderChatList,
		'feed': feedChatItem,
		'initProjectTab': initProjectTab,
		'initChatTab': initChatTab,
	};
})();

var project_garbage = app_application_garbage.add();
app_application_lincko.add(project_garbage, 'first_launch', function() {
	if(typeof project_garbage != 'undefined' && !$.isEmptyObject(Lincko.storage.data)){
		mainMenu.init(); //toto => mainMenu.init() has an issue, thereis an undefined variable somewhere
		app_application_garbage.remove(this.id);
		delete project_garbage;
	}
});

app_application_lincko.add("app_project_tab", 'projects', function() {
	mainMenu.initProjectTab();
});

app_application_lincko.add("app_project_chat", '*', function() {
	mainMenu.initChatTab();
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

$('#app_project_settings_img').click(function(){
	submenu_Build("settings");
});

$('#app_project_quick_access_tasks').click(function(){
	var personalSpace = Lincko.storage.getMyPlaceholder();
	if(personalSpace){
		personalSpace = personalSpace['_id'];
		submenu_Build('taskdetail', false, false, 
			{
				type:'tasks',
				id: 'new', 
				projID: personalSpace,

			}, false);
	}
});

$('#app_project_quick_access_notes').click(function(){
	var personalSpace = Lincko.storage.getMyPlaceholder();
	if(personalSpace){
		personalSpace = personalSpace['_id'];
		submenu_Build('taskdetail', false, false, 
			{
				type:'notes',
				id: 'new', 
				projID: personalSpace,

			}, false);
	}
});

$('#app_project_quick_access_chat').click(function(){
	submenu_Build('chat', false, true, true);
});

$('#app_project_project_new').click(function(){
	submenu_Build("app_project_new");
});
$('#app_project_tab > header').click(function(){
	submenu_Build("projects_list");
});

$('#app_project_quick_access_title').click(function(){
	if($('#app_project_quick_access_title').find("[find=app_project_progress_all]").is(':visible')){
		submenu_Build("app_upload_all", true);
	}
});

function app_project_quick_access_title(Elem_id){
	Elem = $('#'+Elem_id);
	if(app_upload_files.lincko_numberOfFiles <= 0){
		Elem.find("[find=app_project_upload]").hide();
		Elem.find("[find=app_project_quick_access]").show();
		Elem.removeClass('app_project_quick_access_title_prog');
		Elem.find("[find=app_project_progress_all]").hide().css('width', 0);
	} else {
		Elem.find("[find=app_project_quick_access]").hide();
		Elem.find("[find=app_project_upload]").show();
		Elem.addClass('app_project_quick_access_title_prog');
		Elem.find("[find=app_project_progress_all]").show().css('width', app_upload_files.lincko_progressall+'%');
	}
	delete Elem;
}

function app_project_quick_access() {
	var exist;
	if(typeof app_application_lincko !== 'undefined' && typeof app_upload_files !== 'undefined'){
		app_application_lincko.add("app_project_quick_access_title", "upload", app_project_quick_access_title);
	}
}

//Hide some projects if the window is not high enough
function app_project_tab() {
	var limit = 100; //Just to insure to not make an infinite loop, but should be useless
	var top_height = $(window).height() - $('#app_project_quick_access').height();
	$('#app_project_tab [id^="app_project_project_open_"]').show();
	$('#app_project_recent').show();
	while($('#app_project_top').height() >= top_height && limit>0){
		if($('#app_project_tab [id^="app_project_project_open_"]').filter(':visible').length>1){
			$('#app_project_tab [id^="app_project_project_open_"]').filter(':visible').last().hide();
		} else {
			$('#app_project_recent').hide();
			limit = 0;
			break;
		}
		limit--;
	}
}

var app_project_build = {
	
	scan: function(){
		//Limit favorite number to 5
		var max_display = 5;
		var list = Lincko.storage.list('projects');
		var timestamp;
		//First we scan and remove all elements that does not appear in the list
		var list_id = {};
		for(var position in list){
			list_id[list[position]['_id']] = true;
		}
		$('#app_project_tab').find('[projectvisible^="1"]').each(
			function(index, Elem ){
				if(typeof list_id[$(Elem).attr('projectid')] === 'undefined'){
					$(Elem).attr('projectvisible', 0);
				}
			}
		);
		for(var position in list){
			timestamp = list[position]['_timestamp'];
			Elem = $('#app_project_project_open_'+list[position]['_id']);
			if(Elem.length === 0){
				app_project_build.insertProject( list[position]['_type'], list[position]['_id'], list[position]['+title'], position, timestamp );
			} else {
				app_project_build.moveProject(Elem, position);
				if(Elem.attr('timestamp') != timestamp){
					app_project_build.removeProject(Elem);
				}
			}
		}

		app_project_build.removeProjectFrom(max_display);

		if(list.length<=0 && $("#app_project_project_all").is(':visible')){
			$('#app_project_project_all').velocity("slideUp", { duration: 200, delay: 100, complete: function(){
				app_project_tab();
			}, });
		} else if(list.length>0 && !$("#app_project_project_all").is(':visible')){
			$('#app_project_project_all').velocity("slideDown", { duration: 200, delay: 100, complete: function(){
				app_project_tab();
			}, });
		}
	},

	insertProject: function(item_type, item_id, item_title, position, timestamp) {
		if($('#app_project_project_open_'+item_id).length===0){
			var Elem = $('#-app_project_project_open').clone();
			Elem.prop('id', 'app_project_project_open_'+item_id);
			Elem.attr('timestamp', timestamp);
			Elem.attr('projectid', item_id);
			app_project_build.feedProject(Elem, item_title);
			Elem.click(function(){
				app_content_menu.selection(item_id, 'tasks');
			});
			Elem.hide();
			var Elem_position = $('#app_project_tab').find('[projectvisible^="1"]').eq(position);
			if(Elem_position.length==0){
				Elem.insertBefore($('#app_project_project_all'));
			} else {
				Elem.insertBefore(Elem_position);
			}
			Elem.velocity("slideDown", { duration: 200, delay: 100, complete: function(){
				app_project_tab();
			}, });
			app_application_lincko.add(Elem.prop('id'), item_type+"_"+item_id, app_project_build._app_feedProject, [item_id, item_type]);
			return Elem;
		}
		return false;
	},

	feedProject: function(Elem, item_title){
		var title = Elem.find("[find=app_project_project_title]");
		var timing = 300;
		var delay = 60;
		if(wrapper_to_html(item_title) != title.html()){
			if(title.html()){
				var Sequence = [
					{ e: title, p: { opacity: 0, }, o: { duration: timing, delay: delay,
						complete: function(){ title.html(wrapper_to_html(item_title)); },
					} },
					{ e: title, p: { opacity: 1, }, o: { duration: timing, sequenceQueue: true, } },
				];
				$.Velocity.RunSequence(Sequence);
			} else {
				title.html(wrapper_to_html(item_title));
			}
		}
	},

	_app_feedProject: function(){
		var item_id = this.action_param[0];
		var item_type = this.action_param[1];
		var item = Lincko.storage.get(item_type, item_id);
		if(item && item['_timestamp'] != $('#'+this.id).attr('timestamp')){
			var item_title = item['+title'];
			app_project_build.feedProject($('#'+this.id), item_title);
		}
	},

	moveProject: function(Elem, position){
		if(Elem.length>0){
			var Elem_position = $('#app_project_tab').find('[projectvisible^="1"]').eq(position);
			if(Elem.prop('id') != Elem_position.prop('id')){
				var Elem_clone = Elem.clone();
				Elem.prop('id', null);
				app_project_build.removeProject(Elem);
				Elem_clone.insertBefore(Elem_position);
				Elem_clone.velocity("slideDown", { duration: 200, delay: 100, complete: function(){
					app_project_tab();
				}, });
			}
		}
	},

	removeProject: function(Elem){
		if(Elem.length>0){
			$(Elem).attr('projectvisible', 0);
			Elem.velocity("slideUp", { duration: 200, delay: 100, });
		}
	},

	removeProjectFrom: function(max_display){
		$('#app_project_tab').find('[projectvisible^="1"]').each(
			function(index, Elem ){
				Elem = $(Elem);
				if(index >= max_display){
					$(this).attr('projectvisible', 0);
				}
			}
		);
		$('#app_project_tab').find('[projectvisible^="0"]').velocity("slideUp", { duration: 200, delay: 100, complete: function(){
			$(this).remove();
		}, });

	},
};

var app_project_info = {

	current: false,

	build: function(){
		var item = Lincko.storage.hist(null, 1); //Latest
		var time = 300;
		if(Lincko.storage.isHistoryReady() && item){
			var history = Lincko.storage.getHistoryInfo(item);
			if(history.title===null){ return false; }
			if(JSON.stringify(item) !== app_project_info.current){
				if(app_project_info.current){
					if($('#app_project_recent').is(':hidden')){
						$('#app_project_recent').show();
					}
					$('#app_project_info').clearQueue().stop().velocity(
						"transition.fadeOut",
						{
							duration: time,
							delay: 60,
							complete: function(){
								$('#app_project_info').velocity(
									"transition.fadeIn",
									{
										duration: time,
										delay: 60,
										begin: function(){
											// We don't need to use wrapper_to_html for 'history' because the text is already protected in history format method
											$('#app_project_info_title').html(php_nl2br(history.title));
											$('#app_project_info_content').html(php_nl2br(history.content));
											$(this).show();
											app_project_tab();
										},
									}
								);
							},
						}
					);
				} else {
					$('#app_project_recent').clearQueue().stop().velocity(
						"transition.fadeIn",
						{
							duration: time,
							delay: 60,
							begin: function(){
								$('#app_project_info_title').html(php_nl2br(history.title));
								$('#app_project_info_content').html(php_nl2br(history.content));
								$(this).show();
								app_project_tab();
							},
						}
					);
				}
				app_project_info.current = JSON.stringify(item);
			}
		} else {
			if($('#app_project_recent').is(':visible')){
				$('#app_project_recent').velocity("transition.fadeOut", { duration: time, delay: 100, complete: function(){
					app_project_tab();
					$('#app_project_info_title').empty();
					$('#app_project_info_content').empty();
				}, });
			}
			app_project_info.current = false;
		}
		return true;
	},
}

var app_project_search = {

	timing: null,

	value: null,

	find: function(timer, force){
		var that = this;
		var param = $("#app_project_search").val();
		if(typeof timer !== 'number'){ timer = 600; } //Add a small timeout of 600ms to let the use be able to finish 
		if(typeof force !== 'boolean'){ force = false; }
		
		if((responsive.test("minTablet") || force) && param.length>=2 && this.value !== param){
			clearTimeout(this.timing);
			this.timing = setTimeout(function(){
				that.value = param;
				var results = Lincko.storage.search('word', param);
				if(!$.isEmptyObject(results)){

					//Do something with the result
					console.log(results);

				}
			}, timer);
		} else if(param.length<2){
			clearTimeout(this.timing);
		}
	},
};

$("#app_project_search").on({
	focus: function(){ app_project_search.find(); },
	blur: function(){
		$("#app_project_search").val('');
	},
	change: function(){ app_project_search.find(); },
	copy: function(){ app_project_search.find(); },
	past: function(){ app_project_search.find(); },
	cut: function(){ app_project_search.find(); },
	keyup: function(e) {
		if (e.which != 13) {
			app_project_search.find();
		}
	},
	keypress: function(e) {
		if (e.which == 13) {
			app_project_search.find(0, true);
		}
	},
});

$('#app_project_placeholder').click(function(){
	app_content_menu.selection(Lincko.storage.getMyPlaceholder()['_id'], 'dashboard');
});

$('#app_project_info').click(function(){
	app_content_menu.selection(Lincko.storage.getMyPlaceholder()['_id'], 'history');
});

$('#app_project_workspace').click(function(){
	app_content_menu.selection(-1, 'statistics');
});

var app_project_tab_timer;
JSfiles.finish(function(){
	$('#app_project_recent').hide();
	app_project_quick_access();
	app_project_tab();
	app_project_build.scan();
	app_project_info.build();
	$(window).resize(function(){
		clearTimeout(app_project_tab_timer);
		app_project_tab_timer = setTimeout(app_project_tab, wrapper_timeout_timer);
	});
	
	app_application_lincko.add(app_project_info.build);
	app_application_lincko.add(app_project_build.scan, 'projects');
	
	app_application_lincko.add("app_project_user", "users_"+wrapper_localstorage.uid, function(){
		var username = '';
		var email = '';
		var user = Lincko.storage.get('users', wrapper_localstorage.uid);
		if(user['-firstname'] && user['-lastname']){
			username = user['-firstname'].ucfirst()+' '+user['-lastname'].ucfirst();
		} else if(user['-firstname']){
			username = user['-firstname'].ucfirst();
		} else if(user['-username']){
			username = user['-username'].ucfirst();
		}
		if(user['email']){
			email = user['email'].toLowerCase();
		}
		if(typeof user['gender'] !== 'undefined' && user['gender'] == 1){
			$('#app_project_user_image').attr('src', app_project_img_user_female.src);
		} else {
			$('#app_project_user_image').attr('src', app_project_img_user_male.src);
		}
		$('#app_project_user_name').html(wrapper_to_html(username));
		$('#app_project_user_email').html(wrapper_to_html(email));
	});

	app_application_lincko.add("app_project_user_workspace_mobile", "workspaces", function(){
		$('#app_project_user_workspace_mobile').html(wrapper_to_html(Lincko.storage.WORKNAME));
	});

	app_application_lincko.add("app_project_user_workspace", "workspaces", function(){
		$('#app_project_user_workspace').html(wrapper_to_html(Lincko.storage.WORKNAME));
	});
	
	app_application_lincko.prepare(true, true); //Update everything
});

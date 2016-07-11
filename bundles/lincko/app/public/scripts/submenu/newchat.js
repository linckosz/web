submenu_list['newchat'] = {
	//Set the title of the top
	"_title": {
		"style": "customized_title",
		"title": function(elem){
			return elem.param.title;
		}, //chat room you are in
		"class": "submenu_newchat_header",
	},
	"left_button": {
		"style": "title_left_button",
		"title": Lincko.Translation.get('app', 25, 'html'), //Close
		'hide': true,
		"class": "base_pointer submenu_newchat_header_close",
	},
	"right_button": {
		"style": "title_right_button",
		"title": "",
		"class": "icon-SmallPersonaiconBlack base_pointer chat_add_person display_none",
		"action": function(Elem, that) {
			var all_users = [];
			var checked_users = [];
			var userList = [];
			submenu_Build('contacts', true, false, {type: 'chats', }, that.preview);
		}
	},
	"new_chat_menu": {
		"style": "new_chat_menu",
		"title": "",
	},
	"chat_contents": {
		"style": "chat_contents",
		"title": "",
	},
};

Submenu_select.chat_contents = function(subm) {
	subm.Add_ChatContents();
}
Submenu_select.new_chat_menu = function(subm) {
	subm.New_Add_ChatMenu();
};

Submenu.prototype.Add_ChatContents = function() {
	var attribute = this.attribute;
	var that = this;
	var id = this.param.id;
	var type = this.param.type;
	var latest_comment = 0;
	var latest_history = 0;
	var overthrow_id = "overthrow_"+that.id;
	submenu_wrapper = this.Wrapper();
	var position = submenu_wrapper.find("[find='submenu_wrapper_content']");
	position.addClass('overthrow').addClass("submenu_chat_contents");

	chatFeed.feedHistory(position, type, id, that);

	app_application_lincko.add("overthrow_"+that.id, "submenu_show_"+that.preview+"_"+that.id, function() {
		var submenu_id = this.action_param[0];
		var scroll_time = this.action_param[1];
		var overthrow_id = "overthrow_"+submenu_id;
		var last = $("#"+overthrow_id).find(".models_history_wrapper:last-of-type");
		if(myIScrollList[overthrow_id] && last && last[0]){
			myIScrollList[overthrow_id].refresh();
			myIScrollList[overthrow_id].scrollToElement(last[0], scroll_time);
		}
		this.action_param[1] = 300;
		notifier[this.action_param[2]]['clear'](this.action_param[3]);
	}, [that.id, 0, type, id]);

	notifier[type]['clear'](id);
	if (type == 'history') {
		app_application_lincko.add(this.id+"_chat_contents_wrapper","projects_" + id, function() {
			//toto => there is an undefined somewhere
			var id = Object.keys(this.range)[0].split("_")[1];
			var position = submenu_wrapper.find("[find='submenu_wrapper_content']");
			var items = Lincko.storage.hist(null, -1, {'by': ["!=", wrapper_localstorage.uid], 'timestamp': [">=", latest_history]}, 'projects', id, false);
			for(var i in items){
				if(items[i]["timestamp"] > latest_history && latest_history < Lincko.storage.getLastVisit()){
					latest_history = items[i]["timestamp"];
				}
			}

			chatFeed.appendItem("history", items, position, true);
			var overthrow_id = "overthrow_"+this.action_param[0];
			var last = $("#"+overthrow_id).find(".models_history_wrapper:last-of-type");
			if(myIScrollList[overthrow_id] && last && last[0]){
				if(myIScrollList[overthrow_id].maxScrollY - myIScrollList[overthrow_id].y > -100){
					myIScrollList[overthrow_id].refresh();
					var scroll_time = 0;
					if(!supportsTouch || responsive.test("minDesktop")){ scroll_time = 300; }
					myIScrollList[overthrow_id].scrollToElement(last[0], scroll_time);
				}
			}
			notifier['history']['clear'](this.action_param[1]);
			
		}, [that.id, id]);
	}
	else {
		app_application_lincko.add(this.id+"_chat_contents_wrapper", "chats_" + id, function() {
			//toto => there is an undefined somewhere
			var id = Object.keys(this.range)[0].split("_")[1];
			var type = Object.keys(this.range)[0].split("_")[0];
			var position = submenu_wrapper.find("[find='submenu_wrapper_content']");
			var items = Lincko.storage.list('comments', -1, {'created_by': ["!=", wrapper_localstorage.uid], 'created_at': [">=", latest_comment]}, 'chats', id, false);
			for(var i in items){
				if(items[i]["created_at"] > latest_comment && latest_comment < Lincko.storage.getLastVisit()){
					latest_comment = items[i]["created_at"];
				}
			}
			chatFeed.appendItem(type, items, position, true);
			chatFeed.updateRecalled(id,position);
			chatFeed.updateTempComments(id,position);


			var overthrow_id = "overthrow_"+this.action_param[0];
			var last = $("#"+overthrow_id).find(".models_history_wrapper:last-of-type");
			if(myIScrollList[overthrow_id] && last && last[0]){
				if(myIScrollList[overthrow_id].maxScrollY - myIScrollList[overthrow_id].y > -100){
					myIScrollList[overthrow_id].refresh();
					var scroll_time = 0;
					if(!supportsTouch || responsive.test("minDesktop")){ scroll_time = 300; }
					myIScrollList[overthrow_id].scrollToElement(last[0], scroll_time);
				}
			}
			
			notifier['chats']['clear'](this.action_param[1]);
			
		}, [that.id, id]);
	}
}

Submenu.prototype.New_Add_ChatMenu = function() {
	var attribute = this.attribute;
	var submenu_wrapper = this.Wrapper();
	submenu_wrapper.addClass("submenu_chats");
	var Elem = $('#-submenu_app_chat_bottom').clone();
	var that = this;
	Elem.prop("id", '');
	submenu_wrapper.find("[find=submenu_wrapper_bottom]").addClass('submenu_bottom');
	submenu_wrapper.find("[find=submenu_wrapper_content]").css('bottom', submenu_wrapper.find("[find=submenu_wrapper_bottom]").height());
	if ("class" in attribute) {
		Elem.addClass(attribute['class']);
	}
	submenu_wrapper.find("[find=submenu_wrapper_bottom]").addClass("submenu_chats_no_background_image").append(Elem);

	function send_comments() {
		var textarea = $("#"+that.id).find("[find=chat_textarea]");
		var content = textarea.text();
		var type = that.param.type == 'history' ? "projects":'chats';
		var sub_that = that;
		var tmpID = [];

		textarea.text('');

		wrapper_sendAction({
				'comment': content,
				'parent_type': type,
				'parent_id': that.param.id,
			},
			'post',
			'comment/create',
			function(msg, data_error, data_status, data_msg) {
				app_application_lincko.prepare(["chat_contents_wrapper", type+"_" + sub_that.param.id]);
				app_application_lincko.prepare("submenu_show");
				var overthrow_id = "overthrow_"+sub_that.id;
				var last = $("#"+overthrow_id).find(".models_history_wrapper:last-of-type");
				if(myIScrollList[overthrow_id] && last && last[0]){
					myIScrollList[overthrow_id].refresh();
					var scroll_time = 0;
					if(!supportsTouch || responsive.test("minDesktop")){ scroll_time = 200; }
					myIScrollList[overthrow_id].scrollToElement(last[0], scroll_time);
				}

				//recall comment if in queue
				$.each(data_msg.partial[wrapper_localstorage.uid].comments, function(id, item){
					if(app_moels_chat_recallQueue[item.temp_id]){
						app_moels_chat_recallQueue.sendAction(id);
					}
				});
			},
			null,
			function(jqXHR, settings, temp_id) {
				tmpID.push(temp_id);
				if($.trim(content)==''){ return false; }
				var position = $("[find='submenu_wrapper_content']", submenu_wrapper);	
				//Display a temp comment				
				var fake_comment = {
					"+comment": content,
					"_id": temp_id,
					"_type": "comments",
					"created_at":  Math.floor((new Date()).getTime() / 1000),
					"created_by": wrapper_localstorage.uid,
					"new": false,
				};
				chatFeed.appendItem('comments', [fake_comment], position, true);
				var overthrow_id = "overthrow_"+sub_that.id;
				var last = $("#"+overthrow_id).find(".models_history_wrapper:last-of-type");
				if(myIScrollList[overthrow_id] && last && last[0]){
					myIScrollList[overthrow_id].refresh();
					var scroll_time = 0;
					if(!supportsTouch || responsive.test("minDesktop")){ scroll_time = 200; }
					myIScrollList[overthrow_id].scrollToElement(last[0], scroll_time);
				}
				
				var textarea = $("#"+sub_that.id).find("[find=chat_textarea]");
				textarea.text('');
				app_application_lincko.prepare(["chat_contents_wrapper", "chats_" + sub_that.param.id]);
				if(!supportsTouch || responsive.test("minDesktop")){
					textarea.focus();
				} else {
					textarea.blur();
				}
			},
			function(){
				$.each(tmpID,function(i,val){
					delete app_moels_chat_recallQueue[val];
				});
				tmpID = [];
			}
		);

	}
	$('.comments_input', submenu_wrapper).on('paste', function(){
		var that = $(this);
		setTimeout(function(){
			that.html(that.text());
		},10);
	});


	$('.comments_input', submenu_wrapper).on("resize",function(e) {
		submenu_resize_content();
	});

	$('.comments_input', submenu_wrapper).keyup(function(e) {
		e.stopPropagation();
		if(e.which == 13) {
			$(this).text('');
		}
	});
	$('.comments_input', submenu_wrapper).keydown(function(e) {
		e.stopPropagation();
		if(e.which == 13) {
			e.preventDefault();
			send_comments();
			$(this).text('');
		}
	});
	$('.send', submenu_wrapper).on("click", function() {
		send_comments();
	});
	$('.attachment', submenu_wrapper).on("click", function() {
		var position = $(this).parents(".submenu_wrapper");
		app_upload_open_files('chats', that.param.id, false, true);

		app_application_lincko.add(position.prop("id"), 'upload', function(){ //We cannot simplify because Elem is not the HTML object, it's a JS Submenu object
			var files = app_upload_files.lincko_files;
			for(var i in files)
			{
				//FIXME: Only filters files inside this chats.
				if (!files[i].presented) {
					item = {
						'name': files[i].lincko_name,
						'_type': 'uploading_file',
						'id': 'md5(Math.random())',
						'timestamp': $.now()/1000,
						'created_by': wrapper_localstorage.uid,
						'index': i,
					};
					app_application_lincko.add("uploading_file_"+i, 'upload', function() {
						//change each item status
						var tmp = this.id.split("_");
						var index = tmp[tmp.length-1];
						var file = app_upload_files.lincko_files[index];
						var size  = $('#app_upload_fileupload').fileupload('option')._formatFileSize(file.lincko_size);
						var downloaded = $('#app_upload_fileupload').fileupload(
							'option')._formatFileSize(file.lincko_progress * file.lincko_size/100);
						$("#"+this.id).find("[find=progress_bar]").width(file.lincko_progress+"%"); 
						$("#"+this.id).find("[find=progress_text]").html(downloaded+"/"+size);
						$("#"+this.id).find(".uploading_action").html(Lincko.Translation.get('app', 7, 'html'));
					});
					chatFeed.appendItem("chats", [item], position, true);
					files[i].presented = true;
				}
			}
		});

	});

	/*
	toto => enable it to allow file uploading
	Elem.find(".comments_input").blur(function() {
		if (!Elem.find('.comments_input').val()) {
			if (that.param.type != "history") {
				Elem.find(".send").hide();
				Elem.find(".attachment").show();
			}
		}
	});
	*/
	Elem.find(".comments_input").focus(function() {
		Elem.find(".send").show();
		Elem.find(".attachment").hide();
	});
	Elem.find(".send").show();
	Elem.find(".attachment").hide();


	setTimeout(function(){
		if(!supportsTouch || responsive.test("minDesktop")){
			Elem.find(".comments_input").focus();
		}
		else {
			Elem.find(".comments_input").blur();
		}
	},500);

	//Free memory
	delete submenu_wrapper;
	return Elem;
};

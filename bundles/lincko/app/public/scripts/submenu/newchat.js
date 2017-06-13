submenu_list['newchat'] = {
	//Set the title of the top
	"_title": {
		"style": "customized_title",
		"title": function(subm){
			if(subm.param.type == "history"){
				return '<span class="icon-projectActivity submenu_title_center_icon minMobileL">&nbsp;</span>'+subm.param.title;
			} else {
				return subm.param.title;
			}
		}, //chat room you are in
		"class": "submenu_newchat_header",
		"now": function(Elem, subm){
			Elem.find("[find=submenu_title]").prop('id', subm.id+'_customized_title');
			if(subm.param.type == "history"){
				app_application_lincko.add(subm.id+'_customized_title', "projects_"+subm.param.id, function() {
					if(subm.param.type=="projects" && subm.param.id==Lincko.storage.getMyPlaceholder()['_id']){
						var title = '<span class="icon-projectActivity submenu_title_center_icon minMobileL">&nbsp;</span>'+Lincko.Translation.get('app', 2502, 'html'); //Personal Space
					} else {
						var title = '<span class="icon-projectActivity submenu_title_center_icon minMobileL">&nbsp;</span>'+Lincko.storage.getPlus("projects", subm.param.id);
					}
					Elem.find("[find=submenu_title]").html(title);
				});
			} else {
				var single = Lincko.storage.get(subm.param.type, subm.param.id, 'single');
				if(!single){
					app_application_lincko.add(subm.id+'_customized_title', subm.param.type+"_"+subm.param.id, function() {
						var title = Lincko.storage.getPlus(subm.param.type, subm.param.id);
						Elem.find("[find=submenu_title]").html(title);
					});
				}
			}
		},
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
		"class": "icon-largerGroup base_pointer submenu_chats_settings",
		"action": function(Elem, subm) {
			if(subm.param.type == 'chats' && !Lincko.storage.get('chats', subm.param.id, 'single')){
				submenu_Build('edit_group', subm.layer+1, true, {type: 'chats', id: subm.param.id, alwaysMe:true, }, subm.preview);
			}
		}
	},
	"_pre_action": {
		"style": "preAction",
		"action": function(Elem, subm){
			subm.param.route = 'comment/create';
			if(subm.param.type=='chats'){
				subm.param.route = 'message/create';
			}
		},
	},
	"new_chat_menu": {
		"style": "new_chat_menu",
		"title": "",
	},
	"chat_contents": {
		"style": "chat_contents",
		"title": "",
	},
	"_post_action": {
		"style": "postAction",
		"action": function(Elem, subm){
			if(subm.param.type!='chats' || Lincko.storage.get('chats', subm.param.id, 'single')){
				Elem.find('.submenu_chats_settings').addClass('display_none');
			} else {
				var number = $('<span>').addClass('submenu_chats_settings_number').prop('id', subm.id + '_settings_number');
				app_application_lincko.add(subm.id+'_settings_number', subm.param.type+"_"+subm.param.id, function() {
					var number = $('#'+this.id);
					var perm = Lincko.storage.get(subm.param.type, subm.param.id, '_perm');
					var value = 0;
					for(var i in perm){
						value++;
					}
					if(value>0){
						number.html(value);
					}
				});
				Elem.find('.submenu_chats_settings').append(number);
			}
			
			//if during onboarding and activity feed is of onboarding project: disable close button
			if(onboarding.on && subm.param 
				&& subm.param.type && subm.param.type == 'history' 
				&& subm.param.id && subm.param.id == onboarding.project_id
				&& !Elem.find('.submenu_top_side_left').hasClass('display_none')){
				Elem.find('.submenu_top_side_left').addClass('display_none');
				onboarding.clear_fn_list.push(function(){
					Elem.find('.submenu_top_side_left').removeClass('display_none');
				});
			}
			app_application_lincko.prepare(subm.param.type+"_"+subm.param.id, true);

			//preload project pictures
			var files = Lincko.storage.list('files', null, null, subm.param.type, subm.param.id);
			for(var i in files){
				Lincko.storage.thumbnailPreload(files[i]['_id'], true);
			}
		},
	},
};

Submenu_select.chat_contents = function(subm) {
	subm.Add_ChatContents();
};
Submenu_select.new_chat_menu = function(subm) {
	subm.New_Add_ChatMenu();
};

var app_submenu_scrollto_timeout;
var app_submenu_scrollto = function(iScroll, last, scroll_time){
	if(typeof scroll_time == 'undefined'){
		scroll_time = 0;
	}
	clearTimeout(app_submenu_scrollto_timeout);
	app_submenu_scrollto_timeout = setTimeout(function(last){
		submenu_resize_content();
		if(last){

			iScroll.scrollToElement(last, scroll_time);
		}
	}, 200, last);
}

Submenu.prototype.Add_ChatContents = function() {
	var attribute = this.attribute;
	var that = this;
	var id = this.param.id;
	var type = this.param.type;
	var overthrow_id = "overthrow_"+that.id;
	var submenu_wrapper = this.Wrapper();
	var position = submenu_wrapper.find("[find='submenu_wrapper_content']");
	var type_clear = type == 'history' ? 'projects' : type;
	position.addClass('overthrow').addClass("submenu_chat_contents");

	position.on('touchstart',function(){
		var bottom = submenu_wrapper.find("[find=submenu_wrapper_bottom]");
		bottom.find('[find=chat_textarea]').blur();
	});

	app_application_lincko.add(that.id, [type_clear+"_" + id, "submenu_show_"+that.preview+"_"+that.id], function() {
		var type = this.action_param[0];
		var id = this.action_param[1];
		var subm = this.action_param[2];

		//user has not seen messages if app is not on foreground. relaunch this sync function on app resume
		if(device_type() == 'android' && !android_foreground.state){
			android_foreground.fn_list[type+'_'+id] = function(){
				app_application_lincko.prepare(type+'_'+id, true);
			};
			return;
		}

		var route = false;
		if(type=='chats'){
			route = 'chat/update';
		} else if(type=='projects'){
			route = 'project/update';
		}
		if(route){
			var param = {
				id: id,
				"users>noticed": {},
			};
			var hist = app_models_history.getList(1, type, id);
			var last_notif_root = Lincko.storage.getLastNotif(type, id);
			var latest_history = 0;
			if(hist.length > 0){
				latest_history = hist[0]["timestamp"];
			}
			if(subm.param.latest_history && subm.param.latest_history >= latest_history){
				return true; //Do nothing to not launch twice the call
			}
			if(latest_history > last_notif_root){
				param["users>noticed"][wrapper_localstorage.uid] = latest_history;
				//Temp modification for immediate display
				if(Lincko.storage.data[type][id]["_users"] && Lincko.storage.data[type][id]["_users"][wrapper_localstorage.uid]){
					Lincko.storage.data[type][id]["_users"][wrapper_localstorage.uid]["noticed"] = latest_history;
				}
				subm.param.latest_history = latest_history;
				Lincko.storage.cache.init(type, id);
				app_models_history.refresh(type, id);
				app_application_lincko.prepare([type, type+"_"+id, 'notification'], true, false, true);
				wrapper_sendAction(
					param,
					'post',
					route
				);
			}
		}
	}, [type_clear, id, that]);


	if (type == 'history') {
		that.param.chatFeed = new historyFeed(id,type,position,that);
		app_application_lincko.add(this.id+"_chat_contents_wrapper", "projects_" + id, function() {
			var chat_item = this.action_param[2];
			chat_item.app_chat_feed_load_recent();
		}, [that.id, id, that.param.chatFeed, position]);
	}
	else {
		that.param.chatFeed = new chatFeed(id,type,position,that);
		app_application_lincko.add(this.id+"_chat_contents_wrapper", "chats_" + id, function() {
			var chat_item = this.action_param[2];
			chat_item.app_chat_feed_load_recent();
		}, [that.id, id, that.param.chatFeed, position]);
	}

	app_application_lincko.add(that.id, 'upload', function(){ //We cannot simplify because Elem is not the HTML object, it's a JS Submenu object
		var chat_item = this.action_param[2];

		chat_item.app_chat_feed_uploading_file();

		//toto：to test uploading file
		// var msg = '';
		// for(var i in  app_upload_files.lincko_files)
		// {
		// 	 msg += app_upload_files.lincko_files[i].lincko_name + ':' + app_upload_files.lincko_files[i].lincko_status +':'+lincko_start+ '<br/>';
		// 	 $("#1_submenu_wrapper_newchat_false_chat_contents_wrapper").append("<li>"+msg+"</li>");
		// }

		var submenu_id = this.action_param[0];
		var scroll_time = this.action_param[1];
		var overthrow_id = "overthrow_"+submenu_id;
		var help_iscroll_elem =  $('#'+that.id+'_help_iscroll').get(0);
		if(myIScrollList[overthrow_id] && help_iscroll_elem){
			myIScrollList[overthrow_id].refresh();
			app_submenu_scrollto(myIScrollList[overthrow_id], help_iscroll_elem, scroll_time);
		}


	}, [that.id, id, that.param.chatFeed, position]);

	app_application_lincko.add(that.id, ["submenu_start_"+that.preview+"_"+that.id, "submenu_show_"+that.preview+"_"+that.id], function() {
		var submenu_id = this.action_param[0];
		var scroll_time = this.action_param[1];
		var overthrow_id = "overthrow_"+submenu_id;
		var help_iscroll_elem =  $('#'+submenu_id+'_help_iscroll').get(0);
		if(that.param.find_item){
			var find_item = submenu_wrapper.find("[item="+that.param.find_item+"]");
			if(find_item.length > 0){
				help_iscroll_elem = find_item.get(0);
			}
		}
		if(myIScrollList[overthrow_id] && help_iscroll_elem){
			myIScrollList[overthrow_id].refresh();
			app_submenu_scrollto(myIScrollList[overthrow_id], help_iscroll_elem, scroll_time);
		}
	}, [that.id, 0]);
}

Submenu.prototype.New_Add_ChatMenu  = function()
{
	var attribute = this.attribute;
	var submenu_wrapper = this.Wrapper();
	submenu_wrapper.addClass("submenu_chats");
	
	var that = this;
	var position = submenu_wrapper.find("[find=submenu_wrapper_bottom]");
	position.addClass('submenu_bottom');

	function fnSendMsg(inputter) {
		var data = inputter.getContent();
		var elem = data.elem;
		var content = data.text;
		var type = that.param.type == 'history' ? "projects":'chats';
		var sub_that = that;
		var tmpID = [];

		inputter.clearContent();

		if($.trim(content)==''){ 
			base_show_error(Lincko.Translation.get('app', 64, 'html'),true);
			return false; 
		}
		wrapper_sendAction({
				'comment': content,
				'parent_type': type,
				'parent_id': that.param.id,
			},
			'post',
			that.param.route, //'comment/create',
			function(msg, data_error, data_status, data_msg) {
				app_application_lincko.prepare(["chat_contents_wrapper", type+"_" + sub_that.param.id]);
				app_application_lincko.prepare("submenu_show");
				var overthrow_id = "overthrow_"+sub_that.id;
				var last = $("#"+overthrow_id).find(".models_history_wrapper:last-of-type");
				// if(myIScrollList[overthrow_id] && last && last[0]){
				// 	myIScrollList[overthrow_id].refresh();
				// 	var scroll_time = 0;
				// 	if(!supportsTouch || responsive.test("minDesktop")){ scroll_time = 200; }
				// 	//myIScrollList[overthrow_id].scrollToElement(last[0], scroll_time);
				// 	app_submenu_scrollto(myIScrollList[overthrow_id], last[0], scroll_time);
				// }

				var key = type == 'projects' ? 'comments' : 'messages';
				if(
					   typeof data_msg.partial == 'object'
					&& typeof data_msg.partial[wrapper_localstorage.uid] == 'object'
				){
					var list = data_msg.partial[wrapper_localstorage.uid][key];
					$.each(list,function(key,data){
						if(typeof app_models_chats_send_queue[list[key]['temp_id']] !== 'undefined'){
							delete app_models_chats_send_queue[list[key]['temp_id']] ;
						}
					});
				}
			},
			null,
			function(jqXHR, settings, temp_id) {
				tmpID.push(temp_id);
				var data = {
					'id': temp_id,
					'category': that.param.type == 'chats' ? "messages":'comments',
					'by':  wrapper_localstorage.uid,
					'timestamp': Math.floor((new Date()).getTime() / 1000),
					'content' : content.replace(/<(br).*?>/g,"\n"),
				};
				sub_that.param.chatFeed.app_chat_feed_send_msg(data);

				var overthrow_id = "overthrow_"+sub_that.id;
				var last = $("#"+overthrow_id).find(".models_history_wrapper:last-of-type");
				if(myIScrollList[overthrow_id] && last && last[0]){
					myIScrollList[overthrow_id].refresh();
					var scroll_time = 0;
					if(!supportsTouch || responsive.test("minDesktop")){ scroll_time = 200; }
					//myIScrollList[overthrow_id].scrollToElement(last[0], scroll_time);
					app_submenu_scrollto(myIScrollList[overthrow_id], last[0], scroll_time);
				}

				$(elem).text('');
				app_application_lincko.prepare(["chat_contents_wrapper", "chats_" + sub_that.param.id]);
				$(elem).focus();
				setTimeout(function(target){
					base_inputter_offset(target);
				}, 0, $(elem));
			},
			function(){
				
			}
		);
	}

	
	
	var layer = {
		row : 3,
		max_row : 3,
		mobile_row : 1,
		mobile_max_row : 3,
		mobile_backgroup_flag : true,
		mobile_input_border_flag : false,
		top_line : true,
		mobile_top_line : false,
		enter : fnSendMsg,
		auto_upload : true,

		left_menu :[	
			[
				{	
					element :'btSwitch',
					compatibility : 'app',
				}
			],	
		],

		right_menu :
		[	
			[
				// {
				// 	element : 'btScissors',
				// 	mobile_hide : true,
				// },
				{
					element : 'btSend',
					mobile_hide : true,
					empty : 'hide',
					click : fnSendMsg,
				},
			],
			[
				{
					element : 'btAttachment',
					empty : 'show',
				},
			],
		],
	};


	var height = position.height();
	submenu_wrapper.find("[find=submenu_wrapper_content]").css('bottom', height);

	var type = that.param.type == 'history' ? "projects":'chats';
	var chat_inputter = new inputter(this.id,position,type,that.param.id,layer,null,
		function(){
			var submenu_height = submenu_wrapper.outerHeight();
			var title_height = submenu_wrapper.find("[find=submenu_wrapper_top]").outerHeight();
			var inputter_height = submenu_wrapper.find("[find=submenu_wrapper_bottom]").outerHeight();
			submenu_wrapper.find("[find=submenu_wrapper_content]").css('height', submenu_height -inputter_height - title_height);
			submenu_wrapper.find("[find=submenu_wrapper_content]").css('bottom', inputter_height);

			var submenu_id = that.id;
			var scroll_time = 50;
			var overthrow_id = "overthrow_"+submenu_id;
			var help_iscroll_elem =  $('#'+that.id+'_help_iscroll').get(0);
			if(myIScrollList[overthrow_id] && help_iscroll_elem){
				myIScrollList[overthrow_id].refresh();
				//app_submenu_scrollto(myIScrollList[overthrow_id], help_iscroll_elem, scroll_time);
			}
		});

	
}

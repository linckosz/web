submenu_list['newchat'] = {
	//Set the title of the top
	"_title": {
		"style": "customized_title",
		"title": function(elem){
			if(elem.param.type == "history"){
				return '<span class="icon-projectActivity submenu_title_center_icon minMobileL">&nbsp;</span>'+elem.param.title;
			} else {
				return elem.param.title;
			}
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
		"class": "icon-Settings base_pointer submenu_chats_settings",
		"action": function(Elem, subm) {
			if(subm.param.type == 'chats' && !Lincko.storage.get('chats', subm.param.id, 'single')){
				var all_users = [];
				var checked_users = [];
				var userList = [];
				submenu_Build('edit_group', true, false, {type: 'chats', id: subm.param.id, alwaysMe:true, }, subm.preview);
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
			}

			//if during onbarding and activity feed is of onboarding project: disable close button
			if(onboarding.on && subm.param 
				&& subm.param.type && subm.param.type == 'history' 
				&& subm.param.id && subm.param.id == onboarding.project_id){
				Elem.find('.submenu_top_side_left').addClass('display_none');
				onboarding.clear_fn_list['activityfeed_remove_display_none'] = function(){
					Elem.find('.submenu_top_side_left').removeClass('display_none');
				}
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

var app_submenu_scrollto = function(iScroll, last, scroll_time){
	if(typeof scroll_time == 'undefined'){
		scroll_time = 0;
	}
	setTimeout(function(){
		submenu_resize_content();
		iScroll.scrollToElement(last, scroll_time);
	}, 50);
}



Submenu.prototype.Add_ChatContents = function() {
	var attribute = this.attribute;
	var that = this;
	var id = this.param.id;
	var type = this.param.type;
	var overthrow_id = "overthrow_"+that.id;
	var submenu_wrapper = this.Wrapper();
	var position = submenu_wrapper.find("[find='submenu_wrapper_content']");
	position.addClass('overthrow').addClass("submenu_chat_contents");

	var submenu_wrapper_id = submenu_wrapper.prop("id");


	if (type == 'history') {
		that.param.chatFeed = new historyFeed(id,type,position,that);

		app_models_notifier.clearNotification('projects', id);
		var hist = Lincko.storage.hist(null, -1, false, 'projects', id, false);
		if(hist.length > 0)
		{
			latest_history = hist[0]["timestamp"];
		}
		app_application_lincko.add(this.id+"_chat_contents_wrapper", "projects_" + id, function() {

			var chat_item = that.param.chatFeed;
			chat_item.app_chat_feed_load_recent();
			
			var overthrow_id = "overthrow_"+this.action_param[0];
			var help_iscroll_elem = $('#'+that.id+'_help_iscroll').get(0);

			if(myIScrollList[overthrow_id] && help_iscroll_elem){
				if(myIScrollList[overthrow_id].maxScrollY - myIScrollList[overthrow_id].y > -100){
					myIScrollList[overthrow_id].refresh();
					var scroll_time = 300;
					if(!supportsTouch || responsive.test("minDesktop")){ scroll_time = 300; }
					app_submenu_scrollto(myIScrollList[overthrow_id], help_iscroll_elem, scroll_time);
				}
			}
			app_models_notifier.clearNotification('projects', id);
			
		}, [that.id, id, that.param.chatFeed, position]);
	}
	else {
		that.param.chatFeed = new chatFeed(id,type,position,that);

		app_models_notifier.clearNotification('chats', id);
		
		app_application_lincko.add(this.id+"_chat_contents_wrapper", "chats_" + id, function() {
			//toto => there is an undefined somewhere
			var chat_item = that.param.chatFeed;
			chat_item.app_chat_feed_load_recent();

			var overthrow_id = "overthrow_"+this.action_param[0];
			var help_iscroll_elem =  $('#'+that.id+'_help_iscroll').get(0);

			if(myIScrollList[overthrow_id] && help_iscroll_elem){
				if(myIScrollList[overthrow_id].maxScrollY - myIScrollList[overthrow_id].y > -100){
					myIScrollList[overthrow_id].refresh();
					var scroll_time = 300;
					if(!supportsTouch || responsive.test("minDesktop")){ scroll_time = 300; }
					app_submenu_scrollto(myIScrollList[overthrow_id], help_iscroll_elem, scroll_time);
				}
			}
			app_models_notifier.clearNotification('chats', this.action_param[1]);
			
		}, [that.id, id, that.param.chatFeed, position]);
	}

	app_application_lincko.add(submenu_wrapper_id, 'upload', function(){ //We cannot simplify because Elem is not the HTML object, it's a JS Submenu object
		that.param.chatFeed.app_chat_feed_uploading_file();

		var overthrow_id = "overthrow_"+this.action_param[0];
		var help_iscroll_elem =  $('#'+that.id+'_help_iscroll').get(0);


		if(myIScrollList[overthrow_id] && help_iscroll_elem){
			if(myIScrollList[overthrow_id].maxScrollY - myIScrollList[overthrow_id].y > -100){
				myIScrollList[overthrow_id].refresh();
				var scroll_time = 0;
				if(!supportsTouch || responsive.test("minDesktop")){ scroll_time = 300; }
				app_submenu_scrollto(myIScrollList[overthrow_id], help_iscroll_elem, scroll_time);
			}
		}
	}, [that.id, id, that.param.chatFeed, position]);

	var type_clear = type == 'history' ? 'projects' : type;
	app_application_lincko.add("overthrow_"+that.id, "submenu_show_"+that.preview+"_"+that.id, function() {
		var submenu_id = this.action_param[0];
		var scroll_time = this.action_param[1];
		var overthrow_id = "overthrow_"+submenu_id;

		var help_iscroll_elem =  $('#'+that.id+'_help_iscroll').get(0);

		if(myIScrollList[overthrow_id] && help_iscroll_elem){
			myIScrollList[overthrow_id].refresh();
			app_submenu_scrollto(myIScrollList[overthrow_id], help_iscroll_elem, scroll_time);
		}
		this.action_param[1] = 1000;
		app_models_notifier.clearNotification(this.action_param[2], this.action_param[3]);
	}, [that.id, 0, type_clear, id]);


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
				if(myIScrollList[overthrow_id] && last && last[0]){
					myIScrollList[overthrow_id].refresh();
					var scroll_time = 0;
					if(!supportsTouch || responsive.test("minDesktop")){ scroll_time = 200; }
					//myIScrollList[overthrow_id].scrollToElement(last[0], scroll_time);
					app_submenu_scrollto(myIScrollList[overthrow_id], last[0], scroll_time);
				}

				var key = type == 'projects' ? 'comments' : 'messages';
				var list = data_msg.partial[wrapper_localstorage.uid][key];
				$.each(list,function(key,data){
					if(typeof app_models_chats_send_queue[list[key]['temp_id']] !== 'undefined'){
						delete app_models_chats_send_queue[list[key]['temp_id']] ;
					}
				});
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

		// left_menu :
		// [
		// 	[{
		// 		element :'chkTask',
		// 	}],
		// ],
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

	// var burgerParm = 
	// {
	// 	shiftEnter : true,
	// 	dropdownOffset : 20,
	// 	enter_fn_param : 'inputter',
	// 	enter_fn : that.layer['enter'],
	// }

	var type = that.param.type == 'history' ? "projects":'chats';
	var chat_inputter = new inputter(this.id,position,type,that.param.id,layer,null);

	var height = position.height();
	submenu_wrapper.find("[find=submenu_wrapper_content]").css('bottom', height);
}

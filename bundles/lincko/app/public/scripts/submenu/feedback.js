submenu_list['feedback'] = {
	//Set the title of the top
	"_title": {
		"style": "customized_title",
		"title": "Support",//toto
		"class": "submenu_top_itemSelector",
	},
	"left_button": {
		"style": "title_left_button",
		"title": Lincko.Translation.get('app', 25, 'html'), //Close
		'hide': true,
		"class": "base_pointer submenu_newchat_header_close",
	},
	"content": {
		"style": "feedback_content",
		"title": "feedbackStyle",
		"class": "",
	},
	"bottom": {
		"style": "feedback_bottom",
		"title": "feedbackBottom",
		"class": "",
	},
}


Submenu_select.feedback_content = function(subm){
	subm.AddFeedbackContent();
};

Submenu_select.feedback_bottom = function(subm){
	subm.AddFeedbackBottom();
};

/*
	available parameters
	param = {
		item: //(optional) the parent item
		hideType: { //(optional) default is available, true means will be hidden
			files: true/false,
			notes: true/false,
		}
	}
*/


var submenu_feedback_open_single_timer;
var submenu_feedback_open_single_running = false; //toto => bad pattern because we should avoid running multiple times at the source
var submenu_feedback_open_single = function(subm, users_id){
	if(submenu_feedback_open_single_running){
		//Do nothing because already launch previously
		return true;
	}
	submenu_feedback_open_single_running = true;
	var chats = Lincko.storage.list('chats', null, {'single': true});
	var chat_id = null;
	for(var i in chats){
		count = 0;
		if(chats[i]["_perm"]){
			for(var j in chats[i]["_perm"]){
				count++;
			}
		}
		if(chats[i]["_perm"] && count>=2 && users_id!=wrapper_localstorage.uid && chats[i]["_perm"][users_id] && chats[i]["_perm"][wrapper_localstorage.uid]){
			chat_id = chats[i]["_id"];
			break;
		} else if(chats[i]["_perm"] && count==1 && users_id==wrapper_localstorage.uid && chats[i]["_perm"][wrapper_localstorage.uid]){
			chat_id = chats[i]["_id"];
			break;
		}
	}
	var title = Lincko.storage.get('users', users_id, 'username');
	var chat_temp_id;
	if(chat_id){
		submenu_Build("feedback", subm.layer+1, false, {
			type: "chats",
			id: chat_id,
			title: title,
		});
		clearTimeout(submenu_feedback_open_single_timer);
		submenu_feedback_open_single_timer = setTimeout(function(){
			submenu_feedback_open_single_running = false;
		}, 300);
	} else {
		wrapper_sendAction(
			{
				'parent_type': null,
				"parent_id": -1,
				"title": "",
				"single": users_id
			},
			'post',
			'chat/create',
			function() {
				var chat = Lincko.storage.list('chats', 1, {'temp_id': chat_temp_id})[0];
				if(chat){
					var title = Lincko.storage.get('users', users_id, 'username');
					submenu_Build("feedback", subm.layer+1, false, {
						type: "chats",
						id: chat["_id"],
						title: title,
					});
				}
			},
			null,
			function(jqXHR, settings, temp_id) {
				chat_temp_id = temp_id;
			},
			function(){
				submenu_feedback_open_single_running = false;
			}
		);
		
	}
};

var submenu_feedback_build_question = function(wrapper,container,question_id){
	var item = $("#-submenu_feedback_item").clone();
	item.prop("id","");
	item.find("[find=profile_ico]").css("border-color", "transparent");
	item.find("[find=profile_ico]").css("background-image","url('" +  app_application_icon_roboto.src + "')");
	item.find("[find=profile_name]").append("LinckoBot");
	
	item.addClass("models_feedback_others");

	var content = "How can I help you?";
	switch(question_id)
	{
		case 1 :
			content = "How can I help you?";//toto
			break;
		case 2 :
			content = "Anything else?";//toto
			break;
	}

	item.find("[find=content]").append(content);
	item.find("[find=keyword]").remove();

	setTimeout(function(){
		container.append(item);
		
		wrapper_IScroll_refresh();
		wrapper_IScroll();

		var overthrow_id = wrapper.find("[find=container]").eq(0).prop("id");
		myIScrollList[overthrow_id].scrollToElement(item.get(0), 100);

		submenu_feedback_build_options(wrapper,container);
	},500,wrapper,container,item);
}

var submenu_feedback_build_options = function(wrapper,container){
	var item = $("#-submenu_feedback_options").clone();
	item.prop("id","submenu_feedback_options");
	var options = [
		{
			'text':'Report Bug',//toto:Report Bug
			'action' : function(event){
				wrapper.find("[find=chat_textarea]").addClass("submenu_feedback_space");
				wrapper.find("[find=chat_textarea]").attr("space",this.text); 
				setTimeout(function(){
					if(wrapper.find("[find=chat_textarea]").html().length == 0)
					{
						wrapper.find("[find=chat_textarea]").html("&nbsp;");
					}
					wrapper.find("[find=chat_textarea]").focus(); 
				},0);
				
				wrapper.find("#submenu_feedback_hide_helper").addClass("display_none");
			}
		},
		{
			'text':'Feature Request',//toto:Feature Request
			'action' : function(event){
				wrapper.find("[find=chat_textarea]").addClass("submenu_feedback_space");
				wrapper.find("[find=chat_textarea]").attr("space",this.text); 
				setTimeout(function(){
					if(wrapper.find("[find=chat_textarea]").html().length == 0)
					{
						wrapper.find("[find=chat_textarea]").html("&nbsp;");
					}
					wrapper.find("[find=chat_textarea]").focus(); 
				},0);
				wrapper.find("#submenu_feedback_hide_helper").addClass("display_none");
			}
		},
		{
			'text':'General',//toto:General
			'action' : function(event){
				wrapper.find("[find=chat_textarea]").addClass("submenu_feedback_space");
				wrapper.find("[find=chat_textarea]").attr("space",this.text);  
				setTimeout(function(){
					if(wrapper.find("[find=chat_textarea]").html().length == 0)
					{
						wrapper.find("[find=chat_textarea]").html("&nbsp;");
					}
					wrapper.find("[find=chat_textarea]").focus(); 
				},0);
				wrapper.find("#submenu_feedback_hide_helper").addClass("display_none");
			}
		}
	];

	for(var i in options)
	{
		var option = $("#-submenu_feedback_options_item").clone();
		option.prop("id","");
		option.find("[find=option_content]").text(options[i].text);//toto:Report Bug
		item.find("[find=options_content]").append(option);
		option.find("[find=option_content]").click({index:i},function(event){
			var index = event.data.index;
			var target = event.data.target;
			options[index].action(event);
		});
	}
	
	var option = $("-submenu_feedback_options_item").clone();
	item.append(option);

	setTimeout(function(){
		container.append(item);

		wrapper_IScroll_refresh();
		wrapper_IScroll();

		var overthrow_id = wrapper.find(".submenu_feedback_content_wrapper_container").eq(0).prop("id");
		myIScrollList[overthrow_id].scrollToElement(item.get(0), 100);
	},500,container,item);
}

Submenu.prototype.AddFeedbackContent = function() {
	var that = this;
	var border_size = 2;
	var attribute = this.attribute;

	var submenu_wrapper = this.Wrapper();
	submenu_wrapper.css("width","100%");
	submenu_wrapper.addClass("submenu_feedback_backgroud");

	var submenu_content = submenu_wrapper.find("[find=submenu_wrapper_content]");
	submenu_content.prop("id","feedback_" + that.id);
	submenu_content.removeClass("overthrow");

	//build layout
	var target = $("#-submenu_feedback_content_info").clone();
	target.prop("id","submenu_feedback_content_info" + that.id);
	submenu_content.append(target);

	target = $("#-submenu_feedback_content_wrapper").clone();
	target.prop("id","submenu_feedback_content_wrapper_" + that.id);
	target.find("[find=container]").addClass("overthrow");
	submenu_content.append(target);


	//1.lincko bot
	var container = target.find("[find=container] ul");
	submenu_feedback_build_question(submenu_wrapper,container,1);

	//2.files
	app_application_lincko.add('feedback_'+that.id, "upload",function(){
		for(var i in app_upload_files.lincko_files)
		{
			if(app_upload_files.lincko_files[i].lincko_parent_type == "chat" 
				&& app_upload_files.lincko_files[i].lincko_parent_id == that.param.id 
				&& app_upload_files.lincko_files[i].lincko_param == that.id)
			{

				var preview = null;
				try{
					preview = app_upload_files.lincko_files[i].files[0].preview.toDataURL();
				}
				catch(e)
				{
					
				}

				if($("#submenu_feedback_uploading_file_"+app_upload_files.lincko_files[i].lincko_temp_id).length == 0)
				{
					var elem = $("#-submenu_feedback_uploading_file").clone();
					elem.addClass("models_feedback_self");
					elem.prop("id","submenu_feedback_uploading_file_"+app_upload_files.lincko_files[i].lincko_temp_id);

					var img = Lincko.storage.getLinkThumbnail(Lincko.storage.get("users", wrapper_localstorage.uid, 'profile_pic'));
					var username = Lincko.storage.get("users",wrapper_localstorage.uid,"username");
					if(!img){
						img = app_application_icon_single_user.src;
					}
					elem.find("[find=profile_ico]").css('background-image','url("'+img+'")');
					elem.find("[find=profile_name]").text(username);


					if(preview == null || preview == '')
					{
						elem.find(".submenu_feedback_shortcut_uploading_ico").removeClass('display_none');
						elem.find(".submenu_feedback_shortcut_uploading_pic").addClass('display_none');
						elem.find(".submenu_feedback_shortcut_uploading_ico").removeClass('display_none').find("i").addClass(app_models_fileType.getClass(this.ext));
						
					}else
					{
						debugger;
						elem.find(".submenu_feedback_shortcut_uploading_ico").addClass('display_none');
						elem.find(".submenu_feedback_shortcut_uploading_pic")
								.removeClass('display_none')
								.css('background-image','url("'+ preview +'")')
								.attr("preview", "1");
					}

					container.append(elem);
					wrapper_IScroll_refresh();
					wrapper_IScroll();
					var last_one = target.find(".submenu_feedback_item:last").get(0);
					var overthrow_id = submenu_wrapper.find(".submenu_feedback_content_wrapper_container").eq(0).prop("id");
					myIScrollList[overthrow_id].scrollToElement(last_one, 100);
				}
				else
				{
					var elem = $("#submenu_feedback_uploading_file_"+app_upload_files.lincko_files[i].lincko_temp_id);

					if(preview == null || preview == '')
					{
						elem.find(".submenu_feedback_shortcut_uploading_ico").removeClass('display_none');
						elem.find(".submenu_feedback_shortcut_uploading_pic").addClass('display_none');
						elem.find(".submenu_feedback_shortcut_uploading_ico").removeClass('display_none').find("i").addClass(app_models_fileType.getClass(this.ext));
						
					}else
					{
						elem.find(".submenu_feedback_shortcut_uploading_ico").addClass('display_none');
						elem.find(".submenu_feedback_shortcut_uploading_pic")
								.removeClass('display_none')
								.css('background-image','url("'+ preview +'")')
								.attr("preview", "1");
					}
					
					elem.find('[find=target]').html(app_upload_files.lincko_files[i].lincko_name);
					elem.find('[find=progress_bar]').css('width', Math.floor(app_upload_files.lincko_files[i].lincko_progress) + '%');
					elem.find('[find=progress_text]').addClass('uploading_file_progress_size').html( parseInt(app_upload_files.lincko_files[i].lincko_progress * app_upload_files.lincko_files[i].lincko_size / 1024 / 100)
		+ ' K of ' + parseInt (app_upload_files.lincko_files[i].lincko_size/1024) + 'K');

				}
			}
		}
	},container);
	return true;
}

Submenu.prototype.AddFeedbackBottom = function() {
	var that = this;
	var submenu_wrapper = this.Wrapper();
	var position = submenu_wrapper.find("[find=submenu_wrapper_bottom]").addClass('submenu_bottom');

	function fnSendMsg(inputter) {
		var data = inputter.getContent();
		var elem = data.elem;
		var editor = position.find("[find=chat_textarea]");
		var content = data.html;
		var type = "chats";
		var sub_that = that;
		var tmpID = [];

		if($.trim(content)==''){ 
			base_show_error(Lincko.Translation.get('app', 64, 'html'),true);
			return false; 
		}
		wrapper_sendAction({
				'comment': "[" + editor.attr("space") + "]" + content,
				'parent_type': type,
				'parent_id': that.param.id,
			},
			'post',
			'message/create',
			function(msg, data_error, data_status, data_msg) {
				var key =  'messages';
				var list = data_msg.partial[wrapper_localstorage.uid][key];
				$.each(list,function(key,data){
					if(typeof app_models_chats_send_queue[list[key]['temp_id']] !== 'undefined'){
						delete app_models_chats_send_queue[list[key]['temp_id']];
					}
				});
			},
			null,
			function(jqXHR, settings, temp_id) {
				if($.trim(editor.text()).length == 0)
				{
					base_show_error("no empty",true);//toto
					return false;
				}

				tmpID.push(temp_id);
				var data = {
					'id': temp_id,
					'category': "messages",
					'by':  wrapper_localstorage.uid,
					'timestamp': Math.floor((new Date()).getTime() / 1000),
					'content' : content.replace(/<(br).*?>/g,"\n"),
					'keyword' : editor.attr("space"),
				};

				$("#submenu_feedback_options").remove();

				var item = $("#-submenu_feedback_item").clone();
				item.prop("id","");
				var target = $("#submenu_feedback_content_wrapper_" + that.id);
				target.find("[find=container] ul").append(item);

				var img = Lincko.storage.getLinkThumbnail(Lincko.storage.get("users", wrapper_localstorage.uid, 'profile_pic'));
				if(!img){
					img = app_application_icon_single_user.src;
				}
				var username = Lincko.storage.get("users",wrapper_localstorage.uid,"username");

				item.find("[find=profile_ico]").css('background-image','url("'+img+'")');
				item.find("[find=profile_name]").text(username);
				item.find("[find=content]").append(data.content);

				if(data.keyword == "")
				{
					item.find("[find=keyword]").remove();
				}
				else
				{
					item.find("[find=keyword]").append(data.keyword);
				}
				item.addClass("models_feedback_self");

				//script
				var target = $("#submenu_feedback_content_wrapper_" + that.id);
				var container = target.find("[find=container] ul");
				submenu_feedback_build_question(sub_that.Wrapper(),container,2);

				editor.removeClass("submenu_feedback_space");

				$.each(app_upload_files.lincko_files, function(i, file){
					if(file.lincko_param == that.id){
						app_upload_files.lincko_files[i].lincko_parent_type = "chat";
						app_upload_files.lincko_files[i].lincko_parent_id = that.param.id;
						app_upload_files.lincko_files[i].submit();
					}
				});

				wrapper_IScroll_refresh();
				wrapper_IScroll();

				var last_one = target.find(".submenu_feedback_item:last").get(0);
				var overthrow_id = target.find("[find=container]").eq(0).prop("id");
				myIScrollList[overthrow_id].scrollToElement(last_one, 100);

				app_application_lincko.prepare(["chat_contents_wrapper", "chats_" + sub_that.param.id]);

				inputter.clearText();
				$("#submenu_feedback_hide_helper").removeClass("display_none");

				var focus_help = $("<span contenteditable />");
				position.append(focus_help);
				focus_help.focus();
				focus_help.blur();
				focus_help.remove();

			},
			function(){
				
			}
		);
		

	};

	var layer = {
		row : 3,
		max_row : 3,
		mobile_row : 1,
		mobile_max_row : 3,
		mobile_backgroup_flag : true,
		mobile_input_border_flag : true,
		top_line : true,
		mobile_top_line : false,
		enter : fnSendMsg,
		auto_upload : false,


		right_menu :
		[	
			[
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

	var chat_inputter = new inputter(this.id,position,"chat",that.param.id,layer,null);

	var hide_helper = $("#-submenu_feedback_hide_helper").clone();
	hide_helper.prop("id","submenu_feedback_hide_helper");
	position.append(hide_helper);

	setTimeout(function(){
		position.find("[find=chat_textarea]").blur();
	},200);

	position.find("[find=chat_textarea]").keyup(function(){
		if(position.find("[find=chat_textarea]").html().length == 0)
		{
			position.find("[find=chat_textarea]").html("&nbsp;");
		}
	});
	

	var height = position.height();
	submenu_wrapper.find("[find=submenu_wrapper_content]").css('bottom', height);
}




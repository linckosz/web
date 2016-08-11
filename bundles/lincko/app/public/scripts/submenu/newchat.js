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
			submenu_Build('contacts', true, false, {type: 'chats', alwaysMe:true, }, that.preview);
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
	var submenu_wrapper_id=submenu_wrapper.prop("id");
	chatFeed.feedHistory(position, type, id, that);
	chatFeed.feedUploadingFiles(position,type,id,submenu_wrapper_id);

	notifier[type]['clear'](id);
	if (type == 'history') {
		latest_history = Lincko.storage.hist(null, -1, null, 'projects', id, false)[0]["timestamp"];
		app_application_lincko.add(this.id+"_chat_contents_wrapper","projects_" + id, function() {
			//toto => there is an undefined somewhere
			var id = Object.keys(this.range)[0].split("_")[1];
			var items = Lincko.storage.hist(null, -1, {'by': ["!=", wrapper_localstorage.uid], 'timestamp': [">=", latest_history]}, 'projects', id, false);
			
			for(var i in items){
				if(items[i]["timestamp"] > latest_history && latest_history < Lincko.storage.getLastVisit()){
					latest_history = items[i]["timestamp"];
				}
			}


			chatFeed.appendItem("history", items, position, true,true);
			chatFeed.updateRecalled('projects', id, position);
			chatFeed.updateTempComments('projects',id,position);
			chatFeed.updateTempUploads('projects',id,position);


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
		latest_history = Lincko.storage.list(null, -1, null, 'chats', id, false)[0]["created_at"];
		app_application_lincko.add(this.id+"_chat_contents_wrapper", "chats_" + id, function() {
			//toto => there is an undefined somewhere
			var id = Object.keys(this.range)[0].split("_")[1];
			var type = Object.keys(this.range)[0].split("_")[0];
			var items = Lincko.storage.list(null, -1, {'created_by': ["!=", wrapper_localstorage.uid], 'created_at': [">=", latest_comment]}, 'chats', id, false);
			for(var i in items){
				if(items[i]["created_at"] > latest_comment && latest_comment < Lincko.storage.getLastVisit()){
					latest_comment = items[i]["created_at"];
				}
			}
			chatFeed.appendItem(type, items, position, true,true);
			chatFeed.updateRecalled('chats', id, position);
			chatFeed.updateTempComments('chats',id,position);
			chatFeed.updateTempUploads('chats',id,position);


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

	app_application_lincko.add(submenu_wrapper_id, 'upload', function(){ //We cannot simplify because Elem is not the HTML object, it's a JS Submenu object
		var files = app_upload_files.lincko_files;
		var _type=type=="history"?"projects":"chats";
		for(var i in files)
		{
			if(files[i].lincko_parent_type!=_type||files[i].lincko_parent_id != id) {continue;}
			if(files[i].lincko_status=="deleted")
			{
				$("#"+submenu_wrapper_id+"_uploading_file_"+files[i].lincko_temp_id).remove();
			}
			else{
			//FIXME: Only filters files inside this chats.
			
				item = {
					'name': files[i].lincko_name,
					'_type': 'uploading_file',
					'id': files[i].lincko_temp_id,
					'timestamp': Math.floor($.now()/1000),
					'created_by': wrapper_localstorage.uid,
					'index': files[i].lincko_temp_id,
				};
				chatFeed.appendItem(_type, [item], position, true,true);	
				if(files[i].lincko_progress>=100 && files[i].lincko_status === 'done'){
					$("#"+submenu_wrapper_id+"_uploading_file_"+files[i].lincko_temp_id)
						.removeClass("uploading_file")
						.addClass("uploaded_file");
				} 
				else {
					$("#"+submenu_wrapper_id+"_uploading_file_"+files[i].lincko_temp_id)
						.find("[find=progress_bar]")
						.css('width',Math.floor(files[i].lincko_progress) + '%');
					var total_size_obj=app_layers_files_bitConvert(files[i].lincko_size);
					var senting_size_obj=app_layers_files_size_convert(0.01 * files[i].lincko_progress * files[i].lincko_size ,total_size_obj.unit);
					$("#"+submenu_wrapper_id+"_uploading_file_"+files[i].lincko_temp_id)
						.find("[find=progress_text]")
						.html(senting_size_obj.val + " " + senting_size_obj.unit + " of " + total_size_obj.val + " " + total_size_obj.unit);
				}	
				var drawImageTimeout=0;
				var drawImageInterval = setInterval(function(){
					try{
						if(drawImageTimeout==33){/*10s=33*300*/
							clearInterval(drawImageInterval);
						}
						if(typeof files[i].files[0].preview.tagName !== 'undefined' && files[i].files[0].preview.tagName.toLowerCase() === 'canvas'){
						$("#"+submenu_wrapper_id+"_uploading_file_"+files[i].lincko_temp_id).find(".models_history_standard_shortcut_ico").hide();
						$("#"+submenu_wrapper_id+"_uploading_file_"+files[i].lincko_temp_id).find(".models_history_standard_shortcut_pic")
							.show()
							.prop("src", files[i].files[0].preview.toDataURL())
							.attr("preview", "1");
						}
						clearInterval(drawImageInterval);
					}catch(e)
					{

					}finally
					{
						drawImageTimeout++;
					}
				},300);
					
				
			}
		}
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
	}, [that.id, id]);


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
    
    function show_button(){
    	if($("#"+that.id).find("[find=chat_textarea]").text().length>0)
		{
			$("[find=submenu_app_chat_button_mobile] .send").show();
			$("[find=submenu_app_chat_button_mobile] .attachment").hide();
		}
		else
		{
			$("[find=submenu_app_chat_button_mobile] .send").hide();
			$("[find=submenu_app_chat_button_mobile] .attachment").show();
		}
    }

	
	function send_comments() {
		var textarea = $("#"+that.id).find("[find=chat_textarea]");
		var content = textarea.html().replace(/<div>/g,"<br>").replace(/<\/div>/g,"");
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
				if(data_msg.partial && data_msg.partial[wrapper_localstorage.uid] && data_msg.partial[wrapper_localstorage.uid].comments){
					$.each(data_msg.partial[wrapper_localstorage.uid].comments, function(id, item){
						if(app_models_chat_recallQueue[item.temp_id]){
							app_models_chat_recallQueue.sendAction(id);
						}
					});
				}
			},
			null,
			function(jqXHR, settings, temp_id) {
				tmpID.push(temp_id);
				if($.trim(content)==''){ return false; }
				var position = $("[find='submenu_wrapper_content']", submenu_wrapper);	
				//Display a temp comment				
				var fake_comment = {
					"+comment": content.replace(/<(br).*?>/g,"\n"),
					"_id": temp_id,
					"_type": "comments",
					"created_at":  Math.floor((new Date()).getTime() / 1000),
					"created_by": wrapper_localstorage.uid,
					"new": false,
				};
				chatFeed.appendItem('comments', [fake_comment], position, true,true);
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
				textarea.focus();
				
			},
			function(){
				$.each(tmpID,function(i,val){
					delete app_models_chat_recallQueue[val];
				});
				tmpID = [];
			}
		);

	}

	$('.comments_input', submenu_wrapper).on('paste', function(){
		var that = $(this);
		setTimeout(function(){
			that.html(that.html().replace(/<(br).*?>/g,"<br/>").replace(/<(?!br).*?>/g,""));
		},100);
	});

	$('.comments_input', submenu_wrapper).on("resize",function(e) {
		submenu_resize_content();
	});

	

	$('.comments_input', submenu_wrapper).keyup(function(e) {
		e.stopPropagation();
		show_button();
		if(e.ctrlKey && e.keyCode==13)
		{
			return;
		}
		if(e.shiftKey && e.keyCode==13)
		{
			return;
		}
		if(e.which == 13) {
			$(this).text('');
		}
	});

	$('.comments_input', submenu_wrapper).keydown(function(e) {
		e.stopPropagation();
		if(e.ctrlKey && e.keyCode==13)
		{
			return;
		}
		if(e.shiftKey && e.keyCode==13){
      		e.returnValue=false;
			return;
		}
		if(e.which == 13) {
			e.preventDefault();
			send_comments();
			$(this).text('');
		}
	});


	$('.send', submenu_wrapper).on("click", function(e) {
		send_comments();
		show_button();
	});

	$('.attachment',submenu_wrapper).on("click",function(e) {
		var type = that.param.type == 'history' ? "projects":'chats';
		var id=that.param.id;
		app_upload_open_files(type, id,false,true);
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

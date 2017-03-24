submenu_list['app_chat_new'] = {
	//Set the title of the top
	 "_title": {
		"style": "customized_title",
		"title": Lincko.Translation.get('app', 2301, 'html'), //Chats
	},
	"left_button": {
		"style": "title_left_button",
		"title": Lincko.Translation.get('app', 25, 'html'), //Close
		'hide': true,
		"class": "base_pointer",
	},
	"user_invitation": {
		"style": "button",
		"title": Lincko.Translation.get('app', 2305, 'html'), //Invite New Contact
		"action": function(Elem, subm){
			submenu_Build("chat_add_user", subm.layer, false, null, subm.preview); 
		},
		"class": "",
	},
	"new_group": {
		"style": "button",
		"title": Lincko.Translation.get('app', 3701, 'html').ucfirst(), //Start New Chat
		"action": function(Elem, subm){
			submenu_Build('new_group', subm.layer, false, {type: 'chats', alwaysMe: true, }, subm.preview);
		},
		"class": "",
	},
};

submenu_list['chat'] = submenu_list['chat_list'] = {
	//Set the title of the top
	"_title": {
		"style": "customized_title",
		"title": Lincko.Translation.get('app', 2301, 'html'), //Chats
		"class": "submenu_app_chat_top base_ChatMenuHeader",
	},
	"left_button": {
		"style": "title_left_button",
		"title": Lincko.Translation.get('app', 25, 'html'), //Close
		'hide': true,
		"class": "base_pointer",
	},
	"right_button": {
		"style": "title_right_button",
		"title": "",
		"class": "base_pointer icon-AddPerson submenu_app_chat_title_right_button",
		"action": function(Elem, subm) {
			submenu_Build('chat_add_user', subm.layer+1, true, null, subm.preview)
		},
	},
	//It will create a form with a validation button
	"chat_menu": {
		"style": "chat_menu",
		"title": "",
	},
};

submenu_list['chat_add_user'] = {
	//Set the title of the top
	"_title": {
		"style": "customized_title",
		"title": Lincko.Translation.get('app', 2305, 'html'), //Invite New Contact
		"class": "submenu_app_chat_top base_ChatMenuHeader",
	},
	"left_button": {
		"style": "title_left_button",
		"title": Lincko.Translation.get('app', 25, 'html'), //Close
		'hide': true,
		"class": "base_pointer",
		"action": function(Elem, subm) {
			submenu_chat_search.value_qrcode = null;
			if(base_scanner && 'dispose' in base_scanner){
				base_scanner.dispose();
				$("#"+subm.id+"_radar").recursiveEmpty();
			}
		},
	},
	//It will create a form with a validation button
	"chat_menu": {
		"style": "chat_add_user",
		"title": "",
	},
};

submenu_list['mainchat'] = {
	//Set the title of the top
	"_title": {
		"style": "customized_title",
		"title": Lincko.Translation.get('app', 2301, 'html'), //Chats
		"class": "submenu_newchat_header",
	},
	//It will create a form with a validation button
	"chat_content": {
		"style": "chat_content",
		"title": "",
	},
	"left_button": {
		"style": "title_left_button",
		"title": Lincko.Translation.get('app', 25, 'html'), //Close
		'hide': true,
		"class": "base_pointer submenu_newchat_header_close",
	},
};

Submenu_select.chat_content = function(subm) {
	subm.Add_ChatContent();
};

Submenu_select.chat_menu = function(subm){
	subm.Add_ChatMenu();
};

Submenu_select.chat_chats = function(subm){
	subm.Add_ChatChats();
};

Submenu_select.chat_add_user = function(subm){
	subm.Add_ChatAddUser();
};

Submenu.prototype.Add_ChatMenu = function() {
	var attribute = this.attribute;
	var submenu_wrapper = this.Wrapper();
	submenu_wrapper.find("[find=submenu_wrapper_content]").empty();
	var Elem = $('#-submenu_app_chat_chatmenu').clone();
	var that = this;
	Elem.prop("id", this.id+"_submenu_app_chat_chatmenu");
	submenu_wrapper.find("[find=submenu_wrapper_bottom]").addClass('submenu_bottom base_optionTab');
	submenu_wrapper.find("[find=submenu_wrapper_content]").css('bottom', submenu_wrapper.find("[find=submenu_wrapper_bottom]").height());
	submenu_wrapper.find("[find=submenu_wrapper_content]").prop("id", '');
	Elem.find("[find=select_chats]").click(that, function(event){
		var that = event.data;
		var Elem = that.Wrapper().find("[find=submenu_wrapper_bottom]");
		if(!$(this).hasClass('submenu_app_chat_chatmenu_icon_active')){
			submenu_chat_select('chats', Elem);
			submenu_Clean(that.layer+1, true);
			$("#"+that.id+"_submenu_top_button_right").addClass("display_none");
			that.Wrapper().find("[find=submenu_wrapper_top]").find("[find=submenu_title]").html(Lincko.Translation.get('app', 2301, 'html')); //Chats
			that.Add_ChatContent();
		}
	});
	Elem.find("[find=select_contacts]").click(that, function(event){
		var that = event.data;
		var Elem = that.Wrapper().find("[find=submenu_wrapper_bottom]");
		if(!$(this).hasClass('submenu_app_chat_chatmenu_icon_active')){
			submenu_chat_select('contacts', Elem);
			submenu_Clean(that.layer+1, true);
			$("#"+that.id+"_submenu_top_button_right").removeClass("display_none");
			that.Wrapper().find("[find=submenu_wrapper_top]").find("[find=submenu_title]").html(Lincko.Translation.get('app', 2302, 'html')); //Contacts list
			that.Add_ChatContacts();
		}
	});
	app_application_lincko.add(that.id+"_submenu_app_chat_chatmenu", ["projects", "chats", "users", "contacts_list"], function(){
		var that = this.action_param;
		var Elem = that.Wrapper().find("[find=submenu_wrapper_bottom]");
		if(Elem.find("[find=select_chats]").hasClass('submenu_app_chat_chatmenu_icon_active')){
			//that.Add_ChatContent(); //toto => make scroll resert to beginning
		} else if(Elem.find("[find=select_contacts]").hasClass('submenu_app_chat_chatmenu_icon_active')){
			that.Add_ChatContacts(); //toto => make scroll resert to beginning, but less important if the list is short
		}
	}, that);
	if("class" in attribute){
		Elem.addClass(attribute['class']);
	}
	submenu_wrapper.find("[find=submenu_wrapper_bottom]").append(Elem);
	if(this.param){
		Elem.find("[find=select_contacts]").click();
	} else {
		Elem.find("[find=select_chats]").click();
	}
	
	//Free memory
	//submenu_wrapper = null; //In some placea it bugs because it's used in a lower scope
	delete submenu_wrapper;
	return true;
};

Submenu.prototype.Add_ChatChats = function() {
	return true;
};

Submenu.prototype.Add_ChatContacts = function() {
	var that = this;
	var submenu_wrapper = this.Wrapper();
	var attribute = this.attribute;
	var preview = this.preview;
	var thumbnail = false;
	var wrapper_content_id = this.id+"_chat_contacts";

	submenu_wrapper.find("[find=submenu_wrapper_content]").empty();
	submenu_wrapper.find("[find=submenu_wrapper_content]").prop("id", wrapper_content_id);

	var temp = Lincko.storage.list('users', null);
	//Add alphabetic username
	for(var i in temp){
		temp[i]['alphabet_order'] = Pinyin.GetQP(temp[i]['-username']);
	}

	var visible = [];
	var invitation = [];
	var contacts = [];
	if(temp){
		for(var i in temp){
			if(temp[i]['_invitation'] && temp[i]['_id']!=wrapper_localstorage.uid){
				invitation.push(temp[i]);
			} else if(temp[i]['_visible'] || temp[i]['_id']==wrapper_localstorage.uid){
				visible.push(temp[i]);
			}
		}
	}

	if(invitation.length > 0){
		var Elem = $('#-submenu_app_chat_new_contact').clone();
		Elem.prop("id", "");
		Elem.find("[find=submenu_title]").html(Lincko.Translation.get('app', 2304, 'html')); //A user has invited you
		submenu_wrapper.find("[find=submenu_wrapper_content]").append(Elem);
	}
	contacts = Lincko.storage.sort_items(invitation, 'alphabet_order');
	for(var i in contacts){
		var Elem = $('#-submenu_app_chat_chat_contact').clone();
		var Elem_id = that.id+"_submenu_app_chat_chat_contact_"+contacts[i]['_id'];
		Elem.prop("id", "");
		Elem.removeClass("submenu_deco").addClass("submenu_deco_read");
		thumbnail = Lincko.storage.getLinkThumbnail(contacts[i]['profile_pic']);
		if(thumbnail){
			Elem.find("[find=picture_src]").css('background-image','url("'+thumbnail+'")');
		} else if(contacts[i]['_id']==0){ //LinckoBot
			Elem.find("[find=picture_src]").css('background-image','url("'+app_application_icon_roboto.src+'")');
		} else if(contacts[i]['_id']==1){ //Monkey King
			Elem.find("[find=picture_src]").css('background-image','url("'+app_application_icon_monkeyking.src+'")');
		} else {
			Elem.find("[find=picture_src]").css('background-image','url("'+app_application_icon_single_user.src+'")');
		}
		Elem.find("[find=who]").html(wrapper_to_html(contacts[i]['-username']));
		Elem.find("[find=invitation]").removeClass("display_none");
		Elem.find("[find=invitation_accept]").removeClass("display_none").on("click", [contacts[i]['_id'], Elem_id], function(event) {
			event.stopPropagation();
			var users_id = event.data[0];
			var param = {
				id: wrapper_localstorage.uid,
				"users>access": {},
			};
			param["users>access"][users_id] = true;
			wrapper_sendAction(
				param,
				'post',
				'user/update',
				function(){
					app_application_lincko.prepare('contacts_list', true);
					app_application_action(10); //Accept invitation
				}
			);
			Lincko.storage.data['users'][users_id]['_invitation'] = false;
			Lincko.storage.data['users'][users_id]['_visible'] = true;
			app_application_lincko.prepare('contacts_list', true);
		});
		Elem.find("[find=invitation_reject]").removeClass("display_none").on("click", [contacts[i]['_id'], Elem_id], function(event) {
			event.stopPropagation();
			var users_id = event.data[0];
			var param = {
				id: wrapper_localstorage.uid,
				"users>access": {},
			};
			param["users>access"][users_id] = false;
			wrapper_sendAction(
				param,
				'post',
				'user/update',
				function(){
					app_application_lincko.prepare('contacts_list', true);
					app_application_action(11); //Reject invitation
				}
			);
			Lincko.storage.data['users'][users_id]['_invitation'] = false;
			Lincko.storage.data['users'][users_id]['_visible'] = false;
			app_application_lincko.prepare('contacts_list', true);
		});
		submenu_wrapper.find("[find=submenu_wrapper_content]").append(Elem);
	}

	contacts = Lincko.storage.sort_items(visible, 'alphabet_order');
	for(var i in contacts){
		var Elem = $('#-submenu_app_chat_chat_contact').clone();
		Elem.prop("id", that.id+"_submenu_app_chat_chat_contact_"+contacts[i]['_id']);
		thumbnail = Lincko.storage.getLinkThumbnail(contacts[i]['profile_pic']);
		if(thumbnail){
			Elem.find("[find=picture_src]").css('background-image','url("'+thumbnail+'")');
		} else if(contacts[i]['_id']==0){ //LinckoBot
			Elem.find("[find=picture_src]").css('background-image','url("'+app_application_icon_roboto.src+'")');
		} else if(contacts[i]['_id']==1){ //Monkey King
			Elem.find("[find=picture_src]").css('background-image','url("'+app_application_icon_monkeyking.src+'")');
		} else {
			Elem.find("[find=picture_src]").css('background-image','url("'+app_application_icon_single_user.src+'")');
		}
		Elem.find("[find=who]").html(wrapper_to_html(contacts[i]['-username']));
		Elem.off("click");
		Elem.click([that, contacts[i]['_id']], function(event){ //toto => why this is called multiple time when when switch few times from Contact list adn Chats list?
			event.stopPropagation();
			submenu_chat_open_single(event.data[0], event.data[1]);
		});
		submenu_wrapper.find("[find=submenu_wrapper_content]").append(Elem);
		delete Elem;
	}
	$(window).resize();
	//submenu_wrapper = null; //In some placea it bugs because it's used in a lower scope
	delete submenu_wrapper;

	return true;
};

var submenu_chat_open_single_timer;
var submenu_chat_open_single_running = false; //toto => bad pattern because we should avoid running multiple times at the source
var submenu_chat_open_single = function(subm, users_id){
	if(submenu_chat_open_single_running){
		//Do nothing because already launch previously
		return true;
	}
	submenu_chat_open_single_running = true;
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
		submenu_Build("newchat", subm.layer+1, false, {
			type: "chats",
			id: chat_id,
			title: title,
		});
		clearTimeout(submenu_chat_open_single_timer);
		submenu_chat_open_single_timer = setTimeout(function(){
			submenu_chat_open_single_running = false;
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
					submenu_Build("newchat", subm.layer+1, false, {
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
				submenu_chat_open_single_running = false;
			}
		);
		
	}
};


Submenu.prototype.Add_ChatAddUser = function() {
	var that = this;
	var submenu_wrapper = this.Wrapper();
	var attribute = this.attribute;
	this.chat_status = "noresult";
	this.find_method = "unknown";

	submenu_chat_search.data.sub_that = that;

	//wechat notice banner
	if(base_is_wechat){
		var Elem = $('#-submenu_app_chat_wxNotice').clone().prop('id', '').click(function(){
			var elem_hand = $(this).find('.fa-hand-o-up');
			if(elem_hand.hasClass('velocity-animating')){ return; }

			var hand_bounce = [
			    { e: elem_hand, p: {top: -48},	o: { easing: "easeInSine", duration: 300, mobileHA: hasGood3Dsupport } },
			    { e: elem_hand, p: {top: 0}, 	o: { easing: "easeOutQuad", duration: 300, mobileHA: hasGood3Dsupport } },
			];
			elem_hand.velocity("stop");
			$.Velocity.RunSequence(hand_bounce);
		});

		var str_ellipsis = '<i class="fa fa-ellipsis-v"></i>';
		if(isIOS){ str_ellipsis = '<i class="fa fa-ellipsis-h"></i>'; }
		//Elem.find('[find=text]').html(Lincko.Translation.get('app', 3604, 'html', {date: str_ellipsis})); //toto
		submenu_wrapper.find("[find=submenu_wrapper_bottom]").addClass('submenu_wrapper_bottom_wxNotice').append(Elem);
	}

	//options - copy my url, my qr code, scanner
	var Elem = $('#-submenu_app_chat_add_user_options').clone().prop('id', '');
	submenu_chat_add_user_options_build(Elem, that);
	submenu_wrapper.find("[find=submenu_wrapper_content]").append(Elem);

	//Search bar
	var Elem = $('#-submenu_app_chat_add_user').clone();
	Elem.prop("id", "");
	Elem.find("[find=submenu_app_chat_search]").on({
		focus: function(e){ e.stopPropagation(); submenu_chat_label(this, that, true); },
		click: function(e){ e.stopPropagation(); submenu_chat_label(this, that, true); },
		blur: function(e){ e.stopPropagation(); submenu_chat_label(this, that); },
		change: function(e){ e.stopPropagation(); submenu_chat_label(this, that); },
		copy: function(e){ e.stopPropagation(); submenu_chat_label(this, that); },
		past: function(e){ e.stopPropagation(); submenu_chat_label(this, that, true); },
		cut: function(e){ e.stopPropagation(); submenu_chat_label(this, that); },
		keyup: function(e) {
			e.stopPropagation(); 
			if (e.which != 13) {
				submenu_chat_label(this, that);
			}
		},
		keypress: function(e) {
			e.stopPropagation(); 
			if (e.which == 13) {
				submenu_chat_label(this, that, false, true);
			}
		},
	});
	//Elem.find("[find=submenu_app_chat_search_input]").addClass('no_focus');
	submenu_wrapper.find("[find=submenu_wrapper_content]").append(Elem);

	//Information
	var Elem = $('#-submenu_app_chat_new_contact').clone();
	Elem.prop("id", this.id+"_info");
	Elem.addClass('submenu_app_chat_invitation_deco display_none');
	Elem.find("[find=submenu_title]").html('');
	Elem.find("[find=submenu_title]").addClass('submenu_app_chat_invitation_sentence');
	submenu_wrapper.find("[find=submenu_wrapper_content]").append(Elem);

	//User card
	var Elem = $('#-submenu_app_chat_chat_contact').clone();
	Elem.prop("id", this.id+"_user");
	Elem.addClass("submenu_app_chat_user_view display_none");
	Elem.find("[find=invitation]").removeClass("display_none");
	Elem.find("[find=invitation_invite]").removeClass("display_none").off("click");
	submenu_wrapper.find("[find=submenu_wrapper_content]").append(Elem);

	//Email invitation
	var Elem = $('#-submenu_app_chat_new_email').clone();
	Elem.prop("id", this.id+"_email");
	Elem.addClass('submenu_app_chat_invitation_deco display_none');
	Elem.find("[find=submenu_title]").html("");
	Elem.find("[find=invitation_invite]").removeClass("display_none").off("click");
	submenu_wrapper.find("[find=submenu_wrapper_content]").append(Elem);

	//Loading bar
	var Elem = $('#-submenu_app_chat_user_searching').clone();
	Elem.prop("id", this.id+"_searching");
	Elem.addClass('display_none');
	submenu_wrapper.find("[find=submenu_wrapper_content]").append(Elem);

	//QR code scanner
	var Elem = $('#-submenu_app_chat_user_scanner').clone();
	Elem.prop("id", this.id+"_scanner");
	Elem.find("[find=radar]").prop("id", this.id+"_radar");
	Elem.addClass('display_none');
	submenu_wrapper.find("[find=submenu_wrapper_content]").append(Elem);
	
	submenu_chat_new_user_result(that);

	app_application_lincko.add(
		that.id,
		'submenu_hide_'+that.preview+'_'+that.id,
		function(){
			var subm = this.action_param;
			submenu_chat_search.value_qrcode = null;
			if(base_scanner && 'dispose' in base_scanner){
				base_scanner.dispose();
				$("#"+subm.id+"_radar").recursiveEmpty();
			}
		},
		that
	);

	$(window).resize();
	//submenu_wrapper = null; //In some placea it bugs because it's used in a lower scope
	delete submenu_wrapper;
	return true;
};


var submenu_chat_add_user_options_build = function(elem, subm){
	if(base_is_wechat){
		elem.addClass('submenu_app_chat_add_user_options_wxMargin');
	}
	submenu_chat_add_user_options_build_btn.myURL(elem.find('[find=btn_myURL]'), subm);
	submenu_chat_add_user_options_build_btn.myQR(elem.find('[find=btn_myQR]'), elem.find('[find=popup_QRcode_wrapper]'));
	submenu_chat_add_user_options_build_btn.scan(elem.find('[find=btn_scan]'), subm);
}

var submenu_chat_add_user_options_build_btn = {
	myURL: function(elem, subm){
		elem.attr('data-clipboard-text', Lincko.storage.generateMyURL());
		var myurl = new Clipboard(elem[0]);
		myurl.on('success', function(e) {
			base_show_error(Lincko.Translation.get('app', 70, 'html'), false); //URL copied to the clipboard
			e.clearSelection();
		});
		myurl.on('error', function(e) {
			base_show_error(Lincko.Translation.get('app', 71, 'html'), true); //Your system does not allow to copy to the clipboard
			e.clearSelection();
		});
		app_application_lincko.add(
			subm.id,
			['submenu_hide_'+subm.preview+'_'+subm.id, 'myURL_fake'/*there are more than 1 sync function with same id and range*/],
			function(){
				var myurl = this.action_param;
				if(myurl){
					myurl.destroy();
				}
			},
			myurl
		);
	},
	myQR: function(elem, elem_QR_popup){
		elem_QR_popup.find('img').attr('src', Lincko.storage.generateMyQRcode());
		//elem_QR_img.addClass('submenu_personal_profile_picture');
		elem_QR_popup.click(function(){
			$(this).addClass('display_none');
		});
		elem.click(function(){
			elem_QR_popup.removeClass('display_none');
		});
	},
	scan: function(elem, subm){
		submenu_chat_search.value_qrcode = null;
		if(base_has_webcam || (base_is_wechat && wx && wx.scanQRCode)){
			elem.click(function(){
				if(subm.chat_status == 'scanner'){
					submenu_chat_new_user_result(subm, null, "noresult");
				} else {
					var input  = subm.Wrapper().find("[find=submenu_app_chat_search_input]");
					input.val("");
					var text_help = subm.Wrapper().find("[find=submenu_app_chat_search_text_help]");
					if(text_help.is(':hidden')){
						text_help.velocity("transition.fadeIn", {
							mobileHA: hasGood3Dsupport,
							duration: 100,
							delay: 50,
						});
					}
					submenu_chat_new_user_result(subm, null, "scanner");
				}
			});
		} else {
			elem.addClass('display_none');
		}
	},
}

var submenu_chat_new_user_result = function(sub_that, data, chat_status, param) {
	if(typeof data == "undefined"){ data = ""; }
	if(typeof chat_status == "string"){ sub_that.chat_status = chat_status; }
	chat_status = sub_that.chat_status;
	if(typeof param == "undefined"){ param = null; }

	Elem = $("#"+sub_that.id);
	Elem_user = $("#"+sub_that.id+"_user");
	Elem_info = $("#"+sub_that.id+"_info");
	Elem_email = $("#"+sub_that.id+"_email");
	Elem_searching = $("#"+sub_that.id+"_searching");
	Elem_scanner = $("#"+sub_that.id+"_scanner");
	Elem_radar = $("#"+sub_that.id+"_radar");

	Elem_user.addClass("display_none");
	Elem_info.addClass("display_none");
	Elem_email.addClass("display_none");
	Elem_searching.addClass("display_none");
	Elem_scanner.addClass("display_none");

	if(chat_status == "invitation"){
		Elem_email.removeClass("display_none");
		Elem_email.find("[find=invitation_email]").off("click");
		Elem_email.find("[find=submenu_title]").html(Lincko.Translation.get('app', 2307, 'js', {email: data,})); //[{email}] is not currently using Lincko. Would you like to send an invitation to sign up?
		var param = data;
		var invite_access = null;
		if(sub_that.param && typeof sub_that.param.invite_access != 'undefined'){
			invite_access = sub_that.param.invite_access;
		}
		Elem_email.find("[find=invitation_email]").click([param, invite_access], function(event){
			var param = {
				exists: false,
				email: event.data[0],
				invite_access: event.data[1],
			}
			wrapper_sendAction(
				param,
				'post',
				'user/invite',
				submenu_chat_invite_cb_success,
				submenu_chat_invite_cb_error,
				submenu_chat_invite_cb_begin
			);
		});
	}
	else if(chat_status == "searching"){
		Elem_searching.removeClass("display_none");
	}
	else if(chat_status == "found" && data && data['id'] && typeof data['profile_pic']!="undefined" && typeof data['username']!="undefined"){
		Elem_user.removeClass("display_none");
		Elem_user.find("[find=invitation_invite]").removeClass("display_none").off("click");
		var thumbnail = Lincko.storage.getProfileRaw(data['id'], data['updated_at']);
		if(data['id']==0){ //LinckoBot
			Elem_user.find("[find=picture_src]").css('background-image','url("'+app_application_icon_roboto.src+'")');
		} else if(data['id']==1){ //Monkey King
			Elem_user.find("[find=picture_src]").css('background-image','url("'+app_application_icon_monkeyking.src+'")');
		} else if(thumbnail){
			Elem_user.find("[find=picture_src]").css('background-image','url("'+thumbnail+'")');
		} else {
			Elem_user.find("[find=picture_src]").css('background-image','url("'+app_application_icon_single_user.src+'")');
		}
		Elem_user.find("[find=who]").html(wrapper_to_html(data['username']));
		var param = data;
		var invite_access = null;
		if(sub_that.param && typeof sub_that.param.invite_access != 'undefined'){
			invite_access = sub_that.param.invite_access;
		}
		Elem_user.find("[find=invitation_invite]").click([param, invite_access], function(event){
			var param = {
				exists: true,
				users_id: event.data[0]['id'],
				invite_access: event.data[1],
			}
			wrapper_sendAction(
				param,
				'post',
				'user/invite',
				submenu_chat_invite_cb_success,
				submenu_chat_invite_cb_error,
				submenu_chat_invite_cb_begin
			);
		});
	}
	else if(chat_status == "myself"){
		Elem_info.removeClass("display_none");
		Elem_info.find("[find=submenu_title]").html(Lincko.Translation.get('app', 2310, 'js', {email: data,})); //This is your account.
		if(data && data['id'] && typeof data['profile_pic']!="undefined" && typeof data['username']!="undefined"){
			Elem_user.removeClass("display_none");
			Elem_user.find("[find=invitation_invite]").off("click").addClass("display_none");
			var thumbnail = Lincko.storage.getProfileRaw(data['id'], data['updated_at']);
			if(data['id']==0){ //LinckoBot
				Elem_user.find("[find=picture_src]").css('background-image','url("'+app_application_icon_roboto.src+'")');
			} else if(data['id']==1){ //Monkey King
				Elem_user.find("[find=picture_src]").css('background-image','url("'+app_application_icon_monkeyking.src+'")');
			} else if(thumbnail){
				Elem_user.find("[find=picture_src]").css('background-image','url("'+thumbnail+'")');
			} else {
				Elem_user.find("[find=picture_src]").css('background-image','url("'+app_application_icon_single_user.src+'")');
			}
			Elem_user.find("[find=who]").html(wrapper_to_html(data['username']));
		}
	}
	else if(chat_status == "exists"){
		Elem_info.removeClass("display_none");
		Elem_info.find("[find=submenu_title]").html(Lincko.Translation.get('app', 2311, 'js', {email: data,})); //The user is already a contact.
		if(data && data['id'] && typeof data['profile_pic']!="undefined" && typeof data['username']!="undefined"){
			Elem_user.removeClass("display_none");
			Elem_user.find("[find=invitation_invite]").off("click").addClass("display_none");
			var thumbnail = Lincko.storage.getLinkThumbnail(data['profile_pic']);
			if(thumbnail){
				Elem_user.find("[find=picture_src]").css('background-image','url("'+thumbnail+'")');
			} else if(data['id']==0){ //LinckoBot
				Elem_user.find("[find=picture_src]").css('background-image','url("'+app_application_icon_roboto.src+'")');
			} else if(data['id']==1){ //Monkey King
				Elem_user.find("[find=picture_src]").css('background-image','url("'+app_application_icon_monkeyking.src+'")');
			} else {
				Elem_user.find("[find=picture_src]").css('background-image','url("'+app_application_icon_single_user.src+'")');
			}
			Elem_user.find("[find=who]").html(wrapper_to_html(data['username']));
		}
	}
	else if(chat_status == "invitationfailed"){
		Elem_info.removeClass("display_none");
		Elem_info.find("[find=submenu_title]").html(Lincko.Translation.get('app', 2312, 'js')); //Your invitation failed to send, please try again.
	}
	else if(chat_status == "invitationsuccess"){
		if(sub_that.find_method=="email"){
			app_application_action(6); //Invite by email
		} else if(sub_that.find_method=="qrcode"){
			app_application_action(7); //Invite by internal scan
		}
		Elem_info.removeClass("display_none");
		Elem_info.find("[find=submenu_title]").html(Lincko.Translation.get('app', 2309, 'js')); //Your invitation has been sent.
		if(sub_that && sub_that.param && sub_that.param.prevSub && sub_that.param.prevSub.menu == 'app_projects_users_contacts'){
			Elem_info.find("[find=submenu_title]").append('<br/>'+Lincko.Translation.get('app', 2313, 'js')); //Once your invitation is accepted, the new contact will be added to this project and your Contacts list. Once added, you can assign tasks to them in this project. 
		}
	}
	else if(chat_status == "operationfailed"){
		Elem_info.removeClass("display_none");
		Elem_info.find("[find=submenu_title]").html(Lincko.Translation.get('app', 2314, 'js')); //Operation failed.
	}
	else if(chat_status == "operationsuccess"){
		Elem_info.removeClass("display_none");
		Elem_info.find("[find=submenu_title]").html(Lincko.Translation.get('app', 2315, 'js')); //Operation successed.
	}
	else if(chat_status == "scanner"){
		Elem_scanner.removeClass("display_none");
		Elem_radar.removeClass("display_none");
		submenu_chat_search.value_qrcode = null;
		if(base_scanner && 'dispose' in base_scanner){
			base_scanner.dispose();
			Elem_radar.recursiveEmpty();
		}
		if(!base_is_wechat){
			base_scanner = new w69b.qr.ui.ContinuousScanner();
		}
		base_scanner.setDecodedCallback(function(url_code) {
			var data = url_code.match(/\/uid\/(.+)$/);
			if(data[1]){
				base_scanner.dispose();
				submenu_chat_search.find_qrcode(submenu_chat_search.data.sub_that, data[1]);
			}
		});
		base_scanner.render(Elem_radar.get(0));
		if(base_has_webcam_sub){
			//var span = $('<span>').html('toggle');
			$(base_scanner.If)
				.addClass('base_pointer')
				.on('click', function(){
					base_video_device_current++;
					if(!base_video_device[base_video_device_current]){
						base_video_device_current = 0;
					}
					submenu_chat_new_user_result(submenu_chat_search.data.sub_that, null, "scanner");
				});
		}
	}
	else { //noresult
		Elem_info.removeClass("display_none");
		Elem_info.find("[find=submenu_title]").html(Lincko.Translation.get('app', 2308, 'js')); //Please enter an Email address.
	}

	if(chat_status != "scanner"){
		submenu_chat_search.value_qrcode = null;
		if(base_scanner && 'dispose' in base_scanner){
			base_scanner.dispose();
			Elem_radar.addClass("display_none");
		}
	}

	if(myIScrollList["overthrow_"+sub_that.id]){
		myIScrollList["overthrow_"+sub_that.id].refresh();
	}
	
}

var submenu_chat_label = function(that, sub_that, focus, force) {
	if(typeof focus == 'undefined'){ focus = false; }
	if(typeof force == 'undefined'){ force = false; }
	Elem = $(that);
	var input = Elem.find("[find=submenu_app_chat_search_input]");
	var text_help = Elem.find("[find=submenu_app_chat_search_text_help]");
	var val = $.trim(input.val());
	if(val.length<=0){
		if(text_help.is(':hidden')){
			text_help.velocity("transition.fadeIn", {
				mobileHA: hasGood3Dsupport,
				duration: 300,
				delay: 100,
			});
		}
	} else {
		if(text_help.is(':visible')){
			text_help.velocity("transition.fadeOut", {
				mobileHA: hasGood3Dsupport,
				duration: 300,
				delay: 100,
			});
		}
	}
	if(focus){
		input.focus();
	}
	if(force){
		submenu_chat_search.find(sub_that, 0, true);
	} else {
		submenu_chat_search.find(sub_that);
	}
	
}

var submenu_chat_select = function(opt, Elem){
	if(opt !== 'chats' && opt !== 'contacts'){
		opt = 'chats';
	}
	Elem.find(".submenu_app_chat_chatmenu_icon").removeClass('submenu_app_chat_chatmenu_icon_active');
	Elem.find("[find=select_"+opt+"]").addClass('submenu_app_chat_chatmenu_icon_active');
}

var submenu_chat_search = {

	timing: null,

	value: null,

	value_qrcode: null,

	data: {
		sub_that: null,
		email: null,
		users_id: null,
	},

	find_qrcode: function(sub_that, user_code){
		sub_that.find_method = 'qrcode';
		clearTimeout(submenu_chat_search.timing);
		if(user_code.length>=2 && submenu_chat_search.value_qrcode !== user_code){
			submenu_chat_new_user_result(sub_that, null, "searching");
			submenu_chat_search.data = {
				sub_that: sub_that,
				email: null,
				users_id: null,
			};
			wrapper_sendAction(
				user_code,
				'post',
				'user/find_qrcode',
				submenu_chat_search_cb_success,
				submenu_chat_search_cb_error,
				submenu_chat_search_cb_begin
			);
		} else {
			submenu_chat_new_user_result(sub_that, null, "noresult");
		}
		submenu_chat_search.value_qrcode = user_code;
	},

	find: function(sub_that, timer, force){ 
		sub_that.find_method = 'email';
		var Elem = $("#"+sub_that.id);
		var input = Elem.find("[find=submenu_app_chat_search_input]");
		var param = $.trim(input.val());
		if(typeof timer !== 'number'){ timer = 600; } //Add a small timeout of 600ms to let the use be able to finish 
		if(typeof force !== 'boolean'){ force = false; }
		
		if(param.length>=2 && (force || submenu_chat_search.value !== param) && submenu_chat_search.valid_email(param)){
			submenu_chat_new_user_result(sub_that, null, "searching");
			clearTimeout(submenu_chat_search.timing);
			if(force){ timer = 0; }
			submenu_chat_search.timing = setTimeout(function(){
				var email = param;
				submenu_chat_search.value = param;
				submenu_chat_search.data = {
					sub_that: sub_that,
					email: email,
					users_id: null,
				}
				wrapper_sendAction(
					email,
					'post',
					'user/find',
					submenu_chat_search_cb_success,
					submenu_chat_search_cb_error,
					submenu_chat_search_cb_begin
				);
			}, timer);
		} else if(param.length<2 || submenu_chat_search.value !== param || force){
			submenu_chat_new_user_result(sub_that, null, "noresult");
			clearTimeout(submenu_chat_search.timing);
			submenu_chat_search.value = param;
		}
	},

	valid_email: function(text){
		var regex_1 = /^.{1,191}$/g;
		var regex_2 = /^.{1,100}@.*\..{2,4}$/gi;
		var regex_3 = /^[_a-z0-9-%+]+(\.[_a-z0-9-%+]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/gi;
		return regex_1.test(text) && regex_2.test(text) && regex_3.test(text);
	}
};

var submenu_chat_search_cb_success = function(msg, error, status, data){
	if(data.data){
		data = data.data;
	} else {
		data = false;
	}
	if(typeof data == "object"){
		if(data.myself){
			submenu_chat_new_user_result(submenu_chat_search.data.sub_that, data, "myself");
		} else if(data.contact){
			submenu_chat_new_user_result(submenu_chat_search.data.sub_that, data, "exists");
		} else {
			submenu_chat_new_user_result(submenu_chat_search.data.sub_that, data, "found");
		}
	} else if(data){
		submenu_chat_new_user_result(submenu_chat_search.data.sub_that, submenu_chat_search.data.email, "invitation");
	} else {
		submenu_chat_new_user_result(submenu_chat_search.data.sub_that, null, "noresult");
	}
};

var submenu_chat_search_cb_error = function(){
	submenu_chat_new_user_result(submenu_chat_search.data.sub_that, null, "noresult");
};

var submenu_chat_search_cb_begin = function(){
	submenu_chat_new_user_result(submenu_chat_search.data.sub_that, null, "searching");
};

var submenu_chat_invite_cb_success = function(msg, error, status, data){
	if(data.data){
		data = data.data;
	} else {
		data = false;
	}
	if(data){
		submenu_chat_new_user_result(submenu_chat_search.data.sub_that, null, "invitationsuccess");
	} else {
		submenu_chat_new_user_result(submenu_chat_search.data.sub_that, null, "invitationfailed");
	}
	this.find_method = "unknown";
};

var submenu_chat_inviteqrcode_cb_success = function(msg, error, status, data){
	Lincko.storage.getLatest();
	if(data.data){
		data = data.data;
	} else {
		data = false;
	}
	if(data){
		submenu_chat_new_user_result(submenu_chat_search.data.sub_that, null, "operationsuccess");
	} else {
		submenu_chat_new_user_result(submenu_chat_search.data.sub_that, null, "operationfailed");
	}
};

var submenu_chat_invite_cb_error = function(){
	submenu_chat_new_user_result(submenu_chat_search.data.sub_that, null, "invitationfailed");
};

var submenu_chat_invite_cb_begin = function(){
	submenu_chat_new_user_result(submenu_chat_search.data.sub_that, null, "searching");
};

Submenu.prototype.Add_ChatContent = function() {
	var that = this;
	var submenu_wrapper = this.Wrapper();
	var position = submenu_wrapper.find("[find=submenu_wrapper_content]");
	position.addClass('overthrow');
	position.empty();

	var chatlist_subConstruct = function(){
		this.list_wrapper.addClass("skylist_maxMobileL_force").addClass('submenu_content_chat');
		this.elem_newcardCircle.click([that.layer+1, that.preview], function(event) {
			submenu_Build("new_group", event.data[0], false, {type: 'chats', alwaysMe: true}, event.data[1]);
		})
		.appendTo(this.list_wrapper);
	}

	var app_layers_chats_list = new skylist(
		'global_chats',
		position,
		null,
		chatlist_subConstruct,
		false,
		false,
		that.id
	);

	submenu_wrapper.find("[find=search_textbox]").addClass('no_focus');

	//toto => synchronization still need to work for repositioning and adding new chat group or projects
	app_application_lincko.add(
		that.id,
		["projects", "chats"],
		function(){
			var layer = $('#'+this.id);
			var prefix = 'skylist_card_'+this.action_param.md5id+'_';
			var items = this.action_param.Lincko_itemsList = this.action_param.list_filter();
			var list = {};
			for(var i in items){
				list[ prefix + items[i]['root_type']+"_"+items[i]['root_id'] ] = items[i]['timestamp'];
			}
			
			var Elems = layer.find('[find=card]');

			//For existing items
			Elems.each(function(){
				var Elem = $(this);
				var list_bis = list;
				if(typeof list_bis[Elem.prop('id')] == "undefined"){ //remove
					Elem.velocity('slideUp', {
						mobileHA: hasGood3Dsupport,
						complete: function(){
							$(this).recursiveRemove();
						}
					});
				} else if(list_bis[Elem.prop('id')] != Elem.attr('timestamp')){ //update (move place)
					var parent = Elem.parent();
					Elem.detach(); //cut
					var timestamp = list_bis[Elem.prop('id')];
					var Elems_bis = layer.find('[find=card]');
					var attached = false;
					Elems_bis.each(function(){
						var Elem_bis = $(this);
						if(!attached && timestamp >= Elem_bis.attr('timestamp')){
							attached = true;
							Elem.attr('timestamp', timestamp);
							Elem_bis.before(Elem);
							return false;
						}
					});
					if(!attached){
						parent.append(Elem);
					}
					list_bis[ Elem.prop('id') ] = Elem.attr('timestamp');
				}
			});

			//For new items
			for(var i in items){
				var Elem = $('#'+ prefix + items[i]['root_type']+"_"+items[i]['root_id']);
				if(Elem.length <= 0){
					var Elem = this.action_param.addChat(items[i]);
					var parent = this.action_param.list
					Elem.detach(); //cut
					var timestamp = list[Elem.prop('id')];
					var Elems_bis = layer.find('[find=card]');
					var attached = false;
					Elems_bis.each(function(){
						var Elem_bis = $(this);
						if(!attached && timestamp >= Elem_bis.attr('timestamp')){
							attached = true;
							Elem.attr('timestamp', timestamp);
							Elem_bis.before(Elem);
							return false;
						}
					});
					if(!attached){
						parent.append(Elem);
					}
				} else if(items[i]['timestamp'] != Elem.attr('timestamp')){
					this.action_param.addChat(items[i]);
				}
			}

		},
		app_layers_chats_list
	);

	//Free memory
	//submenu_wrapper = null; //In some placea it bugs because it's used in a lower scope
	delete submenu_wrapper;
	return true;
};

submenu_list['chat'] = {
	//Set the title of the top
	"_title": {
		"style": "customized_title",
		"title": Lincko.Translation.get('app', 2301, 'html'), //Chats
		"class": "submenu_app_chat_top base_ChatMenuHeader",
	},
	"left_button": {
		"style": "title_left_button",
		"title": Lincko.Translation.get('app', 7, 'html'), //Cancel
		'hide': true,
		"class": "base_pointer",
	},
	"right_button": {
		"style": "title_right_button",
		"title": "",
		"class": "base_pointer icon-AddPerson submenu_app_chat_title_right_button",
		"action": function(Elem, that) {
			submenu_Build('chat_add_user', that.layer+1, true, null, that.preview)
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
		"title": Lincko.Translation.get('app', 7, 'html'), //Cancel
		'hide': true,
		"class": "base_pointer",
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

Submenu_select.chat_content = function(Elem) {
	Elem.Add_ChatContent();
};

Submenu_select.chat_menu = function(Elem){
	Elem.Add_ChatMenu();
};

Submenu_select.chat_chats = function(Elem){
	Elem.Add_ChatChats();
};

Submenu_select.chat_add_user = function(Elem){
	Elem.Add_ChatAddUser();
};

Submenu.prototype.Add_ChatMenu = function() {
	var attribute = this.attribute;
	var submenu_wrapper = this.Wrapper();
	submenu_wrapper.find("[find=submenu_wrapper_content]").empty();
	var Elem = $('#-submenu_app_chat_chatmenu').clone();
	var that = this;
	Elem.prop("id", this.id+"_submenu_app_chat_chatmenu");
	submenu_wrapper.find("[find=submenu_wrapper_bottom]").addClass('submenu_bottom');
	submenu_wrapper.find("[find=submenu_wrapper_content]").css('bottom', submenu_wrapper.find("[find=submenu_wrapper_bottom]").height());
	submenu_wrapper.find("[find=submenu_wrapper_content]").prop("id", '');
	Elem.find("[find=select_chats]").click(function(){
		if(!$(this).hasClass('submenu_app_chat_chatmenu_icon_active')){
			submenu_chat_select('chats', Elem);
			submenu_Clean(that.layer+1, true);
			that.Wrapper().find("[find=submenu_title]").html(Lincko.Translation.get('app', 2301, 'html')); //Chat room
			that.Add_ChatContent();
		}
	});
	Elem.find("[find=select_contacts]").click(function(){
		if(!$(this).hasClass('submenu_app_chat_chatmenu_icon_active')){
			submenu_chat_select('contacts', Elem);
			submenu_Clean(that.layer+1, true);
			that.Wrapper().find("[find=submenu_title]").html(Lincko.Translation.get('app', 2302, 'html')); //Contacts list
			that.Add_ChatContacts();
		}
	});
	app_application_lincko.add(that.id+"_submenu_app_chat_chatmenu", "contacts_list", function(){
		that.Add_ChatContacts();
	});
	if("class" in attribute){
		Elem.addClass(attribute['class']);
	}
	submenu_wrapper.find("[find=submenu_wrapper_bottom]").append(Elem);
	Elem.find("[find=select_chats]").click();
	//Free memory
	delete submenu_wrapper;
	return true;
};

Submenu.prototype.Add_ChatChats = function() {
	return true;
};

Submenu.prototype.Add_ChatContacts = function() {
	var that = this;
	var attribute = this.attribute;
	var preview = this.preview;
	var thumbnail = false;

	this.Wrapper().find("[find=submenu_wrapper_content]").empty();

	var temp = Lincko.storage.list('users');
	var visible = [];
	var invitation = [];
	var contacts = [];
	if(temp){
		for(var i in temp){
			if(temp[i]['_visible'] || temp[i]['_id']==wrapper_localstorage.uid){
				visible.push(temp[i]);
			} else if(!temp[i]['_visible'] && temp[i]['_invitation'] && temp[i]['_id']!=wrapper_localstorage.uid){
				invitation.push(temp[i]);
			}
		}
	}

	if(invitation.length > 0){
		var Elem = $('#-submenu_app_chat_new_contact').clone();
		Elem.prop("id", "");
		Elem.find("[find=submenu_title]").html(Lincko.Translation.get('app', 2304, 'html')); //A user has invited you
		this.Wrapper().find("[find=submenu_wrapper_content]").append(Elem);
	}
	contacts = Lincko.storage.sort_items(invitation, 'username');
	for(var i in contacts){
		var Elem = $('#-submenu_app_chat_chat_contact').clone();
		var Elem_id = that.id+"_submenu_app_chat_chat_contact_"+contacts[i]['_id'];
		Elem.prop("id", "");
		Elem.removeClass("submenu_deco").addClass("submenu_deco_read");
		thumbnail = Lincko.storage.getLinkThumbnail(contacts[i]['profile_pic']);
		if(thumbnail){
			Elem.find("[find=picture_src]").prop("src", thumbnail);
		}
		Elem.find("[find=who]").html(contacts[i]['-username'].ucfirst());
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
				}
			);
			Lincko.storage.data['users'][users_id]['_invitation'] = false;
			Lincko.storage.data['users'][users_id]['_visible'] = false;
			app_application_lincko.prepare('contacts_list', true);
		});
		this.Wrapper().find("[find=submenu_wrapper_content]").append(Elem);
	}

	contacts = Lincko.storage.sort_items(visible, 'username');
	for(var i in contacts){
		var Elem = $('#-submenu_app_chat_chat_contact').clone();
		Elem.prop("id", "");
		thumbnail = Lincko.storage.getLinkThumbnail(contacts[i]['profile_pic']);
		if(thumbnail){
			Elem.find("[find=picture_src]").prop("src", thumbnail);
		}
		Elem.find("[find=who]").html(contacts[i]['-username'].ucfirst());
		Elem.click(function(){

		});
		this.Wrapper().find("[find=submenu_wrapper_content]").append(Elem);
	}
	$(window).resize();
	return true;
};

Submenu.prototype.Add_ChatAddUser = function() {
	var that = this;
	var submenu_wrapper = this.Wrapper();
	var attribute = this.attribute;
	this.chat_status = "noresult";

	//Search bar
	var Elem = $('#-submenu_app_chat_add_user').clone();
	Elem.prop("id", "");
	Elem.find("[find=submenu_app_chat_search]").on({
		focus: function(e){ e.stopPropagation(); submenu_chat_label(this, true); },
		click: function(e){ e.stopPropagation(); submenu_chat_label(this, true); },
		blur: function(e){ e.stopPropagation(); submenu_chat_label(this); },
		change: function(e){ e.stopPropagation(); submenu_chat_label(this); },
		copy: function(e){ e.stopPropagation(); submenu_chat_label(this); },
		past: function(e){ e.stopPropagation(); submenu_chat_label(this, true); },
		cut: function(e){ e.stopPropagation(); submenu_chat_label(this); },
		keyup: function(e) {
			e.stopPropagation(); 
			if (e.which != 13) {
				submenu_chat_label(this);
			}
		},
		keypress: function(e) {
			e.stopPropagation(); 
			if (e.which == 13) {
				submenu_chat_label(this, false, true);
			}
		},
	});
	Elem.find("[find=submenu_app_chat_search_input]").addClass('no_focus');
	submenu_wrapper.find("[find=submenu_wrapper_content]").append(Elem);

	/*
	//User card
	var Elem = $('#-submenu_app_chat_chat_contact').clone();
	Elem.prop("id", this.id+"_user");
	Elem.addClass("submenu_app_chat_user_view display_none");
	Elem.find("[find=invitation]").removeClass("display_none");
	Elem.find("[find=invitation_invite]").removeClass("display_none").off("click");
	submenu_wrapper.find("[find=submenu_wrapper_content]").append(Elem);

	//Information
	var Elem = $('#-submenu_app_chat_new_contact').clone();
	Elem.prop("id", this.id+"_info");
	Elem.addClass('submenu_app_chat_invitation_deco display_none');
	Elem.find("[find=submenu_title]").html(Lincko.Translation.get('app', 2308, 'js')); //No result
	Elem.find("[find=submenu_title]").addClass('submenu_app_chat_invitation_sentence');
	submenu_wrapper.find("[find=submenu_wrapper_content]").append(Elem);

	//Email invitation
	var Elem = $('#-submenu_app_chat_new_email').clone();
	Elem.prop("id", this.id+"_email");
	Elem.addClass('submenu_app_chat_invitation_deco display_none');
	Elem.find("[find=submenu_title]").html(Lincko.Translation.get('app', 2307, 'js', {email: 'toto@toto.com',})); //[{email}] is not currently using Lincko. Would you like to send an invitation to sign up?
	submenu_wrapper.find("[find=submenu_wrapper_content]").append(Elem);

	//Loading bar
	var Elem = $('#-submenu_app_chat_user_searching').clone();
	Elem.prop("id", this.id+"_searching");
	Elem.addClass('display_none');
	submenu_wrapper.find("[find=submenu_wrapper_content]").append(Elem);
	*/

	delete submenu_wrapper;
	return true;
};

var submenu_chat_new_user_result = function(that) {

	//Elem = $("#"+that.id);
	//console.log(that.chat_status);
	//Elem.find("[find=_user]").addClass("display_none");

	/*
	//User card
	var Elem = $('#-submenu_app_chat_chat_contact').clone();
	Elem.prop("id", this.id+"_user");
	Elem.addClass("submenu_app_chat_user_view display_nonee");
	Elem.find("[find=invitation]").removeClass("display_none");
	Elem.find("[find=invitation_invite]").removeClass("display_none").on("click", 0, function(event) {
		event.stopPropagation();
		console.log('invite: '+event.data);
		
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
			}
		);
		
	});
	submenu_wrapper.find("[find=submenu_wrapper_content]").append(Elem);

	var Elem = $('#-submenu_app_chat_new_contact').clone();
	Elem.prop("id", this.id+"_info");
	Elem.addClass('submenu_app_chat_invitation_deco display_nonee');
	Elem.find("[find=submenu_title]").html(Lincko.Translation.get('app', 2308, 'js')); //No result
	Elem.find("[find=submenu_title]").addClass('submenu_app_chat_invitation_sentence');
	submenu_wrapper.find("[find=submenu_wrapper_content]").append(Elem);

	var Elem = $('#-submenu_app_chat_new_email').clone();
	Elem.prop("id", this.id+"_email");
	Elem.addClass('submenu_app_chat_invitation_deco display_nonee');
	Elem.find("[find=submenu_title]").html(Lincko.Translation.get('app', 2307, 'js', {email: 'toto@toto.com',})); //[{email}] is not currently using Lincko. Would you like to send an invitation to sign up?
	submenu_wrapper.find("[find=submenu_wrapper_content]").append(Elem);

	var Elem = $('#-submenu_app_chat_user_searching').clone();
	Elem.prop("id", this.id+"_searching");
	Elem.addClass('display_nonee');
	submenu_wrapper.find("[find=submenu_wrapper_content]").append(Elem);
	*/
}

var submenu_chat_label = function(that, focus, force) {
	if(typeof focus == 'undefined'){ focus = false; }
	if(typeof force == 'undefined'){ force = false; }
	Elem = $(that);
	var input = Elem.find("[find=submenu_app_chat_search_input]");
	var text_help = Elem.find("[find=submenu_app_chat_search_text_help]");
	if(input.val().length<=0){
		if(text_help.is(':hidden')){
			text_help.velocity("transition.fadeIn", { duration: 300, delay: 100, });
		}
	} else {
		if(text_help.is(':visible')){
			text_help.velocity("transition.fadeOut", { duration: 300, delay: 100, });
		}
	}
	if(focus){
		input.focus();
	}
	if(force){
		submenu_chat_search.find(that, 0, true);
	} else {
		submenu_chat_search.find(that);
	}
	
}

var submenu_chat_select = function(opt, Elem){
	if(opt !== 'chats' && opt !== 'contacts'){
		opt = 'chats';
	}
	Elem.find(".submenu_app_chat_chatmenu_icon").removeClass('submenu_app_chat_chatmenu_icon_active');
	Elem.find("[find=select_"+opt+"]").addClass('submenu_app_chat_chatmenu_icon_active');
}

var valid = function(text){
	var regex_1 = /^.{1,191}$/g;
	var regex_2 = /^.{1,100}@.*\..{2,4}$/gi;
	var regex_3 = /^[_a-z0-9-%+]+(\.[_a-z0-9-%+]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/gi;
	return regex_1.test(text) && regex_2.test(text) && regex_3.test(text);
}
var submenu_chat_searchTiming = null;
var submenu_chat_searchValue = '';
var submenu_chat_search = {

	timing: null,

	value: null,

	find: function(sub_that, timer, force){
		var that = this;
		var Elem = $(sub_that);
		var input = Elem.find("[find=submenu_app_chat_search_input]");
		var param = input.val();
		if(typeof timer !== 'number'){ timer = 600; } //Add a small timeout of 600ms to let the use be able to finish 
		if(typeof force !== 'boolean'){ force = false; }
		
		if((responsive.test("minTablet") || force) && param.length>=2 && this.value !== param && this.valid_email(param)){
			clearTimeout(this.timing);
			this.timing = setTimeout(function(){
				that.value = param;
				console.log(param);
				submenu_chat_new_user_result(sub_that);
				/*
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
					}
				);
				*/

			}, timer);
		} else if(param.length<2){
			clearTimeout(this.timing);
		}
	},

	valid_email: function(text){
		var regex_1 = /^.{1,191}$/g;
		var regex_2 = /^.{1,100}@.*\..{2,4}$/gi;
		var regex_3 = /^[_a-z0-9-%+]+(\.[_a-z0-9-%+]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/gi;
		return regex_1.test(text) && regex_2.test(text) && regex_3.test(text);
	}
};

Submenu.prototype.Add_ChatContent = function() {
	var submenu_wrapper = this.Wrapper();
	var position = submenu_wrapper.find("[find=submenu_wrapper_content]");
	//position.addClass('overthrow').addClass("submenu_chat_contents");
	position.addClass('overthrow');
	position.empty();
	//var Elem = $("[find=submenu_wrapper_title]", '#-submenu_app_chat_chatmenu').clone();

	//submenu_wrapper.find("[find=submenu_wrapper_title]").html(this.param['title']);

	var app_layers_chatlist = new skylist(
		'global_chats',
		position,
		null,
		function() {
			this.list_wrapper.addClass("skylist_maxMobileL_force");
		}
	);
toto = app_layers_chatlist;
	submenu_wrapper.find("[find=search_textbox]").addClass('no_focus');

	/*
	for (var item in chatList) {
		var elem = mainMenu.feed(position, chatList[item]);

		elem.on("click", chatList[item], function(event) {
				var title;
				if (event.data.type == 'chats') {
					title = $(this).find('header').html();
				} else {
					title = Lincko.storage.get("projects", event.data.id, "+title") + " Activity";
				}
				//render
				submenu_Build("newchat", true, false, {
					type: event.data.type,
					id: event.data.id,
					title: title,
				});
			}
		);
	}
	*/
	position.delegate(".skylist_card", "click", function() {
		if ($(this).attr('type') != 'history') {
			var tmp = $(this).prop("id").split("_");
			var id = tmp[tmp.length-1];
			var title = Lincko.storage.get('chats', id, '+title');
		}
		else {
			var tmp = $(this).prop("id").split("_");
			var id = tmp[tmp.length-1];
			var title = Lincko.storage.get("projects", id, "+title") + " Activity";
		}
		submenu_Build("newchat", true, false, {
			type: $(this).attr('type'),
			id: id,
			title: title }, false);
		return false;
	});
	//Free memory
	delete submenu_wrapper;
	return true;
};

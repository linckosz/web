submenu_list['chat'] = {
	//Set the title of the top
	"_title": {
		"style": "customized_title",
		"title": Lincko.Translation.get('app', 2301, 'html'), //Chat room
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
			console.log('add person'); //toto
		},
	},
	//It will create a form with a validation button
	"chat_menu": {
		"style": "chat_menu",
		"title": "",
	},
};

Submenu_select.chat_menu = function(Elem){
	Elem.Add_ChatMenu();
};

Submenu_select.chat_chats = function(Elem){
	Elem.Add_ChatChats();
};

Submenu.prototype.Add_ChatMenu = function() {
	var attribute = this.attribute;
	var submenu_wrapper = this.Wrapper();
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
	app_application_lincko.add(that.id+"_submenu_app_chat_chatmenu", "users", function(){
		that.Add_ChatContacts();
	});
	if("class" in attribute){
		Elem.addClass(attribute['class']);
	}
	submenu_wrapper.find("[find=submenu_wrapper_bottom]").append(Elem);
	Elem.find("[find=select_contacts]").click();
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

	contacts = Lincko.storage.sort_items(invitation, 'username');
	for(var i in invitation){
		var Elem = $('#-submenu_app_chat_chat_contact').clone();
		Elem.removeClass("submenu_deco").addClass("submenu_deco_read");
		thumbnail = Lincko.storage.getLinkThumbnail(contacts[i]['profile_pic']);
		if(thumbnail){
			Elem.find("[find=picture_src]").prop("src", thumbnail);
		}
		Elem.find("[find=who]").html(contacts[i]['-username'].ucfirst());
		Elem.find("[find=invitation]").removeClass("display_none");
		Elem.find("[find=accept]").click(function(){

		});
		Elem.find("[find=reject]").click(function(){

		});
		this.Wrapper().find("[find=submenu_wrapper_content]").append(Elem);
	}

	contacts = Lincko.storage.sort_items(visible, 'username');
	for(var i in contacts){
		var Elem = $('#-submenu_app_chat_chat_contact').clone();
		thumbnail = Lincko.storage.getLinkThumbnail(contacts[i]['profile_pic']);
		if(thumbnail){
			Elem.find("[find=picture_src]").prop("src", thumbnail);
		}
		Elem.find("[find=who]").html(contacts[i]['-username'].ucfirst());
		Elem.click(function(){

		});
		this.Wrapper().find("[find=submenu_wrapper_content]").append(Elem);
	}
	return true;
};

function submenu_chat_select(opt, Elem){
	if(opt !== 'chats' && opt !== 'contacts'){
		opt = 'chats';
	}
	Elem.find(".submenu_app_chat_chatmenu_icon").removeClass('submenu_app_chat_chatmenu_icon_active');
	Elem.find("[find=select_"+opt+"]").addClass('submenu_app_chat_chatmenu_icon_active');
}



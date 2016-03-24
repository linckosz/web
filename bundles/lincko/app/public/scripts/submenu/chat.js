submenu_list['chat'] = {
	//Set the title of the top
	"_title": {
		"style": "title",
		"title": Lincko.Translation.get('app', 2301, 'html'), //Chat room
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
	submenu_wrapper = this.Wrapper();
	var Elem = $('#-submenu_app_chat_chatmenu').clone();
	var that = this;
	Elem.prop("id", '');
	submenu_wrapper.find("[find=submenu_wrapper_bottom]").addClass('submenu_bottom');
	submenu_wrapper.find("[find=submenu_wrapper_content]").css('bottom', submenu_wrapper.find("[find=submenu_wrapper_bottom]").height());
	Elem.find("[find=select_chats]").click(function(){
		if(!$(this).hasClass('submenu_app_chat_chatmenu_icon_active')){
			submenu_chat_select('chats', Elem);
			submenu_Clean(that.layer+1, true);
			that.Wrapper().find("[find=submenu_wrapper_title]").html(Lincko.Translation.get('app', 2301, 'html')); //Chat room
		}
	});
	Elem.find("[find=select_contacts]").click(function(){
		if(!$(this).hasClass('submenu_app_chat_chatmenu_icon_active')){
			submenu_chat_select('contacts', Elem);
			submenu_Clean(that.layer+1, true);
			that.Wrapper().find("[find=submenu_wrapper_title]").html(Lincko.Translation.get('app', 2302, 'html')); //Contacts list
		}
	});
	Elem.find("[find=select_search]").click(function(){
		if(!$(this).hasClass('submenu_app_chat_chatmenu_icon_active')){
			submenu_chat_select('search', Elem);
			submenu_Clean(that.layer+1, true);
			that.Wrapper().find("[find=submenu_wrapper_title]").html(Lincko.Translation.get('app', 2303, 'html')); //Search words
		}
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
	var attribute = this.attribute;
	var Elem = $('#-submenu_app_chat_chatchats').clone();
	var that = this;
	Elem.prop("id", '');
	if("value" in attribute){
		Elem.find("[find=submenu_next_value]").html(attribute.value);
	}
	if("next" in attribute){
		if(attribute.next in submenu_list){
			if(attribute.style=="title"){
				Elem.Add_MenuTitle(attribute);
			}
			for(var att in submenu_list[attribute.next]){
				next_attribute = submenu_list[attribute.next][att];
				if("style" in next_attribute && "title" in next_attribute){
					if(next_attribute.style == "title"){
						attribute.title = next_attribute.title;
					}
				}
			}
			$("<img class='submenu_icon submenu_icon_next' src='/lincko/app/images/submenu/next.png' />").appendTo(Elem.find("[find=submenu_next_value]"));
			Elem.click(function(){
				$.each(that.Wrapper().find('.submenu_deco_next'), function() {
					$(this).removeClass('submenu_deco_next');
				});
				if(submenu_Build(attribute.next, that.layer+1)){
					$(this).addClass('submenu_deco_next');
				}
				
			});
		}
	}
	Elem.find("[find=submenu_next_title]").html(attribute.title);
	if("class" in attribute){
		Elem.addClass(attribute['class']);
	}
	this.Wrapper().find("[find=submenu_wrapper_content]").append(Elem);
	return true;
};

function submenu_chat_select(opt, Elem){
	if(opt !== 'chats' && opt !== 'contacts' && opt !== 'search'){
		opt = 'chats';
	}
	Elem.find(".submenu_app_chat_chatmenu_icon").removeClass('submenu_app_chat_chatmenu_icon_active');
	Elem.find("[find=select_"+opt+"]").addClass('submenu_app_chat_chatmenu_icon_active');
}

//app_application_lincko.add("app_project_quick_access_title", "upload", app_project_quick_access_title);

JSfiles.finish(function(){
	app_application_lincko.add(function(){
		

		for(var menu in submenu_list['chat']){
			if(menu != "_title" && menu != "chat_menu"){
				delete submenu_list['chat'][menu];
			}
		}
		
		var chats = Lincko.storage.list('chats');
		
		for(var i in chats){
			if(chats[i].url){
				submenu_list['chat'][chats[i].url] = {
					"style": "button",
					"title": chats[i]['+title'],
					"action_param": { chat_id:chats[i].url, },
					"action": function(event){
						console.log(event.data.chat_id);
					},
				};
			}
		}
		
	}, ['chats', 'chats_comments']);
});

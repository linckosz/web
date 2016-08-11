//Category 
submenu_list['contacts'] = {
	//Set the title of the top
	"_title": {
		"style": "customized_title",
		"title": Lincko.Translation.get('app', 3701, 'html'), //Start New Chat
		"class": function(elem) {
			if (elem.param.proid) {
				return "project" + elem.param.proid + " submenu_newchat_header";
			}
			else{
				return "submenu_newchat_header";
			}
		},
	},
	"left_button": {
		"style": "title_left_button",
		"title": Lincko.Translation.get('app', 7, 'html'), //'Cancel',
		'hide': true,
		"class": "base_pointer",
	},
	"right_button": {
		"style": "title_right_button",
		"title": Lincko.Translation.get('app', 41, 'html'), //Create
		"class": "base_pointer",
		"action": function(elem, submenu) {
			var that = submenu;
			var userList = {};
			var nameList = $.trim( $("#"+submenu.id).find("[name=title]").val() );

			var IDList = submenu_contacts_get(elem);
			IDList.push(wrapper_localstorage.uid);
			if (IDList.length == 1) {
				return;
			}
			for (var i=0;i<IDList.length; i++) {
				userList[IDList[i]] = true;
			}
			var tmp = $(elem).parents('.submenu_newchat_header').attr('class').split(" ");
			//toto => do not use of split, here we can use action_param to store projects_id
			for (var t in tmp) {
				if(tmp[t].indexOf('project')===0){
					var id = tmp[t].slice(7);
				}
			}
			var comment_id;
			if (id) {
				wrapper_sendAction({
					'parent_type':'projects',
					"parent_id": id,
					"title": nameList,
					"users>access": userList,
					},
					'post',
					'chat/create',
					function() {
						var chat = Lincko.storage.list('chats', 1, {'temp_id': comment_id})[0];
						if(chat){
							submenu_Build("newchat", that.layer, true, {
								type: 'chats',
								id: chat['_id'],
								title: chat['+title'],
							}, that.preview);
						} else {
							base_show_error(Lincko.Translation.get('app', 3702, 'js'), true); //Discussion group creation failed.
						}
						app_application_lincko.prepare("chats");
					},
					null,
					function(jqXHR, settings, temp_id) {
						comment_id = temp_id;
					});
			}
			else {
				wrapper_sendAction({
					'parent_type': null,
					"parent_id": -1,
					"title": nameList,
					"users>access": userList,
				},
				'post',
				'chat/create',
				function() {
					var chat = Lincko.storage.list('chats', 1, {'temp_id': comment_id})[0];
					if(chat){
						submenu_Build("newchat", that.layer, true, {
							type: 'chats',
							id: chat['_id'],
							title: chat['+title'],
						}, that.preview);
					} else {
						base_show_error(Lincko.Translation.get('app', 3702, 'js'), true); //Discussion group creation failed.
					}
				},
				null,
				function(jqXHR, settings, temp_id) {
					comment_id = temp_id;
				}
				);
			}
		},
	},

	"title": {
		"style": "input_text",
		"title": Lincko.Translation.get('app', 28, 'html'), //Title
		"name": "title",
		"value": "",
		"class": "submenu_input_text",
	},

	'contacts': {
		"style": "contacts",
		"title": "contacts", //toto
	},
	
};

function submenu_contacts_gen_chatcontacts(projectId) {
	if(typeof projectId == "undefined"){ projectId = null; }
	var contactList = {};
	var user;
	if (projectId) {
		var list = Lincko.storage.get("projects", projectId, "_perm");
		for(var i in list){
			user = Lincko.storage.get("users", i);
			if(user){
				contactList[user['_id']] = {
					'username': user['-username'],
					'id': user['_id'],
					'checked': false,
					'profile_pic': user['profile_pic'],
				}
			}
		}
	} else {
		var list = Lincko.storage.list('users', null, {_visible: true});
		for(var i in list){
			user = list[i];
			contactList[user['_id']] = {
				'username': user['-username'],
				'id': user['_id'],
				'checked': false,
				'profile_pic': user['profile_pic'],
			}
		}
	}
	user = Lincko.storage.get("users", wrapper_localstorage.uid);
	contactList[user['_id']] = {
		'username': user['-username'],
		'id': user['_id'],
		'checked': true,
		'profile_pic': user['profile_pic'],
	}

	return contactList;
};


Submenu_select.contacts = function(subm) {
	subm.Add_ContactContents();
};

/*This "getContacts" method needs to be used in submit acction*/
function submenu_contacts_get(elem) {
	var items = $(elem).parents(".submenu_wrapper").find(".submenu_contact_item .checked").parent().find("input.id");
	var keys = [];
	for (var i = 0; i < items.length; i++) {
		keys.push($(items[i]).val());
	}
	return keys;
};

Submenu.prototype.Add_ContactContents = function() { console.log('contactscontents');
	var attribute = this.attribute;
	var submenu_wrapper = this.Wrapper();
	var that = this;
	var profile_pic;
	var thumbnail;
	var position = $("[find='submenu_wrapper_content']", submenu_wrapper);
	position.addClass('overthrow');

	console.log(this.param);
	var contacts = submenu_contacts_gen_chatcontacts(this.param.proid);
	var Elem;
	console.log(contacts);
	for(var uid in contacts) {
		Elem = $('#-submenu_app_contacts').clone();
		Elem.prop('id', this.id+'_contact_'+uid);
		Elem.find('.username').html(wrapper_to_html(contacts[uid].username));

		thumbnail = Lincko.storage.getLinkThumbnail(contacts[uid].profile_pic);
		if(thumbnail){
			Elem.find("[find=picture_src]").prop("src", thumbnail);
		} else {
			Elem.find("[find=picture_src]").prop("src", app_application_icon_single_user.src);
		}
		Elem.find("[find=picture_src]").click([that.layer+1, contacts[uid]["id"], that.preview], function(event){
			event.stopPropagation();
			submenu_Build("personal_info", event.data[0], true, event.data[1], event.data[2]);
		});

		Elem.find('.id').val(uid);
		if (contacts[uid].checked == true || (that.param && that.param.alwaysMe && uid == wrapper_localstorage.uid) ) {
			Elem.find('.check').addClass('checked');
		}
		Elem.click(position, function(event) {
			var position = event.data;
			if($(this).find('.checked').length == 0 || (that.param && that.param.alwaysMe && $(this).find('.id').val() == wrapper_localstorage.uid) ) {
				$(this).find('.check').addClass('checked');
			} else {
				$(this).find('.checked').removeClass('checked');
			}
			if (that.param.selectOne) {
				$(this).siblings().find(".check").removeClass("checked");
			}

			if(position.find(".checked").length > 0) {
				position.find(".submenu_top_side_right").show();
			} else {
				position.find(".submenu_top_side_right").hide();
			}
		});
		
		if(position.find(".checked").length > 0) {
			position.find(".submenu_top_side_right").show();
		} else {
			position.find(".submenu_top_side_right").hide();
		}

		position.append(Elem);
	}
}

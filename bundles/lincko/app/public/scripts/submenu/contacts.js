//Category 
submenu_list['new_group'] = {
	//Set the title of the top
	"_title": {
		"style": "customized_title",
		"title": Lincko.Translation.get('app', 3701, 'html'), //Start New Chat
		"class": function(Elem) {
			if (Elem.param.proid) {
				return "project" + Elem.param.proid + " submenu_newchat_header";
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
		"action": function(Elem, subm) {
			var that = subm;
			var userList = {};
			var nameList = $.trim( $("#"+subm.id).find("[name=title]").val() );

			var IDList = submenu_contacts_get(Elem);
			IDList.push(wrapper_localstorage.uid);
			if (IDList.length == 1) {
				return;
			}
			for (var i=0;i<IDList.length; i++) {
				userList[IDList[i]] = true;
			}
			var tmp = $(Elem).parents('.submenu_newchat_header').attr('class').split(" ");
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
		"style": "contacts", //Do not sendAction when click
		"title": "contacts",
	},
	
};

submenu_list['edit_group'] = {
	//Set the title of the top
	"_title": {
		"style": "customized_title",
		"title": Lincko.Translation.get('app', 3703, 'html'), //Edit Chat
		"class": function(Elem) {
			if (Elem.param.proid) {
				return "project" + Elem.param.proid + " submenu_newchat_header";
			}
			else{
				return "submenu_newchat_header";
			}
		},
	},

	"left_button": {
		"style": "title_left_button",
		"title": Lincko.Translation.get('app', 25, 'html'), //Close
		'hide': true,
		"class": "base_pointer",
	},

	"title": {
		"style": "input_text",
		"title": Lincko.Translation.get('app', 28, 'html'), //Title
		"name": "title",
		"value": "",
		"class": "submenu_input_text",
		"now": function(Elem, subm){
			var value = Lincko.storage.getPlus(subm.param.type, subm.param.id)
			var input = Elem.find("[find=submenu_input]");
			input.prop('value', value);
			if(subm.param.type=='chats') {
				input.on({
					change: function(event){ submenu_contacts_update.chats_title(event.data, this); },
					past: function(event){ submenu_contacts_update.chats_title(event.data, this); },
					cut: function(event){ submenu_contacts_update.chats_title(event.data, this); },
					keyup: function(event) { submenu_contacts_update.chats_title(event.data, this); },
				}, subm);
			}
		}
	},

	'contacts_live': {
		"style": "contacts_live", //sendAction when click
		"title": "contacts_live",
	},
	
};

var submenu_contacts_update = {
	chats_title_timer: null,
	chats_title: function(subm, input){
		clearTimeout(submenu_contacts_update.chats_title_timer);
		submenu_contacts_update.chats_title_timer = setTimeout(function(id, value){
			wrapper_sendAction(
			{
				"id": id,
				"title": value,
			},
				'post',
				'chat/update'
			);
			submenu_contacts_update.chats_title_timer = null;
		}, 400, subm.param.id, $(input).val());
	},

	chats_contacts_list_ori: {}, //Keep trak of lastest status recorded on server
	chats_contacts_list: {},
	chats_contacts_list_update: function(subm, uid, checked){
		if(checked){ checked = true; } else { checked = false; } //Convert to boolean
		if(typeof submenu_contacts_update.chats_contacts_list_ori[uid] == 'boolean' && submenu_contacts_update.chats_contacts_list_ori[uid] != checked){
			if(!checked && subm.param.alwaysMe && uid == wrapper_localstorage.uid){
				return false; //Cannot disallow yourself
			}
			submenu_contacts_update.chats_contacts_list[uid] = checked;
		} else {
			delete submenu_contacts_update.chats_contacts_list[uid];
		}
		submenu_contacts_update.chats_contacts(subm);
	},

	chats_contacts_timer: null,
	chats_contacts: function(subm){
		clearTimeout(submenu_contacts_update.chats_contacts_timer);
		submenu_contacts_update.chats_contacts_timer = setTimeout(function(id){
			if(!$.isEmptyObject(submenu_contacts_update.chats_contacts_list)){
				wrapper_sendAction(
				{
					"id": id,
					"users>access": submenu_contacts_update.chats_contacts_list,
				},
					'post',
					'chat/update'
				);
				submenu_contacts_update.chats_contacts_list = {};
			}
			submenu_contacts_update.chats_contacts_timer = null;
		}, 2000, subm.param.id);
	},

}

function submenu_contacts_gen_chatcontacts(projectId, alwaysMe, contacts) {
	if(typeof projectId == "undefined"){ projectId = null; }
	if(typeof alwaysMe != 'boolean'){ alwaysMe = false; }
	var contactList = {};
	var user;
	if(typeof contacts == 'object'){
		for(var userid in contacts){
			user = Lincko.storage.get("users", userid);
			if(user){
				contactList[user['_id']] = {
					'username': user['-username'],
					'id': user['_id'],
					'checked': contacts[userid].checked,
					'profile_pic': user['profile_pic'],
				}
			}
		}
	}
	else{
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
			'checked': alwaysMe,
			'profile_pic': user['profile_pic'],
		}
	}


	return contactList;
};


Submenu_select.contacts = function(subm) {
	subm.Add_ContactContents(false);
};

Submenu_select.contacts_live = function(subm) {
	subm.Add_ContactContents(true);
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

Submenu.prototype.Add_ContactContents = function(live) {
	if(typeof live != 'boolean'){ live=false; }
	var attribute = this.attribute;
	var submenu_wrapper = this.Wrapper();
	var that = this;
	var profile_pic;
	var thumbnail;
	var position = $("[find='submenu_wrapper_content']", submenu_wrapper);
	position.addClass('overthrow');

	if(this.param.type=='chats' && this.param.id > 0){
		var perm_chats = Lincko.storage.get(this.param.type, this.param.id, "_perm");
		var perm_parent = Lincko.storage.getParent(this.param.type, this.param.id, "_perm");
		if(perm_chats && perm_parent){
			this.param.contactsID = {};
			for(var uid in perm_parent){
				this.param.contactsID[uid] = { checked: false };
				if(uid == wrapper_localstorage.uid || perm_chats[uid]){
					this.param.contactsID[uid] = { checked: true };
				}
			}
		}
	}
	var contacts = submenu_contacts_gen_chatcontacts(this.param.proid, this.param.alwaysMe, this.param.contactsID);
	
	var Elem;

	for(var uid in contacts) {
		Elem = $('#-submenu_app_contacts').clone();
		Elem.prop('id', this.id+'_contact_'+uid);
		Elem.find('.username').html(wrapper_to_html(contacts[uid].username));

		thumbnail = Lincko.storage.getLinkThumbnail(contacts[uid].profile_pic);
		if(thumbnail){
			Elem.find("[find=picture_src]").css('background-image','url("'+thumbnail+'")');
		} else {
			Elem.find("[find=picture_src]").css('background-image','url("'+app_application_icon_single_user.src+'")');
		}
		Elem.find('.id').val(uid);
		submenu_contacts_update.chats_contacts_list_ori[uid] = false;
		if (contacts[uid].checked == true || (that.param && that.param.alwaysMe && uid == wrapper_localstorage.uid) ) {
			Elem.find('.check').addClass('checked');
			submenu_contacts_update.chats_contacts_list_ori[uid] = true;
		}
		Elem.click(position, function(event) {
			var position = event.data;
			if($(this).find('.checked').length == 0 || (that.param && that.param.alwaysMe && $(this).find('.id').val() == wrapper_localstorage.uid) ) {
				$(this).find('.check').addClass('checked');
				if(live){
					var uid = parseInt($(this).find('.id').val(), 10);
					submenu_contacts_update.chats_contacts_list_update(that, uid, true);
				}
			} else {
				$(this).find('.checked').removeClass('checked');
				if(live){
					var uid = parseInt($(this).find('.id').val(), 10);
					submenu_contacts_update.chats_contacts_list_update(that, uid, false);
				}
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

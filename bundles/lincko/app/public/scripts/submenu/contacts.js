submenu_list['contacts'] = {
    //Set the title of the top
    "_title": {
        "style": "customized_title",
        //"title": function(elem){
        //    return elem.param.title;
        //}, //chat room you are in
        "title": "Start New Chat",
        "left": [{
            "style": "button",
            "title": "Close",
            'hide': true,
        }],
        "right": [{
            "style": "button",
            "title": "Select",
            //"class": "icon-Small-Persona",
            "action": function() {
                var userList = {};
                var nameList = "";
                var items = $(this).parents(".submenu_wrapper").find(".submenu_contact_item .checked");
                if (items.length == 1) {
                    return;
                }
                for (var i=0;i<items.length; i++) {
                    userList[$(items[i]).parent().find(".id").val()] = true;
                    nameList = nameList + " " + $(items[i]).parent().find(".username").html();
                }
                var tmp = $(this).parents('.submenu_newchat_header').attr('class').split(" ");
                for (var t in tmp) {
                    if (tmp[t].startsWith("project")) {
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
                            submenu_Build("newchat", false, false, {
                                type: 'chats',
                                id: chat['_id'],
                                title: chat['+title']}, true);
                        },
                        null,
                        function(jqXHR, settings, temp_id) {
                            comment_id = temp_id;
                        }
                    );
                }
                else {
                    wrapper_sendAction({
                            'parent_type': null,
                            "parent_id": null,
                            "title": nameList,
                            "users>access": userList,
                        },
                        'post',
                        'chat/create',
                        function() {
                            var chat = Lincko.storage.list('chats', 1, {'temp_id': comment_id})[0];
                            submenu_Build("newchat", false, false, {
                                type: 'chats',
                                id: chat['_id'],
                                title: chat['+title']}, true);
                        },
                        null,
                        function(jqXHR, settings, temp_id) {
                            comment_id = temp_id;
                        }
                    );
                }

            },
        }],
        "class": function(elem) {
            if (elem.param.id) {
                return "project" + elem.param.id + " submenu_newchat_header";
            }

        }
    },
    'contacts': {
        "style": "contacts",
        "title": "contacts",
    }
};

function _app_submenu_contacts_getContactList(projectId) {
    // TOTO: this part need to be change
    var logoList = ['envira', 'anchor','balance-scale', 'bomb', 'cubes', 'gavel', 'hand-spock-o', 'heartbeat', 'soccer-ball-o','heart'];
    if (projectId) {
        var contactsID = Object.keys(Lincko.storage.data.projects[projectId]._perm);
    }
    else {
        var contactsID = Object.keys(Lincko.storage.data.users);
    }
    var contactList = [];
    for (var c in contactsID) {
        var id = contactsID[c];
        contactList.push({
            'username': Lincko.storage.data.users[id]['-username'],
            'id': id,
            'logo': logoList[parseInt(id, 10)%10],
        });
    }
    return contactList;
}

function _app_submenu_contacts_genContacts(position) {
    var projectId = app_content_menu.projects_id;
	var contacts = _app_submenu_contacts_getContactList(projectId);
	for(c in contacts) {
		var Elem = $('#-submenu_app_contacts').clone();
		Elem.prop('id', 'contact'+c);
		Elem.find('.username').text(contacts[c].username);
		Elem.find('.contact_icon').addClass('fa').addClass( "fa-"+contacts[c].logo);
        Elem.find('.id').val(contacts[c].id);
        Elem.click(function() {
            if ($(this).find('.checked').length != 0) {
                $(this).find('.checked').removeClass('checked');
                return -1;
            }
            $(this).find('.check').addClass('checked');
            return -1;
        });
        if (contacts[c].id == wrapper_localstorage.uid) {
            Elem.hide();
            Elem.find('.check').addClass('checked');
        }
		position.append(Elem);
	}
}

Submenu_select.contacts = function(Elem) {
	Elem.Add_ContactContents();
}

Submenu.prototype.Add_ContactContents = function() {
    var attribute = this.attribute;
    submenu_wrapper = this.Wrapper();
    var position = $("[find='submenu_wrapper_content']", submenu_wrapper);
    //position.addClass('overthrow').addClass("submenu_chat_contents");
    position.addClass('overthrow');
    position.empty();
    //var Elem = $("[find=submenu_wrapper_title]", '#-submenu_app_chat_chatmenu').clone();
    _app_submenu_contacts_genContacts(position);
}

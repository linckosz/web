submenu_list['contacts'] = {
    //Set the title of the top
    "_title": {
        "style": "customized_title",
        "title": "Start New Chat", //toto
        "class": function(elem) {
            if (elem.param.id) {
                return "project" + elem.param.id + " submenu_newchat_header";
            }
        },
    },
    "left_button": {
        "style": "title_left_button",
        "title": Lincko.Translation.get('app', 25, 'html'), //Close
        'hide': true,
        "class": "base_pointer",
    },
    "right_button": {
        "style": "title_right_button",
        "title": "Select",
        "class": "base_pointer",
        "action": function(elem, submenu, param) {
            var userList = {};
            var nameList = "";

            var IDList = _submenu_get_contacts(elem);
            IDList.push(wrapper_localstorage.uid);
            if (IDList.length == 1) {
                return;
            }
            for (var i=0;i<IDList.length; i++) {
                userList[IDList[i]] = true;
                nameList = nameList + " " + Lincko.storage.data.users[IDList[i]]['-username'];
            }
            var tmp = $(elem).parents('.submenu_newchat_header').attr('class').split(" ");
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
                });
            }
        },
    },
    'contacts': {
        "style": "contacts",
        "title": "contacts",
    }
};

/*This is for outside usage to generate contacts list for chat*/
function _app_contacts_gen_chatcontacts(type, id) {
    var projectId = app_content_menu.projects_id;
    if (projectId) {
        var contactsID = Object.keys(Lincko.storage.data.projects[projectId]._perm);
    }
    else {
        var contactsID = Object.keys(Lincko.storage.data.users);
    }
    var self_index = contactsID.indexOf(wrapper_localstorage.uid.toString());
    if (self_index > -1) {
        contactsID.splice(self_index, 1);
    }
    var tmp = {};
    for (var c in contactsID) {
        tmp[contactsID[c]] = {'checked': false};
    }
    return tmp;
}

Submenu.prototype._prepare_contactsList = function() {
	var logoList = ['envira', 'anchor','balance-scale', 'bomb', 'cubes', 'gavel', 'hand-spock-o', 'heartbeat', 'soccer-ball-o','heart'];

    var contactList = [];
    for (var c in this.param.contactsID) {
        contactList.push({
            'username': Lincko.storage.data.users[c]['-username'],
            'id': c,
            'checked': this.param.contactsID[c].checked,
            'logo': logoList[parseInt(c, 10)%10],
        });
    }
    return contactList;
}


Submenu_select.contacts = function(Elem) {
	Elem.Add_ContactContents();
}

/*This "getContacts" method needs to be used in submit acction*/
function _submenu_get_contacts(elem) {
    var items = $(elem).parents(".submenu_wrapper").find(".submenu_contact_item .checked").parent().find("input.id");
    var keys = [];
    for (var i = 0; i < items.length; i++) {
        keys.push($(items[i]).val());
    }
    return keys;

}

Submenu.prototype._displayContacts = function(position, contacts) {
    var submenuInst = this;
    this.Wrapper().find(".submenu_top_side_right").hide();
    for(c in contacts) {
        var Elem = $('#-submenu_app_contacts').clone();
        Elem.prop('id', 'contact'+c);
        Elem.find('.username').text(contacts[c].username);
        Elem.find('.contact_icon').addClass('fa').addClass( "fa-"+contacts[c].logo);
        Elem.find('.id').val(contacts[c].id);
        if (contacts[c].checked == true) {
            Elem.find('.check').addClass('checked');
        }
        Elem.click(function() {
            if ($(this).find('.checked').length != 0) {
                $(this).find('.checked').removeClass('checked');
                if ($(this).parents(".submenu_wrapper").find(".checked").length > 0)
                {
                    $(this).parents(".submenu_wrapper").find(".submenu_top_side_right").show();
                }
                else {
                    $(this).parents(".submenu_wrapper").find(".submenu_top_side_right").hide();
                }
                return -1;
            }
            $(this).find('.check').addClass('checked');
            if ('type' in submenuInst.param && submenuInst.param.type == "tasks") {
                $(this).siblings().find(".check").removeClass("checked");
            }
            if ($(this).parents(".submenu_wrapper").find(".checked").length > 0)
            {
                $(this).parents(".submenu_wrapper").find(".submenu_top_side_right").show();
            }
            else {
                $(this).parents(".submenu_wrapper").find(".submenu_top_side_right").hide();
            }
            return -1;
        });
        position.append(Elem);
    }
}

Submenu.prototype.Add_ContactContents = function() {
    var attribute = this.attribute;
    submenu_wrapper = this.Wrapper();
    var position = $("[find='submenu_wrapper_content']", submenu_wrapper);
    //position.addClass('overthrow').addClass("submenu_chat_contents");
    position.addClass('overthrow');
    position.empty();
    //var Elem = $("[find=submenu_wrapper_title]", '#-submenu_app_chat_chatmenu').clone();
    //_app_submenu_contacts_genContacts(position);
    this._displayContacts(position, this._prepare_contactsList());
}

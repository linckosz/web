submenu_list['mainchat'] = {
    //Set the title of the top
    "_title": {
        "style": "title",
        "title": "All Chats", //Chat room
        "class": "submenu_newchat_header",
    },
    //It will create a form with a validation button
    "chat_content": {
        "style": "chat_content",
        "title": "",
    },
};

Submenu_select.chat_content = function(Elem) {
    Elem.Add_ChatContent();
};

Submenu.prototype.Add_ChatContent = function() {
    submenu_wrapper = this.Wrapper();
    var position = $("[find='submenu_wrapper_content']", submenu_wrapper);
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
    /*
    for (var item in chatList) {
        var elem = mainMenu.feed(position, chatList[item]);

        elem.on("click", chatList[item], function(event) {
                var title;
                if (event.data.type == 'chats') {
                    title = $(this).find('header').text();
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
                var tmp = $(this).attr("id").split("_");
                var id = tmp[tmp.length-1];
                var title = Lincko.storage.get('chats', id, '+title');
            }
            else {
                var id = app_content_menu.projects_id;
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

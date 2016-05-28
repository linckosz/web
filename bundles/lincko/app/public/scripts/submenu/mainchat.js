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
    //Free memory
    delete submenu_wrapper;
    return true;
};

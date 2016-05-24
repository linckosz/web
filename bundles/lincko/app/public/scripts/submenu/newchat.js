console.log("submenu newchat");
submenu_list['newchat'] = {
    //Set the title of the top
    "_title": {
        "style": "customized_title",
        "title": function(elem){
            return elem.param.title;
        }, //chat room you are in
        "class": "submenu_newchat_header",
    },
    "chat_contents": {
    	"style": "chat_contents",
        "title": "",
    },
    "chat_menu": {
        "style": "chat_menu",
        "title": "",
    },
    "left_button": {
        "style": "title_left_button",
        "title": Lincko.Translation.get('app', 25, 'html'), //Close
        'hide': true,
        "class": "base_pointer submenu_newchat_header_close",
    },
    "right_button": {
        "style": "title_right_button",
        "title": "",
        "class": "icon-Small-Persona base_pointer",
    },
};

Submenu_select.chat_contents = function(Elem) {
	Elem.Add_ChatContents();
}
Submenu_select.chat_menu = function(Elem) {
    Elem.Add_ChatMenu();
};

Submenu.prototype.Add_ChatContents = function() {
    var attribute = this.attribute;
    var id = this.param.id;
    var type = this.param.type;
    submenu_wrapper = this.Wrapper();
    var position = $("[find='submenu_wrapper_content']", submenu_wrapper);
    position.addClass('overthrow').addClass("submenu_chat_contents");
    chatFeed.feedHistory(position, type, id);
    var height = submenu_wrapper.height() - 48 - 48;
    position.find(".iScrollVerticalScrollbar").height(height);
    //debugger;
    var chatScroll = myIScrollList[submenu_wrapper.find("[find=submenu_wrapper_content]").attr("id")];
    //debugger;
    chatScroll.scrollTo(0, 0-height, 100);
    chatScroll.on('scrollEnd', function() {
    //chatFeed.feedPaging(type, position, id);
    });
}

Submenu.prototype.Add_ChatMenu = function() {
    var attribute = this.attribute;
    submenu_wrapper = this.Wrapper();
    var Elem = $('#-submenu_app_chat_bottom').clone();
    var that = this;
    Elem.prop("id", '');
    submenu_wrapper.find("[find=submenu_wrapper_bottom]").addClass('submenu_bottom');
    submenu_wrapper.find("[find=submenu_wrapper_content]").css('bottom', submenu_wrapper.find("[find=submenu_wrapper_bottom]").height());
    if ("class" in attribute) {
        Elem.addClass(attribute['class']);
    }
    submenu_wrapper.find("[find=submenu_wrapper_bottom]").append(Elem);
    //Elem.find("[find=select_chats]").click();
    Elem.find("input").focus(function() {
        Elem.find(".send").show();
        Elem.find(".attachment").hide();
    });
    Elem.find("input").blur(function() {
        if (!Elem.find('.comments_input').val()) {
            Elem.find(".send").hide();
            Elem.find(".attachment").show();
        }
    });
    $('.comments_input', submenu_wrapper).keypress(function(e) {
        if(e.which == 13) {
            var content = Elem.find('.comments_input').val();
            var type = that.param.type == 'history' ? "projects":'chats';
            wrapper_sendAction({
                'comment': content,
                'parent_type': type,
                'parent_id': that.param.id,
            },
            'post',
            'comment/create',
            function() {
                Elem.find('.comments_input').val('');
            }
            );
        }
    });
    $('.send', submenu_wrapper).on("click", function() {
        var content = Elem.find('.comments_input').val();
        var type = that.param.type == 'history' ? "projects":'chats';
        wrapper_sendAction({
                'comment': content,
                'parent_type': type,
                'parent_id': that.param.id,
            },
            'post',
            'comment/create',
            function() {
                Elem.find('.comments_input').val('');
            }
        ); //TODO: fix the error handling logic
    });
    if (that.param.type == 'history') {
            debugger;
            app_application_lincko.add("chat_contents_wrapper","projects_" + that.param.id, function() {
                debugger;
                var id = Object.keys(this.range)[0].split("_")[1];
                var type = Object.keys(this.range)[0].split("_")[0];
                //Lincko.storage.list("chats", null, {"new": true}, 'chats', id, false);
                var position = $("[find='submenu_wrapper_content']", submenu_wrapper);
                debugger;
                chatFeed.feedHistory(position, "history", id);
            });
    }
    else {
        app_application_lincko.add("chat_contents_wrapper", "chats_" + that.param.id, function() {
            var id = Object.keys(this.range)[0].split("_")[1];
            var type = Object.keys(this.range)[0].split("_")[0];
            var position = $("[find='submenu_wrapper_content']", submenu_wrapper);
            chatFeed.feedHistory(position, type, id);
        });
    }

    //Free memory
    delete submenu_wrapper;
    return true;
};

/*
JSfiles.finish(function() {
    app_application_lincko.add(function() {


        for (var menu in submenu_list['newchat']) {
            if (menu != "_title" && menu != "chat_menu") {
                delete submenu_list['newchat'][menu];
            }
        }

        var chats = Lincko.storage.list('chats');

        for (var i in chats) {
            if (chats[i].url) {
                submenu_list['newchat'][chats[i].url] = {
                    "style": "button",
                    "title": chats[i]['+title'],
                    "action_param": { chat_id: chats[i].url, },
                    "action": function(event) {
                        console.log(event.data.chat_id);
                    },
                };
            }
        }

    }, 'chats');
});
*/

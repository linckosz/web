submenu_list['newchat'] = {
    //Set the title of the top
    "_title": {
        "style": "customized_title",
        "title": function(elem){
            return elem.param.title;
        }, //chat room you are in
        "left": [{
            "style": "button",
            "title": "Close",
            //"action": function() {
            //    console.log('close');
            //}
            'hide': true,
        }],
        "right": [{
            "style": "button",
            "title": "",
            "class": "icon-Small-Persona",
        }],
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
};

Submenu_select.chat_contents = function(Elem) {
	Elem.Add_ChatContents();
}
Submenu_select.chat_menu = function(Elem) {
    Elem.Add_ChatMenu();
};

Submenu.prototype.Add_ChatContents = function() {
    var attribute = this.attribute;
    submenu_wrapper = this.Wrapper();
    var position = $("[find='submenu_wrapper_content']", submenu_wrapper);
    position.addClass('overthrow').addClass("submenu_chat_contents");
    position.empty();
    chatFeed.feedHistory(position, this.param.type,this.param.id);
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
    $('.send', submenu_wrapper).on("click", function() {
        //var content = submenu_wrapper.find('comments_input').val();//TODO: check why this submenu_wrapper is not apperaed in context
        var content = Elem.find('.comments_input').val();
        var id = 1;
        wrapper_sendAction({
                'comment_comment_textarea': content,
                'comment_type_text_hidden': 'chats',
                'comment_type_id_hidden': id, //TODO: fix this hard code
            },
            'post',
            'comment/create',
            function() {
                Elem.find('.comments_input').val('');
            }
        ); //TODO: fix the error handling logic
    });
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

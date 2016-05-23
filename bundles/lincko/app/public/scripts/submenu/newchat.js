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
    Elem.find(".comments_input").blur(function() {
        if (!Elem.find('.comments_input').val()) {
            Elem.find(".send").hide();
            Elem.find(".attachment").show();
        }
    });
    Elem.find(".comments_input").focus(function() {
        Elem.find(".send").show();
        Elem.find(".attachment").hide();
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
    $('.attachment', submenu_wrapper).on("click", function() {
        var position = $(this).parents(".submenu_wrapper");
        app_upload_open_files('chats', that.param.id, false, true);

        app_application_lincko.add(position.attr("id"), 'upload', function(){ //We cannot simplify because Elem is not the HTML object, it's a JS Submenu object
            var files = app_upload_files.lincko_files;
            for(var i in files)
            {
                //FIXME: Only filters files inside this chats.
                if (!files[i].presented) {
                    item = {
                        'name': files[i].lincko_name,
                        '_type': 'uploading_file',
                        'id': 'md5(Math.random())',
                        'timestamp': $.now()/1000,
                        'created_by': wrapper_localstorage.uid,
                        'index': i,
                    };
                    app_application_lincko.add("uploading_file_"+i, 'upload', function() {
                        //change each item status
                        var tmp = this.id.split("_");
                        var index = tmp[tmp.length-1];
                        var file = app_upload_files.lincko_files[index];
                        var downloaded = file.lincko_progress * file.lincko_size/100;
                        $("#"+this.id).find("[find=progress_bar]").width(file.lincko_progress+"%"); 
                        $("#"+this.id).find("[find=progress_text]").html(downloaded+"/"+file.lincko_size);
                        $("#"+this.id).find(".uploading_action").html(Lincko.Translation.get('app', 7, 'js'));
                    });
                    chatFeed.appendItem("chats", [item], position, true);
                    files[i].presented = true;
                }
            }
        });

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
                app_application_lincko.update("chat_contents_wrapper", type+"_" + that.param.id);
            }
        ); //TODO: fix the error handling logic
    });
    if (that.param.type == 'history') {
            app_application_lincko.add("chat_contents_wrapper","projects_" + that.param.id, function() {
                var id = Object.keys(this.range)[0].split("_")[1];
                var type = Object.keys(this.range)[0].split("_")[0];
                //Lincko.storage.list("chats", null, {"new": true}, 'chats', id, false);
                var position = $("[find='submenu_wrapper_content']", submenu_wrapper);
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

/* Category 31 */
console.log("history loaded");
var chatFeed = (function() {
    var SHORTCUT_HANDLERS = {
        'files': function(id, elem) {
            var file = Lincko.storage.get('files', id);
            var name = Lincko.storage.get('files', id, "+name");
            var url = Lincko.storage.getLink(id);
            var thumbnail = Lincko.storage.getLinkThumbnail(id);
            var extension = checkExtension(id);
            if (extension) {
                if (extension == "pic") {
                    var popout = $('#-pic_preview_full_screen').clone();
                    popout.attr('id', 'pic_preview_full_screen');
                    popout.find('img').attr('src', url);
                    popout.find('.pic_preview_name').html(name);
                    popout.find('img').attr('src', url);
                    popout.find('.pic_preview_icon').attr("href", url);
                    $("body").append(popout);
                    $('.close', '#pic_preview_full_screen').click(function() {
                        $('#pic_preview_full_screen').remove();
                    });
            
                    return false;
                }
                else if(extension == "video") {
                    var popout = $('#-player_preview_full_screen').clone();
                    popout.attr('id', 'player_preview_full_screen');
                    $("body").append(popout);
                    $("#player_preview_full_screen .player_preview_wrapper").attr('id', 'player_preview_container');
                    $("#player_preview_container").setupPlayer(url, thumbnail);
                    $('.close', '#player_preview_full_screen').click(function() {
                        $('#player_preview_full_screen').remove();
                    });
                    return false;
                }
            }
            else {
                return true;
            }
        },
        'uploading_file': function(id, elem) {
            //var file = $("#uploading_file_" + id);
            var file = app_upload_files.lincko_files[id];
            file.abort();
            file.lincko_status = 'abort';
            $(elem).parents(".models_history_wrapper").removeClass("uploading_file").addClass("upload_stopped_file").attr("category", "upload_stopped_file");
            return false;
        },
        'upload_stopped_file': function(id, elem) {
            var file = app_upload_files.lincko_files[id];
            file.submit();
            file.lincko_status = 'uploading';
            $(elem).parents(".models_history_wrapper").removeClass("upload_stopped_file").addClass("uploading_file").attr("category", "uploading_file");
            return false;
        },
    };
    var RESOURCE_ID = {
        'tasks': function(raw_id) {
            return raw_id.split('models_thistory_')[1];
        },
        'files': function(raw_id) {
            return raw_id.split('models_thistory_')[1];
        },
        'uploading_file': function(raw_id) {
            return raw_id.split("uploading_file_")[1];
        },
        'upload_stopped_file': function(raw_id) {
            return raw_id.split("uploading_file_")[1];
        },
        'comments': function(raw_id) {
            return raw_id.split('models_thistory_')[1];
        },
        'notes': function(raw_id) {
            return raw_id.split('models_thistory_')[1];
        },
    };
    var RESOURCE_HANDLERS = {
        'tasks': function(taskid, elem) {
            var tmp = $(elem).parents(".submenu_wrapper").attr("id").split("_");
            var preview = JSON.parse(tmp[tmp.length-1]);
            submenu_Build('taskdetail', true, null, {'type': 'tasks', 'id': taskid}, preview);
            return false;
        },
        'files': function(fileid, elem) {
            var tmp = $(elem).parents(".submenu_wrapper").attr("id").split("_");
            var preview = JSON.parse(tmp[tmp.length-1]);
            submenu_Build('taskdetail', true, null, {'type':'files', 'id':fileid}, preview);
            return false;
        },
        'uploading_file': function(id, elem) {
            if (event.target.className == "uploading_action") {
                var file = app_upload_files.lincko_files[id];
                file.lincko_status = 'abort';
                file.abort();
                $(elem).parents(".models_history_wrapper").remove();
            }
            return false;
        },
        'upload_stopped_file': function(id, elem) {
            if (event.target.className == "uploading_action") {
                var file = app_upload_files.lincko_files[id];
                file.lincko_status = 'abort';
                file.abort();
                $(elem).parents(".models_history_wrapper").remove();
            }
            return false;
        },
        'comments': function(commentid, elem) {
            var type = $(elem).find("[find=target_type]").attr('parent');
            var p_id = $(elem).find("[find=target_type]").attr('parent_id');
            RESOURCE_HANDLERS[type](p_id, elem);
            return false;
        },
        'notes': function(noteid, elem) {
            submenu_Build('taskdetail', true, null,  {'type': 'notes', 'id': noteid}, true);
            return false;
        }
    };

    function BaseHistoryCls(item) {
        this.item = item;
    }


    function checkRecentDate(timestamp, index) {
        var old;
        if (index == 0) {
            checkRecentDate.recentDatestamp = Math.floor(timestamp / 86400) * 86400;
        }
        if (timestamp < checkRecentDate.recentDatestamp) {
            old = checkRecentDate.recentDatestamp;
            checkRecentDate.recentDatestamp = Math.floor(timestamp / 86400) * 86400;
            return old;
        }
        return false;
    }


    function renderLine(timestamp) {
        var lineTemplate = "-models_history_line";
        var line = $('#' + lineTemplate).clone();
        line.removeAttr('id');
        line.addClass("models_history_line");
        var today = Math.floor((new Date()).getTime() / 86400000);
        if (timestamp == today * 86400) {
            date = Lincko.Translation.get('app', 3302, 'html').toUpperCase(); //Today
        }
        else if (timestamp == (today - 1) * 86400) {
            date = Lincko.Translation.get('app', 3304, 'html').toUpperCase(); //Yesterday
        }
        else{
            date = (new wrapper_date(timestamp).display('date_very_short'));
        }
        line.find('span').html(date);
        return line;
    }

    function checkExtension(id) {
        var PIC_EXTENSION = ['bmp', 'gif', 'png', 'apng', 'jpg', 'jpeg', 'svg', 'svgz', 'tif', 'tiff'];
        var VIDEO_EXTENSION = ['mp4', 'mkv', 'mov', 'xvid', 'x264', 'wmv', 'avi'];

        var file_name = Lincko.storage.get('files', id, "+name");
        var tmp = file_name.split(".");
        var extension = tmp[tmp.length - 1].toLowerCase();
        if ($.inArray(extension, PIC_EXTENSION)>-1) {
            return 'pic';
        } else if ($.inArray(extension, VIDEO_EXTENSION)>-1) {
            return 'video';
        } else {
            return null;
        }
    }

    BaseHistoryCls.prototype.renderChatTemplate = function(index) {
        var target;
        var action;
        var progress;
        var Elem = $("#" + this.templateType).clone();
        if (this.item._type == "uploading_file") {
            Elem.prop('id', "uploading_file_"+this.item.index);
        } else {
            Elem.prop('id', 'models_thistory_' + this.item._id);
        }
        Elem.addClass(this.decoratorClass);
        Elem.addClass(this.item._type);
        Elem.attr('index', index);

        var uname = Lincko.storage.get('users', this.item.created_by)['-username'];
        Elem.find("[find=author]").text(php_nl2br(uname));
        Elem.find("[find=content]").html(php_nl2br(this.item['+comment']));
        var date = new wrapper_date(this.item.timestamp);
        Elem.find(".time", "[find=timestamp]").html(date.display('time_short'));
        Elem.find(".date", "[find=timestamp]").html(date.display('date_short'));
        Elem.find("[find=target]").html(this.item.name);

        Elem.find("[find=progress_bar]").width("0%"); 
        Elem.find("[find=progress_text]").html("0/0");
        Elem.find(".uploading_action").html(Lincko.Translation.get('app', 7, 'js'));

        Elem.attr('category', this.item._type);
        return Elem;
    };

    BaseHistoryCls.prototype.renderHistoryTemplate = function(index) {
        var target;
        var action;
        var thumbnail;
        var Elem = $("#" + this.templateType).clone();
        Elem.prop('id', 'models_thistory_' + this.item.id);
        Elem.attr('index', index);
        Elem.addClass(this.decoratorClass);
        Elem.addClass(this.item.type);
        var history = Lincko.storage.getHistoryInfo(this.item);
        // We don't need to use wrapper_to_html for 'history' because the text is already protected in history format method

        if (!action) {
            action = php_nl2br(Lincko.storage.formatHistoryInfo(
                history.root.title, { 'par': { 'un': ' ', 'nt': history.root.history.par.nt } }) + ":");
        }

        Elem.find("[find=author]").text(php_nl2br(this.item.par.un));
        //Elem.find("[find=icon]").attr('src', l''); //TODO: change this logo to each others logo
        Elem.find("[find=action]").html($.trim(action).ucfirst());

        if (this.item.type === "comments") {
            var root = Lincko.storage.getCommentRoot(this.item.id);
            target = root['+title'];
            var target_type = root['_type'];
            if (root._type == 'chats')
                return null;
        } else {
            if (this.item.type != 'files') {
                target = Lincko.storage.get(this.item.type, this.item.id, "+title");
            }
            else{
                target = Lincko.storage.get(this.item.type, this.item.id, "+name");
                thumbnail = Lincko.storage.getLinkThumbnail(this.item.id);
            }
        }
        if (root) {
            Elem.find("[find=target_type]").attr('parent', target_type)
                .attr("parent_id", root['_id'])
                .html(php_nl2br(Lincko.storage.data._history_title[target_type][0]));
        }
        Elem.find("[find=target]").html(php_nl2br(target));
        Elem.find("[find=content]").html(php_nl2br(history.content));
        var date = new wrapper_date(this.item.timestamp);
        Elem.find(".time", "[find=timestamp]").html(date.display('time_short'));
        Elem.find(".date", "[find=timestamp]").html(date.display('date_short'));
        Elem.find("[find=shortcut]").attr('src', thumbnail);

        Elem.attr('category', this.item.type);
        return Elem;
    };


    BaseHistoryCls.prototype.getTemplate = function(type) {
        if (type=='history') {
            this.decoratorClass = wrapper_localstorage.uid === parseInt(this.item.by, 10) ? "models_history_self" : "models_history_others";
            if (this.item.type === "comments") {
                var parent = Lincko.storage.getParent('comments', this.item.id);
                if (parent._type === 'projects') {
                    this.templateType = '-models_history_comment_short';
                } else {
                    this.templateType = '-models_history_comment_long';
                }
                return;
            }
            this.templateType = "-models_history_" + this.item.type;
        }
        else {
            this.decoratorClass = wrapper_localstorage.uid === parseInt(this.item.created_by, 10) ? "models_history_self" : "models_history_others";
            switch(this.item._type) {
                case "comments":
                    this.templateType = "-models_history_comment_short";
                    break;
                case "uploading_files":
                    this.templateType = "-models_history_uploading_files";
                    break;
                default:
                    this.templateType = "-models_history_" + this.item._type;
            }
        }
    };


    function app_layers_history_launchPage(position, type, projectId) {
            position.addClass('overthrow').addClass("submenu_chat_contents");
            position.empty();
            app_layers_history_feedPage(position, type, projectId);
            wrapper_IScroll();
    }

    function getRawContents(type, id, range) {
        if (type == 'history') {
            return Lincko.storage.hist(null, range, null, 'projects', id, true);
        }
        else {
            return Lincko.storage.list('comments', range, null, 'chats', id, false);
        }
    }

    function getHistoryPaging(type, position, parentId) {
        var firstIndex = parseInt(position.find('.models_history_wrapper').first().attr('index'),10) +1;
        var lastIndex = firstIndex + 20;
        var newRange = firstIndex + "-" + lastIndex;

        var items = getRawContents(type, parentId, newRange);
        v$('<div>').addClass('chat_contents_wrapper').attr('id', 'chat_contents_wrapper').appendTo(position);
        format_items(type, items, position);
    }

    function app_layers_history_feedPage(position, type, parentId) {
        var items = getRawContents(type, parentId, null);
        $('<div>').addClass('chat_contents_wrapper').attr('id', 'chat_contents_wrapper').appendTo(position);
        format_items(type, items, position);
    }

    function format_items(type, items, position, after) {
       // var items = getRawContents(type, parentId, "0-50");
        /* Structure of item:
            att: "created_at"
            by: "12"
            id: "130"
            par: Object
            timestamp: "1458629345"
            type: "tasks"
        */
        
        for (var i in items) {
            var item = new BaseHistoryCls(items[i]);
            if (item) {
                item.getTemplate(type);
                if (type =='history')
                    var Elem = item.renderHistoryTemplate(i);
                else
                    var Elem = item.renderChatTemplate(i);
                if (Elem) {
                    if (after) {
                        Elem.appendTo(position.find(".chat_contents_wrapper"));    
                    }
                    else {
                        Elem.prependTo(position.find(".chat_contents_wrapper"));              
                    }
                }

                var dateStamp = checkRecentDate(item.item.timestamp, i);
                if (dateStamp) {
                    var line = renderLine(dateStamp);
                    if (Elem)
                        Elem.after(line);
                }
            }
        }

        $(position).delegate('.models_history_standard_shortcut', 'click', function() {
            var parent = $(this).parents('.models_history_wrapper');
            var category = parent.attr('category');
            var id = RESOURCE_ID[category](parent.attr('id'));
            var that = this;
            SHORTCUT_HANDLERS[category](id, that);

            return false;
        });

        $(position).delegate('.models_history_content_wrapper', 'click', function() {
            var parent = $(this).parents('.models_history_wrapper');
            var category = parent.attr('category');
            var id = RESOURCE_ID[category](parent.attr('id'));

            var that = this;
            RESOURCE_HANDLERS[category](id, that);
            return false;
        });
    }

    return {
        'feedHistory': app_layers_history_launchPage,
        'feedPaging': getHistoryPaging,
        'appendItem': format_items,
    }
})();

/* Category 31 */
var chatFeed = (function() {
    //  toto: fixme, these fake links need to be removed for production
    var fakeMedias = {
            '64':{'thumbnail': 'http://cdn.duitang.com/uploads/item/201311/08/20131108161501_BMkku.thumb.700_0.jpeg',
                  'url': 'http://cdn.duitang.com/uploads/item/201311/08/20131108161501_BMkku.thumb.700_0.jpeg',
                  'target': 'dodolong_1.jpeg'},
            '124': {'thumbnail': 'http://img4.yytcdn.com/video/mv/150612/2308579/-M-8929f5ae099185010c48b930c829479b_240x135.jpg',
                  'url': 'http://download.wavetlan.com/SVV/Media/HTTP/H264/Talkinghead_Media/H264_test1_Talkinghead_mp4_480x360.mp4',
                  'target': 'dodolong_video.mp4'},
            '126': {'thumbnail': 'http://cdn.duitang.com/uploads/item/201311/12/20131112153049_JFvE4.thumb.700_0.jpeg',
                  'url': 'http://cdn.duitang.com/uploads/item/201311/12/20131112153049_JFvE4.thumb.700_0.jpeg',
                  'target': 'dodolong_1.jpeg'},
    };
    var SHORTCUT_HANDLERS = {
        'pic': function(event) {
            var popout = $('#-pic_preview_full_screen').clone();
            popout.attr('id', 'pic_preview_full_screen');
            popout.find('img').attr('src', event.url);
            var names = event.url.split('/');
            var basename = names[names.length-1];
            popout.find('.pic_preview_name').html(basename);
            popout.find('img').attr('src', event.url);
            popout.find('.pic_preview_icon').attr("href", event.url);
            $("body").append(popout);
            $('.close', '#pic_preview_full_screen').click(function() {
                $('#pic_preview_full_screen').remove();
            });
            
            return false;
        },
        'video': function(event) {
            var popout = $('#-player_preview_full_screen').clone();
            popout.attr('id', 'player_preview_full_screen');
            $("body").append(popout);
            $("#player_preview_full_screen .player_preview_wrapper").attr('id', 'player_preview_container');
            $("#player_preview_container").setupPlayer(event.url, event.thumbnail);
            $('.close', '#player_preview_full_screen').click(function() {
                $('#player_preview_full_screen').remove();
            });
            return false;
        }
    };
    var RESOURCE_HANDLERS = {
        'tasks': function(taskid, elem) {
            submenu_Build('taskdetail', null, null, {'type': 'tasks', 'id': taskid}, true);
            return false;
        },
        'files': function(fileid, elem) {
            //submenu_Build('filedetail', null, null, fileid, true);
            return false;
        },
        'comments': function(commentid, elem) {
            var type = $(elem).find("[find=target_type]").attr('parent');
            var p_id = $(elem).find("[find=target_type]").attr('parent_id');
            RESOURCE_HANDLERS[type](p_id, elem);
            return false;
        },
        'notes': function(noteid, elem) {
            submenu_Build('taskdetail', null, null,  {'type': 'notes', 'id': noteid}, true);
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

    function checkExtension(type, id) {
        var PIC_EXTENSION = ['bmp', 'gif', 'png', 'apng', 'jpg', 'jpeg', 'svg', 'svgz', 'tif', 'tiff'];
        var VIDEO_EXTENSION = ['mp4', 'mkv', 'mov', 'xvid', 'x264', 'wmv', 'avi'];
        if (type != 'files') {
            return null;
        }
        var file = Lincko.storage.get('files', id);
        if (!file) {
            file = getFakeFile(id);
        }
        var tmp = file.url.split(".");
        var extension = tmp[tmp.length - 1].toLowerCase();
        if ($.inArray(extension, PIC_EXTENSION)>-1) {
            return 'pic';
        } else if ($.inArray(extension, VIDEO_EXTENSION)>-1) {
            return 'video';
        } else {
            return null;
        }
    }

    BaseHistoryCls.prototype.renderChatTemplate = function() {
        var target;
        var action;
        var Elem = $("#" + this.templateType).clone();
        Elem.prop('id', 'models_thistory_' + this.item.id);
        Elem.addClass(this.decoratorClass);
        Elem.addClass(this.item.type);

        var uname = Lincko.storage.get('users', this.item.created_by)['-username'];
        Elem.find("[find=author]").text(php_nl2br(uname));
        Elem.find("[find=content]").html(php_nl2br(this.item['+comment']));
        var date = new wrapper_date(this.item.timestamp);
        Elem.find(".time", "[find=timestamp]").html(date.display('time_short'));
        Elem.find(".date", "[find=timestamp]").html(date.display('date_short'));

        Elem.attr('category', this.item._type);
        return Elem;
    };

    BaseHistoryCls.prototype.renderHistoryTemplate = function() {
        var target;
        var action;
        var Elem = $("#" + this.templateType).clone();
        Elem.prop('id', 'models_thistory_' + this.item.id);
        Elem.addClass(this.decoratorClass);
        Elem.addClass(this.item.type);
        var history = Lincko.storage.getHistoryInfo(this.item);
        if (history.title === null || history.title ==='') {
            //history.root.title
            //return null;
            action = php_nl2br("上传新的文件:");
        }
        // We don't need to use wrapper_to_html for 'history' because the text is already protected in history format method

        if (!action) {
            action = php_nl2br(Lincko.storage.formatHistoryInfo(
                history.root.title, { 'par': { 'un': ' ', 'nt': history.root.history.par.nt } }) + ":");
        }

        Elem.find("[find=author]").text(php_nl2br(this.item.par.un));
        //Elem.find("[find=icon]").attr('src', l''); //TODO: change this logo to each others logo
        Elem.find("[find=action]").html(action);

        if (this.item.type === "comments") {
            var root = Lincko.storage.getCommentRoot(this.item.id);
            target = root['+title'];
            var target_type = root['_type'];
            if (root._type == 'chats')
                return null;
        } else {
            target = Lincko.storage.get(this.item.type, this.item.id, "+title");
            if (!target) {
                target = getFakeTarget(this.item.id);
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
        Elem.find("[find=shortcut]").attr('src', this.item.thumbnail);

        Elem.attr('category', this.item.type);
        return Elem;
    };


    BaseHistoryCls.prototype.getTemplate = function(type) {
        if (type=='history')
            this.decoratorClass = wrapper_localstorage.uid === parseInt(this.item.by, 10) ? "models_history_self" : "models_history_others";
        else
            this.decoratorClass = wrapper_localstorage.uid === parseInt(this.item.created_by, 10) ? "models_history_self" : "models_history_others";

        if (this.item.type === "comments") {
            var parent = Lincko.storage.getParent('comments', this.item.id);
            if (parent.type === 'projects') {
                this.templateType = '-models_history_comment_short';
            } else {
                this.templateType = '-models_history_comment_long';
            }
            return;
        }
        if (type == 'history')
            this.templateType = "-models_history_" + this.item.type;
        else
            this.templateType = "-models_history_comment_short"; //TODO: fix this hard code
    };


    function app_layers_history_launchPage(position, type, projectId) {
        //var parentId = position.parent().attr('id');
        var update = function() {
                position.addClass('overthrow').addClass("submenu_chat_contents");
                position.empty();
                app_layers_history_feedPage(position, type, projectId);
                wrapper_IScroll();
        }
        update();
        if (type != 'history'){

            app_application_lincko.add("chats", update);
        }
        else {
            app_application_lincko.add("projects", update);
        }
    }

    function fake_history_generator_for_multimedia(item) {
        if (item.id in fakeMedias) {
            var newItem = $.extend(true, {}, item);
            newItem.type = "files";
            newItem.thumbnail = fakeMedias[item.id]['thumbnail'];
            newItem.par = {'ut':'文件', 'un': item.par.un};
            return newItem;
        }
        return false;
    }

    function getFakeFile(id) {
        return fakeMedias[id];
    }

    function getFakeTarget(id) {
        return fakeMedias[id]['target'];
    }

    function getRawContents(type, id) {
        if (type == 'history') {
            return Lincko.storage.hist(null, null, null, 'projects', id, true);
        }
        else {
            return Lincko.storage.list('comments', null, null, 'chats', id, false);
        }
    }

    function app_layers_history_feedPage(position, type, parentId) {
        var items = getRawContents(type, parentId);
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
            var newItem = fake_history_generator_for_multimedia(items[i]);
            if (item) {
                item.getTemplate(type);
                if (type =='history')
                    var Elem = item.renderHistoryTemplate();
                else
                    var Elem = item.renderChatTemplate();
                if (Elem)
                        Elem.prependTo(position);

                var dateStamp = checkRecentDate(item.item.timestamp, i);
                if (dateStamp) {
                    var line = renderLine(dateStamp);
                    if (Elem)
                        Elem.after(line);
                }
            }
            if (newItem) {
                item = new BaseHistoryCls(newItem);
                if (item) {
                    item.getTemplate(type);
                    if (type =='history')
                        Elem = item.renderHistoryTemplate();
                    else
                        Elem = item.renderChatTemplate();
                    Elem.prependTo(position);

                    dateStamp = checkRecentDate(item.item.timestamp, i);
                    if (dateStamp) {
                        line = renderLine(dateStamp);
                        Elem.after(line);
                    }
                }

            }
        }

        $(position).delegate('.models_history_standard_shortcut', 'click', function() {
            var parent = $(this).parents('.models_history_wrapper');
            var id = parent.attr('id').split('models_thistory_')[1];
            var category = parent.attr('category');
            var extension = checkExtension(category, id);
            if (extension) {
                //var file = Lincko.storage.get('files', id);
                var file = getFakeFile(id);
                SHORTCUT_HANDLERS[extension](file);
                return false;
            }
            return true;
        });

        $(position).delegate('.models_history_content_wrapper', 'click', function() {
            var parent = $(this).parents('.models_history_wrapper');
            var id = parent.attr('id').split('models_thistory_')[1];
            var category = parent.attr('category');
            var that = this;
            RESOURCE_HANDLERS[category](id, that);
            return false;
        });
    }

    return {
        'feedHistory': app_layers_history_launchPage,
    }
})();

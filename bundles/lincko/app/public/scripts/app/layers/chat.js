/* Category ? */

var chatlist_subConstruct = function(){
        var that = this;
        that.elem_newcardCircle.click( function() {
            submenu_Build("contacts", false, false,
                {id:app_content_menu.projects_id,
                'contactsID': _app_contacts_gen_chatcontacts(),
                }, true);
            return false;
        })
        .appendTo(that.list_wrapper);
}

function app_layers_chat_feedChat(parent, handler) {
    var app_layers_chatlist = new skylist(
        'chats',
        parent,
        null,
        chatlist_subConstruct
    );
    parent.delegate(".skylist_card", "click", handler);
    parent.delegate(".skylist_newcardCircle", "click", function() {
        submenu_Build("contacts", false, false, {
            'id': app_content_menu.projects_id,
            'contactsID': _app_contacts_gen_chatcontacts(),
        }, true);
        return false;
    });
}

function app_layers_chat_launchPage(param) {
    if (typeof param === 'undefined') { param = null; }
    app_layers_chat_feedPage();
}

var app_layers_chat_feedPage = function(param) {
    if (typeof param === 'undefined') { param = null; }
    var position = $('#app_layers_chat');
    position.addClass('overthrow');
    position.empty();
    app_layers_chat_feedChat(position,
        function() {
            if ($(this).attr('type') != 'history') {
                var tmp = $(this).attr("id").split("_");
                var id = tmp[tmp.length-1];
                var title = Lincko.storage.get('chats', id, '+title');
            }
            else {
                var id = app_content_menu.projects_id;
                var title = Lincko.storage.get("projects", id, "+title") + " Activity";
            }
            submenu_Build("newchat", false, false, {
                type: $(this).attr('type'),
                id: id,
                title: title }, true);
            return false;
        });
}

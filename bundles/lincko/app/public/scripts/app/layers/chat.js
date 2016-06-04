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
    app_application_lincko.add("skylist_"+app_layers_chatlist.md5id, "chats", function() {
        debugger;
        var id_list = [];
        var iscroll_elem = $("#"+this.id).find(".iscroll_sub_div");
        $.each($("#"+this.id).find(".skylist_card"), function() {
            id_list.push($(this).attr("id").split("skylist_card_"+app_layers_chatlist.md5id+"_")[1]);
        })
        var new_chats = Lincko.storage.list("chats", -1, null, 'projects',app_content_menu.projects_id, false);
        for(c in new_chats) {
            if (id_list.indexOf(new_chats[c]._id)>-1) {
                return;
            }
            debugger;
            iscroll_elem.prepend(app_layers_chatlist.addCard(new_chats[c]));
            
        }
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

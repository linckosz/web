/* Category ? */
function app_layers_chat_feedChat(parent, handler, project) {
    var app_layers_chatlist = new skylist(
        'chats',
        parent
    );
    parent.delegate(".skylist_card", "click", handler);
    parent.delegate(".skylist_newcardCircle", "click", function() {
        submenu_Build("contacts", false, false, null, true);
    });
}

function app_layers_chat_launchPage(param) {
    if (typeof param === 'undefined') { param = null; }
    app_application_lincko.add("app_layers_chat", null, function() {
        app_layers_chat_feedPage();
    });
    app_layers_chat_feedPage();
}

var app_layers_chat_feedPage = function(param) {
    var project = app_content_menu.projects_id;
    if (typeof param === 'undefined') { param = null; }
    var position = $('#app_layers_chat');
    position.addClass('overthrow');
    position.empty();
    app_layers_chat_feedChat(position,
        function() {
            submenu_Build("newchat", false, false, {
                type: "history",
                id: project,
                title:  Lincko.storage.get("projects", project, "+title") + " Activity"}, true);
            return false;
        },
        project);
}

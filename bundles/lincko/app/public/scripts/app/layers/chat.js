/* Category ? */

var chatlist_subConstruct = function(){
		var that = this;
		that.elem_newcardCircle.click( function() {
			submenu_Build("contacts", false, false,
				{
					id:app_content_menu.projects_id,
					'contactsID': _app_contacts_gen_chatcontacts(),
				}, that.preview);
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
		}, that.preview);
		return false;
	});
	console.log('ok2');
	app_application_lincko.add("skylist_"+app_layers_chatlist.md5id, "chats", function() {console.log('ok3');
		var id_list = [];
		var iscroll_elem = $("#"+this.id).find(".iscroll_sub_div");
		$.each($("#"+this.id).find(".skylist_card"), function() {
			id_list.push($(this).prop("id").split("skylist_card_"+app_layers_chatlist.md5id+"_")[1]);
		})
		var new_chats = Lincko.storage.list("chats", -1, null, 'projects', app_content_menu.projects_id, false);
		console.log(new_chats);
		for(c in new_chats) {
			if (id_list.indexOf(new_chats[c]._id.toString())>-1) {
				return;
			}
			iscroll_elem.prepend(app_layers_chatlist.addCard(new_chats[c]));
			
		}
	});
	app_application_lincko.prepare("chats", true);

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
	console.log('ok1');
	app_layers_chat_feedChat(position,
		function() {
			if ($(this).attr('type') != 'history') {
				var tmp = $(this).prop("id").split("_");
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
				title: title,
			}, true);
			return false;
		});
}

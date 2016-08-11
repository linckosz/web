/* Category ? */

var chatlist_subConstruct = function(){
		var that = this;
		if(Lincko.storage.get('projects', app_content_menu.projects_id)['personal_private']){
			return false;
		}
		var submenu_projects_id = app_content_menu.projects_id;
		that.elem_newcardCircle.click( function() {
			submenu_Build("new_group", false, false, {proid: submenu_projects_id, alwaysMe:true, }, true);
		})
		.appendTo(that.list_wrapper);
}

function app_layers_chat_feedChat(parent) {
	var Elem;
	var app_layers_chatlist = new skylist(
		'chats',
		parent,
		null,
		chatlist_subConstruct,
		false,
		false,
		'layer_chats'
	);

	if(app_layers_chatlist.Lincko_itemsList){
		for(var i in app_layers_chatlist.Lincko_itemsList){
			Elem = $(app_layers_chatlist.elem_card_all[i]);
			if(app_layers_chatlist.Lincko_itemsList[i]["root_type"]=="chats"){
				Elem.click(app_layers_chatlist.Lincko_itemsList[i], function(event){
					var id = event.data["root_id"];
					var title = event.data["title"];
					submenu_Build("newchat", false, false, {
						type: 'chats',
						id: id,
						title: title,
					}, true);
				});
			} else if(app_layers_chatlist.Lincko_itemsList[i]["root_type"]=="projects"){
				Elem.click(app_layers_chatlist.Lincko_itemsList[i], function(event){
					var id = event.data["root_id"];
					var title = event.data["title"];
					if(id == Lincko.storage.getMyPlaceholder()['_id']){
						title = Lincko.Translation.get('app', 2502, 'html'); //Personal Space
					}
					submenu_Build("newchat", false, false, {
						type: 'history',
						id: id,
						title: title,
					}, true);
				});
			}
		}
	}
	console.log(app_layers_chatlist)
	return;
	
	app_application_lincko.add("skylist_"+app_layers_chatlist.md5id, "chats", function() {

		var app_layers_chatlist = new skylist(
			'chats',
			parent,
			null,
			chatlist_subConstruct,
			false,
			false,
			'layer_chats'
		);


		var Elem;
		var id_list = [];
		var iscroll_elem = $("#"+this.id).find(".iscroll_sub_div");
		iscroll_elem.empty();
		$.each($("#"+this.id).find(".skylist_card"), function() { //toto => what's the use? I could not call it
			id_list.push($(this).prop("id").split("skylist_card_"+app_layers_chatlist.md5id+"_")[1]);
		})
		var new_chats = Lincko.storage.list("chats", -1, null, 'projects', app_content_menu.projects_id, false);
		new_chats.push(Lincko.storage.get("projects", app_content_menu.projects_id));
		new_chats = Lincko.storage.sort_items(new_chats, 'updated_at', 0, -1, true);

		for(c in new_chats) {
			if (id_list.indexOf(new_chats[c]._id.toString())>-1) {
				return;
			}
			Elem = app_layers_chatlist.addCard(new_chats[c]);
			iscroll_elem.prepend(Elem);

			if(new_chats[c]["_type"]=="chats"){
				Elem.click(new_chats[c]["_id"], function(event){
					var id = event.data;
					var title = Lincko.storage.get('chats', id, '+title');
					submenu_Build("newchat", false, false, {
						type: 'chats',
						id: id,
						title: title,
					}, true);
				});
			} else if(new_chats[c]["_type"]=="projects"){
				Elem.click(new_chats[c]["_id"], function(event){
					var id = event.data;
					var title = Lincko.storage.get("projects", id, "+title");
					if(id == Lincko.storage.getMyPlaceholder()['_id']){
						title = Lincko.Translation.get('app', 2502, 'html'); //Personal Space
					}
					submenu_Build("newchat", false, false, {
						type: 'history',
						id: id,
						title: title,
					}, true);
				});
			}
		}
		
	});

	
}

function app_layers_chat_launchPage(param) {
	if (typeof param === 'undefined') { param = null; }
	app_layers_chat_feedPage(param);
}

var app_layers_chat_feedPage = function(param) {
	if (typeof param === 'undefined') { param = null; }
	var position = $('#app_layers_chat');
	position.addClass('overthrow');
	position.empty();
	app_layers_chat_feedChat(position);
}

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

	app_application_lincko.add(
		"skylist_"+app_layers_chatlist.md5id,
		"projects_"+app_content_menu.projects_id,
		function(){
			var layer = $('#'+this.id);
			var prefix = 'skylist_card_'+this.action_param.md5id+'_';
			var items = this.action_param.Lincko_itemsList = this.action_param.list_filter();
			var list = {};
			for(var i in items){
				list[ prefix + items[i]['root_type']+"_"+items[i]['root_id'] ] = items[i]['timestamp'];
			}
			
			var Elems = layer.find('[find=card]');

			var list_dom = {};
			Elems.each(function(){
				var Elem = $(this);
				list_dom[ Elem.prop('id') ] = Elem.attr('timestamp');
				if(typeof list[Elem.prop('id')] == "undefined"){ //remove
					Elem.velocity('slideUp', {
						complete: function(){
							$(this).remove();
						}
					});
				} else if(list[Elem.prop('id')] != Elem.attr('timestamp')){ //update (move place)
					var parent = Elem.parent();
					Elem.detach(); //cut
					var timestamp = list[Elem.prop('id')];
					var Elems_bis = layer.find('[find=card]');
					var attached = false;
					Elems_bis.each(function(){
						var Elem_bis = $(this);
						if(!attached && timestamp >= Elem_bis.attr('timestamp')){
							attached = true;
							Elem_bis.before(Elem);
							return false;
						}
					});
					if(!attached){
						parent.append(Elem);
					}
				}
			});

			for(var i in items){
				var Elem = $('#'+ prefix + items[i]['root_type']+"_"+items[i]['root_id']);
				if(Elem.length <= 0){
					var Elem = this.action_param.addChat(items[i]);
					var parent = this.action_param.list
					Elem.detach(); //cut
					var timestamp = list[Elem.prop('id')];
					var Elems_bis = layer.find('[find=card]');
					var attached = false;
					Elems_bis.each(function(){
						var Elem_bis = $(this);
						if(!attached && timestamp >= Elem_bis.attr('timestamp')){
							attached = true;
							Elem_bis.before(Elem);
							return false;
						}
					});
					if(!attached){
						parent.append(Elem);
					}
				} else if(items[i]['timestamp'] != Elem.attr('timestamp')){
					this.action_param.addChat(items[i]);
				}
			}

		},
		app_layers_chatlist
	);

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

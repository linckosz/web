var app_models_chats_bubble_timeout = null;
function app_models_chats_bubble_actionMenu(){
	var translate_str = Lincko.Translation.get('app', 56, 'html'); //translate
	var untranslate_str = Lincko.Translation.get('app', 57, 'html'); //untranslate
	var timeout_fn = function(that){

		var elem_actionMenu = that.find('[find=actionMenu]');
		if(elem_actionMenu.length){ return false; } //action bar already exists

		var actionableCategories = ['messages', 'comments', 'files']; //currently allowed actionable items
		var elem_historyWrapper = that.closest('.models_history_wrapper');
		var category = elem_historyWrapper.attr('category');
		if(!elem_historyWrapper.length || actionableCategories.indexOf(category) < 0){ return false; }


		/*----passed fail conditions, so continue below----*/
		that.find('[contenteditable]').focus();

		var id_item = elem_historyWrapper.attr(category+'_id');
		var item = Lincko.storage.get(category, id_item);

		var projectID = Lincko.storage.getMyPlaceholder()['_id']; //default is personal space
		var parent = Lincko.storage.get(category, id_item, '_parent');
		if(!parent){ //comment doesnt exist (e.g. has tempID)
			var submenuID = that.closest('.submenu_wrapper').prop('id');
			$.each(submenu_obj,function(submenuType, submenus){
				$.each(submenus, function(index, submenu){
					if(submenu.id == submenuID){
						parent = Lincko.storage.get(submenu.param.type, submenu.param.id, '_parent');
						if(parent[0] == 'projects'){ //if comment is child of a chat that is child of a project
							projectID = parent[1];
						}
						return false;
					}
				})
			});
		}
		else if(parent[0] == 'projects'){ //if comment's direct parent is project
			projectID = parent[1];
		}
		else if(parent[0] == 'chats'){ //if comment's parent is chats
			parent = Lincko.storage.get('chats', parent[1], '_parent');
			if(parent[0] == 'projects'){
				projectID = parent[1];
			}
		}


		elem_actionMenu = $('#-app_models_chats_bubble_actionMenu').clone().prop('id','');
		if(item && (item.created_by != wrapper_localstorage.uid || $.now()/1000 - item.created_at > 60*2/*2 minutes*/)){
			elem_actionMenu.find('[find=recall_btn]').addClass('visibility_hidden');
		}
		that.prepend(elem_actionMenu);
		//center if chat bubble is long enough, align to right side of chat bubble if chat bubble is too small
		//if comment is not your comment (e.g. on the left side), always center/align to left
		if(elem_actionMenu.outerWidth() < that.outerWidth() || (item && item.created_by != wrapper_localstorage.uid) ){
			elem_actionMenu.addClass('app_models_chats_bubble_actionMenu_leftZero');
		}

		var that_clone = that.clone();
		that_clone.find('[find=translated_text]').recursiveRemove();
		that_clone.find('[find=actionMenu]').recursiveRemove();
		var textToAction = $.trim(that_clone.text());		
		
		
		
		if(category == 'messages' || category == 'comments'){
			/*----------translate action----------------*/
			var elem_translatedText = that.find('[find=translated_text]');
			var elem_translateBtn = elem_actionMenu.find('[find=translate_btn]');
			if(elem_translatedText.length){
				elem_translateBtn.html(untranslate_str);
				elem_translateBtn.on("mousedown touchstart", function(event){
					event.stopPropagation();
					that.blur();
					elem_translatedText.velocity('slideUp',{
						mobileHA: hasGood3Dsupport,
						complete: function(){
							elem_translatedText.recursiveRemove();
							var iscroll_id = that.closest('.overthrow').prop('id');
		    				myIScrollList[iscroll_id].refresh();
						}
					});
				});
			}
			else{
				elem_translateBtn.html(translate_str);
				elem_translateBtn.on("mousedown touchstart", function(event){
					event.stopPropagation();
					that.blur();
					wrapper_sendAction( 
					    { 
					        "text": textToAction,
					    }, 
					    'post', 
					    'translation/auto', 
					    function(data){ 
					    	if(that.find('[find=translated_text]').length){
					    		return false;
					    	}
				    		var elem_translated = $('#-app_models_chats_bubble_chatTranslation').clone().prop('id','');
				    		elem_translated.find('[find=text]').text(data);
				    		that.append(elem_translated);
				    		elem_translated.velocity('slideDown',{
				    			mobileHA: hasGood3Dsupport,
				    			complete: function(){
				    				var iscroll_id = that.closest('.overthrow').prop('id');
				    				myIScrollList[iscroll_id].refresh();

				    				var elem_wrapper = that.closest('.models_history_wrapper');
				    				var coord_wrapper = elem_wrapper.offset().top + elem_wrapper.outerHeight(true);
				    				var coord_iscroll = Math.abs(myIScrollList[iscroll_id].wrapperOffset.top) + myIScrollList[iscroll_id].wrapperHeight;

				    				if(coord_wrapper > coord_iscroll){
				    					myIScrollList[iscroll_id].scrollBy(0, coord_iscroll - coord_wrapper - 10/*bit of padding*/ );
				    				}
				    			}
				    		});//end of velocity
					    } 
					);
				});//end of mousedown/touchstart event
			}
			/*------END OF translate action----------------*/
		}

		if(category == 'messages' || category == 'comments' || category == 'files'){
			/*------------recall chat action----------------*/
			var elem_recallBtn = elem_actionMenu.find('[find=recall_btn]');

			//cannot recall files that has already been added to task
			if(category == 'files' && item.category != 'voice' && Lincko.storage.list_links('files', id_item)){
				elem_recallBtn.addClass('display_none');
			} else {
				elem_recallBtn.on("mousedown touchstart", function(){
					var target = that.closest('[category='+category+']');
					var date = new wrapper_date(Math.floor($.now()/1000));

					var item = {
						'is_working' : false,
						'id' : id_item,
						'style' : typeof target.attr("temp_id") === 'undefined' ? 'id' : 'temp_id',
						'timestamp' : date.display('time_short'),
						'category' : category,
					}
					app_models_chats_recall_queue[id_item] = item;

					if(!app_models_chats_recall_queue[id_item]['is_working'] && app_models_chats_recall_queue[id_item]['style'] == 'id')
					{
						var action = '';
						if(category == 'comments'){ action = 'comment/recall'; }
						else if (category == 'messages'){ action = 'message/recall'; }
						else if(category == 'files'){ action = 'file/delete'; }

						wrapper_sendAction(
							{
								"id": app_models_chats_recall_queue[id_item]['id'],
							},
							'post',
							action,
							function(data){
								delete app_models_chats_recall_queue[id_item];
							},
							null,
							function()
							{
								app_models_chats_recall_queue[id_item]['is_working'] = true;
							}
						);
					}

					var elem_id = target.prop('id');
					var elem = $('#-models_history_comment_recalled').clone();
					elem.prop('id',elem_id);
					
					elem.find("[find=timestamp]").html(date.display('time_short'));
					elem.find("[find=msg]").text(Lincko.Translation.get('app', 3101, 'html', {username: Lincko.storage.get('users', wrapper_localstorage.uid ,'username')}));
					target.replaceWith(elem);
				});
			}
			/*---------END OF recall chat action----------------*/
		}
		

		/*------------create task action----------------*/
		var elem_taskBtn = elem_actionMenu.find('[find=task_btn]').on("mousedown touchstart", function(event){
			//prevent clicking into next submenu
			event.stopPropagation();
			event.preventDefault(); 

			var preview = $('#app_content_submenu_preview').has(that).length ? true : false;

			var files = false;
			var voice = false;
			if(category=='files'){
				if(item.category == 'voice'){
					voice = [id_item]; textToAction = '';
				} else {
					files = {files: {}};
					files.files[id_item] = item;
				}
			}

			var submenu_taskdetail = submenu_Build_return("taskdetail_new", submenu_Getnext(preview), false, 
				{
					'id':'new', 'type':'tasks',
					'title': textToAction,
					projID: projectID,
					files: files,
					voice: voice,
				}, preview, false);
			if(submenu_taskdetail.param.elem_autoFocus){
				burgerN.placeCaretAtEnd(submenu_taskdetail.param.elem_autoFocus);
			}

			that.blur();
		});
	}//end of timeout_fn


	$('.models_history_content [contenteditable]').prop('contenteditable','false').prop('tabindex','1');
	if(supportsTouch){
		$('.models_history_wrapper .selectable').removeClass('selectable').addClass('unselectable');
		//$('.models_history_content').prop('tabindex','1');


		$("body").on("mousedown touchstart", '.models_history_content:not(.report)', function(event) {
			var that = $(this);
			if(that.has('[contenteditable]').length){
				event.preventDefault();
				that.find('[contenteditable]').focus();
				app_models_chats_bubble_timeout = setTimeout(function(){
					timeout_fn(that);
				}, 1000);
			}
		});
		$("body").on("mouseup touchend", '.models_history_content:not(.report)', function() {
			clearTimeout(app_models_chats_bubble_timeout);
		});
	}
	else{
		$("body").on("click", '.models_history_content:not(.report)', function(event) {
			var that = $(this);
			if(that.has('[contenteditable]').length){
				var sel = getSelection().toString();
				that.find('[find=actionMenu]').recursiveRemove();
				if(!sel){
					timeout_fn(that);
				}
			}
		});
	}

	$("body").on("blur", '.models_history_content:not(.report)', function() {
		var that = $(this);
		that.find('[find=actionMenu]').recursiveRemove();
	});
}
app_models_chats_bubble_actionMenu();

var app_models_chats_recallQueue = {
	sendAction: function(id_item){
		wrapper_sendAction(
				{
					"id": id_item,
				},
				'post',
				'comment/recall'
			);
	}
};

var app_models_chats_send_queue = {};
var app_models_chats_recall_queue = {};

setInterval(function(){
	$.each(app_models_chats_recall_queue,function(key){
		if(typeof app_models_chats_recall_queue[key] !== 'undefined'){
			if(app_models_chats_recall_queue[key]['style'] == 'temp_id')
			{
				var category = app_models_chats_recall_queue[key]['category'];
				var list  = Lincko.storage.list(category, 1,{'temp_id' : app_models_chats_recall_queue[key]['id']});
				if(list.length > 0 && !app_models_chats_recall_queue[key]['is_working'] )
				{
					var action = '';
					if(category == 'comments'){ action = 'comment/recall'; }
					else if (category == 'messages'){ action = 'message/recall'; }
					else if(category == 'files'){ action = 'file/delete'; }
						
					wrapper_sendAction(
						{
							"id": list[0]['_id'],
						},
						'post',
						action,
						function(data){
							delete app_models_chats_recall_queue[key];
						},
						null,
						function()
						{
							app_models_chats_recall_queue[key]['is_working'] = true;
						}
					);
				}
			}
		}
		
	});
},1000); 


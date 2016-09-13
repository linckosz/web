var app_models_chats_bubble_timeout = null;
function app_models_chats_bubble_actionMenu(){
	var translate_str = Lincko.Translation.get('app', 56, 'html'); //translate
	var untranslate_str = Lincko.Translation.get('app', 57, 'html'); //untranslate
	var timeout_fn = function(that){
		that.find('[find=content]').focus();
		var elem_historyWrapper = that.closest('[category=comments]');
		var elem_actionMenu = that.find('[find=actionMenu]');
		if(elem_actionMenu.length || elem_historyWrapper.length < 1){
			return false;
		}
		var commentID = elem_historyWrapper.prop('id').split('_').slice(-1)[0];
		var item_comment = Lincko.storage.get('comments', commentID);

		var projectID = Lincko.storage.getMyPlaceholder()['_id']; //default is personal space
		var parent = Lincko.storage.get('comments', commentID, '_parent');
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
		if(item_comment && (item_comment.created_by != wrapper_localstorage.uid || $.now()/1000 - item_comment.created_at > 60*2/*2 minutes*/)){
			elem_actionMenu.find('[find=recall_btn]').addClass('visibility_hidden');
		}
		that.prepend(elem_actionMenu);
		//center if chat bubble is long enough, align to right side of chat bubble if chat bubble is too small
		//if comment is not your comment (e.g. on the left side), always center/align to left
		if(elem_actionMenu.outerWidth() < that.outerWidth() || (item_comment && item_comment.created_by != wrapper_localstorage.uid) ){
			elem_actionMenu.addClass('app_models_chats_bubble_actionMenu_leftZero');
		}

		var that_clone = that.clone();
		that_clone.find('[find=translated_text]').remove();
		that_clone.find('[find=actionMenu]').remove();
		var textToAction = $.trim(that_clone.text());		
		
		var elem_translateBtn = elem_actionMenu.find('[find=translate_btn]');

		/*----------translate action----------------*/
		var elem_translatedText = that.find('[find=translated_text]');
		if(elem_translatedText.length){
			elem_translateBtn.html(untranslate_str);
			elem_translateBtn.on("mousedown touchstart", function(event){
				event.stopPropagation();
				that.blur();
				elem_translatedText.velocity('slideUp',{
					complete: function(){
						elem_translatedText.remove();
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

		/*------------create task action----------------*/
		var elem_taskBtn = elem_actionMenu.find('[find=task_btn]');
		elem_taskBtn.on("mousedown touchstart", function(){
			var preview = false;
			if($('#app_content_submenu_preview').has(that).length){
				preview = true;
			}
			submenu_Build("taskdetail_new", submenu_Getnext(preview), false, {'id':'new', 'title': textToAction, projID: projectID, 'type':'tasks'}, preview);
			that.blur();
		});
		/*------------recall chat action----------------*/
		var elem_recallBtn = elem_actionMenu.find('[find=recall_btn]');
		elem_recallBtn.on("mousedown touchstart", function(){
			if(!item_comment && !app_models_chats_recallQueue[commentID]){
				app_models_chats_recallQueue[commentID] = true;
			}
			else{
				wrapper_sendAction(
					{
						"id": commentID,
					},
					'post',
					'comment/recall'
				);
				Lincko.storage.data.comments[commentID].recalled_by = wrapper_localstorage.uid;
				app_application_lincko.prepare(item_comment['_parent'][0]+'_'+item_comment['_parent'][1], true);
				that.blur();
			}
		});

	}//end of timeout_fn


	$('.models_history_content [contenteditable]').prop('contenteditable','false').prop('tabindex','1');
	if(supportsTouch){
		$('.models_history_content .selectable').removeClass('selectable').addClass('unselectable');
		//$('.models_history_content').prop('tabindex','1');


		$("body").on("mousedown touchstart", '.models_history_content', function(event) {
			var that = $(this);
			if(that.has('[contenteditable]').length){
				event.preventDefault();
				that.find('[contenteditable]').focus();
				app_models_chats_bubble_timeout = setTimeout(function(){
					timeout_fn(that);
				}, 1000);
			}
		});
		$("body").on("mouseup touchend", '.models_history_content', function() {
			clearTimeout(app_models_chats_bubble_timeout);
		});
	}
	else{
		$("body").on("click", '.models_history_content', function(event) {
			var that = $(this);
			if(that.has('[contenteditable]').length){
				var sel = getSelection().toString();
				that.find('[find=actionMenu]').remove();
				if(!sel){
					timeout_fn(that);
				}
			}
		});
	}

	$("body").on("blur", '.models_history_content', function() {
		var that = $(this);
		that.find('[find=actionMenu]').remove();
	});
}
app_models_chats_bubble_actionMenu();

var app_models_chats_recallQueue = {
	sendAction: function(commentID){
		wrapper_sendAction(
				{
					"id": commentID,
				},
				'post',
				'comment/recall'
			);
	}
};
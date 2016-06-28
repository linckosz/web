var app_models_chat_bubble_timeout = null;

function app_models_chat_bubble_actionMenu(){
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
		var projectID = Lincko.storage.get('comments', commentID, '_parent');
		if(projectID[0] == 'projects'){
			projectID = projectID[1];
		}
		else{
			projectID = Lincko.storage.get('chats', Lincko.storage.get('comments', commentID, '_parent')[1], '_parent');
			if(projectID[0] == 'projects'){
				projectID = projectID[1];
			}
			else{
				projectID = Lincko.storage.getMyPlaceholder()['_id'];
			}
		}

		elem_actionMenu = $('#-app_models_chat_bubble_actionMenu').clone().prop('id','');
		that.prepend(elem_actionMenu);

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
			    		var elem_translated = $('#-app_models_chat_bubble_chatTranslation').clone().prop('id','');
			    		elem_translated.find('[find=text]').text(data);
			    		that.append(elem_translated);
			    		elem_translated.velocity('slideDown');
				    } 
				);
			});
		}
		/*------END OF translate action----------------*/

		/*------------create task action----------------*/
		var elem_taskBtn = elem_actionMenu.find('[find=task_btn]');
		elem_taskBtn.on("mousedown touchstart", function(){
			var preview = false;
			if($('#app_content_submenu_preview').has(that).length){
				preview = true;
			}
			submenu_Build("taskdetail", true, false, {'id':'new', 'title': textToAction, projID: projectID, 'type':'tasks'}, preview);
			that.blur();
		});
	}//end of timeout_fn


	if(supportsTouch){
		$('.models_history_content .selectable').removeClass('selectable').addClass('unselectable');
		$('.models_history_content [contenteditable]').prop('contenteditable','false').prop('tabindex','1');
		//$('.models_history_content').prop('tabindex','1');


		$("body").on("mousedown touchstart", '.models_history_content', function(event) {
			var that = $(this);
			if(that.has('[contenteditable]').length){
				event.preventDefault();
				that.find('[contenteditable]').focus();
				app_models_chat_bubble_timeout = setTimeout(function(){
					timeout_fn(that);
				}, 1000);
			}
		});
		$("body").on("mouseup touchend", '.models_history_content', function() {
			clearTimeout(app_models_chat_bubble_timeout);
		});
	}
	else{
		$("body").on("click", '.models_history_content', function(event) {
			var sel = getSelection().toString();
			var that = $(this);
			that.find('[find=actionMenu]').remove();
			if(!sel){
				timeout_fn(that);
			}
		});
	}

	$("body").on("blur", '.models_history_content', function() {
		var that = $(this);
		that.find('[find=actionMenu]').remove();
	});


}
app_models_chat_bubble_actionMenu();

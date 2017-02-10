/*
 * the ultimate Lincko Burger
 */
 var burger = function(){
 	/*MAKE A NEW BURGER CLASS WITH INSTANCES*/
 }

var burger_shortcuts = {
	at: '@',
	plus: '+',
	plusAlt: '＋',
};


//this should be compatible with inputter (tasks) as well as inputter (chats) and future usage cases
var burger_keyboard = function(elem, lineHeight, shortcuts, burgerData, fn_enter, project_id, dropdown_cb_custom){
	var that = this;
	that.elem = elem;

	if(!lineHeight){ var lineHeight = 30; }
	that.lineHeight = lineHeight;
	 /* possible alternative to hardcode offset
    //http://stackoverflow.com/questions/1185151/how-to-determine-a-line-height-using-javascript-jquery
    //1.5 of font-size is typical for lineheight
    var fontSize = $(el).css('font-size');
	var lineHeight = Math.floor(parseInt(fontSize.replace('px','')) * 1.5);
	*/

	if($.type(shortcuts) != 'object'){
		var shortcuts = { at: true, plus: true, }
	}
	that.shortcuts = shortcuts;

	that.burgerData = {};
	if(burgerData && typeof burgerData == 'object' && typeof burgerData.at == 'object'){ that.burgerData.at = burgerData.at; }
	else{
		that.burgerData.at = burger_list.in_charge('projects', app_content_menu.projects_id);
	}

	if(!project_id){ var project_id = null; }
	that.project_id = project_id;


	//variables to clear on burger destroy
	that.i_caretBegin = 0;
	that.i_caretCurrent = 0;
	that.dropdownInst = null;
	that.burgerMode = false;
	that.burgerWord = '';
	that.iscroll = null;

	if($.type(dropdown_cb_custom) != 'object'){ var dropdown_cb_custom = {}; }
	that.dropdown_cb_custom = dropdown_cb_custom;

	that.dropdown_cb = {};
	that.dropdown_cb.cb_create = function(){
		if(typeof that.dropdown_cb_custom.cb_create == 'function'){
			that.dropdown_cb_custom.cb_create();
		}
	}
	that.dropdown_cb.cb_select = function(data){
		if(typeof data != 'object'){ var data = {val: data}; }
		var str_elem_burgerSpan = null;
		if(that.burgerMode == burger_shortcuts.at){
			str_elem_burgerSpan = burger_spanUser(data.val, data.text).clone().wrap('<div/>').parent().html()+'&nbsp;';
			//remove other @user spans
			that.elem.find('[find=name].burger_tag').recursiveRemove();
		}
		else if(that.burgerMode == burger_shortcuts.plus){
			str_elem_burgerSpan = burger_spanDate(data.val, null).clone().wrap('<div/>').parent().html()+'&nbsp;';
			//remove other +user spans
			that.elem.find('[find=dateWrapper].burger_tag').recursiveRemove();
		}
		
		var textLength = that.elem.text().length;
		
		//adjust for deleted spans
		that.i_caretCurrent -= textLength - elem.text().length;

		//dont touch any text inside child DOM (e.g. <span>)
		var outerTextNode = that.elem.contents().filter(function(){ return this.nodeType == 3; });
		//if there are spans in the middle, outerTextNode is divied up, so must loop
		$.each(outerTextNode, function(key,str2){
			var str = that.burgerMode + that.burgerWord;
			if((str2.data).indexOf(str) != -1){
			    $(outerTextNode[key]).replaceWith($(outerTextNode[key]).text().replace(str, str_elem_burgerSpan));
			    return false;
			}
		});

		burgerN.placeCaretAt(that.i_caretCurrent-(that.burgerMode+that.burgerWord).length, that.elem);

		if(typeof that.dropdown_cb_custom.cb_select == 'function'){
			that.dropdown_cb_custom.cb_select(data);
		}

	}
	that.dropdown_cb.cb_destroy = function(){
		that.dropdownInst = null;
		that.i_caretBegin = 0;
		that.i_caretCurrent = 0;
		that.burgerMode = false;
		that.burgerWord = '';
		that.iscroll = null;

		if(typeof that.dropdown_cb_custom.cb_destroy == 'function'){
			that.dropdown_cb_custom.cb_destroy(that);
		}
	}

	if(typeof fn_enter != 'function'){  that.fn_enter = false; }
	else{ 
		that.fn_enter = fn_enter;
		elem.on('keypress.burger_keyboard', that, function(event){
			var that = event.data;
			if(!that.burgerMode && event.which == 13){ //if enter is pressed
				fn_enter(event, that);
			}
		});
	}

	// //adding linebreak happens on keypress, not on keyup
	// elem.on('keypress.burger_keyboard', function(event){
	// 	if((event.which || event.keyCode) == 13){ //if enter is pressed
	// 		if(param.shiftEnter && event.shiftKey){ //toto - param not defined
	// 			event.returnValue=false;
	// 			return;
	// 		}	
	// 		else{
	// 			event.preventDefault();
	// 			//cb_select();
	// 		}
	// 	}
	// });

	var latestChar = null;
    var latestChar_node = null;
    var latestChar_prev = null;
	elem.on('keyup.burger_keyboard', function(event){
		var which = event.which;

		/*DO NOT TAKE ACTION*/
		if(	which == 16 //shift
			|| which == 38 // up arrow
			|| which == 40 // down arrow
			){ return; }

		var coord = burger_regex_getCaretOffset(elem, true);
	    var caretIndex = that.i_caretCurrent = coord.caretOffset;

		var selection = getSelection();
	    var focus_node = selection.focusNode;
	    focus_node.normalize();
	    if(focus_node.nodeValue){ latestChar_node = (focus_node.nodeValue).slice(-1); }
	    else { latestChar_node = null; }
	    

	    var currentText = elem.text();
		latestChar = currentText[caretIndex - 1];
	  	if(caretIndex > 0){
	  		latestChar_prev = currentText[caretIndex - 2];
	  	}
	  	else{
	  		latestChar_prev = null;
	  	}

	  	//sometimes, for some input methods, focus_node.nodeValue reflects the latest typed characters
	  	if(latestChar == latestChar_prev  && latestChar_node != latestChar_prev ){ 
	  		latestChar = latestChar_node; 
	  		if(focus_node.nodeValue && (focus_node.nodeValue).length > 1){
	  			latestChar_prev = ((focus_node.nodeValue).slice(-2))[0];
	  		}
	  		else{
	  			latestChar_prev = null;
	  		}
	  	}

	  	/*For Chinese only, when inputting pinyin:
	      if waiting for combined character (229) but latestChar is not Chinese, return and act on next keyup*/
	    if(	   latestChar 
	    	&& latestChar != burger_shortcuts.at 
	    	&& latestChar != burger_shortcuts.plus 
	    	&& latestChar != burger_shortcuts.plusAlt  
	    	&& event.which == 229 && !latestChar.match(/[\u4E00-\u9FA5]/)){ 
	    	latestChar_prev = latestChar;
	    	return; 
	    }

	    //trigger burger
	   	if(!that.dropdownInst 
			&& (	
				(latestChar == burger_shortcuts.at && that.shortcuts.at)
			|| 	(latestChar == burger_shortcuts.plus && that.shortcuts.plus)
			|| 	(latestChar == burger_shortcuts.plusAlt && that.shortcuts.plus)		)){
			
			that.i_caretBegin = caretIndex;

			if(latestChar == burger_shortcuts.at){
				that.burgerMode = burger_shortcuts.at;

				//for mobile, just open submenu on the shortcuts
	    		if(responsive.test("maxMobileL") && !submenu_get('burger_clickHandler_inCharge')){
	    			var param = {};
					//build contactsID from given list
					param.contactsID = {};
					$.each(that.burgerData.at, function(i, obj){
						var checked = false;
						if(obj.preSelect){ checked = true; }
						if(obj.val){
							param.contactsID[obj.val] = { checked: checked };
						}
					});

					if(that.project_id){ param.project_id = that.project_id; }

					//for mobile need blur to clear the keyboard, but maintain the contenteditable to continue typing after submenu close
					//for skylist title edit, contenteditable is turned false on blur, so must revert
					param.fn_onLaunch = function(){
						var hasAttr_contenteditable = that.elem.attr('contenteditable');
						that.elem.blur();
						if(hasAttr_contenteditable){
							that.elem.attr('contenteditable', hasAttr_contenteditable);
						}						
					}
					param.elem_focusOnCancel = that.elem;
					param.selectOne = true;
					param.alwaysMe = false;
					param.cb_create = that.dropdown_cb.cb_create;
					param.cb_select = that.dropdown_cb.cb_select;
					param.cb_destroy = that.dropdown_cb.cb_destroy;
					submenu_Build('burger_clickHandler_inCharge', true, null, param);
	    		}
	    		else{//for desktop
	    			that.dropdownInst = new burger_dropdown('toto', that.burgerData.at, [coord.x, coord.y], that.lineHeight, that.dropdown_cb.cb_create, that.dropdown_cb.cb_select, that.dropdown_cb.cb_destroy, that.elem);
	    		}			
			}
			else if(latestChar == burger_shortcuts.plus || latestChar == burger_shortcuts.plusAlt){ 
				that.burgerMode = burger_shortcuts.plus;

				//for mobile, just open submenu on the shortcuts
	    		if(responsive.test("maxMobileL") && !submenu_get('burger_clickHandler_calendar')){
	    			var param = {};
	    			//for mobile need blur to clear the keyboard, but maintain the contenteditable to continue typing after submenu close
					//for skylist title edit, contenteditable is turned false on blur, so must revert
					param.fn_onLaunch = function(){ 
						var hasAttr_contenteditable = that.elem.attr('contenteditable');
						that.elem.blur();
						if(hasAttr_contenteditable){
							that.elem.attr('contenteditable', hasAttr_contenteditable);
						}						
					}
	    			param.elem_focusOnCancel = that.elem;
					param.cb_create = that.dropdown_cb.cb_create;
					param.cb_select = that.dropdown_cb.cb_select;
					param.cb_destroy = that.dropdown_cb.cb_destroy;
					submenu_Build('burger_clickHandler_calendar', true, null, param);
	    		}
	    		else{//for desktop
	    			that.dropdownInst = new burger_dropdown('toto', burger_list.dates(that.burgerWord), [coord.x, coord.y], that.lineHeight, that.dropdown_cb.cb_create, that.dropdown_cb.cb_select, that.dropdown_cb.cb_destroy, that.elem); 
	    		}
			}
		}
		else if(that.dropdownInst){
		    /*For Chinese only, when inputting pinyin:
		      if waiting for combined character (229) but latestChar is not Chinese, return and act on next keyup*/
		    if(latestChar && which == 229 && !latestChar.match(/[\u4E00-\u9FA5]/)){ 
		    	return; 
		    }

		    //if 'space' or caret is moved behind the burger_startIndex
		    if( (which == 32 /*space*/ && !latestChar.replace(/\s/g, '').length /*space*/) || caretIndex < that.i_caretBegin ){
				that.dropdownInst.hide();
				return;
			}

			//if enter or tab is pressed
			if(which == 13 || which == 9){
				/*event.preventDefault();
				var elem_option_select = that.dropdownInst.elem.find('.burger_option_selected');
				if(!elem_option_select.length){
					elem_option_select = that.dropdownInst.elem.find('.burger_option').eq(0);
				}

				elem_option_select.click();*/
				return;
			}

			//update existing burger dropdown
			that.burgerWord = elem.text().substring(that.i_caretBegin, caretIndex);
			if(that.burgerMode == burger_shortcuts.at){
				var list_search = burger_search.users(that.burgerData.at, that.burgerWord);
				that.dropdownInst.build_elem_data(list_search);
			}
			else if(that.burgerMode == burger_shortcuts.plus){
				that.dropdownInst.build_elem_data(burger_list.dates(that.burgerWord));
			}

		}
	});//end of keyup
}
burger_keyboard.prototype.getBurgerData = function(){
	var that = this;
	return burger_parseHTML(that.elem);
}
burger_keyboard.prototype.destroy = function(){
	var that = this;
	that.elem.off('.burger_keyboard');
	if(that.dropdownInst && typeof that.dropdownInst.destroy == 'function'){ that.dropdownInst.destroy(); }
	else{
		$.each(that.dropdownInst, function(type, inst){
			if(typeof inst.destroy == 'function'){ inst.destroy(); }
		});
	}
}

var burger_search = {
	users: function(listToSearch, word){
		var listToReturn = [];

		$.each(listToSearch, function(i, obj){
			var user = Lincko.storage.get('users', obj.val);
			if(user){
				var user_search_result = Lincko.storage.searchArray('word', word, [user], ['-firstname', '-lastname', '-username'], true);
				if(user_search_result.length){ listToReturn.push(obj); }
			}
		});

		return listToReturn;
	},
}

var burger_attach_clickHandler = {

	in_charge: function(elem, lincko_type, lincko_id, cb_create, cb_select, cb_destroy, list, responsiveRange){
		if(!elem instanceof $){ elem = $(elem); }
		if(typeof cb_create != 'function'){ var cb_create = null; }
		if(typeof cb_select != 'function' && typeof cb_select != 'boolean' && !cb_select){ var cb_select = null; }
		if(typeof cb_destroy != 'function'){ var cb_destroy = null; }
		if(typeof responsiveRange != 'boolean' && typeof resonsiveRange != 'string'){ var responsiveRange = 'minTablet'; } //responsiveRange true is minTablet

		//default cb_select for in_charge
		if(cb_select && typeof cb_select == 'boolean'){
			var cb_select = function(data){
				var param = {
					id: lincko_id,
					'users>in_charge': {},
				};
				if(data.preSelect){
					param['users>in_charge'][data.val] = false;
				}
				else{
					param['users>in_charge'][data.val] = true;
				}

				var lincko_item = Lincko.storage.get(lincko_type, lincko_id);
				if(!lincko_item){ return false; }

				if(lincko_item._users){
					//unassign anyone that have been previously assigned
					$.each(lincko_item._users, function(userid, obj){
						if(data.val == userid){return;}
						if(obj.in_charge){
							param['users>in_charge'][userid] = false;
						}
					});
				}

				skylist.sendAction.tasks(
					param, 
					lincko_item, 'task/update',
					null, null,
					function(){ 
						if(!Lincko.storage.data[lincko_type][lincko_id]['_users']){
							Lincko.storage.data[lincko_type][lincko_id]['_users'] = {};
						}

						$.each(Lincko.storage.data[lincko_type][lincko_id]['_users'], function(userid, obj){
							obj.in_charge = false;
						});

						if(!Lincko.storage.data[lincko_type][lincko_id]['_users'][data.val]){
							Lincko.storage.data[lincko_type][lincko_id]['_users'][data.val] = {};
						}
						Lincko.storage.data[lincko_type][lincko_id]['_users'][data.val].in_charge = !data.preSelect;
						
						var param_prepare = {};
						param_prepare[lincko_type+'_'+lincko_id] = { '_users': true };
						app_application_lincko.prepare(lincko_type+'_'+lincko_id, true, param_prepare); 
					}
				);
			}
		}//END OF default cb_select
		
		var dropdownInst = null;
		elem.off('click.burger').on('click.burger', function(){
			if( (!dropdownInst || dropdownInst.destroyed) && 
				(lincko_id == 'new' || !lincko_id || Lincko.storage.canI('edit', lincko_type, lincko_id))){
				
				//build list on click
				var list_genOnClick = null;
				if(list){ list_genOnClick = list; }
				else{
					list_genOnClick = burger_list.in_charge(lincko_type, lincko_id);
				}

				if(responsiveRange == true || responsive.test(responsiveRange)){
					dropdownInst = new burger_dropdown('toto', list_genOnClick, elem, null, null, cb_select, null, false); 
				}
				else {
					var param = {};

					//param.contactsID = burgerN.generate_contacts(Lincko.storage.get(lincko_type, lincko_id));
					//build contactsID from given list
					param.contactsID = {};
					$.each(list_genOnClick, function(i, obj){
						var checked = false;
						if(obj.preSelect){ checked = true; }
						if(obj.val){
							param.contactsID[obj.val] = { checked: checked };
						}
					});
					
					param.selectOne = true;
					param.alwaysMe = false;
					param.cb_create = cb_create;
					param.cb_select = cb_select;
					param.cb_destroy = cb_destroy;

					var lincko_item = Lincko.storage.get(lincko_type, lincko_id);
					var project_id = null;
					if(lincko_type == 'projects'){ project_id = lincko_id; }
					else if(lincko_item && lincko_item['_parent'] && lincko_item['_parent'][0] == 'projects'){
						project_id = lincko_item['_parent'][1];
					}
					if(project_id){ param.project_id = project_id; }

					submenu_Build('burger_clickHandler_inCharge', true, null, param);
				}				
			}
		});
		return dropdownInst;
	},

	projects: function(elem, lincko_type, lincko_id, cb_create, cb_select, cb_destroy, list, responsiveRange){
		if(!elem instanceof $){ elem = $(elem); }
		if(typeof cb_create != 'function'){ cb_create = null; }
		if(typeof cb_select != 'function' && typeof cb_select != 'boolean' && !cb_select){ var cb_select = null; }
		if(typeof cb_destroy != 'function'){ cb_destroy = null; }
		if(typeof responsiveRange != 'boolean' && typeof resonsiveRange != 'string'){ var responsiveRange = 'minTablet'; } //responsiveRange true is minTablet

		//default cb_select
		if(cb_select && typeof cb_select == 'boolean'){
			var cb_select = function(data){
				if(data.preSelect){ return; }

				var route = lincko_type.slice(0, -1)+'/update';

				var param = {
					id: lincko_id,
					parent_id: data.val,
				};

				var cb_begin = function(){
					if(Lincko.storage.data[lincko_type][lincko_id]['_parent']){
						Lincko.storage.data[lincko_type][lincko_id]['_parent'][1] = data.val;
					}
					
					var param_prepare = {};
					param_prepare[lincko_type+'_'+lincko_id] = { '_parent': true };
					app_application_lincko.prepare(lincko_type+'_'+lincko_id, true, param_prepare); 
				}
				
				if(lincko_type == 'tasks'){
					skylist.sendAction.tasks(param, Lincko.storage.get(lincko_type, lincko_id), route, null, null, cb_begin);
				}
				else{
					wrapper_sendAction(param, 'post', route, null, null, cb_begin);
				}
			}
		}//END OF default cb_select

		var dropdownInst = null;

		elem.off('click.burger').on('click.burger', function(){
			if( (!dropdownInst || dropdownInst.destroyed) && 
				(lincko_id == 'new' || !lincko_id || Lincko.storage.canI('edit', lincko_type, lincko_id))){

				//build list on click
				var list_genOnClick = null;
				if(list){ list_genOnClick = list; }
				else{
					list_genOnClick = burger_list.projects(lincko_type, lincko_id);
				}
				 
				if(responsiveRange == true || responsive.test(responsiveRange)){
					dropdownInst = new burger_dropdown('toto', list_genOnClick, elem, null, null, cb_select, null, false);
				}
				else {
					var param = {};
					param.cb_create = cb_create;
					param.cb_select = cb_select;
					param.cb_destroy = cb_destroy;
					param.list = list_genOnClick;
					submenu_Build('burger_clickHandler_projects', true, null, param);
				}
			}
		});

		return dropdownInst;
	},

	calendar: function(elem, lincko_type, lincko_id, cb_create, cb_select, cb_destroy, currentDate, responsiveRange){
		if(!elem instanceof $){ elem = $(elem); }
		if(typeof cb_create != 'function'){ var cb_create = null; }
		if(typeof cb_select != 'function' && typeof cb_select != 'boolean' && !cb_select){ var cb_select = null; }
		if(typeof cb_destroy != 'function'){ var cb_destroy = null; }
		if(typeof responsiveRange != 'boolean' && typeof resonsiveRange != 'string'){ var responsiveRange = 'minTablet'; } //responsiveRange true is minTablet

		var elem_datepicker = null;
		var dropdownDuration = 400;

		if(!currentDate){
			var currentDate = 0;
			var lincko_item = Lincko.storage.get(lincko_type, lincko_id);
			if(lincko_item){
				currentDate = (lincko_item.start + lincko_item.duration)*1000;
			}
		}

		//default cb_select for in_charge
		if(cb_select && typeof cb_select == 'boolean' && lincko_type == 'tasks'){
			var cb_select = function(timestamp){
				var lincko_item = Lincko.storage.get(lincko_type, lincko_id);
				if(!lincko_item){ return false; }

				var duration = timestamp - lincko_item.start;

				var param = {
					id: lincko_id,
					duration: duration,
				};

				var cb_begin = function(){
					if(Lincko.storage.data[lincko_type][lincko_id]['duration']){
						Lincko.storage.data[lincko_type][lincko_id]['duration'] = duration;
					}
					
					var param_prepare = {};
					param_prepare[lincko_type+'_'+lincko_id] = { 'duration': true };
					app_application_lincko.prepare(lincko_type+'_'+lincko_id, true, param_prepare); 
				}

				skylist.sendAction.tasks(
					param, 
					lincko_item, 'task/update',
					null, null,
					cb_begin
				);

				if(elem_datepicker){
					elem_datepicker.blur();
				}
			}
		}//END OF default cb_select

		var launch = function(){
			if(elem_datepicker){ return; }
			if($('#burger_calendar_clickHandler').length){ $('#burger_calendar_clickHandler').recursiveRemove(); }
			var md5id = md5(Math.random());

			elem_datepicker = burger_renderCalendar('burger_calendar_clickHandler_'+md5id, currentDate, cb_select).attr('tabindex', 0).addClass('burger_calendar_clickHandler');

			var coord = elem.offset();
			var left = coord.left;
			var top = coord.top + elem.outerHeight();

			elem_datepicker.css({
				left: left,
				top: top,
			});

			//for IE: prevent dropdown blur when clicked inside dropdown
		    elem_datepicker.mousedown(function(event){ 
		    	event.preventDefault();
			});

			elem_datepicker.blur(function(){
				elem_datepicker.velocity('slideUp', {
					duration: dropdownDuration,
					mobileHA: hasGood3Dsupport,
					complete: function(){
						delete burger_global_dropdown.list[elem_datepicker.prop('id')];
						elem_datepicker.datepicker( "destroy" );
						elem_datepicker.recursiveRemove();
						elem_datepicker = null;
					},
				});
			});

			elem_datepicker.appendTo('body');

			//if calendar needs to be drawn slideUp
			var window_outerHeight = $(window).outerHeight();
			if( window_outerHeight <= top + elem_datepicker.outerHeight() ){
				elem_datepicker.css({
					top: '',
					bottom: window_outerHeight-coord.top,
				});
			}

			//watch for being cut off on the right edge of screen
			if(elem_datepicker.offset().left + elem_datepicker.outerWidth() + 20/*padding*/ > $(window).width()){
				elem_datepicker.css({
					left: 'auto',
					right: 20, //padding
				});
			}

			//add to global dropdown list
			burger_global_dropdown.list[elem_datepicker.prop('id')] = {
				destroy: function(){
					elem_datepicker.datepicker( "destroy" );
					elem_datepicker.recursiveRemove();
					elem_datepicker = null;
				},
				hide: function(){
					elem_datepicker.blur();
				},
			}

			elem_datepicker.velocity('slideDown', {
				duration: dropdownDuration,
				mobileHA: hasGood3Dsupport,
				complete: function(){
					elem_datepicker.focus();
				}
			});

		}


		elem.off('click.burger').on('click.burger', function(){
			if( !elem_datepicker && 
				(lincko_id == 'new' || !lincko_id || Lincko.storage.canI('edit', lincko_type, lincko_id))){
				if(responsiveRange == true || responsive.test(responsiveRange)){
					launch();
				}
				else{
					var param = {};
					param.cb_create = cb_create;
					param.cb_select = cb_select;
					param.cb_destroy = cb_destroy;
					param.defaultDate = currentDate;
					submenu_Build('burger_clickHandler_calendar', true, null, param);
				}
			}
		});

		return elem_datepicker;
	},
}






var burger_list = function(lincko_type, lincko_id, burger_type){
	/*	lincko_type : 'tasks'
		lincko_id : 123
		burger_type : 'users'
	*/
	return burger_list[burger_type](lincko_type, lincko_id);
}

//can accept any lincko types, including projects
burger_list.in_charge = function(lincko_type, lincko_id){
	var item = null;
	var accessList = [];
	if(lincko_type == 'projects'){
		if(!lincko_id){ var lincko_id = app_content_menu.projects_id; }
		accessList = Lincko.storage.whoHasAccess('projects', lincko_id);
	}
	else{
		item = Lincko.storage.get(lincko_type, lincko_id);
		if(!item){
			return false;
		}
		else{
			accessList = Lincko.storage.whoHasAccess(item['_type'], item['_id']);
		}
	}

	var userList = [];
	for (var i = 0; i < accessList.length; i++) {
		var userid = accessList[i]; 
		var user = {
			val: userid,
			text: Lincko.storage.get("users", userid,"username"),
			imgURL: Lincko.storage.getLinkThumbnail(Lincko.storage.get("users", userid, 'profile_pic')),
			addClass: 'burger_option_users',
		};

		if( $.type(item) == 'object' && item['_users']  && userid in item['_users'] && item['_users'][userid]['in_charge'] ){
			user.preSelect = true;
		}
		else{
			user.preSelect = false;
		}

		userList.push(user);
	}

	var project_id = null;
	if(lincko_type == 'projects'){
		project_id = lincko_id;
	}
	else{
		project_id = item['_parent'][1];
	}

	var inviteNewUser = {
		text: Lincko.Translation.get('app', 31, 'html'), //Add Teammates
		onClick: function(){
			var param = {
				pid: project_id,
				invite_access: {
					projects: project_id,
					//tasks: task_id, //null if not available (i.e. brand new task) toto - not ready yet
				},
			}
			submenu_Build('app_projects_users_contacts', true, false, param);
			//submenu_Build("chat_add_user", true, false, true); 
			//submenu_Build('chat_list', false, true, true); 
		},
		imgIcon: 'icon-AddPerson',
		imgURL: false,
		addClass: 'burger_option_users burger_option_inviteUser',
	}

	userList.push(inviteNewUser);

	return userList;
}

burger_list.projects = function(lincko_type, lincko_id){
	var latest_projects = [];
	var id_preSelect = null;

	if(lincko_id && lincko_id != 'new'){
		var parent_item = Lincko.storage.get(lincko_type, lincko_id, 'parent');
		if(parent_item[0] != 'projects'){ return false; }
		else{
			var id_preSelect = parent_item[1];
		}
	}

	if(Lincko.storage.getSettings().latestvisitProjects){
		$.each(Lincko.storage.getSettings().latestvisitProjects, function(i, id){
			var project = Lincko.storage.get('projects',id);
			if(!project || project.personal_private){ return; }
			else{
				latest_projects.push(
					{
						text: project['+title'],
						val: project['_id'],
						preSelect: id_preSelect == project['_id'],
						latestProjects: true,
						addClass: 'burger_option_projects',
					}
				);
			}
		});
	}

	//add border to last one in latest projects
	if(latest_projects.length){
		latest_projects[latest_projects.length-1].addClass = 'burger_latestvisitProjects_border';
	}

	//add perosnal space at the top
	var project_personal = Lincko.storage.getMyPlaceholder();
	latest_projects.unshift(
		{
			text: Lincko.Translation.get('app', 2502, 'html'), //Personal Space
			val: project_personal['_id'],
			preSelect: id_preSelect == project_personal['_id'],
			latestProjects: false,
			personal: true,
			addClass: 'burger_option_projects',
		}
	);

	//complete projects list
	var projects_list = Lincko.storage.list('projects', null, {personal_private: ['==',null]}, null, null, false);
    projects_list = Lincko.storage.sort_items(projects_list,'+title');

	$.each(projects_list, function(i, project){
		//return if it is one of the latest
		if($.inArray(project['_id'], Lincko.storage.getSettings().latestvisitProjects) > -1 ){ return; }
		else{
			latest_projects.push(
				{
					text: project['+title'],
					val: project['_id'],
					preSelect: id_preSelect == project['_id'],
					latestProjects: false,
					addClass: 'burger_option_projects',
				}
			);
		}	
	});

	return latest_projects;
}

burger_list.dates = function(substr){
	var that = this;
	if(!substr){ var substr = ''; }
	var dateList = [];

	//for chinese, convert chinese character and pinyin to numbers
	if(app_language_short == 'zh-chs'){
		substr = burgerN.ChineseNumberConverter(substr);
	}


	var optionsMonths = burgerN.monthsArray;
	var optionsTT = [burgerN.todayStr, burgerN.tomorrowStr];
	
	var substr_char = substr.replace(/\d/g,'').toLowerCase();
	var substr_num = substr.replace(/\D/g,'');
	
	//group 1 languages or to display today,tomorrow
	if(app_language_group == 1 || !substr_num){
		var optionsFinal = [];

		//if only letters, then TT + months
		if(!substr_num){
			optionsFinal = optionsTT.concat(optionsMonths);
		}
		else if(substr_num < 32){// && (!substr_char.length || !$.isNumeric(substr.slice(-1)))){
		//if numbers are within range and either no char or last letter is char
			optionsFinal = optionsMonths;
		}

		$.each(optionsFinal, function(i, fullStr){
			var monthIndex = null;
			var pinyin = '';
			if(app_language_short == 'zh-chs'){
				pinyin = Pinyin.GetQP(fullStr);
				fullStr = burgerN.ChineseNumberConverter(fullStr);
				monthIndex = parseInt(fullStr,10);
				if($.isNumeric(monthIndex)){ monthIndex -= 1; }
			}

			if((fullStr.toLowerCase()).indexOf(substr_char) != -1 || pinyin.indexOf(substr_char) != -1){
				//months only selections, and the number exceeds the corresponding month's max days
				if(optionsFinal.length == 12 && substr_num){
					if(substr_num > burgerN.monthsArrayObj[i].maxDays){
						return;
					}
				}

				var optionObj = {};
				if(optionsTT.indexOf(fullStr) != -1){
					if(i == 0){//today
						optionObj.val = new wrapper_date().getEndofDay(); //end of day today
					}
					else if(i == 1){//tomorrow
						optionObj.val = new wrapper_date().getEndofDay() + 86400; //end of day tomorrow
					}
				}
				else{
					if(!monthIndex){
						monthIndex = optionsMonths.indexOf(fullStr);
					}
					if(monthIndex != -1 && monthIndex < 12){
						optionObj.val = burgerN.monthsArrayObj[monthIndex].getDuedateTimestamp(substr_num);
					}
				}

				if(substr_num.length){
					optionObj.text = substr.replace(substr_char,fullStr);
				}
				else{
					optionObj.text = fullStr;
				}
				
				dateList.push(optionObj);
			}
		});
	}//end of app_language_group == 1
	else if(app_language_group == 2){
		var	i_symMonth = -1;
		var i_symDay = -1;
		var num_Month = '';
		var num_Day = '';
		var num_array = '';
	
		//alternative for pinyin
		if(app_language_short == 'zh-chs'){
			i_symMonth = substr.indexOf('yue');
			i_symDay = substr.indexOf('ri');
			if(i_symDay==-1){
				i_symDay = substr.indexOf('hao');
			}
			if(i_symDay==-1){
				i_symDay = substr.indexOf('号');
			}

		}

		if(i_symMonth==-1){
			i_symMonth = substr.indexOf(app_language_month);
		}
		if(i_symDay==-1){
			i_symDay = substr.indexOf(app_language_day);
		}
		
		num_array = substr.match(/(\d+)/g);
		$.each(num_array, function(i,val){
			//if no month or day is given, return
			if(i_symMonth == i_symDay){ return; }
			if(i == 0){
				if( (i_symMonth!=-1 && i_symDay==-1) || (i_symMonth!=-1 && i_symMonth < i_symDay) ){
					num_Month = val;
				}
				else{
					num_Day = val;
				}
			}
			else if(i == 1){ 
				if(!num_Month.length){
					num_Month = val;
				}
				else{
					num_Day = val;
				}
				return false; 
			}
		});

		var currentMonth_i = new Date().getMonth();

		$.each(optionsMonths, function(i,fullMonth){

			//just number given, with no month or day specified
			//2 results, matching month or matching day with current month
			if(i_symMonth == i_symDay && num_array.length == 1){
				if(currentMonth_i == i){ //if today's month matches the given number
					num_Month = '';
					num_Day = num_array[0];
				}
				else if(num_array[0]-1 == i){ //if given number matches the month
					num_Month = (i+1).toString();
					num_Day = '';//Day will be undefined, which means end of the month
				}
				else{
					return;
				}
			}

			//return if month is specified and not matched
			if(num_Month.length && i != num_Month-1){ return; }
			//if month is not specified, date is specified, only show the current month
			if(!num_Month.length && currentMonth_i != i && num_Day.length ){ return; }
			
			var displayStr = '';
			if(num_Month.length){displayStr += num_Month + app_language_month;}
			if(num_Day.length){ displayStr += num_Day+app_language_day; }

			var optionObj = {
				text: displayStr,
				val: burgerN.monthsArrayObj[i].getDuedateTimestamp(num_Day),
			};

			dateList.push(optionObj);
		});

	}//end of app_language_group == 2

	return dateList;
}


burger_list.spaces = function(){

}


var burger_global_dropdown = {
	list: {
		/*	id_dropdown: instance,
			...
		*/
	},

	hide_all: function(){
		$.each(burger_global_dropdown.list, function(id, inst){
			if(typeof inst.hide == 'function'){
				inst.hide();
			}
			else if(typeof inst.destroy == 'function'){
				inst.destroy();
			}
			
		});
		burger_global_dropdown.list = {};
	},

	destroy_all: function(){
		$.each(burger_global_dropdown.list, function(id, inst){
			if(typeof inst.destroy == 'function'){
				inst.destroy();
			}
		});
		burger_global_dropdown.list = {};
	},
};
/*
	id: str
	type: str
	position: jquery elem or [left, top]
	submenu: bool
*/
var burger_dropdown = function(id, data, position, lineHeight, cb_create, cb_select, cb_destroy, focus_elem, flipped){
	if(!data || typeof cb_select != 'function'){ return false; }
	if(typeof submenu != 'boolean'){ var submenu = false; }
	if(!position){ var position = [0,0]; }
	else if(base_isElement(position) && !position instanceof $){ var position = $(position); }

	if(typeof lineHeight != 'number'){ var lineHeight = 0; }

	if(typeof cb_create != 'function'){ var cb_create = null; }
	if(typeof cb_select != 'function'){ var cb_select = null; }
	if(typeof cb_destroy != 'function'){ var cb_destroy = null; }

	if(focus_elem instanceof $){/*do nothing*/}
	else if(base_isElement(focus_elem)){ focus_elem = $(focus_elem); }
	else if(typeof focus_elem != 'boolean' && focus_elem && position instanceof $){ focus_elem = position; }
	else{ var focus_elem = null; } //default - focus goes to dropdown



	var that = this;

	//burger settings
	that.elem = null;
	that.data = data;
	that.md5id = md5(Math.random());
	that.id_dropdown = 'burger_dropdown_'+that.md5id;
	that.id_iscroll = 'burger_iscroll_'+that.md5id;
	that.iscroll = null; //iscroll instance
	that.time = 200;
	that.count_show = 5;
	that.count_total = 1000;
	that.width = 200;
	that.optionH = 50;
	that.i_current = 0;
	that.i_pre = false;

	that.lineHeight = lineHeight;

	that.cb_create = cb_create;
	that.cb_select = cb_select;
	that.cb_destroy = cb_destroy;

	that.submenu = submenu;
	that.hidden = false;
	that.destroyed = false;
	that.position = position;
	that.focus_elem = focus_elem;

	//left and top css values for the dropdown
	that.coord = {
		left: 0,
		top: 0,
		bottom: 0,
	};
	if(position instanceof $){
		var coord = position.offset();
		that.coord.left = coord.left;
		that.coord.top = coord.top + position.outerHeight();
	}
	else if(position.length == 2){
		that.coord.left = position[0];
		that.coord.top = position[1];
	}

	that.construct();
}

burger_dropdown.prototype.construct = function(){
	var that = this;
	that.build_elem();
	that.show();
	burger_global_dropdown.list[that.id_dropdown] = that;
}

burger_dropdown.prototype.build_elem = function(){
	var that = this;
	var elem_dropdown = null;
	elem_dropdown = that.build_elem_data();
	if(!that.focus_elem){ that.focus_elem = elem_dropdown; }

	elem_dropdown.css({
		position: 'absolute',
		left: that.coord.left,
		top: that.coord.top + that.lineHeight,
		//bottom: 200,
		//display: 'block',
	});
    elem_dropdown.attr('tabindex', 0).prop('id', that.id_dropdown);
    elem_dropdown.children('.overthrow').prop('id', that.id_iscroll);

    //for IE: prevent dropdown blur when clicked inside dropdown
    elem_dropdown.mousedown(function(event){
    	event.preventDefault();
	});


    that.focus_elem.on('blur.burger_dropdown', function(){
    	that.hide();
    });

    elem_dropdown.find('.burger_option').hover(function(){ //hoverin

    }, function(){ //hoverout

    });

    that.focus_elem.on('keydown.burger_dropdown', function(event){
    	var which = event.which;
    	if(which != 38 && which != 40 && which != 13){ return;	} //return if it is not 'arrow up' or 'arrow down' or 'enter'
    	event.preventDefault();
    	var elem_selected = null;


    	if(which == 13){ //enter
			elem_selected = elem_dropdown.find('.burger_option_selected').eq(0);
			if(!elem_selected.length){
				elem_selected = elem_dropdown.find('.burger_option').eq(0);
			}

			elem_selected.click();
    		return;
    	}


    	//arrow keys
    	if(typeof that.i_current == 'boolean' && !that.i_current){ //if no current selection, then i to 0
    		that.i_current = 0;
    	}
    	else{
    		if(event.which == 38){ //UP
    			that.i_current--;
    		}
    		else{ // DOWN
    			that.i_current++;
    		}

    		if(that.i_current < 0){
    			that.i_current = that.count_total -1;
    		}
    		else if(that.i_current >= that.count_total){
    			that.i_current = 0;
    		}

    		elem_dropdown.find('.burger_option').removeClass('burger_option_selected');
    	}
    	elem_selected = elem_dropdown.find('.burger_option').eq(that.i_current).addClass('burger_option_selected');
    	that.iscroll.scrollToElement(elem_selected.get(0));
    });

	elem_dropdown.appendTo('body');

	//if dropdown needs to be at the top
	var window_outerHeight = $(window).outerHeight();
	if( window_outerHeight <= that.coord.top + that.lineHeight + elem_dropdown.outerHeight() ){
		var bottom = window_outerHeight - that.coord.top;
		if(that.position instanceof $){
			bottom += that.position.outerHeight();
		}
		elem_dropdown.css({
			top: '',
			bottom: bottom,
		});
	}


	that.elem = elem_dropdown;
	return elem_dropdown;
}

burger_dropdown.prototype.build_elem_data = function(data){
	var that = this;
	if(!data){ var data = that.data; }

	if(that.elem){ var elem_dropdown = that.elem; elem_dropdown.find('.burger_option').recursiveRemove(0); }
	else{ var elem_dropdown = $('#-burger_dropdown').clone().prop('id',''); }

	var elem_dropdown_inner = elem_dropdown.find('[find=wrapper]');
	if(elem_dropdown_inner.children('.iscroll_sub_div').length){
		elem_dropdown_inner = elem_dropdown_inner.children('.iscroll_sub_div');
	}

	var elem_option = $('#-burger_option').clone().prop('id','');//.addClass('burger_option_users');

	//if there is no contacts to display
	if(data.length < 1){
		elem_option.find('[find=text]').html(Lincko.Translation.get('app', 2205, 'html'));/*no match*/
		elem_option.find('[find=image]').addClass('display_none');
		elem_dropdown_inner.append(elem_option);
		return elem_dropdown;
	}


	$.each(data, function(i, obj){
		var elem_option_clone = elem_option.clone();
		if(obj.text){
			elem_option_clone.find('[find=text]').text(obj.text);
		}
		if(obj.val){
			elem_option_clone.attr('val', obj.val);
			if(obj.val == 0 && obj.imgURL == false){ //LinckoBot icon
				obj.imgURL = app_application_icon_roboto.src;
			}
			else if(obj.val == 1 && obj.imgURL == false){ //Monkey King icon
				obj.imgURL = app_application_icon_monkeyking.src;
			}
		}
		if(obj.preSelect){
			elem_option_clone.addClass('burger_option_preSelect');
		}

		if(obj.imgIcon){
			elem_option_clone.find('[find=image]')
			.removeClass('icon-largerIndividual').addClass(obj.imgIcon);
		}

		if(obj.imgURL){
			elem_option_clone.find('[find=image]')
				//.removeClass('icon-SmallPersonaiconBlack')
				.removeClass('icon-largerIndividual')
				.css('background-image','url("'+obj.imgURL+'")');
		}
		else if(typeof obj.imgURL =='undefined'){
			elem_option_clone.find('[find=image]').addClass('display_none');
		}


		if(obj.latestProjects){
			elem_option_clone.attr('latestProjects', true);
		}
		if(obj.addClass){
			elem_option_clone.addClass(obj.addClass);
		}
		if(typeof that.cb_select == 'function'){
			elem_option_clone.click(obj, function(event){
				if(typeof event.data.onClick == 'function'){ event.data.onClick(); }
				else{ that.cb_select(event.data); }
				that.hide();
			});
		}

		elem_dropdown_inner.append(elem_option_clone);
	});

	that.count_total = data.length;

	elem_dropdown.css('width', that.width);

	if(data.length > that.count_show){
		elem_dropdown.css('height', that.optionH*that.count_show);
	}
	else{
		elem_dropdown.css('height', 'auto');
	}

	if(that.iscroll){
		that.iscroll.refresh();
	}
	else{
		elem_dropdown.find('[find=wrapper]').addClass('overthrow');
	}

	return elem_dropdown;
}

burger_dropdown.prototype.show = function(){
	var that = this;
	var elem_dropdown = that.elem;
	
	elem_dropdown.velocity("slideDown",{
		mobileHA: hasGood3Dsupport,
		duration: that.time,
		complete:function(){
			if(elem_dropdown.find('.overthrow')){
				wrapper_IScroll();
				that.iscroll = myIScrollList[that.id_iscroll];
			}
			that.focus_elem.focus();
		}
	});
}

burger_dropdown.prototype.hide = function(){
	var that = this;
	var elem_dropdown = that.elem;
	if(elem_dropdown){
		elem_dropdown.velocity('slideUp',{
			mobileHA: hasGood3Dsupport,
			duration: that.time,
			complete: function(){
				that.hidden = true;
				that.destroy();
			}
		});
	 }
}
burger_dropdown.prototype.destroy = function(){
	var that = this;
	that.destroyed = true;

	if(typeof that.cb_destroy == 'function'){ that.cb_destroy(); }

	//remove all attached event handlers with namespace .burger
	that.focus_elem.off('.burger_dropdown');

	that.elem.recursiveRemove();
	delete burger_global_dropdown.list[that.id_dropdown];
	delete this;
}


var burger_renderCalendar = function(id, defaultDate, fn_onSelect){
	var elem_datepicker = $('<div>');
	if(typeof id == 'strong'){ elem_datepicker.prop('id', id); }
	if(typeof defaultDate == 'number' && defaultDate < 1000000000){ defaultDate = defaultDate*1000; }
	else if(typeof defaultDate != 'number'){ var defaultDate = new Date().getTime(); }	
	
	if(typeof fn_onSelect != 'function'){ var fn_onSelect = function(){}; }

	var update_monthControl = function(month){
		setTimeout(function(month){
			var elem_next = elem_datepicker.find('.ui-datepicker-next');
			var elem_prev = elem_datepicker.find('.ui-datepicker-prev');
			elem_next.empty().append('<span class="icon-Forward"></span>'); //DONT USE .recursiveEmpty() HERE
			elem_prev.empty().append('<span class="icon-Forward fa-flip-horizontal"></span>'); //DONT USE .recursiveEmpty() HERE
		
			if(typeof month == 'number'){
				var month_next = month+1;
				if(month_next > 11){ month_next = 0; } //13th month is january
				var month_prev = month-1;
				if(month_prev < 0){ month_prev = 11; } //0th month is december

				var month_array_short = (new wrapper_date()).month_short;
				month_next = month_array_short[month_next];
				month_prev = month_array_short[month_prev];

				elem_next.prepend('<span find="text" class="font_sans_serif">'+month_next+'</span>');
				elem_prev.append('<span find="text" class="font_sans_serif">'+month_prev+'</span>');
			}
		}, 10, month);
	}

	elem_datepicker.datepicker(
	{
		//altFormat: "M d",
		//altField: elem_alt,
		dayNamesMin: burgerN.daysVeryShortArray,
		monthNames: burgerN.monthsArray,
		showOtherMonths: true,
		dateFormat: '@',
		gotoCurrent: true,
		minDate: 0,
		defaultDate: defaultDate.toString(),
		onChangeMonthYear: function(year, month, inst){ //this is called before the calendar is redrawn, use timeout
			update_monthControl(month-1);//to be used as index in array
		},
		onSelect: function(dateText, inst){
			update_monthControl(inst.selectedMonth-1);//to be used as index in array
			var timestamp = parseInt(dateText, 10)/1000 + 86399; //add 86399 to make it end of the day
			fn_onSelect(timestamp, elem_datepicker);
		},
	});
	elem_datepicker.find('.ui-datepicker-inline').addClass('burger_calendar');

	var elem_calendarPrepend = $('#-burger_calendar_prepend').clone().prop('id','burger_calendar_prepend');
	elem_calendarPrepend.find('[find=today_info]').html(Lincko.Translation.get('app', 3604, 'html', {date: new wrapper_date().display('date_medium_simple'),}));


	elem_datepicker.prepend(elem_calendarPrepend);
	update_monthControl(elem_datepicker.datepicker( "getDate" ).getMonth());

	var elem_prepend_today = elem_calendarPrepend.find('[find=today_btn]');
	var elem_prepend_tomorrow =  elem_calendarPrepend.find('[find=tomorrow_btn]');
	var elem_prepend_twoDays = elem_calendarPrepend.find('[find=twoDays_btn]');
	var elem_prepend_oneWeek = elem_calendarPrepend.find('[find=oneWeek_btn]');

	var prepend_select = function(elem_click){
		elem_datepicker.find('.burger_calendar_prepend_active').removeClass('burger_calendar_prepend_active');
		$(elem_click).addClass('burger_calendar_prepend_active');
		elem_datepicker.find('.ui-state-active').click();
	}

	elem_prepend_today.click(function(){
		elem_datepicker.datepicker('setDate',0);
		prepend_select(this);
	});
	elem_prepend_tomorrow.click(function(){
		elem_datepicker.datepicker('setDate',1);
		prepend_select(this);
	});
	elem_prepend_twoDays.click(function(){
		elem_datepicker.datepicker('setDate',2);
		prepend_select(this);
	});
	 elem_prepend_oneWeek.click(function(){
		elem_datepicker.datepicker('setDate',7);
		prepend_select(this);
	});

	var date = new wrapper_date(elem_datepicker.datepicker('getDate').getTime()/1000);
	if( date.happensSomeday(0) ){
		elem_prepend_today.addClass('burger_calendar_prepend_active');
	}
	else if( date.happensSomeday(1) ){
		elem_prepend_tomorrow.addClass('burger_calendar_prepend_active');
	}
	else if( date.happensSomeday(2) ){
		elem_prepend_twoDays.addClass('burger_calendar_prepend_active');
	}
	else if( date.happensSomeday(7) ){
		elem_prepend_oneWeek.addClass('burger_calendar_prepend_active');
	}

	return elem_datepicker;
}


 var burgerN = {
 	shortcut:{
 		user: '@',
 		date: '+',
 		dateAlt: '＋',
 	},
 	monthsArray: null,
	elem_dropdown: $('#-burger_dropdown').clone().prop('id',''),
	dropdownTime: 200,
	dropdownCount: 5,
	dropdownWidth: 200,
	optionHeight: 50,
	//doesnt work for <IE9
	placeCaretAt: function(index, elem){
		if(index < 0){ index = 0; }
		var caretPlaced = false;
		//ignore child
		var outerTextNode = elem.contents().filter(function(){ return this.nodeType == 3; });
		$.each(outerTextNode, function(i, val){
			if(index >= val.length){
				index = index - val.length;
			}
			else if(index < val.length){
				var el = elem;
				if(el instanceof $){ var el = el.get(0); }
				var range = document.createRange();
				var sel = window.getSelection();
				range.setStart(outerTextNode[i], index);
				range.collapse(true);
				sel.removeAllRanges();
				sel.addRange(range);
				caretPlaced = true;
				return false;
			}
		});
		
		if(!caretPlaced){
			burgerN.placeCaretAtEnd(elem, false);
		}
		elem.trigger('focus',{cancelBlur: true});
		//elem.focus();
		
	},
	createCaretPlacer: function(atStart) {
	    return function(el, triggerFocus) {
	    	if(el instanceof $){ el = el.get(0); }
	    	if(typeof triggerFocus == 'boolean' && triggerFocus){ el.focus(); }
	        
	        if (typeof window.getSelection != "undefined"
	                && typeof document.createRange != "undefined") {
	            var range = document.createRange();
	            range.selectNodeContents(el);
	            range.collapse(atStart);
	            var sel = window.getSelection();
	            sel.removeAllRanges();
	            sel.addRange(range);
	        } else if (typeof document.body.createTextRange != "undefined") {
	            var textRange = document.body.createTextRange();
	            textRange.moveToElementText(el);
	            textRange.collapse(atStart);
	            textRange.select();
	        }
	    };
	},
};
burgerN.placeCaretAtStart =  burgerN.createCaretPlacer(true);
burgerN.placeCaretAtEnd = burgerN.createCaretPlacer(false);

burgerN.todayStr = Lincko.Translation.get('app', 3302, 'pure').toLowerCase();//today
burgerN.tomorrowStr = Lincko.Translation.get('app', 3303, 'pure').toLowerCase();//tomorrow
burgerN.daysVeryShortArray = (new wrapper_date()).day_very_short;
burgerN.monthsArray = (new wrapper_date()).month;
burgerN.monthsArrayObj = [];
$.each(burgerN.monthsArray, function(i, month){
	var year = new Date().getFullYear();
	var monthStart = new Date(year, i, 1);
	var monthEnd = new Date(year, i + 1, 1);
	var monthLength = (monthEnd - monthStart) / (1000 * 60 * 60 * 24);

	var obj = {
		name: month,
		val: i+1,
	  	maxDays:monthLength,
	  	getDuedateTimestamp: function(date){
	  		if(!date || !date.length){ date = this.maxDays; }
	  		var currentYear = new Date().getFullYear();
	  		var timestamp = new Date(currentYear, this.val-1, date).setHours(23,59,59,0);
	  		//if needs to be next year
	  		if(timestamp < new Date()){
	  			timestamp = new Date(timestamp).setFullYear(currentYear+1);
	  		}
	  		return timestamp/1000;
	  	},
	};

	burgerN.monthsArrayObj.push(obj);
});
burgerN.ChineseNumberConverter = function(input){
	var single = {
		ling: 0, '〇': 0,
		yi: 1, '一': 1,
		er: 2, '二': 2,
		san: 3, '三': 3,
		si: 4, '四': 4,
		wu: 5, '五': 5,
		liu: 6, '六': 6,
		qi: 7, '七': 7,
		ba: 8, '八': 8,
		jiu: 9, '九': 9,
		shi: 10, '十': 10,
	}

	/*var numberObj1 = {
		ershi: 20, '二十': 20,
		sanshi: 30, '三十': 30,
		sishi: 40, '四十': 40,
		wushi: 50, '五十': 50,
		liushi: 60, '六十': 60,
		qishi: 70, '七十': 70,
		bashi: 80, '八十': 80,
		jiushi: 90, '九十': 90,
	}
	var numberObj2 = {
		ling: 0, '〇': 0,
		yi: 1, '一': 1,
		er: 2, '二': 2,
		san: 3, '三': 3,
		si: 4, '四': 4,
		wu: 5, '五': 5,
		liu: 6, '六': 6,
		qi: 7, '七': 7,
		ba: 8, '八': 8,
		jiu: 9, '九': 9,
		shi: 10, '十': 10,
	}*/

	var array = [];

	var start = 0;
	var pushed = false;
	var converted = false;
	while(start < input.length){
		for(var i=1;i < 5; i++){
			if(input.substr(start,i) in single){
				array.push(single[input.substr(start,i)]);
				pushed = true;
				converted = true;
				start += i;
				break;
			}
		}
		if(pushed){
			pushed = false;
		}
		else{
			array.push(input[start]);
			start++;
		}
		
	}
	if(!converted){ return input; }

	var result = '';
	var num = null;

	$.each(array, function(i, val){
		if($.isNumeric(val)){
			if(!num){ 
				num = val; 
			}
			else{
				if(num%10 != 0){ 
					num = num * val; 
				}
				else{ 
					num += val;
					result += num;
					num = null;
				}
				
			}
		}
		else{
			if(num){ result+=num; }
			result += val;
			num = null;
		}
	});
	if(num){ result += num; }

	return result;


	$.each(numberObj1, function(key,val){
		if(input.indexOf(key) != -1){
			input = input.replace(key,val);
		}
	});
	$.each(numberObj2, function(key,val){
		if(input.indexOf(key) != -1){
			input = input.replace(key,val);
		}
	});

	/*if(input.indexOf('shi') != -1){ input = input.replace('shi',10); }
	if(input.indexOf('十') != -1){ input = input.replace('十',10); }*/

	return input;

}

var burger_parseHTML = function(elem){
	if(!elem){ return false; }
	else if(!elem instanceof $){
		var elem = $(elem);
	}

	var parsedData = {
		text: null,
		userid: null, //@
		timestamp: null, //++
	}

	//get text
	parsedData.text = $.trim(elem.contents().filter(function() {
	  return this.nodeType == 3;
	}).text());

	//get userid
	parsedData.userid = elem.find('[userid]').eq(0).attr('userid');

	//get date
	var timestamp = elem.find('[find=dateWrapper]').eq(0).attr('val');
	if(timestamp){
		parsedData.timestamp = parseInt(timestamp, 10);
	}
	

	return parsedData;

}

burgerN.typeTask = function(projectID, skylistInst, dropdownOffset){
	if(!projectID){
		projectID = app_content_menu.projects_id;
	}
	if(typeof dropdownOffset != 'number'){ dropdownOffset = null; }
	var defaultDuration = 86400; //seconds
	

	var elem_typeTask = $('#-burger_typeTask').clone().prop('id','');
	var elem_typingArea = elem_typeTask.find('[find=text]');


	var defaultPhrase = Lincko.Translation.get('app', 2204, 'html'); //type here to add a task
	elem_typingArea.text(defaultPhrase);

	//use cancelBlur to control unwanted 'blur'
	var cancelBlur = false;
	elem_typingArea.focus(function(event, param){
		if(typeof param == 'object' && param.cancelBlur){ cancelBlur = true; }

		$(this).closest('[find=toggleOpacity]').removeClass('burger_typeTask_opacity');
		if($(this).html() == defaultPhrase){
			$(this).text('');
			burgerN.placeCaretAtEnd($(this));
		}
	});
	elem_typingArea.blur(function(event){
		if(cancelBlur){
			event.preventDefault();
			cancelBlur = false;
			return;
		}
		$(this).closest('[find=toggleOpacity]').addClass('burger_typeTask_opacity');
		if($(this).html() == ''){
			$(this).html(defaultPhrase);
		}
	});

	var param= {};
	var elem_userid = elem_typeTask.find('input[find=userid]');
	param.elem_input = elem_userid;
	param.projectID = projectID;
	param.dropdownOffset = dropdownOffset;
	//disable '@' for burgerN.regex if its personal space
	param.disable_shortcutUser = Lincko.storage.get('projects', projectID, 'personal_private');

	param.enter_fn = function(event, burger_keyboard){
		event.preventDefault();
		var parsedData = burger_keyboard.getBurgerData();
		var title = parsedData.text;
		if(!title.length){ return false; }

		var tempID = null;
		var param = {
			title: title,
			parent_id: projectID,
		}


		//default not assigned
		var in_charge_id = null;
		if(parsedData.userid){
			in_charge_id = parsedData.userid;
		}
		if(Lincko.storage.get('projects', projectID, 'personal_private')){
		//if project is personal, default to self
			in_charge_id = wrapper_localstorage.uid;
		}
		else if(skylistInst && skylistInst.Lincko_itemsList_filter && skylistInst.Lincko_itemsList_filter.people){
		//default to current filtered person, if any
			in_charge_id = skylistInst.Lincko_itemsList_filter.people;
		}


		//set in charge if not unassigned
		if(in_charge_id){
			param['users>in_charge'] = {};
			param['users>in_charge'][in_charge_id] = true;
		}

		//date logic
		var duration = defaultDuration;
		var time_now = new wrapper_date();
		var timestamp = parsedData.timestamp;
		if(typeof timestamp != 'number' && typeof timestamp != 'string' 
			&& skylistInst 
			&& skylistInst.Lincko_itemsList_filter 
			&& skylistInst.Lincko_itemsList_filter.duedate 
			&& skylistInst.Lincko_itemsList_filter.duedate == 0 ){ //if no burger time, and filter is set to today, then make it due end of today
			duration = time_now.getEndofDay() - time_now.timestamp;
		}
		else if(timestamp == 0){
			duration = time_now.getEndofDay() - time_now.timestamp;
		}
		else if(timestamp == 1){
			//do nothing, use DefaultDuration and also dont follow filter
		}
		else if(timestamp){ //val == due date timestamp in seconds
			duration = timestamp - time_now.timestamp;
		}

		param.start =  time_now.timestamp;
		if(duration){
			param.duration = duration;
		}

		var item = {
			'+title': title,
			'_parent': ['projects', projectID],
			'_perm': Lincko.storage.get('projects',projectID, '_perm'),
			'_type': 'tasks',
			'_users': {},
			'created_at':time_now.timestamp,
			'start': time_now.timestamp,
			'duration': duration,
			'updated_by': wrapper_localstorage.uid,
			'updated_at': time_now.timestamp,
			'new': true,
		}
		item['_users'][in_charge_id] = {
			approver: true,
			in_charge: true,
		}

		if(skylistInst.Lincko_itemsList_filter.view == 'paper'){
			item.paperView = true;
		}
		

		function getRandomInt(min, max) {
		    return Math.floor(Math.random() * (max - min + 1)) + min;
		}

		var fakeID = getRandomInt(100000000000,999999999999);
		var cb_begin = function(jqXHR, settings, temp_id){
			tempID = temp_id;
			item['temp_id'] = temp_id;
			item['_id'] = fakeID;
			item['fake'] = true;
			Lincko.storage.data.tasks[fakeID] = item;
			if(!('_children' in Lincko.storage.data.projects[projectID])){
				Lincko.storage.data.projects[projectID]['_children'] = {};
			}
			if(!('tasks' in Lincko.storage.data.projects[projectID]['_children'])){
				Lincko.storage.data.projects[projectID]['_children']['tasks'] = {};
			}
			Lincko.storage.data.projects[projectID]['_children']['tasks'][fakeID] = true;
			app_application_lincko.prepare('projects_'+projectID, true);
			skylist.sendActionQueue.tasks[temp_id] = [];
		}

		var cb_success = function(){
			skylist.sendActionQueue.tasks.run(tempID);
		}	

		var cb_error = function(){
			delete skylist.sendActionQueue.tasks[tempID];
		}

		var cb_complete = function(){
			app_application_lincko.prepare('projects_'+projectID, true);
			var fakeTask = Lincko.storage.get('tasks',fakeID);
			if(fakeTask){
				delete Lincko.storage.data.tasks[fakeID];
			}
		}

		wrapper_sendAction(param, 'post', 'task/create', cb_success, null, cb_begin, cb_complete);

		elem_typingArea.html('');
		elem_typingArea.focus();
	}



	var shortcuts = {at: true, plus: true };
	//disable @ shortcut for personal space
	if(Lincko.storage.get('projects', app_content_menu.projects_id, 'personal_private')){
		delete shortcuts.at;
	}
	var burgerInst = new burger_keyboard(elem_typingArea, null/*lineHeight*/, shortcuts, null, param.enter_fn);
	//burgerN.regex(elem_typingArea, null, param);

	return elem_typeTask;
}





burgerN.destroy = function(elem_dropdown){
	var duration = burgerN.dropdownTime;
	if(elem_dropdown){
		elem_dropdown.velocity('slideUp',{
			mobileHA: hasGood3Dsupport,
			duration: duration,
			complete: function(){
				elem_dropdown.recursiveRemove();
			}
		});
	 }
}

burgerN.slideDown = function(elem_dropdown){
	//elem_dropdown css bottom must be defined for the 'reverse' slideDown to work
	var that = this;
	var top = parseInt(elem_dropdown.css('top'),10);
	//if( top+that.optionHeight*elem_dropdown.find('.burger_option_users').length > $(window).height() ){
	if( top+that.optionHeight*that.dropdownCount > $(window).height() ){
		elem_dropdown.css('top','');
	}
	else{
		elem_dropdown.css('bottom','');
	}
	
	elem_dropdown.velocity("slideDown",{
		mobileHA: hasGood3Dsupport,
		duration: that.dropdownTime,
		complete:function(){
			if(elem_dropdown.find('.overthrow')){
				wrapper_IScroll();
			}
		}
	});
}


/* burgerN.regex param
	param.elem_input
	param.projectID
	param.dropdownOffset
	param.disable_shortcutUser
	param.enter_fn
	param.enter_fn_param
	param.dropdownOffset
	param.shiftEnter
*/
burgerN.regex = function(elem, item, param){
	var that = this;
	if(!item){
		item = {};
		item['_id'] = 'new';
	}
	var elem_dropdown = null;
	var burger_str = "";
	var burger_type = null;
	var elem_burger_tag = $('#-burger_tag').clone().prop('id','');
	var latestChar_prev = null; //updated at the end of every keyup
	var burger_startIndex = null;
	var caretIndex = null;
	var currentMode = null; //'@' or '++'

	var destroy = function(){
		burgerN.destroy(elem_dropdown);
		elem_dropdown = null;
		burger_str = "";
		burger_startIndex = null;
		currentMode = null;
		latestChar_prev = null;
	}

	var contactsID_obj = {};
	var userClick_fn = function(userid){
		if(typeof userid != 'string' && typeof userid != 'number' ){ userid = $(this).attr('userid'); }
		var username = Lincko.storage.get('users',userid,'username');
		var caretIndex_new = caretIndex;

		var textLength = elem.text().length;
		//remove other @user spans
		if(username){
			elem.find('span[userid]').recursiveRemove();
		}
		//adjust for deleted spans
		caretIndex_new -= textLength - elem.text().length;

		//dont touch any text inside child DOM (e.g. <span>)
		var outerTextNode = elem.contents().filter(function(){ return this.nodeType == 3; });
		//if there are spans in the middle, outerTextNode is divied up, so must loop
		$.each(outerTextNode, function(key,str2){
			var str = that.shortcut.user+burger_str;
			if((str2.data).indexOf(str) != -1){
			    $(outerTextNode[key]).replaceWith($(outerTextNode[key]).text().replace(that.shortcut.user+burger_str, '<span find="name" userid="'+userid+'" contenteditable="false" class="burger_tag">'+username+'</span> '));
			    return false;
			}
		});

		if(param && param.elem_input){
			param.elem_input.val(userid);
		}
		else{
			//burger_contacts_sendAction(contactsID_obj, [userid], item, true);
		}
		destroy();
		burgerN.placeCaretAt(caretIndex_new-(that.shortcut.user+burger_str).length, elem);
	}//end of userClick_fn

	var dateClick_fn = function(dateType, dateVal, timestamp){
		if(typeof dateType != 'string' && typeof dateType != 'number' ){ dateType = $(this).attr('dateType'); }
		if(typeof dateVal != 'string' && typeof dateVal != 'number' ){ dateVal = $(this).attr('dateVal'); }
		if(typeof timestamp != 'string' && typeof timestamp != 'number' ){ timestamp = $(this).attr('timestamp'); }
		var finalStr = '';
		var finalVal = null;
		if(dateType == 'TT'){
			if(dateVal == 0){
				finalStr = that.todayStr;
			}
			else if(dateVal == 1){
				finalStr = that.tomorrowStr;
			}
			finalVal = dateVal;
		}
		else{
			finalVal = timestamp;
			var dateInst_temp  = new wrapper_date(finalVal);
			if(dateInst_temp.happensSomeday(0)){
				finalStr = that.todayStr;
			}
			else if(dateInst_temp.happensSomeday(1)){
				finalStr = that.tomorrowStr;
			}
			else{
				finalStr = dateInst_temp.display('date_very_short');
			}
		}

		var caretIndex_new = caretIndex;

		var textLength = elem.text().length;
		elem.find('span[find=dateWrapper]').recursiveRemove();
		//adjust for deleted spans
		caretIndex_new -= textLength - elem.text().length;

		//dont touch any text inside child DOM (e.g. <span>)
		var outerTextNode = elem.contents().filter(function(){ return this.nodeType == 3; });
		//if there are spans in the middle, outerTextNode is divied up, so must loop
		$.each(outerTextNode, function(key,str2){
			var str = that.shortcut.date+burger_str;
			var strAlt = that.shortcut.dateAlt+burger_str;
			var shortcut = that.shortcut.date;
			if((str2.data).indexOf(strAlt) != -1){
				shortcut = that.shortcut.dateAlt;
			}

			if((str2.data).indexOf(str) != -1 || (str2.data).indexOf(strAlt) != -1){
			    $(outerTextNode[key]).replaceWith($(outerTextNode[key]).text().replace(shortcut+burger_str, '<span find="dateWrapper" val="'+finalVal+'" contenteditable="false" class="burger_tag">'+finalStr+'</span> '));
			    return false;
			}
		});



		burgerN.placeCaretAt(caretIndex_new-(that.shortcut.date+burger_str).length, elem);
		destroy();
	}//end of dateClick_fn


	//tab to go to next focusable element happens at keydown
	elem.on('keydown', function(event){
		if((event.which || event.keyCode) == 9){ //if tab is pressed
			event.preventDefault();
		}
	});

	//adding linebreak happens on keypress, not on keyup
	elem.keypress(function(event){
		if((event.which || event.keyCode) == 13){ //if enter is pressed
			if(param.shiftEnter && event.shiftKey){
				event.returnValue=false;
				return;
			}	
			else{
				event.preventDefault();
			}
		}
	});

	elem.keyup(function(event){
		var selection = getSelection();
	    var focus_node = selection.focusNode;
	    focus_node.normalize();
	    var latestChar = null;
	    var latestCharAlt = null;
	    if(focus_node.nodeValue){ latestCharAlt = (focus_node.nodeValue).slice(-1); }
	    //console.log('latestChar:', latestChar);

	    var coord = burger_regex_getCaretOffset(elem, true);
	    coord.y = coord.y + 27; //offset by height of a single line of text
	    /* possible alternative to hardcode offset
	    //http://stackoverflow.com/questions/1185151/how-to-determine-a-line-height-using-javascript-jquery
	    //1.5 of font-size is typical for lineheight
	    var fontSize = $(el).css('font-size');
		var lineHeight = Math.floor(parseInt(fontSize.replace('px','')) * 1.5);
		*/

	    caretIndex = coord.caretOffset;
	  	var currentText = elem.text();
	  	latestChar = currentText[caretIndex - 1];
	  	if(caretIndex > 0){
	  		latestChar_prev = currentText[caretIndex - 2];
	  	}
	  	else{
	  		latestChar_prev = null;
	  	}

	  	//sometimes, for some input methods, focus_node.nodeValue reflects the latest typed characters
	  	if(latestChar == latestChar_prev  && latestCharAlt != latestChar_prev ){ 
	  		latestChar = latestCharAlt; 
	  		if((focus_node.nodeValue).length > 1){
	  			latestChar_prev = ((focus_node.nodeValue).slice(-2))[0];
	  		}
	  		else{
	  			latestChar_prev = null;
	  		}
	  	}

	    /*For Chinese only, when inputting pinyin:
	      if waiting for combined character (229) but latestChar is not Chinese, return and act on next keyup*/
	    if(latestChar && event.which == 229 && !latestChar.match(/[\u4E00-\u9FA5]/) && !responsive.test("maxMobileL")){ 
	    	latestChar_prev = latestChar;
	    	return; 
	    }

		/*dont take action for shift keys*/
		//if(event.which == 16){ return; }

	    if( elem_dropdown ){
			if( (event.which == 32 && !latestChar.replace(/\s/g, '').length) || caretIndex < burger_startIndex ){//if 'space' or caret is moved behind the burger_startIndex
				destroy();
				return;
			}
			if((event.which || event.keyCode) == 13 || (event.which || event.keyCode) == 9){ //if enter or tab is pressed
				event.preventDefault();
				var elem_options = elem_dropdown.find('.burger_option');
				if(elem_options.length){
					$(elem_options[0]).mousedown();
					return;
					if(currentMode == that.shortcut.user){
						//userClick_fn($(elem_options[0]).attr('userid'));
						return;
					}
					else if(currentMode == that.shortcut.date){
						//dateClick_fn($(elem_options[0]).attr('dateType'), $(elem_options[0]).attr('dateVal'));
						return;
					}
				}
			}
			elem_dropdown.recursiveEmpty();
			burger_str = elem.text().substring(burger_startIndex, burger_regex_getCaretOffset(elem).caretOffset);

			if(currentMode == that.shortcut.user){
				var search_result = Lincko.storage.search('word',burger_str,'users')['users'];
				var contactsID_obj_search = {};
				if(typeof search_result == 'object'){
					search_result = Object.keys(search_result);
					$.each(contactsID_obj, function(key,val){
						if( $.inArray(key,search_result) > -1){
							contactsID_obj_search[key] = contactsID_obj[key];
						}
					});
				}

				//elem_dropdown.recursiveEmpty().html(burgerN.draw_contacts(contactsID_obj_search, userClick_fn).children());

				var elem_dropdown_new = burgerN.draw_contacts(contactsID_obj_search, userClick_fn);
				elem_dropdown.recursiveEmpty().html(elem_dropdown_new.children());
				var elem_height = elem_dropdown_new.height();
				if(elem_height){
					elem_dropdown.height(elem_height);
				}
				else{
					elem_dropdown.height('');
				}
				wrapper_IScroll();
			}
			else if(currentMode == that.shortcut.date || currentMode == that.shortcut.dateAlt){
				//elem_dropdown.recursiveEmpty().html(burgerN.draw_dates(burger_str, dateClick_fn).children());

				var elem_dropdown_new = burgerN.draw_dates(burger_str, dateClick_fn);
				elem_dropdown.recursiveEmpty().html(elem_dropdown_new.children());
				var elem_height = elem_dropdown_new.height();
				if(elem_height){
					elem_dropdown.height(elem_height);
				}
				else{
					elem_dropdown.height('');
				}
				wrapper_IScroll();
			}
		}
		else if( latestChar == that.shortcut.user /* @ */ && (!param || !param.disable_shortcutUser)){

			//used for burger dropdown as well as the mobile submenu
			contactsID_obj = burgerN.generate_contacts(Lincko.storage.get(item['_type'], item['_id']));

			//for mobile
			if(responsive.test("maxMobileL")){
				if(!submenu_get('burger_contacts_typeTask')){
					var param_submenu = {};
					param_submenu.elem_typeTask = elem;
					param_submenu.selectOne = true;
					param_submenu.item_obj = item;
					param_submenu.contactsID = contactsID_obj;
					param_submenu.alwaysMe = false;
					param_submenu.userClick_fn = userClick_fn;
					submenu_Build('burger_contacts_typeTask', true, null, param_submenu);
					//elem.attr('contenteditable',false);
				}
				return;
			}

			currentMode = that.shortcut.user;
	    	burger_startIndex = caretIndex;
	    	var dropdownOffset = elem.outerHeight();
	    	if(param && typeof param.dropdownOffset == 'number'){
	    		dropdownOffset = param.dropdownOffset;
	    	}
			elem_dropdown = burgerN.draw_contacts(contactsID_obj, userClick_fn)
				.css({
					'top':coord.y, 
					'left':coord.x, 
					'bottom':$(window).height()-coord.y + dropdownOffset,
				});

			$('body').append(elem_dropdown);
			//$('#app_content_dynamic_sub').append(elem_dropdown);
			that.slideDown(elem_dropdown);
		}
		else if(/* latestChar_prev+*/latestChar == that.shortcut.date /* ++ */ || /*latestChar_prev+*/latestChar == that.shortcut.dateAlt){

			//for mobile
			if(responsive.test("maxMobileL")){
				if(!submenu_get('burger_calendar_typeTask')){
					var param_submenu = {};
					param_submenu.elem_typeTask = elem;
					param_submenu.dateClick_fn = dateClick_fn;
					submenu_Build('burger_calendar_typeTask', true, null, param_submenu);
					//elem.attr('contenteditable',false);
				}
				return;
			}



			currentMode = that.shortcut.date;
			burger_startIndex = caretIndex;
			var dropdownOffset = elem.outerHeight();
	    	if(param && typeof param.dropdownOffset == 'number'){
	    		dropdownOffset = param.dropdownOffset;
	    	}
			elem_dropdown = burgerN.draw_dates(burger_str, dateClick_fn)
				.css({
					'top':coord.y, 
					'left':coord.x, 
					'bottom':$(window).height()-coord.y + dropdownOffset,
				});

			$('body').append(elem_dropdown);
			//$('#app_content_dynamic_sub').append(elem_dropdown);
			that.slideDown(elem_dropdown);
		}
		else if((event.which || event.keyCode) == 13 ){ //if enter is pressed
			if(param /*&& param.elem_input*/ && typeof param.enter_fn == 'function'){
				var parsedData = burger_parseHTML(elem);

				if(param.enter_fn_param){
					param.enter_fn(parsedData, param.enter_fn_param);
				}
				else{
					param.enter_fn(parsedData);
				}
			}
			else{
				elem.blur();
			}
		}

	});

	elem.click(function(){
		var click_caret = burger_regex_getCaretOffset(elem).caretOffset;
		//if clicked outside the range between start and end carret, destroy dropdown
		if(elem_dropdown && (click_caret < burger_startIndex || click_caret > caretIndex)){
			destroy();
		}
	});

	elem.focusout(function(){
		destroy();
	});
}


burgerN.draw_projects = function(projects,option_fn){
	var that = this;
	var elem_dropdown = burgerN.elem_dropdown.clone();
	var elem_option = $('#-burger_option').clone().prop('id','').addClass('burger_option_users');
	var elem_option_clone;

	var latest_projects = [];
	if(Lincko.storage.getSettings().latestvisitProjects){
		$.each(Lincko.storage.getSettings().latestvisitProjects, function(i, id){
			var project = Lincko.storage.get('projects',id);
			if(!project || project.personal_private){ return; }
			else{
				latest_projects.push(project);
			}
		});
	}

	latest_projects.unshift(Lincko.storage.getMyPlaceholder());

	$.each(latest_projects, function(i, project){
		elem_option_clone = elem_option.clone().attr('projects_id',project['_id']);
		elem_option_clone.addClass('burger_latestvisitProjects');
		if(i == latest_projects.length-1){
			elem_option_clone.addClass('burger_latestvisitProjects_border');
		}
		elem_option_clone.find('[find=image]').addClass('display_none');
		
		if(project.personal_private){
			elem_option_clone.find('[find=text]').html(Lincko.Translation.get('app', 2502, 'html')); //Personal Space)
		}
		else{
			elem_option_clone.find('[find=text]').html(project['+title']);
		}

		elem_dropdown.find('[find=wrapper]').append(elem_option_clone);
		if(typeof option_fn == 'function' ){
			elem_option_clone.on('mousedown', option_fn);
		}
	});

	$.each(projects, function(i, project){
		//return if it is one of the latest
		if($.inArray(project['_id'], Lincko.storage.getSettings().latestvisitProjects) > -1 ){ return; }

		elem_option_clone = elem_option.clone().attr('projects_id',project['_id']);
		elem_option_clone.find('[find=image]').addClass('display_none');
		elem_option_clone.find('[find=text]').html(project['+title']);
		elem_dropdown.find('[find=wrapper]').append(elem_option_clone);
		if(typeof option_fn == 'function' ){
			elem_option_clone.on('mousedown', option_fn);
		}
	});
	if(projects.length > that.dropdownCount){
		elem_dropdown.css({'height': that.optionHeight*that.dropdownCount, 'width': that.dropdownWidth});
		elem_dropdown.find('[find=wrapper]').addClass('overthrow');
	}
	return elem_dropdown;
}

burgerN.assignProject = function(elem, item){
	var that = this;
	var burger_destroy = burgerN.destroy;
	var elem_dropdown = null;
	var dropdown_duration = burgerN.dropdownTime;

	var route = null;
	if(item['_type'] == 'tasks'){
		route = 'task/update';
	}
	else if(item['_type'] == 'notes'){
		route = 'note/update';
	}
	else if(item['_type'] == 'files'){
		route = 'file/update';
	}

	elem.click(function(event){
		elem.focus();
		event.stopPropagation();
		if( elem_dropdown ){
			burger_destroy(elem_dropdown);
			elem_dropdown = null;
		}
		else{
            var projects_list = Lincko.storage.list('projects', null, {personal_private: ['==',null]}, null, null, false);
           	projects_list = Lincko.storage.sort_items(projects_list,'+title');
			//use the submenu for mobile
			if(responsive.test("maxMobileL")){
				submenu_Build('burger_projects', true, false, { input:elem, projects_list: projects_list, item: item });
				return false;
			}

			var userClick_fn = function(){
				var projects_id = $(this).attr('projects_id'); 
                if(elem.val() == projects_id){
                    return;
                }
                else{
                    elem.val(projects_id);
                }
				elem.change();
				if(!item['_id'] || item['_id'] == 'new'){
					return;
				}
				var param = {
					id: item['_id'],
					parent_id: projects_id,
				}
				if(item['_type'] == 'tasks'){
					param['users>in_charge'] = taskdetail_tools.taskUserCheck(item, 'projects', projects_id).users_incharge;
					skylist.sendAction.tasks(param,item,route);
				}
				else{
					wrapper_sendAction(param, 'post', route);
				}
				
			}

			elem_dropdown = burgerN.draw_projects(projects_list, userClick_fn);
			elem_dropdown.appendTo('#app_application_main');

			var coord = $(this).offset();
			var coordP = $(this).position();
			var left = coord.left;
			if(left == 0){ 
				left = coord.left;
				if( responsive.test("minTablet")){
					left -= $('#app_content_menu').outerWidth();
					if( $('#app_application_project').outerWidth() > 0){
						left -= $('#app_application_project').outerWidth();
					}
				}
			};
			var table_height = $(this).closest('table').outerHeight();
			var top = coord.top + table_height; //- $('#app_content_top').outerHeight();
			var bottom = $(window).height() - top + table_height +3/*some padding*/;
			
			elem_dropdown.css({
				position: 'absolute',
				left: left,
				top: top,
				bottom: bottom,
			});
			that.slideDown(elem_dropdown);
		}
	});
	elem.blur(function(){
		burger_destroy(elem_dropdown);
		elem_dropdown = null;
	});
}

burgerN.draw_dates = function(substr, option_fn){
	var that = this;
	var elem_dropdown = burgerN.elem_dropdown.clone();
	var elem_option = $('#-burger_option').clone().prop('id','');//.addClass('burger_option_users');
	var elem_option_clone;

	//for chinese, convert chinese character and pinyin to numbers
	if(app_language_short == 'zh-chs'){
		substr = burgerN.ChineseNumberConverter(substr);
	}


	var optionsMonths = burgerN.monthsArray;
	var optionsTT = [that.todayStr, that.tomorrowStr];
	
	var substr_char = substr.replace(/\d/g,'').toLowerCase();
	var substr_num = substr.replace(/\D/g,'');
	
	//group 1 languages or to display today,tomorrow
	if(app_language_group == 1 || !substr_num){
		var optionsFinal = [];

		//if only letters, then TT + months
		if(!substr_num){
			optionsFinal = optionsTT.concat(optionsMonths);
		}
		else if(substr_num < 32){// && (!substr_char.length || !$.isNumeric(substr.slice(-1)))){
		//if numbers are within range and either no char or last letter is char
			optionsFinal = optionsMonths;
		}

		$.each(optionsFinal, function(i, fullStr){
			var monthIndex = null;
			var pinyin = '';
			if(app_language_short == 'zh-chs'){
				pinyin = Pinyin.GetQP(fullStr);
				fullStr = burgerN.ChineseNumberConverter(fullStr);
				monthIndex = parseInt(fullStr,10);
				if($.isNumeric(monthIndex)){ monthIndex -= 1; }
			}

			if((fullStr.toLowerCase()).indexOf(substr_char) != -1 || pinyin.indexOf(substr_char) != -1){
				//months only selections, and the number exceeds the corresponding month's max days
				if(optionsFinal.length == 12 && substr_num){
					if(substr_num > burgerN.monthsArrayObj[i].maxDays){
						return;
					}
				}
				elem_option_clone = elem_option.clone();
				if(optionsTT.indexOf(fullStr) != -1){
					elem_option_clone.attr('dateType','TT').attr('dateVal', i);
				}
				else{
					if(!monthIndex){
						monthIndex = optionsMonths.indexOf(fullStr);
					}
					if(monthIndex != -1 && monthIndex < 12){
						elem_option_clone.attr('timestamp', burgerN.monthsArrayObj[monthIndex].getDuedateTimestamp(substr_num));
					}
				}

				if(substr_num.length){
					elem_option_clone.find('[find=text]').html(substr.replace(substr_char,fullStr));
				}
				else{
					elem_option_clone.find('[find=text]').html(fullStr);
				}
				
				elem_option_clone.find('[find=image]').addClass('display_none');

				if(typeof option_fn == 'function' ){
					elem_option_clone.on('mousedown', option_fn);
				}
				elem_dropdown.find('[find=wrapper]').append(elem_option_clone);
			}
		});
	}//end of app_language_group == 1
	else if(app_language_group == 2){
		var	i_symMonth = -1;
		var i_symDay = -1;
		var num_Month = '';
		var num_Day = '';
		var num_array = '';
	
		//alternative for pinyin
		if(app_language_short == 'zh-chs'){
			i_symMonth = substr.indexOf('yue');
			i_symDay = substr.indexOf('ri');
			if(i_symDay==-1){
				i_symDay = substr.indexOf('hao');
			}
			if(i_symDay==-1){
				i_symDay = substr.indexOf('号');
			}

		}

		if(i_symMonth==-1){
			i_symMonth = substr.indexOf(app_language_month);
		}
		if(i_symDay==-1){
			i_symDay = substr.indexOf(app_language_day);
		}
		
		num_array = substr.match(/(\d+)/g);
		$.each(num_array, function(i,val){
			//if no month or day is given, return
			if(i_symMonth == i_symDay){ return; }
			if(i == 0){
				if( (i_symMonth!=-1 && i_symDay==-1) || (i_symMonth!=-1 && i_symMonth < i_symDay) ){
					num_Month = val;
				}
				else{
					num_Day = val;
				}
			}
			else if(i == 1){ 
				if(!num_Month.length){
					num_Month = val;
				}
				else{
					num_Day = val;
				}
				return false; 
			}
		});

		var currentMonth_i = new Date().getMonth();

		$.each(optionsMonths, function(i,fullMonth){

			//just number given, with no month or day specified
			//2 results, matching month or matching day with current month
			if(i_symMonth == i_symDay && num_array.length == 1){
				if(currentMonth_i == i){ //if today's month matches the given number
					num_Month = '';
					num_Day = num_array[0];
				}
				else if(num_array[0]-1 == i){ //if given number matches the month
					num_Month = (i+1).toString();
					num_Day = '';//Day will be undefined, which means end of the month
				}
				else{
					return;
				}
			}

			//return if month is specified and not matched
			if(num_Month.length && i != num_Month-1){ return; }
			//if month is not specified, date is specified, only show the current month
			if(!num_Month.length && currentMonth_i != i && num_Day.length ){ return; }
			
			var displayStr = '';
			if(num_Month.length){displayStr += num_Month + app_language_month;}
			if(num_Day.length){ displayStr += num_Day+app_language_day; }

			elem_option_clone = elem_option.clone();
			elem_option_clone.find('[find=text]').html(displayStr);
			elem_option_clone.find('[find=image]').addClass('display_none');
			elem_option_clone.attr('timestamp', burgerN.monthsArrayObj[i].getDuedateTimestamp(num_Day));

			if(typeof option_fn == 'function' ){
				elem_option_clone.on('mousedown', option_fn);
			}
			elem_dropdown.find('[find=wrapper]').append(elem_option_clone);
		});


	}//end of app_language_group == 2

	var optionCount = elem_dropdown.find('.burger_option').length;
	if(!optionCount){
		elem_option.find('[find=text]').html(Lincko.Translation.get('app', 2205, 'html'));/*no match*/
		elem_option.find('[find=image]').addClass('display_none');
		elem_dropdown.find('[find=wrapper]').append(elem_option);
	}
	else if(optionCount > that.dropdownCount){
		elem_dropdown.css({'height': that.optionHeight*that.dropdownCount, 'width': that.dropdownWidth});
		elem_dropdown.find('[find=wrapper]').addClass('overthrow');
	}
	else{
		elem_dropdown.css('height','auto');
	}

	return elem_dropdown;
}

burgerN.draw_contacts = function(contacts,option_fn){
	var that = this;
	/* contacts = {
			userID1: {checked: true/false},
			userID2: {checked: true/false},
			.
			.
		}
	*/
	var username = null;
	var in_charge = null;
	var picID = null;
	var elem_dropdown = burgerN.elem_dropdown.clone();
	var elem_option = $('#-burger_option').clone().prop('id','').addClass('burger_option_users');
	var elem_option_clone;

	//if there is no contacts to display
	if($.isEmptyObject(contacts)){
		elem_option.find('[find=text]').html(Lincko.Translation.get('app', 2205, 'html'));/*no match*/
		elem_option.find('[find=image]').addClass('display_none');
		elem_dropdown.find('[find=wrapper]').append(elem_option);
		return elem_dropdown;
	}


	$.each(contacts, function(userid, obj){
		in_charge = obj.checked;
		username = Lincko.storage.get("users", userid,"username");
		elem_option_clone = elem_option.clone().attr('userid',userid);
		elem_option_clone.find('[find=text]').html(username);
		picID  = Lincko.storage.get("users", userid, 'profile_pic');
		if(picID){
			var thumb_url = Lincko.storage.getLinkThumbnail(picID);
			elem_option_clone.find('[find=image]').removeClass('icon-SmallPersonaiconBlack icon-largerIndividual').css('background-image','url("'+thumb_url+'")');
		} else if(userid==0){ //LinckoBot icon
			elem_option_clone.find('[find=image]').removeClass('icon-SmallPersonaiconBlack icon-largerIndividual').css('background-image','url("'+app_application_icon_roboto.src+'")');
		} else if(userid==1){ //Monkey King icon
			elem_option_clone.find('[find=image]').removeClass('icon-SmallPersonaiconBlack icon-largerIndividual').css('background-image','url("'+app_application_icon_monkeyking.src+'")');
		}
		if( in_charge ){
			elem_option_clone.addClass('burger_option_selected');
		}

		if(typeof option_fn == 'function' ){
			elem_option_clone.on('mousedown', option_fn);
		}
		elem_dropdown.find('[find=wrapper]').append(elem_option_clone);
	});

	if(Object.keys(contacts).length > that.dropdownCount){
		elem_dropdown.css({'height': that.optionHeight*that.dropdownCount, 'width': that.dropdownWidth});
		elem_dropdown.find('[find=wrapper]').addClass('overthrow');
	}

	return elem_dropdown;
}

burgerN.assignTaskN = function(select_fn, item){
	var that = this;
	var burger_destroy = burgerN.destroy;
	var elem_dropdown = null;
	var dropdown_duration = burgerN.dropdownTime;

	elem.click(function(event){
		elem.focus();
		event.stopPropagation();
		if( elem_dropdown ){
			burger_destroy(elem_dropdown);
			elem_dropdown = null;
		}
		else{
            var contactsID_obj = burgerN.generate_contacts(item);
			//use the submenu for mobile
			if(responsive.test("maxMobileL")){
				var param = {};
				param.elem_input = elem;
				//param.type = 'tasks';//item['_type'];
				param.selectOne = true;
				param.item_obj = item;
				param.contactsID = contactsID_obj;
				param.alwaysMe = false;
				submenu_Build('burger_contacts', true, null, param);
				return false;
			}

			var userClick_fn = function(){
				var userid = $(this).attr('userid'); 
                if(elem.val() == userid){
                    elem.val('');
                }
                else{
                    elem.val(userid);
                }
				elem.change();
				if(!item['_id'] || item['_id'] == 'new'){
					return;
				}
				burger_contacts_sendAction(contactsID_obj, [userid], item, true);
			}

			elem_dropdown = burgerN.draw_contacts(contactsID_obj, userClick_fn);
			elem_dropdown.appendTo('#app_application_main');

			var coord = $(this).offset();
			var coordP = $(this).position();
			var left = coord.left;
			if(left == 0){ 
				left = coord.left;
				if( responsive.test("minTablet")){
					left -= $('#app_content_menu').outerWidth();
					if( $('#app_application_project').outerWidth() > 0){
						left -= $('#app_application_project').outerWidth();
					}
				}
			};
			var table_height = $(this).closest('table').outerHeight();
			var top = coord.top + table_height; //- $('#app_content_top').outerHeight();
			var bottom = $(window).height() - top + table_height +3/*some padding*/;
			
			elem_dropdown.css({
				position: 'absolute',
				left: left,
				top: top,
				bottom: bottom,
			});
			that.slideDown(elem_dropdown);
		}
	});
	elem.blur(function(){
		burger_destroy(elem_dropdown);
		elem_dropdown = null;
	});
}

burgerN.assignTask = function(elem, item){
	var that = this;
	var burger_destroy = burgerN.destroy;
	var elem_dropdown = null;
	var dropdown_duration = burgerN.dropdownTime;

	elem.click(function(event){
		elem.focus();
		event.stopPropagation();
		if( elem_dropdown ){
			burger_destroy(elem_dropdown);
			elem_dropdown = null;
		}
		else{
            var contactsID_obj = burgerN.generate_contacts(item);
			//use the submenu for mobile
			if(responsive.test("maxMobileL")){
				var param = {};
				param.elem_input = elem;
				//param.type = 'tasks';//item['_type'];
				param.selectOne = true;
				param.item_obj = item;
				param.contactsID = contactsID_obj;
				param.alwaysMe = false;
				submenu_Build('burger_contacts', true, null, param);
				return false;
			}

			var userClick_fn = function(){
				var userid = $(this).attr('userid'); 
                if(elem.val() == userid){
                    elem.val('');
                }
                else{
                    elem.val(userid);
                }
				elem.change();
				if(!item['_id'] || item['_id'] == 'new'){
					return;
				}
				burger_contacts_sendAction(contactsID_obj, [userid], item, true);
			}

			elem_dropdown = burgerN.draw_contacts(contactsID_obj, userClick_fn);
			elem_dropdown.appendTo('#app_application_main');

			var coord = $(this).offset();
			var coordP = $(this).position();
			var left = coord.left;
			if(left == 0){ 
				left = coord.left;
				if( responsive.test("minTablet")){
					left -= $('#app_content_menu').outerWidth();
					if( $('#app_application_project').outerWidth() > 0){
						left -= $('#app_application_project').outerWidth();
					}
				}
			};
			var table_height = $(this).closest('table').outerHeight();
			var top = coord.top + table_height; //- $('#app_content_top').outerHeight();
			var bottom = $(window).height() - top + table_height +3/*some padding*/;
			
			elem_dropdown.css({
				position: 'absolute',
				left: left,
				top: top,
				bottom: bottom,
			});
			that.slideDown(elem_dropdown);
		}
	});
	elem.blur(function(){
		burger_destroy(elem_dropdown);
		elem_dropdown = null;
	});
}

burgerN.generate_contacts = function(item){
	var accessList = [];
	if( !item || item['_id'] == 'new' || item == 'new' ){
		if(item['_parent'] && item['_parent'][0] && item['_parent'][1] ){
			accessList = Lincko.storage.whoHasAccess(item['_parent'][0], item['_parent'][1]);
		}
		else{
			accessList = Lincko.storage.whoHasAccess('projects', app_content_menu.projects_id);
		}
	}
	else{
		accessList = Lincko.storage.whoHasAccess(item['_type'], item['_id']);
	}
	var contacts = {};
	for (var i = 0; i < accessList.length; i++) {
		var userid = accessList[i];
		if( typeof item == 'object' && item['_users']  && userid in item['_users'] && item['_users'][userid]['in_charge'] ){
			contacts[userid] = { checked: true };
		}
		else{
			contacts[userid] = { checked: false };
		}
	}

	return contacts;
	/* contacts = {
			userID1: {checked: true/false},
			userID2: {checked: true/false},
			.
			.
		}
	*/
}

function burger_generate_contactsID(item){
	var accessList = [];
	if( item['_id'] == 'new' || item == 'new' || !item){
		accessList = Lincko.storage.whoHasAccess('projects', app_content_menu.projects_id);
	}
	else{
		accessList = Lincko.storage.whoHasAccess(item['_type'], item['_id']);
	}
	var contactsID_obj = {};
	for (var i = 0; i < accessList.length; i++) {
		var userid = accessList[i];
		if( '_users' in item && userid in item['_users'] && item['_users'][userid]['in_charge'] ){
			contactsID_obj[userid] = { checked: true };
		}
		else{
			contactsID_obj[userid] = { checked: false };
		}
	}

	return contactsID_obj;
}


function burger_contacts_sendAction(users, selectArray, item, multiselect){
	if(!multiselect){
		multiselect = null;
	}
	var param = {};
	param['id'] = item['_id'];
	param['users>in_charge'] = {};

	$.each(users, function(userid, obj){
		in_charge = obj.checked;
		if( typeof userid != 'string'){ userid = userid.toString(); }
		var selected = $.inArray(userid, selectArray);
		if(selected == -1){ selected = false; }
		else{ selected = true; }

		if( selected && in_charge==false){
			param['users>in_charge'][userid] = true;
		}
		else if( (/*!multiselect && (commented out for the beta)*/ !selected && in_charge==true) || (multiselect && selected && in_charge==true) ){
			param['users>in_charge'][userid] = false;
		}
	});

	if(item['_type'] == 'tasks'){
		//wrapper_sendAction( param, 'post', 'task/update');
		skylist.sendAction.tasks(param, item, 'task/update');
	}

}


var burger_calendar_linckofy_timeout;

function burger_calendar_linckofy(inst, inline_datepicker){
	
	clearTimeout(burger_calendar_linckofy_timeout);
	burger_calendar_linckofy_timeout = setTimeout(function(){
		var elem_calendarPrepend = $('#-burger_calendar_prepend').clone().prop('id','burger_calendar_prepend');
		//elem_calendarPrepend.find('[find=today_info]').html('Today is '+ new wrapper_date().display('date_medium_simple'));//toto
		elem_calendarPrepend.find('[find=today_info]').html(Lincko.Translation.get('app', 3604, 'html', {date: new wrapper_date().display('date_medium_simple'),}));
		var elem_attached = $(inst.input[0]);
		var elem_datepicker = null;
		if(inline_datepicker){
			elem_datepicker = inline_datepicker;
		}
		else{
			elem_datepicker = $('#ui-datepicker-div');
		}
		/*
		console.log(elem_datepicker);
		if( elem_datepicker.find('#burger_calendar_prepend') ){
			console.log(elem_datepicker.has('#burger_calendar_prepend'));
			return false;
		}
		*/

		elem_datepicker.prepend(elem_calendarPrepend);
		elem_datepicker.find('.ui-datepicker-next').empty().addClass('icon-Forward'); //DONT USE .recursiveEmpty() HERE
		elem_datepicker.find('.ui-datepicker-prev').empty().addClass('icon-Forward fa-flip-horizontal'); //DONT USE .recursiveEmpty() HERE
		var elem_prepend_today = elem_datepicker.find('[find=today_btn]');
		var elem_prepend_tomorrow =  elem_datepicker.find('[find=tomorrow_btn]');
		var elem_prepend_twoDays = elem_datepicker.find('[find=twoDays_btn]');
		var elem_prepend_oneWeek = elem_datepicker.find('[find=oneWeek_btn]');

		var prepend_select = function(){
			elem_datepicker.find('.burger_calendar_prepend_active').removeClass('burger_calendar_prepend_active');
			$(this).addClass('burger_calendar_prepend_active');
			elem_datepicker.find('.ui-state-active').click();
		}

		elem_prepend_today.click(function(){
			elem_attached.datepicker('setDate',0);
			prepend_select();
		});
		elem_prepend_tomorrow.click(function(){
			elem_attached.datepicker('setDate',1);
			prepend_select();
		});
		elem_prepend_twoDays.click(function(){
			elem_attached.datepicker('setDate',2);
			prepend_select();
		});
		 elem_prepend_oneWeek.click(function(){
			elem_attached.datepicker('setDate',7);
			prepend_select();
		});

		var date = new wrapper_date(parseInt(inst.lastVal,10)/1000);
		if( date.happensSomeday(0) ){
			elem_prepend_today.addClass('burger_calendar_prepend_active');
		}
		else if( date.happensSomeday(1) ){
			elem_prepend_tomorrow.addClass('burger_calendar_prepend_active');
		}
		else if( date.happensSomeday(2) ){
			elem_prepend_twoDays.addClass('burger_calendar_prepend_active');
		}
		else if( date.happensSomeday(7) ){
			elem_prepend_oneWeek.addClass('burger_calendar_prepend_active');
		}
	},10);

}



function burger_calendar (elem_timestamp, elem_display){
	var elem_input;
	if(!responsive.test("maxMobileL")){ //attach datepicker directly to the input for landscape tablet and up
		elem_timestamp.datepicker(
		{
			//altFormat: "M d",
			//altField: elem_alt,
			dayNamesMin: burgerN.daysVeryShortArray,
			monthNames: burgerN.monthsArray,
			showOtherMonths: true,
			dateFormat: '@',
			gotoCurrent: true,
			minDate: 0,
			showAnim: "slideDown",
			beforeShow: function(input, inst){
				$('#ui-datepicker-div').addClass('burger_calendar');
				elem_input = input;
				burger_calendar_linckofy(inst);
			},
			onChangeMonthYear: function(year, month, inst){
				burger_calendar_linckofy(inst);
			},
		});
	}

	elem_display.click(function(){
		elem_timestamp.click();
	});
	elem_timestamp.click(function(){
		if( responsive.test("maxMobileL")){
			var param = {elem_inputOrig:elem_timestamp };
			submenu_Build('calendar', true, false, param);
			return false;
		}


		if( $('#ui-datepicker-div').length > 0 && $('#ui-datepicker-div').css('display') == 'block' ){
			elem_timestamp.blur();
		}
		else{
			elem_timestamp.focus();
		}

	});


	elem_timestamp.change(function(){
		var timestamp = $(this).val();
		timestamp = parseInt(timestamp,10); 
		timestamp += 86399000; //adds 23hrs59min59sec to make it end of the day
		$(this).val(timestamp);
		var date = new wrapper_date(timestamp/1000);
		if(skylist_textDate(date)){
			date = skylist_textDate(date);
		}
		else{
			date = date.display('date_very_short');
		}
		elem_display.html(date);
		//elem_display.css('width',(elem_display.val().length-1)+'em');
		//elem_display.attr('size',(elem_display.val().length+1));
	});

	elem_timestamp.blur(function(){
		if( $('#ui-datepicker-div').css('display') != 'block' ){
			$('#ui-datepicker-div').removeClass('burger_calendar');
		}
	});
}



//future modification: generate the text given the userid
var burger_spanUser = function(userid, text){
	if(!text){
		var text = Lincko.storage.get("users", userid ,"username");
	}
	if(!text){
		text = Lincko.Translation.get('app', 3608, 'html'); //'Not Assigned'
	}

	var elem = $('<span contenteditable="false"></span>')
		.attr('userid',userid)
		.attr('find','name')
		.text(text)
		.addClass('burger_tag');
	return elem;
}

//future modification: generate the text given the timestamp
var burger_spanDate = function(timestamp, text){
	if(!text){
		var text = burger_timestampToText(timestamp);
	}

	var elem = $('<span find="dateWrapper" contenteditable="false"></span>')
		.attr('val',timestamp)
		.text(text)
		.addClass('burger_tag');
	return elem;
}


var burger_timestampToText = function(timestamp){
	var date = null;
	if(timestamp instanceof wrapper_date){
		date = timestamp;
	}
	else{
		date = new wrapper_date(timestamp);
	}

	//returns text for TODAY, TOMORROW, YESTERDAY, or the wrapper_date very_short form text
	if( date.happensSomeday(0) ){
		return Lincko.Translation.get('app', 3302, 'js').toUpperCase()/*today*/;
	}
	else if( date.happensSomeday(1) ){
		return Lincko.Translation.get('app', 3303, 'js').toUpperCase()/*tomorrow*/;
	}
	else if( date.happensSomeday(-1) ){
		return Lincko.Translation.get('app', 3304, 'js').toUpperCase()/*yesterday*/;
	}
	else{
		return date.display('date_very_short');
	}
}










function burger_regex_getCaretOffset(elem, noElemHeight) {
	//http://stackoverflow.com/questions/6846230/coordinates-of-selected-text-in-browser-page
	//http://stackoverflow.com/questions/4811822/get-a-ranges-start-and-end-offsets-relative-to-its-parent-container/4812022#4812022
	var element = elem;
	if(elem instanceof $){ element = elem.get(0); 	}

	var x = 0, y = 0, caretOffset = 0;
	var doc = element.ownerDocument || element.document;
	var win = doc.defaultView || doc.parentWindow;
	var sel, rect, rects;
	if (typeof win.getSelection != "undefined") {
		sel = win.getSelection();
		if (sel.rangeCount > 0) {
			var range = win.getSelection().getRangeAt(0);
			var preCaretRange = range.cloneRange();
			preCaretRange.selectNodeContents(element);
			preCaretRange.setEnd(range.endContainer, range.endOffset);
			caretOffset = preCaretRange.toString().length;

			range = sel.getRangeAt(0).cloneRange();
			if (range.getClientRects) {
				range.collapse(true);
				rects = range.getClientRects();
				if (rects.length > 0) {
					rect = rects[0];
				}
				if(rect && rect.left){ x = rect.left; }
				if(rect && rect.top){ y = rect.top; }
				
			}
			// Fall back to inserting a temporary element
			if (x == 0 && y == 0) {
				var span = doc.createElement("span");
				if (span.getClientRects) {
					// Ensure span has dimensions and position by
					// adding a zero-width space character
					span.appendChild( doc.createTextNode("\u200b") );
					range.insertNode(span);
					rect = span.getClientRects()[0];
					if(rect && rect.left){ x = rect.left; }
					if(rect && rect.top){ y = rect.top; }
					var spanParent = span.parentNode;
					spanParent.removeChild(span);

					// Glue any broken text nodes back together
					spanParent.normalize();
				}
			}
		}
	} else if ( (sel = doc.selection) && sel.type != "Control") { //for IE
		var textRange = sel.createRange();
		var preCaretTextRange = doc.body.createTextRange();
		preCaretTextRange.moveToElementText(element);
		preCaretTextRange.setEndPoint("EndToEnd", textRange);
		caretOffset = preCaretTextRange.text.length;

		textRange.collapse(true);
		x = range.boundingLeft; //IE 4-10
		y = range.boundingTop;	//IE 4-10
	}
	
	//below targeted element
	if(elem instanceof $ && !noElemHeight){
		y = y + elem.outerHeight();
	}
	return { x: x, y: y, caretOffset:caretOffset };
}


var  getSelectionCoords = function(win) {
	//http://stackoverflow.com/questions/6846230/coordinates-of-selected-text-in-browser-page
	win = win || window;
	var doc = win.document;
	var sel = doc.selection, range, rects, rect;
	var x = 0, y = 0, caretOffset = null;
	if (sel) {	//for IE 4-10
		if (sel.type != "Control") {
			range = sel.createRange();
			range.collapse(true);
			x = range.boundingLeft; //IE 4-10
			y = range.boundingTop;	//IE 4-10
		}
	} else if (win.getSelection) { 
	//In IE >= 9 and non-IE browsers (Firefox 4+, WebKit browsers released since early 2009, Opera 11, maybe earlier), you can use the getClientRects() method of Range
		sel = win.getSelection();
		if (sel.rangeCount) {
			range = sel.getRangeAt(0).cloneRange();
			//caretOffset = window.getSelection().getRangeAt(0).cloneRange();
			caretOffset =  window.getSelection().getRangeAt(0).startOffset;
			//caretOffset = caretOffset.toString().length;
			if (range.getClientRects) {
				range.collapse(true);
				rects = range.getClientRects();
				if (rects.length > 0) {
					rect = rects[0];
					x = rect.left;
					y = rect.top;
				}
			}
			// Fall back to inserting a temporary element
			if (x == 0 && y == 0) {
				var span = doc.createElement("span");
				if (span.getClientRects) {
					// Ensure span has dimensions and position by
					// adding a zero-width space character
					span.appendChild( doc.createTextNode("\u200b") );
					range.insertNode(span);
					rect = span.getClientRects()[0];
					x = rect.left;
					y = rect.top;
					var spanParent = span.parentNode;
					spanParent.removeChild(span);

					// Glue any broken text nodes back together
					spanParent.normalize();
				}
			}
			//to get coordinate at the end of the selection
			var range = window.getSelection().getRangeAt(0);
			range.collapse(false);
			var dummy = document.createElement("span");
			range.insertNode(dummy);
			var rect = dummy.getBoundingClientRect();
			var x2 = rect.left, width = rect.width, height = rect.height;
			dummy.parentNode.removeChild(dummy);
		}
		else{ //if sel.rangeCount == 0 (nothing selected)
			return false;
		}
		

	}
		/*
	var content_top_height = $('#app_content_top').outerHeight();
	y = y - content_top_height + elem.outerHeight();
	if( responsive.test('minTablet') ){
		var content_menu_width = $('#app_content_menu').outerWidth();
		x -= content_menu_width;
	}
	*/
	return { x: x, y: y, x2: x2, width: width, height: height, caretOffset:caretOffset };
}

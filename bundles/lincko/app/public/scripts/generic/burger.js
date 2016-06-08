/*
 * the ultimate Lincko Burger
 */
var burger = function(elem, burger_mode, item){
	var elem_dropdown = $('#-burger_dropdown').clone().prop('id','burger_dropdown');
	var burger_on = false;
	var dropdown_duration = 200;

	var burger_destroy = function(){
		burger_on = false;
		burger_str = "";
		burger_type = null;
		burger_startIndex = null;
		if(elem_dropdown){
			elem_dropdown.velocity('slideUp',{
				duration: dropdown_duration,
				complete: function(){
					elem_dropdown.remove();
				}
			});
		 }
		//console.log('current caret: '+burger_regex_getCaretOffset(elem).caretOffset);
	}

	if( burger_mode == 'regex' ){
		return false;
		var burger_str = "";
		var burger_type = null;
		var elem_burger_tag = $('#-burger_tag').clone().prop('id','');
		var burger_startIndex = null;
		
		elem.keypress(function(event){
			 var char = event.which || event.keyCode;
			 char = String.fromCharCode(char);
			 console.log(char);
			 if( burger_type !== null && !burger_on ){

			 }
			 if( burger_on ){
				
				burger_str = elem.text().substring(burger_startIndex+1,burger_regex_getCaretOffset(elem).caretOffset)+char;
				console.log('burger_startIndex: '+burger_startIndex);
				console.log('burger_str: '+burger_str);
				console.log('current caret: '+burger_regex_getCaretOffset(elem).caretOffset);
				var search_result = Lincko.storage.search('word',burger_str,burger_type)[burger_type];
				elem_dropdown.empty();
				if( !$.isEmptyObject(search_result) ){
					for( var i in search_result ){
						var username = search_result[i]['-username'];
						var elem_dropdown_option = $('#-burger_option').clone().prop('id','').addClass('burger_option_users');
						elem_dropdown_option.find('[find=username]').html(username);
						elem_dropdown.append(elem_dropdown_option);
						elem_dropdown_option.click(function(event){
							event.stopPropagation();
							
							var re = new RegExp('@'+burger_str);
							//elem_burger_tag.html(username);
							//pasteHtmlAtCaret(elem_burger_tag);
							var str = elem.text().replace(re, '<span contenteditable="false" class="burger_tag base_color_bg_main">'+username+'</span>');
							elem.html(str);
							console.log('str: '+str);
							burger_destroy();
						});
					}
				}
				else{
					elem_dropdown.html('no match');/*toto*/
				} 
			 }
			 if( char == '@' ){
				burger_type = 'users';
				burger_on = true;
				var coord = burger_regex_getCaretOffset(elem);
				//var coord = getSelectionCoords();
				burger_startIndex = coord.caretOffset;
				console.log('burger_startIndex: '+burger_startIndex);
				elem_dropdown.empty().css({'top':coord.y, 'left':coord.x});

				var search_result = Lincko.storage.search('category',null,burger_type)[burger_type];
				if( !$.isEmptyObject(search_result) ){
					for( var i in search_result ){
						var username = search_result[i]['-username'];
						var elem_dropdown_option = $('#-burger_option').clone().prop('id','').addClass('burger_option_users');
						elem_dropdown_option.find('[find=username]').html(username);
						elem_dropdown.append(elem_dropdown_option);
						elem_dropdown_option.click(function(event){
							event.stopPropagation();
							
							var re = new RegExp('@'+burger_str);
							//elem_burger_tag.html(username);
							//pasteHtmlAtCaret(elem_burger_tag);
							var str = elem.text().replace(re, '<span contenteditable="false" class="burger_tag base_color_bg_main">'+username+'</span>');
							elem.html(str);
							console.log('str: '+str);
							burger_destroy();
						});
					}
				}
				else{
					elem_dropdown.html('no match');/*toto*/
				} 


				$('#app_content_dynamic_sub').append(elem_dropdown);
				elem_dropdown.velocity("slideDown",{
					duration: dropdown_duration,
				});
				
			 }
			 else if( char == ' ' ){
				burger_destroy();
			 }
			 
		});
		elem.focusout(function(){
			//burger_destroy();
		});
	}//END OF burger_mode == regex
	else if( burger_mode == '_users' ){
		elem.click(function(event){
			elem.focus();
			event.stopPropagation();
			if( burger_on ){
				burger_destroy();
			}
			else{
				//generate list of userid
				if(!item['_id'] || item['_id'] == 'new'){
					var accessList = Lincko.storage.whoHasAccess('projects', app_content_menu.projects_id);
				}
				else{
					var accessList = Lincko.storage.whoHasAccess(item['_type'], item['_id']);
				}

                var contactsID_obj = burger_generate_contactsID(item);
				//use the submenu for mobile
				if(responsive.test("maxMobileL")){
					var param = {};
					param.elem_input = elem;
					param.type = 'tasks';//item['_type'];
					param.item_obj = item;
					param.contactsID = contactsID_obj;
					submenu_Build('burger_contacts', true, null, param);
					return false;
				}


				//elem_dropdown.empty().insertAfter(elem);
				//elem_dropdown.empty().appendTo('#app_layers_content');
				elem_dropdown.empty().appendTo('#app_application_main');
				burger_on = true;
				//var coord = $(this).position();
				var coord = $(this).offset();
				var coordP = $(this).position();
				var username = null;
				var in_charge = null;
				var picID = null;
				var elem_option = $('#-burger_option').clone().prop('id','').addClass('burger_option'+burger_mode);
				var elem_option_clone;
				//$.each(item[burger_mode], function(key, value){
				
				
				$.each(contactsID_obj, function(userid, obj){
					in_charge = obj.checked;
					username = Lincko.storage.get("users", userid,"username");
					elem_option_clone = elem_option.clone().attr('userid',userid);
					elem_option_clone.find('[find=username]').html(username);
					picID  = Lincko.storage.get("users", userid, 'profile_pic');
					if(picID){
						var thumb_url = Lincko.storage.getLinkThumbnail(picID);
						elem_option_clone.find('[find=profile_pic]').removeClass('icon-SmallPersonaiconBlack').css('background-image','url("'+thumb_url+'")');
					}
					if( in_charge ){
						elem_option_clone.addClass('burger_option_selected');
					}

					elem_option_clone.on('mousedown touchdown', function(){
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
					});
					elem_dropdown.append(elem_option_clone);
				});

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
				var top = coord.top + $(this).closest('table').outerHeight(); //- $('#app_content_top').outerHeight();
				
				elem_dropdown
					.css('left',left)
					.css('top',top)
					.css('position','absolute')
					.velocity("slideDown", {
						duration: dropdown_duration,
					});
					/*
					.css('left', coord.left)
					.css('top', coord.top + $(this).closest('table').outerHeight() )
					*/
					
			}
		});
		elem.blur(function(){
			burger_destroy();
		});
	}
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


function burger_contacts_sendAction(users, selectArray, item, popup){
	if(!popup){
		popup = null;
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
		else if( (/*!popup && (commented out for the beta)*/ !selected && in_charge==true) || (popup && selected && in_charge==true) ){
			param['users>in_charge'][userid] = false;
		}
	});

	if(item['_type'] == 'tasks'){
		wrapper_sendAction( param, 'post', 'task/update');
	}

}


var burger_calendar_linckofy_timeout;

function burger_calendar_linckofy(inst, inline_datepicker){
	
	clearTimeout(burger_calendar_linckofy_timeout);
	burger_calendar_linckofy_timeout = setTimeout(function(){
		var elem_calendarPrepend = $('#-burger_calendar_prepend').clone().prop('id','burger_calendar_prepend');
		elem_calendarPrepend.find('[find=today_info]').html('Today is '+ new wrapper_date().display('date_medium_simple'));//toto
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
		elem_datepicker.find('.ui-datepicker-next').empty().addClass('icon-Forward');
		elem_datepicker.find('.ui-datepicker-prev').empty().addClass('icon-Forward fa-flip-horizontal');
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
			elem_prepend_today.addClass('burger_calenar_prepend_active');
		}
		else if( date.happensSomeday(1) ){
			elem_prepend_tomorrow.addClass('burger_calenar_prepend_active');
		}
		else if( date.happensSomeday(2) ){
			elem_prepend_twoDays.addClass('burger_calenar_prepend_active');
		}
		else if( date.happensSomeday(7) ){
			elem_prepend_oneWeek.addClass('burger_calenar_prepend_active');
		}
	},10);

}



function burger_calendar (elem_timestamp, elem_display){
	var elem_input;
	elem_timestamp.datepicker(
	{
		//altFormat: "M d",
		//altField: elem_alt,
		dayNamesMin: (new wrapper_date()).day_very_short,
		monthNames: (new wrapper_date()).month,
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

	elem_display.click(function(){
		elem_timestamp.click();
	});
	elem_timestamp.click(function(){
		if( responsive.test("maxMobileL")){
			var param = {elem_inputOrig:elem_timestamp };
			submenu_Build('calendar',true,false,param);
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

function burger_regex_getCaretOffset(elem) {
	//http://stackoverflow.com/questions/6846230/coordinates-of-selected-text-in-browser-page
	//http://stackoverflow.com/questions/4811822/get-a-ranges-start-and-end-offsets-relative-to-its-parent-container/4812022#4812022
	//parameter element is HTML only, not JQuery obj
	var element = elem[0];
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
				x = rect.left;
				y = rect.top;
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
	y = y + elem.outerHeight();
	return { x: x, y: y, caretOffset:caretOffset };
}


var  getSelectionCoords = function(win) {
	//http://stackoverflow.com/questions/6846230/coordinates-of-selected-text-in-browser-page
	win = win || window;
	var doc = win.document;
	var sel = doc.selection, range, rects, rect;
	var x = 0, y = 0, caretOffset = null;
	if (sel) {	//for IE 4-10
		console.log("for IE 4-10...");
		if (sel.type != "Control") {
			range = sel.createRange();
			range.collapse(true);
			x = range.boundingLeft; //IE 4-10
			y = range.boundingTop;	//IE 4-10
		}
	} else if (win.getSelection) { 
		console.log('for IE>=9 and nonIE...');
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
				}
				x = rect.left;
				y = rect.top;
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
		}
	}
	var content_top_height = $('#app_content_top').outerHeight();
	y = y - content_top_height + elem.outerHeight();
	if( responsive.test('minTablet') ){
		var content_menu_width = $('#app_content_menu').outerWidth();
		x -= content_menu_width;
	}
	return { x: x, y: y, caretOffset:caretOffset };
}

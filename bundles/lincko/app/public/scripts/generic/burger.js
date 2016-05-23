/*
 * the ultimate Lincko Burger
 */
var burger = function(elem, burger_mode, item){
	var elem_dropdown = $('#-burger_dropdown').clone().prop('id','burger_dropdown');
    var burger_on = false;

	var burger_destroy = function(){
		console.log('burger_destroy');
		burger_on = false;
	 	burger_str = "";
	 	burger_type = null;
	 	burger_startIndex = null;
	 	elem_dropdown.velocity('slideUp',{
	 		complete: function(){
	 			elem_dropdown.remove();
	 		}
	 	});
	 	console.log('current caret: '+burger_regex_getCaretOffset(elem).caretOffset);
	}


	if( burger_mode == 'regex' ){
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
	 		 	elem_dropdown.velocity("slideDown");
	 		 	
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
            console.log('click focus');
            event.stopPropagation();
            if( burger_on ){
                burger_destroy();
            }
            else{
                //elem_dropdown.empty().insertAfter(elem);
                //elem_dropdown.empty().appendTo('#app_layers_content');
                elem_dropdown.empty().appendTo('#app_content_dynamic_sub');
                burger_on = true;
                //var coord = $(this).position();
                var coord = $(this).offset();
                var username;
                var elem_option = $('#-burger_option').clone().prop('id','').addClass('burger_option'+burger_mode);
                var elem_option_clone;
                //$.each(item[burger_mode], function(key, value){
                if(!item['_id'] || item['_id'] == 'new'){
                    var accessList = Lincko.storage.whoHasAccess('projects', app_content_menu.projects_id);
                }
                else{
                    var accessList = Lincko.storage.whoHasAccess(item['_type'], item['_id']);
                }
                
                for (var i = 0; i < accessList.length; i++) {
                    var userid = accessList[i];
                    username = Lincko.storage.get("users", userid,"username");
                    elem_option_clone = elem_option.clone().attr('userid',userid);
                    elem_option_clone.find('[find=username]').html(username);
                    if( item['_type'] == 'tasks' && userid in item['_users'] && item['_users'][userid]['in_charge'] ){
                        elem_option_clone.addClass('burger_option_selected');
                    }
                    if( item['_type'] == 'notes' && item['updated_by'] == userid ){
                        elem_option_clone.addClass('burger_option_selected');
                    }

                    if( item['_type'] == 'tasks'){
                        elem_option_clone.click(function(){
                            var userid = $(this).attr('userid');
                            elem.val(userid);
                            elem.change();
                             if(!item['_id'] || item['_id'] == 'new'){
                                return false;
                             }
                            var param = {};
                            param['id'] = item['_id'];
                            param['users>in_charge'] = {};
                            for (var i = 0; i < accessList.length; ++i){
                                //for beta, only one person can be in_charge. so first set all users to false
                                param['users>in_charge'][accessList[i]] = false;
                            }
                            if( userid in item['_users'] && item['_users'][userid]['in_charge'] ){
                                //if user is already in charge
                                param['users>in_charge'][userid] = false;
                            }
                            else {
                                param['users>in_charge'][userid] = true;
                            }
                            wrapper_sendAction( param, 'post', 'task/update');
                            burger_destroy();
                        });
                        
                    }

                     elem_dropdown.append(elem_option_clone);
                };

                var left = coord.left;
                var top = coord.top - $('#app_content_top').outerHeight() + $(this).closest('table').outerHeight();
                if( responsive.test("minTablet")){
                    left -= $('#app_content_menu').outerWidth();
                }
                 
                elem_dropdown
                    .css('left',left)
                    .css('top',top)
                    .css('position','absolute')
                    .velocity("slideDown");
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

function burger_calendar (elem_timestamp, elem_display){
    elem_timestamp.datepicker(
    {
        //altFormat: "M d",
        //altField: elem_alt,
        dateFormat: '@',
        gotoCurrent: true,
        minDate: 0,
        showAnim: "slideDown",
        beforeShow: function(){
            $('#ui-datepicker-div').addClass('burger_calendar');
        },
    });

    elem_display.click(function(){
        event.stopPropagation();
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
        console.log(date);
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

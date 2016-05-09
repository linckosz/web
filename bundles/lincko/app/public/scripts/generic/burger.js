/*
 * the ultimate Lincko Burger
 */
var burger = function(elem, burger_mode, item){
	this.toto = 'toto';
	var elem_dropdown = $('#-burger_dropdown').clone().prop('id','');
    var burger_on = false;

	var burger_destroy = function(){
		console.log('burger_destroy');
		console.log(elem);
		console.log('current caret: '+burger_regex_getCaretOffset(elem).caretOffset);
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
	 		 	if( !$.isEmptyObject(search_result) ){
	 		 		for( var i in search_result ){
	 		 			var username = search_result[i]['-username'];
	 		 			var email = search_result[i]['email'];
	 		 			var elem_dropdown_option = $('#-burger_option').clone().prop('id','');
	 		 			elem_dropdown_option.find('[find=username]').html(username);
	 		 			elem_dropdown_option.find('[find=email]').html(email);
	 		 			elem_dropdown.empty();
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
	 		 	elem_dropdown.empty().html('List goes here'/*toto*/).css({'top':coord.y, 'left':coord.x});
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
        elem_dropdown.insertAfter(elem);
        elem.click(function(event){
            console.log(burger_on);
            event.stopPropagation();
            if( burger_on ){
                burger_destroy();
            }
            else{
                burger_on = true;
                var coord = $(this).position();
                var username;
                var elem_option = $('#-burger_option').clone().prop('id','');
                var elem_option_clone;
                $.each(item[burger_mode], function(key, value){
                    username = Lincko.storage.get("users", key,"username");
                    elem_dropdown_clone = elem_option.clone();
                    elem_dropdown_clone.find('[find=username]').html(username);
                    elem_dropdown.append(elem_dropdown_clone);
                });
                elem_dropdown
                    .css('left', coord.left)
                    .css('top', coord.top + $(this).closest('table').outerHeight() )
                    .css('position','absolute')
                    .velocity("slideDown");
            }
        });
        elem.focusout(function(){
            elem.remove();
        });
    }
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

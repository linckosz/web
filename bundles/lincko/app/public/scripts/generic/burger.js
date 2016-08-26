/*
 * the ultimate Lincko Burger
 */
 var burgerN = {
 	shortcut:{
 		user: '@',
 		date: '++',
 		dateAlt: '＋＋',
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
			burgerN.placeCaretAtEnd(elem);
		}
		elem.trigger('focus',{cancelBlur: true});
		//elem.focus();
		
	},
	createCaretPlacer: function(atStart) {
	    return function(el) {
	    	if(el instanceof $){ el = el.get(0); }
	        el.focus();
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


burgerN.typeTask = function(projectID, skylistInst){
	if(!projectID){
		projectID = app_content_menu.projects_id;
	}
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
	//disable '@' for burgerN.regex if its personal space
	param.disable_shortcutUser = Lincko.storage.get('projects', projectID, 'personal_private');

	param.enter_fn = function(){

		//remove all child DOMs (<span>) from title
		var title = $(elem_typingArea).contents().filter(function() {
		  return this.nodeType == 3;
		}).text();

		var tempID = null;
		var param = {
			title: title,
			parent_id: projectID,
		}

		//default to current user
		var in_charge_id = wrapper_localstorage.uid;
		/*if(elem_userid.val().length){
			in_charge_id = elem_userid.val();
		}*/
		var elem_users = elem_typingArea.find('[userid]');
		if(elem_users.length){
			in_charge_id = $(elem_users[0]).attr('userid');
		}
		param['users>in_charge'] = {};
		param['users>in_charge'][in_charge_id] = true;


		//date logic
		var duration = defaultDuration;
		var time_now = new wrapper_date();
		var elem_dateWrapper = elem_typingArea.find('[find=dateWrapper]');
		if(elem_dateWrapper.length){
			var timestamp = elem_dateWrapper.attr('val');
			if(timestamp == 0){
				duration = time_now.getEndofDay() - time_now.timestamp;
			}
			else if(timestamp == 1){
				//do nothing, use DefaultDuration and also dont follow filter
			}
			else{ //val == due date timestamp in seconds
				duration = timestamp - time_now.timestamp;
			}
		}
		else{
			//modify duration based on current skylistFilter
			if(skylistInst && skylistInst.Lincko_itemsList_filter && skylistInst.Lincko_itemsList_filter.duedate 
				&& skylistInst.Lincko_itemsList_filter.duedate == 0){
				duration = time_now.getEndofDay() - time_now.timestamp;
			}
		}
		param.duration = duration;

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
			'new': true,
		}
		item['_users'][in_charge_id] = {
			approver: true,
			in_charge: true,
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
				//delete Lincko.storage.data.tasks[fakeID];
			}
		}

		wrapper_sendAction(param, 'post', 'task/create', cb_success, null, cb_begin, cb_complete);

		elem_typingArea.html('');
		elem_typingArea.focus();
	}

	burgerN.regex(elem_typingArea, null, param);

	return elem_typeTask;
}





burgerN.destroy = function(elem_dropdown){
	var duration = burgerN.dropdownTime;
	if(elem_dropdown){
		elem_dropdown.velocity('slideUp',{
			duration: duration,
			complete: function(){
				elem_dropdown.remove();
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
		duration: that.dropdownTime,
		complete:function(){
			if(elem_dropdown.find('.overthrow')){
				wrapper_IScroll();
			}
		}
	});
}

burgerN.regex = function(elem, item, param){
	var that = this;
	/*
		param = {
			elem_input:----,
			enter_fn:----,
		}	
	*/
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
			elem.find('span[userid]').remove();
		}
		//adjust for deleted spans
		caretIndex_new -= textLength - elem.text().length;

		//dont touch any text inside child DOM (e.g. <span>)
		var outerTextNode = elem.contents().filter(function(){ return this.nodeType == 3; });
		//if there are spans in the middle, outerTextNode is divied up, so must loop
		$.each(outerTextNode, function(key,str2){
			var str = that.shortcut.user+burger_str;
			if((str2.data).indexOf(str) != -1){
			    $(outerTextNode[key]).replaceWith($(outerTextNode[key]).text().replace(that.shortcut.user+burger_str, '<span userid="'+userid+'" contenteditable="false" class="burger_tag">'+that.shortcut.user+username+'</span> '));
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
			finalStr = new wrapper_date(finalVal).display('date_very_short');
		}

		var caretIndex_new = caretIndex;

		var textLength = elem.text().length;
		elem.find('span[find=dateWrapper]').remove();
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
			    $(outerTextNode[key]).replaceWith($(outerTextNode[key]).text().replace(shortcut+burger_str, '<span find="dateWrapper" val="'+finalVal+'" contenteditable="false" class="burger_tag">'+that.shortcut.date+finalStr+'</span> '));
			    return false;
			}
		});



		burgerN.placeCaretAt(caretIndex_new-(that.shortcut.date+burger_str).length, elem);
		destroy();
	}//end of dateClick_fn

	/*elem.on('keydown', function(event){ return;
		console.log('<<----keydown---->>');
		var selection = getSelection();
	    var focus_node = selection.focusNode;
	    focus_node.normalize();
	    console.log("event type:", event.type);
	    console.log("which:", event.which);
	    console.log("keyCode:", event.keyCode);
	    console.log("charCode:", event.charCode);
	    console.log("node value:", focus_node.nodeValue);
	    console.log('<<----keydown END---->>');
	});*/

	//tab to go to next focusable element happens at keydown
	elem.on('keydown', function(event){
		if((event.which || event.keyCode) == 9){ //if tab is pressed
			event.preventDefault();
		}
	});

	//adding linebreak happens on keypress, not on keyup
	elem.keypress(function(event){
		if((event.which || event.keyCode) == 13){ //if enter is pressed
			event.preventDefault();
		}
	});

	elem.keyup(function(event){
		if( responsive.test("maxMobileL") ){
			return;
		}
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
	    if(latestChar && event.which == 229 && !latestChar.match(/[\u4E00-\u9FA5]/)){ 
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
				var elem_options = elem_dropdown.find('.burger_option_users');
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
			elem_dropdown.empty();
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

				//elem_dropdown.empty().html(burgerN.draw_contacts(contactsID_obj_search, userClick_fn).children());

				var elem_dropdown_new = burgerN.draw_contacts(contactsID_obj_search, userClick_fn);
				elem_dropdown.empty().html(elem_dropdown_new.children());
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
				//elem_dropdown.empty().html(burgerN.draw_dates(burger_str, dateClick_fn).children());

				var elem_dropdown_new = burgerN.draw_dates(burger_str, dateClick_fn);
				elem_dropdown.empty().html(elem_dropdown_new.children());
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
			currentMode = that.shortcut.user;
			contactsID_obj = burgerN.generate_contacts(Lincko.storage.get(item['_type'], item['_id']));
	    	burger_startIndex = caretIndex;
			elem_dropdown = burgerN.draw_contacts(contactsID_obj, userClick_fn)
				.css({
					'top':coord.y, 
					'left':coord.x, 
					'bottom':$(window).height()-coord.y + elem.outerHeight(),
				});

			$('#app_content_dynamic_sub').append(elem_dropdown);
			that.slideDown(elem_dropdown);
		}
		else if( latestChar_prev+latestChar == that.shortcut.date /* ++ */ || latestChar_prev+latestChar == that.shortcut.dateAlt){
			currentMode = that.shortcut.date;
			burger_startIndex = caretIndex;
			elem_dropdown = burgerN.draw_dates(burger_str, dateClick_fn)
				.css({
					'top':coord.y, 
					'left':coord.x, 
					'bottom':$(window).height()-coord.y + elem.outerHeight(),
				});

			$('#app_content_dynamic_sub').append(elem_dropdown);
			that.slideDown(elem_dropdown);
		}
		else if((event.which || event.keyCode) == 13 ){ //if enter is pressed
			if(param && param.elem_input && typeof param.enter_fn == 'function'){
				param.enter_fn();
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
			if(project.personal_private){ return; }
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
		if(!$.inArray(project['_id'], Lincko.storage.getSettings().latestvisitProjects)){ return; }

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
	var elem_option = $('#-burger_option').clone().prop('id','').addClass('burger_option_users');
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

	var optionCount = elem_dropdown.find('.burger_option_users').length;
	if(!optionCount){
		elem_option.find('[find=text]').html('no match');/*toto*/
		elem_option.find('[find=image]').addClass('display_none');
		elem_dropdown.find('[find=wrapper]').append(elem_option);
	}
	else if(optionCount > that.dropdownCount){
		elem_dropdown.css({'height': that.optionHeight*that.dropdownCount, 'width': that.dropdownWidth});
		elem_dropdown.find('[find=wrapper]').addClass('overthrow');
	}
	else{
		elem_dropdown.css('height','initial');
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
		elem_option.find('[find=text]').html('no match');/*toto*/
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
			elem_option_clone.find('[find=image]').removeClass('icon-SmallPersonaiconBlack').css('background-image','url("'+thumb_url+'")');
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
		if( typeof item == 'object' && '_users' in item && userid in item['_users'] && item['_users'][userid]['in_charge'] ){
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
		if(Lincko.storage.get("projects", app_content_menu.projects_id, "personal_private")){
			return false;
		}    
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
					var thumb_url = app_application_icon_single_user.src;
					if(picID){
						thumb_url = Lincko.storage.getLinkThumbnail(picID);
					}
					elem_option_clone.find('[find=profile_pic]').css('background-image','url("'+thumb_url+'")');

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

	console.log(param);

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

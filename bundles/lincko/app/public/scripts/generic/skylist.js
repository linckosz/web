//Category 36

var skylist_calcDuedate = function(task_obj){
	var duedate = new wrapper_date(parseInt(task_obj.start,10) + parseInt(task_obj.duration,10));
	return duedate;
}
var skylist_textDate = function(date){
	//param: wrapper_date instance
	//returns text for TODAY, TOMORROW
	//returns false if not
	if( date.happensSomeday(0) ){
		return Lincko.Translation.get('app', 3302, 'html').toUpperCase()/*today*/;
	}
	else if( date.happensSomeday(1) ){
		return Lincko.Translation.get('app', 3303, 'html').toUpperCase()/*tomorrow*/;
	}
	else if( date.happensSomeday(-1) ){
		return Lincko.Translation.get('app', 3304, 'html').toUpperCase()/*yesterday*/;
	}
	else{
		false;
	}
}

var skylist = function(list_type, list_wrapper, sort_arrayText, subConstruct, rightOptionCount, leftOptionCount, id){
	this.that = this;
	var that = this;

	this.list_type = list_type;

	if( subConstruct ){
		this.subConstruct = subConstruct;
	}
	
	if(typeof id == 'undefined'){
		this.md5id = md5(Math.random());
	} else {
		this.md5id = id;
	}
	
	this.window_resize_timeout = null;


	//timesort-------------------------------------------------
	this.elem_navbar;
	this.elem_timesort;
	this.sortcount = 0;

	this.sort_arrayText = sort_arrayText;
	this.sort_array = [];
	//sort_arrayText keeps the text, sort_array is numerical, -1, 0, 2, etc.
	if( sort_arrayText ){ 
		this.sort_array = [-1];
		for( var i = 0; i < sort_arrayText.length-1; i++ ){
			this.sort_array.push(i);
		}
	}

	this.sort_fn = this.tasklist_update;
	this.elem_sortdot;   //sortdot wrapper element
	this.elem_sorts = {};//object in array format of all [sort] elements, can find element by name
	this.elem_sorts_text = {}; //just the text
	this.elem_Jsorts;	//JQuery object of elem.find('[sort]')
	this.sort = null;
	this.active_sort = "";

	//hammer.JS variables
	this.pan_direction = null;
	this.sortnum; //integer
	this.sortnum_new; //integer
	this.delX;
	this.pan_range_max = 200;
	this.pan_range_min = 70;
	this.timeout;
	//END OF timesort variables-------------------------------


	//all elem group storage
	this.elem_taskblur_all;
	this.elem_cardcenter_all;
	this.elem_leftOptions_all;
	this.elem_rightOptions_all;
	this.elem_card_all;

	this.editing_focus = false;
	this.editing_timeout;
	this.editing_target;
	this.is_scrolling = false;

	//variables for left-right slide options
	this.window_width;
	this.actiontask;
	this.delX;
	this.delX_ini;
	this.delX_now;
	this.delY;
	this.delY_ini;

	this.elem_leftOptions = null;
	this.elem_leftOptions_width = 80;
	if(!leftOptionCount){ leftOptionCount = 1; }
	this.elem_leftOptions_count = leftOptionCount;

	this.elem_rightOptions = null;
	this.elem_rightOptions_width = 80;
	if(!rightOptionCount){rightOptionCount = 0; }
	this.elem_rightOptions_count = rightOptionCount;

	this.elem_leftOptionsL;
	this.elem_rightOptionsL;
	this.mousedown = false;
	this.pan_threshold = {bool: false, valX: 20, valY:50};
	this.panyes = false;
	this.options_startL;

	//variables to keep track of filtered items
	this.Lincko_itemsList;
	this.Lincko_itemsList_filter = 
	{
		'people': wrapper_localstorage.uid,
		'duedate': null,
		//'timesort': null,
		'search': '',
		'sort_alt': false,
		'hide_completed': false,
	};
	this.searchTimeout;
	this.noResult_str = $('<div class="skylist_card_noCard"></div>');
	if(that.list_type == 'tasks'){
		this.noResult_str.html(Lincko.Translation.get('app', 3611, 'html'));
	}
	else if(that.list_type == 'notes'){
		this.noResult_str.html(Lincko.Translation.get('app', 3610, 'html'));
	}
	else if(that.list_type == 'files'){
		this.noResult_str.html(Lincko.Translation.get('app', 3609, 'html'));
	}

	//variables for construct
	this.list_wrapper = list_wrapper;
	this.list_subwrapper;
	this.list;
	this.task;
	this.elem_newcardCircle;
	this.elem_newcardBox;
	this.detail;
	this.construct();
}

/* enquire.js
 * can't use that.function to register enquire.js ('that' reference to the instance seems to be lost
 * during enquire.unregister, must also match the same function as during enquire.register. 
 * solution: store the function in a global object (skylist_enquire)
 *           each instance will be a new key(that.md5id) within skylist_enquire, each skylist to work independently
 *           skylist_instance.destroy() function must be called when list is no longer used
 *           at .destroy() call, enquire.unregister will remove the handlers inside skylist_enquire
 */
var skylist_enquire = {};

skylist.prototype.construct = function(){
	var that = this;
	that.list_wrapper = that.list_wrapper.empty().addClass('skylist_wrapper');
	that.list_subwrapper = $('#-skylist_subwrapper').clone().prop('id','');

	that.menu_construct();

	that.list = $('#-skylist').clone()
		.prop('id','skylist_'+that.md5id)
		.appendTo(that.list_subwrapper);
	that.list_subwrapper.appendTo(that.list_wrapper);

	that.elem_newcardCircle = $('#-skylist_newcardCircle').clone()
		.prop('id','skylist_newcardCircle_'+that.md5id);

	that.generate_Lincko_itemsList();
	that.addCard_all();
	//that.setHeight();

	/*functions that are specific to each module*/
	if( that.subConstruct ){
		that.subConstruct();
	}
	else{
		that.subConstruct_default();
	}

	if(that.list_wrapper.hasClass('skylist_maxMobileL_force')){
		that.list_wrapper.addClass('skylist_maxMobileL');
	}

	$(window).on("resize.skylist_"+that.md5id, function(){
		clearTimeout(that.window_resize_timeout);
		that.window_resize_timeout = setTimeout(function(){
			that.window_resize();
		},100);
	});

	$(window).resize();

	$(document).on("submenuHide.skylist_"+that.md5id, function(){
		that.submenuHide();
	});

	wrapper_IScroll_options_new['skylist_'+that.md5id] = { 
		click: false,
		//mouseWheel: true,
		//fadeScrollbars: false,
		//scrollX: true,
	};	
	
	wrapper_IScroll_cb_creation['skylist_'+that.md5id] = function(){
		var IScroll = myIScrollList['skylist_'+that.md5id];

		IScroll.on('scrollStart', function(){
			
		});//scrollStart

		IScroll.on('onScroll', function(){

		});

		IScroll.on('scrollEnd', function(){

		});//scrollEnd
	}

	/*--------------Enquire.JS------------------------------*/
	skylist_enquire[that.md5id] = {};
	skylist_enquire[that.md5id].minTablet = function(){ that.minTablet(); }
	skylist_enquire[that.md5id].maxMobileL = {
		match: function(){
			that.list_wrapper.addClass('skylist_maxMobileL');
			that.maxMobileL();
		},
		unmatch: function(){
			if(!that.list_wrapper.hasClass('skylist_maxMobileL_force')){
				that.list_wrapper.removeClass('skylist_maxMobileL');
			}
		}
	};
	skylist_enquire[that.md5id].minMobileL = function(){ that.minMobileL(); }
	skylist_enquire[that.md5id].isMobile = function(){ that.isMobile(); }

	enquire.register(responsive.minTablet, skylist_enquire[that.md5id].minTablet);
	enquire.register(responsive.maxMobileL, skylist_enquire[that.md5id].maxMobileL);
	enquire.register(responsive.minMobileL, skylist_enquire[that.md5id].minMobileL);
	enquire.register(responsive.isMobile, skylist_enquire[that.md5id].isMobile);
	/*--------------Enquire.JS------------------------------*/

}//end of construct

skylist.prototype.subConstruct_default = function(){
	var that = this;
	if(that.list_type == 'files'){
		that.elem_newcardCircle.click(function(){
			app_upload_open_files('projects', app_content_menu.projects_id);
		});
	}
	else{
		that.elem_newcardCircle.click(function(){
			submenu_Build('taskdetail', false, false, 
				{
					"type":that.list_type,
					"id": 'new', 
				}, true);
		});
	}
	that.elem_newcardCircle.appendTo(that.list_wrapper);

	app_application_lincko.add(
		that.list.prop('id'),
		'projects_'+app_content_menu.projects_id,
		function(){
			var param = {};
			param.new = true;
			var newTasks = Lincko.storage.list(that.list_type, null, param, 'projects', app_content_menu.projects_id, true);

			var itemlist_new = that.list_filter();
			var elem_cards = $('#'+this.id).find('[find=card]');
			if(elem_cards.length < 1){//if nothing on the list
				that.tasklist_update();
				return false;
			}
			if( itemlist_new.length > elem_cards.length ){
				var i_old = 0;
				for( var i_new =0; i_new < itemlist_new.length; i_new++ ){
					var newItem_id = itemlist_new[i_new]['_id'];
					var oldItem_id = $(elem_cards[i_old]).data('item_id');
					if( oldItem_id != newItem_id || !oldItem_id ){
						var elem_newCard = that.addCard(itemlist_new[i_new]).css('display','none');
						if( oldItem_id ){
							$(elem_cards[i_old]).before(elem_newCard);
						}
						else{//if new card should be attached at the end
							i_old--;
							$(elem_cards[i_old]).after(elem_newCard);
						}
						elem_newCard.velocity('slideDown',{
							complete: function(){
								$(this).attr('style','');
								that.DOM_updated();
							}
						});
					}
					else{
						i_old++;
					}
				}
			}
		}
	);

}//END OF subConstruct_default

skylist.prototype.destroy = function(){
	var that = this;

	enquire.unregister(responsive.minTablet, skylist_enquire[that.md5id].minTablet);
	enquire.unregister(responsive.maxMobileL, skylist_enquire[that.md5id].maxMobileL);
	enquire.unregister(responsive.minMobileL, skylist_enquire[that.md5id].minMobileL);
	enquire.unregister(responsive.isMobile, skylist_enquire[that.md5id].isMobile);
	delete skylist_enquire[that.md5id];


	that.list_wrapper.empty();
	$(window).off("resize.skylist_"+that.md5id);
	$('body').off("mouseleave.skylist_"+that.md5id);
	$(document).off("submenuHide.skylist_"+that.md5id);
	for( var g in that ){
		that[g] = null;
		delete that[g];
	}

	that = null;
	delete that;
}

skylist.prototype.submenuHide = function(){
	this.elem_card_all.removeClass('skylist_card_hover');
	//this.list.addClass('skylist_noPreviewLayer');
	$(window).resize();
}

skylist.prototype.generate_Lincko_itemsList = function(){
	var that = this;
	that.Lincko_itemsList = [];
	if (that.list_type == "chats") {
		that.Lincko_itemsList = mainMenu.getlist(null, app_content_menu.projects_id);
	}
	else if (that.list_type == "global_chats") {
		that.Lincko_itemsList = mainMenu.getlist();
	}
	else{
		that.Lincko_itemsList = Lincko.storage.list(that.list_type, null, null, 'projects', app_content_menu.projects_id, true);
		if( that.list_type == "tasks" ){
			var item;
			for( var i in that.Lincko_itemsList ){
				that.Lincko_itemsList[i]['duedate'] = that.Lincko_itemsList[i]['start'] + that.Lincko_itemsList[i]['duration'];
			}
			that.Lincko_itemsList = Lincko.storage.sort_items(that.Lincko_itemsList, 'duedate', 0, -1, true);
		}
		else if( that.list_type == 'notes'){
			that.Lincko_itemsList = Lincko.storage.sort_items(that.Lincko_itemsList, 'updated_at', 0, -1, false);
		}
	}
}

skylist.prototype.store_all_elem = function(){
	//should be lanunched when all DOM is loaded
	//this.elem_taskblur_all = this.tasklist.find('.app_layers_dev_skytasks_taskblur');
	this.elem_cardcenter_all = this.list.find('[find=card_center]');
	this.elem_leftOptions_all = this.list.find('[find=card_leftOptions]');
	this.elem_rightOptions_all = this.list.find('[find=card_leftOptions]');

	this.elem_card_all = this.list.find('[find=card]');
}

skylist.prototype.window_resize = function(){
	var that = this;
	that.window_width = $(window).width();
	that.editing_focus = false;
	that.setHeight();
	that.clearOptions();
/*
	if( responsive.test("isMobile") ){
		that.isMobile();
	}
	if( responsive.test("minMobileL") ){
		that.minMobileL();
	}
	if( responsive.test("maxMobileL") ){
		that.maxMobileL();
	}
	if( responsive.test("minTablet") ){
		that.minTablet();
	}	

	if(!responsive.test("minTablet") ){
		that.list_wrapper
			.removeClass('app_layers_dev_skytasks_simpleDesktop')
			.removeClass('app_layers_dev_skytasks_simpleDesktop2');
	}
	*/

	if( myIScrollList['skylist_'+that.md5id] ){
		myIScrollList['skylist_'+that.md5id].refresh();
	}
}

skylist.prototype.filter_by_people = function(items,filter){
	var that = this;
	var items_filtered = [];
	var item;
	if( filter == null ){
		return items;
	}
	else if( that.list_type == "tasks" || that.list_type == "notes" || that.list_type == "files"){
		for( var i in items ){
			item = items[i];
			if( that.list_type == "tasks" && item['_users'] && item['_users'][filter] && item['_users'][filter]['in_charge']){
				items_filtered.push(item);
			}
			else if( that.list_type != "tasks" && 'updated_by' in item && item['updated_by'] && item['updated_by'] == filter ){
				items_filtered.push(item);
			}
		}
	}

	that.Lincko_itemsList_filter.people = filter;

	return items_filtered;
}

skylist.prototype.filter_by_duedate = function(items, filter){
	/*filter =	null/-1 : ALL
				0 : TODAY
				1 : TOMORROW 
	*/
	var that = this;
	var items_filtered = [];
	var item;
	var duedate;
	var filter_num;

	if( filter == null || filter == -1 ){ 
		items_filtered = items; 
	}
	else if( filter < 2 ){
		/*
		if 		( filter == Lincko.Translation.get('app', 3302, 'html').toUpperCase() ){filter = 0}
		else if ( filter == Lincko.Translation.get('app', 3303, 'html').toUpperCase() ){filter = 1}
		else if ( filter == 'Spaces' ){}
		*/

		for( var i in items ){
			item = items[i];
			duedate = skylist_calcDuedate(item);
			if(duedate.happensSomeday(filter)){
				items_filtered.push(item);
			}
		}
	}
	/*
	if 		( filter == Lincko.Translation.get('app', 3302, 'html').toUpperCase()/*today ){filter_num = 0}
	/*else if ( filter == Lincko.Translation.get('app', 3303, 'html').toUpperCase()/*tomorrow ){filter_num = 1}
	/*else if ( filter == 'Spaces' ){}
	else{ filter_num = null }

	for (var i in items){
		item = items[i];
		duedate = app_layers_dev_skytasks_calcDuedate(item);
		if(filter_num == null || duedate.happensSomeday(filter_num)){
			items_filtered.push(item);
		}
	}
	*/
	this.Lincko_itemsList_filter.duedate = filter;
	return items_filtered;
}

skylist.prototype.filter_by_sort_alt = function(items, filter){
	var that = this;
	var items_filtered = [];
	var item;
	if( filter == null ){
		return items;
	}
	else{
		if( that.list_type == "tasks" && filter ){
			for( var i in items ){
				item = items[i];
				items_filtered = Lincko.storage.sort_items( items, 'updated_at', 0, -1, false );
			}
		}
		else{
			items_filtered = items;
		}
	}
	that.Lincko_itemsList_filter.sort_alt = filter;
	return items_filtered;
}

skylist.prototype.filter_by_hide_completed = function(items, filter){
	var that = this;
	var items_filtered = [];
	var item;
	if( filter == null ){
		return items;
	}
	else{
		if( that.list_type == "tasks" && filter ){
			for( var i in items ){
				item = items[i];
				if(!item.approved){
					items_filtered.push(item);
				}
			}
		}
		else{
			items_filtered = items;
		}
	}
	this.Lincko_itemsList_filter.hide_completed = filter;
	return items_filtered;
}

skylist.prototype.filter_by_search = function(items, filter){
	var that = this;
	var items_filtered = [];

	if( filter == null || filter == "" ){
		return items;
	}
	else{
		filter = $.trim(filter);
		var filter_array = filter.split(/\s+/);
	}

	if( that.search_chat ){
		items_filtered = that.search_chat(items, filter_array);
	}
	else{
		var item = null;
		var push = false;
		var word = null;
		var userid_array = null;
		var userid = null;
		for( var i=0; i < items.length; i++){ //for each item
			item = items[i];
			push = false;

			for( var j=0; j < filter_array.length; j++){ //for each word
				word = filter_array[j];
				var burgerOnly = false;
				if( word[0] == '@'){
					word = word.slice(1);
					burgerOnly = '@';
				}
				else if(word.substring(0,2) == '++'){
					word = word.slice(2);
					burgerOnly = '++';
				}

				userid_array = that.search_by_username(word);
				if(!word.length || (Lincko.storage.searchArray('word', word, [item]).length > 0 && !burgerOnly) ){
					push = true;
					break;
				}
				else if( userid_array.length && (burgerOnly == false || burgerOnly == '@') ){ //userOnly both true/false
					for( var k=0; k < userid_array.length; k++){
						userid = userid_array[k];
						if( that.list_type == 'tasks' ){
							if( userid in item['_users'] && item['_users'][userid]['in_charge'] ){
								push = true;
								break;
							}
						}
						else if( that.list_type == 'notes' || that.list_type == 'files' ){
							if( item['updated_by'] == userid ){
								push = true;
								break;
							}
						}
					}//END OF for each userid_array
					if(push){
						break;
					}
				}
				else if( that.isDueThisTime(item, word) && (burgerOnly == false || burgerOnly == '++') ){
					push = true;
					break;
				}
			}//END OF for word

			if(push){
				items_filtered.push(item);
			}

		}//END OF for items
	}
	return items_filtered;
}

skylist.prototype.search_by_username = function(username){
	var userid_array = [];
	var result = Lincko.storage.search('word', username, 'users');
	if($.isEmptyObject(result)){
		return false;
	}
	else{
		$.each( result.users, function( key, value ) {
			userid_array.push(key);
		});
		return userid_array;
	}
}

skylist.prototype.isDueThisTime = function(item, time){
	if(typeof item != 'object' || item._type != 'tasks' || !item.duration || !item.start || !time){
		return false;
	}
	time = time.toLowerCase();

	var isDueThisTime = false;
	var months_obj = {
		long: (new wrapper_date()).month,
		short:(new wrapper_date()).month_short,
	};

	var dueMonthIndex = new Date((item.start + item.duration)*1000).getMonth();

	$.each(months_obj, function(key,val){
		if(val[dueMonthIndex].toLowerCase() == time){
			isDueThisTime = true;
			return false;
		}
	});
	
	return isDueThisTime;
}

skylist.prototype.list_filter = function(){
	var that = this;
	that.generate_Lincko_itemsList();
	var items_filtered = that.Lincko_itemsList;

	if( that.list_type == "tasks" || that.list_type == "notes" || that.list_type == "files" ){
		items_filtered = that.filter_by_search( items_filtered, that.Lincko_itemsList_filter.search );
		items_filtered = that.filter_by_people( items_filtered, that.Lincko_itemsList_filter.people );
		items_filtered = that.filter_by_duedate( items_filtered, that.Lincko_itemsList_filter.duedate );
		items_filtered = that.filter_by_sort_alt( items_filtered, that.Lincko_itemsList_filter.sort_alt );
		items_filtered = that.filter_by_hide_completed( items_filtered, that.Lincko_itemsList_filter.hide_completed );
	}
	return items_filtered;
}

skylist.prototype.tasklist_update = function(type, filter_by){
	var that = this;

	if( type ){
		that.Lincko_itemsList_filter[type] = filter_by;
	}
	var items_filtered = that.list_filter();

	var iscroll_elem;
	that.list.velocity("fadeOut",{
		duration: 200,
		complete: function(){
			if( that.list.find('.iscroll_sub_div').length > 0 ){
				iscroll_elem = that.list.find('.iscroll_sub_div').empty();
			}else{
				iscroll_elem = that.list.empty();
			}

			if( items_filtered.length < 1 ){
				var noResultString = that.noResult_str;
				/*
				if( that.list_type == 'tasks' ){
					noResultString += '<div class="skylist_card_noCard">(Filter: ';
					$.each(that.Lincko_itemsList_filter, function(key, val){
						noResultString += '['+key+': '+val+']';
					});
					noResultString += ')';
				}
				*/
				iscroll_elem.append(noResultString);
			}
			else{
				for (var i in items_filtered){
					item = items_filtered[i];
					iscroll_elem.append(that.addCard(item));
				}
			}
			
			that.store_all_elem();
			that.window_resize();
		}
	})
	.velocity("fadeIn",{
		duration: 200,
		complete: function(){
			that.window_resize();
		}
	});
}

skylist.prototype.DOM_updated = function(){
	var that = this;
	that.store_all_elem();
	if( myIScrollList['skylist_'+that.md5id] ){
		myIScrollList['skylist_'+that.md5id].refresh();
	}
}

skylist.prototype.addCard_all = function(){
	var that = this;
	var items;
	items = that.list_filter();
	if( items.length < 1 ){
		that.list.append(that.noResult_str);
	}
	else{
		var item;
		for (var i in items){
			item = items[i];
			item['duedate'];
			that.list.append(that.addCard(item));
		}
	}
	that.store_all_elem();
}
skylist.prototype.addCard = function(item){
	var that = this;
	var elem_card;
	if( that.list_type == 'tasks' ){
		elem_card = that.addTask(item);	
	}
	else if( that.list_type == 'notes' ){
		elem_card = that.addNote(item);
	}
	else if( that.list_type == 'files' ){
		elem_card = that.addFile(item);
	}
	else if (that.list_type == 'chats' || that.list_type == 'global_chats') {
		elem_card = that.addChat(item);
	}

	if( that.list_type == 'tasks' || that.list_type == 'notes' || that.list_type == 'files' ){
		//elem_card.find('[find=card_spacestick]').removeClass('display_none');
		app_application_lincko.add(
			elem_card.prop('id'),
			that.list_type+'_'+item['_id'],
			function(){
				var elem = $('#'+this.id);
				var item_new = Lincko.storage.get(that.list_type , item['_id']);
				if( !item_new || (typeof item_new == 'object' && 'deleted_at' in item_new && item_new['deleted_at']) ){ //for delete
					elem.velocity('slideUp',{
						complete: function(){
							$(this).remove();
							if( that.list_subwrapper.find('[find=card]').length < 1 ){
								that.tasklist_update();
							}
							else{
								that.DOM_updated();
							}
						}
					});
				}
				else{ //for update
					elem.velocity('fadeOut',{
						duration: 200,
						complete: function(){
							var elem_toReplace = that.addCard(Lincko.storage.get(that.list_type , item['_id']));
							if(elem.hasClass('skylist_card_hover')){
								elem_toReplace.addClass('skylist_card_hover');
							}
							elem.find('input').blur();
							$(elem.find('[find=card_time_calendar_timestamp]')).datepicker('hide');
							elem.replaceWith(elem_toReplace);
							that.DOM_updated();
						}
					});
				}
			}
		);
	} //END OF 'tasks' || 'notes'
	if(that.elem_rightOptions_count < 1){
		elem_card.find('[find=card_rightOptions]').addClass('display_none');
	}
	return elem_card;
}

skylist.prototype.addChat = function(item){
		var that = this;

		if(typeof item["_type"] != "undefined"){
			var item_type = item["_type"];
		} else if(typeof item["type"] != "undefined"){
			var item_type = item["type"];
		} else {
			return false;
		}

		if(typeof item["_id"] != "undefined"){
			var item_id = item["_id"];
		} else if(typeof item["id"] != "undefined"){
			var item_id = item["id"];
		} else {
			return false;
		}

		if(typeof item["updated_at"] != "undefined"){
			var item_timestamp = item["updated_at"];
		} else if(typeof item["timestamp"] != "undefined"){
			var item_timestamp = item["timestamp"];
		} else {
			return false;
		}

		var Elem = $('#-skylist_card').clone();
		var Elem_rightOptions = Elem.find('[find=card_rightOptions]').empty();
		var Elem_logo = $('#-skylist_logo').clone().prop('id','');
		Elem_logo.addClass("logo_width");
		var cnt = notifier[item_type]['get'](item_id);
		if (cnt) {
			if (cnt > 999) {
				Elem_logo.find('.notification').html('...').show();
			} else {
				Elem_logo.find('.notification').html(cnt).show();
			}
		}
		var sync_type = "chats";
		if(item_type == "history"){
			sync_type = "projects";
		}
		app_application_lincko.add("skylist_card_"+this.md5id+"_"+item_id, sync_type + "_" + item_id, function() {
			var range = Object.keys(this.range)[0].split("_");
			var type = range[0];
			var id = range[1];
			var cnt = notifier[type]['get'](id);
			Elem_logo = $("#"+this.id);
			if (type == "chats") {
				var chat = Lincko.storage.get('chats', id);
				if(chat["single"]){
					name = "";
					user_icon = false;
					var src = app_application_icon_single_user.src;
					if(chat["_perm"][wrapper_localstorage.uid]){
						var perso = Lincko.storage.get('users', wrapper_localstorage.uid);
						name = perso["-username"];
						src = Lincko.storage.getLinkThumbnail(perso['profile_pic']);
						if(!src){
							src = app_application_icon_single_user.src;
						} else {
							user_icon = true;
						}
					}
					for(var i in chat["_perm"]){
						if(i!=wrapper_localstorage.uid){
							var perso = Lincko.storage.get('users', i);
							name = perso["-username"];
							src = Lincko.storage.getLinkThumbnail(perso['profile_pic']);
							if(!src){
								src = app_application_icon_single_user.src;
							} else {
								user_icon = true;
							}
							break;
						}
					}
					if(user_icon){
						Elem_logo.find('img.logo_img').removeClass("display_none");
						Elem_logo.find('img.logo_img').attr('src', src);
						Elem_logo.find('span.logo').addClass("display_none");
					} else {
						Elem_logo.find('span.logo').removeClass("display_none");
						Elem_logo.find('span.logo').addClass('icon-Single-Person');
						Elem_logo.find('img.logo_img').addClass("display_none");
					}
				} else {
					name = Lincko.storage.get('chats', id, '+title');
					Elem_logo.find('span.logo').removeClass("display_none");
					Elem_logo.find('span.logo').addClass('icon-Multiple-People');
					Elem_logo.find('img.logo_img').addClass("display_none");
				}
				Elem_logo.find('[find=title]').html(wrapper_to_html(name));
				var comment = Lincko.storage.list("comments", 1, null, "chats", id);
				if(typeof comment[0] == "object"){
					var commentText =  wrapper_to_html(comment[0]['+comment']);
					Elem_logo.find('[find=description]').html(commentText);
				} else {
					Elem_logo.find('[find=description]').html('');
				}
			} else {
				var name = Lincko.storage.get('projects', id, '+title');
				Elem_logo.find('[find=title]').html(name);
				/*
				var comment = Lincko.storage.list("comments", 1, null, "chats", id);
				if(typeof comment[0] == "object"){
					var commentText =  wrapper_to_html(comment[0]['+comment']);
					$("#"+this.id).find('[find=description]').html(commentText);
				} else {
					$("#"+this.id).find('[find=description]').html('');
				}
				*/
			}
			if (cnt) {
				if (cnt > 999) {
					$("#"+this.id).find('.notification').html('...').show();
				} else {
					$("#"+this.id).find('.notification').html(cnt).show();
				}
			}
			else {
				$("#"+this.id).find('.notification').hide();
			}
		});
		Elem.find('[find=card_leftbox]').html(Elem_logo);
		var name = '';


		Elem.prop('id','skylist_card_'+that.md5id+'_'+item['id']);


		/*
		title
		*/
		Elem.attr('type', item_type);
		var elem_title = Elem.find('[find=title]');
		if (item_type == "projects" || item_type == "history") {
			if(item_id == Lincko.storage.getMyPlaceholder()['_id']){
				name = Lincko.Translation.get('app', 2502, 'html'); //Personal Space
			} else {
				name = Lincko.storage.get("projects", item_id, "+title");
			}

			Elem_logo.find('span').addClass('fa fa-globe');

		} else if (item_type == 'chats') {
			var chat = Lincko.storage.get('chats', item_id);
			if(chat["single"]){
				name = "";
				user_icon = false;
				var src = app_application_icon_single_user.src;
				if(chat["_perm"][wrapper_localstorage.uid]){
					var perso = Lincko.storage.get('users', wrapper_localstorage.uid);
					name = perso["-username"];
					src = Lincko.storage.getLinkThumbnail(perso['profile_pic']);
					if(!src){
						src = app_application_icon_single_user.src;
					} else {
						user_icon = true;
					}
				}
				for(var i in chat["_perm"]){
					if(i!=wrapper_localstorage.uid){
						var perso = Lincko.storage.get('users', i);
						name = perso["-username"];
						src = Lincko.storage.getLinkThumbnail(perso['profile_pic']);
						if(!src){
							src = app_application_icon_single_user.src;
						} else {
							user_icon = true;
						}
						break;
					}
				}
				if(user_icon){
					Elem_logo.find('img.logo_img').removeClass("display_none");
					Elem_logo.find('img.logo_img').attr('src', src);
					Elem_logo.find('span.logo').addClass("display_none");
				} else {
					Elem_logo.find('span.logo').removeClass("display_none");
					Elem_logo.find('span.logo').addClass('icon-Single-Person');
					Elem_logo.find('img.logo_img').addClass("display_none");
				}
			} else {
				name = Lincko.storage.get('chats', item_id, '+title');
				Elem_logo.find('span.logo').removeClass("display_none");
				Elem_logo.find('span.logo').addClass('icon-Multiple-People');
				Elem_logo.find('img.logo_img').addClass("display_none");
			}


		}
		var contenteditable = false;
		var elem_title = Elem.find('[find=title]');
		elem_title.html(wrapper_to_html(name));

		var commentText = item['comment'];
		if(item.type != 'history'){
			commentText =  wrapper_to_html(item['comment']);
		}
		Elem.find('[find=description]').html(commentText);

		var latest_update = new wrapper_date(item_timestamp);

		if( latest_update.happensSomeday(0) ){
			latest_update = Lincko.Translation.get('app', 3302, 'html').toUpperCase(); //today
		}
		//toto => happensSomeday is somwhow not tking is account the timezone
		/*
		else if( latest_update.happensSomeday(-1) ){
			latest_update = Lincko.Translation.get('app', 3304, 'html').toUpperCase(); //yesterday
		}
		*/
		else{
			latest_update = latest_update.display('date_very_short');
		}

		Elem.find('[find=card_time]').html(latest_update);
		Elem.data('options',false);
		that.add_cardEvents(Elem);

		return Elem;
}

skylist.prototype.addTask = function(item){
	var that = this;
	var Elem = $('#-skylist_card').clone();
	var Elem_checkbox = $('#-skylist_checkbox').clone().prop('id','');
	Elem.find('[find=card_leftbox]').html(Elem_checkbox);
	var Elem_rightOptions = Elem.find('[find=card_rightOptions]').empty();
	var created_by;
	var in_charge = '';
	var duedate;

	if(item == null){
		item = {};
		item['_id'] = 'new';
		item['_type'] = "tasks"
		item['+title'] = 'blankTask';
		item['_perm'][0] = 3; //RCUD
		item['created_by'] = wrapper_localstorage.uid;
		item['_users'][wrapper_localstorage.uid]['in_charge'] = true;
		item.start = $.now()/1000;
		item.duration = "86400";
	}
	Elem.prop('id','skylist_card_'+that.md5id+'_'+item['_id']);

	/*
		add class to entire card based on task status
	*/
	if( item['approved'] ){
		Elem.addClass('skylist_card_checked');
	}


	/*
	checkbox (old)
	Elem.find("[type=checkbox]")
		.prop(
			{
				'id':'skylist_checkbox_'+that.md5id+'_'+item['_id'],
				'checked': function(){
					if(item['done_at'] == null){
						return false;
					}
					else{
						Elem.toggleClass('skylist_card_opacity');
						return true;
					}
				}
			});
	Elem.find('.skylist_checkbox label').prop('for','skylist_checkbox_'+that.md5id+'_'+item['_id']);
	*/

	/*
	title
	*/
	var elem_title = Elem.find('[find=title]');
	elem_title.html(item['+title']);
	
	var contenteditable = false;
	if( typeof item == 'object' && '_perm' in item && wrapper_localstorage.uid in item['_perm'] && item['_perm'][wrapper_localstorage.uid][0] > 1 ){ //RCU and beyond
		contenteditable = true; 
	}
	if(contenteditable){
		elem_title.on('mousedown touchstart', function(event){ 
			if( responsive.test("maxMobileL") ){ return true; }
			that.editing_target = $(this);
			clearTimeout(that.editing_timeout);
			that.editing_timeout = setTimeout(function(){
				that.editing_target.attr('contenteditable',contenteditable);
				that.editing_target.focus();
			},1000);
		});
		elem_title.on('mouseup touchend', function(event){
			clearTimeout(that.editing_timeout);
		});
		elem_title.keydown(function(event){
			if(event.keyCode == 13){
				event.preventDefault();
				$(this).focusout();
				$(this).blur();
			}
		});
		elem_title.blur(function(){
			that.editing_target.attr('contenteditable',false);
			var new_text = $(this).html();
			if(new_text != item['+title']){
				wrapper_sendAction({
				id: item['_id'],
				title: new_text,
				}, 'post', 'task/update', 
				function(msg, data_error, data_status, data_msg){ 
					if(data_error){
						app_application_lincko.prepare(item['_type']+'_'+item['_id']);
					}
				}, function(){ app_application_lincko.prepare(item['_type']+'_'+item['_id']); });
			}
		});
		burger(Elem.find('[find=title]'), 'regex');
	}


	/*in_charge*/
	for (var i in item['_users']){
		if( item['_users'][i]['in_charge']==true ){
			in_charge += Lincko.storage.get("users", i ,"username");
		}
	}
	if( !in_charge ){
		in_charge = Lincko.Translation.get('app', 3608, 'html'); //'Not Assigned'
	}
	//Elem.find('[find=name_hidden]').toggleClass('display_none');
	Elem.find('[find=name]').html(in_charge);
	burger(Elem.find('input[find=name_hidden]'), '_users', item);
	
	/*
	rightOptions - in_charge
	*/
	var elem_rightOptions_inCharge = that.add_rightOptionsBox(in_charge,'fa-user');
	elem_rightOptions_inCharge.click(function(){
		var param = {};
		param.type = 'tasks';
		param.item_obj = item;
		param.contactsID = burger_generate_contactsID(item);
		param.elem_input = Elem.find('input[find=name_hidden]');
		submenu_Build('burger_contacts', true, null, param);
	});
	Elem_rightOptions.append(elem_rightOptions_inCharge);

	/*
	comments
	*/
	var commentCount = 0;
	var comments = Lincko.storage.list('comments',null, null, that.list_type, item['_id'], true);
	commentCount = comments.length;
	Elem.find('[find=commentCount]').html(commentCount);

	/*
	updated_at
	*/
	Elem.find('[find=quickInfo1]').html(Lincko.Translation.get('app', 53, 'html')+': ');
	var updated_at = new wrapper_date(item['updated_at']);
	if( skylist_textDate(updated_at) ){
		updated_at = skylist_textDate(updated_at);
	}
	else{
		updated_at = updated_at.display('date_very_short');
	}
	Elem.find('[find=quickInfo2]').html(updated_at+',&nbsp;');
	/*
	updated_by
	*/
	var updated_by = Lincko.storage.get("users", item['updated_by'] ,"username");
	Elem.find('[find=quickInfo3]').html(updated_by);

	/*duedate = new wrapper_date(item.start + parseInt(item.duration,10));*/
	duedate = skylist_calcDuedate(item);
	var now = new wrapper_date($.now()/1000);
	if( now.time > duedate.time ){
		Elem.addClass('skylist_card_overdue');
	}
	if(skylist_textDate(duedate)){
		duedate = skylist_textDate(duedate);
		if(duedate == Lincko.Translation.get('app', 3302, 'html').toUpperCase() /*today*/){
			Elem.removeClass('skylist_card_overdue');
		}
	}
	else{
		duedate = duedate.display('date_very_short');
	}
	
	var elem_calendar = Elem.find('[find=card_time]');
	var elem_calendar_timestamp = Elem.find('[find=card_time_calendar_timestamp]');

	elem_calendar_timestamp.removeClass('display_none');

	elem_calendar.html(duedate);
	elem_calendar_timestamp.val((item['start']+item['duration'])*1000);
	burger_calendar(elem_calendar_timestamp, elem_calendar );
	elem_calendar_timestamp.change(function(){
		var duration_timestamp = $(this).val()/1000 - item['start'];
		if( duration_timestamp < 0 ){
			console.log(item['start']+' duedate cant be before start date.');
		}
		else{
			var route = '';
			if( that.list_type == "tasks" ){
				route = 'task/update';
			}
			wrapper_sendAction({
				id: item['_id'],
				duration: duration_timestamp,
			}, 'post', route);
		}
	});

	/*
	rightOptions - duedate
	*/
	var elem_rightOptions_duedate = that.add_rightOptionsBox(duedate,'fa-calendar');
	elem_rightOptions_duedate.click(function(){
		var param = {elem_inputOrig:elem_calendar_timestamp };
		submenu_Build('calendar',true,false,param);
	});
	Elem_rightOptions.append(elem_rightOptions_duedate);

	Elem.data('item_id',item['_id']);
	Elem.data('options',false);

	Elem.find('[find=checkbox]').on('click', function(event){
		that.checkboxClick(event,$(this));
	});
	
	Elem.on('click', function(event){
		if( that.panyes == false ){
			that.taskClick(event,this);
		}
	});

	that.add_cardEvents(Elem);

	return Elem;
}


skylist.prototype.addNote = function(item){
	var that = this;
	var Elem = $('#-skylist_card').clone();
	var Elem_rightOptions = Elem.find('[find=card_rightOptions]').empty();
	var updated_by;
	var updated_at;

	if(item == null){
		item = {};
		item['_id'] = 'new';
		item['+title'] = 'blankNote';
		item['-comment'] = 'blankNote';
		item['_perm'][0] = 3; //RCUD
		item['updated_by'] = wrapper_localstorage.uid;
		item['updated_at'] = $.now()/1000;
	}
	Elem.prop('id','skylist_card_'+that.md5id+'_'+item['_id']);

	/*
	title
	*/
	var contenteditable = false;
	var elem_title = Elem.find('[find=title]');
	if( wrapper_localstorage.uid in item['_perm'] && item['_perm'][wrapper_localstorage.uid][0] > 1 ){ //RCU and beyond
		contenteditable = true; 
	}
	elem_title.html(item['+title']);
	if(contenteditable){
		elem_title.on('mousedown touchstart', function(event){ 
			if( responsive.test("maxMobileL") ){ return true; }
			that.editing_target = $(this);
			clearTimeout(that.editing_timeout);
			that.editing_timeout = setTimeout(function(){
				that.editing_target.attr('contenteditable',contenteditable);
				that.editing_target.focus();
			},1000);
		});
		elem_title.on('mouseup touchend', function(event){
			clearTimeout(that.editing_timeout);
		});
		elem_title.blur(function(){
			that.editing_target.attr('contenteditable',false);
			var new_text = $(this).html();
			if(new_text != item['+title']){
				wrapper_sendAction({
				id: item['_id'],
				title: new_text,
				}, 'post', 'note/update', 
				function(msg, data_error, data_status, data_msg){ 
					if(data_error){
						app_application_lincko.prepare(item['_type']+'_'+item['_id']);
					}
				}, function(){ app_application_lincko.prepare(item['_type']+'_'+item['_id']); });
			}
		});
	}


	/*
	 note description
	 */
	Elem.find('[find=description]').html($('<div>'+item['-comment']+'</div>').text());


	/*
	 note preview image
	*/
	var elem_leftbox = $('<span></span>').addClass('skylist_card_leftbox_abc');
	Elem.find('[find=card_leftbox]').append(elem_leftbox);



	/*updated_by*/
	updated_by = item['updated_by'];
	updated_by = Lincko.storage.get("users", updated_by,"username");
	Elem.find('[find=name]').html(updated_by);
	
	/*
	rightOptions - updated_by
	*/
	Elem_rightOptions.append(that.add_rightOptionsBox(updated_by,'fa-user'));

	/*
	comments
	*/
	var commentCount = 0;
	var comments = Lincko.storage.list('comments', null, null, that.list_type, item['_id'], true);
	commentCount = comments.length;
	Elem.find('[find=commentCount]').html(commentCount);

	updated_at = new wrapper_date(item['updated_at']);
	if(skylist_textDate(updated_at)){
		updated_at = skylist_textDate(updated_at);
	}
	else{
		updated_at = updated_at.display('date_very_short');
	}
	Elem.find('[find=card_time]').html(updated_at);

	/*
	rightOptions - duedate
	*/
	Elem_rightOptions.append(that.add_rightOptionsBox(updated_at,'fa-calendar'));

	Elem.data('item_id',item['_id']);
	Elem.data('options',false);

	
	Elem.on('click', function(event){
		if( that.panyes == false ){
			that.taskClick(event,this);
		}
	});

	that.add_cardEvents(Elem);

	return Elem;
}

skylist.prototype.addFile = function(item){
	var that = this;
	var Elem = $('#-skylist_card').clone();
	var Elem_rightOptions = Elem.find('[find=card_rightOptions]').empty();
	var updated_by;
	var updated_at;

	if(item == null){
		item = {};
		item['_id'] = 'new';

	}
	Elem.prop('id','skylist_card_'+that.md5id+'_'+item['_id']);

	/*
	title
	*/
	var elem_title = Elem.find('[find=title]');
	elem_title.html(item['+name']);

	/*
	 file description and preview image
	 */
	 var fileType_class = 'fa fa-file-o';
	 var elem_leftbox = $('<span></span>').addClass('skylist_card_leftbox_fileIcon');
	 var real_url = null;
	 var thumb_url = null;
	 if(item['category'] == 'image'){
		fileType_class = 'fa fa-file-image-o';
		thumb_url = Lincko.storage.getLinkThumbnail(item['_id']);
		real_url = Lincko.storage.getLink(item['_id']);
		elem_leftbox = $('<img />').prop('src',thumb_url).click(item['_id'], function(event){
			event.stopPropagation();
			previewer.pic(event.data);
		});
	 }
	 else if(item['category'] == 'video'){
		fileType_class = 'fa fa-file-video-o';
		thumb_url = Lincko.storage.getLinkThumbnail(item['_id']);
		real_url = Lincko.storage.getLink(item['_id']);
		elem_leftbox = $('<img />').prop('src',thumb_url).click(item['_id'], function(event){
			event.stopPropagation();
			previewer.video(event.data);
		});
	 }
	 else{
	 	fileType_class = app_models_fileType.getClass(item.ori_ext);
	 	elem_leftbox.addClass(fileType_class);
	 }

	var elem_fileType = $('<div>'+Lincko.Translation.get('app', 3602, 'html')+': '+item['category']+', '+item['ori_ext'].toUpperCase()+'</div>');
	Elem.find('[find=description]').html(elem_fileType);
	Elem.find('[find=card_leftbox]').append(elem_leftbox);




	/*updated_by*/
	updated_by = item['updated_by'];
	updated_by = Lincko.storage.get("users", updated_by,"username");
	Elem.find('[find=name]').html(updated_by);
	

	/*
	comments
	*/
	var commentCount = 0;
	var comments = Lincko.storage.list('comments',null, null, that.list_type, item['_id'], true);
	commentCount = comments.length;
	Elem.find('[find=commentCount]').html(commentCount);

	updated_at = new wrapper_date(item['updated_at']);
	if(skylist_textDate(updated_at)){
		updated_at = skylist_textDate(updated_at);
	}
	else{
		updated_at = updated_at.display('date_very_short');
	}
	Elem.find('[find=card_time]').html(updated_at);


	/*
	updated_by (quickInfo)
	*/
	var fileSize = app_layers_files_bitConvert(item['size']);
	var sizeUnit = fileSize.unit;
	var sizeNum = fileSize.val;

	Elem.find('[find=quickInfo1]').html(Lincko.Translation.get('app', 3603, 'html')+': ');
	Elem.find('[find=quickInfo2]').html(sizeNum+' '+sizeUnit);


	Elem.data('item_id',item['_id']);
	Elem.data('options',false);

	
	Elem.on('click', function(event){
		if( that.panyes == false ){
			that.taskClick(event,this);
		}
	});


	that.add_cardEvents(Elem);

	return Elem;
}

skylist.prototype.add_rightOptionsBox = function(text, icon_class){
	var Elem_rightOptionsBox = $('#-skylist_rightOptionBox').clone().prop('id','');
	Elem_rightOptionsBox.find('[find=text]').html(text);
	Elem_rightOptionsBox.find('[find=icon]').addClass(icon_class);
	return Elem_rightOptionsBox;
}

skylist.prototype.add_cardEvents = function(Elem){
	var that = this;

	//icon click action to trigger text click
	Elem.find('[find=name_icon]').click(function(){
		Elem.find('[find=name]').click();
	});
	Elem.find('[find=comments_icon]').click(function(){
		Elem.find('[find=comments]').click();
	});

	Elem.find('.skylist_leftOptionBox').click(function(event){
		var itemID = Elem.data('item_id');
		var route = '';
		if( that.list_type == "tasks" ){
			route = "task/delete";
		}
		else if( that.list_type == "notes" ){
			route = "note/delete";
		}
		else if( that.list_type == "files" ){
			route = "file/delete";
		}
		
		if(route && Lincko.storage.canI('delete', that.list_type, itemID)){
			event.stopPropagation();
			event.preventDefault();
			var begin_fn = function(){
				wrapper_sendAction(
					{
						"id": itemID,
					},
					'post',
					route
				);
			};
			var complete_fn = function(){
				delete Lincko.storage.data[that.list_type][itemID];
				app_application_lincko.prepare(that.list_type+'_'+itemID, true);
			};
			that.clearOptions(Elem, begin_fn, complete_fn);
			
		} else {
			base_show_error(Lincko.Translation.get('app', 51, 'html'), true); //Operation not allowed
		}
	});

	//event actions for swipe left and right on the task
	Elem.on('mousedown touchstart', function(event){ //for firefox, event must be passed as the parameter of this fn
		//console.log(e);
		if( responsive.test("maxMobileL")){
			that.on_mousedown(event, $(this));
		}
	});
	Elem.on('mousemove touchmove', function(event){ //for firefox, event must be passed as the parameter of this fn
		if( responsive.test("maxMobileL") && that.mousedown ){
			that.on_mousemove(event);
		}
	});
	Elem.on('mouseup touchend', function(){
		if( responsive.test("maxMobileL") && that.mousedown ){
			that.on_mouseup();
		}
	});
	$('body').on("mouseleave.skylist_"+that.md5id, function(){
		Elem.mouseup();//trigger mouseup
	});
}


skylist.prototype.on_mousedown = function(event, task_elem){
	/*
		task_elem must be JQuery object of the task element at hand
	*/
	var that = this;
	that.actiontask = task_elem;
	
	that.elem_leftOptions = that.actiontask.find('[find=card_leftOptions]');
	if( responsive.test("isMobile") ){
		that.elem_rightOptions = that.actiontask.find('[find=card_rightOptions]');
	}
	that.delX_ini = event.pageX || event.originalEvent.touches[0].pageX || event.touches[0].pageX;
	that.delX_now = that.delX_ini;
	that.delY_ini = event.pageY || event.originalEvent.touches[0].pageY || event.touches[0].pageY;
	that.mousedown = true;

}

skylist.prototype.on_mousemove = function(event){
	var that = this;
	var elem_options;

	that.delX_now = that.delX;
	that.delX = (event.pageX || event.originalEvent.touches[0].pageX || event.touches[0].pageX) - that.delX_ini;
	that.delX_now = that.delX - that.delX_now;
	that.delY = (event.pageY || event.originalEvent.touches[0].pageY || event.touches[0].pageY) - that.delY_ini;


	//if past threshold, slide left or right options
	if ( that.pan_threshold.bool && Math.abs(that.delY) < that.pan_threshold.valY ){
			if(Math.abs(parseInt(that.actiontask.css('left'),10)) >= $(window).width()/2 ){return;}
			that.actiontask.css('left', that.options_startL + that.delX);
	}
	//if just past threshold, initialize
	else if ( Math.abs(that.delX) > that.pan_threshold.valX && Math.abs(that.delY) < that.pan_threshold.valY){		
		if( that.elem_rightOptions_count < 1 && that.delX < 0 ){
			return;
		}
		that.options_startL = parseInt(that.actiontask.css('left'),10);
		if(!that.options_startL){
			that.options_startL = 0;
		}
		if(that.delX > 0){//if start sliding right (leftOptions)
			that.actiontask.find('[find=card_leftOptions]').css('box-shadow','0px 1px 4px 0px rgba(0,0,0,0.50)');
		}
		/*
		if( !that.actiontask.data('options') ){
			console.log('delX: '+that.delX);
			//initialize left options
			if( that.delX > 0 ){ 
				that.elem_leftOptions.width(that.window_width*2)
					.css('left',-that.window_width*2)
					.removeClass('display_none');
				that.actiontask.data('options','left'); 
				that.options_startL = -that.window_width*2;
			}
			//initialize right options
			else if( that.delX < 0 && responsive.test("isMobile") ){ 
				that.elem_rightOptions.width(that.window_width*2)
					.css('left',that.window_width)
					.css('box-shadow','rgb(136, 136, 136) -10px 0px 7px -4px')
					.removeClass('display_none');
				that.actiontask.data('options','right');
				that.options_startL = that.window_width;
			}
			if( that.actiontask.data('options') ){
				that.actiontask.find('.app_layers_dev_skytasks_taskblur').velocity('fadeIn',500);
				that.actiontask.find('[find=task_center]').css('opacity',0.6);
			}
		}
		else if( that.actiontask.data('options')=='left' ){
			that.options_startL = parseInt(that.elem_leftOptions.css('left'),10);
		}
		else if( that.actiontask.data('options')=='right' ){
			that.options_startL = parseInt(that.elem_rightOptions.css('left'),10);
		}
		*/

		that.pan_threshold.bool = true;
		that.panyes = true; 
		//myIScrollList['app_layers_skytasks_tasklist'].disable(); //makes my ASUS phone super slow
		
	}
}

skylist.prototype.on_mouseup = function(){
	var that = this;
	
	if( that.panyes ){
		/*app_layers_skytasks_panyes=true prevents click event after panend event*/
		setTimeout(function(){ that.panyes=false }, 5);
	}
	that.mousedown = false;

	if( that.pan_threshold.bool ){
		//righthand side option
		if( parseInt(that.actiontask.css('left'),10) < 0 ){
			var rightOptions_totalW = that.elem_rightOptions_count*that.elem_rightOptions_width;
			if( (parseInt(that.actiontask.css('left'),10) <= -rightOptions_totalW ) || that.delX_now < 0 ) {
				that.actiontask.velocity({ left: -rightOptions_totalW });
			}
			else if (that.delX_now >= 0){
				that.clearOptions(that.actiontask);
				
			}
		}
		//lefthand side option
		else{
			var leftOptions_totalW = that.elem_leftOptions_count*that.elem_leftOptions_width;
			if( parseInt(that.actiontask.css('left'),10) >= leftOptions_totalW  ){
				that.actiontask.velocity({ left: leftOptions_totalW });
			}
			else{
				that.clearOptions(that.actiontask);
			}
		}
	}
	that.pan_threshold.bool = false;
}

skylist.prototype.clearOptions = function(elem_task, begin_fn, complete_fn){
	var that = this;
	if(!begin_fn){ var begin_fn = function(){}; }
	if(!complete_fn){ var complete_fn = function(){}; }
	if( !elem_task && that.elem_card_all){
		that.elem_card_all.removeAttr('style');
		that.elem_card_all.find('[find=card_leftOptions]').removeAttr('style');
		that.elem_card_all.data('options',false);
	}
	else{
		that.actiontask.data('options',false);
		elem_task.velocity( {left: 0},{
			begin: begin_fn,
			complete: function(){
				that.actiontask.find('[find=card_leftOptions]').removeAttr('style');
				complete_fn();
			},
		});
	}
}

skylist.prototype.setHeight = function(){
	var that = this;

	var parentH = 0;
	var elem_parent = that.list_wrapper.parent();
	if(elem_parent.hasClass('submenu_wrapper')){ //inside a submenu
		parentH = elem_parent.height();
		var elem_submenu_bottom = elem_parent.find('[find=submenu_wrapper_bottom]');
		if(elem_submenu_bottom){
			parentH -= elem_submenu_bottom.outerHeight();
		}
	}
	else{ //not inside a submenu
		parentH = $(window).height();
		if(responsive.test("maxMobileL")){
			parentH -= $('#app_content_menu').outerHeight();
		}
	}
	parentH -= $('#app_content_top').outerHeight();

	that.list_wrapper.height(parentH);
	that.list_subwrapper.height(parentH - that.list_subwrapper.position()['top']);

	

/*

	var parentH = 0;
	var elem_parent = that.list_wrapper.parent();
	if(elem_parent.hasClass('submenu_wrapper')){
		parentH = elem_parent.height();
		var elem_submenu_bottom = elem_parent.find('[find=submenu_wrapper_bottom]');
		if(elem_submenu_bottom){
			parentH -= elem_submenu_bottom.outerHeight();
		}
	}
	else{
		parentH = $(window).height();
		if(responsive.test("maxMobileL")){
			height -= $('#app_content_menu').outerHeight();
		}
	}

	var height = parentH - $('#app_content_top').outerHeight(); /*- $('#app_layers_dev_skytasks_navbar').outerHeight()*/
/*	
	that.list_wrapper.height(height);
	that.list_subwrapper.height(height - that.elem_navbar.outerHeight());
	*/
	//[toto] Bruno => a proposal to make it compatible with submenu/preview
	//that.list_subwrapper.height(that.list_wrapper.parent().height() - that.list_subwrapper.position()['top']);
}

skylist.prototype.checkboxClick = function(event,elem_checkbox){
	event.stopPropagation();

	var elem_task = elem_checkbox.closest('.skylist_card');
	elem_task.toggleClass('skylist_card_checked');
	/*
	elem_checkbox.toggleClass('fa fa-check');
	elem_task.toggleClass('skylist_card_opacity');
	*/
	var task = Lincko.storage.get('tasks', elem_task.data('item_id'));
	var approved = task['approved'];
	if(approved){
		approved = false;
	}
	else{
		approved = true;
	}
	wrapper_sendAction(
		{
			"id": elem_task.data('item_id'),
			"approved": approved,
		},
		'post', 'task/update');

/*
	var detail = $('#app_layers_skytasks_detail');
	if( !detail.hasClass('display_none') ){
		var taskid_detail = detail.find('[find=taskid]').html();
		var taskid_task = task.data('taskid');
		if( taskid_detail == taskid_task ){
			detail.find('.app_layers_skytasks_checkbox label').toggleClass("app_layers_skytasks_detail_checked");
		}
	}
*/
}

skylist.prototype.taskClick = function(event,task_elem){
	if( !(task_elem instanceof jQuery) ){
		task_elem = $(task_elem);
	}
	var that = this;
	var target = $(event.target);
	if( target.is('[find=checkbox]') || target.is('label') || target.is('input') || target.attr('contenteditable')=="true" || that.editing_focus || that.is_scrolling || that.elem_navbar.find('.skylist_menu_navbar_filter_pane').css('display') != 'none' || $('#burger_dropdown').length > 0 || $('#ui-datepicker-div').css('display') == 'block' ){
		return;
	}
	
	//clicking on the task will close options
	var task_elem_left = parseInt(task_elem.css('left'),10);
	if( $.isNumeric(task_elem_left) && task_elem_left != 0 ){
		that.clearOptions(task_elem);
		return;
	}
	this.openDetail(task_elem);

}

skylist.prototype.openDetail = function(/*open,*/ task_elem){
	var that = this;
	//that.list.removeClass('skylist_noPreviewLayer');
	var openSuccess = submenu_Build(
	'taskdetail', null, null, {
		"type":that.list_type, 
		"id":task_elem.data('item_id'),
	}, true);
	if( openSuccess ){
		that.elem_card_all.removeClass('skylist_card_hover');
		task_elem.addClass('skylist_card_hover');
	}
}



/*
 *menu methods (old timesort functions)-------------------------------------------------------------------------------------
*/
skylist.prototype.menu_construct = function(){
	var that = this;
	//navbar
	that.elem_navbar = $('#-skylist_menu_navbar').clone().prop('id','skylist_menu_navbar');

	//individual or group selection in navbar
	var elem_people1 = that.elem_navbar.find('[people=1]');
	var elem_people2 = that.elem_navbar.find('[people=2]');
	if( Lincko.storage.get("projects", app_content_menu.projects_id, 'personal_private') ){
		elem_people2.addClass('display_none');
	}

	elem_people1.click(function(){
		if( !$(this).hasClass('skylist_menu_selected')){
			elem_people1.toggleClass('skylist_menu_selected');
			elem_people2.toggleClass('skylist_menu_selected');
		}
		that.tasklist_update( 'people', wrapper_localstorage.uid );
	});
	elem_people2.click(function(){
		if( !$(this).hasClass('skylist_menu_selected')){
			elem_people1.toggleClass('skylist_menu_selected');
			elem_people2.toggleClass('skylist_menu_selected');
		}
		that.tasklist_update( 'people', null );
	});

/*
	that.elem_navbar.find('[people]').on('click', function(){
		var selection = $(this);
		if(selection.hasClass('skylist_menu_selected')){
			//return false;
		}
		$('#skylist_menu_navbar [people]').removeClass('skylist_menu_selected');
		selection.addClass('skylist_menu_selected');
		if( selection.attr('people') == 1 ){
			that.tasklist_update( 'people', wrapper_localstorage.uid );
		}
		else{
			that.tasklist_update( 'people', null );
		}
	});
	*/
	

	/*
		filter
	*/
	var elem_filter_pane = that.elem_navbar.find('.skylist_menu_navbar_filter_pane');
	that.elem_navbar.find('.skylist_menu_navbar_filter_icon').click(function(){
		if( elem_filter_pane.css('display')=='none' ){
			elem_filter_pane.velocity('slideDown',{
				complete: function(){
					elem_filter_pane.focus();
				}
			});
		}
		else{
			elem_filter_pane.blur();
		}
	});
	that.elem_navbar.find('.skylist_menu_navbar_filter_pane').blur(function(){
		$(this).velocity('slideUp');
	});

	//populate the filter_pane
	if( that.list_type == 'tasks' ){
		that.addFilter_tasks(elem_filter_pane);
	}


	//burger(that.elem_navbar.find('[find=search_textbox]'), 'regex');
	var elem_search_input = that.elem_navbar.find('[find=search_textbox]');
	var elem_search_overlay = that.elem_navbar.find('.skylist_menu_navbar_search_overlay');
	var elem_search_clear = that.elem_navbar.find('[find=search_clear]');

	elem_search_overlay.click(function(){
		$(this).addClass('display_none');
		elem_search_input.focus();
	});

	elem_search_clear.on('mousedown touchstart', function(event){
		event.preventDefault();
		elem_search_input.val('');
		elem_search_input.keyup();
	});

	elem_search_input.focus(function(){
		elem_search_clear.removeClass('display_none');
	});

	elem_search_input.keyup(function(event){
		var search_term = $(this).val();
		clearTimeout(that.searchTimeout);
		if(event.keyCode == 13){
			that.tasklist_update('search',search_term);
		}
		else{
			that.searchTimeout = setTimeout(function(){
				if( that.Lincko_itemsList_filter.search == search_term ){
					return false;
				}
				that.tasklist_update('search',search_term);
			},400);
		}
	});

	elem_search_input.blur(function(event){
		if( $(this).val() == '' ){
			elem_search_input.keyup();
			elem_search_clear.addClass('display_none');
			elem_search_overlay.removeClass('display_none');
		}
	});
	
	that.list_wrapper.append(that.elem_navbar);



	/*
	 * TIMESORT-----------------------------------------------------------------------------------------
	 */
	 if( !that.sort_arrayText ){
		return false;
	 }
	var sort;
	that.elem_timesort = that.elem_navbar.find('.skylist_menu_timesort');
	that.elem_timesort.append('<span class="skylist_menu_sortdot maxMobileL"></span>');
	that.elem_sortdot = that.elem_timesort.find('.skylist_menu_sortdot');
	var elem_timesort_text_wrapper = $('#-skylist_menu_timesort_text_wrapper').clone().prop('id','');
	var elem_timesort_text_wrapper_tmp;
	
	for (var i = 0; i < that.sort_array.length; ++i){
		sort = that.sort_array[i];
		elem_timesort_text_wrapper_tmp = elem_timesort_text_wrapper.clone();
		elem_timesort_text_wrapper_tmp.attr('sort',sort);
		elem_timesort_text_wrapper_tmp.find('[find=text]').html(that.sort_arrayText[i]);
		that.elem_sortdot.append('<span sort='+sort+' find="indicator" class="skylist_menu_timesort_dot">&#149;</span>');
		that.elem_sorts_text[sort] =elem_timesort_text_wrapper_tmp;
		that.elem_sortdot.before(elem_timesort_text_wrapper_tmp);
		that.elem_sorts[sort] = that.elem_timesort.find('[sort='+sort+']');
		that.sortcount = i;
	}
	that.elem_sortdot.before('<br />');
	that.elem_Jsorts = that.elem_timesort.find('[sort]');

	that.menu_makeSelection(that.sort_array[0]);


	that.elem_Jsorts.click(function(){
		var sort = $(this).attr('sort');
		if (!responsive.test("maxMobileL")){
			that.menu_makeSelection( sort );
			that.sort_fn('duedate', sort);
		}
	});

	/*hammer.js----------------------------------------------------*/
	that.elem_timesort.hammer().on("panstart", function(event){
		event.preventDefault();
		if (responsive.test("maxMobileL")){
			that.pan_direction = (event.gesture.deltaX);
			if (that.pan_direction > 0){
				that.pan_direction = "panright";
			}
			else if(that.pan_direction < 0){
				that.pan_direction = "panleft";
			}
			that.menu_sortnum_fn();

		}
	});//end of panstart

	that.elem_timesort.hammer().on("panmove", function(event){
		event.preventDefault();
		clearTimeout(that.editing_timeout);
		if (responsive.test("maxMobileL") && that.sortnum_new != null ){
			that.delX = event.gesture.deltaX;

			if( that.delX < 0 && that.pan_direction=="panright" ){
				that.pan_direction = "panleft";
				that.menu_sortnum_fn();
			}
			else if( that.delX > 0 && that.pan_direction=="panleft" ){
				that.pan_direction = "panright";
				that.menu_sortnum_fn();
			} 

			var opacity_fade = Math.abs(1/(that.delX/50));
			var opacity_show = 1 - opacity_fade;

			if ( Math.abs(that.delX) < that.pan_range_max ){
				that.elem_sorts_text[that.sort_array[that.sortnum]]
					.css("left",that.delX)
					.css("opacity",opacity_fade);
				that.elem_sorts_text[that.sort_array[that.sortnum_new]]
					.removeClass('display_none')
					.css( "left",Math.sign(that.delX)*(Math.abs(that.delX)-that.pan_range_max) )
					.css("opacity",opacity_show);
			}
		}
	});//end of panmove

	that.elem_timesort.hammer().on("panend", function(event){
		event.preventDefault();
		if (responsive.test("maxMobileL") && that.sortnum_new != null){

			if (Math.abs(that.delX) < that.pan_range_min){ //threshold when timesort will scroll to next sort
				//undo timesort change
				that.menu_sortnum_fn_rev();
			}
			
			that.elem_sorts_text[that.sort_array[that.sortnum_new]].velocity({left: 0},{
				complete: function(){
					if( that.Lincko_itemsList_filter.duedate == null){
						that.Lincko_itemsList_filter.duedate = -1;
					}
					if(that.sort_array[that.sortnum_new] != that.Lincko_itemsList_filter.duedate){
						that.sort_fn('duedate',that.sort_array[that.sortnum_new]);
					}
				}
			});
			that.menu_makeSelection(that.sort_array[that.sortnum_new]);
			//that.elem_sorts_text[that.sort_array[that.sortnum]].velocity({opacity:0},500); 
		
		}

	});//end of panend
	/*hammer.js END--------------------------------------*/
	/*
	 * end of TIMESORT-----------------------------------------------------------------------------------------
	 */

} //construct END

skylist.prototype.menu_makeSelection = function(selection){
	var that = this;
	if(that.elem_sorts[selection]){
		//that.elem_Jsorts.find('[find=indicator]').removeClass('icon-Indicator');
		//that.elem_sorts[selection].find('[find=indicator]').addClass('icon-Indicator');

		that.elem_Jsorts.removeClass('skylist_menu_timesort_selected');
		that.elem_sorts[selection].addClass('skylist_menu_timesort_selected');

		that.active_sort = selection;
	}
	if (responsive.test("maxMobileL")){
		$.each(that.elem_sorts_text, function(name,value){
			value.addClass('display_none');//.removeClass('skylist_menu_selected');
		});
		that.elem_sorts[selection].removeClass('display_none');
		
		that.elem_Jsorts.removeAttr("style");
		/*
		$.each(that.elem_sorts_text, function(name,value){
			value.addClass('display_none');//.removeClass('skylist_menu_selected');
		});
		that.elem_Jsorts.removeClass('skylist_menu_timesort_selected');
		that.elem_sorts[selection].removeClass('display_none').addClass('skylist_menu_timesort_selected');
		
		that.elem_Jsorts.removeAttr("style");
		*/
	}
}//makeSelection END

skylist.prototype.menu_sortnum_fn = function(){
	var that = this;
	that.sortnum = that.sort_array.indexOf(that.active_sort);
	if (that.pan_direction == "panleft") {
		if (that.sortnum >= that.sortcount){ that.sortnum_new = 0;}
		else { that.sortnum_new = that.sortnum+1;}
	}
	else if (that.pan_direction == "panright") {
		if (that.sortnum <= 0){ that.sortnum_new = that.sortcount;}
		else { that.sortnum_new = that.sortnum-1;}
	}
} //end of sortnum_fn

skylist.prototype.menu_sortnum_fn_rev = function(){
	var that = this;
	var sortnum_temp;
	sortnum_temp = that.sortnum_new;
	that.sortnum_new = that.sortnum;
	that.sortnum = sortnum_temp;
}//end of sortnum_fn_rev
/*
 * END OF menu methods (old timesort functions)--------------------------------------------------------------------------
*/

skylist.prototype.addFilter_tasks = function(elem_filter_pane){
	var that = this;
	$('#-skylist_filter_tasks_radio_wrapper').clone().prop('id','').appendTo(elem_filter_pane);
	$('#-skylist_filter_tasks_divider').clone().prop('id','').appendTo(elem_filter_pane);
	$('#-skylist_filter_tasks_checkbox_wrapper').clone().prop('id','').appendTo(elem_filter_pane);

	var elem_filterIcon = that.elem_navbar.find('.skylist_menu_navbar_filter_icon');

	that.elem_navbar.find('[find=radio_wrapper] .skylist_menu_navbar_filter_pane_optionWrapper').click(function(){
		var elem_radio = $(this).closest('[find=radio_wrapper]').find('.skylist_menu_navbar_filter_pane_optionWrapper [find=radio]');
		if( $(this).find('[find=radio]').hasClass('fa-circle') ){
			that.tasklist_update('sort_alt', !that.Lincko_itemsList_filter.sort_alt );
			elem_filterIcon.click();
			return false;
		}
		else{
			elem_radio.removeClass('fa-circle');
			$(this).find('[find=radio]').toggleClass('fa-circle');
			that.tasklist_update('sort_alt', !that.Lincko_itemsList_filter.sort_alt );
			elem_filterIcon.click();
		}
	});
	that.elem_navbar.find('[find=checkbox_wrapper] .skylist_menu_navbar_filter_pane_optionWrapper').click(function(){
		$(this).find('[find=checkbox]').toggleClass('fa-check');
		that.tasklist_update('hide_completed', !that.Lincko_itemsList_filter.hide_completed );
		elem_filterIcon.click();
	});
}


skylist.prototype.minTablet = function(){
	var that = this;
	if(!that.list_wrapper){return;}

	that.list_subwrapper.find('input[find=card_time_calendar_timestamp]').prop('disabled',false);
	that.list_subwrapper.find('input[find=name]').prop('disabled',false);

	if( that.elem_Jsorts ){
		that.elem_Jsorts.removeClass('display_none');
	}

	that.elem_card_all.find('input').prop('disabled',false);
}

skylist.prototype.maxMobileL = function(){
	var that = this;
	if(!that.list_wrapper){return;}
	//that.list_subwrapper.find('input[find=card_time_calendar_timestamp]').prop('disabled',true);
	that.list_subwrapper.find('input[find=name]').prop('disabled',true);
	if(that.elem_Jsorts ){
		that.elem_Jsorts.not('.skylist_menu_timesort_dot').addClass('display_none');
	}
	//that.elem_navbar.find('.icon-Indicator').closest('.skylist_menu_timesort_text_wrapper').removeClass('display_none');
	that.elem_navbar.find('.skylist_menu_timesort_selected').removeClass('display_none');

	that.elem_card_all.find('input').prop('disabled',true);

}

skylist.prototype.minMobileL = function(){
	var that = this;
	if(!that.list_wrapper){return;}
	that.list.find('[find=card_rightOptions]').removeAttr("style");
	that.list.find('[find=card_center]').removeAttr('style');
}

skylist.prototype.isMobile = function(){
	var that = this;
	if(!that.list_wrapper){return;}
}

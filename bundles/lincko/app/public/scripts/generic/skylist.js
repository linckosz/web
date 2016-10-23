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
		//'people': wrapper_localstorage.uid,
		'people': null,
		'duedate': -1, //show all
		//'timesort': null,
		'search': '',
		'sort_alt': false,
		'hide_completed': false,
		'view': 'card',
	};
	/*if( Lincko.storage.get("projects", app_content_menu.projects_id, 'personal_private') ){
		this.Lincko_itemsList_filter.people = null;
	}*/

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
	that.list_wrapper = that.list_wrapper.recursiveEmpty().addClass('skylist_wrapper');
	that.list_subwrapper = $('#-skylist_subwrapper').clone().prop('id','');

	that.filter_updateSettings(false); //must be before menu_construct to know which filter to be on when loaded
	that.menu_construct();

	that.list = $('#-skylist').clone()
		.prop('id','skylist_'+that.md5id)
		.appendTo(that.list_subwrapper);
	that.list_subwrapper.appendTo(that.list_wrapper);

	that.elem_newcardCircle = $('#-skylist_newcardCircle').clone()
		.prop('id','skylist_newcardCircle_'+that.md5id);

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
			submenu_Build('taskdetail_new', false, false, 
				{
					"type":that.list_type,
					"id": 'new', 
				}, true);
		});
	}
	that.elem_newcardCircle.appendTo(that.list_wrapper);

	if(that.list_type == 'tasks'){
		var elem_sort = $('<div>').addClass('display_none skylist_sortBtn').text(Lincko.Translation.get('app', 62, 'html'));//Sort
		elem_sort.click(function(){
			elem_sort.addClass('display_none');
			that.tasklist_update();
		});
		that.list_subwrapper.append(elem_sort);
	}




	app_application_lincko.add(
		that.list.prop('id'),
		'projects_'+app_content_menu.projects_id,
		function(){
			var scollToBottom = false;
			//console.log('project update');
			var param = {};
			param.new = true;
			var newItems = Lincko.storage.list(that.list_type, null, param, 'projects', app_content_menu.projects_id, true);

			var itemlist_new = that.list_filter();

			//check for fake items within the itemlist_new
			var fakeItems = Lincko.storage.sort_items(itemlist_new, 'fake');
			if(fakeItems.length){
				var fakeItems_obj = {};
				$.each(fakeItems, function(i, item){
					fakeItems_obj[item.temp_id] = item;
				});
			}

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
						var elem_newCard = that.addCard(itemlist_new[i_new]);//.css('display','none');
						if($('#'+elem_newCard.prop('id')).length){ //elem with same id exists, so skip' 
							continue;
						}
						else if(fakeItems_obj && itemlist_new[i_new].fake && fakeItems_obj[itemlist_new[i_new].temp_id].elem_replaced){
							//fake but already replaced
							continue;
						}
						else if(fakeItems_obj && !itemlist_new[i_new].fake && fakeItems_obj[itemlist_new[i_new].temp_id] ){
							var fakeItem = fakeItems_obj[itemlist_new[i_new].temp_id];
							var elem_toReplace = $('#'+this.id).find('[item_id='+fakeItem['_id']+']');

							if(elem_toReplace.hasClass('skylist_card_hover')){
								elem_newCard.addClass('skylist_card_hover');
							}
							elem_toReplace.find('input').blur();
							$(elem_toReplace.find('[find=card_time_calendar_timestamp]')).datepicker('hide');
							//of elem_toReplace was a paperView_bottom elem, add the same attr
							/*if(elem_toReplace.attr('paperView_bottom')){
								elem_newCard.attr('paperView_bottom',true);
							}*/
							elem_toReplace.replaceWith(elem_newCard);
							that.DOM_updated();

							//elem_newCard.velocity('fadeOut',{mobileHA: hasGood3Dsupport, duration: 200,}).velocity('fadeIn', {mobileHA: hasGood3Dsupport,});

							delete Lincko.storage.data[fakeItem._type][fakeItem['_id']];
							fakeItems_obj[fakeItem.temp_id].elem_replaced = true;
							continue;
						}

						//if item has paperView (fake one created by user in paperview), then attach all the way at the end
						if(itemlist_new[i_new].paperView){
							scollToBottom = true;
							$(elem_cards.get(elem_cards.length-1)).after(elem_newCard);
							if(!that.list_subwrapper.find('.skylist_paperView_divider').length){
								that.list_subwrapper.find('.skylist_sortBtn').removeClass('display_none');
								elem_newCard.before('<div class="skylist_paperView_divider"></div>');
							}
							
						}
						else if( oldItem_id ){
							$(elem_cards[i_old]).before(elem_newCard);
						}
						else{//if new card should be attached at the end
							i_old--;
							$(elem_cards[i_old]).after(elem_newCard);
						}
						elem_newCard.velocity('slideDown',{
							mobileHA: hasGood3Dsupport,
							complete: function(){
								$(this).attr('style','');
								that.DOM_updated();
								if(scollToBottom){
									myIScrollList['skylist_'+that.md5id].scrollTo(0, myIScrollList['skylist_'+that.md5id].maxScrollY, 500);
									scrollToBottom = false;
								}
							}
						});
					}
					else{
						i_old++;
					}
				} //END of for loop
			}
			//one last check to update any fake cards
			that.updateFakeCards();
		}//end of the function attached to this project range
	);

}//END OF subConstruct_default

skylist.prototype.destroy = function(){
	var that = this;

	if(typeof skylist_enquire[that.md5id] == "undefined"){
		return false;
	}

	enquire.unregister(responsive.minTablet, skylist_enquire[that.md5id].minTablet);
	enquire.unregister(responsive.maxMobileL, skylist_enquire[that.md5id].maxMobileL);
	enquire.unregister(responsive.minMobileL, skylist_enquire[that.md5id].minMobileL);
	enquire.unregister(responsive.isMobile, skylist_enquire[that.md5id].isMobile);
	delete skylist_enquire[that.md5id];


	that.list_wrapper.recursiveEmpty();
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
		that.Lincko_itemsList = app_models_history.tabList(false, 'projects', app_content_menu.projects_id);
	}
	else if (that.list_type == "global_chats") {
		that.Lincko_itemsList = app_models_history.tabList();
	}
	else{
		that.Lincko_itemsList = Lincko.storage.list(that.list_type, null, null, 'projects', app_content_menu.projects_id, true);
		if( that.list_type == "tasks" ){
			var item;
			for( var i in that.Lincko_itemsList ){
				if(that.Lincko_itemsList[i]._tasksup){ //dont show subtasks (i.e. tasks with _tasksup)
					delete that.Lincko_itemsList[i];
				}
				else{
					that.Lincko_itemsList[i]['duedate'] = that.Lincko_itemsList[i]['start'] + that.Lincko_itemsList[i]['duration'];
				}
			}
			that.Lincko_itemsList = Lincko.storage.sort_items(that.Lincko_itemsList, 'duedate', 0, -1, true);
		}
		else if( that.list_type == 'notes'){
			that.Lincko_itemsList = Lincko.storage.sort_items(that.Lincko_itemsList, 'updated_at', 0, -1, false);
		}
	}
}

skylist.prototype.store_all_elem = function(){
	if(typeof this.list != "undefined"){
		//should be lanunched when all DOM is loaded
		//this.elem_taskblur_all = this.tasklist.find('.app_layers_dev_skytasks_taskblur');
		this.elem_cardcenter_all = this.list.find('[find=card_center]');
		this.elem_leftOptions_all = this.list.find('[find=card_leftOptions]');
		this.elem_rightOptions_all = this.list.find('[find=card_leftOptions]');
		this.elem_card_all = this.list.find('[find=card]');
	}
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
			items_filtered = Lincko.storage.sort_items( items, 'updated_at', 0, -1, false );
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

		$.each(searchbar.filterLinckoItems(items, filter_array), function(i, item){
			items_filtered.push(item);
		});



		/*var item = null;
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
							if(!item['_users']){ //not assigned
								break;
							}
							else if( userid in item['_users'] && item['_users'][userid]['in_charge'] ){
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
		*/
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

	var isDueThisTime = false;
	var months_obj = {
		long: (new wrapper_date()).month,
		short: (new wrapper_date()).month_short,
		shortNum: (new wrapper_date()).month_short_num,
	};

	var dueMonthIndex = new Date((item.start + item.duration)*1000).getMonth();

	$.each(months_obj, function(key,val){
		if(val[dueMonthIndex].toLowerCase().includes(time.toLowerCase())){
			isDueThisTime = true;
			return false;
		}
	});
	
	return isDueThisTime;
}

skylist.prototype.list_filter = function(filter_type){
	var that = this;
	that.list_wrapper.attr('view', that.Lincko_itemsList_filter.view);
	that.generate_Lincko_itemsList();
	var items_filtered = that.Lincko_itemsList;

	if( that.list_type == "tasks" || that.list_type == "notes" || that.list_type == "files" ){
		items_filtered = that.filter_by_search( items_filtered, that.Lincko_itemsList_filter.search );
		items_filtered = that.filter_by_people( items_filtered, that.Lincko_itemsList_filter.people );
		items_filtered = that.filter_by_duedate( items_filtered, that.Lincko_itemsList_filter.duedate );
		items_filtered = that.filter_by_sort_alt( items_filtered, that.Lincko_itemsList_filter.sort_alt );
		items_filtered = that.filter_by_hide_completed( items_filtered, that.Lincko_itemsList_filter.hide_completed );
	}
	if(filter_type != 'search'){ //dont update settings object if it is just search
		that.filter_updateSettings();
	}

	return items_filtered;
}

skylist.prototype.tasklist_update = function(type, filter_by){
	var that = this;

	if( type ){
		that.Lincko_itemsList_filter[type] = filter_by;
	}
	var items_filtered = that.list_filter(type, filter_by);

	var iscroll_elem;
	var cards_elem;
	if( that.list.children('.iscroll_sub_div').length > 0 ){
		iscroll_elem = that.list.children('.iscroll_sub_div');
	}else{
		iscroll_elem = that.list;
	}
	cards_elem = iscroll_elem.children().not('.burger_typeTask');

	cards_elem.recursiveRemove();
	if( items_filtered.length < 1 ){
		iscroll_elem.append(that.noResult_str);
	}
	else{
		for (var i in items_filtered){
			item = items_filtered[i];
			iscroll_elem.append(that.addCard(item));
		}
	}

	iscroll_elem.children().not('.burger_typeTask').velocity("fadeIn",{
		mobileHA: hasGood3Dsupport,
		complete: 200,
		complete: function(){
			that.store_all_elem();
			that.window_resize();
		}
	});


	return;

	/*that.list.velocity("fadeOut",{
		mobileHA: hasGood3Dsupport,
		duration: 200,
		complete: function(){
			if( that.list.find('.iscroll_sub_div').length > 0 ){
				iscroll_elem = that.list.find('.iscroll_sub_div').recursiveEmpty();
			}else{
				iscroll_elem = that.list.recursiveEmpty();
			}

			if(that.list_type == 'tasks'){
				iscroll_elem.append(burgerN.typeTask(null, that));
			}

			if( items_filtered.length < 1 ){
				var noResultString = that.noResult_str;
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
		mobileHA: hasGood3Dsupport,
		duration: 200,
		complete: function(){
			that.window_resize();
		}
	});*/
}
skylist.prototype.iscrollRefresh = function(){
	var that = this;
	if( myIScrollList && myIScrollList['skylist_'+that.md5id] ){
		myIScrollList['skylist_'+that.md5id].refresh();
	}
}

skylist.prototype.DOM_updated = function(){
	var that = this;
	that.store_all_elem();
	that.iscrollRefresh();
}

skylist.prototype.addCard_all = function(){
	var that = this;
	if(that.list_type == 'tasks'){
		that.list_wrapper.append(burgerN.typeTask(null, that, 30));
		that.list.append(burgerN.typeTask(null, that));
	}
	
	var items;
	items = that.list_filter();
	if( items.length < 1 ){
		that.list.append(that.noResult_str);
	}
	else{
		var item;
		var Elem_tp = $('<span>');
		for (var i in items){
			item = items[i];
			item['duedate'];
			Elem_tp.append(that.addCard(item));
		}
		that.list.append(Elem_tp.children()); //toto => try to not draw here, but inside a timeout to use multi-thread
		//This help to use multi-thread and draw the DOM faster
		//toto => but it generate a bug in task list by making disappearing some tasks
		setTimeout(function(){
			//that.list.append(Elem_tp.children());
		}, 0);
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

	if(elem_card == false){ return $('<div>'); }


	if( that.list_type == 'tasks' || that.list_type == 'notes' || that.list_type == 'files' ){
		//elem_card.find('[find=card_spacestick]').removeClass('display_none');
		app_application_lincko.add(
			elem_card.prop('id'),
			that.list_type+'_'+item['_id'],
			function(){
				var elem = $('#'+this.id);
				var item_new = Lincko.storage.get(that.list_type , item['_id']);
				if( /*!item_new ||*/ (typeof item_new == 'object' && 'deleted_at' in item_new && item_new['deleted_at']) || (typeof item_new == 'object' && item_new._parent[1] != app_content_menu.projects_id) ){ //for delete
					elem.velocity('slideUp',{
						mobileHA: hasGood3Dsupport,
						complete: function(){
							$(this).recursiveRemove();
							if( that.list_subwrapper.find('[find=card]').length < 1 ){
								that.tasklist_update();
							}
							else{
								that.DOM_updated();
							}
						}
					});
				}
				else if(item_new){ //for update
					if(that.Lincko_itemsList_filter.view == 'paper' 
						&& typeof this.updated == 'object' && this.updated[that.list_type+'_'+item['_id']]
						&& Object.keys(this.updated[that.list_type+'_'+item['_id']]).length < 4
						&& (this.updated[that.list_type+'_'+item['_id']]._files || this.updated[that.list_type+'_'+item['_id']]._children)){ //for now, only for _files and _children (i.e. comments) changes
						that.paperview_taskCard_update(elem, item_new, this.updated[that.list_type+'_'+item['_id']]);
					}
					else{
						elem.velocity('fadeOut',{
							mobileHA: hasGood3Dsupport,
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
			}
		);
	} //END OF 'tasks' || 'notes'
	else if (that.list_type == 'chats' || that.list_type == 'global_chats') {
		//toto => rebuild the chat list here
		//console.log(that.list_type);
		app_application_lincko.add(
			elem_card.prop('id'),
			[item['root_type']+'_'+item['root_id'], item['name']],
			function(){
				var elem = $('#'+this.id);
				var item_new = app_models_history.tabList(1, item['root_type'], item['root_id'])[0];
				that.addChat(item_new);
			}
		);
	}
	if(that.elem_rightOptions_count < 1){
		elem_card.find('[find=card_rightOptions]').addClass('display_none');
	}
	return elem_card;
}

skylist.prototype.addChat = function(item){
	var that = this;
	var Elem = $('#skylist_card_'+that.md5id+'_'+item['root_type']+'_'+item['root_id']);
	var new_elem = false;
	var subm;
	if(Elem.length <= 0){
		new_elem = true;
		Elem = $('#-skylist_card').clone();
		Elem.prop('id', 'skylist_card_'+that.md5id+'_'+item['root_type']+'_'+item['root_id']);
	}
	
	if(new_elem){
		Elem.find('[find=card_center]').addClass('skylist_chat_card_center');
		var notif = $('#-models_history_chats_notif').clone();
		notif.prop('id', '');
		notif.addClass('models_history_chats_notif');
		Elem.find('[find=card_leftbox]').append(item['picture'].clone()).addClass('skylist_chat_card_leftbox');
		Elem.find('[find=history_picture]').append(notif).addClass('skylist_chat_history_picture base_color_text_linckoOrange');
		Elem.find('[find=card_time]').addClass('skylist_chat_card_time');
		Elem.find('[find=card_textwrapper]').addClass('skylist_chat_card_textwrapper');
		Elem.attr('timestamp', item['timestamp']);

		if(item['root_type']=="chats"){
			Elem.click(item, function(event){
				var preview = true; //By default it's listed inside working area
				var layer = false;
				//Get the subemnu if it's inside it
				var submenu = submenu_getById(that.md5id);
				if(submenu){
					preview = submenu.preview;
					layer = submenu.layer+1;
					submenu.Wrapper().find(".skylist_chat_card_hover").removeClass("skylist_chat_card_hover");
					$(this).find('[find=card_center]').addClass("skylist_chat_card_hover");
				} else if($("#skylist_layer_chats").length>0){
					$("#skylist_layer_chats").find(".skylist_chat_card_hover").removeClass("skylist_chat_card_hover");
					$(this).find('[find=card_center]').addClass("skylist_chat_card_hover");
				}
				var id = event.data["root_id"];
				var title = event.data["title"];
				subm = submenu_Build("newchat", layer, false, {
					type: 'chats',
					id: id,
					title: title,
				}, preview);

				app_application_lincko.add(
					Elem.prop('id'),
					'submenu_hide_'+subm.preview+'_'+subm.id,
					function(){
						if($('#'+this.id).length>0){
							$('#'+this.id).find('[find=card_center]').removeClass("skylist_chat_card_hover");
						}
					}
				);

			});
		} else if(item['root_type']=="projects"){
			Elem.click(item, function(event){
				var preview = true; //By default it's listed inside working area
				var layer = false;
				//Get the subemnu if it's inside it
				var submenu = submenu_getById(that.md5id);
				if(submenu){
					preview = submenu.preview;
					layer = submenu.layer+1;
					submenu.Wrapper().find(".skylist_chat_card_hover").removeClass("skylist_chat_card_hover");
					$(this).find('[find=card_center]').addClass("skylist_chat_card_hover");
				} else if($("#skylist_layer_chats").length>0){
					$("#skylist_layer_chats").find(".skylist_chat_card_hover").removeClass("skylist_chat_card_hover");
					$(this).find('[find=card_center]').addClass("skylist_chat_card_hover");
				}
				var id = event.data["root_id"];
				var title = event.data["title"];
				if(id == Lincko.storage.getMyPlaceholder()['_id']){
					title = Lincko.Translation.get('app', 2502, 'html'); //Personal Space
				}
				subm = submenu_Build("newchat", layer, false, {
					type: 'history',
					id: id,
					title: title,
				}, preview);

				app_application_lincko.add(
					Elem.prop('id'),
					'submenu_hide_'+subm.preview+'_'+subm.id,
					function(){
						if($('#'+this.id).length>0){
							$('#'+this.id).find('[find=card_center]').removeClass("skylist_chat_card_hover");
						}
					}
				);
			});
		}

	} else {
		var notif = Elem.find('[find=chats_notif]');
	}

	if(item['notif']){
		notif.removeClass('display_none');
	} else {
		notif.addClass('display_none');
	}
		
	Elem.find('[find=title]')
		.addClass('ellipsis')
		.html(wrapper_to_html(item['title']));
	Elem.find('[find=card_time]').html(item['date']);

	Elem.find('[find=description]')
		.addClass('ellipsis')
		.html(wrapper_to_html(wrapper_flat_text(item['content'])));

	if(item['by']>0){
		var username = $('<span>').addClass('skylist_chat_card_username').html(Lincko.storage.get('users', item["by"], "username")+": ");
		Elem.find('[find=description]').prepend(username);
	}

	//toto => need to add deletion slide feature
	//that.add_cardEvents(Elem);
	return Elem;
}

skylist.prototype.paperview_taskCard_update = function(elem, item, updated){
	var that = this;
	var elem_card_rightbox = elem.find('[find=card_rightbox]');
	
	//if links were updated
	if((typeof updated == 'boolean' && updated) || updated._files || updated._notes){
		var elem_expandable_links = elem.children('[find=expandable_links]');
		var elem_expandable_links_id = elem_expandable_links.prop('id');
		var elem_expandable_links_addNew = elem_expandable_links.find('[find=btn_addNew]');

		if(updated._files){		
			if(elem_expandable_links.children('.iscroll_sub_div').length){
				elem_expandable_links = elem_expandable_links.children('.iscroll_sub_div');
			}

			$.each(item._files, function(fileID, obj){
				var elem_linkboxExist = elem_expandable_links.children('[_files='+fileID+']');
				if(elem_linkboxExist.length){ return; }

				//remove loading box
				var elem_loading = elem_expandable_links.children('[temp_id='+Lincko.storage.get('files', fileID, 'temp_id')+']');
				if(elem_loading.length){
					elem_loading.recursiveRemove();
				}

				var elem_linkboxNew = that.make_fileLinkbox(fileID);
				if(elem_linkboxNew){
					elem_expandable_links_addNew.before(elem_linkboxNew);
				}
			});
		}

		//update count
		var linkCount = 0;
		if(item._files){
			linkCount += Object.keys(item._files).length;
		}
		if(item._notes){
			linkCount += Object.keys(item._notes).length;
		}	
		elem.find('[find=linkCount]').text(linkCount);

		//check and remove no longer existing file links
		var elem_fileboxExist = elem_expandable_links.children('[_files]');
		if(elem_fileboxExist.length){
			if(!item._files){
				elem_fileboxExist.recursiveRemove();
			}
			else{
				$.each(elem_fileboxExist, function(i, elem){
					var elem = $(elem);
					if(!item._files[elem.attr('_files')]){
						elem.recursiveRemove();
					}
				});
			}
		}

		//if first file added, reset the buttons and open the expandable
		if(linkCount == 1){
			elem_card_rightbox.find('[find=links_icon]').removeClass('skylist_greyColor');
			elem_expandable_links_addNew.click(function(event){
				event.stopPropagation();
				if(item.fake){
					app_upload_open_files('projects', item._parent[1] , false, true, {link_queue: true, item_parent: item});
				}
				else{
					app_upload_open_files(that.list_type, item._id, false, true, {item_parent: item});
				}
			});

			elem_card_rightbox.children('[find=links_wrapper]').off('click');
			elem_card_rightbox.children('[find=links_wrapper]').click(function(event){
				event.stopPropagation();
				that.paperView_toggleExpandable($('#'+elem_expandable_links_id));
			});
		}


		//refresh iscroll
		if(myIScrollList[elem_expandable_links_id]){
			myIScrollList[elem_expandable_links_id].refresh();
			elem_expandable_links.find('img').load(function(){
				myIScrollList[elem_expandable_links_id].refresh();
			});
		}
	}//end of update links


	//if comments update
	if((typeof updated == 'boolean' && updated) || updated._children){
		var elem_expandable_comments = elem.find('[find=expandable_comments]');
		var primaryComments = Lincko.storage.sort_items(Lincko.storage.list('comments',null, null, that.list_type, item['_id'], false), 'created_at', 0, -1, false);

		$.each(primaryComments, function(i, comment){
			//redraw any existing comment bubbles
			if(elem_expandable_comments.children('[rootcomment_id='+comment._id+']').length){
				elem_expandable_comments.children('[rootcomment_id='+comment._id+']').replaceWith(taskdetail_generateCommentThread(comment));
				return;
			}

			//latest comment thread bubble will be drawn no matter what
			if(i == 0){
				elem_expandable_comments.children('[find=newPrimaryComment_input]').before(taskdetail_generateCommentThread(comment));
			}
		});

		//clean any fake comments
		$.each(elem_expandable_comments.children('[rootcomment_id]'), function(i, elem){
			var commentID = $(elem).attr('rootcomment_id');
			if(!Lincko.storage.get('comments', commentID)){
				this.recursiveRemove();
			}
		});

		//update count
		var commentCount = 0;
		var comments = Lincko.storage.list('comments',null, null, that.list_type, item['_id'], true);
		commentCount = comments.length;
		elem.find('[find=commentCount]').html(commentCount);
		if(commentCount == 0){
			elem_card_rightbox.find('[find=comments_icon]').addClass('skylist_greyColor');
		}
		else{
			elem_card_rightbox.find('[find=comments_icon]').removeClass('skylist_greyColor');
		}
		that.iscrollRefresh();
	}//end of comments update

}

skylist.prototype.make_noteLinkbox = function(noteCount, clickFn){
	var elem_linkbox = $('<div>').addClass('skylist_paperView_expandable_boxsize').attr('find','notes').click(function(){
		if(typeof clickFn == 'function'){
			clickFn();
		}
	});
	var elem_icon = $('<div find="icon">').addClass('icon-New-Notes');
	var elem_noteCount = $('<div find="text">').html('<div find="count">'+noteCount+'</div>'+Lincko.Translation.get('app', 63, 'html'));
	elem_linkbox.append(elem_icon);
	elem_linkbox.append(elem_noteCount);

	return elem_linkbox;
}

skylist.prototype.make_fileLinkbox = function(fileID){
	var item_file = null;
	if(typeof fileID == 'object'){
		item_file = fileID;
	}
	else{
		item_file = Lincko.storage.get('files', fileID);
		if(!item_file){ return false; }
	}

	var fileType_class = 'fa fa-file-o';
	var elem_linkbox = $('<span></span>');
	var real_url = null;
	var thumb_url = null;
	thumb_url = Lincko.storage.getLinkThumbnail(fileID);
	real_url = Lincko.storage.getLink(fileID);
	if(item_file['category'] == 'image'){
		fileType_class = 'fa fa-file-image-o';
		elem_linkbox = $('<img />').prop('src',thumb_url).attr('draggable', false).click(fileID, function(event){
			event.stopPropagation();
			previewer.pic(event.data);
		});
	}
	else if(item_file['category'] == 'video'){
		fileType_class = 'fa fa-file-video-o';
		elem_linkbox = $('<img />').prop('src',thumb_url).attr('draggable', false).click(fileID, function(event){
			event.stopPropagation();
			previewer.video(event.data);
		});
	}
	else{
		fileType_class = app_models_fileType.getClass(item_file.ori_ext);
		elem_linkbox.addClass(fileType_class).click(function(){
			submenu_Build(
			'taskdetail', null, null, {
				"type":'files', 
				"id":fileID,
			}, true);
		});
	}

	elem_linkbox = $('<div>').addClass('skylist_paperView_expandable_boxsize').attr('_files', fileID).html(elem_linkbox);
	var elem_name = $('<div find="text">').addClass('ellipsis').html(item_file['+name']);
	elem_linkbox.append(elem_name);
	return elem_linkbox;
}




skylist.prototype.addTask = function(item){
	var that = this;
	var Elem = $('#-skylist_card').clone();
/*	if(that.Lincko_itemsList_filter.view == 'paper' && item && item.fake){
		Elem.attr('paperView_bottom', true);
	}*/


	var Elem_checkbox = $('#-skylist_checkbox').clone().prop('id','');
	Elem.find('[find=card_leftbox]').html(Elem_checkbox);
	var Elem_rightOptions = Elem.find('[find=card_rightOptions]').recursiveEmpty();
	var created_by;
	var in_charge = '';
	var in_chargeID = null;
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
	Elem.attr('item_id', item['_id']);
	Elem.attr('temp_id', item.temp_id);
	if(item.fake){ Elem.attr('fake',true); }

	/*
		add class to entire card based on task status
	*/
	if( item['approved'] ){
		Elem.addClass('skylist_card_checked');
	}


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
		//for paper, direct edit, for others, settimeout
		if(that.Lincko_itemsList_filter.view == 'paper' && !supportsTouch){
			elem_title.attr('contenteditable',contenteditable);
		}
		else{
			elem_title.on('mousedown touchstart', function(event){ 
				if( responsive.test("maxMobileL") &&  that.Lincko_itemsList_filter.view != 'paper' ){ return true; } //for paper mode, mobile can edit
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
		}

		elem_title.keydown(function(event){ return;
			if(event.keyCode == 13){
				event.preventDefault();
				$(this).focusout();
				$(this).blur();
			}
		});
		elem_title.blur(function(){
			if(that.Lincko_itemsList_filter.view != 'paper'){
				that.editing_target.attr('contenteditable',false);
			}

			//@ burger
			var inChargeID_new = null;
			var elem_users = $(this).find('[userid]');
			if(elem_users.length){
				inChargeID_new = $(elem_users[0]).attr('userid');
			}
			
			//++ burger
			var duration = null;
			var elem_dateWrapper = $(this).find('[find=dateWrapper]');
			if(elem_dateWrapper.length){
				var dateval = $(elem_dateWrapper[0]).attr('val');
				if(dateval == 0){
					dateval = new wrapper_date().getEndofDay(); //end of day today
				}
				else if(dateval == 1){
					dateval = new wrapper_date().getEndofDay() + 86400; //end of day tomorrow
				}
				duration = dateval - item['start'];
			}


			var new_text = $.trim($(this).contents().filter(function() {
			  return this.nodeType == 3;
			}).text());
			$(this).html(new_text);



			if(new_text != item['+title'] || inChargeID_new || duration){
				var param = {
					id: item['_id']
				};

				if(new_text != item['+title']){
					param.title = new_text;
				}
				if(inChargeID_new){
					param['users>in_charge'] = {};
					param['users>in_charge'][inChargeID_new] = true;

					//unassign anyone that have been previously assigned
					$.each(item._users, function(userid, obj){
						if(inChargeID_new == userid){return;}
						if(obj.in_charge){
							param['users>in_charge'][userid] = false;
						}
					});
				}

				if(duration){
					param.duration = duration;
				}



				/*wrapper_sendAction({
				id: item['_id'],
				title: new_text,
				}, 'post', 'task/update', 
				function(msg, data_error, data_status, data_msg){ 
					if(data_error){
						app_application_lincko.prepare(item['_type']+'_'+item['_id']);
					}
				}, function(){ app_application_lincko.prepare(item['_type']+'_'+item['_id']); });*/


				skylist.sendAction.tasks(
					param, 
					item, 'task/update',
					function(msg, data_error, data_status, data_msg){ 
						if(data_error){
							app_application_lincko.prepare(item['_type']+'_'+item['_id']);
						}
					},
					function(){ app_application_lincko.prepare(item['_type']+'_'+item['_id']); }
				);

			}
		});
		//burger(Elem.find('[find=title]'), 'regex');
		burgerN.regex(Elem.find('[find=title]'), item);
	}


	/*in_charge*/
	if(item['_users']){
		for (var i in item['_users']){
			if( i && item['_users'][i]['in_charge']==true ){
				in_charge += Lincko.storage.get("users", i ,"username");
				in_chargeID = i;
			}
		}
	}
	if( !in_charge || in_charge == 'false' ){
		in_charge = Lincko.Translation.get('app', 3608, 'html'); //'Not Assigned'
	}

	if(that.Lincko_itemsList_filter.view == 'paper'){
		var elem_atUser = $('<span contenteditable="false"></span>');
		elem_atUser.attr('userid',in_chargeID).attr('find','name');
		elem_atUser.addClass('burger_tag');
			elem_title.append(elem_atUser);
	}

	//Elem.find('[find=name_hidden]').toggleClass('display_none');
	Elem.find('[find=name]').html(in_charge);
	//burger(Elem.find('input[find=name_hidden]'), '_users', item);
	if( !Lincko.storage.get("projects", app_content_menu.projects_id, 'personal_private') && !responsive.test("maxMobileL") ){
		burgerN.assignTask(Elem.find('input[find=name_hidden]'), item);
	}
	
	
	/*
	rightOptions - in_charge
	*/
	if( !Lincko.storage.get("projects", app_content_menu.projects_id, 'personal_private') ){
		var elem_rightOptions_inCharge = that.add_rightOptionsBox(in_charge,'fa-user');
		elem_rightOptions_inCharge.click(function(){
			var param = {};
			param.type = 'tasks';
			param.item_obj = item;
			param.contactsID = burgerN.generate_contacts(item);
			param.elem_input = Elem.find('input[find=name_hidden]');
			param.selectOne = true;
			submenu_Build('burger_contacts', true, null, param);
		});
		Elem_rightOptions.append(elem_rightOptions_inCharge);
	}
	

	/*
	comments
	*/
	var commentCount = 0;
	var comments = Lincko.storage.list('comments',null, null, that.list_type, item['_id'], true);
	commentCount = comments.length;
	Elem.find('[find=commentCount]').html(commentCount);
	if(commentCount == 0 && that.Lincko_itemsList_filter.view == 'paper'){
		Elem.find('[find=card_rightbox] [find=comments_icon]').addClass('skylist_greyColor');
	}

	var elem_expandable_comments = Elem.find('[find=expandable_comments]')
		.prop('id',Elem.prop('id')+'_expandable_comments')
		.click(function(event){
			event.stopPropagation();
		});
	var elem_addNewCommentBubble = taskdetail_generateNewCommentBubble(item['_type'], item['_id'], null, false, true).addClass('display_none').attr('find', 'newPrimaryComment_input');
	elem_expandable_comments.prepend(elem_addNewCommentBubble);
	var elem_addNewCommentBtn = elem_expandable_comments.find('[find=btn_addNew]');
	elem_addNewCommentBtn.click(function(){
		elem_addNewCommentBubble.removeClass('display_none');
		$(this).addClass('display_none');
		elem_addNewCommentBubble.find('[find=addNewComment_text]').focus();
	});
	elem_addNewCommentBubble.find('[find=addNewComment_text]').blur(function(){
		$(this).val('');
		elem_addNewCommentBubble.addClass('display_none');
		elem_addNewCommentBtn.removeClass('display_none');
	});
	if(commentCount > 0){
		var mostRecent_primaryComment = Lincko.storage.sort_items(Lincko.storage.list('comments',null, null, that.list_type, item['_id'], false), 'created_at', 0, -1, false)[0];
		elem_expandable_comments.prepend(taskdetail_generateCommentThread(mostRecent_primaryComment));
	}
	else{

	}
	Elem.find('[find=card_rightbox] [find=comments_wrapper]').click(function(event){
		event.stopPropagation();
		var cb_complete = function(){
			elem_addNewCommentBtn.click();
		}
		if(elem_expandable_comments.find('[rootcomment_id]').length){
			that.paperView_toggleExpandable(elem_expandable_comments);
		}
		else{
			that.paperView_toggleExpandable(elem_expandable_comments, cb_complete);
		}
	});


	/*
	links
	*/
	var linkCount = 0;
	var item_linked = Lincko.storage.list_links(item._type, item._id);
	if(item_linked){
		$.each(item_linked, function(cat, obj){
			linkCount += Object.keys(obj).length;
		});
	}
	Elem.find('[find=linkCount]').text(linkCount);

	if(that.Lincko_itemsList_filter.view == 'paper'){
		var elem_expandable_links = Elem.find('[find=expandable_links]')
			.addClass('overthrow')
			.prop('id',Elem.prop('id')+'_expandable_links')
			.click(function(event){
				event.stopPropagation();
			});
		wrapper_IScroll_options_new[elem_expandable_links.prop('id')] = { 
			scrollX: true, 
			scrollY: false, 
			mouseWheel: false, 
			fadeScrollbars: true,
		};
		var elem_btn_addNew = elem_expandable_links.find('[find=btn_addNew]');
		if(item._files){
			$.each(item._files, function(fileID, obj){
				var elem_linkbox = that.make_fileLinkbox(fileID);
				if(elem_linkbox){
					elem_btn_addNew.before(elem_linkbox);
				}
				return;
			});
		}
		if(item._notes){
			var notesCount = Object.keys(item._notes).length;
			elem_btn_addNew.before(that.make_noteLinkbox(notesCount, function(){Elem.click();}));
		}

		if(linkCount > 0){
			if(supportsTouch){ //for touch devices, always keep the expandable links open
				elem_expandable_links.css('display','block');
			}
			elem_btn_addNew.click(function(event){
				event.stopPropagation();
				if(item.fake){
					app_upload_open_files('projects', item._parent[1] , false, true, {item_parent: item, link_queue: true});
				}
				else{
					app_upload_open_files(that.list_type, item._id, false, true, {item_parent: item});
				}
			});

			Elem.find('[find=card_rightbox] [find=links_wrapper]').click(function(event){
				event.stopPropagation();
				that.paperView_toggleExpandable(elem_expandable_links);
			});
		}
		else{
			Elem.find('[find=card_rightbox] [find=links_icon]').addClass('skylist_greyColor');
			Elem.find('[find=card_rightbox] [find=links_wrapper]').click(function(event){
				event.stopPropagation();
				if(item.fake){
					app_upload_open_files('projects', item._parent[1] , false, true, {item_parent: item, link_queue: true});
				}
				else{
					app_upload_open_files(that.list_type, item._id, false, true, {item_parent: item});
				}
			});
		}

		app_application_lincko.add(elem_expandable_links.prop('id'), 'upload', function(){
			var elem_id = this.id;
			var parent_type = this.action_param.parent_type;
			var parent_id = this.action_param.parent_id;

			var elem_temp_id = $('#'+elem_id).find('[temp_id]');
			$.each(elem_temp_id, function(i, elem){
				var temp_id = $(elem).attr('temp_id');
				var item_file = Lincko.storage.list('files',1,{temp_id: temp_id})[0];
				if(item_file){
					if(!Lincko.storage.data[parent_type][parent_id]._files){
						Lincko.storage.data[parent_type][parent_id]._files = {};
					}
					if(Lincko.storage.data[parent_type][parent_id]._files[item_file._id]){return;}

					Lincko.storage.data[parent_type][parent_id]._files[item_file._id] = true;
					var prepare_param = {};
					prepare_param[parent_type+'_'+parent_id] = {_files: true};
					app_application_lincko.prepare(parent_type+'_'+parent_id, true, prepare_param);
				}
			});

			
			$.each(app_upload_files.lincko_files, function(i, lincko_file){
				//if parent matches
				if(lincko_file.lincko_parent_type == parent_type && lincko_file.lincko_parent_id == parent_id){
					var temp_id = lincko_file.lincko_temp_id;
					var progress = lincko_file.lincko_progress;
					var status = lincko_file.lincko_status;
					var elem_temp_id = $('#'+elem_id).find('[temp_id='+temp_id+']');
					if(status == 'done' && elem_temp_id.length){
							//elem_temp_id.recursiveRemove();
							//elem_temp_id = null;
					}
					else if(elem_temp_id.length){
						//update progress bar or number
						elem_temp_id.find('[find=bar]').css('width', progress+'%');
					}
					else{
						var loadingBox = $('<div>').addClass('skylist_paperView_expandable_boxsize skylist_paperView_expandable_uploading').attr('temp_id',temp_id);
						var fileName = $('<div>').text(lincko_file.lincko_name).attr('find','file_name').addClass('ellipsis');
						var bar_container = $('<div>').attr('find', 'bar_container').html('<div find="bar"></div>');
						loadingBox.append(fileName);
						loadingBox.append(bar_container);
						//loadingBox.html('<div class="fa fa-spinner fa-spin fa-3x fa-fw"></div>');
						$('#'+elem_id).find('[find=btn_addNew]').before(loadingBox);

						//force expand if not expanded
						if($('#'+elem_id).css('display') != 'block'){
							that.paperView_toggleExpandable($('#'+elem_id));
						}
					}
				}
			});

		}, {parent_type: item._type, parent_id: item._id});
	}//end of setup for paperview only
	

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
	var now = new wrapper_date();
	if( now.time > duedate.time && !item.approved){
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

	if(that.Lincko_itemsList_filter.view == 'paper'){
		var elem_ppDate = $('<span find="dateWrapper" contenteditable="false"></span>');
		elem_ppDate.attr('val',(item['start']+item['duration']));
		elem_ppDate.text(duedate);
		elem_ppDate.addClass('burger_tag');
		elem_title.append(elem_ppDate);
		elem_title.append(' ');
	}
	
	var elem_calendar = Elem.find('[find=card_time]');
	var elem_calendar_timestamp = Elem.find('[find=card_time_calendar_timestamp]');

	elem_calendar_timestamp.removeClass('display_none');

	elem_calendar.html(duedate);
	elem_calendar_timestamp.val((item['start']+item['duration'])*1000);
	
	//enable calendar burger for landscape tablet and up
	if(!responsive.test("maxMobileL")){
		burger_calendar(elem_calendar_timestamp, elem_calendar );
	}
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

			/*wrapper_sendAction({
				id: item['_id'],
				duration: duration_timestamp,
			}, 'post', route);*/

			skylist.sendAction.tasks(
				{
					id: item['_id'],
					duration: duration_timestamp,
				}, item, route);
		}
	});

	/*
	rightOptions - duedate
	*/
	var elem_rightOptions_duedate = that.add_rightOptionsBox(duedate,'fa-calendar');
	elem_rightOptions_duedate.click(function(){
		var param = {elem_inputOrig:elem_calendar_timestamp };
		submenu_Build('calendar', true, false, param);
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
	
	/*if(that.Lincko_itemsList_filter.view  == 'paper'){

	}
	else{
		Elem.on('click', function(event){
			if( that.panyes == false ){
				that.taskClick(event,this);
			}
		});
	}*/

	that.add_cardEvents(Elem);

	return Elem;
}

skylist.draw_noteCard = function(item){
	var Elem = $('#-skylist_card').clone().removeAttr('id');
	var Elem_rightOptions = Elem.find('[find=card_rightOptions]').recursiveEmpty();
	var updated_by;
	var updated_at;

	/*
	title
	*/
	var elem_title = Elem.find('[find=title]');
	elem_title.html(item['+title']);

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
	comments
	*/
	var commentCount = 0;
	var comments = Lincko.storage.list('comments', null, null, item['_type'], item['_id'], true);
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

	return Elem;
}

skylist.prototype.addNote = function(item){
	var that = this;

	var Elem = skylist.draw_noteCard(item);
	Elem.prop('id','skylist_card_'+that.md5id+'_'+item['_id']);
	var Elem_rightOptions = Elem.find('[find=card_rightOptions]');

	/*
	title
	*/
	var contenteditable = false;
	var elem_title = Elem.find('[find=title]');
	if( wrapper_localstorage.uid in item['_perm'] && item['_perm'][wrapper_localstorage.uid][0] > 1 ){ //RCU and beyond
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
	rightOptions - updated_by
	*/
	Elem_rightOptions.append(that.add_rightOptionsBox(updated_by,'fa-user'));

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






/*
	if there is no issue, delete code below
*/

	var Elem = $('#-skylist_card').clone();
	var Elem_rightOptions = Elem.find('[find=card_rightOptions]').recursiveEmpty();
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

skylist.draw_fileCard = function(item){
	if(!item['_perm'] || typeof item['_perm'] !== 'object'){ return false; }
	var Elem = $('#-skylist_card').clone().removeAttr('id');
	var Elem_rightOptions = Elem.find('[find=card_rightOptions]').recursiveEmpty();
	var updated_by;
	var updated_at;

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
		elem_leftbox = $('<img />').prop('src',thumb_url);
	 }
	 else if(item['category'] == 'video'){
		fileType_class = 'fa fa-file-video-o';
		thumb_url = Lincko.storage.getLinkThumbnail(item['_id']);
		real_url = Lincko.storage.getLink(item['_id']);
		elem_leftbox = $('<img />').prop('src',thumb_url);
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
	var comments = Lincko.storage.list('comments',null, null, item['_type'], item['_id'], true);
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

	return Elem;
}

skylist.prototype.addFile = function(item){
	if(!item['_perm'] || typeof item['_perm'] !== 'object'){ return false; }
	var that = this;

	var Elem = skylist.draw_fileCard(item);
	Elem.prop('id','skylist_card_'+that.md5id+'_'+item['_id']);

	/*
	title
	*/
	var elem_title = Elem.find('[find=title]');
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
			if(new_text != item['+name']){
				wrapper_sendAction({
				id: item['_id'],
				name: new_text,
				}, 'post', 'file/update', 
				function(msg, data_error, data_status, data_msg){ 
					if(data_error){
						app_application_lincko.prepare(item['_type']+'_'+item['_id']);
					}
				}, function(){ app_application_lincko.prepare(item['_type']+'_'+item['_id']); });
			}
		});
	}


	var elem_leftbox = Elem.find('[find=card_leftbox]');
	if(item['category'] == 'image'){
		elem_leftbox.click(item['_id'], function(event){
			event.stopPropagation();
			previewer.pic(event.data);
		});
	 }
	 else if(item['category'] == 'video'){
		elem_leftbox.click(item['_id'], function(event){
			event.stopPropagation();
			previewer.video(event.data);
		});
	 }

	Elem.data('item_id',item['_id']);
	Elem.data('options',false);

	
	Elem.on('click', function(event){
		if( that.panyes == false ){
			that.taskClick(event,this);
		}
	});


	that.add_cardEvents(Elem);

	return Elem;











/*
	if there is no issue, delete code below
*/

	var Elem = $('#-skylist_card').clone();
	var Elem_rightOptions = Elem.find('[find=card_rightOptions]').recursiveEmpty();
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
			if(new_text != item['+name']){
				wrapper_sendAction({
				id: item['_id'],
				name: new_text,
				}, 'post', 'file/update', 
				function(msg, data_error, data_status, data_msg){ 
					if(data_error){
						app_application_lincko.prepare(item['_type']+'_'+item['_id']);
					}
				}, function(){ app_application_lincko.prepare(item['_type']+'_'+item['_id']); });
			}
		});
	}




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
	Elem.find('[find=card_bottom] [find=name_icon]').click(function(){
		Elem.find('[find=card_bottom] [find=name]').click();
	});
	Elem.find('[find=card_bottom] [find=comments_icon]').click(function(){
		Elem.find('[find=card_bottom] [find=comments]').click();
	});

	Elem.find('.skylist_leftOptionBox').click(function(event){
		var canDelete = true;
		var itemID = Elem.data('item_id');
		var itemObj = Lincko.storage.get(that.list_type, itemID);
		var route = '';
		if( that.list_type == "tasks" ){
			route = "task/delete";
		}
		else if( that.list_type == "notes" ){
			route = "note/delete";
		}
		else if( that.list_type == "files" ){
			route = "file/delete";
			if(itemObj._tasks || itemObj._notes){
				canDelete = false;
			}
		}

		if(canDelete && route && Lincko.storage.canI('delete', that.list_type, itemID) || canDelete){
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

			if(Elem.attr('fake') && that.list_type == "tasks" ){ //fake then queue
				begin_fn = function(){
					skylist.sendAction.tasks({ "id": itemID }, null, route);
				};
			}

			var complete_fn = function(){
				Lincko.storage.data[that.list_type][itemID].deleted_at = new wrapper_date().timestamp;
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
		if( responsive.test("maxMobileL") && that.Lincko_itemsList_filter.view != 'paper'){
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
				that.actiontask.find('.app_layers_dev_skytasks_taskblur').velocity('fadeIn', {
					mobileHA: hasGood3Dsupport,
					duration: 500,
				});
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
				that.actiontask.velocity({ left: -rightOptions_totalW }, {
					mobileHA: hasGood3Dsupport,
				});
			}
			else if (that.delX_now >= 0){
				that.clearOptions(that.actiontask);
				
			}
		}
		//lefthand side option
		else{
			var leftOptions_totalW = that.elem_leftOptions_count*that.elem_leftOptions_width;
			if( parseInt(that.actiontask.css('left'),10) >= leftOptions_totalW  ){
				that.actiontask.velocity({ left: leftOptions_totalW }, {
					mobileHA: hasGood3Dsupport,
				});
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
	else if(that.actiontask){
		that.actiontask.data('options',false);
		elem_task.velocity( {left: 0},{
			mobileHA: hasGood3Dsupport,
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
	if(!that.list_wrapper) return false;
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

	var paperView_typeTask_H = 0;
	if(that.Lincko_itemsList_filter.view == 'paper'){
		paperView_typeTask_H = that.list_wrapper.children('.burger_typeTask').outerHeight();
	}


	that.list_wrapper.height(parentH);
	that.list_subwrapper.height(parentH - that.list_subwrapper.position()['top'] - paperView_typeTask_H);

	

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
	var that = this;
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

	var param = {
		"id": elem_task.data('item_id'),
		"approved": approved,
	};
	skylist.sendAction.tasks(param, task, 'task/update');
	//wrapper_sendAction( param, 'post', 'task/update');
	Lincko.storage.data.tasks[task._id].approved = approved;
	app_application_lincko.prepare('tasks_'+task._id, true);

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

skylist.prototype.paperView_toggleExpandable = function(elem_expandable, cb_complete){
	var that = this;
	elem_expandable.removeClass('display_none');
	if(elem_expandable.css('display') != 'block'){
		elem_expandable.velocity("slideDown", {
			mobileHA: hasGood3Dsupport,
			complete: function(){
				if(typeof cb_complete == 'function'){ cb_complete(); }
				$(window).resize();
				/*that.window_resize();
				if(myIScrollList[elem_expandable.prop('id')]){
					myIScrollList[elem_expandable.prop('id')].refresh();
				}*/
			}
		});
	}
	else{
		elem_expandable.velocity("slideUp", {
			mobileHA: hasGood3Dsupport,
			complete: function(){
				that.window_resize();
			}
		});
	}
}

skylist.prototype.openDetail = function(/*open,*/ task_elem){
	var that = this;
	var item_id = task_elem.data('item_id');
	var item = Lincko.storage.get(that.list_type, item_id);
	if(!item || item.fake){ //prevent fake items from opening
		return false;
	}

	//that.list.removeClass('skylist_noPreviewLayer');
	var openSuccess = submenu_Build(
	'taskdetail', null, null, {
		"type":that.list_type, 
		"id":item_id,
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
		elem_people1.addClass('display_none');
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

	//make selection if it is to show single user view
	if(that.Lincko_itemsList_filter.people){
		elem_people1.toggleClass('skylist_menu_selected');
		elem_people2.toggleClass('skylist_menu_selected');
	}

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
	var elem_filterBtn = that.elem_navbar.find('.skylist_menu_navbar_filter_icon');
	elem_filterBtn.click(function(){
		if( elem_filter_pane.css('display')=='none' ){
			elem_filterBtn.attr('active',true);
			elem_filter_pane.velocity('slideDown',{
				mobileHA: hasGood3Dsupport,
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
		elem_filterBtn.attr('active',false);
		$(this).velocity('slideUp', {
			mobileHA: hasGood3Dsupport,
		});
	});


	//populate the filter_pane
	if( that.list_type == 'tasks' ){
		that.addFilter_tasks(elem_filter_pane);
	}


	//build searchbar
	var searchbarInst = null;
	var searchbar_keyup = function(words){
		that.tasklist_update('search',words);
	}
	searchbarInst = searchbar.construct(searchbar_keyup);
	that.elem_navbar.append(searchbarInst.elem.addClass('skylist_menu_navbar_search'));


	//burger(that.elem_navbar.find('[find=search_textbox]'), 'regex');
	/*var elem_search_input = that.elem_navbar.find('[find=search_textbox]');
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
	});*/
	
	that.list_wrapper.append(that.elem_navbar);



	/*
	 * TIMESORT-----------------------------------------------------------------------------------------
	 */
	 if( !that.sort_arrayText ){
	 	if( Lincko.storage.get("projects", app_content_menu.projects_id, 'personal_private') ){
	 		that.elem_navbar.find('.skylist_menu_timesort').addClass('display_none');
	 	}
		return false;
	 }
	var sort;
	that.elem_timesort = that.elem_navbar.find('.skylist_menu_timesort');
	that.elem_sortdot = $('<span class="skylist_menu_sortdot maxMobileL"></span>');
	that.elem_timesort.append(that.elem_sortdot);
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

	//that.menu_makeSelection(that.sort_array[0]);
	that.menu_makeSelection(that.Lincko_itemsList_filter.duedate);


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
				mobileHA: hasGood3Dsupport,
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
			//that.elem_sorts_text[that.sort_array[that.sortnum]].velocity({opacity:0}, {mobileHA: hasGood3Dsupport, duration: 500,}); 
		
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
	var elem_block1 = elem_filter_pane.find('[find=filter_block1]');
	var elem_block2 = elem_filter_pane.find('[find=filter_block2]');
	$('#-skylist_filter_tasks_view_wrapper').clone().prop('id','').appendTo(elem_block1);
	$('#-skylist_filter_tasks_radio_wrapper').clone().prop('id','').appendTo(elem_block2);
	$('#-skylist_filter_tasks_divider').clone().prop('id','').appendTo(elem_block2);
	$('#-skylist_filter_tasks_checkbox_wrapper').clone().prop('id','').appendTo(elem_block2);

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

	that.elem_navbar.find('[find=card]').click(function(){
		that.Lincko_itemsList_filter.view = 'card';
		that.tasklist_update();
		elem_filterIcon.click();
		elem_block1.find('td').toggleClass('skylist_lightblueBG');
	});

	that.elem_navbar.find('[find=paper]').click(function(){
		that.Lincko_itemsList_filter.view = 'paper';
		that.list_subwrapper.children('.skylist_sortBtn').addClass('display_none');
		that.tasklist_update();
		elem_filterIcon.click();
		elem_block1.find('td').toggleClass('skylist_lightblueBG');
	});


	//make filter selection based on the Lincko_itemsList_filter object
	if(that.Lincko_itemsList_filter.sort_alt){
		that.elem_navbar.find('[find=radio_wrapper] [find=radio]').toggleClass('fa-circle');
	}
	if(that.Lincko_itemsList_filter.hide_completed){
		that.elem_navbar.find('[find=checkbox_wrapper] [find=checkbox]').toggleClass('fa-check');
	}

	if(that.Lincko_itemsList_filter.view == 'card'){
		elem_block1.find('td[find=card]').addClass('skylist_lightblueBG');
	}
	else if(that.Lincko_itemsList_filter.view == 'paper'){
		elem_block1.find('td[find=paper]').addClass('skylist_lightblueBG');
	}


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


skylist.prototype.updateFakeCards = function(){
	var that = this;
	var updated = false;
	elem_fakes = that.list.find('[fake]');

	$.each(elem_fakes, function(i,elem){
		elem = $(elem);
		var temp_id = elem.attr('temp_id');
		var param = {
			temp_id: temp_id,
		}
		var item_real = Lincko.storage.list(that.list_type, 1, param, 'projects', app_content_menu.projects_id, false);
		$.each(item_real, function(j, item){
			if(!item.fake){
				var elem_newCard = that.addCard(item);
				elem.find('input').blur();
				if($(elem.find('[find=card_time_calendar_timestamp]'))){
					$(elem.find('[find=card_time_calendar_timestamp]')).datepicker('hide');
				}
				elem.replaceWith(elem_newCard);
				elem_newCard.velocity('fadeOut',{
					mobileHA: hasGood3Dsupport,
					duration: 200,
				}).velocity('fadeIn', {
					mobileHA: hasGood3Dsupport,
				});
				updated = true;
			}
		});
	});

	if(updated){ that.DOM_updated(); }
}

//get lincko settings object, and update the skylist filter settings
//sendAction == false will grab the filter settings from lincko settings object and set it as the instance's filter
skylist.prototype.filter_updateSettings = function(sendAction){
	var that = this;
	if(that.list_type != 'tasks' && that.list_type != 'notes' && that.list_type != 'files'){ return; }
	if(typeof sendAction === 'undefined'){ sendAction = true; }
	
	var settings_new = Lincko.storage.getSettings();

	//offline settings
	//var settings_old = Lincko.storage.settings;

	if(typeof settings_new !== 'object' && typeof settings_new.length === 'undefined'){
		settings_new = {};
	}
	if(!settings_new.skylist){
		settings_new.skylist = {};
	}
	if(!settings_new.skylist.filter){
		settings_new.skylist.filter = {};
	}
	if(!settings_new.skylist.filter[app_content_menu.projects_id]){
		settings_new.skylist.filter[app_content_menu.projects_id]  = {};
	}

	if(!sendAction){
		if(settings_new.skylist.filter[app_content_menu.projects_id][that.list_type]){
			$.each(settings_new.skylist.filter[app_content_menu.projects_id][that.list_type], function(filterType, val){
				that.Lincko_itemsList_filter[filterType] = val;
			});
			//that.Lincko_itemsList_filter = settings_new.skylist.filter[app_content_menu.projects_id][that.list_type];
		}
		return;
	}
	
	settings_new.skylist.filter[app_content_menu.projects_id][that.list_type] = JSON.parse(JSON.stringify(that.Lincko_itemsList_filter));
	settings_new.skylist.filter[app_content_menu.projects_id][that.list_type].search = ''; //search filter is not saved
	Lincko.storage.settingsLocal = settings_new;
	wrapper_sendAction({settings: JSON.stringify(settings_new)}, 'post', 'data/settings');
	//offline settings
	/*Lincko.storage.settings = settings_new;
	wrapper_localstorage.encrypt('settings', Lincko.storage.settings);*/
}


/*
 *	skylist sendActionQueue system
 *	1. if item is not 'fake' -> run wrapper_sendAction
 *	2. if item is 'fake' 
 *		(1) check skylist.sendActionQueue object & queue there if temp_id key exist
 *		(2) if temp_id key doesn't exist, check if there is real item in Lincko.storage.data
 *			1. if real item exists, run wrapper_sendAction with real id
 *			2. if real item doesn't exist, then....error??
 */
skylist.sendActionQueue = {
	tasks: {
		run: function(temp_id){
			if(!skylist.sendActionQueue.tasks[temp_id]){ return; }
			var items = Lincko.storage.list('tasks', null, {temp_id: temp_id}, 'projects', app_content_menu.projects_id, false);
			var id_real = null;
			$.each(items, function(i,item){
				if(!item.fake){
					id_real = item._id;
				}
			});
			$.each(skylist.sendActionQueue.tasks[temp_id], function(i, val){
				if(typeof val == 'function'){ val(id_real); }
			});
			delete skylist.sendActionQueue.tasks[temp_id];
		},
		//'tempid33gdkflsf':[function1, function2, function3],
	}, //this object must hold objects with temp_id as key and array of functions as value
}

skylist.sendAction = {

	//note the second parameter is 'item' not 'method'
	tasks: function(param, item, action, cb_success, cb_error, cb_begin, cb_complete){
		if(typeof cb_success==="undefined") { cb_success = null; }
		if(typeof cb_error==="undefined") { cb_error = null; }
		if(typeof cb_begin==="undefined") { cb_begin = null; }
		if(typeof cb_complete==="undefined") { cb_complete = null; }

		var id = param.id || param._id;
		if(!item){ var item = Lincko.storage.get('tasks',id); }
		var temp_id = item.temp_id;

		var sendActionFN = function(id){
			if(id){
				delete param.id, delete param._id;
				param.id = id;
			}
			if(Object.keys(param).length < 2){ return; }//if param only has id, no point to sendAction
			wrapper_sendAction(param, 'post', action, cb_success, cb_error, cb_begin, cb_complete);
		}


		if(!item.fake || !temp_id){ //if item is not fake, or temp_id doesnt exist, then just sendAction anyway and see what happens
			sendActionFN();
		}
		else{//if item is fake
			if(typeof skylist.sendActionQueue.tasks[temp_id] != 'undefined'){ //if fake item has been registered in the queue
				skylist.sendActionQueue.tasks[temp_id].push(sendActionFN);//add to queue
			}
			else{ //if fake item is not already reigstered in queue
				var item_real = Lincko.storage.list('tasks', null, {temp_id:temp_id}, null, null, false);
				if(item_real.length){ 
					$.each(item_real, function(i,item){
						if(!item.fake){
							sendActionFN(item._id); 
						}
					});
				}
				else{ skylist.sendActionQueue.tasks[temp_id].push(sendActionFN); /*add to queue, but this is probably ERROR*/ }
			}
		}
		
	},//end of tasks

}

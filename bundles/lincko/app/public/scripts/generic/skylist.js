//Category 36

var skylist_calcDuedate = function(task_obj){
	var duedate;
	if(!task_obj.start){
		duedate = null;
	} else {
		duedate = new wrapper_date(parseInt(task_obj.start,10) + parseInt(task_obj.duration,10));
	}
	return duedate;
}
var skylist_textDate = function(date){
	//param: wrapper_date instance OR null
	//returns text for TODAY, TOMORROW
	//returns false if not
	if(!date){
		return Lincko.Translation.get('app', 103, 'js'); //None
	}
	if( date.happensSomeday(0) ){
		return Lincko.Translation.get('app', 3302, 'js').toUpperCase(); //today
	}
	else if( date.happensSomeday(1) ){
		return Lincko.Translation.get('app', 3303, 'js').toUpperCase(); //tomorrow
	}
	else if( date.happensSomeday(-1) ){
		return Lincko.Translation.get('app', 3304, 'js').toUpperCase(); //yesterday
	}
	else{
		return false;
	}
}

var skylist = function(list_type, list_wrapper, sort_arrayText, subConstruct, rightOptionCount, leftOptionCount, id){
	this.that = this;
	var that = this;

	that.pid = app_content_menu.projects_id;
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

	//chartJS doughnut chart instances
	this.rings = {};
	this.timeout_updateRings;

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
		'showLinks': true,
		'view': 'card',
	};
	if(this.list_type == 'tasks'){
		this.Lincko_itemsList_filter.view = 'paper';
		this.Lincko_itemsList_filter.sort_alt = 'due';
		this.Lincko_itemsList_filter.hide_completed = this.pid > 0 ? false:true;
	}

	//paging
	this.paging_triggerOffset = wrapper_performance.powerfull ? 500 : 0; //px
	this.itemsPerPage = wrapper_performance.powerfull ? 60 : 20;
	this.id_pageLoadSpinner = that.md5id+'_skylist_pageLoadSpinner';
	this.Lincko_itemsList_paged = []; //list of items grouped into pages
	/*--reset these values upon new list---*/
	this.currentPage = 0;
	this.pagesLoaded = {}; //stores boolean value for each page to indicate which pages are added to DOM
	this.reversePaging = false;
	this.allPagesLoaded = false;
	this.inputterAddedItems = {}; //keys are temp_ids
	/*--------------------------------------*/

	


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
	that.list_wrapper = that.list_wrapper.recursiveEmpty(0).addClass('skylist_wrapper').attr('pid', that.pid);
	that.list_subwrapper = $('#-skylist_subwrapper').clone().removeAttr('id');
	that.list = $('#-skylist').clone().prop('id','skylist_'+that.md5id);
	that.list_wrapper.append(that.list_subwrapper);
	that.list_subwrapper.append(that.list);
	that.elem_newcardCircle = $('#-skylist_newcardCircle').clone()
		.prop('id','skylist_newcardCircle_'+that.md5id);


	//touch specific css (i.e. no hover for touch)
	that.list_wrapper.addClass(supportsTouch ? 'skylist_hasTouch' : 'skylist_noTouch');

	
	//filte_update settings must be before menu_construct to know which filter to be on when loaded
	that.filter_updateSettings(false); 
	that.addCard_all();
	that.menu_construct();


	/*functions that are specific to each module*/
	if( that.subConstruct ){
		that.subConstruct();
	} else {
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
			that.is_scrolling = true;
			burger_global_dropdown.hide_all();
		});//scrollStart

		IScroll.on('scrollEnd', function(){
			that.is_scrolling = false;

			if(!that.allPagesLoaded){
				if(!that.reversePaging && this.y <= this.maxScrollY + that.paging_triggerOffset && that.Lincko_itemsList_paged[that.currentPage+1]){
					that.addNextPage();
				} 
				else if(that.reversePaging && this.y >= 0 - that.paging_triggerOffset){
					that.addPrevPage();
				}
			}
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

	//update tooltips
	var tooltip_text = null;
	if(that.list_type == 'tasks'){ tooltip_text = Lincko.Translation.get('app', 3620, 'js'); } //Add a new task
	else if(that.list_type == 'notes'){ tooltip_text = Lincko.Translation.get('app', 3623, 'js'); } //Add a new note
	else if(that.list_type == 'chats'){ tooltip_text = Lincko.Translation.get('app', 3627, 'js'); } //Add a new chat group
	else if(that.list_type == 'files'){ tooltip_text = Lincko.Translation.get('app', 3626, 'js'); } //Attach a new file

	if(tooltip_text){ that.elem_newcardCircle.attr('title', tooltip_text); }
	

	if(that.list_type == 'files'){
		that.elem_newcardCircle.click(function(){
			app_upload_open_files('projects', app_content_menu.projects_id);
		});
	}
	else{
		that.elem_newcardCircle.click(function(){
			var submenu_taskdetail = submenu_Build_return('taskdetail_new', false, false, 
				{
					"type":that.list_type,
					"id": 'new', 
				}, true, false);
			if(submenu_taskdetail.param.elem_autoFocus){
				submenu_taskdetail.param.elem_autoFocus.focus();
			}
		});
	}
	that.elem_newcardCircle.appendTo(that.list_wrapper);

	if(that.list_type == 'tasks'){
		var elem_sort = $('<div>').addClass('display_none skylist_sortBtn').text(Lincko.Translation.get('app', 62, 'html'));//Sort
		elem_sort.click(function(){
			elem_sort.addClass('display_none');
			that.tasklist_update();
		});
		that.elem_btn_sort = elem_sort;
		that.list_subwrapper.append(elem_sort);
	}

	var sync_range = app_content_menu.projects_id ? 'projects_'+app_content_menu.projects_id : 'projects';
	app_application_lincko.clean(that.list.prop('id'));
	app_application_lincko.add(
		that.list.prop('id'),
		sync_range,
		function(){
			var sync_range = this.action_param.sync_range;
			if( typeof this.updated == 'object' 
				&& typeof this.updated[sync_range] == 'object' 
				&& !this.updated[sync_range]._children){ return; }

			var that = this.action_param.skylist;
			var exitSync = false;


			if($('#'+this.id).find('[find=card]').length < 1){//if nothing on the list
				that.tasklist_update();
				return false;
			}

			var jumpToLastPage = false;
			var param = {};
			param.new = true;
			var elem_iscroll = that.list.children('.iscroll_sub_div').length ? that.list.children('.iscroll_sub_div') : that.list;

			var items_paged = that.update_pagingList(that.list_filter());
			

			//update global view rings
			if(/*that.pid == 0*/true){ that.updateRings(); }

			//there are no items. item deletion is done inside the individual item sync function
			if(items_paged[0].length < 1){ return false; }

			//add last page if it hasnt been added and there are items in inputterAddedItems
			if(!that.allPagesLoaded && !$.isEmptyObject(that.inputterAddedItems) && !that.reversePaging){
				that.addLastPage();
				jumpToLastPage = true;
			}

			var items_top = []; //all the items that have already been loaded
			$.each(that.pagesLoaded, function(page, loaded){
				if(loaded){
					//pages loaded and items paged in the instance are inconsistent, so reset list
					if(typeof items_paged[page] != 'object'){
						that.tasklist_update();
						exitSync = true;
						return false;
					}
					$.merge(items_top, items_paged[page]);
				}
			});
			if(exitSync){ return false; } //due to inconsistency, sync function no longer valid

			//from items_top remove any that were added by inputter
			var items_top_clone = $.merge([],items_top);
			var spliceOffset = 0;
			$.each(items_top_clone, function(i, item){
				if(that.inputterAddedItems[item.temp_id]){
					items_top.splice(i+spliceOffset);
					spliceOffset--;
				}
			});


			//divide dom elem into regular cards or cards added by inputter (below blue line)
			var elem_cards_top = [];
			var elem_cards_bottom = [];
			$.each( $('#'+this.id).find('[find=card]'), function(i, elem){
				var temp_id = $(elem).attr('temp_id');
				if($.inArray(temp_id, Object.keys(that.inputterAddedItems)) > -1){
					elem_cards_bottom.push($(elem));
				} else {
					elem_cards_top.push($(elem));
				}
			});



			//funtion to add velocity slide down animation
			var addVelocity = function(elem, scrollToBottom){
				elem.velocity('slideDown',{
					mobileHA: hasGood3Dsupport,
					complete: function(){
						$(this).attr('style','');
						if(scrollToBottom){
							that.DOM_updated();
							var scrollTime = 500;
							myIScrollList['skylist_'+that.md5id].scrollTo(0, myIScrollList['skylist_'+that.md5id].maxScrollY, scrollTime);
							if(jumpToLastPage && ('#'+that.id_pageLoadSpinner).length){
								setTimeout(function(){
									$('#'+that.id_pageLoadSpinner).prevAll('.skylist_card').addClass('display_none');
									that.DOM_updated();
								}, scrollTime+100);
							}
						} else { that.DOM_updated(); }
					}
				});
				return elem;
			}
			

			//add new cards to top
			var i_elem = 0;
			$.each(items_top, function(i, item){
				var elem_card = $(elem_cards_top[i_elem]);
				var temp_id_elem = elem_card.attr('temp_id');
				var item_id_elem = elem_card.attr('item_id');

				if(item.temp_id == temp_id_elem
					&& elem_card.attr('fake') && !item.fake){ //card exists but it is fake, and new item is not fake
					
					var elem_newCard = that.addCard(item);
					if(elem_card.hasClass('skylist_card_hover')){
						elem_newCard.addClass('skylist_card_hover');
					}
					elem_card.find('input').blur();
					$(elem_card.find('[find=card_time_calendar_timestamp]')).datepicker('hide');
					elem_card.replaceWith(elem_newCard);
					that.DOM_updated();

					i_elem++;
				}
				else if(	item._id == item_id_elem 
						||(	item.temp_id && temp_id_elem && item.temp_id == temp_id_elem)){ //skip if card exists
					i_elem++;
				} 
				else { //add new item card
					var elem_newCard = that.addCard(item);
					if($('#'+elem_newCard.prop('id')).length){ //extra check if element already exists
						i_elem++;
					} else {
						elem_card.before(elem_newCard);
						addVelocity(elem_newCard, false);
					}
				}
			});



			//add cards to bottom
			$.each(that.inputterAddedItems, function(temp_id, item){
				var elem = that.list.find('[temp_id='+temp_id+']');
				if(!elem.length){
					if(!elem_iscroll.find('.skylist_paperView_divider').length){
						elem_iscroll.append('<div class="skylist_paperView_divider"></div>'); //add blue divider
						that.list_subwrapper.children('.skylist_sortBtn').removeClass('display_none');
					}
					var elem_newCard = that.addCard(item);
					elem_iscroll.append(elem_newCard);
					addVelocity(elem_newCard, true);
				} 
				else if(elem.attr('fake') && !item.fake){ //elem is fake, but item is real, then replace
					elem.replaceWith(that.addCard(item));
				}
			});


			//one last check to update any fake cards
			that.updateFakeCards();
		},//end of the function attached to this project range
		{sync_range: sync_range, skylist: that, }
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

	//inputter destroy
	if(that.inputterInst && typeof that.inputterInst.destroy == 'function'){
		that.inputterInst.destroy();
	}

	that.list_wrapper.recursiveEmpty(0);
	$(window).off("resize.skylist_"+that.md5id);
	$('body').off("mouseleave.skylist_"+that.md5id);
	$(document).off("submenuHide.skylist_"+that.md5id);

	for( var g in that ){
		clearTimeout(that[g]);
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
		var itemsList = app_models_history.getList(false, 'projects', app_content_menu.projects_id);
		//Place the activity feed at the top
		for(var i in itemsList){
			if(itemsList[i]['root_type']=='projects' && itemsList[i]['root_id']==app_content_menu.projects_id){
				that.Lincko_itemsList.push(itemsList[i]);
			}
		}
		//Place other chats in updated_at order
		for(var i in itemsList){
			if(itemsList[i]['root_type']!='projects' || itemsList[i]['root_id']!=app_content_menu.projects_id){
				that.Lincko_itemsList.push(itemsList[i]);
			}
		}
	}
	else if (that.list_type == "global_chats") {
		that.Lincko_itemsList = app_models_history.getList();
	}
	else {
		var conditions = {
			files: {category: ['!=','voice']},
		}

		//include children, espeically for files inside project chats
		that.Lincko_itemsList = Lincko.storage.list(that.list_type, null, conditions[that.list_type], 'projects', app_content_menu.projects_id || null, true);

		//add hist_at and hist_by if doesnt exist. otherwise, sort_items will error
		$.each(that.Lincko_itemsList, function(i, item){
			if(!item.hist_at){ item.hist_at = item.created_at; }
			if(!item.hist_by){ item.hist_by = item.created_by; }
		});

		if( that.list_type == "tasks" ){
			var item;
			for( var i in that.Lincko_itemsList ){
				if(that.Lincko_itemsList[i]._tasksup){ //dont show subtasks (i.e. tasks with _tasksup)
					delete that.Lincko_itemsList[i];
				}
				else {
					that.Lincko_itemsList[i]['duedate'] = that.Lincko_itemsList[i]['start'] ? that.Lincko_itemsList[i]['start'] + that.Lincko_itemsList[i]['duration'] : null;
				}
			}
			var item_hasDueDate = [];
			var items_noDueDate = []; //no due date tasks should be at the end of the list
			$.each(Lincko.storage.sort_items(that.Lincko_itemsList, 'duedate', 0, -1, true), function(i, item){
				if(item.start){
					item_hasDueDate.push(item);
				} else {
					items_noDueDate.push(item);
				}
			});
			that.Lincko_itemsList = $.merge(item_hasDueDate, items_noDueDate);
		}
		else if( that.list_type == 'notes'){
			that.Lincko_itemsList = Lincko.storage.sort_items(that.Lincko_itemsList, 'hist_at'/*'updated_at'*/, 0, -1, false);
		}
		else if(that.list_type == 'files'){
			//for global view, hide files in global chats (e.g. must be descendant of a project)
			if(/*that.pid == 0*/true){
				var excludeGlobalChatFiles = [];
				var parent = [];
				for(var i in that.Lincko_itemsList){
					if(Lincko.storage.hasProjectParent(that.Lincko_itemsList[i]._type, that.Lincko_itemsList[i]._id)){
						excludeGlobalChatFiles.push(that.Lincko_itemsList[i]);
					}
				}
				that.Lincko_itemsList = excludeGlobalChatFiles;
			}
			//use the default sorting, which is by creation time
		}
	}
}

skylist.prototype.update_pagingList = function(list){
	var that = this;
	var itemsPerPage = that.itemsPerPage;
	that.Lincko_itemsList_paged = [];

	var book = [];
	var page = [];
	var c_page = 0;
	var c_item = 0;
	$.each(list, function(i, item){
		page.push(item);
		c_item++;

		if(c_item >= itemsPerPage){ //page is full
			book[c_page] = page; //add page
			page = []; c_item = 0; c_page++; //reset values
		}
		else if(i == list.length-1){ //very last item but page is not full
			if(c_page > 0){
				$.merge(book[c_page-1], page);
			} else {
				book[c_page] = page;
			}
		}
	});

	//if no pages have been added, add empty first page
	if(book.length < 1){
		book.push([]); 
	}

	that.Lincko_itemsList_paged = book;
	return $.merge([], book);
}

skylist.prototype.store_all_elem = function(){
	if(typeof this.list != "undefined"){
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

	if( myIScrollList['skylist_'+that.md5id] ){
		myIScrollList['skylist_'+that.md5id].refresh();
	}
}

skylist.prototype.filter_by_people = function(items, filter){
	var that = this;
	var items_filtered = [];
	var item;
	if( filter == null ){
		return items;
	} else {
		for( var i in items ){
			item = items[i];
			if( item._type == "tasks" && item['_users'] && item['_users'][filter] && item['_users'][filter]['in_charge']){
				items_filtered.push(item);
			}
			else if( item._type != "tasks" && 'created_by' in item && item['created_by'] && item['created_by'] == filter ){
				items_filtered.push(item);
			}
		}
	}

	//if this function is used outside instance, then wont have that
	if(that instanceof skylist){
		that.Lincko_itemsList_filter.people = filter;
	}

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
	else if(filter == 'overdue'){
		now = new wrapper_date().time;
		for(var i in items){
			if(tasks_isOverdue(items[i], now)){
				items_filtered.push(items[i]);
			}
		}
	}
	else if( filter < 2 ){

		for( var i in items ){
			item = items[i];
			duedate = skylist_calcDuedate(item);
			if(duedate && duedate.happensSomeday(filter)){
				items_filtered.push(item);
			}
		}
	}
	
	//if this function is used outside instance, then wont have that
	if(that instanceof skylist){
		that.Lincko_itemsList_filter.duedate = filter;
	}
	return items_filtered;
}

skylist.prototype.filter_by_sort_alt = function(items, filter){
	var that = this;
	var items_filtered = [];
	var item;
	if( filter == null ){
		return items;
	}
	else if(that.list_type == "tasks"){
		if(filter == 'updated'){
			items_filtered = Lincko.storage.sort_items( items, 'hist_at'/*'updated_at'*/, 0, -1, false );
		}
		else if(filter == 'abc'){
			items_filtered = Lincko.storage.sort_items( items, '+title', 0, -1, true );	
		}
		else{
			filter = 'due';
			items_filtered = items;
		}
	}
	else{
		items_filtered = items;
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
	else if(typeof filter == 'string'){
		filter = $.trim(filter).split(/\s+/);
	}

	if( that.search_chat ){
		items_filtered = that.search_chat(items, filter);
	}
	else{
		$.each(searchbar.search(items, filter), function(i, item){
			items_filtered.push(item);
		});
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

skylist.prototype.list_filter = function(filter_type, filter_by){
	var that = this;
	if(!that || !that.list_wrapper){ return false; }
	that.list_wrapper.attr('view', that.Lincko_itemsList_filter.view);
	that.generate_Lincko_itemsList();
	var items_filtered = that.Lincko_itemsList;

	if( that.list_type == "tasks" || that.list_type == "notes" || that.list_type == "files" ){
		items_filtered = that.filter_by_search( items_filtered, that.Lincko_itemsList_filter.search );
		items_filtered = that.filter_by_people( items_filtered, that.Lincko_itemsList_filter.people );
	}

	if(that.list_type == "tasks"){
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
	if(!that || !that.list){return false;}

	if(type){
		that.Lincko_itemsList_filter[type] = filter_by;
	}

	//remove all current cards
	var iscroll_elem, cards_elem;
	if( that.list.children('.iscroll_sub_div').length > 0 ){
		iscroll_elem = that.list.children('.iscroll_sub_div');
	}else{
		iscroll_elem = that.list;
	}
	cards_elem = iscroll_elem.children().not('.burger_typeTask');
	cards_elem.recursiveRemove(0);

	$('#'+that.id_pageLoadSpinner).remove();


	//generate and add new cards
	var items_filtered = that.list_filter(type);
	var items_paged = that.update_pagingList(items_filtered);

	if( items_filtered.length < 1 ){
		var elem_iscroll = that.list.children('.iscroll_sub_div').length ? that.list.children('.iscroll_sub_div') : that.list;
		elem_iscroll.append(that.noResult_str.clone());
	} else {
		that.addNextPage(0); 
	}

	//hide sort button
	if(that.elem_btn_sort && !that.elem_btn_sort.hasClass('display_none')){
		that.elem_btn_sort.addClass('display_none');
	}

	if(/*that.pid == 0*/true){ that.updateRings(); }
	that.store_all_elem();

	that.elem_card_all.velocity("fadeIn",{
		mobileHA: hasGood3Dsupport,
		complete: 200,
		complete: function(){
			if(!that){ return false; }
			//paperview - showLink filter
			if(that.Lincko_itemsList_filter && that.Lincko_itemsList_filter.view == 'paper'){
				that.paperview_filter_showLinks();
			}
			that.window_resize();
		}
	});

	return;	
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

skylist.prototype.addPrevPage = function(){
	var that = this; if(that.allPagesLoaded){return;}

	var prevPage = that.currentPage-1;
	var elem_spinner = $('#'+that.id_pageLoadSpinner);
	var elem_iscroll = that.list.children('.iscroll_sub_div').length ? that.list.children('.iscroll_sub_div') : that.list;
	var y_diff = myIScrollList['skylist_'+that.md5id].y - myIScrollList['skylist_'+that.md5id].maxScrollY;
	var elem_top;

	if(!that.pagesLoaded[prevPage]){
		//add cards
		var elem_tmp = $('<div>');
		$.each(that.Lincko_itemsList_paged[prevPage], function(i, item){
			if(!that.inputterAddedItems[item.temp_id]){ //dont add if was added by inputter
				var elem_new = that.addCard(item);
				if(!$('#'+elem_new.prop('id')).length){ //add only if doesnt exist
					elem_tmp.append(elem_new);
					if(i<1){ elem_top = elem_new; } //the first element added will be at the top
				}
			}
		});

		//add cards from temp div to iscroll
		elem_tmp = elem_tmp.children();
		if(elem_tmp.length){
			elem_spinner.before(elem_tmp);
		}


		that.pagesLoaded[prevPage] = true;
		 that.currentPage = prevPage;
		elem_spinner.remove();
		if(that.pagesLoaded[prevPage-1]){
			that.allPagesLoaded = true;
			elem_iscroll.find('.skylist_card.display_none').removeClass('display_none');
		} else {
			elem_top.before($('#-skylist_pageLoadSpinner').clone().prop('id', that.id_pageLoadSpinner));
		}

		that.DOM_updated();
		myIScrollList['skylist_'+that.md5id].scrollTo(0, myIScrollList['skylist_'+that.md5id].maxScrollY + y_diff);
	}
}


skylist.prototype.addNextPage = function(page){
	var that = this;
	//if loading first page, reset
	if(page === 0){
		that.currentPage = 0;
		that.pagesLoaded = {0:true};
		that.reversePaging = false; 
		that.allPagesLoaded = false;
		that.inputterAddedItems = {};
	}
	else if(that.allPagesLoaded){return;}

	var nextPage = typeof page !== 'undefined' ? page : that.currentPage+1;
	if(that.Lincko_itemsList_paged[nextPage]){
		var elem_iscroll = that.list.children('.iscroll_sub_div').length ? that.list.children('.iscroll_sub_div') : that.list;

		//scroll iscroll to top
		if( nextPage == 0 && myIScrollList && myIScrollList['skylist_'+that.md5id] ){
			myIScrollList['skylist_'+that.md5id].scrollTo(0,0);
		}

		//add cards to temp div
		var elem_tmp = $('<div>');
		$.each(that.Lincko_itemsList_paged[nextPage], function(i, item){
			if(!that.inputterAddedItems[item.temp_id]){ //dont add if was added by inputter
				var elem_new = that.addCard(item);
				if(!$('#'+elem_new.prop('id')).length){ //add only if doesnt exist
					elem_tmp.append(elem_new);
				}
			}
			
		});

		//add cards from temp div to iscroll
		elem_tmp = elem_tmp.children();
		if(elem_tmp.length){
			elem_iscroll.append(elem_tmp);
		}

		//record that the page was loaded into DOM
		that.pagesLoaded[nextPage] = true;

		//remove loading spinner
		if($('#'+that.id_pageLoadSpinner).length){ $('#'+that.id_pageLoadSpinner).remove();	}

		
		if(nextPage == that.Lincko_itemsList_paged.length - 1){
			that.allPagesLoaded = true;
		}

		if(typeof page === 'undefined'){ that.currentPage = nextPage; }
		if(that.Lincko_itemsList_paged[page ? page + 1 : that.currentPage+1]){
			elem_iscroll.append($('#-skylist_pageLoadSpinner').clone().prop('id', that.id_pageLoadSpinner));
		}
		
		that.DOM_updated();
	}
}

skylist.prototype.addLastPage = function(){
	var that = this;
	var i_lastPage = that.Lincko_itemsList_paged.length - 1;
	if(that.currentPage >= i_lastPage){ return; } //last page already added
	else {
		var elem_iscroll = that.list.children('.iscroll_sub_div').length ? that.list.children('.iscroll_sub_div') : that.list;
		
		//add spinner at the top if there are more pages in between
		if(i_lastPage - that.currentPage > 1){
			if(!$('#'+that.id_pageLoadSpinner).length){
				elem_iscroll.append($('#-skylist_pageLoadSpinner').clone().prop('id', that.id_pageLoadSpinner));
			}
		} else {
			$('#'+that.id_pageLoadSpinner).remove();
		}

		//add cards
		var elem_tmp = $('<div>');
		$.each(that.Lincko_itemsList_paged[i_lastPage], function(i, item){
			if(!that.inputterAddedItems[item.temp_id]){ //dont add if was added by inputter
				elem_tmp.append(that.addCard(item));
			}
		});

		//add cards from temp div to iscroll
		elem_tmp = elem_tmp.children();
		if(elem_tmp.length){
			elem_iscroll.append(elem_tmp);
		}

		//record that the page was loaded into DOM
		that.pagesLoaded[i_lastPage] = true;

		that.currentPage = i_lastPage;
		that.reversePaging = true;
		that.DOM_updated();
	}
}

skylist.prototype.addCard_all = function(){
	var that = this;
	if(that.list_type == 'tasks' && that.pid > 0){
		that.list.append(burgerN.typeTask(null, that)); //top
		that.paperView_inputter(that.list_wrapper, 'projects', app_content_menu.projects_id);
	}

	var items = that.list_filter();
	var items_paged = that.update_pagingList(items);

	if( items.length < 1 ){
		that.list.append(that.noResult_str.clone());
	}
	else{
		that.addNextPage(0);
	}
	that.store_all_elem();

	//paperview - showLink filter
	if(that.Lincko_itemsList_filter.view == 'paper'){
		that.paperview_filter_showLinks();
	}
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


	//this sync function is only to handle deletion and update. for creation, check the project sync function
	if( that.list_type == 'tasks' || that.list_type == 'notes' || that.list_type == 'files' ){
		//elem_card.find('[find=card_spacestick]').removeClass('display_none');
		setTimeout(function(){ //must run after the DOM exists. otherwise, can be deleted
			app_application_lincko.add(
				elem_card.prop('id'),
				that.list_type+'_'+item['_id'],
				function(){
					//use this.updated to check if need to update card visually
					var noUpdate = true;
					var noUpdateList = {
						general: {
							viewed_by: true,
							locked_fp: true,
							_perm: true,
							new: true,
						},
						tasks: {
							'-comment': true,
						},
						notes: {},
						files: {},
					}
					if(typeof this.updated == 'object' && typeof this.updated[that.list_type+'_'+item['_id']] == 'object'){
						$.each(this.updated[that.list_type+'_'+item['_id']], function(attr, obj){
							if(!noUpdateList.general[attr] && !noUpdateList[that.list_type][attr]){
								noUpdate = false;
								return false; 
							}
						});
						if(noUpdate){ return false; }
					}


					var elem = $('#'+this.id);
					var item_new = Lincko.storage.get(that.list_type , item['_id']);

					if( /*!item_new ||*/ (typeof item_new == 'object' && 'deleted_at' in item_new && item_new['deleted_at']) || (typeof item_new == 'object' && app_content_menu.projects_id > 0 && item_new._parent[1] != app_content_menu.projects_id) ){ //for delete
						elem.velocity('slideUp',{
							mobileHA: hasGood3Dsupport,
							complete: function(){
								$(this).recursiveRemove(0);
								if(!that){ return false; }
								if( that.list_subwrapper && that.list_subwrapper.find('[find=card]').length < 1 ){
									that.tasklist_update();
								}
								else if(that.DOM_updated){
									that.DOM_updated();
								}
							}
						});
					}
					else if(item_new){ //for update
						//do nothing ifs (dont do anything if only a single attribute is updated and the updated attribute is 'viewed_by' or 'new')
						// if(	typeof this.updated == 'object' && typeof this.updated[that.list_type+'_'+item['_id']] == 'object'
						// 	&& Object.keys(this.updated[that.list_type+'_'+item['_id']]).length == 1 
						// 	&& (	this.updated[that.list_type+'_'+item['_id']].viewed_by
						// 			|| this.updated[that.list_type+'_'+item['_id']].new ) ){
						// 	//do nothing
						// }
						if(that.Lincko_itemsList_filter.view == 'paper' 
							&& typeof this.updated == 'object' && typeof this.updated[that.list_type+'_'+item['_id']] == 'object'
							&& that.paperview_partialUpdate(this.updated[that.list_type+'_'+item['_id']])){ 
							that.paperview_taskCard_update(elem, item_new, this.updated[that.list_type+'_'+item['_id']]);
						}
						else{
							elem.velocity('fadeOut',{
								mobileHA: hasGood3Dsupport,
								duration: 200,
								complete: function(){
									var elem_toReplace = that.addCard(Lincko.storage.get(that.list_type , item['_id']));
									if(elem_toReplace){
										if(elem.hasClass('skylist_card_hover')){
											elem_toReplace.addClass('skylist_card_hover');
										}
										elem.find('input').blur();
										$(elem.find('[find=card_time_calendar_timestamp]')).datepicker('hide');
										elem.replaceWith(elem_toReplace);
										that.DOM_updated();
									}
								}
							});
						}
					}
				}
			);
		},0); //end of setTimeout
	} //END OF 'tasks' || 'notes' || 'files'
	else if (that.list_type == 'chats' || that.list_type == 'global_chats') {
		//toto => rebuild the chat list here
		app_application_lincko.add(
			elem_card.prop('id'),
			[item['root_type']+'_'+item['root_id'], item['name']],
			function(){
				var elem = $('#'+this.id);
				var getList = app_models_history.getList(1, this.action_param[0], this.action_param[1]);
				if(getList && getList[0]){
					that.addChat(getList[0]);
				}
			},
			[item['root_type'], item['root_id']]
		);
	}
	if(that.elem_rightOptions_count < 1){
		elem_card.find('[find=card_rightOptions]').addClass('display_none');
	}
	return elem_card;
}

skylist.prototype.addChat = function(item){
	var style = Lincko.storage.get(item.root_type,item.root_id,"style");
	if(style)
	{
		if(style == 1)
		{
			return false;
		}
	}

	var that = this;
	var Elem_id = 'skylist_card_'+that.md5id+'_'+item['root_type']+'_'+item['root_id'];
	var Elem = $('#'+Elem_id);
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

		Elem.off('click');
		if(item['root_type']=="chats"){
			Elem.click([item, that], function(event){
				var preview = true; //By default it's listed inside working area
				var layer = false;
				var that = event.data[1];
				var Elem = $(this);
				var Elem_id = Elem.prop('id');
				//Get the subemnu if it's inside it
				var submenu = Elem.submenu_getWrapper();

				//Avoid submenu_hide to be called afeter the creation
				$.each(Elem.parent().find(".skylist_chat_card_hover"), function() {
					app_application_lincko.clean($(this).prop('id'));
				});

				if(submenu){
					preview = submenu[0].preview;
					layer = submenu[0].layer+1;
					submenu[1].find(".skylist_chat_card_hover").removeClass("skylist_chat_card_hover");
					Elem.find('[find=card_center]').addClass("skylist_chat_card_hover");
				} else if($("#skylist_layer_chats").length>0){
					$("#skylist_layer_chats").find(".skylist_chat_card_hover").removeClass("skylist_chat_card_hover");
					Elem.find('[find=card_center]').addClass("skylist_chat_card_hover");
				}
				var id = event.data[0]["root_id"];
				var title = event.data[0]["title"];

				subm = submenu_Build_return("newchat", layer, false, {
					type: 'chats',
					id: id,
					title: title,
				}, preview);

				Elem.find('[find=card_center]').prop('id', Elem_id+'_card_center');
				app_application_lincko.add(
					Elem_id+'_card_center',
					'submenu_hide_'+subm.preview+'_'+subm.id,
					function(){
						app_application_lincko.clean(this.id);
						var Elem = $('#'+this.id);
						if(Elem.length>0){
							Elem.removeClass("skylist_chat_card_hover");
						}
					}
				);
			});
		} else if(item['root_type']=="projects"){
			Elem.click([item, that], function(event){
				var preview = true; //By default it's listed inside working area
				var layer = false;
				var that = event.data[1];
				var Elem = $(this);
				var Elem_id = Elem.prop('id');
				//Get the subemnu if it's inside it
				var submenu = Elem.submenu_getWrapper();

				//Avoid submenu_hide to be called afeter the creation				
				$.each(Elem.parent().find(".skylist_chat_card_hover"), function() {
					app_application_lincko.clean($(this).prop('id'));
				});

				if(submenu){
					preview = submenu[0].preview;
					layer = submenu[0].layer+1;
					submenu[1].find(".skylist_chat_card_hover").removeClass("skylist_chat_card_hover");
					Elem.find('[find=card_center]').addClass("skylist_chat_card_hover");
				} else if($("#skylist_layer_chats").length>0){
					$("#skylist_layer_chats").find(".skylist_chat_card_hover").removeClass("skylist_chat_card_hover");
					Elem.find('[find=card_center]').addClass("skylist_chat_card_hover");
				}
				var id = event.data[0]["root_id"];
				var title = event.data[0]["title"];
				if(id == Lincko.storage.getMyPlaceholder()['_id']){
					title = Lincko.Translation.get('app', 2502, 'html'); //Personal Space
				}

				subm = submenu_Build_return("newchat", layer, false, {
					type: 'history',
					id: id,
					title: title,
				}, preview);

				Elem.find('[find=card_center]').prop('id', Elem_id+'_card_center');
				app_application_lincko.add(
					Elem_id+'_card_center',
					'submenu_hide_'+subm.preview+'_'+subm.id,
					function(){
						app_application_lincko.clean(this.id);
						var Elem = $('#'+this.id);
						if(Elem.length>0){
							Elem.removeClass("skylist_chat_card_hover");
						}
					}
				);
			});
		}

	} else {
		var notif = Elem.find('[find=chats_notif]');
	}

	//var last_notif_root = Lincko.storage.getLastNotif(item['root_type'], item['root_id']);
	//if(item['timestamp'] > last_notif_root){
	if(item['notif']){
		notif
			.removeClass('display_none')
			.text(item['notif']);
	} else {
		notif
			.addClass('display_none')
			.text('');
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

	if(new_elem){
		var wrapper = $('<span>');
		var title = '&nbsp;';
		wrapper.addClass('skylist_chat_card_project_title');
		if(item['root_type']=="chats"){
			//Insert project name
			var span = $('<span>');
			span.prop('id', Elem_id+'_project_title');
			var parent = Lincko.storage.getParent('chats', item['root_id']);
			title = parent['+title'];
			if(parent && parent['_type']=="projects"){
				title = wrapper_to_html(wrapper_flat_text(title));
				//Insert Icon
				var icon = $('<span>');
				icon.addClass('icon-projectBlack skylist_chat_card_project_title_icon');
				wrapper.append(icon);
				app_application_lincko.add(
					Elem_id+'_project_title',
					'projects_'+parent['_id'],
					function(){
						var title = Lincko.storage.getParent('chats', item['root_id'], 'title');
						if(title){
							title = wrapper_to_html(wrapper_flat_text(title));
							$('#'+this.id).html(title);
						}
					}
				);
			}
			span.html(title).addClass('skylist_chat_card_project_title_text');
			wrapper.append(span);
		} else {
			wrapper.html(title);
		}
		Elem.find('[find=description]').after(wrapper);
	}

	//toto => need to add deletion slide feature
	//that.add_cardEvents(Elem);
	return Elem;
}

//showLinks : boolean
//if showLinks not provided, it will use current filter setting
skylist.prototype.paperview_filter_showLinks = function(showLinks){
	var that = this;
	if(showLinks && typeof showLinks != 'boolean'){ return; }
	if(typeof showLinks != 'boolean'){
		var showLinks = that.Lincko_itemsList_filter.showLinks;
	}

	var elem_expandable = that.elem_card_all.find('[find=expandable_links]');
	if(showLinks){
		$.each(elem_expandable, function(i, elem){
			if($(elem).find('.skylist_paperView_expandable_boxsize:not([find=btn_addNew])').length > 0){
				$(elem).removeClass('display_none').css('display', 'block');
			}
		});
	}
	else{
		$.each(elem_expandable, function(i, elem){
			$(elem).removeAttr('style');
		});
	}
	

	$(window).resize();

	if(typeof showLinks == 'boolean' && showLinks != that.Lincko_itemsList_filter.showLinks){
		that.Lincko_itemsList_filter.showLinks = showLinks;
		that.filter_updateSettings();
	}
}


//returns true if task should be partially redrawn for the paperview
//updated is this.updated[tasks_id] from syncfunction
skylist.prototype.paperview_partialUpdate = function(updated_tasks){
	if(typeof updated_tasks == 'boolean'){
		return updated_tasks;
	}
/*	should retrun true for the following updates: (which means use paperview_taskCard_update() ) */
	var partialUpdateList = {
		//do nothing
		updated_at : true,
		viewed_by : true,
		'locked_fp': true,
		'-comment': true,
		locked_by: true,
		_perm: true,
		new: true,
		search: true,

		'+title': true,
		_files : true,
		_notes : true,
		_children : true, //(i.e. comments)
		_users : true,
		duration: true,
		start: true,
		_tasksdown: true,

		approved: true,
		approved_at: true,
		approved_by: true,

	}

	var partialUpdate = true;

	$.each(updated_tasks, function(att, bool){
		if(!partialUpdateList[att]){
			partialUpdate = false;
			return false;
		}
	});

	return partialUpdate;
}

skylist.prototype.paperview_taskCard_update = function(elem, item, updated){
	var that = this;
	var elem_card_rightbox = elem.find('[find=card_rightbox]');

	var parent_range = that.pid == 0 ? 'projects' : item._parent[0]+'_'+item._parent[1];
	var param_prepare = {};
	param_prepare.parent_range = {
		'_children': true,
	}
	var needParentSync = false;


	//if update the text, title, '@', '+'
	if((typeof updated == 'boolean' && updated) || updated['+title'] || updated._users || updated.duration || updated.start){
		var elem_title = elem.find('[find=title]');
		elem_title.text(item['+title']);
		var span_date = burger_spanDate(skylist_calcDuedate(item));
		var span_user = burger_spanUser(tasks_get_inCharge_id(item['_id'])[0]);
		
		burger_attach_clickHandler.calendar(span_date, item._type, item._id, null, true, null);
		if(!Lincko.storage.get('projects', item._parent[1])['personal_private']){ 
			burger_attach_clickHandler.in_charge(span_user, item._type, item._id, null, true, null);
		}
		elem_title.append(span_user).append(span_date);
	}

	
	if((typeof updated == 'boolean' && updated) || updated.duration || updated.start || updated.approved || updated.approved_at || updated.approved_by){
		//if task duedate changed, adjust overdue class
		var isOverdue = tasks_isOverdue(item._id);
		if(isOverdue){
			elem.addClass('skylist_card_overdue');
		}
		else{
			elem.removeClass('skylist_card_overdue');
		}

		//approved, approved_by, approved_at
		if(item.approved != elem.hasClass('skylist_card_checked')){
			elem.toggleClass('skylist_card_checked');
			needParentSync = true;
		}
	}

	//if links were updated
	if((typeof updated == 'boolean' && updated) || updated._files || updated._notes){
		var elem_expandable_links = elem.children('[find=expandable_links]');
		var elem_expandable_links_id = elem_expandable_links.prop('id');
		var elem_expandable_links_addNew = elem_expandable_links.find('[find=btn_addNew]');

		if(elem_expandable_links.children('.iscroll_sub_div').length){
			elem_expandable_links = elem_expandable_links.children('.iscroll_sub_div');
		}

		//update count
		var fileCount = 0;
		var noteCount = 0;
		var linkCount = 0;
		$.each(item._files, function(id, obj){
			var file = Lincko.storage.get('files', id);
			if(file && !file.deleted_at){ fileCount++; }
		});
		$.each(item._notes, function(id, obj){
			var note = Lincko.storage.get('notes', id);
			if(note && !note.deleted_at){ noteCount++; }
		});
		linkCount = fileCount + noteCount;
		elem.find('[find=linkCount]').text(linkCount);


		if(typeof updated == 'boolean' || updated._files){		
			$.each(item._files, function(fileID, obj){
				var elem_linkboxExist = elem_expandable_links.children('[_files='+fileID+']');
				if(elem_linkboxExist.length){ return; }

				//remove loading box
				var elem_loading = elem_expandable_links.children('[temp_id='+Lincko.storage.get('files', fileID, 'temp_id')+']');
				if(elem_loading.length){
					var elem_linkboxNew = that.make_fileLinkbox(fileID);
					if(elem_linkboxNew){
						elem_loading.replaceWith(elem_linkboxNew);
					}
				}
				else{
					var elem_linkboxNew = that.make_fileLinkbox(fileID);
					if(elem_linkboxNew){
						elem_expandable_links_addNew.before(elem_linkboxNew);
					}
				}
			});

			//check and remove no longer existing file links
			var elem_fileboxExist = elem_expandable_links.children('[_files]');
			if(elem_fileboxExist.length){
				if(fileCount < 1){
					elem_fileboxExist.recursiveRemove(0);
				}
				else{
					$.each(elem_fileboxExist, function(i, elem){
						var elem = $(elem);
						if(!item._files[elem.attr('_files')]){
							elem.recursiveRemove(0);
						}
					});
				}
			}
		}
		
		if(typeof updated == 'boolean' || updated._notes){
			var elem_notebox = elem_expandable_links.children('[find=notes]');
			if(noteCount < 1){
				elem_notebox.recursiveRemove(0);
			}
			else if(elem_notebox.length){
				elem_notebox.find('[find=count]').text(noteCount);
			}
			else{
				elem_expandable_links_addNew.before(that.make_noteLinkbox(noteCount));
				
			}
		}


		//if first file added, reset the buttons and open the expandable
		if(linkCount < 1){
			that.paperView_toggleExpandable($('#'+elem_expandable_links_id), false);
		}
		else if(linkCount == 1){
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

			that.paperView_toggleExpandable($('#'+elem_expandable_links_id), true);
		}


		//refresh iscroll
		if(myIScrollList[elem_expandable_links_id]){
			myIScrollList[elem_expandable_links_id].refresh();
			elem_expandable_links.find('img').on('load', function(){
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
				$(elem).recursiveRemove(0);
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


	if(needParentSync){
		app_application_lincko.prepare(parent_range, false, param_prepare);
	}
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
	else if(item_file['category'] == 'audio'){
		fileType_class = 'fa fa-file-audio-o';
		elem_linkbox.addClass(fileType_class).click(fileID, function(event){
			event.stopPropagation();
			previewer.audio(event.data);
		});
	}
	else{
		fileType_class = app_models_fileType.getClass(item_file.ori_ext);
		elem_linkbox.addClass(fileType_class).click(function(event){
			event.stopPropagation();
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
	var Elem_rightOptions = Elem.find('[find=card_rightOptions]').recursiveEmpty(0);
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
		item.start = new wrapper_date().getEndofDay(); //midnight today
		item.duration = 86400;
	}
	Elem.prop('id','skylist_card_'+that.md5id+'_'+item['_id']);
	Elem.attr('item_id', item['_id']);
	Elem.attr('temp_id', item.temp_id);

	//for fakes
	if(item.fake){ 
		Elem.attr('fake',true); 
		if(item.showLinks){
			Elem.attr('showLinks', true);
		}
	}

	/*
		add class to entire card based on task status
	*/
	if( item['approved'] ){
		Elem.addClass('skylist_card_checked');
	}

	//locked_by
	if(item['locked_by'] && item['locked_by'] != wrapper_localstorage.uid){
		Elem.attr('locked', item['locked_by']);
	}


	/*
	title
	*/
	var elem_title = Elem.find('[find=title]');
	elem_title.text(item['+title']);
	
	var contenteditable = false;
	if( typeof item == 'object' && '_perm' in item && wrapper_localstorage.uid in item['_perm'] && item['_perm'][wrapper_localstorage.uid][0] > 1 ){ //RCU and beyond
		contenteditable = true; 
	}
	if(contenteditable){
		//for paper, direct edit, for others, settimeout
		if(that.Lincko_itemsList_filter.view == 'paper' && !supportsTouch && false){ //toto - paperiew same as card view
			elem_title.attr('contenteditable',contenteditable);
		}
		else{
			elem_title.on('mousedown touchstart', function(event){ 
				if( responsive.test("maxMobileL") &&  that.Lincko_itemsList_filter.view != 'paper' ){ return true; } //for paper mode, mobile can edit
				that.editing_target = $(this);
				clearTimeout(that.editing_timeout);
				that.editing_timeout = setTimeout(function(){
					if(that.is_scrolling){return;}
					that.editing_target.attr('contenteditable',contenteditable);
					that.editing_target.focus();
				},1000);
			});
			elem_title.on('mouseup touchend', function(event){
				clearTimeout(that.editing_timeout);
			});
		}

		// elem_title.keydown(function(event){
		// 	if(event.keyCode == 13){
		// 		event.preventDefault();
		// 		$(this).focusout();
		// 		$(this).blur();
		// 	}
		// });
		elem_title.blur(function(){
			$(this).attr('contenteditable',false);
			//@ burger
			var inChargeID_new = null;
			var elem_users = $(this).find('[userid]');
			if(elem_users.length){
				inChargeID_new = $(elem_users[0]).attr('userid');
			}
			
			//+ burger
			var start = false;
			var duration = item.duration;
			var elem_dateWrapper = $(this).find('[find=dateWrapper]');
			if(elem_dateWrapper.length){
				var dateval = $(elem_dateWrapper[0]).attr('val');
				if(dateval == 0){ //today
					dateval = new wrapper_date().getEndofDay(); //end of day today
					start = new wrapper_date().getEndofDay() - duration;
				}
				else if(dateval == 1){ //tomorrow
					start = new wrapper_date().getEndofDay() + 86400 - duration;
				} else if(dateval == null){
					start = null;
				}
				else {
					start = dateval - duration;
				}
			}


			var new_text = $.trim($(this).contents().filter(function() {
			  return this.nodeType == 3;
			}).text());
			

			if(new_text != item['+title'] || inChargeID_new || start){
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

				if(start || start == null){
					param.start = start;
				}


				skylist.sendAction.tasks(
					param, 
					item, 'task/update',
					function(msg, data_error, data_status, data_msg){ 
						if(data_error){
							app_application_lincko.prepare(item['_type']+'_'+item['_id']);
						}
						else{
							item = Lincko.storage.get(item._type, item._id);
						}
					},
					function(){ app_application_lincko.prepare(item['_type']+'_'+item['_id']); }
				);
			}
			else{ //if no need to update
				$(this).html(new_text);
				if(that.Lincko_itemsList_filter.view == 'paper'){
					$(this).append(burger_spanUser(in_chargeID)).append(burger_spanDate(item['start'] ? item['start']+item['duration'] : null));
				}
			}
		});

		var shortcuts = { at: true, plus: true }
		if(Lincko.storage.get('projects', app_content_menu.projects_id, 'personal_private')){
			delete shortcuts.at;
		}
		var fn_enter_burger_keyboard = function(event, burgerInst){
			burgerInst.elem.blur();
		}
		var burger_keyboard_titleInst = new burger_keyboard(Elem.find('[find=title]'), null, shortcuts, null, fn_enter_burger_keyboard, null, 
			{
				cb_select: function(){ 
					if(that.Lincko_itemsList_filter.view == 'paper'){
						Elem.removeClass('skylist_card_overdue'); 
					}
				}
			}
		);
		//burgerN.regex(Elem.find('[find=title]'), item);
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
		var elem_title_spanUser = burger_spanUser(in_chargeID, in_charge);
		if(!item.fake){ 
			burger_attach_clickHandler.in_charge(elem_title_spanUser, item['_type'], item['_id'], null, !Lincko.storage.get('projects', item._parent[1])['personal_private']);
		}
		elem_title.append(elem_title_spanUser);
	}

	//Elem.find('[find=name_hidden]').toggleClass('display_none');
	Elem.find('[find=name]').html(in_charge);
	if(!item.fake && !Lincko.storage.get("projects", app_content_menu.projects_id, 'personal_private') && !responsive.test("maxMobileL") ){
		//burgerN.assignTask(Elem.find('input[find=name_hidden]'), item);
		var elem_nameWrapper = Elem.find('[find=nameWrapper]').click(function(event){
			event.stopPropagation();
		});
		burger_attach_clickHandler.in_charge(elem_nameWrapper, item['_type'], item['_id'], null, true);

	}
	
	
	/* rightOptions - in_charge */
	if( !Lincko.storage.get("projects", app_content_menu.projects_id, 'personal_private') ){
		var elem_rightOptions_inCharge = that.add_rightOptionsBox(in_charge,'fa-user');
		elem_rightOptions_inCharge.click(function(){
			var param = {};
			param.type = 'tasks';
			param.item_obj = item;
			param.contactsID = burgerN.generate_contacts(item);
			param.elem_input = Elem.find('input[find=name_hidden]');
			param.selectOne = true;
			param.project_id = app_content_menu.projects_id;
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
		.prop('id',Elem.prop('id')+'_expandable_comments');
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
			that.paperView_toggleExpandable(elem_expandable_comments, null, cb_complete);
		}
	});


	/* progress bar */
	if(item._tasksdown){
		var elem_progress = Elem.find('.skylist_card_progress');
		elem_progress.removeClass('skylist_card_progress_hidden');
		var subtasks_totalCount = 0;
		var subtasks_approvedCount = 0;
		$.each(item._tasksdown, function(subtask_id, obj){
			var subtask = Lincko.storage.get('tasks', subtask_id);
			//dont show if task doesnt exist or it doesnt match the project of the parent task
			if(!subtask || subtask.deleted_at || subtask._parent[1] != item._parent[1] ) return;

			if(subtask.approved){ subtasks_approvedCount++; }
			subtasks_totalCount++;
		});
		var progressPercent = Math.round( (subtasks_approvedCount / subtasks_totalCount)*100 );
		elem_progress.find('[find=bar]').css('width', progressPercent+'%');
		elem_progress.find('[find=percent]').text(progressPercent);
	}


	/*
	links
	*/
	var fileCount = 0;
	var noteCount = 0;
	var linkCount = 0;
	$.each(item._files, function(id, obj){
		var file = Lincko.storage.get('files', id);
		if(file && !file.deleted_at){ fileCount++; }
	});
	$.each(item._notes, function(id, obj){
		var note = Lincko.storage.get('notes', id);
		if(note && !note.deleted_at){ noteCount++; }
	});
	linkCount = fileCount + noteCount;
	Elem.find('[find=linkCount]').text(linkCount);


	if(that.Lincko_itemsList_filter.view == 'paper'){
		var elem_expandable_links = Elem.find('[find=expandable_links]')
			.addClass('overthrow')
			.prop('id',Elem.prop('id')+'_expandable_links');

		if(item.fake && item.showLinks && item.paperView){
			$.each(item.showLinks, function(upload_index, info){
				elem_expandable_links.prepend(that.paperView_uploadingBox(info.name, info.temp_id));
			});
			elem_expandable_links.css('display', 'block');
		}

		wrapper_IScroll_options_new[elem_expandable_links.prop('id')] = { 
			scrollX: true, 
			scrollY: false, 
			mouseWheel: false, 
			fadeScrollbars: true,
		};
		var elem_btn_addNew = elem_expandable_links.find('[find=btn_addNew]');
		if(fileCount){
			$.each(item._files, function(id, obj){
				var file = Lincko.storage.get('files', id);
				if(file && !file.deleted_at){ elem_btn_addNew.before(that.make_fileLinkbox(id)); }
			});
		}
		if(noteCount){
			elem_btn_addNew.before(that.make_noteLinkbox(noteCount));
		}

		if(linkCount > 0){
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
		setTimeout(function(){
			//sync function to update the linkbox once uploading is finished
			app_application_lincko.add(elem_expandable_links.prop('id'), 'files', function(){
				var elem_id = this.id;
				var parent_type = this.action_param.parent_type;
				var parent_id = this.action_param.parent_id;
				
				var triggerParentSync = false;
				var elem_temp_id = $('#'+elem_id).find('[temp_id]');
				if(elem_temp_id.length){
					$.each(elem_temp_id, function(i, elem){
						var temp_id = $(elem).attr('temp_id');
						var item_file = Lincko.storage.list('files',1,{temp_id: temp_id})[0];
						if(item_file){
							if(!Lincko.storage.data[parent_type][parent_id]._files){
								Lincko.storage.data[parent_type][parent_id]._files = {};
							}
							if(!Lincko.storage.data[parent_type][parent_id]._files[item_file._id]){
								Lincko.storage.data[parent_type][parent_id]._files[item_file._id] = true;
							}
							triggerParentSync = true;
						}
					});
				}
				if(triggerParentSync){
					var prepare_param = {};
					prepare_param[parent_type+'_'+parent_id] = {_files: true};
					app_application_lincko.prepare(parent_type+'_'+parent_id, true, prepare_param);
				}

			}, {parent_type: item._type, parent_id: item._id});

			//sync function to show upload progress
			app_application_lincko.add(elem_expandable_links.prop('id'), 'upload', function(){
				var elem_id = this.id;
				var parent_type = this.action_param.parent_type;
				var parent_id = this.action_param.parent_id;
				
				$.each(app_upload_files.lincko_files, function(i, lincko_file){
					//if parent matches
					if(lincko_file.lincko_parent_type == parent_type && lincko_file.lincko_parent_id == parent_id){
						var temp_id = lincko_file.lincko_temp_id;
						var progress = lincko_file.lincko_progress;
						var status = lincko_file.lincko_status;

						//if there is already real file loaded, then return
						var file_real = Lincko.storage.list('files',1,{temp_id: temp_id})[0];
						if(file_real && !file_real.fake){
							var elem_file_real = $('#'+elem_id).find('[_files='+file_real._id+']');
							if(elem_file_real.length){
								return;
							}
						}

						var elem_temp_id = $('#'+elem_id).find('[temp_id='+temp_id+']');
						if(status == 'done' && elem_temp_id.length){
						//even when 'done', the file object is not available yet
							// var preview = null;	
							// try{
							// 	preview = lincko_file.files[0].preview.toDataURL();	
							// } catch(e){}
						}
						else if(elem_temp_id.length){
							//update progress bar or number
							elem_temp_id.find('[find=bar]').css('width', progress+'%');
						}
						else{
							$('#'+elem_id).find('[find=btn_addNew]').before(that.paperView_uploadingBox(lincko_file.lincko_name, temp_id));
							//force expand if not expanded
							if($('#'+elem_id).css('display') != 'block'){
								that.paperView_toggleExpandable($('#'+elem_id));
							}
						}
					}
				});

			}, {parent_type: item._type, parent_id: item._id});
		},0);
	}//end of setup for paperview only
	

	/* updated_at */
	Elem.find('[find=quickInfo1]').html(Lincko.Translation.get('app', 53, 'html')+': ');
	var updated_at = new wrapper_date(item['hist_at'] || item['updated_at']);
	if( skylist_textDate(updated_at) ){
		updated_at = skylist_textDate(updated_at);
	}
	else{
		updated_at = updated_at.display('date_very_short');
	}
	Elem.find('[find=quickInfo2]').html(updated_at+',&nbsp;');

	/* updated_by */
	var updated_by = Lincko.storage.get("users", item['hist_by'] || item['updated_by'] ,"username");
	Elem.find('[find=quickInfo3]').html(updated_by);

	/*duedate = new wrapper_date(item.start + parseInt(item.duration,10));*/
	duedate = skylist_calcDuedate(item);
	var now = new wrapper_date();
	if( duedate && now.time > duedate.time && !item.approved){
		Elem.addClass('skylist_card_overdue');
	}
	if(skylist_textDate(duedate)){
		duedate = skylist_textDate(duedate);
		if(duedate == Lincko.Translation.get('app', 3302, 'js').toUpperCase() /*today*/){
			Elem.removeClass('skylist_card_overdue');
		}
	}
	else{
		duedate = duedate.display('date_very_short');
	}

	if(that.Lincko_itemsList_filter.view == 'paper'){
		var elem_title_spanDate = burger_spanDate(item['start'] ? item['start']+item['duration'] : null, duedate);
		if(!item.fake){
			burger_attach_clickHandler.calendar(elem_title_spanDate, item['_type'], item['_id'], null, true);
		}
		elem_title.append(elem_title_spanDate);
		elem_title.append(' ');
	}
	
	var elem_calendar = Elem.find('[find=card_time]');
	var elem_calendar_timestamp = Elem.find('[find=card_time_calendar_timestamp]');

	elem_calendar_timestamp.removeClass('display_none');

	elem_calendar.html(duedate);
	elem_calendar_timestamp.val((item['start']+item['duration'])*1000);
	
	if(!item.fake && !responsive.test("maxMobileL")){
		elem_calendar.click(function(event){
			event.stopPropagation();
		});
		burger_attach_clickHandler.calendar(elem_calendar, item['_type'], item['_id'], null, true);
	}

	/* rightOptions - duedate */
	var elem_rightOptions_duedate = that.add_rightOptionsBox(duedate,'fa-calendar');
	burger_attach_clickHandler.calendar(elem_rightOptions_duedate, item['_type'], item['_id'], null, true);
	// elem_rightOptions_duedate.click(function(){
	// 	var param = {elem_inputOrig:elem_calendar_timestamp };
	// 	submenu_Build('calendar', true, false, param);
	// });
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
	var Elem = $('#-skylist_card').clone().prop('id', '');
	var Elem_rightOptions = Elem.find('[find=card_rightOptions]').recursiveEmpty(0);
	var updated_by;
	var updated_at;
	var created_by;

	/* title */
	var elem_title = Elem.find('[find=title]');
	elem_title.text(item['+title']);

	/* note description */
	var comment = item['-comment'].replace(/<br>|<br \/>/g, " ").replace(/<\/p><p>/g, "<\/p> <p>");
	Elem.find('[find=description]').text($('<div>'+comment+'</div>').text());


	/* note preview image */
	var elem_leftbox = $('<span></span>').addClass('skylist_card_leftbox_abc');
	if(item._files){
		$.each(item._files, function(file_id, obj){
			var file = Lincko.storage.get('files', file_id);
			if(file && !file.deleted_at){
				if(file.category == 'image' || file.category == 'video' || file.category == 'audio' ){
					var thumb_url = Lincko.storage.getLinkThumbnail(file['_id']);
					if(thumb_url){
						
						if(file.category == 'image'){
							elem_leftbox = $('<img />').prop('src',thumb_url);
							elem_leftbox.click(file_id, function(event){
								event.stopPropagation();
								previewer.pic(event.data);
							});
						}
						else if(file.category == 'video'){
							elem_leftbox = $('<img />').prop('src',thumb_url);
							elem_leftbox.click(file_id, function(event){
								event.stopPropagation();
								previewer.video(event.data);
							});
						}
						else if(file.category == 'audio'){
							var fileType_class = app_models_fileType.getClass(file.ori_ext);
							elem_leftbox.removeClass('skylist_card_leftbox_abc').addClass(fileType_class).attr('find','icon');
							elem_leftbox.click(file_id, function(event){
								event.stopPropagation();
								previewer.audio(event.data);
							});
						}
					}
				}
				else{
					var fileType_class = app_models_fileType.getClass(file.ori_ext);
					elem_leftbox.removeClass('skylist_card_leftbox_abc').addClass(fileType_class).attr('find','icon');
				}
				return false;
			}
		});
	}
	Elem.find('[find=card_leftbox]').append(elem_leftbox);


	//locked_by
	if(item['locked_by'] && item['locked_by'] != wrapper_localstorage.uid){
		Elem.attr('locked', item['locked_by']);
	}


	/*created_by*/
	created_by = item['created_by'];
	created_by = Lincko.storage.get("users", created_by,"username");
	Elem.find('[find=name]').html(created_by);

	/* updated_by (quickInfo) */
	Elem.find('[find=quickInfo1]').html(Lincko.Translation.get('app', 53, 'html')/*Updated*/+':&nbsp;');
	var updated_by = Lincko.storage.get("users", item['hist_by'] || item['updated_by'] ,"username");
	Elem.find('[find=quickInfo2]').html(updated_by);


	/* comment */
	var commentCount = 0;
	var comments = Lincko.storage.list('comments', null, null, item['_type'], item['_id'], true);
	commentCount = comments.length;
	Elem.find('[find=commentCount]').html(commentCount);

	updated_at = new wrapper_date(item['hist_at'] || item['updated_at']);
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

	/* title */
	var contenteditable = false;
	var elem_title = Elem.find('[find=title]');
	if( typeof item['_perm'] == 'object' && wrapper_localstorage.uid in item['_perm'] && item['_perm'][wrapper_localstorage.uid][0] > 1 ){ //RCU and beyond
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

	/* rightOptions - updated_by */
	Elem_rightOptions.append(that.add_rightOptionsBox(item['hist_by'] || item['updated_by'],'fa-user'));

	/* rightOptions - duedate */
	Elem_rightOptions.append(that.add_rightOptionsBox(item['hist_at'] || item['updated_at'],'fa-calendar'));

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
	var Elem_rightOptions = Elem.find('[find=card_rightOptions]').recursiveEmpty(0);
	var updated_by;
	var updated_at;
	var created_by;
	var created_at;

	/* title */
	var elem_title = Elem.find('[find=title]');
	elem_title.text(item['+name']);

	/* file description and preview image */
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


	/*created_by*/
	created_by = item['created_by'];
	created_by = Lincko.storage.get("users", created_by,"username");
	Elem.find('[find=name]').html(created_by);

	/* comments */
	var commentCount = 0;
	var comments = Lincko.storage.list('comments',null, null, item['_type'], item['_id'], true);
	commentCount = comments.length;
	Elem.find('[find=commentCount]').html(commentCount);

	/*created_at*/
	created_at = new wrapper_date(item['created_at']);
	if(skylist_textDate(created_at)){
		created_at = skylist_textDate(created_at);
	}
	else{
		created_at = created_at.display('date_very_short');
	}
	Elem.find('[find=card_time]').html(created_at);


	/* updated_by (quickInfo) */
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

	//Skip voice record
	if(item['category'] && item['category']=='voice'){
		return false;
	}

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

		if(canDelete && route && Lincko.storage.canI('delete', that.list_type, itemID)){
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
			
		} else if( that.list_type == "tasks" ){
			base_show_error(Lincko.Translation.get('app', 3631, 'html'), true); //You don't have enough permission to delete a task you did not create
		} else if( that.list_type == "notes" ){
			base_show_error(Lincko.Translation.get('app', 3632, 'html'), true); //You don't have enough permission to delete a note you did not create
		} else if( that.list_type == "files" ){
			base_show_error(Lincko.Translation.get('app', 3633, 'html'), true); //You don't have enough permission to delete a file you did not create
		} else {
			base_show_error(Lincko.Translation.get('app', 51, 'html'), true); //Operation not allowed
		}
	});

	//event actions for swipe left and right on the task
	Elem.on('mousedown touchstart', function(event){ //for firefox, event must be passed as the parameter of this fn
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
		//paperView_typeTask_H = that.list_wrapper.children('.burger_typeTask').outerHeight();
		paperView_typeTask_H = that.list_wrapper.children('.inputter_container').outerHeight();
	}


	that.list_wrapper.height(parentH);
	that.list_subwrapper.height(parentH - that.list_subwrapper.position()['top'] - paperView_typeTask_H);

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
	if(task){
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

		var updated = {};
		updated['tasks_'+task._id] = { approved: true };
		app_application_lincko.prepare('tasks_'+task._id, true, updated);
	}
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

	//dont open on burger tag clicks
	if(target.hasClass('burger_tag')){
		return;
	}


	//comment expandable
	if(target.is('[find=btn_addNew]') || target.hasClass('skylist_clickable')){
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

/*
	---------------------------------
	|	BEGIN paperview methods		|
	---------------------------------
*/
skylist.prototype.paperView_toggleExpandable = function(elem_expandable, forceOpenClose, cb_complete){
	var that = this;

	var forceOpen = false;
	var forceClose = false;
	if(typeof forceOpenClose == 'boolean'){ 
		if(forceOpenClose){ forceOpen = true; }
		else{ forceClose = true; }
	}

	elem_expandable.removeClass('display_none');
	if(!forceClose && elem_expandable.css('display') != 'block'){
		elem_expandable.velocity('stop').velocity("slideDown", {
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
	else if(!forceOpen){
		elem_expandable.velocity("slideUp", {
			mobileHA: hasGood3Dsupport,
			complete: function(){
				that.window_resize();
			}
		});
	}
}

skylist.prototype.paperView_uploadingBox = function(name, temp_id){
	var loadingBox = $('<div>').addClass('skylist_paperView_expandable_boxsize skylist_paperView_expandable_uploading').attr('temp_id',temp_id);
	var fileName = $('<div>').text(name).attr('find','file_name').addClass('ellipsis');
	var bar_container = $('<div>').attr('find', 'bar_container').html('<div find="bar"></div>');
	loadingBox.append(fileName);
	loadingBox.append(bar_container);
	return loadingBox;
}


skylist.prototype.paperView_inputter = function(elem_appendTo, upload_parent_type, upload_parent_id){
	var that = this;

	that.inputterInst = null;

	var fn_createTask = function(parsedData, inputterInst){
		var inputterData = null;
		if(parsedData instanceof inputter){
			var inputterInst = parsedData;
			inputterData = inputterInst.getContent();
			parsedData = burger_parseHTML(inputterData.elem);
		}
		else{
			inputterData = inputterInst.getContent();
		}


		var title = parsedData.text;
		var parent_id = app_content_menu.projects_id == 0 ?  Lincko.storage.getMyPlaceholder()['_id'] : app_content_menu.projects_id ;
		var comment = "<p><br></p>"; //ckeditor default empty content

		//default not assigned
		var in_charge_id = null;
		if(parsedData.userid){
			in_charge_id = parsedData.userid;
		}
		if(Lincko.storage.get('projects', parent_id, 'personal_private')){
		//if project is personal, default to self
			in_charge_id = wrapper_localstorage.uid;
		}
		else if(!in_charge_id && that && that.Lincko_itemsList_filter && that.Lincko_itemsList_filter.people){
		//default to current filtered person, if any
			in_charge_id = that.Lincko_itemsList_filter.people;
		}


		var param = {
			title: title,
			parent_id: parent_id,
			comment: comment,
		}

		//set in charge if not unassigned
		if(in_charge_id){
			param['users>in_charge'] = {};
			param['users>in_charge'][in_charge_id] = true;
		}

		//date logic
		var duration = 86400; //default
		var start = new wrapper_date().getEndofDay(); //midnight today
		var time_now = new wrapper_date();
		var timestamp = parsedData.timestamp;
		if(timestamp == 0
			|| (typeof timestamp != 'number' && typeof timestamp != 'string' && timestamp !== null
			&& that 
			&& $.type(that.Lincko_itemsList_filter) == 'object'
			&& that.Lincko_itemsList_filter.duedate == 0 )){ //if no burger time, and filter is set to today, then make it due end of today
			start -= duration;
		}
		else if(timestamp == 1){
			//do nothing, use DefaultDuration and also dont follow filter
		}
		else if(timestamp === null 
			|| (typeof timestamp == 'undefined'
			&& that 
			&& $.type(that.Lincko_itemsList_filter) == 'object'
			&& that.Lincko_itemsList_filter.duedate == -1 )){
			start = null; //if set to no due date OR no due date is specified but filter is set to all
		}
		else if(timestamp){ //val == due date timestamp in seconds
			start = timestamp - duration;
		}
		param.start = start;

		//approval
		param.approved = inputterData.checked;

		var item = {
			'+title': title,
			'-comment': comment,
			'_parent': ['projects', parent_id],
			'_perm': Lincko.storage.get('projects', parent_id, '_perm'),
			'_type': 'tasks',
			'_users': {},
			'created_at': time_now.timestamp,
			'start': start,
			'duration': duration,
			'updated_by': wrapper_localstorage.uid,
			'updated_at': time_now.timestamp,
			'hist_by':  wrapper_localstorage.uid,
			'hist_at': time_now.timestamp,
			'new': true,
			'approved': param.approved,
		}
		item['_users'][in_charge_id] = {
			approver: true,
			in_charge: true,
		}

		if(that.Lincko_itemsList_filter.view == 'paper'){
			item.paperView = true;
		}


				

		var tempID = null;
		var fakeID = base_getRandomInt(100000000000,999999999999);
		var cb_begin = function(jqXHR, settings, temp_id){
			tempID = temp_id;
			item['temp_id'] = temp_id;
			item['_id'] = fakeID;
			item['fake'] = true;

			that.inputterAddedItems[tempID] = item;

			//files - replace lincko_param with temp_id. do not start file upload yet
			if(inputterData.files_index.length > 0){
				item['showLinks'] = {};
				$.each(inputterData.files_index, function(i, index){
					app_upload_files.lincko_files[index].lincko_param = temp_id;
					item['showLinks'][index] = {
						name: app_upload_files.lincko_files[index].lincko_name,
						temp_id: temp_id,
					};
				});
			}

			//its possible to have the task object missing, if this is a new acct without any tasks
			if(!Lincko.storage.data.tasks){
				Lincko.storage.data.tasks = {};
			}
			Lincko.storage.data.tasks[fakeID] = item;


			if(parent_id == 0)
			{
				parent_id =  Lincko.storage.getMyPlaceholder()['_id'];
			}
			if(!('_children' in Lincko.storage.data.projects[parent_id])){
				Lincko.storage.data.projects[parent_id]['_children'] = {};
			}
			if(!('tasks' in Lincko.storage.data.projects[parent_id]['_children'])){
				Lincko.storage.data.projects[parent_id]['_children']['tasks'] = {};
			}
			Lincko.storage.data.projects[parent_id]['_children']['tasks'][fakeID] = true;
			app_application_lincko.prepare('projects_'+parent_id, true);
			skylist.sendActionQueue.tasks[temp_id] = [];


			var sendButton = inputterInst.getContent().button;
			sendButton.css('filter','alpha(Opacity=50)');
			sendButton.css('-moz-opacity',0.5);
			sendButton.css('opacity',0.5);
			sendButton.addClass('disable');

			//clear inputter (text, checkbox, files)
			inputterInst.clearContent();

		}

		var cb_success = function(){
			skylist.sendActionQueue.tasks.run(tempID);
			var task = Lincko.storage.list('tasks',1,{temp_id: tempID})[0];
			if(!task){ return; }

			that.inputterAddedItems[tempID] = task;

			//files
			$.each(app_upload_files.lincko_files, function(i, file){
				if(file.lincko_param == tempID){
					app_upload_files.lincko_files[i].lincko_parent_type = task._type;
					app_upload_files.lincko_files[i].lincko_parent_id = task._id;
					app_upload_files.lincko_files[i].lincko_status = 'abort';
					app_upload_files.lincko_files[i].abort(); //Force to reinitialize before any start
					app_upload_files.lincko_files[i].lincko_submit();
				}
			});

		}	

		var cb_error = function(){
			delete skylist.sendActionQueue.tasks[tempID];

			//files
			$.each(app_upload_files.lincko_files, function(i, file){
				if(file.lincko_param == tempID){
					var e; //undefined
					$('#app_upload_fileupload').fileupload('option').destroy(e, app_upload_files.lincko_files[i]);
				}
			});
		}

		var cb_complete = function(){
			app_application_lincko.prepare('projects_'+parent_id, true);
			var fakeTask = Lincko.storage.get('tasks',fakeID);
			if(fakeTask){
				delete Lincko.storage.data.tasks[fakeID];
			}
		}
		wrapper_sendAction(param, 'post', 'task/create', cb_success, null, cb_begin, cb_complete);
		return true;
	}

	var inputter_setting = {	
		hasTask : true,											
		row : 3,//desktop height
		max_row : 3,//desk top max height
		mobile_row : 1,//mobile height
		mobile_max_row : 3,//mobile max height
		mobile_backgroup_flag : true, //gray-true;white-false
		mobile_input_border_flag : true, //input border;orange
		top_line : true, //inputter top line for desktop;orange
		mobile_top_line : false, //mobile inputter top line
		enter : fn_createTask, //enter event
		auto_upload : false,
		// left_menu :[	
		// 	[{	element :'chkTask',	}],	
		// ],
		right_menu :	
		[															
			[														
				{													
					element : 'btScissors1',							
					mobile_hide : true,								
				},													
				{													
					element : 'btSend',								
					mobile_hide : true,								
					empty : 'hide',									
					click : fn_createTask,								
				},													
			],														
			[														
				{													
					element : 'btAttachment',						
					//empty : 'show',									
				},													
			],														
		],															
	};

	/* burgerN.regex param
		param.elem_input
		param.projectID
		param.dropdownOffset
		param.disable_shortcutUser
		param.enter_fn
		param.enter_fn_param
		param.shiftEnter
	*/
	var burgerParam = {
		dropdownOffset: 30,
		enter_fn: fn_createTask,
		enter_fn_param: 'inputter',
		shiftEnter: false,
	};

	//if parent project is personal, no '@' shortcut
	var parent_entity = Lincko.storage.get(upload_parent_type, upload_parent_id);
	if(parent_entity.personal_private){
		burgerParam.disable_shortcutUser = true;
	}

	//that.inputterInst = new inputter('skylist_'+that.list_type+'_'+that.md5id, elem_appendTo, upload_parent_type, upload_parent_id, inputter_setting, burgerParam);
	that.inputterInst = new inputter('skylist_'+that.list_type+'_'+that.md5id, elem_appendTo, upload_parent_type, upload_parent_id, inputter_setting, true, function(){
		that.setHeight();
		if( myIScrollList['skylist_'+that.md5id] ){
			myIScrollList['skylist_'+that.md5id].refresh();
		}
	});


	
	return true;
}
/*
	---------------------------------
	|	END OF paperview methods	|
	---------------------------------
*/

skylist.prototype.openDetail = function(/*open,*/ task_elem){
	var that = this;
	var item_id = task_elem.data('item_id');
	var item = Lincko.storage.get(that.list_type, item_id);
	if(!item || item.fake){ //prevent fake items from opening
		return false;
	}

	//that.list.removeClass('skylist_noPreviewLayer');
	var openSuccess = submenu_Build_return(
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
	that.list_wrapper.prepend(that.elem_navbar);

	var personal = Lincko.storage.get("projects", that.pid, 'personal_private');

	if(/*that.pid == 0*/true && that.list_type == 'tasks'){
		that.elem_navbar.addClass('skylist_menu_navbar_globalTask');
		if(!personal){
			that.menu_construct_add_peopleDropdown();
		}
	}
	else if(!personal){
		that.menu_construct_add_peopleToggle();
	}

	
	that.menu_construct_add_btnFilter();
	that.menu_construct_add_searchbar();

	if(that.list_type == 'tasks'){
		if(/*that.pid == 0*/true){
			that.menu_construct_addRingFilters();
		} else {
			that.menu_construct_addTimesort();
		}
	}
}

skylist.prototype.menu_construct_add_peopleDropdown = function(){
	var that = this;
	var elem_target = $('#-skylist_menu_people_dropdown').clone().removeAttr('id');
	that.elem_navbar.find('.skylist_menu_people').append(elem_target);
	var elem_selected = elem_target.find('[find=selected]');
	var elem_dropdown = elem_target.find('[find=dropdown]').addClass('overthrow')
		.mousedown(function(evt){
			evt.preventDefault();//for IE, prevent premature trigger of blur
		}).blur(function(e){
			var elem_this = $(this);
			if(elem_this.hasClass('skylist_menu_people_showDropdown')){
				elem_this.velocity('slideUp',{
					duration: 150,
					mobileHA: hasGood3Dsupport,
					complete: function(){
						elem_this.removeClass('skylist_menu_people_showDropdown');
					}
				});
			}
		});
	

	var return_elem_dropdownBlock = function(uid){
		var elem_person = $('#-skylist_menu_people_dropdownBlock').clone().removeAttr('id');
		if(uid){
			var id_pic = Lincko.storage.get("users", uid, 'profile_pic');
			var url = Lincko.storage.getLinkThumbnail(id_pic) || app_application_icon_single_user.src;
			elem_person.find('[find="profile"]').css('background-image', 'url('+url+')');
			elem_person.find('[find="name"]').text(Lincko.storage.get("users", uid, '-username'));
			elem_person.addClass('skylist_menu_people_dropdownBlock_profile');
		}

		elem_person.click({elem_dropdown: elem_dropdown, elem_selected: elem_selected, uid: uid,}, function(evt){
			if(!$.contains(evt.data.elem_selected.get(0), this)){
				var elem_now = $(this).clone(true);
				evt.data.elem_selected.html(elem_now);
				evt.data.elem_selected.velocity('fadeIn', {
					mobileHA: hasGood3Dsupport,
				});

				var elem_this = $(this);
				evt.data.elem_dropdown.velocity('slideUp', {
					duration: 150,
					mobileHA: hasGood3Dsupport,
					begin: function(){
						evt.data.elem_dropdown.find('.skylist_menu_people_dropdownBlock').removeClass('display_none');
						elem_this.addClass('display_none');
					},
					complete: function(){
						evt.data.elem_dropdown.removeClass('skylist_menu_people_showDropdown');
						that.tasklist_update('people',evt.data.uid);
					}
				});
			}
		});

		return elem_person;
	}

	var u_all = [null];
	//build list of users
	if(false/*paid version*/){
		var u_list = [];
		var id_work = Lincko.storage.getWORKID();
		if(id_work > 0 && Lincko.storage.data.workspaces && Lincko.storage.data.workspaces[id_work]){//workspaces
			var u_obj = false;
			var obj_perm = Lincko.storage.get('workspaces', id_work, '_perm');
			if(typeof obj_perm == 'object'){
				for(var key in obj_perm){
					u_obj = Lincko.storage.get('users', key);
					if(u_obj){
						u_list.push(u_obj);
					}
				}
			}
		} else {
			u_list = Lincko.storage.list('users');
		}

		//alphabetical sorting
		$.each(Lincko.storage.sort_items(u_list, '-username'), function(i, user){
			u_all.push(user._id);
		});		
	} else { //free version
		u_all.push(wrapper_localstorage.uid);
	}

	//add to DOM
	for(var i in u_all){
		if(u_all[i] == that.Lincko_itemsList_filter.people){
			elem_dropdown.append(return_elem_dropdownBlock(u_all[i]).addClass('display_none'));
			elem_selected.append(return_elem_dropdownBlock(that.Lincko_itemsList_filter.people));
		} else {
			elem_dropdown.append(return_elem_dropdownBlock(u_all[i]));
		}
	}

	elem_selected.click({elem_dropdown: elem_dropdown}, function(evt){
		var elem_dropdown = evt.data.elem_dropdown;
		if(!elem_dropdown.hasClass('skylist_menu_people_showDropdown')){
			elem_dropdown.addClass('skylist_menu_people_showDropdown');
			elem_dropdown.velocity('slideDown', {
				duration: 150,
				mobileHA: hasGood3Dsupport,
				complete: function(){
					if(myIScrollList[elem_dropdown.prop('id')]){
						myIScrollList[elem_dropdown.prop('id')].refresh();
					}
					elem_dropdown.focus();
				},
			});
		}
	});
}

skylist.prototype.menu_construct_add_peopleToggle = function(){
	var that = this;
	//individual or group selection in navbar
	var elem_people2 = $('<span people="2" class="skylist_menu_selected base_pointer"></span>');
	var elem_people1 = $('<span people="1" class="base_pointer"></span>');
	that.elem_navbar.find('.skylist_menu_people').append(elem_people2);
	that.elem_navbar.find('.skylist_menu_people').append(elem_people1);

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

	//add tooltips
	if(that.list_type == 'tasks'){
		elem_people1.attr('title', Lincko.Translation.get('app', 3616, 'js')); //View your tasks
		elem_people2.attr('title', Lincko.Translation.get('app', 3615, 'js')); //View the team's tasks
	}
	else if(that.list_type == 'notes'){
		elem_people1.attr('title', Lincko.Translation.get('app', 3622, 'js')); //View notes you created
		elem_people2.attr('title', Lincko.Translation.get('app', 3621, 'js')); //View team's notes
	}
	else if(that.list_type == 'files'){
		elem_people1.attr('title', Lincko.Translation.get('app', 3625, 'js')); //View files you uploaded
		elem_people2.attr('title', Lincko.Translation.get('app', 3624, 'js')); //View team's files
	}
}

skylist.prototype.menu_construct_addTimesort = function(){
	var that = this;
	//timesort
	if( !that.sort_arrayText ){
		if( Lincko.storage.get("projects", that.pid, 'personal_private') ){
			that.elem_navbar.find('.skylist_menu_timesort').addClass('display_none');
		}
	}
	else{
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
			that.elem_sorts_text[sort] = elem_timesort_text_wrapper_tmp;
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

				if ( Math.abs(that.delX) < that.pan_range_max  
					&& typeof that.elem_sorts_text == 'object' && typeof that.sort_array == 'object'
					&& typeof that.elem_sorts_text[that.sort_array[that.sortnum]] == 'object'
					&& typeof that.elem_sorts_text[that.sort_array[that.sortnum_new]] == 'object'){
					that.elem_sorts_text[that.sort_array[that.sortnum]].css("left",that.delX).css("opacity",opacity_fade);
					that.elem_sorts_text[that.sort_array[that.sortnum_new]].removeClass('display_none').css( "left",Math.sign(that.delX)*(Math.abs(that.delX)-that.pan_range_max) ).css("opacity",opacity_show);
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
	}
	

	//menubar tooltips
	if(that.list_type == 'tasks'){
		that.elem_Jsorts.eq(0).attr('title', Lincko.Translation.get('app', 3617, 'js')); //View tasks due any date
		that.elem_Jsorts.eq(1).attr('title', Lincko.Translation.get('app', 3618, 'js')); //View tasks due today
		that.elem_Jsorts.eq(2).attr('title', Lincko.Translation.get('app', 3619, 'js')); //View tasks due tomorrow
	}
}

skylist.prototype.menu_construct_returnRing = function(elem_appendTo, name){
	//append first -- sometimes chart doesnt appear if elem is not already added to the DOM
	var elem = $('#-skylist_menu_ringFilter').clone().removeAttr('id').appendTo(elem_appendTo);
	var ctx = elem.find('canvas');
	elem.children('[find=name]').text(name);
	var data = {
	    datasets: [
		    {
		        data: [1, 0], //dummy values, use that.updateRings to calculate real values
		        backgroundColor: ["#f5a026", '#d8d8d8'],
		        hoverBackgroundColor: ["#f5a026", '#d8d8d8'],
		        borderWidth: 0,
		    }
	    ],
	};
	var ring = new Chart(ctx, {
	    type: 'doughnut',
	    data: data,
	    options: {
	    	responsive: false,
	    	animation: {
	    		duration: wrapper_performance.powerfull ? 1000 : 0,
	    	},
	    	legend: {
	    		display: false,
	    	},
	    	maintainAspectRatio: false,
	    	cutoutPercentage: 85,
	    	tooltips: {
	    		enabled: false,
	    	},
	    }
	});

	return [elem, ring];
}

skylist.prototype.menu_construct_addRingFilters = function(){
	var that = this;
	var elem_pane = that.elem_navbar.find('.skylist_menu_timesort');

	//build overdue ring
	var elem_overdue = $('#-skylist_menu_ringFilter').clone().removeAttr('id').attr('find','overdue');
	elem_overdue.find('[find=name]').text(Lincko.Translation.get('app', 3630, 'js'));//overdue
	elem_pane.append(elem_overdue);

	//build today ring
	var ring_today = that.menu_construct_returnRing(
		elem_pane, Lincko.Translation.get('app', 3302, 'js').toUpperCase() //today
	);
	var elem_today = ring_today[0];
	that.rings.today = ring_today[1];

	//build tomorrow ring
	var ring_tmr = that.menu_construct_returnRing(
		elem_pane, Lincko.Translation.get('app', 3303, 'js').toUpperCase() //tomorrow
	);
	var elem_tmr = ring_tmr[0];
	that.rings.tmr = ring_tmr[1];

	//update values for overdue, today, tomorrow rings
	that.updateRings();


	//add selected css class based on filter settings
	if(that.Lincko_itemsList_filter.duedate == 'overdue'){
		elem_overdue.addClass('skylist_menu_ringFilter_selected');
	}
	else if(that.Lincko_itemsList_filter.duedate == 0){
		elem_today.addClass('skylist_menu_ringFilter_selected');
	}
	else if(that.Lincko_itemsList_filter.duedate == 1){
		elem_tmr.addClass('skylist_menu_ringFilter_selected');
	}


	var e_data = {
		that: that, 
		btns: [elem_overdue, elem_today, elem_tmr], 
	};

	var fn_clickHandler = function(val, e, elem){
		var that = e.data.that;
		
		if(elem.hasClass('skylist_menu_ringFilter_selected')){
			elem.removeClass('skylist_menu_ringFilter_selected');
			that.tasklist_update('duedate',-1);
		} else {
			$.each(e.data.btns, function(i, elem){
				elem.removeClass('skylist_menu_ringFilter_selected');
			});
			elem.addClass('skylist_menu_ringFilter_selected');
			that.tasklist_update('duedate',val);
		}
	}

	elem_overdue.click(e_data, function(e){
		fn_clickHandler('overdue',e,$(this));
	});
	elem_today.click(e_data, function(e){
		fn_clickHandler(0,e,$(this));
	});
	elem_tmr.click(e_data, function(e){
		fn_clickHandler(1,e,$(this));
	});
}

skylist.prototype.updateRings = function(){
	var that = this;
	clearTimeout(that.timeout_updateRings);
	that.timeout_updateRings = setTimeout(function(){
		var items_person = skylist.prototype.filter_by_people(that.Lincko_itemsList, that.Lincko_itemsList_filter.people);

		//update overview ring
		var elem_overdue = that.elem_navbar.find('[find="overdue"]');
		var count_overdue = 0;
		var now = new wrapper_date().time;
		$.each(items_person, function(i, item){
			if(tasks_isOverdue(item, now)){
				count_overdue++;
			}
		});
		if(count_overdue > 0){
			elem_overdue.addClass('skylist_menu_ringFilter_overdue');
		} else {
			elem_overdue.removeClass('skylist_menu_ringFilter_overdue');
		}
		elem_overdue.find('[find="count"]').text(count_overdue);

		//update today and tomorrow chartjs rings
		if(that.rings && !$.isEmptyObject(that.rings)){
			$.each(that.rings, function(key, ring){
				if(ring instanceof Chart.Controller){
					var date;
					if(key == 'today'){ date = 0; }
					else if(key == 'tmr'){ date = 1; }
					if(typeof date == 'number'){
						var approved_old = ring.data.datasets[0].data[0];
						var total_old = approved_old + ring.data.datasets[0].data[1];

						var items_all = skylist.prototype.filter_by_duedate(items_person, date);
						var approved = 0;
						for(var i in items_all){
							if(items_all[i].approved){
								approved++;
							}
						}

						//update if different
						if(total_old != items_all.length || approved_old != approved){
							//if there are no tasks, then consider 100% filled
							if(items_all.length < 1){
								ring.data.datasets[0].data[0] = 1;
								ring.data.datasets[0].data[1] = 0;
							} else {
								ring.data.datasets[0].data[0] = approved;
								ring.data.datasets[0].data[1] = items_all.length - approved;
							}
							ring.update();
							$(ring.chart.canvas.parentElement).find('[find=count]').text(items_all.length - approved);
						}
					}
				}
			});
		}
	}, 300);
}

skylist.prototype.menu_construct_add_btnFilter = function(){
	var that = this;
	//filter btn
	var elem_filter_pane = that.elem_navbar.find('.skylist_menu_navbar_filter_pane');
	var elem_filterBtn = that.elem_navbar.find('.skylist_menu_navbar_filter_icon');
	elem_filterBtn.click(function(){
		if( elem_filter_pane.css('display')=='none' ){
			elem_filterBtn.attr('active',true);
			elem_filter_pane.velocity('slideDown',{
				duration: 150,
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
			duration: 150,
			mobileHA: hasGood3Dsupport,
		});
	});


	//populate the filter_pane
	if( that.list_type == 'tasks' ){
		that.addFilter_tasks(elem_filter_pane);
	}
}

skylist.prototype.menu_construct_add_searchbar = function(){
	var that = this;
	//build searchbar
	var searchbarInst = null;
	var searchbar_keyup = function(words){
		that.tasklist_update('search', words);
	}
	searchbarInst = searchbar.construct(searchbar_keyup);
	that.elem_navbar.find('[find=searchbar_wrapper]').append(searchbarInst.elem);
}

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
	var elem_checkboxWrapper = $('#-skylist_filter_tasks_checkbox_wrapper').clone().prop('id','').appendTo(elem_block2);

	var elem_filterIcon = that.elem_navbar.find('.skylist_menu_navbar_filter_icon');

	that.elem_navbar.find('[find=radio_wrapper] .skylist_menu_navbar_filter_pane_optionWrapper').click(function(){
		var elem_radio = $(this).closest('[find=radio_wrapper]').find('.skylist_menu_navbar_filter_pane_optionWrapper [find=radio]');
		var val = $(this).attr('val');

		if( $(this).find('[find=radio]').hasClass('fa-circle') ){
			that.tasklist_update('sort_alt', that.Lincko_itemsList_filter.sort_alt );
			elem_filterIcon.click();
			return false;
		}
		else{
			elem_radio.removeClass('fa-circle');
			$(this).find('[find=radio]').toggleClass('fa-circle');
			that.tasklist_update('sort_alt', val);
			//that.tasklist_update('sort_alt', !that.Lincko_itemsList_filter.sort_alt );
			elem_filterIcon.click();
		}
	});

	//checkbox - show completed
	elem_checkboxWrapper.find('[find=tb_completed]').click(function(){
		$(this).find('[find=checkbox]').toggleClass('fa-check');
		that.tasklist_update('hide_completed', !that.Lincko_itemsList_filter.hide_completed );
		elem_filterIcon.click();
	});

	//checkbox - showLinks
	elem_checkboxWrapper.find('[find=tb_showLinks]').click(function(){
		var elem_checkbox = $(this).find('[find=checkbox]');
		elem_checkbox.toggleClass('fa-check');
		that.paperview_filter_showLinks(elem_checkbox.hasClass('fa-check'));
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
		that.elem_navbar.find('[find=radio_wrapper] [find=radio]').removeClass('fa-circle');
		that.elem_navbar.find('[find=radio_wrapper] [val='+that.Lincko_itemsList_filter.sort_alt+'] [find=radio]').addClass('fa-circle');
	}

	if(that.Lincko_itemsList_filter.hide_completed){
		that.elem_navbar.find('[find=checkbox_wrapper] [find=tb_completed] [find=checkbox]').removeClass('fa-check');
	}

	if(that.Lincko_itemsList_filter.view == 'card'){
		elem_block1.find('td[find=card]').addClass('skylist_lightblueBG');
	}
	else if(that.Lincko_itemsList_filter.view == 'paper'){
		elem_block1.find('td[find=paper]').addClass('skylist_lightblueBG');
	}

	if(!that.Lincko_itemsList_filter.showLinks){
		that.elem_navbar.find('[find=checkbox_wrapper] [find=tb_showLinks] [find=checkbox]').removeClass('fa-check');
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
	if(!that.list){ return; }

	var updated = false;
	elem_fakes = that.list.find('[fake]');

	$.each(elem_fakes, function(i,elem){
		elem = $(elem);
		var temp_id = elem.attr('temp_id');
		var param = {
			temp_id: temp_id,
		}
		var item_real = Lincko.storage.list(that.list_type, 1, param, 'projects', app_content_menu.projects_id || null, false);
		$.each(item_real, function(j, item){
			if(!item.fake){
				var elem_newCard = that.addCard(item);
				elem.find('input').blur();
				if($(elem.find('[find=card_time_calendar_timestamp]'))){
					$(elem.find('[find=card_time_calendar_timestamp]')).datepicker('hide');
				}

				if(elem.attr('showLinks') && that.Lincko_itemsList_filter.view == 'paper'){
					elem_newCard.find('[find=expandable_links]').css('display', 'block');
				}

				elem.replaceWith(elem_newCard);
				elem_newCard.velocity('fadeOut',{
					mobileHA: hasGood3Dsupport,
					duration: 200,
				}).velocity('fadeIn', {
					mobileHA: hasGood3Dsupport,
					complete: function(){
						$(this).attr('style','');
					},
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
	if(typeof sendAction === 'undefined'){ var sendAction = true; }
	
	var settings_new = Lincko.storage.getSettings();
	//offline settings
	//var settings_old = Lincko.storage.settings;


	//compare with current settings object to determine whether to update server with new settings
	try{
		var currentSettings = JSON.parse(JSON.stringify(that.Lincko_itemsList_filter));
		if(typeof currentSettings == 'object'){ currentSettings.search = ''; }
		if( JSON.stringify(settings_new.skylist.filter[that.pid][that.list_type]) == JSON.stringify(currentSettings)){
			return false; //settings are already the same, no need to continue
		}
	}
	catch(e){}


	if($.type(settings_new) != 'object'){
		settings_new = {};
	}
	if($.type(settings_new.skylist) != 'object'){
		settings_new.skylist = {};
	}
	if($.type(settings_new.skylist.filter) != 'object'){
		settings_new.skylist.filter = {};
	}
	if($.type(settings_new.skylist.filter[that.pid]) != 'object'){
		settings_new.skylist.filter[that.pid]  = {};
	}

	if(!sendAction){
		if(settings_new.skylist.filter[that.pid][that.list_type]){
			$.each(settings_new.skylist.filter[that.pid][that.list_type], function(filterType, val){
				that.Lincko_itemsList_filter[filterType] = val;
			});
			//that.Lincko_itemsList_filter = settings_new.skylist.filter[app_content_menu.projects_id][that.list_type];
		}
		return;
	}
	
	settings_new.skylist.filter[that.pid][that.list_type] = JSON.parse(JSON.stringify(that.Lincko_itemsList_filter));
	settings_new.skylist.filter[that.pid][that.list_type].search = ''; //search filter is not saved
	Lincko.storage.setSettings(settings_new);

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
			var items = Lincko.storage.list('tasks', null, {temp_id: temp_id}, 'projects', null, false);
			var id_real = null;
			$.each(items, function(i,item){
				if(!item.fake){
					id_real = item._id;
				}
				else{ //delete item if it is fake
					delete Lincko.storage.data.tasks[item._id];
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

			//if the task's project id is updated, its subtasks must follow to the new project
			if(param.parent_id && item._tasksdown){
				$.each(item._tasksdown, function(subtask_id, obj){
					wrapper_sendAction({id: subtask_id, parent_id: param.parent_id}, 'post', 'task/update');
				});
			}
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

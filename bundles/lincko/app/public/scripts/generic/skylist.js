//polyfill
if (!Math.sign) {
	Math.sign = function (x) {
		x = +x;
		if (x === 0 || isNaN(x)) {
			return x;  
		}
		return x > 0 ? 1 : -1;
	};
}


var skylist_calcDuedate = function(task_obj){
	var duedate = new wrapper_date(task_obj.start + parseInt(task_obj.duration,10));
	return duedate;
}

var skylist = function(list_type, list_wrapper, sort_array){
	this.that = this;
	var that = this;

	this.list_type = list_type;
	
	this.md5id = md5(Math.random());
	this.window_resize_timeout = null;


	//timesort-------------------------------------------------
	this.elem_navbar;
	this.elem_timesort;
	this.sortcount = 0;
	if( sort_array == null ){ sort_array=[]; }
	this.sort_array = sort_array;
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
	this.elem_taskcenter_all;
	this.elem_leftOptions_all;
	this.elem_rightOptions_all;
	this.elem_task_all;

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
	this.elem_leftOptions_count = 1;
	this.elem_leftOptions_width = 80;
	this.elem_rightOptions = null;
	this.elem_rightOptions_count = 2;
	this.elem_rightOptions_width = 80;
	this.elem_leftOptionsL;
	this.elem_rightOptionsL;
	this.mousedown = false;
	this.pan_threshold = {bool: false, valX: 20, valY:50};
	this.panyes = false;
	this.options_startL;


	//variables for construct
	this.list_wrapper = list_wrapper;
	this.list_subwrapper;
	this.list;
	this.task;
	this.Lincko_itemsList;
	this.elem_newcardCircle;
	this.elem_newcardBox;
	this.detail;
	this.construct();

}

skylist.prototype.construct = function(){
	console.log('skylist.construct');
	var that = this;
	that.list_wrapper = that.list_wrapper.empty();
	that.list_subwrapper = $('#-skylist_subwrapper').clone().prop('id','');

	that.menu_construct();

	that.list = $('#-skylist').clone()
		.prop('id','skylist_'+that.md5id)
		.appendTo(that.list_subwrapper);
	that.list_subwrapper.appendTo(that.list_wrapper);

	that.elem_newcardCircle = $('#-skylist_newcardCircle').clone()
		.prop('id','skylist_newcardCircle_'+that.md5id)
		.click(function(){
			if( that.list_type == 'tasks' ){
				submenu_Build('taskdetail', null, null, 'new', true);
			}
			if( that.list_type == 'notes' ){
				//submenu_Build('notesdetail', null, null, 'new', true);
			}
		})
		.appendTo(that.list_wrapper);

	that.generate_Lincko_itemsList();
	that.addCard_all();
	that.setHeight();

	$(window).on("resize.skylist_"+that.md5id, function(){
		clearTimeout(that.window_resize_timeout);
		that.window_resize_timeout = setTimeout(function(){
			that.window_resize();
		},100);
	});
	that.window_resize();
	//$(window).trigger('resize');

	$(document).on("previewHide.skylist_"+that.md5id, function(){
		that.previewHide();
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

		IScroll.on('scrollEnd', function(){
			console.log('scrollEnd');

		});//scrollEnd
	}

	console.log('end of construct');
}//end of construct

skylist.prototype.destroy = function(){
	var that = this;
	that.list_wrapper.empty();
	$(window).off("resize.skylist_"+that.md5id);
	$('body').off("mouseleave.skylist_"+that.md5id);
	$(document).off("previewHide.skylist_"+that.md5id);
	for( var g in that ){
		console.log('g: '+g);
		console.log(that);
		that[g] = null;
		delete that[g];
		console.log(that);
	}
	that = null;
	delete that;
}

skylist.prototype.previewHide = function(){
	console.log('previewHide');
	this.elem_task_all.removeClass('skylist_TaskSelected');
	//this.list.addClass('skylist_noPreviewLayer');
	$(window).resize();
}

skylist.prototype.generate_Lincko_itemsList = function(){
	var that = this;
	if (that.list_type == "chats") {
		that.Lincko_itemsList = mainMenu.getlist(null, app_content_menu.projects_id);
	}
	else if (that.list_type == "global_chats") {
		that.Lincko_itemsList = mainMenu.getlist();
	}
	else{
		if(app_content_menu.projects_id == Lincko.storage.getMyPlaceholder()['_id']){
			that.Lincko_itemsList = Lincko.storage.list(that.list_type, null, true);
		} else {
			that.Lincko_itemsList = Lincko.storage.list(that.list_type, null, {'_parent': ['projects', app_content_menu.projects_id]});
		}
	}
}

skylist.prototype.store_all_elem = function(){
	console.log('store_all_elem fn');
	//should be lanunched when all DOM is loaded
	//this.elem_taskblur_all = this.tasklist.find('.app_layers_dev_skytasks_taskblur');
	this.elem_taskcenter_all = this.list.find('[find=task_center]');
	this.elem_leftOptions_all = this.list.find('[find=card_leftOptions]');
	this.elem_rightOptions_all = this.list.find('[find=card_leftOptions]');

	this.elem_task_all = this.list.find('[find=card]');
}

skylist.prototype.window_resize = function(){
	var that = this;

	that.window_width = $(window).width();
	console.log('window_width: '+that.window_width);
	that.editing_focus = false;
	that.setHeight();
	that.clearOptions();

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

	if( myIScrollList['skylist_'+that.md5id] ){
		myIScrollList['skylist_'+that.md5id].refresh();
		console.log('IScroll refresh');
		
	}
	console.log(that.md5id);
	console.log('end of resize -- ClassTasklist');
}

skylist.prototype.skylist_update = function(type, filter_by){
	var that = this;
	var items;
	var items_filtered = [];
	var current_user_id = wrapper_localstorage.uid;

	items = that.Lincko_itemsList;

	for( var i in items ){
		item = items[i];

		//item['_users'][0]

	}
}

skylist.prototype.tasklist_update = function(type, filter_by){
	console.log('tasklist_update filter: ');
	console.log(filter_by);
	var that = this;
	var items;
	var items_filtered = [];
	var item;
	var taskcount = 0;
	var iscroll_elem;

	if( type=='duedate' || !type ){
		var duedate;
		if 		( filter_by == Lincko.Translation.get('app', 3302, 'html').toUpperCase()/*today*/ ){filter_by = 0}
		else if ( filter_by == Lincko.Translation.get('app', 3303, 'html').toUpperCase()/*tomorrow*/ ){filter_by = 1}
		else if ( filter_by == 'Spaces' ){}
		else{ filter_by = null }

		//items = Lincko.storage.list('tasks');
		items = that.Lincko_itemsList;

		for (var i in items){
			item = items[i];
			duedate = app_layers_dev_skytasks_calcDuedate(item);
			if(filter_by == null || duedate.happensSomeday(filter_by)){
				items_filtered.push(item);
				taskcount += 1;
			}
		}
	}
	else if( type == 'search'){
		items_filtered = Lincko.storage.search(filter_by[0], filter_by[1], filter_by[2])[filter_by[2]];
		if(items_filtered){
			taskcount = items_filtered.length;
		}
		console.log(taskcount);
	}

	that.list.velocity("fadeOut",{
		duration: 200,
		complete: function(){
			if( that.list.find('.iscroll_sub_div').length > 0 ){
				iscroll_elem = that.list.find('.iscroll_sub_div').empty();
			}else{
				iscroll_elem = that.list.empty();
			}

			if( taskcount==0 ){
				iscroll_elem.append('<div class="app_layers_dev_skytasks_task">There are no tasks.</div>');
			}
			else{
				for (var i in items_filtered){
					item = items_filtered[i];
					iscroll_elem.append(that.addCard(item));
				}
			}
			
			that.store_all_elem();
			$('#app_layers_dev_skytasks_navbar').removeAttr('style');
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
skylist.prototype.addCard_all = function(){
	console.log('addCard_all');
	var that = this;
	var items;
	items = that.Lincko_itemsList;
	var item;
	for (var i in items){
		item = items[i];
		that.list.append(that.addCard(item));
	}
	console.log(that.list);
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
	return elem_card;
}

skylist.prototype.addTask = function(item){
	console.log('addTask');
	var that = this;
	var Elem = $('#-skylist_card').clone();
	var Elem_checkbox = $('#-skylist_checkbox').clone().prop('id','');
	Elem.find('[find=card_leftbox]').html(Elem_checkbox);
	var Elem_rightOptions = Elem.find('[find=card_rightOptions]').empty();
	var created_by;
	var duedate;

	if(item == null){
		item = {};
		item['_id'] = 'blankTask';
		item['+title'] = 'blankTask';
		item['_perm'][0] = 3; //RCUD
		item['created_by'] = wrapper_localstorage.uid;
		item.start = $.now()/1000;
		item.duration = "86400";
	}
	Elem.prop('id','skylist_card_'+that.md5id+'_'+item['_id']);

	/*
	checkbox
	*/
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

	/*
	title
	*/
	var contenteditable = false;
	var elem_title = Elem.find('[find=title]');
	if(item['_perm'][0] > 1 ){ //RCU and beyond
		contenteditable = true; 
	}
	elem_title.html(item['+title']);
	elem_title.on('mousedown touchstart', function(event){ 
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
	burger(Elem.find('[find=title]'), 'regex');


	/*created_by*/
	created_by = item['created_by'];
	created_by = Lincko.storage.get("users", created_by,"username");
	Elem.find('[find=name]').html(created_by);
	
	/*
	rightOptions - created_by
	*/
	Elem_rightOptions.append(that.add_rightOptionsBox(created_by,'fa-user'));


	/*duedate = new wrapper_date(item.start + parseInt(item.duration,10));*/
	duedate = skylist_calcDuedate(item);
	if( duedate.happensSomeday(0) ){
		duedate = Lincko.Translation.get('app', 3302, 'html').toUpperCase()/*today*/;
	}
	else if( duedate.happensSomeday(1) ){
		duedate = Lincko.Translation.get('app', 3303, 'html').toUpperCase()/*tomorrow*/;
	}
	else{
		duedate = duedate.display();
	}
	Elem.find('[find=card_time]').html(duedate);

	/*
	rightOptions - duedate
	*/
	Elem_rightOptions.append(that.add_rightOptionsBox(duedate,'fa-calendar'));

	Elem.data('taskid',item['_id']);
	Elem.data('options',false);

	Elem.find('[type=checkbox]').on('click', function(event){
		that.checkboxClick(event,this);
	});
	
	Elem.on('click', function(event){
		if( that.panyes == false ){
			that.taskClick(event,this);
		}
	});
	Elem.find('[find=title]').focus(function(){
		clearTimeout(that.editing_timeout);
		that.editing_focus = true;
		console.log('that.editing_focus: '+that.editing_focus);
	});
	Elem.find('[find=title]').blur(function(){
		that.editing_timeout = setTimeout(function(){
			that.editing_focus = false;
			that.editing_target.attr('contenteditable',false);
			console.log('that.editing_focus: '+that.editing_focus);
		},200);
	});

	that.add_cardEvents(Elem);

	return Elem;
}

skylist.prototype.addNote_all = function(){
	console.log('addNote_all');
	var that = this;
	var items;
	//var items = Lincko.storage.list('tasks');
	items = that.Lincko_itemsList;
	var item;
	for (var i in items){
		item = items[i];
		that.list.append(that.addNote(item));
	}
	console.log(that.list);
	that.store_all_elem();
}
skylist.prototype.addNote = function(item){
	var that = this;
	var Elem = $('#-skylist_card').clone();
	Elem.find('[find=card_leftbox]').addClass('skylist_card_leftbox_empty');
	var Elem_rightOptions = Elem.find('[find=card_rightOptions]').empty();
	var created_by;
	var created_at;

	if(item == null){
		item = {};
		item['_id'] = 'blankNote';
		item['+title'] = 'blankNote';
		item['-comment'] = 'blankNote';
		item['_perm'][0] = 3; //RCUD
		item['created_by'] = wrapper_localstorage.uid;
		item['created_at'] = $.now()/1000;
	}
	Elem.prop('id','skylist_card_'+that.md5id+'_'+item['_id']);

	/*
	title
	*/
	var contenteditable = false;
	var elem_title = Elem.find('[find=title]');
	if(item['_perm'][0] > 1 ){ //RCU and beyond
		contenteditable = true; 
	}
	elem_title.html(item['+title']);
	elem_title.on('mousedown touchstart', function(event){ 
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
	burger(Elem.find('[find=title]'), 'regex');

	/*
	 note body
	 */
	Elem.find('[find=description]').html(item['-comment']);


	/*created_by*/
	created_by = item['created_by'];
	created_by = Lincko.storage.get("users", created_by,"username");
	Elem.find('[find=name]').html(created_by);
	
	/*
	rightOptions - created_by
	*/
	Elem_rightOptions.append(that.add_rightOptionsBox(created_by,'fa-user'));


	/*duedate = new wrapper_date(item.start + parseInt(item.duration,10));*/

	created_at = new wrapper_date(item['created_at']);
	Elem.find('[find=card_time]').html(created_at.display());

	/*
	rightOptions - duedate
	*/
	Elem_rightOptions.append(that.add_rightOptionsBox(created_at,'fa-calendar'));

	Elem.data('noteid',item['_id']);
	Elem.data('options',false);

	
	Elem.on('click', function(event){
		if( that.panyes == false ){
			that.taskClick(event,this);
		}
	});
	Elem.find('[find=title]').focus(function(){
		clearTimeout(that.editing_timeout);
		that.editing_focus = true;
		console.log('that.editing_focus: '+that.editing_focus);
	});
	Elem.find('[find=title]').blur(function(){
		that.editing_timeout = setTimeout(function(){
			that.editing_focus = false;
			that.editing_target.attr('contenteditable',false);
			console.log('that.editing_focus: '+that.editing_focus);
		},200);
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
	//event actions for swipe left and right on the task
	Elem.on('mousedown touchstart', function(event){ //for firefox, event must be passed as the parameter of this fn
		//console.log(e);
		if( responsive.test("maxMobileL")){
			that.on_mousedown(event, $(this));
		}
	});
	Elem.on('mousemove touchmove', function(event){ //for firefox, event must be passed as the parameter of this fn
		if( responsive.test("maxMobileL") && that.mousedown ){
			console.log('elem.on mousemove');
			that.on_mousemove(event);
		}
	});
	Elem.on('mouseup touchend', function(){
		if( responsive.test("maxMobileL") && that.mousedown ){
			that.on_mouseup();
		}
	});
	$('body').on("mouseleave.skylist_"+that.md5id, function(){
		console.log('mouseleave');
		Elem.mouseup();//trigger mouseup
	});
}


skylist.prototype.on_mousedown = function(event, task_elem){
	/*
		task_elem must be JQuery object of the task element at hand
	*/
	console.log('on_mousedown');
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
	console.log(that.mousedown);

}

skylist.prototype.on_mousemove = function(event){
	console.log('on_mousemove');
	var that = this;
	var elem_options;

	that.delX_now = that.delX;
	that.delX = (event.pageX || event.originalEvent.touches[0].pageX || event.touches[0].pageX) - that.delX_ini;
	that.delX_now = that.delX - that.delX_now;
	that.delY = (event.pageY || event.originalEvent.touches[0].pageY || event.touches[0].pageY) - that.delY_ini;


	//if past threshold, slide left or right options
	if ( that.pan_threshold.bool && Math.abs(that.delY) < that.pan_threshold.valY ){
		console.log('sliding...');
			if(Math.abs(parseInt(that.actiontask.css('left'),10)) >= $(window).width()/2 ){return;}
			that.actiontask.css('left', that.options_startL + that.delX);
	}
	//if just past threshold, initialize
	else if ( Math.abs(that.delX) > that.pan_threshold.valX && Math.abs(that.delY) < that.pan_threshold.valY){		
		console.log('initialize...');
		that.options_startL = parseInt(that.actiontask.css('left'),10);
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
	console.log('on_mouseup');
	var that = this;
	
	if( that.panyes ){
		/*app_layers_skytasks_panyes=true prevents click event after panend event*/
		setTimeout(function(){ that.panyes=false }, 5);
	}
	that.mousedown = false;

	if( that.pan_threshold.bool ){
		//righthand side option
		if( parseInt(that.actiontask.css('left'),10) < 0 ){
			console.log('mouseup rightoptions');
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
			console.log('mouseup leftoptions');
			var leftOptions_totalW = that.elem_leftOptions_count*that.elem_leftOptions_width;
			console.log(leftOptions_totalW);
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

skylist.prototype.clearOptions = function(task){
	var that = this;
	console.log('clearOptions fn');
	if( !task ){
		that.elem_task_all.removeAttr('style');
		that.elem_task_all.data('options',false);
	}
	else{
		that.actiontask.data('options',false);
		task.velocity( {left: 0});
	}
}

skylist.prototype.setHeight = function(){
	var that = this;
	var height = $(window).height() - $('#app_content_top').outerHeight() /*- $('#app_layers_dev_skytasks_navbar').outerHeight()*/;
	if(responsive.test("maxMobileL")){
		height -= $('#app_content_menu').outerHeight();
	}
	that.list_wrapper.height(height);
	that.list_subwrapper.height(height - that.elem_navbar.outerHeight());
}

skylist.prototype.checkboxClick = function(event,task_elem){
	console.log('checkboxClick');
	event.stopPropagation();

	var task = $(task_elem).closest('.skylist_card');

	task.toggleClass('skylist_card_opacity');

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
	console.log('taskClick');
	if( !(task_elem instanceof jQuery) ){
		task_elem = $(task_elem);
	}
	var that = this;
	var target = $(event.target);
		if( target.is('label') || target.is('input') || target.attr('contenteditable')=="true" || that.editing_focus || that.is_scrolling ){
			console.log(target);
			return;
		}
	
	//clicking on the task will close options
	var task_elem_left = parseInt(task_elem.css('left'),10);
	if( $.isNumeric(task_elem_left) && task_elem_left != 0 ){
		that.clearOptions(task_elem);
		return;
	}
	that.elem_task_all.removeClass('skylist_TaskSelected');
	task_elem.addClass('skylist_TaskSelected');
	this.openDetail(task_elem);

}

skylist.prototype.openDetail = function(/*open,*/ task_elem){
	var that = this;
	var taskid = task_elem.data('taskid');
	//that.list.removeClass('skylist_noPreviewLayer');
	submenu_Build('taskdetail', null, null, taskid, true);
}



/*
 *menu methods (old timesort functions)-------------------------------------------------------------------------------------
*/
skylist.prototype.menu_construct = function(){
	console.log('menu_construct');
	var that = this;
	//navbar
	that.elem_navbar = $('#-skylist_menu_navbar').clone().prop('id','skylist_menu_navbar');

	//individual or group selection in navbar
	that.elem_navbar.find('[people]').on('click', function(){
		console.log('people clicked');
		var selection = $(this);
		$('#skylist_menu_navbar [people]').removeClass('skylist_menu_selected');
		selection.addClass('skylist_menu_selected');
	});

	that.elem_navbar.find('[find=search_icon]').click(function(){
		var textbox = $(this).prev('[find=search_textbox]');
		if( textbox.hasClass('display_none')){
			textbox.velocity({width:150},
				{
					begin: function(){
						textbox.removeClass('display_none');
					},
					complete: function(){
						textbox.focus();
					}
				}
			);
		}
		else{
			textbox.velocity({width:0},
				{
					complete: function(){
						textbox.addClass('display_none');
					},
				}
			);
		}
	});
	//burger(that.elem_navbar.find('[find=search_textbox]'), 'regex');

	var tasklist_search = function(term){
		console.log('tasklist_search');
		var filter_by = ['word', term, 'tasks'];
		console.log(filter_by);
        that.tasklist_update('search',filter_by);
	}

	that.elem_navbar.find('[find=search_textbox]').keyup(function(event){
		app_layers_dev_skytasks_tasklist_searchTerm = $(this).val();
		clearTimeout(app_layers_dev_skytasks_tasklist_searchTimeout);
		if(event.keyCode == 13){
			tasklist_search(app_layers_dev_skytasks_tasklist_searchTerm);
		}
		else{
			app_layers_dev_skytasks_tasklist_searchTimeout = setTimeout(function(){
				tasklist_search(app_layers_dev_skytasks_tasklist_searchTerm);
			},400);
		}
	});
	
	that.list_wrapper.append(that.elem_navbar);

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
		elem_timesort_text_wrapper_tmp.find('[find=text]').html(sort);
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
		console.log('panstart');
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
		console.log('panmove');
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
		console.log('panend');
		if (responsive.test("maxMobileL") && that.sortnum_new != null){

			if (Math.abs(that.delX) < that.pan_range_min){ //threshold when timesort will scroll to next sort
				//undo timesort change
				that.menu_sortnum_fn_rev();
			}
			console.log('pandirection: '+that.pan_direction);
			console.log('sort: '+that.sort_array[that.sortnum]);
			console.log(that.elem_sorts_text[that.sort_array[that.sortnum]]);
			console.log('sortNew: '+that.sort_array[that.sortnum_new]);
			
			that.elem_sorts_text[that.sort_array[that.sortnum_new]].velocity({left: 0});
			//that.elem_sorts_text[that.sort_array[that.sortnum]].velocity({opacity:0},500); 

			that.menu_makeSelection(that.sort_array[that.sortnum_new]);
			that.sort_fn('duedate',that.sort_array[that.sortnum_new]);
		
		}

	});//end of panend
	/*hammer.js END--------------------------------------*/

} //construct END

skylist.prototype.menu_makeSelection = function(selection){
	console.log('makeSelection: '+selection);
	var that = this;
	if(that.elem_sorts[selection]){
		that.elem_Jsorts.find('[find=indicator]').removeClass('icon-Indicator');
		that.elem_sorts[selection].find('[find=indicator]').addClass('icon-Indicator');
		that.active_sort = selection;
	}
	if (responsive.test("maxMobileL")){
		$.each(that.elem_sorts_text, function(name,value){
			value.addClass('display_none');//.removeClass('skylist_menu_selected');
		});
		that.elem_Jsorts.removeClass('skylist_menu_timesort_selected');
		that.elem_sorts[selection].removeClass('display_none').addClass('skylist_menu_timesort_selected');
		
		that.elem_Jsorts.removeAttr("style");
	}
	else{
		console.log('selection does not exist.');
	}
}//makeSelection END

skylist.prototype.menu_sortnum_fn = function(){
	console.log('sortnum_fn');
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
	console.log('sortnum: '+that.sortnum);
	console.log('sortnum_new: '+that.sortnum_new);
} //end of sortnum_fn

skylist.prototype.menu_sortnum_fn_rev = function(){
	console.log('sortnum_fn_rev');
	var that = this;
	var sortnum_temp;
	sortnum_temp = that.sortnum_new;
	that.sortnum_new = that.sortnum;
	that.sortnum = sortnum_temp;
}//end of sortnum_fn_rev
/*
 * END OF menu methods (old timesort functions)--------------------------------------------------------------------------
*/


skylist.prototype.minTablet = function(){
	console.log('skylist minTablet');
	var that = this;
	//that.elem_newcardCircle.removeAttr("style");

	var simpleDesktopWidth = 1000;
	var simpleDesktopWidth2 = 800;
	var list_width = that.list_wrapper.width();
	if( list_width < simpleDesktopWidth2 ){
		that.list_wrapper
			.addClass('skylist_simpleDesktop')
			.addClass('skylist_simpleDesktop2');
	}
	else if( list_width < simpleDesktopWidth ){
		that.list_wrapper
			.addClass('skylist_simpleDesktop')
			.removeClass('skylist_simpleDesktop2');
	}
	else if( list_width >= simpleDesktopWidth ){
		that.list_wrapper
			.removeClass('skylist_simpleDesktop')
			.removeClass('skylist_simpleDesktop2');
	}

	that.elem_Jsorts.removeClass('display_none');


}

skylist.prototype.maxMobileL = function(){
	console.log('skylist maxMobileL');
	var that = this;
	that.elem_Jsorts.not('.skylist_menu_timesort_dot').addClass('display_none');
	that.elem_navbar.find('.icon-Indicator').closest('.skylist_menu_timesort_text_wrapper').removeClass('display_none');
}

skylist.prototype.minMobileL = function(){
	console.log('dev_skytasks_list minMobileL');
	var that = this;
	that.list.find('[find=task_rightOptions]').removeAttr("style").removeClass('display_none');
	that.list.find('[find=task_center]').removeAttr('style');

	that.elem_taskcenter_all.find('[find=title]').prop('contenteditable',true);

/*
	that.elem_leftOptions_all.width(that.window_width*2)
					.css('left',-that.window_width*2)
					.removeClass('display_none');
*/
}

skylist.prototype.isMobile = function(){
	console.log('dev_skytasks_list isMobile');
	var that = this;
	//that.list.find('[find=task_rightOptions]').addClass('display_none');

	that.elem_taskcenter_all.find('[find=title]').prop('contenteditable',false);
}

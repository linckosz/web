//polyfill
/*
if (!Math.sign) {
	Math.sign = function (x) {
		x = +x;
		if (x === 0 || isNaN(x)) {
			return x;  
		}
		return x > 0 ? 1 : -1;
	};
}
*/


var skylist_calcDuedate = function(task_obj){
	var duedate = new wrapper_date(task_obj.start + parseInt(task_obj.duration,10));
	return duedate;
}


var skylist = function(list_type, list_wrapper){
	this.that = this;
	var that = this;

	this.list_type = list_type;
	
	this.md5id = md5(Math.random());
	this.window_resize_timeout = null;

	//all elem group storage
	this.elem_taskblur_all;
	this.elem_taskcenter_all;
	this.elem_leftOptions_all;
	this.elem_rightOptions_all;
	this.elem_task_all;

	this.editing_focus = false;
	this.editing_timeout;
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
	this.list;
	this.task;
	this.elem_newcardCircle;
	this.elem_newcardBox;
	this.detail;
	this.construct();


}

skylist.prototype.construct = function(){
	console.log('skylist.construct');
	var that = this;
	that.list_wrapper = that.list_wrapper.empty();

	that.list = $('#-skylist').clone()
		.addClass('overthrow')
		.prop('id','skylist_'+that.md5id)
		.appendTo(that.list_wrapper);

	that.elem_newcardCircle = $('#-skylist_newcardCircle').clone()
		.prop('id','skylist_newcardCircle_'+that.md5id)
		.click(function(){
			if( that.list_type == 'tasks' ){
				submenu_Build('taskdetail', null, null, 'new', true);
			}
		})
		.appendTo(that.list_wrapper);

	if( that.list_type=='tasks' ){
		that.addTask_all();
	}
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

		items = Lincko.storage.list('tasks');

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
					iscroll_elem.append(that.addTask(item));
				}
			}
			
			that.add_newtaskBox(iscroll_elem);
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

skylist.prototype.addTask_all = function(){
	console.log('addTask_all');
	var that = this;
	var items = Lincko.storage.list('tasks');
	var item;
	for (var i in items){
		item = items[i];
		that.list.append(that.addTask(item));
	}
	that.store_all_elem();
	that.add_newtaskBox();
}

skylist.prototype.addTask = function(item){
	var that = this;
	var Elem = $('#-skylist_card').clone();
	var Elem_checkbox = $('#-skylist_skylist_checkbox').prop('id','skylist_skylist_checkbox').clone();
	Elem.find('[find=card_leftbox]').append(Elem_checkbox);
	var created_by;
	var duedate;

	if(item == null){
		item = {};
		item['_id'] = 'blankTask';
		item['+title'] = 'blankTask';
		item['created_by'] = wrapper_localstorage.uid;
		item.start = $.now()/1000;
		item.duration = "86400";
	}
	Elem.prop('id','skylist_card_'+that.md5id+'_'+item['_id']);

	Elem.find("[type=checkbox]")
		.prop(
			{
				'id':'skylist_checkbox_'+that.md5id+'_'+item['_id'],
				'checked': function(){
					if(item['done_at'] == null){
						return false;
					}
					else{
						Elem.toggleClass('skylist_strike');
						return true;
					}
				}
			});
	Elem.find('.skylist_checkbox label').prop('for','skylist_checkbox_'+that.md5id+'_'+item['_id']);


	Elem.find('[find=task_options]').addClass('skylist_floatright');
	Elem.find('[find=title]').html(item['+title']);
	burger(Elem.find('[find=title]'));
	/*
	if (!item['-comment']){ 
		Elem.find('[find=description]').html('&nbsp;');
	}
	else{
		Elem.find('[find=description]').html(item['-comment']);
	}
	*/

	created_by = item['created_by'];
	created_by = Lincko.storage.get("users", created_by,"username");
	Elem.find('[find=name]').html(created_by);

	/*duedate = new wrapper_date(item.start + parseInt(item.duration,10));*/
	duedate = skylist_calcDuedate(item);
	if( duedate.happensSomeday(0) ){
		Elem.find('[find=time]').html(Lincko.Translation.get('app', 3302, 'html').toUpperCase()/*today*/);
	}
	else if( duedate.happensSomeday(1) ){
		Elem.find('[find=card_time]').html(Lincko.Translation.get('app', 3303, 'html').toUpperCase()/*tomorrow*/);
	}
	else{
		Elem.find('[find=card_time]').html(duedate.display());
	}

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
			console.log('that.editing_focus: '+that.editing_focus);
		},200);
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

	return Elem;
}
skylist.prototype.add_newtaskBox = function(elem_appendTo){
	console.log('add_newtaskBox');
	console.log(elem_appendTo);
	var Elem;
	var that = this;
	var elem_blankTask;
	Elem = $('#-skylist_newtaskBox').clone().removeAttr('id');
	Elem.on('click', function(){
		if( responsive.test("minTablet") ){
			elem_blankTask = that.addTask(null);
			$(this).before(elem_blankTask);
			elem_blankTask.velocity("fadeIn");
			myIScrollList['skylist_'+that.md5id].refresh();
			elem_blankTask.find('[find=title]').focus();
			console.log(elem_blankTask.find('[find=title]'));
		}
		else{
			//submenu_Build("app_task_new");	
			submenu_Build('taskdetail', null, null, 'new', true);
		}
	});
	that.elem_newtaskBox = Elem;
	//that.elem_newtaskBox.appendTo(that.tasklist);
	if(!elem_appendTo){
		that.elem_newtaskBox.appendTo(that.list);
	}
	else{
		that.elem_newtaskBox.appendTo(elem_appendTo);
	}
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
			that.actiontask.css('left', that.delX);
	}
	//if just past threshold, initialize
	else if ( Math.abs(that.delX) > that.pan_threshold.valX && Math.abs(that.delY) < that.pan_threshold.valY){		
		console.log('initialize...');
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

}

skylist.prototype.checkboxClick = function(event,task_elem){
	console.log('checkboxClick');
	event.stopPropagation();

	var task = $(task_elem).closest('.skylist_card');

	task.toggleClass('skylist_strike');

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
	if( parseInt(task_elem.css('left'),10) != 0 ){
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

skylist.prototype.toggle_NewcardCircle = function(){
	console.log('toggle_NewcardCircle');
	var that = this;
	var newtaskBox = that.elem_newtaskBox;
	var newcardCircle = that.elem_newcardCircle;
	if(newtaskBox.offset().top + newtaskBox.outerHeight() > $(window).height()){
		//newtaskBox hidden
		newcardCircle.removeClass('display_none');
	}
	else {
		//newtaskBox visible
		newcardCircle.addClass('display_none');
	}
}

skylist.prototype.minTablet = function(){
	console.log('skylist minTablet');
	var that = this;
	that.elem_newcardCircle.removeAttr("style");

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


}

skylist.prototype.maxMobileL = function(){
	console.log('skylist maxMobileL');
	var that = this;
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

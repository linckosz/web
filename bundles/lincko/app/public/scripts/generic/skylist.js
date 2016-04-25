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


var app_layers_dev_skytasks_ClassTasklist = function(tasklist_wrapper){

	this.that = this;
	var that = this;
	
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
	this.elem_rightOptions = null;
	this.elem_leftOptionsL;
	this.elem_rightOptionsL;
	this.mousedown = false;
	this.pan_threshold = {bool: false, valX: 20, valY:50};
	this.panyes = false;
	this.options_startL;


	//variables for construct
	this.tasklist_wrapper = tasklist_wrapper;
	this.tasklist;
	this.task;
	this.elem_newtaskCircle;
	this.elem_newtaskBox;
	this.detail;
	this.construct();


}

app_layers_dev_skytasks_ClassTasklist.prototype.construct = function(){
	console.log('ClassTasklist.construct');
	var that = this;
	that.tasklist_wrapper = that.tasklist_wrapper.empty();

	that.tasklist = $('#-app_layers_dev_skytasks_tasklist').clone()
		.addClass('overthrow')
		.prop('id','app_layers_dev_skytasks_tasklist_'+that.md5id)
		.appendTo(that.tasklist_wrapper);
	//that.tasklist_wrapper.addClass('app_layers_dev_skytasks_nativeScroll');

	that.task = $('#-app_layers_dev_skytasks_task').clone();

	that.detail = $('#-app_layers_dev_skytasks_detail').clone()
		.prop('id','app_layers_dev_skytasks_detail_'+that.md5id)
		.appendTo(that.tasklist_wrapper);

	that.elem_newtaskCircle = $('#-app_layers_dev_skytasks_newtaskCircle').clone()
		.prop('id','app_layers_dev_skytasks_newtaskCircle_'+that.md5id)
		.click(function(){
			//submenu_Build("app_task_new");
			submenu_Build('taskdetail', null, null, 'new', true);
		})
		.appendTo(that.tasklist_wrapper);


	that.addTask_all();
	that.setHeight();

	$(window).on("resize.app_layers_dev_skytasks_tasklist_"+that.md5id, function(){
		clearTimeout(that.window_resize_timeout);
		that.window_resize_timeout = setTimeout(function(){
			that.window_resize();
		},100);
	});
	that.window_resize();
	//$(window).trigger('resize');

	$(document).on("previewHide.app_layers_dev_skytasks_tasklist"+that.md5id, function(){
		that.previewHide();
	});

	wrapper_IScroll_options_new['app_layers_dev_skytasks_tasklist_'+that.md5id] = { 
		click: false,
		//mouseWheel: true,
		//fadeScrollbars: false,
		//scrollX: true,
	};	
	
	wrapper_IScroll_cb_creation['app_layers_dev_skytasks_tasklist_'+that.md5id] = function(){
		var IScroll = myIScrollList['app_layers_dev_skytasks_tasklist_'+that.md5id];

		IScroll.on('scrollStart', function(){
			if( myIScrollList['app_layers_dev_skytasks_tasklist_'+that.md5id].hasVerticalScroll ){
				$('#app_layers_dev_skytasks_navbar').css('box-shadow','-10px 5px 20px #888888');
				that.is_scrolling = true;
			}
		});//scrollStart

		IScroll.on('scrollEnd', function(){
			console.log('scrollEnd');
			setTimeout(function(){
				that.is_scrolling = false;
			},500);
			
			//console.log(event);
			var IScrollY = IScroll.y;
			if( myIScrollList['app_layers_dev_skytasks_tasklist_'+that.md5id].hasVerticalScroll ){
				if( IScrollY != 0 ){
					$('#app_layers_dev_skytasks_navbar').css('box-shadow','0px 5px 20px #888888');
				}
				else{
					$('#app_layers_dev_skytasks_navbar').removeAttr('style');
				}
				that.toggle_NewtaskCircle();
			}
		});//scrollEnd
	}
}

app_layers_dev_skytasks_ClassTasklist.prototype.destroy = function(){
	var that = this;
	app_layers_dev_skytasks_tasklist.tasklist_wrapper.empty();
	$(window).off("resize.app_layers_dev_skytasks_tasklist_"+that.md5id);
	$('body').off("mouseleave.app_layers_dev_skytasks_tasklist_"+that.md5id);
	$(document).off("previewHide.app_layers_dev_skytasks_tasklist"+that.md5id);
	for( var g in app_layers_dev_skytasks_tasklist ){
		console.log('g: '+g);
		console.log(app_layers_dev_skytasks_tasklist);
		app_layers_dev_skytasks_tasklist[g] = null;
		delete app_layers_dev_skytasks_tasklist[g];
		console.log(app_layers_dev_skytasks_tasklist);
	}
	app_layers_dev_skytasks_tasklist = null;
	delete app_layers_dev_skytasks_tasklist;
}

app_layers_dev_skytasks_ClassTasklist.prototype.previewHide = function(){
	console.log('previewHide');
	this.elem_task_all.removeClass('app_layers_dev_skytasks_TaskSelected');
	$(window).resize();
}

app_layers_dev_skytasks_ClassTasklist.prototype.store_all_elem = function(){
	console.log('store_all_elem fn');
	//should be lanunched when all DOM is loaded
	this.elem_taskblur_all = this.tasklist.find('.app_layers_dev_skytasks_taskblur');
	this.elem_taskcenter_all = this.tasklist.find('[find=task_center]');
	this.elem_leftOptions_all = this.tasklist.find('[find=task_leftOptions]');
	this.elem_rightOptions_all = this.tasklist.find('[find=task_rightOptions]');
	this.elem_task_all = this.tasklist.find('.app_layers_dev_skytasks_task');
}

app_layers_dev_skytasks_ClassTasklist.prototype.window_resize = function(){
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
		that.tasklist_wrapper
			.removeClass('app_layers_dev_skytasks_simpleDesktop')
			.removeClass('app_layers_dev_skytasks_simpleDesktop2');
	}

	if( myIScrollList['app_layers_dev_skytasks_tasklist_'+that.md5id] ){
		myIScrollList['app_layers_dev_skytasks_tasklist_'+that.md5id].refresh();
		console.log('IScroll refresh');
		
	}
	console.log(that.md5id);
	console.log('end of resize -- ClassTasklist');
}
app_layers_dev_skytasks_ClassTasklist.prototype.tasklist_update = function(type, filter_by){
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

	that.tasklist.velocity("fadeOut",{
		duration: 200,
		complete: function(){
			if( that.tasklist.find('.iscroll_sub_div').length > 0 ){
				iscroll_elem = that.tasklist.find('.iscroll_sub_div').empty();
			}else{
				iscroll_elem = that.tasklist.empty();
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

app_layers_dev_skytasks_ClassTasklist.prototype.addTask_all = function(){
	var that = this;
	var items = Lincko.storage.list('tasks');
	var item;
	for (var i in items){
		item = items[i];
		that.tasklist.append(that.addTask(item));
	}
	that.store_all_elem();
	that.add_newtaskBox();
}

app_layers_dev_skytasks_ClassTasklist.prototype.addTask = function(item){
	var that = this;
	var Elem = that.task.clone();
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
	Elem.prop('id','app_layers_dev_skytasks_task_'+that.md5id+'_'+item['_id']);

	Elem.find("[type=checkbox]")
		.prop(
			{
				'id':'app_layers_dev_skytasks_task_checkbox_'+that.md5id+'_'+item['_id'],
				'checked': function(){
					if(item['done_at'] == null){
						return false;
					}
					else{
						Elem.toggleClass('app_layers_dev_skytasks_strike');
						return true;
					}
				}
			});
	Elem.find('.app_layers_dev_skytasks_checkbox label').prop('for','app_layers_dev_skytasks_task_checkbox_'+that.md5id+'_'+item['_id']);


	Elem.find('[find=task_options]').addClass('app_layers_skytasks_floatright');
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
	duedate = app_layers_dev_skytasks_calcDuedate(item);
	if( duedate.happensSomeday(0) ){
		Elem.find('[find=time]').html(Lincko.Translation.get('app', 3302, 'html').toUpperCase()/*today*/);
	}
	else if( duedate.happensSomeday(1) ){
		Elem.find('[find=time]').html(Lincko.Translation.get('app', 3303, 'html').toUpperCase()/*tomorrow*/);
	}
	else{
		Elem.find('[find=time]').html(duedate.display());
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
	$('body').on("mouseleave.app_layers_dev_skytasks_tasklist_"+that.md5id, function(){
		console.log('mouseleave');
		Elem.mouseup();//trigger mouseup
	});

	return Elem;
}
app_layers_dev_skytasks_ClassTasklist.prototype.add_newtaskBox = function(elem_appendTo){
	console.log('add_newtaskBox');
	console.log(elem_appendTo);
	var Elem;
	var that = this;
	var elem_blankTask;
	Elem = $('#-app_layers_dev_skytasks_newtaskBox').clone().removeAttr('id');
	Elem.on('click', function(){
		if( responsive.test("minTablet") ){
			elem_blankTask = that.addTask(null);
			$(this).before(elem_blankTask);
			elem_blankTask.velocity("fadeIn");
			myIScrollList['app_layers_dev_skytasks_tasklist_'+that.md5id].refresh();
			elem_blankTask.find('[find=title]').focus();
			console.log(elem_blankTask.find('[find=title]'));
		}
		else{
			//submenu_Build("app_task_new");	
			submenu_Build('taskdetail', null, null, 'new', trued);
		}
	});
	that.elem_newtaskBox = Elem;
	//that.elem_newtaskBox.appendTo(that.tasklist);
	if(!elem_appendTo){
		that.elem_newtaskBox.appendTo(that.tasklist);
	}
	else{
		that.elem_newtaskBox.appendTo(elem_appendTo);
	}
}


app_layers_dev_skytasks_ClassTasklist.prototype.on_mousedown = function(event, task_elem){
	/*
		task_elem must be JQuery object of the task element at hand
	*/
	console.log('on_mousedown');
	var that = this;
	that.actiontask = task_elem;
	
	that.elem_leftOptions = that.actiontask.find('[find=task_leftOptions]');
	if( responsive.test("isMobile") ){
		that.elem_rightOptions = that.actiontask.find('[find=task_rightOptions]');
	}
	that.delX_ini = event.pageX || event.originalEvent.touches[0].pageX || event.touches[0].pageX;
	that.delX_now = that.delX_ini;
	that.delY_ini = event.pageY || event.originalEvent.touches[0].pageY || event.touches[0].pageY;
	that.mousedown = true;
	console.log(that.mousedown);

}

app_layers_dev_skytasks_ClassTasklist.prototype.on_mousemove = function(event){
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
		if( that.actiontask.data('options')=='right' ){ elem_options = that.elem_rightOptions;}
		else if(that.actiontask.data('options')=='left' ){ elem_options = that.elem_leftOptions;}
		elem_options.css('left',that.options_startL + that.delX);
	}
	//if just past threshold, initialize
	else if ( Math.abs(that.delX) > that.pan_threshold.valX && Math.abs(that.delY) < that.pan_threshold.valY){		
		console.log('initialize...');
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

		that.pan_threshold.bool = true;
		that.panyes = true; 
		//myIScrollList['app_layers_skytasks_tasklist'].disable(); //makes my ASUS phone super slow
		
	}
}

app_layers_dev_skytasks_ClassTasklist.prototype.on_mouseup = function(){
	console.log('on_mouseup');
	var that = this;
	
	if( that.panyes ){
		/*app_layers_skytasks_panyes=true prevents click event after panend event*/
		setTimeout(function(){ that.panyes=false }, 5);
	}
	that.mousedown = false;

	if( that.pan_threshold.bool ){
		//righthand side option
		if( that.actiontask.data('options')=='right' ){
			console.log('mouseup rightoptions');
			if( (parseInt(that.elem_rightOptions.css('left'),10) <= that.window_width - that.elem_rightOptionsL) || that.delX_now < 0 ) {
				that.elem_rightOptions.velocity({ left: that.window_width - that.elem_rightOptionsL });
			}
			else if (that.delX_now >= 0){
				that.clearOptions(that.actiontask);
				
			}
		}
		//lefthand side option
		else if( that.actiontask.data('options')=='left' ){
			console.log('mouseup leftoptions');
			console.log('window_width: '+that.window_width);
			console.log('leftOptionsL: '+that.elem_leftOptionsL);
			if( parseInt(that.elem_leftOptions.css('left'),10) > -(that.window_width*2-that.elem_leftOptionsL) ){
				that.elem_leftOptions.velocity({ left: -(that.window_width*2-that.elem_leftOptionsL) });
			}
			else{

				that.clearOptions(that.actiontask);
			}
		}
	}
	that.pan_threshold.bool = false;
}

app_layers_dev_skytasks_ClassTasklist.prototype.clearOptions = function(task){
	var that = this;
	console.log('clearOptions fn');
	if( !task ){
		that.elem_taskblur_all.fadeOut();
		that.elem_taskcenter_all.removeAttr('style');
		that.elem_leftOptions_all.removeAttr('style').addClass('display_none');
		that.elem_rightOptions_all.removeAttr('style');
		if(responsive.test("maxMobileL")){
			that.elem_leftOptions_all.addClass('display_none');
		}
		if(responsive.test("isMobile")){
			that.elem_rightOptions_all.addClass('display_none');
		}
		that.elem_task_all.data('options',false);
	}
	else{
		that.actiontask.data('options',false);
		task.find('.app_layers_dev_skytasks_taskblur').fadeOut();
		if (responsive.test("isMobile")){
			that.elem_rightOptions.velocity( { left:that.window_width },{
				complete: function(){
					if (task.data('options')==false){
						task.find('[find=task_center]').css('opacity','');
						task.find('[find=task_rightOptions]').css('box-shadow','').addClass('display_none');
					}
				}
			});
		}
		that.elem_leftOptions.velocity( {left: -that.window_width*2},{
			complete: function(){
				if(task.data('options') == false){
					task.find('[find=task_center]').css('opacity','');
					task.find('[find=task_leftOptions]').addClass('display_none');
				}
			}
		});

	}
}

app_layers_dev_skytasks_ClassTasklist.prototype.setHeight = function(){
	var that = this;
	var height = $(window).height() - $('#app_content_top').outerHeight() /*- $('#app_layers_dev_skytasks_navbar').outerHeight()*/;
	if(responsive.test("maxMobileL")){
		height -= $('#app_content_menu').outerHeight();
	}
	that.tasklist_wrapper.height(height);

}

app_layers_dev_skytasks_ClassTasklist.prototype.checkboxClick = function(event,task_elem){
	console.log('checkboxClick');
	event.stopPropagation();

	var task = $(task_elem).closest('.app_layers_dev_skytasks_task');

	task.toggleClass('app_layers_dev_skytasks_strike');

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

app_layers_dev_skytasks_ClassTasklist.prototype.taskClick = function(event,task_elem){
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
	if( task_elem.data('options') ){
		that.clearOptions(task_elem);
		return;
	}
	that.elem_task_all.removeClass('app_layers_dev_skytasks_TaskSelected');
	task_elem.addClass('app_layers_dev_skytasks_TaskSelected');
	this.openDetail(task_elem);

}

app_layers_dev_skytasks_ClassTasklist.prototype.openDetail = function(/*open,*/ task_elem){
	var that = this;
	var taskid = task_elem.data('taskid');
	submenu_Build('taskdetail', null, null, taskid, true);

	/*
		open == true : open detail pane
		open == false: close detail pane
		open == null: just update the detail pane, dont open or close
		task_elem : the specific task that will be displayed on the detail pane (always include this param)

	var that = this;
	var tasklist = that.tasklist;
	var detail = that.detail;
	var newtaskCircle = that.newtaskCircle;

	if( task_elem ){
		var taskid_prev = detail.find('[find=taskid]').html();
		var taskid = task_elem.data('taskid');

		detail.data('taskid',taskid);
		detail.find('[find=taskid]').html(taskid);
		detail.find('[find=title]').html(Lincko.storage.get("tasks", taskid,'+title'));
		detail.find('[find=comment]').html(Lincko.storage.get("tasks", taskid,'-comment'));
		createdbyID = Lincko.storage.get('tasks',taskid)['created_by'];
		detail.find('[find=username]').html(Lincko.storage.get('users',createdbyID,'username'));

		var duedate = new wrapper_date(Lincko.storage.get('tasks',taskid).start+parseInt(Lincko.storage.get('tasks',taskid).duration,10));
		detail.find('[find=time]').html(duedate.display());

		projectsID = Lincko.storage.get('tasks',taskid)['projects_id'];
		//detail.find('[find=project]').html(Lincko.storage.get('projects',projectsID)['+title']);
		detail.find('.app_layers_skytasks_checkbox label').prop('for','app_layers_skytasks_task_checkbox_'+taskid);

		if( task_elem.find('[type=checkbox]').is(':checked') ){
			detail.find('.app_layers_skytasks_checkbox label').addClass("app_layers_skytasks_detail_checked");
		}
		else{
			detail.find('.app_layers_skytasks_checkbox label').removeClass("app_layers_skytasks_detail_checked");
		}
	}
	if( open == null ){return;}

	if (open == true){
		detail.removeClass('display_none');
		newtaskCircle.addClass('display_none');
	}
	else if(open == false){
		detail.addClass('display_none');
		newtaskCircle.removeClass('display_none');
	}
	$(window).trigger('resize');
	*/
}

app_layers_dev_skytasks_ClassTasklist.prototype.toggle_NewtaskCircle = function(){
	console.log('toggle_NewtaskCircle');
	var that = this;
	var newtaskBox = that.elem_newtaskBox;
	var newtaskCircle = that.elem_newtaskCircle;
	if(newtaskBox.offset().top + newtaskBox.outerHeight() > $(window).height()){
		//newtaskBox hidden
		newtaskCircle.removeClass('display_none');
	}
	else {
		//newtaskBox visible
		newtaskCircle.addClass('display_none');
	}
}

app_layers_dev_skytasks_ClassTasklist.prototype.minTablet = function(){
	console.log('dev_skytasks_tasklist minTablet');
	var that = this;
	that.elem_newtaskCircle.removeAttr("style");

	var simpleDesktopWidth = 1000;
	var simpleDesktopWidth2 = 800;
	var tasklist_width = that.tasklist_wrapper.width();
	if( tasklist_width < simpleDesktopWidth2 ){
		that.tasklist_wrapper
			.addClass('app_layers_dev_skytasks_simpleDesktop')
			.addClass('app_layers_dev_skytasks_simpleDesktop2');
	}
	else if( tasklist_width < simpleDesktopWidth ){
		that.tasklist_wrapper
			.addClass('app_layers_dev_skytasks_simpleDesktop')
			.removeClass('app_layers_dev_skytasks_simpleDesktop2');
	}
	else if( tasklist_width >= simpleDesktopWidth ){
		that.tasklist_wrapper
			.removeClass('app_layers_dev_skytasks_simpleDesktop')
			.removeClass('app_layers_dev_skytasks_simpleDesktop2');
	}


}

app_layers_dev_skytasks_ClassTasklist.prototype.maxMobileL = function(){
	console.log('dev_skytasks_tasklist maxMobileL');
	var that = this;
	var window_width = $(window).width();
	//that.tasklist.find('[find=task_leftOptions]').width(window_width).css('left',-window_width);
	that.tasklist.find('[find=task_leftOptions]').addClass('display_none');


	content_menu = $('#app_content_menu');
	//that.elem_newtaskCircle.css('margin-bottom',content_menu.outerHeight()); //for when newtaskCircle is positioned fixed

	that.elem_rightOptionsL = that.tasklist.find('.app_layers_dev_skytasks_tasklist_icon_wrapper').first().outerWidth()*3;
	that.elem_leftOptionsL = that.tasklist.find('.app_layers_dev_skytasks_delete').outerWidth();
}

app_layers_dev_skytasks_ClassTasklist.prototype.minMobileL = function(){
	console.log('dev_skytasks_tasklist minMobileL');
	var that = this;
	that.tasklist.find('[find=task_rightOptions]').removeAttr("style").removeClass('display_none');
	that.tasklist.find('[find=task_center]').removeAttr('style');

	that.elem_taskcenter_all.find('[find=title]').prop('contenteditable',true);

/*
	that.elem_leftOptions_all.width(that.window_width*2)
					.css('left',-that.window_width*2)
					.removeClass('display_none');
*/
}

app_layers_dev_skytasks_ClassTasklist.prototype.isMobile = function(){
	console.log('dev_skytasks_tasklist isMobile');
	var that = this;
	that.tasklist.find('[find=task_rightOptions]').addClass('display_none');

	that.elem_taskcenter_all.find('[find=title]').prop('contenteditable',false);
}

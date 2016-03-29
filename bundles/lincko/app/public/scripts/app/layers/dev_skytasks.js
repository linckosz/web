/*
	lincko translation category 33
*/
setTimeout(function(){
	//app_layers_changePage('dev_skytasks');
	//app_layers_changePage('skynotes');
	submenu_Build('skyler');
}, 2000);

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

/*GLOBAL VARIABLES-------------------------------------------------------------------------*/
var app_layers_dev_skytasks_test_var = null;
var app_layers_dev_skytasks_timesort = null;
var app_layers_dev_skytasks_tasklist = null;

/*GLOBAL VARIABLES END----------------------------------------------------------------------*/
var app_layers_dev_skytasks_calcDudate = function(task_obj){
	var duedate = new wrapper_date(task_obj.start + parseInt(task_obj.duration,10));
	return duedate;
}

function app_layers_dev_skytasks_launchPage(){
	console.log('app_layers_dev_skytasks_launchPage');
	//feed page
	app_layers_dev_skytasks_feedPage();
};


var app_layers_dev_skytasks_feedPage = function(){

	var position = $('#app_layers_dev_skytasks');
	var Elem;
	position.empty();

	//navbar
	Elem = $('#-app_layers_dev_skytasks_navbar').clone();
	Elem.prop('id','app_layers_dev_skytasks_navbar');
	var Elem_timesort = Elem.find('#-app_layers_dev_skytasks_timesort').prop('id','app_layers_dev_skytasks_timesort');

	//individual or group selection in navbar
	Elem.find('[people]').on('click', function(){
		console.log('people clicked');
		var selection = $(this);
		$('#app_layers_dev_skytasks_navbar [people]').removeClass('app_layers_dev_skytasks_selected');
		selection.addClass('app_layers_dev_skytasks_selected');
	});
	
	Elem.appendTo(position);
/*
	app_layers_dev_skytasks_timesort = new app_layers_dev_skytasks_ClassTimesort(
		$('#app_layers_dev_skytasks_timesort'),
		[
			Lincko.Translation.get('app', 3301, 'html'),/*all*/
/*			Lincko.Translation.get('app', 3302, 'html'),/*today*/
/*			Lincko.Translation.get('app', 3303, 'html'),/*tomorrow*/
/*			'Spaces'
		],
		app_layers_dev_skytasks_tasklist.tasklist_update
	);
*/
	//app_layers_dev_skytasks_timesort2 = new app_layers_dev_skytasks_ClassTimesort($('#app_layers_dev_skytasks_timesort2'),['11','22','33','44']);

	Elem = $('#-app_layers_dev_skytasks_tasklist_wrapper').clone();
	Elem.prop('id','app_layers_dev_skytasks_tasklist_wrapper');
	Elem.appendTo(position);
	app_layers_dev_skytasks_tasklist = new app_layers_dev_skytasks_ClassTasklist($('#app_layers_dev_skytasks_tasklist_wrapper'));

	var app_layers_dev_skytasks_tasklist_filter = function(filter_by){
		app_layers_dev_skytasks_tasklist.tasklist_update(filter_by);
	}

	app_layers_dev_skytasks_timesort = new app_layers_dev_skytasks_ClassTimesort(
		$('#app_layers_dev_skytasks_timesort'),
		[
			Lincko.Translation.get('app', 3301, 'html').toUpperCase(),/*all*/
			Lincko.Translation.get('app', 3302, 'html').toUpperCase(),/*today*/
			Lincko.Translation.get('app', 3303, 'html').toUpperCase(),/*tomorrow*/
			'Spaces'
		],
		app_layers_dev_skytasks_tasklist_filter
	);




	/*--------------Enquire.JS------------------------------*/
	enquire.unregister(responsive.minTablet, app_layers_dev_skytasks_minTablet);
	enquire.register(responsive.minTablet, app_layers_dev_skytasks_minTablet);

	enquire.unregister(responsive.maxMobileL, app_layers_dev_skytasks_maxMobileL);
	enquire.register(responsive.maxMobileL, app_layers_dev_skytasks_maxMobileL);
	
	enquire.unregister(responsive.minMobileL, app_layers_dev_skytasks_minMobileL);
	enquire.register(responsive.minMobileL, app_layers_dev_skytasks_minMobileL);

	enquire.unregister(responsive.isMobile, app_layers_dev_skytasks_isMobile);
	enquire.register(responsive.isMobile, app_layers_dev_skytasks_isMobile);
	/*--------------Enquire.JS------------------------------*/


	//update tasklist when database is changed
	app_application_lincko.add(
		'app_layers_dev_skytasks_tasklist_wrapper',
		'tasks',
		app_layers_dev_skytasks_tasklist.tasklist_update
		/*
		function(){
			//console.log('dev_skytasks lincko.add task update');
			app_layers_dev_skytasks_tasklist.tasklist_update('all');
		}
		*/
	);

};//end of app_layers_skytasks_feedPage()

/*--------------START of enquire.js functions------------------------------*/
var app_layers_dev_skytasks_minTablet = function(){
	console.log('minTablet');
	app_layers_dev_skytasks_timesort.minTablet();
	app_layers_dev_skytasks_tasklist.minTablet();

};
var app_layers_dev_skytasks_maxMobileL = function(){
	console.log('maxMobileL');
	app_layers_dev_skytasks_timesort.maxMobileL();
	app_layers_dev_skytasks_tasklist.maxMobileL();
};

var app_layers_dev_skytasks_minMobileL = function() {
	console.log('minMobileL');
	app_layers_dev_skytasks_tasklist.minMobileL();

};
var app_layers_dev_skytasks_isMobile = function() {
	console.log('isMobile');
	app_layers_dev_skytasks_tasklist.isMobile();

};
/*--------------END of enquire.js functions------------------------------*/



var app_layers_dev_skytasks_ClassTimesort = function(elem, sort_array, sort_fn){
	elem.empty();
	this.elem = elem;
	this.that = this;
	this.sortcount = 0;
	this.sort_array = sort_array;
	this.sort_fn = sort_fn;
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

	this.toto = function(titi){
		//console.log(sort_array);
		console.log(that);
	}

	this.construct();

};//app_layers_dev_skytasks_ClassTimesort END

app_layers_dev_skytasks_ClassTimesort.prototype.construct = function(){
	var that = this;
	var sort;
	that.elem.append('<span class="app_layers_dev_skytasks_sortdot maxMobileL"></span>');
	that.elem_sortdot = that.elem.find('.app_layers_dev_skytasks_sortdot');
	
	for (var i = 0; i < that.sort_array.length; ++i){
		sort = that.sort_array[i];
		that.elem_sortdot.before('<span sort='+sort+' class="app_layers_dev_skytasks_timesort_text">'+sort+'</span>');
		that.elem_sortdot.append('<span sort='+sort+' class="app_layers_dev_skytasks_timesort_dot">&#149;</span>');
		that.elem_sorts[sort] = that.elem.find('[sort='+sort+']');
		that.elem_sorts_text[sort] = that.elem.find('[sort='+sort+'].app_layers_dev_skytasks_timesort_text');
		that.sortcount = i;
	}
	that.elem_sortdot.before('<br />');
	that.elem_Jsorts = that.elem.find('[sort]');

	that.makeSelection(that.sort_array[0]);


	that.elem_Jsorts.click(function(){
		var sort = $(this).attr('sort');
		if (!responsive.test("maxMobileL")){
			that.makeSelection( sort );
		}
		that.sort_fn(sort);
	});

	/*hammer.js--------------------------------------------------------------------------*/
	that.elem.hammer().on("panstart", function(event){
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
			that.sortnum_fn();
		}
	});//end of panstart

	that.elem.hammer().on("panmove", function(event){
		event.preventDefault();
		console.log('panmove');
		if (responsive.test("maxMobileL") && that.sortnum_new != null ){
			that.delX = event.gesture.deltaX;

			if( that.delX < 0 && that.pan_direction=="panright" ){
				that.pan_direction = "panleft";
				that.sortnum_fn();
			}
			else if( that.delX > 0 && that.pan_direction=="panleft" ){
				that.pan_direction = "panright";
				that.sortnum_fn();
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

	that.elem.hammer().on("panend", function(event){
		event.preventDefault();
		console.log('panend');
		if (responsive.test("maxMobileL") && that.sortnum_new != null){

			if (Math.abs(that.delX) < that.pan_range_min){ //threshold when timesort will scroll to next sort
				//undo timesort change
				that.sortnum_fn_rev();
			}
			console.log('pandirection: '+that.pan_direction);
			console.log('sort: '+that.sort_array[that.sortnum]);
			console.log(that.elem_sorts_text[that.sort_array[that.sortnum]]);
			console.log('sortNew: '+that.sort_array[that.sortnum_new]);
			
			that.elem_sorts_text[that.sort_array[that.sortnum_new]].velocity({left: 0});
			//that.elem_sorts_text[that.sort_array[that.sortnum]].velocity({opacity:0},500); 

			that.makeSelection(that.sort_array[that.sortnum_new]);
			that.sort_fn(that.sort_array[that.sortnum_new]);
		
		}

	});//end of panend
	/*hammer.js END----------------------------------------------------------------------*/

} //construct END

app_layers_dev_skytasks_ClassTimesort.prototype.makeSelection = function(selection){
	console.log('makeSelection: '+selection);
	var that = this;
	if(that.elem_sorts[selection]){
		that.elem_Jsorts.removeClass('app_layers_dev_skytasks_active');
		that.elem_sorts[selection].addClass('app_layers_dev_skytasks_active');
		that.active_sort = selection;
	}
	if (responsive.test("maxMobileL")){
		$.each(that.elem_sorts_text, function(name,value){
			value.addClass('display_none').removeClass('app_layers_dev_skytasks_active');
		});
		that.elem_sorts_text[that.active_sort].addClass('app_layers_dev_skytasks_active').removeClass('display_none');
		that.elem_Jsorts.removeAttr("style");
	}
	else{
		console.log('selection does not exist.');
	}
}//makeSelection END

app_layers_dev_skytasks_ClassTimesort.prototype.sortnum_fn = function(){
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

app_layers_dev_skytasks_ClassTimesort.prototype.sortnum_fn_rev = function(){
	console.log('sortnum_fn_rev');
	var that = this;
	var sortnum_temp;
	sortnum_temp = that.sortnum_new;
	that.sortnum_new = that.sortnum;
	that.sortnum = sortnum_temp;
}//end of sortnum_fn_rev

app_layers_dev_skytasks_ClassTimesort.prototype.minTablet = function(){
	this.elem_Jsorts.removeClass('display_none');
}

app_layers_dev_skytasks_ClassTimesort.prototype.maxMobileL = function(){
	this.elem_Jsorts.not('.app_layers_dev_skytasks_timesort_dot').addClass('display_none');
	this.elem.find('.app_layers_dev_skytasks_active').removeClass('display_none');
}

//END OF ClassTimesort--------------------------------------------------------------------------------------------------------

var app_layers_dev_skytasks_ClassTasklist = function(tasklist_wrapper){

	this.that = this;
	var that = this;
	
	this.md5id = md5(Math.random());

	//all elem group storage
	this.elem_taskblur_all;
	this.elem_taskcenter_all;
	this.elem_leftOptions_all;
	this.elem_rightOptions_all;
	this.elem_task_all;


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

	that.task = $('#-app_layers_dev_skytasks_task').clone();

	that.detail = $('#-app_layers_dev_skytasks_detail').clone()
		.prop('id','app_layers_dev_skytasks_detail_'+that.md5id)
		.appendTo(that.tasklist_wrapper);

	that.elem_newtaskCircle = $('#-app_layers_dev_skytasks_newtaskCircle').clone()
		.prop('id','app_layers_dev_skytasks_newtaskCircle_'+that.md5id)
		.click(function(){
			submenu_Build("app_task_new");
		})
		.appendTo(that.tasklist_wrapper);


	that.addTask_all();
	that.setHeight();

	$(window).resize(function(){
		that.window_resize();
	});
	//that.window_resize();
	$(window).trigger('resize');

	wrapper_IScroll_options_new['app_layers_dev_skytasks_tasklist_'+that.md5id] = { 
		click: false,
		//mouseWheel: true,
		//fadeScrollbars: false,
		//scrollX: true,
	};	
	
	wrapper_IScroll_cb_creation['app_layers_dev_skytasks_tasklist_'+that.md5id] = function(){
		var IScroll = myIScrollList['app_layers_dev_skytasks_tasklist_'+that.md5id];

		IScroll.on('scrollStart', function(){
			$('#app_layers_dev_skytasks_navbar').css('box-shadow','0px 5px 20px #888888');
		});//scrollStart

		IScroll.on('scrollEnd', function(){
			console.log('scrollEnd');
			//console.log(event);
			var IScrollY = IScroll.y;
			console.log(IScrollY);
			if( IScrollY != 0 ){
				$('#app_layers_dev_skytasks_navbar').css('box-shadow','0px 5px 20px #888888');
			}
			else{
				$('#app_layers_dev_skytasks_navbar').removeAttr('style');
			}
			that.toggle_NewtaskCircle();
		});//scrollEnd

	}
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
	that.setHeight();
	that.clearOptions();

	var simpleDesktopWidth = 1000;
	var simpleDesktopWidth2 = 800;
	var tasklist_width = that.tasklist_wrapper.width();

	if(responsive.test("minTablet") ){
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

	console.log('end of resize -- ClassTasklist');
}
app_layers_dev_skytasks_ClassTasklist.prototype.tasklist_update = function(filter_by){
	var that = this;
	var items = Lincko.storage.list('tasks');
	var item;
	var duedate;
	var taskcount = 0;
	var iscroll_elem;
			
	if 		( filter_by == Lincko.Translation.get('app', 3302, 'html').toUpperCase()/*today*/ ){filter_by = 0}
	else if ( filter_by == Lincko.Translation.get('app', 3303, 'html').toUpperCase()/*tomorrow*/ ){filter_by = 1}
	else if ( filter_by == 'Spaces' ){}
	else{ filter_by = null }

	console.log('tasklist_update: all');
	iscroll_elem = that.tasklist.find('.iscroll_sub_div').empty();
	for (var i in items){
		item = items[i];
		duedate = app_layers_dev_skytasks_calcDudate(item);
		if(filter_by == null || duedate.happensSomeday(filter_by)){
			iscroll_elem.append(that.addTask(item));
			taskcount += 1;
		}
	}
	if( taskcount==0 ){
		iscroll_elem.append('<div class="app_layers_dev_skytasks_task">There are no tasks.</div>');
	}
	that.add_newtaskBox(that.tasklist.find('.iscroll_sub_div'));
	//that.elem_newtaskBox.appendTo(that.tasklist.find('.iscroll_sub_div'));
	that.store_all_elem();
	//myIScrollList['app_layers_dev_skytasks_tasklist_'+that.md5id].refresh();
	that.window_resize();
		
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

	Elem.find('.app_layers_dev_skytasks_checkbox input').prop('id','app_layers_dev_skytasks_task_checkbox_'+that.md5id+'_'+item['_id']);
	Elem.find('.app_layers_dev_skytasks_checkbox label').prop('for','app_layers_dev_skytasks_task_checkbox_'+that.md5id+'_'+item['_id']);

	Elem.find('[find=task_options]').addClass('app_layers_skytasks_floatright');
	Elem.find('[find=title]').html(item['+title']);
	if (!item['-comment']){ 
		Elem.find('[find=description]').html('&nbsp;');
	}
	else{
		Elem.find('[find=description]').html(item['-comment']);
	}

	created_by = item['created_by'];
	created_by = Lincko.storage.get("users", created_by,"username");
	Elem.find('[find=name]').html(created_by);

	/*duedate = new wrapper_date(item.start + parseInt(item.duration,10));*/
	duedate = app_layers_dev_skytasks_calcDudate(item);
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
	$('body').mouseleave(function(){
		console.log('mouseleave');
		Elem.mouseup();//trigger mouseup
	});

	return Elem;
}
app_layers_dev_skytasks_ClassTasklist.prototype.add_newtaskBox = function(elem_appendTo){
	var Elem;
	var that = this;
	var elem_blankTask;
	Elem = $('#-app_layers_dev_skytasks_newtaskBox').clone().removeAttr('id');
	Elem.on('click', function(){
		if( responsive.test("minTablet") ){
			$(this).before(that.addTask(null));
			myIScrollList['app_layers_dev_skytasks_tasklist_'+that.md5id].refresh();
		}
		else{
			submenu_Build("app_task_new");	
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
				that.actiontask.find('.app_layers_dev_skytasks_taskblur').fadeIn(500);
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

	task.find('[find=task_center]').toggleClass('app_layers_dev_skytasks_strike');

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
		if( target.is('label') || target.is('input') || target.attr('contenteditable')=="true" ){
			console.log(target);
			return;
		}
	
	//clicking on the task will close options
	if( task_elem.data('options') ){
		that.clearOptions(task_elem);
		return;
	}

	this.openDetail($(task_elem));

}

app_layers_dev_skytasks_ClassTasklist.prototype.openDetail = function(/*open,*/ task_elem){
	var that = this;
	var taskid = task_elem.data('taskid');
	submenu_Build('taskdetail', null, null, taskid);

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
	console.log(newtaskBox);
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
	console.log('skytasks minTablet');
	var that = this;
	that.elem_newtaskCircle.removeAttr("style");
}

app_layers_dev_skytasks_ClassTasklist.prototype.maxMobileL = function(){
	var that = this;
	var window_width = $(window).width();
	//that.tasklist.find('[find=task_leftOptions]').width(window_width).css('left',-window_width);
	that.tasklist.find('[find=task_leftOptions]').addClass('display_none');


	content_menu = $('#app_content_menu');
	that.elem_newtaskCircle.css('margin-bottom',content_menu.outerHeight());

	that.elem_rightOptionsL = that.tasklist.find('.app_layers_dev_skytasks_tasklist_icon_wrapper').first().outerWidth()*3;
	that.elem_leftOptionsL = that.tasklist.find('.app_layers_dev_skytasks_delete').outerWidth();
}

app_layers_dev_skytasks_ClassTasklist.prototype.minMobileL = function(){
	console.log('skytasks minMobileL');
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
	var that = this;
	that.tasklist.find('[find=task_rightOptions]').addClass('display_none');

	that.elem_taskcenter_all.find('[find=title]').prop('contenteditable',false);
}

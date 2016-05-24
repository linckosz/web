//This variable must be loaded before because other JS files will record their IDs inside
var app_application_lincko = {
	_elements: {},
	_functions: { all:[], fields:{}, }, //Only register functions before loading is done, after it will be prohibited
	_fields: {}, //This must be setup previously somewhere, for instance storage.js

	/*
		Different ways to register an item (HTML element or function):
		app_application_lincko.add( (function)action, *(string|array)range ); => it will repeat the action periodically (it's a setTimeout)
		app_application_lincko.add( (string)id, (string|array)range, (function)action, *(function)deletion );
		app_application_lincko.add( (string)id, (string|array)range, (object)action{  (function)action, *(function)deletion	} );

		(string|array)range: It helps to launch action() only if the update function calls one of it's name.

		IMPORTANT => Be aware that the same element can cumulate multiple declaration, it can only overwrite
	*/
	add: function(id, range, action, action_param, exists, exists_param, deletion, deletion_param){
		var object = false;
		//Assign id
		var item = {
			id: null,							//Inside a callback we can get the id by doing this.id
			range: {},							//React to which category (all for empty)
			action: function(){},				//If HTML exists and its related objects, we take action
				/*
					Access parameters like:
					this.action_param
					this.action_param[0]
				*/
			action_param: null,					//optional parameters =>
				/*
					item_id
					[item_id, item_type]
				*/
			exists: function(){ return true; },	//Check exitistance of any related object
			exists_param: null,					//optional parameters
			deletion: function(){},				//If HTML element or related objects are missing, we take a deletion action
			deletion_param: null,				//optional parameters
		};

		if(typeof action_param !== 'undefined'){ item.action_param = action_param; }
		if(typeof exists_param !== 'undefined'){ item.exists_param = exists_param; }
		if(typeof deletion_param !== 'undefined'){ item.deletion_param = deletion_param; }

		//Assign Exists, Action and Deletion methods
		if(typeof id === 'string' || typeof id === 'number'){
			item.id = id;
			if(typeof action === 'function'){
				item.action = action;
				object = 'element';
			}
			if(typeof exists === 'function'){
				item.exists = exists;
				object = 'element';
			}
			if(typeof deletion === 'function'){
				item.deletion = deletion;
				object = 'element';
			}
		} else if(typeof id === 'function' && !wrapper_load_progress.done){
			//We do not record functions after DOM load to avoid to multipliate a lot some functions because each function is anonymous and we cannot classified them.
			//It's something we migth work on to also avoid the same function registered in 2 differents fields
			object = 'function';
		}

		if(object){
			//Assign range scope
			if(typeof range === 'string'){
				range = range.toLowerCase();
				range = [range];
			}
			if($.type(range) === 'object' || $.type(range) === 'array'){
				for(var i in range){
					range[i] = range[i].toLowerCase();
					item.range[range[i]] = true;
				}
			}
			
			if(object === 'element'){
				this._elements[''+id] = item;
			} else if(object === 'function'){
				//Has to register the function as anonyme, if not the value of "this" inside the function (especially for objects) can be different,
				//using "that = id" helps to keep the orginal value of this as it should be
				//NOTE: Be careful the use of this inside methods, it tends to be "window" object
				var that = id;
				if($.isEmptyObject(item.range)){
					this._functions.all.push(function(){ that(); });
				} else {
					for(var field in item.range){
						if(typeof this._functions.fields[field] === 'undefined'){
							this._functions.fields[field] = [];
						}
						this._functions.fields[field].push(function(){ that(); });
					}
				}
			}
			return true;
		}
		return false;
	},

	/*
		It updates all elements and functions that are linked to any _fields
	*/
	update: function(){
		var temp_fields = {};
		var temp;
		var Elem;

		//Have to scan object, not fields to insure we do not launch many times the same function
		
		if(!$.isEmptyObject(this._fields)){
			
			//Add relations fields
			for(var field in this._fields){
				if(match = field.match(/^([a-z_]+)_(\d+)$/, '')){
					if(temp = Lincko.storage.tree(match[1], match[2], "parents")){
						for(var type in temp){
							for(var id in temp[type]){
								temp_fields[type+"_"+id] = true;
							}
						}
					}
				}
			}
			//Concatanate
			for(var field in temp_fields){
				this._fields[field] = true;
			}

			//First we scan all HTML elements
			for(var Elem_id in this._elements){
				Elem = $('#'+Elem_id);
				if(Elem.length <= 0 || !this._elements[Elem_id].exists()){ //delete the element if it doesn't exist on DOM
					this._elements[Elem_id].deletion();
					delete this._elements[Elem_id];
				} else {
					if(typeof this._elements[Elem_id].range == 'object'){
						for(var field in this._fields){
							if(
								   typeof this._elements[Elem_id].range[field] != 'undefined'
								|| typeof this._elements[Elem_id].range[field.replace(/_\d+$/, '')] != 'undefined'
							){
								this._elements[Elem_id].action();
								break; //Do not launch more than one time if ever launched
							}
						}
					}
				}
			}

			Elem = null;
			delete Elem;

			//Scan all functions
			for(var field in this._fields){
				if(typeof this._functions.fields[field] === 'object'){
					for(var i in this._functions.fields[field]){
						this._functions.fields[field][i]();
					}
				}
			}

			//Only then we launch all functions registered in all
			//But do it only if the local database has been updated, if not there is no use to launch those functions
			for(var i in this._functions.all){
				this._functions.all[i]();
			}
		}

		for(var field in this._fields){
			delete this._fields[field];
		}
		
		return true;
	},

	/*
		Prepare a list of element to be triggered by a timer (every 15s)
		fields: [defaults: false]
			- false: Do not add any type of element to be triggered
			- true: Trigger all elements
			- 'tasks': Trigger all elements that listen to the type tasks, or a single tasks ID (do not involve parents and children)
			- 'tasks_20': Trigger all elements listening to tasks 20 only (IMPORTANT: using ID will trigger parents and children)
			-  ['projects', 'tasks_20']: Use an array to combine
		update: [default: false]
			- false: Do nothing, just wait for the timer (every 15s) to launch an update
			- true: Force update

		NOTE: Because JS is not ready yet (obverse() is too new) to observe any object change, we have to add it manually.
	*/
	prepare: function(fields, update){
		if(typeof fields == 'undefined'){ fields = false; }
		if(typeof update != 'boolean'){ update = false; }
		var field;
		if(typeof fields == 'string' || typeof fields == 'number'){
			this._fields[fields] = true;
		} else if(typeof fields == 'object'){
			for(var i in fields){
				if(typeof fields[i] == 'string' || typeof fields[i] == 'number'){
					this._fields[fields[i]] = true;
				}
			}
		} else if(fields === true){
			//Prepare all to be updated
			for(var id in this._elements){
				for(var field in this._elements[id].range){
					this._fields[field] = true;
				}
			}
			for(var field in this._functions.fields){
				this._fields[field] = true;
			}
		}
		//Force to update if update at true
		if(update){
			this.update();
		}
	},

};


var app_application = {
	project: function(force_blur){
		app_application_move_menu($('#app_application_project'), $('#app_application_content'), $('#app_application_project_block'), $('#app_content_top_project'), force_blur);
	},
	
	move: function(div, force_blur){
		if(typeof force_blur==="undefined"){ force_blur = false; }
		if(typeof this[div] !== 'undefined'){
			return this[div](force_blur);
		}
		return false;
	},

	forceClose: function(){
		if($('#app_application_project').hasClass('app_application_visible')){
			app_application_move_menu($('#app_application_project'), $('#app_application_content'), $('#app_application_project_block'), $('#app_content_top_project'));
		}
	}
};

enquire.register(responsive.noMobileL, function() { 
	//The blur is hard to calculate, it creates some flickering
	if(wrapper_browser('webkit') && $('#app_application_project').hasClass('app_application_visible')){
		$('#app_application_content').velocity(
			{ blur: 0 },
			{
				duration: 200,
				delay: 100,
				easing: [ 4 ],
			}
		);
	}
});
enquire.register(responsive.isMobileL, function() { 
	//The blur is hard to calculate, it creates some flickering
	if(wrapper_browser('webkit') && $('#app_application_project').hasClass('app_application_visible')){
		$('#app_application_content').velocity(
			{ blur: 4 },
			{
				duration: 200,
				delay: 100,
				easing: [ 4 ],
			}
		);
	}
});

function app_application_move_menu(Elem, Blur, Block, Button, force_blur) {
	if(typeof Blur==="undefined"){ Blur = $(null); }
	if(typeof Block==="undefined"){ Block = $(null); }
	if(typeof Button==="undefined"){ Button = $(null); }
	if(typeof force_blur==="undefined"){ force_blur = false; }

	var time = 200;
	var delay = 60;
	var width = 320;
	var width_child = 320;
	if(responsive.test("maxMobile")){
		width = "100%";
		width_child = $(window).width();
	}
	if(responsive.test("minDesktop")){
		delay = 60;
	}

	//Close
	if(Elem.hasClass('app_application_visible')){
		time = 200;
		if(responsive.test("maxTablet")){
			time = Math.floor(2.5*time);
		}
		width = Elem.width();
		Elem.removeClass('app_application_width');
		$.each(Elem.find('.app_application_width_child'), function() {
			$(this).removeClass('app_application_width').css('width', width_child);
		});
		Button.velocity(
			{ rotateZ: 0, },
			{
				duration: time,
				delay: delay,
			}
		);
		//The blur is hard to calculate, it creates some flickering
		if(wrapper_browser('webkit')){
			Blur.velocity(
				{ blur: 0 },
				{
					duration: time,
					delay: delay,
					easing: [ 4 ],
				}
			);
		}
		/*
		TweenLite.to(
			Elem,
			time/1000,
			{
				width: 0,
				delay: delay/1000,
				onUpdate: function(){
					if(responsive.test("minTablet")){
						app_content_dynamic_position();
						submenu_wrapper_width();
						app_application_submenu_position();
					}
				},
				onComplete: function(){
					$(window).trigger('resize');
					Elem.removeClass('app_application_visible');
					Blur.removeClass('app_application_blur');
					Block.removeClass('app_application_block_visible');
				},
			}
		);
		*/
		Elem.css('width', width).velocity(
			{width: 0},
			{
				duration: time,
				delay: delay,
				progress: function(){
					if(responsive.test("minTablet")){
						app_content_dynamic_position();
						app_application_submenu_position();
					}
				},
				complete: function(){
					setTimeout(function(){
						$(window).trigger('resize');
						app_application_submenu_position();
						Elem.removeClass('app_application_visible');
						Blur.removeClass('app_application_blur');
						Block.removeClass('app_application_block_visible');
					},50);
				},
			}
		);
		
	//Open
	} else {
		time = 300;
		if(responsive.test("maxTablet")){
			time = Math.floor(2*time);
		}
		Elem.addClass('app_application_visible');
		Block.addClass('app_application_block_visible');
		$.each(Elem.find('.app_application_width_child'), function() {
			$(this).css('width', width_child);
		});
		if(responsive.test("minTablet")){
			Button.velocity(
				{ rotateZ: 90, },
				{
					duration: time,
					delay: delay,
				}
			);
		}
		if(responsive.test("isMobileL") || force_blur){
			//The blur is hard to calculate, it creates some flickering
			if(wrapper_browser('webkit')){
				Blur.velocity(
					{ blur: 4 },
					{
						duration: time,
						delay: delay,
						easing: [ 4 ],
					}
				);
			}
		}
		/*
		TweenLite.to(
			Elem,
			time/1000,
			{
				width: width,
				delay: delay/1000,
				onUpdate: function(){
					if(responsive.test("minTablet")){
						app_content_dynamic_position();
						submenu_wrapper_width();
						app_application_submenu_position();
					}
				},
				onComplete: function(){
					$(window).trigger('resize');
					//Elem.addClass('app_application_width');
					Blur.addClass('app_application_blur');
					$.each(Elem.find('.app_application_width_child'), function() {
						$(this).addClass('app_application_width');
					});
				},
			}
		);
		*/
		Elem.css('width', 0).velocity(
			{width: width},
			{
				duration: time,
				delay: delay,
				progress: function(){
					if(responsive.test("minTablet")){
						app_content_dynamic_position();
						app_application_submenu_position();
					}
				},
				complete: function(){
					setTimeout(function(){
						$(window).trigger('resize');
						app_application_submenu_position();
						Elem.addClass('app_application_width');
						Blur.addClass('app_application_blur');
						$.each(Elem.find('.app_application_width_child'), function() {
							$(this).addClass('app_application_width');
						});
					},50);
				},
			}
		);

	}
	return true;
}

$('#app_application_project_block').click(function(){
	app_application.move('project');
});

function app_application_dev_link(){
	//Used for development site only
	var dev_front = "";
	var dev_back = "";
	if(document.linckoFront || document.linckoBack){
		var dev_front = "master-";
		if(document.linckoFront){
			dev_front = document.linckoFront;
		}
		var dev_back = "master.";
		if(document.linckoBack){
			dev_back = document.linckoBack;
		}
	}
	return dev_front+dev_back;
}

function app_application_change_workspace(workspace){
	if(typeof workspace !== 'undefined'){
		top.location.replace(top.location.protocol+'//'+app_application_dev_link()+workspace+'.'+document.domain); //Company workspace
	} else {
		base_show_error(Lincko.Translation.get('app', 45, 'js')); //We could not define which workspace you want to consult.
	}
}

function app_application_change_private(){
	top.location.replace(top.location.protocol+'//'+app_application_dev_link()+document.domain); //Personal workspace
}


function app_application_submenu_position() {
	var Elem = $('#app_application_submenu_block');
	var submenu_top = 0;
	var submenu_left = 0;
	var hidden = false;
	if(responsive.test("minTablet")){
		submenu_left = $('#app_application_project').width();
	}
	if(responsive.test("minDesktop")){
		submenu_top = 48;
	}
	if(responsive.test("minMobileL")){
		Elem
		.height(function(){
			return $(window).height() - submenu_top;
		})
		.width(function(){
			return $(window).width() - submenu_left;
		});
	} else {
		Elem.css({height: '100%', width: '100%'});
	}
	if(Elem.css('display') === 'none'){
		hidden = true;
		Elem.show();
	}
	Elem.offset({ top: submenu_top, left: submenu_left });
	if(hidden){
		Elem.hide();
	}
}
app_application_submenu_position();
var app_application_submenu_position_timer;
$(window).resize(function(){
	clearTimeout(app_application_submenu_position_timer);
	app_application_submenu_position_timer = setTimeout(app_application_submenu_position, wrapper_timeout_timer);
});

JSfiles.finish(function(){
	//Update every 15s automatically
	app_application_lincko.prepare(true, true);
	setInterval(function(){
		app_application_lincko.prepare(false, true);
	//}, 4000); //4s Demo
	}, 15000); //15s Production
});

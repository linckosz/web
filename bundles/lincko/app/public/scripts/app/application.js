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

	clean: function(id){
		this._elements[id] = null;
		delete this._elements[id];
	},

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
			timer: false,						//Avoid to run 2 actions at the same time
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
	update: function(procedural){
		if(typeof procedural != 'boolean'){ procedural = false; }
		var temp_fields = {'*': true};
		var temp;
		var Elem;

		//Have to scan object, not fields to insure we do not launch many times the same function
		
		if(!$.isEmptyObject(this._fields)){
			
			//Add relations fields
			for(var field in this._fields){
				if(match = field.match(/^([a-z_]+)_(\d+)$/, '')){
					if(temp = Lincko.storage.tree(match[1], match[2], "parents")){
						for(var type in temp){
							temp_fields[type] = { _children: true };
							for(var id in temp[type]){
								if(field == type+"_"+id){
									temp_fields[type+"_"+id] = true;
								}
								else{
									temp_fields[type+"_"+id] = { _children: true };
								}
							}
						}
					}
				}
			}
			//Concatanate
			for(var field in temp_fields){
				if(!this._fields[field]){
					this._fields[field] = temp_fields[field];
				}
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
								try {
									var updated = {};
									for(var range in this._elements[Elem_id].range){
										if(this._fields[range]){
											updated[range] = this._fields[range];
										}
									}
									this._elements[Elem_id].updated = updated;
									clearTimeout(this._elements[Elem_id].timer);
									if(procedural){ //Run immediatly (but can see screen little freeze)
										this._elements[Elem_id].action();
									} else { //It will wait until the parent scope script is finished (less screen freeze)
										this._elements[Elem_id].timer = setTimeout(function(Elem_id){
											if(app_application_lincko._elements[Elem_id]){
												app_application_lincko._elements[Elem_id].action();
											} else {
												console.log("application => "+Elem_id);
												//JSerror.sendError(Elem_id, 'app_application_lincko._elements[Elem_id] does not exists', 0);
											}
										}, 0, Elem_id);
									}
								} catch(e) {
									var instance = "Other";
									if (e instanceof TypeError) {
										instance = "TypeError";
									} else if (e instanceof RangeError) {
										instance = "RangeError";
									} else if (e instanceof EvalError) {
										instance = "EvalError";
									} else if (e instanceof ReferenceError) {
										instance = "ReferenceError";
									}
									var message = "";
									if(e.message){ message = e.message; }
									var name = "";
									if(e.name){ name = e.name; }
									var fileName = "";
									if(e.fileName){ fileName = e.fileName; }
									var lineNumber = 0;
									if(e.lineNumber){ lineNumber = e.lineNumber; }
									var columnNumber = 0;
									if(e.columnNumber){ columnNumber = e.columnNumber; }
									var stack = "";
									if(e.stack){
										stack = e.stack;
									}
									JSerror.sendError(this._elements[Elem_id].action, 'app_application_lincko.update => this._elements["'+Elem_id+'"].action() => '+field, 0);
									JSerror.sendError(stack, fileName+" "+message, lineNumber, columnNumber, instance+" "+name);
								}
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
						try {
							this._functions.fields[field][i]();
						} catch(e) {
							var instance = "Other";
							if (e instanceof TypeError) {
								instance = "TypeError";
							} else if (e instanceof RangeError) {
								instance = "RangeError";
							} else if (e instanceof EvalError) {
								instance = "EvalError";
							} else if (e instanceof ReferenceError) {
								instance = "ReferenceError";
							}
							var message = "";
							if(e.message){ message = e.message; }
							var name = "";
							if(e.name){ name = e.name; }
							var fileName = "";
							if(e.fileName){ fileName = e.fileName; }
							var lineNumber = 0;
							if(e.lineNumber){ lineNumber = e.lineNumber; }
							var columnNumber = 0;
							if(e.columnNumber){ columnNumber = e.columnNumber; }
							var stack = "";
							if(e.stack){
								stack = e.stack;
							}
							JSerror.sendError(this._functions.fields[field][i], 'app_application_lincko.update => this._functions.fields["'+field+'"]['+i+']()', 0);
							JSerror.sendError(stack, fileName+" "+message, lineNumber, columnNumber, instance+" "+name);
						}
					}
				}
			}

			//Only then we launch all functions registered in all
			//But do it only if the local database has been updated, if not there is no use to launch those functions
			for(var i in this._functions.all){
				try {
					this._functions.all[i]();
				} catch(e) {
					var instance = "Other";
					if (e instanceof TypeError) {
						instance = "TypeError";
					} else if (e instanceof RangeError) {
						instance = "RangeError";
					} else if (e instanceof EvalError) {
						instance = "EvalError";
					} else if (e instanceof ReferenceError) {
						instance = "ReferenceError";
					}
					var message = "";
					if(e.message){ message = e.message; }
					var name = "";
					if(e.name){ name = e.name; }
					var fileName = "";
					if(e.fileName){ fileName = e.fileName; }
					var lineNumber = 0;
					if(e.lineNumber){ lineNumber = e.lineNumber; }
					var columnNumber = 0;
					if(e.columnNumber){ columnNumber = e.columnNumber; }
					var stack = "";
					if(e.stack){
						stack = e.stack;
					}
					JSerror.sendError(this._functions.all[i], 'app_application_lincko.update => this._functions.all['+i+']()', 0);
					JSerror.sendError(stack, fileName+" "+message, lineNumber, columnNumber, instance+" "+name);
				}
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
		updatedAttributes: optional, will be passed onto sync function to know exactly which attribute was updated
			{
				range: {
					'attribute': true,
					....
				},
				'task_1' {
					'+title': true,
				},
			}

		NOTE: Because JS is not ready yet (obverse() is too new) to observe any object change, we have to add it manually.
	*/
	prepare: function(fields, update, updatedAttributes, procedural){
		if(typeof fields == 'undefined'){ fields = false; }
		if(typeof update != 'boolean'){ update = false; }
		if(typeof updatedAttributes != 'object'){ updatedAttributes = false; }
		if(typeof procedural != 'boolean'){ procedural = false; }
		var field;
		if(typeof fields == 'string' || typeof fields == 'number'){
			if(typeof this._fields[fields] != 'object'){
				this._fields[fields] = true;
			}
		} else if(typeof fields == 'object'){
			for(var i in fields){
				if(typeof fields[i] == 'string' || typeof fields[i] == 'number'){
					if(typeof this._fields[fields[i]] != 'object'){
						this._fields[fields[i]] = true;
					}
				}
			}
		} else if(fields === true){
			//Prepare all to be updated
			for(var id in this._elements){
				for(var field in this._elements[id].range){
					if(typeof this._fields[fields] != 'object'){
						this._fields[field] = true;
					}
				}
			}
			for(var field in this._functions.fields){
				if(typeof this._fields[fields] != 'object'){
					this._fields[field] = true;
				}
			}
		}

		//change the field value for those given in updatedAttributes
		if(updatedAttributes){
			var that = this;
			$.each(updatedAttributes, function(key, val){
				if(typeof that._fields[key] != 'object'){
					that._fields[key] = val;
				}
				else if(typeof that._fields[key] == 'object' && typeof val == 'object'){
					$.each(val, function(attribute, obj){
						that._fields[key][attribute] = true;
					});
				}
			});
		}

		//Force to update if update at true
		if(update){
			this.update(procedural);
		}
	},

};

var app_application_garbage = {
	add: function(id){ //Better to be unique
		if(typeof id == 'undefined'){ id = md5(Math.random()); }
		if($("#app_application_garbage_"+id).length > 0){
			return false;
		}
		var span = $('<span/>');
		span.prop("id", "app_application_garbage_"+id);
		span.appendTo($("#app_application_garbage"));
		return "app_application_garbage_"+id;
	},

	remove: function(garbage_id){
		//Check that it's a garbage before to remove
		if(garbage_id.indexOf('app_application_garbage_')===0){
			$("#"+garbage_id).recursiveRemove();
		}
	},
}


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
	},

	forceOpen: function(){
		if(!$('#app_application_project').hasClass('app_application_visible')){
			app_application_move_menu($('#app_application_project'), $('#app_application_content'), $('#app_application_project_block'), $('#app_content_top_project'));
		}
	}
};

enquire.register(responsive.noMobileL, function() {
	//The blur is hard to calculate, it creates some flickering
	if(hasGood3Dsupport && wrapper_browser('webkit') && $('#app_application_project').hasClass('app_application_visible')){
		$('#app_application_content').velocity(
			{ blur: 0 },
			{
				mobileHA: hasGood3Dsupport,
				duration: 200,
				delay: 100,
				easing: [ 4 ],
			}
		);
	}
});
enquire.register(responsive.isMobileL, function() {
	//The blur is hard to calculate, it creates some flickering
	if(hasGood3Dsupport && wrapper_browser('webkit') && $('#app_application_project').hasClass('app_application_visible')){
		$('#app_application_content').velocity(
			{ blur: 4 },
			{
				mobileHA: hasGood3Dsupport,
				duration: 200,
				delay: 100,
				easing: [ 4 ],
			}
		);
	}
});

var app_application_move_mainmenu_block = false;
function app_application_move_menu(Elem, Blur, Block, Button, force_blur) {
	if(typeof Blur==="undefined"){ Blur = $(null); }
	if(typeof Block==="undefined"){ Block = $(null); }
	if(typeof Button==="undefined"){ Button = $(null); }
	if(typeof force_blur==="undefined"){ force_blur = false; }

	if(app_application_move_mainmenu_block){
		return true;
	}
	app_application_move_mainmenu_block = true;

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

		app_generic_state.change({
			mainmenu: false,
		}, null, -1);
		time = 150;
		if(true || responsive.test("maxTablet")){
			time = Math.floor(2.5*time);
		}
		width = Elem.width();
		Elem.removeClass('app_application_width');
		$.each(Elem.find('.app_application_width_child'), function() {
			$(this).removeClass('app_application_width').css('width', width_child);
		});
		//The blur is hard to calculate, it creates some flickering
		if(hasGood3Dsupport && wrapper_browser('webkit')){
			Blur.velocity(
				{ blur: 0 },
				{
					mobileHA: hasGood3Dsupport,
					duration: time,
					delay: delay,
					easing: [ 4 ],
				}
			);
		}
		$("#app_project_header").velocity(
			{ opacity: 0 },
			{
				mobileHA: hasGood3Dsupport,
				duration: time-Math.floor(2*time/3),
				delay: delay,
				easing: [ 4 ],
				visibility: "hidden",
			}
		);
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
				mobileHA: hasGood3Dsupport,
				duration: time,
				delay: delay,
				//easing: "linear",
				easing: [ 20 ],
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
						Blur.removeClass('app_application_blur');
						Block.removeClass('app_application_block_visible');
						Elem.removeClass('app_application_visible');
						app_application_move_mainmenu_block = false;
					}, 50);
				},
			}
		);
		
	//Open
	} else {
		app_generic_state.change({
			mainmenu: true,
		}, null, 1);
		time = 200;
		if(true || responsive.test("maxTablet")){
			time = Math.floor(2*time);
		}
		Block.addClass('app_application_block_visible');
		$.each(Elem.find('.app_application_width_child'), function() {
			$(this).css('width', width_child);
		});

		if(responsive.test("isMobileL") || force_blur){
			//The blur is hard to calculate, it creates some flickering
			if(hasGood3Dsupport && wrapper_browser('webkit')){
				Blur.velocity(
					{ blur: 4 },
					{
						mobileHA: hasGood3Dsupport,
						duration: time,
						delay: delay,
						easing: [ 4 ],
					}
				);
			}
		}
		$("#app_project_header")
		.css("visibility", "hidden")
		.css("opacity", 0)
		.velocity(
			{ opacity: 1 },
			{
				mobileHA: hasGood3Dsupport,
				duration: time-Math.floor(2*time/3),
				delay: delay+Math.floor(2*time/3),
				easing: [ 4 ],
				visibility: "visible",
			}
		);
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
		Elem.addClass('app_application_visible');
		Elem.css('width', 0).velocity(
			{width: width},
			{
				mobileHA: hasGood3Dsupport,
				duration: time,
				delay: delay,
				//easing: "linear",
				easing: [ 24 ],
				progress: function(){
					if(responsive.test("minTablet")){
						app_content_dynamic_position();
						app_application_submenu_position();
					}
				},
				complete: function(){
					setTimeout(function(){
						app_application_move_mainmenu_block = false;
						$(window).trigger('resize');
						app_application_submenu_position();
						Elem.addClass('app_application_width');
						Blur.addClass('app_application_blur');
						$.each(Elem.find('.app_application_width_child'), function() {
							$(this).addClass('app_application_width');
						});
						app_application_move_mainmenu_block = false;
					}, 50);
				},
			}
		);

	}
	return true;
}

$('#app_application_project_block').click(function(){
	app_application.move('project');
});


//BEGIN - highlight for quick create task feature
var app_application_global_selection = "";
var app_application_global_selection_handler = function(timeout, offsetLeft, offsetTop){
	if(typeof timeout == 'undefined' || (timeout && typeof timeout != 'number')){ var timeout = 3000; }
	if(!offsetLeft){ var offsetLeft = 0; }
	if(!offsetTop){ var offsetTop = 0; }
	var globalWordSelect_now = $.selection();
	//if popup is already up and selection is same as before, exit
	if($("#app_application_lincko_action").is(':visible') && globalWordSelect_now == app_application_global_selection){
		return;
	}
	app_application_global_selection = globalWordSelect_now;


	if(app_application_global_selection == "") {
		$("#app_application_lincko_action").hide();
	}
	else{
		var coords = getSelectionCoords();
		$("#app_application_lincko_action").css({"left":coords.x2+offsetLeft, "top":coords.y+coords.height+offsetTop}).show(); //bottom right corder of selected text
		if(typeof timeout == 'number'){
			setTimeout(function(){
				$("#app_application_lincko_action").hide();
			}, timeout);
		}
	}
}

$("body").on("mousedown", ".selectable", function() {
	$("#app_application_lincko_action").hide();
	var scroll = myIScrollList[$(this).parents(".overthrow").prop("id")];//find iScroll
	scroll.disable();//disables the iScroll
});

$("body").on("mouseup", ".selectable", function(e){
	var scroll = myIScrollList[$(this).parents(".overthrow").prop("id")];//find iScroll
	if(scroll){
		scroll.enable();//disables the iScroll
	}

	app_application_global_selection_handler();
});

if(supportsTouch){
	$(document).on('selectionchange touchstart', function(event){
		if(event.type == 'selectionchange'){
			app_application_global_selection_handler(false, 20);
		}
		else if(event.type == 'touchstart' && $("#app_application_lincko_action").is(':visible') 
			&& $(event.target).prop('id') != 'app_application_lincko_action'){
			$("#app_application_lincko_action").hide();
		}
	});
}

$("#app_application_lincko_action").click(function() {
	$(this).hide();
	var preview = true; //This is no way to know if we are in preview or submenu
	submenu_Build("taskdetail_new", submenu_Getnext(preview), false, {'id':'new', 'title': app_application_global_selection, 'type':'tasks'}, preview); 
});

//END - highlight for quick create task feature



$('#app_application_menu_icon').click(function(){
	if(typeof app_application !== 'undefined'){
		app_application.move('project');
	}
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
		top.location.replace(top.location.protocol+'//'+app_application_dev_link()+workspace+'.'+document.domainRoot); //Company workspace
	} else {
		base_show_error(Lincko.Translation.get('app', 45, 'js')); //We could not define which workspace you want to consult.
	}
}

function app_application_change_private(){
	top.location.replace(top.location.protocol+'//'+app_application_dev_link()+document.domainRoot); //Personal workspace
}

app_application_submenu_block_mousedown = false;
$('#app_application_submenu_block')
	.mousedown(function(event){
		if($(event.target).prop('id') == 'app_application_submenu_block'){
			app_application_submenu_block_mousedown = true;
		}
	})
	.mouseup(function(event){
		if(app_application_submenu_block_mousedown && $(event.target).prop('id') == 'app_application_submenu_block' && !onboarding.on){ //off during onboarding
			submenu_Hideall(false); //false -> dont hide preview
		}
		app_application_submenu_block_mousedown = false;
	});

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

/*
var worker = new Worker("/scripts/libs/hammer.min.js", { type: "module" });
worker.onmessage
function receiveFromWorker(e) {
	console.log(e);
}
*/

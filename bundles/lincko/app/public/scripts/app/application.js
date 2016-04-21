//This variable must be loaded before because other JS files will record their IDs inside
var app_application_lincko = {
	_elements: {},
	_functions: { all:[], fields:{}, }, //Only register functions before loading is done, after it will be prohibited
	_fields: { 'upload': true, }, //This must be setup previously somewhere, for instance storage.js

	/*
		Different ways to register an item (HTML element or function):
		app_application_lincko.add( (function)action, *(string|array)range ); => it will repeat the action periodically (it's a setTimeout)
		app_application_lincko.add( (string)id, (string|array)range, (function)action, *(function)deletion );
		app_application_lincko.add( (string)id, (string|array)range, (object)action{  (function)action, *(function)deletion	} );

		(string|array)range: It helps to launch action() only if the update function calls one of it's name.
	*/			
	add: function(id, range, action, action_param, exists, exists_param, deletion, deletion_param){
		var object = false;
		//Assign id
		var item = {
			id: null,
			range: {},							//React to which category (all for empty)
			exists: function(){ return true; },	//Check exitistance of any related object
			exists_param: null,					//optional parameters
			action: function(){},				//If HTML exists and its related objects, we take action
			action_param: null,					//optional parameters
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
		"update" launch the update of all registered HTML elements and functions
		app_application_lincko.update(); => It updates all elements that are linked to any _fields at true, and launch all functions
		app_application_lincko.update(false); => It doesn't update any element, only Launch all functions
		app_application_lincko.update(true); => Update all elements, and launch all functions
		app_application_lincko.update('tasks'); => It updates all elements that are linked to any _fields at true and the string, and update all elements with empty range, and launch all functions
		app_application_lincko.update(['tasks', 'chats']); => It updates all elements that are linked to any _fields at true and strings in the array, and update all elements with empty range, and launch all functions
		app_application_lincko.update('tasks', false); => The second parameters at false disable the parents update
	*/
	update: function(items, propagation){
		var action = false;
		var deletion = false;
		var item;
		var items_list = [];

		if(typeof propagation !== 'boolean'){
			propagation = true;
		}

		//Adding the list "items" in parameter
		if(typeof items === 'string' || typeof items === 'number'){
			items_list[items] = true;
		} else if($.type(items) === 'array'){
			for(var i in items){
				field = items[i];
				if(typeof field === 'string' || typeof field === 'number'){
					items_list[field] = true; 
				}
			}
		} else if(items === true){
			for(var field in this._fields){
				items_list[field] = true;
			}
		}

		//Adding the fields that are true (=need to update)
		for(var field in this._fields){
			if(this._fields[field]){
				items_list[field] = true;
			}
			this._fields[field] = false; //Reset to updated
		}

		//Add relations fields
		if(
			propagation
			&& !$.isEmptyObject(items_list)
			&& $.type(Lincko.storage.data) === 'object'
			&& $.type(Lincko.storage.data['_relations']) === 'object'
		){
			//Note that Up and Down reationship is already done one back server
			for(var i in items_list){
				if(typeof Lincko.storage.data['_relations'][i] === 'object'){
					for(var j in Lincko.storage.data['_relations'][i]){
						if(typeof items_list[ Lincko.storage.data['_relations'][i][j] ] === 'undefined'){
							items_list[ Lincko.storage.data['_relations'][i][j] ] = true;
						}
					}
				}
			}
		}

		if(!$.isEmptyObject(items_list)){
			
			//First we scan all HTML elements
			for(var Elem_id in this._elements){
				for(var field in items_list){
					if($.isEmptyObject(this._elements[Elem_id].range) || typeof this._elements[Elem_id].range[field] !== 'undefined'){
						Elem = $('#'+Elem_id);
						if(Elem.length > 0 && this._elements[Elem_id].exists()){
							this._elements[Elem_id].action();
						} else {
							this._elements[Elem_id].deletion();
							delete this._elements[Elem_id];
						}
						delete Elem;
						break;
					}	
				}
			}

			//For "false", we still launches all functions
			if(typeof items === 'boolean' && items === false){
				for(var field in this._fields){
					items_list[field] = true;
				}
				//Add relation fields
				if(
					propagation
					&& !$.isEmptyObject(items_list)
					&& $.type(Lincko.storage.data) === 'object'
					&& $.type(Lincko.storage.data['_relations']) === 'object'
				){
					//Note that Up and Down reationship is already done one back server
					for(var i in items_list){
						if(typeof Lincko.storage.data['_relations'][i] === 'object'){
							for(var j in Lincko.storage.data['_relations'][i]){
								if(typeof items_list[ Lincko.storage.data['_relations'][i][j] ] === 'undefined'){
									items_list[ Lincko.storage.data['_relations'][i][j] ] = true;
								}
							}
						}
					}
				}
			}

			//Second scann all functions
			for(var field in items_list){
				if(typeof this._functions.fields[field] === 'object'){
					for(var j in this._functions.fields[field]){
						this._functions.fields[field][j]();
					}
				}
			}

			//Only then we launch all functions registered in all
			//But do it only if the local database has been updated, if not there is no use to launch those functions
			for(var i in this._functions.all){
				this._functions.all[i]();
			}
		}
		
		return true;
	},

	/*
		"prepare" tells the object which fields he will need to check, bu do not start it.
		app_application_lincko.prepare(); => Ready to check all fields updated
		app_application_lincko.prepare('tasks'); => Ready to check all fields updated, and forcing the one as string if it exist in _fields
		app_application_lincko.prepare(['tasks', 'chats']); => Ready to check all fields updated, and forcing the ones in array if it exist in _fields

		NOTE: Because JS is not ready yet (obverse() is too new) to observe any object change, we have to add it manually.
	*/
	prepare: function(items){
		var item;
		if(typeof items === 'string' || typeof items === 'number'){
			if(typeof this._fields[items] === 'boolean'){
				this._fields[items] = true; //Force to update
			}
		} else if($.type(items) === 'object' || $.type(items) === 'array'){
			for(var i in items){
				item = items[i];
				if(typeof item !== 'string' && typeof item !== 'number'){
					delete items[i];
				} else if(typeof this._fields[item] === 'boolean'){
					this._fields[item] = true; //Force to update
				}
			}
		} else {
			//Force all to be updated
			for(var item in this._fields){
				this._fields[item] = true;
			}
		}
	},

	/*
		"setFields" creates common fields to launch when we do not precise which field to check, and set it to true. If the field already exists, it only sets it to true.
		app_application_lincko.setFields(['tasks', 'chats']); => Add string as a field to be checked
		app_application_lincko.setFields(['tasks', 'chats']); => Add strings in array as fields to be checked
	*/
	setFields: function(items, force){
		if(typeof force !== 'boolean'){ force = false; }
		var item;
		if(typeof items === 'string' || typeof items === 'number'){
			items = [items];
		}
		if($.type(items) === 'object' || $.type(items) === 'array'){
			for(var i in items){
				item = items[i];
				if(typeof item === 'string' || typeof item === 'number'){
					if(force || typeof this._fields[item] === 'undefined'){
						this._fields[item] = true; //Force to true even if it exists already
					}
				}
			}
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

function app_application_change_workspace(workspace){
	if(typeof workspace !== 'undefined'){
		top.location.replace('/workspace/'+workspace);
	} else {
		top.location.replace('/');
	}
}

function app_application_change_private(user){
	if(typeof user !== 'undefined'){
		top.location.replace('/user/'+user);
	} else {
		top.location.replace('/');
	}
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
	setInterval(function(){
		app_application_lincko.update();
	//}, 4000); //4s Demo
	}, 15000); //15s Production
});

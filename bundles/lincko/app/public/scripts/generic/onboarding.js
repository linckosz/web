var onboarding = {
	forceOff: false,
	on: false, //will be set to true for the duration of onboarding
	project_id: null, //onboarding project id
	overlays: {}, //functions and other controls for main menu and content overlays

	fn_next: null,
	currentTrip: null,

	id_welcome_bubble: 'onboarding_welcome_bubble',
	welcome_bubble_reposition: function(tripData, duration, cb_complete){
		if(typeof duration != 'number'){ var duration = 400; }
		var elem_trip_block = $('.trip-block.onboarding_trip_welcome');
		if(!elem_trip_block.length){ return false; }

		var elem_bubble = $('#'+this.id_welcome_bubble);

		var coord = elem_trip_block.offset();
		var left = coord.left;
		var top = coord.top;

		if(tripData && tripData.position == 'n'){
			var bottom = $(window).height() - coord.top - elem_trip_block.outerHeight();
			top = coord.top + elem_trip_block.outerHeight() - elem_bubble.outerHeight();
			elem_bubble.velocity({
				left: tripData.sel.offset().left,
				bottom: bottom,
			}, {
				mobileHA: hasGood3Dsupport,
				begin: function(){
					elem_bubble.css({
						top: 'auto',
						bottom: $(window).height() - elem_bubble.offset().top - elem_bubble.outerHeight(),
					});
					//elem_bubble.css({top: 'auto', 'bottom': top});
				},
				complete: function(){
					if(typeof cb_complete == 'function'){
						cb_complete();
					}
				}
			});
		}
		else{
			elem_bubble.velocity({
				left: coord.left,
				top: coord.top,
				translateX: 0,
				translateY: 0,
			},{
				mobileHA: hasGood3Dsupport,
				duration: duration,
				begin: function(){
					if(!elem_bubble.attr('style')){
						var coord_bubble = elem_bubble.offset();
						elem_bubble.css({
							left: coord_bubble.left,
							top: coord_bubble.top,
							transform: 'none',
						});
					}
					else{
						elem_bubble.css('bottom', '');
					}
				},
				complete: function(){
					if(typeof cb_complete == 'function'){
						cb_complete();
					}
				}
			});
		}

	},

	launch: function(ob_settings){ //return true if launched, return false if conditions are not fit for launch

		//onboarding launch fail
		if(onboarding.forceOff){ return false; }

		if(!ob_settings){
			var ob_settings = Lincko.storage.getOnboarding();
		}

		if(!ob_settings.projects[1] || !ob_settings.sequence[1]){ return false; }

		return onboarding.scripts.welcome(ob_settings.projects[1]);



		//below is onboarding 1.0
		if(onboarding.on || onboarding.forceOff){ 
			return false; //onboarding launch fail
		}

		//ob_settings don't exist if onboarding was not triggered from backend
		var ob_settings = Lincko.storage.getOnboarding();
		if(
			   !ob_settings
			|| !ob_settings.projects
			|| !ob_settings.projects[1]
			|| !ob_settings.sequence
			|| !ob_settings.sequence[1]
		){
			return false; //onboarding launch fail
		}
		var id_pj_welcome = ob_settings.projects[1]; //script 1
		var status_ob_welcome = ob_settings.sequence[1];

		//exit if welcome pj doesnt exist or onboarding is finished
		if(!Lincko.storage.get('projects', id_pj_welcome) || !status_ob_welcome){
			return false; //onboarding launch fail
		}

////////start onboarding
		onboarding.on = true;
		app_content_menu.selection(id_pj_welcome);
		app_application.project();
		onboarding.overlays.show.content_sub();

		var onboardingDelay = 0;
		if(responsive.test('maxMobileL')){
			onboardingDelay = 2000; //2s to show main menu is open
		}

		var submenu_timer = setInterval(function(){
			if(!app_content_menu_first_launch){
				clearInterval(submenu_timer);
				setTimeout(function(){
					onboarding.toBot(id_pj_welcome);
				}, onboardingDelay);
			}
		}, 500);

		//ESC during onboarding to clear
		$(document).on('keyup.onboarding', function(event){
			if (event.which == 27) { //ESC
		       $(document).off('keyup.onboarding');
		       onboarding.clear();
		    }
		});

		//watch for end of onboarding in the 'settings' sync function
		var id_onboarding_garbage_settings = app_application_garbage.add('onboarding_garbage_settings');
		app_application_lincko.add(id_onboarding_garbage_settings, 'settings', function(){ 
			var ob_settings = Lincko.storage.getOnboarding();
			var status_ob_welcome = ob_settings.sequence[1];

			//if onboarding is complete, unlock all Lincko
			if(!status_ob_welcome){
				onboarding.clear();
				onboarding.toBot();
				app_application_garbage.remove(id_onboarding_garbage_settings);
			}
		});
		return true; //onboarding launch successful
	}, //END OF launch

	clear_fn_list: [], //any function that needs to be run on onboarding.clear can be put here
	clear: function(submenuHide){
		var that = this;
		onboarding.on = false;
		onboarding.currentTripInst = null;
		this.scripts.completed = {};
		this.overlays.off();
		$('#'+this.id_welcome_bubble).recursiveRemove(0);
		$(document).off('click.onboarding');
		return;

		//below is onboarding 1.0
		if(submenuHide){
			submenu_Hideall();
		}
		
		$.each(this.clear_fn_list, function(i, fn){
			if(typeof fn == 'function'){ fn(); }
		});
		that.clear_fn_list = [];
	},

	//preview true/false for the linckoBot chat submenu
	preview: false,
	//linckoBot chat submenu control
	toBot: function(id){
		if(id){ this.project_id = id; }
		else if(this.project_id){ var id = this.project_id; }
		else{ return false; }
		var preview = this.preview;

		var chatSubmenu = submenu_get('newchat', preview);
		if(chatSubmenu && chatSubmenu.param && chatSubmenu.param.type && chatSubmenu.param.type == 'history'){ //if activity feed is open
			return chatSubmenu;
		}
		else{
			return submenu_Build("newchat", false, false, {
				type: 'history',
				id: id,
				title: Lincko.storage.get('projects', id, '+title'),
			}, preview);
		}		
	},
	
	//used in resume.js
	action_launch: function(current, next, text_id, param, subm){
		//if(!this.on){ return false; } //ignore action_launch calls if onboarding is not on
		if(this.scripts.completed[param[1]]){ return false; } //check if the script has already been ran
		var that = this;
		//console.log('onboarding.action_launch: '+current+' => '+next+' => '+text_id);
		var fn_continue = function(){
			that.scripts.completed[param[1]] = true;
			app_models_resume_onboarding_continue(current, next, text_id, subm);
			if(that.on){
				that.overlays.show.content_sub();
				onboarding.toBot();
				setTimeout(function(){
					onboarding.toBot();
				}, 2000);
			}
		}
		this.scripts[param[1]](fn_continue);
	},

	//holds all the functions to be run for each action number
	scripts: {
		completed: {
			//1: true,
			//2: true,
			//etc
		},
	},



}

onboarding.overlays = {
	btnSkip: function(on){
		var id = this.id.btnSkip;
		var elem_overlay = $('#'+id);
		var exists = false;
		if(elem_overlay.length){
			exists = true;
		}

		if(typeof on == 'boolean'){
			if(on && exists){
				return elem_overlay;
			}
			else if(on && !exist){
				elem_overlay = this.build_elem(id);
				$('#body_lincko').append(elem_overlay);
			}
			else if(!on){
				elem_overlay.recursiveRemove(0);
			}
		}
		else {
			if(exists){
				return elem_overlay;
			}
			else{
				elem_overlay = this.build_elem(id);
				$('#body_lincko').append(elem_overlay);
			}
		}

		if(elem_overlay.length){
			return elem_overlay;
		}
		else{
			return false;
		}	
	},
	body: function(on){
		var id = this.id.body;
		var elem_overlay = $('#'+id);
		var exists = false;
		if(elem_overlay.length){
			exists = true;
		}

		if(typeof on == 'boolean'){
			if(on && exists){
				return elem_overlay;
			}
			else if(on && !exist){
				elem_overlay = this.build_elem(id);
				$('#body_lincko').append(elem_overlay);
			}
			else if(!on){
				elem_overlay.recursiveRemove(0);
			}
		}
		else {
			if(exists){
				return elem_overlay;
			}
			else{
				elem_overlay = this.build_elem(id);
				$('#body_lincko').append(elem_overlay);
			}
		}

		if(elem_overlay.length){
			return elem_overlay;
		}
		else{
			return false;
		}	
	},
	ini: function(){
		this.show.that = this;
		this.master.that = this;
		//this.content_menu.that = this;
		//this.content_top.that = this;
		delete this.ini;
		return this;
	},
	id: {
		btnSkip: 'onboarding_overlay_btnSkip',
		master: 'onboarding_overlay_master',
		body: 'onboarding_overlay_body',
		project: 'onboarding_overlay_project',
		content: 'onboarding_overlay_content',
		content_menu: 'onboarding_overlay_content_menu',
		content_top: 'onboarding_overlay_content_top',
		content_dynamic_sub: 'onboarding_overlay_content_dynamic_sub',
	},

	off: function(){
		this.master.off();
		this.btnSkip(false);
		this.body(false);
		this.content(false);
		this.project(false);
		this.content_menu(false);
		this.content_top(false);
		this.content_dynamic_sub(false);
	},

	show: {
		that: null,
		content_sub: function(){
			this.that.master.menu();
			this.that.content_menu();
			this.that.content_top();
		},
	},

	build_elem: function(id){
		var elem = $('<div>').prop('id',id).addClass('onboarding_overlay '+id);
		if(id == 'onboarding_overlay_btnSkip'){ 
			elem.click(function(){
				onboarding.forceOff = true;
				if(onboarding.currentTrip){
					onboarding.currentTrip.stop();
				}
				onboarding.clear();
				/*if(typeof onboarding.fn_next == 'function'){
					onboarding.fn_next();	
				}*/
			}).text(Lincko.Translation.get('app', 73, 'html')); //Skip
		} 
		return elem;
	},

	project: function(on){
		var id = this.id.project;
		var elem_overlay = $('#'+id);
		var exists = false;
		if(elem_overlay.length){
			exists = true;
		}

		if(typeof on == 'boolean'){
			if(on && exists){
				return elem_overlay;
			}
			else if(on && !exist){
				elem_overlay = this.build_elem(id);
				$('#app_application_project').append(elem_overlay);
			}
			else if(!on){
				elem_overlay.recursiveRemove(0);
			}
		}
		else {
			if(exists){
				return elem_overlay;
			}
			else{
				elem_overlay = this.build_elem(id);
				$('#app_application_project').append(elem_overlay);
			}
		}

		if(elem_overlay.length){
			return elem_overlay;
		}
		else{
			return false;
		}
	},
	content: function(on){
		var id = this.id.content;
		var elem_overlay = $('#'+id);
		var exists = false;
		if(elem_overlay.length){
			exists = true;
		}

		if(typeof on == 'boolean'){
			if(on && exists){
				return elem_overlay;
			}
			else if(on && !exist){
				elem_overlay = this.build_elem(id);
				$('#app_application_content').append(elem_overlay);
			}
			else if(!on){
				elem_overlay.recursiveRemove(0);
			}
		}
		else {
			if(exists){
				return elem_overlay;
			}
			else{
				elem_overlay = this.build_elem(id);
				$('#app_application_content').append(elem_overlay);
			}
		}

		if(elem_overlay.length){
			return elem_overlay;
		}
		else{
			return false;
		}
	},

	content_dynamic_sub: function(on){
		var id = this.id.content_dynamic_sub;
		var elem_overlay = $('#'+id);
		var exists = false;
		if(elem_overlay.length){
			exists = true;
		}

		if(typeof on == 'boolean'){
			if(on && exists){
				return elem_overlay;
			}
			else if(on && !exist){
				elem_overlay = this.build_elem(id);
				$('#app_content_dynamic_sub').append(elem_overlay);
			}
			else if(!on){
				elem_overlay.recursiveRemove(0);
			}
		}
		else {
			if(exists){
				return elem_overlay;
			}
			else{
				elem_overlay = this.build_elem(id);
				$('#app_content_dynamic_sub').append(elem_overlay);
			}
		}

		if(elem_overlay.length){
			return elem_overlay;
		}
		else{
			return false;
		}
	},


	//control overlay over main menu or the content area
	master: {
		that: null,
		id: null,
		off: function(){
			var id = this.that.id.master;
			if($('#'+id).length){
				$('#'+id).recursiveRemove();
			}
		},
		menu: function(){
			var id = this.that.id.master;
			this.off();
			var elem_overlay = this.that.build_elem(id);
			$('#app_application_project').append(elem_overlay);
			return elem_overlay;
		},
		content: function(){
			var id = this.that.id.master;
			this.off();
			var elem_overlay = this.that.build_elem(id);
			$('#app_application_content').append(elem_overlay);
			return elem_overlay;
		}
	},


	content_menu: function(on){
		var id = this.id.content_menu;
		var elem_overlay = $('#'+id);
		var exists = false;
		if(elem_overlay.length){
			exists = true;
		}

		if(typeof on == 'boolean'){
			if(on && exists){
				return elem_overlay;
			}
			else if(on && !exist){
				elem_overlay = this.build_elem(id);
				$('#app_content_menu').addClass('onboarding_noBorder').append(elem_overlay);
			}
			else if(!on){
				$('#app_content_menu').removeClass('onboarding_noBorder');
				elem_overlay.recursiveRemove(0);
			}
		}
		else {
			if(exists){
				return elem_overlay;
			}
			else{
				elem_overlay = this.build_elem(id);
				$('#app_content_menu').addClass('onboarding_noBorder').append(elem_overlay);
			}
		}

		if(elem_overlay.length){
			return elem_overlay;
		}
		else{
			return false;
		}
	},

	content_top: function(on){
		var id = this.id.content_top;
		var elem_overlay = $('#'+id);
		var exists = false;
		if(elem_overlay.length){
			exists = true;
		}

		if(typeof on == 'boolean'){
			if(on && exists){
				return elem_overlay;
			}
			else if(on && !exist){
				elem_overlay = this.build_elem(id);
				$('#app_content_top').append(elem_overlay);
			}
			else if(!on){
				elem_overlay.recursiveRemove(0);
			}
		}
		else {
			if(exists){
				return elem_overlay;
			}
			else{
				elem_overlay = this.build_elem(id);
				$('#app_content_top').append(elem_overlay);
			}
		}

		if(elem_overlay.length){
			return elem_overlay;
		}
		else{
			return false;
		}
	},

}.ini();

//[1] Update my username, profile photo, and/or language
onboarding.scripts[1] = function(fn_continue){
	submenu_Build("settings", submenu_Getnext());
	$(document).on("submenuHide.onboarding", function(){
		if(!submenu_get('settings')){
			$(document).off("submenuHide.onboarding");
			fn_continue();
		}
	});
}

//[2] Chat closes and Project opened - shows task lists
onboarding.scripts[2] = function(fn_continue){
	/*
	Script: 
	Get started using Lincko @Username ++Today (marked as completed)
	(action1) Mark this task complete @Username ++Today
	(action2) Open this task or the task above by clicking or tapping on it. Each task can be assigned an owner, a due date, have subtasks, comments from the team, and link to files or notes. 
	(action3) Create a new task and assign it to the Monkey King by typing a task below. Use @ to assign to the Monkey King. Use ++ to assign today as the due date.
	(action4) Once all the above has been completed - the LinckoBot will reapear and take you the rest of the way :)
	*/

	//must complete all conditions to move on
	var conditions = {
		1: true, //target task mark complete (set to true because this condition is already included in condition 4)
		2: false, //open a task
		3: false, //assign a task to monkey king
		4: false, //mark all initial tasks complete
		5: false, //create a task for today
	}
	var condition_complete = function(num){
		conditions[num] = true;
		var allComplete = true;
		$.each(conditions, function(i, bool){
			if(!bool){ 
				allComplete = false;
				return false; 
			}
		});

		//if nothing returns false
		if(allComplete){
			fn_continue();
		}
	}
	submenu_Hideall();
	app_content_menu.selection(onboarding.project_id, 'tasks');
	//app_content_menu.change('tasks');
	
	var tasks_initial = Lincko.storage.list('tasks', null, null, 'projects', app_content_menu.projects_id, false);

	//action 1 - mark task_target complete
	/*var task_target = null;
	$.each(tasks_initial, function(i, task){
		if(!task.approved){
			task_target = task;
			return false;
		}
	});
	var onboarding_garbage_action1 = app_application_garbage.add('onboarding_garbage_script_2_1');
	app_application_lincko.add(onboarding_garbage_action1, 'tasks_'+task_target['_id'], function(){
		if(Lincko.storage.get('tasks', task_target['_id']).approved){
			app_application_garbage.remove(onboarding_garbage_action1);
			condition_complete(1);
		}
	});*/


	//action 2 - open a task
	var onboarding_garbage_action2 = app_application_garbage.add('onboarding_garbage_script_2_2');
	app_application_lincko.add(onboarding_garbage_action2, 'submenu_show', function(){
		if(submenu_get('taskdetail', true) || submenu_get('taskdetail', false)){ //check submenu
			app_application_garbage.remove(onboarding_garbage_action2);
			condition_complete(2);
		}
	});


	//action 3 - create a task assigned to monkeyKing (user 1)
	var onboarding_garbage_action3 = app_application_garbage.add('onboarding_garbage_script_2_3');
	app_application_lincko.add(onboarding_garbage_action3, 'projects_'+app_content_menu.projects_id, function(){
		var tasks = Lincko.storage.list('tasks', null, {created_by: wrapper_localstorage.uid}, 'projects', app_content_menu.projects_id, false);
		$.each(tasks, function(i, task){
			if(task['_users'] && task['_users'][1/*monkeyKing*/] && task['_users'][1/*monkeyKing*/]['in_charge']){
				app_application_garbage.remove(onboarding_garbage_action3);
				condition_complete(3);
				return false;
			}
		});
	});

	//action 4 - all tasks are marked complete
	var onboarding_garbage_action4 = app_application_garbage.add('onboarding_garbage_script_2_4');
	app_application_lincko.add(onboarding_garbage_action4, 'tasks', function(){
		var allApproved = true;
		$.each(tasks_initial, function(i, task){
			if(!Lincko.storage.get('tasks', task['_id']).approved){
				allApproved = false;
				return false;
			}
		});

		if(allApproved){
			app_application_garbage.remove(onboarding_garbage_action4);
			condition_complete(4);
		}
	});

	//condition 5 - user create a task for today
	var onboarding_garbage_action5 = app_application_garbage.add('onboarding_garbage_script_2_5');
	app_application_lincko.add(onboarding_garbage_action5, ['tasks', 'projects_'+app_content_menu.projects_id], function(){
		var tasks = Lincko.storage.list('tasks', null, {created_by: wrapper_localstorage.uid}, 'projects', app_content_menu.projects_id, false);
		$.each(tasks, function(i, task){
			if(task['duration'] && task['start']){
				var due_date = new wrapper_date(task.start + task.duration);
				if(due_date.happensSomeday(0)){
					app_application_garbage.remove(onboarding_garbage_action5);
					condition_complete(5);
					return false;
				}
			}
		});
	});
}

//[3] Take them to a special invite screen - where the can add people - or - 
onboarding.scripts[3] = function(fn_continue){
	submenu_Build('chat_add_user', submenu_Getnext(), false);
	var id_onboarding_submenu_hide = app_application_garbage.add('onboarding_garbage_script_3_submenu_hide');
	app_application_lincko.add(id_onboarding_submenu_hide, 'submenu_hide', function(){
		if(!submenu_get('chat_add_user')){
			app_application_garbage.remove(id_onboarding_submenu_hide);
			fn_continue();
		}
	});
}

//[4] once the user clicks - and the task is created - chat continues
onboarding.scripts[4] = function(fn_continue){
	var iniCount = Lincko.storage.list('tasks', null, null, 'projects', app_content_menu.projects_id, false).length;
	var onboarding_garbageID = app_application_garbage.add('onboarding_garbage_script_4');
	app_application_lincko.add(onboarding_garbageID, 'projects_'+app_content_menu.projects_id, function(){
		var count = Lincko.storage.list('tasks', null, null, 'projects', app_content_menu.projects_id, false).length;
		if(count > iniCount){ //new task created
			app_application_garbage.remove(onboarding_garbageID);
			fn_continue();
		}
	});
}

//[5] Open project creation submenu, focus on title then create button
onboarding.scripts[5] = function(fn_continue){
	submenu_Build("app_project_new", submenu_Getnext());
	var count_prev = Lincko.storage.list('projects').length;

	var id_onboarding_submenu_hide = app_application_garbage.add('onboarding_garbage_script_5_submenu_hide');

	app_application_lincko.add(id_onboarding_submenu_hide, 'submenu_hide', function(){
		if(!submenu_get('app_project_new')){
			app_application_garbage.remove(id_onboarding_submenu_hide);
			fn_continue();
		}
	});
}


//welcome onboarding
onboarding.scripts['welcome'] = function(project_id){

	var projectOpenSuccess = app_content_menu.selection(project_id);
	if(!projectOpenSuccess){ return false; }

	if(!$('#'+onboarding.id_welcome_bubble).length){
		$('body').append($('<div>').prop('id', onboarding.id_welcome_bubble).addClass(onboarding.id_welcome_bubble));
	}

	if(!$('#'+onboarding.id_welcome_bubble).is(':visible')){ return false; }
	

	//passed the check, begin initialization
	onboarding.on = true;
	onboarding.overlays.body();
	onboarding.overlays.btnSkip();
	$(document).on('click.onboarding', function(event){
		var elem_target = $(event.target);
		if(elem_target.hasClass('onboarding_overlay_body') || elem_target.hasClass('onboarding_overlay_content') ||  elem_target.hasClass('onboarding_overlay_content_dynamic_sub') || elem_target.hasClass('trip-overlay')){
			if(typeof onboarding.fn_next == 'function'){
				onboarding.fn_next();
			}
		}
	});


	//tracker to make sure trip only runs once
	var tripTracker = {
		check: function(tripObj, i){
			if(this[tripObj.id_trip][i]){ return true; }
			else{
				tripTracker[tripObj.id_trip][i] = true;
				return false;
			}
		},
	}

	var array_openMainMenu = [
		{
			sel: $('#app_application_menu_icon'),
			content: 'LINCKO',
			position : "s",
			expose : true,
			delay: -1,
			onTripStart : function(i, tripData){
				if(tripTracker.check(this, i)){return false;}
				var tripObj = this;			
				
				tripData.sel.off('click.trip').on('click.trip', function(event){
					$(this).off('click.trip');
					event.stopPropagation();
					onboarding.overlays.project().css('opacity', 0);
					var id_onboarding_garbage_mainMenuOpen = app_application_garbage.add('onboarding_garbage_mainMenuOpen');
					app_application_lincko.add(id_onboarding_garbage_mainMenuOpen, 'mainmenu_open_complete', 
						function(){
							app_application_garbage.remove(id_onboarding_garbage_mainMenuOpen);
							tripObj.stop();
						}
					);
				});

				var fn_next = function(){
					$('#app_application_menu_icon').click();
				}
				intro.gotoStep(1, fn_next);
				onboarding.fn_next = fn_next;
				onboarding.welcome_bubble_reposition(null, 700);
			},
		},
	];
	var trip_openMainMenu = new Trip(array_openMainMenu, {
		overlayHolder: '#app_application_content',
		tripClass: 'onboarding_trip_welcome',
		onStart: function(){
			onboarding.currentTrip = this;
			this.id_trip = 'openMainMenu';
			tripTracker[this.id_trip] = {};
		},
		onEnd: function(var1, var2){
			$('#app_application_menu_icon').off('click.trip');
			if(onboarding.forceOff){ return false; }
			onboarding.overlays.content().css('opacity', 0);
			delete trip_openMainMenu;
			trip_exploreMainMenu.start();
		}
	});

	var array_exploreMainMenu = [
		{
			sel: $('#app_project_projects_new'),
			content: 'new project',
			position : 'e',
			expose: true,
			delay: -1,
			onTripStart : function(i, tripData){
				$('#app_application_menu_icon').removeClass('.trip-exposed');
				onboarding.welcome_bubble_reposition();
				if(tripTracker.check(this, i)){return false;}
				//$('#app_application_menu_icon').removeClass('trip-exposed');
				/*$('#app_project_projects_new').css({
					//'outline': '4px solid #FFFFFF',
					'position': 'absolute',
					'opacity': 1,
				});*/
				//if(tripTracker.check(this, i)){return false;}
				var tripObj = this;
				onboarding.overlays.content().attr('style', '');

				var elem_overlay_project = onboarding.overlays.project().off('click.trip').on('click.trip', function(event){
					var elem_overlay = $(this);
					if(tripObj.tripIndex == 1){
						$(this).off('click.trip');
					}
					
					//if the main menu overlay was clicked, flash
					if($(event.target).hasClass('onboarding_overlay')){
						elem_overlay.velocity({opacity: 0}, {
							mobileHA: hasGood3Dsupport,
							begin: function(){
								$('#app_project_chats_tab').attr('style', '');
								elem_overlay.css({
									'background-color': '#FFFFFF',
									opacity: 1,
									border: '4px solid #FFFFFF',
								});
							},
						});
					}

					if(tripObj.tripIndex == 1){
						$(this).off('click.trip');

						//if main menu is closed, no close animation
						if(!$('#app_application_project').hasClass('app_application_visible')){
							tripObj.stop();
							return;
						}

						$('#app_application_menu_icon').velocity('fadeOut', {
							mobileHA: hasGood3Dsupport,
							begin: function(){
								$('#'+onboarding.id_welcome_bubble).velocity({left: 50, top: 58}, {
									mobileHA: hasGood3Dsupport,
									begin: function(){
										$('#'+onboarding.id_welcome_bubble).css({top: $('#'+onboarding.id_welcome_bubble).offset().top, bottom: ''});
									}
								});
								$('#app_application_menu_icon').css({
									outline: '4px solid #FFFFFF',
								});
							},
						}).velocity('fadeIn', {
							mobileHA: hasGood3Dsupport,
							complete: function(){
								$('#app_application_menu_icon').attr('style', '');
								app_application.move('project', true);
								tripObj.stop();
								//trip_exploreContent.start();
							}
						});								
					}
					else{
						tripObj.next();
					}
				});
				var fn_next = function(){
					elem_overlay_project.trigger('click.trip');
				}
				intro.gotoStep(2, fn_next);
				onboarding.fn_next = fn_next;
				var cb_complete = function(){
					setTimeout(function(){
						$('.trip-overlay').velocity({opacity: 0},{mobileHA: hasGood3Dsupport,});
					}, 2000);
				}
				onboarding.welcome_bubble_reposition(null, null, cb_complete);
			},
			onTripEnd : function(i, tripData){
				$('#app_project_projects_new').attr('style', '');
			}
		},
		{
			sel: $('#app_project_chats_tab'),
			content: 'chats tab',
			position : "e",
			expose: true,
			delay: -1,
			onTripStart : function(i, tripData){
				onboarding.welcome_bubble_reposition(tripData);
				$('#app_project_projects_new').attr('style', '');
				if(tripTracker.check(this, i)){return false;}
				
				tripData.sel.css('border', '4px solid #FFFFFF');
				$('.trip-overlay').css('opacity', '');
				setTimeout(function(){
					$('.trip-overlay').velocity({opacity: 0},{mobileHA: hasGood3Dsupport,});
				}, 2000);

				var fn_next = function(){
					onboarding.overlays.project().trigger('click.trip');
				}
				intro.gotoStep(3, fn_next);
				onboarding.fn_next = fn_next;
				onboarding.welcome_bubble_reposition(tripData);
			},
			onTripEnd: function(i, tripData){
				//tripData.sel.attr('style', '');
			}
		},
	];
	var trip_exploreMainMenu = new Trip(array_exploreMainMenu, {
		overlayHolder: '#app_project_content .iscroll_sub_div',
		tripClass: 'onboarding_trip_welcome onboarding_trip_exploreMainMenu',
		onStart: function(){
			onboarding.currentTrip = this;
			this.id_trip = 'exploreMainMenu';
			tripTracker[this.id_trip] = {};

			if(responsive.test("maxMobileL")){
				this.tripData[0].position = 's';
				this.tripData[1].position = 'n';
			}
			else{
				this.tripData[0].content = '<div style="height: 100px;"></div>';
				this.tripData[1].content = '<div style="height: 200px;"></div>';
			}

			onboarding.overlays.content();
			$('#app_project_projects_new').off('click.trip').addClass('onboarding_forceAbsolute');

			
		},
		onEnd: function(){
			if(onboarding.forceOff){ return false; }
			//if main menu is opened
			if($('#app_application_project').hasClass('app_application_visible')){
				var id_onboarding_garbage_mainMenuClose = app_application_garbage.add('onboarding_garbage_mainMenuClose');
				app_application_lincko.add(id_onboarding_garbage_mainMenuClose, 'mainmenu_close_complete', 
					function(){
						app_application_garbage.remove(id_onboarding_garbage_mainMenuClose);
						onboarding.overlays.project().attr('style', '');
						setTimeout(function(){
							trip_exploreContentTop.start();
						}, 1000);
					}
				);
			}
			else{
				onboarding.overlays.project().attr('style', '');
				trip_exploreContentTop.start();
			}
			
			
			delete trip_exploreMainMenu;
		}
	});


	var array_exploreContentTop = [
		{
			sel: $('#app_content_top_title_menu'),
			content: '<div style="width: 120px;">project_settings</div>',
			position : "s",
			expose: true,
			delay: -1,
			onTripStart : function(i, tripData){
				onboarding.welcome_bubble_reposition();
				if(tripTracker.check(this, i)){return false;}
				var tripObj = this;
				onboarding.overlays.content(false);
				onboarding.overlays.content_dynamic_sub();
				onboarding.overlays.content_menu();
				onboarding.overlays.content_top().css('opacity', 0).off('click.trip').on('click.trip', function(event){
					var elem_overlay = $(this);

					//if next is triggered by clicking on overlay, flash
					if($(event.target).hasClass('onboarding_overlay')){
						elem_overlay.velocity({opacity: 0}, {
							mobileHA: hasGood3Dsupport,
							begin: function(){
								elem_overlay.css({
									'background-color': '#FFFFFF',
									opacity: 1,
									border: '4px solid #FFFFFF',
								});
							},
							complete: function(){
								onboarding.overlays.content_top().attr('style', '');
								tripObj.stop();
							}
						});
					}
					$(this).off('click.trip');
				});

				var fn_next = function(){
					onboarding.overlays.content_top().attr('style', '');
					onboarding.overlays.content_top().off('click.trip');
					tripObj.stop();
				}
				intro.gotoStep(4, fn_next);
				onboarding.fn_next = fn_next;
				onboarding.welcome_bubble_reposition();
			},
		}
	];

	var trip_exploreContentTop = new Trip(array_exploreContentTop, {
		overlayHolder: '#app_content_top_title',
		tripClass: 'onboarding_trip_welcome onboarding_trip_exploreContentTop',
		onStart: function(){
			onboarding.currentTrip = this;
			this.id_trip = 'exploreContentTop';
			tripTracker[this.id_trip] = {};
			
		},
		onEnd: function(tripIndex, tripObject){
			if(onboarding.forceOff){ return false; }
			trip_exploreContentMenu.start();
		},
	});


	var array_exploreContentMenu = [
		{
			sel: $('#app_content_menu_tasks'),
			content: 'contentMenu',
			position : "e",
			expose: false,
			delay: 4000,
			onTripStart : function(i, tripData){
				onboarding.welcome_bubble_reposition(tripData);
				if(tripTracker.check(this, i)){return false;}
				var tripObj = this;
				
				var trip_index_counter = 0; //cyle through tasks, notes, chats, files
				var elem_overlay = onboarding.overlays.content_menu();
				elem_overlay.css('opacity', 0);
				elem_overlay.off('click.trip');

				var fn_next = function(){
					tripObj.stop();
				}
				intro.gotoStep(5, fn_next);
				onboarding.fn_next = fn_next;
				onboarding.welcome_bubble_reposition(tripData);
			},
		},
		{
			sel: $('#app_content_menu_tasks'),
			content: 'tasks',
			position : "e",
			expose: true,
			delay: 2000,
			onTripStart : function(i, tripData){
				onboarding.welcome_bubble_reposition(tripData);
			},
		},
		{
			sel: $('#app_content_menu_notes'),
			content: 'notes',
			position : "e",
			expose: true,
			delay: 2000,
			onTripStart : function(i, tripData){
				onboarding.welcome_bubble_reposition(tripData);
			},
		},
		{
			sel: $('#app_content_menu_chats'),
			content: 'chats',
			position : "e",
			expose: true,
			delay: 2000,
			onTripStart : function(i, tripData){
				onboarding.welcome_bubble_reposition(tripData);
			},
		},
		{
			sel: $('#app_content_menu_files'),
			content: 'files',
			position : "e",
			expose: true,
			delay: -1,
			onTripStart : function(i, tripData){
				onboarding.welcome_bubble_reposition(tripData);
			},
		}
	];


	var trip_exploreContentMenu = new Trip(array_exploreContentMenu, {
		overlayHolder: '#app_content_menu_table',
		tripClass: 'onboarding_trip_welcome onboarding_trip_exploreContentMenu',
		onStart: function(){
			onboarding.currentTrip = this;
			this.id_trip = 'exploreContentMenu';
			tripTracker[this.id_trip] = {};

			if(responsive.test("maxMobileL")){
				$.each(this.tripData, function(i, obj){
					obj.position = 'n';
				});
			}

			
		},
		onEnd: function(tripIndex, tripObject){
			if(onboarding.forceOff){ return false; }
			onboarding.overlays.content_dynamic_sub(false);
			onboarding.overlays.content_menu().off('click.trip').attr('style', '');
			var array_inputter = [
				{
					sel: $('#skylist_tasks_layer_tasks_inputter_container'),
					content: 'inputter',
					position : "n",
					expose: true,
					delay: -1,
					onTripStart : function(i, tripData){
						if(tripTracker.check(this, i)){
							onboarding.welcome_bubble_reposition(tripData);
							return false;
						}

						var tripObj = this;
						var fn_next = function(){
							tripObj.stop();
						}
						intro.gotoStep(6, fn_next);
						onboarding.fn_next = fn_next;
						onboarding.welcome_bubble_reposition(tripData);

						setTimeout(function(){
							tripData.sel.find('[contenteditable]').focus();
							setTimeout(function(){
								fn_next();
							}, (intro.script[6].length+2)*1000);
						}, 4000);
					},
				},
			];
			var trip_inputter = new Trip(array_inputter, {
				overlayHolder: '#app_content_dynamic_layers',
				tripClass: 'onboarding_trip_welcome onboarding_trip_inputter',
				onStart: function(){
					onboarding.currentTrip = this;
					this.id_trip = 'inputter';
					tripTracker[this.id_trip] = {};
					
				},
				onEnd: function(tripIndex, tripObject){
					if(onboarding.forceOff){ return false; }
					//$('.trip-overlay').css('display', 'none');
					onboarding.clear();
				},
			});
			trip_inputter.start();
		},
	});

	var fn_next = function(){
		trip_openMainMenu.start();
		onboarding.overlays.body(false);
	}

	$('#'+onboarding.id_welcome_bubble).append(intro.showPanel());
	
	intro.startStep(fn_next);
	onboarding.fn_next = fn_next;
		
	return true;
}






var id_onboarding_garbage_launch = app_application_garbage.add('onboarding_garbage_launch');
app_application_lincko.add(id_onboarding_garbage_launch, ['launch_onboarding', 'settings'], function(){

	var ob_settings = Lincko.storage.getOnboarding();
	if(ob_settings){
		var launched = onboarding.launch(ob_settings);
		app_application_garbage.remove(id_onboarding_garbage_launch);
	}

	/*var launched = onboarding.launch();
	//stop looking for onboarding launch if it is already launched OR onboarding settings object exists but wasn't launched (user already finished)
	if(launched){
		app_application_garbage.remove(id_onboarding_garbage_launch);
	}*/
});

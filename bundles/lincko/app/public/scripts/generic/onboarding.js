var onboarding = {
	forceOff: false,
	on: false, //will be set to true for the duration of onboarding
	project_id: null, //onboarding project id
	overlays: {}, //functions and other controls for main menu and content overlays

	launch: function(){ //return true if launched, return false if conditions are not fit for launch

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
		this.scripts.completed = {};
		onboarding.overlays.off();
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
		if(!this.on){ return false; } //ignore action_launch calls if onboarding is not on
		if(this.scripts.completed[param[1]]){ return false; } //check if the script has already been ran
		var that = this;
		//console.log('onboarding.action_launch: '+current+' => '+next+' => '+text_id);
		var fn_continue = function(){ 
			that.scripts.completed[param[1]] = true;
			app_models_resume_onboarding_continue(current, next, text_id, subm);
			that.overlays.show.content_sub();
			that.toBot();
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
	ini: function(){
		this.show.that = this;
		this.master.that = this;
		//this.content_menu.that = this;
		//this.content_top.that = this;
		delete this.ini;
		return this;
	},
	id: {
		master: 'onboarding_overlay_master',
		content_menu: 'onboarding_overlay_content_menu',
		content_top: 'onboarding_overlay_content_top',
	},

	off: function(){
		this.master.off();
		this.content_menu(false);
		this.content_top(false);
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
		return $('<div>').prop('id',id).addClass('onboarding_overlay_master '+id);
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
			$('#app_application_project').append(this.that.build_elem(id));
		},
		content: function(){
			var id = this.that.id.master;
			this.off();
			$('#app_application_content').append(this.that.build_elem(id));
		}
	},

	//to add add or remove overlay inside content area
	content: function(id, on){ 
		var elem = $('#'+id);
		var elem_parent = null;
		if(id == this.id.content_menu){
			elem_parent = $('#app_content_menu');
		}
		else if(id == this.id.content_top){
			elem_parent = $('#app_content_top');
		}
		else{
			return false;
		}

		if(on){
			if(!elem.length){
				elem_parent.append(this.build_elem(id));
			}
		}
		else{
			if(elem.length){
				elem.recursiveRemove();
			}
		}
	},

	content_menu: function(on){
		if(typeof on != 'boolean'){ var on = true; }
		var id = this.id.content_menu;
		this.content(id, on);
	},
	content_top: function(on){
		if(typeof on != 'boolean'){ var on = true; }
		var id = this.id.content_top;
		this.content(id, on);
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
		1: false, //target task mark complete
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
	var task_target = null;
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
	});


	//action 2 - open a task
	$(document).on("submenuHide.onboarding", function(){
		if(!submenu_get('taskdetail', true)){ //check submenu
			$(document).off("submenuHide.onboarding");
			condition_complete(2);
		}
		else if(!submenu_get('taskdetail', false)){ //check preview
			$(document).off("submenuHide.onboarding");
			condition_complete(2);
		}
	});


	//action 3 - create a task assigned to monkeyKing (user 1)
	var onboarding_garbage_action2 = app_application_garbage.add('onboarding_garbage_script_2_2');
	app_application_lincko.add(onboarding_garbage_action2, 'projects_'+app_content_menu.projects_id, function(){
		var tasks = Lincko.storage.list('tasks', null, {created_by: wrapper_localstorage.uid}, 'projects', app_content_menu.projects_id, false);
		$.each(tasks, function(i, task){
			if(task['_users'] && task['_users'][1/*monkeyKing*/] && task['_users'][1/*monkeyKing*/]['in_charge']){
				app_application_garbage.remove(onboarding_garbage_action2);
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


var id_onboarding_garbage_launch = app_application_garbage.add('onboarding_garbage_launch');
app_application_lincko.add(id_onboarding_garbage_launch, ['launch_onboarding', 'settings'], function(){
	var launched = onboarding.launch();
	if(!launched){
		app_application_garbage.remove(id_onboarding_garbage_launch);
	}
});

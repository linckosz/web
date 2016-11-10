var onboarding = {
	forceOff: true,
	on: false, //will be set to true for the duration of onboarding
	project_id: null,
	overlays: {},

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
	action_launch: function(current, next, text_id, param){
		if(this.scripts.completed[param[1]]){ return false; } //check if the script has already been ran
		var that = this;
		//console.log('onboarding.action_launch: '+current+' => '+next+' => '+text_id);
		var fn_continue = function(){ 
			that.scripts.completed[param[1]] = true;
			//console.log('fn_continue (onboarding.script '+param[1]+')');
			//console.log('fn_continue: '+current+' => '+next+' => '+text_id);
			app_models_resume_onboarding_continue(current, next, text_id);
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
	(continue condition) Once all the above has been completed - the LinckoBot will reapear and take you the rest of the way :)
	*/

	//must complete all conditions to move on
	var conditions = {
		1: false,
		2: false,
		3: false,
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
	app_content_menu.change('tasks');
	

	//action 1 - mark task_target complete
	var tasks_initial = Lincko.storage.list('tasks', null, null, 'projects', app_content_menu.projects_id, false);
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

}

//[3] Take them to a special invite screen - where the can add people - or - 
onboarding.scripts[3] = function(fn_continue){
	submenu_Build('chat_list', submenu_Getnext(), null, true, false);
	var id_onboarding_submenu_hide = app_application_garbage.add('onboarding_garbage_script_3_submenu_hide');
	app_application_lincko.add(id_onboarding_submenu_hide, 'submenu_hide', function(){
		if(!submenu_get('chat_list')){
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
			if(count_prev < Lincko.storage.list('projects').length){ //new project
				setTimeout(function(){
					onboarding.clear();
					onboarding.toBot();
				}, 2000); //2 sec to allow user to see that he is taken to a newly created project, then pop open bot
			}
			else{ //no new project
				onboarding.clear();
			}
		}
	});
}


var id_onboarding_garbage_launch = app_application_garbage.add('onboarding_garbage_launch');
app_application_lincko.add(id_onboarding_garbage_launch, 'launch_onboarding', function(){
	if(onboarding.on || onboarding.forceOff ){ 
		app_application_garbage.remove(id_onboarding_garbage_launch);
		return; 
	}

	if(!Lincko.storage.data.settings 
		|| !Lincko.storage.data.settings[wrapper_localstorage.uid] 
		|| !Lincko.storage.data.settings[wrapper_localstorage.uid].onboarding){ return false; }
	
	var ob_settings = JSON.parse(Lincko.storage.data.settings[wrapper_localstorage.uid].onboarding);
	var id_pj_onboarding = ob_settings.projects[1];

	var linckoComments = Lincko.storage.list('comments', null, {created_by: 0}, 'projects', id_pj_onboarding, false);
	var ob_list = [];
	$.each(linckoComments, function(i, comment){
		var comment_ob = JSON.parse(comment['+comment']);
		if(comment_ob.ob){
			ob_list.push(comment_ob.ob);
		}
	});

	var ob_latest = ob_list[0];
	var onboardingNumber = Object.keys(ob_latest)[0];

	if(onboardingNumber && onboardingNumber != 10019 /*NOT end*/){
		onboarding.on = true;
		var preview = false;
		app_content_menu.selection(id_pj_onboarding);
		app_application.project();
		onboarding.overlays.show.content_sub();

		var onboardingDelay = 0;
		if(responsive.test('maxMobileL')){
			onboardingDelay = 2000;
		}

		var submenu_timer = setInterval(function(){
			if(!app_content_menu_first_launch){
				clearInterval(submenu_timer);
				setTimeout(function(){
					onboarding.toBot(id_pj_onboarding);
				}, onboardingDelay);
			}
		}, 500);
	}

	app_application_garbage.remove(id_onboarding_garbage_launch);
});

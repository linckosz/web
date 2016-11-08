var onboarding_launched = true; //no onboaring. update status during launch_onboarding sync function

var onboarding_action_launch = function(current, next, text_id, param){
	console.log('onboarding_action_launch: '+current+' => '+next+' => '+text_id);
	var fn_continue = function(){
		app_models_resume_onboarding_continue(current, next, text_id);
		onboarding_overlays.show.content_sub();
	}
	onboarding_script_fn[param[1]](fn_continue);
}

var onboarding_script_fn = {};
onboarding_script_fn[1] = function(fn_continue){
	//[1] Update my username, profile photo, and/or language
	$(document).on("submenuHide.onboarding", function(){
		if(!submenu_get('settings')){
			$(document).off("submenuHide.onboarding");
			fn_continue();
		}
	});
	submenu_Build("settings");
}
onboarding_script_fn[2] = function(fn_continue){
	//[2] Chat closes and Project opened - shows task lists
	/*
	Script: 
	Get started using Lincko @Username ++Today (marked as completed)
	(action) Mark this task complete @Username ++Today
	(action) Open this task or the task above by clicking or tapping on it. Each task can be assigned an owner, a due date, have subtasks, comments from the team, and link to files or notes. 
	(action) Create a new task and assign it to the Monkey King by typing a task below. Use @ to assign to the Monkey King. Use ++ to assign today as the due date.
	(continue condition) Once all the above has been completed - the LinckoBot will reapear and take you the rest of the way :)
	*/
	app_content_menu.change('tasks');

}
onboarding_script_fn[3] = function(fn_continue){
	//[3] Take them to a special invite screen - where the can add people - or - 

}
onboarding_script_fn[4] = function(fn_continue){
	//[4] once the user clicks - and the task is created - chat continues
}
onboarding_script_fn[5] = function(fn_continue){
	//[5] Open project creation submenu, focus on title then create button
	var count_prev = Lincko.storage.list('projects').length;
	var onboarding_garbageID = app_application_garbage.add('onboarding_garbage_script_5');
	app_application_lincko.add(onboarding_garbageID, 'projects', function(){
		if(count_prev < Lincko.storage.list('projects').length){
			fn_continue();
			app_application_garbage.remove(onboarding_garbageID);
		}
	});
	submenu_Build("app_project_new");
}
onboarding_script_fn[6] = function(fn_continue){
	
}
onboarding_script_fn[7] = function(fn_continue){
	
}
onboarding_script_fn[8] = function(fn_continue){
	
}


var onboarding_overlays = {
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


var onboarding_garbageID = app_application_garbage.add('onboarding_garbage');
app_application_lincko.add(onboarding_garbageID, 'launch_onboarding', function(){
	if(onboarding_launched){ return; }

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

	if(onboardingNumber){
		onboarding_launched = true;
		var preview = true;
		app_content_menu.selection(id_pj_onboarding, 'chats');
		app_application.project();
		onboarding_overlays.show.content_sub();

		var submenu_timer = setInterval(function(){
			if(!app_content_menu_first_launch){
				clearInterval(submenu_timer);
				var submenuInst = submenu_Build("newchat", false, false, {
					type: 'history',
					id: id_pj_onboarding,
					title: Lincko.storage.get('projects', id_pj_onboarding, '+title'),
				}, preview);
			}
		}, 500);
	}

	if(onboardingNumber == 10001){ //beginning
		
	}

	app_application_garbage.remove(onboarding_garbageID);
});

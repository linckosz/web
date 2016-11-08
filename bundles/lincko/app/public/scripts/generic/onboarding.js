var onboarding_launched = false; //no onboaring. update status during launch_onboarding sync function

var onboarding_action_launch = function(current, next, param){

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


var onboarding = {

	initialize: function(){

	},

}







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

	console.log(ob_latest);

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

	
	var id_elem_ob_chat = submenu_get('newchat', preview);

	//id_elem_ob_chat


	app_application_garbage.remove(onboarding_garbageID);
});

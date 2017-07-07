/*
//Only "style" and "title" must exist, other fields are optional
submenu_list['sample'] = {
	//Set the title of the top
	"_title": {
		"style": "customized_title",
		"title": "Sample",
	},
	"left_button": {
		"style": "title_left_button",
		"title": Lincko.Translation.get('app', 25, 'html'), //Close
		'hide': true,
		"class": "base_pointer",
	},
	//Add HTML/JS checking input format
	"_input": {
		"style": "prefix",
		"title": "sample",
	},
	//Just do an action (need to hide al menus manually by the function submenu_Hideall)
	"action": {
		"style": "button",
		"title": "Single action",
		"action": function(){
			alert('An action');
		},
		"now": function(Elem, subm){ //An action to launch at element creation
			alert('An action');
			console.log(subm);
			console.log(Elem);
		},
		"class": "",
		"hide": true, //By default 'false', it hides all submenu after the click ( equivalent to submenu_Hideall(); )
	},
	//It will open a sub menu
	"Submenu": {
		"style": "next",
		"title": "Submenu", //The name of the next menu we will access
		"next": "anothermenu",
		"value": "Un truc", //This will be replace by the title of the sub menu if it exists
		"class": "",
	},
	//It will create a form with a validation button
	"form": {
		"style": "form",
		"title": Lincko.Translation.get('app', 3, 'html'), //Confirm
		"hide": true, //By default 'false', it hides all submenu after the click ( equivalent to submenu_Hideall(); )
	},
};
*/

submenu_list['test'] = {
	//Set the title of the top
	"_title": {
		"style": "customized_title",
		"title": Lincko.Translation.get('app', 2001, 'html'), //New project
	},
	"left_button": {
		"style": "title_left_button",
		"title": 'Test', //Settings
		'hide': true,
		"class": "base_pointer",
	},
};

submenu_list['settings'] = {
	//Set the title of the top
	"_title": {
		"style": "customized_title",
		"title": Lincko.Translation.get('app', 2, 'html'), //Lincko Settings
	},
	"left_button": {
		"style": "title_left_button",
		"title": Lincko.Translation.get('app', 25, 'html'), //Close
		'hide': true,
		"class": "base_pointer",
	},
	//Profile
	"personal_info": {
		"style": "profile_next",
		"title": "",
		"hide": true,
		"next": "personal_info",
		"class": "",
	},
	//Change the language
	"language": {
		"style": "next",
		"title": Lincko.Translation.get('app', 1, 'html'), //Language
		"next": "language",
		"value": submenu_language_full,
		"class": "",
	},
	//Change the style
	"style": {
		"style": "next",
		"title": Lincko.Translation.get('app', 122, 'html'), //Style
		"next": "style",
		"value": function(){
			return Lincko.styling.title(wrapper_localstorage.styling);
		},
		"class": "",
		"now": function(Elem, subm){
			app_application_lincko.add(subm.id, "users", function() {
				var Elem = this.action_param;
				Elem.find("[find=submenu_next_value]").html(Lincko.styling.title(wrapper_localstorage.styling));
			}, Elem);
		},
	},
	//Change the workspace
	"workspace": {
		"style": "next",
		"title": Lincko.Translation.get('app', 39, 'html'), //Workspace
		"next": "workspace",
		"value": function(){ return Lincko.storage.WORKNAME; },
		"now": function(Elem, subm){
			if(Lincko.storage.list('workspaces').length==0){
				Elem.addClass('display_none');
			}
		},
	},
	"home": {
		"style": "button",
		"title": Lincko.Translation.get('app', 43, 'html'), //Visit Lincko Web Site
		"action": function(){
			window.location.href = wrapper_link['home'];
		},
		"class": "",
		"now": function(Elem, subm){
			if(isMobileApp()){
				Elem.addClass('display_none');
			}
		},
	},
	"appstore": {
		"style": "button",
		"title": Lincko.Translation.get('app', 93, 'html'), //Download our App
		"action": function(){
			app_application_action(14, {from: 'application'});
			window.open(wrapper_link['appstore'], "_blank");
		},
		"class": "",
		"now": function(Elem, subm){
			if(isMobileApp()){
				Elem.addClass('display_none');
			}
		},
	},
	"follow_facebook": {
		"style": "button",
		"title": Lincko.Translation.get('app', 94, 'html'), //Like us on Facebook
		"action": function(){
			window.open("https://www.facebook.com/linckoapp/", "_blank");
		},
		"class": "",
	},
	"follow_wechat": {
		"style": "button",
		"title": Lincko.Translation.get('app', 95, 'html'), //Follow us on Wechat
		"action": function(){
			previewer.pic_url(app_application_icon_single_wechat_account.src);
		},
		"class": "",
	},
	"support": {
		"style": "button",
		"title": Lincko.Translation.get('app', 89, 'html'), //Contact Us
		"action": function(Elem,subm){
			//window.location.href = wrapper_link['support'];
			submenu_feedback_open_single(subm,0);
		},
		"class": "",
	},
	"refresh": {
		"style": "button",
		"title": Lincko.Translation.get('app', 98, 'html'), //Click to refresh the page
		"action": function(){
			wrapper_localstorage.encrypt('lastvisit', 0, false, true);
			wrapper_localstorage.emptyStorage();
			window.location.href = wrapper_link['root'];
		},
		"class": function(){
			var display = "display_none";
			if(wrapper_domain_debug){
				display = "";
			}
			return display;
		},
	},
	"signout": {
		"style": "button",
		"title": Lincko.Translation.get('app', 38, 'html'), //Sign out
		"action": function(){
			wrapper_sendAction('','post','user/signout', null, null, wrapper_signout_cb_begin, wrapper_signout_cb_complete);
		},
		"class": "",
		"now": function(Elem, subm){
			if(navigator.userAgent.match(/MicroMessenger/i)){
				Elem.addClass('display_none');
			}
		},
	},
};

//submenu_Build("welcome", 1, false, false, false);
submenu_list['welcome'] = {
	//Set the title of the top
	"_title": {
		"style": "customized_title",
		"title": Lincko.Translation.get('app', 124, 'html'), //Welcome
	},	
	"_pre_action": {
		"style": "preAction",
		"action": function(Elem, subm){
			$('#base_wall_info').removeClass("display_none");
			subm.focuson = false;
			subm.param_namecard = {};
			//Priority on current Workspaces, then shared Workspaces, then Users
			var val = Lincko.storage.get('users', wrapper_localstorage.uid);
			subm.param_namecard.id = false;
			subm.param_namecard.parent_id = wrapper_localstorage.uid;
			subm.param_namecard.username = val['-username'];
			if(val['-firstname']!=null){ subm.param_namecard.firstname = val['-firstname']; };
			if(val['-lastname']!=null){ subm.param_namecard.lastname = val['-lastname']; };
			if(Lincko.storage.getWORKID()>0){
				if(val['email']!=null){ subm.param_namecard.email = val['email']; };
			}
			var namecards = Lincko.storage.list('namecards', -1, null, 'users', wrapper_localstorage.uid);
			namecards = Lincko.storage.sort_items(namecards, 'workspaces_id', 0, -1, true); //From shared (0) to current (higher ID)
			for(var i in namecards){
				var val = namecards[i];
				if(val['workspaces_id'] == Lincko.storage.getWORKID()){
					subm.param_namecard.id = val['workspaces_id'];
				}
				if(val['workspaces_id']>0){
					if(typeof val['-username'] != 'undefined' && val['-username']!=null){ subm.param_namecard.username = val['-username']; };
					if(typeof val['-firstname'] != 'undefined' && val['-firstname']!=null){ subm.param_namecard.firstname = val['-firstname']; };
					if(typeof val['-lastname'] != 'undefined' && val['-lastname']!=null){ subm.param_namecard.lastname = val['-lastname']; };
				}
				if(typeof val['-email'] != 'undefined' && val['-email']!=null){ subm.param_namecard.email = val['-email']; };
				if(typeof val['-address'] != 'undefined' && val['-address']!=null){ subm.param_namecard.address = $('<div>').text(val['-address']).text(); };
				if(typeof val['-phone'] != 'undefined' && val['-phone']!=null){ subm.param_namecard.phone = val['-phone']; };
				if(typeof val['-business'] != 'undefined' && val['-business']!=null){ subm.param_namecard.business = $('<div>').text(val['-business']).text(); };
				if(typeof val['-additional'] != 'undefined' && val['-additional']!=null){ subm.param_namecard.additional = $('<div>').text(val['-additional']).text(); };
				if(typeof val['-linkedin'] != 'undefined' && val['-linkedin']!=null){ subm.param_namecard.linkedin = val['-linkedin']; };
			}
		},
	},
	"_hide_action": {
		"style": "hideAction",
		"action": function(Elem, subm){
			//We give a bit time in case the user just close the webpage or the app
			setTimeout(function(){
				//app_models_resume_onboarding_continue(null, 10101);
			}, 300);
			$('#base_wall_info').addClass("display_none");
		},
	},
	"info": {
		"style": "info",
		"title": "",
		"value": Lincko.Translation.get('app', 125, 'html'), //Before we get started, please provide some information.
		"class": "submenu_deco_info submenu_standard_welcome",
		"now": function(Elem, subm){
			Elem.find("[find=submenu_info_title]").addClass("submenu_standard_welcome_title");
		}
	},
	"start": {
		"style": "bottom_button",
		"title": Lincko.Translation.get('app', 5, 'html'), //Start
		'hide': true,
	},
	//Change the language
	"language": {
		"style": "next",
		"title": Lincko.Translation.get('app', 1, 'html'), //Language
		"next": "language",
		"value": submenu_language_full,
	},
	"nickname": {
		"style": "profile_input",
		"title": Lincko.Translation.get('app', 47, 'html'), //Nickname
		"value": function(Elem, subm){
			var val = false;
			if(typeof subm.param_namecard.username != 'undefined'){
				val = subm.param_namecard.username;
			}
			if(!val){ return ""; }
			return wrapper_to_html(val);
		},
		"action": function(Elem, subm, now, force){
			if(typeof now == "undefined"){ now = false; }
			if(typeof force == "undefined"){ force = false; }
			var val_new = Elem.find("[find=submenu_value]").val();
			if(!force && val_new==""){
				return true;
			}
			var timer = wrapper_timeout_timer*10;
			if(now){
				timer = 0;
			}
			if(val_new != subm.param_namecard.username){
				clearTimeout(submenu_profile_timer['username']);
				submenu_profile_timer['username'] = setTimeout(function(namecard){
					var val_old = namecard.username;
					namecard.username = val_new;
					if(!Lincko.storage.getWORKID()){
						wrapper_sendAction(
							{
								"id": namecard.parent_id,
								"username": val_new,
							},
							'post',
							'user/update',
							null,
							function(){
								namecard.username = val_old;
							}
						);
					} else {
						wrapper_sendAction(
							{
								"parent_id": namecard.parent_id,
								"username": val_new,
							},
							'post',
							'namecard/change',
							null,
							function(){
								namecard.username = val_old;
							}
						);
					}
				}, timer, subm.param_namecard);
			}
		},
	},
	"email": {
		"style": "profile_input",
		"title": Lincko.Translation.get('app', 85, 'html'), //Email
		"value": function(Elem, subm){
			var val = false;
			if(typeof subm.param_namecard.email != 'undefined'){
				val = subm.param_namecard.email;
			}
			if(!val){
				return "";
			}
			return wrapper_to_html(val);
		},
		"action": function(Elem, subm, now, force){
			if(typeof now == "undefined"){ now = false; }
			if(typeof force == "undefined"){ force = false; }
			var val_new = Elem.find("[find=submenu_value]").val();
			if(!force && val_new==""){
				return true;
			}
			var timer = wrapper_timeout_timer*10;
			if(now){
				timer = 0;
			}
			if(val_new != subm.param_namecard.email && (val_new=="" || base_input_field.email.valid(val_new))){
				clearTimeout(submenu_profile_timer['email']);
				submenu_profile_timer['email'] = setTimeout(function(namecard){
					var val_old = namecard.email;
					namecard.email = val_new;
					wrapper_sendAction(
						{
							"parent_id": namecard.parent_id,
							"email": val_new,
						},
						'post',
						'namecard/change',
						null,
						function(){
							namecard.email = val_old;
						}
					);
				}, timer, subm.param_namecard);
			}
		},
	},
	"phone": {
		"style": "profile_input",
		"title": Lincko.Translation.get('app', 104, 'html'), //Phone
		"value": function(Elem, subm){
			var val = false;
			if(typeof subm.param_namecard.phone != 'undefined'){
				val = subm.param_namecard.phone;
			}
			if(!val){ return ""; }
			return wrapper_to_html(val);
		},
		"action": function(Elem, subm, now, force){
			if(typeof now == "undefined"){ now = false; }
			if(typeof force == "undefined"){ force = false; }
			var val_new = Elem.find("[find=submenu_value]").val();
			if(!force && val_new==""){
				return true;
			}
			var timer = wrapper_timeout_timer*10;
			if(now){
				timer = 0;
			}
			if(val_new != subm.param_namecard.phone){
				clearTimeout(submenu_profile_timer['phone']);
				submenu_profile_timer['phone'] = setTimeout(function(namecard){
					var val_old = namecard.phone;
					namecard.phone = val_new;
					wrapper_sendAction(
						{
							"parent_id": namecard.parent_id,
							"phone": val_new,
						},
						'post',
						'namecard/change',
						null,
						function(){
							namecard.phone = val_old;
						}
					);
				}, timer, subm.param_namecard);
			}
		},
	},
};


if(wrapper_domain_debug){
	submenu_list['settings']['domain_debug'] = {
		"style": "title_small",
		"title": wrapper_domain_debug,
	}
}

submenu_list['workspace'] = {
	"_title": {
		"style": "customized_title",
		"title": Lincko.Translation.get('app', 39, 'html'), //Workspace
	},
	"left_button": {
		"style": "title_left_button",
		"title": Lincko.Translation.get('app', 25, 'html'), //Close
		'hide': true,
		"class": "base_pointer",
	},
	"pre_action": {
		"style": "preAction",
		"action": function(Elem, subm){
			submenu_workspace_build_list();
		},
	},
};


var submenu_workspace_build_list = function(){
	var workspaces = Lincko.storage.sort_items(Lincko.storage.list('workspaces'), 'name');
	var url;
	var name;
	var username;
	var select;
	//My workspace
	submenu_list['workspace']['_0_0'] = {
		"style": "radio",
		"title": Lincko.Translation.get('app', 40, 'html'), //My workspace
		"hide": true,
		"action_param": null,
		"action": function(Elem, subm){
			app_application_change_private();
		},
		"selected": false,
	};
	if(!wrapper_localstorage.workspace){
		submenu_list['workspace']['_0_0'].selected = true;
	}
	//List first Workspaces' workspace
	for(var i in workspaces){
		if(workspaces[i].name.length > 0){
			name = workspaces[i].name;
			url = workspaces[i].url;
			if(typeof submenu_list['workspace']['_1_'+workspaces[i]['_id']] == 'undefined'){
				submenu_list['workspace']['_1_'+workspaces[i]['_id']] = {
					"style": "radio",
					"title": name,
					"hide": true,
					"action_param": { workspace: url, },
					"action": function(Elem, subm, action_param){
						app_application_change_workspace(action_param.workspace);
					},
					"selected": false,
				};
				if(wrapper_localstorage.workspace == url){
					submenu_list['workspace']['_1_'+workspaces[i]['_id']].selected = true;
				}
			}
		}
	}
}

submenu_list['personal_info'] = {
	"_title": {
		"style": "customized_title",
		"title": Lincko.Translation.get('app', 55, 'html'), //User Profile
	},
	"left_button": {
		"style": "title_left_button",
		"title": Lincko.Translation.get('app', 25, 'html'), //Close
		'hide': true,
		"class": "base_pointer",
	},
	"_pre_action": {
		"style": "preAction",
		"action": function(Elem, subm){
			subm.focuson = false;
			subm.param_namecard = {};
			//Priority on current Workspaces, then shared Workspaces, then Users
			var val = Lincko.storage.get('users', subm.param);
			subm.param_namecard.id = false;
			subm.param_namecard.parent_id = subm.param;
			subm.param_namecard.username = val['-username'];
			if(val['-firstname']!=null){ subm.param_namecard.firstname = val['-firstname']; };
			if(val['-lastname']!=null){ subm.param_namecard.lastname = val['-lastname']; };
			if(Lincko.storage.getWORKID()>0){
				if(val['email']!=null){ subm.param_namecard.email = val['email']; };
			}
			var namecards = Lincko.storage.list('namecards', -1, null, 'users', subm.param);
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
	"profile_picture": {
		"style": "profile_photo",
		"title": "",
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
			//For shared workspace, do not update others
			if(!Lincko.storage.getWORKID() && wrapper_localstorage.uid!=subm.param_namecard.parent_id){
				return true;
			} else if(Lincko.storage.getWORKID() && wrapper_localstorage.uid!=subm.param_namecard.parent_id && !Lincko.storage.amIadmin()){
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
		"now": function(Elem, subm){
			if(wrapper_localstorage.uid!=subm.param_namecard.parent_id){
				if(!Lincko.storage.getWORKID() || !Lincko.storage.amIadmin()){
					Elem.find("[find=submenu_value]")
						.removeClass('selectable')
						.addClass('unselectable')
						.addClass('submenu_personal_input_readonly')
						.prop('readonly', true);
				}
			}
		},
	},
	"role": {
		"style": "next",
		"title": Lincko.Translation.get('app', 108, 'html'), //Role
		"next": "role_select",
		"action_param": {
			users_id: false,
			parent_type: 'workspaces',
			parent_id: -1,
		},
		"value": function(Elem, subm){
			var role = Lincko.storage.userRole(subm.param, 'workspaces', Lincko.storage.getWORKID());
			if(role['_id']==1){
				return Lincko.Translation.get('app', 111, 'html'); //Administrator
			} else if(role['_id']==2){
				return Lincko.Translation.get('app', 110, 'html'); //Teammate
			} else if(role['_id']==3){
				return Lincko.Translation.get('app', 109, 'html'); //Guest
			}
			return role['+name'];
		},
		"now": function(Elem, subm){
			this.action_param.users_id = subm.param;
			this.action_param.parent_id = Lincko.storage.getWORKID();
			grant = false;
			if(Lincko.storage.getWORKID()>0){
				var role = Lincko.storage.userRole(wrapper_localstorage.uid);
				if(role && role.perm_grant){
					grant = true;
				}
			}
			if(grant && Lincko.storage.getWORKID()>0 && Lincko.storage.canI('edit', 'workspaces', Lincko.storage.getWORKID()) && subm.param != wrapper_localstorage.uid){
				Elem.removeClass('display_none');
				submenu_role_build_list(subm.param, 'workspaces', Lincko.storage.getWORKID());
				var select_id = subm.id+"_"+md5(Math.random());
				var select_elem = Elem.find("[find=submenu_next_value]");
				select_elem.prop("id", select_id);
				app_application_lincko.add(select_id, "role_select_"+subm.param, function(){
					var Elem = this.action_param[0];
					var tab = this.action_param[1];
					var subm = this.action_param[2];
					if(typeof tab.value == 'function'){
						Elem.find("[find=submenu_next_value]").html(tab.value(Elem, subm));
					}
				}, [Elem, this, subm] );
			} else if(Lincko.storage.getWORKID()>0){
				Elem.find("[find=submenu_next_image]").addClass('display_none');
				Elem.find("[find=submenu_next_value]").addClass('submenu_personal_role_select_info');
				Elem.removeClass('display_none').addClass('submenu_personal_role_select_info').off('click');
			} else {
				Elem.off('click');
			}
		},
		"class": "display_none",
	},
	"personal_lincko": {
		"style": "button",
		"title": Lincko.Translation.get('app', 82, 'html'), //Create or Link a Lincko account
		"action": function(Elem, subm){
			submenu_Build('personal_lincko', subm.layer + 1, true, null, subm.preview);
		},
		"class": "submenu_deco_info_wrap submenu_deco_integration",
		"now": function(Elem, subm){
			if(wrapper_localstorage.uid!=subm.param_namecard.parent_id){
				Elem.addClass('display_none');
			} else {
				Elem.find("[find=submenu_button_value]").remove();
				var logo = $('<img>');
				logo.addClass('submenu_personal_integration_icon floatleft').prop("src", app_application_logo_lincko.src);
				var title = Elem.find("[find=submenu_button_title]").addClass("submenu_deco_info_wrap").empty().append(logo);
				var msg = Lincko.Translation.get('app', 82, 'html'); //Create or Link a Lincko account
				var integration = Lincko.storage.get('users', wrapper_localstorage.uid, 'integration');
				if(integration && typeof integration["lincko"] != "undefined"){
					msg = integration["lincko"];
					title.append(msg);
					title.addClass('submenu_deco_info submenu_personal_info_value');
					Elem.off('click');
				} else {
					title.append(msg);
					var next = $('<img>');
					next.addClass('submenu_icon submenu_icon_next floatright').prop("src", submenu_personal_next_icon.src);
					title.append(next);
					title.addClass('submenu_deco_pointer');
				}
			}
		},
	},
	"personal_integration_wechat": {
		"style": "button",
		"title": Lincko.Translation.get('app', 80, 'html'), //Attach my Wechat account 
		"action": function(Elem, subm){
			submenu_Build('personal_integration_wechat', subm.layer + 1, true, null, subm.preview);
		},
		"class": "submenu_deco_info_wrap submenu_deco_integration",
		"now": function(Elem, subm){
			if(wrapper_localstorage.uid!=subm.param_namecard.parent_id){
				Elem.addClass('display_none');
			} else {
				Elem.find("[find=submenu_button_value]").remove();
				var logo = $('<img>');
				logo.addClass('submenu_personal_integration_icon floatleft').prop("src", app_application_logo_wechat.src);
				var title = Elem.find("[find=submenu_button_title]").addClass("submenu_deco_info_wrap").empty().append(logo);
				var msg = Lincko.Translation.get('app', 80, 'html'); //Attach my Wechat account
				var integration = Lincko.storage.get('users', wrapper_localstorage.uid, 'integration');
				if(integration && typeof integration["wechat"] != "undefined"){
					msg = integration["wechat"];
					title.append(msg);
					title.addClass('submenu_deco_info submenu_personal_info_value');
					Elem.off('click');
				} else if(isMobileBrowser() || isMobileApp() || navigator.userAgent.match(/MicroMessenger/i)){ //We add the option because it's not convenient to register to wechat via a mobile or wechat itself
					title.addClass('submenu_deco_info submenu_personal_info_value');
					Elem.addClass('display_none');
					Elem.off('click');
				} else {
					title.append(msg);
					var next = $('<img>');
					next.addClass('submenu_icon submenu_icon_next floatright').prop("src", submenu_personal_next_icon.src);
					title.append(next);
					title.addClass('submenu_deco_pointer');
				}
			}
		},
	},
	"qrcode": {
		"style": "profile_info",
		"title": Lincko.Translation.get('app', 68, 'html'), //My QR code
		"class": "display_none",
		"value": function(Elem, subm){
			if(subm.param == wrapper_localstorage.uid && Lincko.storage.getWORKID()==0){
				var qrcode = $('<img>');
				qrcode.attr('src', Lincko.storage.generateMyQRcode());
				qrcode.addClass('submenu_personal_profile_picture');
				return qrcode;
			}
		},
		"now": function(Elem, subm){
			if(subm.param == wrapper_localstorage.uid && Lincko.storage.getWORKID()==0){
				Elem.removeClass('display_none');
			}
		},
	},
	"myurl": {
		"style": "button",
		"title": Lincko.Translation.get('app', 69, 'html'), //Copy My URL to the clipboard
		"class": "submenu_deco display_none",
		"now": function(Elem, subm){
			if(subm.param == wrapper_localstorage.uid && Lincko.storage.getWORKID()==0){
				Elem.removeClass('display_none');
				Elem.attr('data-clipboard-text', Lincko.storage.generateMyURL());
				var myurl = new Clipboard(Elem[0]);
				myurl.on('success', function(e) {
					base_show_error(Lincko.Translation.get('app', 70, 'html'), false); //URL copied to the clipboard
					e.clearSelection();
				});
				myurl.on('error', function(e) {
					base_show_error(Lincko.Translation.get('app', 71, 'html'), true); //Your system does not allow to copy to the clipboard
					e.clearSelection();
				});
				app_application_lincko.add(
					subm.id,
					'submenu_hide_'+subm.preview+'_'+subm.id,
					function(){
						var myurl = this.action_param;
						if(myurl){
							myurl.destroy();
						}
					},
					myurl
				);
			}
		},
	},
	"given_name": {
		"style": "profile_input",
		"title": Lincko.Translation.get('app', 48, 'html'), //Given Name
		"value": function(Elem, subm){
			var val = false;
			if(typeof subm.param_namecard.firstname != 'undefined'){
				val = subm.param_namecard.firstname;
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
			//For shared workspace, do not update others
			if(!Lincko.storage.getWORKID() && wrapper_localstorage.uid!=subm.param_namecard.parent_id){
				return true;
			} else if(Lincko.storage.getWORKID() && wrapper_localstorage.uid!=subm.param_namecard.parent_id && !Lincko.storage.amIadmin()){
				return true;
			}
			var timer = wrapper_timeout_timer*10;
			if(now){
				timer = 0;
			}
			if(val_new != subm.param_namecard.firstname){
				clearTimeout(submenu_profile_timer['firstname']);
				submenu_profile_timer['firstname'] = setTimeout(function(namecard){
					var val_old = namecard.firstname;
					namecard.firstname = val_new;
					if(!Lincko.storage.getWORKID()){
						wrapper_sendAction(
							{
								"id": namecard.parent_id,
								"firstname": val_new,
							},
							'post',
							'user/update',
							null,
							function(){
								namecard.firstname = val_old;
							}
						);
					} else {
						wrapper_sendAction(
							{
								"parent_id": namecard.parent_id,
								"firstname": val_new,
							},
							'post',
							'namecard/change',
							null,
							function(){
								namecard.firstname = val_old;
							}
						);
					}
				}, timer, subm.param_namecard);
			}
		},
		"now": function(Elem, subm){
			if(wrapper_localstorage.uid!=subm.param_namecard.parent_id){
				if(!subm.param_namecard.firstname){
					if(!Lincko.storage.getWORKID() || !Lincko.storage.amIadmin()){
						Elem.addClass('display_none');
					}
				} else {
					if(!Lincko.storage.getWORKID() || !Lincko.storage.amIadmin()){
						Elem.find("[find=submenu_value]")
							.removeClass('selectable')
							.addClass('unselectable')
							.addClass('submenu_personal_input_readonly')
							.prop('readonly', true);
					}
				}
			}
		},
	},
	"family_name": {
		"style": "profile_input",
		"title": Lincko.Translation.get('app', 49, 'html'), //Family Name
		"value": function(Elem, subm){
			var val = false;
			if(typeof subm.param_namecard.lastname != 'undefined'){
				val = subm.param_namecard.lastname;
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
			//For shared workspace, do not update others
			if(!Lincko.storage.getWORKID() && wrapper_localstorage.uid!=subm.param_namecard.parent_id){
				return true;
			} else if(Lincko.storage.getWORKID() && wrapper_localstorage.uid!=subm.param_namecard.parent_id && !Lincko.storage.amIadmin()){
				return true;
			}
			var timer = wrapper_timeout_timer*10;
			if(now){
				timer = 0;
			}
			if(val_new != subm.param_namecard.lastname){
				clearTimeout(submenu_profile_timer['lastname']);
				submenu_profile_timer['lastname'] = setTimeout(function(namecard){
					var val_old = namecard.lastname;
					namecard.lastname = val_new;
					if(!Lincko.storage.getWORKID()){
						wrapper_sendAction(
							{
								"id": namecard.parent_id,
								"lastname": val_new,
							},
							'post',
							'user/update',
							null,
							function(){
								namecard.lastname = val_old;
							}
						);
					} else {
						wrapper_sendAction(
							{
								"parent_id": namecard.parent_id,
								"lastname": val_new,
							},
							'post',
							'namecard/change',
							null,
							function(){
								namecard.lastname = val_old;
							}
						);
					}
				}, timer, subm.param_namecard);
			}
		},
		"now": function(Elem, subm){
			if(wrapper_localstorage.uid!=subm.param_namecard.parent_id){
				if(!subm.param_namecard.lastname){
					if(!Lincko.storage.getWORKID() || !Lincko.storage.amIadmin()){
						Elem.addClass('display_none');
					}
				} else {
					if(!Lincko.storage.getWORKID() || !Lincko.storage.amIadmin()){
						Elem.find("[find=submenu_value]")
							.removeClass('selectable')
							.addClass('unselectable')
							.addClass('submenu_personal_input_readonly')
							.prop('readonly', true);
					}
				}
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
			//For shared workspace, do not update others
			if(!Lincko.storage.getWORKID() && wrapper_localstorage.uid!=subm.param_namecard.parent_id){
				return true;
			} else if(Lincko.storage.getWORKID() && wrapper_localstorage.uid!=subm.param_namecard.parent_id && !Lincko.storage.amIadmin()){
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
		"now": function(Elem, subm){
			if(wrapper_localstorage.uid!=subm.param_namecard.parent_id){
				if(!subm.param_namecard.email){
					if(!Lincko.storage.getWORKID() || !Lincko.storage.amIadmin()){
						Elem.addClass('display_none');
					}
				} else {
					if(!Lincko.storage.getWORKID() || !Lincko.storage.amIadmin()){
						Elem.find("[find=submenu_value]")
							.removeClass('selectable')
							.addClass('unselectable')
							.addClass('submenu_personal_input_readonly')
							.prop('readonly', true);
					}
				}
			}
		},
	},
	"linkedin": {
		"style": "profile_input",
		"title": "LinkedIn",
		"value": function(Elem, subm){
			var val = false;
			if(typeof subm.param_namecard['-linkedin'] != 'undefined'){
				val = subm.param_namecard['-linkedin'];
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
			//For shared workspace, do not update others
			if(!Lincko.storage.getWORKID() && wrapper_localstorage.uid!=subm.param_namecard.parent_id){
				return true;
			} else if(Lincko.storage.getWORKID() && wrapper_localstorage.uid!=subm.param_namecard.parent_id && !Lincko.storage.amIadmin()){
				return true;
			}
			var timer = wrapper_timeout_timer*10;
			if(now){
				timer = 0;
			}
			if(val_new != subm.param_namecard['-linkedin']){
				clearTimeout(submenu_profile_timer['linkedin']);
				submenu_profile_timer['linkedin'] = setTimeout(function(namecard){
					var val_old = namecard['-linkedin'];
					namecard['-linkedin'] = val_new;
					wrapper_sendAction(
						{
							"parent_id": namecard.parent_id,
							"linkedin": val_new,
						},
						'post',
						'namecard/change',
						null,
						function(){
							namecard['-linkedin'] = val_old;
						}
					);
				}, timer, subm.param_namecard);
			}
		},
		"now": function(Elem, subm){
			if(wrapper_localstorage.uid!=subm.param_namecard.parent_id){
				if(!subm.param_namecard['-linkedin']){
					if(!Lincko.storage.getWORKID() || !Lincko.storage.amIadmin()){
						Elem.addClass('display_none');
					}
				} else {
					var namecard = subm.param_namecard;
					if(!Lincko.storage.getWORKID() || !Lincko.storage.amIadmin()){
						Elem.find("[find=submenu_value]")
							.removeClass('selectable')
							.addClass('unselectable')
							.addClass('submenu_personal_linkedin_readonly')
							.prop('readonly', true)
							.on('focus', function(event){
								event.stopPropagation();
								window.open(namecard['-linkedin'], "_blank");
								this.blur();
							});
						Elem
							.addClass('submenu_personal_url')
							.on('click', function(event){
								window.open(namecard['-linkedin'], "_blank");
							});
							
					}
				}
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
			//For shared workspace, do not update others
			if(!Lincko.storage.getWORKID() && wrapper_localstorage.uid!=subm.param_namecard.parent_id){
				return true;
			} else if(Lincko.storage.getWORKID() && wrapper_localstorage.uid!=subm.param_namecard.parent_id && !Lincko.storage.amIadmin()){
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
		"now": function(Elem, subm){
			if(wrapper_localstorage.uid!=subm.param_namecard.parent_id){
				if(!subm.param_namecard.phone){
					if(!Lincko.storage.getWORKID() || !Lincko.storage.amIadmin()){
						Elem.addClass('display_none');
					}
				} else {
					if(!Lincko.storage.getWORKID() || !Lincko.storage.amIadmin()){
						Elem.find("[find=submenu_value]")
							.removeClass('selectable')
							.addClass('unselectable')
							.addClass('submenu_personal_input_readonly')
							.prop('readonly', true);
					}
				}
			}
		},
	},
	"address": {
		"style": "profile_textarea",
		"title": Lincko.Translation.get('app', 105, 'html'), //Address
		"name": "address",
		"value": function(Elem, subm){
			var val = false;
			if(typeof subm.param_namecard.address != 'undefined'){
				val = subm.param_namecard.address;
			}
			if(!val){ return ""; }
			return val;
		},
		"class": "submenu_deco_read_personal_textarea",
		"action": function(Elem, subm, now, force){
			if(typeof now == "undefined"){ now = false; }
			if(typeof force == "undefined"){ force = false; }
			var val_new = Elem.find("[find=submenu_value]").html();
			val_new = $('<div>').text(php_br2nl(base_removeLineBreaks(val_new))).text();
			if(!force && val_new==""){
				return true;
			}
			//For shared workspace, do not update others
			if(!Lincko.storage.getWORKID() && wrapper_localstorage.uid!=subm.param_namecard.parent_id){
				return true;
			} else if(Lincko.storage.getWORKID() && wrapper_localstorage.uid!=subm.param_namecard.parent_id && !Lincko.storage.amIadmin()){
				return true;
			}
			var timer = wrapper_timeout_timer*10;
			if(now){
				timer = 0;
			}
			if(val_new != subm.param_namecard.address){
				clearTimeout(submenu_profile_timer['address']);
				submenu_profile_timer['address'] = setTimeout(function(namecard){
					var val_old = namecard.address;
					namecard.address = val_new;
					wrapper_sendAction(
						{
							"parent_id": namecard.parent_id,
							"address": val_new,
						},
						'post',
						'namecard/change',
						null,
						function(){
							namecard.address = val_old;
						}
					);
				}, timer, subm.param_namecard);
			}
		},
		"now": function(Elem, subm){
			if(wrapper_localstorage.uid!=subm.param_namecard.parent_id){
				if(!subm.param_namecard.address){
					if(!Lincko.storage.getWORKID() || !Lincko.storage.amIadmin()){
						Elem.addClass('display_none');
					}
				} else {
					if(!Lincko.storage.getWORKID() || !Lincko.storage.amIadmin()){
						Elem.find("[find=submenu_value]")
							.removeClass('selectable')
							.addClass('unselectable')
							.addClass('submenu_personal_textarea_readonly')
							.removeAttr('contenteditable')
							.prop('readonly', true);
					}
				}
			}
		},
	},
	"business": {
		"style": "profile_textarea",
		"title": Lincko.Translation.get('app', 107, 'html'), //Business information
		"name": "business",
		"value": function(Elem, subm){
			var val = false;
			if(typeof subm.param_namecard.business != 'undefined'){
				val = subm.param_namecard.business;
			}
			if(!val){ return ""; }
			return val;
		},
		"class": "submenu_deco_read_personal_textarea",
		"action": function(Elem, subm, now, force){
			if(typeof now == "undefined"){ now = false; }
			if(typeof force == "undefined"){ force = false; }
			var val_new = Elem.find("[find=submenu_value]").html();
			val_new = $('<div>').text(php_br2nl(base_removeLineBreaks(val_new))).text();
			if(!force && val_new==""){
				return true;
			}
			//For shared workspace, do not update others
			if(!Lincko.storage.getWORKID() && wrapper_localstorage.uid!=subm.param_namecard.parent_id){
				return true;
			} else if(Lincko.storage.getWORKID() && wrapper_localstorage.uid!=subm.param_namecard.parent_id && !Lincko.storage.amIadmin()){
				return true;
			}
			var timer = wrapper_timeout_timer*10;
			if(now){
				timer = 0;
			}
			if(val_new != subm.param_namecard.business){
				clearTimeout(submenu_profile_timer['business']);
				submenu_profile_timer['business'] = setTimeout(function(namecard){
					var val_old = namecard.business
					namecard.business = val_new;
					wrapper_sendAction(
						{
							"parent_id": namecard.parent_id,
							"business": val_new,
						},
						'post',
						'namecard/change',
						null,
						function(){
							namecard.business = val_old;
						}
					);
				}, timer, subm.param_namecard);
			}
		},
		"now": function(Elem, subm){
			if(wrapper_localstorage.uid!=subm.param_namecard.parent_id){
				if(!subm.param_namecard.business){
					if(!Lincko.storage.getWORKID() || !Lincko.storage.amIadmin()){
						Elem.addClass('display_none');
					}
				} else {
					if(!Lincko.storage.getWORKID() || !Lincko.storage.amIadmin()){
						Elem.find("[find=submenu_value]")
							.removeClass('selectable')
							.addClass('unselectable')
							.addClass('submenu_personal_textarea_readonly')
							.removeAttr('contenteditable')
							.prop('readonly', true);
					}
				}
			}
		},
	},
	"additional": {
		"style": "profile_textarea",
		"title": Lincko.Translation.get('app', 106, 'html'), //Additional information
		"name": "additional",
		"value": function(Elem, subm){
			var val = false;
			if(typeof subm.param_namecard.additional != 'undefined'){
				val = subm.param_namecard.additional;
			}
			if(!val){ return ""; }
			return val;
		},
		"class": "submenu_deco_read_personal_textarea",
		"action": function(Elem, subm, now, force){
			if(typeof now == "undefined"){ now = false; }
			if(typeof force == "undefined"){ force = false; }
			var val_new = Elem.find("[find=submenu_value]").html();
			val_new = $('<div>').text(php_br2nl(base_removeLineBreaks(val_new))).text();
			if(!force && val_new==""){
				return true;
			}
			//For shared workspace, do not update others
			if(!Lincko.storage.getWORKID() && wrapper_localstorage.uid!=subm.param_namecard.parent_id){
				return true;
			} else if(Lincko.storage.getWORKID() && wrapper_localstorage.uid!=subm.param_namecard.parent_id && !Lincko.storage.amIadmin()){
				return true;
			}
			var timer = wrapper_timeout_timer*10;
			if(now){
				timer = 0;
			}
			if(val_new != subm.param_namecard.additional){
				clearTimeout(submenu_profile_timer['additional']);
				submenu_profile_timer['additional'] = setTimeout(function(namecard){
					var val_old = namecard.additional
					namecard.additional = val_new;
					wrapper_sendAction(
						{
							"parent_id": namecard.parent_id,
							"additional": val_new,
						},
						'post',
						'namecard/change',
						null,
						function(){
							namecard.additional = val_old;
						}
					);
				}, timer, subm.param_namecard);
			}
		},
		"now": function(Elem, subm){
			if(wrapper_localstorage.uid!=subm.param_namecard.parent_id){
				if(!subm.param_namecard.additional){
					if(!Lincko.storage.getWORKID() || !Lincko.storage.amIadmin()){
						Elem.addClass('display_none');
					}
				} else {
					if(!Lincko.storage.getWORKID() || !Lincko.storage.amIadmin()){
						Elem.find("[find=submenu_value]")
							.removeClass('selectable')
							.addClass('unselectable')
							.addClass('submenu_personal_textarea_readonly')
							.removeAttr('contenteditable')
							.prop('readonly', true);
					}
				}
			}
		},
	},

	"message": {
		"style": "button",
		"title": Lincko.Translation.get('app', 54, 'html'), //Send a message
		"class": "submenu_deco",
		"action": function(Elem, subm){
			if(subm.param==wrapper_localstorage.uid || Lincko.storage.get('users', subm.param, '_visible')){
				submenu_chat_open_single(subm, subm.param);
			} else {
				var param = {
					exists: true,
					users_id: subm.param,
				}
				wrapper_sendAction(
					param,
					'post',
					'user/invite',
					null,
					null,
					function(){
						base_show_error(Lincko.Translation.get('app', 2309, 'js')); //Your invitation has been sent.
					}
				);
			}
		},
		"now": function(Elem, subm){
			if(subm.param!=wrapper_localstorage.uid && !Lincko.storage.get('users', subm.param, '_visible')){
				Elem.find("[find=submenu_button_title]").html(Lincko.Translation.get('app', 97, 'html')); //Send an invitation request
			}
		},
	},

	"delete": {
		"style": "profile_delete",
		"title": function(){
			if(Lincko.storage.getWORKID()>0){
				return Lincko.Translation.get('app', 2323, 'html'); //Leave the workspace
			} else {
				return Lincko.Translation.get('app', 22, 'html'); //Delete
			}
		},
		"name": "leave",
		"class": "submenu_personal_deletion display_none",
		"action": function(Elem, subm){
			if(Lincko.storage.getWORKID()>0){
				if(Lincko.storage.canI('edit', 'workspaces', Lincko.storage.getWORKID())){
					var param = {};
					param[subm.param] = false; //Remove the user from the workspace
					submenu_Hideall(subm.preview);
					var username = Lincko.storage.get('users', subm.param, 'username');
					wrapper_sendAction(
						{
							"id": Lincko.storage.getWORKID(),
							"users>access": param,
						},
						'post',
						'workspace/update',
						function(){
							base_show_error(Lincko.Translation.get('app', 101, 'html', {username: username}), false); //[{username}] has been removed from the workspace
						}
					);
				}
			} else {
				if(subm.param != wrapper_localstorage.uid){
					var param = {};
					param[subm.param] = false; //Remove the user from the contact list
					submenu_Hideall(subm.preview);
					var username = Lincko.storage.get('users', subm.param, 'username');
					wrapper_sendAction(
						{
							"id": wrapper_localstorage.uid,
							"users>access": param,
						},
						'post',
						'user/update',
						function(){
							base_show_error(Lincko.Translation.get('app', 100, 'html', {username: username}), false); //[{username}] has been deleted from your contact list
						}
					);
				}
			}
		},
		"now": function(Elem, subm){
			if(Lincko.storage.getWORKID()>0 && (subm.param == wrapper_localstorage.uid || Lincko.storage.canI('edit', 'workspaces', Lincko.storage.getWORKID()))){ //A super user for workspace
				Elem.removeClass('display_none');
			}
		},
	},

	"space": {
		"style": "space",
		"title": "space",
		"value": 80,
	},
};

submenu_list['role_select'] = {
	"_title": {
		"style": "customized_title",
		"title": function(subm){
			var username = Lincko.storage.get('users', subm.param.users_id, 'username');
			if(username){
				return Lincko.Translation.get('app', 108, 'html')+' ('+username+')';
			}
			return Lincko.Translation.get('app', 108, 'html');
		},
	},
	"left_button": {
		"style": "title_left_button",
		"title": Lincko.Translation.get('app', 25, 'html'), //Close
		'hide': true,
		"class": "base_pointer",
	},
};

var submenu_role_build_list = function(users_id, category, id){
	var name;
	var roles = Lincko.storage.list('roles');
	var current_role = Lincko.storage.userRole(users_id, category, id);
	for(var i in submenu_list['role_select']){
		if(i.indexOf('role_')===0){
			delete submenu_list['role_select'][i];
		}
	}
	//List first Workspaces' workspace
	for(var i in roles){
		name = roles[i]['+name'];
		if(roles[i]['_id']==1){
			name = Lincko.Translation.get('app', 111, 'html'); //Administrator
		} else if(roles[i]['_id']==2){
			name = Lincko.Translation.get('app', 110, 'html'); //Teammate
		} else if(roles[i]['_id']==3){
			name = Lincko.Translation.get('app', 109, 'html'); //Guest
		}
		if(typeof submenu_list['role_select']['role_'+roles[i]['_id']] == 'undefined'){
			submenu_list['role_select']['role_'+roles[i]['_id']] = {
				"style": "radio",
				"title": name,
				"action_param": {
					users_id: users_id,
					roles_id: roles[i]['_id'],
				},
				"action": function(Elem, subm, action_param){
					var perm = Lincko.storage.get(subm.param.parent_type, subm.param.parent_id, '_perm');
					if(perm[action_param.users_id] && typeof perm[action_param.users_id][1] != 'undefined' && perm[action_param.users_id][1]!=action_param.roles_id){
						perm[action_param.users_id][0] = 0;
						perm[action_param.users_id][1] = action_param.roles_id;
						for(var i in submenu_list['role_select']){
							if(i.indexOf('role_')===0){
								if(i=='role_'+action_param.roles_id){
									submenu_list['role_select'][i].selected = true;
								} else {
									submenu_list['role_select'][i].selected = false;
								}
							}
						}
						app_application_lincko.prepare(["form_radio", "role_select_"+action_param.users_id], true);
						wrapper_sendAction(
							{
								"id": action_param.users_id,
								"parent_type": subm.param.parent_type,
								"parent_id": subm.param.parent_id,
								"role_id": action_param.roles_id,
							},
							'post',
							'user/role'
						);
					}
				},
				"selected": false,
			};
			if(roles[i]['_id'] == current_role['_id']){
				submenu_list['role_select']['role_'+roles[i]['_id']].selected = true;
			}
		}
	}
};

submenu_list['personal_lincko'] = {
	"_title": {
		"style": "customized_title",
		"title": Lincko.Translation.get('app', 82, 'html'), //Create or Link a Lincko account
	},
	"left_button": {
		"style": "title_left_button",
		"title": Lincko.Translation.get('app', 25, 'html'), //Close
		'hide': true,
		"class": "base_pointer",
	},
	"info": {
		"style": "info",
		"title": Lincko.Translation.get('app', 87, 'html'), //Enter the Email and Password of the Lincko account that you want to link.
		"class": "submenu_deco_info submenu_deco_info_wrap",
		"now": function(Elem, subm){
			Elem.find("[find=submenu_info_title]").addClass("submenu_deco_info_wrap");
		},
	},
	"email": {
		"style": "input_text",
		"title": Lincko.Translation.get('app', 85, 'html')+"<span find='email_check' class='display_none submenu_personal_personal_lincko_email_check'>("+Lincko.Translation.get('app', 96, 'html')+")</span>", //Email (Please ensure your e-mail format is correct)
		"name": "email",
		"value": "",
		"class": "submenu_input_text",
		"now": function(Elem, subm){
			Elem.find("[find=submenu_input]").attr("autocomplete", "off").val('');
			if(subm.param){
				Elem.find("[find=submenu_input]").val(subm.param);
			}
			Elem.on("keypress", subm, function(e) {
				e.stopPropagation();
				if((e.which || e.keyCode) == 13){
					Elem.blur();
				}
			});

			var link_timer;
			var email_previous = false;
			Elem.find("[find=submenu_input]").on('keyup past cut focus change copy blur', subm, function(event){
				var email = $(this).val();
				if(email == email_previous){
					return true;
				}
				var submenu_wrapper = event.data.Wrapper();
				if(base_input_field.email.valid(email)){
					var time = 1000;
					if(event.type=='blur' || event.type=='focus' || event.type=='change'){
						time = 0;
					}
					clearTimeout(link_timer);
					link_timer = setTimeout(function(){
						email_previous = email;
						if(submenu_wrapper.length>0){
							submenu_wrapper.find("[find=link_loading]").removeClass('display_none');
							submenu_wrapper.find("[find=submenu_button_title]").addClass('display_none');
							wrapper_sendAction({email: email}, 'post', 'email/exists', function(msg, err, status, data){
								if(submenu_wrapper.length>0){
									if(typeof data['exists'] == 'boolean' && data['exists']){
										submenu_wrapper.find("[find=submenu_button_title]").removeClass('create').html(Lincko.Translation.get('app', 84, 'html')); //Link
									} else {
										submenu_wrapper.find("[find=submenu_button_title]").addClass('create').html(Lincko.Translation.get('app', 41, 'html')); //Create
									}
									submenu_wrapper.find("[find=submenu_button_title]").removeClass('display_none submenu_personal_link_button_active default');
									submenu_wrapper.find("[find=link_loading]").addClass('display_none');
								}
							});
						}
					}, time, email, submenu_wrapper);
				} else {
					email_previous = email;
					submenu_wrapper.find("[find=submenu_button_title]").addClass('display_none submenu_personal_link_button_active default');
					submenu_wrapper.find("[find=link_loading]").addClass('display_none');
				}
			});
			Elem.find("[find=submenu_input]").focus();
			
			var email_check = Elem.find("[find=email_check]");
			if(email_check.length>0){
				//This help to clear the email field if there was an autocompletion issue (sometime chrome does keep empty after autocompletion, the yellow backgroubd effect)
				Elem.find("[find=submenu_input]").on('blur', email_check, function(event){
					var email = $(this).val();
					if(base_input_field.email.valid(email)){
						var email_check = event.data;
						wrapper_sendAction({email: email}, 'post', 'email/verify', function(msg, err, status, data){
							if(err){
								email_check.removeClass('display_none');
							}
						});
						
					}
				});
				Elem.find("[find=submenu_input]").on('keyup past cut', email_check, function(event){
					event.data.addClass('display_none');
				});
			}
			
		},
	},
	"password": {
		"style": "input_password",
		"title": Lincko.Translation.get('app', 86, 'html'), //Password
		"name": "password",
		"value": "",
		"class": "submenu_input_text",
		"now": function(Elem, subm){
			Elem.find("[find=submenu_input]").attr("autocomplete", "off").val('');
			Elem.on("keypress", subm, function(e) {
				e.stopPropagation();
				if((e.which || e.keyCode) == 13){
					Elem.blur();
				}
			});
			Elem.find("[find=submenu_input]").on('keyup past cut focus change copy blur', subm, function(event){
				var submenu_wrapper = event.data.Wrapper();
				submenu_wrapper.find("[name=email]").trigger('change');
			});
		},
	},
	"link": {
		"style": "profile_button_link",
		"title": Lincko.Translation.get('app', 41, 'html'), //Create
		"name": "link",
		"class": "submenu_personal_link",
		"action": function(Elem, subm) {
			var subm_Elem = subm.Wrapper();
			var that_Elem = Elem;

			var list = {
				'email': subm_Elem.find("[name=email]").val(),
				'password': subm_Elem.find("[name=password]").val(),
			};
			for(var i in list){
				if(typeof base_input_field[i] == 'object'){
					if(typeof base_input_field[i].valid == "function" && typeof base_input_field[i].error_msg == "function"){
						if(!base_input_field[i].valid(list[i])){
							var data = base_input_field[i].error_msg();
							if(!base_input_field[i].hide && typeof base_show_error == 'function'){
								base_show_error(data.msg, true);
							}
							return false; //Do not launch the sendAction
						}
					}
				}
			}

			wrapper_sendAction(
				{
					email: list['email'],
					password: list['password'],
				},
				'post',
				'user/link_to',
				function(data) {
					Lincko.storage.getLatest(true);
				},
				null,
				function(jqXHR, settings, temp_id) {
					that_Elem.find("[find=submenu_button_title]").addClass("submenu_personal_link_button_active").removeClass('default');
					base_showProgress(that_Elem);
				},
				function(){
					that_Elem.find("[find=submenu_button_title]").removeClass("submenu_personal_link_button_active");
					base_hideProgress(that_Elem);
				}
			);
		},
		"now": function(Elem, subm){
			Elem.find("[find=submenu_button_title]").prop("id", subm.id+"_link").addClass('display_none create');
			//Add loading bar
			var loading_bar = $("#-submit_progress_bar").clone();
			loading_bar.prop('id', '');
			Elem.append(loading_bar);
			var link_loading = $('<img find="link_loading" class="submenu_personal_link_loading display_none">');
			link_loading.prop('src', app_application_loading_bar.src);
			Elem.prepend(link_loading);
		},
	},
	"post_action": {
		"style": "postAction",
		"action": function(Elem, subm){
			base_format_form();
			subm.Wrapper().find("[name=email]").trigger('change');
		},
	},
	"space": {
		"style": "space",
		"title": "space",
		"value": 80,
	},
};






//NOTIFICATION because we won't support WeChat in November 2018
submenu_list['personal_wechat_close'] = {
	"_title": {
		"style": "customized_title",
		"title": Lincko.Translation.get('app', 127, 'html'), //Important notification
	},
	"left_button": {
		"style": "title_left_button",
		"title": Lincko.Translation.get('app', 25, 'html'), //Close
		'hide': true,
		"class": "base_pointer",
	},
	"info": {
		"style": "info",
		"title": "<img find='wechat_logo' class='submenu_personal_wechat_close_img visibility_hidden' src='' />"+Lincko.Translation.get('app', 126, 'js'), //Please note that all WeChat features will no longer be supported by Lincko starting from October 1st 2018. Please note that all WeChat features will no longer be supported by Lincko starting from October 1st 2018.
		"class": "submenu_deco_info submenu_deco_info_wrap submenu_personal_wechat_close_info",
		"now": function(Elem, subm){
			Elem.find("[find=submenu_info_title]").addClass("submenu_deco_info_wrap");
		},
	},
	"post_action": {
		"style": "postAction",
		"action": function(Elem, subm){
			base_format_form();
			subm.Wrapper().find("[name=email]").trigger('change');
			subm.Wrapper().find("[find=wechat_logo]").removeClass("visibility_hidden").attr("src", app_application_logo_wechat.src);
		},
	},
};
submenu_list['personal_wechat_close']['email'] = submenu_list['personal_lincko']['email'];
submenu_list['personal_wechat_close']['password'] = submenu_list['personal_lincko']['password'];
submenu_list['personal_wechat_close']['link'] = submenu_list['personal_lincko']['link'];
submenu_list['personal_wechat_close']['space'] = submenu_list['personal_lincko']['space'];

var submenu_personal_wechat_close_interval = setInterval(function(){
	if(typeof onboarding != "undefined" && onboarding.on){
		//Do nothing while onboarding
		return true;
	}
	var integration = Lincko.storage.get('users', wrapper_localstorage.uid, 'integration');
	if(integration && typeof integration["lincko"] == "undefined"){
		if(!submenu_get('personal_wechat_close')){
			submenu_Build('personal_wechat_close', 1, false);
		}
	} else {
		clearInterval(submenu_personal_wechat_close_interval);
	}
}, 5000);







submenu_list['personal_integration_wechat'] = {
	"_title": {
		"style": "customized_title",
		"title": Lincko.Translation.get('app', 80, 'html'), //Attach my Wechat account 
	},
	"left_button": {
		"style": "title_left_button",
		"title": Lincko.Translation.get('app', 25, 'html'), //Close
		'hide': true,
		"class": "base_pointer",
	},
	"qrcode": {
		"style": "profile_info",
		"title": Lincko.Translation.get('app', 83, 'html'), //Scan the QR code with your Wechat account and enter your password.
		"value": function(){
			var qrcode = $('<img>');
			qrcode.attr('src', Lincko.storage.generateLinkQRcode('wechat'));
			qrcode.addClass('submenu_personal_profile_picture');
			return qrcode;
		},
		"class": "personal_integration_wechat_qrcode",
	},
	"space": {
		"style": "space",
		"title": "space",
		"value": 80,
	},
};

Submenu_select.profile_next = function(subm) {
	subm.Add_ProfileNext();
};

Submenu_select.profile_photo = function(subm) {
	subm.Add_ProfilePhoto();
};

Submenu_select.profile_input = function(subm) {
	subm.Add_ProfileInput();
};

Submenu_select.profile_textarea = function(subm) {
	subm.Add_ProfileTextarea();
},

Submenu_select.profile_info = function(subm) {
	subm.Add_ProfileInfo();
};

Submenu_select.profile_button_link = function(subm){
	subm.Add_ButtonLink(subm);
};

Submenu_select.profile_delete = function(subm){
	subm.Add_ProfileDelete(subm);
};

Submenu.prototype.Add_ProfileDelete = function(subm) {
	var that = this;
	var submenu_wrapper = this.Wrapper();
	var attribute = this.attribute;
	var Elem = $('#-submenu_button').clone();
	var preview = this.preview;
	Elem.prop("id", '');
	Elem.find("[find=submenu_button_title]").addClass("submenu_personal_deletion_button").html(attribute.title);
	Elem.find("[find=submenu_button_value]").recursiveRemove();
	if ("action" in attribute) {
		if (!("action_param" in attribute)) {
			attribute.action_param = null;
		}
		Elem.find("[find=submenu_button_title]").click(attribute.action_param, function(event){
			attribute.action(Elem, that, event.data);
		});
	}
	if ("class" in attribute) {
		Elem.addClass(attribute['class']);
	}
	if ("now" in attribute && typeof attribute.now == "function") {
		attribute.now(Elem, that);
	}
	submenu_wrapper.find("[find=submenu_wrapper_content]").append(Elem);
	//submenu_wrapper = null; //In some places it bugs because it's used in a lower scope
	delete submenu_wrapper;
	return Elem;
};

var submenu_profile_timer = [];

Submenu.prototype.Add_ButtonLink = function(subm) {
	var that = this;
	var submenu_wrapper = this.Wrapper();
	var attribute = this.attribute;
	var Elem = $('#-submenu_button').clone();
	var preview = this.preview;
	Elem.prop("id", '');
	Elem.find("[find=submenu_button_title]").addClass("submenu_personal_link_button").html(attribute.title);
	Elem.find("[find=submenu_button_value]").recursiveRemove();
	if ("action" in attribute) {
		if (!("action_param" in attribute)) {
			attribute.action_param = null;
		}
		Elem.find("[find=submenu_button_title]").click(attribute.action_param, function(event){
			attribute.action(Elem, that, event.data);
		});
	}
	if ("class" in attribute) {
		Elem.addClass(attribute['class']);
	}
	if ("now" in attribute && typeof attribute.now == "function") {
		attribute.now(Elem, that);
	}
	submenu_wrapper.find("[find=submenu_wrapper_content]").append(Elem);
	delete submenu_wrapper;
	return Elem;
};

Submenu.prototype.Add_ProfileInput = function() {
	var that = this;
	var attribute = this.attribute;
	var Elem = $('#-submenu_app_personal_input').clone();
	var preview = this.preview;
	Elem.prop("id", '');
	if ("class" in attribute) {
		Elem.addClass(attribute['class']);
	}
	Elem.find("[find=submenu_title]").html(attribute.title);
	if ("value" in attribute) {
		if(typeof attribute.value == "function"){
			var value = attribute.value(Elem, that);
			Elem.find("[find=submenu_value]").val(value);
		} else {
			Elem.find("[find=submenu_value]").val(attribute.value);
		}
	}

	if ("action" in attribute) {
		if (!("action_param" in attribute)) {
			attribute.action_param = null;
		}
		Elem.find("[find=submenu_value]").on({
			focus: function(){ attribute.action(Elem, that) },
			blur: function(){ attribute.action(Elem, that, true, true) },
			change: function(){ attribute.action(Elem, that) },
			copy: function(){ attribute.action(Elem, that) },
			paste: function(){ attribute.action(Elem, that, true) },
			cut: function(){ attribute.action(Elem, that, true) },
			keyup: function(e) {
				if (e.which != 13) {
					attribute.action(Elem, that);
				} else {
					attribute.action(Elem, that, true, true);
				}
			},
		});
	}
	Elem.on('click', function(){
		Elem.find("[find=submenu_value]").focus();
	});
	if ("now" in attribute && typeof attribute.now == "function") {
		attribute.now(Elem, that);
	}
	this.Wrapper().find("[find=submenu_wrapper_content]").append(Elem);
	return true;
}

Submenu.prototype.Add_ProfileTextarea = function() {
	var that = this;
	var attribute = this.attribute;
	var Elem = $('#-submenu_app_personal_textarea').clone();
	var preview = this.preview;
	Elem.prop("id", '');
	if ("class" in attribute) {
		Elem.addClass(attribute['class']);
	}
	Elem.find("[find=submenu_title]").html(attribute.title);
	if ("value" in attribute) {
		if(typeof attribute.value == "function"){
			var value = attribute.value(Elem, that);
			value = php_nl2br(value);
			Elem.find("[find=submenu_value]").html(value);
		} else {
			value = php_nl2br(attribute.value);
			Elem.find("[find=submenu_value]").html(value);
		}
	}

	if ("action" in attribute) {
		if (!("action_param" in attribute)) {
			attribute.action_param = null;
		}
		Elem.find("[find=submenu_value]").on({
			focus: function(){ attribute.action(Elem, that) },
			blur: function(){ attribute.action(Elem, that, true, true) },
			change: function(){ attribute.action(Elem, that) },
			copy: function(){ attribute.action(Elem, that) },
			paste: function(){ attribute.action(Elem, that, true) },
			cut: function(){ attribute.action(Elem, that, true) },
			keyup: function(e) {
				if (e.which != 13) {
					attribute.action(Elem, that);
				} else {
					attribute.action(Elem, that, true, true);
				}
			},
		});
	}
	if ("now" in attribute && typeof attribute.now == "function") {
		attribute.now(Elem, that);
	}
	Elem.on('click', function(){
		Elem.find("[find=submenu_value]").focus();
	});
	this.Wrapper().find("[find=submenu_wrapper_content]").append(Elem);
	return true;
}

var submenu_app_personal_temp_id = false;
var submenu_app_personal_garbage = app_application_garbage.add();
app_application_lincko.add(submenu_app_personal_garbage, 'users_'+wrapper_localstorage.uid, function() {
	submenu_app_personal_temp_id = false;
});

Submenu.prototype.Add_ProfileNext = function() {
	var perso = Lincko.storage.get('users', wrapper_localstorage.uid);
	var that = this;
	var attribute = this.attribute;
	var Elem = $('#-submenu_app_personal_next').clone();
	var preview = this.preview;
	var range = ['users_'+wrapper_localstorage.uid, 'upload'];
	Elem.prop("id", '');
	if ("action" in attribute) {
		if (!("action_param" in attribute)) {
			attribute.action_param = null;
		}
		Elem.click(attribute.action_param, function(event){
			attribute.action(Elem, that, event.data);
		});
	}
	if ("class" in attribute) {
		Elem.addClass(attribute['class']);
	}
	var Elem_pic = Elem.find("[find=submenu_next_upload_picture]");
	Elem_pic
		.attr("preview", "0")
		.prop("id", that.id+"_submenu_next_upload_picture")
		.css('background-image','url("'+app_application_icon_single_user.src+'")');
	if(perso['profile_pic'] && $.isNumeric(perso['profile_pic'])){
		var src = Lincko.storage.getLinkThumbnail(perso['profile_pic']);
		if(src){
			Elem_pic.css('background-image','url("'+src+'")');
		}
	}
	Elem.click(function(){
		submenu_Build("personal_info", that.layer + 1, true, wrapper_localstorage.uid, that.preview);
	});
	Elem_pic.click(function(event){
		event.stopPropagation();
		submenu_app_personal_temp_id = app_upload_open_photo_single('users', wrapper_localstorage.uid, false, true);
	});

	app_application_lincko.add(that.id+"_submenu_next_upload_picture", range, function() {
		var Elem_pic = $("#"+this.id);
		var file = [];
		if(this.action_param == wrapper_localstorage.uid && submenu_app_personal_temp_id){
			file = Lincko.storage.list('files', 1, {temp_id:submenu_app_personal_temp_id,});
		}
		if(file.length==1){
			var file_id = file[0]['_id'];
			var src = Lincko.storage.getLinkThumbnail(file_id);
			if(src){
				Elem_pic
					.css('background-image','url("'+src+'")')
					.attr("preview", "0");
			}
		} else if(submenu_app_personal_temp_id===false){
			var perso = Lincko.storage.get('users', this.action_param);
			if(perso["profile_pic"]){
				var src = Lincko.storage.getLinkThumbnail(perso["profile_pic"]);
				if(src){
					Elem_pic.css('background-image','url("'+src+'")');
				}
			}
		} else if(this.action_param == wrapper_localstorage.uid){
			var data = false;
			for(var i in app_upload_files.lincko_files){
				if(app_upload_files.lincko_files[i].lincko_temp_id == submenu_app_personal_temp_id){
					data = app_upload_files.lincko_files[i];
					Elem_pic.attr("preview", "0");
					break;
				}
			}
			if(data){
				if(data.files[0].preview && Elem_pic.attr("preview")=="0"){
					if(typeof data.files[0].preview.tagName !== 'undefined' && data.files[0].preview.tagName.toLowerCase() === 'canvas'){
						Elem_pic
							.css('background-image','url("'+data.files[0].preview.toDataURL()+'")')
							.attr("preview", "1");
					}
				}
			}
		}
	}, wrapper_localstorage.uid);
	

	Elem.find("[find=submenu_next_user]").html(wrapper_to_html(perso['-username']));
	
	Elem.find("[find=submenu_next_user]").prop("id", this.id+"_submenu_next_user");
	app_application_lincko.add(this.id+"_submenu_next_user", "users_"+wrapper_localstorage.uid, function() {
		var username = Lincko.storage.get('users',  wrapper_localstorage.uid, "username");
		$("#"+this.id).html(wrapper_to_html(username));
	});

	this.Wrapper().find("[find=submenu_wrapper_content]").append(Elem);
	return true;
}


Submenu.prototype.Add_ProfilePhoto = function() {
	var users_id = this.param;
	var perso = Lincko.storage.get('users', users_id);
	var that = this;
	var attribute = this.attribute;
	var Elem = $('#-submenu_app_personal_profile').clone();
	var preview = this.preview;
	var range = 'users_'+users_id;
	var temp_id = false;
	Elem.prop("id", '');
	if ("class" in attribute) {
		Elem.addClass(attribute['class']);
	}
	if ("value" in attribute) {
		if(typeof attribute.value == "function"){
			var value = attribute.value(Elem, that);
			Elem.find("[find=submenu_profile_user]").html(value);
		} else {
			Elem.find("[find=submenu_profile_user]").html(attribute.value);
		}
	}
	if ("now" in attribute && typeof attribute.now == "function") {
		attribute.now(Elem, that);
	}
	var Elem_pic = Elem.find("[find=submenu_profile_upload_picture]");
	Elem_pic
		.attr("preview", "0")
		.prop("id", that.id+"_submenu_profile_upload_picture")
		.css('background-image','url("'+app_application_icon_single_user.src+'")');
	if(perso['profile_pic'] && $.isNumeric(perso['profile_pic'])){
		var src = Lincko.storage.getLinkThumbnail(perso['profile_pic']);
		if(src){
			Elem_pic.css('background-image','url("'+src+'")');
		} 
	} else if(users_id==0){ //LinckoBot
		Elem_pic.css('background-image','url("'+app_application_icon_roboto.src+'")');
	} else if(users_id==1){ //Monkey King
		Elem_pic.css('background-image','url("'+app_application_icon_monkeyking.src+'")');
	}

	if(users_id == wrapper_localstorage.uid){
		range = ['users_'+users_id, 'upload'];
		Elem_pic.click(function(event){
			event.stopPropagation();
			submenu_app_personal_temp_id = app_upload_open_photo_single('users', wrapper_localstorage.uid, false, true);
		});
	} else {
		Elem_pic.addClass("no_shadow");
	}

	app_application_lincko.add(that.id+"_submenu_profile_upload_picture", range, function() {
		var Elem_pic = $("#"+this.id);
		var file = [];
		if(this.action_param == wrapper_localstorage.uid && submenu_app_personal_temp_id){
			file = Lincko.storage.list('files', 1, {temp_id:submenu_app_personal_temp_id,});
		}
		if(file.length==1){
			var file_id = file[0]['_id'];
			var src = Lincko.storage.getLinkThumbnail(file_id);
			if(src){
				Elem_pic
					.css('background-image','url("'+src+'")')
					.attr("preview", "0");
			}
		} else if(submenu_app_personal_temp_id===false){
			var perso = Lincko.storage.get('users', this.action_param);
			if(perso["profile_pic"]){
				var src = Lincko.storage.getLinkThumbnail(perso["profile_pic"]);
				if(src){
					Elem_pic.css('background-image','url("'+src+'")');
				}
			} else if(this.action_param==0){ //LinckoBot
				Elem_pic.css('background-image','url("'+app_application_icon_roboto.src+'")');
			} else if(this.action_param==1){ //Monkey King
				Elem_pic.css('background-image','url("'+app_application_icon_monkeyking.src+'")');
			}
		} else if(this.action_param == wrapper_localstorage.uid){
			var data = false;
			for(var i in app_upload_files.lincko_files){
				if(app_upload_files.lincko_files[i].lincko_temp_id == submenu_app_personal_temp_id){
					data = app_upload_files.lincko_files[i];
					Elem_pic.attr("preview", "0");
					break;
				}
			}
			if(data){
				if(data.files[0].preview && Elem_pic.attr("preview")=="0"){
					if(typeof data.files[0].preview.tagName !== 'undefined' && data.files[0].preview.tagName.toLowerCase() === 'canvas'){
						Elem_pic
							.css('background-image','url("'+data.files[0].preview.toDataURL()+'")')
							.attr("preview", "1");
					}
				}
			}
		}
	}, users_id);
	
	this.Wrapper().find("[find=submenu_wrapper_content]").append(Elem);
	return true;
}

Submenu.prototype.Add_ProfileInfo = function() {
	var that = this;
	var attribute = this.attribute;
	var Elem = $('#-submenu_app_personal_info').clone();
	var preview = this.preview;
	Elem.prop("id", '');
	if ("class" in attribute) {
		Elem.addClass(attribute['class']);
	}
	if ("action" in attribute) {
		if (!("action_param" in attribute)) {
			attribute.action_param = null;
		}
		Elem.click(attribute.action_param, function(event){
			attribute.action(Elem, that, event.data);
		});
	}
	if ("now" in attribute && typeof attribute.now == "function") {
		attribute.now(Elem, that);
	}
	Elem.find("[find=submenu_title]").html(attribute.title);
	if ("value" in attribute) {
		if(typeof attribute.value == "function"){
			var value = attribute.value(Elem, that);
			Elem.find("[find=submenu_value]").html(value);
		} else {
			Elem.find("[find=submenu_value]").html(attribute.value);
		}
	}
	
	this.Wrapper().find("[find=submenu_wrapper_content]").append(Elem);
	return true;
}

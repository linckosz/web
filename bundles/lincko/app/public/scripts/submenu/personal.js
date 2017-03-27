submenu_list['personal_settings'] = {
	"_title": {
		"style": "customized_title",
		"title": Lincko.Translation.get('app', 46, 'html'), //Personal Settings
	},
	"left_button": {
		"style": "title_left_button",
		"title": Lincko.Translation.get('app', 25, 'html'), //Close
		'hide': true,
		"class": "base_pointer",
	},
	"profile_picture": {
		"style": "profile_photo",
		"title": "",
	},
	"nickname": {
		"style": "profile_input",
		"title": Lincko.Translation.get('app', 47, 'html'), //Nickname
		"value": function(){
			var val = Lincko.storage.get('users', wrapper_localstorage.uid, 'username');
			if(!val){ return ""; }
			return wrapper_to_html(val);
		},
		"action": function(Elem, subm, now, force){
			if(typeof now == "undefined"){ now = false; }
			if(typeof force == "undefined"){ force = false; }
			var val_old = Lincko.storage.get('users', wrapper_localstorage.uid, 'username');
			var val_new = Elem.find("[find=submenu_value]").val();
			if(!force && val_new==""){
				return true;
			}
			var timer = wrapper_timeout_timer*10;
			if(now){
				timer = 0;
			}
			if(val_new != val_old){
				clearTimeout(submenu_profile_timer['username']);
				submenu_profile_timer['username'] = setTimeout(function(){
					wrapper_sendAction(
						{
							"id": wrapper_localstorage.uid,
							"username": val_new,
						},
						'post',
						'user/update'
					);
				}, timer);
			}
		},
	},
	"personal_lincko": {
		"style": "button",
		"title": Lincko.Translation.get('app', 82, 'html'), //Create or Link a Lincko account
		"action": function(Elem, subm){
			submenu_Build('personal_lincko', subm.layer + 1, true, null, subm.preview);
		},
		"class": "submenu_deco_info_wrap submenu_deco_integration",
		"now": function(Elem, subm){
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
		},
	},
	"qrcode": {
		"style": "profile_info",
		"title": Lincko.Translation.get('app', 68, 'html'), //My QR code
		"value": function(){
			var qrcode = $('<img>');
			qrcode.attr('src', Lincko.storage.generateMyQRcode());
			qrcode.addClass('submenu_personal_profile_picture');
			return qrcode;
		},
	},
	"myurl": {
		"style": "button",
		"title": Lincko.Translation.get('app', 69, 'html'), //Copy My URL to the clipboard
		"class": "submenu_deco submenu_deco_info_wrap display_none",
		"now": function(Elem, subm){
			Elem.removeClass('display_none');
			Elem.find("[find=submenu_button_value]").remove();
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
	"given_name": {
		"style": "profile_input",
		"title": Lincko.Translation.get('app', 48, 'html'), //Given Name
		"input": "firstname",
		"value": function(){
			var val = Lincko.storage.get('users', wrapper_localstorage.uid, 'firstname');
			if(!val){ return ""; }
			return wrapper_to_html(val);
		},
		"action": function(Elem, subm, now, force){
			if(typeof now == "undefined"){ now = false; }
			if(typeof force == "undefined"){ force = false; }
			var val_old = Lincko.storage.get('users', wrapper_localstorage.uid, 'firstname');
			var val_new = Elem.find("[find=submenu_value]").val();
			if(!force && val_new==""){
				return true;
			}
			var timer = wrapper_timeout_timer*10;
			if(now){
				timer = 0;
			}
			if(val_new != val_old){
				clearTimeout(submenu_profile_timer['firstname']);
				submenu_profile_timer['firstname'] = setTimeout(function(){
					wrapper_sendAction(
						{
							"id": wrapper_localstorage.uid,
							"firstname": val_new,
						},
						'post',
						'user/update'
					);
				}, timer);
			}
		},
	},
	"family_name": {
		"style": "profile_input",
		"title": Lincko.Translation.get('app', 49, 'html'), //Family Name
		"input": "lastname",
		"value": function(){
			var val = Lincko.storage.get('users', wrapper_localstorage.uid, 'lastname');
			if(!val){ return ""; }
			return wrapper_to_html(val);
		},
		"action": function(Elem, subm, now, force){
			if(typeof now == "undefined"){ now = false; }
			if(typeof force == "undefined"){ force = false; }
			var val_old = Lincko.storage.get('users',  wrapper_localstorage.uid, 'lastname');
			var val_new = Elem.find("[find=submenu_value]").val();
			if(!force && val_new==""){
				return true;
			}
			var timer = wrapper_timeout_timer*10;
			if(now){
				timer = 0;
			}
			if(val_new != val_old){
				clearTimeout(submenu_profile_timer['lastname']);
				submenu_profile_timer['lastname'] = setTimeout(function(){
					wrapper_sendAction(
						{
							"id": wrapper_localstorage.uid,
							"lastname": val_new,
						},
						'post',
						'user/update'
					);
				}, timer);
			}
		},
	},
	"message": {
		"style": "button",
		"title": Lincko.Translation.get('app', 54, 'html'), //Send a message
		"class": "submenu_deco",
		"action": function(Elem, subm){
			submenu_chat_open_single(subm, subm.param);
		},
	},
	"space": {
		"style": "space",
		"title": "space",
		"value": 80,
	},
};

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
	"profile_picture": {
		"style": "profile_photo",
		"title": "",
		"value": function(Elem, subm){
			var val = Lincko.storage.get('users', subm.param, 'username');
			if(!val){ return ""; }
			return wrapper_to_html(val);
		},
	},
	"qrcode": {
		"style": "profile_info",
		"title": Lincko.Translation.get('app', 68, 'html'), //My QR code
		"class": "display_none",
		"value": function(Elem, subm){
			if(subm.param == wrapper_localstorage.uid){
				var qrcode = $('<img>');
				qrcode.attr('src', Lincko.storage.generateMyQRcode());
				qrcode.addClass('submenu_personal_profile_picture');
				return qrcode;
			}
		},
		"now": function(Elem, subm){
			if(subm.param == wrapper_localstorage.uid){
				Elem.removeClass('display_none');
			}
		},
	},
	"nickname": {
		"style": "profile_info",
		"title": Lincko.Translation.get('app', 47, 'html'), //Nickname
		"value": function(Elem,subm){
			var val = Lincko.storage.get('users',  subm.param, 'username');
			if(!val){ return ""; }
			return wrapper_to_html(val);
		},
	},
	"myurl": {
		"style": "button",
		"title": Lincko.Translation.get('app', 69, 'html'), //Copy My URL to the clipboard
		"class": "submenu_deco display_none",
		"now": function(Elem, subm){
			if(subm.param == wrapper_localstorage.uid){
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
		}
	},
	"given_name": {
		"style": "profile_info",
		"title": Lincko.Translation.get('app', 48, 'html'), //Given Name
		"value": function(Elem, subm){
			var val = Lincko.storage.get('users', subm.param, 'firstname');
			if(!val){ return ""; }
			return wrapper_to_html(val);
		},
	},
	"family_name": {
		"style": "profile_info",
		"title": Lincko.Translation.get('app', 49, 'html'), //Family Name
		"value": function(Elem, subm){
			var val = Lincko.storage.get('users', subm.param, 'lastname');
			if(!val){ return ""; }
			return wrapper_to_html(val);
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
	"space": {
		"style": "space",
		"title": "space",
		"value": 80,
	},
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

Submenu_select.profile_info = function(subm) {
	subm.Add_ProfileInfo();
};

Submenu_select.profile_button_link = function(subm){
	subm.Add_ButtonLink(subm);
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
	if ("now" in attribute && typeof attribute.now === "function") {
		attribute.now(Elem, that);
	}
	submenu_wrapper.find("[find=submenu_wrapper_content]").append(Elem);
	//submenu_wrapper = null; //In some placea it bugs because it's used in a lower scope
	delete submenu_wrapper;
	return Elem;
};

Submenu.prototype.Add_ProfileInput = function() {
	var perso = Lincko.storage.get('users', wrapper_localstorage.uid);
	var that = this;
	var attribute = this.attribute;
	var Elem = $('#-submenu_app_personal_input').clone();
	var preview = this.preview;
	Elem.prop("id", '');
	if ("class" in attribute) {
		Elem.addClass(attribute['class']);
	}
	Elem.find("[find=submenu_title]").html(attribute.title);
	Elem.find("[find=submenu_value]").val(attribute.value);

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
	if ("now" in attribute && typeof attribute.now === "function") {
		attribute.now(Elem, that);
	}
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
		submenu_Build("personal_settings", that.layer + 1, true, wrapper_localstorage.uid, that.preview);
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
	if ("now" in attribute && typeof attribute.now === "function") {
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
	if ("now" in attribute && typeof attribute.now === "function") {
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

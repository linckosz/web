submenu_list['personal_settings'] = {
	"_title": {
		"style": "title",
		"title": Lincko.Translation.get('app', 46, 'html'), //Personal Settings
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
		"action": function(Elem, that){
			var val_old = Lincko.storage.get('users', wrapper_localstorage.uid, 'username');
			var val_new = Elem.find("[find=submenu_value]").val();
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
				}, wrapper_timeout_timer);
			}
		},
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
		"action": function(Elem, that){
			var val_old = Lincko.storage.get('users', wrapper_localstorage.uid, 'firstname');
			var val_new = Elem.find("[find=submenu_value]").val();
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
				}, wrapper_timeout_timer);
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
		"action": function(Elem, that){
			var val_old = Lincko.storage.get('users',  wrapper_localstorage.uid, 'lastname');
			var val_new = Elem.find("[find=submenu_value]").val();
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
				}, wrapper_timeout_timer);
			}
		},
	},
	"email": {
		"style": "profile_info",
		"title": Lincko.Translation.get('app', 50, 'html'), //E-mail
		"value": function(){
			var val = Lincko.storage.get('users', wrapper_localstorage.uid, 'email');
			if(!val){ return ""; }
			return wrapper_to_html(val);
		},
	},
};

submenu_list['personal_info'] = {
	"_title": {
		"style": "title",
		"title": Lincko.Translation.get('app', 55, 'html'), //User Profile
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
	"given_name": {
		"style": "profile_info",
		"title": Lincko.Translation.get('app', 48, 'html'), //Given Name
		"input": "firstname",
		"value": function(Elem, subm){
			var val = Lincko.storage.get('users', subm.param, 'firstname');
			if(!val){ return ""; }
			return wrapper_to_html(val);
		},
	},
	"family_name": {
		"style": "profile_info",
		"title": Lincko.Translation.get('app', 49, 'html'), //Family Name
		"input": "lastname",
		"value": function(Elem, subm){
			var val = Lincko.storage.get('users', subm.param, 'lastname');
			if(!val){ return ""; }
			return wrapper_to_html(val);
		},
	},
	"message": {
		"style": "profile_info",
		"title": Lincko.Translation.get('app', 54, 'html'), //Send a message
		"class": "submenu_deco",
		"action": function(Elem, subm){
			submenu_chat_open_single(subm, subm.param);
		},
		"postAction": function(Elem){
			Elem.removeClass("submenu_deco_read");
		}
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

var submenu_profile_timer = [];

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
		Elem.find("[find=submenu_value]").on({
			focus: function(){ attribute.action(Elem, that) },
			blur: function(){ attribute.action(Elem, that) },
			change: function(){ attribute.action(Elem, that) },
			copy: function(){ attribute.action(Elem, that) },
			past: function(){ attribute.action(Elem, that) },
			cut: function(){ attribute.action(Elem, that) },
			keyup: function(e) {
				if (e.which != 13) {
					attribute.action(Elem, that);
				}
			},
			keypress: function(e) {
				if (e.which == 13) {
					$(this.form).submit();
				} else {
					attribute.action(Elem, that);
				}
			},
		});
	}
	this.Wrapper().find("[find=submenu_wrapper_content]").append(Elem);
	return true;
}

var submenu_app_personal_temp_id = false;

Submenu.prototype.Add_ProfileNext = function() {
	var perso = Lincko.storage.get('users', wrapper_localstorage.uid);
	var that = this;
	var attribute = this.attribute;
	var Elem = $('#-submenu_app_personal_next').clone();
	var preview = this.preview;
	var range = ['users_'+wrapper_localstorage.uid, 'upload'];
	Elem.prop("id", '');
	if ("action" in attribute) {
		if ("action_param" in attribute) {
			Elem.click(attribute.action_param, attribute.action);
		} else {
			Elem.click(attribute.action);
		}
	}
	if ("class" in attribute) {
		Elem.addClass(attribute['class']);
	}
	var Elem_pic = Elem.find("[find=submenu_next_upload_picture]");
	Elem_pic
		.attr("preview", "0")
		.prop("id", that.id+"_submenu_next_upload_picture");
	if(perso['profile_pic'] && $.isNumeric(perso['profile_pic'])){
		var src = Lincko.storage.getLinkThumbnail(perso['profile_pic']);
		Elem_pic.prop("src", src);
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
		var file = Lincko.storage.list('files', 1, {temp_id:submenu_app_personal_temp_id,});
		if(submenu_app_personal_temp_id && file.length==1){
			var file_id = file[0]['_id'];
			var src = Lincko.storage.getLinkThumbnail(file_id);
			Elem_pic.prop("src", src).attr("preview", "0");
			wrapper_sendAction(
				{
					"id": wrapper_localstorage.uid,
					"profile_pic": file_id,
				},
				'post',
				'user/update',
				function(){
					submenu_app_personal_temp_id = false;
				}
			);
		} else if(submenu_app_personal_temp_id===false){
			var perso = Lincko.storage.get('users', this.action_param);
			if(perso["profile_pic"]){
				var src = Lincko.storage.getLinkThumbnail(perso["profile_pic"]);
				Elem_pic.prop("src", src);
			}
		} else {
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
						Elem_pic.prop("src", data.files[0].preview.toDataURL());
						Elem_pic.attr("preview", "1");
					}
				}
			}
		}
	}, wrapper_localstorage.uid);
	

	Elem.find("[find=submenu_next_user]").html(wrapper_to_html(perso['-username'].ucfirst()));
	
	Elem.find("[find=submenu_next_user]").prop("id", this.id+"_submenu_next_user");
	app_application_lincko.add(this.id+"_submenu_next_user", "users_"+wrapper_localstorage.uid, function() {
		var username = Lincko.storage.get('users',  wrapper_localstorage.uid, "username").ucfirst();
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
	var Elem_pic = Elem.find("[find=submenu_profile_upload_picture]");
	Elem_pic
		.attr("preview", "0")
		.prop("id", that.id+"_submenu_profile_upload_picture");
	if(perso['profile_pic'] && $.isNumeric(perso['profile_pic'])){
		var src = Lincko.storage.getLinkThumbnail(perso['profile_pic']);
		Elem_pic.prop("src", src);
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
		var file = Lincko.storage.list('files', 1, {temp_id:submenu_app_personal_temp_id,});
		if(Elem_pic.attr("preview")=="1" && file.length==1){
			var file_id = file[0]['_id'];
			var src = Lincko.storage.getLinkThumbnail(file_id);
			Elem_pic.prop("src", src).attr("preview", "0");
			wrapper_sendAction(
				{
					"id": wrapper_localstorage.uid,
					"profile_pic": file_id,
				},
				'post',
				'user/update',
				function(){
					submenu_app_personal_temp_id = false;
				}
			);
		} else if(submenu_app_personal_temp_id===false){
			var perso = Lincko.storage.get('users', this.action_param);
			if(perso["profile_pic"]){
				var src = Lincko.storage.getLinkThumbnail(perso["profile_pic"]);
				Elem_pic.prop("src", src);
			}
		} else {
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
						Elem_pic.prop("src", data.files[0].preview.toDataURL());
						Elem_pic.attr("preview", "1");
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
		if ("action_param" in attribute) {
			Elem.click(function(){
				attribute.action(this, that, attribute.action_param);
			});
		} else {
			Elem.click(function(){
				attribute.action(this, that);
			});
		}
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

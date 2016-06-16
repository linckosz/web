submenu_list['personal_settings'] = {
	"_title": {
		"style": "title",
		"title": Lincko.Translation.get('app', 46, 'html'), //Personal Settings
	},
	"profile_picture": {
		"style": "profile_photo",
		"title": "",
		"class": "",
	},
	"nickname": {
		"style": "profile_input",
		"title": Lincko.Translation.get('app', 47, 'html'), //Nickname
		"value": function(){
			var val = Lincko.storage.get('users',  wrapper_localstorage.uid, 'username');
			if(!val){ return ""; }
			return val;
		},
		"action": function(Elem, that){
			var val_old = Lincko.storage.get('users',  wrapper_localstorage.uid, 'username');
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
			var val = Lincko.storage.get('users',  wrapper_localstorage.uid, 'firstname');
			if(!val){ return ""; }
			return val;
		},
		"action": function(Elem, that){
			var val_old = Lincko.storage.get('users',  wrapper_localstorage.uid, 'firstname');
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
			var val = Lincko.storage.get('users',  wrapper_localstorage.uid, 'lastname');
			if(!val){ return ""; }
			return val;
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
			var val = Lincko.storage.get('users',  wrapper_localstorage.uid, 'email');
			if(!val){ return ""; }
			return val;
		},
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
	var perso = Lincko.storage.get('users',  wrapper_localstorage.uid);
	var that = this;
	var attribute = this.attribute;
	var Elem = $('#-submenu_app_personal_input').clone();
	var preview = this.preview;
	Elem.prop("id", '');
	if ("class" in attribute) {
		Elem.addClass(attribute['class']);
	}
	Elem.find("[find=submenu_title]").html(wrapper_to_html(attribute.title));
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

Submenu.prototype.Add_ProfileNext = function() {
	var perso = Lincko.storage.get('users',  wrapper_localstorage.uid);
	var that = this;
	var attribute = this.attribute;
	var Elem = $('#-submenu_app_personal_next').clone();
	var preview = this.preview;
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
	Elem.find("[find=submenu_next_upload_picture]").attr("preview", "0");
	if(perso['profile_pic'] && $.isNumeric(perso['profile_pic'])){
		var src = Lincko.storage.getLinkThumbnail(perso['profile_pic']);
		Elem.find("[find=submenu_next_upload_picture]").prop("src", src);
	}
	Elem.click(function(){
		submenu_Build("personal_settings", that.layer + 1, true, null, that.preview); //toto => why close all if hide at true?
	});
	Elem.find("[find=submenu_next_upload_picture]").click(function(e){
		e.stopPropagation();
		var temp_id = app_upload_open_photo_single('users', wrapper_localstorage.uid, false, true);
		var picture = Elem.find("[find=submenu_next_upload_picture]");
		Elem.find("[find=submenu_next_upload_picture]").prop("id", temp_id);
		app_application_lincko.add(temp_id, ['files', 'upload'], function() {
			var temp_id = this.id;
			var file = Lincko.storage.list('files', 1, {temp_id:temp_id,});
			if(file.length==1){
				var file_id = file[0]['_id'];
				var src = Lincko.storage.getLinkThumbnail(file_id);
				Elem.find("[find=submenu_next_upload_picture]").prop("src", src);
				Elem.find("[find=submenu_next_upload_picture]").attr("preview", "0");
				Elem.find("[find=submenu_next_upload_picture]").prop("id", "");
				wrapper_sendAction(
					{
						"id": wrapper_localstorage.uid,
						"profile_pic": file_id,

					},
					'post',
					'user/update'
				);
			} else {
				var data = false;
				for(var i in app_upload_files.lincko_files){
					if(app_upload_files.lincko_files[i].lincko_temp_id == temp_id){
						data = app_upload_files.lincko_files[i];
						Elem.find("[find=submenu_next_upload_picture]").attr("preview", "0");
						break;
					}
				}
				if(data){
					if(data.files[0].preview && Elem.find("[find=submenu_next_upload_picture]").attr("preview")=="0"){
						console.log(data.files[0]); //[toto] File staying in cache, memory not cleared?
						if(typeof data.files[0].preview.tagName !== 'undefined' && data.files[0].preview.tagName.toLowerCase() === 'canvas'){
							Elem.find("[find=submenu_next_upload_picture]").prop("src", data.files[0].preview.toDataURL());
							Elem.find("[find=submenu_next_upload_picture]").attr("preview", "1");
						}
					}
				}
			}
		});
	});
	

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
	var perso = Lincko.storage.get('users',  wrapper_localstorage.uid);
	var that = this;
	var attribute = this.attribute;
	var Elem = $('#-submenu_app_personal_profile').clone();
	var preview = this.preview;
	Elem.prop("id", '');
	if ("class" in attribute) {
		Elem.addClass(attribute['class']);
	}
	Elem.find("[find=submenu_profile_upload_picture]").attr("preview", "0");
	if(perso['profile_pic'] && $.isNumeric(perso['profile_pic'])){
		var src = Lincko.storage.getLinkThumbnail(perso['profile_pic']);
		Elem.find("[find=submenu_profile_upload_picture]").prop("src", src);
	}
	Elem.find("[find=submenu_profile_upload_picture]").click(function(e){
		e.stopPropagation();
		var temp_id = app_upload_open_photo_single('users', wrapper_localstorage.uid, false, true);
		var picture = Elem.find("[find=submenu_profile_upload_picture]");
		Elem.find("[find=submenu_profile_upload_picture]").prop("id", temp_id);
		app_application_lincko.add(temp_id, ['files', 'upload'], function() {
			var temp_id = this.id;
			var file = Lincko.storage.list('files', 1, {temp_id:temp_id,});
			if(file.length==1){
				var file_id = file[0]['_id'];
				var src = Lincko.storage.getLinkThumbnail(file_id);
				Elem.find("[find=submenu_profile_upload_picture]").prop("src", src);
				Elem.find("[find=submenu_profile_upload_picture]").attr("preview", "0");
				Elem.find("[find=submenu_profile_upload_picture]").prop("id", "");
				wrapper_sendAction(
					{
						"id": wrapper_localstorage.uid,
						"profile_pic": file_id,

					},
					'post',
					'user/update'
				);
			} else {
				var data = false;
				for(var i in app_upload_files.lincko_files){
					if(app_upload_files.lincko_files[i].lincko_temp_id == temp_id){
						data = app_upload_files.lincko_files[i];
						Elem.find("[find=submenu_profile_upload_picture]").attr("preview", "0");
						break;
					}
				}
				if(data){
					if(data.files[0].preview && Elem.find("[find=submenu_profile_upload_picture]").attr("preview")=="0"){
						console.log(data.files[0]); //[toto] File staying in cache, memory not cleared?
						if(typeof data.files[0].preview.tagName !== 'undefined' && data.files[0].preview.tagName.toLowerCase() === 'canvas'){
							Elem.find("[find=submenu_profile_upload_picture]").prop("src", data.files[0].preview.toDataURL());
							Elem.find("[find=submenu_profile_upload_picture]").attr("preview", "1");
						}
					}
				}
			}
		});
	});
	this.Wrapper().find("[find=submenu_wrapper_content]").append(Elem);
	return true;
}

Submenu.prototype.Add_ProfileInfo = function() {
	var perso = Lincko.storage.get('users',  wrapper_localstorage.uid);
	var that = this;
	var attribute = this.attribute;
	var Elem = $('#-submenu_app_personal_info').clone();
	var preview = this.preview;
	Elem.prop("id", '');
	if ("class" in attribute) {
		Elem.addClass(attribute['class']);
	}
	Elem.find("[find=submenu_title]").html(wrapper_to_html(attribute.title));
	Elem.find("[find=submenu_value]").html(wrapper_to_html(attribute.value));
	
	this.Wrapper().find("[find=submenu_wrapper_content]").append(Elem);
	return true;
}

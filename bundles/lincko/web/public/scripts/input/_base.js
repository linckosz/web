base_input_field.firstname = {
	format: Lincko.Translation.get('web', 4, 'js'), //First name format: - 104 characters max
	tags: {
		pattern: "^.{0,104}$",
		required: true,
		maxlength: 104,
	},
	valid: function(text){
		var regex_1 = /^.{0,104}$/g;
		return regex_1.test(text);
	},
	error_msg: function(){
		return { msg: this.format, field: 'firstname' };
	},
}

base_input_field.lastname = {
	format: Lincko.Translation.get('web', 5, 'js'), //Last name format: - 104 characters max
	tags: {
		pattern: "^.{0,104}$",
		required: true,
		maxlength: 104,
	},
	valid: function(text){
		var regex_1 = /^.{0,104}$/g;
		return regex_1.test(text);
	},
	error_msg: function(){
		return { msg: this.format, field: 'lastname' };
	},
}

base_input_field.username = {
	format: Lincko.Translation.get('web', 3, 'js'), //Username format: - 104 characters max - Without space
	tags: {
		pattern: "^\\S{0,104}$",
		required: true,
		maxlength: 104,
	},
	valid: function(text){
		var regex_1 = /^\S{0,104}$/g;
		return regex_1.test(text);
	},
	error_msg: function(){
		return { msg: this.format, field: 'username' };
	},
}

base_input_field.email = {
	format: Lincko.Translation.get('web', 1, 'js'), //Email address format: - {name}@{domain}.{ext} - 191 characters maxi
	tags: {
		pattern: "^.{1,100}@.*\\..{2,4}$",
		required: "required",
		maxlength: 191,
	},
	valid: function(text){
		var regex_1 = /^.{1,191}$/g;
		var regex_2 = /^.{1,100}@.*\..{2,4}$/gi;
		var regex_3 = /^[_a-z0-9-%+]+(\.[_a-z0-9-%+]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/gi;
		return regex_1.test(text) && regex_2.test(text) && regex_3.test(text);
	},
	error_msg: function(){
		return { msg: this.format, field: 'email' };
	},
}

base_input_field.password = {
	format: Lincko.Translation.get('web', 2, 'js'), //Password format: - Between 6 and 60 characters
	tags: {
		pattern: "^[\\S]{6,60}$",
		required: "required",
		maxlength: 60,
	},
	valid: function(text){
		var regex_1 = /^[\w\d]{6,60}$/g;
		return regex_1.test(text);
	},
	error_msg: function(){
		return { msg: this.format, field: 'password' };
	},
}

base_input_field.captcha = {
	format: Lincko.Translation.get('web', 7, 'js'), //Captcha format: - Between 1 and 6 characters - Number
	tags: {
		pattern: "^\\d{1,6}$",
		required: "required",
		maxlength: 6,
	},
	valid: function(text){
		var regex_1 = /^\d{1,6}$/g;
		return regex_1.test(text);
	},
	error_msg: function(){
		return { msg: this.format, field: 'captcha' };
	},
}

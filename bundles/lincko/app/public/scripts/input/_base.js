base_input_field.firstname = {
	format: Lincko.Translation.get('app', 4, 'js'), //First name format: - 104 characters max
	tags: {
		pattern: "^.{0,104}$",
		required: "required",
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
	format: Lincko.Translation.get('app', 5, 'js'), //Last name format: - 104 characters max
	tags: {
		pattern: "^.{0,104}$",
		required: "required",
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
	format: Lincko.Translation.get('app', 3, 'js'), //Username format: - 104 characters max - Without space
	tags: {
		pattern: "^\\S{0,104}$",
		required: "required",
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

base_input_field.gender = {
	format: Lincko.Translation.get('app', 8, 'js'), //Genderr format: - Male or Female
	tags: {
		pattern: "^0|1$",
	},
	valid: function(text){
		var regex_1 = /^0|1$/g;
		return regex_1.test(text);
	},
	error_msg: function(){
		return { msg: this.format, field: 'gender' };
	},
}

base_input_field.email = {
	format: Lincko.Translation.get('app', 1, 'js'), //Email address format: - {name}@{domain}.{ext} - 191 characters maxi
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
	format: Lincko.Translation.get('app', 2, 'js'), //Password format: - Between 6 and 60 characters - Alphanumeric
	tags: {
		pattern: "^[\\w\\d]{6,60}$",
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
	format: Lincko.Translation.get('app', 7, 'js'), //Captcha format: - Between 1 and 6 characters - Number
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

base_input_field.base_search_text = {
	format: Lincko.Translation.get('app', 4, 'js'), //Search format: - Between 2 and 255 characters
	tags: {
		pattern: "^.{2,255}$",
		maxlength: 255,
	},
	valid: function(text){
		var regex_1 = /^.{2,255}$/g;
		return regex_1.test(text);
	},
	error_msg: function(){
		return { msg: this.format, field: 'search' };
	},
}

base_input_field.project_title_text = {
	format: Lincko.Translation.get('app', 32, 'js'), //Title format: - 104 characters max
	tags: {
		pattern: "^.{1,104}$",
		required: "required",
		maxlength: 104,
	},
	valid: function(text){
		var regex_1 = /^.{1,104}$/g;
		return regex_1.test(text);
	},
	error_msg: function(){
		return { msg: this.format, field: 'project_title_text' };
	},
};

base_input_field.project_description_textarea = {
	tags: {
		rows: 3,
	},
};
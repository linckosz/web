base_input_field.project_title_text = {
	format: Lincko.Translation.get('app', 32, 'js'), //Title format: - 200 characters max
	tags: {
		pattern: "^.{1,200}$",
		required: "required",
		maxlength: 200,
	},
	valid: function(text){
		var regex_1 = /^.{1,200}$/g;
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

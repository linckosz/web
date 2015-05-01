base_input_field.project_title_text = {
	format: Lincko.Translation.get('app', 4, 'html'), //Title format: - 104 characters max
	tags: {
		pattern: "^\\S{1,104}$",
		required: "required",
		maxlength: 104,
	},
	valid: function(text){
		var regex_1 = /^.{1,104}$/g;
		return regex_1.test(text);
	},
	error_msg: function(){
		return { msg: this.format, field: 'firstname' };
	},
}
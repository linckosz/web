base_input_field.task_title_text = {
	format: Lincko.Translation.get('app', 32, 'js'), //Title format: - 200 characters max
	tags: {
		pattern: "^.{0,200}$",
		required: "required",
		maxlength: 200,
	},
	valid: function(text){
		var regex_1 = /^.{0,200}$/g;
		return regex_1.test(text);
	},
	error_msg: function(){
		return { msg: this.format, field: 'task_title_text' };
	},
};

base_input_field.task_comment_textarea = {
	tags: {
		rows: 3,
	},
};

base_input_field.task_title_text = {
	format: Lincko.Translation.get('app', 32, 'html'), //Title format: - 104 characters max
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
		return { msg: this.format, field: 'task_title_text' };
	},
};

base_input_field.task_comment_textarea = {
	tags: {
		rows: 3,
	},
};
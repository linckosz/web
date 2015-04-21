var base_input_field = {};
base_input_field.firstname = {
	format: Lincko.Translation.get('app', 4, 'html'), //First name format: - 104 characters max
	pattern: "^\\S{1,104}$",
	required: true,
	maxlength: 104,
	valid: function(text){
		var regex_1 = /^.{1,104}$/g;
		return regex_1.test(text);
	},
	error_msg: function(){
		return { msg: this.format, field: 'firstname' };
	},
}
base_input_field.lastname = {
	format: Lincko.Translation.get('app', 5, 'html'), //Last name format: - 104 characters max
	pattern: "^\\S{1,104}$",
	required: true,
	maxlength: 104,
	valid: function(text){
		var regex_1 = /^.{1,104}$/g;
		return regex_1.test(text);
	},
	error_msg: function(){
		return { msg: this.format, field: 'lastname' };
	},
}
base_input_field.username = {
	format: Lincko.Translation.get('app', 3, 'html'), //Username format: - 104 characters max - Without space
	pattern: "^\\S{1,104}$",
	required: true,
	maxlength: 104,
	valid: function(text){
		var regex_1 = /^\S{1,104}$/g;
		return regex_1.test(text);
	},
	error_msg: function(){
		return { msg: this.format, field: 'username' };
	},
}
base_input_field.email = {
	format: Lincko.Translation.get('app', 1, 'html'), //Email address format: - {name}@{domain}.{ext} - 191 characters maxi
	pattern: "^.{1,100}@.*\\..{2,4}$",
	required: true,
	maxlength: 191,
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
	format: Lincko.Translation.get('app', 2, 'html'), //Password format: - Between 6 and 60 characters - Alphanumeric
	pattern: "^[\\w\\d]{6,60}$",
	required: true,
	maxlength: 60,
	valid: function(text){
		var regex_1 = /^[\w\d]{6,60}$/g;
		return regex_1.test(text);
	},
	error_msg: function(){
		return { msg: this.format, field: 'password' };
	},
}
base_input_field.captcha = {
	format: Lincko.Translation.get('app', 7, 'html'), //Captcha format: - Between 1 and 6 characters - Number
	pattern: "^\\d{1,6}$",
	required: true,
	maxlength: 6,
	valid: function(text){
		var regex_1 = /^\d{1,6}$/g;
		return regex_1.test(text);
	},
	error_msg: function(){
		return { msg: this.format, field: 'captcha' };
	},
}
base_input_field.search = {
	format: Lincko.Translation.get('app', 4, 'html'), //Search format: - Between 2 and 255 characters
	pattern: "^\\S{2,255}$",
	maxlength: 255,
	valid: function(text){
		var regex_1 = /^.{2,255}$/g;
		return regex_1.test(text);
	},
	error_msg: function(){
		return { msg: this.format, field: 'search' };
	},
}

function base_format_form(){
	for(field in base_input_field){
		if(typeof base_input_field[field].pattern !== 'undefined') {
			$("input[name="+field+"]").prop('pattern', base_input_field[field].pattern);
			if(base_input_field[field].format){
				//Do not add title, it's annoying
				//$("input[name="+field+"]").prop('title', php_br2nl(base_input_field[field].format));
			}
		}
		if(typeof base_input_field[field].required !== 'undefined') {
			if(base_input_field[field].required){
				$("input[name="+field+"]").prop('required', 'required');
			}
		}
		if(typeof base_input_field[field].maxlength !== 'undefined') {
			$("input[name="+field+"]").prop('maxlength', base_input_field[field].maxlength);
		}
	}

	base_format_form_single($('.submit_progress_bar'));
}
base_format_form();

//This function is only for IE which gives the wrong width when the element is hidden
function base_format_form_single(Elem){
	Elem.width(function(){
		return $(this).prev().outerWidth() - 8;
	});
}

//Copy canvas
//http://stackoverflow.com/questions/3318565/any-way-to-clone-html5-canvas-element-with-its-content
//http://jsperf.com/copying-a-canvas-element
function base_cloneCanvas(oldCanvas) {

	//create a new canvas
	var newCanvas = document.createElement('canvas');
	var context = newCanvas.getContext('2d');

	//set dimensions
	newCanvas.width = oldCanvas.width;
	newCanvas.height = oldCanvas.height;

	//apply the old canvas to the new one
	context.drawImage(oldCanvas, 0, 0);

	//return the new canvas
	return newCanvas;
}
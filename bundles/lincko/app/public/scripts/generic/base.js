base_input_field.firstname = {
	format: Lincko.Translation.get('app', 4, 'html'), //First name format: - 104 characters max
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
base_input_field.lastname = {
	format: Lincko.Translation.get('app', 5, 'html'), //Last name format: - 104 characters max
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
		return { msg: this.format, field: 'lastname' };
	},
}
base_input_field.username = {
	format: Lincko.Translation.get('app', 3, 'html'), //Username format: - 104 characters max - Without space
	tags: {
		pattern: "^\\S{1,104}$",
		required: "required",
		maxlength: 104,
	},
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
	format: Lincko.Translation.get('app', 2, 'html'), //Password format: - Between 6 and 60 characters - Alphanumeric
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
	format: Lincko.Translation.get('app', 7, 'html'), //Captcha format: - Between 1 and 6 characters - Number
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
base_input_field.search = {
	format: Lincko.Translation.get('app', 4, 'html'), //Search format: - Between 2 and 255 characters
	tags: {
		pattern: "^\\S{2,255}$",
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

//Initiiaze fields with same name
function base_format_input(field){
	if(field in base_input_field){
		var Elem = $("input[name="+field+"]");
		if(typeof base_input_field[field].tags === 'object') {
			for(tag in base_input_field[field].tags){
				Elem.prop(tag, base_input_field[field].tags[tag]);
			}
		}
	}
}

//This function is only for IE which gives the wrong width when the element is hidden
function base_format_form_single(Elem){
	Elem.width(function(){
		return $(this).prev().outerWidth() - 8;
	});
}

//Initialize a bunch of forms' inputs
function base_format_form(prefix){
	if(typeof prefix !== 'string'){ prefix = ''; }
	var Elem = null;
	for(field in base_input_field){
		if(field.indexOf(prefix) === 0){
			base_format_input(field);
		}
	}
	base_format_form_single($('.submit_progress_bar'));
}


JSfiles.finish(function(){
	base_format_form();
});

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
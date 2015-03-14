var base_input_field = {};
base_input_field.firstname = {
	format: Lincko.Translation.get('web', 4, 'html'), //First name format: - 104 characters max
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
	format: Lincko.Translation.get('web', 5, 'html'), //Last name format: - 104 characters max
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
	format: Lincko.Translation.get('web', 3, 'html'), //Username format: - 104 characters max - Without space
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
	format: Lincko.Translation.get('web', 1, 'html'), //Email address format: - {name}@{domain}.{ext} - 191 characters maxi
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
	format: Lincko.Translation.get('web', 2, 'html'), //Password format: - Between 6 and 60 characters - Alphanumeric
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
	format: Lincko.Translation.get('web', 7, 'html'), //Captcha format: - Between 1 and 6 characters - Number
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

function base_format_form(){
	for(field in base_input_field){
		if(typeof base_input_field[field].pattern !== 'undefined') {
			$("input[name="+field+"]").attr('pattern', base_input_field[field].pattern);
			if(base_input_field[field].format){
				//Do not add title, it's annoying
				//$("input[name="+field+"]").attr('title', php_br2nl(base_input_field[field].format));
			}
		}
		if(typeof base_input_field[field].required !== 'undefined') {
			if(base_input_field[field].required){
				$("input[name="+field+"]").attr('required', 'required');
			}
		}
		if(typeof base_input_field[field].maxlength !== 'undefined') {
			$("input[name="+field+"]").attr('maxlength', base_input_field[field].maxlength);
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

var IMGcaptcha = new Image();
IMGcaptcha.src = "/captcha/4/320/120";

$("img[name=captcha]").attr("src",IMGcaptcha.src);

$("img[name=captcha]").click(function(){
	IMGcaptcha.src = IMGcaptcha.src;
	$("img[name=captcha]").attr("src",IMGcaptcha.src);
});

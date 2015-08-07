//Initiiaze fields with same name
function base_format_input(field){
	if(field in base_input_field){
		var Elem = $("input[name="+field+"]");
		if($.type(base_input_field[field].tags) === 'object') {
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
base_format_form();

//This function is only for IE which gives the wrong width when the element is hidden
function base_format_form_single(Elem){
	Elem.width(function(){
		return $(this).prev().outerWidth() - 8;
	});
}

var IMGcaptcha = new Image();
IMGcaptcha.src = "/captcha/4/320/120";

$("img[name=captcha]").prop("src",IMGcaptcha.src);

$("img[name=captcha]").click(function(){
	IMGcaptcha.src = IMGcaptcha.src;
	$("img[name=captcha]").prop("src",IMGcaptcha.src);
});


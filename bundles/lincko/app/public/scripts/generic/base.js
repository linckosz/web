//Initiiaze fields with same name
function base_format_input(field){
	if(field in base_input_field){
		var Elem = $("[name="+field+"]");
		if($.type(base_input_field[field].tags) === 'object') {
			for(tag in base_input_field[field].tags){
				Elem.prop(tag, base_input_field[field].tags[tag]);
			}
		}
	}
}

//This function is only for IE which gives the wrong width when the element is hidden
function base_format_form_single(Elem){
	Elem.each(function() {
		$(this).width("100%");
		$(this).width($(this).width() - 4);
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
	newCanvas = document.createElement('canvas');
	context = newCanvas.getContext('2d');

	//set dimensions
	newCanvas.width = oldCanvas.width;
	newCanvas.height = oldCanvas.height;

	//apply the old canvas to the new one
	context.drawImage(oldCanvas, 0, 0);

	delete context;

	//return the new canvas
	return newCanvas;
}

var base_error_timing;

function base_show_error(msg, error) {
	if(typeof error === 'undefined'){ error = false; }
	if(error && $('#base_error').hasClass('base_message')){
		$('#base_error').removeClass('base_message');
	} else if(!error && !$('#base_error').hasClass('base_message')){
		$('#base_error').addClass('base_message');
	}
	clearTimeout(base_error_timing);
	//This avoid a double call
	msg = wrapper_to_html(msg); //Escape the whole string for HTML displaying
	if(php_nl2br(php_br2nl(msg)) != php_nl2br(php_br2nl($('#base_error').html()))){
		$('#base_error').html(msg);
		if($('#base_error').is(':hidden')){
			$("#base_error").velocity("transition.slideRightBigIn", {
				mobileHA: hasGood3Dsupport,
				duration: 260,
				delay: 120,
			});
		} else {
			$("#base_error").fadeTo( 80 , 0.8).fadeTo( 150 , 1);
		}
	}
	base_error_timing = setTimeout(function(){ base_hide_error(); }, 4000);
}

function base_hide_error() {
	clearTimeout(base_error_timing);
	if($('#base_error').is(':visible')){
		$("#base_error").velocity("transition.slideRightBigOut", {
			mobileHA: hasGood3Dsupport,
			duration: 160,
			delay: 80,
			complete: function(){
				$('#base_error').empty();
			},
		});
	}
}

$('#base_error').click(function(){
	base_hide_error();
});

function base_form_field_hide_error() {
	base_hide_error();
	$('.base_input_text_error').removeClass('base_input_text_error').off('change copy past cut keyup keypress');
}

function base_form_field_show_error(input){
	input.addClass('base_input_text_error').on({
		change: function(){ base_form_field_hide_error(); },
		copy: function(){ base_form_field_hide_error(); },
		past: function(){ base_form_field_hide_error(); },
		cut: function(){ base_form_field_hide_error(); },
		keyup: function(e) {
			if (e.which != 13) {
				base_form_field_hide_error();
			}
		},
		keypress: function(e) {
			if (e.which != 13) {
				base_form_field_hide_error();
			}
		},
	});
}

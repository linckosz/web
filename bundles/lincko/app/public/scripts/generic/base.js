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

var base_notification = null;

JSfiles.finish(function(){
	base_format_form();
	Notification.requestPermission();
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
				$('#base_error').recursiveEmpty();
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

/*
	elem: DOM element ID in string form
	fn_run: function to run when the DOM elem specified above is ready
	after creating an instance, use the instance.run function to start the DOM check
*/
function base_runOnElemLoad(elem, fn_run){
	if(!elem || typeof fn_run != 'function'){ return false; }

	this.that = this;
	var that = this;

	that.elem = elem;
	that.fn_run = fn_run;
	that.timeoutVar = null;
}
base_runOnElemLoad.prototype.run = function(checkTime){
	var that = this;
	if(typeof checkTime != 'number'){ var checkTime = 50; /*default*/ }

	if($('#'+that.elem).is(':visible')){
		that.fn_run();
		clearTimeout(that.timeoutVar);
		delete that;
	}
	else{
		clearTimeout(that.timeoutVar);
		that.timeoutVar = setTimeout(function(){ that.run(checkTime); }, checkTime);
	}
}

function base_getRandomInt(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/*
[image] to <img/>
*/
function base_lincko_img_to_html(source)
{
	var reg = new RegExp("\\[image(.*?)\\](.*?)\\[\\/image\\]","gi");
	var match = source.match(reg);
	if(match && match.length>0){
		var extract = match[0];
		extract = html_to_wrapper(extract);
		extract = extract.replace(reg, '<img $1 src="$2"/>');
		source = source.replace(reg, extract);
	}
	return source;
}

/*
text to <a></a>
*/
function base_lincko_link_to_html(source)
{
	// var reg = new RegExp("([^=]http:\\/\\/)?([A-Za-z0-9]+\\.[A-Za-z0-9]+[\\/=\\?%\\-&_~`@[\\]\\':+!]*([^<>])*)","gi");
	// var reg = new RegExp("((http|ftp|https)://)(([a-zA-Z0-9\._-]+\.[a-zA-Z]{2,6})|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,4})*(/[a-zA-Z0-9\&%_\./-~-]*)?","gi");
	var reg = new RegExp("((http|ftp|https)://)([a-zA-Z0-9\._-]+)(:[0-9]{1,4})*([/a-zA-Z0-9\?\&%_\./-~-]*)?","gi");

	
	source = source.replace(reg, '<a target="_blank" href="$1$3$4$5">$1$3$4$5</a>');

	//recover the piture
	reg = new RegExp("(\"<a(.*)>)(.*)(</a>)\"","gi");
	source = source.replace(reg, '$3');

	//NOTE: DO NOT USE <a> or window.open(), USE device_download() INSTEAD !
	return source;
}



function base_lincko_tag_to_html(source)
{
	//[image]
	source = base_lincko_img_to_html(source);

	//url
	source = base_lincko_link_to_html(source);

	//[vedio]
	return source;
}



//Returns true if it is a DOM element    
function base_isElement(o){
	  return (
	    typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
	    o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
	);
}

base_showProgress = function(Elem){
	Elem.addClass('cursor_progress');
	var submit_progress_bar = Elem.find("[find=submit_progress_bar]");
	if(submit_progress_bar.length>0){
		base_format_form_single(submit_progress_bar);
		submit_progress_bar.css("display", "block");
		submit_progress_bar.removeClass('display_none');
	}
};

base_hideProgress = function(Elem){
	Elem.removeClass('cursor_progress');
	var submit_progress_bar = Elem.find("[find=submit_progress_bar]");
	if(submit_progress_bar.length>0){
		base_format_form_single(submit_progress_bar);
		submit_progress_bar.addClass('display_none');
	}
}


var home_cb_success = function(msg, err){
	var field = 'undefined';
	var msgtp = msg;
	if(typeof msg.field !== 'undefined') { field = msg.field; }
	if(typeof msg.show === 'string'){
		msgtp = msg.show;
	} else if(typeof msg.msg === 'string') {
		msgtp = msg.msg;
	}
	msgtp = php_nl2br(msgtp);
	if(err){
		$('#home_joinus_error').html(msgtp);
		$("#home_joinus_error").velocity("transition.slideDownIn", { duration: 500, delay: 100, });
		$("#home_joinus_form input[name="+field+"]").addClass('base_input_text_error').focus();
	} else {
		window.location.href = home_link['root'];
	}
};

var home_cb_error = function(xhr_err, ajaxOptions, thrownError){
	var msgtp = Lincko.Translation.get('wrapper', 1, 'html'); //Communication error
	$('#home_joinus_error').html(msgtp);
	$("#home_joinus_error").velocity("transition.slideDownIn", { duration: 500, delay: 100, });
};

var home_cb_begin = function(){
	home_hide_error();
	$(document.body).css('cursor', 'progress');
	base_format_form_single($('#home_news_submit_progress'));
	$('#home_news_submit_progress').show();
};

var home_cb_complete = function(){
	$(document.body).css('cursor', '');
	$('#home_news_submit_progress').hide();
};

home_resize_elements();
var home_resize_elements_timer;
$(window).resize(function(){
	clearTimeout(home_resize_elements_timer);
	home_resize_elements_timer = setTimeout(home_resize_elements, wrapper_timeout_timer);
});

function home_hide_error() {
	if($('#home_joinus_error').is(':visible')){
		$("#home_joinus_error").velocity("transition.fadeOut", { duration: 500, delay: 100, });
	}
}

function home_display_label(input, hide_error, force) {
	if(typeof force != 'boolean'){ force = false; }
	if(hide_error){
		home_hide_error();
		$(input).removeClass('base_input_text_error');
	}
	if(!force && $(input).val().length<=0){
		if($(input).prev().is(':hidden')){
			$(input).prev().velocity("transition.fadeIn", { duration: 200, delay: 100, });
		}
	} else {
		if($(input).prev().is(':visible')){
			$(input).prev().velocity("transition.fadeOut", { duration: 200, delay: 100, });
		}
	}
}

function home_valid_email(email){
	var valid = true;
	if(typeof base_input_field === 'object'){
		if("email" in base_input_field){
			if(typeof base_input_field["email"].valid === "function" && typeof base_input_field["email"].error_msg === "function"){
				if(!base_input_field["email"].valid(email)){
					var data = base_input_field["email"].error_msg();
					if(typeof base_show_error === 'function'){
						base_show_error(data.msg, true);
					}
					valid = false;
				}
			}
		}
	}
	return valid;
}

$("#home_signin_link").click(function(){
	if(typeof account_show !== 'undefined') { account_show(true); }
});

$("#home_news_email").on({
	focus: function(){ home_display_label(this, false, true); },
	blur: function(){ home_display_label(this, false); },
	change: function(){ home_display_label(this, false, true); },
	copy: function(){ home_display_label(this, true, true); },
	past: function(){ home_display_label(this, true, true); },
	cut: function(){ home_display_label(this, true, true); },
	keyup: function(e) {
		if (e.which != 13) {
			home_display_label(this, true, true);
		}
	},
	keypress: function(e) {
		if (e.which == 13) {
			$("#home_news_submit").click();
		} else {
			home_display_label(this, true, true);
		}
	},
});

$("#home_news_submit").click(function(){
	var email = $("#home_news_email").val();
	email = email.toLowerCase();
	if(home_valid_email(email)){
		mailchimp_ajax(email);
	}
});

$("#home_news_submit").keydown(function(){
	$('#home_news_submit').addClass('home_news_submit');
});
$("#home_news_submit").keyup(function(){
	$('#home_news_submit').removeClass('home_news_submit');
});

$("#home_main_image").css("background-image","url("+home_img['home_main_image']+")");
$("#home_done").css("background-image","url("+home_img['home_done']+")");

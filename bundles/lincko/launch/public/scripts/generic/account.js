
var account_joinus_cb_begin = function(){
	account_hide_error();
	$(document.body).css('cursor', 'progress');
	$('#account_joinus_submit_progress').css("display", "block");
	$('#account_joinus_submit_progress').removeClass('display_none');
	base_format_form_single($('#account_joinus_submit_progress'));
};

var account_signin_cb_begin = function(){
	account_hide_error();
	$(document.body).css('cursor', 'progress');
	$('#account_signin_submit_progress').css("display", "block");
	$('#account_signin_submit_progress').removeClass('display_none');
	base_format_form_single($('#account_signin_submit_progress'));
};

var account_forgot_cb_begin = function(){
	account_hide_error();
	$(document.body).css('cursor', 'progress');
	$('#account_forgot_submit_progress').css("display", "block");
	$('#account_forgot_submit_progress').removeClass('display_none');
	base_format_form_single($('#account_forgot_submit_progress'));
};

var account_reset_cb_begin = function(jqXHR, settings){
	account_hide_error();
	$(document.body).css('cursor', 'progress');
	$('#account_reset_submit_progress').css("display", "block");
	$('#account_reset_submit_progress').removeClass('display_none');
	base_format_form_single($('#account_reset_submit_progress'));
	//Initialize credential
	account_credential = {};
	if(settings.data){
		var data = JSON.parse(settings.data);
		if(typeof data == 'object'){
			for(var i in data){
				if(typeof data[i].name == 'string' && typeof data[i].value == 'string'){
					if(data[i].name == 'email'){
						account_credential.email = data[i].value;
					}
					if(data[i].name == 'password'){
						account_credential.password = data[i].value;
					}
				}
			}
		}
	}
};



var account_joinus_cb_success = account_signin_cb_success = function(msg, err, status, data){
	var field = 'undefined';
	if(typeof data.field !== 'undefined') { field = data.field; }
	if(err){
		$('#account_error').html(wrapper_to_html(msg));
		$("#account_error").velocity("transition.slideDownIn", { duration: 500, delay: 100, });
		$("#account_joinus_form input[name="+field+"]").addClass('base_input_text_error').focus();
	} else {
		window.location.href = account_link['root'];
	}
};

var account_forgot_cb_success = function(msg, err, status, data){
	var field = 'undefined';
	var email = "";
	var reset = false;
	if(typeof data.field != 'undefined') { field = data.field; }
	if(typeof data.email != 'undefined') { email = data.email; }
	if(typeof data.reset != 'undefined') { reset = data.reset; }
	if(err){
		$('#account_error').html(wrapper_to_html(msg));
		$("#account_error").velocity("transition.slideDownIn", { duration: 500, delay: 100, });
		$("#account_signin_form input[name="+field+"]").addClass('base_input_text_error').focus();
		if(reset){
			account_reset_time_left(0);
		}
	} else {
		account_reset_time_left_init(email);
		account_show('reset');
	}
};

var account_reset_cb_success = function(msg, err, status, data){
	var field = 'undefined';
	if(typeof data.field !== 'undefined') { field = data.field; }
	if(err){
		$('#account_error').html(wrapper_to_html(msg));
		$("#account_error").velocity("transition.slideDownIn", { duration: 500, delay: 100, });
		$("#account_joinus_form input[name="+field+"]").addClass('base_input_text_error').focus();
	} else {
		$('#account_signin_email').val(account_credential.email).focus();
		$('#account_signin_password').val(account_credential.password).focus();
		$('#account_signin_submit').submit();
	}
};



var account_joinus_cb_error = account_signin_cb_error = account_forgot_cb_error = account_reset_cb_error = function(xhr_err, ajaxOptions, thrownError){
	var msgtp = Lincko.Translation.get('wrapper', 1, 'html'); //Communication error
	$('#account_error').html(msgtp);
	if($('#account_error').is(':hidden')){
		$("#account_error").velocity("transition.slideDownIn", { duration: 500, delay: 100, });
	}
};

var account_credential = {};

var account_joinus_cb_complete = function(){
	$(document.body).css('cursor', '');
	$('#account_joinus_submit_progress').addClass('display_none');
};

var account_signin_cb_complete = function(){
	$(document.body).css('cursor', '');
	$('#account_signin_submit_progress').addClass('display_none');
};

var account_forgot_cb_complete = function(){
	$(document.body).css('cursor', '');
	$('#account_forgot_submit_progress').addClass('display_none');
};

var account_reset_cb_complete = function(){
	$(document.body).css('cursor', '');
	$('#account_reset_submit_progress').addClass('display_none');
	account_credential = {};
};


var global_select = false; //'joinus', 'signin', 'forgot', 'reset'

function account_show(select) {
	if(select == global_select){
		return false;
	}
	if(typeof select=="boolean"){
		if(select){
			select = 'signin';
		} else {
			select = 'joinus';
		}
	}
	if(select=='signin' || select=='joinus'){
		$('#account_tab_lincko_back').addClass('display_none');
	} else {
		$('#account_tab_lincko_back').removeClass('display_none');
	}
	if(typeof select=="undefined"){ select = 'joinus'; }
	$('#account_wrapper').css('z-index',1500).css("display", "table");
	$('#base_wrapper').addClass('blur');
	account_select(select);
}

function account_hide() {
	if(!isMobileApp()){
		$('#account_wrapper').css('z-index',-1).hide();
		$('#base_wrapper').removeClass('blur');
	}
}

function account_select(select) {
	global_select = select;
	$('#account_signin_box, #account_joinus_box, #account_forgot_box, #account_reset_box').addClass('display_none');
	$('#account_tab_joinus, #account_tab_signin').removeClass('account_trans').addClass('display_none');
	$('#account_tab_joinus > div, #account_tab_signin > div').removeClass('account_tab_joinus').removeClass('account_tab_signin');
	account_hide_error();
	if(select == 'forgot'){
		$('#account_forgot_box').removeClass('display_none');
		$('#account_forgot_email').focus();
	} else if(select == 'reset'){
		$('#account_reset_box').removeClass('display_none');
		$('#account_reset_code').val("");
		$('#account_reset_password').val("");
		$('#account_reset_password').focus(); //Helps to reset the text behind
		$('#account_reset_code').focus();
	} else if(select == 'signin'){
		$('#account_signin_box').removeClass('display_none');
		$('#account_tab_joinus, #account_tab_signin').removeClass('display_none');
		$('#account_tab_joinus').addClass('account_trans');
		$('#account_tab_joinus > div').addClass('account_tab_joinus');
		if($('#account_signin_email').val() != ''){
			account_display_label($('#account_signin_email'), false);
			$('#account_signin_password').focus();
		} else {
			$('#account_signin_email').focus();
		}
	} else { // 'joinus'
		$('#account_joinus_box').removeClass('display_none');
		$('#account_tab_joinus, #account_tab_signin').removeClass('display_none');
		$('#account_tab_signin').addClass('account_trans');
		$('#account_tab_signin > div').addClass('account_tab_signin');
		//This helps to refresh the captcha image to avoid it appear unlinked
		$("#account_captcha").prop("src", $("#account_captcha").prop("src"));
		$('#account_joinus_email').focus();
	}
}

function account_hide_error() {
	if($('#account_error').is(':visible')){
		$("#account_error").velocity("transition.fadeOut", { duration: 500, delay: 100, });
	}
}

function account_display_label(input, hide_error) {
	if(hide_error){
		account_hide_error();
		$(input).removeClass('base_input_text_error');
	}
	if($(input).val().length<=0){
		//$(input).prev().css('visibility', 'visible').css('z-index', 1);
		if($(input).prev().is(':hidden')){
			$(input).prev().velocity("transition.fadeIn", { duration: 300, delay: 100, });
		}
	} else {
		//$(input).prev().css('visibility', 'hidden').css('z-index', -1);
		if($(input).prev().is(':visible')){
			$(input).prev().velocity("transition.fadeOut", { duration: 300, delay: 100, });
		}
	}
}

var account_reset_time_left_timer;
var account_reset_time_left_seconds = 0;
var account_reset_time_left = function(timeout){
	account_reset_time_left_seconds = timeout;
	if(account_reset_time_left_seconds<=0){
		account_reset_time_left_expired();
	} else {
		$('#account_reset_limit_seconds').removeClass('display_none');
		$('#account_reset_limit_time').html(account_reset_time_left_seconds);
		window.clearInterval(account_reset_time_left_timer);
		account_reset_time_left_timer = window.setInterval(function(){
			if(account_reset_time_left_seconds<=0){
				account_reset_time_left_expired();
			} else {
				$('#account_reset_limit_time').html(account_reset_time_left_seconds);
			}
			account_reset_time_left_seconds--;
			if(account_reset_time_left_seconds<0){
				account_reset_time_left_seconds = 0;
				window.clearInterval(account_reset_time_left_timer);
			}
		}, 1000);
	}
}

var account_reset_time_left_is_expired = false;
var account_reset_time_left_expired = function(){
	account_reset_time_left_is_expired = true;
	var span = $('<span>').addClass('account_reset_limit_expired').html(Lincko.Translation.get('web', 12, 'html')); //time expired
	$('#account_reset_limit_time').html(span);
	$('#account_reset_limit_seconds').addClass('display_none');
	account_reset_time_left_seconds = 0;
	window.clearInterval(account_reset_time_left_timer);
	$("#account_reset_email").val("").prop('disabled', true);
	$("#account_reset_code, #account_reset_password").val("").prop('disabled', true);
	$("#account_reset_code, #account_reset_password").parent().addClass("account_no_cursor");
	$("#account_reset_submit").addClass("account_no_cursor account_reset_submit_disabled").prop('disabled', true);
	$('#account_reset_password').blur(); //Helps to reset the text behind
	$('#account_reset_code').blur();
	account_hide_error();
}
var account_reset_time_left_init = function(email){
	account_reset_time_left_is_expired = false;
	$("#account_reset_email").prop('disabled', false).val(email);
	$("#account_reset_code, #account_reset_password").prop('disabled', false);
	$("#account_reset_code, #account_reset_password").parent().removeClass("account_no_cursor");
	$("#account_reset_submit").removeClass("account_no_cursor account_reset_submit_disabled").prop('disabled', false);
	account_reset_time_left(600); //Set timeout to 10 minutes
}

$('#account_close').click(function(){
	account_hide();
});

$('#account_tab_joinus').click(function(){
	account_show('joinus');
});

$('#account_tab_signin').click(function(){
	account_show('signin');
});

$('#account_signin_forgot').click(function(){
	account_show('forgot');
});

$('#account_error').click(function(){
	account_hide_error();
});

$("#account_joinus_email, #account_joinus_password, #account_joinus_captcha, #account_signin_email, #account_signin_password, #account_forgot_email, #account_reset_code, #account_reset_password").on({
	focus: function(){ account_display_label(this, false); },
	click: function(){ account_display_label(this, false); },
	blur: function(){ account_display_label(this, false); },
	change: function(){ account_display_label(this, false); },
	copy: function(){ account_display_label(this, true); },
	past: function(){ account_display_label(this, true); },
	cut: function(){ account_display_label(this, true); },
	keyup: function(e) {
		if (e.which != 13) {
			account_display_label(this, true);
		}
	},
	keypress: function(e) {
		if (e.which == 13) {
			$(this.form).submit();
		} else {
			account_display_label(this, true);
		}
	},
});

$("#account_joinus_submit, #account_signin_submit").keypress(function (e) {
	if (e.which == 13) {
		$(this.form).submit();
	}
});

$("#account_joinus_submit, #account_signin_submit, #account_forgot_submit, #account_reset_submit").click(function(){
	account_reset_autocompletion();
	$(this.form).submit();
});

//This help to clear the email field if there was an autocompletion issue (sometime chrome does keep empty after autocompletion, the yellow backgroubd effect)
var account_reset_autocompletion = function(){
	var joinus = $('#account_joinus_email').val();
	var signin = $('#account_signin_email').val();
	$('#account_joinus_email').val(joinus+'contact@lincko.com');
	$('#account_signin_email').val(signin+'contact@lincko.com');
	$('#account_joinus_email').val(joinus);
	$('#account_signin_email').val(signin);
}

$("#account_joinus_submit").keydown(function(e){
	if (e.which == 13) {
		$('#account_joinus_submit').addClass('account_joinus_submit_active');
	}
});
$("#account_joinus_submit").keyup(function(){
	$('#account_joinus_submit').removeClass('account_joinus_submit_active');
});

$("#account_signin_submit").keydown(function(e){
	if (e.which == 13) {
		$('#account_signin_submit').addClass('account_signin_submit_active');
	}
});
$("#account_signin_submit").keyup(function(){
	$('#account_signin_submit').removeClass('account_signin_submit_active');
});


//This help to clear the email field if there was an autocompletion issue (sometime chrome does keep empty after autocompletion, the yellow backgroubd effect)
$('#account_joinus_email').on('blur', function(){
	account_reset_autocompletion();
});
$('#account_signin_email').on('blur', function(){
	account_reset_autocompletion();
});

$("#account_joinus_password_show").click(function(){
	$("#account_joinus_password").attr('type', 'text');
	$("#account_joinus_password_show").addClass('display_none');
});

$("#account_joinus_password").addClass('base_input_text_error').on({
	blur: function(){
		$("#account_joinus_password").attr('type', 'password');
		$("#account_joinus_password_show").removeClass('display_none');
		$("#account_joinus_password_tooltip").removeClass('account_input_focus');
	},
	focus: function(){
		account_joinus_password_tooltip();
	},
	change: function(){ account_joinus_password_tooltip(); },
	copy: function(){ account_joinus_password_tooltip(); },
	past: function(){ account_joinus_password_tooltip(); },
	cut: function(){ account_joinus_password_tooltip(); },
	keyup: function() { account_joinus_password_tooltip(); },
});

$('#account_tab_lincko_back').click(function(){
	account_show(true);
})

var account_joinus_password_tooltip = function(){
	if(base_input_field.password.valid($("#account_joinus_password").val())){
		$("#account_joinus_password_tooltip").removeClass('account_input_focus');
	} else {
		$("#account_joinus_password_tooltip").addClass('account_input_focus');
	}
}

webworker_operation.account_show = function(select){
	account_show(select);
}

JSfiles.finish(function(){
	account_display_label($('#account_signin_email'), false);
	//Important: Note that getTimezoneOffset() is return posit value number (-8H for China instead of 8H)
	//Reason is specs: http://stackoverflow.com/questions/21102435/why-does-javascript-date-gettimezoneoffset-consider-0500-as-a-positive-off
	var timeoffset = (new Date()).getTimezoneOffset();
	timeoffset = Math.floor(timeoffset/60);
	if(timeoffset<0){
		timeoffset = 24 + timeoffset; //24H - offset
	}
	if(timeoffset>=24){
		timeoffset = 0;
	}
	$('#account_joinus_timeoffset').val(timeoffset);
});

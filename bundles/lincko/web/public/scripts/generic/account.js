var global_select = true; //true = Join us / false = Sign in

var account_joinus_cb_success = function(msg, err){
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
		$('#account_error').html(msgtp);
		$("#account_error").velocity("transition.slideDownIn", { duration: 500, delay: 100, });
		$("#account_joinus_form input[name="+field+"]").addClass('base_input_text_error').focus();
	} else {
		window.location.href = account_link['root'];
	}
};

var account_signin_cb_success = function(msg, err){
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
		$('#account_error').html(msgtp);
		$("#account_error").velocity("transition.slideDownIn", { duration: 500, delay: 100, });
		$("#account_signin_form input[name="+field+"]").addClass('base_input_text_error').focus();
	} else {
		window.location.href = account_link['root'];
	}
};

var account_joinus_cb_error = account_signin_cb_error = function(xhr_err, ajaxOptions, thrownError){
	var msgtp = Lincko.Translation.get('wrapper', 1, 'html'); //Communication error
	$('#account_error').html(msgtp);
	if($('#account_error').is(':hidden')){
		$("#account_error").velocity("transition.slideDownIn", { duration: 500, delay: 100, });
	}
};

var account_joinus_cb_begin = function(){
	account_hide_error();
	$(document.body).css('cursor', 'progress');
	base_format_form_single($('#account_joinus_submit_progress'));
	$('#account_joinus_submit_progress').css("display", "block");
	$('#account_joinus_submit_progress').show();
};

var account_joinus_cb_complete = function(){
	$(document.body).css('cursor', '');
	$('#account_joinus_submit_progress').hide();
};

var account_signin_cb_begin = function(){
	account_hide_error();
	$(document.body).css('cursor', 'progress');
	base_format_form_single($('#account_signin_submit_progress'));
	$('#account_signin_submit_progress').css("display", "block");
	$('#account_signin_submit_progress').show();
};

var account_signin_cb_complete = function(){
	$(document.body).css('cursor', '');
	$('#account_signin_submit_progress').hide();
};

function account_show(select) {
	if(typeof select==="undefined"){ select = false; }
	$('#account_wrapper').css('z-index',1500).css("display", "table");
	$('#base_wrapper').addClass('blur');
	account_select(select);
}

function account_hide() {
	$('#account_wrapper').css('z-index',-1).hide();
	$('#base_wrapper').removeClass('blur');
}

function account_select(select) {
	global_select = select;
	$('#account_signin_box, #account_joinus_box').hide();
	$('#account_tab_joinus, #account_tab_signin').removeClass('account_trans');
	$('#account_tab_joinus > div, #account_tab_signin > div').removeClass('account_tab_joinus').removeClass('account_tab_signin');
	account_hide_error();
	if(select){
		$('#account_signin_box').show();
		$('#account_tab_joinus').addClass('account_trans');
		$('#account_tab_joinus > div').addClass('account_tab_joinus');
		if($('#account_signin_email').val() != ''){
			account_display_label($('#account_signin_email'), false);
			$('#account_signin_password').focus();
		} else {
			$('#account_signin_email').focus();
		}
	} else {
		$('#account_joinus_box').show();
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

$('#account_close').click(function(){
	account_hide();
});

$('#account_tab_joinus').click(function(){
	if(global_select){
		account_show(false);
	}
});

$('#account_tab_signin').click(function(){
	if(!global_select){
		account_show(true);
	}
});

$('#account_signin_forgot').click(function(){
	window.location.href = account_link['account_forgot'];
});

$('#account_error').click(function(){
	account_hide_error();
});

$("#account_joinus_email, #account_joinus_password, #account_joinus_captcha, #account_signin_email, #account_signin_password").on({
	focus: function(){ account_display_label(this, false); },
	blur: function(){ account_display_label(this, false); },
	change: function(){ account_display_label(this, false); },
	copy: function(){ account_display_label(this, true); },
	paste: function(){ account_display_label(this, true); },
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

JSfiles.finish(function(){
	account_display_label($('#account_signin_email'), false);
});

var global_select = true; //true = Join us / false = Sign in

var account_joinus_cb_success = account_signin_cb_success = function(msg, err){
	console.log(totalxhr+') '+msg);
	if(err){
		$('#account_error').html(msg);
		if($('#account_error').is(':hidden')){
			$("#account_error").velocity("transition.slideDownIn", { duration: 500 });
		}
	}
}

var account_joinus_cb_error = account_signin_cb_error = function(xhr_err, ajaxOptions, thrownError){
	alert(
		totalxhr+') '+'xhr.status => '+xhr_err.status
		+'\n'
		+'ajaxOptions => '+ajaxOptions
		+'\n'
		+'thrownError => '+thrownError
	);
}

var account_joinus_cb_begin = account_signin_cb_begin = function(){
	$(document.body).css('cursor', 'progress');
}

var account_joinus_cb_complete = account_signin_cb_complete = function(){
	$(document.body).css('cursor', '');
	//window.location.href = account_link['home'];
}

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
		$('#account_signin_email').focus();
	} else {
		$('#account_joinus_box').show();
		$('#account_tab_signin').addClass('account_trans');
		$('#account_tab_signin > div').addClass('account_tab_signin');
		$('#account_joinus_email').focus();
	}
}

function account_hide_error() {
	if($('#account_error').is(':visible')){
		$("#account_error").velocity("transition.fadeOut", { duration: 500 });
	}
}

function account_display_label(label, hide_error) {
	if(hide_error){
		account_hide_error();
	}
	if($(label).val().length<=0){
		$(label).prev().show();
	} else {
		$(label).prev().hide();
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

$("#account_joinus_email, #account_joinus_password, #account_signin_email, #account_signin_password").on({
	focus: function(){ account_display_label(this, false); },
	blur: function(){ account_display_label(this, false); },
	keyup: function(){ account_display_label(this, true); },
	change: function(){ account_display_label(this, true); },
	copy: function(){ account_display_label(this, true); },
	past: function(){ account_display_label(this, true); },
	cut: function(){ account_display_label(this, true); },
	keypress: function(e) {
		if (e.which == 13) {
			$(this.form).submit();
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


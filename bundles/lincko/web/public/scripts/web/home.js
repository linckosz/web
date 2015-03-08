
var home_cb_success = function(msg, err){
	var field = 'undefined';
	var msgtp = msg;
	if(typeof msg.field !== 'undefined') { field = msg.field; }
	if(typeof msg.msg !== 'undefined') { msgtp = php_nl2br(msg.msg); }
	if(err){
		$('#home_joinus_error').html(msgtp);
		$("#home_joinus_error").velocity("transition.slideDownIn", { duration: 500 });
		$("#home_joinus_form input[name="+field+"]").addClass('base_input_text_error').focus();
	} else {
		window.location.href = home_link['root'];
	}
};

var home_cb_error = function(xhr_err, ajaxOptions, thrownError){
	var msgtp = Lincko.Translation.get('wrapper', 1, 'html'); //Communication error
	$('#home_joinus_error').html(msgtp);
	if($('#home_joinus_error').is(':hidden')){
		$("#home_joinus_error").velocity("transition.slideDownIn", { duration: 500 });
	}
};

var home_cb_begin = function(){
	home_hide_error();
	$(document.body).css('cursor', 'progress');
	$('#home_joinus_submit_progress').show();
};

var home_cb_complete = function(){
	$(document.body).css('cursor', '');
	$('#home_joinus_submit_progress').hide();
};

var home_resize_list = [];
home_resize_list.push(["#home_main_image", 70]);
home_resize_list.push(["#home_great_projects", 30]);
home_resize_list.push(["#home_tools", 100]);
home_resize_list.push(["#home_responsive", 100]);
home_resize_list.push(["#home_done", 100]);


function home_resize_elements(){
	var height = $("#base_content").height();
	var height_tp = height;
	for(var val in home_resize_list){
		height_tp = Math.floor(height*home_resize_list[val][1]/100);
		$(home_resize_list[val][0]).css({ "height": height_tp }).css({ "min-height": height_tp });
	}
}
home_resize_elements();
$(window).resize(home_resize_elements);

function home_joinus_box_position(){
	var height = $("#home_main_image").height();
	var top = height - $("#home_joinus_submit").position().top + 6;
	$("#home_joinus_box").css({ "top": top });

	if(false && responsive.test("minTablet")){
		var scrollTop = $("#base_content").scrollTop();
		if($("#home_joinus_box").position().top<6){
			top = scrollTop + 6;
			$("#home_joinus_box").css({ "top": top });
		}
	}
}
home_joinus_box_position();
$(window).resize(home_joinus_box_position);
$("#base_content").on("scroll", home_joinus_box_position); 

function home_hide_error() {
	if($('#home_joinus_error').is(':visible')){
		$("#home_joinus_error").velocity("transition.fadeOut", { duration: 500 });
	}
}

function home_display_label(input, hide_error) {
	if(hide_error){
		home_hide_error();
		$(input).removeClass('base_input_text_error');
	}
	if($(input).val().length<=0){
		//$(input).prev().css('visibility', 'visible').css('z-index', 1);
		if($(input).prev().is(':hidden')){
			$(input).prev().velocity("transition.fadeIn", { duration: 300 });
		}
	} else {
		//$(input).prev().css('visibility', 'hidden').css('z-index', -1);
		if($(input).prev().is(':visible')){
			$(input).prev().velocity("transition.fadeOut", { duration: 300 });
		}
	}
	if($('#home_joinus_tos').is(':hidden')){
		$("#home_joinus_tos").velocity("transition.slideDownIn", { duration: 500 });
	}
}

$(".home_great_learn_more").children().click(function(){
	var container = $("#base_content");
	var scrollTo = container.height();
	$("#base_content").animate({
		scrollTop: scrollTo
	}, 700);
});

$("#home_signin_link").click(function(){
	if(typeof account_show !== 'undefined') { account_show(true); }
});

$('#home_joinus_error').click(function(){
	home_hide_error();
});

$("#home_joinus_email, #home_joinus_password, #home_joinus_captcha").on({
	focus: function(){ home_display_label(this, false); },
	blur: function(){ home_display_label(this, false); },
	change: function(){ home_display_label(this, false); },
	copy: function(){ home_display_label(this, true); },
	past: function(){ home_display_label(this, true); },
	cut: function(){ home_display_label(this, true); },
	keyup: function(e) {
		if (e.which != 13) {
			home_display_label(this, true);
		}
	},
	keypress: function(e) {
		if (e.which == 13) {
			$(this.form).submit();
		} else {
			home_display_label(this, true);
		}
	},
});

$("#home_joinus_submit").keypress(function (e) {
	if (e.which == 13) {
		$(this.form).submit();
	}
});
$("#home_joinus_submit").keydown(function(){
	$('#home_joinus_submit').addClass('home_joinus_submit_active');
});
$("#home_joinus_submit").keyup(function(){
	$('#home_joinus_submit').removeClass('home_joinus_submit_active');
});

$("#home_main_image").css("background-image","url("+home_img['home_main_image']+")");
$("#home_done").css("background-image","url("+home_img['home_done']+")");

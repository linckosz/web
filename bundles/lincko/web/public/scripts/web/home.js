
var home_cb_success = function(msg, err){
	console.log(totalxhr+') '+msg);
	if(err){
		$('#home_joinus_error').html(msg);
		if($('#home_joinus_error').is(':hidden')){
			$("#home_joinus_error").velocity("transition.slideDownIn", { duration: 500 });
		}
	}
}

var home_cb_error = function(xhr_err, ajaxOptions, thrownError){
	alert(
		totalxhr+') '+'xhr.status => '+xhr_err.status
		+'\n'
		+'ajaxOptions => '+ajaxOptions
		+'\n'
		+'thrownError => '+thrownError
	);
}

var home_cb_begin = function(){
	$(document.body).css('cursor', 'progress');
}

var home_cb_complete = function(){
	$(document.body).css('cursor', '');
	//window.location.href = head_link['home'];
}

var home_resize_list = [];
home_resize_list.push(["#home_main_image", 70]);
home_resize_list.push(["#home_great_projects", 30]);
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

var home_joinus_box_focus = false;

function home_joinus_box_position(){
	var height = $("#home_main_image").height();
	var top = height - $("#home_joinus_submit").position().top + 6;
	$("#home_joinus_box").css({ "top": top });

	if(responsive.test("minTablet")){
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

function home_joinus_box_position_mobile(){
	if(responsive.test("maxMobileL")){
		$("#base_content").animate({
			scrollTop: 100
		}, 700);
	}
}

function home_display_label(label, hide_error) {
	if(hide_error){
		if($('#home_joinus_error').is(':visible')){
			$("#home_joinus_error").velocity("transition.fadeOut", { duration: 500 });
		}
	}
	if($(label).val().length<=0){
		$(label).prev().show();
	} else {
		$(label).prev().hide();
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

$("#home_joinus_link").click(function(){
	if(typeof account_show !== 'undefined') { account_show(false); }
});

$("#home_joinus_email, #home_joinus_password").on({
	focus: function(){ home_display_label(this, false); },
	blur: function(){ home_display_label(this, false); },
	keyup: function(){ home_display_label(this, true); },
	change: function(){ home_display_label(this, true); },
	copy: function(){ home_display_label(this, true); },
	past: function(){ home_display_label(this, true); },
	cut: function(){ home_display_label(this, true); },
});

$("#home_joinus_box").on('focusin', function(){
	home_joinus_box_focus = true;
	home_joinus_box_position_mobile();
});

$("#home_joinus_box").on('focusin', function(){
	home_joinus_box_focus = false;
});

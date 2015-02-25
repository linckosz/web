
var home_cb_success = function(msg){
	alert(totalxhr+') '+msg);
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

var home_resize_list = [];
home_resize_list.push(["#home_main_image", 70]);


function home_resize_elements(){
	var height = $("#base_content").height();
	var height_tp = height;
	for(var val in home_resize_list){
		height_tp = Math.floor(height*home_resize_list[val][1]/100);
		$(home_resize_list[val][0]).css({ "height": height_tp });
	}
}
home_resize_elements();
$(window).resize(home_resize_elements);

function home_sign_box_position(){
	var height = $("#home_main_image").height();
	var top = height - $("#home_user_create_submit").position().top + 6;
	var scrollTop = $("#base_content").scrollTop();
	$("#home_signin").css({ "top": top });

	if($("#home_signin").position().top<6){
		top = scrollTop + 6;
		$("#home_signin").css({ "top": top });
	}
}
home_sign_box_position();
$(window).resize(home_sign_box_position);
$("#base_content").on("scroll", home_sign_box_position); 


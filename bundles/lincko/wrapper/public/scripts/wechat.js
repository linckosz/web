var wrapper_wechat_load = false;

$("#wrapper_wechat_later").click(function(){
	$("#base_wrapper").removeClass('wrapper_blur');
	$("#wrapper_wechat").addClass('display_none');
});

function wrapper_wechat_alert(refresh){
	if(typeof refresh == 'undefined'){
		refresh = true;
	}
	$("#wrapper_wechat").removeClass('display_none');
	$("#base_wrapper").addClass('wrapper_blur');
	if(!wrapper_wechat_load || refresh){
		wrapper_wechat_loader();
	}
}

//We do not need to generate a dynamic QR code to follow the official account since we do not use it for login system here
//We keep the code, just in case we use it for login later
function wrapper_wechat_loader(){
	//$('#wrapper_wechat_qrcode').attr('src', wrapper_neutral.src); //Change to a transarency picture
	//$('#wrapper_wechat_qrcode').attr('src', wrapper_wechat_login_qrcode());
	wrapper_wechat_load = true;
}

if(wrapper_wechat_show_official){
	wrapper_wechat_loader();
}

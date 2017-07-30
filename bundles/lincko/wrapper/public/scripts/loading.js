$("#wrapper_loading_home").click(function(){
	if(isMobileApp()){
		//window.location.href = wrapper_link['root']; //refresh
		wrapper_sendAction('','post','user/signout', null, null, wrapper_signout_cb_begin, wrapper_signout_cb_complete);
	} else {
		window.location.href = wrapper_link['home'];
	}
});

//Do not show the button if in App mode
if(isMobileApp()){
	$("#wrapper_loading_home").addClass('display_none');
}

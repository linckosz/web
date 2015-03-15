function app_project_quick_upload_display(Elem, show) {
	var Obj_div = $('#app_project_quick_upload');
	var Obj_img = $('#app_project_quick_upload > div > label > img');
	var timing = 200;
	if(typeof show === 'undefined') { show = true; }
	if(Elem !== null) {
		if(Elem.length > 0){
			Obj_div.css('margin-bottom', $(window).height() - Elem.offset().top);
		}
	}
	if(Obj_div.is(':visible')){
		$.Velocity.RunSequence([
			{ e: Obj_div, p: "transition.slideDownOut", o: { duration: timing, sequenceQueue: false } },
			{ e: Obj_img, p: "transition.expandOut", o: { duration: timing, sequenceQueue: false } }
		]);
	} else if(Obj_div.is(':hidden') && show){
		$.Velocity.RunSequence([
			{ e: Obj_div, p: "transition.slideUpIn", o: { duration: timing, sequenceQueue: false } },
			{ e: Obj_img, p: "transition.expandIn", o: { duration: timing, sequenceQueue: false } }
		]);
	}

}

$('#app_project_close').click(function(){
	if(typeof app_application !== 'undefined'){
		app_application.move('project');
	}
});

$('#app_project_quick_access_upload').click(function(){
	app_project_quick_upload_display($(this));
});

$('html').click(function(){
	if($('#app_project_quick_upload').is(':visible') && !app_project_quick_upload){
		app_project_quick_upload_display(null, false);
	}
});

var app_project_quick_upload = false;
$('#app_project_quick_upload').hover(function(){
	app_project_quick_upload = true;
});
$('#app_project_quick_upload').mouseleave(function(){
	app_project_quick_upload = false;
});


var onAfterPhotoCapture = function(){
	alert('uploaded');
}

var device_supported = true;
bridgeit.notSupported = function(id, command)  {
	device_supported = false;
};

$('#app_project_quick_upload_photo').click(function(){
	bridgeit.camera(
		'cameraBtn',
		'onAfterPhotoCapture',
		{postURL:'http://api.bridgeit.mobi/echo/'}
	);
	//If teh device does not support the function, we use normal input method
	if(!device_supported){
		//$("#input").trigger("focus").val($("#input").val() + 'a')
		//$("#app_project_quick_upload_form_photo").focus().val($("#app_project_quick_upload_form_photo").val() + 'a');

	}
	device_supported = true; //This is important to keep device_supported at TRUE for next call
});

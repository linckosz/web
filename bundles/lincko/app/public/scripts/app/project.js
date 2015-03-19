function app_project_quick_upload_display(Elem, show) {
	var Obj_div = $('#app_project_quick_upload');
	var Obj_img = $('#app_project_quick_upload > div > img');
	var timing = 200;
	if(typeof show === 'undefined') { show = true; }
	if(Elem !== null) {
		if(Elem.length > 0){
			Obj_div.css('margin-bottom', $(window).height() - Elem.offset().top);
		}
	}
	if(Obj_div.is(':visible')){
		$('#app_project_quick_upload_block').hide();
		$.Velocity.RunSequence([
			{ e: Obj_div, p: "transition.slideDownOut", o: { duration: timing, sequenceQueue: false } },
			{ e: Obj_img, p: "transition.expandOut", o: { duration: timing, sequenceQueue: false } }
		]);
	} else if(Obj_div.is(':hidden') && show){
		$('#app_project_quick_upload_block').show();
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

$('#app_project_quick_upload_block').click(function(){
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

function app_project_upload(form){
	
	var bar = $('#app_project_progress_bar');
	var percent = $('#app_project_progress_percent');
	var status = $('#app_project_progress_status');

	form.ajaxForm({
		beforeSend: function() {console.log('beforeSend');
			status.empty();
			var percentVal = '0%';
			bar.width(percentVal)
			percent.html(percentVal);
		},
		uploadProgress: function(event, position, total, percentComplete) {console.log('uploadProgress');
			console.log(event);
			console.log(position);
			console.log(total);
			console.log(percentComplete);
			var percentVal = percentComplete + '%';
			bar.width(percentVal)
			percent.html(percentVal);
		},
		success: function() {console.log('success');
			var percentVal = '100%';
			bar.width(percentVal)
			percent.html(percentVal);
		},
		complete: function(xhr) {console.log('complete');
			status.html(xhr.responseText);
		}
	});
}

$('#app_project_quick_upload_video').click(function(){
	$('#app_project_quick_file_iframe').contents().find('#api_file_shangzai_puk').val($.cookie("shangzai_puk"));
	$('#app_project_quick_file_iframe').contents().find('#api_file_shangzai_cs').val($.cookie("shangzai_cs"));
	var input = $('#app_project_quick_file_iframe').contents().find('#api_file_form_video');
	input.off('change');
	input.change(function(){
		var form = $('#app_project_quick_file_iframe').contents().find('#api_file_form');
		app_project_upload(form);
		form.submit();
		$(this).off('change');
		$(this).val('');
		app_project_quick_upload_display(null, false);
	});
	input.click();
});

$('#app_project_quick_upload_photo').click(function(){
	$('#app_project_quick_file_iframe').contents().find('#api_file_shangzai_puk').val($.cookie("shangzai_puk"));
	$('#app_project_quick_file_iframe').contents().find('#api_file_shangzai_cs').val($.cookie("shangzai_cs"));
	var input = $('#app_project_quick_file_iframe').contents().find('#api_file_form_photo');
	input.off('change');
	input.change(function(){
		var form = $('#app_project_quick_file_iframe').contents().find('#api_file_form');
		app_project_upload(form);
		form.submit();
		$(this).off('change');
		$(this).val('');
		app_project_quick_upload_display(null, false);
	});
	input.click();
});

$('#app_project_quick_upload_files').click(function(){
	$('#app_project_quick_file_iframe').contents().find('#api_file_shangzai_puk').val($.cookie("shangzai_puk"));
	$('#app_project_quick_file_iframe').contents().find('#api_file_shangzai_cs').val($.cookie("shangzai_cs"));
	var input = $('#app_project_quick_file_iframe').contents().find('#api_file_form_files');
	input.off('change');
	input.change(function(){
		var form = $('#app_project_quick_file_iframe').contents().find('#api_file_form');
		app_project_upload(form);
		form.submit();
		$(this).off('change');
		$(this).val('');
		app_project_quick_upload_display(null, false);
	});
	input.click();
});

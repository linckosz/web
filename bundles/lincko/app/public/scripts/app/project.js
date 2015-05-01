submenu_list['app_project_new'] = {
	//Set the title of the top
	"_title": {
		"style": "title",
		"title": Lincko.Translation.get('app', 2001, 'html'), //New project
	},
	"form": {
		"style": "form",
		"title": Lincko.Translation.get('app', 3, 'html'), //Confirm
	},
	"required_fields": {
		"style": "title_small",
		"title": Lincko.Translation.get('app', 27, 'html'), //Required fields
	},
	"title": {
		"style": "input",
		"title": Lincko.Translation.get('app', 28, 'html'), //Title
		"name": "project_title_text",
		"preview": "Something",
	},

};

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
	if(responsive.test("maxTablet")){
		app_project_quick_upload_display($(this));
	} else {
		$('#app_project_quick_upload_files').click();
	}
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

$('#app_project_quick_upload_video').click(function(){
	$('#app_upload_shangzai_puk').val($.cookie("shangzai_puk"));
	$('#app_upload_shangzai_cs').val($.cookie("shangzai_cs"));
	app_project_quick_upload_display(null, false);
	var input = $('#app_upload_form_video');
	input.click();
});

$('#app_project_quick_upload_photo').click(function(){
	$('#app_upload_shangzai_puk').val($.cookie("shangzai_puk"));
	$('#app_upload_shangzai_cs').val($.cookie("shangzai_cs"));
	app_project_quick_upload_display(null, false);
	var input = $('#app_upload_form_photo');
	input.click();
});

$('#app_project_quick_upload_files').click(function(){
	$('#app_upload_shangzai_puk').val($.cookie("shangzai_puk"));
	$('#app_upload_shangzai_cs').val($.cookie("shangzai_cs"));
	app_project_quick_upload_display(null, false);
	var input = $('#app_upload_form_files');
	input.click();
});

$('#app_project_settings_img').click(function(){
	submenu_Build("settings");
});

$('#app_project_quick_access_title').click(function(){
	if($('#app_project_quick_access_title').find("[find=app_project_progress_all]").is(':visible')){
		submenu_Build("app_upload_all", true);
	}
});

function app_project_quick_access() {
	var exist;
	if(typeof app_upload_files !== 'undefined'){
		for(var index in app_upload_files.lincko_record){
			if(app_upload_files.lincko_record[index].id === Elem.id){
				exist = true;
			}
		}
		if(!exist){
			app_upload_files.lincko_record[app_upload_files.lincko_record_index++] = {
				id: "app_project_quick_access_title",
				action: function(){
					var Elem = $("#"+this.id);
					//if(app_upload_files.lincko_progressall>=100){
					if(app_upload_files.lincko_numberOfFiles <= 0){
						Elem.find("[find=app_project_upload]").hide();
						Elem.find("[find=app_project_quick_access]").show();
						Elem.removeClass('app_project_quick_access_title_prog');
						Elem.find("[find=app_project_progress_all]").hide().css('width', 0);
					} else {
						Elem.find("[find=app_project_quick_access]").hide();
						Elem.find("[find=app_project_upload]").show();
						Elem.addClass('app_project_quick_access_title_prog');
						Elem.find("[find=app_project_progress_all]").show().css('width', app_upload_files.lincko_progressall+'%');
					}
				},
			};
		}
	}
}
app_project_quick_access();

//Hide some projects if the window is not high enough
function app_project_tab() {
	var top_height = $(window).height() - $('#app_project_quick_access').height();
	$('#app_project_tab').find("[find=app_project_project]").show();
	for(var i=5; i>=2; i--){
		if($('#app_project_top').height() < top_height){
			break;
		} else {
			$('#app_project_project_'+i).hide();
		}
	}
}
app_project_tab();
$(window).resize(app_project_tab);
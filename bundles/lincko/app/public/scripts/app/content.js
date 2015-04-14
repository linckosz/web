$('#app_content_top_project').click(function(){
	if(typeof app_application !== 'undefined'){
		app_application.move('project');
	}
});

$('#app_content_top_note').click(function(){
	alert('Add a note');
});

function app_content_menu_position() {
	$('#app_content_menu').height(function(){
		if(responsive.test("maxMobileL")){
			return 48;
		} else {
			return $(window).height() - $('#app_content_top').height();
		}
	});
}
app_content_menu_position();
$(window).resize(app_content_menu_position);

function app_content_dynamic_position() {
	$('#app_content_dynamic, #app_content_dynamic > div:first').height(function(){
		if(responsive.test("maxMobileL")){
			return $(window).height() - $('#app_content_top').height() - $('#app_content_menu').height();
		} else {
			return $(window).height() - $('#app_content_top').height();
		}
	});
	$('#app_content_dynamic > div:first').width($('#app_content_dynamic').width());
}
app_content_dynamic_position();
$(window).resize(app_content_dynamic_position);

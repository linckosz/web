$('#app_content_top_project').click(function(){
	if(typeof app_application !== 'undefined'){
		app_application.move('project');
	}
});

$('#app_content_top_menu').click(function(){
	if(typeof app_application !== 'undefined'){
		app_application.move('menu', true);
	}
});
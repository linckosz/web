$('#app_project_close').click(function(){
	if(typeof app_application !== 'undefined'){
		app_application.move('project');
	}
});

$('#app_menu_close').click(function(){
	if(typeof app_application !== 'undefined'){
		app_application.move('menu', true);
	}
});
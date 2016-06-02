$('#app_content_top_project').click(function(){
	if(typeof app_application !== 'undefined'){
		app_application.move('project');
	}
});


$('#app_content_top_note').click(function(){
	//submenu_Build("test", true, false);
	//app_upload_open_files(null, null, true, true);
	//app_upload_open_files('notes', 61);
	app_upload_open_files('tasks', 130);
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
var app_content_menu_position_timer;
$(window).resize(function(){
	clearTimeout(app_content_menu_position_timer);
	app_content_menu_position_timer = setTimeout(app_content_menu_position, wrapper_timeout_timer);
});

function app_content_dynamic_position() {
	$('#app_content_dynamic, #app_content_dynamic_sub').height(function(){
		if(responsive.test("maxMobileL")){
			return $(window).height() - $('#app_content_top').height() - $('#app_content_menu').height();
		} else {
			return $(window).height() - $('#app_content_top').height();
		}
	});
	$('#app_content_dynamic_sub').width($('#app_content_dynamic').width());
}
app_content_dynamic_position();
var app_content_dynamic_position_timer;
$(window).resize(function(){
	clearTimeout(app_content_dynamic_position_timer);
	app_content_dynamic_position_timer = setTimeout(app_content_dynamic_position, wrapper_timeout_timer);
});

var app_content_menu = {

	projects_id: null,

	menu: null,

	param: null,

	change: function(menu){
		app_content_menu.selection(app_content_menu.projects_id, menu, app_content_menu.param)
	},

	selection: function(projects_id, menu, param){
		
		//We do not allow to display anything until the personal project is available
		if(typeof projects_id === 'undefined'){ return false; }
		if(typeof menu === 'undefined'){ menu = 'tasks'; }
		if(typeof param === 'undefined'){ param = null; }

		var list = [];
		var title = base_myplaceholder;

		if(projects_id < 0){ //Workspace
			title = Lincko.storage.WORKNAME;
			list = [
				'projects',
			];
		} else if(
			   $.type(Lincko.storage.data['projects']) === 'object'
			&& $.type(Lincko.storage.data['projects'][projects_id]) === 'object'
			&& (Lincko.storage.data['projects'][projects_id]['personal_private'] == 0
				|| Lincko.storage.data['projects'][projects_id]['personal_private'] == null)
		){
			title = Lincko.storage.data['projects'][projects_id]['+title'];
			list = [
				'tasks',
				'notes',
				'chat',
			];
		} else { //My placeholder (default)
			title = base_myplaceholder;
			list = [
				'tasks',
				'notes',
				'chat',
			];
		}

		if($.inArray(menu, list) < 0){
			menu = list[0];
		}

		//Do nothing if we are in the same menu of the same project
		if(app_content_menu.projects_id == projects_id && app_content_menu.menu == menu){
			if(responsive.test("maxMobileL")){ app_application.forceClose(); }
			return true;
		}

		app_content_menu.projects_id = projects_id;
		app_content_menu.menu = menu;
		app_content_menu.param = param;

		var Elem = $('#app_content_menu');
		$('#app_content_menu_table').removeClass('display_none');
		Elem.find(".app_content_menu_icon_active").removeClass('app_content_menu_icon_active');
		Elem.find(".app_content_menu_cell").addClass('display_none');
		Elem.find(".app_content_menu_icon").off('click');

		for(var i in list){
			$('#app_content_menu_'+list[i]).removeClass('display_none');
			$('#app_content_menu_'+list[i]).find(".app_content_menu_icon").click(
				{menu: list[i]}, function(event){
					app_content_menu.change(event.data.menu);
				}
			);
		}

		$('#app_content_menu_'+menu+' div:first-child').addClass('app_content_menu_icon_active');
		$('#app_content_menu_'+menu).find(".app_content_menu_icon").off('click');

		$('#app_content_top_title_menu').html(title);

		app_layers_changePage(menu, param);

		if(responsive.test("maxMobileL")){ app_application.forceClose(); }
	},
}

$('#app_content_top_home, #app_content_top_title_menu').click(function(){
	app_content_menu.selection(-1);
});

var app_content_menu_first_launch = true;

var app_content_menu_default = function(){
	if(app_content_menu_first_launch && Lincko.storage.getMyPlaceholder() !== false){
		app_content_menu_first_launch = false;
		app_content_menu.selection(Lincko.storage.getMyPlaceholder()['_id']);
		return false;
	}
	return true;
};

//Scroll additional parameters
wrapper_IScroll_options_new['app_content_menu'] = {
	scrollX: true,
}

JSfiles.finish(function(){
	app_application_lincko.add("body_lincko", "projects", null, null, app_content_menu_default);
	app_content_menu_default();
});

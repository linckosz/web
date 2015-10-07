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
	msg = $('#app_content_menu').height()+" / "+$('#app_content_menu').width()+" / "+$('#app_content_menu').is(':visible');
	$('#app_content_menu').css("z-index", 100);
	base_show_error(msg);
}
function app_content_menu_position_old() {
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
$(window).resize(app_content_dynamic_position);

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

		app_content_menu.projects_id = projects_id;
		app_content_menu.menu = menu;
		app_content_menu.param = param;

		if(typeof param === 'undefined'){ param = null; }
		var list = [];
		var Elem = $('#app_content_menu');
		$('#app_content_menu_table').removeClass('display_none');
		Elem.find(".app_content_menu_icon_active").removeClass('app_content_menu_icon_active');
		Elem.find(".app_content_menu_cell").addClass('display_none');
		Elem.find(".app_content_menu_icon").off('click');
		var title = base_myplaceholder;

		if(projects_id < 0){ //Company
			title = Lincko.storage.COMNAME;
			list = [
				'statistics',
				'history',
			];
		} else if(
			   $.type(Lincko.storage.data[Lincko.storage.getCOMID()]) === 'object'
			&& $.type(Lincko.storage.data[Lincko.storage.getCOMID()]['projects']) === 'object'
			&& $.type(Lincko.storage.data[Lincko.storage.getCOMID()]['projects'][projects_id]) === 'object'
			&& Lincko.storage.data[Lincko.storage.getCOMID()]['projects'][projects_id]['personal_private'] == 0
		){
			title = Lincko.storage.data[Lincko.storage.getCOMID()]['projects'][projects_id]['+title'];
			list = [
				'tasks',
				'statistics',
				'history',
			];
		} else { //My placeholder (default)
			title = base_myplaceholder;
			list = [
				//'dashboard',
				'projects',
				'tasks',
				'notes',
				'calendar',
				//'statistics',
				'history',
			];
		}

		if($.inArray(menu, list) < 0){
			menu = list[0];
		}
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
	app_content_menu.selection(Lincko.storage.getMyPlaceholder()['_id'], 'dashboard');
});

var app_content_menu_first_launch = true;
JSfiles.finish(function(){	
	app_application_lincko.add(function(){
		if(app_content_menu_first_launch && typeof Lincko.storage.getMyPlaceholder() !== 'undefined'){
			app_content_menu_first_launch = false;
			$('#app_content_top_home').click();
		}
	}, "projects");
});
var app_application = {
	'project': function(force_blur){
		app_application_move_menu($('#app_application_project'), $('#app_application_content'), $('#app_application_project_block'), force_blur);
	},
	'menu': function(force_blur){
		app_application_move_menu($('#app_application_menu'), $('#app_application_main'), $('#app_application_menu_block'), force_blur);
	},
	'move': function(div, force_blur){
		if(typeof force_blur==="undefined"){ force_blur = false; }
		if(typeof this[div] !== 'undefined'){
			return this[div](force_blur);
		}
		return false;
	},
}

enquire.register(responsive.minTablet, function() { 
	if(wrapper_broswer('webkit') && $('#app_application_project').hasClass('app_application_visible')){
		$('#app_application_content').velocity({ blur: 0 }, 200);
	}
});
enquire.register(responsive.maxMobileL, function() { 
	if(wrapper_broswer('webkit') && $('#app_application_project').hasClass('app_application_visible')){
		$('#app_application_content').velocity({ blur: 4 }, 200);
	}
});

function app_application_move_menu(Elem, Blur, Block, force_blur) {
	if(typeof Blur==="undefined"){ Blur = $(null); }
	if(typeof Block==="undefined"){ Block = $(null); }
	if(typeof force_blur==="undefined"){ force_blur = false; }

	var time = 200;
	var width = 320;
	var width_child = 320;
	if(responsive.test("maxMobile")){
		width = "100%";
		width_child = $(window).width();
	}

	if(Elem.hasClass('app_application_visible')){
		time = 200;
		width = Elem.width();
		Elem.css('width', width).velocity(
			{width: 0},
			{
				duration: time,
				begin: function(){
					Elem.removeClass('app_application_width');
					$.each(Elem.find('.app_application_width_child'), function() {
						$(this).removeClass('app_application_width').css('width', width_child);
					});
					if(wrapper_broswer('webkit')){ Blur.velocity({ blur: 0 }, time); }
				},
				progress: function(){
					$(window).trigger('resize');
				},
				complete: function(){
					Elem.removeClass('app_application_visible');
					Blur.removeClass('app_application_blur');
					Block.removeClass('app_application_block_visible');
				},
			}
		);
	} else {
		time = 300;
		Elem.css('width', 0).velocity(
			{width: width},
			{
				duration: time,
				begin: function(){
					Elem.addClass('app_application_visible');
					Block.addClass('app_application_block_visible');
					$.each(Elem.find('.app_application_width_child'), function() {
						$(this).css('width', width_child);
					});
					if(responsive.test("maxMobileL") || force_blur){
						if(wrapper_broswer('webkit')){ Blur.velocity({ blur: 4 }, time); }
					}
				},
				progress: function(){
					$(window).trigger('resize');
				},
				complete: function(){
					Elem.addClass('app_application_width');
					Blur.addClass('app_application_blur');
					$.each(Elem.find('.app_application_width_child'), function() {
						$(this).addClass('app_application_width');
					});
				},
			}
		);
	}
	return true;
}

$('#app_application_project_block').click(function(){
	app_application.move('project');
});

$('#app_application_menu_block').click(function(){
	app_application.move('menu');
});


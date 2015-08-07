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

function app_project_prepare_log(){
	if(typeof app_upload_prepare_log === 'function'){
		app_upload_prepare_log();
	}
}

$('#app_project_quick_upload_video').click(function(){
	$('#app_upload_shangzai_puk').val(wrapper_get_shangzai('puk'));
	$('#app_upload_shangzai_cs').val(wrapper_get_shangzai('cs'));
	$('#app_upload_fingerprint').val(fingerprint);
	app_project_quick_upload_display(null, false);
	var input = $('#app_upload_form_video');
	input.click();
});

$('#app_project_quick_upload_photo').click(function(){
	$('#app_upload_shangzai_puk').val(wrapper_get_shangzai('puk'));
	$('#app_upload_shangzai_cs').val(wrapper_get_shangzai('cs'));
	$('#app_upload_fingerprint').val(fingerprint);
	app_project_quick_upload_display(null, false);
	var input = $('#app_upload_form_photo');
	input.click();
});

$('#app_project_quick_upload_files').click(function(){
	$('#app_upload_shangzai_puk').val(wrapper_get_shangzai('puk'));
	$('#app_upload_shangzai_cs').val(wrapper_get_shangzai('cs'));
	$('#app_upload_fingerprint').val(fingerprint);
	app_project_quick_upload_display(null, false);
	var input = $('#app_upload_form_files');
	input.click();
});

$('#app_project_settings_img').click(function(){
	submenu_Build("settings");
});


$('#app_project_project_new').click(function(){
	submenu_Build("app_project_new");
});

$('#app_project_quick_access_title').click(function(){
	if($('#app_project_quick_access_title').find("[find=app_project_progress_all]").is(':visible')){
		submenu_Build("app_upload_all", true);
	}
});

function app_project_quick_access_title(Elem){
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
}

function app_project_quick_access() {
	var exist;
	if(typeof app_application_lincko !== 'undefined' && typeof app_upload_files !== 'undefined'){
		app_application_lincko.add("app_project_quick_access_title", "upload", app_project_quick_access_title);
	}
}

//Hide some projects if the window is not high enough
function app_project_tab() {
	var limit = 100; //Just to insure to not make an infinite loop, but should be useless
	var top_height = $(window).height() - $('#app_project_quick_access').height();
	$('#app_project_tab [id^="app_project_project_open_"]').show();
	while($('#app_project_top').height() >= top_height && $('#app_project_tab [id^="app_project_project_open_"]').filter(':visible').length>1 && limit>0){
		$('#app_project_tab [id^="app_project_project_open_"]').filter(':visible').last().hide();
		limit--;
	}
}

var app_project_build = {
	
	scan: function(){
		//Limit favorite number to 5
		var max_display = 5;
		var list = Lincko.storage.getFavorites('projects', max_display, true);
		var timestamp;
		//First we scan and remove all elements that does not appear in the list
		var list_id = {};
		for(var position in list){
			list_id[list[position]['_id']] = true;
		}
		$('#app_project_tab').find('[projectvisible^="1"]').each(
			function(index, Elem ){
				if(typeof list_id[$(Elem).attr('projectid')] === 'undefined'){
					$(Elem).attr('projectvisible', 0);
				}
			}
		);
		for(var position in list){
			timestamp = list[position]['_timestamp'];
			Elem = $('#app_project_project_open_'+list[position]['_id']);
			if(Elem.length === 0){
				app_project_build.insertProject( list[position]['_type'], list[position]['_id'], list[position]['+title'], position, timestamp );
			} else {
				app_project_build.moveProject(Elem, position);
				if(Elem.attr('timestamp') != timestamp){
					app_project_build.removeProject(Elem);
				}
			}
		}

		app_project_build.removeProjectFrom(max_display);

		if(list.length<=0 && $("#app_project_project_all").is(':visible')){
			$('#app_project_project_all').velocity("slideUp", { duration: 200, complete: function(){
				app_project_tab();
			}, });
		} else if(list.length>0 && !$("#app_project_project_all").is(':visible')){
			$('#app_project_project_all').velocity("slideDown", { duration: 200, complete: function(){
				app_project_tab();
			}, });
		}
	},

	insertProject: function(item_type, item_id, item_title, position, timestamp) {
		if($('#app_project_project_open_'+item_id).length===0){
			var Elem = $('#-app_project_project_open').clone();
			Elem.prop('id', 'app_project_project_open_'+item_id);
			Elem.attr('timestamp', timestamp);
			Elem.attr('projectid', item_id);
			app_project_build.feedProject(Elem, item_title);
			Elem.click(function(){
				app_content_menu.selection(item_id, 'tasks');
			});
			Elem.hide();
			var Elem_position = $('#app_project_tab').find('[projectvisible^="1"]').eq(position);
			if(Elem_position.length==0){
				Elem.insertBefore($('#app_project_project_all'));
			} else {
				Elem.insertBefore(Elem_position);
			}
			Elem.velocity("slideDown", { duration: 200, complete: function(){
				app_project_tab();
			}, });
			app_application_lincko.add(Elem.prop('id'), item_type, app_project_build._app_feedProject, [item_id, item_type]);
			return Elem;
		}
		return false;
	},

	feedProject: function(Elem, item_title){
		var title = Elem.find("[find=app_project_project_title]");
		if(php_nl2br(item_title) != title.html()){
			if(title.html()){
				var Sequence = [
					{ e: title, p: { opacity: 0, }, o: { duration: 300,
						complete: function(){ title.html(php_nl2br(item_title)); },
					} },
					{ e: title, p: { opacity: 1, }, o: { duration: 300, sequenceQueue: true, } },
				];
				$.Velocity.RunSequence(Sequence);
			} else {
				title.html(php_nl2br(item_title));
			}
		}
	},

	_app_feedProject: function(Elem){
		var item_id = this.action_param[0];
		var item_type = this.action_param[1];
		var item = Lincko.storage.get(item_type, item_id);
		if(item && item['_timestamp'] != Elem.attr('timestamp')){
			var item_title = item['+title'];
			app_project_build.feedProject(Elem, item_title);
		}
	},

	moveProject: function(Elem, position){
		if(Elem.length>0){
			var Elem_position = $('#app_project_tab').find('[projectvisible^="1"]').eq(position);
			if(Elem.prop('id') != Elem_position.prop('id')){
				var Elem_clone = Elem.clone();
				Elem.prop('id', null);
				app_project_build.removeProject(Elem);
				Elem_clone.insertBefore(Elem_position);
				Elem_clone.velocity("slideDown", { duration: 200, complete: function(){
					app_project_tab();
				}, });
			}
		}
	},

	removeProject: function(Elem){
		if(Elem.length>0){
			$(Elem).attr('projectvisible', 0);
			Elem.velocity("slideUp", { duration: 200 });
		}
	},

	removeProjectFrom: function(max_display){
		$('#app_project_tab').find('[projectvisible^="1"]').each(
			function(index, Elem ){
				Elem = $(Elem);
				if(index >= max_display){
					$(this).attr('projectvisible', 0);
				}
			}
		);
		$('#app_project_tab').find('[projectvisible^="0"]').velocity("slideUp", { duration: 200, complete: function(){
			$(this).remove();
		}, });

	},
};

var app_project_info = {

	current: false,

	build: function(){
		var item = Lincko.storage.time('latest');
		var time = 300;
		if(Lincko.storage.isHistoryReady() && item){
			if(JSON.stringify(item) !== app_project_info.current){
				if(app_project_info.current){
					if($('#app_project_recent').is(':hidden')){
						$('#app_project_recent').show();
					}
					$('#app_project_info').clearQueue().stop().velocity(
						"transition.fadeOut",
						{
							duration: time,
							complete: function(){
								$('#app_project_info').velocity(
									"transition.fadeIn",
									{
										duration: time,
										begin: function(){
											var history = Lincko.storage.getHistoryInfo(item);
											$('#app_project_info_title').html(php_nl2br(history.title));
											$('#app_project_info_content').html(php_nl2br(history.content));
											$(this).show();
											app_project_tab();
										},
									}
								);
							},
						}
					);
				} else {
					$('#app_project_recent').clearQueue().stop().velocity(
						"transition.fadeIn",
						{
							duration: time,
							begin: function(){
								var history = Lincko.storage.getHistoryInfo(item);
								$('#app_project_info_title').html(php_nl2br(history.title));
								$('#app_project_info_content').html(php_nl2br(history.content));
								$(this).show();
								app_project_tab();
							},
						}
					);
				}
				app_project_info.current = JSON.stringify(item);
			}
		} else {
			if($('#app_project_recent').is(':visible')){
				$('#app_project_recent').velocity("transition.fadeOut", { duration: time, complete: function(){
					app_project_tab();
					$('#app_project_info_title').html('');
					$('#app_project_info_content').html('');
				}, });
			}
			app_project_info.current = false;
		}
		return true;
	},
}

/*
	Lincko.storage.searchTimer('word', 'autocut');
	Lincko.storage.searchTimer('word', 'a', 'projects');
*/
var app_project_searchTiming = null;
var app_project_searchValue = '';
var app_project_search = {

	timing: null,

	value: null,

	find: function(timer, force){
		var that = this;
		var param = $("#app_project_search").val();
		if(typeof timer !== 'number'){ timer = 600; } //Add a small timeout of 600ms to let the use be able to finish 
		if(typeof force !== 'boolean'){ force = false; }
		
		if((responsive.test("minTablet") || force) && param.length>=2 && this.value !== param){
			clearTimeout(this.timing);
			this.timing = setTimeout(function(){
				that.value = param;
				var results = Lincko.storage.search('word', param);
				if(!$.isEmptyObject(results)){

					//Do something with the result
					console.log(results);

				}
			}, timer);
		} else if(param.length<2){
			clearTimeout(this.timing);
		}
	},
};

$("#app_project_search").on({
	focus: function(){ app_project_search.find(); },
	blur: function(){
		$("#app_project_search").val('');
	},
	change: function(){ app_project_search.find(); },
	copy: function(){ app_project_search.find(); },
	past: function(){ app_project_search.find(); },
	cut: function(){ app_project_search.find(); },
	keyup: function(e) {
		if (e.which != 13) {
			app_project_search.find();
		}
	},
	keypress: function(e) {
		if (e.which == 13) {
			app_project_search.find(0, true);
		}
	},
});

$('#app_project_project_all').click(function(){
	app_content_menu.selection(Lincko.storage.getMyPlaceholder()['_id'], 'projects');
});

$('#app_project_placeholder').click(function(){
	app_content_menu.selection(Lincko.storage.getMyPlaceholder()['_id'], 'dashboard');
});

$('#app_project_info').click(function(){
	app_content_menu.selection(Lincko.storage.getMyPlaceholder()['_id'], 'history');
});

$('#app_project_company').click(function(){
	app_content_menu.selection(-1, 'statistics');
});

JSfiles.finish(function(){
	$('#app_project_recent').hide();
	app_project_quick_access();
	app_project_tab();
	app_project_build.scan();
	app_project_info.build();
	$(window).resize(app_project_tab);
	
	app_application_lincko.add(app_project_info.build);
	app_application_lincko.add(app_project_build.scan, 'projects');
	
	app_application_lincko.add("app_project_user", "users", function(){
		var username = '';
		var email = '';
		var user = Lincko.storage.get('users', wrapper_localstorage.uid);
		if(user['-firstname'] && user['-lastname']){
			username = user['-firstname'].ucfirst()+' '+user['-lastname'].ucfirst();
		} else if(user['-firstname']){
			username = user['-firstname'].ucfirst();
		} else if(user['-username']){
			username = user['-username'].ucfirst();
		}
		if(user['email']){
			email = user['email'].toLowerCase();
		}
		if(typeof user['gender'] !== 'undefined' && user['gender'] == 1){
			$('#app_project_user_image').attr('src', app_project_img_user_female.src);
		}
		$('#app_project_user_name').html(php_nl2br(username));
		$('#app_project_user_email').html(php_nl2br(email));
	});

	app_application_lincko.add("app_project_company", "companies", function(){
		$('#app_project_company div:first-child').html(php_nl2br(Lincko.storage.COMNAME));
	});
	
	app_application_lincko.update(true); //Update everything
	$('#app_project_project_all').click();
});


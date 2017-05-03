var onboarding = {
	forceOff: false,
	clickAwaySkip: false, //if true, clicking on black overlay will skip
	on: false, //will be set to true for the duration of onboarding
	project_id: null, //onboarding project id
	overlays: {}, //functions and other controls for main menu and content overlays

	fn_next: null,
	currentTrip: null,

	id_welcome_bubble: 'onboarding_welcome_bubble',
	welcome_bubble_reposition: function(tripData, duration, cb_complete){
		if(typeof duration != 'number'){ var duration = 400; }
		var elem_trip_block = $('.trip-block.onboarding_trip_welcome');
		if(!elem_trip_block.length){ return false; }

		var elem_bubble = $('#'+this.id_welcome_bubble);

		var coord = elem_trip_block.offset();
		var left = coord.left;
		var top = coord.top;

		if(tripData && tripData.position == 'n'){
			var bottom = $(window).height() - coord.top - elem_trip_block.outerHeight();
			top = coord.top + elem_trip_block.outerHeight() - elem_bubble.outerHeight();
			elem_bubble.velocity({
				left: tripData.sel.offset().left,
				bottom: bottom,
			}, {
				mobileHA: hasGood3Dsupport,
				begin: function(){
					elem_bubble.css({
						top: 'auto',
						bottom: $(window).height() - elem_bubble.offset().top - elem_bubble.outerHeight(),
					});
					//elem_bubble.css({top: 'auto', 'bottom': top});
				},
				complete: function(){
					if(typeof cb_complete == 'function'){
						cb_complete();
					}
				}
			});
		}
		else{
			elem_bubble.velocity({
				left: coord.left,
				top: coord.top,
				translateX: 0,
				translateY: 0,
			},{
				mobileHA: hasGood3Dsupport,
				duration: duration,
				begin: function(){
					if(!elem_bubble.attr('style')){
						var coord_bubble = elem_bubble.offset();
						elem_bubble.css({
							left: coord_bubble.left,
							top: coord_bubble.top,
							transform: 'none',
						});
					}
					else{
						elem_bubble.css('bottom', '');
					}
				},
				complete: function(){
					if(typeof cb_complete == 'function'){
						cb_complete();
					}
				}
			});
		}

	},

	launch: function(){ //return true if launched, return false if conditions are not fit for launch
		//onboarding launch fail
		if(onboarding.forceOff){ return false; }

		var ob_settings = Lincko.storage.getOnboarding();

		//fail conditions
		if(	   !ob_settings 
			|| !ob_settings.projects 
			|| !ob_settings.sequence 
			|| !ob_settings.projects[1] 
			|| !Lincko.storage.get('projects', ob_settings.projects[1])){ return false; }


		//this onboarding has already been completed
		if(	   	ob_settings 
			&& 	ob_settings.sequence 
			&& !ob_settings.sequence[1]){ return true; }


		//open sample project
		app_content_menu.selection(ob_settings.projects[1]);
		if(app_content_menu.projects_id != ob_settings.projects[1]){ return false; } //onboarding launch fail if not directed to sample project


		onboarding.on = true; //onboarding is on here to prevent forceOpen main menu
		return onboarding.scripts.welcome(ob_settings.projects[1]);

	}, //END OF launch

	clear_fn_list: [], //any function that needs to be run on onboarding.clear can be put here
	clear: function(submenuHide, close){
		if(typeof close != 'boolean'){
			close = true;
		}
		if(close){
			app_models_resume_onboarding_continue(null, 10102); //end onboarding
		}
		var that = this;
		onboarding.on = false;
		onboarding.currentTripInst = null;
		this.scripts.completed = {};
		this.overlays.off();
		$('#'+this.id_welcome_bubble).recursiveRemove(0);
		$('.trip-overlay').recursiveRemove();
		$(document).off('click.onboarding');
		return;

		//below is onboarding 1.0
		if(submenuHide){
			submenu_Hideall();
		}
		
		$.each(this.clear_fn_list, function(i, fn){
			if(typeof fn == 'function'){ fn(); }
		});
		that.clear_fn_list = [];
	},

	//preview true/false for the linckoBot chat submenu
	preview: false,
	//linckoBot chat submenu control
	toBot: function(id){
		if(id){ this.project_id = id; }
		else if(this.project_id){ var id = this.project_id; }
		else{ return false; }
		var preview = this.preview;

		var chatSubmenu = submenu_get('newchat', preview);
		if(chatSubmenu && chatSubmenu.param && chatSubmenu.param.type && chatSubmenu.param.type == 'history'){ //if activity feed is open
			return chatSubmenu;
		}
		else{
			return submenu_Build("newchat", false, false, {
				type: 'history',
				id: id,
				title: Lincko.storage.get('projects', id, '+title'),
			}, preview);
		}		
	},
	
	//used in resume.js
	action_launch: function(current, next, text_id, param, subm){
		//if(!this.on){ return false; } //ignore action_launch calls if onboarding is not on
		if(this.scripts.completed[param[1]]){ return false; } //check if the script has already been ran
		var that = this;
		//console.log('onboarding.action_launch: '+current+' => '+next+' => '+text_id);
		var fn_continue = function(){
			that.scripts.completed[param[1]] = true;
			app_models_resume_onboarding_continue(current, next, text_id, subm);
			if(that.on){
				that.overlays.show.content_sub();
				onboarding.toBot();
				setTimeout(function(){
					onboarding.toBot();
				}, 2000);
			}
		}
		this.scripts[param[1]](fn_continue);
	},

	//holds all the functions to be run for each action number
	scripts: {
		completed: {
			//1: true,
			//2: true,
			//etc
		},
	},



}

onboarding.overlays = {
	btnSkip: function(on){
		var id = this.id.btnSkip;
		var elem_overlay = $('#'+id);
		var exists = false;
		if(elem_overlay.length){
			exists = true;
		}

		if(typeof on == 'boolean'){
			if(on && exists){
				return elem_overlay;
			}
			else if(on && !exist){
				elem_overlay = this.build_elem(id);
				$('#body_lincko').append(elem_overlay);
			}
			else if(!on){
				elem_overlay.recursiveRemove(0);
			}
		}
		else {
			if(exists){
				return elem_overlay;
			}
			else{
				elem_overlay = this.build_elem(id);
				$('#body_lincko').append(elem_overlay);
			}
		}

		if(elem_overlay.length){
			return elem_overlay;
		}
		else{
			return false;
		}	
	},
	body: function(on){
		var id = this.id.body;
		var elem_overlay = $('#'+id);
		var exists = false;
		if(elem_overlay.length){
			exists = true;
		}

		if(typeof on == 'boolean'){
			if(on && exists){
				return elem_overlay;
			}
			else if(on && !exist){
				elem_overlay = this.build_elem(id);
				$('#body_lincko').append(elem_overlay);
			}
			else if(!on){
				elem_overlay.recursiveRemove(0);
			}
		}
		else {
			if(exists){
				return elem_overlay;
			}
			else{
				elem_overlay = this.build_elem(id);
				$('#body_lincko').append(elem_overlay);
			}
		}

		if(elem_overlay.length){
			return elem_overlay;
		}
		else{
			return false;
		}	
	},
	ini: function(){
		this.show.that = this;
		this.master.that = this;
		//this.content_menu.that = this;
		//this.content_top.that = this;
		delete this.ini;
		return this;
	},
	id: {
		btnSkip: 'onboarding_overlay_btnSkip',
		master: 'onboarding_overlay_master',
		body: 'onboarding_overlay_body',
		project: 'onboarding_overlay_project',
		content: 'onboarding_overlay_content',
		content_menu: 'onboarding_overlay_content_menu',
		content_top: 'onboarding_overlay_content_top',
		content_dynamic_sub: 'onboarding_overlay_content_dynamic_sub',
	},

	off: function(){
		this.master.off();
		this.btnSkip(false);
		this.body(false);
		this.content(false);
		this.project(false);
		this.content_menu(false);
		this.content_top(false);
		this.content_dynamic_sub(false);
	},

	show: {
		that: null,
		content_sub: function(){
			this.that.master.menu();
			this.that.content_menu();
			this.that.content_top();
		},
	},

	build_elem: function(id){
		var elem = $('<div>').prop('id',id).addClass('onboarding_overlay '+id);
		if(id == 'onboarding_overlay_btnSkip'){ 
			elem.click(function(){
				app_application_action(5); //Skip onborading step
				onboarding.forceOff = true;
				if(onboarding.currentTrip){
					onboarding.currentTrip.stop();
				}
				onboarding.clear();
				/*if(typeof onboarding.fn_next == 'function'){
					onboarding.fn_next();	
				}*/
			}).text(Lincko.Translation.get('app', 73, 'html')); //Skip
		} 
		return elem;
	},

	project: function(on){
		var id = this.id.project;
		var elem_overlay = $('#'+id);
		var exists = false;
		if(elem_overlay.length){
			exists = true;
		}

		if(typeof on == 'boolean'){
			if(on && exists){
				return elem_overlay;
			}
			else if(on && !exist){
				elem_overlay = this.build_elem(id);
				$('#app_application_project').append(elem_overlay);
			}
			else if(!on){
				elem_overlay.recursiveRemove(0);
			}
		}
		else {
			if(exists){
				return elem_overlay;
			}
			else{
				elem_overlay = this.build_elem(id);
				$('#app_application_project').append(elem_overlay);
			}
		}

		if(elem_overlay.length){
			return elem_overlay;
		}
		else{
			return false;
		}
	},
	content: function(on){
		var id = this.id.content;
		var elem_overlay = $('#'+id);
		var exists = false;
		if(elem_overlay.length){
			exists = true;
		}

		if(typeof on == 'boolean'){
			if(on && exists){
				return elem_overlay;
			}
			else if(on && !exist){
				elem_overlay = this.build_elem(id);
				$('#app_application_content').append(elem_overlay);
			}
			else if(!on){
				elem_overlay.recursiveRemove(0);
			}
		}
		else {
			if(exists){
				return elem_overlay;
			}
			else{
				elem_overlay = this.build_elem(id);
				$('#app_application_content').append(elem_overlay);
			}
		}

		if(elem_overlay.length){
			return elem_overlay;
		}
		else{
			return false;
		}
	},

	content_dynamic_sub: function(on){
		var id = this.id.content_dynamic_sub;
		var elem_overlay = $('#'+id);
		var exists = false;
		if(elem_overlay.length){
			exists = true;
		}

		if(typeof on == 'boolean'){
			if(on && exists){
				return elem_overlay;
			}
			else if(on && !exist){
				elem_overlay = this.build_elem(id);
				$('#app_content_dynamic_sub').append(elem_overlay);
			}
			else if(!on){
				elem_overlay.recursiveRemove(0);
			}
		}
		else {
			if(exists){
				return elem_overlay;
			}
			else{
				elem_overlay = this.build_elem(id);
				$('#app_content_dynamic_sub').append(elem_overlay);
			}
		}

		if(elem_overlay.length){
			return elem_overlay;
		}
		else{
			return false;
		}
	},


	//control overlay over main menu or the content area
	master: {
		that: null,
		id: null,
		off: function(){
			var id = this.that.id.master;
			if($('#'+id).length){
				$('#'+id).recursiveRemove();
			}
		},
		menu: function(){
			var id = this.that.id.master;
			this.off();
			var elem_overlay = this.that.build_elem(id);
			$('#app_application_project').append(elem_overlay);
			return elem_overlay;
		},
		content: function(){
			var id = this.that.id.master;
			this.off();
			var elem_overlay = this.that.build_elem(id);
			$('#app_application_content').append(elem_overlay);
			return elem_overlay;
		}
	},


	content_menu: function(on){
		var id = this.id.content_menu;
		var elem_overlay = $('#'+id);
		var exists = false;
		if(elem_overlay.length){
			exists = true;
		}

		if(typeof on == 'boolean'){
			if(on && exists){
				return elem_overlay;
			}
			else if(on && !exist){
				elem_overlay = this.build_elem(id);
				$('#app_content_menu').addClass('onboarding_noBorder').append(elem_overlay);
			}
			else if(!on){
				$('#app_content_menu').removeClass('onboarding_noBorder');
				elem_overlay.recursiveRemove(0);
			}
		}
		else {
			if(exists){
				return elem_overlay;
			}
			else{
				elem_overlay = this.build_elem(id);
				$('#app_content_menu').addClass('onboarding_noBorder').append(elem_overlay);
			}
		}

		if(elem_overlay.length){
			return elem_overlay;
		}
		else{
			return false;
		}
	},

	content_top: function(on){
		var id = this.id.content_top;
		var elem_overlay = $('#'+id);
		var exists = false;
		if(elem_overlay.length){
			exists = true;
		}

		if(typeof on == 'boolean'){
			if(on && exists){
				return elem_overlay;
			}
			else if(on && !exist){
				elem_overlay = this.build_elem(id);
				$('#app_content_top').append(elem_overlay);
			}
			else if(!on){
				elem_overlay.recursiveRemove(0);
			}
		}
		else {
			if(exists){
				return elem_overlay;
			}
			else{
				elem_overlay = this.build_elem(id);
				$('#app_content_top').append(elem_overlay);
			}
		}

		if(elem_overlay.length){
			return elem_overlay;
		}
		else{
			return false;
		}
	},

}.ini();


//welcome onboarding
onboarding.scripts['welcome'] = function(project_id){

	if(!$('#'+onboarding.id_welcome_bubble).length){
		$('body').append($('<div>').prop('id', onboarding.id_welcome_bubble).addClass(onboarding.id_welcome_bubble));
	}

	if(!$('#'+onboarding.id_welcome_bubble).is(':visible')){ return false; }
	

	//passed the check, begin initialization
	onboarding.overlays.body();
	onboarding.overlays.btnSkip();
	if(onboarding.clickAwaySkip){
		$(document).on('click.onboarding', function(event){
			var elem_target = $(event.target);
			if(elem_target.hasClass('onboarding_overlay_body') || elem_target.hasClass('onboarding_overlay_content') ||  elem_target.hasClass('onboarding_overlay_content_dynamic_sub') || elem_target.hasClass('trip-overlay')){
				if(typeof onboarding.fn_next == 'function'){
					onboarding.fn_next();
				}
			}
		});
	}

	//tracker to make sure trip only runs once
	var tripTracker = {
		check: function(tripObj, i){
			if(this[tripObj.id_trip][i]){ return true; }
			else{
				tripTracker[tripObj.id_trip][i] = true;
				return false;
			}
		},
	}

	var array_openMainMenu = [
		{
			sel: $('#app_application_menu_icon'),
			content: 'LINCKO',
			position : "s",
			expose : true,
			delay: -1,
			onTripStart : function(i, tripData){
				if(tripTracker.check(this, i)){ 
					if($('#app_application_project').hasClass('app_application_visible')){
						tripData.sel.removeClass('trip-exposed'); 
					}
					return false;
				}
				var tripObj = this;			
				
				tripData.sel.off('click.trip').on('click.trip', function(event){
					$(this).off('click.trip');
					event.stopPropagation();
					$(this).removeClass('trip-exposed');
					onboarding.overlays.project().css('opacity', 0);
					var id_onboarding_garbage_mainMenuOpen = app_application_garbage.add('onboarding_garbage_mainMenuOpen');
					app_application_lincko.add(id_onboarding_garbage_mainMenuOpen, 'mainmenu_open_complete', 
						function(){
							app_application_garbage.remove(id_onboarding_garbage_mainMenuOpen);
							tripObj.stop();
						}
					);
				});

				var fn_next = function(){
					$('#app_application_menu_icon').click();
				}
				intro.gotoStep(1, fn_next);
				onboarding.fn_next = fn_next;
				onboarding.welcome_bubble_reposition(null, 700);
			},
		},
	];
	var trip_openMainMenu = new Trip(array_openMainMenu, {
		enableKeyBinding: false,
		overlayHolder: '#app_application_content',
		tripClass: 'onboarding_trip_welcome',
		onStart: function(){
			onboarding.currentTrip = this;
			this.id_trip = 'openMainMenu';
			tripTracker[this.id_trip] = {};
		},
		onEnd: function(var1, var2){
			$('#app_application_menu_icon').off('click.trip');
			if(onboarding.forceOff){ return false; }
			onboarding.overlays.content().css('opacity', 0);
			delete trip_openMainMenu;
			trip_exploreMainMenu.start();
		}
	});

	var array_exploreMainMenu = [
		{
			sel: $('#app_project_projects_new'),
			content: 'new project',
			position : 'e',
			expose: true,
			delay: -1,
			onTripStart : function(i, tripData){
				//force open main menu if closed
				if(!$('#app_application_project').hasClass('app_application_visible')){
					app_application.move('project', true);
				}
				onboarding.welcome_bubble_reposition();
				if(tripTracker.check(this, i)){return false;}

				var tripObj = this;
				onboarding.overlays.content().attr('style', '');

				var elem_overlay_project = onboarding.overlays.project().off('click.trip').on('click.trip', function(event){
					var elem_overlay = $(this);
					if(tripObj.tripIndex == 1){
						$(this).off('click.trip');
					}
					
					//if the main menu overlay was clicked, flash
					if($(event.target).hasClass('onboarding_overlay')){
						elem_overlay.velocity({opacity: 0}, {
							mobileHA: hasGood3Dsupport,
							begin: function(){
								$('#app_project_chats_tab').attr('style', '');
								elem_overlay.css({
									'background-color': '#FFFFFF',
									opacity: 1,
									border: '4px solid #FFFFFF',
								});
							},
						});
					}

					if(tripObj.tripIndex == 1){
						$(this).off('click.trip');

						//if main menu is closed, no close animation
						if(!$('#app_application_project').hasClass('app_application_visible')){
							tripObj.stop();
							return;
						}

						$('#app_application_menu_icon').velocity('fadeOut', {
							mobileHA: hasGood3Dsupport,
							begin: function(){
								$('#'+onboarding.id_welcome_bubble).velocity({left: 50, top: 58}, {
									mobileHA: hasGood3Dsupport,
									begin: function(){
										$('#'+onboarding.id_welcome_bubble).css({top: $('#'+onboarding.id_welcome_bubble).offset().top, bottom: ''});
									}
								});
								$('#app_application_menu_icon').css({
									outline: '4px solid #FFFFFF',
								});
							},
						}).velocity('fadeIn', {
							mobileHA: hasGood3Dsupport,
							complete: function(){
								$('#app_application_menu_icon').attr('style', '');
								app_application.move('project', true);
								tripObj.stop();
								//trip_exploreContent.start();
							}
						});								
					}
					else{
						tripObj.next();
					}
				});
				var fn_next = function(){
					elem_overlay_project.trigger('click.trip');
				}
				intro.gotoStep(2, fn_next);
				onboarding.fn_next = fn_next;
				var cb_complete = function(){
					setTimeout(function(){
						$('.trip-overlay').velocity({opacity: 0},{mobileHA: hasGood3Dsupport,});
					}, 2000);
				}
				onboarding.welcome_bubble_reposition(null, null, cb_complete);
			},
			onTripEnd : function(i, tripData){
				$('#app_project_projects_new').attr('style', '');
			}
		},
		{
			sel: $('#app_project_chats_tab'),
			content: 'chats tab',
			position : "e",
			expose: true,
			delay: -1,
			onTripStart : function(i, tripData){
				//force open main menu if closed
				if(!$('#app_application_project').hasClass('app_application_visible')){
					app_application.move('project', true);
				}
				onboarding.welcome_bubble_reposition(tripData);
				$('#app_project_projects_new').attr('style', '');
				if(tripTracker.check(this, i)){return false;}

				
				tripData.sel.css('border', '4px solid #FFFFFF');
				$('.trip-overlay').css('opacity', '');
				setTimeout(function(){
					$('.trip-overlay').velocity({opacity: 0},{mobileHA: hasGood3Dsupport,});
				}, 2000);

				var fn_next = function(){
					onboarding.overlays.project().trigger('click.trip');
				}
				intro.gotoStep(3, fn_next);
				onboarding.fn_next = fn_next;
				onboarding.welcome_bubble_reposition(tripData);
			},
			onTripEnd: function(i, tripData){
				//tripData.sel.attr('style', '');
			}
		},
	];
	var trip_exploreMainMenu = new Trip(array_exploreMainMenu, {
		enableKeyBinding: false,
		overlayHolder: '#app_project_content .iscroll_sub_div',
		tripClass: 'onboarding_trip_welcome onboarding_trip_exploreMainMenu',
		onStart: function(){
			onboarding.currentTrip = this;
			this.id_trip = 'exploreMainMenu';
			tripTracker[this.id_trip] = {};

			if(responsive.test("maxMobileL")){
				this.tripData[0].position = 's';
				this.tripData[1].position = 's';
			}
			else{
				this.tripData[0].content = '<div style="height: 100px;"></div>';
				this.tripData[1].content = '<div style="height: 100px;"></div>';
			}

			onboarding.overlays.content();
			$('#app_project_projects_new').off('click.trip').addClass('onboarding_forceAbsolute');

			
		},
		onEnd: function(){
			$('#app_project_chats_tab').attr('style', '');
			if(onboarding.forceOff){ return false; }
			//if main menu is opened
			if($('#app_application_project').hasClass('app_application_visible')){
				var id_onboarding_garbage_mainMenuClose = app_application_garbage.add('onboarding_garbage_mainMenuClose');
				app_application_lincko.add(id_onboarding_garbage_mainMenuClose, 'mainmenu_close_complete', 
					function(){
						app_application_garbage.remove(id_onboarding_garbage_mainMenuClose);
						onboarding.overlays.project().attr('style', '');
						setTimeout(function(){
							trip_exploreContentTop.start();
						}, 1000);
					}
				);
			}
			else{
				onboarding.overlays.project().attr('style', '');
				trip_exploreContentTop.start();
			}
			
			
			delete trip_exploreMainMenu;
		}
	});


	var array_exploreContentTop = [
		{
			sel: $('#app_content_top_title_menu'),
			content: '<div style="width: 120px;">project_settings</div>',
			position : "s",
			expose: true,
			delay: -1,
			onTripStart : function(i, tripData){
				//force close main menu if open
				if(responsive.test("maxMobileL") && $('#app_application_project').hasClass('app_application_visible')){
					app_application.move('project', false);
				}
				onboarding.welcome_bubble_reposition();
				if(tripTracker.check(this, i)){return false;}
				var tripObj = this;
				onboarding.overlays.content(false);
				onboarding.overlays.content_dynamic_sub();
				onboarding.overlays.content_menu();
				onboarding.overlays.content_top().css('opacity', 0).off('click.trip').on('click.trip', function(event){
					var elem_overlay = $(this);

					//if next is triggered by clicking on overlay, flash
					if($(event.target).hasClass('onboarding_overlay')){
						elem_overlay.velocity({opacity: 0}, {
							mobileHA: hasGood3Dsupport,
							begin: function(){
								elem_overlay.css({
									'background-color': '#FFFFFF',
									opacity: 1,
									border: '4px solid #FFFFFF',
								});
							},
							complete: function(){
								onboarding.overlays.content_top().attr('style', '');
								tripObj.stop();
							}
						});
					}
					$(this).off('click.trip');
				});

				var fn_next = function(){
					onboarding.overlays.content_top().attr('style', '');
					onboarding.overlays.content_top().off('click.trip');
					tripObj.stop();
				}
				intro.gotoStep(4, fn_next);
				onboarding.fn_next = fn_next;
				onboarding.welcome_bubble_reposition();
			},
		}
	];

	var trip_exploreContentTop = new Trip(array_exploreContentTop, {
		enableKeyBinding: false,
		overlayHolder: '#app_content_top_title',
		tripClass: 'onboarding_trip_welcome onboarding_trip_exploreContentTop',
		onStart: function(){
			onboarding.currentTrip = this;
			this.id_trip = 'exploreContentTop';
			tripTracker[this.id_trip] = {};
			
		},
		onEnd: function(tripIndex, tripObject){
			if(onboarding.forceOff){ return false; }
			trip_exploreContentMenu.start();
		},
	});


	var array_exploreContentMenu = [
		{
			sel: $('#app_content_menu_tasks img'),
			content: 'contentMenu',
			position : "e",
			expose: false,
			delay: 2000,
			onTripStart : function(i, tripData){
				//force close main menu if open
				if(responsive.test("maxMobileL") && $('#app_application_project').hasClass('app_application_visible')){
					app_application.move('project', false);
				}
				onboarding.welcome_bubble_reposition(tripData);
				if(tripTracker.check(this, i)){return false;}
				var tripObj = this;
				
				var trip_index_counter = 0; //cyle through tasks, notes, chats, files
				var elem_overlay = onboarding.overlays.content_menu();
				elem_overlay.css('opacity', 0);
				elem_overlay.off('click.trip');

				var fn_next = function(){
					tripObj.stop();
				}
				intro.gotoStep(5, fn_next);
				onboarding.fn_next = fn_next;
				onboarding.welcome_bubble_reposition(tripData);
			},
		},
		{
			sel: $('#app_content_menu_tasks img'),
			content: 'tasks',
			position : "e",
			expose: true,
			delay: 2000,
			onTripStart : function(i, tripData){
				//force close main menu if open
				if(responsive.test("maxMobileL") && $('#app_application_project').hasClass('app_application_visible')){
					app_application.move('project', false);
				}
				onboarding.welcome_bubble_reposition(tripData);
				if(tripTracker.check(this, i)){return false;}
				intro.gotoScript(1);
			},
		},
		{
			sel: $('#app_content_menu_notes img'),
			content: 'notes',
			position : "e",
			expose: true,
			delay: 2000,
			onTripStart : function(i, tripData){ 
				//force close main menu if open
				if(responsive.test("maxMobileL") && $('#app_application_project').hasClass('app_application_visible')){
					app_application.move('project', false);
				}
				onboarding.welcome_bubble_reposition(tripData);
				if(tripTracker.check(this, i)){return false;}
				intro.gotoScript(2);
			},
		},
		{
			sel: $('#app_content_menu_chats img'),
			content: 'chats',
			position : "e",
			expose: true,
			delay: 2000,
			onTripStart : function(i, tripData){
				//force close main menu if open
				if(responsive.test("maxMobileL") && $('#app_application_project').hasClass('app_application_visible')){
					app_application.move('project', false);
				}
				onboarding.welcome_bubble_reposition(tripData);
				if(tripTracker.check(this, i)){return false;}
				intro.gotoScript(3);
			},
		},
		{
			sel: $('#app_content_menu_files img'),
			content: 'files',
			position : "e",
			expose: true,
			delay: 200,
			onTripStart : function(i, tripData){
				//force close main menu if open
				if(responsive.test("maxMobileL") && $('#app_application_project').hasClass('app_application_visible')){
					app_application.move('project', false);
				}
				onboarding.welcome_bubble_reposition(tripData);
				if(tripTracker.check(this, i)){return false;}
				intro.gotoScript(4);
			},
		},
		{
			sel: $('#app_content_menu_files img'),
			content: 'files',
			position : "e",
			expose: true,
			delay: -1,
			onTripStart : function(i, tripData){
				//force close main menu if open
				if(responsive.test("maxMobileL") && $('#app_application_project').hasClass('app_application_visible')){
					app_application.move('project', false);
				}
				onboarding.welcome_bubble_reposition(tripData);
				if(tripTracker.check(this, i)){return false;}
				intro.gotoScript(5);
			},
		}

	];


	var trip_exploreContentMenu = new Trip(array_exploreContentMenu, {
		enableKeyBinding: false,
		overlayHolder: '#app_content_menu_table',
		tripClass: 'onboarding_trip_welcome onboarding_trip_exploreContentMenu',
		onStart: function(){
			onboarding.currentTrip = this;
			this.id_trip = 'exploreContentMenu';
			tripTracker[this.id_trip] = {};

			if(responsive.test("maxMobileL")){
				$.each(this.tripData, function(i, obj){
					obj.position = 'n';
				});
			}

			
		},
		onEnd: function(tripIndex, tripObject){
			if(onboarding.forceOff){ return false; }
			onboarding.overlays.content_dynamic_sub(false);
			onboarding.overlays.content_top(false);
			onboarding.overlays.content_menu().off('click.trip').attr('style', '');
			var array_inputter = [
				{
					sel: $('#skylist_tasks_layer_tasks_inputter_container'),
					content: 'inputter',
					position : "n",
					expose: true,
					delay: -1,
					onTripStart : function(i, tripData){
						//force close main menu if open
						if(responsive.test("maxMobileL") && $('#app_application_project').hasClass('app_application_visible')){
							app_application.move('project', false);
						}
						if(tripTracker.check(this, i)){
							onboarding.welcome_bubble_reposition(tripData);
							return false;
						}

						var tripObj = this;
						var fn_next = function(){
							tripObj.stop();
						}
						intro.gotoStep(6, fn_next);
						onboarding.fn_next = fn_next;
						onboarding.welcome_bubble_reposition(tripData);
					},
				},
			];
			var trip_inputter = new Trip(array_inputter, {
				enableKeyBinding: false,
				overlayHolder: '#app_content_dynamic_layers',
				tripClass: 'onboarding_trip_welcome onboarding_trip_inputter',
				onStart: function(){
					onboarding.currentTrip = this;
					this.id_trip = 'inputter';
					tripTracker[this.id_trip] = {};
					
				},
				onEnd: function(tripIndex, tripObject){
					if(onboarding.forceOff){ return false; }
					app_application_action(4); //Finish onboarding
					//$('.trip-overlay').css('display', 'none');
					onboarding.clear();
				},
			});
			trip_inputter.start();
		},
	});

	var fn_next = function(){
		trip_openMainMenu.start();
		onboarding.overlays.body(false);
	}

	$('#'+onboarding.id_welcome_bubble).append(intro.showPanel());
	
	intro.startStep(fn_next);
	onboarding.fn_next = fn_next;

	//if main menu is open, force close
	if($('#app_application_project').hasClass('app_application_visible')){
		app_application.move('project', false);
	}
		
	return true;
}

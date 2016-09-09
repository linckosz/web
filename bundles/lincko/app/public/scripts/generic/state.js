
$(window).bind('popstate', function(){
	if(app_generic_state.manual){ //Only trigger manual user action (button)
		var action = false;
		var change = false;
		var data = history.state;
		if(data){
			for(var i=0; i<app_generic_state.priority.length; i++){
				var key = app_generic_state.priority[i];
				if(app_generic_state.type[key]=='boolean'){
					if(typeof data[key] != 'undefined' && app_generic_state.current[key]!=app_generic_state.default[key]){
						data[key] = app_generic_state.default[key];
						change = app_generic_state.downKey(key, data[key]);
						if(change){
							if(typeof app_generic_state.action[key] == 'function'){
								app_generic_state.action[key](data);
							}
							action = true;
							break; //We only modify one element at a time
						}
						action = true;
					}
				} else if(app_generic_state.type[key]=='increase'){
					if(typeof data[key] != 'undefined' && data[key]!=app_generic_state.current[key]){
						if(data[key]<0){
							data[key] = 0;
						}
						change = app_generic_state.downKey(key, data[key]);
						if(change){
							if(typeof app_generic_state.action[key] == 'function'){
								app_generic_state.action[key](data);
							}
							action = true;
							break; //We only modify one element at a time
						}
						action = true;
					}
				}
			}
		}
		if(!action){
			if(supportsTouch){
				base_show_error(Lincko.Translation.get('app', 61, 'js')); //Tap again to exit the application
				clearTimeout(app_generic_state.close_timer);
				app_generic_state.close_timer = setTimeout(function(){
					base_hide_error();
					app_generic_state.reset();
					window.history.pushState(app_generic_state.default, app_generic_state.getTitle(), "/");
					app_generic_state.close_timer = false;
				}, 3000);
			} else {
				app_generic_state.reset();
				window.history.replaceState(app_generic_state.default, app_generic_state.getTitle(), "/");
			}
		} else if(!change){
			app_generic_state.manual = true;
			window.history.go(-1);
		}
	}
	app_generic_state.manual = true;
});

$(window).on('hashchange', function() {
	app_generic_state.openItem();
});


var app_generic_state = {
	
	allowed: false, //At true pushState and replaceState are available

	close_timer: false,

	started: false,

	quick_item: false,

	manual: true,

	default: {
		param: null,
		submenu: 0,
		mainmenu: false,
		preview: 0,
		menu: 'tasks',
		projects_id: null,
	},

	current: {
		param: null,
		submenu: 0,
		mainmenu: false,
		preview: 0,
		menu: 'tasks',
		projects_id: null,
	},

	/*
		boolean: -1/0/1 (depends on default value)
		increase: -x/0/x (depends on incremantal integer value)
	*/
	type: {
		submenu: 'increase',
		mainmenu: 'boolean',
		preview: 'increase',
		menu: 'boolean',
		projects_id: 'boolean',
	},

	priority: [
		'submenu',
		'mainmenu',
		'preview',
		'menu',
		'projects_id',
	],

	action: {
		submenu: function(data){
			submenu_Clean(data.submenu+1, true, false);
		},
		mainmenu: function(data){
			app_application.forceClose();
		},
		preview: function(data){
			submenu_Clean(data.preview+1, true, true);
		},
		menu: function(data){
			app_content_menu.change(data.menu);
		},
		projects_id: function(data){
			app_content_menu.selection(data.projects_id, 'tasks', data.param);
		},
	},

	reset: function(){
		if(!this.allowed){ return false; }
		for(var i=0; i<this.priority.length; i++){
			var key = this.priority[i];
			if(typeof this.action[key] == 'function'){
				this.action[key](this.default);
			}
			this.current[key] = this.default[key];
		}
	},

	getIndex: function(){
		if(!this.allowed){ return false; }
		return window.history.length;
	},
	
	getTitle: function(){
		if(!this.allowed){ return false; }
		return wrapper_title+" ["+(this.getIndex()+1)+"]";
	},

	updateKey: function(key, value){
		if(!this.allowed){ return false; }
		if(typeof this.current[key] == 'undefined'){
			return false;
		}
		this.current[key] = value;
		window.history.replaceState(this.current, this.getTitle());
		return true;
	},

	downKey: function(key, value){
		if(!this.allowed){ return false; }
		var result = true;
		if(typeof this.current[key] == 'undefined'){
			return false;
		}
		if(this.type[key] == 'boolean'){
			if(value!=this.default[key]){
				value = this.default[key];
				result = false;
			}
		} else if(this.type[key] == 'increase'){
			if(value>=this.current[key]){
				value = this.current[key]
				result = false;
			}
		}
		this.current[key] = value;
		window.history.replaceState(this.current, this.getTitle());
		return result;
	},

	//data must be an object like default
	change: function(data, param, direction){
		if(!this.allowed){ return false; }
		if(typeof param == 'undefined'){ param = null; }
		if(typeof direction == 'undefined'){ direction = 0; }
		var record = false;
		var position = 0;
		for(var key in data){
			position = 0; //-1:back / 0:replace / 1:forward
			record = false;
			var temp = {};
			if(typeof this.type[key] != 'undefined'){
				if(this.type[key] == 'boolean'){
					if(data[key]!=this.current[key]){
						record = true;
						position = 0; //Replace
						if(this.current[key]==this.default[key]){
							position = 1; //Forward (exit default)
						} else if(data[key]==this.default[key]){
							position = -1; //Back (return default)
						}
					}
				} else if(this.type[key] == 'increase'){
					if(data[key]<0){
						data[key] = 0;
					}
					if(data[key]!=this.current[key]){
						record = true;
						position = data[key] - this.current[key]; //Forward for higher - Back for lower
					}
				}
				//0:all , 1: forceUp(>=0) , 2: forceDown(<=0)
				if((direction<0 && position>0) || (direction>0 && position<0)){
					position = 0;
					record = false;
				}
				if(record){
					if(position<0){ //Back
						this.current[key] = data[key];
						if(this.type[key] == 'boolean'){
							this.current[key] = this.default[key]
						}
						window.history.replaceState(this.current, this.getTitle());
					} else if(position==0){ //Replace
						this.current[key] = data[key];
						window.history.replaceState(this.current, this.getTitle());
					} else if(position>0){ //Forward
						if(this.type[key] == 'boolean'){
							this.current[key] = data[key];
							window.history.pushState(this.current, this.getTitle());
						} else if(this.type[key] == 'increase'){
							for(var j=0; j<position; j++){
								this.current[key] = data[key];
								window.history.pushState(this.current, this.getTitle());
							}
						}
					}
				}
			}
		}
	},

	//Add 2 times currents to avoid exiting to easliy
	start: function(){
		if(typeof window.history.pushState != 'function'){
			this.allowed = false;
			return false;
		}
		this.allowed = true;
		if(!this.started && !storage_first_launch && Lincko.storage.getMyPlaceholder()){
			this.started = true;
			this.default.projects_id = Lincko.storage.getMyPlaceholder()['_id'];
			this.current.projects_id = Lincko.storage.getMyPlaceholder()['_id'];
			this.getItem();
			window.history.pushState(this.default, this.getTitle(), "/"); //Make sure we initialse the url at root to clean it
			this.openItem(true);
		}
		return this.started;
	},

	getItem: function(){
		if(!this.allowed){ return false; }
		this.quick_item = false;
		var hash = location.hash.substr(1).split("-");
		if(hash.length==2){
			var type = hash[0];
			var id = parseInt(hash[1], 10);
			this.quick_item = Lincko.storage.get(type, id);
		}
		return this.quick_item;
	},

	openItem: function(old){
		if(!this.allowed){ return false; }
		if(typeof old == 'undefined'){ old = false; }
		if(old){
			var item = this.quick_item;
		} else { //get url hash
			var item = this.getItem();
		}
		window.history.replaceState(this.current, this.getTitle(), "/"); //This is just to clean the url
		//console.log(item);
		
		if(typeof this.model_action[item._type] == 'function'){
			this.model_action[item._type](item);
		}
	},

	model_action: {
		
		projects: function(item){
			app_content_menu.selection(item._id);
		},

		tasks: function(item){
			console.log('do something to open task');
		},

	},

};



var app_generic_state_garbage = app_application_garbage.add();
app_application_lincko.add(app_generic_state_garbage, 'first_launch', function() {
	if(app_generic_state.start()){
		app_application_garbage.remove(app_generic_state_garbage);
	}
});

JSfiles.finish(function(){
	app_generic_state.start();
});

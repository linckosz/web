
$(window).on('popstate', function(event){
	//If it's triggered by hash only
	if(document.location.hash){
		app_generic_state.openItem();
		return true;
	}
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
					app_generic_state.openItem();
					window.history.pushState(app_generic_state.default, app_generic_state.getTitle(), "/");
					app_generic_state.close_timer = false;
				}, 3000);
			} else {
				app_generic_state.reset();
				app_generic_state.openItem();
				window.history.replaceState(app_generic_state.default, app_generic_state.getTitle(), "/");
			}
		} else if(!change){
			app_generic_state.manual = true;
			window.history.go(-1);
		}
	}
	app_generic_state.manual = true;
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

	getItem: function(url){
		if(!this.allowed){ return false; }
		if(typeof url == 'undefined'){ url = false; }
		this.quick_item = false;

		if(url){
			var location_hash = url.split("#");
			if(location_hash.length == 2)
			{
				var hash = location_hash[1].split("-");//url ='https://lincko.com/#tasks-56';
			}
			else
			{
				hash = [];
			}
		} else {
			var hash = location.hash.substr(1).split("-");
		}
		
		if(hash.length==2){
			var type = hash[0];
			var id = parseInt(hash[1], 10);
			this.quick_item = Lincko.storage.get(type, id);
			if(!this.quick_item){
				this.quick_item = {
					_type: hash[0],
					_id: hash[1],
				}
			}
		}
		return this.quick_item;
	},
	openItem: function(old, url){
		if(!this.allowed){ return false; }
		if(typeof url == 'undefined'){ url = false; }
		if(typeof old == 'undefined'){ old = false; }
		if(old){
			var item = this.quick_item;
		} else { //get url hash
			var item = this.getItem(url);
		}
		window.history.replaceState(this.current, this.getTitle(), "/"); //This is just to clean the url
		//console.log(item);
		if(typeof this.model_action[item._type] == 'function'){
			this.model_action[item._type](item);
		}
	},
	model_action: {
		projects: function(item){
			var pid = item._id;
			if(!storage_first_launch){
				app_content_menu.selection(pid);
			} else {
				var model_timer = setInterval(function(pid){
					if(!storage_first_launch){
						clearInterval(model_timer);
						app_content_menu.selection(pid);
					}
				}, 1000, pid);
			}
		},
		tasks: function(item){
			var target_id = item._id;
			if(item._tasksup !=  null) {
				target_id = Object.keys(item._tasksup)[0];
			}
			if(!storage_first_launch) {
				var parent = Lincko.storage.getParent("tasks", target_id);
				app_content_menu.selection(parent["_id"], 'tasks', null, false);
				var subm = submenu_get('taskdetail', true);
				if(!subm || !subm.param.type || !subm.param.id || subm.param.type != "tasks" || subm.param.id != target_id){
					submenu_Build('taskdetail', true, null, {'type':'tasks', 'id':target_id,}, true);
				}
			} else {
				var model_timer = setInterval(function(target_id){
					if(!storage_first_launch){
						clearInterval(model_timer);
						var parent = Lincko.storage.getParent("tasks", target_id);
						app_content_menu.selection(parent["_id"], 'tasks', null, false);
						var subm = submenu_get('taskdetail', true);
						if(!subm || !subm.param.type || !subm.param.id || subm.param.type != "tasks" || subm.param.id != target_id){
							submenu_Build('taskdetail', true, null, {'type':'tasks', 'id':target_id,}, true);
						}
					}
				}, 1000, target_id);
			}
		},
		notes: function(item){
			var target_id = item._id;
			if(!storage_first_launch) {
				var parent = Lincko.storage.getParent("notes", target_id);
				app_content_menu.selection(parent["_id"], 'notes', null, false);
				var subm = submenu_get('taskdetail', true);
				if(!subm || !subm.param.type || !subm.param.id || subm.param.type != "notes" || subm.param.id != target_id){
					submenu_Build('taskdetail', true, null, {'type':'notes', 'id':target_id,}, true);
				}
			} else {
				var model_timer = setInterval(function(target_id){
					if(!storage_first_launch){
						clearInterval(model_timer);
						var subm = submenu_get('taskdetail', true);
						if(!subm || !subm.param.type || !subm.param.id || subm.param.type != "notes" || subm.param.id != target_id){
							submenu_Build('taskdetail', true, null, {'type':'notes', 'id':target_id,}, true);
						}
					}
				}, 1000, target_id);
			}
		},
		files: function(item){
			var target_id = item._id;
			if(!storage_first_launch) {
				var parent = Lincko.storage.getParent("files", target_id);
				var pid = Lincko.storage.isProjectActivity("files", target_id);
				var type = false;
				if(pid){ //Is inside a project
					type = "projects";
					app_content_menu.selection(pid, 'files', null, false);
				} else if(parent["_type"]=="chats"){
					type = "chats";
				}
				if(type=="projects"){
					var subm = submenu_get('taskdetail', true);
					if(!subm || !subm.param.type || !subm.param.id || subm.param.type != "files" || subm.param.id != target_id){
						submenu_Build('taskdetail', true, null, {'type':'files', 'id':target_id,}, true);
					}
				} else if(type=="chats"){
					var subm = submenu_get('newchat', false);
					if(!subm || !subm.param.type || !subm.param.id || subm.param.type != "chats" || subm.param.id != parent._id){
						submenu_Build_return("newchat", true, false, {'type': 'chats','id': parent._id,'title': parent['+title'], find_item: "files_"+target_id}, false);
					}
					var subm = submenu_get('taskdetail', false);
					if(!subm || !subm.param.type || !subm.param.id || subm.param.type != "files" || subm.param.id != target_id){
						submenu_Build('taskdetail', true, null, {'type':'files', 'id':target_id,}, false);
					}
				} else {
					var subm = submenu_get('taskdetail', false);
					if(!subm || !subm.param.type || !subm.param.id || subm.param.type != "files" || subm.param.id != target_id){
						submenu_Build('taskdetail', true, null, {'type':'files', 'id':target_id,}, false);
					}
				}
			} else {
				var model_timer = setInterval(function(target_id){
					if(!storage_first_launch){
						clearInterval(model_timer);
						var parent = Lincko.storage.getParent("notes", target_id);
						var pid = Lincko.storage.isProjectActivity("files", target_id);
						var type = false;
						if(pid){ //Is inside a project
							type = "projects";
							app_content_menu.selection(pid, 'files');
						} else if(parent["_type"]=="chats"){
							type = "chats";
						}
						if(type=="projects"){
							var subm = submenu_get('taskdetail', true);
							if(!subm || !subm.param.type || !subm.param.id || subm.param.type != "files" || subm.param.id != target_id){
								submenu_Build('taskdetail', true, null, {'type':'files', 'id':target_id,}, true);
							}
						} else if(type=="chats"){
							var subm = submenu_get('newchat', false);
							if(!subm || !subm.param.type || !subm.param.id || subm.param.type != "chats" || subm.param.id != parent._id){
								submenu_Build_return("newchat", true, false, {'type': 'chats','id': parent._id,'title': parent['+title'], find_item: "files_"+target_id}, false);
							}
							var subm = submenu_get('taskdetail', false);
							if(!subm || !subm.param.type || !subm.param.id || subm.param.type != "files" || subm.param.id != target_id){
								submenu_Build('taskdetail', true, null, {'type':'files', 'id':target_id,}, false);
							}
						} else {
							var subm = submenu_get('taskdetail', false);
							if(!subm || !subm.param.type || !subm.param.id || subm.param.type != "files" || subm.param.id != target_id){
								submenu_Build('taskdetail', true, null, {'type':'files', 'id':target_id,}, false);
							}
						}
					}
				}, 1000, target_id);
			}
		},
		chats: function(item){
			var target_id = item._id;
			if(!storage_first_launch) {
				var subm = submenu_get('newchat', false);
				if(!subm || !subm.param.type || !subm.param.id || subm.param.type != "chats" || subm.param.id != target_id){
					var title = Lincko.storage.get("chats", target_id, "title");
					submenu_Build("newchat", true, false, {'type': 'chats','id': target_id,'title': title}, false);
				}
			} else {
				var model_timer = setInterval(function(target_id){
					if(!storage_first_launch){
						clearInterval(model_timer);
						var subm = submenu_get('newchat', false);
						if(!subm || !subm.param.type || !subm.param.id || subm.param.type != "chats" || subm.param.id != target_id){
							var title = Lincko.storage.get("chats", target_id, "title");
							submenu_Build("newchat", true, false, {'type': 'chats','id': target_id,'title': title}, false);
						}
					}
				}, 1000, target_id);
			}
		},
		comments: function(item){
			var target_id = item._id;
			var parent = Lincko.storage.getParent(item["_type"], item["_id"]);
			while(parent['_type']=='comments'){
				parent = Lincko.storage.getParent(parent["_type"], parent["_id"]);
			}
			target_id = parent['_id'];
			if(!storage_first_launch) {
				var subm = submenu_get('newchat', false);
				if(!subm || !subm.param.type || !subm.param.id || subm.param.type != 'history' || subm.param.id != parent._id){
					if(parent['_type']=='tasks' || parent['_type']=='files' || parent['_type']=='notes'){
						var pid = Lincko.storage.isProjectActivity(parent['_type'], target_id);
						var type = false;
						if(pid){ //Is inside a project
							type = "projects";
							app_content_menu.selection(pid, parent['_type'], null, false);
						} else if(parent["_type"]=="chats"){
							type = "chats";
						}
						if(type=="projects"){
							var subm = submenu_get('taskdetail', true);
							if(!subm || !subm.param.type || !subm.param.id || subm.param.type != parent['_type'] || subm.param.id != target_id){
								submenu_Build('taskdetail', true, null, {'type':parent['_type'], 'id':target_id,}, true);
							}
						}
					} else if(parent['_type']=='projects'){
						submenu_Build("newchat", true, false, {'type': 'history','id': parent._id,'title': parent['+title'], find_item: "comments_"+target_id}, false);
					}
				}
			} else {
				var model_timer = setInterval(function(target_id, parent){
					if(!storage_first_launch){
						clearInterval(model_timer);
						var subm = submenu_get('newchat', false);
						if(!subm || !subm.param.type || !subm.param.id || subm.param.type != 'history' || subm.param.id != parent._id){
							if(parent['_type']=='tasks' || parent['_type']=='files' || parent['_type']=='notes'){
								var pid = Lincko.storage.isProjectActivity(parent['_type'], target_id);
								var type = false;
								if(pid){ //Is inside a project
									type = "projects";
									app_content_menu.selection(pid, parent['_type'], null, false);
								} else if(parent["_type"]=="chats"){
									type = "chats";
								}
								if(type=="projects"){
									var subm = submenu_get('taskdetail', true);
									if(!subm || !subm.param.type || !subm.param.id || subm.param.type != parent['_type'] || subm.param.id != target_id){
										submenu_Build('taskdetail', true, null, {'type':parent['_type'], 'id':target_id,}, true);
									}
								}
							} else if(parent['_type']=='projects'){
								submenu_Build("newchat", true, false, {'type': 'history','id': parent._id,'title': parent['+title'], find_item: "comments_"+target_id}, false);
							}
						}
					}
				}, 1000, target_id, parent);
			}
		},
		messages: function(item){
			var target_id = item._id;
			var parent = Lincko.storage.getParent(item["_type"], item["_id"]);
			if(!storage_first_launch) {
				var subm = submenu_get('newchat', false);
				if(!subm || !subm.param.type || !subm.param.id || subm.param.type != parent._type || subm.param.id != parent._id){
					submenu_Build("newchat", true, false, {'type': parent._type,'id': parent._id,'title': parent['+title'], find_item: "messages_"+target_id}, false);
				}
			} else {
				var model_timer = setInterval(function(target_id, parent){
					if(!storage_first_launch){
						clearInterval(model_timer);
						var subm = submenu_get('newchat', false);
						if(!subm || !subm.param.type || !subm.param.id || subm.param.type != parent._type || subm.param.id != parent._id){
							submenu_Build("newchat", true, false, {'type': parent._type,'id': parent._id,'title': parent['+title'], find_item: "messages_"+target_id}, false);
						}
					}
				}, 1000, target_id, parent);
			}
		},
		submenu: function(item){
			var arr = item._id.split("%");

			var menu = arr[0];
			var next = 1;
			if(typeof arr[1] != "undefined"){ next=arr[1]; }
			var hide = true;
			if(typeof arr[2] != "undefined"){ hide=arr[2]; }
			var param = null;
			if(typeof arr[3] != "undefined"){ param=arr[3]; }
			var preview = false;
			if(typeof arr[4] != "undefined"){ preview=arr[4]; }
			var animate = true;
			if(typeof arr[5] != "undefined"){ animate=arr[5]; }

			if(!storage_first_launch){
				var subm = submenu_get(menu, next, hide, param, preview, animate);
				if(!subm){
					submenu_Build(menu, next, hide, param, preview, animate);
				}
			} else {
				var model_timer = setInterval(function(menu, next, hide, param, preview, animate){
					if(!storage_first_launch){
						clearInterval(model_timer);
						var subm = submenu_get(menu, next, hide, param, preview, animate);
						if(!subm){
							submenu_Build(menu, next, hide, param, preview, animate);
						}
					}
				}, 1000, menu, next, hide, param, preview, animate);
			}
		}
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

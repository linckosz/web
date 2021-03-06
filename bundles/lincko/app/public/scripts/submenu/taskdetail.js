//Category 36
submenu_list['taskdetail'] = {
	//Set the title of the top
	"_title": {
		"style": "customized_title",
		"title": function(that){
			var title = 'Information';
			if(that.param.type == "tasks"){
				title = Lincko.Translation.get('app', 3605, 'html');
			}
			if(that.param.type == "notes"){
				title = Lincko.Translation.get('app', 3606, 'html');
			}
			if(that.param.type == "files"){
				title = Lincko.Translation.get('app', 3607, 'html');
			}
			return title;
		},
		"class": function(that){
			var className = 'submenu_wrapper_title submenu_wrapper_taskdetail_'+that.param.type;
			return className;
		},
	},

	"left_button": {
		"style": "title_left_button",
		"title": Lincko.Translation.get('app', 25, 'html'),//Close
		'hide': true,
		"class": "base_pointer",
		"action": function(Elem, subm) {
			//subm.close = true;
		},
	},

	"right_menu": {
		"feature":"delete",
		"style": "title_right_button_list",
		"items":[{
			"feature":"copyLink",
			"icon":'icon-CopyLink',
			"display":function(subm){
				// var item = Lincko.storage.get(subm.param.type,subm.param.id);

				// if(item._parent[0] == "chats"){
				// 	item = Lincko.storage.get("chats",subm.param.type,item._parent[0]);
				// }
				// if(item && item._parent[0]=="projects"){
				// 	var project = Lincko.storage.get("projects",item._parent[1]);
				// 	return (project && project.personal_private == null);
				// }
				// else
				// {
				// 	return false;
				// }
				return true;
			},
			"title": Lincko.Translation.get('app', 81, 'html'), //copy link
			"prepare":function(Elem, subm) {
				var workspace = wrapper_localstorage.workspace == "" ? "" : wrapper_localstorage.workspace + ".";
				var url = top.location.protocol+'//'+app_application_dev_link() + workspace + document.domainRoot+'/#'+subm.param.type+'-'+btoa(subm.param.id);
				Elem.attr('data-clipboard-text',url);
				var myurl = new Clipboard(Elem[0]);

				myurl.on('success', function(e) {
					base_show_error(Lincko.Translation.get('app', 70, 'html'), false); //URL copied to the clipboard
					e.clearSelection();
				});

				myurl.on('error', function(e) {
					base_show_error(Lincko.Translation.get('app', 71, 'html'), true); //Your system does not allow to copy to the clipboard
					e.clearSelection();
				});

				app_application_lincko.add(subm.id,'submenu_hide_' + subm.preview + '_' + subm.id,
					function(){
						var myurl = this.action_param;
						if(myurl){
							myurl.destroy();
						}
					},
				myurl);
			},
			"action": function(Elem, subm) {
				
			},
			
		},{
			"feature":"goToLink",
			"icon":'fa fa-binoculars',
			"display":function(subm){
				if(subm.param.type && subm.param.id){
					return Lincko.storage.hasProjectParent(subm.param.type,subm.param.id);
				} else {
					return false;
				}
			},
			"title": Lincko.Translation.get('app', 3629, 'js'), //View in Project
			"action": function(Elem, subm) {
				var workspace = wrapper_localstorage.workspace == "" ? "" : wrapper_localstorage.workspace + ".";
				var url = top.location.protocol+'//'+app_application_dev_link() + workspace + document.domainRoot+'/#'+subm.param.type+'-'+btoa(subm.param.id);
				window.location.href = url;
			},
		},{
			"feature":"copy",
			//"icon":'fa fa-clone',
			"icon": 'fa fa-files-o',
			"display":function(subm){
				if(subm.param.type!='tasks' && subm.param.type!='notes' && subm.param.type!='files'){
					return false;
				} else if(!Lincko.storage.hasProjectParent(subm.param.type, subm.param.id)){
					return false;
				} else {
					return true;
				}
			},
			"title": function(Elem, subm){
				if(subm.param.type=='tasks'){
					return Lincko.Translation.get('app', 203, 'js'); //Copy the task
				} else if(subm.param.type=='notes'){
					return Lincko.Translation.get('app', 204, 'js'); //Copy the note
				} else if(subm.param.type=='files'){
					return Lincko.Translation.get('app', 205, 'js'); //Copy the file
				}
				Elem.addClass('display_none');
				return '';
			},
			"action": function(Elem, subm) {
				submenu_Build('taskdetail_new', true, false, 
				{
					"type":subm.param.type,
					"id": 'new', 
					"id_toCopy": subm.param.id,
				}, subm.preview);
			},
		},{
			"icon":'icon-Trash',
			"title": Lincko.Translation.get('app',22, 'html'), //delete
			"enabled":function(subm){
				var linkToNotesCount = 0;
				var linkToTasksCount = 0;

				var linkToNotes = Lincko.storage.get(subm.param.type,subm.param.id,"_notes");
				var linkToTasks = Lincko.storage.get(subm.param.type,subm.param.id,"_tasks");

				if(subm.param.type == "files"){
					if(typeof linkToTasks == 'object'){
						$.each(linkToTasks, function(id,item){
							var item = Lincko.storage.get("tasks",id);
							if(item.deleted_at == null)
							{
								linkToTasksCount++;
							}
						});
					}

					if(typeof linkToNotes == 'object'){
						$.each(linkToNotes, function(id,item){
							var item = Lincko.storage.get("notes",id);
							if(item.deleted_at == null)
							{
								linkToNotesCount++;
							}
						});
					}

					if(linkToNotesCount > 0 || linkToTasksCount > 0){
						 return false;
					}
				}
				else if(subm.param.type == "notes"){
					if(typeof linkToNotes == 'object'){
						$.each(linkToNotes, function(id,item){
							var item = Lincko.storage.get("notes",id);
							if(item.deleted_at == null)
							{
								linkToNotesCount++;
							}
						});
					}
					if(linkToTasksCount > 0){
						return false;
					}
				}
				return true;

			},
			"action": function(Elem, subm) {
				var linkToNotesCount = 0;
				var linkToTasksCount = 0;

				var linkToNotes = Lincko.storage.get(subm.param.type,subm.param.id,"_notes");
				var linkToTasks = Lincko.storage.get(subm.param.type,subm.param.id,"_tasks");

				var can = Lincko.storage.canI('delete', subm.param.type, subm.param.id); 
				if(can)
				{
					if(subm.param.type == "files"){
						if(typeof linkToTasks == 'object'){
							$.each(linkToTasks, function(id,item){
								var item = Lincko.storage.get("tasks",id);
								if(item.deleted_at == null)
								{
									linkToTasksCount++;
								}
							});
						}

						if(typeof linkToNotes == 'object'){
							$.each(linkToNotes, function(id,item){
								var item = Lincko.storage.get("notes",id);
								if(item.deleted_at == null)
								{
									linkToNotesCount++;
								}
							});
						}

						if(linkToNotesCount > 0 || linkToTasksCount > 0){
							base_show_error(Lincko.Translation.get('app', 51, 'html'), true); //Operation not allowed
						}


					}
					else if(subm.param.type == "notes"){
						if(typeof linkToNotes == 'object'){
							$.each(linkToNotes, function(id,item){
								var item = Lincko.storage.get("notes",id);
								if(item.deleted_at == null)
								{
									linkToNotesCount++;
								}
							});
						}

						if(linkToTasksCount > 0){
							base_show_error(Lincko.Translation.get('app', 51, 'html'), true); //Operation not allowed
						}
					}
				} else if(subm.param.type == "tasks"){
					base_show_error(Lincko.Translation.get('app', 3631, 'html'), true); //You don't have enough permission to delete a task you did not create
				} else if(subm.param.type == "notes"){
					base_show_error(Lincko.Translation.get('app', 3632, 'html'), true); //You don't have enough permission to delete a note you did not create
				} else if(subm.param.type == "files"){
					base_show_error(Lincko.Translation.get('app', 3633, 'html'), true); //You don't have enough permission to delete a file you did not create
				} else {
					base_show_error(Lincko.Translation.get('app', 51, 'html'), true); //Operation not allowed
				}

				if(can && linkToNotesCount == 0 && linkToTasksCount == 0)
				{
					//toto:should ask sky to use the last way to sendaction
					var type = "";
					switch(subm.param.type)
					{
						case "notes" :
							type = "note";
							break;
						case "files" :
							type = "file";
							break;
						case "tasks" :
							type = "task";
							break;
						default:
							break;
					}
					if(type != "")
					{
						wrapper_sendAction({id: subm.param.id}, 'post', type + '/delete');
					}

					subm.param.setDeleteTrue = true;
					Lincko.storage.data[subm.param.type][subm.param.id].deleted_at = new wrapper_date().timestamp;
					app_application_lincko.prepare(subm.param.type + '_' + subm.param.id, true);

					submenu_Clean(subm.layer, true, subm.preview);
				}
			},

		},]
	},

	"taskdetail": {
		"style": "taskdetail",
		"title": "taskdetail",
		"class": "",
	},
/*
	"confirm": {
		"style": "tasklist_button",
		"title": function(that){
			if( that.param == "new" ){
				return Lincko.Translation.get('app', 41, 'html'); //Create
			}
			else{
				return Lincko.Translation.get('app', 3, 'html'); //Confirm
			}
		},
		"action": function(){
			var title = submenu_wrapper.find('[find=title_text]').html();
			var description = submenu_wrapper.find('[find=description_text]').html();
			var proj_id = app_content_menu.projects_id.toString();
			var param = 
			{
				"task_title_text": title,
				"task_parent_id_hidden": proj_id,
				"task_comment_textarea": description,
			}
			wrapper_sendAction(param,'post','task/create');
		},
		"hide": true,
	},
*/

	"projects_id": {
		"style": "input_hidden",
		"title": "",
		"name": "task_parent_id_hidden",
		"value": "",
		"now": function(Elem, subm){
			var currentProjID = app_content_menu.projects_id;
			if(subm.param.projID){
				currentProjID = subm.param.projID;
			}
			Elem.find("[find=submenu_input]").prop('value', subm.param.projID);
		},
		"class": "",
	},
};

submenu_list['taskdetail_new'] = {
	//Set the title of the top
	"_title": {
		"style": "customized_title",
		"title": function(that){
			var title = 'Information';
			if(that.param.type == "tasks"){
				title = Lincko.Translation.get('app', 3605, 'html');
			}
			if(that.param.type == "notes"){
				title = Lincko.Translation.get('app', 3606, 'html');
			}
			if(that.param.type == "files"){
				title = Lincko.Translation.get('app', 3607, 'html');
			}
			return title;
		},
		"class": function(that){
			var className = 'submenu_wrapper_title submenu_wrapper_taskdetail_'+that.param.type;
			return className;
		},
	},
	"left_button": {
		"style": "title_left_button",
		"title": Lincko.Translation.get('app', 7, 'html'), //Cancel
		'hide': true,
		"class": "base_pointer",
		"action": function(Elem, subm) {
			subm.cancel = true;
		},
	},
	"right_button": {
		"style": "title_right_button",
		"title": Lincko.Translation.get('app', 41, 'html'), //Create
		'hide': true,
		"class": "base_pointer",
		"action": function(Elem, subm) {
			subm.cancel = false;
			base_showProgress(Elem);
			Elem.recursiveOff();
		},
		"now": function(Elem, subm){
			subm.cancel = true; //false only if 'create' is clicked
			//Add loading bar
			var loading_bar = $("#-submit_progress_bar").clone();
			loading_bar.prop('id', '');
			Elem.append(loading_bar);
		},
	},
	"taskdetail": {
		"style": "taskdetail",
		"title": "taskdetail",
		"class": "",
	},
	"projects_id": {
		"style": "input_hidden",
		"title": "",
		"name": "task_parent_id_hidden",
		"value": "",
		"now": function(Elem, subm){
			var currentProjID = app_content_menu.projects_id;
			if(subm.param.projID){
				currentProjID = subm.param.projID;
			}
			Elem.find("[find=submenu_input]").prop('value', subm.param.projID);
		},
		"class": "",
	},
};

Submenu_select.taskdetail = function(subm){
	subm.Add_taskdetail();
};

Submenu.prototype.Add_taskdetail = function() {
	var that = this;
	var attribute = this.attribute;
	this.md5id = this.id;//md5(Math.random()); //This help to avoid memory leak
	var submenu_wrapper = this.Wrapper();
	var submenu_content = submenu_wrapper.find("[find=submenu_wrapper_content]");
	submenu_content.prop('id','taskdetail_'+that.md5id).addClass('submenu_content_taskdetail submenu_content_taskdetail_'+that.param.type);
	var submenu_taskdetail = $('#-submenu_taskdetail').clone().prop('id','submenu_taskdetail_'+that.md5id);


	//iscroll creation callback
	wrapper_IScroll_cb_creation[submenu_content.prop('id')] = function(){
		var IScroll = myIScrollList[submenu_content.prop('id')];
		
		IScroll.on('scrollStart', function(){
			taskdetail_hideEditorBar(that);
		});//scrollStart

		IScroll.on('scrollEnd', function(){
			taskdetail_setEditorBarPosition(that);
		});//scrollEnd

		var timeout_resize;
		$(window).on('resize.taskdetail', function(){
			clearTimeout(timeout_resize);
			if($('#'+that.id).is(':visible') && !$('#'+that.id).hasClass('velocity-animating')){
				$(window).off('resize.taskdetail');
				taskdetail_setEditorBarPosition(that, false);
			} else {
				timeout_resize = setTimeout(function(){
					$(window).trigger('resize.taskdetail');
				},100);
			}
		});

		timeout_resize = setTimeout(function(){
			$(window).trigger('resize.taskdetail');
		},100);
	}


	var itemToCopy = Lincko.storage.get(that.param.type, that.param.id_toCopy) || {};

	that.param.uniqueID = md5(Math.random());

	if(!that.param.projID){
		that.param.projID = Lincko.storage.getProjectParentID(that.param.type, that.param.id_toCopy) || that.param.projID;
	}
	//fallback
	if(!that.param.projID){
		that.param.projID = app_content_menu.projects_id == 0 ? Lincko.storage.getMyPlaceholder()['_id'] : app_content_menu.projects_id;
	}

	var contactServer = false;
	var isLockedByMe = false;
	var action_menu_opened = false;
	var param_sendAction = {};
	var taskid = this.param.id;
	var newTitle = '';
	var approved = false;
	var elem;
	var duedate;
	var created_by;
	var created_at;
	var updated_by;
	var updated_at;
	var in_charge = '';
	var in_charge_id = wrapper_localstorage.uid;

	var nextSubtaskFav = 0;

	var progressBarController = {
		completed: 0,
		total: 0,
		elem_container: null,
		elem_bar: null,
		elem_percent: null,
		updateBar: function(){
			if(!this.elem_container || !this.elem_bar){ return false; }

			if(this.total == 0){
				this.elem_container.addClass('display_none');
				return true;
			}
			else{
				this.elem_container.removeClass('display_none');
				if(this.elem_percent){
					this.elem_percent.text(this.getPercent());
				}

				if(this.elem_bar.is(':visible')){
					this.elem_bar.velocity('stop', true);
					this.elem_bar.velocity({width: this.getPercent()+'%'});
				}
				else{
					this.elem_bar.css('width', this.getPercent()+'%');
				}

				return true;
			}
		},
		getPercent: function(){
			return Math.round( (this.completed / this.total)*100 );
		},
	};

	var uploadGarbageID = null;
	//only for new items add link queueing system
	if(taskid == 'new'){
		uploadGarbageID = app_application_garbage.add();
		app_application_lincko.add(uploadGarbageID, 'upload',taskdetail_linkQueue.uploadGarbageFn, {uniqueID: that.param.uniqueID, parent_type: that.param.type});
	}

	var item = {};

	var route = '';
	var route_delete = false;
	var routeObj = {};
	if( that.param.type == "tasks" ){
		routeObj.type = 'task';
	}
	else if( that.param.type == "notes" ){
		routeObj.type = 'note';
	}
	else if( that.param.type == "files" ){
		routeObj.type = 'file';
	}
	routeObj.create = routeObj.type+'/create';
	routeObj.update = routeObj.type+'/update';
	routeObj.delete = routeObj.type+'/delete';


	if(that.param.type == 'tasks'){
		newTitle = Lincko.Translation.get('app', 3509, 'html'); //New Task
	}
	else if( that.param.type == 'notes'){
		newTitle = Lincko.Translation.get('app', 3510, 'html'); //New Note
	}


	if(taskid == 'new' ){
		item['+title'] = itemToCopy['+title'] || that.param.title || newTitle;
		item['_id'] = taskid;
		item['_parent'] = itemToCopy['_parent'] || ['projects', that.param.projID];
		item['created_by'] = wrapper_localstorage.uid;
		item['updated_by'] = wrapper_localstorage.uid;
		item['-comment'] = itemToCopy['-comment'] || '';

		if(that.param.type == 'files'){
			item['+name'] = itemToCopy['+name'] || "";
			item['size'] = itemToCopy['size'] || 0;
			item['ori_ext'] = itemToCopy['ori_ext'] || 'txt';
			item['category'] = itemToCopy['category'] || 'files';
		}

		//checkbox
		if(typeof itemToCopy.approved == 'boolean'){
			approved = item.approved = itemToCopy.approved;
		}
		
		if(itemToCopy._users){
			in_charge_id = null;
			item['_users'] = itemToCopy._users;
			$.each(itemToCopy._users, function(uid, obj){
				if(obj.in_charge){
					in_charge_id = uid;
					return false;
				}
			});
		} else {
			item['_users'] = {};
			var accessList = Lincko.storage.whoHasAccess('projects', that.param.projID);
			if($.inArray(wrapper_localstorage.uid, accessList)<0){ return false; }
			$.each(accessList, function(i,val){
				item['_users'][val] = {};
				if(that.param.type == 'tasks'){
					item['_users'][val]['in_charge'] = false;
				}
			});
			if(that.param.type == 'tasks'){
				item['_users'][wrapper_localstorage.uid]['in_charge'] = true;
			}
		}
		
		
		item.start = typeof itemToCopy.start != 'undefined' ? itemToCopy.start : new wrapper_date().getEndofDay(); //midnight today
		item.duration = typeof itemToCopy.duration != 'undefined' ? itemToCopy.duration : 86400; //24hrs by default
		item['_type'] = that.param.type;
	} 
	else{
		item = Lincko.storage.get(this.param.type, taskid);
		//if task doesnt exist
		if(!item){
			return;
		}

		//if its fake, use the skylist queue system to update to real id when available
		if(that.param.type == 'tasks' && item.fake && item.temp_id){
			skylist.sendActionQueue.tasks[item.temp_id].push( function(real_id){
				taskid = real_id;
				that.param.id = real_id;
				item = Lincko.storage.get('tasks', real_id);
				registerSync_checkbox();
				registerSync_meta();
				registerSync_links();
				registerSync_comments();
				if(editorInst){
					editorInst.Lincko_param.itemID = real_id;
				}
			});
		}		
	}



	/*---tasktitle---*/
	elem = $('#-submenu_taskdetail_tasktitle').clone().prop('id','');
	elem.find("[find=taskid]").html(taskid);
	var elem_title_text = elem.find('[find=title_text]');
	if(that.param.type == 'files'){
		elem_title_text.html(wrapper_to_html(item['+name']));
		var elem_title_fileInfo = $('#-submenu_taskdetail_tasktitle_fileInfo').clone().prop('id','');
		var fileSize = app_layers_files_bitConvert(item['size']);
		var sizeUnit = fileSize.unit;
		var sizeNum = fileSize.val;
		elem_title_fileInfo.find('[find=val]').html(sizeNum);
		elem_title_fileInfo.find('[find=unit]').html(sizeUnit);
		elem_title_fileInfo.find('[find=category]').html(item['category']);
		elem_title_fileInfo.find('[find=ori_ext]').html(item['ori_ext'].toUpperCase());
		elem_title_text.after(elem_title_fileInfo);
		elem_title_fileInfo.find('[find=downloadIcon]').on('click', function(){
			device_download(Lincko.storage.getDownload(itemToCopy._id || item['_id'], '_blank', item['+name']));
		});
	}
	else{
		elem_title_text.html(item['+title']);
		if(true || taskid == 'new' || (wrapper_localstorage.uid in item['_perm'] && item['_perm'][wrapper_localstorage.uid][0] > 1)){
			elem_title_text.focus(function(){
				if( $(this).html() == newTitle ){
					$(this).html('').attr('style','');
				}
			});
			elem_title_text.blur(function(){
				if( $(this).html() == '' ){
					$(this).html(newTitle).css('opacity',0.4);
				}
			});
			if( item['+title'] == newTitle ){
				elem_title_text.css('opacity',0.4);
			}
		}
	}

	if(taskid != 'new'){
		//title autosave for tasks, notes, files
		elem_title_text.blur(function(){
			setTimeout(function(text){
				if(that.submenu_hide){ return; } //no need to update comment if this is after submenu_hide 

				var old_title = item['+title'] || item['+name'];
				var new_title = text;

				if(old_title != new_title){
					var param = {id: taskid};
					var param_prepare = {};
					if(item['+title']){ 
						item['+title'] = new_title; 
						param.title = new_title;
						param_prepare[item._type+'_'+item._id] = {'+title': true};
					}
					else{
						item['+name'] = new_title;
						param.name = new_title;
						param_prepare[item._type+'_'+item._id] = {'+name': true};
					}

					if(that.param.type == 'tasks'){
						skylist.sendAction.tasks(param, item, routeObj.update);
					}
					else{
						wrapper_sendAction(param, 'post', routeObj.update);
					}
					Lincko.storage.data[item._type][item._id] = item;
					app_application_lincko.prepare(item._type+'_'+item._id, true, param_prepare);
				}
			}, 1000, elem_title_text.text());
		});//end of blur event
	}




	elem_title_text.prop('contenteditable',true);
	elem_title_text.mousedown(function(){
		var scroll = myIScrollList[$(this).parents(".overthrow").prop("id")];//find iScroll
		scroll.disable();//disables the iScroll
	});
	elem_title_text.mouseup(function(){
		var scroll = myIScrollList[$(this).parents(".overthrow").prop("id")];//find iScroll
		scroll.enable();//disables the iScroll
	});

	elem_title_text.on('paste', function(){
		setTimeout(function(){
			elem_title_text.html($('<div>'+elem_title_text.html()+'</div>').text());
		},10);
		
	});
	elem_title_text.keydown(function(event){
		if(event.keyCode == 13){
			event.preventDefault();
			$(this).focusout();
			$(this).blur();
		}
	});
	/*----leftbox----*/
	if( item['_type'] == "tasks" ){
		var elem_checkbox = $('#-skylist_checkbox').clone().prop('id','submenu_taskdetail_checkbox_'+that.md5id);
		elem.find('[find=leftbox]').html(elem_checkbox);
		if(item['approved']){
			elem.addClass('skylist_card_checked');
		}
		elem.find('[find=checkbox]').on('click', function(event){
			event.stopPropagation();
			var elem_title = $(this).closest('table');
			elem_title.toggleClass('skylist_card_checked');
			if( elem_title.hasClass('skylist_card_checked') ){
				approved = true;
			}
			else{
				approved = false;
			}

			if(taskid != 'new'){
				wrapper_sendAction(
					{
						"id": item['_id'],
						"approved": approved,
					},
					'post', 'task/update');
				item.approved = approved;
				Lincko.storage.data[item._type][item._id] = item;
				app_application_lincko.prepare(item._type+'_'+item._id, true);
			}
		});

	}
	else if( item['_type'] == "files" ){
		var fileType_class = 'fa fa-file-o';
		var elem_leftbox = $('<span></span>').addClass('skylist_card_leftbox_fileIcon');
		var thumb_url = null;
		if(item['category'] == 'image'){
			thumb_url = Lincko.storage.getLinkThumbnail(itemToCopy._id || item['_id']);
			elem_leftbox = $('<img />').prop('src',thumb_url).click(itemToCopy._id || item['_id'], function(event){
				event.stopPropagation();
				previewer.pic(event.data);
			});
		}
		else if(item['category'] == 'video'){
			thumb_url = Lincko.storage.getLinkThumbnail(itemToCopy._id || item['_id']);
			elem_leftbox = $('<img />').prop('src',thumb_url).click(itemToCopy._id || item['_id'], function(event){
				event.stopPropagation();
				previewer.video(event.data);
			});
		}
		else if(item['category'] == 'audio'){
			fileType_class = app_models_fileType.getClass(itemToCopy.ori_ext || item.ori_ext);
			elem_leftbox.addClass(fileType_class);
			elem_leftbox.click(itemToCopy._id || item['_id'], function(event){
				event.stopPropagation();
				previewer.audio(event.data);
			});
		}
		else{
			fileType_class = app_models_fileType.getClass(itemToCopy.ori_ext || item.ori_ext);
			elem_leftbox.addClass(fileType_class);
		}

		elem.find('[find=leftbox]').html(elem_leftbox);
	}

	submenu_taskdetail.append(elem);

	/*meta (general)*/
	var elem_meta = $('#-submenu_taskdetail_burgerBar').clone().prop('id','submenu_taskdetail_burgerBar_'+that.md5id);


	var update_burgerBar = function(elem){
		if(!elem){ var elem = elem_meta; }
		//clear all inputs
		$.each(elem.find('[find=values] input'), function(i, elem_input){
			$(elem_input).val('');
		});

		var burgerInst = {};

		/*---projects-----*/
		var elem_box_projects = elem.find('[find="projects"]');
		var elem_text_projects = elem_box_projects.find('[find=text]');
		var elem_input_projects = elem.find('[find=values] input[find=projects_id]');
		if(taskid != 'new'){
			if(item['_parent'][0] == 'projects'){
				that.param.projID = item['_parent'][1];
			}
			else{
				that.param.projID = false;
			}
		}
		elem_input_projects = that.param.projID;
		var item_project = Lincko.storage.get('projects',that.param.projID);
		if(item_project.personal_private){
			elem_text_projects.text(Lincko.Translation.get('app', 2502, 'html')); //Personal Space
		}
		else if(!item_project){
			elem_box_projects.addClass('display_none');
		}
		else{
			elem_text_projects.html(item_project['+title']);
		}

		
		if(item['_id'] == 'new'){
			var cb_select_projects = function(data){
				elem_text_projects.text(data.text);
				item['_parent'][1] = data.val;
				that.param.projID = data.val;
				//if changing task, make task assigned to nobody
				taskdetail_tools.taskUserCheck();
				update_burgerBar();
			}
			var burger_list_projects = burger_list.projects();
			$.each(burger_list_projects, function(i, obj){
				if(obj.val == that.param.projID){ obj.preSelect = true; }
			});

			burgerInst.projects = burger_attach_clickHandler.projects(elem_box_projects, item['_type'], item['_id'], null, cb_select_projects, null, burger_list_projects);
		}
		else{
			burgerInst.projects = burger_attach_clickHandler.projects(elem_box_projects, item['_type'], item['_id'], null, true);
		}
		/*---END OF projects-----*/


		/*---calendar-----*/
		var elem_box_calendar = elem.find('[find="calendar"]');
		var elem_text_calendar = elem.find('[find=calendar] [find=text]');
		if(that.param.type == 'tasks'){
			elem_box_calendar.addClass('skylist_clickable');
			elem.find('[find=values] input[find=duedate_timestamp]').val((item['start'] + item.duration)*1000);

			//set text due date
			var duedate = item.start === null ? false : new wrapper_date(item['start'] + item.duration);
			elem_text_calendar.text(skylist_textDate(duedate) || duedate.display('date_very_short'));


			if(item['_id'] == 'new'){
				var cb_select_calendar = function(timestamp, elem_datepicker){
					if(!timestamp){
						item.start = null;
					} else {
						item.start = timestamp - item.duration;
					}
					if(elem_datepicker && elem_datepicker.blur){ 
						burgerInst.calendar = elem_datepicker; 
						elem_datepicker.blur(); 
					}
					update_burgerBar();
				}

				var currentDate = (item['start'] + item.duration)*1000;

				burgerInst.calendar = burger_attach_clickHandler.calendar(elem_box_calendar, item['_type'], item['_id'], null, cb_select_calendar, null, currentDate);
			}
			else{
				burgerInst.calendar = burger_attach_clickHandler.calendar(elem_box_calendar, item['_type'], item['_id'], null, true, null);
			}

		}
		else{
			var date = new wrapper_date(item['updated_at']);
			elem_text_calendar.html(date.display('date_very_short'));
		}
		/*---END OF calendar-----*/


		/*---user-----*/
		var elem_box_user = elem.find('[find="user"]');
		var elem_text_user = elem.find('[find=user] [find=text]');
		elem_input_user = null;
		if(that.param.type == 'tasks'){
			elem_input_user = elem.find('[find=values] input[find=user_id]');
			in_charge = '';
			if(item['_id'] == 'new'){
				//force user as in_charge
				if(Lincko.storage.get("projects", that.param.projID, 'personal_private')){
					in_charge_id = wrapper_localstorage.uid;
				}

				//re construct _users obj
				item['_users'] = {};
				$.each(Lincko.storage.whoHasAccess('projects', that.param.projID), function(i,val){
					item['_users'][val] = {};
					item['_users'][val]['in_charge'] = false;
				});

				//if the preious in_charge_id exists in _users (i.e. in this project), give him in_charge
				if(item['_users'][in_charge_id]){
					item['_users'][in_charge_id]['in_charge'] = true;
				}
				else{ //if not in this project, then false (not assigned)
					in_charge_id = false;
				}
			}

			for (var i in item['_users']){
				if( item['_users'][i]['in_charge']==true ){
					in_charge += ' ';
					in_charge += Lincko.storage.get("users", i ,"username");
				}
			}
			if( !in_charge ){
				in_charge = Lincko.Translation.get('app', 3608, 'html'); //Not Assigned
			}
			elem_text_user.text(in_charge);

			if( !Lincko.storage.get("projects", that.param.projID, 'personal_private') ){
				elem_box_user.addClass('skylist_clickable');
				if(item['_id'] == 'new'){
					var cb_select_in_charge = function(data){
						$.each(item['_users'], function(id, obj){
							obj['in_charge'] = false;
						});

						if(!item['_users'][data.val]){
							item['_users'][data.val] = {};
						}

						if(data.preSelect){
							item['_users'][data.val].in_charge = false;
							in_charge_id = false;
						}
						else{
							item['_users'][data.val].in_charge = true;
							data.preSelect = true;
							in_charge_id = data.val;
						}
						update_burgerBar();
					}
					var burger_list_inCharge = burger_list.in_charge('projects', that.param.projID);
					$.each(burger_list_inCharge, function(i, obj){
						if(obj.val == in_charge_id){ obj.preSelect = true; }
					});

					burgerInst.user = burger_attach_clickHandler.in_charge(elem_box_user, 'projects', that.param.projID, null, cb_select_in_charge, null, burger_list_inCharge);
				}
				else{
					burgerInst.user = burger_attach_clickHandler.in_charge(elem_box_user, item['_type'], item['_id'], null, true);
				}
				elem_box_user.addClass('skylist_clickable');
			}
			else{
				elem_box_user.off('click.burger');
				elem_box_user.removeClass('skylist_clickable');
			}
		}
		else{
			elem_text_user.html(Lincko.storage.get("users", item['created_by'],"username"));
		}
		/*---END OF user-----*/

		/*---action_menu---*/
		var elem_action_menu = elem.find('[find=action_menu]');
		elem.find('.submenu_taskdetail_burgerBar_actions').click(function(){
			if(action_menu_opened){
				elem_action_menu.velocity({width:0},{
					mobileHA: hasGood3Dsupport,
					begin: function(){
						elem_action_menu.css('display','block');
					},
					complete: function(){
						action_menu_opened = false;
						elem_action_menu.attr('style','');
					},
				});
			}
			else{
				elem_action_menu.velocity({width:25},{
					mobileHA: hasGood3Dsupport,
					begin: function(){
						elem_action_menu.css('display','block');
					},
					complete: function(){
						action_menu_opened = true;
					}
				});
			}
		});

		//remove tooltips for disabled blocks
		var elem_burgerBar_block_OFF = elem.find('.submenu_taskdetail_burgerBar_block:not(.skylist_clickable)').removeAttr('title');

		return elem;
	}// end of update_burgerBar function
	submenu_taskdetail.append(update_burgerBar(elem_meta));



	/*---END OF all meta---*/

	/*---description---*/
	if(that.param.type != 'files'){ //no file description for beta
		elem = $('#-submenu_taskdetail_description').clone().prop('id',that.id+'_submenu_taskdetail_description');
		var elem_description_text = elem.find('[find=description_text]');
		elem_description_text.html(item['-comment']);

		if(that.param.voice){
			$.each(that.param.voice, function(i, id_voice){
				elem_description_text.append(app_models_audio.build(id_voice).attr('contenteditable',false));
				elem_description_text.append('<p><br></p>');
			});
		}

		var load_img_timeout = null;
		elem_description_text.find('img').one('load', function(){
			clearTimeout(load_img_timeout);
			load_img_timeout = setTimeout(function(){
				$(window).resize();
			}, 500);
		});

		if(taskid != 'new' && that.param.type != 'files'){
			//description autosave for tasks, notes, files
			elem_description_text.blur(function(event){ 
				setTimeout(function(){
					if(that.submenu_hide){ return; } //no need to update comment if this is after submenu_hide 
					var old_comment = item['-comment'];
					var new_comment = elem_description_text.html();
					if(new_comment == '<p><br></p>'){ return false; } //dont update if it is ckedditor default empty elem

					if(old_comment != new_comment){
						var param = {id: taskid};
						if(item['-comment']){ 
							item['-comment'] = new_comment; 
							param.comment = new_comment;
						}

						if(that.param.type == 'tasks'){
							skylist.sendAction.tasks(param, item, routeObj.update);
						}
						else{
							wrapper_sendAction(param, 'post', routeObj.update);
						}
						Lincko.storage.data[item._type][item._id] = item;
						var param_prepare = {};
						param_prepare[item._type+'_'+item._id] = {'-comment': true};
						app_application_lincko.prepare(item._type+'_'+item._id, true, param_prepare);
					}
				}, 1000); //inside setTimeout to be able to occur after a possible submenu_hide
					
			});//end of blur event
		}


		//use iframe to detect editor size change and adjust iscroll accordingly
		elem.find('iframe').on('load', function(){
			$(this.contentWindow).resize(submenu_content.prop('id'), function(e){
				var iscroll = myIScrollList[e.data];
				if(iscroll){
					var wrapper = $(iscroll.wrapper);
					iscroll.refresh();
					iscroll.scrollBy(0, -wrapper.scrollTop());
					wrapper.scrollTop(0);
					taskdetail_setEditorBarPosition(that, false);
				}
			});
		});
		
		submenu_taskdetail.append(elem);
	} //end of description


	/*-----subtasks---------------------*/
	if(that.param.type == 'tasks'){
		var elem_subtasks = $('#-submenu_taskdetail_subtasks').clone().prop('id','submenu_taskdetail_subtasks_'+that.md5id);
		var elem_subtasks_wrapper = elem_subtasks.find('[find=subtasks_wrapper]');
		var elem_newSubtask = elem_subtasks.find('[find=newSubtask]');
		var elem_subtaskCount = elem_subtasks.find('[find=subtaskCount]');

		var generate_subtaskCard = function(task_id, title, temp_id, approved){
			var approved = typeof approved == 'boolean' ? approved : false;
			var subtask = null;
			var elem_subtaskCard = $('#-submenu_taskdetail_subtasks_card').clone().prop('id','').removeClass('skylist_clickable');
			if($.isNumeric(task_id)){
				subtask = Lincko.storage.get('tasks', task_id);
			}

			var elem_subtaskCard_title = elem_subtaskCard.find('[find=title]');

			if(!task_id || !subtask){ //fake subtask
				if(!task_id){ task_id = taskdetail_getRandomInt(); }
				elem_subtaskCard_title.text(title);
			}
			else{
				elem_subtaskCard_title.text(subtask['+title']);
			}

			//checkbox
			if(approved || (subtask && subtask.approved)){
				elem_subtaskCard.addClass('submenu_taskdetail_subtasks_card_checked');
			}

			elem_subtaskCard.attr('task_id',task_id);
			if(temp_id){
				elem_subtaskCard.attr('temp_id', temp_id);
			}


			var update_subtaskTitle = function(new_title){
				task_id = parseInt(elem_subtaskCard.attr('task_id'),10);
				subtask = Lincko.storage.get('tasks', task_id);
				if(subtask && new_title != subtask['+title']){
					wrapper_sendAction({id: task_id, title: new_title}, 'post', 'task/update');
				}
			}

			elem_subtaskCard_title.blur(function(){
				var subtask_title = $.trim($(this).text());
				$(this).html(subtask_title);
				update_subtaskTitle(subtask_title);
			});

			elem_subtaskCard_title.keypress(function(event){
				if((event.which || event.keyCode) == 13){ //if enter is pressed
					event.preventDefault();
					$(this).blur();
				}
			});


			elem_subtaskCard.find('[find=checkbox]').click(function(){
				task_id = parseInt( $(this).closest('.submenu_taskdetail_subtasks_card').attr('task_id'),10);
				if(typeof task_id != 'number' || !task_id){ return false; }
				subtask = Lincko.storage.get('tasks', task_id);
				if(!subtask){
					return false; //cannot update a non-existing task
				}

				elem_subtaskCard.toggleClass('submenu_taskdetail_subtasks_card_checked');
				var approved = elem_subtaskCard.hasClass('submenu_taskdetail_subtasks_card_checked');
				wrapper_sendAction({id: task_id, approved: approved}, 'post', 'task/update');


				if(approved){
					progressBarController.completed++;
					progressBarController.updateBar();
				}
				else{
					progressBarController.completed--;
					progressBarController.updateBar();
				}
			});
			elem_subtaskCard.find('[find=removeIcon]').click(function(){
				task_id = parseInt(elem_subtaskCard.attr('task_id'),10);
				subtask = Lincko.storage.get('tasks', task_id);
				if(!subtask){ //new task
					delete taskdetail_subtaskQueue.queue[that.param.uniqueID][task_id];
				}
				else{
					wrapper_sendAction({id: task_id}, 'post', 'task/delete');
				}
				elem_subtaskCount.text(parseInt(elem_subtaskCount.text(),10) -1 );
				progressBarController.total--;
				if(elem_subtaskCard.hasClass('submenu_taskdetail_subtasks_card_checked')){
					progressBarController.completed--;
				}
				progressBarController.updateBar();
				elem_subtaskCard.velocity('slideUp',{
					complete: function(){
						elem_subtaskCard.remove();
					},
				});
			});

			//dont use hover mechanism for touch devices
			if(supportsTouch){
				elem_subtaskCard.addClass('submenu_taskdetail_subtasks_card_noHover');
			}

			return elem_subtaskCard;
		}


		var subtask_count = 0;
		if(item._tasksdown){
			//set the fav index to be used for the next subtask to be added
			nextSubtaskFav = taskdetail_tools.nextSubtaskFav(item._tasksdown);

			$.each(taskdetail_tools.list_subtaskFav(item._tasksdown), function(i, subtask_id){
				var subtask = Lincko.storage.get('tasks', subtask_id);
				//dont show if task doesnt exist or it doesnt match the project of the parent task
				if(!subtask || subtask.deleted_at || subtask._parent[1] != that.param.projID ) return;
				else{
					elem_subtasks_wrapper.append(generate_subtaskCard(subtask_id));
					subtask_count++;
					if(subtask.approved){
						progressBarController.completed++;
					}
				}
			});
		}
		progressBarController.total = subtask_count;
		elem_subtaskCount.text(subtask_count);


		var elem_newSubtask_title = elem_newSubtask.find('[find=title]');
		var elem_newSubtask_btn = elem_subtasks.find('[find=new_btn]').click(function(){
			elem_newSubtask.removeClass('display_none');
			elem_newSubtask_title.focus();
		});
		elem_newSubtask_title.blur(function(){
			var text = $.trim($(this).text());
			if(text.length){//if there is text, trigger enter
				var e = jQuery.Event("keypress");
				e.keyCode = e.which = 13; // enter key
				$(this).trigger(e);
			}
			$(this).html('');
			elem_newSubtask.addClass('display_none');
		});
		elem_newSubtask_title.keypress(function(event){
			if((event.which || event.keyCode) == 13){ //if enter is pressed
				event.preventDefault();

				var subtask_title = $.trim($(this).text());
				if(!subtask_title.length){
					$(this).blur();
					return false;
				}

				var param = {
					parent_id: that.param.projID, 
					title: subtask_title,
					start: null,
				};
				if(taskid == 'new'){
					var fakeID = taskdetail_getRandomInt();
					elem_subtasks_wrapper.append(generate_subtaskCard(fakeID, subtask_title));
					progressBarController.total++;
					progressBarController.updateBar();
					if(!taskdetail_subtaskQueue.queue[that.param.uniqueID]){
						taskdetail_subtaskQueue.queue[that.param.uniqueID] = {};
					}
					taskdetail_subtaskQueue.queue[that.param.uniqueID][fakeID] = { param: param, fav: nextSubtaskFav };
					nextSubtaskFav++;
				}
				else{
					param['tasksup>access'] = {};
					param['tasksup>access'][taskid] = true;
					param['tasksup>fav'] = {};
					param['tasksup>fav'][taskid] = nextSubtaskFav; nextSubtaskFav++;
					var tempID = null;
					var cb_begin = function(jqXHR, settings, temp_id){
						tempID = temp_id;
						elem_subtasks_wrapper.append(generate_subtaskCard(taskdetail_getRandomInt(), subtask_title, tempID));
						progressBarController.total++;
						progressBarController.updateBar();
					}
					var cb_success = function(msg, data_error, data_status, data_msg){
						var elem_toUpdate = elem_subtasks_wrapper.find('[temp_id='+tempID+']');
						if(elem_toUpdate.length){
							var real_subtask = Lincko.storage.list('tasks',1,{temp_id: tempID})[0];
							if(real_subtask && real_subtask._id){
								elem_toUpdate.removeAttr('temp_id');
								elem_toUpdate.attr('task_id', real_subtask._id);
							}
						}
					}
					var cb_error = function(){
						var elem_toRemove = elem_subtasks_wrapper.find('temp_id', tempID);
						if(elem_toRemove.length){
							elem_toRemove.remove();
						}
					}
					wrapper_sendAction(param, 'post', 'task/create', cb_success, cb_error, cb_begin);
				}
			
				elem_subtaskCount.text(parseInt(elem_subtaskCount.text(),10) +1 );
				$(this).html('');

				if(myIScrollList[submenu_content.prop('id')]){
					myIScrollList[submenu_content.prop('id')].refresh();
					if( responsive.test("maxMobileL") ){
						myIScrollList[submenu_content.prop('id')].scrollBy(0, -elem_subtasks_wrapper.children('div').eq(0).outerHeight());
					}
				}
				
			}
		});

		submenu_taskdetail.append(elem_subtasks);


		/*---progress bar setup-----------------------*/
		var elem_progressbar = $('#-submenu_taskdetail_progressBar_wrapper').clone().prop('id','submenu_taskdetail_progressBar_wrapper_'+that.md5id);

		progressBarController.elem_container = elem_progressbar.find('[find=container]').eq(0);
		progressBarController.elem_bar = elem_progressbar.find('[find=bar]').eq(0);
		progressBarController.elem_percent = elem_progressbar.find('[find=percent]').eq(0);
		progressBarController.updateBar();

		elem_meta.before(elem_progressbar);
		/*--- END OF progress bar-------------------*/


		//copy subtasks if needed
		if(itemToCopy._tasksdown){
			var preloadSubtasklist = [];
			$.each(itemToCopy._tasksdown, function(id, obj){
				var subtask = Lincko.storage.get('tasks', id);
				if(subtask){
					if(preloadSubtasklist[obj.fav]){
						preloadSubtasklist.push(subtask);
					} else {
						preloadSubtasklist[obj.fav] = subtask;
					}
				}
			});

			//generate new subtasks and add them to queue
			for(var i in preloadSubtasklist){
				var subtask = preloadSubtasklist[i];
				var fakeID = taskdetail_getRandomInt();
				elem_subtasks_wrapper.append(generate_subtaskCard(fakeID, subtask['+title'], null, subtask.approved));
				progressBarController.total++;
				progressBarController.updateBar();
				if(!taskdetail_subtaskQueue.queue[that.param.uniqueID]){
					taskdetail_subtaskQueue.queue[that.param.uniqueID] = {};
				}
				taskdetail_subtaskQueue.queue[that.param.uniqueID][fakeID] = { 
					param: {
						parent_id: that.param.projID, 
						title: subtask['+title'],
						start: null,
						approved: subtask.approved,
					}, 
					fav: nextSubtaskFav,
				};
				nextSubtaskFav++;
			}
		}
		

	};
	/*-----END OF subtasks--------------*/






	/*-----Links------------------*/
	var generate_linkCard = function(type, id){
		var item_link = null;
		if(typeof type == 'object'){ 
			item_link = type;
			var type = item_link['_type'];
			var id = item_link['_id'];
		}
		else{
			item_link = Lincko.storage.get(type, id);
		}

		var elem_linkcard = $('#-submenu_taskdetail_links_card').clone().prop('id','').attr(item_link['_type']+'_id', item_link['_id']).click(function(){
			submenu_Build('taskdetail', true, null, 
				{
					"type":item_link['_type'], 
					"id":item_link['_id'],
				}, that.preview);
		});

		//add temp_id
		if(item_link.temp_id){
			elem_linkcard.attr('temp_id', item_link.temp_id);
		}

		//dont use hover mechanism for touch devices
		if(supportsTouch){
			elem_linkcard.addClass('submenu_taskdetail_links_card_noHover');
		}

		//dont open file submenu for action buttons
		elem_linkcard.find('[find=action_div]').click(function(event){
			event.stopPropagation();
		});
		
		//add title or name
		elem_linkcard.find('[find=title]').text(item_link['+title'] || item_link['+name']);

		//add comment(description)
		if(item_link.comment){
			elem_linkcard.find('[find=description]').text(item_link['comment']);
		}
		else{
			elem_linkcard.find('[find=description]').addClass('display_none');
		}

		//thumbnail or icons
		if(item_link.category && (item_link.category == 'image' || item_link.category == 'video'
			|| item_link.category == 'audio')){
			var thumb_url = Lincko.storage.getLinkThumbnail(item_link['_id']);
			if(thumb_url){
				if(item_link.category == 'image'){
					var elem_leftbox = elem_linkcard.find('[find=card_leftbox]').append($('<img />').prop('src',thumb_url)).removeClass('fa-file-o');
					elem_leftbox.click(function(event){
						event.stopPropagation();
						previewer.pic(item_link['_id']);
					});
				}
				else if(item_link.category == 'video'){
					var elem_leftbox = elem_linkcard.find('[find=card_leftbox]').append($('<img />').prop('src',thumb_url)).removeClass('fa-file-o');
					elem_leftbox.click(function(event){
						event.stopPropagation();
						previewer.video(item_link['_id']);
					});
				}	
				else  if(item_link.category == 'audio'){
					var elem_leftbox = elem_linkcard.find('[find=card_leftbox]').addClass( app_models_fileType.getClass(item_link.ori_ext));
					elem_leftbox.click(function(event){
						event.stopPropagation();
						previewer.audio(item_link['_id']);
					});
				}			
			}
		}
		else if(item_link._type == 'tasks'){
			elem_linkcard.find('[find=card_leftbox]').addClass('icon-Tasks');
		}
		else if(item_link._type == 'notes'){
			elem_linkcard.find('[find=card_leftbox]').addClass('submenu_taskdetail_links_notesABC');
		}
		else{
			var fileType_class = app_models_fileType.getClass(item_link.ori_ext);
		 	elem_linkcard.find('[find=card_leftbox]').addClass(fileType_class);
		}

		//cannot remove file link from the file. must go to the relevant task/note to remove link to file
		if(that.param.type != 'files'){
			//download file
			var download_url = Lincko.storage.getDownload(item_link['_id']);
			if(download_url){
				elem_linkcard.find('[find=downloadIcon]').removeClass('display_none').on('click', function(){
					device_download(download_url, '_blank', item_link['+name']);
				});
			}

			//remove linking
			elem_linkcard.find('[find=removeIcon]').click(function(){
				if(taskid == 'new' || !item['_id'] || item['_id'] == 'new'){
					taskdetail_linkQueue.removeQueue(that.param.uniqueID, item_link['_id']);
				}
				else{
					var obj = {};
					var route = routeObj.update;
					if(that.param.type == 'files'){
						obj[taskid] = false;
						removedFromID = item_link['_id'];
						route = item_link['_type'].slice(0, -1)+'/update';
					}
					else{
						obj[item_link['_id']] = false;
						removedFromID = item['_id'];
					}

					var param_sendAction = {
						id: removedFromID,
					};
					param_sendAction[item_link['_type']+'>access'] = obj;
					wrapper_sendAction(param_sendAction, 'post', route);
				}
				elem_linkcard.velocity('slideUp',{
					mobileHA: hasGood3Dsupport,
					complete: function(){
						elem_linkcard.recursiveRemove();
						tasketail_updateLinkCount(elem_links);
					},
				});
			});
		}
		else{
			//cannot remove links from file detail page
			elem_linkcard.find('[find=action_div]').recursiveRemove(0);
		}

		return elem_linkcard;
	}//end of generate_linkCard

	var elem_links = $('#-submenu_taskdetail_links').clone().prop('id','submenu_taskdetail_link_'+that.md5id);
	elem_links.find('[find=new_btn]').click(function(){
		if(taskid == 'new'){//if 'new' then use queue
			app_upload_open_files('projects', that.param.projID, false, false, that.param.uniqueID);
			//app_upload_open_files('projects', that.param.projID, false, true, {link_queue: true});
		}
		else{
			app_upload_open_files(that.param.type, taskid, false, true);
		}
	});
	if(that.param.type == 'notes'){
		elem_links.find('[find=existing_btn]').toggleClass('display_none');
	}
	elem_links.find('[find=existing_btn]').click(function(){
		var param_itemSelector = {
			item:item,
			uniqueID: that.param.uniqueID,
			hideItems: taskdetail_linkQueue.getQueued(that.param.uniqueID),
		}
		if(taskid != 'new'){ param_itemSelector.item = Lincko.storage.get(item['_type'], item['_id']); }
		if(item['_type'] == 'notes'){
			param_itemSelector.hideType = { notes: true };
		}
		submenu_Build('itemSelector', true, null, param_itemSelector, that.preview);
	});
	var elem_links_wrapper = elem_links.find('[find=links_wrapper]');

	var link_count = 0;
	var item_linked = false;
	//dont clone links for files
	if(!(that.param.type == 'files' && that.param.id_toCopy)){
		item_linked = Lincko.storage.list_links(that.param.type, that.param.id_toCopy || taskid) || that.param.files;
	}

	if(typeof item_linked == 'object'){
		for(var category in item_linked){
			$.each(item_linked[category], function(id,item){
				if(item.deleted_at){ return; } //ignore deleted items
				elem_links_wrapper.append(generate_linkCard(item));
				link_count++;

				if(taskid == 'new'){
					//add to queue
					taskdetail_linkQueue.queue[md5(Math.random())] = {
						uniqueID: that.param.uniqueID,
						parent_type: that.param.type,
						id: id,
						type: category,
						visible: true,
					}
				}
			});
		}
	}

	

	elem_links.find('[find=linkCount]').text(link_count);

	if(that.param.type == 'files'){
		elem_links.find('[find=link_btns]').addClass('display_none');
		if(link_count == 0){
			elem_links.find('.submenu_taskdetail_collapsable_button').addClass('submenu_taskdetail_collapsable_button_disabled');
		}
	}

	submenu_taskdetail.append(elem_links);
	/*-----END of Links-----------*/


	/*---taskcomments--*/
	var elem_submenu_taskdetail_comments = $('#-submenu_taskdetail_comments').clone().prop('id','submenu_taskdetail_comments_'+that.md5id);
	submenu_taskdetail.append(elem_submenu_taskdetail_comments);


	var commentWithID = function(array, id){
		for( var i in array){
			if( array[i]['_id'] == id ){
				return array[i];
			}
		}
		return false;
	}

	var generateCommentsArray = function(){
		var comment;
		var comments_all = [];
		if( $.isNumeric(taskid) ){
			comments_all = Lincko.storage.list('comments',null, null, that.param.type, taskid, true).reverse();
		}
		var comments_primary = [];
		var tree;
		var comments_sorted = [];
		var comments_sub = [];

		for( var i in comments_all ){
			comment = comments_all[i];
			if( comment['_parent'][0] != 'comments' ){
				comments_primary.push(comment);
			}
		}

		for( var j in comments_primary ){
			comments_sub = [];
			tree = Lincko.storage.tree('comments', comments_primary[j]['_id'], 'children', true, true);
			for( var id in tree['comments'] ){
				comments_sub.push(commentWithID(comments_all, id));
			}
			comments_sub = Lincko.storage.sort_items(comments_sub, 'created_at', 0, -1, true);
			$.each(comments_sub, function(i,val){
				comments_sorted.push(val);
			});
		}

		return comments_sorted.reverse();
	}

	var comments_sorted = generateCommentsArray();
	
	

	var generateCommentBubble = function(comment){
		if(!comment || typeof comment != 'object') return;
		//if(!comment) return false;
		//comment is a Lincko.storage.data comment object
		var elem = $('#-submenu_taskdetail_commentbubble').clone().prop('id','');
		elem.find('[find=comment_id]').attr('comment_id', comment['_id']);
		//elem.find('[find=text]').html(wrapper_to_html(comment['+comment']));
		//elem.find('[find=text]')[0].innerHTML = wrapper_to_html(comment['+comment']);
		//var str = wrapper_to_html(comment['+comment']);
		//elem.find('[find=text]')[0].execCommand('insertText', false, 'AA');
		elem.find('[find=text]').text(comment['+comment']);

		var created_by = Lincko.storage.get("users", comment['created_by'],"username");
		elem.find('[find=name]').html(created_by);

		var picID  = Lincko.storage.get("users", comment['created_by'], 'profile_pic');
		var thumb_url = app_application_icon_single_user.src;
		if(picID){
			thumb_url = Lincko.storage.getLinkThumbnail(picID);
		} else if(comment['created_by']==0){ //LinckoBot
			thumb_url = app_application_icon_roboto.src;
		} else if(comment['created_by']==1){ //Monkey King
			thumb_url = app_application_icon_monkeyking.src;
		}
		elem.find('[find=profile_pic]').css('background-image','url("'+thumb_url+'")');

		var created_at = new wrapper_date(comment['created_at']);
		created_at = created_at.display('date_very_short');
		elem.find('[find=date]').html(created_at);

		if( comment['created_by'] == wrapper_localstorage.uid ){
			elem.addClass('submenu_taskdetail_commentbubble_me');
		}
		if( comment['_parent'][0] == "comments" ){
			elem.addClass('submenu_taskdetail_commentbubble_sub');
		}


		var elem_translateBtn = elem.find('[find=translateBtn]').html(Lincko.Translation.get('app', 56, 'html')); //translate
		elem_translateBtn.click(function(){
			var elem = $(this).closest('.submenu_taskdetail_commentbubble');
			var elem_translateBtn = $(this);
			elem_translateBtn.css('opacity','0.5');
			var elem_textTranslated = elem.find('[find=text_translated]');

			var translate_str = Lincko.Translation.get('app', 56, 'html'); //translate
			var untranslate_str = Lincko.Translation.get('app', 57, 'html'); //untranslate
			if(elem_textTranslated.hasClass('display_none')){
				var textToTranslate = elem.find('[find=text]').text();
				wrapper_sendAction( 
				    { 
				        "text": textToTranslate,
				    }, 
				    'post', 
				    'translation/auto', 
				    function(data){ 
			    		elem_textTranslated.html(data).removeClass('display_none');
			    		elem_translateBtn.html(untranslate_str);
			    		elem_textTranslated.velocity('slideDown',{
			    			mobileHA: hasGood3Dsupport,
			    			complete: function(){
			    				elem_translateBtn.removeAttr('style');
			    			}
			    		});
				    } 
				);
			}
			else{
	    		elem_translateBtn.html(translate_str);
	    		elem_textTranslated.velocity('slideUp',{
	    			mobileHA: hasGood3Dsupport,
	    			complete: function(){
	    				elem_textTranslated.html('').addClass('display_none');
	    				elem_translateBtn.removeAttr('style');
	    			}
	    		});
	    	}
		});


		if(item['_id'] == 'new' || taskid == 'new' ){
			elem.find('[find=replyBtn]').addClass('display_none');
		}
		else{
			elem.find('[find=replyBtn]').click(function(){
				var elem_click = $(this);
				var elem_replyTo = elem_click.closest('.submenu_taskdetail_commentbubble');
				var parentID = elem_replyTo.find('[find=comment_id]').attr('comment_id');
				if(!Lincko.storage.get('comments',parentID)){
					return false;
				}

				var elem_replyBubble = $('#-submenu_taskdetail_commentbubble').clone().prop('id','')
					.addClass('submenu_taskdetail_commentbubble_sub submenu_taskdetail_commentbubble_me submenu_taskdetail_commentbubble_addNew');
				elem_replyBubble.find('[find=name]').html(Lincko.storage.get("users", wrapper_localstorage.uid,"username"));
				elem_replyBubble.find('[find=comment_id]').attr('comment_id','new');
				var thumb_url = Lincko.storage.getLinkThumbnail(Lincko.storage.get("users", wrapper_localstorage.uid, 'profile_pic'));
				elem_replyBubble.find('[find=profile_pic]').css('background-image','url("'+thumb_url+'")');
				var elem_addNewComment_text = elem_replyBubble.find('[find=addNewComment_text]');
				elem_addNewComment_text.keyup(function(event) {
					if (event.keyCode == 13) {
						sendAction_newComment('comments', parentID, elem_replyBubble.find('[find=addNewComment_text]').val());
						elem_addNewComment_text.blur();
					}
				});
				elem_addNewComment_text.focusout(function(){
					elem_replyBubble.recursiveRemove(0);
				});

				elem_replyTo.after(elem_replyBubble);
				elem_addNewComment_text.focus();
			});
		}
		return elem;
	}

	var sendAction_newComment = function(parent_type, parent_id, comment){
		var id_fake = null;
		var tmpID = null;
		var param = {
			"parent_type": parent_type,
			"parent_id": parent_id,
			"comment": comment,
		}
		var cb_success = function(msg, data_error, data_status, data_msg){
			if(!document.getElementById('taskdetail_'+that.md5id)){ return; }

			var comment = Lincko.storage.data.comments[id_fake];
			if(comment){
				delete Lincko.storage.data.comments[id_fake];
			}
			tmpID = null;
			id_fake = null;
			return;


			var comment = Lincko.storage.list('comments',1,{temp_id: tmpID});
			if(comment.length){
				comment = comment[0];
				var elem = taskdetail_generateCommentBubble(comment, item['_id'], sendAction_newComment, that);
				var elem_toReplace = submenu_taskdetail.find('[comment_id='+tmpID+']').closest('.submenu_taskdetail_commentbubble');
				elem_toReplace.replaceWith(elem);
			}
			tmpID = null;
		}
		var cb_error = function(xhr_err, ajaxOptions, thrownError){
			if(!document.getElementById('taskdetail_'+that.md5id)){ return; }
			var elem_toRemove = submenu_taskdetail.find('[comment_id='+tmpID+']').closest('.submenu_taskdetail_commentbubble');
			elem_toRemove.recursiveRemove();
			tmpID = null;
			var elem_commentCount = elem_submenu_taskdetail_comments.find('[find=commentCount]');
			var commentCount = parseInt(elem_commentCount.html(),10);
			elem_commentCount.html(commentCount-1);
		}
		var cb_begin = function(jqXHR, settings, temp_id){
			if(!document.getElementById('taskdetail_'+that.md5id)){ return; }
			tmpID = temp_id;
			var commentObj = {};
			if(temp_id != 'new'){
				commentObj = taskdetail_makeFakeComment(comment, parent_type, parent_id, null, temp_id, true);
				if(commentObj && commentObj._id){
					id_fake = commentObj._id;
				}
			}
			else{
				commentObj['_id'] = tmpID;
				commentObj['+comment'] = comment;
				commentObj['created_by'] = wrapper_localstorage.uid;
				commentObj['created_at'] = $.now()/1000;
				commentObj['_parent'] = [];
				commentObj['_parent'][0] = parent_type;
				commentObj.temp_id = tmpID;
				commentObj.fake = true;

				if( commentObj['_parent'][0] == that.param.type ){
					//submenu_taskdetail.find('.submenu_taskdetail_comments_main').append(taskdetail_generateCommentThread(commentObj, true));
					submenu_taskdetail.find('.submenu_taskdetail_comments_main').append(taskdetail_generateCommentBubble(commentObj, item['_id'], sendAction_newComment, that));
				}
				else{
					submenu_taskdetail.find('[comment_id=new]').closest('.submenu_taskdetail_commentbubble[parent_id='+parent_id+']').replaceWith(taskdetail_generateCommentBubble(commentObj, item['_id'], sendAction_newComment, that));
				}

				//update count
				var elem_commentCount = elem_submenu_taskdetail_comments.find('[find=commentCount]');
				var commentCount = parseInt(elem_commentCount.html(),10);
				elem_commentCount.velocity('fadeOut',{
					mobileHA: hasGood3Dsupport,
					duration: 200,
					complete: function(){
						$(this).html(commentCount+1).attr('style','');
					}
				});
			}
			

			if(myIScrollList[submenu_content.prop('id')]){
				myIScrollList[submenu_content.prop('id')].refresh();
			}
		}
		if(parent_id == 'new'){ 
			cb_begin(null, null, 'new');
			param_newItemComments.push(param);
			return false; 
		}
		wrapper_sendAction(param, 'post', 'comment/create', cb_success, cb_error, cb_begin);
	} // END OF sendAction_newComment


	var elem_comments_main = submenu_taskdetail.find('.submenu_taskdetail_comments_main');
	var elem_seePrev = submenu_taskdetail.find('[find=seePrev_btn]');
	var commentCount_ini = 5; if( responsive.test("maxMobileL")){ commentCount_ini = 3; }
	var commentCount_seePrev = 10;
	var pageComments = function(comments, toShow, animation){
		if(!animation){ animation = false; }
		var elem_toShow_wrapper = $('<div></div>');
		var comments_hidden = [];
		var param_viewed = {};
		var commentCount = 0;


		var elem_rootcomment = $('<div rootcomment_id = true></div>');

		var showToParent = false;
		for ( var i = 0; i < comments.length; i++ ){
			commentCount++;
			comment = comments[i];
			if( commentCount <= toShow || showToParent ){
				
				// var elem_newComment_bubble = taskdetail_generateCommentBubble(comment, item['_id'], sendAction_newComment);
				// elem_rootcomment.prepend(elem_newComment_bubble);

				if(comment['new']){
					param_viewed['comments_'+comment['_id']] = true;
				}

				if(comment['_parent'][0] == 'comments'){
					showToParent = true;
				}
				else{//is a root comment
					showToParent = false;

					
					//elem_rootcomment.attr('rootcomment_id', comment['_id']);
					if(animation){
					elem_toShow_wrapper.prepend(taskdetail_generateCommentThread(comment, true, true, that));
					//elem_toShow_wrapper.prepend(elem_rootcomment);
					}
					else{
						elem_comments_main.prepend(taskdetail_generateCommentThread(comment, true, true, that));
						//elem_comments_main.prepend(elem_rootcomment);
					}
					//elem_rootcomment = $('<div rootcomment_id = true></div>');

				}


			}
			else{
				comments_hidden.push(comment);
			}
		}
		if(animation){
			elem_comments_main.prepend(elem_toShow_wrapper);
			elem_toShow_wrapper.velocity('slideDown',{
				mobileHA: hasGood3Dsupport,
				duration: 500,
				complete: function(){
					elem_toShow_wrapper.children().unwrap();
					if(submenu_content.prop('id') in myIScrollList){
						myIScrollList[submenu_content.prop('id')].refresh();
					}
				}
			});
		}
		if(!$.isEmptyObject(param_viewed)){
			wrapper_sendAction(param_viewed, 'post', 'data/viewed');
		}		

		if(comments_hidden.length > 0){
			elem_seePrev.removeClass('display_none');
			return comments_hidden;
		}
		else{
			elem_seePrev.addClass('display_none');
			return false;
		}
	}
	submenu_taskdetail.find('[find=commentCount]').html(comments_sorted.length);
	var comments_hidden = pageComments(comments_sorted, commentCount_ini);

	/*seePrev_btn logic*/
	elem_seePrev.click(function(){
		comments_hidden = pageComments(comments_hidden, commentCount_seePrev, true);
	});



	/*addNewComment*/
	var elem_addNewComment_wrapper = submenu_taskdetail.find('.submenu_taskdetail_addNewComment_wrapper');
	var elem_addNewComment_btn = elem_addNewComment_wrapper.find('[find=addNewComment_btn]');
	var elem_addNewComment_bubble_wrapper = elem_addNewComment_wrapper.find('[find=addNewComment_bubble_wrapper]');
	var elem_addNewComment_text = elem_addNewComment_wrapper.find('[find=addNewComment_text]');
	elem_addNewComment_bubble_wrapper.find('[find=name]').html(Lincko.storage.get("users", wrapper_localstorage.uid,"username"));
	var picID  = Lincko.storage.get("users", wrapper_localstorage.uid, 'profile_pic');
	var thumb_url = app_application_icon_single_user.src;
	if(picID){
		thumb_url = Lincko.storage.getLinkThumbnail(picID);
	}
	elem_addNewComment_bubble_wrapper.find('[find=profile_pic]')
	.css('background-image','url("'+thumb_url+'")');

	//array to hold comments entered to a new item(use it in sendAction after item is created)
	var param_newItemComments = [];

	var toggleNewComment = function(){
		elem_addNewComment_btn.toggleClass('display_none');
		elem_addNewComment_bubble_wrapper.toggleClass('display_none').toggleClass('submenu_taskdetail_commentbubble_addNew');
		elem_addNewComment_text.val('');
	}

	
	elem_addNewComment_btn.click(function(){
		elem_addNewComment_text.empty(); //DONT USE .recursiveEmpty() HERE! it will remove the keyup and focusout events
		toggleNewComment();
		elem_addNewComment_text.focus();
	});
	elem_addNewComment_text.keyup(function (event) {
		if (event.keyCode == 13) {
			sendAction_newComment(that.param.type, taskid, $(this).val());
			$(this).val('').blur();
		}
	});
	elem_addNewComment_text.focusout(function(event){
		if(!$.trim(elem_addNewComment_text.val()).length){
			toggleNewComment();
		}
	});
	/*---end of comments------*/


	//item activity
	if(taskid != 'new'){
		var elem_submenu_taskdetail_activity = $('#-submenu_taskdetail_activity').clone().prop('id','submenu_taskdetail_activity_'+that.md5id);
		submenu_taskdetail.append(elem_submenu_taskdetail_activity);
		var elem_submenu_taskdetail_activity_main = elem_submenu_taskdetail_activity.find('.submenu_taskdetail_activity_main');

		//direct history
		var hist_item = Lincko.storage.hist(that.param.type, null, [{id: taskid}]);
		//add project history that has to do with this item
		$.each(Lincko.storage.hist('projects', null, [{att: '_'+that.param.type}]), function(i, hist){
			if(hist.par && hist.par.tid && hist.par.tid == taskid){
				$.merge(hist_item, [hist]);
			}
		});
		//add this item's children history
		$.merge(hist_item, Lincko.storage.hist(null, null, [{type: ['!=', that.param.type]}, {id: ['!=', taskid]}], that.param.type, taskid, true));
		hist_item = Lincko.storage.sort_items(hist_item, 'timestamp', 0, -1, false);
		elem_submenu_taskdetail_activity.find('[find=activityCount]').text(hist_item.length);

		var feedActivity = function(){
			$.each(hist_item, function(i, hist){
				var hist_obj = new BaseItemCls(hist, 'history', true);
				hist_obj.item_display(elem_submenu_taskdetail_activity_main, that, 'history', 0);
			});
		}
	}

	/*attach collapsable_fn*/
	var submenu_taskdetail_collapsable_fn = function(elem_btn){
		if(elem_btn.hasClass('submenu_taskdetail_collapsable_button_disabled')){ return; }

		var elem_parent = elem_btn.parent();
		var elem_content = elem_btn.siblings();
		var elem_arrow = elem_btn.find('[find=icon_arrow]');
		if( elem_content.css('display')!='none' && !elem_parent.hasClass('submenu_taskdetail_collapsable_defaultCollapsed')){
			elem_content.velocity('slideUp',{
				mobileHA: hasGood3Dsupport,
				begin: function(){
					//description text
					if(elem_content.prop('id') == 'submenu_taskdetail_description_text_'+that.md5id){
						taskdetail_hideEditorBar(that);
					}
					elem_content.css({
						'background-color':'#FBFBFB',
					});
					//elem_arrow.addClass('fa-rotate-360');
				},
				complete: function(){
					myIScrollList[submenu_wrapper.find('[find=submenu_wrapper_content]').prop('id')].refresh();
				}
			});
			elem_arrow.velocity({
				'rotateZ': -90,
			}, {
				mobileHA: hasGood3Dsupport,
			});
		}
		else{
			elem_content.velocity('slideDown',{
				mobileHA: hasGood3Dsupport,
				begin: function(){
					elem_content.css('background','#FBFBFB');
				},
				complete: function(){
					elem_parent.removeClass('submenu_taskdetail_collapsable_defaultCollapsed');	
					elem_content.removeAttr('style');
					myIScrollList[submenu_wrapper.find('[find=submenu_wrapper_content]').prop('id')].refresh();
					//description text
					if(elem_content.prop('id') == 'submenu_taskdetail_description_text_'+that.md5id){
						taskdetail_setEditorBarPosition(that, false);
					}
				},
			});
			elem_arrow.velocity({
				'rotateZ': 0,
			}, {
				mobileHA: hasGood3Dsupport,
				begin: function(){
					$.Velocity.hook(this, "rotateZ", -90); //prevent velocity from overriding transform
				},
			});
		}
	}
	submenu_taskdetail.find('.submenu_taskdetail_collapsable_button').click(function(){
		if($(this).attr('toFeed') == 'activity'){
			feedActivity();
			$(this).removeAttr('toFeed');
		}
		submenu_taskdetail_collapsable_fn($(this));
	});
	
	//submenu_wrapper.find('[find=submenu_wrapper_content]').removeClass('overthrow');

	

	//control appearance of 'save' button
	if(taskid != 'new'){

		var textChanged = function(key){
			if(
				(key > 7 && key < 14) || 	//backspace, tab, enter
				key == 32 || 				//space
				key == 46 || 				//delete
				(key > 47 && key < 58) ||	//0 to 9
				(key > 64 && key < 91) ||	//a to z
				(key > 95 && key < 106) ||	//numpad 0 to 9
				(key > 105 && key < 112) ||	//math calc symbols
				(key > 185 && key < 193) || //text notations
				(key > 218 && key < 223)	//text notations2
			){
				return true;
			}
			else{
				return false;
			}
		}

		var elem_save = submenu_wrapper.find('.submenu_title.submenu_top_side_right');
		elem_save.addClass('display_none');

		submenu_wrapper.on('canSave', function(event){
			if(elem_save.hasClass('display_none')){
				elem_save.removeClass('display_none');
			}
		});

		elem_title_text.add(elem_description_text).keydown(function(event){
			if(textChanged(event.which)){
				submenu_wrapper.trigger('canSave');
			}
		});
	}

	
	/*---append to submenu_content---*/
	submenu_content.append(submenu_taskdetail);
	if(item.deleted_at){
		submenu_content.append('<div class="submenu_taskdetail_deletedOverlay"></div>');
	}



/*
	that.param.saveParam = {};
	that.param.saveParam.item = item;
	that.param.saveParam.submenu_taskdetail = submenu_taskdetail;
	that.param.saveParam.route_delete = route_delete;
	that.param.saveParam.itemID = taskid;
	that.param.saveParam.param_newItemComments = param_newItemComments;
*/
	app_application_lincko.add(
		that.id,
		'submenu_hide_'+that.preview+'_'+that.id,
		function(){
			that.submenu_hide = true;
			taskdetail_lockIntervalToggle(false);

			//delete button
			if(that.param.setDeleteTrue){
				route_delete = true;
			}

			if( (taskid == 'new' && route_delete) || this.action_param.cancel || (item.deleted_at && !route_delete)){
				//clear any links in the queue that came from this submenu
				taskdetail_linkQueue.clearQueue_uniqueID(that.param.uniqueID);
				taskdetail_uploadManager(that.param.uniqueID, null, null, null, true);
				if(that.param.type == 'tasks'){
					taskdetail_subtaskQueue.clearQueue(that.param.uniqueID);
				}
				return false;
			}
			var contactServer = false;
			var route = '';
			var param = {
				locked: false, //unlock
			};
			var tmpID = null;

			var cb_begin = function(jqXHR, settings, temp_id){
				tmpID = temp_id;
				taskdetail_itemManualUpdate(param, route);
			}
			var cb_success = function(msg, data_error, data_status, data_msg){
				var item_real = null;
				if(tmpID){
					item_real = Lincko.storage.list(that.param.type,1,{temp_id: tmpID});
					if(item_real.length){
						item_real = item_real[0];
						$.each(param_newItemComments, function(i,param){
							sendAction_newComment(that.param.type, item_real._id, param.comment);
						});

						//for new items, check and update linkQueue
						if(taskid = 'new'){
							taskdetail_linkQueue.queueUpdate_cbSuccess(that.param.uniqueID, item_real._type, item_real._id, uploadGarbageID);
							if(that.param.type == 'tasks'){
								taskdetail_subtaskQueue.runQueue(that.param.uniqueID, item_real._id);
							}
							taskdetail_uploadManager(that.param.uniqueID, null, item_real._type, item_real._id);
						}
					}
				}
				tmpID = null;

				if(!item_real){
					item_real = Lincko.storage.get(item['_type'], item['_id']);
				}
			}
			var cb_error = function(){
				if(taskid == 'new'){
					taskdetail_uploadManager(that.param.uniqueID, null, null, null, true);
				}
			}
			var cb_complete = function(){
				if(taskid == 'new'){
					if(that.param.type == 'tasks'){
						taskdetail_subtaskQueue.clearQueue(that.param.uniqueID);
					}
				}
			}

			//param values that are common to all
			param['id'] = taskid;
			submenu_taskdetail.find('[find=title_text]');
			param['comment'] = submenu_taskdetail.find('[find=description_text]').html();


			//unlock if item locker matches the user or locked_by is null

			//if same as previous comment then delete
			if((item.locked_by && item.locked_by != wrapper_localstorage.uid) || //delete comment if this has been locked by someone else
				taskid != 'new' && item['-comment'] && item['-comment'] == param['comment']){
				delete param.comment;
			}

			var new_projectID = elem_meta.find('[find=projects_id]').val();
			if(new_projectID){
				param['parent_id'] = new_projectID;
				contactServer = true;
			}


			//name or title
			if(that.param.type == 'files'){
				param['name'] = $('<div>').html(submenu_taskdetail.find('[find=title_text]').html()).text();
			}
			else{
				param['title'] = $.trim($('<div>').html(submenu_taskdetail.find('[find=title_text]').html()).text());
			}


			if( taskid == 'new' ){
				if(!param['parent_id']){
					param['parent_id'] = that.param.projID;
				}
				if(param['+title'] == newTitle){
					delete param['+title'];
				}

				if(that.param.type == 'tasks'){
					param['duration'] = item.duration;
					param['start'] = item.start;

					if(in_charge_id){
						param['users>in_charge'] = {};
						param['users>in_charge'][in_charge_id] = true;
					}
					if(approved){
						param['approved'] = approved;
					}
				}
			}

			if( taskid == 'new' || route_delete 
				|| isLockedByMe || wrapper_localstorage.uid == Lincko.storage.get(that.param.type, item['_id'], 'locked_by')
				|| ('+title' in item && param['title'] && param['title'] != item['+title'])
				|| ('+name' in item && param['name'] && param['title'] != item['+name'])
				|| (param['comment'] && param['comment'] != item['-comment'] )){
				contactServer = true;
			}

			if( contactServer ){
				if( that.param.type == "tasks" ){
					route += 'task';
				}
				else if( that.param.type == "notes" ){
					route += 'note';
				}
				else if( that.param.type == "files" ){
					route += 'file';
				}

				if(taskid == 'new' && that.param.type == 'files' && that.param.id_toCopy){
					param.id = that.param.id_toCopy;
					route += '/clone';
				}
				else if( taskid == 'new' ){
					route += '/create';
				}
				else if( route_delete ){
					route += '/delete';
				}
				else{
					route += '/update';
				}

				if(taskid != 'new' && route == 'task/update'){
					skylist.sendAction.tasks(param, item, route, cb_success, cb_error, cb_begin, cb_complete);
				}
				else{
					wrapper_sendAction( param,'post',route, cb_success, cb_error, cb_begin, cb_complete);
				}

			}
		}, this
	);


	var registerSync_checkbox = function(){
		app_application_lincko.add(
			'submenu_taskdetail_checkbox_'+that.md5id,
			that.param.type+'_'+item['_id'],
			function(){
				var item_new = Lincko.storage.get(that.param.type, item['_id']);
				var elem_title = $('#'+this.id).closest('table');
				if((elem_title.hasClass('skylist_card_checked') && !item_new.approved) ||
					(!elem_title.hasClass('skylist_card_checked') && item_new.approved)){
					elem_title.toggleClass('skylist_card_checked');
				}
			}
		);
	}
	if(!item.fake && taskid != 'new'){ registerSync_checkbox(); }


	var registerSync_meta = function(){
		app_application_lincko.add(
			//'submenu_taskdetail_meta_'+that.md5id,
			'submenu_taskdetail_burgerBar_'+that.md5id,
			that.param.type+'_'+item['_id'],
			function(){
				var doUpdate = false;
				if(!this.updated || typeof this.updated == 'boolean'){
					doUpdate = true;
				}
				else if(this.updated[that.param.type+'_'+item['_id']]){
					if(this.updated[that.param.type+'_'+item['_id']]._parent ||
						this.updated[that.param.type+'_'+item['_id']].duration ||
						this.updated[that.param.type+'_'+item['_id']].start ||
						this.updated[that.param.type+'_'+item['_id']]._users){
						doUpdate = true;
					}
				}

				if(doUpdate){
					item = Lincko.storage.get(that.param.type, item['_id']);
					var elem = $('#'+this.id);
					var elem_new = $('#-submenu_taskdetail_burgerBar').clone().prop('id','submenu_taskdetail_burgerBar_'+that.md5id);
					elem.velocity('fadeIn',{
						mobileHA: hasGood3Dsupport,
						duration: 200,
						before: function(){
						},
						complete: function(){
							elem.replaceWith(update_burgerBar(elem_new));
						}
					});
				}
			}
		);
	}
	if(!item.fake && taskid != 'new'){ registerSync_meta(); }


	var registerSync_subtasks = function(){
		app_application_lincko.add(
			'submenu_taskdetail_subtasks_'+that.md5id,
			that.param.type+'_'+item['_id'],
			function(){
				if(this.updated && this.updated[that.param.type+'_'+item['_id']]._tasksdown){
					item = Lincko.storage.get('tasks', item['_id']);

					var subtask_count = 0;
					if(item._tasksdown){
						$.each(item._tasksdown, function(subtask_id, obj){
							var subtask = Lincko.storage.get('tasks', subtask_id);

							//dont show if task doesnt exist or it doesnt match the project of the parent task
							if(!subtask || subtask.deleted_at || subtask._parent[1] != that.param.projID ) return;
							else{
								subtask_count++;
								var elem_temp_id = subtask.temp_id?elem_subtasks_wrapper.children('[temp_id='+subtask.temp_id+']'):[];
								var elem_id = !elem_temp_id.length?elem_subtasks_wrapper.children('[task_id='+subtask_id+']'):[];

								if(elem_temp_id.length){
									elem_temp_id.removeAttr('temp_id').attr('task_id', subtask_id);
								}
								else if(!elem_id.length){
									elem_subtasks_wrapper.append(generate_subtaskCard(subtask_id));
								}
							}
						});
					}
					elem_subtaskCount.text(subtask_count);

				}
			}
		);
	}
	if(!item.fake && that.param.type == 'tasks' && taskid != 'new'){ registerSync_subtasks(); }






	//to be used for link sync functions
	var addTo_linksWrapper = function(elem, type, id){
		var elem_linksWrapper = elem.find('[find=links_wrapper]');
		var elem_toAdd = generate_linkCard(type, id);
		var temp_id = Lincko.storage.get(type, id, 'temp_id');
		var elem_temp = [];
		if(temp_id){
			elem_temp = elem_linksWrapper.find('.submenu_taskdetail_links_card_uploading[temp_id='+temp_id+']');
		}
		if(elem_temp.length){
			elem_temp.replaceWith(elem_toAdd);
		}
		else{
			elem_linksWrapper.append(elem_toAdd);
			elem_toAdd.velocity('slideDown', {
				mobileHA: hasGood3Dsupport,
				complete: function(){
					if(submenu_content.prop('id') in myIScrollList){
						myIScrollList[submenu_content.prop('id')].refresh();
					}
				}
			});
		}
	}

	var registerSync_links = function(){
		app_application_lincko.add(
			'submenu_taskdetail_link_'+that.md5id,
			[that.param.type+'_'+item['_id'], 'upload', 'show_queued_links'/*used by itemSelector*/],
			function(){
				var that = this.action_param.subm;
				var taskid = this.action_param.id_item;
				var elem = $('#'+this.id);
				var item = Lincko.storage.get(that.param.type, taskid);

				//for show_queued_links -- used by itemSelector
				if(this.updated && this.updated.show_queued_links){
					$.each(taskdetail_linkQueue.queue, function(temp_id, obj){
						if(obj.uniqueID == that.param.uniqueID && !obj.visible){
							var item = Lincko.storage.get(obj.type, obj.id);
							if(item){
								addTo_linksWrapper(elem, obj.type, obj.id);
								taskdetail_linkQueue.queue[temp_id].visible = true;
							}
						}
					});
					tasketail_updateLinkCount(elem_links);
				}


				//for upload
				if(this.updated && this.updated.upload){

					//check card with temp_ids, and if file finished uploading, then update the parent item accordingly
					if(Lincko.storage.data[that.param.type][taskid]){ //not for taskid == 'new'
						var elem_temp_id = elem.find('[temp_id]');
						$.each(elem_temp_id, function(i, elem){
							var temp_id = $(elem).attr('temp_id');
							var item_file = Lincko.storage.list('files',1,{temp_id: temp_id})[0];
							if(item_file){
								if(!Lincko.storage.data[that.param.type][taskid]._files){
									Lincko.storage.data[that.param.type][taskid]._files = {};
								}
								if(Lincko.storage.data[that.param.type][taskid]._files[item_file._id]){return;}

								Lincko.storage.data[that.param.type][taskid]._files[item_file._id] = true;
								item = Lincko.storage.get(that.param.type, taskid);
							}
						});
					}


					$.each(app_upload_files.lincko_files, function(i, lincko_file){
						if((lincko_file.lincko_parent_type == that.param.type && lincko_file.lincko_parent_id == taskid) 
							|| lincko_file.lincko_param == that.param.uniqueID ){ //if parent type and id matches
							var temp_id = lincko_file.lincko_temp_id;
							var progress = lincko_file.lincko_progress;
							var status = lincko_file.lincko_status;
							var elem_temp_id = elem.find('[temp_id='+temp_id+']');
							if(status == 'done'){
									//elem_temp_id.remove();
									//elem_temp_id = null;
							}
							else if(elem_temp_id.length){
								//update progress bar or number
								elem_temp_id.find('[find=bar]').css('width', progress+'%');

								//once local image preview is available, add the img
								if(!elem_temp_id.find('[find=card_leftbox] img').length && lincko_file.files[0] && lincko_file.files[0].preview && typeof lincko_file.files[0].preview.toDataURL == 'function'){
									var local_url = null;
									try{
										local_url = lincko_file.files[0].preview.toDataURL();
									}
									catch(e){/*local_url not available*/}

									if(local_url){
										var img = new Image();
		            					img.src = local_url;
		            					elem_temp_id.find('[find=card_leftbox]').append(img);
									}
								}
							}
							else{
								var elem_linkcard = $('#-submenu_taskdetail_links_card').clone().prop('id','').attr('temp_id', temp_id).addClass('submenu_taskdetail_links_card_uploading');
								var bar_container = $('<div>').attr('find', 'bar_container').html('<div find="bar"></div>');
								elem_linkcard.find('[find=title]').text(lincko_file.lincko_name).after(bar_container);

								elem_linkcard.find('[find=removeIcon]').click(function(){
									taskdetail_uploadManager(that.param.uniqueID, temp_id, null, null, true);
									elem_linkcard.velocity('slideUp',{
										complete: function(){
											elem_linkcard.recursiveRemove();
											tasketail_updateLinkCount(elem_links);
										},
									});

								});

								elem.find('[find=links_wrapper]').append(elem_linkcard);
								tasketail_updateLinkCount(elem_links);
							}

						}
					});
				}

				if(taskid != 'new'){
					//currently 3 types of links - files, notes, tasks
					if(item._files || item._notes || item._tasks){
						var linkCount = 0;
						var fn_each_updateLinks = function(type, id){
							var item = Lincko.storage.get(type, id);
							if(item && !item.deleted_at){ 
								linkCount++;
								if(!elem.find('['+type+'_id='+id+']').length){
									addTo_linksWrapper(elem, type, id);
								}
							}
						}

						$.each(item._files, function(id, obj){
							fn_each_updateLinks('files', id);
						});
						$.each(item._notes, function(id, obj){
							fn_each_updateLinks('notes', id);
						});
						$.each(item._tasks, function(id, obj){
							fn_each_updateLinks('tasks', id);
						});

						elem.find('[find=linkCount]').text(linkCount);
					}
				}		


			}, 
			{	//action_param
				subm: that,
				id_item: taskid,
			}
		);
	}
	if(!item.fake){ registerSync_links(); }
	

	//if 'new', will override the sync function above ***taskdetail_linkQueue no longer used***
	/*if(taskid == 'new'){
		app_application_lincko.add(
			'submenu_taskdetail_link_'+that.md5id,
			'show_queued_links',
			function(){
				var elem = $('#'+this.id);
				$.each(taskdetail_linkQueue.queue, function(temp_id, obj){
					if(obj.uniqueID == that.param.uniqueID && !obj.visible){
						var item = Lincko.storage.get(obj.type, obj.id);
						if(item){
							addTo_linksWrapper(elem, obj.type, obj.id);
							taskdetail_linkQueue.queue[temp_id].visible = true;
						}
					}
				});
				var linkCount = elem.find('.submenu_taskdetail_links_card').length;
				elem_links.find('[find=linkCount]').text(linkCount);
			}
		);
	}*/

	var registerSync_comments = function(){
		app_application_lincko.add(
			'submenu_taskdetail_comments_'+that.md5id,
			that.param.type+'_'+item['_id'],
			function(){
				//ignore condition
				if(typeof this.updated == 'object' && !this.updated[that.param.type+'_'+item['_id']]._children){ return; }
				var elem_comments_main = $('#'+this.id).find('.submenu_taskdetail_comments_main');
				//update commentCount
				$('#'+this.id).find('[find=commentCount]').html(generateCommentsArray().length);



				//clean any fake root comments
				$.each(elem_comments_main.find('[rootcomment_id]'), function(i, elem){
					var commentID = $(elem).attr('rootcomment_id');
					if(!Lincko.storage.get('comments', commentID)){
						$(elem).recursiveRemove();
					}
				});

				var created_at_latest = null;

				var elem_primaryComment_existing_latest = elem_comments_main.find('[rootcomment_id]').last();
				if(elem_primaryComment_existing_latest.length){
					created_at_latest = Lincko.storage.get('comments', elem_primaryComment_existing_latest.attr('rootcomment_id'), 'created_at');
				}

				var primaryComments = Lincko.storage.sort_items(Lincko.storage.list('comments',null, null, that.param.type, item['_id'], false), 'created_at', 0, -1, false);

				$.each(primaryComments, function(i, comment){
					if(created_at_latest && comment.created_at < created_at_latest){return;}
					else if(created_at_latest && comment.created_at > created_at_latest){
						elem_primaryComment_existing_latest.after(taskdetail_generateCommentThread(comment, true, true, that));
					}
					else if(!created_at_latest){
						elem_comments_main.append(taskdetail_generateCommentThread(comment, true, true, that));
					}
				});



				if(submenu_content.prop('id') in myIScrollList){
					myIScrollList[submenu_content.prop('id')].refresh();
				}

				return;





				var param = {};
				param.created_by = ['!=', wrapper_localstorage.uid];
				param.new = true;
				var newComments = Lincko.storage.list('comments', null, param, that.param.type, taskid, true);
				if( newComments.length < 1){ return false; } //continue function only if there are new comments

				var comments_array = generateCommentsArray();
				var elem_commentBubbles = $('#'+this.id).find('.submenu_taskdetail_commentbubble');

				var i_bubble = 0;
				for( var i_array =0; i_array < comments_array.length; i_array++ ){
					var newComment_id = comments_array[i_array]['_id'];
					var elem_id = $(elem_commentBubbles[i_bubble]).find('[find=comment_id]').attr('comment_id');
					if( elem_id != newComment_id ){
						$(elem_commentBubbles[i_bubble]).before(taskdetail_generateCommentBubble(comments_array[i_array], item['_id'], sendAction_newComment), that);
					}
					else { i_bubble++;	}
				}
				$('#'+this.id).find('[find=commentCount]').html(comments_array.length);
				if(submenu_content.prop('id') in myIScrollList){
					myIScrollList[submenu_content.prop('id')].refresh();
				}
			}
		);
	}
	if(!item.fake && taskid != 'new'){ registerSync_comments(); }





	/*---IScroll options---*/
	wrapper_IScroll_options_new['taskdetail_'+that.md5id] = { 
		click: false,
		//preventDefaultException:{ tagName: /^(DIV|INPUT|TEXTAREA|BUTTON|SELECT|P)$/ },
	};	



	/*----------CKEDITOR SETUP--------------------------------------------------*/

	var elem_description_text = submenu_wrapper.find('[find=description_text]').prop('id','submenu_taskdetail_description_text_'+that.md5id);

	//div for the toolbar
	var elem_editorToolbar = $('#-submenu_taskdetail_description_toolbar').clone().prop('id', 'submenu_taskdetail_description_toolbar_'+that.md5id);
	//elem_description_text.before(elem_editorToolbar);
	submenu_content.before(elem_editorToolbar);


	elem_editorToolbar_overlay = null;
	var editorInst = null;
	var editor_param = {};
	editor_param.itemID = item['_id'];
	editor_param.submenuInst = that;

	if(that.param.type != 'files'){
		var fn_load_linckoEditor = function(){

			if(editorInst){ return false; }
			//delete previous instance, if exists
			if(CKEDITOR && CKEDITOR.instances && CKEDITOR.instances[elem_description_text.prop('id')]){
				CKEDITOR.instances[elem_description_text.prop('id')].destroy();
			}
			elem_editorToolbar.empty(); //clear a simple div, no need for recursive
			elem_description_text.prop('contenteditable', true)

			if(taskid != 'new'){
				elem_description_text.html(Lincko.storage.get(that.param.type, item['_id'], '-comment'));
				taskdetail_clean_descriptionFiles(elem_description_text);
			}

			editorInst = linckoEditor('submenu_taskdetail_description_text_'+that.md5id, 'submenu_taskdetail_description_toolbar_'+that.md5id, editor_param);

			//don't allow focus if mousedown on contenteditable false
			var cancelFocus = false;
			editorInst.on('contentDom', function(){
			    var editable = editorInst.editable();
			    $(editable.$).find('[contenteditable=false]').mousedown(function(event){
					cancelFocus = true;
				});
			});

			//not already in focus, add overlay to cover toolbar
			if(!elem_description_text.is(":focus")){
				elem_description_text.focus(function(event){
					if(cancelFocus){ 
						cancelFocus = false;
						$(this).blur();
						event.preventDefault();
						return; 
					}
					if(elem_editorToolbar_overlay){
						elem_editorToolbar.removeClass('taskdetail_editorToolbar_hasOverlay');
						elem_editorToolbar_overlay.recursiveRemove(0);
						elem_editorToolbar_overlay = null;
						$(this).off('focus');
					}
					return;
				});

				elem_editorToolbar_overlay = $('<div>').addClass('taskdetail_editorToolbar_overlay').click(function(){
						elem_description_text.focus();
					});
				elem_editorToolbar.addClass('taskdetail_editorToolbar_hasOverlay').append(elem_editorToolbar_overlay);
			}

			//if it is not a new task, add the locking mechanism
			if(taskid != 'new'){
				if(elem_description_text.is(":focus")){
					taskdetail_lockIntervalToggle(item['_id'], item['_type']);
					isLockedByMe = true;
				}
				else{
					elem_description_text.on('focus.lock', function(){
						$(this).off('focus.lock');
						taskdetail_lockIntervalToggle(item['_id'], item['_type']);
						isLockedByMe = true;
					});
				}

				app_application_lincko.clean(elem_editorToolbar.prop('id'));
				app_application_lincko.add(
					elem_editorToolbar.prop('id'),
					that.param.type+'_'+item['_id'],
					function(){
						var item_latest = Lincko.storage.get(that.param.type, item['_id']);
						var locked_by = item_latest.locked_by;					
						if(locked_by && locked_by != wrapper_localstorage.uid
							&& CKEDITOR && CKEDITOR.instances && CKEDITOR.instances[elem_description_text.prop('id')]){
							editorInst = null;
							CKEDITOR.instances[elem_description_text.prop('id')].destroy();
							fn_lockDescription();
						}
						else if(this.updated 
							 && this.updated[that.param.type+'_'+item['_id']] 
							 && this.updated[that.param.type+'_'+item['_id']]['-comment']
							 && item_latest.updated_by != wrapper_localstorage.uid){
							//even when editing, if there is a comment change with updated_by != editor, then update text
							//once starting to edit, should not be issue since it is locked and nobody else can update
							elem_description_text.html(item_latest['-comment']);
						}
					}
				);
			}
		} //end of fn_load_linckoEditor

		var fn_lockDescription = function(){
			isLockedByMe = false;
			var item_locked_by = Lincko.storage.get(that.param.type, item['_id']);
			elem_description_text.prop('contenteditable', false).html(item_locked_by['-comment']);
			taskdetail_clean_descriptionFiles(elem_description_text);
			linckoEditor_attachFileClick(elem_description_text, that.preview);


			var id_elem_locked = elem_editorToolbar.prop('id')+'_locked';
			elem_editorToolbar
				.empty()
				.removeClass('taskdetail_editorToolbar_hasOverlay')
				.append($('#-submenu_taskdetail_description_toolbar_locked').clone().prop('id', id_elem_locked));

			$('#'+id_elem_locked).text(Lincko.Translation.get('app', 3614, 'html', {username: Lincko.storage.get('users', item_locked_by.locked_by,'username')}));
			app_application_lincko.clean(id_elem_locked);
			app_application_lincko.add(
				id_elem_locked,
				that.param.type+'_'+item['_id'],
				function(){
					var locked_by = Lincko.storage.get(that.param.type, item['_id'], 'locked_by');
					if(!locked_by || locked_by == wrapper_localstorage.uid){
						fn_load_linckoEditor();
					}
				}
			);
		} //end of fn_lockDescription

		var onLoad_description = new base_runOnElemLoad('submenu_taskdetail_description_text_'+that.md5id, 
			function(){
				if(editorInst){ return false; }

				if(taskid == 'new' || !item['locked_by'] || item['locked_by'] == wrapper_localstorage.uid){ //load ckeditor normally
					fn_load_linckoEditor();
				}
				else{
					fn_lockDescription();					
				}
			}
		);
		onLoad_description.run();


		//auto focus after submenu opens, and send check request for locking
		if(taskid == 'new'){
			if(that.param.type == 'tasks'){
				that.param.elem_autoFocus = elem_title_text;
			}
			else if(that.param.type == 'notes'){
				that.param.elem_autoFocus = elem_description_text;
			}
		}
	}//end of !files
	
	
	/*----------END OF CKEDITOR SETUP--------------------------------------------*/

	//Free memory
	delete submenu_wrapper;
	return true;
};


var tasketail_updateLinkCount = function(elem){
	if(typeof elem == 'string'){ elem = $('#'+elem); }
	var linkCount = elem.find('.submenu_taskdetail_links_card').length;
	elem.find('[find=linkCount]').text(linkCount);
}



//use just before sendAction to manually update the local data
var taskdetail_itemManualUpdate = function(param_sendAction, route){
	if(!param_sendAction){ return false; }
	var id = param_sendAction['id'] || param_sendAction['_id'];
	
	if(!id || id == 'new'){ return false; }

	var type = null;
	if(route == 'task/update'){
		type = 'tasks';
	}
	else if(route == 'note/update'){
		type = 'notes';
	}
	else{
		return false;
	}

	if(id && type){
		var comment = param_sendAction['comment'] || param_sendAction['-comment'];
		if(comment){
			Lincko.storage.data[type][id]['-comment'] = comment;
			var param_prepare = {};
			param_prepare[type+'_'+id] = { '-comment': true };
			app_application_lincko.prepare(type+'_'+id, false, param_prepare);
		}
	}

}

var taskdetail_lockInterval = null;
var taskdetail_lockIntervalToggle = function(id, type, start){
	clearInterval(taskdetail_lockInterval);
	if(!id && typeof id == 'boolean'){ return true; }
	if(typeof start != 'boolean'){ var start = true; }

	var id_me = wrapper_localstorage.uid;
	var locked_by = Lincko.storage.get(type, id, 'locked_by');

	var route = '';
	if(type == 'tasks'){
		route = 'task/lock/';
	}
	else if(type == 'notes'){
		route = 'note/lock/';
	}
	else{
		return false;
	}

	if(start){
		var cb_success_lockCheck = function(){
			locked_by = Lincko.storage.get(type, id, 'locked_by');
			if(!locked_by || locked_by == id_me){
				wrapper_sendAction({id: id}, 'post', route+'start');
				taskdetail_lockInterval = setInterval(function(id, route){
					wrapper_sendAction({id: id}, 'post', route+'start');
				}, 4*60000, id, route); //update re-lock every 4 min
			}
		}
		var cb_success_lockStart = function(){
			locked_by = Lincko.storage.get(type, id, 'locked_by');
			if(!locked_by || locked_by == id_me){
				taskdetail_lockInterval = setInterval(function(id, route){
					wrapper_sendAction({id: id}, 'post', route+'start');
				}, 4*60000, id, route); //update re-lock every 4 min
			}
		}
		wrapper_sendAction( { "id": id, }, 'post', route+'start', cb_success_lockStart);
	}
	else{
		if(id_me != locked_by){ return false; } //dont send unlock if it is not locked by me
		Lincko.storage.data[type][id].locked_by = null; //modify locally immediately
		//wrapper_sendAction({id: id}, 'post', route);
	}

	return true;
}


//check description for any broken images, and updated them of image is available
var taskdetail_clean_descriptionFiles = function(elem_description){ //this function breaks if temp_id is not available
	var elem_tempFiles = elem_description.find('span[temp_id]');
	if(elem_tempFiles.length){
		$.each(elem_tempFiles, function(i, elem){
			var elem$ = null;
			var temp_id = null;
			var item_file = null;
			var elem_new = null;
			elem$ = $(elem);
			temp_id = elem$.attr('temp_id');
			if(temp_id){
				item_file = Lincko.storage.list('files',1,{temp_id: temp_id})[0];
				if(item_file){
					if(elem$.hasClass('fa')){
						elem$.removeClass('linckoEditor_fileProgress').html('&nbsp;').removeAttr('temp_id').removeAttr('contenteditable');
						elem_new = $('#-linckoEditor_fileWrapper').clone().prop('id','').attr('files_id',item_file['_id']);
						elem_new.find('[find=icon]').append(elem$.clone().prop('id', ''));
	            		elem_new.find('[find=name]').text(item_file['+name']);
	            		/*elem_new.click(function(){
	            			submenu_Build(
								'taskdetail', true, null, {
									"type":'files', 
									"id":item_file['_id'],
								}, true);
	            		});*/
            		}
	            	else{
	            		elem_new = $('<img>').addClass('submenu_taskdetail_description_img').prop('src',Lincko.storage.getLink(item_file['_id']));
	            	}
	            	elem$.replaceWith(elem_new);
					
				}
			}
		});
	}
}

var taskdetail_generateNewCommentBubble = function(parent_type, parent_id, sendAction_fn, blurRemove, makeFakeComment){
	if(typeof blurRemove != 'boolean'){
		blurRemove = true; //default is true
	}
	if(!sendAction_fn){
		var sendAction_fn = function(parent_type, parent_id, text){
			var param = {
				"parent_type": parent_type,
				"parent_id": parent_id,
				"comment": text,
			}
			wrapper_sendAction(param, 'post', 'comment/create');

			if(makeFakeComment){
				var fakeComment = taskdetail_makeFakeComment(text, parent_type, parent_id, null, null, true);
			}
		}
	}

	var elem_newCommentBubble = $('#-submenu_taskdetail_commentbubble').clone().prop('id','')
		.addClass('submenu_taskdetail_commentbubble_me submenu_taskdetail_commentbubble_addNew')
		.attr('parent_id', parent_id);
	if(parent_type == 'comments'){
		elem_newCommentBubble.addClass('submenu_taskdetail_commentbubble_sub');
	}

	elem_newCommentBubble.find('[find=name]').html(Lincko.storage.get("users", wrapper_localstorage.uid,"username"));
	elem_newCommentBubble.find('[find=comment_id]').attr('comment_id','new');
	var thumb_url = Lincko.storage.getLinkThumbnail(Lincko.storage.get("users", wrapper_localstorage.uid, 'profile_pic'));
	if(!thumb_url){ thumb_url = app_application_icon_single_user.src; }
	elem_newCommentBubble.find('[find=profile_pic]').css('background-image','url("'+thumb_url+'")');
	var elem_addNewComment_text = elem_newCommentBubble.find('[find=addNewComment_text]');
	elem_addNewComment_text.keyup(function(event) {
		if (event.keyCode == 13) {
			sendAction_fn(parent_type, parent_id, elem_newCommentBubble.find('[find=addNewComment_text]').val());
			elem_addNewComment_text.blur();
		}
	});
	if(blurRemove){
		elem_addNewComment_text.focusout(function(){
			if(!$.trim(elem_addNewComment_text.val()).length){
				elem_newCommentBubble.recursiveRemove(0);
			}
		});
	}

	return elem_newCommentBubble;
}

var taskdetail_generateCommentBubble = function(comment, root_id, sendAction_reply, subm){
	if(!comment || typeof comment != 'object') return;
	//if(!comment) return false;
	//comment is a Lincko.storage.data comment object
	if(!sendAction_reply){
		var sendAction_reply = function(parent_type, parent_id, text){
			var param = {
				"parent_type": 'comments',
				"parent_id": parent_id,
				"comment": text,
			}
			wrapper_sendAction(param, 'post', 'comment/create');

			var fakeComment = taskdetail_makeFakeComment(text, parent_type, parent_id, null, null, true);
		}
	}

	var elem = $('#-submenu_taskdetail_commentbubble').clone().prop('id','');
	elem.find('[find=comment_id]').attr('comment_id', comment['_id']);
	//elem.find('[find=text]').html(wrapper_to_html(comment['+comment']));
	//elem.find('[find=text]')[0].innerHTML = wrapper_to_html(comment['+comment']);
	//var str = wrapper_to_html(comment['+comment']);
	//elem.find('[find=text]')[0].execCommand('insertText', false, 'AA');
	elem.find('[find=text]').text(comment['+comment']);

	var created_by = Lincko.storage.get("users", comment['created_by'],"username");
	elem.find('[find=name]').html(created_by);

	var picID  = Lincko.storage.get("users", comment['created_by'], 'profile_pic');
	var thumb_url = app_application_icon_single_user.src;
	if(picID){
		thumb_url = Lincko.storage.getLinkThumbnail(picID);
	} else if(comment['created_by']==0){ //LinckoBot
		thumb_url = app_application_icon_roboto.src;
	} else if(comment['created_by']==1){ //Monkey King
		thumb_url = app_application_icon_monkeyking.src;
	}
	elem.find('[find=profile_pic]')
		.css('background-image','url("'+thumb_url+'")')
		.addClass('base_pointer')
		.click([subm, comment['created_by']], function(event){
			submenu_Build("personal_info", event.data[0].layer+1, false, event.data[1], event.data[0].preview);
		});

	var created_at = new wrapper_date(comment['created_at']);
	created_at = created_at.display('date_very_short');
	elem.find('[find=date]').html(created_at);

	if( comment['created_by'] == wrapper_localstorage.uid ){
		elem.addClass('submenu_taskdetail_commentbubble_me');
	}
	if( comment['_parent'][0] == "comments" ){
		elem.addClass('submenu_taskdetail_commentbubble_sub');
	}


	var elem_translateBtn = elem.find('[find=translateBtn]').html(Lincko.Translation.get('app', 56, 'html')); //translate
	elem_translateBtn.click(function(){
		var elem = $(this).closest('.submenu_taskdetail_commentbubble');
		var elem_translateBtn = $(this);
		elem_translateBtn.css('opacity','0.5');
		var elem_textTranslated = elem.find('[find=text_translated]');

		var translate_str = Lincko.Translation.get('app', 56, 'html'); //translate
		var untranslate_str = Lincko.Translation.get('app', 57, 'html'); //untranslate
		if(elem_textTranslated.hasClass('display_none')){
			var textToTranslate = elem.find('[find=text]').text();
			wrapper_sendAction( 
			    { 
			        "text": textToTranslate,
			    }, 
			    'post', 
			    'translation/auto', 
			    function(data){ 
		    		elem_textTranslated.html(data).removeClass('display_none');
		    		elem_translateBtn.html(untranslate_str);
		    		elem_textTranslated.velocity('slideDown',{
		    			mobileHA: hasGood3Dsupport,
		    			complete: function(){
		    				elem_translateBtn.removeAttr('style');
		    			}
		    		});
			    } 
			);
		}
		else{
    		elem_translateBtn.html(translate_str);
    		elem_textTranslated.velocity('slideUp',{
    			mobileHA: hasGood3Dsupport,
    			complete: function(){
    				elem_textTranslated.html('').addClass('display_none');
    				elem_translateBtn.removeAttr('style');
    			}
    		});
    	}
	});

	if(!root_id || root_id == 'new' ){
		elem.find('[find=replyBtn]').addClass('display_none');
	}
	else{
		elem.find('[find=replyBtn]').click(function(){
			var elem_click = $(this);
			var elem_replyTo = elem_click.closest('.submenu_taskdetail_commentbubble');
			var parentID = elem_replyTo.find('[find=comment_id]').attr('comment_id');
			if(!Lincko.storage.get('comments',parentID)){
				return false;
			}
			
			//check if next sibling is already a new comment input
			var elem_nextSibling = elem_replyTo.next().eq(0);
			if(elem_nextSibling.length && elem_nextSibling.attr('parent_id') == parentID && elem_nextSibling.find('[comment_id=new]').length){//if true, the next sibling is already an input
				elem_nextSibling.find('input[find=addNewComment_text]').focus();
			}
			else{
				var elem_replyBubble = taskdetail_generateNewCommentBubble('comments', parentID, sendAction_reply);
				
				var elem_rootComment = elem_replyTo.parent('[rootcomment_id]');
				if(elem_rootComment.length){
					elem_rootComment.append(elem_replyBubble);
				}
				else{
					elem_replyTo.after(elem_replyBubble);
				}

				elem_replyBubble.find('[find=addNewComment_text]').focus();
			}			
		});
	}
	return elem;
}

var taskdetail_generateCommentThread = function(rootComment, includeContainer, fn_sync, subm){
	if(!rootComment || typeof rootComment != 'object') return;
	if(typeof includeContainer != 'boolean'){ var includeContainer = false; }

	var allComments = Lincko.storage.sort_items(Lincko.storage.list('comments', null, null, 'comments', rootComment['_id'], true), 'created_at', 0, -1, true);

	//var subComments = Lincko.storage.tree('comments', rootComment['_id'], 'children', true, true);
	
	var elem_container = $('<div>').attr('rootcomment_id', rootComment['_id']).attr('rootcomment_tempID', rootComment['temp_id']);

	//elem_container.append(taskdetail_generateCommentBubble(rootComment, rootComment['_parent'][1]));

	$.each(allComments, function(i, comment){
		elem_container.append(taskdetail_generateCommentBubble(comment, rootComment['_parent'][1], null, subm));
	});

	if(includeContainer && fn_sync){
		if(typeof fn_sync != 'function'){
			var fn_sync = function(){
				if((this.updated && typeof this.updated[this.action_param.range] == 'boolean')
					|| this.updated[this.action_param.range] && this.updated[this.action_param.range]._children){
					$('#'+this.id).replaceWith(taskdetail_generateCommentThread(rootComment, includeContainer, true, subm));
				}
			}
		}
		elem_container.prop('id', 'taskdetail_rootComment_sync_'+rootComment['_id']+'_'+md5(Math.random()));
		app_application_lincko.add(
			elem_container.prop('id'),
			'comments_'+rootComment['_id'],
			fn_sync, {range: 'comments_'+rootComment['_id']});
	}




	if(includeContainer){
		return elem_container;
	}
	else{
		return elem_container.unwrap();
	}



}


var taskdetail_getRandomInt = function(min, max){
	function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	if(min && max){
		return getRandomInt(min,max);
	}
	else{
		return getRandomInt(100000000000,999999999999);
	}
}

var taskdetail_makeFakeComment = function(text, parentType, parentID, fakeID, tempID, triggerSync){
	function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	if(!fakeID){
		var fakeID = taskdetail_getRandomInt();
	}

	var fakeComment = {
		_id: fakeID,
		_type: 'comments',
		_parent:{
			0: parentType,
			1: parentID,
		},
		"+comment": text,
		'fake': true,
	};
	if(tempID){
		fakeComment.temp_id = tempID;
	}
	fakeComment.created_at = (new wrapper_date().timestamp);
	fakeComment.created_by = wrapper_localstorage.uid;

	
	if(!Lincko.storage.data[parentType][parentID]){
		return false;
	}
	Lincko.storage.data.comments[fakeID] = fakeComment;
	if(!Lincko.storage.data[parentType][parentID]._children){
		Lincko.storage.data[parentType][parentID]._children = {};
	}
	if(!Lincko.storage.data[parentType][parentID]._children.comments){
		Lincko.storage.data[parentType][parentID]._children.comments = {};
	}
	Lincko.storage.data[parentType][parentID]._children.comments[fakeID] = true;


	if(triggerSync){
		var prepare_param = {};
		prepare_param[parentType+'_'+parentID] = { _children: true };
		app_application_lincko.prepare(parentType+'_'+parentID, true, prepare_param, true);
		delete Lincko.storage.data.comments[fakeComment._id];
	}

	return Lincko.storage.data.comments[fakeID];
}


//function used for new tasks
//manages app_upload_files object
var taskdetail_uploadManager = function(uniqueID, temp_id, new_parent_type, new_parent_id, remove){
	if(!uniqueID){ return false; }

	var operation = null;
	if(remove){
		operation = function(i){//delete
			var e; //undefined
			$('#app_upload_fileupload').fileupload('option').destroy(e, app_upload_files.lincko_files[i]);
		}
	}
	else{
		operation = function(i){//start upload
			if(new_parent_type){
				app_upload_files.lincko_files[i].lincko_parent_type = new_parent_type;
			}
			if(new_parent_id){
				app_upload_files.lincko_files[i].lincko_parent_id = new_parent_id;
			}
			app_upload_files.lincko_files[i].lincko_status = 'abort';
			app_upload_files.lincko_files[i].abort(); //Force to reinitialize before any start
			app_upload_files.lincko_files[i].lincko_submit();
		}
	}
	
	$.each(app_upload_files.lincko_files, function(i, lincko_file){
		if(lincko_file.lincko_param == uniqueID ){
			if(temp_id){
				if(temp_id == lincko_file.lincko_temp_id){
					operation(i);
				}
			}
			else{
				operation(i);
			}
		}
	});

}

var taskdetail_hideEditorBar = function(that){
	$('#submenu_taskdetail_description_toolbar_'+that.md5id).addClass('display_none');
}

var taskdetail_setEditorBarPosition = function(that, fadeIn){
	var textContainer = $('#'+that.md5id+'_submenu_taskdetail_description').find('[find=textContainer]');
	if(!textContainer.is(':visible')){ return false; }
	if(typeof fadeIn != 'boolean'){ var fadeIn = true; }

	var top = textContainer.position().top;
	var height = textContainer.outerHeight();
	var toolbar;

	//if editor is within viewable iscroll
	if(top + height >= 0){
		toolbar = $('#submenu_taskdetail_description_toolbar_'+that.md5id);
		if(top > 0){
			toolbar.css('top', top+48); //48 is height of submenu_top
		} else {
			toolbar.removeAttr('style');
		}

		if(!fadeIn || toolbar.hasClass('taskdetail_editorToolbar_hasOverlay')){
			toolbar.removeClass('display_none');
		} else {
			toolbar.velocity('stop').velocity('fadeIn', {
				mobileHA: hasGood3Dsupport,
				begin: function(){
					toolbar.removeClass('display_none');
				},
			});
		}
	}	
}


/*
	queuing subtasks for new task
	queue is unique to each submenu, separated by the submenu unique ID (that.param.uniqueID)
	individual submenu uniqueID object is separated by fake subtaskIDs
	queue for a submenu_uniqueID is cleared if a new task is cancelled and upon task creation cb_complete
*/
var taskdetail_subtaskQueue = {
	queue:{
		/*
			submenu_uniqueID: {
				fake_subtaskID:{
					param: {
						
					}
				}
				fake_subtaskID2:{
					param: {
						
					}
				}	
			},
			submenu_uniqueID2: {
				fake_subtaskID:{
					param: {
						
					}
				}	
			},

		*/
	},
	clearQueue: function(submenu_uniqueID){
		delete taskdetail_subtaskQueue.queue[submenu_uniqueID];
	},
	runQueue: function(submenu_uniqueID, tasksupID){
		if(!submenu_uniqueID || !tasksupID){return false;}
		if(taskdetail_subtaskQueue.queue[submenu_uniqueID]){
			$.each(taskdetail_subtaskQueue.queue[submenu_uniqueID], function(fake_subtaskID, obj){
				
				var param = obj.param;
				if(!param){return;}
				param['tasksup>access'] = {};
				param['tasksup>access'][tasksupID] = true;
				param.start = null; //no duedate for subtasks

				//if fav number is set, update the parent task
				if(typeof obj.fav != 'undefined'){
					param['tasksup>fav'] = {};
					param['tasksup>fav'][tasksupID] = obj.fav;
				}

				var tmpID = null;
				var cb_begin = function(jqXHR, settings, temp_id){
					tmpID = temp_id;
				}
				var cb_success = function(){
					var prepare_param = {};
					prepare_param['tasks_'+tasksupID] = { _tasksdown: true };
					app_application_lincko.prepare('tasks_'+tasksupID, true, prepare_param);
				}
				var cb_complete = function(){
					if(taskdetail_subtaskQueue.queue[submenu_uniqueID] && taskdetail_subtaskQueue.queue[submenu_uniqueID][fake_subtaskID]){
						delete taskdetail_subtaskQueue.queue[submenu_uniqueID][fake_subtaskID];
					}
				}

				wrapper_sendAction(param, 'post', 'task/create', cb_success, null/*cb_error*/, cb_begin, cb_complete);
			});
		}
	},
}







var taskdetail_linkQueue = {
	queue:{
		/* 	temp_id: {
				projectID: 123,
				uniqueID: abcd123,
				parent_type: 'tasks',
				parent_id: 123,
				id: 321,
			},
			temp_id2: {
			},
			etc
		*/
	},
	getQueued: function(uniqueID){
		if(!uniqueID){ return {}; }
		var items = {};
		$.each(taskdetail_linkQueue.queue, function(temp_id, obj){
			if(obj.uniqueID == uniqueID){
				if(!items[obj.type]){
					items[obj.type] = {};
				}
				items[obj.type][obj.id] = true;
			}
		});
		return items;
	},
	removeQueue: function(uniqueID, id){
		if(!uniqueID || !id){ return false; }
		$.each(taskdetail_linkQueue.queue, function(temp_id, obj){
			if(obj.uniqueID == uniqueID && obj.id == id){
				delete taskdetail_linkQueue.queue[temp_id];
			}
		});
	},
	//to clear queues with a specific uniqueID
	//used during submenu_hide when task/note creation is cancelled
	clearQueue_uniqueID: function(uniqueID){
		if(!uniqueID){return false;}

		$.each(taskdetail_linkQueue.queue, function(temp_id, obj){
			if(obj.uniqueID && obj.uniqueID == uniqueID){
				delete taskdetail_linkQueue.queue[temp_id];
			}
		});
	},
	checkQueue_uniqueID: function(uniqueID){
		if(!uniqueID){return false;}

		var exists = false;
		$.each(taskdetail_linkQueue.queue, function(temp_id, obj){
			if(obj.uniqueID && obj.uniqueID == uniqueID){
				exists = true;
				return false;
			}
		});
		return exists;
	},
	//attach this to cb_success of tasks/notes to update the queue
	queueUpdate_cbSuccess: function(uniqueID, type, id, uploadGarbageID){
		var keepUploadGarbage = false;
		$.each(taskdetail_linkQueue.queue, function(temp_id, obj){
			if(obj.uniqueID && obj.uniqueID == uniqueID){
				taskdetail_linkQueue.queue[temp_id].parent_type = type;
				taskdetail_linkQueue.queue[temp_id].parent_id = id;
				if(taskdetail_linkQueue.queue[temp_id].id){
					taskdetail_linkQueue.run(temp_id);
				}
				else{//if queue with uniqueID exists, but not ready to run
					keepUploadGarbage = true;
				}
			}
		});

		//no queue with matching uniqueID and also hasnt been .run
		if(!keepUploadGarbage){
			app_application_garbage.remove(uploadGarbageID);
		}
		else{
			taskdetail_linkQueue.cbSuccessComplete[uniqueID] = true;
		}
	},
	cbSuccessComplete: {
		/*[uniqueID]: true,*/
	},
	uploadGarbageFn: function(){
		var that = this;
		var uniqueID = that.action_param.uniqueID;

		//cb_success is complete and there are no files in queue for this uniqueID, then remove garbage and remove cbSuccessComplete
		if(taskdetail_linkQueue.cbSuccessComplete[uniqueID] && !taskdetail_linkQueue.checkQueue_uniqueID(uniqueID)){
			app_application_garbage.remove(that.id);
			delete taskdetail_linkQueue.cbSuccessComplete[uniqueID];
			return;
		}

		$.each(app_upload_files.lincko_files, function(index, file){
			var temp_id = file.lincko_temp_id;

			//at this point, the file doesnt exist yet, so remaining steps wll be done through filesGarbageFn
			if(file.lincko_param && file.lincko_param.link_queue && !taskdetail_linkQueue.queue[temp_id]){
				taskdetail_linkQueue.queue[temp_id] = {
					uniqueID: uniqueID, //uniqueID is used to identify the task/note to be linked to
					parent_type: that.action_param.parent_type,
					type: 'files',
				};
				var files_garbage = app_application_garbage.add();
				app_application_lincko.add(files_garbage, 'files', taskdetail_linkQueue.filesGarbageFn, temp_id);
			}
		});

	},
	filesGarbageFn: function(){
		var that = this;
		var temp_id = that.action_param;
		if(!temp_id){ return; }
		var item = Lincko.storage.list('files',1,{temp_id: temp_id});
		if(!item.length){ return; }
		else{
			item = item[0];
		}

		if(taskdetail_linkQueue.queue[temp_id]){
			taskdetail_linkQueue.queue[temp_id].id = item._id;

			//only run if the parent exist. if doesnt exist, cb_success of parent will run the queue
			if(taskdetail_linkQueue.queue[temp_id].parent_type && taskdetail_linkQueue.queue[temp_id].parent_id){
				taskdetail_linkQueue.run(temp_id);
				app_application_garbage.remove(that.id);
			}
			else if(taskdetail_linkQueue.queue[temp_id]){
				app_application_garbage.remove(that.id);
				app_application_lincko.prepare('show_queued_links', true);
			}
		}	
	},
	run: function(temp_id){
		var queueObj = taskdetail_linkQueue.queue[temp_id];
		if(!queueObj || !queueObj.parent_type || !queueObj.parent_id || !queueObj.id){ return false; }

		var param = {
			id: queueObj.id,
		};

		//for notes
		if(queueObj.type || queueObj.type != 'files'){
			param[queueObj.parent_type+'>access'] = {};
			param[queueObj.parent_type+'>access'][queueObj.parent_id] = true;
			wrapper_sendAction(param, 'post', (queueObj.type).slice(0,-1) + '/update');
		}
		else{// for files
			param.parent_type = queueObj.parent_type;
			param.parent_id = queueObj.parent_id;
			wrapper_sendAction(param, 'post', 'file/update');
		}
		

		delete taskdetail_linkQueue.queue[temp_id];
		return true;
	},
};

taskdetail_tools = {

	//remove all links to the item at cb_success of deletion
	item_properDelete: function(type, id){ //DONT USE THIS - cant remove links of a deleted object
		var item = Lincko.storage.get(type, id);
		if(!item){ return false; }

		var route = type;
		route = route.slice(0, -1) + '/delete';
		wrapper_sendAction({id: id}, 'post', route, taskdetail_tools.removeAllLinks(type, id));
	},

	removeAllLinks: function(type, id){
		var item = Lincko.storage.get(type, id);
		if(!item){ return false; }

		var do_sendAction = false;

		var param_sendAction = {
			id: id,
		};

		var fn_each = function(link_type, obj){
			param_sendAction[link_type+'>access'] = {};
			$.each(obj, function(link_id, link_obj){
				param_sendAction[link_type+'>access'][link_id] = false;
			});
		}

		if(item._files){
			fn_each('files', item._files);
			do_sendAction = true;
		}
		if(item._notes){
			fn_each('notes', item._notes);
			do_sendAction = true;
		}
		if(item._tasks){
			fn_each('tasks', item._tasks);
			do_sendAction = true;
		}
		
		if(do_sendAction){
			var route = type;
			route = route.slice(0, -1) + '/update';
			wrapper_sendAction(param_sendAction, 'post', route);
			return true;
		}
		else{
			return false;
		}
		
	},

	unassignTask: function(item){
		if(item._type == 'tasks' && item._users){
			for(var userid in item._users){
				item._users[userid].in_charge = false;
			}
		}
		return item;
	},

	//check if user has access according to the destination, and if not, set to false
	taskUserCheck: function(item, dest_category, dest_id){
		if(!item){
			return;
		}
		var dest_item = null;
		var access_list = null;
		var param_users_incharge = {}; //can be used as part of sendAction

		if(!dest_category && item._parent){
			dest_category = item._parent[0];
			dest_id = item._parent[1];
		}
		dest_item = Lincko.storage.get(dest_category,dest_id);

		if(dest_category && dest_id){
			access_list = Lincko.storage.whoHasAccess(dest_category, dest_id);
		}

		if(item._type == 'tasks' && item._users){
			for(var userid in item._users){

				//if personal space, auto set to uid and set everyone else to false
				if(dest_item && dest_item.personal_private){
					if(userid == wrapper_localstorage.uid){
						item._users[userid].in_charge = true;
						param_users_incharge[userid] = true;
					}
					else{
						item._users[userid].in_charge = false;
						param_users_incharge[userid] = false;
					}
					continue;
				}

				//dont modify user if he has access to destination
				if( access_list && $.inArray(parseInt(userid,10), access_list) > -1 ){
					continue;
				}
				else{
					item._users[userid].in_charge = false;
					param_users_incharge[userid] = false;
				}
			}
		}
		
		return {
			item: item,
			users_incharge: param_users_incharge,
		}

	},

	//compares two items, and returns true/false if there are/no difference
	itemDiff: function(item1, item2, attributes){
		if(!attributes){
			var attributes = Object.keys(item1);
		}
		for(var i = 0; i < attributes.length; i++ ){
			if(JSON.stringify(item1[attributes[i]]) != JSON.stringify(item2[attributes[i]])){
				return true;
			}
		}

		return false;
	},


	nextSubtaskFav: function(item_tasksdown){
		if(typeof item_tasksdown != 'object'){ return false; }
		var nextFav = 0;

		$.each(item_tasksdown, function(subtask_id, obj){
			if(!obj.fav){ return; }
			if(obj.fav > nextFav){ nextFav = obj.fav; }
		});

		return nextFav;
	},

	list_subtaskFav: function(item_tasksdown){
		if(typeof item_tasksdown != 'object'){ return false; }
		
		var list = Object.keys(item_tasksdown);
		var item_tasksdown_array = [];
		$.each(list, function(i, subtask_id){
			item_tasksdown_array.push(
				{
					id: subtask_id,
					fav: item_tasksdown[subtask_id].fav,
				}
			);
		});
		
		item_tasksdown_array.sort(function(subtask1, subtask2){ //lower fav number first
			return subtask1.fav - subtask2.fav;
		});

		list = [];
		$.each(item_tasksdown_array, function(i, obj){
			list.push(obj.id);
		});

		return list;
	},

}

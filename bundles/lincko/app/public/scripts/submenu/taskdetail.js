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
		"title": Lincko.Translation.get('app', 25, 'html'), //Close
		'hide': true,
		"class": "base_pointer",
		"action": function(Elem, subm) {
			//subm.cancel = true;
		},
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
		//"title": Lincko.Translation.get('app', 58, 'html'), //Save
		'hide': true,
		"class": "base_pointer",
		"action": function(Elem, subm) {
			
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

/*
toto => use this to create new tasks
submenu_list['task_new'] = {
	//Set the title of the top
	"_title": {
		"style": "customized_title",
		"title": function(that){
			var title = that.param.type.slice(0,-1) + ' Information';
			return title;
		},
		"class": function(that){
			var className = 'submenu_wrapper_title submenu_wrapper_taskdetail_'+that.param.type;
			return className;
		},
	},
	"left_button": {
		"style": "title_left_button",
		"title": Lincko.Translation.get('app', 7, 'html'), //Close
		'hide': true,
		"class": "base_pointer",
	},
	"right_button": {
		"style": "title_right_button",
		"title": Lincko.Translation.get('app', 41, 'html'), //Create
		"class": "base_pointer",
		'hide': true,
		"action": function(Elem, subm) {
			console.log('A function to save')
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
*/


Submenu_select.taskdetail = function(subm){
	subm.Add_taskdetail();
};

Submenu.prototype.Add_taskdetail = function() {
	var that = this;
	var attribute = this.attribute;
	this.md5id = this.id;//md5(Math.random()); //This help to avoid memory leak
	var submenu_wrapper = this.Wrapper();
	var submenu_content = submenu_wrapper.find("[find=submenu_wrapper_content]");
	submenu_content.prop('id','taskdetail_'+that.md5id).addClass('submenu_content_taskdetail_'+that.param.type);
	var submenu_taskdetail = $('#-submenu_taskdetail').clone().prop('id','submenu_taskdetail_'+that.md5id);

	that.param.uniqueID = md5(Math.random());
	if(!that.param.projID){
		that.param.projID = app_content_menu.projects_id;
	}
	var contactServer = false;
	var action_menu_opened = false;
	var param_sendAction = {};
	var taskid = this.param.id;
	var newTitle = '';
	var approved = false;
	var elem;
	var duedate;
	var duration_timestamp = 86400;
	var created_by;
	var created_at;
	var updated_by;
	var updated_at;
	var in_charge = '';
	var in_charge_id = null;

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
		if(that.param.title){
			item['+title'] = that.param.title;
		}
		else{
			item['+title'] = newTitle;
		}
		item['_id'] = taskid;
		item['_parent'] = ['projects', that.param.projID];
		item['created_by'] = wrapper_localstorage.uid;
		item['updated_by'] = wrapper_localstorage.uid;
		item['_users'] = {};
		var accessList = Lincko.storage.whoHasAccess('projects', that.param.projID);
		if($.inArray(wrapper_localstorage.uid, accessList)<0){ return false; }
		$.each(accessList, function(i,val){
			item['_users'][val] = {};
			item['_users'][val]['in_charge'] = false;
		});
		item['_users'][wrapper_localstorage.uid]['in_charge'] = true;
		in_charge_id = wrapper_localstorage.uid;
		item.start = new wrapper_date().timestamp;
		item.duration = duration_timestamp;
		item['_type'] = that.param.type;
	} 
	else{
		item = Lincko.storage.get(this.param.type, taskid);
		//if task doesnt exist
		if(!item){
			return;
		}
		if( that.param.type == "tasks" ){
			duration_timestamp = item['duration'];
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
		elem_title_fileInfo.find('[find=downloadIcon]').prop('href',Lincko.storage.getDownload(item['_id']));
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
			var old_title = item['+title'] || item['+name'];
			var new_title = $(this).html();

			if(old_title != new_title){
				var param = {id: taskid};
				if(item['+title']){ 
					item['+title'] = new_title; 
					param.title = new_title;
				}
				else{
					item['+name'] = new_title;
					param.name = new_title;
				}

				if(that.param.type == 'tasks'){
					skylist.sendAction.tasks(param, item, routeObj.update);
				}
				else{
					wrapper_sendAction(param, 'post', routeObj.update);
				}
				Lincko.storage.data[item._type][item._id] = item;
				app_application_lincko.prepare(item._type+'_'+item._id, true);
			}
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
	/* OLD CHECKBOX METHOD
	elem.find("[type=checkbox]")
		.prop(
			{
				'id':'app_layers_dev_skytasks_checkbox_'+taskid,
				'checked': function(){
					if(item['done_at'] == null){
						return false;
					}
					else{
						elem.toggleClass('app_layers_dev_skytasks_strike');
						return true;
					}
				},
			});
	elem.find('.app_layers_dev_skytasks_checkbox label').prop('for','app_layers_dev_skytasks_checkbox_'+taskid);
	*/
	else if( item['_type'] == "files" ){
		var fileType_class = 'fa fa-file-o';
		var elem_leftbox = $('<span></span>').addClass('skylist_card_leftbox_fileIcon');
		var thumb_url = null;
		if(item['category'] == 'image'){
			fileType_class = 'fa fa-file-image-o';
			thumb_url = Lincko.storage.getLinkThumbnail(item['_id']);
			elem_leftbox = $('<img />').prop('src',thumb_url).click(item['_id'], function(event){
				event.stopPropagation();
				previewer.pic(event.data);
			});
		}
		else if(item['category'] == 'video'){
			fileType_class = 'fa fa-file-video-o';
			thumb_url = Lincko.storage.getLinkThumbnail(item['_id']);
			elem_leftbox = $('<img />').prop('src',thumb_url).click(item['_id'], function(event){
				event.stopPropagation();
				previewer.video(event.data);
			});
		}
		else{
		 	fileType_class = app_models_fileType.getClass(item.ori_ext);
		 	elem_leftbox.addClass(fileType_class);
		 }

		elem.find('[find=leftbox]').html(elem_leftbox);
	}

	submenu_taskdetail.append(elem);

	/*meta (general)*/
	var elem_meta = $('#-submenu_taskdetail_meta').clone().prop('id','submenu_taskdetail_meta_'+that.md5id);

	// deleteAccess variable is controlled by update_meta.on('deleteAccessFalse' and 'deleteAccessTrue')
	var deleteAccess = true;

	deleteActionClickFn = function(){
		if(Lincko.storage.canI('delete', that.param.type, taskid)){
			route_delete = true;
			Lincko.storage.data[that.param.type][taskid].deleted_at = new wrapper_date().timestamp;
			app_application_lincko.prepare(that.param.type+'_'+taskid, true);
			submenu_Clean(null,null,that.preview);
		} else {
			base_show_error(Lincko.Translation.get('app', 51, 'html'), true); //Operation not allowed
		}
	}
	
	var update_meta = function(elem_meta){
		var elem = elem_meta;
		var elem_meta_new = $('#-submenu_taskdetail_meta').clone().prop('id','submenu_taskdetail_meta_'+that.md5id);

		/*---projects meta-----*/
		var elem_projects = elem.find('[find=projects_text]');
		var elem_projects_input = elem.find('[find=projects_id]').addClass('skylist_clickable');
		if(taskid != 'new'){
			that.param.projID = item['_parent'][1];
		}
		var project = Lincko.storage.get('projects',that.param.projID);
		if(project.personal_private){
			elem_projects.html(Lincko.Translation.get('app', 2502, 'html')); //Personal Space
		}
		else{
			elem_projects.html(project['+title']);
		}
		
		burgerN.assignProject(elem_projects_input, item);
		elem_projects_input.change(function(){
			var project = Lincko.storage.get('projects',$(this).val());
			if(project.personal_private){
				elem_projects.html(Lincko.Translation.get('app', 2502, 'html')); //Personal Space
			}
			else{
				elem_projects.html(project['+title']);
			}
			item['_parent'][1] = project._id;
			that.param.projID = project._id;

			if(item._type == 'tasks'){
				//if changing task, make task assigned to nobody
				taskdetail_tools.taskUserCheck();
			}

			if(taskid == 'new'){
				var elem_replaceWith = update_meta(elem_meta_new.clone());
				elem.find('input').blur();
				elem.find('[find=duedate_timestamp]').datepicker('hide');
				elem.replaceWith(elem_replaceWith);
			}
			else{
				Lincko.storage.data[item._type][item._id] = item;
				Lincko.storage.childrenList(false, false, 'projects', app_content_menu.projects_id);
				//app_application_lincko.prepare('projects_'+app_content_menu.projects_id, true);
				app_application_lincko.prepare(item._type+'_'+item._id, true);
			}
		});



		in_charge = '';
		/*---taskmeta---*/
		if( that.param.type == "tasks" ){
			for (var i in item['_users']){
				if( item['_users'][i]['in_charge']==true ){
					in_charge += ' ';
					in_charge += Lincko.storage.get("users", i ,"username");
				}
			}
			if( !in_charge ){
				in_charge = Lincko.Translation.get('app', 3608, 'html'); //Not Assigned
			}

			//----in_charge
			var elem_in_charge = elem.find('[find=user_text]');
			var elem_in_charge_hidden = elem.find('[find=user_text_hidden]').addClass('skylist_clickable');
			elem_in_charge.html(in_charge);
			//burger(elem_in_charge_hidden, '_users', item);

			
			if( !Lincko.storage.get("projects", that.param.projID, 'personal_private') ){
				burgerN.assignTask(elem_in_charge_hidden, item);
				elem_in_charge.click(function(){
					elem_in_charge_hidden.click();
				});
				elem_in_charge_hidden.change(function(){
					in_charge_id = $(this).val();
					in_charge_id = parseInt(in_charge_id,10);
					$.each(item['_users'], function(key,val){
						item['_users'][key]['in_charge'] = false;
					});
					if(in_charge_id){
						var username = Lincko.storage.get("users", in_charge_id, "username");
						elem_in_charge.html(username);
						if(!item['_users']){
							item['_users'] = {};
						}
						item['_users'][in_charge_id] = {};
						item['_users'][in_charge_id]['in_charge'] = true;
					}
					else{ //nobody in charnge
						elem_in_charge.html(Lincko.Translation.get('app', 3608, 'html'));//Not Assigned
					}

					if(taskid != 'new'){
						app_application_lincko.prepare(item._type+'_'+item._id, true);
					}
				});
			}
			else{
				elem_in_charge_hidden.removeClass('skylist_clickable');
			}
			

			//---duedate calednar
			var elem_timestamp = elem.find('[find=duedate_timestamp]');
			var elem_display = elem.find("[find=duedate_text]").addClass('skylist_clickable');
			elem_timestamp.val((item['start'] + duration_timestamp)*1000);
			burger_calendar( elem_timestamp, elem_display );
			elem_timestamp.change(function(){
				duration_timestamp = $(this).val()/1000 - item['start'];
				if( duration_timestamp < 0 ){
					console.log(item['start']+' duedate cant be before start date.');
				}
				else{
					if(taskid == 'new'){
						return false;
					}
					var route = '';
					if( that.param.type == "tasks" ){
						route = 'task/update';
					}

					item.duration = duration_timestamp;
					wrapper_sendAction({
						id: item['_id'],
						duration: duration_timestamp,
					}, 'post', route);
					if(taskid != 'new'){
						app_application_lincko.prepare(item._type+'_'+item._id, true);
					}

				}
			});

			duedate = skylist_calcDuedate(item);
			if( skylist_textDate(duedate) ){
				elem.find("[find=duedate_text]").html(skylist_textDate(duedate));
			}
			else{
				elem.find("[find=duedate_text]").html(duedate.display('date_very_short'));
			}
			
		}/*---notesmeta || filesmeta---*/
		else if( that.param.type == "notes" || that.param.type == 'files'){
			elem.find('[find=user_text]').html(Lincko.storage.get("users", item['updated_by'],"username"));
			var date = new wrapper_date(item['updated_at']);
			elem.find("[find=duedate_text]").html(date.display('date_very_short'));
		}

		/*---action_menu---*/
		var elem_action_menu = elem.find('[find=action_menu]');
		elem.find('.submenu_taskdetail_meta_actions').click(function(){
			if(action_menu_opened){
				elem_action_menu.velocity({width:0},{
					mobileHA: hasGood3Dsupport,
					begin: function(){
						elem_action_menu.css('display','initial');
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
						elem_action_menu.css('display','initial');
					},
					complete: function(){
						action_menu_opened = true;
					}
				});
			}
		});
		elem_action_menu.find('[find=delete]').click(deleteActionClickFn);

		elem_meta.on('deleteAccessFalse', function(){
			deleteAccess = false;
			$(this).find('[find=delete]').addClass('submenu_taskdetail_disabled').off('click');
		}).on('deleteAccessTrue', function(){
			deleteAccess = true;
			$(this).find('[find=delete]').removeClass('submenu_taskdetail_disabled').click(deleteActionClickFn);
		});
		if(!Lincko.storage.canI('delete', that.param.type, taskid) || !deleteAccess){
			elem_action_menu.find('[find=delete]').addClass("display_none");
		}

		return elem;
	}// end of update_meta function
	
	submenu_taskdetail.append(update_meta(elem_meta));
	/*---END OF all meta---*/

	/*---description---*/
	elem = $('#-submenu_taskdetail_description').clone().prop('id',that.id+'_submenu_taskdetail_description');
	var elem_description_text = elem.find('[find=description_text]');
	elem_description_text.html(item['-comment']).focus(function(){

	});
	elem_description_text.focus(function(){
		//myIScrollList['taskdetail_'+that.md5id].disable();
	});
	elem_description_text.blur(function(){
		//myIScrollList['taskdetail_'+that.md5id].enable();
	});


	if(taskid != 'new' && that.param.type != 'files'){
		//description autosave for tasks, notes, files
		elem_description_text.blur(function(){
			var old_comment = item['-comment'];
			var new_comment = $(this).html();
			if( $('<div>').html(new_comment).text() == '' ){
				new_comment = '';
			}

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
				app_application_lincko.prepare(item._type+'_'+item._id, true);
			}
		});//end of blur event
	}


	if(that.param.type != 'files'){ //no file description for beta
		
		taskdetail_clean_descriptionFiles(elem);
		taskdetail_description_attachFileClick(elem);
		submenu_taskdetail.append(elem);
	}


	/*-----subtasks---------------------*/
	if(that.param.type == 'tasks'){

		var elem_subtasks = $('#-submenu_taskdetail_subtasks').clone().prop('id','submenu_taskdetail_subtasks_'+that.md5id);
		var elem_subtasks_wrapper = elem_subtasks.find('[find=subtasks_wrapper]');
		var elem_newSubtask = elem_subtasks.find('[find=newSubtask]');
		var elem_subtaskCount = elem_subtasks.find('[find=subtaskCount]');

		var generate_subtaskCard = function(task_id, title){ 
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
				if(subtask.approved){
					elem_subtaskCard.addClass('submenu_taskdetail_subtasks_card_checked');
					elem_subtaskCard.find('[find=title]').attr('contenteditable', false);
				}
			}
			elem_subtaskCard.attr('task_id',task_id);


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
				task_id = parseInt(elem_subtaskCard.attr('task_id'),10);
				subtask = Lincko.storage.get('tasks', task_id);
				elem_subtaskCard.toggleClass('submenu_taskdetail_subtasks_card_checked');
				var approved = elem_subtaskCard.hasClass('submenu_taskdetail_subtasks_card_checked');
				elem_subtaskCard.find('[find=title]').attr('contenteditable', !approved);
				if(!subtask){ //new task
					taskdetail_subtaskQueue.queue[that.param.uniqueID][task_id].param.approved = approved;
				}
				else{
					wrapper_sendAction({id: task_id, approved: approved}, 'post', 'task/update');
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
			$.each(item._tasksdown, function(subtask_id, obj){
				var subtask = Lincko.storage.get('tasks', subtask_id);
				//dont show if task doesnt exist or it doesnt match the project of the parent task
				if(!subtask || subtask.deleted_at || subtask._parent[1] != that.param.projID ) return;
				else{
					elem_subtasks_wrapper.append(generate_subtaskCard(subtask_id));
					subtask_count++;
				}
			});
		}
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
					duration: 0,
				};
				if(taskid == 'new'){
					var fakeID = taskdetail_getRandomInt();
					elem_subtasks_wrapper.append(generate_subtaskCard(fakeID, subtask_title));
					if(!taskdetail_subtaskQueue.queue[that.param.uniqueID]){
						taskdetail_subtaskQueue.queue[that.param.uniqueID] = {};
					}
					taskdetail_subtaskQueue.queue[that.param.uniqueID][fakeID] = {
						param: {
							parent_id: that.param.projID, 
							title: subtask_title,
						}
					};
				}
				else{
					param['tasksup>access'] = {};
					param['tasksup>access'][taskid] = true;
					var tempID = null;
					var cb_begin = function(jqXHR, settings, temp_id){
						elem_subtasks_wrapper.append(generate_subtaskCard(temp_id, subtask_title));
						tempID = temp_id;
					}
					var cb_success = function(msg, data_error, data_status, data_msg){
						var elem_toUpdate = elem_subtasks_wrapper.find('[task_id='+tempID+']');
						if(elem_toUpdate.length){
							var real_subtask = Lincko.storage.list('tasks',1,{temp_id: tempID})[0];
							if(real_subtask && real_subtask._id){
								elem_toUpdate.attr('task_id', real_subtask._id); 
							}
						}
					}
					var cb_error = function(){
						var elem_toRemove = elem_subtasks_wrapper.find('task_id', tempID);
						if(elem_toRemove.length){
							elem_toRemove.remove();
						}
					}
					wrapper_sendAction(param, 'post', 'task/create', cb_success, cb_error, cb_begin);
				}
			
				elem_subtaskCount.text(parseInt(elem_subtaskCount.text(),10) +1 );
				$(this).html('');

				myIScrollList[submenu_content.prop('id')].refresh();
				if( responsive.test("maxMobileL") ){
					myIScrollList[submenu_content.prop('id')].scrollBy(0, -elem_subtasks_wrapper.children('div').eq(0).outerHeight());
				}
			}
		});


		submenu_taskdetail.append(elem_subtasks);
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
		if(item_link.category && item_link.category == 'image'){
			var thumb_url = Lincko.storage.getLinkThumbnail(item_link['_id']);
			if(thumb_url){
				elem_linkcard.find('[find=card_leftbox]').append($('<img />').prop('src',thumb_url)).removeClass('fa-file-o').click(function(event){
					event.stopPropagation();
					previewer.pic(item_link['_id']);
				});
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
				elem_linkcard.find('[find=downloadIcon]').prop('href',download_url).removeClass('display_none');
			}

			//remove linking
			elem_linkcard.find('[find=removeIcon]').click(function(){
				if(taskid == 'new' || !item['_id'] || item['_id'] == 'new'){
					delete taskdetail_linkQueue.queue[item_link['temp_id']];
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
					},
				});
			});
		}
		else{
			//cannot remove links from file detail page
			elem_linkcard.find('[find=action_div]').recursiveRemove();
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
		}
		if(item['_type'] == 'notes'){
			param_itemSelector.hideType = { notes: true };
		}
		submenu_Build('itemSelector', true, null, param_itemSelector, true);
	});
	var elem_links_wrapper = elem_links.find('[find=links_wrapper]');
	
	var link_count = 0;
	var item_linked = Lincko.storage.list_links(that.param.type, taskid); 
	if(typeof item_linked == 'object'){
		for(var category in item_linked){
			$.each(item_linked[category], function(id,item){
				elem_links_wrapper.append(generate_linkCard(item));
				link_count++;
			});
		}
	}

	//cant delete file if it is linked to others (e.g. tasks/notes)
	if(that.param.type == 'files' && link_count > 0){
		elem_meta.trigger('deleteAccessFalse');
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
	
	

	/*
	var comments_primary = Lincko.storage.list('comments',null, null, this.param.type, taskid, false).reverse();
	//var comments_primary = Lincko.storage.list('comments',null,{'_parent': [this.param.type,taskid]}).reverse();
	var comments_sub;
	var comments_sorted = [];
	var comment_id;
	var comment;
	for( var i in comments_primary ){
		comment = comments_primary[i];
		comment_id = comment['_id'];
		comments_sorted.push(comment);
		//comments_sub = Lincko.storage.list('comments',null, null, 'comments', comment_id, true).reverse();
		comments_sub = Lincko.storage.tree('comments', comment_id, 'children', false, true);
		console.log(comments_sub);
		if( comments_sub.length > 0 ){
			for( var k in comments_sub ){
				comments_sorted.push(comments_sub[k]);
			}
		}
	}
	*/

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
					elem_replyBubble.recursiveRemove();
				});

				elem_replyTo.after(elem_replyBubble);
				elem_addNewComment_text.focus();
			});
		}
		return elem;
	}

	var sendAction_newComment = function(parent_type, parent_id, comment){
		var tmpID = null;
		var param = {
			"parent_type": parent_type,
			"parent_id": parent_id,
			"comment": comment,
		}
		var cb_success = function(msg, data_error, data_status, data_msg){
			if(!document.getElementById('taskdetail_'+that.md5id)){ return; }
			var comment = Lincko.storage.list('comments',1,{temp_id: tmpID});
			if(comment.length){
				comment = comment[0];
				var elem = taskdetail_generateCommentBubble(comment, item['_id'], sendAction_newComment);
				var elem_toReplace = submenu_taskdetail.find('[comment_id='+tmpID+']').closest('.submenu_taskdetail_commentbubble');
				elem_toReplace.replaceWith(elem);
				var param = {};
				param['comments_'+comment['_id']] = true;
				wrapper_sendAction(param, 'post', 'data/viewed');
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
			commentObj['_id'] = tmpID;
			commentObj['+comment'] = comment;
			commentObj['created_by'] = wrapper_localstorage.uid;
			commentObj['created_at'] = $.now()/1000;
			commentObj['_parent'] = [];
			commentObj['_parent'][0] = parent_type;
			if( commentObj['_parent'][0] == that.param.type ){
				submenu_taskdetail.find('.submenu_taskdetail_comments_main').append(taskdetail_generateCommentBubble(commentObj, item['_id'], sendAction_newComment));
			}
			else{
				submenu_taskdetail.find('[comment_id=new]').closest('.submenu_taskdetail_commentbubble[parent_id='+parent_id+']').replaceWith(taskdetail_generateCommentBubble(commentObj, item['_id'], sendAction_newComment));
			}
			var elem_commentCount = elem_submenu_taskdetail_comments.find('[find=commentCount]');
			var commentCount = parseInt(elem_commentCount.html(),10);
			elem_commentCount.velocity('fadeOut',{
				mobileHA: hasGood3Dsupport,
				duration: 200,
				complete: function(){
					$(this).html(commentCount+1).attr('style','');
				}
			});
			myIScrollList[submenu_content.prop('id')].refresh();
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
		var showToParent = false;
		for ( var i = 0; i < comments.length; i++ ){
			commentCount++;
			comment = comments[i];
			if( commentCount <= toShow || showToParent ){
				if(comment['_parent'][0] == 'comments'){
					showToParent = true;
				}
				else{
					showToParent = false;
				}
				var elem_newComment_bubble = taskdetail_generateCommentBubble(comment, item['_id'], sendAction_newComment);
				if(animation){
					elem_toShow_wrapper.prepend(elem_newComment_bubble);
				}
				else{
					elem_comments_main.prepend(elem_newComment_bubble);
				}				
				param_viewed['comments_'+comment['_id']] = true;
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
		wrapper_sendAction(param_viewed, 'post', 'data/viewed');
		

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

	/*attach collapsable_fn*/
	var submenu_taskdetail_collapsable_fn = function(){
		var elem_btn = $(this);
		if(elem_btn.hasClass('submenu_taskdetail_collapsable_button_disabled')){ return; }
		var elem_content = $(this).siblings();
		var elem_arrow = elem_btn.find('[find=icon_arrow]');
		if( elem_content.css('display')!='none' ){
			elem_content.velocity('slideUp',{
				mobileHA: hasGood3Dsupport,
				begin: function(){
					elem_content.css({
						'background-color':'#FBFBFB',
					});
					elem_arrow.addClass('fa-rotate-360');
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
				begin: function(){
					elem_content.css('background','#FBFBFB');
					elem_arrow.removeClass('fa-rotate-360');
				},
				complete: function(){
					elem_content.removeAttr('style');
					myIScrollList[submenu_wrapper.find('[find=submenu_wrapper_content]').prop('id')].refresh();
				},
			});
			elem_arrow.velocity({
				'rotateZ': 0,
			}, {
				mobileHA: hasGood3Dsupport,
			});
		}
	}
	submenu_taskdetail.find('.submenu_taskdetail_collapsable_button').click(submenu_taskdetail_collapsable_fn);
	
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
			var param = {};
			var tmpID = null;

			var cb_begin = function(jqXHR, settings, temp_id){
				tmpID = temp_id;
			}
			var cb_success = function(msg, data_error, data_status, data_msg){
				if(tmpID){
					var item_real = Lincko.storage.list(that.param.type,1,{temp_id: tmpID});
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

			//conditions for no comment: no text and no <img>
			if( !submenu_taskdetail.find('[find=description_text]').find('img').length && $('<div>').html(param['comment']).text() == '' ){
				delete param.comment;
			}


			var new_projectID = elem_meta.find('[find=projects_id]').val();
			if(new_projectID){
				param['parent_id'] = new_projectID;
				contactServer = true;
			}

			//for calendar and assignment (only for tasks)
			if(that.param.type == 'tasks'){
				var new_duedate = elem_meta.find('[find=duedate_stamp]').val();
				if(duration_timestamp != item['duration']){
					param['duration'] = duration_timestamp;
					param['start'] = item['start'];
					contactServer = true;
				}
			}


			//name or title
			if(that.param.type == 'files'){
				param['name'] = $('<div>').html(submenu_taskdetail.find('[find=title_text]').html()).text();
				/*
				if(param['name'] != item['+name']){
					var regex = /^(?:(.+)\.(\.+))$/;
					var filename_regex = param['name'].match(regex);
					if(filename_regex){
						param['name'] = filename_regex[1];
					}
					param['name'] = param['name']+'.'+item.ori_ext;
				}
				*/
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
				|| ('+title' in item && param['title'] != item['+title'])
				|| ('+name' in item && param['name'] != item['+name'])
				|| param['comment'] != item['-comment'] ){
				contactServer = true;
			}

			if( contactServer ){
				var route = '';
				if( that.param.type == "tasks" ){
					route += 'task';
				}
				else if( that.param.type == "notes" ){
					route += 'note';
				}
				else if( that.param.type == "files" ){
					route += 'file';
				}

				if( taskid == 'new' ){
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
			'submenu_taskdetail_meta_'+that.md5id,
			that.param.type+'_'+item['_id'],
			function(){
				var item_old = item;
				item = Lincko.storage.get(that.param.type, item['_id']);
				if(!taskdetail_tools.itemDiff(item_old, item, ['_parent','duration','_users'])){
					return;
				}

				item = Lincko.storage.get(that.param.type, item['_id']);
				if( that.list_type == "tasks" ){
					duration_timestamp = item['duration'];
				}

				//if only the duration is updated, just update the item, but no flash animation
				if(taskdetail_tools.itemDiff(item_old, item, ['duration'])){
					return;
				}

				var elem = $('#'+this.id);
				var elem_new = $('#-submenu_taskdetail_meta').clone().prop('id','submenu_taskdetail_meta_'+that.md5id);
				elem.velocity('fadeIn',{
					mobileHA: hasGood3Dsupport,
					duration: 200,
					before: function(){
					},
					complete: function(){
						//update_meta(elem);
						elem.find('input').blur();
						elem.find('[find=duedate_timestamp]').datepicker('hide');
						elem.replaceWith(update_meta(elem_new));
					}
				});
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
								if(subtask.temp_id && elem_subtasks_wrapper.children('[task_id='+subtask.temp_id+']').length){ //if any temp task, modify
									elem_subtasks_wrapper.children('[task_id='+subtask.temp_id+']').eq(0).attr('task_id', subtask_id);
								}
								else if(!elem_subtasks_wrapper.children('[task_id='+subtask_id+']').length){
									elem_subtasks_wrapper.append(generate_subtaskCard(subtask_id));
								}
								subtask_count++;
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
			elem_temp = elem_linksWrapper.find('[temp_id='+temp_id+']');
		}
		if(elem_temp.length){
			elem_temp.replaceWith(elem_toAdd);
		}
		else{
			elem_linksWrapper.append(elem_toAdd);
			elem_toAdd.velocity('slideDown', {
				mobileHA: hasGood3Dsupport,
				complete: function(){
					myIScrollList[submenu_content.prop('id')].refresh();
				}
			});
		}
	}

	var registerSync_links = function(){
		app_application_lincko.add(
			'submenu_taskdetail_link_'+that.md5id,
			[that.param.type+'_'+item['_id'], 'upload', 'show_queued_links'/*for new tasks/notes adding exising files/notes*/],
			function(){
				var elem = $('#'+this.id);
				var item = Lincko.storage.get(that.param.type, taskid);

				//for show_queued_links
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
					var linkCount = elem.find('.submenu_taskdetail_links_card').length;
					elem_links.find('[find=linkCount]').text(linkCount);
				}


				//for upload
				if(this.updated && this.updated.upload){

					//check card with temp_ids, and if file finished uploading, then update the parent item accordingly
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


					$.each(app_upload_files.lincko_files, function(i, lincko_file){
						if((lincko_file.lincko_parent_type == that.param.type && lincko_file.lincko_parent_id == taskid) 
							|| lincko_file.lincko_param == that.param.uniqueID ){ //if parent type and id matches
							var temp_id = lincko_file.lincko_temp_id;
							var progress = lincko_file.lincko_progress;
							var status = lincko_file.lincko_status;
							var elem_temp_id = elem.find('[temp_id='+temp_id+']');
							if(status == 'done' && elem_temp_id.length){
									//elem_temp_id.remove();
									//elem_temp_id = null;
							}
							else if(elem_temp_id.length){
								//update progress bar or number
								elem_temp_id.find('[find=bar]').css('width', progress+'%');

								//once local image preview is available, add the img
								if(!elem_temp_id.find('[find=card_leftbox] img').length && lincko_file.files[0] && lincko_file.files[0].preview){
									var local_url = lincko_file.files[0].preview.toDataURL();
					            	var img = new Image();
	            					img.src = local_url;
	            					elem_temp_id.find('[find=card_leftbox]').append(img);
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
											elem_linkcard.recursiveEmpty().remove();
											//elem_linkcard.recursiveRemove(); toto
										},
									});

								});

								elem.find('[find=links_wrapper]').append(elem_linkcard);
							}

						}
					});
				}


				if(!item._files && !item._notes){
					return;
				}

				var linkCount = 0;
				if(item._files){ linkCount += Object.keys(item._files).length; }
				if(item._notes){ linkCount += Object.keys(item._notes).length; }
				elem.find('[find=linkCount]').text(linkCount);

				$.each(item._files, function(id, obj){
					var elem_linkCard = elem.find('[files_id='+id+']');
					if(!elem_linkCard.length){
						addTo_linksWrapper(elem, 'files', id);
					}
				});
				$.each(item._notes, function(id, obj){
					var elem_linkCard = elem.find('[notes_id='+id+']');
					if(!elem_linkCard.length){
						addTo_linksWrapper(elem, 'notes', id);
					}
				});
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
						$(elem_commentBubbles[i_bubble]).before(taskdetail_generateCommentBubble(comments_array[i_array], item['_id'], sendAction_newComment));
					}
					else { i_bubble++;	}
				}
				$('#'+this.id).find('[find=commentCount]').html(comments_array.length);
				myIScrollList[submenu_content.prop('id')].refresh();
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

	var elem_description_text = submenu_wrapper.find('[find=description_text]').prop('contenteditable','true').prop('id','submenu_taskdetail_description_text_'+that.md5id);

	//div for the toolbar
	var elem_editorToolbar = $('<div>').prop('id','submenu_taskdetail_description_toolbar_'+that.md5id).addClass('taskdetail_editorToolbar needsclick').css('visibility', 'hidden');
	elem_description_text.before(elem_editorToolbar);



	var editorInst = null;
	var editor_param = {};
	editor_param.itemID = item['_id'];
	editor_param.submenuInst = that;
	if(that.param.type != 'files'){

		var onLoad_description = new base_runOnElemLoad('submenu_taskdetail_description_text_'+that.md5id, 
			function(){
				 editorInst = linckoEditor('submenu_taskdetail_description_text_'+that.md5id, 'submenu_taskdetail_description_toolbar_'+that.md5id, editor_param);

				 if(taskid == 'new'){
					if(that.param.type == 'tasks'){
						elem_title_text.focus();
					}
					else if(that.param.type == 'notes'){
						elem_description_text.focus();
					}
				}
			}
		);
		onLoad_description.run();

	}
	


	/*elem_editorToolbar.click(function(){ return;
		if(!editorInst){
			elem_description_text.focus();
		}
	});*/
	elem_description_text.focus(function(){ 
		elem_editorToolbar.removeAttr('style');
		$(this).off('focus');
		return;
		if(!editorInst){
			var param = {};
			param.itemID = item['_id'];
			param.submenuInst = that;

			editorInst = linckoEditor('submenu_taskdetail_description_text_'+that.md5id, 'submenu_taskdetail_description_toolbar_'+that.md5id, param/*, elem_links.find('[find=new_btn]')*/);
		}
	});







	/*----------END OF CKEDITOR SETUP--------------------------------------------*/

	/*--------EASY EDITOR SETUP--------------------------------------------------*/
	/*var elem_description_text = submenu_wrapper.find('[find=description_text]');
	var editorInst = null;
	var destroyEditor_onBlur = true;

	elem_description_text.focus(function(){
		if(editorInst instanceof EasyEditor === false) {
			editorInst = new linckoEditorEasy(this);
			editorInst.$toolbarContainer.on('mousedown touchdown', function(){
				destroyEditor_onBlur = false;
			});
			$(this).focus();
		}
	});
	elem_description_text.blur(function(){
		if(editorInst instanceof EasyEditor === true && destroyEditor_onBlur) {
			editorInst.detachEvents();
			editorInst = null;
		}
		else if(!destroyEditor_onBlur){
			destroyEditor_onBlur = true;
			elem_description_text.focus();
		}
	});*/
	/*----------END OF EASY EDITOR SETUP---------------------------------------------*/

	//Free memory
	//submenu_wrapper = null; //In some placea it bugs because it's used in a lower scope
	delete submenu_wrapper;
	return true;
};


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
						elem_new.find('[find=icon]').append(elem$.clone());
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
				elem_newCommentBubble.recursiveRemove();
			}
		});
	}

	return elem_newCommentBubble;
}

var taskdetail_generateCommentBubble = function(comment, root_id, sendAction_reply){
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
				elem_replyTo.after(elem_replyBubble);
				elem_replyBubble.find('[find=addNewComment_text]').focus();
			}			
		});
	}
	return elem;
}

var taskdetail_generateCommentThread = function(rootComment, includeContainer){
	if(!rootComment || typeof rootComment != 'object') return;
	if(typeof includeContainer != 'boolean'){ var includeContainer = false; }

	var allComments = Lincko.storage.sort_items(Lincko.storage.list('comments', null, null, 'comments', rootComment['_id'], true), 'created_at', 0, -1, true);

	//var subComments = Lincko.storage.tree('comments', rootComment['_id'], 'children', true, true);
	
	var elem_container = $('<div>').attr('rootcomment_id', rootComment['_id']).attr('rootcomment_tempID', rootComment['temp_id']);

	//elem_container.append(taskdetail_generateCommentBubble(rootComment, rootComment['_parent'][1]));

	$.each(allComments, function(i, comment){
		elem_container.append(taskdetail_generateCommentBubble(comment, rootComment['_parent'][1]));
	});

	if(includeContainer){
		return elem_container;
	}
	else{
		return elem_container.unwrap();
	}

}


var taskdetail_description_attachFileClick = function(elem_description){
	if(!(elem_description instanceof $)){ elem_description = $(elem_description); }
	var elem_files = elem_description.find('.linckoEditor_fileWrapper');
	if(elem_files.length){
		$.each(elem_files, function(i, elem){
			var elem = $(elem);
			var id = elem.attr('files_id');
			if(!id){ return; }
			elem.click(function(){ 
				submenu_Build( 'taskdetail', true, null, 
					{
						"type":'files', 
						"id":id,
					}, true);
			});
		});
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
		app_application_lincko.prepare(parentType+'_'+parentID, true, prepare_param);
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
			app_upload_files.lincko_files[i].submit();
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
				param.duration = 0; //no duedate for subtasks

				var cb_success = function(){
					var prepare_param = {};
					prepare_param['tasks_'+tasksupID] = { _tasksdown: true };
					app_application_lincko.prepare('tasks_'+tasksupID, true, prepare_param);
				}

				wrapper_sendAction(param, 'post', 'task/create', cb_success);
				delete taskdetail_subtaskQueue.queue[submenu_uniqueID][fake_subtaskID];
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


		/*var param = {
			'files>access': {},
		};
		param['files>access'][queueObj.id] = true;
		param.id = queueObj.parent_id;
		console.log(param['files>access']);
		var route = queueObj.parent_type.slice(0,-1) + '/update';
		wrapper_sendAction(param, 'post', route);

		if(queueObj.projectID){
			//wrapper_sendAction({id:queueObj.id, parent_id:queueObj.projectID}, 'post', 'file/update');
		}
		delete taskdetail_linkQueue.queue[temp_id];
		return true;*/


	},
};

taskdetail_tools = {
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

}

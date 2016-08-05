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
		"action": function(elem, submenuInst) {
			//submenuInst.cancel = true;
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
		"now": function(that, Elem){
			var currentProjID = app_content_menu.projects_id;
			if(that.param.projID){
				currentProjID = that.param.projID;
			}
			Elem.find("[find=submenu_input]").prop('value', currentProjID);
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
		"action": function(elem, submenuInst) {
			submenuInst.cancel = true;
		},
	},
	"right_button": {
		"style": "title_right_button",
		"title": Lincko.Translation.get('app', 41, 'html'), //Create
		//"title": Lincko.Translation.get('app', 58, 'html'), //Save
		'hide': true,
		"class": "base_pointer",
		"action": function(elem, submenuInst) {
			
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
		"now": function(that, Elem){
			var currentProjID = app_content_menu.projects_id;
			if(that.param.projID){
				currentProjID = that.param.projID;
			}
			Elem.find("[find=submenu_input]").prop('value', currentProjID);
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
		"action": function(Elem, that) {
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
		"now": function(that, Elem){
			var currentProjID = app_content_menu.projects_id;
			if(that.param.projID){
				currentProjID = that.param.projID;
			}
			Elem.find("[find=submenu_input]").prop('value', currentProjID);
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


	var currentProjID = app_content_menu.projects_id;
	if(that.param.projID){
		currentProjID = that.param.projID;
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
		item['_parent'] = ['projects', currentProjID];
		item['created_by'] = wrapper_localstorage.uid;
		item['updated_by'] = wrapper_localstorage.uid;
		item['_users'] = {};
		var accessList = Lincko.storage.whoHasAccess('projects', currentProjID);
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
	
	var update_meta = function(elem_meta){
		var elem = elem_meta;
		var elem_meta_new = $('#-submenu_taskdetail_meta').clone().prop('id','submenu_taskdetail_meta_'+that.md5id);

		/*---projects meta-----*/
		var elem_projects = elem.find('[find=projects_text]');
		var elem_projects_input = elem.find('[find=projects_id]').addClass('skylist_clickable');
		if(taskid != 'new'){
			currentProjID = item['_parent'][1];
		}
		var project = Lincko.storage.get('projects',currentProjID);
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
			currentProjID = project._id;

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

			
			if( !Lincko.storage.get("projects", currentProjID, 'personal_private') ){
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
			

			//---duedate calenar
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
					begin: function(){
						elem_action_menu.css('display','initial');
					},
					complete: function(){
						action_menu_opened = true;
					}
				});
			}
		});
		elem_action_menu.find('[find=delete]').click(function(){
			if(Lincko.storage.canI('delete', that.param.type, taskid)){
				route_delete = true;
				Lincko.storage.data[that.param.type][taskid].deleted_at = new wrapper_date().timestamp;
				app_application_lincko.prepare(that.param.type+'_'+taskid, true);
				submenu_Clean(null,null,that.preview);
			} else {
				base_show_error(Lincko.Translation.get('app', 51, 'html'), true); //Operation not allowed
			}
		});
		if(!Lincko.storage.canI('delete', that.param.type, taskid)){
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
		submenu_taskdetail.append(elem);
	}


	/*-----Links------------------*/
	var elem_links = $('#-submenu_taskdetail_links').clone().prop('id','submenu_taskdetail_link_'+that.md5id);
	var elem_links_wrapper = elem_links.find('[find=links_wrapper]');
	var item_files = Lincko.storage.list('files',null, null, that.param.type, taskid, true);
	var elem_linkcardTemp = $('#-submenu_taskdetail_links_card').clone().prop('id','');
	elem_links.find('[find=new_btn]').click(function(){
		app_upload_open_files(that.param.type, taskid);
	});

	
	elem_links_wrapper.append(elem_linkcardTemp);



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


		elem_translateBtn = elem.find('[find=translateBtn]').html(Lincko.Translation.get('app', 56, 'html')); //translate
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
					elem_replyBubble.remove();
				});

				elem_replyTo.after(elem_replyBubble);
				elem_addNewComment_text.focus();
			});
		}
		return elem;
	}


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
				var elem_newComment_bubble = generateCommentBubble(comment);
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
				var elem = generateCommentBubble(comment);
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
			elem_toRemove.remove();
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
				submenu_taskdetail.find('.submenu_taskdetail_comments_main').append(generateCommentBubble(commentObj));
			}
			else{
				submenu_taskdetail.find('[comment_id=new]').closest('.submenu_taskdetail_commentbubble').replaceWith(generateCommentBubble(commentObj));
			}
			var elem_commentCount = elem_submenu_taskdetail_comments.find('[find=commentCount]');
			var commentCount = parseInt(elem_commentCount.html(),10);
			elem_commentCount.velocity('fadeOut',{
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

	elem_addNewComment_btn.click(function(){
		elem_addNewComment_text.empty();
		toggleNewComment();
		elem_addNewComment_text.focus();
	});
	elem_addNewComment_text.keyup(function (event) {
		if (event.keyCode == 13) {
			sendAction_newComment(that.param.type, taskid, elem_addNewComment_text.val());
			elem_addNewComment_text.blur();
		}
	});
	elem_addNewComment_text.focusout(function(event){
		toggleNewComment();
	});

	/*attach collapsable_fn*/
	var submenu_taskdetail_collapsable_fn = function(){
		var elem_btn = $(this);
		var elem_content = $(this).siblings();
		var elem_arrow = elem_btn.find('[find=icon_arrow]');
		if( elem_content.css('display')!='none' ){
			elem_content.velocity('slideUp',{
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
			if( (taskid == 'new' && route_delete) || this.action_param.cancel ){
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
					var itemID_real = Lincko.storage.list(that.param.type,1,{temp_id: tmpID});
					if(itemID_real.length){
						itemID_real = itemID_real[0]['_id'];
						$.each(param_newItemComments, function(i,param){
							sendAction_newComment(that.param.type, itemID_real, param.comment);
						});
					}
				}
				tmpID = null;
			}

			//param values that are common to all
			param['id'] = taskid;
			submenu_taskdetail.find('[find=title_text]');
			param['comment'] = submenu_taskdetail.find('[find=description_text]').html();
			if( $('<div>').html(param['comment']).text() == '' ){
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
				param['title'] = $('<div>').html(submenu_taskdetail.find('[find=title_text]').html()).text();
			}


			if( taskid == 'new' ){
				if(!param['parent_id']){
					param['parent_id'] = currentProjID;
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
					skylist.sendAction.tasks(param, item, route, cb_success, null, cb_begin);
				}
				else{
					wrapper_sendAction( param,'post',route, cb_success, null, cb_begin);
				}
			}
		}, this
	);



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
	);//end of sync function
	

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
					$(elem_commentBubbles[i_bubble]).before(generateCommentBubble(comments_array[i_array]));
				}
				else { i_bubble++;	}
			}
			$('#'+this.id).find('[find=commentCount]').html(comments_array.length);
			myIScrollList[submenu_content.prop('id')].refresh();
		}
	);






	/*---IScroll options---*/
	wrapper_IScroll_options_new['taskdetail_'+that.md5id] = { 
		click: false,
		//preventDefaultException:{ tagName: /^(DIV|INPUT|TEXTAREA|BUTTON|SELECT|P)$/ },
	};	



	/*----------CKEDITOR SETUP--------------------------------------------------*/

	var elem_description_text = submenu_wrapper.find('[find=description_text]').prop('contenteditable','true').prop('id','submenu_taskdetail_description_text_'+that.md5id);

	//div for the toolbar
	var elem_editorToolbar = $('<div>').prop('id','submenu_taskdetail_description_toolbar_'+that.md5id).addClass('taskdetail_editorToolbar');
	elem_description_text.before(elem_editorToolbar);
	var editorInst = null;


	elem_description_text.focus(function(){
		if(!editorInst){

			var param = {};
			param.itemID = item['_id'];
			param.submenuInst = that;

			editorInst = linckoEditor('submenu_taskdetail_description_text_'+that.md5id, 'submenu_taskdetail_description_toolbar_'+that.md5id, param );
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

	//set the focus upon opening detail pane
	if(taskid == 'new'){
		if(that.param.type == 'tasks'){
			/*app_application_lincko.add(submenu_taskdetail.prop('id'), 'submenu_show', function(){
				console.log('submenu_show tasklist');
				console.log(elem_title_text);
				elem_title_text.focus();
			});*/
			setTimeout(function(){
				elem_title_text.focus();
			},300);
		}
		else if(that.param.type == 'notes'){
			setTimeout(function(){
				elem_description_text.focus();
			},300);
		}
	}


	//Free memory
	delete submenu_wrapper;
	return true;
};


/*-----linckoEditorEasy------------------------------------*/
function linckoEditorEasy(elem){
	var options = {
		buttons: [ 'h', 'h1', 'h2', 'h3', 'h4', 'p', 'bold', 'italic', 'list', 'alignleft', 'aligncenter', 'alignright', 'x', 'image'],
		buttonsHtml: {
			'italic': '<i class="fa fa-italic"></i>',
			'header': '<i class="fa fa-header"></i>',
			'header-1': '<h1>header 1</h1>',
			'header-2': '<h2>header 2</h2>',
			'header-3': '<h3>header 3</h3>',
			'header-4': '<h4>header 4</h4>',
			'paragraph': '<p>paragraph</p>',
			'align-left': '<i class="fa fa-align-left"></i>',
			'align-center': '<i class="fa fa-align-center"></i>',
			'align-right': '<i class="fa fa-align-right"></i>',
			'insert-image': '<i class="fa fa-picture-o" title="Coming Soon!"></i>',
			'remove-formatting': '<i class="fa fa-ban"></i>'
		},
		overwriteButtonSettings: {
			'header-2': {
				childOf: 'header',
			},
			'header-3': {
				childOf: 'header',
			},
			'header-4': {
				childOf: 'header',
			},
		}
	};

	var editorInst = new EasyEditor(elem, options);
	editorInst.$toolbarContainer.addClass('submenu_taskdetail_paddingLeft');
	$(editorInst.elem).addClass('base_DescriptionText');

	
	$(editorInst.elem).on('paste', function(){
		$(window).resize();
	});

	return editorInst;
}

EasyEditor.prototype.font = function(){
	var _this = this;
	var settings = {
		buttonIdentifier: 'font',
		buttonHtml: 'Font',
		clickHandler: function(){
			_this.openDropdownOf('font');
		},
		hasChild: true
	};

	_this.injectButton(settings);
};

EasyEditor.prototype.calibri = function(){
	var _this = this;
	var settings = {
		buttonIdentifier: 'calibri',
		buttonHtml: 'Calibri',
		clickHandler: function(){
			_this.wrapSelectionWithNodeName({ nodeName: 'span', style: 'font-family: Calibri,sans-serif', keepHtml: true });
		},
		childOf: 'font'
	};

	_this.injectButton(settings);
};

EasyEditor.prototype.georgia = function(){
	var _this = this;
	var settings = {
		buttonIdentifier: 'georgia',
		buttonHtml: 'Georgia',
		clickHandler: function(){
			_this.wrapSelectionWithNodeName({ nodeName: 'span', style: 'font-family: Georgia,serif', keepHtml: true });
		},
		childOf: 'font'
	};

	_this.injectButton(settings);
};

EasyEditor.prototype.h = function(){
	var _this = this;
	var settings = {
		buttonIdentifier: 'header',
		buttonHtml: 'H',
		clickHandler: function(){
			if($(this).next('ul').css('display') != 'none'){
				$(_this.elem).click();
			}
			else {
				_this.openDropdownOf('header');
			}
		},
		hasChild: true
	};

	_this.injectButton(settings);
};

EasyEditor.prototype.h1 = function(){
	var _this = this;
	var settings = {
		buttonIdentifier: 'header-1',
		buttonHtml: 'H1',
		clickHandler: function(){
			_this.wrapSelectionWithNodeName({ nodeName: 'h1', blockElement: true });
		},
		childOf: 'header'
	};

	_this.injectButton(settings);
};

EasyEditor.prototype.p = function(){
	var _this = this;
	var settings = {
		buttonIdentifier: 'paragraph',
		buttonHtml: 'p',
		clickHandler: function(){
			_this.wrapSelectionWithNodeName({ nodeName: 'p'});
		},
		childOf: 'header'
	};

	_this.injectButton(settings);
};

EasyEditor.prototype.image = function(){
	var _this = this;
	var settings = {
		buttonIdentifier: 'insert-image',
		buttonHtml: 'Insert image',
		clickHandler: function(){
			return;
			_this.openModal('#easyeditor-modal-1');
		}
	};

	_this.injectButton(settings);
};

/*------END OF linckoEditor---------------------------*/

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

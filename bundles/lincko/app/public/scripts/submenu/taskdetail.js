submenu_list['taskdetail'] = {
	//Set the title of the top
	"_title": {
		"style": "customized_title",
		"title": function(that){
			var title = that.param.type.slice(0,-1) + ' Information';/*toto*/
			return title;
		},
		"class": function(that){
			var className = 'submenu_wrapper_taskdetail_'+that.param.type;
			return className;
		},
		"left": [{
            "style": "button",
            "title": "Close", //toto
            //"action": function() {
            //    console.log('close');
            //}
            'hide': true,
        }],
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
			Elem.find("[find=submenu_input]").prop('value', app_content_menu.projects_id);
		},
		"class": "",
	},
};

Submenu_select.tasklist_button = function(Elem) {
	Elem.Add_MenuTasklistButton();
}

Submenu.prototype.Add_MenuTasklistButton = function() {
    var that = this;
    var task_create = function(){
        console.log('task_create');
    }
    var attribute = this.attribute;
    submenu_wrapper = this.Wrapper();
    var Elem = $('#-submenu_form').clone();
    Elem.prop("id", '');
    submenu_wrapper.find("[find=submenu_wrapper_bottom]").addClass('submenu_bottom');
    submenu_wrapper.find("[find=submenu_wrapper_content]").css('bottom', submenu_wrapper.find("[find=submenu_wrapper_bottom]").height());
    if ("hide" in attribute) {
        if (attribute.hide) {
            Elem.find("[find=submenu_form_button]").click(function() { submenu_Hideall(this.preview); });
        }
    }
    if ("action" in attribute) {
        if ("action_param" in attribute) {
            Elem.find("[find=submenu_form_button]").click(attribute.action_param, attribute.action);
        } else {
            Elem.find("[find=submenu_form_button]").click(attribute.action);
        }
    }
    Elem.find('img').remove();
    Elem.find("[find=submenu_form_title]").html(attribute.title(this))
    if ("class" in attribute) {
        Elem.addClass(attribute['class']);
    }
    if ("now" in attribute && typeof attribute.now === "function") {
        attribute.now(this, Elem);
    }
    if (submenu_wrapper.find("[find=submenu_wrapper_bottom]").find(".submenu_bottom_cell").length == 0) {
        submenu_wrapper.find("[find=submenu_wrapper_bottom]").html(Elem);
    } else {
        submenu_wrapper.find("[find=submenu_wrapper_bottom]").find(".submenu_bottom_cell").append(Elem.children());
    }
    //Free memory
    delete submenu_wrapper;
    return true;
}

Submenu_select.taskdetail = function(Elem){
	Elem.Add_taskdetail();
};

Submenu.prototype.Add_taskdetail = function() {
	var that = this;
	var attribute = this.attribute;
	submenu_wrapper = this.Wrapper();
	var submenu_content = submenu_wrapper.find("[find=submenu_wrapper_content]");
	var submenu_taskdetail = $('#-submenu_taskdetail').clone().prop('id','submenu_taskdetail');
	var contactServer = false;
	var param_sendAction = {};
	var taskid = this.param.id;
	var elem;
	var duedate;
	var duration_timestamp = 86400;
	var created_by;
	var created_at;
	var updated_by;
	var updated_at;
	var in_charge = '';
	var item = {};

	if(taskid == 'new' ){
		var newTitle = 'Enter Your Title Here!'; //toto
		var newDescription = 'Enter Your Description Here.'; //toto
		item['+title'] = newTitle;
		item['-comment'] = newDescription;
		item['created_by'] = wrapper_localstorage.uid;
		item['updated_by'] = wrapper_localstorage.uid;
		item.start = $.now()/1000;
		item.duration = duration_timestamp;
		item['_type'] = that.param.type;
	} 
	else{
		item = Lincko.storage.get(this.param.type, taskid);
		if( that.param.type == "tasks" ){
			duration_timestamp = item['duration'];
		}
	}

	/*---tasktitle---*/
	elem = $('#-submenu_taskdetail_tasktitle').clone().prop('id','submenu_taskdetail_tasktitle');
	elem.find('[find=title_text]').html(item['+title']).click(function(){
		if( $(this).html() == newTitle ){
			$(this).html('');
		}
	});

	elem.find("[find=taskid]").html(taskid);
	if( item['_type'] == "tasks" ){
		var elem_checkbox = $('#-skylist_checkbox').clone().prop('id','');
		elem.find('[find=leftbox]').html(elem_checkbox);
		if(item['approved']){
			elem.addClass('skylist_card_checked');
		}
		elem.find('[find=checkbox]').on('click', function(event){
			event.stopPropagation();
			var elem_title = $(this).closest('table');
			elem_title.toggleClass('skylist_card_checked');
			var approved = false;
			if( elem_title.hasClass('skylist_card_checked') ){
				approved = true;
			}
			else{
				approved = false;
			}
			wrapper_sendAction(
				{
		    		"id": item['_id'],
		    		"approved": approved,
				},
				'post', 'task/update');
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
	submenu_taskdetail.append(elem);

	/*meta (general)*/
	elem = $('#-submenu_taskdetail_meta').clone().prop('id','submenu_taskdetail_meta');
	elem.find('.submenu_taskdetail_meta_actions').click(function(){
		var route;
		if( that.param.type == "tasks" ){
			route = "task/delete";
		}
		else if( that.param.type == "notes" ){
			route = "note/delete";
		}
		wrapper_sendAction(
		    {
		        "id": taskid,
		    },
		    'post',
		    route
		);
		submenu_Clean(null,null,true);
	});

	var elem_timestamp = elem.find('[find=duedate_timestamp]');
	var elem_alt = elem.find("[find=duedate_text]");
	burger_calendar( elem_timestamp, elem_alt );

	elem_timestamp.change(function(){
		if( that.param.type == "tasks" ){
			duration_timestamp = $(this).val()/1000 - item['start'];
		}
	});

	/*---taskmeta---*/
	if( this.param.type == "tasks" ){
		for (var i in item['_users']){
			if( item['_users'][i]['in_charge']==true ){
				in_charge += ' ';
				in_charge += Lincko.storage.get("users", i ,"username");
			}
		}
		elem.find('[find=assigned_text]').html(in_charge);
		elem_timestamp.val((item['start'] + duration_timestamp)*1000);

		duedate = skylist_calcDuedate(item);
		if( skylist_textDate(duedate) ){
			elem.find("[find=duedate_text]").val(skylist_textDate(duedate));
		}
		else{
			elem.find("[find=duedate_text]").val(duedate.display('date_very_short'));
		}
		
	}/*---notesmeta---*/
	else if( this.param.type == "notes" ){
		elem.find('[find=assigned_text]').html(Lincko.storage.get("users", item['updated_by'],"username"));
		var date = new wrapper_date(item['updated_at']);
		elem.find("[find=duedate_text]").val(date.display('date_very_short'));
	}
	submenu_taskdetail.append(elem);
	/*---END OF taskmeta---*/

	/*---description---*/
	elem = $('#-submenu_taskdetail_description').clone().prop('id','submenu_taskdetail_description');
	elem.find('[find=description_text]').html(item['-comment']).click(function(){
		if( $(this).html() == newDescription ){
			$(this).html('');
		}
	});
	submenu_taskdetail.append(elem);
	

	/*---taskcomments--*/
	var elem_submenu_taskdetail_comments = $('#-submenu_taskdetail_comments').clone().prop('id','submenu_taskdetail_comments');
	submenu_taskdetail.append(elem_submenu_taskdetail_comments);

	elem_commentbubble = $('#-submenu_taskdetail_commentbubble').clone().prop('id','');
	var elem_tmp;


	var commentWithID = function(array, id){
		for( var i in array){
			if( array[i]['_id'] == id ){
				return array[i];
			}
		}
		return false;
	}

	var comment;
	var comments_all = [];
	if( $.isNumeric(taskid) ){
		comments_all = Lincko.storage.list('comments',null, null, this.param.type, taskid, true).reverse();
	}
	var comments_primary = [];
	var tree;
	var comments_sorted = [];
	var comments_sub = [];

	for( var i in comments_all ){
		comment = comments_all[i];
		if( comment['_parent'][0] == 'tasks' ){
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
	//var comments = Lincko.storage.list('comments',null,null,'tasks',taskid,true).reverse();
	var commentCount = 0;
	for ( var i in comments_sorted ){
		comment = comments_sorted[i];
		elem = elem_commentbubble.clone();
		elem.find('[find=comment_id]').html(comment['_id']);
		elem.find('[find=text]').html(comment['+comment']);
		created_by = Lincko.storage.get("users", comment['created_by'],"username");
		elem.find('[find=name]').html(created_by);
		submenu_taskdetail.find('.submenu_taskdetail_comments_main').append(elem);
		created_at = new wrapper_date(comment['created_at']);
		created_at = created_at.display('date_very_short');
		elem.find('[find=date]').html(created_at);

		if( comment['created_by'] == wrapper_localstorage.uid ){
			elem.addClass('submenu_taskdetail_commentbubble_me');
		}
		if( comment['_parent'][0] == "comments" ){
			elem.addClass('submenu_taskdetail_commentbubble_sub');
		}

		commentCount++;
	}
	submenu_taskdetail.find('[find=commentCount]').html(commentCount);


	/*addNewComment*/
	var elem_addNewComment_wrapper = submenu_taskdetail.find('.submenu_taskdetail_addNewComment_wrapper');
	var elem_addNewComment_btn = elem_addNewComment_wrapper.find('[find=addNewComment_btn]');
	var elem_addNewComment_bubble_wrapper = elem_addNewComment_wrapper.find('[find=addNewComment_bubble_wrapper]');
	var elem_addNewComment_text = elem_addNewComment_wrapper.find('[find=addNewComment_text]');
	elem_addNewComment_bubble_wrapper.find('[find=name]').html(Lincko.storage.get("users", wrapper_localstorage.uid,"username"));
	var toggleNewComment = function(){
		elem_addNewComment_btn.toggleClass('display_none');
		elem_addNewComment_bubble_wrapper.toggleClass('display_none').toggleClass('submenu_taskdetail_commentbubble_addNew');
	}
	var sendAction_newComment = function(parent_type, parent_id, comment){
		var param = {
    		"parent_type": parent_type,
    		"parent_id": parent_id,
    		"comment": comment,
    	}
    	wrapper_sendAction(param, 'post', 'comment/create');
	}
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


	elem_submenu_taskdetail_comments.find('[find=replyBtn]').click(function(){
		var elem_click = $(this);
		var elem_replyTo = elem_click.closest('.submenu_taskdetail_commentbubble');
		var elem_commentbubble = $('#-submenu_taskdetail_commentbubble').clone().prop('id','').addClass('submenu_taskdetail_commentbubble_sub').addClass('submenu_taskdetail_commentbubble_me').addClass('submenu_taskdetail_commentbubble_addNew');
		elem_commentbubble.find('[find=name]').html(Lincko.storage.get("users", wrapper_localstorage.uid,"username"));
		var elem_addNewComment_text = elem_commentbubble.find('[find=addNewComment_text]');

		elem_addNewComment_text.keyup(function(event) {
		    if (event.keyCode == 13) {
		    	sendAction_newComment(
		    		"comments",
		    		elem_replyTo.find('[find=comment_id]').html(),
		    		elem_commentbubble.find('[find=addNewComment_text]').val()
		    	);
		    	elem_addNewComment_text.blur();	    	
		    }
		});
		elem_addNewComment_text.focusout(function(){
			elem_commentbubble.remove();
		});


		elem_replyTo.after(elem_commentbubble);
		elem_addNewComment_text.focus();
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

	/*---append to submenu_content---*/
	submenu_content.append(submenu_taskdetail);



	/*----create/save on previewHide----*/
	$(document).on("previewHide.skylist", function(){
		console.log('previewHide'+taskid);
		var contactServer = false;
		var param = {};

		//param values that are common to all
		param['id'] = taskid;
		param['parent_id'] = app_content_menu['projects_id'];
		param['title'] = submenu_taskdetail.find('[find=title_text]').html();
		if( param['title'] == '' ){
			param['title'] = newTitle;
		}
		param['comment'] = submenu_taskdetail.find('[find=description_text]').html();

		if( taskid == 'new' || param['title'] != item['+title'] || param['comment'] != item['-comment'] ){
			contactServer = true;
		}

		if( that.param.type == "tasks" && duration_timestamp != item['duration'] ){
			contactServer = true;
			param['duration'] = duration_timestamp;
		}

		if( contactServer ){
			var route = '';
			if( that.param.type == "tasks" ){
				route += 'task';
			}
			else if( that.param.type == "notes" ){
				route += 'note';
			}

			if( taskid == 'new' ){
				route += '/create';
			}
			else{
				route += '/update';

			}
			wrapper_sendAction( param,'post',route );
		}
		$(document).off('previewHide.skylist');
	});


	/*---easyEditor---*/
	if(that.param.type == 'notes' ){
		submenu_wrapper.find('[find=description_text]').easyEditor();
	}

	//Free memory
	delete submenu_wrapper;
	return true;
};

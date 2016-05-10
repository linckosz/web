submenu_list['taskdetail'] = {
	//Set the title of the top
	"_title": {
		"style": "title",
		"title": function(that){
			var title = that.param.type.slice(0,-1) + ' Information';/*toto*/
			return title;
		},
		"class": function(that){
			var className = 'submenu_wrapper_taskdetail_'+that.param.type;
			return className;
		},
		//"title": "Task Information",
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
	var taskid = this.param.id;
	var elem;
	var duedate;
	var created_by;
	var created_at;
	var updated_by;
	var updated_at;
	var in_charge = '';
	var item = {};

	if(taskid == 'new' ){
		item['+title'] = 'Enter Your Task Title Here!';
		item['-comment'] = 'Enter Your Task Description Here.';
		item['created_by'] = wrapper_localstorage.uid;
		item['updated_by'] = wrapper_localstorage.uid;
		item.start = $.now()/1000;
		item.duration = "86400";
		item['_type'] = that.param.type;
	} 
	else{
		item = Lincko.storage.get(this.param.type, taskid);
	}

	/*---tasktitle---*/
	elem = $('#-submenu_taskdetail_tasktitle').clone().prop('id','submenu_taskdetail_tasktitle');
	elem.find('[find=title_text]').html(item['+title']);
	elem.find("[find=taskid]").html(taskid);
	if( item['_type'] == "tasks" ){
		var elem_checkbox = $('#-skylist_checkbox').clone().prop('id','');
		elem.find('[find=leftbox]').html(elem_checkbox);
		elem.find('[find=checkbox]').on('click', function(event){
			event.stopPropagation();
			var elem_checkbox = $(this);
			elem_checkbox.toggleClass('fa fa-check');
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
		console.log(that.param.type);
		console.log(taskid);
		if( that.param.type == "tasks" ){
			route = "task/delete";
		}
		else if( that.param.type == "notes" ){
			route = "note/delete";
		}
		console.log(route);
		wrapper_sendAction(
		    {
		        "id": taskid,
		    },
		    'post',
		    route
		);
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

		duedate = app_layers_dev_skytasks_calcDuedate(item);
		if( duedate.happensSomeday(0) ){
			elem.find("[find=duedate_text]").html(Lincko.Translation.get('app', 3302, 'html').toUpperCase()/*today*/);
		}
		else if( duedate.happensSomeday(1) ){
			elem.find("[find=duedate_text]").html(Lincko.Translation.get('app', 3303, 'html').toUpperCase()/*tomorrow*/);
		}
		else{
			elem.find("[find=duedate_text]").html(duedate.display());
		}
	}/*---notesmeta---*/
	else if( this.param.type == "notes" ){
		elem.find('[find=assigned_text]').html(Lincko.storage.get("users", item['updated_by'],"username"));
		var date = new wrapper_date(item['updated_at']);
		elem.find("[find=duedate_text]").html(date.display());
	}
	submenu_taskdetail.append(elem);
	/*---END OF taskmeta---*/

	/*---taskdescription---*/
	elem = $('#-submenu_taskdetail_description').clone().prop('id','submenu_taskdetail_description');
	elem.find('[find=description_text]').html(item['-comment']);
	submenu_taskdetail.append(elem);

	/*---taskcomments--*/
	var elem_submenu_taskdetail_comments = $('#-submenu_taskdetail_comments').clone().prop('id','submenu_taskdetail_comments');
	submenu_taskdetail.append(elem_submenu_taskdetail_comments);

	elem_commentbubble = $('#-submenu_taskdetail_commentbubble').clone().prop('id','');
	var elem_tmp;


	var comments_primary = Lincko.storage.list('comments',null,{'_parent': [this.param.type,taskid]}).reverse();
	var comments_sub;
	var comments_sorted = [];
	var comment_id;
	var comment;
	for( var i in comments_primary ){
		comment = comments_primary[i];
		comment_id = comment['_id'];
		comments_sorted.push(comment);
		comments_sub = Lincko.storage.list('comments',null,{'_parent': ['comments',comment_id]}).reverse();
		if( comments_sub.length > 0 ){
			for( var k in comments_sub ){
				comments_sorted.push(comments_sub[k]);
			}
		}
	}
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
		created_at = created_at.display();
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
	    	sendAction_newComment(this.param.type,taskid,elem_addNewComment_text.val());
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
		route = '';
		var param = {};
		if( that.param.type == "tasks" ){
			route += 'task';
		}
		else if( that.param.type == "notes" ){
			route += 'note';
		}

		if( taskid == 'new' ){
			route += '/create';
			param['parent_id'] = app_content_menu['projects_id'];
		}
		else{
			route += '/update';
			param['id'] = taskid;
		}

		param['title'] = submenu_taskdetail.find('[find=title_text]').html();
		if( param['title'] == '' ){
			param['title'] = 'A new ' + that.param.type.slice(0,-1);
		}
		param['comment'] = submenu_taskdetail.find('[find=description_text]').html();

		wrapper_sendAction( param,'post',route );

		$(document).off('previewHide.skylist');
	});

	//Free memory
	delete submenu_wrapper;
	return true;
};

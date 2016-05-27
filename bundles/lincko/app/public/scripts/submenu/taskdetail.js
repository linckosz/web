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
	},
	"left_button": {
        "style": "title_left_button",
        "title": Lincko.Translation.get('app', 25, 'html'), //Close
        'hide': true,
        "class": "base_pointer",
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
    var submenu_wrapper = this.Wrapper();
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
	this.md5id = md5(Math.random());
	var submenu_wrapper = this.Wrapper();
	var submenu_content = submenu_wrapper.find("[find=submenu_wrapper_content]");
	submenu_content.prop('id','taskdetail_'+that.md5id);
	var submenu_taskdetail = $('#-submenu_taskdetail').clone().prop('id','submenu_taskdetail');
	var contactServer = false;
	var action_menu_opened = false;
	var param_sendAction = {};
	var taskid = this.param.id;
	var newTitle = 'Enter Your Title Here!'; //toto
	var newDescription = 'Enter Your Description Here.'; //toto
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

	if(taskid == 'new' ){
		item['+title'] = newTitle;
		item['-comment'] = newDescription;
		item['created_by'] = wrapper_localstorage.uid;
		item['updated_by'] = wrapper_localstorage.uid;
		item['_users'] = {};
		item['_users'][wrapper_localstorage.uid] = {};
		item['_users'][wrapper_localstorage.uid]['in_charge'] = true;
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
	var elem_title_text = elem.find('[find=title_text]');
	elem_title_text.html(item['+title']).focus(function(){
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
	submenu_taskdetail.append(elem);

	/*meta (general)*/
	elem = $('#-submenu_taskdetail_meta').clone().prop('id','submenu_taskdetail_meta_'+that.md5id);
	
	var update_meta = function(elem_meta){
		var elem = elem_meta;
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
				in_charge = 'Not Assigned'; //toto
			}

			//----in_charge
			var elem_in_charge = elem.find('[find=user_text]');
			var elem_in_charge_hidden = elem.find('[find=user_text_hidden]');
			elem_in_charge.html(in_charge);
			burger(elem_in_charge_hidden, '_users', item);
			elem_in_charge.click(function(){
				elem_in_charge_hidden.click();
			});
			elem_in_charge_hidden.change(function(){
				in_charge_id = $(this).val();
				var username = Lincko.storage.get("users", in_charge_id, "username");
				elem_in_charge.html(username);
			});

			//---duedate calenar
			var elem_timestamp = elem.find('[find=duedate_timestamp]');
			var elem_display = elem.find("[find=duedate_text]");
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
					wrapper_sendAction({
						id: item['_id'],
						duration: duration_timestamp,
					}, 'post', route);
				}
			});

			duedate = skylist_calcDuedate(item);
			if( skylist_textDate(duedate) ){
				elem.find("[find=duedate_text]").html(skylist_textDate(duedate));
			}
			else{
				elem.find("[find=duedate_text]").html(duedate.display('date_very_short'));
			}
			
		}/*---notesmeta---*/
		else if( that.param.type == "notes" ){
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
			route_delete = true;
			var preview = true;
			if (responsive.test("maxMobileL")){
				preview = false;
			}
			submenu_Clean(null,null,preview);
		});

		return elem;
	}// end of update_meta function
	
	submenu_taskdetail.append(update_meta(elem));
	/*---END OF all meta---*/

	/*---description---*/
	elem = $('#-submenu_taskdetail_description').clone().prop('id','submenu_taskdetail_description');
	var elem_description_text = elem.find('[find=description_text]');
	elem_description_text.html(item['-comment']).focus(function(){
		if( $(this).html() == newDescription ){
			$(this).html('').attr('style','');
		}
	});
	elem_description_text.focus(function(){
		//myIScrollList['taskdetail_'+that.md5id].disable();
	});
	elem_description_text.blur(function(){
		//myIScrollList['taskdetail_'+that.md5id].enable();
	});
	if( taskid == 'new' ){
		elem_description_text.css('opacity',0.4);
	}



	submenu_taskdetail.append(elem);
	

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

		return comments_sorted;
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
		//comment is a Lincko.storage.data comment object
		var elem = $('#-submenu_taskdetail_commentbubble').clone().prop('id','');
		elem.find('[find=comment_id]').attr('comment_id', comment['_id']);
		elem.find('[find=text]').html(comment['+comment']);

		var created_by = Lincko.storage.get("users", comment['created_by'],"username");
		elem.find('[find=name]').html(created_by);

		var created_at = new wrapper_date(comment['created_at']);
		created_at = created_at.display('date_very_short');
		elem.find('[find=date]').html(created_at);

		if( comment['created_by'] == wrapper_localstorage.uid ){
			elem.addClass('submenu_taskdetail_commentbubble_me');
		}
		if( comment['_parent'][0] == "comments" ){
			elem.addClass('submenu_taskdetail_commentbubble_sub');
		}

		elem.find('[find=replyBtn]').click(function(){
			var elem_click = $(this);
			var elem_replyTo = elem_click.closest('.submenu_taskdetail_commentbubble');
			var elem_replyBubble = $('#-submenu_taskdetail_commentbubble').clone().prop('id','')
				.addClass('submenu_taskdetail_commentbubble_sub submenu_taskdetail_commentbubble_me submenu_taskdetail_commentbubble_addNew');
			elem_replyBubble.find('[find=name]').html(Lincko.storage.get("users", wrapper_localstorage.uid,"username"));
			elem_replyBubble.find('[find=comment_id]').attr('comment_id','new');
			var elem_addNewComment_text = elem_replyBubble.find('[find=addNewComment_text]');

			elem_addNewComment_text.keyup(function(event) {
			    if (event.keyCode == 13) {
			    	sendAction_newComment('comments', elem_replyTo.find('[find=comment_id]').attr('comment_id'), elem_replyBubble.find('[find=addNewComment_text]').val());
			    	elem_addNewComment_text.blur();	    	
			    }
			});
			elem_addNewComment_text.focusout(function(){
				elem_replyBubble.remove();
			});

			elem_replyTo.after(elem_replyBubble);
			elem_addNewComment_text.focus();
		});

		return elem;
	}
	var param_viewed = {};
	var commentCount = 0;
	for ( var i in comments_sorted ){
		comment = comments_sorted[i];
		submenu_taskdetail.find('.submenu_taskdetail_comments_main').append(generateCommentBubble(comment));
		param_viewed['comments_'+comment['_id']] = true;
		commentCount++;
	}
	submenu_taskdetail.find('[find=commentCount]').html(commentCount);
	wrapper_sendAction(param_viewed, 'post', 'data/viewed');
	param_viewed = {};


	/*addNewComment*/
	var elem_addNewComment_wrapper = submenu_taskdetail.find('.submenu_taskdetail_addNewComment_wrapper');
	var elem_addNewComment_btn = elem_addNewComment_wrapper.find('[find=addNewComment_btn]');
	var elem_addNewComment_bubble_wrapper = elem_addNewComment_wrapper.find('[find=addNewComment_bubble_wrapper]');
	var elem_addNewComment_text = elem_addNewComment_wrapper.find('[find=addNewComment_text]');
	elem_addNewComment_bubble_wrapper.find('[find=name]').html(Lincko.storage.get("users", wrapper_localstorage.uid,"username"));
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
			console.log('cb_success');
			var comment = Lincko.storage.list('comments',1,{temp_id: tmpID})[0];
			var elem = generateCommentBubble(comment);
			var elem_toReplace = submenu_taskdetail.find('[comment_id='+tmpID+']').closest('.submenu_taskdetail_commentbubble');
			elem_toReplace.replaceWith(elem);
			var param = {};
			param['comments_'+comment['_id']] = true;
			wrapper_sendAction(param, 'post', 'data/viewed');
			tmpID = null;
		}
		var cb_error = function(xhr_err, ajaxOptions, thrownError){
			var elem_toRemove = submenu_taskdetail.find('[comment_id='+tmpID+']').closest('.submenu_taskdetail_commentbubble');
			elem_toRemove.remove();
			tmpID = null;
			var elem_commentCount = elem_submenu_taskdetail_comments.find('[find=commentCount]');
			var commentCount = parseInt(elem_commentCount.html(),10);
			elem_commentCount.html(commentCount-1);
		}
		var cb_begin = function(jqXHR, settings, temp_id){
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

	/*---append to submenu_content---*/
	submenu_content.append(submenu_taskdetail);



	/*----create/save on previewHide----*/
	//$(document).on("previewHide.skylist", function(){
	$(document).on("submenuHide.skylist", function(){
		if( taskid == 'new' && route_delete ){
			return false;
		}
		var contactServer = false;
		var param = {};

		//param values that are common to all
		param['id'] = taskid;
		param['parent_id'] = app_content_menu['projects_id'];
		param['title'] = submenu_taskdetail.find('[find=title_text]').html();
		param['comment'] = submenu_taskdetail.find('[find=description_text]').html();
		if( taskid == 'new' ){
			if(in_charge_id){
	        	param['users>in_charge'] = {};
	        	param['users>in_charge'][in_charge_id] = true;
	        }
	        if(approved){
	        	param['approved'] = approved;
	        }
	        if( param['comment'] == newDescription ){
	        	param['comment'] = '';
	        }
	        if( that.param.type == "tasks" && duration_timestamp != item['duration'] ){
				param['duration'] = duration_timestamp;
			}
		}

		if( taskid == 'new' || route_delete || param['title'] != item['+title'] || param['comment'] != item['-comment'] ){
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

			if( taskid == 'new' ){
				route += '/create';
			}
			else if( route_delete ){
				route += '/delete';
			}
			else{
				route += '/update';

			}
			wrapper_sendAction( param,'post',route );
		}
		//$(document).off('previewHide.skylist');
		$(document).off('submenuHide.skylist');
	});




	app_application_lincko.add(
		'submenu_taskdetail_meta_'+that.md5id,
		that.param.type+'_'+item['_id'],
		function(){
			var elem = $('#'+this.id);
			var elem_new = $('#-submenu_taskdetail_meta').clone().prop('id','submenu_taskdetail_meta_'+that.md5id);
			elem.velocity('fadeOut',{
				duration: 200,
				complete: function(){
					item = Lincko.storage.get(that.param.type, item['_id']);
					if( that.list_type == "tasks" ){
						duration_timestamp = item['duration'];
					}
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


	/*---easyEditor---*/
	submenu_wrapper.find('[find=description_text]').easyEditor();
	/*
	if(that.param.type == 'notes' ){
		submenu_wrapper.find('[find=description_text]').easyEditor();
	}
	*/
	submenu_wrapper.find('[title=bold]').addClass('icon-Single-Person');




	//set the focus upon opening detail pane
	if(taskid == 'new'){
		if(that.param.type == 'tasks'){
			setTimeout(function(){
				elem_title_text.focus();
			},100);
		}
		else if(that.param.type == 'notes'){
			console.log('notes');
			setTimeout(function(){
				elem_description_text.focus();
			},100);
		}
	}


	//Free memory
	delete submenu_wrapper;
	return true;
};

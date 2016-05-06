submenu_list['taskdetail'] = {
	//Set the title of the top
	"_title": {
		"style": "title",
		"title": "Task Information",
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
    console.log(submenu_wrapper.find('[find=title_text]').text());
    console.log(this);
    console.log('attribute');
    console.log(attribute);
    console.log(submenu_wrapper);
    console.log(Elem);
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
	var attribute = this.attribute;
	submenu_wrapper = this.Wrapper();
	var submenu_content = submenu_wrapper.find("[find=submenu_wrapper_content]");
	var submenu_taskdetail = $('#-submenu_taskdetail').clone().prop('id','submenu_taskdetail');
	var taskid = this.param;
	var elem;
	var duedate;
	var created_by;
	var in_charge = '';
	var item = {};

	if(taskid == 'new' ){
		item['+title'] = 'Enter Your Task Title Here!';
		item['-comment'] = 'Enter Your Task Description Here.';
		item['created_by'] = wrapper_localstorage.uid;
		item.start = $.now()/1000;
		item.duration = "86400";
	} 
	else{
		item = Lincko.storage.get("tasks", taskid);
	}

	/*---tasktitle---*/
	elem = $('#-submenu_taskdetail_tasktitle').clone().prop('id','submenu_taskdetail_tasktitle');
	elem.find('[find=title_text]').html(item['+title']);
	elem.find("[find=taskid]").html(taskid);
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
	submenu_taskdetail.append(elem);

	/*---taskmeta---*/
	elem = $('#-submenu_taskdetail_meta').clone().prop('id','submenu_taskdetail_meta');

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
	submenu_taskdetail.append(elem);

	/*---taskdescription---*/
	elem = $('#-submenu_taskdetail_description').clone().prop('id','submenu_taskdetail_description');
	elem.find('[find=description_text]').html(item['-comment']);
	submenu_taskdetail.append(elem);

	/*---taskcomments--*/
	elem = $('#-submenu_taskdetail_comments').clone().prop('id','submenu_taskdetail_comments');
	submenu_taskdetail.append(elem);

	elem_commentbubble = $('#-submenu_taskdetail_commentbubble').clone().prop('id','submenu_taskdetail_commentbubble');
	var elem_tmp;

	var comments = Lincko.storage.list('comments',null,{'_parent': ['tasks',taskid]});
	var commentCount = 0;
	for ( var i in comments ){
		comment = comments[i];
		elem = elem_commentbubble.clone();
		elem.find('[find=text]').html(comment['+comment']);
		created_by = Lincko.storage.get("users", comment['created_by'],"username");
		elem.find('[find=name]').html(created_by);
		submenu_taskdetail.find('.submenu_taskdetail_comments_main').append(elem);
		commentCount++;
	}
	console.log('commentCount');
	console.log(commentCount);
	submenu_taskdetail.find('[find=commentCount]').html(commentCount);



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
					},
				});
				elem_arrow.velocity({
					'rotateZ': 0,
				});
			}
		}
	submenu_taskdetail.find('.submenu_taskdetail_collapsable_button').click(submenu_taskdetail_collapsable_fn);

	submenu_wrapper.find('[find=submenu_wrapper_content]').removeClass('overthrow');

	/*---append to submenu_content---*/
	submenu_content.append(submenu_taskdetail);

	//Free memory
	delete submenu_wrapper;
	return true;
};

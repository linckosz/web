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

	"confirm": {
		"style": "form",
		"title": Lincko.Translation.get('app', 3, 'html'), //Confirm
		"hide": true, //By default 'false', it hides all submenu after the click ( equivalent to submenu_Hideall(); )
	},
	"cancel": {
		"style": "form",
		"title": Lincko.Translation.get('app', 7, 'html'), //Confirm
		"hide": true, //By default 'false', it hides all submenu after the click ( equivalent to submenu_Hideall(); )
	},

};

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
	elem.find("[type=checkbox]").prop('id','app_layers_dev_skytasks_checkbox_'+taskid);
	elem.find('.app_layers_dev_skytasks_checkbox label').prop('for','app_layers_dev_skytasks_checkbox_'+taskid);
	submenu_taskdetail.append(elem);

	/*---taskdescription---*/
	elem = $('#-submenu_taskdetail_description').clone().prop('id','submenu_taskdetail_description');
	elem.find('[find=description_text]').html(item['-comment']);
	submenu_taskdetail.append(elem);

	/*---taskmeta---*/
	elem = $('#-submenu_taskdetail_meta').clone().prop('id','submenu_taskdetail_meta');
	created_by = item['created_by'];
	created_by = Lincko.storage.get("users", created_by,"username");
	elem.find('[find=assigned_text]').html(created_by);

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

	/*---taskcomments--*/
	elem = $('#-submenu_taskdetail_comments').clone().prop('id','submenu_taskdetail_comments');
	submenu_taskdetail.append(elem);

	elem = $('#-submenu_taskdetail_commentbubble').clone().prop('id','submenu_taskdetail_commentbubble');
	submenu_taskdetail.find('.submenu_taskdetail_comments_main').append(elem);
	elem = $('#-submenu_taskdetail_commentbubble').clone().prop('id','submenu_taskdetail_commentbubble');
	submenu_taskdetail.find('.submenu_taskdetail_comments_main').append(elem);
	elem = $('#-submenu_taskdetail_commentbubble').clone().prop('id','submenu_taskdetail_commentbubble').addClass('submenu_taskdetail_commentbubble_right');
	submenu_taskdetail.find('.submenu_taskdetail_comments_main').append(elem);


	submenu_wrapper.find('[find=submenu_wrapper_content]').removeClass('overthrow');

	/*---append to submenu_content---*/
	submenu_content.append(submenu_taskdetail);

	//Free memory
	delete submenu_wrapper;
	return true;
};

submenu_list['burger_projects'] = {
	//Set the title of the top
	"_title": {
		"style": "customized_title",
		"title": Lincko.Translation.get('app', 2203, 'html'), //Select Project
		"class": 'submenu_wrapper_burger_projects',
	},
	"left_button": {
		"style": "title_left_button",
		"title": Lincko.Translation.get('app', 7, 'html'), //'Cancel',
		'hide': true,
		"class": "base_pointer",
	},
	"right_button": {
		"style": "title_right_button",
		"title": Lincko.Translation.get('app', 52, 'html'), //"Select", 
		"class": "base_pointer",
		"action": function(elem, submenuInst) {
			var new_projectID = submenuInst.param.elem_projectSelection.val();
			if(new_projectID){
				submenuInst.param.input.val(new_projectID);
				submenuInst.param.input.change();

				var item = submenuInst.param.item;
				var param = {
					id: item['_id'],
					parent_id: new_projectID,
				}
				var route = null;
				switch(item['_type']){
					case 'tasks':
						route = 'task/update';
						param['users>in_charge'] = taskdetail_tools.taskUserCheck(item, 'projects', new_projectID).users_incharge;
						skylist.sendAction.tasks(param,item,route);
						break;
					case 'notes':
						route = 'note/update';
						break;
					case 'files':
						route = 'file/update';
						break;
				}
				if(item['_type'] != 'tasks'){
					wrapper_sendAction(param, 'post', route);
				}
			}
		},
		hide: true,
	},
	"burger_projects": {
		"style": "burger_projects",
		"title": "burger_projects",
		"class": "",
	},
};


Submenu_select.burger_projects = function(subm){
	subm.Add_burger_projects();
};

Submenu.prototype.Add_burger_projects = function() {
	var that = this;
	var submenu_wrapper = this.Wrapper();
	var submenu_content = submenu_wrapper.find("[find=submenu_wrapper_content]").addClass('submenu_burger_projects');
	var elem_projectSelection = $('<input>');
	elem_projectSelection.attr('find','projectSelection').attr('readonly',true).addClass('visibility_hidden');
	that.param.elem_projectSelection = elem_projectSelection;
	submenu_content.append(elem_projectSelection);

	var elem_input = that.param.input;
	var projects_list = that.param.projects_list;
	var item = that.param.item;

	var click_fn = function(){
		var projects_id = $(this).attr('projects_id');
		submenu_content.find('.burger_option').removeClass('burger_option_selected');
		$(this).addClass('burger_option_selected');
		elem_projectSelection.val(projects_id);
	}

	var elem_dropdown = burgerN.draw_projects(projects_list, click_fn);
	var elem_burger_options = elem_dropdown.find('.burger_option');
	elem_burger_options.removeClass('burger_option_users').addClass('burger_option_projects');
	submenu_content.append(elem_dropdown.find('.burger_option'));


	//Free memory
	delete submenu_wrapper;
	return true;
}

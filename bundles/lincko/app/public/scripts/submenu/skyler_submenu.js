submenu_list['skyler'] = {
	//Set the title of the top
	"_title": {
		"style": "title",
		"title": "Skyler's Secret Submenu",
	},

	"open_skytasks": {
		"style": "button",
		"title": "Skytasks",
		"action": function(){
			app_layers_changePage('dev_skytasks');
		},
		"now": function(that, Elem){ //An action to launch at element creation
			console.log(that);
			console.log(Elem);
		},
		"class": "",
		"hide": true, //By default 'false', it hides all submenu after the click ( equivalent to submenu_Hideall(); )
	},

	"open_skynotes": {
		"style": "button",
		"title": "Skynotes",
		"action": function(){
			app_layers_changePage('skynotes');
		},
		"now": function(that, Elem){ //An action to launch at element creation
			console.log(that);
			console.log(Elem);
		},
		"class": "",
		"hide": true, //By default 'false', it hides all submenu after the click ( equivalent to submenu_Hideall(); )
	},

	"open_skynotes_submenu": {
		"style": "next",
		"title": "Skynotes",
		"next": "skynotes",
		"class": "",
	},

};

submenu_list['skynotes'] = {
	//Set the title of the top
	"_title": {
		"style": "title",
		"title": "Skynotes",
	},

	"skynotes": {
		"style": "skynotes",
		"title": "skynotes",
		"class": "",
	},

	"form": {
		"style": "form",
		"title": Lincko.Translation.get('app', 3, 'html'), //Confirm
		"hide": true, //By default 'false', it hides all submenu after the click ( equivalent to submenu_Hideall(); )
	},

	"form2": {
		"style": "form",
		"title": Lincko.Translation.get('app', 3, 'html'), //Confirm
		"hide": true, //By default 'false', it hides all submenu after the click ( equivalent to submenu_Hideall(); )
	},
};
Submenu_select.skynotes = function(Elem){
	Elem.Add_skynotes();
};

Submenu.prototype.Add_skynotes = function() {
	var attribute = this.attribute;
	submenu_wrapper = this.Wrapper();

	var temp = new app_layers_dev_skynotes_ClassTextEditor(submenu_wrapper.find("[find=submenu_wrapper_content]"));
	console.log(temp);
	delete temp;
	console.log(temp);
	//Free memory
	delete submenu_wrapper;
	return true;
};

var submenu_list = [];

/*
//Only "style" and "title" must exist, other fields are optional
submenu_list['sample'] = {
	//Set the title of the top
	"_title": {
		"style": "title",
		"title": "Sample",
	},
	//Just do an action (need to hide al menus manually by the function submenu_Hideall)
	"action": {
		"style": "button",
		"title": "Single action",
		"action": function(){
			submenu_Hideall();
			alert('An action');
		},
		"class": "",
	},
	//It will open a sub menu
	"Submenu": {
		"style": "next",
		"title": "Submenu",
		"next": "anothermenu", //The name of the next menu we will access
		"value": "Un truc", //This will ne replace by the title of the sub menu if it exists
		"class": "",
	},
	//It will create a form with a validation button
	"form": {
		"style": "form",
		"title": "Confirm",
	},
};
*/

submenu_list['settings'] = {
	//Set the title of the top
	"_title": {
		"style": "title",
		"title": Lincko.Translation.get('app', 2, 'html'), //Settings
	},
	//Just do an action (need to hide al menus manually by the function submenu_Hideall)
	"action": {
		"style": "button",
		"title": "Single action",
		"action": function(){
			submenu_Hideall();
			alert('An action');
		},
		"class": "",
	},
	//It will open a sub menu
	"Submenu": {
		"style": "next",
		"title": "Submenu",
		"next": "anothermenu", //The name of the next menu we will access
		"value": "Un truc", //This will be replaced by the title of the sub menu if it exists
		"class": "",
	},
	//It will create a form with a validation button
	"form": {
		"style": "form",
		"title": Lincko.Translation.get('app', 3, 'html'), //Confirm
	},
};

submenu_list['app_upload'] = {
	"_title": {
		"style": "title",
		"title": Lincko.Translation.get('app', 4, 'html'), //Uploads
	},
	"app_upload_all": {
		"style": "app_upload_all",
		"title": "Upload all", //This title will be not used
	},
};

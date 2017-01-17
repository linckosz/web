submenu_list['projectsDeck'] = {
	"_title": {
		"style": "customized_title",
		"title": Lincko.Translation.get('app', 2501, 'html'), //Projects list
	},
	"left_button": {
		"style": "title_left_button",
		"title": Lincko.Translation.get('app', 25, 'html'), //Close
		'hide': true,
		"class": "base_pointer",
	},
	"projectsDeck": {
		"style": "projectsDeck",
		"title": "projectsDeck",
	}
};

Submenu_select.projectsDeck = function(Elem){
	Elem.Add_projectsDeck();
};

Submenu.prototype.Add_projectsDeck = function() {
	var that = this;
	var submenu_wrapper = this.Wrapper();
	var submenu_content = submenu_wrapper.find("[find=submenu_wrapper_content]").removeClass('overthrow').addClass('submenu_content_projectsDeck');
	submenu_content.append('<input class="visibility_hidden" readonly/>');

	var deck = new app_models_projects_projectsDeck(this.id);
	submenu_content.append(deck.elem);



	//Free memory
	//submenu_wrapper = null; //In some placea it bugs because it's used in a lower scope
	delete submenu_wrapper;
	return true;
}

submenu_list['personal_settings'] = {
	"_title": {
		"style": "title",
		"title": Lincko.Translation.get('app', 46, 'html'), //Personal Settings
	},
};

Submenu_select.profile_next = function(Elem) {
	//console.log('ok');
	Elem.Add_ProfileNext();
};

Submenu.prototype.Add_ProfileNext = function() {
	var perso = Lincko.storage.get('users',  wrapper_localstorage.uid);

	var attribute = this.attribute;
	var Elem = $('#-submenu_app_personal_next').clone();
	var preview = this.preview;
	Elem.prop("id", '');
	if ("action" in attribute) {
		if ("action_param" in attribute) {
			Elem.click(attribute.action_param, attribute.action);
		} else {
			Elem.click(attribute.action);
		}
	}
	if ("class" in attribute) {
		Elem.addClass(attribute['class']);
	}
	Elem.find("[find=submenu_next_upload_picture]").click(function(){
		app_upload_open_photo('users', wrapper_localstorage.uid);
	});
	

	Elem.find("[find=submenu_next_user]").html(perso['-username'].ucfirst());
	$("<img class='submenu_icon submenu_icon_next floatright' src='/lincko/app/images/submenu/next.png' />").appendTo(Elem.find("[find=submenu_next_user]"));
	this.Wrapper().find("[find=submenu_wrapper_content]").append(Elem);
	return true;
}

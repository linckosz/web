enquire.register(responsive.minTablet, function() { 
	Mobile_menu_Hideall();
});

var mobile_menu_zindex = 2000;

function Mobile_menu(obj) {
	this.obj = obj;
	mobile_menu_zindex++;
	this.id = mobile_menu_zindex+"_mobile_menu_wrapper";
	this.wrapper = null;
	function Constructor(Elem){
		Elem.wrapper = $('#-mobile_menu_wrapper').clone();
		Elem.wrapper.attr("id",Elem.id);
		Elem.wrapper.children('div').eq(0).children('span').eq(0).click(function(){
			Mobile_menu_Hide(Elem.id);
		});
		Elem.wrapper.css("z-index", mobile_menu_zindex);
		Elem.wrapper.insertBefore('#end_mobile_menu');
		var attribute = null;
		for(var att in Elem.obj){
			attribute = Elem.obj[att];
			if("style" in attribute && "title" in attribute){
				if(attribute.style=="title"){
					Elem.AddMenuTitle(attribute);
				} else if(attribute.style=="button"){
					Elem.AddMenuButton(attribute);
				} else if(attribute.style=="radio"){
					Elem.AddMenuRadio(attribute);
				}
			}
		}
		Elem.Show();
	}
	Constructor(this);
}
 
Mobile_menu.prototype = {
	AddMenuTitle: function(attribute) {
		this.wrapper.children('div').eq(0).children('span').eq(1).html(attribute.title);
		return true;
	},
	AddMenuButton: function(attribute) {
		var Elem = $('#-mobile_menu_button').clone();
		Elem.attr("id",null);
		Elem.children('span').eq(0).html(attribute.title);
		if("value" in attribute){
			Elem.children('span').eq(1).html(attribute.value);
		}
		if("action" in attribute){
			Elem.click(attribute.action);
		}
		if("class" in attribute){
			Elem.addClass(attribute.class);
		}
		this.wrapper.children('div').eq(1).append(Elem);
		return true;
	},
	AddMenuRadio: function(attribute) {
		var Elem = $('#-mobile_menu_radio').clone();
		Elem.attr("id",null);
		Elem.children('span').eq(0).html(attribute.title);
		if("selected" in attribute){
			if(attribute.selected){
				Elem.children('span').eq(1).html("<img class='mobile_menu_radio_icon' src='/lincko/web/images/generic/mobile_menu/check.png' />");
			}
		}
		if("action" in attribute){
			Elem.click(attribute.action);
		}
		if("class" in attribute){
			Elem.addClass(attribute.class);
		}
		this.wrapper.children('div').eq(1).append(Elem);
		return true;
	},
	Show: function(){
		var Elem = this.wrapper;
		Elem.velocity(
			"transition.expandIn",
			{
				duration: 90,
				easing: [ .38, .1, .13, .9 ],
				begin: function(){ Elem.show(); },
				complete: function(){
					Elem.children('div').eq(1).focus();
				}
			}
		);

	},
};

function Mobile_menu_Hide(id){
	var Elem = $('#'+id);
	Elem.velocity(
		"transition.expandOut",
		{
			duration: 90,
			easing: [ .38, .1, .13, .9 ],
			complete: function(){ Elem.hide().remove(); }
		}
	);
}

function Mobile_menu_Hideall(){
	$('[id$="_mobile_menu_wrapper"]').each(function(){
		Mobile_menu_Hide($(this).attr('id'));
	});
	mobile_menu_zindex = 2000;
}

function Mobile_menu_Build(menu){
	if(menu in mobile_menu_list){
		var temp = new Mobile_menu(mobile_menu_list[menu]);
		temp = null;
	}
}

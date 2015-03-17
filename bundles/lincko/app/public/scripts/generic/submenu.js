enquire.register(responsive.minTablet, function() { 
	Submenu_Hideall();
});

var submenu_zindex = 2000;

function Submenu(obj) {
	this.obj = obj;
	submenu_zindex++;
	this.id = submenu_zindex+"_submenu_wrapper";
	this.wrapper = null;
	function Constructor(Elem){
		Elem.wrapper = $('#-submenu_wrapper').clone();
		Elem.wrapper.prop("id",Elem.id);
		Elem.wrapper.children('div').eq(0).children('span').eq(0).click(function(){
			Submenu(Elem.id);
		});
		Elem.wrapper.css("z-index", submenu_zindex);
		Elem.wrapper.insertBefore('#end_submenu');
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
 
Submenu.prototype = {
	AddMenuTitle: function(attribute) {
		this.wrapper.children('div').eq(0).children('span').eq(1).html(attribute.title);
		return true;
	},
	AddMenuButton: function(attribute) {
		var Elem = $('#-submenu_button').clone();
		Elem.prop("id",null);
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
		var Elem = $('#-submenu_radio').clone();
		Elem.prop("id",null);
		Elem.children('span').eq(0).html(attribute.title);
		if("selected" in attribute){
			if(attribute.selected){
				Elem.children('span').eq(1).html("<img class='submenu_radio_icon' src='/lincko/app/images/generic/submenu/check.png' />");
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

function Submenu_Hide(id){
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

function Submenu_Hideall(){
	$('[id$="_submenu_wrapper"]').each(function(){
		Submenu_Hide($(this).prop('id'));
	});
	submenu_zindex = 2000;
}

function Submenu_Build(menu){
	if(menu in submenu_list){
		var temp = new Submenu(submenu_list[menu]);
		temp = null;
	}
}

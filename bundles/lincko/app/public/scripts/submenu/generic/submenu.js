var submenu_zindex = {
	false: 2000,
	true: 1000,
};
var submenu_obj = { 'submenu': {}, 'preview': {} };
var submenu_mouseenter = { 'submenu': false, 'preview': false };
var submenu_show = { 'submenu': {}, 'preview': {} };
var animation_map_preview = {
	'new_in': {
		'desktop':"transition.slideRightBigIn",
		'mobile': "bruno.expandIn",
	},
	'new_out': {
		'desktop': "transition.slideRightBigOut",
		'mobile': "bruno.expandOut",
	},
	'insert_in': {
		'desktop': 'transition.fadeIn',
		'mobile': 'transition.fadeIn', 
	},
	'insert_out': {
		'desktop': 'transition.fadeOut',
		'mobile':'transition.fadeOut',
	},
	'cover_in': {
		'desktop':"bruno.slideRightBigIn",
		'mobile': "bruno.slideRightBigIn",
	},
	'cover_out': {
		'desktop': "bruno.expandOut",
		'mobile': "bruno.expandOut",
	},
}

var Submenu_select = {
	prefix: function(subm) {
		subm.prefix = subm.attribute.title;
	},

	title: function(subm) {
		subm.Add_MenuTitle();
	},

	space: function(subm) {
		subm.Add_Space();
	},

	title_left_button: function(subm) {
		subm.Add_TitleLeftButton();
	},

	title_right_button: function(subm) {
		subm.Add_TitleRightButton();
	},

	title_right_button_list: function(subm) {
		subm.Add_TitleRightButtonList();
	},

	customized_title: function(subm) {
		subm.Add_CustomisedTitle();
	},

	button: function(subm, position) {
		subm.Add_MenuButton(position);
	},

	info: function(subm, position) {
		subm.Add_MenuInfo(position);
	},

	small_button: function(subm, position) {
		subm.Add_MenuSmallButton(position);
	},

	next: function(subm) {
		subm.Add_MenuNext();
	},

	radio: function(subm) {
		subm.Add_MenuRadio();
	},

	form: function(subm) {
		if (!subm.prefix) { subm.prefix = ''; }
		subm.Add_MenuForm();
	},

	bottom_button: function(subm) {
		if (!subm.prefix) { subm.prefix = ''; }
		subm.Add_MenuBottomButton();
	},

	title_small: function(subm) {
		subm.Add_TitleSmall();
	},

	input_hidden: function(subm) {
		subm.Add_InputHidden();
	},

	input_text: function(subm) {
		subm.Add_InputText();
	},

	input_password: function(subm) {
		subm.Add_InputPassword();
	},

	input_textarea: function(subm) {
		subm.Add_InputTextarea();
	},

	select_multiple: function(subm) {
		subm.Add_SelectMultiple();
	},

}

Submenu.prototype.changeState = function() {
	// to check what animation this submenu should use.
	var next = submenu_Getnext(this.preview);
	if (next == 1 && this.layer == 1) {
		this.inAnimation = 'new_in';
		this.outAnimation = 'new_out';
	} else if (this.layer < next) {
		// this layer is going to substitute the content
		// of another layer, so they need to exchange animation
		this.inAnimation = 'insert_in';
		this.outAnimation = 'insert_out';
		submenu_exchangeAnimation(this);
	} else {
		this.inAnimation = "cover_in";
		this.outAnimation = "cover_out";
	}

}

function submenu_exchangeAnimation(Elem) {
	if(Elem){
		var tmp = Elem.outAnimation;
		var stack = Elem.preview ? submenu_obj['preview'] : submenu_obj['submenu'];
		if(stack[Elem.layer]){
			Elem.outAnimation = stack[Elem.layer].outAnimation;
			stack[Elem.layer].outAnimation = tmp;
		}
	}
}


function Submenu(menu, next, param, preview, animate) {
	this.obj = submenu_list[menu];
	this.menu = menu;
	this.layer = 1;
	this.preview = preview ? true : false;
	if (typeof next === 'number') {
		if (next === 0) {
			this.layer = submenu_Getfull(this.preview);
		} else {
			this.layer = next;
		}
	} else if (typeof next !== 'undefined' && next === true) {
		this.layer = submenu_Getposition(menu, this.preview);
	}
	if (typeof param === 'undefined') {
		this.param = null;
	} else {
		this.param = param;
	}

	if (typeof preview === 'undefined') { preview = false; }
	if (typeof animate === 'undefined') { animate = true; }

	//The creation of new submenu with MD5 seems to lead to a Memory leak
	//this.id = this.layer+"_submenu_wrapper_"+md5(Math.random());

	//The creation or reuse of HTML element seems to have some display problem, and DIV deletion issue
	this.id = this.layer + "_submenu_wrapper_" + menu + "_" + this.preview;

	this.zIndex = submenu_zindex[this.preview] + this.layer;
	this.display = true;
	this.prefix = false;
	this.attribute = null;

	function Constructor(subm) {
		subm.changeState();
		//First we have to empty the element if it exists
		submenu_Clean(subm.layer, false, subm.preview);

		var submenu_wrapper = $('#-submenu_wrapper').clone();
		if($('#'+subm.id).length>0){
			$('#'+subm.id).recursiveRemove();
		}
		submenu_wrapper.prop("id", subm.id);
		if(subm.preview){
			submenu_wrapper.addClass('submenu_wrapper_preview');
		}

		submenu_wrapper.css('z-index', subm.zIndex);
		//Do not not add "overthrow" in twig template, if not the scrollbar will not work
		submenu_wrapper.find("[find=submenu_wrapper_content]").addClass('overthrow').prop("id", "overthrow_"+subm.id);
		//This is because we can only place 3 menus on Desktop mode, so after 3 layers we switch to full width mode
		if (subm.layer > 3) { submenu_wrapper.addClass('submenu_wrapper_important'); }

		if (subm.preview) {
			submenu_wrapper.appendTo('#app_content_submenu_preview');
			submenu_wrapper.mouseenter(function(){
				submenu_mouseenter['preview'] = true;
			});
			submenu_wrapper.mouseleave(function(){
				submenu_mouseenter['preview'] = false;
			});
		} else {
			submenu_wrapper.appendTo('#app_application_submenu_block');
			submenu_wrapper.mouseenter(function(){
				submenu_mouseenter['submenu'] = true;
			});
			submenu_wrapper.mouseleave(function(){
				submenu_mouseenter['submenu'] = false;
			});
		}

		//Launch Pre action
		for (var att in subm.obj) {
			subm.attribute = subm.obj[att];
			if ("style" in subm.attribute && subm.attribute.style == "preAction" && "action" in subm.attribute) {
				if (typeof subm.attribute.action === "function") {
					subm.attribute.action(submenu_wrapper, subm);
				}
			}
		}
		//Build the page
		for (var att in subm.obj) {
			subm.attribute = subm.obj[att];
			if ("style" in subm.attribute && "title" in subm.attribute) {
				if (typeof Submenu_select[subm.attribute.style] === "function") {
					Submenu_select[subm.attribute.style](subm);
				}
			}
		}

		for (var att in subm.obj) {
			subm.attribute = subm.obj[att];
			if ("style" in subm.attribute && "items" in subm.attribute) {
				if (typeof Submenu_select[subm.attribute.style] === "function") {
					Submenu_select[subm.attribute.style](subm);
				}
			}
		}


		//Launch Post action
		for (var att in subm.obj) {
			subm.attribute = subm.obj[att];
			if ("style" in subm.attribute && subm.attribute.style == "postAction" && "action" in subm.attribute) {
				if (typeof subm.attribute.action === "function") {
					subm.attribute.action(submenu_wrapper, subm);
				}
			}
		}

		if (subm.display) {
			subm.Show(animate); //animate at false (default is true) force to open the submenu without animation to be able to access to DOM directly
		} else {
			subm.Hide();
		}
		if (subm.prefix) {
			base_format_form(subm.prefix);
		}
		wrapper_IScroll_refresh();
		wrapper_IScroll();
		//Free memory
		//submenu_wrapper = null; //In some placea it bugs because it's used in a lower scope
		delete submenu_wrapper;

		return subm;
	}
	Constructor(this);
}

Submenu.prototype.Add_MenuTitle = function() {
	var that = this;
	var attribute = this.attribute;
	var submenu_wrapper = this.Wrapper();
	var title;
	var className;
	var Elem = $('#-submenu_top').clone();
	Elem.prop("id", '');
	submenu_wrapper.prepend(Elem);
	if( typeof attribute.title === "function" ){
		title = attribute.title(this);
	}
	else{
		title = attribute.title;
	}
	if ("class" in attribute && typeof attribute.class === "function") {
		submenu_wrapper.find('.submenu_top').addClass(attribute.class(this));
	}
	else if( "class" in attribute ){
		submenu_wrapper.find('.submenu_top').addClass(attribute['class']);
	}
	submenu_wrapper.find("[find=submenu_wrapper_title]").html(title);
	//Free memory
	//submenu_wrapper = null; //In some placea it bugs because it's used in a lower scope
	delete submenu_wrapper;
	return Elem;
};

Submenu.prototype.Add_CustomisedTitle = function() {
	var attribute = this.attribute;
	var that = this;
	var submenu_wrapper = this.Wrapper();

	var Elem = $('#-submenu_customized_top').clone();
	Elem.prop("id", '');

	var title;
	var className;
	var span;
	if( typeof attribute.title === "function" ){
		title = attribute.title(this);
	}
	else{
		title = attribute.title;
	}
	
	if ("class" in attribute && typeof attribute.class === "function") {
		Elem.addClass(attribute.class(this));
	}
	else if( "class" in attribute ){
		Elem.addClass(attribute['class']);
	}
	Elem.find("[find=submenu_title]").html(title);

	if ("now" in attribute && typeof attribute.now === "function") {
		attribute.now(Elem, that);
	}
	
	span = $('<span />').addClass('submenu_top_side');

	if ("left" in attribute) {
		for (var left_item in attribute['left']) {
			if('style' in attribute['left'][left_item] && attribute['left'][left_item].style in Submenu_select) {
				this.attribute = attribute['left'][left_item];
				Submenu_select[attribute['left'][left_item].style](that, Elem.find('.submenu_top_side_left'));
				Submenu_select[attribute['left'][left_item].style](that, Elem.find('.submenu_top_side_left'));
			}
		}
	}

	if ("right" in attribute) {
		for (var right_item in attribute['right']) {
			if('style' in attribute['right'][right_item] && attribute['left'][right_item].style in Submenu_select) {
				this.attribute = attribute['right'][right_item];
				Submenu_select[attribute['right'][right_item].style](that, Elem.find('.submenu_top_side_right'));
				Submenu_select[attribute['right'][right_item].style](that, Elem.find('.submenu_top_side_right'));
			}
		}
	}

	submenu_wrapper.prepend(Elem);

	//Free memory
	//submenu_wrapper = null; //In some placea it bugs because it's used in a lower scope
	delete submenu_wrapper;
	return Elem;
}

Submenu.prototype.Add_TitleSmall = function() {
	var that = this;
	var attribute = this.attribute;
	var submenu_wrapper = this.Wrapper();
	var Elem = $('#-submenu_title_small').clone();
	Elem.prop("id", '');
	Elem.find("[find=submenu_title]").html(attribute.title);
	if ("class" in attribute) {
		Elem.addClass(attribute['class']);
	}
	if ("now" in attribute && typeof attribute.now === "function") {
		attribute.now(Elem, that);
	}
	submenu_wrapper.find("[find=submenu_wrapper_content]").append(Elem);
	//Free memory
	//submenu_wrapper = null; //In some placea it bugs because it's used in a lower scope
	delete submenu_wrapper;
	return Elem;
};

Submenu.prototype.Add_TitleLeftButton = function() {
	var that = this;
	var attribute = this.attribute;
	var Elem = $('#-submenu_top_button').clone();
	var preview = this.preview;
	Elem.prop("id", this.id+"_submenu_top_button_left");
	Elem.html(wrapper_to_html(attribute.title));
	if ("action" in attribute) {
		if (!("action_param" in attribute)) {
			attribute.action_param = null;
		}
		Elem.click(attribute.action_param, function(event){
			attribute.action(Elem, that, event.data);
		});
	}
	if ("hide" in attribute) {
		if (attribute.hide) {
			Elem.click(function() {
				submenu_Clean(that.layer, true, that.preview);
			});
		}
	}
	Elem.addClass("submenu_top_side_left");
	if ("class" in attribute) {
		Elem.addClass(attribute['class']);
	}
	Elem.css('text-align', 'left');
	if ("now" in attribute && typeof attribute.now == "function") {
		attribute.now(Elem, that);
	}
	this.Wrapper().find("[find=submenu_wrapper_top]").prepend(Elem);
	return Elem;
};



Submenu.prototype.Add_TitleRightButton = function() {
	var that = this;
	var attribute = this.attribute;
	var Elem = $('#-submenu_top_button').clone();
	var preview = this.preview;
	Elem.prop("id", this.id+"_submenu_top_button_right");
	Elem.html(attribute.title);
	if ("action" in attribute) {
		if (!("action_param" in attribute)) {
			attribute.action_param = null;
		}
		Elem.click(attribute.action_param, function(event){
			attribute.action(Elem, that, event.data);
		});
	}
	if ("hide" in attribute) {
		if (attribute.hide) {
			Elem.click(function() {
				submenu_Clean(that.layer, true, that.preview);
			});
		}
	}
	Elem.addClass("submenu_top_side_right");
	if ("class" in attribute) {
		Elem.addClass(attribute['class']);
	}
	Elem.css('text-align', 'right');
	if ("now" in attribute && typeof attribute.now == "function") {
		attribute.now(Elem, that);
	}
	this.Wrapper().find("[find=submenu_wrapper_top]").append(Elem);
	return Elem;
};

Submenu.prototype.Add_TitleRightButtonList = function() {
	var that = this;
	var attribute = this.attribute;
	var Elem = $('#-submenu_menu_list_main').clone();
	var preview = this.preview;
	Elem.prop("id", "");
	Elem.html(attribute.title);
	this.Wrapper().find("[find=submenu_wrapper_top]").append(Elem);

	var elems ;
	Elem.click(function(){
		if($("#"+that.id + "_submenu_menu_list_container").length == 0)
		{
			elems = $('#-submenu_menu_list_container').clone();
			//elems.addClass("display_none");
			elems.prop("id", that.id + "_submenu_menu_list_container");
			Elem.closest("[find=submenu_wrapper_top]").after(elems);

			if ("items" in attribute) {
				for(var i in attribute.items)
				{
					if(("display" in attribute.items[i] && attribute.items[i].display(that)) 
						|| !("display" in attribute.items[i]))
					{

						var enabled = true;
						if("enabled" in attribute.items[i])
						{
							enabled = attribute.items[i].enabled(that)
						}

						var elems_item = $('#-submenu_menu_list_item').clone();
						elems_item.prop("id","");
						elems_item.find("[find=icon]").addClass(attribute.items[i].icon);

						if(enabled){
							elems_item.find("[find=title]").html(attribute.items[i].title);
						}
						else
						{
							elems_item.find("[find=title]").html( "(" + Lincko.Translation.get('app', 88, 'html') + ")");//Link exist
						}
						

						if(enabled)
						{
							if("prepare" in attribute.items[i]) {
								attribute.items[i].prepare(elems_item,that);
							}

							if("action" in attribute.items[i]) {
								elems_item.click(i,function(event){
									attribute.items[event.data].action(elems_item,that);
									elems.velocity('slideUp', {
										mobileHA: hasGood3Dsupport,
									});
								});
							}
						}
						else
						{
							elems_item.addClass("submenu_taskdetail_disabled");
						}

						elems.find("ul").eq(0).append(elems_item);
					}
					
				}
			}

			elems.find("ul").on("blur",function(){
				elems.velocity('slideUp', {
					mobileHA: hasGood3Dsupport,
				});
			});
		}
		else{
			elems = $("#"+that.id + "_submenu_menu_list_container");
		}

		elems.velocity('slideDown', {
			mobileHA: hasGood3Dsupport,
			complete: function(){
				elems.find("ul").focus();
			}
		});
		
	});

	
	return Elem;
};


Submenu.prototype.Add_MenuButton = function(position) {
	var that = this;
	var attribute = this.attribute;
	var Elem = $('#-submenu_button').clone();
	var preview = this.preview;
	Elem.prop("id", '');
	Elem.find("[find=submenu_button_title]").html(attribute.title);
	if ("value" in attribute) {
		if(attribute.value){
			Elem.find("[find=submenu_button_value]").removeClass("display_none").html(attribute.value);
		} else {
			Elem.find("[find=submenu_button_value]").addClass("display_none");
		}
	} else {
		Elem.find("[find=submenu_button_value]").addClass("display_none");
	}
	if ("action" in attribute) {
		if (!("action_param" in attribute)) {
			attribute.action_param = null;
		}
		Elem.click(attribute.action_param, function(event){
			attribute.action(Elem, that, event.data);
		});
	}
	if ("hide" in attribute) {
		if (attribute.hide) {
			Elem.click(function() {
				//submenu_Hideall(preview); //We should not close all tabs
				submenu_Clean(this.layer, true, that.preview);
			});
		}
	}
	if ("class" in attribute) {
		Elem.addClass(attribute['class']);
	}
	if ("now" in attribute && typeof attribute.now === "function") {
		attribute.now(Elem, that);
	}
	if (!position) {
		this.Wrapper().find("[find=submenu_wrapper_content]").append(Elem);
	}
	else {
		position.append(Elem);
	}
	return Elem;
};

Submenu.prototype.Add_MenuInfo = function(position) {
	var that = this;
	var attribute = this.attribute;
	var Elem = $('#-submenu_info').clone();
	var preview = this.preview;
	Elem.prop("id", '');
	Elem.find("[find=submenu_info_title]").html(attribute.title);
	if ("value" in attribute) {
		Elem.find("[find=submenu_info_title]").html(attribute.value);
	}
	if ("class" in attribute) {
		Elem.addClass(attribute['class']);
	}
	if ("now" in attribute && typeof attribute.now === "function") {
		attribute.now(Elem, that);
	}
	if (!position) {
		this.Wrapper().find("[find=submenu_wrapper_content]").append(Elem);
	}
	else {
		position.append(Elem);
	}
	return Elem;
};

Submenu.prototype.Add_MenuSmallButton = function(position) {
	var that = this;
	var attribute = this.attribute;
	var Elem = $('#-submenu_small_button').clone();
	var preview = this.preview;
	Elem.prop("id", '');
	Elem.find("[find=submenu_small_button_title]").html(attribute.title);
	if ("action" in attribute) {
		if (!("action_param" in attribute)) {
			attribute.action_param = null;
		}
		Elem.click(attribute.action_param, function(event){
			attribute.action(Elem, that, event.data);
		});
	}
	if ("hide" in attribute) {
		if (attribute.hide) {
			Elem.click(function() {
				//submenu_Hideall(preview); //We should not close all tabs
				submenu_Clean(this.layer, true, that.preview);
			});
		}
	}
	if ("class" in attribute) {
		Elem.addClass(attribute['class']);
	}
	if ("now" in attribute && typeof attribute.now === "function") {
		attribute.now(Elem, that);
	}
	if (!position) {
		this.Wrapper().find("[find=submenu_wrapper_content]").append(Elem);
	}
	else {
		position.append(Elem);
	}
	return Elem;
};

Submenu.prototype.Add_Space = function() {
	var that = this;
	var attribute = this.attribute;
	var submenu_wrapper = this.Wrapper();
	var Elem = $('#-submenu_space').clone();
	Elem.prop("id", '');
	if ("class" in attribute) {
		Elem.addClass(attribute['class']);
	}
	if ("now" in attribute && typeof attribute.now === "function") {
		attribute.now(Elem, that);
	}
	if ("value" in attribute) {
		Elem.css('height', attribute.value);
	}
	submenu_wrapper.find("[find=submenu_wrapper_content]").append(Elem);
	//Free memory
	//submenu_wrapper = null; //In some placea it bugs because it's used in a lower scope
	delete submenu_wrapper;
	return Elem;
};

Submenu.prototype.Add_MenuNext = function() {
	var attribute = this.attribute;
	var Elem = $('#-submenu_next').clone();
	var that = this;
	Elem.prop("id", '');
	if ("value" in attribute) {
		Elem.find("[find=submenu_next_value]").html(attribute.value);
	}
	if ("next" in attribute) {
		if (attribute.next in submenu_list) {
			if (attribute.style == "title") {
				Elem.Add_MenuTitle(attribute);
			}
			for (var att in submenu_list[attribute.next]) {
				next_attribute = submenu_list[attribute.next][att];
				if ("style" in next_attribute && "title" in next_attribute) {
					if (next_attribute.style == "title") {
						attribute.title = next_attribute.title;
					}
				}
			}
			Elem.click(function() {
				$.each(that.Wrapper().find('.submenu_deco_next'), function() {
					$(this).removeClass('submenu_deco_next');
				});
				if(submenu_Build(attribute.next, that.layer + 1, true, null, that.preview)) {
					$(this).addClass('submenu_deco_next');
				}

			});
		}
	}
	Elem.find("[find=submenu_next_title]").html(attribute.title);
	if ("class" in attribute) {
		Elem.addClass(attribute['class']);
	}
	if ("now" in attribute && typeof attribute.now === "function") {
		attribute.now(Elem, that);
	}
	this.Wrapper().find("[find=submenu_wrapper_content]").append(Elem);
	return Elem;
};

Submenu.prototype.Add_MenuRadio = function() {
	var attribute = this.attribute;
	var that = this;
	var Elem = $('#-submenu_radio').clone();
	var selected = false;
	Elem.prop("id", '');
	Elem.find("[find=submenu_radio_title]").html(attribute.title);
	if ("selected" in attribute) {
		if (attribute.selected) {
			Elem.find("[find=submenu_radio_value]").html("<img class='submenu_icon' src='/lincko/app/images/submenu/check.png' />");
		} else {
			Elem.find("[find=submenu_radio_value]").html("");
		}
	}

	var select_id = this.id+"_"+md5(Math.random());
	var select_elem = Elem.find("[find=submenu_radio_value]");
	select_elem.prop("id", select_id);
	app_application_lincko.add(select_id, "form_radio", function(){
		var Elem = this.action_param[0];
		var attribute = this.action_param[1];
		if (attribute.selected) {
			Elem.find("[find=submenu_radio_value]").html("<img class='submenu_icon' src='/lincko/app/images/submenu/check.png' />");
		} else {
			Elem.find("[find=submenu_radio_value]").html("");
		}
	}, [Elem, attribute] )

	if ("action" in attribute) {
		if (!("action_param" in attribute)) {
			attribute.action_param = null;
		}
		Elem.click(attribute.action_param, function(event){
			attribute.action(Elem, that, event.data);
		});
	}
	if ("hide" in attribute) {
		if (attribute.hide) {
			Elem.click(function() {
				submenu_Clean(this.layer, true, that.preview);
			});
		}
	}

	if ("class" in attribute) {
		Elem.addClass(attribute['class']);
	}
	if ("now" in attribute && typeof attribute.now === "function") {
		attribute.now(Elem, that);
	}
	this.Wrapper().find("[find=submenu_wrapper_content]").append(Elem);
	return Elem;
};

Submenu.prototype.Add_InputHidden = function() {
	var attribute = this.attribute;
	var that = this;
	var Elem = $('#-submenu_input').clone();
	var Input = $('<input type="hidden" find="submenu_input" />');
	Elem.prop("id", '');
	Elem.find("[find=submenu_title]").html(attribute.title);
	Elem.prop('for', attribute.name);
	Input.prop('name', attribute.name);
	Elem.append(Input);
	if ("value" in attribute) {
		Elem.find("[find=submenu_input]").prop('value', attribute.value);
	}
	if ("class" in attribute) {
		Elem.addClass(attribute['class']);
	}
	if ("now" in attribute && typeof attribute.now === "function") {
		attribute.now(Elem, that);
	}
	this.Wrapper().find("[find=submenu_wrapper_content]").append(Elem);
	return Elem;
};

Submenu.prototype.Add_InputText = function() {
	var that = this;
	var attribute = this.attribute;
	var Elem = $('#-submenu_input').clone();
	var Input = $('<input type="text" find="submenu_input" class="selectable" />');
	Elem.prop("id", '');
	Elem.find("[find=submenu_title]").html(attribute.title);
	Elem.prop('for', attribute.name);
	Input.prop('name', attribute.name);
	Elem.append(Input);
	if ("value" in attribute) {
		Elem.find("[find=submenu_input]").prop('value', attribute.value);
	}
	if ("class" in attribute) {
		Elem.addClass(attribute['class']);
	}
	if ("now" in attribute && typeof attribute.now === "function") {
		attribute.now(Elem, that);
	}
	this.Wrapper().find("[find=submenu_wrapper_content]").append(Elem);
	return Elem;
};

Submenu.prototype.Add_InputPassword = function() {
	var that = this;
	var attribute = this.attribute;
	var Elem = $('#-submenu_input').clone();
	var Input = $('<input type="password" find="submenu_input" class="selectable" />');
	Elem.prop("id", '');
	Elem.find("[find=submenu_title]").html(attribute.title);
	Elem.prop('for', attribute.name);
	Input.prop('name', attribute.name);
	Elem.append(Input);
	if ("value" in attribute) {
		Elem.find("[find=submenu_input]").prop('value', attribute.value);
	}
	if ("class" in attribute) {
		Elem.addClass(attribute['class']);
	}
	if ("now" in attribute && typeof attribute.now === "function") {
		attribute.now(Elem, that);
	}
	this.Wrapper().find("[find=submenu_wrapper_content]").append(Elem);
	return Elem;
};

Submenu.prototype.Add_InputTextarea = function() {
	var that = this;
	var attribute = this.attribute;
	var Elem = $('#-submenu_input').clone();
	Elem.prop("id", '');
	var Value = '';
	if ("value" in attribute) {
		Value = attribute.value;
	}
	var Input = $('<textarea find="submenu_input_textarea" class="selectable"></textarea>'); //toto
	Input.html(Value); //toto
	Elem.find("[find=submenu_title]").html(attribute.title);
	Elem.prop('for', attribute.name);
	Input.prop('name', attribute.name);
	Elem.append(Input);
	if ("class" in attribute) {
		Elem.addClass(attribute['class']);
	}
	if ("now" in attribute && typeof attribute.now === "function") {
		attribute.now(Elem, that);
	}
	this.Wrapper().find("[find=submenu_wrapper_content]").append(Elem);
	return Elem;
};

Submenu.prototype.Add_SelectMultiple = function() {
	var attribute = this.attribute;
	var Elem = $('#-submenu_select').clone();
	var that = this;
	Elem.prop("id", '');
	if ("value" in attribute) {
		Elem.find("[find=submenu_select_value]").html(attribute.value);
	}
	if (!attribute["param"]) {
		attribute.param = null;
	}
	if ("next" in attribute) {
		if (attribute.next in submenu_list) {
			if (attribute.style == "title") {
				Elem.Add_MenuTitle(attribute);
			}
			
			var next_id = this.id+"_"+md5(Math.random());
			var next_elem = Elem.find("[find=submenu_select_value]");
			next_elem.prop("id", next_id);
			
			app_application_lincko.add(next_id, "select_multiple", function(){
				var Num = 0;
				for (var att in this.action_param) {
					var next_attribute = this.action_param[att];
					if ("style" in next_attribute && "title" in next_attribute) {
						if (next_attribute.style == "title") {
							attribute.title = next_attribute.title;
						}
					}
					if ("selected" in next_attribute) {
						if (next_attribute.selected) {
							Num++;
						}
					}
				}
				var next_id = $('#'+this.id);
				next_id.html(Num);
			}, submenu_list[attribute.next]);
			Elem.click(function() {
				$.each(that.Wrapper().find('.submenu_deco_next'), function() {
					$(this).removeClass('submenu_deco_next');
				});
				if (submenu_Build(attribute.next, that.layer + 1, true, attribute.param, that.preview)) {
					$(this).addClass('submenu_deco_next');
				}
			});
		}
	}
	Elem.find("[find=submenu_select_title]").html(attribute.title);
	if ("class" in attribute) {
		Elem.addClass(attribute['class']);
	}
	if ("now" in attribute && typeof attribute.now === "function") {
		attribute.now(Elem, that);
	}
	this.Wrapper().find("[find=submenu_wrapper_content]").append(Elem);
	app_application_lincko.prepare("select_multiple", true);
	return Elem;
};

Submenu.prototype.Add_SubmitForm = function() {
	var attribute = this.attribute;
	var submenu_wrapper = this.Wrapper();
	var Elem = $('#-submenu_bottom').clone();
	var that = this;
	Elem.prop("id", '');
	submenu_wrapper.find("[find=submenu_wrapper_bottom]").addClass('submenu_bottom');
	//submenu_wrapper.find("[find=submenu_wrapper_content]").css('bottom', submenu_wrapper.find("[find=submenu_wrapper_bottom]").height());
	Elem.find("[find=submenu_bottom_title]").html(attribute.title);
	Elem.find("[find=submenu_bottom_button]").click(function() {
		$('#' + that.id + '_submenu_form').submit();
	});
	if ("class" in attribute) {
		Elem.addClass(attribute['class']);
	}
	if ("now" in attribute && typeof attribute.now === "function") {
		attribute.now(Elem, that);
	}
	if (submenu_wrapper.find("[find=submenu_wrapper_bottom]").find(".submenu_bottom_cell").length == 0) {
		submenu_wrapper.find("[find=submenu_wrapper_bottom]").html(wrapper_to_html(Elem));
	} else {
		submenu_wrapper.find("[find=submenu_wrapper_bottom]").find(".submenu_bottom_cell").append(Elem.children());
	}

	var ElemForm = $("<form method='post' action='' submit='e.preventDefault(); return false;'></form>");
	ElemForm.prop("id", this.id + '_submenu_form');
	if ("action" in attribute) {
		ElemForm.prop("action", attribute.action);
	}
	if ("submit" in attribute) {
		ElemForm.on('submit', function(e) {
			e.preventDefault();
			attribute.submit(this);
		});
	}
	if ("hide" in attribute) {
		if (attribute.hide) {
			Elem.find("[find=submenu_bottom_button]").click(function() {
				//submenu_Hideall(this.preview);
				submenu_Clean(this.layer, true, that.preview);
			});
		}
	}
	submenu_wrapper.find("[find=submenu_wrapper_content]").wrap(ElemForm);
	//Free memory
	//submenu_wrapper = null; //In some placea it bugs because it's used in a lower scope
	delete submenu_wrapper;
	return ElemForm;
};

Submenu.prototype.Add_MenuForm = function() {
	var attribute = this.attribute;
	var submenu_wrapper = this.Wrapper();
	var that = this;
	var ElemForm = $("<form method='post' action='' submit='e.preventDefault(); return false;'></form>");
	ElemForm.prop("id", this.id + '_submenu_form');
	if ("action" in attribute) {
		ElemForm.prop("action", attribute.action);
	}
	if ("submit" in attribute) {
		ElemForm.on('submit', function(e) {
			e.preventDefault();
			attribute.submit(that);
		});
	}
	submenu_wrapper.wrapInner(ElemForm);
	//Free memory
	//submenu_wrapper = null; //In some placea it bugs because it's used in a lower scope
	delete submenu_wrapper;
	return ElemForm;
};

Submenu.prototype.Add_MenuBottomButton = function() {
	var that = this;
	var attribute = this.attribute;
	var submenu_wrapper = this.Wrapper();
	var Elem = $('#-submenu_bottom').clone();
	Elem.prop("id", '');
	submenu_wrapper.find("[find=submenu_wrapper_bottom]").addClass('submenu_bottom');
	if ("action" in attribute) {
		if (!("action_param" in attribute)) {
			attribute.action_param = null;
		}
		Elem.find("[find=submenu_bottom_button]").click(attribute.action_param, function(event){
			attribute.action(Elem, that, event.data);
		});
	}
	if ("hide" in attribute) {
		if (attribute.hide) {
			Elem.find("[find=submenu_bottom_button]").click(function() {
				submenu_Clean(this.layer, true, that.preview);
			});
		}
	}
	Elem.find('img').recursiveRemove();
	Elem.find("[find=submenu_bottom_title]").html(attribute.title);
	if ("class" in attribute) {
		Elem.addClass(attribute['class']);
	}
	if ("now" in attribute && typeof attribute.now === "function") {
		attribute.now(Elem, that);
	}
	if (submenu_wrapper.find("[find=submenu_wrapper_bottom]").find(".submenu_bottom_cell").length == 0) {
		submenu_wrapper.find("[find=submenu_wrapper_bottom]").html(wrapper_to_html(Elem));
	} else {
		submenu_wrapper.find("[find=submenu_wrapper_bottom]").find(".submenu_bottom_cell").append(Elem.children());
	}
	//Free memory
	//submenu_wrapper = null; //In some placea it bugs because it's used in a lower scope
	delete submenu_wrapper;
	return Elem;
};


Submenu.prototype.FocusForm = function() {
	var that = this;
	if (!supportsTouch) {
		setTimeout(function() {
			submenu_wrapper = that.Wrapper();
			var ElemFocus = submenu_wrapper.find("input:enabled:visible:first:not(.no_focus)");
			if (ElemFocus.length >= 1) {
				ElemFocus.focus();
				return true;
			}
			ElemFocus = submenu_wrapper.find("textarea:enabled:visible:first:not(.no_focus)");
			if (ElemFocus.length >= 1) {
				ElemFocus.focus();
				return true;
			}
			ElemFocus = submenu_wrapper.find("select:enabled:visible:first:not(.no_focus)");
			if (ElemFocus.length >= 1) {
				ElemFocus.focus();
				return true;
			}
		}, 1);
	}
};

Submenu.prototype.showSubmenu = function(time, delay, animate) {
	if(typeof time == 'undefined'){ time = 160; }
	if(typeof delay == 'undefined'){ delay = 60; }
	if(typeof animate == 'undefined'){ animate = false; }
	//In case of animation, give enough time for the picture to be draw into the memory
	if(animate){
		delay = delay + wrapper_performance.delay;
	}
	var submenu_wrapper = this.Wrapper();
	var that = this;
	$('#' + that.id).css('width', '33.33%');
	$('#' + that.id).css('visibility', 'hidden').hide();
	if(!animate){
		$('#' + that.id).css('visibility', 'visible').show(0);
		//The line below avoid a bug in Chrome that could make the scroll unavailable in some areas
		//submenu_wrapper.hide().show(0);
		app_application_submenu_position();
		submenu_resize_content();
		submenu_content_unblur();
		submenu_wrapper_width();
		that.FocusForm();
		$(window).resize();
		setTimeout(function(sub_that){
			sub_that.Wrapper().find("[find=submenu_wrapper_content]").focus();
			app_application_lincko.prepare(["submenu_show", "submenu_show_"+sub_that.preview+"_"+sub_that.id], true);
		}, 1, that);
	} else if (responsive.test("minDesktop")) {
		if (that.layer <= 3) { submenu_wrapper.css('z-index', submenu_zindex[this.preview]); } //This insure for the 1/3 version to go below the previous one
		submenu_wrapper.velocity(
			"transition.slideLeftBigIn", {
				mobileHA: hasGood3Dsupport,
				duration: time,
				delay: delay,
				easing: [.38, .1, .13, .9],
				begin: function() {
					$('#' + that.id).css('visibility', 'visible').show(0);
					if (responsive.test("minDesktop")) {
						//The blur is hard to calculate, it creates some flickering
						if (hasGood3Dsupport && wrapper_browser('webkit')) {
							$('#app_content_dynamic').velocity({ blur: 2 }, {
								mobileHA: hasGood3Dsupport,
								duration: time,
								delay: delay,
								easing: [4],
							});
						}
					}
				},
				complete: function() {
					//The line below avoid a bug in Chrome that could make the scroll unavailable in some areas
					//submenu_wrapper.hide().show(0);
					submenu_wrapper.css('z-index', that.zIndex);
					app_application_submenu_position();
					submenu_resize_content();
					submenu_content_unblur();
					submenu_wrapper_width();
					that.FocusForm();
					$(window).resize();
					setTimeout(function(sub_that){
						sub_that.Wrapper().find("[find=submenu_wrapper_content]").focus();
						app_application_lincko.prepare(["submenu_show", "submenu_show_"+sub_that.preview+"_"+sub_that.id], true);
					}, 1, that);
				}
			}
		);
	} else {
		var animation = "bruno.slideRightBigIn";
		setTimeout(function(){
			submenu_wrapper.velocity(
				animation, {
					mobileHA: hasGood3Dsupport,
					duration: Math.floor(1.5 * time),
					delay: delay,
					easing: [.38, .1, .13, .9],
					begin: function() {
						$('#' + that.id).css('visibility', 'visible').show(0);
					},
					complete: function() {
						//The line below avoid a bug in Chrome that could make the scroll unavailable in some areas
						//submenu_wrapper.hide().show(0);
						app_application_submenu_position();
						submenu_resize_content();
						submenu_content_unblur();
						submenu_wrapper_width();
						that.FocusForm();
						$(window).resize();
						setTimeout(function(sub_that){
							sub_that.Wrapper().find("[find=submenu_wrapper_content]").focus();
							app_application_lincko.prepare(["submenu_show", "submenu_show_"+sub_that.preview+"_"+sub_that.id], true);
						}, 1, that);
					}
				}
			);
		}, 10);
	}
	//submenu_wrapper = null; //In some placea it bugs because it's used in a lower scope
	delete submenu_wrapper;
}

Submenu.prototype.showPreview = function(time, delay, animate) {
	if(typeof time == 'undefined'){ time = 200; }
	if(typeof delay == 'undefined'){ delay = 60; }
	if(typeof animate == 'undefined'){ animate = false; }
	if(animate){
		delay = delay + wrapper_performance.delay;
	}
	var submenu_wrapper = this.Wrapper();
	var that = this;
	var animation;
	$('#' + that.id).css('visibility', 'hidden').hide();
	if(!animate){
		$('#' + that.id).css('visibility', 'visible').show(0);
		//The line below avoid a bug in Chrome that could make the scroll unavailable in some areas
		//submenu_wrapper.hide().show(0);
		submenu_wrapper.css('z-index', that.zIndex);
		app_application_submenu_position();
		submenu_resize_content();
		that.FocusForm();
		$(window).resize();
		setTimeout(function(sub_that){
			sub_that.Wrapper().find("[find=submenu_wrapper_content]").focus();
			app_application_lincko.prepare(["submenu_show", "submenu_show_"+sub_that.preview+"_"+sub_that.id], true);
		}, 1, that);
	} else if (responsive.test("minDesktop")) {
		animation = animation_map_preview[this.inAnimation]['desktop'];
		submenu_wrapper.velocity("stop", true).velocity(
			animation, {
				mobileHA: hasGood3Dsupport,
				duration: time,
				delay: delay,
				easing: [.38, .1, .13, .9],
				begin: function() {
					$('#' + that.id).css('visibility', 'visible').show(0);
				},
				complete: function() {
					//The line below avoid a bug in Chrome that could make the scroll unavailable in some areas
					//submenu_wrapper.hide().show(0);
					submenu_wrapper.css('z-index', that.zIndex);
					app_application_submenu_position();
					submenu_resize_content();
					that.FocusForm();
					$(window).resize();
					setTimeout(function(sub_that){
						sub_that.Wrapper().find("[find=submenu_wrapper_content]").focus();
						app_application_lincko.prepare(["submenu_show", "submenu_show_"+sub_that.preview+"_"+sub_that.id], true);
					}, 1, that);
				}
			}
		);
	} else {
		animation = animation_map_preview[this.inAnimation]['mobile'];
		submenu_wrapper.velocity("stop", true).velocity(
			animation, {
				mobileHA: hasGood3Dsupport,
				duration: Math.floor(1.5 * time),
				delay: delay,
				easing: [.38, .1, .13, .9],
				begin: function() {
					$('#' + that.id).css('visibility', 'visible').show(0);
				},
				complete: function() {
					//The line below avoid a bug in Chrome that could make the scroll unavailable in some areas
					//submenu_wrapper.hide().show(0);
					app_application_submenu_position();
					submenu_resize_content();
					that.FocusForm();
					$(window).resize();
					setTimeout(function(sub_that){
						sub_that.Wrapper().find("[find=submenu_wrapper_content]").focus();
						app_application_lincko.prepare(["submenu_show", "submenu_show_"+sub_that.preview+"_"+sub_that.id], true);
					}, 1, that);
				}
			}
		);
	}
	//submenu_wrapper = null; //In some placea it bugs because it's used in a lower scope
	delete submenu_wrapper;
}

Submenu.prototype.Show = function(animate) {
	if(typeof animate == 'undefined'){ animate = false; }
	if(!wrapper_performance.powerfull && responsive.test("maxTablet")){ animate = false; } //toto => the animation seems slow on mobile, disallow velocity
	var that = this;
	var time = 200;
	var delay = 60;
	var stack = this.preview ? submenu_show['preview'] : submenu_show['submenu'];
	if (typeof stack[this.id] !== 'boolean' || !stack[this.id]) {
		stack[this.id] = true;
		var state_layer = that.layer;
		if (this.preview) {
			app_generic_state.change(
				{
					preview: state_layer,
				},
				{
					param: that.param,
				},
				1
			);
			this.showPreview(time, delay, animate);
		} else {
			app_generic_state.change(
				{
					submenu: state_layer,
				},
				{
					param: that.param,
				},
				1
			);
			this.showSubmenu(time, delay, animate);
		}
	}
};

Submenu.prototype.hideSubmenu = function(time, delay, animate) {
	if(typeof time == 'undefined'){ time = 160; }
	if(typeof delay == 'undefined'){ delay = 60; }
	if(typeof animate == 'undefined'){ animate = false; }
	var that = this;
	var submenu_wrapper = this.Wrapper();
	if(!animate){
		app_application_lincko.prepare(["submenu_hide", "submenu_hide_"+that.preview+"_"+that.id], true, false, true);
		that.Remove();
		app_application_lincko.prepare(["submenu_hide", "submenu_hide_"+that.preview+"_"+that.id], true);
	} else if (responsive.test("minDesktop")) {
		if (that.layer <= 3) { submenu_wrapper.css('z-index', submenu_zindex[this.preview]); } //This insure for the 1/3 version to go below the previous one
		submenu_wrapper.velocity(
			"transition.slideLeftBigOut", {
				mobileHA: hasGood3Dsupport,
				duration: time,
				delay: delay,
				easing: [.38, .1, .13, .9],
				complete: function() {
					app_application_lincko.prepare(["submenu_hide", "submenu_hide_"+that.preview+"_"+that.id], true, false, true);
					that.Remove();
					app_application_lincko.prepare(["submenu_hide", "submenu_hide_"+that.preview+"_"+that.id], true);
				}
			}
		);
	} else {
		var animation = "bruno.slideRightBigOut";
		submenu_wrapper.velocity(
			animation, {
				mobileHA: hasGood3Dsupport,
				duration: Math.floor(1.5 * time),
				delay: delay,
				easing: [.38, .1, .13, .9],
				complete: function() {
					app_application_lincko.prepare(["submenu_hide", "submenu_hide_"+that.preview+"_"+that.id], true, false, true);
					that.Remove();
					app_application_lincko.prepare(["submenu_hide", "submenu_hide_"+that.preview+"_"+that.id], true);
				}
			}
		);
	}
	//Free memory
	//submenu_wrapper = null; //In some placea it bugs because it's used in a lower scope
	delete submenu_wrapper;
}

Submenu.prototype.hidePreview = function(time, delay, animate) {
	if(typeof time == 'undefined'){ time = 160; }
	if(typeof delay == 'undefined'){ delay = 60; }
	if(typeof animate == 'undefined'){ animate = false; }
	var that = this;
	var submenu_wrapper = this.Wrapper();
	var that = this;
	var animation;
	if(!animate){
		app_application_lincko.prepare(["submenu_hide", "submenu_hide_"+that.preview+"_"+that.id], true, false, true);
		that.Remove();
		app_application_lincko.prepare(["submenu_hide", "submenu_hide_"+that.preview+"_"+that.id], true);
	} else if (responsive.test("minDesktop")) {
		animation = animation_map_preview[this.outAnimation]['desktop'];
		submenu_wrapper.velocity("stop", true).velocity(
			animation, {
				mobileHA: hasGood3Dsupport,
				duration: time,
				delay: delay,
				easing: [.38, .1, .13, .9],
				complete: function() {
					app_application_lincko.prepare(["submenu_hide", "submenu_hide_"+that.preview+"_"+that.id], true, false, true);
					that.Remove();
					app_application_lincko.prepare(["submenu_hide", "submenu_hide_"+that.preview+"_"+that.id], true);
				}
			}
		);
	} else {
		animation = animation_map_preview[this.outAnimation]['mobile'];
		submenu_wrapper.velocity("stop", true).velocity(
			animation, {
				mobileHA: hasGood3Dsupport,
				duration: Math.floor(1.5 * time),
				delay: delay,
				easing: [.38, .1, .13, .9],
				complete: function() {
					app_application_lincko.prepare(["submenu_hide", "submenu_hide_"+that.preview+"_"+that.id], true, false, true);
					that.Remove();
					app_application_lincko.prepare(["submenu_hide", "submenu_hide_"+that.preview+"_"+that.id], true);
				}
			}
		);
	}
	//Free memory
	//submenu_wrapper = null; //In some placea it bugs because it's used in a lower scope
	delete submenu_wrapper;
}

Submenu.prototype.Hide = function(animate) {
	if(typeof animate == 'undefined'){ animate = false; }
	if(!wrapper_performance.powerfull && responsive.test("maxTablet")){ animate = false; } //toto => the animation seems slow on mobile, disallow velocity
	var that = this;
	var time = 160;
	var delay = 60;
	var preview = this.preview ? "preview" : "submenu";
	var stack = preview ? submenu_obj['preview'] : submenu_obj['submenu'];
	submenu_show[preview][this.id] = false;
	submenu_content_unblur();
	//Reset menu selection if(menu in submenu_list){
	if ((that.layer - 1) in stack) {
		$.each(stack[that.layer - 1].Wrapper().find('.submenu_deco_next'), function() {
			$(this).removeClass('submenu_deco_next');
		});
	}
	var state_layer = that.layer - 1;
	if (this.preview) {
		app_generic_state.change(
			{
				preview: state_layer,
			},
			{
				param: that.param,
			},
			-1
		);
		this.hidePreview(time, delay, animate);
	} else {
		app_generic_state.change(
			{
				submenu: state_layer,
			},
			{
				param: that.param,
			},
			-1
		);
		this.hideSubmenu(time, delay, animate);
	}
	$(document).trigger("submenuHide");
};

// http://stackoverflow.com/questions/19469881/javascript-remove-all-event-listeners-of-specific-type
Submenu.prototype.Remove = function() {
	var that = this;
	var stack = this.preview ? submenu_obj["preview"] : submenu_obj["submenu"];
	$('#' + this.id).hide().recursiveRemove();
	//Free memory
	stack[this.layer] = null;
	delete stack[this.layer];
	app_application_submenu_position();
	submenu_resize_content();
	submenu_content_block_hide(this.preview);
};

Submenu.prototype.Wrapper = function() {
	return $('#' + this.id);
}

function submenu_resize_content() {
	var submenu_wrapper;
	var top;
	var content;
	var bottom;
	var iscroll = false;
	for(var stack in submenu_obj){
		for(var index in submenu_obj[stack]){
			submenu_wrapper = $("#"+submenu_obj[stack][index]['id']);
			total = parseInt(submenu_wrapper.height(), 10);
			top = parseInt(submenu_wrapper.find("[find=submenu_wrapper_top]").height(), 10);
			bottom = parseInt(submenu_wrapper.find("[find=submenu_wrapper_bottom]").height(), 10);
			content = total-top-bottom;
			if(content){
				submenu_wrapper.find("[find=submenu_wrapper_content]").height(content);
				iscroll = true;
			}
		}
	}
	if(iscroll){
		wrapper_IScroll_refresh();
		wrapper_IScroll();
	}
	return true;
}

var submenu_resize_content_timer;
$(window).resize(function(){
	clearTimeout(submenu_resize_content_timer);
	submenu_resize_content_timer = setTimeout(submenu_resize_content, wrapper_timeout_timer*2);
});

function submenu_getById(id) {
	for(var stack in submenu_obj){
		for(var index in submenu_obj[stack]){
			if(submenu_obj[stack][index]['id']==id && $("#"+id).length>0){
				return submenu_obj[stack][index];
			}
		}
	}
	return false;
}

function submenu_Hideall(preview) {
	if(typeof preview == 'undefined'){ preview = false; }
	var stack = preview ? submenu_obj['preview'] : submenu_obj['submenu'];
	for (var index in stack) {
		submenu_Clean(true, !preview, preview);
	}
}

//Return the next layer to display full screen
function submenu_Getfull(preview) {
	if(typeof preview == 'undefined'){ preview = false; }
	var next = submenu_Getnext(preview);
	if (next < 4) {
		next = 4;
	}
	return next;
}

// "1" means that there is no submenu displayed
function submenu_Getnext(preview) {
	var stack = preview ? submenu_obj['preview'] : submenu_obj['submenu'];
	submenu_layer = 0;
	for (var index in stack) {
		if (stack[index].layer > submenu_layer) {
			submenu_layer = stack[index].layer;
		}
	}
	submenu_layer++;
	return submenu_layer;
}

function submenu_get(menu, preview) {
	if(typeof preview == 'undefined'){ preview = false; }
	var stack = preview ? submenu_obj['preview'] : submenu_obj['submenu'];
	var submenu = false;
	for (var index in stack) {
		if (stack[index].menu === menu) {
			submenu = stack[index];
		}
	}
	return submenu;
}

function submenu_Getposition(menu, preview) {
	if(typeof preview == 'undefined'){ preview = false; }
	var stack = preview ? submenu_obj['preview'] : submenu_obj['submenu'];
	submenu_position = submenu_Getnext(preview);
	for (var index in stack) {
		if (stack[index].menu === menu) {
			submenu_position = stack[index].layer;
		}
	}
	return submenu_position;
}

function submenu_Clean(layer, animate, preview) {
	if(typeof preview == 'undefined'){ preview = false; }
	var stack = preview ? submenu_obj['preview'] : submenu_obj['submenu'];
	if (typeof layer !== 'number' || layer < 1) {
		layer = 1;
	}
	if(typeof animate === 'undefined'){ animate = false; }
	for (var index in stack) {
		if (stack[index].layer >= layer) {
			stack[index].Hide(animate);
		}
	}
}

function submenu_Build(menu, next, hide, param, preview, animate) {
	setTimeout(function(menu, next, hide, param, preview, animate){
		submenu_Build_return(menu, next, hide, param, preview, animate);
	}, 20, menu, next, hide, param, preview, animate);
}

function submenu_Build_return(menu, next, hide, param, preview, animate) {
	if (typeof next === 'undefined') { next = 1; }
	if (typeof hide === 'undefined') { hide = true; }
	if (typeof param === 'undefined') { param = null; }
	if (typeof preview != 'boolean') { preview = false; }
	if (typeof animate != 'boolean') { animate = true; }
	if(responsive.test("maxMobileL")){ //By default open as a submenu if the screen is too small
		preview = false;
	}
	
	var stack = preview ? submenu_obj["preview"] : submenu_obj["submenu"];

	if(next === true){
		next = submenu_Getnext(preview);
	} else if(next === false){
		next = 1;
	} else if(next === -1){
		next = submenu_Getposition(menu, preview);
	}

	//If the tab already exists, just close it if we launch again the action
	
	if (hide) {
		for (var index in stack) {
			if (stack[index].menu == menu) {
				submenu_Clean(next, true, preview);
				return false;
			}
		}
	}

	if (menu in submenu_list) {
		if (preview) {
			var temp = new Submenu(menu, next, param, preview, animate);
			//$('#app_content_submenu_preview').parent().addClass("with_preview");
			$('#app_content_submenu_preview').addClass("with_preview");
			$('#app_content_dynamic_layers').addClass("with_preview");
			$('#app_content_submenu_preview').show();
		} else {
			var temp = new Submenu(menu, next, param, false, animate);
			$('#app_application_submenu_block').show();
			$('#app_content_dynamic').addClass('app_application_submenu_blur');
		}
		var layer = temp.layer;
		stack[layer] = temp;
		temp = null;
		return stack[layer];
	}
	return true;
}

enquire.register(responsive.minDesktop, function() {
	//The blur is hard to calculate, it creates some flickering
	if (hasGood3Dsupport && wrapper_browser('webkit') && submenu_Getnext() > 1 && $('#app_content_dynamic').hasClass('app_application_submenu_blur')) {
		$('#app_content_dynamic').velocity({ blur: 2 }, {
			mobileHA: hasGood3Dsupport,
			duration: 200,
			delay: 100,
			easing: [4],
		});
	}
});
enquire.register(responsive.maxTablet, function() {
	//The blur is hard to calculate, it creates some flickering
	if (hasGood3Dsupport && wrapper_browser('webkit') && submenu_Getnext() > 1 && $('#app_content_dynamic').hasClass('app_application_submenu_blur')) {
		$('#app_content_dynamic').velocity({ blur: 0 }, {
			mobileHA: hasGood3Dsupport,
			duration: 200,
			delay: 100,
			easing: [4],
		});
	}
});

function submenu_content_block_hide(preview) {
	//submenu_show
	var stack = preview ? submenu_show['preview'] : submenu_show['submenu'];
	for (var i in stack) {
		if (stack[i]) {
			return true;
		}
	}
	if (preview) {
		//$('#app_content_submenu_preview').parent().removeClass("with_preview");
		$('#app_content_submenu_preview').removeClass("with_preview");
			$('#app_content_dynamic_layers').removeClass("with_preview");
	} else {
		$('#app_application_submenu_block').hide();
	}
}

jQuery.prototype.submenu_getWrapper = function(){
	var wrapper = $(this).closest('.submenu_wrapper');
	if(wrapper.length > 0 && wrapper[0].id){
		var subm = submenu_getById(wrapper[0].id);
		if(subm){
			return [subm, wrapper];
		}
	}
	return false;
}

function submenu_content_unblur() {
	// This method is only called by submenu, not preview
	//submenu_show
	var stack = submenu_show['submenu'];
	for (var i in stack) {
		if (stack[i]) {
			return true;
		}
	}
	$('#app_content_dynamic').removeClass('app_application_submenu_blur');
	//The blur is hard to calculate, it creates some flickering
	//Checking animate helps only to know if we pushed the button close
	if (hasGood3Dsupport && wrapper_browser('webkit')) {
		$('#app_content_dynamic').velocity({ blur: 0 }, {
			mobileHA: hasGood3Dsupport,
			duration: 100,
			delay: 100,
			easing: [1],
		});
	}
}
submenu_content_unblur();

function submenu_wrapper_width() {
	var width = Math.floor($('#app_application_content').width()/3);
	$('#app_application_submenu_block .submenu_wrapper').css('width', width);
}
submenu_wrapper_width();
var submenu_wrapper_width_timer;
$(window).resize(function(){
	clearTimeout(submenu_wrapper_width_timer);
	submenu_wrapper_width_timer = setTimeout(submenu_wrapper_width, wrapper_timeout_timer);
});

var submenu_form_cb_success = function(msg, err, status, data) {
	var field = 'undefined';
	submenu_form_cb_hide_progress();
	if (err) {
		if (wrapper_objForm) {
			if (typeof data.field === 'string') { field = data.field; }
			base_form_field_show_error(wrapper_objForm.find("[name=" + field + "]"));
			wrapper_objForm.find("[name=" + field + "]").focus();
		}
	} else {
		storage_cb_success(msg, err, status, data);
		//No need to call "storage_cb_success", it's called internally by "wrapper_ajax"
		submenu_Hideall();
	}
};

var submenu_form_cb_error = function(xhr_err, ajaxOptions, thrownError) {
	var msgtp = Lincko.Translation.get('wrapper', 1, 'html'); //Communication error
	submenu_form_cb_hide_progress();
	//base_show_error(msgtp); //Keep it hidden to avoid showing "communication error"
};

var submenu_form_cb_begin = function() {
	$(document.body).css('cursor', 'progress');
	if (wrapper_objForm) {
		var submit_progress_bar = wrapper_objForm.parent().find("[find=submit_progress_bar]");
		base_form_field_hide_error();
		base_format_form_single(submit_progress_bar);
		submit_progress_bar.css("display", "block");
		submit_progress_bar.removeClass('display_none');
	}
};

var submenu_form_cb_complete = function() {
	$(document.body).css('cursor', '');
	submenu_form_cb_hide_progress();
};

var submenu_form_cb_hide_progress = function() {
	if (wrapper_objForm) {
		var submit_progress_bar = wrapper_objForm.parent().find("[find=submit_progress_bar]");
		base_format_form_single(submit_progress_bar);
		submit_progress_bar.addClass('display_none');
	}
}

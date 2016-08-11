var submenu_zindex = {
	false: 2000,
	true: 1000,
};
var submenu_obj = {
	'submenu': {
		'mouseenter': false,
	},
	'preview': {
		'mouseenter': false,
	},
};
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

	title_left_button: function(subm) {
		subm.Add_TitleLeftButton();
	},

	title_right_button: function(subm) {
		subm.Add_TitleRightButton();
	},

	customized_title: function(subm) {
		subm.Add_CustomisedTitle();
	},

	button: function(subm, position) {
		subm.Add_MenuButton(position);
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
	var tmp = Elem.outAnimation;
	var stack = Elem.preview ? submenu_obj['preview'] : submenu_obj['submenu'];
	Elem.outAnimation = stack[Elem.layer].outAnimation;
	stack[Elem.layer].outAnimation = tmp;
}


function Submenu(menu, next, param, preview) {
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

	//The creation of new submenu with MD5 seems to lead to a Memory leak
	//this.id = this.layer+"_submenu_wrapper_"+md5(Math.random());

	//The creation or reuse of HTML element seems to have some display problem, and DIV deletion issue
	this.id = this.layer + "_submenu_wrapper_" + menu + "_" + this.preview;

	this.zIndex = submenu_zindex[this.preview] + this.layer;
	this.display = true;
	this.prefix = false;
	this.attribute = null;

	function Constructor(Elem) {
		Elem.changeState();
		//First we have to empty the element if it exists

		submenu_Clean(Elem.layer, false, Elem.preview);

		var submenu_wrapper = $('#-submenu_wrapper').clone();
		if($('#'+Elem.id).length>0){
			$('#'+Elem.id).remove();
		}
		submenu_wrapper.prop("id", Elem.id);
		if(Elem.preview){
			submenu_wrapper.addClass('submenu_wrapper_preview');
		}
		//Back button
		submenu_wrapper.on('click', "[find=submenu_wrapper_back]", function() {
			submenu_Clean(Elem.layer, true, Elem.preview);
		});
		submenu_wrapper.css('z-index', Elem.zIndex);
		//Do not not add "overthrow" in twig template, if not the scrollbar will not work
		submenu_wrapper.find("[find=submenu_wrapper_content]").addClass('overthrow').prop("id", "overthrow_"+Elem.id);
		//This is because we can only place 3 menus on Desktop mode, so after 3 layers we switch to full width mode
		if (Elem.layer > 3) { submenu_wrapper.addClass('submenu_wrapper_important'); }

		if (Elem.preview) {
			submenu_wrapper.appendTo('#app_content_submenu_preview');
			submenu_wrapper.mouseenter(function(){
				submenu_obj['preview']['mouseenter'] = true;
			});
			submenu_wrapper.mouseleave(function(){
				submenu_obj['preview']['mouseenter'] = false;
			});
		} else {
			submenu_wrapper.appendTo('#app_application_submenu_block');
			submenu_wrapper.mouseenter(function(){
				submenu_obj['submenu']['mouseenter'] = true;
			});
			submenu_wrapper.mouseleave(function(){
				submenu_obj['submenu']['mouseenter'] = false;
			});
		}
		/*submenu_wrapper.click(function(e){
			e.stopPropagation();
		});*/

		//Launch Pre action
		for (var att in Elem.obj) {
			Elem.attribute = Elem.obj[att];
			if ("style" in Elem.attribute && Elem.attribute.style == "preAction" && "action" in Elem.attribute) {
				if (typeof Elem.attribute.action === "function") {
					Elem.attribute.action(Elem);
				}
			}
		}
		//Build the page
		for (var att in Elem.obj) {
			Elem.attribute = Elem.obj[att];
			if ("style" in Elem.attribute && "title" in Elem.attribute) {
				if (typeof Submenu_select[Elem.attribute.style] === "function") {
					Submenu_select[Elem.attribute.style](Elem);
				}
			}
		}
		//Launch Post action
		for (var att in Elem.obj) {
			Elem.attribute = Elem.obj[att];
			if ("style" in Elem.attribute && Elem.attribute.style == "postAction" && "action" in Elem.attribute) {
				if (typeof Elem.attribute.action === "function") {
					Elem.attribute.action(Elem);
				}
			}
		}

		if (Elem.display) {
			Elem.Show(true);
		} else {
			Elem.Hide();
		}
		if (Elem.prefix) {
			base_format_form(Elem.prefix);
		}
		wrapper_IScroll();
		//Free memory
		delete submenu_wrapper;
	}
	Constructor(this);
}

Submenu.prototype.Add_MenuTitle = function() {
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
		attribute.now(this, Elem);
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
	delete submenu_wrapper;
	return Elem;
}

Submenu.prototype.Add_TitleSmall = function() {
	var attribute = this.attribute;
	var submenu_wrapper = this.Wrapper();
	var Elem = $('#-submenu_title_small').clone();
	Elem.prop("id", '');
	Elem.find("[find=submenu_title]").html(attribute.title);
	if ("class" in attribute) {
		Elem.addClass(attribute['class']);
	}
	if ("now" in attribute && typeof attribute.now === "function") {
		attribute.now(this, Elem);
	}
	submenu_wrapper.find("[find=submenu_wrapper_content]").append(Elem);
	//Free memory
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
		if ("action_param" in attribute) {
			Elem.click(function(){
				attribute.action(this, that, attribute.action_param);
			});
		} else {
			Elem.click(function(){
				attribute.action(this, that);
			});
		}
	}
	if ("hide" in attribute) {
		if (attribute.hide) {
			Elem.click(function() {
				submenu_Clean(that.layer, false, that.preview);
			});
		}
	}
	Elem.addClass("submenu_top_side_left");
	if ("class" in attribute) {
		Elem.addClass(attribute['class']);
	}
	Elem.css('text-align', 'left');
	if ("now" in attribute && typeof attribute.now == "function") {
		attribute.now(this, Elem);
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
		if ("action_param" in attribute) {
			Elem.click(function(){
				attribute.action(this, that, attribute.action_param);
			});
		} else {
			Elem.click(function(){
				attribute.action(this, that);
			});
		}
	}
	if ("hide" in attribute) {
		if (attribute.hide) {
			Elem.click(function() {
				submenu_Clean(that.layer, false, that.preview);
			});
		}
	}
	Elem.addClass("submenu_top_side_right");
	if ("class" in attribute) {
		Elem.addClass(attribute['class']);
	}
	Elem.css('text-align', 'right');
	if ("now" in attribute && typeof attribute.now == "function") {
		attribute.now(this, Elem);
	}
	this.Wrapper().find("[find=submenu_wrapper_top]").append(Elem);
	return Elem;
};

Submenu.prototype.Add_MenuButton = function(position) {
	var attribute = this.attribute;
	var Elem = $('#-submenu_button').clone();
	var preview = this.preview;
	Elem.prop("id", '');
	Elem.find("[find=submenu_button_title]").html(attribute.title);
	if ("value" in attribute) {
		Elem.find("[find=submenu_button_value]").html(attribute.value);
	}
	if ("action" in attribute) {
		if ("action_param" in attribute) {
			Elem.click(attribute.action_param, attribute.action);
		} else {
			Elem.click(attribute.action);
		}
	}
	if ("hide" in attribute) {
		if (attribute.hide) {
			Elem.click(function() {
				//submenu_Hideall(preview); //We should not close all tabs
				submenu_Clean(this.layer, false, that.preview);
			});
		}
	}
	if ("class" in attribute) {
		Elem.addClass(attribute['class']);
	}
	if ("now" in attribute && typeof attribute.now === "function") {
		attribute.now(this, Elem);
	}
	if (!position) {
		this.Wrapper().find("[find=submenu_wrapper_content]").append(Elem);
	}
	else {
		position.append(Elem);
	}
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
		attribute.now(this, Elem);
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
		if ("action_param" in attribute) {
			Elem.click(function(){
				attribute.action(Elem, that, attribute.action_param);
			});
		} else {
			Elem.click(function(){
				attribute.action(Elem, that);
			});
		}
	}
	if ("hide" in attribute) {
		if (attribute.hide) {
			Elem.click(function() {
				//submenu_Hideall(this.preview);
				submenu_Clean(this.layer, false, that.preview);
			});
		}
	}

	if ("class" in attribute) {
		Elem.addClass(attribute['class']);
	}
	if ("now" in attribute && typeof attribute.now === "function") {
		attribute.now(this, Elem);
	}
	this.Wrapper().find("[find=submenu_wrapper_content]").append(Elem);
	return Elem;
};

Submenu.prototype.Add_InputHidden = function() {
	var attribute = this.attribute;
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
		attribute.now(this, Elem);
	}
	this.Wrapper().find("[find=submenu_wrapper_content]").append(Elem);
	return Elem;
};

Submenu.prototype.Add_InputText = function() {
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
		attribute.now(this, Elem);
	}
	this.Wrapper().find("[find=submenu_wrapper_content]").append(Elem);
	return Elem;
};

Submenu.prototype.Add_InputTextarea = function() {
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
		attribute.now(this, Elem);
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
			}, submenu_list[attribute.next])
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
		attribute.now(this, Elem);
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
		attribute.now(this, Elem);
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
				submenu_Clean(this.layer, false, that.preview);
			});
		}
	}
	submenu_wrapper.find("[find=submenu_wrapper_content]").wrap(ElemForm);
	//Free memory
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
	delete submenu_wrapper;
	return ElemForm;
};

Submenu.prototype.Add_MenuBottomButton = function() {
	var attribute = this.attribute;
	var submenu_wrapper = this.Wrapper();
	var Elem = $('#-submenu_bottom').clone();
	Elem.prop("id", '');
	submenu_wrapper.find("[find=submenu_wrapper_bottom]").addClass('submenu_bottom');
	if ("action" in attribute) {
		if ("action_param" in attribute) {
			Elem.find("[find=submenu_bottom_button]").click(attribute.action_param, attribute.action);
		} else {
			Elem.find("[find=submenu_bottom_button]").click(attribute.action);
		}
	}
	if ("hide" in attribute) {
		if (attribute.hide) {
			Elem.find("[find=submenu_bottom_button]").click(function() {
				submenu_Clean(this.layer, false, that.preview);
			});
		}
	}
	Elem.find('img').remove();
	Elem.find("[find=submenu_bottom_title]").html(attribute.title);
	if ("class" in attribute) {
		Elem.addClass(attribute['class']);
	}
	if ("now" in attribute && typeof attribute.now === "function") {
		attribute.now(this, Elem);
	}
	if (submenu_wrapper.find("[find=submenu_wrapper_bottom]").find(".submenu_bottom_cell").length == 0) {
		submenu_wrapper.find("[find=submenu_wrapper_bottom]").html(wrapper_to_html(Elem));
	} else {
		submenu_wrapper.find("[find=submenu_wrapper_bottom]").find(".submenu_bottom_cell").append(Elem.children());
	}
	//Free memory
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
	var submenu_wrapper = this.Wrapper();
	var that = this;
	$('#' + that.id).css('width', '33.33%');
	if(!animate){
		$('#' + that.id).hide().show(0);
		submenu_wrapper.find("[find=submenu_wrapper_content]").focus();
		//The line below avoid a bug in Chrome that could make the scroll unavailable in some areas
		submenu_wrapper.hide().show(0);
		app_application_submenu_position();
		submenu_resize_content();
		submenu_content_unblur();
		submenu_wrapper_width();
		that.FocusForm();
		$(window).resize();
		var sub_that = that;
		setTimeout(function(){ app_application_lincko.prepare(["submenu_show", "submenu_show_"+sub_that.preview+"_"+sub_that.id], true); }, 1);
	} else if (responsive.test("minDesktop")) {
		if (that.layer <= 3) { submenu_wrapper.css('z-index', submenu_zindex[this.preview]); } //This insure for the 1/3 version to go below the previous one
		submenu_wrapper.velocity(
			"transition.slideLeftBigIn", {
				duration: time,
				delay: delay,
				easing: [.38, .1, .13, .9],
				begin: function() {
					$('#' + that.id).hide().show(0);
					submenu_resize_content();
					if (responsive.test("minDesktop")) {
						//The blur is hard to calculate, it creates some flickering
						if (wrapper_browser('webkit')) {
							$('#app_content_dynamic').velocity({ blur: 2 }, {
								duration: time,
								delay: delay,
								easing: [4],
							});
						}
					}
				},
				complete: function() {
					submenu_wrapper.find("[find=submenu_wrapper_content]").focus();
					//The line below avoid a bug in Chrome that could make the scroll unavailable in some areas
					submenu_wrapper.hide().show(0);
					submenu_wrapper.css('z-index', that.zIndex);
					app_application_submenu_position();
					submenu_resize_content();
					submenu_content_unblur();
					submenu_wrapper_width();
					that.FocusForm();
					$(window).resize();
					var sub_that = that;
					setTimeout(function(){ app_application_lincko.prepare(["submenu_show", "submenu_show_"+sub_that.preview+"_"+sub_that.id], true); }, 1);
				}
			}
		);
	} else {
		var animation = "bruno.expandIn";
		if (submenu_Getnext() >= 2) {
			animation = "bruno.slideRightBigIn";
		}
		submenu_wrapper.velocity(
			animation, {
				duration: Math.floor(1.5 * time),
				delay: delay,
				easing: [.38, .1, .13, .9],
				begin: function() {
					$('#' + that.id).hide().show(0);
					submenu_resize_content();
				},
				complete: function() {
					submenu_wrapper.find("[find=submenu_wrapper_content]").focus();
					//The line below avoid a bug in Chrome that could make the scroll unavailable in some areas
					submenu_wrapper.hide().show(0);
					app_application_submenu_position();
					submenu_resize_content();
					submenu_content_unblur();
					submenu_wrapper_width();
					that.FocusForm();
					$(window).resize();
					var sub_that = that;
					setTimeout(function(){ app_application_lincko.prepare(["submenu_show", "submenu_show_"+sub_that.preview+"_"+sub_that.id], true); }, 1);
				}
			}
		);
	}
	delete submenu_wrapper;
}

Submenu.prototype.showPreview = function(time, delay, animate) {
	if(typeof time == 'undefined'){ time = 200; }
	if(typeof delay == 'undefined'){ delay = 60; }
	if(typeof animate == 'undefined'){ animate = false; }
	var submenu_wrapper = this.Wrapper();
	var that = this;
	var animation;
	if(!animate){
		$('#' + that.id).hide().show(0);
		submenu_wrapper.find("[find=submenu_wrapper_content]").focus();
		//The line below avoid a bug in Chrome that could make the scroll unavailable in some areas
		submenu_wrapper.hide().show(0);
		submenu_wrapper.css('z-index', that.zIndex);
		app_application_submenu_position();
		submenu_resize_content();
		that.FocusForm();
		$(window).resize();
		var sub_that = that;
		setTimeout(function(){ app_application_lincko.prepare(["submenu_show", "submenu_show_"+sub_that.preview+"_"+sub_that.id], true); }, 1);
	} else if (responsive.test("minDesktop")) {
		animation = animation_map_preview[this.inAnimation]['desktop'];
		submenu_wrapper.velocity("stop", true).velocity(
			animation, {
				duration: time,
				delay: delay,
				easing: [.38, .1, .13, .9],
				begin: function() {
					$('#' + that.id).hide().show(0);
					submenu_resize_content();
				},
				complete: function() {
					submenu_wrapper.find("[find=submenu_wrapper_content]").focus();
					//The line below avoid a bug in Chrome that could make the scroll unavailable in some areas
					submenu_wrapper.hide().show(0);
					submenu_wrapper.css('z-index', that.zIndex);
					app_application_submenu_position();
					submenu_resize_content();
					that.FocusForm();
					$(window).resize();
					var sub_that = that;
					setTimeout(function(){ app_application_lincko.prepare(["submenu_show", "submenu_show_"+sub_that.preview+"_"+sub_that.id], true); }, 1);
				}
			}
		);
	} else {
		animation = animation_map_preview[this.inAnimation]['mobile'];
		submenu_wrapper.velocity("stop", true).velocity(
			animation, {
				duration: Math.floor(1.5 * time),
				delay: delay,
				easing: [.38, .1, .13, .9],
				begin: function() {
					$('#' + that.id).hide().show(0);
					submenu_resize_content();
				},
				complete: function() {
					submenu_wrapper.find("[find=submenu_wrapper_content]").focus();
					//The line below avoid a bug in Chrome that could make the scroll unavailable in some areas
					submenu_wrapper.hide().show(0);
					app_application_submenu_position();
					submenu_resize_content();
					that.FocusForm();
					$(window).resize();
					var sub_that = that;
					setTimeout(function(){ app_application_lincko.prepare(["submenu_show", "submenu_show_"+sub_that.preview+"_"+sub_that.id], true); }, 1);
				}
			}
		);
	}
	delete submenu_wrapper;
}

Submenu.prototype.Show = function(animate) {
	if(typeof animate == 'undefined'){ animate = false; }
	if(responsive.test("maxTablet")){ animate = false; } //toto => the animation seems slow on mobile, disallow velocity
	var that = this;
	var time = 200;
	var delay = 60;
	var stack = this.preview ? submenu_show['preview'] : submenu_show['submenu'];
	if (typeof stack[this.id] !== 'boolean' || !stack[this.id]) {
		stack[this.id] = true;
		if (this.preview) {
			this.showPreview(time, delay, animate);
		} else {
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
		app_application_lincko.prepare(["submenu_hide", "submenu_hide_"+that.preview+"_"+that.id], true);
		that.Remove();
	} else if (responsive.test("minDesktop")) {
		if (that.layer <= 3) { submenu_wrapper.css('z-index', submenu_zindex[this.preview]); } //This insure for the 1/3 version to go below the previous one
		submenu_wrapper.velocity(
			"transition.slideLeftBigOut", {
				duration: time,
				delay: delay,
				easing: [.38, .1, .13, .9],
				complete: function() {
					app_application_lincko.prepare(["submenu_hide", "submenu_hide_"+that.preview+"_"+that.id], true);
					that.Remove();
				}
			}
		);
	} else {
		var animation = "bruno.expandOut";
		if (submenu_Getnext() > 2) {
			animation = "bruno.slideRightBigOut";
		}
		submenu_wrapper.velocity(
			animation, {
				duration: Math.floor(1.5 * time),
				delay: delay,
				easing: [.38, .1, .13, .9],
				complete: function() {
					app_application_lincko.prepare(["submenu_hide", "submenu_hide_"+that.preview+"_"+that.id], true);
					that.Remove();
				}
			}
		);
	}
	//Free memory
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
		app_application_lincko.prepare(["submenu_hide", "submenu_hide_"+that.preview+"_"+that.id], true);
		that.Remove();
	} else if (responsive.test("minDesktop")) {
		animation = animation_map_preview[this.outAnimation]['desktop'];
		submenu_wrapper.velocity("stop", true).velocity(
			animation, {
				duration: time,
				delay: delay,
				easing: [.38, .1, .13, .9],
				complete: function() {
					app_application_lincko.prepare(["submenu_hide", "submenu_hide_"+that.preview+"_"+that.id], true);
					that.Remove();
				}
			}
		);
	} else {
		animation = animation_map_preview[this.outAnimation]['mobile'];
		submenu_wrapper.velocity("stop", true).velocity(
			animation, {
				duration: Math.floor(1.5 * time),
				delay: delay,
				easing: [.38, .1, .13, .9],
				complete: function() {
					app_application_lincko.prepare(["submenu_hide", "submenu_hide_"+that.preview+"_"+that.id], true);
					that.Remove();
				}
			}
		);
	}
	//Free memory
	delete submenu_wrapper;
}

Submenu.prototype.Hide = function(animate) {
	if(typeof animate == 'undefined'){ animate = false; }
	if(responsive.test("maxTablet")){ animate = false; } //toto => the animation seems slow on mobile, disallow velocity
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
	if (this.preview) {
		this.hidePreview(time, delay, animate);
	} else {
		this.hideSubmenu(time, delay, animate);
	}
	$(document).trigger("submenuHide");
};

// http://stackoverflow.com/questions/19469881/javascript-remove-all-event-listeners-of-specific-type
Submenu.prototype.Remove = function() {
	var stack = this.preview ? submenu_obj["preview"] : submenu_obj["submenu"];
	$('#' + this.id).hide().remove();
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
		wrapper_IScroll();
	}
	return true;
}

var submenu_resize_content_timer;
$(window).resize(function(){
	clearTimeout(submenu_resize_content_timer);
	submenu_resize_content_timer = setTimeout(submenu_resize_content, wrapper_timeout_timer*2);
});

function submenu_Hideall(preview) {
	if(typeof preview == 'undefined'){ preview = false; }
	var stack = preview ? submenu_obj['preview'] : submenu_obj['submenu'];
	for (var index in stack) {
		submenu_Clean(true, false, preview);
	}
}

//Return the next layer to display full screen
function submenu_Getfull(preview) {
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

function submenu_Getposition(menu, preview) {
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

function submenu_Build(menu, next, hide, param, preview) {
	if (typeof next === 'undefined') { next = 1; }
	if (typeof hide === 'undefined') { hide = true; }
	if (typeof param === 'undefined') { param = null; }
	if (typeof preview != 'boolean') { preview = false; }
	if(responsive.test("maxMobileL")){ //By default open as a submenu if the screen is too small
		preview = false;
	}
	
	var stack = preview ? submenu_obj["preview"] : submenu_obj["submenu"];

	if(next === true){
		next = submenu_Getnext(preview);
	} else if(next === false){
		next = 1;
	}

	//If the tab already exists, just close it if we launch again the action
	if (hide) {
		for (var index in stack) {
			if (stack[index].menu === menu) {
				submenu_Clean(next, true, preview);
				return false;
			}
		}
	}

	if (menu in submenu_list) {
		if (preview) {
			var temp = new Submenu(menu, next, param, preview);
			$('#app_content_submenu_preview').parent().addClass("with_preview");
			$('#app_content_submenu_preview').show();
		} else {
			var temp = new Submenu(menu, next, param);
			$('#app_application_submenu_block').show();
			$('#app_content_dynamic').addClass('app_application_submenu_blur');
		}
		stack[temp.layer] = temp;
		temp = null;
	}
	return true;
}

enquire.register(responsive.minDesktop, function() {
	//The blur is hard to calculate, it creates some flickering
	if (wrapper_browser('webkit') && submenu_Getnext() > 1 && $('#app_content_dynamic').hasClass('app_application_submenu_blur')) {
		$('#app_content_dynamic').velocity({ blur: 2 }, {
			duration: 200,
			delay: 100,
			easing: [4],
		});
	}
});
enquire.register(responsive.maxTablet, function() {
	//The blur is hard to calculate, it creates some flickering
	if (wrapper_browser('webkit') && submenu_Getnext() > 1 && $('#app_content_dynamic').hasClass('app_application_submenu_blur')) {
		$('#app_content_dynamic').velocity({ blur: 0 }, {
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
		$('#app_content_submenu_preview').parent().removeClass("with_preview");
	} else {
		$('#app_application_submenu_block').hide();
	}
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
	if (wrapper_browser('webkit')) {
		$('#app_content_dynamic').velocity({ blur: 0 }, {
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
		submit_progress_bar.show();
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
		submit_progress_bar.css("display", "none");
		submit_progress_bar.hide();
	}
}

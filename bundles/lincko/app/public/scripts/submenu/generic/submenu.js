console.log("loaded submenu");
var submenu_zindex = 2000;
var submenu_obj = {'submenu':{}, 'preview':{}};
var submenu_show = {'submenu':{}, 'preview':{}};

var Submenu_select = {
	
	prefix: function(Elem){
		Elem.prefix = Elem.attribute.title;
	},

	title: function(Elem){
		Elem.Add_MenuTitle();
	},

	button: function(Elem){
		Elem.Add_MenuButton();
	},

	next: function(Elem){
		Elem.Add_MenuNext();
	},

	radio: function(Elem){
		Elem.Add_MenuRadio();
	},

	form: function(Elem){
		if(!Elem.prefix){ Elem.prefix = ''; }
		Elem.Add_MenuForm();
	},

	form_button: function(Elem){
		if(!Elem.prefix){ Elem.prefix = ''; }
		Elem.Add_MenuFormButton();
	},

	title_small: function(Elem){
		Elem.Add_TitleSmall();
	},

	input_hidden: function(Elem){
		Elem.Add_InputHidden();
	},

	input_text: function(Elem){
		Elem.Add_InputText();
	},

	input_textarea: function(Elem){
		Elem.Add_InputTextarea();
	},
	
	select_multiple: function(Elem){
		Elem.Add_SelectMultiple();
	},

}

function Submenu(menu, next, param, preview) {
	this.obj = submenu_list[menu];
	this.menu = menu;
	this.layer = 1;
	this.preview = preview ?true: false;
	if(typeof next === 'number'){
		if(next === 0){
			this.layer = submenu_Getfull(preview);
		} else {
			this.layer = next;
		}
	} else if(typeof next !== 'undefined' && next === true){
		this.layer = submenu_Getposition(menu, preview);
	}
	if(typeof param === 'undefined'){
		this.param = null;
	} else {
		this.param = param;
	}
	
	//The creation of new submenu with MD5 seems to lead to a Memory leak
	//this.id = this.layer+"_submenu_wrapper_"+md5(Math.random());
	
	//The creation or reuse of HTML element seems to have some display problem, and DIV deletion issue
	this.id = this.layer+"_submenu_wrapper_"+menu;
	
	this.zIndex = submenu_zindex+this.layer;
	this.display = true;
	this.prefix = false;
	this.attribute = null;
	var self = this;
	function Constructor(Elem){
		//First we have to empty the element if it exists

		submenu_Clean(Elem.layer, false, preview);

		submenu_wrapper = $('#-submenu_wrapper').clone();
		submenu_wrapper.prop("id",Elem.id);
		//Back button
		submenu_wrapper.find("[find=submenu_wrapper_back]").click(function(){
			submenu_Clean(Elem.layer, true, self.preview);
		});
		submenu_wrapper.css('z-index', Elem.zIndex);
		//Do not not add "overthrow" in twig template, if not the scrollbar will not work
		submenu_wrapper.find("[find=submenu_wrapper_content]").addClass('overthrow');
		//This is because we can only place 3 menus on Desktop mode, so after 3 layers we switch to full width mode
		if(Elem.layer>3) { submenu_wrapper.addClass('submenu_wrapper_important'); }
		if (preview) {
			submenu_wrapper.insertBefore('#app_content_submenu_preview .end_submenu');
		}
		else {
			submenu_wrapper.insertBefore('#app_application_submenu_block .end_submenu');
		}
		for(var att in Elem.obj){
			Elem.attribute = Elem.obj[att];
			if("style" in Elem.attribute && "title" in Elem.attribute){
				if(typeof Submenu_select[Elem.attribute.style] === "function"){
					Submenu_select[Elem.attribute.style](Elem);
				}
			}
		}
		if(Elem.display){
			Elem.Show();
		} else {
			Elem.Hide();
		}
		if(Elem.prefix){
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
	submenu_wrapper = this.Wrapper();
	submenu_wrapper.find("[find=submenu_wrapper_title]").html(attribute.title);
	//Free memory
	delete submenu_wrapper;
	return true;
};

Submenu.prototype.Add_TitleSmall = function() {
	var attribute = this.attribute;
	submenu_wrapper = this.Wrapper();
	var Elem = $('#-submenu_title_small').clone();
	Elem.prop("id", '');
	Elem.find("[find=submenu_title]").html(attribute.title);
	if("class" in attribute){
		Elem.addClass(attribute['class']);
	}
	if("now" in attribute && typeof attribute.now === "function"){
		attribute.now(this, Elem);
	}
	submenu_wrapper.find("[find=submenu_wrapper_content]").append(Elem);
	//Free memory
	delete submenu_wrapper;
	return true;
};

Submenu.prototype.Add_MenuButton = function() {
	var attribute = this.attribute;
	var Elem = $('#-submenu_button').clone();
	Elem.prop("id", '');
	Elem.find("[find=submenu_button_title]").html(attribute.title);
	if("value" in attribute){
		Elem.find("[find=submenu_button_value]").html(attribute.value);
	}
	if("hide" in attribute){
		if(attribute.hide) {
			Elem.click(function(){ submenu_Hideall(this.preview); });
		}
	}
	if("action" in attribute){
		if("action_param" in attribute){
			Elem.click(attribute.action_param, attribute.action);
		} else {
			Elem.click(attribute.action);
		}
	}
	if("class" in attribute){
		Elem.addClass(attribute['class']);
	}
	if("now" in attribute && typeof attribute.now === "function"){
		attribute.now(this, Elem);
	}
	this.Wrapper().find("[find=submenu_wrapper_content]").append(Elem);
	return true;
};

Submenu.prototype.Add_MenuNext = function() {
	var attribute = this.attribute;
	var Elem = $('#-submenu_next').clone();
	var that = this;
	Elem.prop("id", '');
	if("value" in attribute){
		Elem.find("[find=submenu_next_value]").html(attribute.value);
	}
	if("next" in attribute){
		if(attribute.next in submenu_list){
			if(attribute.style=="title"){
				Elem.Add_MenuTitle(attribute);
			}
			for(var att in submenu_list[attribute.next]){
				next_attribute = submenu_list[attribute.next][att];
				if("style" in next_attribute && "title" in next_attribute){
					if(next_attribute.style == "title"){
						attribute.title = next_attribute.title;
					}
				}
			}
			$("<img class='submenu_icon submenu_icon_next' src='/lincko/app/images/submenu/next.png' />").appendTo(Elem.find("[find=submenu_next_value]"));
			Elem.click(function(){
				$.each(that.Wrapper().find('.submenu_deco_next'), function() {
					$(this).removeClass('submenu_deco_next');
				});
				if(submenu_Build(attribute.next, that.layer+1)){
					$(this).addClass('submenu_deco_next');
				}
				
			});
		}
	}
	Elem.find("[find=submenu_next_title]").html(attribute.title);
	if("class" in attribute){
		Elem.addClass(attribute['class']);
	}
	if("now" in attribute && typeof attribute.now === "function"){
		attribute.now(this, Elem);
	}
	this.Wrapper().find("[find=submenu_wrapper_content]").append(Elem);
	return true;
};

Submenu.prototype.Add_MenuRadio = function() {
	var attribute = this.attribute;
	var Elem = $('#-submenu_radio').clone();
	var selected = false;
	Elem.prop("id", '');
	Elem.find("[find=submenu_radio_title]").html(attribute.title);
	if("selected" in attribute){
		if(attribute.selected){
			selected = true;
			Elem.find("[find=submenu_radio_value]").html("<img class='submenu_icon' src='/lincko/app/images/submenu/check.png' />");
			Elem.addClass('submenu_deco_info');
		}
	}
	if("hide" in attribute){
		if(attribute.hide) {
			Elem.click(function(){ submenu_Hideall(this.preview); });
		}
	}
	if(!selected){
		if("action" in attribute){
			if("action_param" in attribute){
				Elem.click(attribute.action_param, attribute.action);
			} else {
				Elem.click(attribute.action);
			}
		}
	}
	if("class" in attribute){
		Elem.addClass(attribute['class']);
	}
	if("now" in attribute && typeof attribute.now === "function"){
		attribute.now(this, Elem);
	}
	this.Wrapper().find("[find=submenu_wrapper_content]").append(Elem);
	return true;
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
	if("value" in attribute){
		Elem.find("[find=submenu_input]").prop('value', attribute.value);
	}
	if("class" in attribute){
		Elem.addClass(attribute['class']);
	}
	if("now" in attribute && typeof attribute.now === "function"){
		attribute.now(this, Elem);
	}
	this.Wrapper().find("[find=submenu_wrapper_content]").append(Elem);
	return true;
};

Submenu.prototype.Add_InputText = function() {
	var attribute = this.attribute;
	var Elem = $('#-submenu_input').clone();
	var Input = $('<input type="text" find="submenu_input" />');
	Elem.prop("id", '');
	Elem.find("[find=submenu_title]").html(attribute.title);
	Elem.prop('for', attribute.name);
	Input.prop('name', attribute.name);	
	Elem.append(Input);
	if("value" in attribute){
		Elem.find("[find=submenu_input]").prop('value', attribute.value);
	}
	if("class" in attribute){
		Elem.addClass(attribute['class']);
	}
	if("now" in attribute && typeof attribute.now === "function"){
		attribute.now(this, Elem);
	}
	this.Wrapper().find("[find=submenu_wrapper_content]").append(Elem);
	return true;
};

Submenu.prototype.Add_InputTextarea = function() {
	var attribute = this.attribute;
	var Elem = $('#-submenu_input').clone();
	var Value = '';
	if("value" in attribute){
		Value = attribute.value;
	}
	var Input = $('<textarea>'+Value+'</textarea>');
	Elem.prop("id", '');
	Elem.find("[find=submenu_title]").html(attribute.title);
	Elem.prop('for', attribute.name);
	Input.prop('name', attribute.name);
	Elem.append(Input);
	if("class" in attribute){
		Elem.addClass(attribute['class']);
	}
	if("now" in attribute && typeof attribute.now === "function"){
		attribute.now(this, Elem);
	}
	this.Wrapper().find("[find=submenu_wrapper_content]").append(Elem);
	return true;
};

Submenu.prototype.Add_SelectMultiple = function() {
	var attribute = this.attribute;
	var Elem = $('#-submenu_select').clone();
	var that = this;
	var Num = 0;
	Elem.prop("id", '');
	if("value" in attribute){
		Elem.find("[find=submenu_select_value]").html(attribute.value);
	}
	if("next" in attribute){
		if(attribute.next in submenu_list){
			if(attribute.style=="title"){
				Elem.Add_MenuTitle(attribute);
			}
			for(var att in submenu_list[attribute.next]){
				next_attribute = submenu_list[attribute.next][att];
				if("style" in next_attribute && "title" in next_attribute){
					if(next_attribute.style == "title"){
						attribute.title = next_attribute.title;
					}
				}
				if("selected" in next_attribute){
					if(next_attribute.selected){
						Num++;
					}
				}
			}
			Elem.find("[find=submenu_select_value]").html(Num);
			$("<img class='submenu_icon submenu_icon_next' src='/lincko/app/images/submenu/next.png' />").appendTo(Elem.find("[find=submenu_select_value]"));
			Elem.click(function(){
				$.each(that.Wrapper().find('.submenu_deco_next'), function() {
					$(this).removeClass('submenu_deco_next');
				});
				if(submenu_Build(attribute.next, that.layer+1)){
					$(this).addClass('submenu_deco_next');
				}
			});
		}
	}
	Elem.find("[find=submenu_select_title]").html(attribute.title);
	if("class" in attribute){
		Elem.addClass(attribute['class']);
	}
	if("now" in attribute && typeof attribute.now === "function"){
		attribute.now(this, Elem);
	}
	this.Wrapper().find("[find=submenu_wrapper_content]").append(Elem);
	return true;
};

Submenu.prototype.Add_MenuForm = function() {
	var attribute = this.attribute;
	submenu_wrapper = this.Wrapper();
	var Elem = $('#-submenu_form').clone();
	var that = this;
	Elem.prop("id", '');
	submenu_wrapper.find("[find=submenu_wrapper_bottom]").addClass('submenu_bottom');
	submenu_wrapper.find("[find=submenu_wrapper_content]").css('bottom', submenu_wrapper.find("[find=submenu_wrapper_bottom]").height());
	if("hide" in attribute){
		if(attribute.hide) {
			Elem.find("[find=submenu_form_button]").click(function(){ submenu_Hideall(this.preview); });
		}
	}
	Elem.find("[find=submenu_form_title]").html(attribute.title)
	Elem.find("[find=submenu_form_button]").click(function(){
		$('#'+that.id+'_submenu_form').submit();
	});
	if("class" in attribute){
		Elem.addClass(attribute['class']);
	}
	if("now" in attribute && typeof attribute.now === "function"){
		attribute.now(this, Elem);
	}
	if(submenu_wrapper.find("[find=submenu_wrapper_bottom]").find(".submenu_bottom_cell").length == 0){
		submenu_wrapper.find("[find=submenu_wrapper_bottom]").html(Elem); 
	} else {
		submenu_wrapper.find("[find=submenu_wrapper_bottom]").find(".submenu_bottom_cell").append(Elem.children());
	}

	var ElemForm = $("<form method='post' action='' submit='e.preventDefault(); return false;'></form>");
	ElemForm.prop("id", this.id+'_submenu_form');
	if("action" in attribute){
		ElemForm.prop("action", attribute.action);
	}
	if("submit" in attribute){
		ElemForm.on('submit', function(e) {
			e.preventDefault();
			attribute.submit(this);
		});
	}
	submenu_wrapper.find("[find=submenu_wrapper_content]").wrap(ElemForm);
	//Free memory
	delete submenu_wrapper;
	return true;
};

Submenu.prototype.Add_MenuFormButton = function() {
	var attribute = this.attribute;
	submenu_wrapper = this.Wrapper();
	var Elem = $('#-submenu_form').clone();
	Elem.prop("id", '');
	submenu_wrapper.find("[find=submenu_wrapper_bottom]").addClass('submenu_bottom');
	submenu_wrapper.find("[find=submenu_wrapper_content]").css('bottom', submenu_wrapper.find("[find=submenu_wrapper_bottom]").height());
	if("hide" in attribute){
		if(attribute.hide) {
			Elem.find("[find=submenu_form_button]").click(function(){ submenu_Hideall(this.preview); });
		}
	}
	if("action" in attribute){
		if("action_param" in attribute){
			Elem.find("[find=submenu_form_button]").click(attribute.action_param, attribute.action);
		} else {
			Elem.find("[find=submenu_form_button]").click(attribute.action);
		}
	}
	Elem.find('img').remove();
	Elem.find("[find=submenu_form_title]").html(attribute.title)
	if("class" in attribute){
		Elem.addClass(attribute['class']);
	}
	if("now" in attribute && typeof attribute.now === "function"){
		attribute.now(this, Elem);
	}
	if(submenu_wrapper.find("[find=submenu_wrapper_bottom]").find(".submenu_bottom_cell").length == 0){
		submenu_wrapper.find("[find=submenu_wrapper_bottom]").html(Elem); 
	} else {
		submenu_wrapper.find("[find=submenu_wrapper_bottom]").find(".submenu_bottom_cell").append(Elem.children());
	}
	//Free memory
	delete submenu_wrapper;
	return true;
};


Submenu.prototype.FocusForm = function(){
	var that = this;
	if(!supportsTouch){
		setTimeout(function(){
			submenu_wrapper = that.Wrapper();
			var ElemFocus = submenu_wrapper.find("input:enabled:visible:first");
			if(ElemFocus.length>=1){
				ElemFocus.focus();
				return true;
			}
			ElemFocus = submenu_wrapper.find("textarea:enabled:visible:first");
			if(ElemFocus.length>=1){
				ElemFocus.focus();
				return true;
			}
			ElemFocus = submenu_wrapper.find("select:enabled:visible:first");
			if(ElemFocus.length>=1){
				ElemFocus.focus();
				return true;
			}
		},1);
	}
};

Submenu.prototype.showSubmenu = function(time, delay) {
	var submenu_wrapper = this.Wrapper();
	var that = this;
	if(responsive.test("minDesktop")){
		if(that.layer<=3){ submenu_wrapper.css('z-index', submenu_zindex); }
		submenu_wrapper.velocity(
				"transition.slideLeftBigIn",
				{
					duration: time,
					delay: delay,
					easing: [ .38, .1, .13, .9 ],
					begin: function(){
						$('#'+that.id).hide().show(0);
						if(responsive.test("minDesktop")){
							//The blur is hard to calculate, it creates some flickering
							if(wrapper_browser('webkit')){ $('#app_content_dynamic').velocity(
								{ blur: 2 },
								{
									duration: time,
									delay: delay,
									easing: [ 4 ],
								}
							);} 
						}
					},
					complete: function(){
						submenu_wrapper.find("[find=submenu_wrapper_content]").focus();
						//The line below avoid a bug in Chrome that could make the scroll unavailable in some areas
						submenu_wrapper.hide().show(0);
						submenu_wrapper.css('z-index', that.zIndex);
						app_application_submenu_position();
						submenu_content_unblur();
						that.FocusForm();
					}
				}
			);
		} else {
			var animation = "bruno.expandIn";
			if(submenu_Getnext()>=2){
				animation = "bruno.slideRightBigIn";
			}
			submenu_wrapper.velocity(
				animation,
				{
					duration: Math.floor(1.5*time),
					delay: delay,
					easing: [ .38, .1, .13, .9 ],
					begin: function(){
						$('#'+that.id).hide().show(0);
					},
					complete: function(){
						submenu_wrapper.find("[find=submenu_wrapper_content]").focus();
						//The line below avoid a bug in Chrome that could make the scroll unavailable in some areas
						submenu_wrapper.hide().show(0);
						app_application_submenu_position();
						submenu_content_unblur();
						that.FocusForm();
					}
				}
			);
		}
}

Submenu.prototype.showPreview = function(time, delay) {
	var submenu_wrapper = this.Wrapper();
	var that = this;
	if(responsive.test("minDesktop")){
		if(that.layer<=3){ submenu_wrapper.css('z-index', submenu_zindex); }
			submenu_wrapper.velocity(
				"transition.slideLeftBigIn",
				{
					duration: time,
					delay: delay,
					easing: [ .38, .1, .13, .9 ],
					begin: function(){
						$('#'+that.id).hide().show(0);
					},
					complete: function(){
						submenu_wrapper.find("[find=submenu_wrapper_content]").focus();
						//The line below avoid a bug in Chrome that could make the scroll unavailable in some areas
						submenu_wrapper.hide().show(0);
						submenu_wrapper.css('z-index', that.zIndex);
						app_application_submenu_position();
						that.FocusForm();
					}
				}
			);
		} else {
			var animation = "bruno.expandIn";
			if(submenu_Getnext()>=2){
				animation = "bruno.slideRightBigIn";
			}
			submenu_wrapper.velocity(
				animation,
				{
					duration: Math.floor(1.5*time),
					delay: delay,
					easing: [ .38, .1, .13, .9 ],
					begin: function(){
						$('#'+that.id).hide().show(0);
					},
					complete: function(){
						submenu_wrapper.find("[find=submenu_wrapper_content]").focus();
						//The line below avoid a bug in Chrome that could make the scroll unavailable in some areas
						submenu_wrapper.hide().show(0);
						app_application_submenu_position();
						that.FocusForm();
					}
				}
			);
		}
}

Submenu.prototype.Show = function() {
	var that = this;
	var time = 200;
	var delay = 60;
	if(responsive.test("minDesktop")){
		delay = 60;
	}
	var stack = this.preview? submenu_show['preview']: submenu_show['submenu'];
	if(typeof stack[this.id] !== 'boolean' || !stack[this.id]){
		stack[this.id] = true;
		if (this.preview) {
			this.showPreview(time, delay);
		}
		else {
			this.showSubmenu(time, delay);
		}
	}
};

Submenu.prototype.Hide = function (animate){
	submenu_wrapper = this.Wrapper();
	var that = this;
	var time = 160;
	var delay = 60;
	var stack = this.preview? submenu_obj['preview']: submenu_obj['submenu'];
	var preview = this.preview? "preview": "submenu";
	if(responsive.test("minDesktop")){
		delay = 60;
	}
	submenu_show[preview][this.id] = false;
	submenu_content_unblur();
	if(typeof animate === 'undefined'){ animate = false; }
	//Reset menu selection if(menu in submenu_list){
	if((that.layer-1) in stack){
		$.each(stack[that.layer-1].Wrapper().find('.submenu_deco_next'), function() {
			$(this).removeClass('submenu_deco_next');
		});
	}
	if(animate){
		if(responsive.test("minDesktop")){
			if(that.layer<=3){ submenu_wrapper.css('z-index', submenu_zindex); }
			submenu_wrapper.velocity(
				"transition.slideLeftBigOut",
				{
					duration: time,
					delay: delay,
					easing: [ .38, .1, .13, .9 ],
					complete: function(){
						that.Remove();
					}
				}
			);
		} else {
			var animation = "bruno.expandOut";
			if(submenu_Getnext()>2){
				animation = "bruno.slideRightBigOut";
			}
			submenu_wrapper.velocity(
				animation,
				{
					duration: Math.floor(1.5*time),
					delay: delay,
					easing: [ .38, .1, .13, .9 ],
					complete: function(){
						that.Remove();
					}
				}
			);
		}
	} else {
		time = 0;
		that.Remove();
	}
	//Free memory
	delete submenu_wrapper;
};

// http://stackoverflow.com/questions/19469881/javascript-remove-all-event-listeners-of-specific-type
Submenu.prototype.Remove = function(){
	var stack = this.preview? submenu_obj["preview"]: submenu_obj["submenu"];
	$('#'+this.id).hide().remove();
	stack[this.layer] = null;
	delete stack[this.layer];
	app_application_submenu_position();
	submenu_content_block_hide(this.preview);
};

Submenu.prototype.Wrapper = function(){
	return $('#'+this.id);
}

function submenu_Hideall(preview){
	var stack = preview? submenu_obj['preview']: submenu_obj['submenu'];
	for(var index in stack){
		submenu_Clean(1, false, preview);
	}
}

//Return the next layer to display full screen
function submenu_Getfull(preview){
	var next = submenu_Getnext(preview);
	if(next<4){
		next = 4;
	}
	return next;
}

// "1" means that there is no submenu displayed
function submenu_Getnext(preview){
	var stack = preview? submenu_obj['preview']: submenu_obj['submenu'];
	submenu_layer = 0;
	for(var index in stack){
		if(stack[index].layer > submenu_layer){
			submenu_layer = stack[index].layer;
		}
	}
	submenu_layer++;
	return submenu_layer;
}

function submenu_Getposition(menu, preview){
	var stack = preview? submenu_obj['preview']: submenu_obj['submenu'];
	submenu_position = submenu_Getnext(preview);
	for(var index in stack){
		if(stack[index].menu === menu){
			submenu_position = stack[index].layer;
		}
	}
	return submenu_position;
}

function submenu_Clean(layer, animate, preview){
	var stack = preview? submenu_obj['preview']: submenu_obj['submenu'];
	if(typeof layer !== 'number' || layer<1){
		layer = 1;
	}
	if(typeof animate === 'undefined'){ animate = false; }
	for(var index in stack){
		if(stack[index].layer >= layer){
			stack[index].Hide(animate);
		}
	}
}

function submenu_Build(menu, next, hide, param, preview){
	if(typeof next === 'undefined'){ next = 1; }
	if(typeof hide === 'undefined'){ hide = true; }
	if(typeof param === 'undefined'){ param = null; }
	var stack = preview? submenu_obj["preview"]: submenu_obj["submenu"];

	//If the tab already exists, just close it if we launch again the action
	if(hide){
		for(var index in stack){
			if(stack[index].menu === menu){
				// clean underneath layer according to if it is preview or submenu
				//var preview = submenu_obj[index].preview? 'preview': 'submenu';
				submenu_Clean(next, true, preview);
				return false;
			}
		}
	}

	if(menu in submenu_list){
		if (preview) {
			var temp = new Submenu(menu, next, param, preview);
			$('#app_content_submenu_preview').parent().addClass("with_preview");
			$('#app_content_submenu_preview').show();
		}
		else {
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
	if(wrapper_browser('webkit') && submenu_Getnext()>1 && $('#app_content_dynamic').hasClass('app_application_submenu_blur')){
		$('#app_content_dynamic').velocity(
			{ blur: 2 },
			{
				duration: 200,
				delay: 100,
				easing: [ 4 ],
			}
		);
	}
});
enquire.register(responsive.maxTablet, function() { 
	//The blur is hard to calculate, it creates some flickering
	if(wrapper_browser('webkit') && submenu_Getnext()>1 && $('#app_content_dynamic').hasClass('app_application_submenu_blur')){
		$('#app_content_dynamic').velocity(
			{ blur: 0 },
			{
				duration: 200,
				delay: 100,
				easing: [ 4 ],
			}
		);
	}
});

function submenu_content_block_hide(preview) {
	//submenu_show
	var stack = preview? submenu_show['preview']: submenu_show['submenu'];
	for(var i in stack){
		if(stack[i]){
			return true;
		}
	}
	if (preview) {
		$('#app_content_submenu_preview').hide().parent().removeClass("with_preview");
	}
	else {
		$('#app_application_submenu_block').hide();
	}
}

function submenu_content_unblur() {
	// This method is only called by submenu, not preview
	//submenu_show
	var stack = submenu_show['submenu'];
	for(var i in stack){
		if(stack[i]){
			return true;
		}
	}
	$('#app_content_dynamic').removeClass('app_application_submenu_blur');
	//The blur is hard to calculate, it creates some flickering
	//Checking animate helps only to know if we pushed the button close
	if(wrapper_browser('webkit')){ $('#app_content_dynamic').velocity(
		{ blur: 0 },
		{
			duration: 100,
			delay: 100,
			easing: [ 1 ],
		}
	); }
}
submenu_content_unblur();

function submenu_wrapper_width() {
	//var width = Math.floor($('#app_application_content').width()/3);
	var width = 320;
	$('.submenu_wrapper').css('width', width);
}
submenu_wrapper_width();
var submenu_wrapper_width_timer;
$(window).resize(function(){
	clearTimeout(submenu_wrapper_width_timer);
	submenu_wrapper_width_timer = setTimeout(submenu_wrapper_width, wrapper_timeout_timer);
});

var submenu_form_cb_success = function(msg, err, status, data){
	var field = 'undefined';
	submenu_form_cb_hide_progress();
	if(err){
		if(wrapper_objForm){
			if(typeof data.field === 'string') { field = data.field; }
			base_form_field_show_error(wrapper_objForm.find("[name="+field+"]"));
			wrapper_objForm.find("[name="+field+"]").focus();
		}
	} else {
		storage_cb_success(msg, err, status, data);
		//No need to call "storage_cb_success", it's called internally by "wrapper_ajax"
		submenu_Hideall();
	}
};

var submenu_form_cb_error = function(xhr_err, ajaxOptions, thrownError){
	var msgtp = Lincko.Translation.get('wrapper', 1, 'html'); //Communication error
	submenu_form_cb_hide_progress();
	base_show_error(msgtp);
};

var submenu_form_cb_begin = function(){
	$(document.body).css('cursor', 'progress');
	if(wrapper_objForm){
		var submit_progress_bar = wrapper_objForm.parent().find("[find=submit_progress_bar]");
		base_form_field_hide_error();
		base_format_form_single(submit_progress_bar);
		submit_progress_bar.show();
	}
};

var submenu_form_cb_complete = function(){
	$(document.body).css('cursor', '');
	submenu_form_cb_hide_progress();
};

var submenu_form_cb_hide_progress = function(){
	if(wrapper_objForm){
		var submit_progress_bar = wrapper_objForm.parent().find("[find=submit_progress_bar]");
		base_format_form_single(submit_progress_bar);
		submit_progress_bar.hide();
	}
}

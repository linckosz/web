var submenu_zindex = 2000;
var submenu_obj = {};

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

function Submenu(menu, next, param) {
	this.obj = submenu_list[menu];
	this.menu = menu;
	this.layer = 1;
	if(typeof next === 'number'){
		if(next === 0){
			this.layer = submenu_Getfull();
		} else {
			this.layer = next;
		}
	} else if(typeof next !== 'undefined' && next === true){
		this.layer = submenu_Getposition(menu);
	}
	if(typeof param === 'undefined'){
		this.param = null;
	}
	
	//The creation of new submenu with MD5 seems to lead to a Memory leak
	//this.id = this.layer+"_submenu_wrapper_"+md5(Math.random());
	
	//The creation or reuse of HTML element seems to have some display problem, and DIV deletion issue
	this.id = this.layer+"_submenu_wrapper_"+menu;
	
	this.zIndex = submenu_zindex+this.layer;
	this.display = true;
	this.prefix = false;
	this.attribute = null;
	function Constructor(Elem){
		submenu_wrapper = $('#-submenu_wrapper').clone();
		submenu_wrapper.prop("id",Elem.id);
		//Back button
		submenu_wrapper.find("[find=submenu_wrapper_back]").click(function(){
			submenu_Clean(Elem.layer, true);
		});
		submenu_wrapper.css('z-index', Elem.zIndex);
		//Do not not add "overthrow" in twig template, if not the scrollbar will not work
		submenu_wrapper.find("[find=submenu_wrapper_content]").addClass('overthrow');
		//This is because we can only place 3 menus on Desktop mode, so after 3 layers we switch to full width mode
		if(Elem.layer>3) { submenu_wrapper.addClass('submenu_wrapper_important'); }
		submenu_wrapper.insertBefore('#end_submenu');
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
		wrapper_perfectScrollbar();
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
		Elem.addClass(attribute.class);
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
			Elem.click(function(){ submenu_Hideall(); });
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
		Elem.addClass(attribute.class);
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
		Elem.addClass(attribute.class);
	}
	this.Wrapper().find("[find=submenu_wrapper_content]").append(Elem);
	return true;
};

Submenu.prototype.Add_MenuRadio = function() {
	var attribute = this.attribute;
	var Elem = $('#-submenu_radio').clone();
	Elem.prop("id", '');
	Elem.find("[find=submenu_radio_title]").html(attribute.title);
	if("selected" in attribute){
		if(attribute.selected){
			Elem.find("[find=submenu_radio_value]").html("<img class='submenu_icon' src='/lincko/app/images/submenu/check.png' />");
		}
	}
	if("hide" in attribute){
		if(attribute.hide) {
			Elem.click(function(){ submenu_Hideall(); });
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
		Elem.addClass(attribute.class);
	}
	this.Wrapper().find("[find=submenu_wrapper_content]").append(Elem);
	return true;
};

Submenu.prototype.Add_InputText = function() {
	var attribute = this.attribute;
	var Elem = $('#-submenu_input').clone();
	var Input = $('<input type="text" />');
	Elem.prop("id", '');
	Elem.find("[find=submenu_title]").html(attribute.title);
	Elem.prop('for', attribute.name);
	Input.prop('name', attribute.name);	
	Elem.append(Input);
	if("value" in attribute){
		Elem.find("[find=submenu_input]").prop('value', attribute.value);
	}
	if("class" in attribute){
		Elem.addClass(attribute.class);
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
		Elem.addClass(attribute.class);
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
		Elem.addClass(attribute.class);
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
			Elem.find("[find=submenu_form_button]").click(function(){ submenu_Hideall(); });
		}
	}
	Elem.find("[find=submenu_form_title]").html(attribute.title)
	Elem.find("[find=submenu_form_button]").click(function(){
		$('#'+that.id+'_submenu_form').submit();
	});
	if("class" in attribute){
		Elem.addClass(attribute.class);
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
			Elem.find("[find=submenu_form_button]").click(function(){ submenu_Hideall(); });
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
		Elem.addClass(attribute.class);
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
	if(responsive.test("minDesktop")){
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

Submenu.prototype.Show = function(){
	submenu_wrapper = this.Wrapper();
	var that = this;
	var time = 200;
	var delay = 60;
	if(responsive.test("minDesktop")){
		delay = 60;
	}
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
						); }
					}
				},
				complete: function(){
					submenu_wrapper = that.Wrapper();
					submenu_wrapper.find("[find=submenu_wrapper_content]").focus();
					//The line below avoid a bug in Chrome that could make the scroll unavailable in some areas
					submenu_wrapper.hide().show(0);
					submenu_wrapper.css('z-index', that.zIndex);
					app_application_submenu_position();
					submenu_content_unblur();
					that.FocusForm();
					//Free memory
					delete submenu_wrapper;
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
					submenu_wrapper = that.Wrapper();
					submenu_wrapper.find("[find=submenu_wrapper_content]").focus();
					//The line below avoid a bug in Chrome that could make the scroll unavailable in some areas
					submenu_wrapper.hide().show(0);
					app_application_submenu_position();
					submenu_content_unblur();
					that.FocusForm();
					//Free memory
					delete submenu_wrapper;
				}
			}
		);
	}
	//Free memory
	delete submenu_wrapper;
};

Submenu.prototype.Hide = function (animate){
	submenu_wrapper = this.Wrapper();
	var that = this;
	var time = 160;
	var delay = 60;
	if(responsive.test("minDesktop")){
		delay = 60;
	}
	if(typeof animate === 'undefined'){ animate = false; }
	//Reset menu selection if(menu in submenu_list){
	if((that.layer-1) in submenu_obj){
		$.each(submenu_obj[that.layer-1].Wrapper().find('.submenu_deco_next'), function() {
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
						app_application_submenu_position();
						submenu_content_unblur();
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
						app_application_submenu_position();
						submenu_content_unblur();
					}
				}
			);
		}
	} else {
		time = 0;
		that.Remove();
		app_application_submenu_position();
		submenu_content_unblur();
	}
	//Free memory
	delete submenu_wrapper;
};

// http://stackoverflow.com/questions/19469881/javascript-remove-all-event-listeners-of-specific-type
Submenu.prototype.Remove = function(){
	$('#'+this.id).find('.overthrow').perfectScrollbar('destroy');
	$('#'+this.id).hide().remove();
	submenu_obj[this.layer] = null;
	delete submenu_obj[this.layer];
};

Submenu.prototype.Wrapper = function(){
	return $('#'+this.id);
}

function submenu_Hideall(){
	for(var index in submenu_obj){
		submenu_Clean();
	}
}

//Return the next layer to display full screen
function submenu_Getfull(){
	var next = submenu_Getnext();
	if(next<4){
		next = 4;
	}
	return next;
}

// "1" means that there is no submenu displayed
function submenu_Getnext(){
	submenu_layer = 0;
	for(var index in submenu_obj){
		if(submenu_obj[index].layer > submenu_layer){
			submenu_layer = submenu_obj[index].layer;
		}
	}
	submenu_layer++;
	return submenu_layer;
}

function submenu_Getposition(menu){
	submenu_position = submenu_Getnext();
	for(var index in submenu_obj){
		if(submenu_obj[index].menu === menu){
			submenu_position = submenu_obj[index].layer;
		}
	}
	return submenu_position;
}

function submenu_Clean(layer, animate){
	if(typeof layer !== 'number' || layer<1){
		layer = 1;
	}
	if(typeof animate === 'undefined'){ animate = false; }
	for(var index in submenu_obj){
		if(submenu_obj[index].layer >= layer){
			submenu_obj[index].Hide(animate);
		}
	}
}

function submenu_Build(menu, next, hide){
	if(typeof next === 'undefined'){ next = 1; }
	if(typeof hide === 'undefined'){ hide = true; }

	//If the tab already exists, just close it if we launch again the action
	if(hide){
		for(var index in submenu_obj){
			if(submenu_obj[index].menu === menu){
				submenu_Clean(next, true);
				return false;
			}
		}
	}

	if(menu in submenu_list){
		var temp = new Submenu(menu, next);
		submenu_Clean(temp.layer);
		$('#app_application_submenu_block').show();
		$('#app_content_dynamic').addClass('app_application_submenu_blur');
		submenu_obj[temp.layer] = temp;
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

function submenu_content_unblur() {
	if(submenu_Getnext()<=1){
		$('#app_content_dynamic').removeClass('app_application_submenu_blur');
		$('#app_application_submenu_block').hide();
		//The blur is hard to calculate, it creates some flickering
		//Checking animate helps only to know if we pushed the button close
		if(wrapper_browser('webkit')){ $('#app_content_dynamic').velocity(
			{ blur: 0 },
			{
				duration: 100,
				delay: 100,
				easing: [ 1 ],
				complete: function(){
					//We need to check again if there is another menu replace the old one, so we keep it blur
					if(submenu_Getnext()>1){
						$('#app_content_dynamic').velocity(
							{ blur: 2 },
							{
								duration: 100,
								delay: 100,
								easing: [ 4 ],
							}
						);
					}
				}
			}
		); }
	}
}
submenu_content_unblur();

function submenu_wrapper_width() {
	var width = Math.floor($('#app_application_content').width()/3);
	$('.submenu_wrapper').css('width', width);
}
submenu_wrapper_width();
$(window).resize(submenu_wrapper_width);

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
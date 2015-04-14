var submenu_zindex = 2000;
var submenu_obj = {};

//Modify the scaling of some effects
$.Velocity.RegisterEffect.packagedEffects["transition.expandIn"].calls[0][0].scaleX = [ 1, 0.75 ];
$.Velocity.RegisterEffect.packagedEffects["transition.expandIn"].calls[0][0].scaleY = [ 1, 0.75 ];
$.Velocity.RegisterEffect.packagedEffects["transition.expandOut"].calls[0][0].scaleX = 0.8;
$.Velocity.RegisterEffect.packagedEffects["transition.expandOut"].calls[0][0].scaleY = 0.8;

function Submenu(menu, next) {
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
	this.id = this.layer+"_submenu_wrapper_"+md5(Math.random());
	this.zIndex = submenu_zindex+this.layer;
	this.wrapper = null;
	function Constructor(Elem){
		Elem.wrapper = $('#-submenu_wrapper').clone();
		Elem.wrapper.prop("id",Elem.id);
		//Back button
		Elem.wrapper.find("[find=submenu_wrapper_back]").click(function(){
			submenu_Clean(Elem.layer, true);
		});
		Elem.wrapper.css('z-index', Elem.zIndex);
		//This is because we can only place 3 menus on Desktop mode, so after 3 layers we switch to full width mode
		if(Elem.layer>3) {Elem.wrapper.addClass('submenu_wrapper_important'); }
		Elem.wrapper.insertBefore('#end_submenu');
		var attribute = null;
		var exist = false;
		for(var att in Elem.obj){
			attribute = Elem.obj[att];
			if("style" in attribute && "title" in attribute){
				//Standard
				if(attribute.style=="title"){
					Elem.AddMenuTitle(attribute);
				} else if(attribute.style=="button"){
					Elem.AddMenuButton(attribute);
				} else if(attribute.style=="next"){
					Elem.AddMenuNext(attribute);
				} else if(attribute.style=="radio"){
					Elem.AddMenuRadio(attribute);
				} else if(attribute.style=="form"){
					Elem.AddMenuForm(attribute);
				}
				//app_upload
				else if(attribute.style=="app_upload_all"){
					if(typeof app_upload_files !== 'undefined'){
						for(var index in app_upload_files.lincko_record){
							if(app_upload_files.lincko_record[index].id === Elem.id){
								exist = true;
							}
						}
						if(!exist){
							app_upload_files.lincko_record[app_upload_files.lincko_record_index++] = {
								id: Elem.id,
								action: function(){
									Elem.AddMenuAppUploadSingle();
								},
							};
							Elem.AddMenuAppUploadSingle();
							app_upload_files.lincko_record_update();
						}
					}
				}
			}
		}
		Elem.Show();
	}
	Constructor(this);
}
 
Submenu.prototype = {
	AddMenuTitle: function(attribute) {
		this.wrapper.find("[find=submenu_wrapper_title]").html(attribute.title);
		return true;
	},
	AddMenuButton: function(attribute) {
		var Elem = $('#-submenu_button').clone();
		Elem.prop("id", '');
		Elem.find("[find=submenu_button_title]").html(attribute.title);
		if("value" in attribute){
			Elem.find("[find=submenu_button_value]").html(attribute.value);
		}
		if("action" in attribute){
			Elem.click(attribute.action);
		}
		if("class" in attribute){
			Elem.addClass(attribute.class);
		}
		this.wrapper.find("[find=submenu_wrapper_content]").append(Elem);
		return true;
	},
	AddMenuNext: function(attribute) {
		var Elem = $('#-submenu_next').clone();
		var that = this;
		Elem.prop("id", '');
		if("value" in attribute){
			Elem.find("[find=submenu_next_value]").html(attribute.value);
		}
		if("next" in attribute){
			if(attribute.next in submenu_list){
				if(attribute.style=="title"){
					Elem.AddMenuTitle(attribute);
				}
				for(var att in submenu_list[attribute.next]){
					next_attribute = submenu_list[attribute.next][att];
					if("style" in next_attribute && "title" in next_attribute){
						if(next_attribute.style == "title"){
							attribute.title = next_attribute.title;
						}
					}
				}
				$("<img class='submenu_icon submenu_icon_next' src='/lincko/app/images/generic/submenu/next.png' />").appendTo(Elem.find("[find=submenu_next_value]"));
				Elem.click(function(){
					$.each(that.wrapper.find('.submenu_deco_next'), function() {
						$(this).removeClass('submenu_deco_next');
					});
					submenu_Build(attribute.next, that.layer+1);
					Elem.addClass('submenu_deco_next');
				});
			}
		}
		Elem.find("[find=submenu_next_title]").html(attribute.title);
		if("class" in attribute){
			Elem.addClass(attribute.class);
		}
		this.wrapper.find("[find=submenu_wrapper_content]").append(Elem);
		return true;
	},
	AddMenuRadio: function(attribute) {
		var Elem = $('#-submenu_radio').clone();
		Elem.prop("id", '');
		Elem.find("[find=submenu_radio_title]").html(attribute.title);
		if("selected" in attribute){
			if(attribute.selected){
				Elem.find("[find=submenu_radio_value]").html("<img class='submenu_icon' src='/lincko/app/images/generic/submenu/check.png' />");
			}
		}
		if("action" in attribute){
			Elem.click(attribute.action);
		}
		if("class" in attribute){
			Elem.addClass(attribute.class);
		}
		this.wrapper.find("[find=submenu_wrapper_content]").append(Elem);
		return true;
	},
	AddMenuForm: function(attribute) {
		var Elem = $('#-submenu_form').clone();
		Elem.prop("id", '');
		this.wrapper.find("[find=submenu_wrapper_bottom]").addClass('submenu_bottom');
		this.wrapper.find("[find=submenu_wrapper_content]").css('bottom', this.wrapper.find("[find=submenu_wrapper_bottom]").height());
		Elem.find("[find=submenu_form_title]").html(attribute.title);
		Elem.click(function(){
			alert('ok');
		});
		if("class" in attribute){
			Elem.addClass(attribute.class);
		}
		this.wrapper.find("[find=submenu_wrapper_bottom]").html(Elem);
		return true;
	},

	AddMenuAppUploadSingle: function() {
		var that = this;
		if(typeof app_upload_files !== 'undefined'){
			$.each(app_upload_files.lincko_files, function(index, data){
				var Elem = $('#-submenu_app_upload_single').clone();
				if(typeof data === 'object'){
					if(typeof data.lincko_type !== 'undefined' && data.lincko_type === 'file'){
						if($('#'+that.id+'_submenu_app_upload_single_'+index).length <= 0){
							Elem.prop("id", that.id+'_submenu_app_upload_single_'+index);
							Elem.find("[find=submenu_app_upload_name]").html(
								data.lincko_name
							);
							Elem.find("[find=submenu_app_upload_name]").prop('title',
								data.lincko_name
							);
							Elem.find("[find=submenu_app_upload_size]").html(
								$('#app_upload_fileupload').fileupload('option')._formatFileSize(data.lincko_size)
							);
							Elem.find("[find=submenu_app_upload_where]").html(
								'My placeholder'
							);
							Elem.find("[find=submenu_app_upload_single_cancel]").click(function(){
								console.log('File abort');
							});
							that.wrapper.find("[find=submenu_wrapper_content]").append(Elem);
						} else {
							Elem = $('#'+that.id+'_submenu_app_upload_single_'+index);
						}

						Elem.find("[find=submenu_app_upload_progress_pc_text]").html(
							data.lincko_progress + '%'
						);
						Elem.find("[find=submenu_app_upload_progress_pc]").css('width',
							data.lincko_progress + '%'
						);

						if(data.lincko_status === 'done' || data.lincko_progress>=100){
							var delay = 0;
							if(data.lincko_progress>=100){
								delay = 1000;
								Elem.find("[find=submenu_app_upload_single_cancel]").hide();
							}
							var Sequence = [
								{ e: Elem, p: 'slideUp', o: { delay: delay } },
								{ e: Elem.children(), p: 'transition.fadeOut', o: { delay: delay, sequenceQueue: false } },
							];
							$.Velocity.RunSequence(Sequence);
						}
					}
				}
			});
		}
		return true;
	},

	Show: function(){
		var Elem = this.wrapper;
		var that = this;
		var time = 200;
		if(responsive.test("minDesktop")){
			if(that.layer<=3){ Elem.css('z-index', submenu_zindex); }
			Elem.velocity(
				"transition.slideLeftBigIn",
				{
					duration: time,
					easing: [ .38, .1, .13, .9 ],
					begin: function(){
						Elem.hide().show(0);
						$(window).trigger('resize');
						if(responsive.test("minDesktop")){
							if(wrapper_broswer('webkit')){ $('#app_content_dynamic').velocity({ blur: 2 }, time); }
						}
					},
					complete: function(){
						Elem.find("[find=submenu_wrapper_content]").focus();
						//The line below avoid a bug in Chrome that could make the scroll unavailable in some areas
						Elem.hide().show(0);
						Elem.css('z-index', that.zIndex);
						$(window).trigger('resize');
					}
				}
			);
		} else {
			Elem.velocity(
				"transition.expandIn",
				{
					duration: time,
					easing: [ .38, .1, .13, .9 ],
					begin: function(){
						Elem.hide().show(0);
						$(window).trigger('resize');
					},
					complete: function(){
						Elem.find("[find=submenu_wrapper_content]").focus();
						//The line below avoid a bug in Chrome that could make the scroll unavailable in some areas
						Elem.hide().show(0);
						$(window).trigger('resize');
					}
				}
			);
		}
	},
	Hide: function (animate){
		var Elem = this.wrapper;
		var that = this;
		var time = 160;
		if(typeof animate === 'undefined'){ animate = false; }
		delete submenu_obj[that.layer];
		if(animate && submenu_Getnext()<=1 && responsive.test("minDesktop")){
			//Checking animate helps only to know if we pushed the button clse
			if(wrapper_broswer('webkit')){ $('#app_content_dynamic').velocity({ blur: 0 }, time); }
		}
		//Reset menu selectionif(menu in submenu_list){
		if((that.layer-1) in submenu_obj){
			$.each(submenu_obj[that.layer-1].wrapper.find('.submenu_deco_next'), function() {
				$(this).removeClass('submenu_deco_next');
			});
		}
		if(animate){
			if(responsive.test("minDesktop")){
				if(that.layer<=3){ Elem.css('z-index', submenu_zindex); }
				Elem.velocity(
					"transition.slideLeftBigOut",
					{
						duration: time,
						easing: [ .38, .1, .13, .9 ],
						complete: function(){
							Elem.hide().remove();
							if(submenu_Getnext()<=1){
								$('#app_content_dynamic').removeClass('app_application_submenu_blur');
								$('#app_application_submenu_block').hide();
							}
						}
					}
				);
			} else {
				Elem.velocity(
					"transition.expandOut",
					{
						duration: time,
						easing: [ .38, .1, .13, .9 ],
						complete: function(){
							Elem.hide().remove();
							if(submenu_Getnext()<=1){
								$('#app_content_dynamic').removeClass('app_application_submenu_blur');
								$('#app_application_submenu_block').hide();
							}
						}
					}
				);
			}
		} else {
			Elem.hide().remove();
			if(submenu_Getnext()<=1){
				$('#app_content_dynamic').removeClass('app_application_submenu_blur');
				$('#app_application_submenu_block').hide();
			}
		}
	},
};

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

function submenu_Build(menu, next){
	if(typeof next === 'undefined'){ next = 1; }
	if(menu in submenu_list){
		var temp = new Submenu(menu, next);
		submenu_Clean(temp.layer);
		$('#app_application_submenu_block').show();
		$('#app_content_dynamic').addClass('app_application_submenu_blur');
		submenu_obj[temp.layer] = temp;
		temp = null;
	}
}

enquire.register(responsive.minDesktop, function() { 
	if(wrapper_broswer('webkit') && submenu_Getnext()>1 && $('#app_content_dynamic').hasClass('app_application_submenu_blur')){
		$('#app_content_dynamic').velocity({ blur: 2 }, 200);
	}
});
enquire.register(responsive.maxTablet, function() { 
	if(wrapper_broswer('webkit') && submenu_Getnext()>1 && $('#app_content_dynamic').hasClass('app_application_submenu_blur')){
		$('#app_content_dynamic').velocity({ blur: 0 }, 200);
	}
});

function submenu_wrapper_width() {
	var width = Math.floor($('#app_application_content').width()/3);
	$('.submenu_wrapper').css('width', width);
}
submenu_wrapper_width();
$(window).resize(submenu_wrapper_width);
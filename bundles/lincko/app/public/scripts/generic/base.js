
//Initiiaze fields with same name
function base_format_input(field){
	if(field in base_input_field){
		var Elem = $("[name="+field+"]");
		if($.type(base_input_field[field].tags) === 'object') {
			for(tag in base_input_field[field].tags){
				Elem.prop(tag, base_input_field[field].tags[tag]);
			}
		}
	}
}

//This function is only for IE which gives the wrong width when the element is hidden
function base_format_form_single(Elem){
	Elem.each(function() {
		$(this).width("100%");
		$(this).width($(this).width() - 4);
	});
}

//Initialize a bunch of forms' inputs
function base_format_form(prefix){
	if(typeof prefix !== 'string'){ prefix = ''; }
	var Elem = null;
	for(field in base_input_field){
		if(field.indexOf(prefix) === 0){
			base_format_input(field);
		}
	}
	base_format_form_single($('.submit_progress_bar'));
}

var base_notification = null;

JSfiles.finish(function(){
	base_format_form();
	Notification.requestPermission();
});

//Copy canvas
//http://stackoverflow.com/questions/3318565/any-way-to-clone-html5-canvas-element-with-its-content
//http://jsperf.com/copying-a-canvas-element
function base_cloneCanvas(oldCanvas) {

	//create a new canvas
	newCanvas = document.createElement('canvas');
	context = newCanvas.getContext('2d');

	//set dimensions
	newCanvas.width = oldCanvas.width;
	newCanvas.height = oldCanvas.height;

	//apply the old canvas to the new one
	context.drawImage(oldCanvas, 0, 0);

	delete context;

	//return the new canvas
	return newCanvas;
}

var base_error_timing;
var base_show_error_running = false;
function base_show_error(msg, error) {
	if(typeof error === 'undefined'){ error = false; }
	if(error && $('#base_error').hasClass('base_message')){
		$('#base_error').removeClass('base_message');
	} else if(!error && !$('#base_error').hasClass('base_message')){
		$('#base_error').addClass('base_message');
	}
	clearTimeout(base_error_timing);
	//This avoid a double call
	msg = wrapper_to_html(msg); //Escape the whole string for HTML displaying
	if(typeof msg == "string" && $('#base_error').length > 0 && php_nl2br(php_br2nl(msg)) != php_nl2br(php_br2nl($('#base_error').html()))){
		$('#base_error').html(msg);
		if(!base_show_error_running && $('#base_error').is(':hidden')){
			$("#base_error").velocity("transition.slideRightBigIn", {
				mobileHA: hasGood3Dsupport,
				duration: 260,
				delay: 120,
			});
		} else {
			$("#base_error").fadeTo( 60 , 0.9).fadeTo( 120 , 1);
		}
		base_show_error_running = true;
	} else if(typeof msg != "string"){
		JSerror.sendError(msg, 'base_show_error', 0);
	}
	base_error_timing = setTimeout(function(){ base_hide_error(); }, 4000);
}

function base_hide_error(now) {
	if(typeof now == 'undefined'){ now = false; }
	$('#base_error').velocity("stop");
	base_show_error_running = false;
	if(now){
		clearTimeout(base_error_timing);
		$('#base_error').hide().recursiveEmpty();
	} else if($('#base_error').is(':visible')){
		$("#base_error").velocity("transition.slideRightBigOut", {
			mobileHA: hasGood3Dsupport,
			duration: 160,
			delay: 80,
			complete: function(){
				clearTimeout(base_error_timing);
				$('#base_error').hide().recursiveEmpty();
			},
		});
	}
}

$('#base_error').click(function(){
	base_hide_error();
});

function base_form_field_hide_error() {
	base_hide_error();
	$('.base_input_text_error').removeClass('base_input_text_error').off('change copy past cut keyup keypress');
}

function base_form_field_show_error(input){
	input.addClass('base_input_text_error').on({
		change: function(){ base_form_field_hide_error(); },
		copy: function(){ base_form_field_hide_error(); },
		paste: function(){ base_form_field_hide_error(); },
		cut: function(){ base_form_field_hide_error(); },
		keyup: function(e) {
			if (e.which != 13) {
				base_form_field_hide_error();
			}
		},
		keypress: function(e) {
			if (e.which != 13) {
				base_form_field_hide_error();
			}
		},
	});
}

/*
	elem: DOM element ID in string form
	fn_run: function to run when the DOM elem specified above is ready
	after creating an instance, use the instance.run function to start the DOM check
*/
function base_runOnElemLoad(elem, fn_run){
	if(!elem || typeof fn_run != 'function'){ return false; }

	this.that = this;
	var that = this;

	that.elem = elem;
	that.fn_run = fn_run;
	that.timeoutVar = null;
}
base_runOnElemLoad.prototype.run = function(checkTime){
	var that = this;
	if(typeof checkTime != 'number'){ var checkTime = 50; /*default*/ }

	if($('#'+that.elem).is(':visible')){
		that.fn_run();
		clearTimeout(that.timeoutVar);
		delete that;
	}
	else{
		clearTimeout(that.timeoutVar);
		that.timeoutVar = setTimeout(function(){ that.run(checkTime); }, checkTime);
	}
}

function base_getRandomInt(min, max){
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

/*
[image] to <img/>
*/
function base_lincko_img_to_html(source)
{
	var reg = new RegExp("\\[image(.*?)\\](.*?)\\[\\/image\\]","gi");
	var match = source.match(reg);
	if(match && match.length>0){
		var extract = match[0];
		extract = html_to_wrapper(extract);
		extract = extract.replace(reg, '<img $1 src="$2"/>');
		source = source.replace(reg, extract);
	}
	return source;
}



function ios_open_link(url){
	window.webkit.messageHandlers.iOS.postMessage(
	{
		action: 'open_external_url',
		value:{
			url:url,
		}
	});
}
/*
text to <a></a>
*/
function base_lincko_link_to_html(source)
{
	var reg = new RegExp("(?:(?:https?|ftp)://)([^\\s/$.?#]*\\.[^\\s|<|>]*)", "gi"); //stephenhay

	var workspace = wrapper_localstorage.workspace == "" ? "" : wrapper_localstorage.workspace + ".";
	var match_reg = new RegExp(top.location.protocol+'//'+app_application_dev_link() + workspace + document.domainRoot);

	var reg_replace = new RegExp("((?:https?|ftp)://)", "gi"); //stephenhay
	var source = source.replace(reg_replace, function(match) {return match.toLowerCase();});

	var list_url = source.match(reg);
	var already = {};
	var str_target = '';
	var str_event = '';
	var str_href = '';
	var url_decoded = '';

	//Minimize the schema because it may crash opening the link on android
	for(var i in list_url){
		list_url[i] = list_url[i].replace(reg_replace, function(match) {return match.toLowerCase();});
	}
	for(var i in list_url){
		if(typeof already[list_url[i]] != 'undefined'){
			continue;
		}
		already[list_url[i]] = true;
		url_decoded = $('<div/>').html(list_url[i]).text();

		str_target = '';
		str_event = '';
		str_href = ' href="' + url_decoded + '" ';
		if(isMobileApp() && device_type() == 'ios'){
			if(match_reg.test(source)){
				str_target = ' target="_top" ';
				str_event = ' ontouchstart="window.location.href=\'' + url_decoded + '\';" ';
			}
			else{
				str_event = ' ontouchstart="ios_open_link(\'' + url_decoded + '\')" ';
			}
		}
		else if(isMobileApp() && device_type() == 'android'){
			if(match_reg.test(source)){
				str_target = ' target="_top" ';
				str_event = ' ontouchstart="window.location.href=\'' + url_decoded + '\';" ';
				str_href = ' href="javascript:void(0);" ';
			}
			else{
				str_event = ' ontouchstart="android.open_external_url(\'' + url_decoded + '\');" ';
				str_href = ' href="javascript:void(0);" ';
			}
		}
		else{
			str_target = match_reg.test(source) ? ' target="_top" ' : ' target="_blank" '; //if lincko links,open page on the same tag
		}

		var str = '<a ' + str_event + str_target + str_href + '>' + list_url[i] + '</a>';
		source = source.replaceAll(list_url[i], str);
	}
	
	//[bruno] I don't understand the use of the code below
	//reg = new RegExp("(\"<a(.*)>)(.*)(</a>)\"","gi");
	//source = source.replace(reg, '$3');

	//NOTE: DO NOT USE <a> or window.open(), USE device_download() INSTEAD !
	return source;
}




function base_lincko_tag_to_html(source)
{
	//[image]
	source = base_lincko_img_to_html(source);

	//url
	source = base_lincko_link_to_html(source);

	//[vedio]
	return source;
}



//Returns true if it is a DOM element    
function base_isElement(o){
	  return (
		typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
		o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
	);
}

base_showProgress = function(Elem){
	Elem.addClass('cursor_progress');
	var submit_progress_bar = Elem.find("[find=submit_progress_bar]");
	if(submit_progress_bar.length>0){
		base_format_form_single(submit_progress_bar);
		submit_progress_bar.css("display", "block");
		submit_progress_bar.removeClass('display_none');
	}
};

base_hideProgress = function(Elem){
	Elem.removeClass('cursor_progress');
	var submit_progress_bar = Elem.find("[find=submit_progress_bar]");
	if(submit_progress_bar.length>0){
		base_format_form_single(submit_progress_bar);
		submit_progress_bar.addClass('display_none');
	}
}

//This code make sure that the inputter is visible when change the keyboard style on iphone
var base_inputter_offset_target = false;
var base_inputter_offset_interval = false;
var base_inputter_offset = function(target){
	if(isIOS){
		clearInterval(base_inputter_offset_interval);
		var reset = true;
		if(target.is(':focus')){
			var bottom_offset = $(window).outerHeight() - target.offset().top - target.outerHeight();
			if(bottom_offset < 80){
				base_inputter_offset_target = target;
				base_inputter_offset_interval = setInterval(function(target){
					if(target.is(':focus')){
						$(window).scrollTop(400); //A iPhone keyboard is approximatively 315px, it seems that cannot refocus over 600px high
					} else {
						$(window).scrollTop(0);
						clearInterval(base_inputter_offset_interval);
						base_inputter_offset_interval = false;
						base_inputter_offset_target = false;
						var div = $('<div>');
						$('body').append(div);
						setTimeout(function(div){
							div.remove();
							if(!base_inputter_offset_target){
								$(window).scrollTop(0);
							}
						}, 500, div);
					}
				}, 300, target);
				reset = false;
			}
		}
		if(reset){
			if(base_inputter_offset_interval){
				var div = $('<div>');
				$('body').append(div);
				setTimeout(function(div){
					div.remove();
					if(base_inputter_offset_target && base_inputter_offset_target.is(':focus')){
						return true;
					}
					if(base_inputter_offset_target){
						base_inputter_offset_target.blur();
					}
					$(window).scrollTop(0);
					base_inputter_offset_interval = false;
					base_inputter_offset_target = false;
				}, 500, div);
			}
		}
	}
};
if(isIOS){
	$(window).on('click', function(event){
		base_inputter_offset($(event.target));
	});
}

var base_video_device_current = 0;
var base_video_device = [];
var base_has_webcam = false;
var base_has_webcam_sub = false;

//for android and ios
var base_app_scanner = {
	exists: false,
	success: function(url){
		if(typeof url == 'string'){
			base_scanner.cb_decoded(url);
		} else {
			base_show_error(Lincko.Translation.get('app', 2314, 'html'), true); //Operation failed.
		}
	},
	fail: function(){
		if(base_scanner.subm){
			submenu_chat_new_user_result(base_scanner.subm, null, "noresult");
			base_scanner.subm = null;											
		}
	},
	cancel: function(){
		base_app_scanner.fail();
	},
}

var base_hexToRgb = function(hex) {
	var result = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
};

/* customization */
var base_customize_color = function(color_one, color_two, image){
	$('#base_customize_color').remove();
	if(typeof color_one == 'string' && typeof color_two == 'string'){
		var rgb_one = base_hexToRgb(color_one);
		var rgb_two = base_hexToRgb(color_two);
		if(!rgb_one || !rgb_two){
			return false;
		}
		$("head").append('<style id="base_customize_color" type="text/css"></style>');
		var newStyleElement = $("head").children(':last');
		var color_one_r = rgb_one.r;
		var color_one_g = rgb_one.g;
		var color_one_b = rgb_one.b;
		newStyleElement.html(
			 ".base_color_text_linckoOrange.customize { color: "+color_one+"; } "
			+".base_color_text_linckoOrange_dark.customize { color: "+color_two+"; } "
			+".base_color_bg_main_gradient.customize {"
				+"background: "+color_one+";"
				+"background-color: "+color_one+";"
				+"background: -webkit-linear-gradient("+color_one+", "+color_two+") !important;"
				+"background: -o-linear-gradient("+color_one+", "+color_two+") !important;"
				+"background: -moz-linear-gradient("+color_one+", "+color_two+") !important;"
				+"background: linear-gradient("+color_one+", "+color_two+") !important;"
			+"} "
			+".app_content_menu.customize { border-right-color: rgba("+color_one_r+", "+color_one_g+", "+color_one_b+", 0.40) !important; } "
		);
	}
};
/* customization */
var base_customize_logo = function(image){
	if(typeof image == 'string' && image){
		var entreprise_logo = $('<img>').attr('src', image).addClass('base_customize_logo');
		$('#app_project_logo_span').recursiveEmpty().append(entreprise_logo);
	} else {
		$('#app_project_logo_span').recursiveEmpty().removeClass('base_customize_logo').html(wrapper_main_title);
	}
};

var base_wechat_shareData = null;
var base_wechat_shareData_garbage = null;
var base_workspace_garbage = null;
JSfiles.finish(function(){

	//customize wechat share information here
	base_workspace_garbage = app_application_garbage.add();
	app_application_lincko.add(base_workspace_garbage, 'workspaces', function() {
		//Enable to upload a picture for the logo
		if(Lincko.storage.WORKID!==null){
			if(Lincko.storage.getWORKID()==0 || Lincko.storage.amIadmin()){
				$('#app_project_logo_span').addClass('base_pointer').click(function(event){
					event.stopPropagation();
					app_upload_open_photo_single('workspaces', Lincko.storage.getWORKID(), false, true);
				});
			} else {
				$('#app_content_top_contacts, .icon-AddPerson').addClass('display_none');
			}
			if(Lincko.storage.getWORKID()){
				var workspace = Lincko.storage.get('workspaces', Lincko.storage.getWORKID());
				if(workspace){
					if(
						   typeof workspace['cus_color_one'] == 'string'
						&& typeof workspace['cus_color_two'] == 'string'
					){
						base_customize_color(workspace['cus_color_one'], workspace['cus_color_two']);
					}
					if(typeof workspace['cus_logo'] != 'undefined' && workspace['cus_logo']>0){
						base_customize_logo(Lincko.storage.getWorkspaceRaw());
					}
				}
			}
			app_application_garbage.remove(base_workspace_garbage);
		}
	});

	//Depreciation of window.MediaStreamTrack.getSources
	//Make sure the DOM is loaded first
	//This homemade polyfill is specific to use the library w69b
	if(typeof window.MediaStreamTrack == 'undefined'){
		window.MediaStreamTrack = {};
	}
	if(typeof window.MediaStreamTrack.getSources != 'function'){

		if(navigator && navigator.mediaDevices && navigator.mediaDevices.enumerateDevices){
			navigator.mediaDevices.enumerateDevices().then(function(media_device_info){
				var i = 0;
				for(var key in media_device_info){
					if(media_device_info[key]['kind']=='videoinput'){
						base_video_device[i] = {
							id: media_device_info[key]['deviceId'],
							facing: "",
							kind: media_device_info[key]['kind'],
							label: media_device_info[key]['label'],
						};
						base_has_webcam = true;
						base_has_webcam_sub = true;
						base_video_device[i]['kind'] = 'video';
						base_video_device[i]['facing'] = 'environment';
						base_video_device_current = i; //Because it seems that camera is the last video media by default
						i++;
					}
				}
			});
			window.MediaStreamTrack.getSources = function(fn1){
				if(base_has_webcam){
					var device = [];
					device[0] = base_video_device[base_video_device_current];
					fn1(device);
				}
			}
		}
	} else {
		base_has_webcam = true;
	}

	//if android app, use java-js api code to setup scanner
	if(isMobileApp()){
		base_has_webcam = false;
		base_has_webcam_sub = false;

		if(typeof android == 'object' && typeof android.scanQRCode == 'function'){
			base_app_scanner.exists = true;
			base_scanner = {
				If: true,
				dispose: function(){},
				cb_decoded: function(url_code){},
				setDecodedCallback: function(fn) {
					this.cb_decoded = fn;
				},
				subm: null, //store subm here so that "noresult" can be called on cancel callback
				render: function(Elem){
					//java to js function call will run js function in string format
					android.scanQRCode('base_app_scanner.success', 'base_app_scanner.fail', 'base_app_scanner.cancel');
				},
			};
		}
		else if(device_type()=='ios'){
			base_app_scanner.exists = true;
			base_scanner = {
				If: true,
				dispose: function(){},
				cb_decoded: function(url_code){},
				setDecodedCallback: function(fn) {
					this.cb_decoded = fn;
				},
				subm: null, //store subm here so that "noresult" can be called on cancel callback
				render: function(Elem){
					//call native iOS function
					window.webkit.messageHandlers.iOS.postMessage(
						{
							action: 'scanqrcode',
							cb_success: 'base_app_scanner.success',
							cb_fail: 'base_app_scanner.fail',
							cb_cancel: 'base_app_scanner.cancel',
						}
					);
				},
			};
		}
	}

	if(!isIOS && !navigator.userAgent.match(/MicroMessenger/i) && typeof w69b != 'undefined' && typeof w69b_qrcode_decodeworker != 'undefined'){
		w69b.qr.decoding.setWorkerUrl(w69b_qrcode_decodeworker);
	}

	//customize wechat share information here
	base_wechat_shareData_garbage = app_application_garbage.add();
	app_application_lincko.add(base_wechat_shareData_garbage, 'first_launch', function() {

		//load my QR code image but dont show
		base_toggle_myQRcode(false);

		if(!base_is_wechat || (wx && (!wx.onMenuShareAppMessage || !wx.onMenuShareTimeline))){
			app_application_garbage.remove(base_wechat_shareData_garbage);
		}
		else if(base_is_wechat && wx && wx.onMenuShareAppMessage && wx.onMenuShareTimeline){
			//sometimes username name is not prepared at this time, so use setTimeout to be run at the end of sync function
			setTimeout(function(){ 
				var username = Lincko.storage.get('users', wrapper_localstorage.uid, 'username');
				var desc;
				if(username){
					desc = Lincko.Translation.get('app', 2320, 'js', {username: username}); //[{username}] has invited you to collaborate using Lincko.
				} else {
					desc = Lincko.Translation.get('app', 2322, 'js'); //Your friend has invited you to collaborate using Lincko.
				}

				base_wechat_shareData = {
					title: 'Lincko - '+Lincko.Translation.get('wrapper', 4, 'js'), //The way of projects
					desc: desc += ('\n'+top.location.protocol+'//'+document.domainRoot),
					link: Lincko.storage.generateMyURL(),
					imgUrl: base_wechat_shareImg,
					// trigger: function(res){},
					// success: function(res){},
					// cancel: function(res){},
					// fail: function(res){},
				}
				wx.onMenuShareAppMessage(base_wechat_shareData);
				wx.onMenuShareTimeline(base_wechat_shareData);
			}, 0);
			app_application_garbage.remove(base_wechat_shareData_garbage);
		}
	});

	if(typeof wrapper_wechat_alert == 'function' && wrapper_wechat_show_official){
		wrapper_wechat_alert(false);
	}
});

base_removeLineBreaks = function(str){
	if(typeof str != 'string'){ return false; }
	return str.replace(/(\r\n|\n|\r)/gm, "");
}

//Only keep special characters line unicode
base_remove_stdchar = function(str){
	if(typeof str != 'string'){ return ""; }
	return str.replace(/[\u0000-\u007F]/gm, "");
}

base_toggle_myQRcode = function(display){
	var elem = $('#base_myQRcode_popup');
	if(Lincko.storage.generateMyQRcode()){
		elem.find('img').attr('src', Lincko.storage.generateMyQRcode());
	}
	if(typeof display == 'boolean'){
		if(!display){
			elem.addClass('visibility_hidden');
		} else {
			elem.removeClass('visibility_hidden');
		}
	}
	else{
		elem.toggleClass('visibility_hidden');
	}
}

var wrapper_xhr;
var wrapper_run = {}; //Keep a track of all form running
var wrapper_totalxhr = 0;
var wrapper_objForm = null;
var wrapper_set_shangzai = true;
var wrapper_xhr_error = true; //At false, we make communication error message appearing once, at true never
var wrapper_signing_out = false;
var wrapper_version = false;
var wrapper_version_new = false;

//Use a timer to help to force the app be refreshed if not using it and not focused on for 30 minutes
var wrapper_version_idle = false;
var wrapper_version_timer = false;
$(window).on('focus keyup change copy paste mousedown', function(){
	wrapper_version_idle = false;
	clearTimeout(wrapper_version_timer);
});
$(window).on('blur', function(){
	wrapper_version_timer = setTimeout(function(){
		wrapper_version_idle = true;
	}, 1800000); //30 min
});

// Because "const" seems to not work in some browsers
// http://stackoverflow.com/questions/24370447/the-const-keyword-in-javascript
// const fingerprint = wrapper_fp;
var fingerprint = wrapper_fp;

var wrapper_signout_cb_begin = function(){
	$(document.body).css('cursor', 'progress');
}
var wrapper_signout_cb_complete = function(){
	$(document.body).css('cursor', '');
	window.location.href = top.location.protocol+'//'+document.linckoFront+document.linckoBack+document.domainRoot;
}
var wrapper_js_response;
function wrapper_ajax(param, method, action, cb_success, cb_error, cb_begin, cb_complete, ajax_objForm){
	if(typeof cb_success==="undefined" || cb_success===null){ cb_success = function(){}; }
	if(typeof cb_error==="undefined" || cb_error===null){ cb_error = function(){}; }
	if(typeof cb_begin==="undefined" || cb_begin===null){ cb_begin = function(){}; }
	if(typeof cb_complete==="undefined" || cb_complete===null){ cb_complete = function(){}; }
	if(typeof ajax_objForm==="undefined" || ajax_objForm===null || !ajax_objForm.is('form')){ ajax_objForm = null; }
	
	wrapper_totalxhr++;
	method = method.toUpperCase();
	action = action.toLowerCase();

	//We add a random md5 code to insure we avoid getting in queue for the same ajax call
	var unique_md5 = md5(Math.random());
	var linkid = '?'+unique_md5;
	var timeout = 60000; //60s
	if(action == 'translation/auto'){
		timeout = 80000; //60s, Because the translation request has to request a third party
	}

	if(action.match(/\/create$/, '')){
		var create_temp_id = true;
		for(var i in param){
			if(typeof param[i].name != 'undefined' && param[i].name=='temp_id'){
				create_temp_id = false;
				break;
			}
		}
		if(create_temp_id){
			param[param.length] = {name:'temp_id', value:unique_md5};
		}
	}

	//initialize file uploading
	if(wrapper_set_shangzai){
		param[param.length] = {name:'set_shangzai', value:true};
	}

	//Limit download to avoid crash (iOS)
	if(wrapper_limit_json){
		param[param.length] = {name:'limit_json', value:wrapper_limit_json};
	}

	//Create a unique instance of the form for each ajax call
	if(ajax_objForm){
		param[param.length] = {name:'form_id', value:ajax_objForm.prop('id')};
		//If the form is sending an action, we quite the function to avoid double click
		if(typeof wrapper_run[ajax_objForm.prop('id')] != 'undefined'){
			return false;
		}
	}

	wrapper_xhr = $.ajax({
		url: '/wrapper/'+action+linkid,
		type: method, //Ajax calls will queue GET request only, that can timeout if the url is the same, but the PHP code still processing in background
		data: JSON.stringify(param),
		contentType: 'application/json; charset=UTF-8',
		dataType: 'json',
		timeout: timeout,
		beforeSend: function(jqXHR, settings){
			wrapper_objForm = ajax_objForm;
			if(ajax_objForm){
				wrapper_run[ajax_objForm.prop('id')] = true;
			}
			var temp_id = '';
			if(settings.data){
				var data = JSON.parse(settings.data);
				if(typeof data == 'object'){
					for(var i in data){
						if(typeof data[i].name == 'string' && typeof data[i].value == 'string'){
							if(data[i].name == 'temp_id'){
								temp_id = data[i].value;
							}
						}
					}
				}
			}
			cb_begin(jqXHR, settings, temp_id);
		},
		
		success: function(data){
			//Those 3 following lines are only for debug purpose
			//var msg = JSON.stringify(data); //for test
			//var msg = data; //for test
			//var msg = JSON.parse(data.msg); //for test
			//console.log(data);

			//This is importat because sometime in msg we return an object with some information inside
			var msg = data.msg;
			if(typeof data.show == 'string'){
				msg = data.show;
			} else if($.type(msg) == 'object' && msg.msg){
				msg = msg.msg;
			} else if(typeof msg != 'string'){
				msg = '';
			}
			
			if(data.show && typeof base_show_error == 'function'){
				base_show_error(msg, data.error);
			}

			if(wrapper_localstorage.logged && data.sha && wrapper_localstorage.sha!=data.sha){
				//This helps to refresh the page with the new account merged
				window.location.href = wrapper_link['root'];
			}

			if(wrapper_localstorage.workspace == "" && typeof data.workspace != 'undefined' && data.workspace != wrapper_localstorage.workspace){
				//Switch to another workspace if different than the current one
				var workspace = "";
				if(data.workspace){
					workspace = data.workspace+".";
				}
				wrapper_link['root'] = top.location.protocol+'//'+document.linckoFront+document.linckoBack+workspace+document.domain+'/';
				//Stop database webworker
				if(webworker){
					webworker.terminate();
				}
				wrapper_localstorage.encrypt('lastvisit', 0, false, true);
				wrapper_localstorage.cleanLocalUser();
				wrapper_localstorage.cleanLocalWorkspace();

				setTimeout(function(){
					window.location.href = top.location.protocol+'//'+document.linckoFront+document.linckoBack+workspace+document.domain;
				}, 2000);
			}

			if(typeof data.refresh != 'undefined' && data.refresh){
				//This helps to refresh the page with the new account merged
				Lincko.storage.getLatest(true, function(){
					window.location.href = wrapper_link['root'];
				});
			}

			if(typeof isOffline_update == 'function'){
				isOffline_update(false);
			}

			if(data.error){
				//JSerror.sendError(JSON.stringify(data, null, 4), '/wrapper.js/wrapper_ajax().success()', 0);
				console.log(data);
			}

			if(data.shangzai){
				wrapper_shangzai = data.shangzai;
				wrapper_localstorage.encrypt('shangzai', data.shangzai, false, true);
				wrapper_set_shangzai = false;
			}

			//Exit if we are signout
			if(data.signout && !wrapper_signing_out && wrapper_localstorage.logged){
				wrapper_signing_out = true; //Avoid a loop
				if(data.show && typeof base_show_error == 'function'){
					base_show_error(Lincko.Translation.get('app', 33, 'js')); //You are not allowed to access this workspace. (keep it blue to avoid it looking like a bug message)
				}
				setTimeout(function(){
					wrapper_sendAction('','post','user/signout', null, null, wrapper_signout_cb_begin, wrapper_signout_cb_complete);
				}, 200);
			}

			//Get back the form object if it was sent from a form
			wrapper_objForm = ajax_objForm;

			//Force to update elements if the function is available
			if(typeof storage_cb_success == 'function'){
				storage_cb_success(msg, data.error, data.status, data.msg);
			}

			// Below is the production information with "dataType: 'json'"
			cb_success(msg, data.error, data.status, data.msg);

			//If the language changed, we force to refresh the page
			if(typeof data.language != 'undefined'){
				setTimeout(function(language){
					if(typeof app_language_short != 'undefined' && typeof language != 'undefined' && app_language_short != language){
						//window.location.href = wrapper_link['root']; //toto => disable for debugging purpose
					}
				}, 500, data.language);
			}

			if(typeof data.version == 'string'){
				if(wrapper_version && data.version){
					if(wrapper_version != data.version){ //new version available
						wrapper_version_new = true;
						if(wrapper_version_idle){
							wrapper_localstorage.encrypt('lastvisit', 0, false, true);
							wrapper_localstorage.cleanLocalUser();
							wrapper_localstorage.cleanLocalWorkspace();
							window.location.href = wrapper_link['root'];
						}
					}
				} else {
					wrapper_version = data.version;
				}
			}

		},
		
		error: function(xhr_err, ajaxOptions, thrownError){
			if(typeof isOffline_update == 'function'){
				isOffline_update(true);
			}
			//Get back the form object if it was sent from a form
			wrapper_objForm = ajax_objForm;
			var msg = wrapper_totalxhr+') '+'xhr.status => '+xhr_err.status
				+'\n'
				+'ajaxOptions => '+ajaxOptions
				+'\n'
				+'thrownError => '+thrownError;

			var show_error = true;
			if(typeof this.show_error != 'undefined'){
				show_error = this.show_error;
			}
			if(show_error && !wrapper_xhr_error && ajaxOptions!='abort' && ajaxOptions!='timeout'){
				JSerror.sendError(msg, '/wrapper.js/wrapper_ajax().error()', 0);
				wrapper_xhr_error = true; //Make this message appearing only once
			}
			if(show_error && ajaxOptions!='abort'){
				console.log(msg);
			}
			cb_error(xhr_err, ajaxOptions, thrownError);

			/*
			//To retry a timeout is dangerous, it will keep adding calls like getSchema (heavy CPU backend) and be called tons at once once interent is back, can slow down the server.
			else if(ajaxOptions=='error'){
				//Keep retry every 5s
				setTimeout(function(ajax_call){
					$.ajax(ajax_call);
				}, 20000, this);
			}
			*/
			this.show_error = false;
		},
		complete: function(){
			//Get back the form object if it was sent from a form
			wrapper_objForm = ajax_objForm;
			wrapper_xhr = false;
			cb_complete();
			//Enable the submit action once the action is finished
			if(ajax_objForm){
				delete wrapper_run[ajax_objForm.prop('id')];
			}
			wrapper_objForm = null;
			//Force to open the page, if not we may stuck to the loading page in case the user does not have updates
			if(this.url.indexOf('/wrapper/data/latest')===0){
				setTimeout(function(){
					wrapper_load_progress.move(100);
				}, 200);
			}
		},
	});
}

//This function must return false, we do not send form action, we just use ajax.
function wrapper_sendForm(objForm, cb_success, cb_error, cb_begin, cb_complete, param, force_action){
	if(typeof cb_success==="undefined" || cb_success===null){ cb_success = function(){}; }
	if(typeof cb_error==="undefined" || cb_error===null){ cb_error = function(){}; }
	if(typeof cb_begin==="undefined" || cb_begin===null){ cb_begin = function(){}; }
	if(typeof cb_complete==="undefined" || cb_complete===null){ cb_complete = function(){}; }
	if(typeof param==="undefined"){ param = null; }

	if($.type(objForm)=="string"){
		objForm = $("#"+objForm);
	} else {
		objForm = $(objForm);
	}
	var ajax_objForm = wrapper_objForm = objForm;
	var valid = true;
	$.each(objForm.find('input'), function() {
		if(typeof base_input_field == 'object'){
			if(this.name in base_input_field){
				if(typeof base_input_field[this.name].valid == "function" && typeof base_input_field[this.name].error_msg == "function"){
					if(!base_input_field[this.name].valid($(this).val())){
						var data = base_input_field[this.name].error_msg();
						if(!base_input_field[this.name].hide && typeof base_show_error == 'function'){
							base_show_error(data.msg, true);
						}
						cb_success(data.msg, true, 400, data);
						valid = false;
						return false; //Disable submit action
					}
				}
			}
		}
		return true;
	});
	
	if(!valid){
		return false;
	}
	
	if (objForm.length>0 && objForm.is('form')){
		objForm.on('submit', function(e) {
			 e.preventDefault(); //Disable submit action
		});
		var arr = objForm.serializeArray();
		var method = objForm.prop('method');
		//We use post method by default
		if(typeof objForm.attr('method') == 'undefined'){
			method = 'post';
		}
		var action = objForm.attr('action'); //Do not use prop here because (attr => user/logout | prop => https://lincko.net/user/logout (error))
		if(typeof force_action == 'string'){
			action = force_action;
		} else if(typeof action != 'string'){
			action = '';
		}

		//We convert to an table any integer or string, if not the back server will not see it ($this->data->0)
		if(param===false || param==='' || param===null){
			param = [];
		} else if(!$.isArray(param) && !$.isPlainObject(param)){
			//Here do not use "new Array(param)", because param[0] will be undefined if param is an integer
			param = [param];
		}
		
		//Convert the array to the same format as jQuery does with forms
		for(var val in param){
			if(typeof param[val] != 'undefined'){
				arr.push({name:val, value:param[val]});
			}
		}

		wrapper_ajax(arr, method, action, cb_success, cb_error, cb_begin, cb_complete, ajax_objForm);
	} else {
		cb_success(Lincko.Translation.get('wrapper', 2, 'html'), true, 400, null); //The form does not exist!
		return false; //Disable submit action
	}
	return false; //Disable submit action
}

//param: array/string/number
function wrapper_sendAction(param, method, action, cb_success, cb_error, cb_begin, cb_complete){
	if(typeof cb_success==="undefined" || cb_success===null){ cb_success = function(){}; }
	if(typeof cb_error==="undefined" || cb_error===null){ cb_error = function(){}; }
	if(typeof cb_begin==="undefined" || cb_begin===null){ cb_begin = function(){}; }
	if(typeof cb_complete==="undefined" || cb_complete===null){ cb_complete = function(){}; }
	
	var arr = [];
	
	//We convert to an table any integer or string, if not the back server will not see it ($this->data->0)
	if(param===false || param==='' || param===null){
		param = [];
	} else if(!$.isArray(param) && !$.isPlainObject(param)){
		//Here do not use "new Array(param)", because param[0] will be undefined if param is an integer
		param = [param];
	}

	//Add lastvisit to help saving some unecessary codes
	if(typeof param['lastvisit'] == 'undefined' && typeof Lincko.storage == 'object' && typeof Lincko.storage.getLastVisit == 'function'){
		param['lastvisit'] = Lincko.storage.getLastVisit();
	}
	
	//Convert the array to the same format as jQuery does with forms
	for(var val in param){
		if(typeof param[val] != 'undefined'){
			arr.push({name:val, value:param[val]});
		}
	}
	
	wrapper_ajax(arr, method, action, cb_success, cb_error, cb_begin, cb_complete);
	return false; //Disable submit action
}

function wrapper_force_resign(cb_success, cb_error, cb_begin, cb_complete){
	if(typeof cb_success==="undefined" || cb_success===null){ cb_success = function(){}; }
	if(typeof cb_error==="undefined" || cb_error===null){ cb_error = function(){}; }
	if(typeof cb_begin==="undefined" || cb_begin===null){ cb_begin = function(){}; }
	if(typeof cb_complete==="undefined" || cb_complete===null){ cb_complete = function(){}; }
	wrapper_sendAction('', 'post', 'user/resign', cb_success, cb_error, cb_begin, cb_complete);
	return true;
}

function wrapper_get_shangzai(){
	if(wrapper_shangzai){
		return wrapper_shangzai;
	} else if(shangzai = wrapper_localstorage.decrypt('shangzai')){
		wrapper_shangzai = shangzai;
	}
	return false;
}

wrapper_localstorage.encrypt = function (link, data, tryit, now){
	if(!link){
		return false;
	}
	if(typeof tryit == 'undefined'){ tryit = true; }
	if(typeof now == 'undefined'){ now = false; }
	var result = false;
	//If we over quota once, we do not continue to avoid CPU usage, it slow down the first loading but it's an easy solution
	//A more complex solution would be to progressively delete few elements, and only load them at start, but it's a CPU consumer method
	if(typeof this.quota[link] != 'undefined' && !this.quota[link]){
		return true;
	} else {
		if(!now && webworker){
			var webworker_data = {
				action: 'compress',
				data: {
					link: link,
					data: data,
					tryit: tryit,
					sha: wrapper_localstorage.sha,
					prefix: wrapper_localstorage.prefix,
				},
			};
			if(!webworker.postMessage(webworker_data)){
				result = false;
			}
		} else {
			try {
				//var store_data = LZipper.compress(link+wrapper_localstorage.sha+utf8_encode(JSON.stringify(data))); //Best
				var store_data = LZipper.compress(link+wrapper_localstorage.sha+JSON.stringify(data)); //Best
				var time = 1000*3600*24*90; //Keep the value for 3 months
				result = amplify.store(wrapper_localstorage.prefix+link, store_data, { expires: time });
			} catch(e) {
				wrapper_localstorage.quota[link] = false;
				amplify.store(wrapper_localstorage.prefix+link, null);
				console.log(e);
			}
		}
	}
	return result;
};

wrapper_localstorage.decrypt = function (link){
	var result = false;
	var temp;
	//If we cannot decrypt, the data might be conrupted, so we delete it
	try {
		temp = LZipper.decompress(amplify.store(this.prefix+link));
		if(temp.indexOf(link+this.sha)===0){
			data = temp.substr(link.length+this.sha.length);
			//return JSON.parse(utf8_decode(data)); //Best
			return JSON.parse(data); //Best
		}
	} catch(e) {
		amplify.store(this.prefix+link, null);
		result = false;
	}
	return result;
};

//Force to delete all data that are not linked to the workspace to release some space
wrapper_localstorage.cleanLocalWorkspace = function(){
	var result = false;
	$.each(amplify.store(), function (storeKey) {
		result = true;
		if(storeKey.indexOf(wrapper_localstorage.prefix)!==0){
			amplify.store(storeKey, null);
		}
	});
	//console.log(result);
	return result;
};

//Force to delete all data that are not linked to the user for security reason and to release some space
wrapper_localstorage.cleanLocalUser = function(){
	$.each(amplify.store(), function (storeKey) {
		if(storeKey.indexOf(wrapper_localstorage.prefixuid)!==0){
			amplify.store(storeKey, null);
		}
	});
};

//Default is Mobile
var wrapper_IScroll_options = {
	click: false, //At true, on mobile it works but but the element doesn't flash
	keyBindings: false, //by default disable iscroll reacting to keyboard keys (arrows, pageup/pagedown etc)
	mouseWheel: true,
	scrollbars: true,
	scrollX: false,
	scrollY: true,
	fadeScrollbars: true,
	interactiveScrollbars: false,
	shrinkScrollbars: 'clip',
	scrollbars: 'custom',
	preventDefaultException: {tagName:/.*/},
	HWCompositing: hasGood3Dsupport,

	disablePointer: true, // important to disable the pointer events that causes the issues
	disableTouch: false, // false if you want the slider to be usable with touch devices
	disableMouse: false, // false if you want the slider to be usable with a mouse (desktop)

	//[Mobile devices] The disavantage is that on desktop the click event will be launch after a mouse move (= scroll)
	//click: false,
	//[Desktop] The disavantage is that we don't see the mouse click by css (:active)
	//click: true,
};

//toto => After CTRL+C, iScroll bugs, cannot click or scroll


//For Desktop support
if(!supportsTouch){
	wrapper_IScroll_options.fadeScrollbars = false;
	wrapper_IScroll_options.click = true; //true avoid ghost click for Desktop (Migth be a problem for hybrid computer like Surface Pro)
	wrapper_IScroll_options.interactiveScrollbars = true;
	wrapper_IScroll_options.shrinkScrollbars = 'scale'; //CPU hunger, not suitable for mobiles
}

var wrapper_IScroll_options_new = {};
var wrapper_IScroll_cb_creation = {};

var myIScrollList = {};

function wrapper_IScroll(){
	// We do not allow iScroll for mobile device, native scroll helps to make things running smoothly, but we need to careful the callback
	var overthrow = $('.overthrow');
	/*
	if(supportsTouch && responsive.test("maxTablet")){ //Keep using iScroll for desktop, even if touch support is activated, CPU is fast enough
		console.log('supportsTouch');
		//overthrow.css('overflow','auto');
		overthrow.css('overflow', 'hidden').css('overflow-x', 'hidden').css('overflow-y', 'auto');
		return true;
	}
	*/
	overthrow.css('overflow', 'hidden').css('overflow-x', 'hidden').css('overflow-y', 'hidden');
	//Create new
	overthrow.each(function(){
		var Elem = $(this);
		var Child = Elem.children().first();
		if(Child.length>0){
			if(!this.id){
				this.id = "overthrow_"+md5(Math.random());
			}
			if(
				   !myIScrollList[this.id]
				|| Child.hasClass('iscroll_destroyed')
				|| (myIScrollList[this.id] && !Child.hasClass('iscroll_sub_div'))
			){
				Child.removeClass('iscroll_destroyed');
				//Merge with optional options
				var wrapper_IScroll_options_temp = {};
				//We have to loop to recreate the object because of JS memory assignment
				for(key in wrapper_IScroll_options){
					wrapper_IScroll_options_temp[key] = wrapper_IScroll_options[key];
				}
				//We add specific options to the element
				if(typeof wrapper_IScroll_options_new[this.id] == 'object'){
					for(key in wrapper_IScroll_options_new[this.id]){
						wrapper_IScroll_options_temp[key] = wrapper_IScroll_options_new[this.id][key];
					}
				}

				//Enable vertical and horizontal scrolling
				if(!Child.hasClass('iscroll_sub_div')){
					Elem.children().wrapAll('<div class="iscroll_sub_div" />');
					var div_scroll = Elem.children().first();
					if(typeof wrapper_IScroll_options_temp.scrollX != 'undefined' && wrapper_IScroll_options_temp.scrollX){
						div_scroll.addClass('scrollX');
						Elem.width('100%'); //Be sure that it will not stretch up the parent element
					}
					if(typeof wrapper_IScroll_options_temp.scrollY != 'undefined' && wrapper_IScroll_options_temp.scrollY){
						div_scroll.addClass('scrollY');
						Elem.height('100%'); //Be sure that it will not stretch up the parent element
					}
				}
				
				myIScrollList[this.id] = new IScroll(this, wrapper_IScroll_options_temp);
				//We add specific options to the element
				if(typeof wrapper_IScroll_cb_creation[this.id] == 'function'){
					wrapper_IScroll_cb_creation[this.id]();
				}
			}
		}
	});

	//Reinitialize or Delete all in a setTimeout to be sure it's loaded after DOM repainting
	setTimeout(wrapper_IScroll_refresh, wrapper_timeout_timer);
};

var wrapper_IScroll_refresh = function(){
	var Elem = false;
	var Child = null;
	for(var i in myIScrollList){
		Elem = $('#'+i);
		Child = Elem.children().first();
		if(Elem.length>0){
			if(Elem.hasClass('overthrow')){
				if('refresh' in myIScrollList[i]){
					myIScrollList[i].refresh();
					continue;
				}
			} else {
				if('destroy' in myIScrollList[i]){
					if(Child.length>0 && Child.hasClass('iscroll_sub_div')){
						Child.addClass('iscroll_destroyed');
					}
				}
				myIScrollList[i].destroy();
			}
		}
		myIScrollList[i] = null;
		delete myIScrollList[i];
	}
}

var wrapper_timeout_timer = 200;
var wrapper_IScroll_timer;
$(window).resize(function(){
	clearTimeout(wrapper_IScroll_timer);
	wrapper_IScroll_timer = setTimeout(wrapper_IScroll, wrapper_timeout_timer);
});

function wrapper_clean_chart(id_elem_parent){
	for(var i in Chart.instances){
		if(id_elem_parent && id_elem_parent == Chart.instances[i].chart.canvas.offsetParent.id){
			Chart.instances[i].destroy();
		}
		else if(!Chart.instances[i].chart.canvas.clientWidth){
			Chart.instances[i].destroy();
		}
	}
}

//http://stackoverflow.com/questions/23885255/how-to-remove-ignore-hover-css-style-on-touch-devices
//This disable some unwanted behavior the double tapping within the 300ms
//This function is slow to run, so use it in another thread
function wrapper_mobile_hover(){
	if (supportsTouch && responsive.test("maxMobileL")) { // remove all :hover stylesheets
		try { // prevent crash on browsers not supporting DOM styleSheets properly
			//We first disbale Fastclick on some elements
			$("[contenteditable], textarea, [type=checkbox], [type=password], [type=radio], [type=text]").addClass('needsclick');
			//Remove hover
			for (var si in document.styleSheets) {
				var styleSheet = document.styleSheets[si];
				if (!styleSheet.rules){
					continue;
				}
				for (var ri = styleSheet.rules.length - 1; ri >= 0; ri--) {
					if (!styleSheet.rules[ri].selectorText){
						continue;
					}
					if (styleSheet.rules[ri].selectorText.match(':hover')) {
						styleSheet.rules[ri].selectorText = styleSheet.rules[ri].selectorText.replace(":hover", ":active");
					}
				}
			}
		} catch (ex) {}
	}
}

//Genereate
var wrapper_wechat_login_qrcode = function(){
	return top.location.protocol+'//'+document.linckoFront+document.linckoBack+document.domainRoot+'/integration/wechat/wxqrcode?timeoffset='+wrapper_timeoffset()+'&ts='+(new wrapper_date().timestamp);
}

//Set indice performance to run some javascript (mainly animation) on powerfull devices
var wrapper_performance = {
	indice: false,
	powerfull: false,
	delay: 250, //Additional delay for slow mobile (max 250ms)
	init: function(){
		if(webperf){
			webperf.postMessage({action: 'checkPerformance'});
		}
	},
	setDelay: function(){
		//Based on a 30 loop test
		if(wrapper_performance.indice){
			wrapper_performance.delay = Math.max(0, Math.min(250, 2 * (wrapper_performance.indice - 150)));
		}
	},
};
//By default we consider as powerfull if the width screen is the one of a Tablet Landscape
if(responsive.test("minTablet")){
	wrapper_performance.powerfull = true;
	wrapper_performance.delay = 50;
}

JSfiles.finish(function(){
	wrapper_IScroll();
	wrapper_localstorage.cleanLocalUser();
	if(!isIOS){
		FastClick.attach(document.body);
	}
	setTimeout(wrapper_mobile_hover, 100); //Load it in another thread to not slow down the page loading
	setTimeout(function(){
		//We don't use it yet because the indice seems not relevant enough
		wrapper_performance.init();
	}, 1000);
});

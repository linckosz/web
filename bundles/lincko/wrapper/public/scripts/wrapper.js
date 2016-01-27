var wrapper_xhr;
var wrapper_run = {}; //Keep a track of all form running
var wrapper_totalxhr = 0;
var wrapper_objForm = null;
var wrapper_shangzai = {
		puk: null,
		cs: null,
};
var wrapper_set_shangzai = true;

// Because "const" seems to not work in some browsers
// http://stackoverflow.com/questions/24370447/the-const-keyword-in-javascript
// const fingerprint = wrapper_fp;
var fingerprint = wrapper_fp;

var wrapper_signout_cb_begin = function(){
	$(document.body).css('cursor', 'progress');
}
var wrapper_signout_cb_complete = function(){
	$(document.body).css('cursor', '');
	window.location.href = wrapper_link['home'];
}

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
	var linkid = '?'+md5(Math.random());
	var timeout = 10000; //10s
	if(action == 'translation/auto'){
		timeout = 20000; //20s, Twice the time because the translation request has to request a third party
	}

	//initialize file uploading
	if(wrapper_set_shangzai){
		param[param.length] = {name:'set_shangzai', value:wrapper_set_shangzai};
	}

	//Create a unique instance of the form for each ajax call
	if(ajax_objForm){
		param[param.length] = {name:'form_id', value:ajax_objForm.prop('id')};
		//If the form is sending an action, we quite the function to avoid double click
		if(typeof wrapper_run[ajax_objForm.prop('id')] !== 'undefined'){
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
		beforeSend: function(){
			wrapper_objForm = ajax_objForm;
			if(ajax_objForm){
				wrapper_run[ajax_objForm.prop('id')] = true;
			}
			cb_begin();
		},
		success: function(data){
			//Those 3 following lines are only for debug purpose
			//var msg = JSON.stringify(data); //for test
			//var msg = data; //for test
			//var msg = JSON.parse(data.msg); //for test

			//Get back the form object if it was sent from a form
			wrapper_objForm = ajax_objForm;

			//This is importat because sometime in msg we return an object with some information inside
			var msg = data.msg;
			if(typeof data.show === 'string'){
				msg = data.show;
			} else if($.type(msg) === 'object' && msg.msg){
				msg = msg.msg;
			} else if(typeof msg !== 'string'){
				msg = '';
			}
			if(data.error){
				JSerror.sendError(JSON.stringify(data), '/wrapper.js/wrapper_ajax().success()', 0);
				console.log(data);
			}
			if(data.shangzai && data.shangzai.puk && data.shangzai.cs){
				wrapper_shangzai = data.shangzai;
				wrapper_localstorage.encrypt('shangzai', JSON.stringify(data.shangzai));
				wrapper_set_shangzai = false;
			}
			
			if(data.show && typeof base_show_error === 'function'){
				base_show_error(msg, data.error);
			}

			//Force to update elements if the function is available
			if(typeof storage_cb_success === 'function'){
				storage_cb_success(msg, data.error, data.status, data.msg);
			}

			// Below is the production information with "dataType: 'json'"
			cb_success(msg, data.error, data.status, data.msg);
		},
		error: function(xhr_err, ajaxOptions, thrownError){
			//Get back the form object if it was sent from a form
			wrapper_objForm = ajax_objForm;
			var msg = wrapper_totalxhr+') '+'xhr.status => '+xhr_err.status
				+'\n'
				+'ajaxOptions => '+ajaxOptions
				+'\n'
				+'thrownError => '+thrownError;
			if(ajaxOptions!='abort' && ajaxOptions!='timeout'){
				JSerror.sendError(msg, '/wrapper.js/wrapper_ajax().error()', 0);
			}
			if(ajaxOptions!='abort'){
				console.log(msg);
			}
			cb_error(xhr_err, ajaxOptions, thrownError);
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
	
	if($.type(objForm)==="string"){
		objForm = $("#"+objForm);
	} else {
		objForm = $(objForm);
	}
	var ajax_objForm = wrapper_objForm = objForm;
	var valid = true;
	$.each(objForm.find('input'), function() {
		if(typeof base_input_field === 'object'){
			if(this.name in base_input_field){
				if(typeof base_input_field[this.name].valid === "function" && typeof base_input_field[this.name].error_msg === "function"){
					if(!base_input_field[this.name].valid($(this).val())){
						var data = base_input_field[this.name].error_msg();
						if(typeof base_show_error === 'function'){
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
		if(typeof objForm.attr('method') === 'undefined'){
			method = 'post';
		}
		var action = objForm.attr('action'); //Do not use prop here because (attr => user/logout | prop => https://lincko.net/user/logout (error))
		if(typeof force_action === 'string'){
			action = force_action;
		} else if(typeof action !== 'string'){
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
			if(typeof param[val] !== 'undefined'){
				arr.push({name:val, value:param[val]});
			}
		}
		
		wrapper_ajax(arr, method, action, cb_success, cb_error, cb_begin, cb_complete, ajax_objForm);
	} else {
		cb_success(Lincko.Translation.get('wrapper', 2, 'html'), true, 400); //The form does not exist!
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
	
	//Convert the array to the same format as jQuery does with forms
	for(var val in param){
		if(typeof param[val] !== 'undefined'){
			arr.push({name:val, value:param[val]});
		}
	}
	wrapper_ajax(arr, method, action, cb_success, cb_error, cb_begin, cb_complete);
	return false; //Disable submit action
}

function wrapper_force_resign(){
	wrapper_sendAction('','get','user/resign');
	return true;
}

/*
//Do not allow it, it migth create bugs
function wrapper_disable_submit(){
	//Disable submit action of all forms
	//Enable only submit of uploading files forms (multipart/form-data) because files cannot be sent by Ajax
	$("form[enctype!='multipart/form-data']").on('submit', function(e) {
		e.preventDefault(); //Disable submit action by click
	});
}
*/

function wrapper_get_shangzai(field){
	var result = false;
	var shangzai = false;
	if(typeof field !== 'string'){
		result = false;
	} else if(wrapper_shangzai[field]){
		result = wrapper_shangzai[field];
	} else if(shangzai = wrapper_localstorage.decrypt('shangzai')){
		shangzai = JSON.parse(shangzai);
		if(shangzai[field]){
			result = wrapper_shangzai[field] = shangzai[field];
		}
	}
	return result;
}

wrapper_localstorage.encrypt = function (link, txt, tryit){
	if(typeof tryit === 'undefined'){ tryit = true; }
	var result = false;
	//If we over quota once, we do not continue to avoid CPU usage, it slow down the first loading but it's an easy solution
	//A more complex solution would be to progressively delete few elements, and only load them at start, but it's a CPU consumer method
	if(typeof this.quota[link] !== 'undefined' && !this.quota[link]){
		return true;
	} else {
		try {
			var store_txt = this.sha+btoa(utf8_encode(txt));
			var time = 1000*3600*24*31; //Keep the value for 1 month
			result = amplify.store(this.prefix+link, store_txt, { expires: time });
		} catch(e) {
			if(tryit){
				if(wrapper_localstorage.cleanLocalWorkspace()){ //Delete other workspace data, and try one more time to store
					result = wrapper_localstorage.encrypt(link, txt, false);
				} else {
					tryit = false;
				}
			}
			if(!tryit){ //If cannot, just delete teh data
				this.quota[link] = false;
				amplify.store(this.prefix+link, null);
				console.log(e);
			}
		}
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
	console.log(result);
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

wrapper_localstorage.decrypt = function (link){
	var txt = false;
	var temp;
	//If we cannot decrypt, the data might be conrupted, so we delete it
	try {
		temp = amplify.store(this.prefix+link);
		if(temp.indexOf(this.sha)===0){
			txt = temp.substr(this.sha.length);
			return utf8_decode(atob(txt));
		}
	} catch(e) {
		amplify.store(this.prefix+link, null);
		txt = false;
	}
	return txt;
};

//Default is Mobile
var wrapper_IScroll_options = {
	click: false, //At true, on mobile it works but but the element doesn't flash
	keyBindings: true,
	mouseWheel: true,
	scrollbars: true,
	scrollX: false,
	scrollY: true,
	fadeScrollbars: true,
	interactiveScrollbars: false,
	shrinkScrollbars: 'clip',
	scrollbars: 'custom',
	preventDefaultException: {tagName:/.*/},

	//[Mobile devices] The disavantage is that on desktop the clikc event will be launch after a mouse move (= scroll)
	//click: false,
	//[Desktop] The disavantage is that we don't see the mouse click by css (:active)
	//click: true,
};

//For Desktop support
if(!supportsTouch){
	wrapper_IScroll_options.fadeScrollbars = false;
	wrapper_IScroll_options.click = true; //true avoid ghost click for Desktop (Migth be a problem for hybrid computer like Surface Pro)
	wrapper_IScroll_options.interactiveScrollbars = true;
	wrapper_IScroll_options.shrinkScrollbars = 'scale'; //CPU hunger, not suitable for mobiles
}

var wrapper_IScroll_options_new = {};

var myIScrollList = {};
function wrapper_IScroll(){
	var overthrow = $('.overthrow');
	overthrow.css('overflow', 'hidden').css('overflow-x', 'hidden').css('overflow-y', 'hidden');
	//Create new
	overthrow.each(function(){
		var Elem = $(this);
		var Child = Elem.children().first();
		if(Child.length>0){
			if(!this.id){
				this.id = "overthrow_"+md5(Math.random());
			}
			if(!myIScrollList[this.id] || Child.hasClass('iscroll_destroyed')){
				Child.removeClass('iscroll_destroyed')
				//Merge with optional options
				var wrapper_IScroll_options_temp = {};
				//We have to loop to recreate the object because of JS memory assignment
				for(key in wrapper_IScroll_options){
					wrapper_IScroll_options_temp[key] = wrapper_IScroll_options[key];
				}
				//We add specific options to the element
				if(typeof wrapper_IScroll_options_new[this.id] === 'object'){
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
			}
		}
	});

	//Reinitialize or Delete all in a setTimeout to be sure it's loaded after DOM repainting
	setTimeout(function(){
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
	}, wrapper_timeout_timer);
};

var wrapper_timeout_timer = 200;
var wrapper_IScroll_timer;
$(window).resize(function(){
	clearTimeout(wrapper_IScroll_timer);
	wrapper_IScroll_timer = setTimeout(wrapper_IScroll, wrapper_timeout_timer);
});

function wrapper_clean_chart(){
	for(var i in Chart.instances){
		if(!Chart.instances[i].chart.canvas.clientWidth){
			Chart.instances[i].destroy();
		}
	}
}

JSfiles.finish(function(){
	wrapper_IScroll();
	wrapper_localstorage.cleanLocalUser();
	FastClick.attach(document.body);
});

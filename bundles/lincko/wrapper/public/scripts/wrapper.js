var wrapper_xhr;
var wrapper_totalxhr = 0;

function wrapper_ajax(param, method, action, cb_success, cb_error, cb_begin, cb_complete){
	if(typeof cb_success==="undefined"){ cb_success = function(){}; }
	if(typeof cb_error==="undefined"){ cb_error = function(){}; }
	if(typeof cb_begin==="undefined"){ cb_begin = function(){}; }
	if(typeof cb_complete==="undefined"){ cb_complete = function(){}; }
	
	wrapper_totalxhr++;
	method = method.toUpperCase();
	action = action.toLowerCase();

	//We add a random md5 code to insure we avoid getting in queue for the same ajax call
	var linkid = '?'+md5(Math.random());
	var timeout = 10000; //10s
	if(action == 'translation/auto'){
		timeout = 20000; //20s, Twice the time because the translation request has to request a third party
	}

	wrapper_xhr = $.ajax({
		url: '/wrapper/'+action+linkid,
		type: method, //Ajax calls will queue GET request only, that can timeout if the url is the same, but the PHP code still processing in background
		data: JSON.stringify(param),
		contentType: 'application/json; charset=UTF-8',
		dataType: 'json',
		timeout: timeout,
		beforeSend: function(){
			cb_begin();
		},
		success: function(data){
			//Those 3 following lines are only for debug purpose
			//var msg = JSON.stringify(data); //for test
			//var msg = data; //for test
			//var msg = JSON.parse(data.msg); //for test

			//This is importat because sometime in msg we return an object with some information inside
			var msg = data.msg;
			if(typeof msg === 'object' && msg.msg){
				msg = msg.msg;
			}
			if(data.error){
				JSerror.sendError(JSON.stringify(data), '/wrapper.js/wrapper_ajax().success()', 0);
				console.log(data);
			}
			// Below is the production information with "dataType: 'json'"
			cb_success(msg, data.error, data.status, data.msg);
		},
		error: function(xhr_err, ajaxOptions, thrownError){
			var msg = wrapper_totalxhr+') '+'xhr.status => '+xhr_err.status
				+'\n'
				+'ajaxOptions => '+ajaxOptions
				+'\n'
				+'thrownError => '+thrownError;

			JSerror.sendError(msg, '/wrapper.js/wrapper_ajax().error()', 0);
			console.log(msg);
			cb_error(xhr_err, ajaxOptions, thrownError);
		},
		complete: function(){
			wrapper_xhr = false;
			cb_complete();
		},
	});
}

var wrapper_objForm = null;
//This function must return false, we do not send form action, we just use ajax.
function wrapper_sendForm(objForm, cb_success, cb_error, cb_begin, cb_complete){
	if(typeof cb_success==="undefined"){ cb_success = function(){}; }
	if(typeof cb_error==="undefined"){ cb_error = function(){}; }
	if(typeof cb_begin==="undefined"){ cb_begin = function(){}; }
	if(typeof cb_complete==="undefined"){ cb_complete = function(){}; }
	if($.type(objForm)==="string"){
		objForm = $("#"+objForm);
	} else {
		objForm = $(objForm);
	}
	wrapper_objForm = objForm;
	var valid = true;
	$.each(objForm.find('input'), function() {
		if(this.name in base_input_field){
			if(typeof base_input_field[this.name].valid === "function" && typeof base_input_field[this.name].error_msg === "function"){
				if(!base_input_field[this.name].valid($(this).val())){
					cb_success(base_input_field[this.name].error_msg(), true, 400);
					valid = false;
					return false; //Disable submit action
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
		var param = objForm.serializeArray();
		var method = objForm.prop('method');
		var action = objForm.attr('action'); //Do not use prop here because (attr => user/logout | prop => https://lincko.net/user/logout (error))
		wrapper_ajax(param, method, action, cb_success, cb_error, cb_begin, cb_complete);
	} else {
		cb_success(Lincko.Translation.get('wrapper', 2, 'html'), true, 400); //The form does not exist!
		return false; //Disable submit action
	}
	return false; //Disable submit action
}

//param: array/string/number
function wrapper_sendAction(param, method, action, cb_success, cb_error, cb_begin, cb_complete){
	if(typeof cb_success==="undefined"){ cb_success = function(){}; }
	if(typeof cb_error==="undefined"){ cb_error = function(){}; }
	if(typeof cb_begin==="undefined"){ cb_begin = function(){}; }
	if(typeof cb_complete==="undefined"){ cb_complete = function(){}; }
	
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
		arr.push({name:val, value:param[val]});
	}
	wrapper_ajax(arr, method, action, cb_success, cb_error, cb_begin, cb_complete);
	return false; //Disable submit action
}

function wrapper_force_resign(){
	wrapper_sendAction('','get','user/resign');
	return true;
}

/*
function wrapper_disable_submit(){
	//Disable submit action of all forms
	//Enable only submit of uploading files forms (multipart/form-data) because files cannot be sent by Ajax
	$("form[enctype!='multipart/form-data']").on('submit', function(e) {
		e.preventDefault(); //Disable submit action by click
	});
}

$(function() {
	wrapper_disable_submit();
});
*/
var xhr;
var totalxhr = 1;

function wrapper(param, method, action, cb_success, cb_error, cb_complete){

	totalxhr++;
	method = method.toUpperCase();
	action = action.toLowerCase();

	//We add a random md5 code to insure we avoid getting in queue for the same ajax call
	var linkid = '?'+md5(Math.random());
	var timeout = 10000; //10s
	if(action == 'translation/auto'){
		timeout = 20000; //20s, Twice the time because the translation request has to request a third party
	}

	xhr = $.ajax({
		url: 'wrapper/'+action+linkid,
		type: method, //Ajax calls will queue GET request only, that can timeout if the url is the same, but the PHP code still processing in background
		data: JSON.stringify(param),
		contentType: 'application/json; charset=UTF-8',
		dataType: 'json',
		timeout: timeout,
		success: function(data){
			//Those 3 following lines are only for debug purpose
			//var msg = JSON.stringify(data);
			//var msg = data;
			//var msg = JSON.parse(data.msg);

			// Below is the production information with "dataType: 'json'"
			cb_success(data.msg);
		},
		error: function(xhr_err, ajaxOptions, thrownError){
			cb_error(xhr_err, ajaxOptions, thrownError);
		},
		complete: function(){
			xhr = false;
			cb_complete();
		},
	});
}


function sendForm(objForm, cb_success, cb_error, cb_complete){
	if(typeof cb_success==="undefined"){ cb_success = function(){}; }
	if(typeof cb_error==="undefined"){ cb_error = function(){}; }
	if(typeof cb_complete==="undefined"){ cb_complete = function(){}; }

	if($.type(objForm)==="string"){
		objForm = $("#"+objForm);
	} else {
		objForm = $(objForm);
	}
	if (objForm.length>0 && objForm.is('form')){
		objForm.on('submit', function(e) {
			 e.preventDefault(); //Disable submit action
		});
		var param = objForm.serializeArray();
		var method = objForm.attr('method');
		var action = objForm.attr('action');
		wrapper(param, method, action, cb_success, cb_error, cb_complete);
	} else {
		alert('The form does not exist!');
	}
	return false; //Disable submit action
}

function sendAction(param, method, action, cb_success, cb_error, cb_complete){
	if(typeof cb_success==="undefined"){ cb_success = function(){}; }
	if(typeof cb_error==="undefined"){ cb_error = function(){}; }
	if(typeof cb_complete==="undefined"){ cb_complete = function(){}; }
	
	var arr = [];
	if(!$.isArray(param)){
		//Here do not use "new Array(param)", because param[0] will be undefined is param is an integer
		param = [param];
	}
	//Convert the array to the same format as jQuery does with forms
	for(var val in param){
		arr.push({name:val, value:param[val]});
	}
	wrapper(arr, method, action, cb_success, cb_error, cb_complete);
	return false; //Disable submit action
}

$(function() {
	//Disable submit action of all forms
	$('form').on('submit', function(e) {
		 e.preventDefault(); //Disable submit action
	});
});
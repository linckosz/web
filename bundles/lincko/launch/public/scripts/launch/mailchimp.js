function mailchimp_ajax(email){
	if(typeof email!="string"){ return false; }

	var param = {
		"apikey": "585a0991ce18b4a45d38812383971b62-us13",
		"email_address": email,
		"status": "subscribed",
		"merge_fields": {
			"FNAME": "toto",
			"LNAME": "Martin",
		}
	};

	console.log('ookk');

	$.ajax({
		url: 'https://lincko.us13.list-manage.com/3.0/lists/050321d5ad/members/',
		method: 'POST', //Ajax calls will queue GET request only, that can timeout if the url is the same, but the PHP code still processing in background
		data: JSON.stringify(param),
		contentType: 'application/json; charset=UTF-8',
		dataType: 'json',
		timeout: 10000,
		error: function(res, text){
			console.log('Err', res);
		},
		success: function(res){
			console.log('Success', res);
		}
	});
}

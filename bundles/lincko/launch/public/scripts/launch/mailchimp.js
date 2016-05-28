function mailchimp_ajax(email){
	if(typeof email!="string"){ return false; }

	var param = {
		"email_address": email.toLowerCase(),
	};

	$.ajax({
		url: top.location.protocol+'//'+document.linckoFront+document.linckoBack+document.domain+'/mailchimp',
		method: 'POST',
		data: JSON.stringify(param),
		contentType: 'application/json; charset=UTF-8',
		dataType: 'json',
		timeout: 10000,
		success: function(data){
			if(data.status=="subscribed"){
				base_show_error(Lincko.Translation.get('web', 11, 'html'), false);
			} else if(data.title=="Member Exists"){
				base_show_error(Lincko.Translation.get('web', 10, 'html'), false);
			} else {
				base_show_error(Lincko.Translation.get('web', 9, 'html'), true);
			}
			
		},
		error: function(xhr_err, ajaxOptions, thrownError){
			base_show_error(Lincko.Translation.get('web', 9, 'html'), true);
		},
	});
}

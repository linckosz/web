
function ChangeLanguage(language){
	$.ajax({
		url: 'translation/language',
		type: 'POST',
		data: JSON.stringify(language),
		contentType: 'application/json; charset=UTF-8',
		complete: function(){
			//Reload the page
			top.location.replace('/');
		},
	});
}

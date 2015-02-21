function ChangeLanguage(language){
	$.post(
		'translation/language',
		{"translation_language":language},
		function(){
			//Reload the page
			top.location.replace('/');
		}
	);
}
function ChangeLanguage(language){
	$.post(
		'/translation/language',
		{"translation_language":language},
		function(){
			//Reload the page
			top.location.reload();
		}
	);
}

//toto => what does this function do it here? Since it's parsing history text, we should only use Lincko.storage.formatHistoryInfo, modifying one or the other will make the framework less consistant
var Translation_filter = function(text, param, to_html){
	if(typeof text != 'string'){ return ''; }
	var search;
	var replacement;
	var array_needle = text.match(/\[\{.+?\}\]/g);
	var array;
	var filter;

	if(array_needle){
		for(var i in array_needle){
			search = String(array_needle[i]);
			needle = search.replace(/\[\{|\}\]/g, '');
			if(typeof param[needle] != 'undefined'){
				replacement = param[needle];
				text = text.replaceAll(search, replacement);
				continue;
			} else {
				array = needle.split("|");
				needle = array[0].toLowerCase();
				array.shift(); //Remove the first element
				if(array.length>0 && typeof param[needle] != 'undefined'){
					replacement = param[needle]
					if(typeof array === 'object'){
						for(var i in array){
							filter = array[i].toLowerCase();
							if(filter === 'lower'){
								replacement = replacement.toLowerCase();
							} else if(filter === 'upper'){
								replacement = replacement.toUpperCase();
							} else if(filter === 'ucfirst'){
								replacement = replacement.ucfirst();
							}
						}
					}
					text = text.replaceAll(search, replacement);
					continue;
				}
			}
			text = text.replaceAll(search, Lincko.Translation.get('app', 21, 'js')); //Unknown
		}
	}
	if(to_html)
	{
		return wrapper_to_html(text);
	}
	else
	{
		return text;
	}	
};

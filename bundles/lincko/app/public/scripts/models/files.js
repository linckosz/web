var app_models_fileType_category = {
 	word: ['doc', 'docx'],
 	ppt: ['ppt', 'pptx'],
 	excel: ['xls', 'xlsx'],
 	txt: ['txt', 'log', 'odt', 'pages', 'rtf', 'wpd', 'wps'],
 	pdf: ['pdf'],
 	audio: ['mp3', 'wma', 'wav', 'mid', 'ogg'],
 	zip: ['zip', '7z', 'rar', 'zipx', 'ace', 'tar'],
 	code: ['html', 'htm', 'css', 'js', 'php', 'asp', 'aspx', 'cpp', 'c', 'class', 'java', 'pl', 'py', 'sh', 'swift', 'vb', 'vcxproj', 'xcodeproj'],
 	class: {
 		file: 'fa fa-file-o',
 		word: 'fa fa-file-word-o',
 		ppt: 'fa fa-file-powerpoint-o',
 		excel: 'fa fa-file-excel-o',
 		txt: 'fa fa-file-text-o',
 		pdf: 'fa fa-file-pdf-o',
 		audio: 'fa fa-file-audio-o',
 		zip: 'fa fa-file-archive-o',
 		code: 'fa fa-file-code-o',
 	},
 };

 var app_models_returnFileFontClass = function(ext){
 	var fileType_class = app_models_fileType_category.class.file;
 	var isMatch = false;

 	$.each(app_models_fileType_category, function(key, val){
 		if(key == 'class' || isMatch){
 			return;
 		}
 		else if($.inArray(ext, app_models_fileType_category[key]) > -1){
 			fileType_class = app_models_fileType_category.class[key];
 			isMatch = true;
 		}
 	});

 	return fileType_class;
 }

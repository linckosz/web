var app_models_fileType = {
	extensions:{
		word:['doc', 'docx'],
	 	ppt: ['ppt', 'pptx'],
	 	excel: ['xls', 'xlsx'],
	 	txt: ['txt', 'log', 'odt', 'pages', 'rtf', 'wpd', 'wps'],
	 	pdf: ['pdf'],
	 	audio: ['mp3', 'wma', 'wav', 'mid', 'ogg'],
	 	zip: ['zip', '7z', 'rar', 'zipx', 'ace', 'tar'],
	 	code: ['html', 'htm', 'css', 'js', 'php', 'asp', 'aspx', 'cpp', 'c', 'class', 'java', 'pl', 'py', 'sh', 'swift', 'vb', 'vcxproj', 'xcodeproj'],
	 }, 	
 	class: {
 		file: 'fa fa-file-o',
 		word: 'fa fa-file-word-o',
 		ppt: 'fa fa-file-powerpoint-o',
 		excel: 'fa fa-file-excel-o',
 		txt: 'fa fa-file-text-o',
 		pdf: 'fa fa-file-pdf-o',
 		audio: 'fa fa-file-audio-o',
 		zip: 'fa fa-file-zip-o',
 		code: 'fa fa-file-code-o',
 	},
 	getClass: function(ext){
 		var that = this;
 		var fileType_class = that.class.file;
 		if(!ext){
 			return fileType_class;
 		}

	 	var isMatch = false;
	 	$.each(that.extensions, function(key, val){
	 		if(isMatch){
	 			return;
	 		}
	 		else if($.inArray(ext, that.extensions[key]) > -1){
	 			fileType_class = that.class[key];
	 			isMatch = true;
	 		}
	 	});
	 	return fileType_class;
 	},
 };

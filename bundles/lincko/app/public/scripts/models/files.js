var app_models_fileType = {
	extensions:{
		word:['doc', 'docx'],
	 	ppt: ['ppt', 'pptx'],
	 	excel: ['xls', 'xlsx'],
	 	txt: ['txt', 'log', 'odt', 'pages', 'rtf', 'wpd', 'wps'],
	 	pdf: ['pdf'],
	 	audio: ['mp3', 'wma', 'wav', 'mid', 'ogg'],
	 	movie: ['mp4','avi','mov'],
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
 		movie: 'fa fa-file-movie-o',
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
 	getExt:function(name){
 		var array = name.split(".");
 		if(array.length > 1)
 		{
 			return array[array.length-1];
 		}
 		else
 		{
 			return "";
 		}
 	},
 	cutFileTitle:function(title, prefixLength, suffixLength){
		if(typeof title == 'undefined')
		{
			return title;
		}

		var dotIndex = title.lastIndexOf(".");
		var fileName = title.substring(0,dotIndex);
		var extName = title.substring(dotIndex + 1,title.length);
		if(prefixLength + suffixLength >= fileName.length)
		{
			return title;
		}

		var prefix=fileName.substring(0,prefixLength);
		var suffix=fileName.substring(fileName.length-suffixLength,fileName.length);
		if(extName!=""){
			title = prefix + "..." + suffix + " ." + extName;
		} else {
			title = prefix + "..." + suffix;
		}
		return title;
	},
 };


var app_models_file_imageOrientationCSS = {
	1: 'app_models_files_imageOrientation1',
	2: 'app_models_files_imageOrientation2',
	3: 'app_models_files_imageOrientation3',
	4: 'app_models_files_imageOrientation4',
	5: 'app_models_files_imageOrientation5',
	6: 'app_models_files_imageOrientation6',
	7: 'app_models_files_imageOrientation7',
	8: 'app_models_files_imageOrientation8',
}

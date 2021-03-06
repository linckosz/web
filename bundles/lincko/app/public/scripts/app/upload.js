submenu_list['app_upload_all'] = {
	"_title": {
		"style": "customized_title",
		"title": Lincko.Translation.get('app', 4, 'html'), //Uploads
	},
	"left_button": {
		"style": "title_left_button",
		"title": Lincko.Translation.get('app', 25, 'html'), //Close
		'hide': true,
		"class": "base_pointer",
	},
	/*
	"destination": {
		"style": "next",
		"title": Lincko.Translation.get('app', 26, 'html'), //Destination
		"next": "app_upload_destination",
		"value": "<b>Customized</b>",
		"class": "",
	},
	*/
	"app_upload_all": {
		"style": "app_upload_all",
		"title": "Upload all", //This title will be not used
	},
};

submenu_list['app_upload_sub'] = {
	"_title": {
		"style": "customized_title",
		"title": Lincko.Translation.get('app', 21, 'html'), //Unknown
	},
	"left_button": {
		"style": "title_left_button",
		"title": Lincko.Translation.get('app', 25, 'html'), //Close
		'hide': true,
		"class": "base_pointer",
	},
	/*
	"destination": {
		"style": "next",
		"title": Lincko.Translation.get('app', 26, 'html'), //Destination
		"next": "app_upload_destination",
		"value": base_myplaceholder,
		"class": "",
	},
	*/
	"app_upload_sub": {
		"style": "app_upload_sub",
		"title": "Upload single", //This title will be not used
		"value": -1, //This must be previously updated before opening the menu
	},
};

submenu_list['app_upload_destination'] = {
	"_title": {
		"style": "customized_title",
		"title": Lincko.Translation.get('app', 2001, 'html'), //New project
	},
	"left_button": {
		"style": "title_left_button",
		"title": Lincko.Translation.get('app', 26, 'html'), //Destination
		'hide': true,
		"class": "base_pointer",
	},
	"destination_0": {
		"style": "radio",
		"title": base_myplaceholder,
		"selected": true,
		"action": function(){
			alert('Do something');
		},
		"hide": false,
		"class": "",
	},
	"destination_1": {
		"style": "radio",
		"title": "toto_01",
		"selected": false,
		"action": function(){
			alert('Do something');
		},
		"hide": false,
		"class": "",
	},
	"destination_2": {
		"style": "radio",
		"title": "toto_02",
		"selected": false,
		"action": function(){
			alert('Do something');
		},
		"hide": true,
		"class": "",
	},
};

//This function is called only at the file submit moment because it can be different per file
function app_upload_prepare_log(parent_type, parent_id, temp_id, precompress, real_orientation){
	if(typeof parent_type != 'string' && !$.isNumeric(parent_id)){
		parent_type = 'projects';
		parent_id = Lincko.storage.getMyPlaceholder()['_id'];
	}
	$('#app_upload_shangzai_puk').val(wrapper_get_shangzai());
	$('#app_upload_lastvisit').val(Lincko.storage.getLastVisit());
	$('#app_upload_parent_type').val(parent_type);
	$('#app_upload_parent_id').val(parseInt(parent_id, 10));
	$('#app_upload_workspace').val(wrapper_localstorage.workspace);
	$('#app_upload_temp_id').val(temp_id);
	$('#app_upload_precompress').val(precompress);
	$('#app_upload_real_orientation').val(real_orientation);
}

function app_upload_set_launcher(parent_type, parent_id, submenu, start, temp_id, param, precompress){
	if(typeof parent_type != 'string' && !$.isNumeric(parent_id)){
		parent_type = 'projects';
		parent_id = Lincko.storage.getMyPlaceholder()['_id'];
	}
	if(typeof submenu == 'undefined'){ submenu = true; }
	if(typeof start == 'undefined'){ start = false; }
	if(typeof temp_id != 'string'){
		app_upload_auto_launcher.temp_id = md5(Math.random()); //can only be used for single selection
	} else {
		app_upload_auto_launcher.temp_id = temp_id;
	}
	if(typeof param == 'undefined'){ param = null; }
	if(typeof precompress == 'undefined'){ precompress = false; }
	if(typeof real_orientation == 'undefined'){ real_orientation = true; }
	app_upload_auto_launcher.parent_type = parent_type;
	app_upload_auto_launcher.parent_id = parent_id;
	app_upload_auto_launcher.submenu = submenu;
	app_upload_auto_launcher.start = start;
	app_upload_auto_launcher.param = param;
	if(parent_type=="chats"){
		precompress = true;
	}
	app_upload_auto_launcher.precompress = precompress;

	if(precompress && isIOS)
	{
		app_upload_auto_launcher.real_orientation = false;
	}
	else
	{
		app_upload_auto_launcher.real_orientation = true;
	}

	if(precompress){
		//If we cannot compress on front, it will be on backend
		$('#app_upload_fileupload').fileupload('option', {disableImageResize: /Android(?!.*Chrome)|Opera/.test(window.navigator.userAgent),});
	} else {
		$('#app_upload_fileupload').fileupload('option', {disableImageResize: true,});
	}
}

function app_upload_open_files(parent_type, parent_id, submenu, start, param){
	app_upload_set_launcher(parent_type, parent_id, submenu, start, null, param);
	$('#app_upload_form_files').click();
}

function app_upload_open_photo(parent_type, parent_id, submenu, start, param){
	app_upload_set_launcher(parent_type, parent_id, submenu, start, null, param, true);
	$('#app_upload_form_photo').click();
}

function app_upload_open_photo_single(parent_type, parent_id, submenu, start, param){
	var temp_id = md5(Math.random());
	app_upload_set_launcher(parent_type, parent_id, submenu, start, temp_id, param, true);
	$('#app_upload_form_photo_single').click();
	return temp_id;
}

function app_upload_open_video(parent_type, parent_id, submenu, start, param){
	app_upload_set_launcher(parent_type, parent_id, submenu, start, null, param);
	$('#app_upload_form_video').click();
}

var app_upload_auto_launcher_timeout;
var app_upload_auto_launcher = {
	parent_type: 'projects',
	parent_id: parseInt(Lincko.storage.getMyPlaceholder()['_id'], 10),
	submenu: true,
	start: false,
	temp_id: false,
	param: null,
	real_orientation:true,
	init: function(){
		this.parent_type = 'projects';
		this.parent_id = parseInt(Lincko.storage.getMyPlaceholder()['_id'], 10);
		this.submenu = true;
		this.start = false;
		this.temp_id = false;
		this.param = null;
		this.real_orientation = true;
	},
};

//This help to clear all intervals
var app_upload_start_interval = {};

$(function () {
	//Do not use 'use strict', it makes the code heavier, even if it's better for conventional coding

	$('#app_upload_fileupload').fileupload({
		dataType: 'json',
		url: top.location.protocol+'//'+document.linckoBack+'file.'+document.domainRoot+':'+document.linckoBackPort+'/file/create', //Bruno update
		url_result: top.location.protocol+'//'+document.linckoBack+'file.'+document.domainRoot+':'+document.linckoBackPort+'/file/result?%s',
		// Enable image resizing, except for Android and Opera,
		// which actually support image resizing, but fail to
		// send Blob objects via XHR requests:
		/*
		disableImageResize: /Android(?!.*Chrome)|Opera/
			.test(window.navigator.userAgent),
		*/
		disableImageResize: true, //Bruno update
		imageMaxWidth: 1920,
		imageMaxHeight: 1920,
		imageQuality: 0.8,

		imageOrientation: true, //Bruno update
		singleFileUploads: true, //Bruno update
		minFileSize: 0, //Bruno update
		autoUpload: false, //Bruno update
		maxFileSize: 1000000000, //Bruno update (limit to 1GB)
		bitrateInterval: 1000, //Bruno update (display every second, which is more readable)
		loadImageMaxFileSize: 100000000, //Bruno update (limit to 100Mb)
		loadImageFileTypes: /^image\/.*$/, //Bruno update
		previewMaxWidth: 512,
		previewMaxHeight: 512,
		//maxChunkSize: 10000, //100KB [toto] Chunk will help to manage the Pause function but need a modification on back side
		messages: {
			maxNumberOfFiles: Lincko.Translation.get('app', 13, 'html'), //Maximum number of files exceeded
			acceptFileTypes: Lincko.Translation.get('app', 14, 'html'), //File type not allowed
			maxFileSize: Lincko.Translation.get('app', 15, 'html'), //File is too large
			minFileSize: Lincko.Translation.get('app', 16, 'html'), //File is too small
			uploadedBytes: Lincko.Translation.get('app', 17, 'html'), //Uploaded bytes exceed file size
		},

		//Array used to smooth the uploading speed and time remaining display
		lincko_bitrate: [],
		lincko_time: [],

		/*
		Info: This data is to access some variable and functions outside a callback
		$('#app_upload_fileupload').data().blueimpFileupload
		*/

		//data => File object
		always: function (e, data) {
			$('#app_upload_fileupload').fileupload('option').progressall(e, this);
		},

		//data => File object
		add: function (e, data) {
			if (typeof e !== 'undefined' && e.isDefaultPrevented()) { return false; }
			var that = $('#app_upload_fileupload').fileupload('option');

			that.reindex(e, this);

			app_upload_files.lincko_files[app_upload_files.lincko_files_index] = data;
			app_upload_files.lincko_files[app_upload_files.lincko_files_index].lincko_type = 'file';
			app_upload_files.lincko_files[app_upload_files.lincko_files_index].lincko_files_index = app_upload_files.lincko_files_index;
			app_upload_files.lincko_files[app_upload_files.lincko_files_index].lincko_status = 'pause';
			app_upload_files.lincko_files[app_upload_files.lincko_files_index].lincko_error = null;
			app_upload_files.lincko_files[app_upload_files.lincko_files_index].lincko_progress = 0;
			app_upload_files.lincko_files[app_upload_files.lincko_files_index].lincko_name = data.files[0].name;
			app_upload_files.lincko_files[app_upload_files.lincko_files_index].lincko_size = data.files[0].size;
			app_upload_files.lincko_files[app_upload_files.lincko_files_index].lincko_parent_id = app_upload_auto_launcher.parent_id;
			app_upload_files.lincko_files[app_upload_files.lincko_files_index].lincko_parent_type = app_upload_auto_launcher.parent_type;
			app_upload_files.lincko_files[app_upload_files.lincko_files_index].lincko_precompress = app_upload_auto_launcher.precompress;
			app_upload_files.lincko_files[app_upload_files.lincko_files_index].lincko_real_orientation = app_upload_auto_launcher.real_orientation;
			app_upload_files.lincko_files[app_upload_files.lincko_files_index].lincko_start = app_upload_auto_launcher.start;
			app_upload_files.lincko_files[app_upload_files.lincko_files_index].lincko_try = 2;

			//Note: This function help to avoid a trouble issue that would completely stop the file upoading system if it submits while the staus is pending
			app_upload_files.lincko_files[app_upload_files.lincko_files_index].lincko_submit = function(){
				var temp_index = this.lincko_files_index;
				var nbr_uploading = 0;
				for(var i in app_upload_files.lincko_files){
					if(i!=temp_index && app_upload_files.lincko_files[i].lincko_status == 'uploading'){
						nbr_uploading++;
					}
					if(nbr_uploading>=app_upload_files.lincko_limit){
						break;
					}
				}
				if(nbr_uploading>=app_upload_files.lincko_limit || this.state() == 'pending'){
					clearInterval(app_upload_start_interval[temp_index]);
					app_upload_start_interval[temp_index] = setInterval(function(temp_index){
						var nbr_uploading = 0;
						for(var i in app_upload_files.lincko_files){
							if(i!=temp_index && app_upload_files.lincko_files[i].lincko_status == 'uploading'){
								nbr_uploading++;
							}
							if(nbr_uploading>=app_upload_files.lincko_limit){
								break;
							}
						}
						if(nbr_uploading<app_upload_files.lincko_limit){
							if(typeof app_upload_files.lincko_files[temp_index] == "undefined"){
								clearInterval(app_upload_start_interval[temp_index]);
							} else if(app_upload_files.lincko_files[temp_index].state()!='pending'){
								clearInterval(app_upload_start_interval[temp_index]);
								app_upload_files.lincko_files[temp_index].submit();
							}
						}
					}, 300, temp_index);
				} else {
					app_upload_files.lincko_files[temp_index].submit();
				}
			};

			if(app_upload_auto_launcher.temp_id){
				app_upload_files.lincko_files[app_upload_files.lincko_files_index].lincko_temp_id = app_upload_auto_launcher.temp_id;
				app_upload_auto_launcher.temp_id = md5(Math.random());
			} else {
				app_upload_files.lincko_files[app_upload_files.lincko_files_index].lincko_temp_id = md5(Math.random());
			}

			if(app_upload_auto_launcher.param){
				app_upload_files.lincko_files[app_upload_files.lincko_files_index].lincko_param = app_upload_auto_launcher.param;
			}
			else{
				app_upload_files.lincko_files[app_upload_files.lincko_files_index].lincko_param = null;
			}

			//Reinitialise display information
			that.lincko_bitrate.length = [];
			that.lincko_time.length = [];

			if('process' in data){
				data.process(function () {
					var result = {};
					try {
						//Bug if the canvas is not loaded => 'parseMetaData' of undefined
						result = $('#app_upload_fileupload').fileupload('process', data);
					} catch(e){

					}
					return result;
				})
				.fail(function () {
					if (data.files[0].error) {
						data.lincko_status = 'failed';
						data.errorThrown = 'failed';
						data.lincko_error = data.files[0].error;
						data.abort();
					}
				});
			}

			app_upload_files.lincko_files_index++;
			that.progressall(e, this);

			//Open submenu by default
			if(app_upload_auto_launcher.submenu){
				submenu_Build("app_upload_all", -1, false);
			}
			//Do not auto start by default
			if(app_upload_auto_launcher.start){
				var temp_index = app_upload_files.lincko_files_index - 1;
				app_upload_files.lincko_files[temp_index].lincko_submit();
			}

			clearTimeout(app_upload_auto_launcher_timeout);
			app_upload_auto_launcher_timeout = setTimeout(function() {
				app_upload_auto_launcher.init();
			}, 50);
			

			//This is used to force the preview to appear because the preview variable is not available at once right after the object creation
			setTimeout(function(data) {
				$('#app_upload_fileupload').fileupload('option').progressall(e, this);
			}, 60, data);
			//The second timeout is just in case the first one didn't worked
			setTimeout(function(data) {
				$('#app_upload_fileupload').fileupload('option').progressall(e, this);
			}, 2000, data);

		},

		//It will decrement the file index to rewrite over previously allocated memory space.
		//data => File object
		reindex: function (e, data) {
			if (typeof e !== 'undefined' && e.isDefaultPrevented()) { return false; }
			var that = $('#app_upload_fileupload').fileupload('option');
			while(app_upload_files.lincko_files_index > 0 && typeof app_upload_files.lincko_files[app_upload_files.lincko_files_index-1] === 'undefined'){
				app_upload_files.lincko_files_index--;
			}
		},

		//data => File object
		submit: function (e, data) {
			clearInterval(app_upload_start_interval[data.lincko_files_index]);
			app_upload_files.lincko_files[data.lincko_files_index].lincko_status = 'uploading';
			var parent_type = app_upload_files.lincko_files[data.lincko_files_index].lincko_parent_type;
			var parent_id = app_upload_files.lincko_files[data.lincko_files_index].lincko_parent_id;
			var temp_id = app_upload_files.lincko_files[data.lincko_files_index].lincko_temp_id;
			var precompress = app_upload_files.lincko_files[data.lincko_files_index].lincko_precompress;
			var real_orientation = app_upload_files.lincko_files[data.lincko_files_index].lincko_real_orientation;
			app_upload_prepare_log(parent_type, parent_id, temp_id, precompress,real_orientation);
			app_application_lincko.prepare('upload', true);
		},
		
		//data => File object
		done: function (e, data) {
			if (typeof e !== 'undefined' && e.isDefaultPrevented()) { return false; }
			var that = $('#app_upload_fileupload').fileupload('option');
			if(data.result && data.result.error){
				app_upload_files.lincko_files[data.lincko_files_index].lincko_status = 'error';
				app_upload_files.lincko_files[data.lincko_files_index].lincko_error = Lincko.Translation.get('app', 18, 'html'); //Server error
				if(typeof data.result.msg == 'string'){
					app_upload_files.lincko_files[data.lincko_files_index].lincko_error = data.result.msg;
				}
				if(app_upload_files.lincko_files[data.lincko_files_index].lincko_try>0){ //For any kind of error, we try at least once
					if(data.result.flash && data.result.flash.resignin){ //Only try once if it's pure file error, more if it's about resigning
						app_upload_files.lincko_files[data.lincko_files_index].lincko_try--;
					} else {
						app_upload_files.lincko_files[data.lincko_files_index].lincko_try = 0;
					}
					app_upload_files.lincko_files[data.lincko_files_index].lincko_status = 'restart';
					app_upload_files.lincko_files[data.lincko_files_index].lincko_error = Lincko.Translation.get('app', 59, 'html'); //Your file upload is restarting
					var data_bis = data;
					wrapper_set_shangzai = true;
					wrapper_force_resign(function(){
						setTimeout(function(that, data_bis){
							app_upload_files.lincko_files[data_bis.lincko_files_index].lincko_submit();
						}, 600, that, data_bis);
					});
				} else if(app_upload_files.lincko_files[data.lincko_files_index].lincko_try<=0){
					app_upload_files.lincko_files[data.lincko_files_index].lincko_try = 2;
					wrapper_set_shangzai = true;
					if(typeof Lincko.storage != 'undefined'){
						Lincko.storage.getLastVisit();
					}
				}
			} else {
				app_upload_files.lincko_files[data.lincko_files_index].lincko_status = 'done';
				$('#app_upload_fileupload').fileupload('option').progressall(e, this);
				app_application_lincko.prepare('upload', true, false, true); //procedural launch
				delete app_upload_files.lincko_files[data.lincko_files_index];
				clearInterval(app_upload_start_interval[data.lincko_files_index]);
				that.reindex(e, this);
				app_application_lincko.prepare('files');
				//Force to update elements if the function is available
				if(data.result && data.result.msg && typeof storage_cb_success === 'function'){
					storage_cb_success('', false, 200, data.result.msg);
				}
			}
			app_application_lincko.prepare('upload', true);
			Lincko.storage.getLatest();
		},

		//data => File object
		progress: function (e, data) {
			if (typeof e !== 'undefined' && e.isDefaultPrevented()) { return false; }
			var that = $('#app_upload_fileupload').fileupload('option');
			var progress = Math.floor( 100 * data.loaded/data.total );
			if(progress<0){
				progress=0;
			} else if(progress>100){
				progress=100;
			}
			app_upload_files.lincko_files[data.lincko_files_index].lincko_progress = progress;
		},

		//data => Main object
		progressall: function (e, data) {
			if (typeof e !== 'undefined' && e.isDefaultPrevented()) { return false; }
			var that = $('#app_upload_fileupload').fileupload('option');
			app_upload_files.lincko_numberOfFiles = that._numberOfFiles();
			if($.type(data) === 'object' && data.loaded && data.total && data.bitrate){
				var progress = Math.floor( 100 * data.loaded/data.total );
				if(app_upload_files.lincko_numberOfFiles<=0){
					progress = 100;
					//Reinitialise display information
					that.lincko_bitrate.length = [];
					that.lincko_time.length = [];
				} else if(progress<0){
					progress = 0;
				} else if(progress>100){
					progress = 100;
				}
				app_upload_files.lincko_progressall = progress;
				app_upload_files.lincko_britate = that._formatBitrate(data.bitrate);
				if(data.bitrate>0){
					app_upload_files.lincko_time = that._formatTime((data.total - data.loaded) * 8 / data.bitrate);
				}
				app_upload_files.lincko_loaded = that._formatFileSize(data.loaded);
				app_upload_files.lincko_total = that._formatFileSize(data.total);
				app_upload_files.lincko_size = that._formatComplete(data.loaded, data.total);
			} else {
				if(app_upload_files.lincko_numberOfFiles<=0){
					app_upload_files.lincko_progressall = 100;
					//Reinitialise display information
					that.lincko_bitrate.length = [];
					that.lincko_time.length = [];
				} else {
					var lincko_progress = false;
					$.each(app_upload_files.lincko_files, function(index, data){
						if($.type(data) === 'object'){
							if(data.lincko_progress > 0){
								return lincko_progress = true;
							}
						}
					});
					if(!lincko_progress){
						app_upload_files.lincko_progressall = 0;
					}
				}
				app_upload_files.lincko_britate = that._formatBitrate(0);
				app_upload_files.lincko_time = that._formatTime(0);
				app_upload_files.lincko_loaded = that._formatFileSize(0);
				app_upload_files.lincko_total = that._formatFileSize(0);
				app_upload_files.lincko_size = that._formatComplete(0, 0);
			}
			app_application_lincko.prepare('upload', true);
		},

		//data => File object
		fail: function (e, data) {
			if (typeof e !== 'undefined' && e.isDefaultPrevented()) { return false; }
			if (data.lincko_status == 'failed') {
				data.lincko_error = data.files[0].error || data.errorThrown || Lincko.Translation.get('app', 9, 'html'); //Unknown error
			} else if (data.lincko_status != 'error') {
				app_upload_files.lincko_files[data.lincko_files_index].lincko_status = 'error';
				app_upload_files.lincko_files[data.lincko_files_index].lincko_error = Lincko.Translation.get('app', 18, 'html'); //Server error
			}
			clearInterval(app_upload_start_interval[data.lincko_files_index]);
			$('#app_upload_fileupload').fileupload('option').progressall(e, this);
		},

		//data => File object
		destroy: function (e, data) {
			if (typeof e != 'undefined' && e && e.isDefaultPrevented()) { return false; }
			var that = $('#app_upload_fileupload').fileupload('option');
			app_upload_files.lincko_files[data.lincko_files_index].abort();
			app_upload_files.lincko_files[data.lincko_files_index].lincko_status = 'deleted';
			app_upload_files.lincko_files[data.lincko_files_index].lincko_progress = 0;
			app_application_lincko.prepare('upload', true, false, true); //procedural launch
			$('#app_upload_fileupload').fileupload('option').progressall(e, this);
			delete app_upload_files.lincko_files[data.lincko_files_index];
			clearInterval(app_upload_start_interval[data.lincko_files_index]);
			that.reindex(e, this);
			$('#app_upload_fileupload').fileupload('option').progressall(e, this);
		},


		_startHandler: function (e) {
			if(typeof e !== 'undefined' && e){ e.preventDefault(); }
			var that = this;
			$.each(app_upload_files.lincko_files, function(index, data){
				if($.type(data) === 'object'){
					if(data.lincko_status === 'failed'){
						data.lincko_status = 'deleted';
						that.destroy(e, data);
					} else if(typeof data.lincko_type !== 'undefined' && data.lincko_type === 'file'){
						data.lincko_status = 'pause';
						data.lincko_submit();
					}
				}
			});
			app_application_lincko.prepare('upload', true);
		},

		_cancelHandler: function (e) {
			if(typeof e !== 'undefined'){ e.preventDefault(); }
			var that = this;
			$.each(app_upload_files.lincko_files, function(index, data){
				if($.type(data) === 'object'){
					if(typeof data.lincko_type !== 'undefined' && data.lincko_type === 'file' && data.lincko_status !== 'abort'){
						data.lincko_status = 'abort';
						data.abort();
					}
				}
			});
			app_application_lincko.prepare('upload', true);
		},

		_deleteHandler: function (e) {
			if(typeof e !== 'undefined'){ e.preventDefault(); }
			var that = this;
			$.each(app_upload_files.lincko_files, function(index, data){
				if($.type(data) === 'object'){
					if(typeof data.lincko_type !== 'undefined' && data.lincko_type === 'file' && data.lincko_status !== 'deleted'){
						data.lincko_status = 'deleted';
						that.destroy(e, data);
					}
				}
			});
			app_application_lincko.prepare('upload', true, false, true); //procedural launch
		},

		_numberOfFiles: function(){
			var num = 0;
			$.each(app_upload_files.lincko_files, function(index, data){
				if($.type(data) === 'object'){
					if(typeof data.lincko_type !== 'undefined' && data.lincko_type === 'file'){
						num++;
					}
				}
			});
			return num;
		},

		_formatFileSize: function (bytes) {
			if (typeof bytes !== 'number') {
				return '?';
			} else if (bytes >= 1073741824) {
				return (bytes / 1073741824).toFixed(2) + ' GB';
			} else if (bytes >= 1048576) {
				return (bytes / 1048576).toFixed(2) + ' MB';
			} else {
				return (bytes / 1024).toFixed(0) + ' KB';
			}
		},

		_formatBitrate: function (bits) {
			if (typeof bits !== 'number') {
				return '?';
			}

			var that = $('#app_upload_fileupload').fileupload('option');
			that.lincko_bitrate.unshift(bits);
			if(that.lincko_bitrate.length > 4){
				that.lincko_bitrate.length = 4;
			}

			var length = that.lincko_bitrate.length;
			var divide = 0;
			var sum = 0;
			/*
			//With pound
			$.each(that.lincko_bitrate, function(index, data){
				sum = sum + data * (length - index);
				divide = divide + index + 1;
			});
			*/
			$.each(that.lincko_bitrate, function(index, data){
				sum = sum + data;
				divide = divide + 1;
			});

			if (divide<=0) {
				bits = 0;
			} else {
				bits = sum / divide;
			}

			if (bits >= 1073741824) {
				return (bits / 1073741824).toFixed(1) + ' Gbit/s';
			} else if (bits >= 1048576) {
				return (bits / 1048576).toFixed(1) + ' Mbit/s';
			} else if (bits >= 1024) {
				return (bits / 1024).toFixed(0) + ' kbit/s';
			} else {
				return bits.toFixed(0) + ' bit/s';
			}
		},

		_formatComplete: function (loaded, total) {
			if (typeof loaded !== 'number' || typeof total !== 'number') {
				return '?';
			} else if (total >= 1073741824) {
				return (loaded / 1073741824).toFixed(2) + ' GB / ' + (total / 1073741824).toFixed(2) + ' GB';
			} else if (total >= 1048576) {
				return (loaded / 1048576).toFixed(2) + ' MB / ' + (total / 1048576).toFixed(2) + ' MB';
			} else {
				return (loaded / 1024).toFixed(0) + ' KB / ' + (total / 1024).toFixed(0) + ' KB';
			}
		},

		_formatPercentage: function (value) {
			return Math.floor(value) + ' %';
		},

		_formatTime: function (seconds) {
			if (typeof seconds !== 'number') {
				return '?';
			}

			var that = $('#app_upload_fileupload').fileupload('option');
			that.lincko_time.unshift(seconds);
			if(that.lincko_time.length > 4){
				that.lincko_time.length = 4;
			}

			var length = that.lincko_time.length;
			var divide = 0;
			var sum = 0;
			/*
			//With pound
			$.each(that.lincko_time, function(index, data){
				sum = sum + data * (length - index);
				divide = divide + index + 1;
			});
			*/
			$.each(that.lincko_time, function(index, data){
				sum = sum + data;
				divide = divide + 1;
			});

			if (divide<=0) {
				seconds = 0;
			} else {
				seconds = sum / divide;
			}

			var date = new Date(seconds * 1000),
				days = Math.floor(seconds / 86400);
			days = days ? days + 'd ' : '';
			return days +
				('0' + date.getUTCHours()).slice(-2) + ':' +
				('0' + date.getUTCMinutes()).slice(-2) + ':' +
				('0' + date.getUTCSeconds()).slice(-2);
		},
	});

	$("#app_upload_fileupload").on('submit', function(e) {
		 if(typeof e !== 'undefined'){ e.preventDefault(); } else { e = null; } //Disable submit action by click
		 return false; //Disable by JS action
	});

});

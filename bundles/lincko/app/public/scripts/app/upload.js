
$(function () {
	//Do not use 'use strict', it makes the code heavier, even if it's better for conventional coding

	$('#app_upload_fileupload').fileupload({
		
		dataType: 'json',
		url: 'https://file.'+document.domain+':8443/file', //Bruno update
		url_result: 'https://file.'+document.domain+':8443/result?%s',
		// Enable image resizing, except for Android and Opera,
		// which actually support image resizing, but fail to
		// send Blob objects via XHR requests:
		disableImageResize: /Android(?!.*Chrome)|Opera/
			.test(window.navigator.userAgent),
		imageOrientation: true, //Bruno update
		singleFileUploads: true, //Bruno update
		minFileSize: 1, //Bruno update
		autoUpload: false, //Bruno update
		maxFileSize: 1000000000, //Bruno update (limit to 1GB)
		loadImageMaxFileSize: 100000000, //Bruno update (limit to 100Mb)
		loadImageFileTypes: /^image\/.*$/, //Bruno update
		previewMaxWidth: 120,
		previewMaxHeight: 60,
		messages: {
			maxNumberOfFiles: Lincko.Translation.get('app', 13, 'html'), //Maximum number of files exceeded
			acceptFileTypes: Lincko.Translation.get('app', 14, 'html'), //File type not allowed
			maxFileSize: Lincko.Translation.get('app', 15, 'html'), //File is too large
			minFileSize: Lincko.Translation.get('app', 16, 'html'), //File is too small
			uploadedBytes: Lincko.Translation.get('app', 17, 'html'), //Uploaded bytes exceed file size
		},

		//Array used to smooth the uploading speed and time remaing display
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

			app_upload_files.lincko_files[app_upload_files.lincko_files_index] = data;
			app_upload_files.lincko_files[app_upload_files.lincko_files_index].lincko_type = 'file';
			app_upload_files.lincko_files[app_upload_files.lincko_files_index].lincko_files_index = app_upload_files.lincko_files_index;
			app_upload_files.lincko_files[app_upload_files.lincko_files_index].lincko_status = 'pause';
			app_upload_files.lincko_files[app_upload_files.lincko_files_index].lincko_error = null;
			app_upload_files.lincko_files[app_upload_files.lincko_files_index].lincko_progress = 0;
			app_upload_files.lincko_files[app_upload_files.lincko_files_index].lincko_name = data.files[0].name;
			app_upload_files.lincko_files[app_upload_files.lincko_files_index].lincko_size = data.files[0].size;


			//Reinitialise display information
			that.lincko_bitrate.length = [];
			that.lincko_time.length = [];

			if('process' in data){
				data.process(function () {
					return $('#app_upload_fileupload').fileupload('process', data);
				})
				.fail(function () {
					if (data.files[0].error) {
						data.lincko_status = 'failed';
						data.errorThrown === 'failed'
						data.lincko_error = data.files[0].error;
						data.abort();
					}
				});
			}

			app_upload_files.lincko_files_index++;
			that.progressall(e, this);
			//I should change the line below accoridng to the UI experience
			submenu_Build("app_upload_all", true);
			//This is used to force the preview to appear because the preview variable is not available at once right after the object creation
			setTimeout(function() {
				$('#app_upload_fileupload').fileupload('option').progressall(e, this);
			}, 60);
			//The second timeout is just in case the first one didn't worked
			setTimeout(function() {
				$('#app_upload_fileupload').fileupload('option').progressall(e, this);
			}, 2000);
		},

		//data => File object
		submit: function (e, data) {
			app_upload_files.lincko_files[data.lincko_files_index].lincko_status = 'uploading';
			$('#app_upload_shangzai_puk').val($.cookie("shangzai_puk"));
			$('#app_upload_shangzai_cs').val($.cookie("shangzai_cs"));
		},
		
		//data => File object
		done: function (e, data) {
			if (typeof e !== 'undefined' && e.isDefaultPrevented()) { return false; }
			if(data.result.error){
				app_upload_files.lincko_files[data.lincko_files_index].lincko_status = 'error';
				app_upload_files.lincko_files[data.lincko_files_index].lincko_error = Lincko.Translation.get('app', 18, 'html'); //Server error
				if(typeof data.result.msg === 'string'){
					app_upload_files.lincko_files[data.lincko_files_index].lincko_error = data.result.msg;
				}
				if(data.result.flash.resignin){
					wrapper_force_resign();
				}
				data.fail(e, data);
			} else {
				app_upload_files.lincko_files[data.lincko_files_index].lincko_status = 'done';
				$('#app_upload_fileupload').fileupload('option').progressall(e, this);
				delete app_upload_files.lincko_files[data.lincko_files_index];
			}
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
			if(typeof data === 'object' && data.loaded && data.total && data.bitrate){
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
						if(typeof data === 'object'){
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
			app_upload_files.lincko_record_update();
		},

		//data => File object
		fail: function (e, data) {
			if (typeof e !== 'undefined' && e.isDefaultPrevented()) { return false; }
			if (data.lincko_status === 'failed') {
				data.lincko_error = data.files[0].error || data.errorThrown || Lincko.Translation.get('app', 9, 'html'); //Unknown error
			}
			$('#app_upload_fileupload').fileupload('option').progressall(e, this);
		},

		//data => File object
		destroy: function (e, data) {
			if (typeof e !== 'undefined' && e.isDefaultPrevented()) { return false; }
			app_upload_files.lincko_files[data.lincko_files_index].abort();
			app_upload_files.lincko_files[data.lincko_files_index].lincko_status = 'deleted';
			app_upload_files.lincko_files[data.lincko_files_index].lincko_progress = 0;
			$('#app_upload_fileupload').fileupload('option').progressall(e, this);
			delete app_upload_files.lincko_files[data.lincko_files_index];
			$('#app_upload_fileupload').fileupload('option').progressall(e, this);
		},


		_startHandler: function (e) {
			if(typeof e !== 'undefined'){ e.preventDefault(); }
			var that = this;
			$.each(app_upload_files.lincko_files, function(index, data){
				if(typeof data === 'object'){
					if(data.lincko_status === 'failed'){
						data.lincko_status = 'deleted';
						that.destroy(e, data);
					} else if(typeof data.lincko_type !== 'undefined' && data.lincko_type === 'file'){
						data.lincko_status = 'toto';
						data.submit();
					}
				}
			});
		},

		_cancelHandler: function (e) {
			if(typeof e !== 'undefined'){ e.preventDefault(); }
			var that = this;
			$.each(app_upload_files.lincko_files, function(index, data){
				if(typeof data === 'object'){
					if(typeof data.lincko_type !== 'undefined' && data.lincko_type === 'file' && data.lincko_status !== 'abort'){
						data.lincko_status = 'abort';
						data.abort();
					}
				}
			});
		},

		 _deleteHandler: function (e) {
			if(typeof e !== 'undefined'){ e.preventDefault(); }
			var that = this;
			$.each(app_upload_files.lincko_files, function(index, data){
				if(typeof data === 'object'){
					if(typeof data.lincko_type !== 'undefined' && data.lincko_type === 'file' && data.lincko_status !== 'deleted'){
						data.lincko_status = 'deleted';
						that.destroy(e, data);
					}
				}
			});
		},

		_numberOfFiles: function(){
			var num = 0;
			$.each(app_upload_files.lincko_files, function(index, data){
				if(typeof data === 'object'){
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
			} else if (bytes >= 1000000000) {
				return (bytes / 1000000000).toFixed(2) + ' GB';
			} else if (bytes >= 1000000) {
				return (bytes / 1000000).toFixed(2) + ' MB';
			} else {
				return (bytes / 1000).toFixed(0) + ' KB';
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

			if (bits >= 1000000000) {
				return (bits / 1000000000).toFixed(1) + ' Gbit/s';
			} else if (bits >= 1000000) {
				return (bits / 1000000).toFixed(1) + ' Mbit/s';
			} else if (bits >= 1000) {
				return (bits / 1000).toFixed(0) + ' kbit/s';
			} else {
				return bits.toFixed(0) + ' bit/s';
			}
		},

		_formatComplete: function (loaded, total) {
			if (typeof loaded !== 'number' || typeof total !== 'number') {
				return '?';
			} else if (total >= 1000000000) {
				return (loaded / 1000000000).toFixed(2) + ' GB / ' + (total / 1000000000).toFixed(2) + ' GB';
			} else if (total >= 1000000) {
				return (loaded / 1000000).toFixed(2) + ' MB / ' + (total / 1000000).toFixed(2) + ' MB';
			} else {
				return (loaded / 1000).toFixed(0) + ' KB / ' + (total / 1000).toFixed(0) + ' KB';
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

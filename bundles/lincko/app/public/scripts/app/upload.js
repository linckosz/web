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
		//autoUpload: true, //Bruno update
		loadImageMaxFileSize: 100000000, //Bruno update (limit to 100Mb)
		maxFileSize: 1000000000, //Bruno update (limit to 1GB)
		
		always: function (e, data) {console.log('always');
			var that = $('#app_upload_fileupload').fileupload('option');
			app_upload_files.lincko_numberOfFiles = that._numberOfFiles();
			app_upload_files.lincko_record_update();
		},

		add: function (e, data) {
			if (e.isDefaultPrevented()) {
				return false;
			}
			var that = $('#app_upload_fileupload').fileupload('option');
			app_upload_files.lincko_files[app_upload_files.lincko_files_index] = data;
			app_upload_files.lincko_files[app_upload_files.lincko_files_index].lincko_type = 'file';
			app_upload_files.lincko_files[app_upload_files.lincko_files_index].lincko_files_index = app_upload_files.lincko_files_index;
			app_upload_files.lincko_files[app_upload_files.lincko_files_index].lincko_status = 'pause';
			app_upload_files.lincko_files[app_upload_files.lincko_files_index].lincko_error = null;
			app_upload_files.lincko_files[app_upload_files.lincko_files_index].lincko_progress = 0;
			app_upload_files.lincko_files[app_upload_files.lincko_files_index].lincko_name = data.files[0].name;
			app_upload_files.lincko_files[app_upload_files.lincko_files_index].lincko_size = data.files[0].size;

			data.process().fail(function () {
				if (data.files[0].error) {
					var error = data.files[0].error;
					app_upload_files.lincko_files[app_upload_files.lincko_files_index].lincko_status = 'abort';
					app_upload_files.lincko_files[app_upload_files.lincko_files_index].lincko_error = error;
				}
			});
			app_upload_files.lincko_files_index++;
			app_upload_files.lincko_record_update();
		},
		
		done: function (e, data) {console.log('done');
			if (e.isDefaultPrevented()) {
				return false;
			}
			app_upload_files.lincko_files[data.lincko_files_index].lincko_status = 'done';
			app_upload_files.lincko_record_update();
			delete app_upload_files.lincko_files[data.lincko_files_index];
		},
		
		fail: function (e, data) {
			if (e.isDefaultPrevented()) {
				return false;
			}
			app_upload_files.lincko_files[data.lincko_files_index].lincko_progress = 0;
			if (data.errorThrown === 'abort') {
				app_upload_files.lincko_files[data.lincko_files_index].lincko_status = 'abort';
			} else {
				app_upload_files.lincko_files[data.lincko_files_index].lincko_status = 'failed';
				data.lincko_error = data.files[0].error || data.errorThrown ||
								'Unknown error';
			}
			app_upload_files.lincko_record_update();
		},

		progress: function (e, data) {
			if (e.isDefaultPrevented()) {
				return false;
			}
			var that = $('#app_upload_fileupload').fileupload('option');
			var progress = Math.floor( 100 * data.loaded/data.total );
			if(progress<0){
				progress=0;
			} else if(progress>100){
				progress=100;
			}
			app_upload_files.lincko_files[data.lincko_files_index].lincko_progress = progress;
			app_upload_files.lincko_record_update();
		},

		progressall: function (e, data) {
			if (e.isDefaultPrevented()) {
				return false;
			}
			var that = $('#app_upload_fileupload').fileupload('option');
			var progress = Math.floor( 100 * data.loaded/data.total );
			if(progress<0){
				progress=0;
			} else if(progress>100){
				progress=100;
			}
			app_upload_files.lincko_progressall = progress;
			app_upload_files.lincko_numberOfFiles = that._numberOfFiles();
			app_upload_files.lincko_britate = that._formatBitrate(data.bitrate);
			app_upload_files.lincko_time = that._formatTime((data.total - data.loaded) * 8 / data.bitrate);
			app_upload_files.lincko_loaded = that._formatFileSize(data.loaded);
			app_upload_files.lincko_total = that._formatFileSize(data.total);
			var result = [
				app_upload_files.lincko_numberOfFiles,
				that._formatPercentage(app_upload_files.lincko_progressall),
				app_upload_files.lincko_britate,
				app_upload_files.lincko_time,
				app_upload_files.lincko_loaded,
				app_upload_files.lincko_total,
			];
			console.log(result);
			app_upload_files.lincko_record_update();
		},

		destroy: function (e, data) {
			if (e.isDefaultPrevented()) {
				return false;
			}
			app_upload_files.lincko_files[data.lincko_files_index].abort();
			app_upload_files.lincko_files[data.lincko_files_index].lincko_status = 'deleted';
			app_upload_files.lincko_files[data.lincko_files_index].lincko_progress = 0;
			delete app_upload_files.lincko_files[data.lincko_files_index];
			app_upload_files.lincko_record_update();
		},


		_startHandler: function () {
			$.each(app_upload_files.lincko_files, function(index, data){
				if(typeof data === 'object'){
					if(typeof data.lincko_type !== 'undefined' && data.lincko_type === 'file'){
						data.submit();
						data.lincko_status = 'uploading';
					}
				}
			});
		},

		_cancelHandler: function () {
			$.each(app_upload_files.lincko_files, function(index, data){
				if(typeof data === 'object'){
					if(typeof data.lincko_type !== 'undefined' && data.lincko_type === 'file'){
						if (data.abort) {
							data.abort();
						} else {
							data.errorThrown = 'abort';
							this._trigger('fail', e, data);
						}
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
				return '';
			}
			if (bytes >= 1000000000) {
				return (bytes / 1000000000).toFixed(2) + ' GB';
			}
			if (bytes >= 1000000) {
				return (bytes / 1000000).toFixed(2) + ' MB';
			}
			return (bytes / 1000).toFixed(0) + ' KB';
		},

		_formatBitrate: function (bits) {
			if (typeof bits !== 'number') {
				return '';
			}
			if (bits >= 1000000000) {
				return (bits / 1000000000).toFixed(2) + ' Gbit/s';
			}
			if (bits >= 1000000) {
				return (bits / 1000000).toFixed(2) + ' Mbit/s';
			}
			if (bits >= 1000) {
				return (bits / 1000).toFixed(0) + ' kbit/s';
			}
			return bits.toFixed(0) + ' bit/s';
		},

		_formatPercentage: function (value) {
			return Math.floor(value) + ' %';
		},

		_formatTime: function (seconds) {
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
		 e.preventDefault(); //Disable submit action by click
		 return false; //Disable by JS action
	});

});

var previewer = (function() {
	function pic_preview(id, full) {
		var isNum = !isNaN(id);
		var name ="";
		var orientation = false;
		var url = id;
		var thumbnail = "";
		var download = "";
		if(typeof full != 'boolean'){
			full = true;
		}
		if(isNum)
		{
			name = Lincko.storage.get("files", id, "name");
			orientation = Lincko.storage.get("files", id, "orientation");
			url = Lincko.storage.getLink(id);
			thumbnail = Lincko.storage.getLinkThumbnail(id);
			download = Lincko.storage.getDownload(id);
		}
		else
		{
			id = md5(Math.random());
		}
		
		var popout = $('#-pic_preview_full_screen').clone();
		var Elem_id = 'pic_preview_full_screen_'+id;
		popout.prop("id", Elem_id);
		var target = popout.find("[find=pic_wrapper_pic]");
		target.css('background-image','url("'+thumbnail+'")');
		target.removeClass('display_none');
		if(orientation){
			target.addClass(app_models_file_imageOrientationCSS[orientation]);
		}
		popout.find('.pic_preview_name').html(wrapper_to_html(name));

		if(download == "")
		{
			popout.find('.pic_preview_icon').hide();
		}
		else
		{
			popout.find('.pic_preview_icon').on("click", function(event){
				device_download(download, '_blank', name);
				event.stopPropagation();
			});
		}
		$("body").append(popout);
		popout.find('.close').click(Elem_id, function(event) {
			$('#'+event.data).recursiveRemove();
		});

		popout.find('.pic_preview_wrapper').click(Elem_id, function(event){
			if(!responsive.test("maxMobileL")){return; }
			$('#'+event.data).recursiveRemove();
		});

		if(full){
			var img = new Image();
			img.onload = function(){
				target.css('background-image','url("'+this.src+'")');
			};
			img.src = url;
		}

		return popout;
	}

	function video_preview(id) {
		var isNum = !isNaN(id);
		var name ="";
		var orientation = false;
		var url = id;
		var thumbnail = "";
		var download = "";
		if(Lincko.storage.get("files", id, "name")<100){
		//Need to verify that the player is working for all devices first
			return pic_preview(id, false);
		}
		if(isNum)
		{
			name = Lincko.storage.get("files", id, "name");
			url = Lincko.storage.getLink(id);
			thumbnail = Lincko.storage.getLinkThumbnail(id);
			download = Lincko.storage.getDownload(id);
		}
		else
		{
			id = md5(Math.random());
		}
		
		var popout = $('#-pic_preview_full_screen').clone();
		var Elem_id = 'pic_preview_full_screen_'+id;
		popout.prop("id", Elem_id);
		var target = popout.find("[find=pic_wrapper_video]");
		target.prop('id', 'pic_wrapper_video_'+id);
		target.removeClass('display_none');
		popout.find('.pic_preview_name').html(wrapper_to_html(name));

		if(download == "")
		{
			popout.find('.pic_preview_icon').hide();
		}
		else
		{
			popout.find('.pic_preview_icon').on("click", function(event){
				device_download(download, '_blank', name);
				event.stopPropagation();
			});
		}
		$("body").append(popout);
		popout.find('.close').click(Elem_id, function(event) {
			$('#'+event.data).recursiveRemove();
		});

		popout.find('.pic_preview_wrapper').click(Elem_id, function(event){
			if(!responsive.test("maxMobileL")){ return; }
			if($(event.target).is(this)){
				$('#'+event.data).recursiveRemove();
			}
		});

		app_previewer_StartPlayer('pic_wrapper_video_'+id, url, thumbnail, 100, true, true);

		return popout;
	}

	return {
		'pic': pic_preview,
		'video': video_preview,
		'audio': video_preview,
	}
})();

var app_previewer_TimingPlay;
function app_previewer_StartPlayer(elem_id, video, thumb, volume, fs, autostart){
	//video = "http://bruno.file.lincko.cafe:8080/aaa.mp4";
	//video = "http://bruno.file.lincko.cafe:8080/file/0/ZWtQR0k3L3NvUWtZMXVSQ1djYUNiOVladDhDeTJtUjgrQjJhYWFZRUxGaz0=/link/23111/VID-20170216-084203.mp4?1487206928";
	//video = "http://bruno.file.lincko.cafe:8080/file/0/ZWtQR0k3L3NvUWtZMXVSQ1djYUNiOVladDhDeTJtUjgrQjJhYWFZRUxGaz0=/link/23111/ccc.mp4";
	//video = "http://bruno.file.lincko.cafe:8080/file/0/ZWtQR0k3L3NvUWtZMXVSQ1djYUNiOVladDhDeTJtUjgrQjJhYWFZRUxGaz0=/link/23112/bbb.mp4";
	//console.log(video);
	//video = video + '?' + (new wrapper_date().timestamp);
	//console.log(video);
	jwplayer(elem_id).setup({
		autostart: autostart,
		allowfullscreen: fs,
		volume: volume,
		file: video,
		image: thumb,
		bufferlength: 4,
		smoothing: true,
		frontcolor: 'cccccc',
		lightcolor: '66cc00',
		backcolor: '111111',
		controlbar: 'over',
		base: "/scripts/libs/jwplayer-7.9.1-lincko/",
		skin: {
			name: "seven",
		},
		dock: true,
		icons: true,
		width: '100%', //Small screen => 640 / Big screen => 800
		height: '100%', //Small screen => 360 / Big screen => 450
		stretching: 'uniform',
		seamlesstabbing: false, //Authorize to navigate into the menu bytabulation
		wmode: 'opaque',
		events: {
			onComplete: function(){
				clearTimeout(app_previewer_TimingPlay);
				this.stop();
				this.setFullscreen(false);
			},
			onBeforePlay: function(){
				clearTimeout(app_previewer_TimingPlay);
			},
			onReady: function(){
				clearTimeout(app_previewer_TimingPlay);
				if(autostart){
					app_previewer_TimingPlay = setTimeout(function(videoobject){
						if(videoobject){
							if('play' in videoobject){
								videoobject.play();
							}
						}
					}, 300, this);
				} else {
					app_previewer_TimingPlay = setTimeout(function(videoobject){
						if(videoobject){
							if('stop' in videoobject){
								videoobject.stop();
							}
							videoobject = false; //Destroy the link to the object
						}
					}, 100, this);
				}
			},
			onPlay: function(){
				this.setFullscreen(false);
				clearTimeout(app_previewer_TimingPlay);
			},
			onPause: function(){
				clearTimeout(app_previewer_TimingPlay);
			},
			onSeek: function(){
				clearTimeout(app_previewer_TimingPlay);
			},
			onVolume: function(){
				clearTimeout(app_previewer_TimingPlay);
			},
			onFullscreen: function(){
				clearTimeout(app_previewer_TimingPlay);
			},
			onRemove: function(){
				clearTimeout(app_previewer_TimingPlay);
				if(videoobject){
					if('stop' in videoobject){
						videoobject.stop();
					}
					videoobject = false; //Destroy the link to the object
				}
			},
		},
	});
}

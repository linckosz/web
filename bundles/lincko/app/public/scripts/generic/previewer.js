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
			if(!responsive.test("maxMobileL")){ return; }
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

	function pic_url(url) {
		var popout = $('#-pic_preview_full_screen').clone();
		var Elem_id = 'pic_preview_full_screen_0';
		popout.prop("id", Elem_id);
		var target = popout.find("[find=pic_wrapper_pic]");
		target.css('background-image','url("'+url+'")');
		target.removeClass('display_none');
		popout.find('.pic_preview_name').recursiveRemove();
		popout.find('.pic_preview_icon').recursiveRemove();

		$("body").append(popout);
		popout.find('.close').click(Elem_id, function(event) {
			$('#'+event.data).recursiveRemove();
		});

		popout.find('.pic_preview_wrapper').click(Elem_id, function(event){
			if(!responsive.test("maxMobileL")){ return; }
			$('#'+event.data).recursiveRemove();
		});

		return popout;
	}

	function video_preview(id) {
		var isNum = !isNaN(id);
		var name ="";
		var orientation = false;
		var url = id;
		var thumbnail = "";
		var download = "";
		if(Lincko.storage.get("files", id, "progress")<100){
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
		// target.find("[find=pic_wrapper_video_content]").attr("src",url);

		target.removeClass('display_none');
		target.attr("src",url + '&pukpic=' + encodeURIComponent(getCookie('pukpic')));
		target.mediaelementplayer({
			alwaysShowControls:true,
			setDimensions:false,
			enableAutosize:true,
			pluginPath: "/path/to/shims/", 
			success: function(mediaElement, originalNode) {
			// do things
			}
		});

		// To access player after its creation through jQuery use:
		var playerId = target.closest('.mejs__container').attr('id');
		// or $('#mediaplayer').closest('.mejs-container').attr('id') in "legacy" stylesheet

		var player = mejs.players[playerId];
		// With iOS (iPhone), since it defaults always to QuickTime, you access the player directly;
		// i.e., if you wanna exit fullscreen on iPhone using the player, use this:
		// var player = $('#mediaplayer')[0];
		// player.webkitExitFullScreen();

		
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

		return popout;
	}

	return {
		'pic': pic_preview,
		'pic_url': pic_url,
		'video': video_preview,
		'audio': video_preview,
	}
})();

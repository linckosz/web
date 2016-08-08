var previewer = (function() {
	function pic_preview(id) {
		var name = Lincko.storage.get("files", id, "name");
		var orientation = Lincko.storage.get("files", id, "orientation");
		var url = Lincko.storage.getLink(id);
		var thumbnail = Lincko.storage.getLinkThumbnail(id);
		var download = Lincko.storage.getDownload(id);

		var popout = $('#-pic_preview_full_screen').clone();
		var Elem_id = 'pic_preview_full_screen_'+id;
		popout.prop("id", Elem_id);
		popout.find('img').attr('src', url);
		if(orientation){
			popout.find('img').addClass(app_models_file_imageOrientationCSS[orientation]);
		}
		popout.find('.pic_preview_name').html(wrapper_to_html(name));
		//popout.find('img').attr('src', url); //toto - is this duplicate for a reason?
		popout.find('.pic_preview_icon').attr("href", download);
		$("body").append(popout);
		popout.find('.close').click(Elem_id, function(event) {
			$('#'+event.data).remove();
		});

		popout.find('.pic_preview_wrapper').click(function(event){
			if(!responsive.test("maxMobileL")){return; }
			if($(event.target).hasClass('pic_preview_wrapper') || $(event.target).hasClass('pic_wrapper')){
				$('#'+Elem_id).remove();
			}
		});

		return popout;
	}
	function video_preview(id) {
		var popout = pic_preview(id);
		var url = Lincko.storage.thumbnail.video;
		popout.find('img').attr('src', url);
		return false; //toto => Need to enable video preview

		var name = Lincko.storage.get("files", id, "name");
		var url = Lincko.storage.getLink(id);
		var thumbnail = Lincko.storage.getLinkThumbnail(id);
		var download = Lincko.storage.getDownload(id);

		var popout = $('#-player_preview_full_screen').clone();
		var Elem_id = 'player_preview_full_screen_'+id;
		popout.prop("id", Elem_id);
		$("body").append(popout);
		popout.find('.player_preview_wrapper');
		thumbnail = Lincko.storage.thumbnail.video; //toto => temp solution because no video thumbnail yet
		popout.find('.player_preview_wrapper').setupPlayer(url, thumbnail);
		popout.find('.close').click(Elem_id, function(event) {
			$('#'+event.data).remove();
		});
		return popout;
	}
	return {
		'pic': pic_preview,
		'video': video_preview,
	}
})();

var previewer = (function() {
	function pic_preview(name, url) {
		var popout = $('#-pic_preview_full_screen').clone();
		var preview_md5 = md5(url);
		popout.prop("id", 'pic_preview_full_screen_'+preview_md5);
		popout.find('img').attr('src', url);
		popout.find('.pic_preview_name').html(name);
		popout.find('img').attr('src', url);
		popout.find('.pic_preview_icon').attr("href", url);
		$("body").append(popout);
		$('.close', '#pic_preview_full_screen').click(function() {
			$('#pic_preview_full_screen').remove();
		});
	}
	function video_preview(name, url, thumbnail) {
		var popout = $('#-player_preview_full_screen').clone();
		var preview_md5 = md5(url);
		popout.prop("id", 'player_preview_full_screen_'+preview_md5);
		$("body").append(popout);
		$("#player_preview_full_screen .player_preview_wrapper").prop("id", 'player_preview_container');
		$("#player_preview_container").setupPlayer(url, thumbnail);
		$('.close', '#player_preview_full_screen').click(function() {
			$('#player_preview_full_screen').remove();
		});
	}
	return {
		'pic': pic_preview,
		'video': video_preview,
	}
})();

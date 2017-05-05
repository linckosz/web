var app_models_audio = {
	status:0,//0:none;1:playing;2:pause;3.stop;
	src:'',
	audio_id:0,
	current_interval:0,
	finish_interval:0,
	current_dom:false,
	buildTo:function(container,audio_id,elem_id){
		var audio_dom = $('#-app_models_lincko_audio').clone();
		audio_dom.prop('id',elem_id === 'undefined' ? '' : elem_id);
		audio_dom.attr('audio_id',audio_id);
		container.append(audio_dom);
	},
	build:function(audio_id){
		var audio_dom = $('#-app_models_lincko_audio').clone();
		audio_dom.attr('audio_id',audio_id);
		audio_dom.prop('id','');
		return audio_dom;
	},
	initAudioEvent:function(){
		if($('#app_models_audio_control').length<=0){
			var audio_control = $('#-app_models_audio_control').clone();
			audio_control.prop('id','app_models_audio_control');
			$('body').append(audio_control);

			audio_control.on('ended',function () {
				clearInterval(app_models_audio.current_interval);
				var mode = 'icon-audio';
				if(app_models_audio.current_dom)
				{
					if(app_models_audio.current_dom.find('[find=play]').eq(0).hasClass('icon-audio1') || 
					app_models_audio.current_dom.find('[find=play]').eq(0).hasClass('icon-audio2') ||
					app_models_audio.current_dom.find('[find=play]').eq(0).hasClass('icon-audio') ){
					mode = 'icon-audio';
					}
					else if(app_models_audio.current_dom.find('[find=play]').eq(0).hasClass('icon-audioopposite1') || 
						app_models_audio.current_dom.find('[find=play]').eq(0).hasClass('icon-audioopposite2') ||
						app_models_audio.current_dom.find('[find=play]').eq(0).hasClass('icon-audioopposite') ){
						mode = 'icon-audioopposite';
					}
					app_models_audio.current_dom.find('[find=play]').removeClass(mode + '1');
					app_models_audio.current_dom.find('[find=play]').removeClass(mode + '2');
					app_models_audio.current_dom.find('[find=play]').addClass(mode);
					app_models_audio.current_dom = false;
				}
			});
		}
		$("#app_application_submenu_block,#app_content_submenu_preview").on('mouseup touchstart', '.app_models_lincko_audio', function(event) {
				var audio_id = $(this).attr('audio_id');
				app_models_audio.pause();
				app_models_audio.animation($(this));
				app_models_audio.status = 1;
				app_models_audio.src = Lincko.storage.getLink(audio_id);
				app_models_audio.audio_id = audio_id;
				app_models_audio.play();
		});
	},
	animation:function(elem){
		if(app_models_audio.current_dom)
		{
			var last_mode ='icon-audio'; //0 for other,1 for self;
			if(app_models_audio.current_dom.find('[find=play]').eq(0).hasClass('icon-audio'))
			{
				last_mode ='icon-audio';
			}
			else if(app_models_audio.current_dom.find('[find=play]').eq(0).hasClass('icon-audioopposite'))
			{
				last_mode ='icon-audioopposite';
			}
			if(app_models_audio.current_interval != 0)
			{
				clearInterval(app_models_audio.current_interval);
				app_models_audio.current_interval = 0;
				if(app_models_audio.current_dom)
				{
					app_models_audio.current_dom.find('[find=play]').removeClass(last_mode + '1');
					app_models_audio.current_dom.find('[find=play]').removeClass(last_mode + '2');
					app_models_audio.current_dom.find('[find=play]').addClass(last_mode);
				}
			}
		}


		var mode = 'icon-audio';
		if(elem.find('[find=play]').eq(0).hasClass('icon-audio')){
			mode ='icon-audio';
		}
		else if(elem.find('[find=play]').eq(0).hasClass('icon-audioopposite')){
			mode ='icon-audioopposite';
		}
		var icon_index = ['1','2',''];
		var index = 0;
		app_models_audio.current_dom = elem;
		app_models_audio.current_interval = setInterval(function(mode){
			var audio_control = $('#app_models_audio_control');
			elem.find('[find=play]').removeClass(mode + icon_index[((index+1) % 3)]);
			elem.find('[find=play]').removeClass(mode + icon_index[((index+2) % 3)]);
			elem.find('[find=play]').addClass(mode + icon_index[(index % 3)]);
			index++;
		},400,mode);
	},
	play:function(){
		$('#app_models_audio_control').attr('src',app_models_audio.src);
		$('#app_models_audio_control')[0].play();
	},
	pause:function(){
		$('#app_models_audio_control')[0].pause();
	},
	clear:function(){
		app_models_audio.pause();
		app_models_audio.status = 0;
		app_models_audio.src = '';
		app_models_audio.audio_id = 0;
	}
}

var audio_garbage_start_id = app_application_garbage.add('audio_garbage_start');

app_application_lincko.add(
	audio_garbage_start_id, 
	"submenu_show", 
	function() {
	app_models_audio.initAudioEvent();
	app_application_garbage.remove(audio_garbage_start_id);
});

app_application_lincko.add(
	"app_models_audio_all", 
	"submenu_hide", 
	function() {
	app_models_audio.clear();
});

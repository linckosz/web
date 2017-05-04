var app_models_audio = {
	status:0,//0:none;1:playing;2:pause;3.stop;
	src:'',
	audio_id:0,
	buildTo:function(containner,audio_id,elem_id){
		var audio_dom = $('#-app_models_lincko_audio').clone();
		audio_dom.prop('id',elem_id === 'undefined' ? '' : elem_id);
		audio_dom.attr('audio_id',audio_id);
		
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
		}
		$("#app_application_submenu_block,#app_content_submenu_preview").on('mousedown touchstart', '.app_models_lincko_audio', function(event) {
			var audio_id = $(this).attr('audio_id');
			app_models_audio.pause();
			app_models_audio.status = 1;
			app_models_audio.src = Lincko.storage.getLink(audio_id);
			app_models_audio.audio_id = audio_id;
			app_models_audio.play();
		});
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

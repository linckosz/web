var app_models_audio = {
	status:0,//0:none;1:playing;2:pause;3.stop;
	src:'',
	audio_id:0,
	current_interval:0,
	current_dom:false,
	current_mode:'',
	timmer_interval:0,
	timmer : 0,
	buildTo:function(container,audio_id,elem_id){
		var audio_dom = $('#-app_models_lincko_audio').clone();
		audio_dom.prop('id',elem_id === 'undefined' ? '' : elem_id);
		audio_dom.attr('audio_id',audio_id);
		container.append(audio_dom);
	},
	build:function(audio_id,content,timer){
		var audio_dom = $('#-app_models_lincko_audio').clone();
		if(!isNaN(audio_id)){
			var duration = Lincko.storage.get('files' , audio_id, 'comment');
			if(duration){
				audio_dom.find('[find=time]').text(duration + '\'\'');
				duration = duration > 60 ? 65 : duration;
				audio_dom.find('[find=time]').width(40 + duration * 2);
			}
			audio_dom.attr('audio_id',audio_id);
		}
		else if(typeof content !== 'undefined'){
			var lazy = $('#-app_models_lincko_audio_lazy').clone();
			lazy.prop('id','')
			audio_dom.append(lazy);
			audio_dom.attr('data',content);
			timer = timer / 1000;
			audio_dom.find('[find=time]').text(timer + '\'\'');
			duration = timer > 60 ? 65 : timer;
			audio_dom.find('[find=time]').width(40 + timer * 2);
		}
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
				if(app_models_audio.current_dom)
				{

					app_models_audio.current_dom.find('[find=play]').removeClass(app_models_audio.current_mode + '1');
					app_models_audio.current_dom.find('[find=play]').removeClass(app_models_audio.current_mode + '2');
					app_models_audio.current_dom.find('[find=play]').addClass(app_models_audio.current_mode);

					app_models_audio.status = 3;
					app_models_audio.src = '';
					app_models_audio.audio_id = 0;
					app_models_audio.current_interval = 0;
					app_models_audio.current_dom = false;
					app_models_audio.current_mode = '';
				}
			});
		}

		$("#app_application_submenu_block,#app_content_submenu_preview").on('mousedown touchstart', '.app_models_lincko_audio', function(event) {
				app_models_audio.timmer_interval = setInterval(function(){
					app_models_audio.timmer += 200;
					if(app_models_audio.timmer >= 1000)
					{
						clearInterval(app_models_audio.timmer_interval);
					}
				},200);
		});


		$("#app_application_submenu_block,#app_content_submenu_preview").on('mouseup touchend', '.app_models_lincko_audio', function(event) {
				if(app_models_audio.timmer < 1000)
				{
					var audio_id = $(this).attr('audio_id');
					app_models_audio.pause();
					app_models_audio.animation($(this));
					app_models_audio.status = 1;

					if(isNaN(audio_id)){
						app_models_audio.src = "data:audio/mp3;base64," + $(this).attr('data');
					}
					else{
						app_models_audio.src = Lincko.storage.getLink(audio_id);
					}
					
					app_models_audio.audio_id = audio_id;
					app_models_audio.play();
				}	
				clearInterval(app_models_audio.timmer_interval);
				app_models_audio.timmer = 0;
				app_models_audio.timmer_interval = 0;
		});
	},
	animation:function(elem){
		if(app_models_audio.current_dom)
		{
			
			if(app_models_audio.current_interval != 0)
			{
				clearInterval(app_models_audio.current_interval);
				app_models_audio.current_interval = 0;
				if(app_models_audio.current_dom)
				{
					app_models_audio.current_dom.find('[find=play]').removeClass(app_models_audio.current_mode + '1');
					app_models_audio.current_dom.find('[find=play]').removeClass(app_models_audio.current_mode + '2');
					app_models_audio.current_dom.find('[find=play]').addClass(app_models_audio.current_mode);
				}
			}
		}

		var icon_index = ['1','2',''];
		var index = 0;
		app_models_audio.current_dom = elem;
		if(elem.find('[find=play]').hasClass('icon-audio')){
			app_models_audio.current_mode = 'icon-audio';
		}
		else if(elem.find('[find=play]').hasClass('icon-audioopposite')){
			app_models_audio.current_mode = 'icon-audioopposite';
		}
		app_models_audio.current_interval = setInterval(function(mode){
			var audio_control = $('#app_models_audio_control');
			elem.find('[find=play]').removeClass(mode + icon_index[((index+1) % 3)]);
			elem.find('[find=play]').removeClass(mode + icon_index[((index+2) % 3)]);
			elem.find('[find=play]').addClass(mode + icon_index[(index % 3)]);
			index++;
		},400,app_models_audio.current_mode);
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
		clearInterval(app_models_audio.current_interval);
		app_models_audio.current_interval = 0;
		app_models_audio.current_dom = false;
		app_models_audio.current_mode = '';
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

var app_models_audio_all = app_application_garbage.add('app_models_audio_all');
app_application_lincko.add(
	app_models_audio_all, 
	"submenu_hide", 
	function() {
		app_models_audio.clear();
});

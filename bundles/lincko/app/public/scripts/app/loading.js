var app_loading_progress = {
	
	'progress': 0,

	'done': false,

	'move': function(value){
		var time = 2000;
		if(typeof value === 'number'){
			if(value<0){ value = 0; }
			else if(value>100){ value = 100; }
			this.progress = value;
			if(value>=100){
				time = 300;
			}
			if(!this.done){
				value = Math.ceil(value);
				$('#app_loading_progress_bar').clearQueue().stop().animate(
					{
						width: value+'%',
					},
					{
						duration: time,
						complete: function(){
							if(value>=100){
								this.done = true;
								$('#app_loading_main_table').velocity(
									{
										opacity: 0,
									},
									{
										delay: 150,
										duration: 100,
										complete: function(){
											$(this).hide().remove();
										},
									}
								);
							}
						},
					}
				);
			}
		}
	}
};

app_loading_progress.move(1);

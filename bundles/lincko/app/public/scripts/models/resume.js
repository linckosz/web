//Category 38
/*
	app_models_resume_format_sentence(9984);
	app_models_resume_format_sentence(9984, 1);
*/
var app_models_resume_format_sentence = function(comments_id, type) {
	if(typeof type == 'undefined'){ type = 1; }

	var comment = Lincko.storage.get('comments', comments_id, 'comment');
	var sentence = '';
	var format = false; //Display it as a text by default
	var base = 0;
	var uid = 0;
	var list = {};
	if(comment){
		try {
			var temp = JSON.parse(comment);
			if($.type(temp) != 'object'){
				format = 'quote';
			} else if(temp[0]){ //By default we force to display team in priority
				uid = 0;
				list = temp[uid];
				format = 'resume';
			} else if(temp[wrapper_localstorage.uid]){
				uid = wrapper_localstorage.uid;
				list = temp[uid];
				format = 'resume';
			} else if(temp['ob']){
				if($.type(temp['ob']) == 'object'){
					for(var i in temp['ob']){
						format = 'onboarding';
						sentence = i;
						list = temp['ob'][i];
						break; //Just grab the first ID
					}
				}
			} else if(temp['quote']){
				format = 'quote';
			} else if($.type(temp) == 'object'){
				return false; //Do not display any json that cannot be interpreted
			} else {
				format = false;
			}

		} catch(err) {
			format = false;
		}
	} else {
		return false;
	}

	//No activity comments
	if(comment==100){
		base = 100; //Daily
		return $('<span>')
			.addClass('unselectable')
			.html(wrapper_to_html(
				Lincko.Translation.get('app', 3811, 'html') //There was no activity yesterday.
			));
	} else if(comment==700){
		return $('<span>')
			.addClass('unselectable')
			.html(wrapper_to_html(
				Lincko.Translation.get('app', 3817, 'html') //There was no activity last week.
			));
	}

	if(format == 'resume'){

		if(list[100]){
			base = 100; //Daily
		} else if(list[700]){
			base = 700; //Weekly
		}

		var data = {};
		for (var i = base; i < base+100; i++) {
			data[i] = '0';
			if(list[i]){
				if(typeof list[i] == 'object'){
					data[i] = ''+list[i].length;
				} else if(i==base+8){
					data[i] = ''+Lincko.storage.get('users', list[i], 'username');
				} else {
					data[i] = ''+list[i];
				}
			}
		}
		
		if(uid==0){
			if(base==100){
				if(type==1){
					sentence = Lincko.Translation.get('app', 3801, 'pure', data);
					if(typeof data[108] != 'undefined' && data[108]!=0){
						sentence = sentence + ' ' + Lincko.Translation.get('app', 3802, 'pure', data);
					}
				}
			} else if(base==700){
				if(type==1){
					sentence = Lincko.Translation.get('app', 3803, 'pure', data);
					if(typeof data[708] != 'undefined' && data[708]!=0){
						sentence = sentence + ' ' + Lincko.Translation.get('app', 3804, 'pure', data);
					}
				}
			}
		} else {
			data['username'] = Lincko.storage.get('users', uid, 'username');
			if(base==100){
				if(type==1){
					data['motivation'] = '';
					if(typeof data[132] != 'undefined' && data[132]>0){ //Done more than last week
						data['motivation'] = Lincko.Translation.get('app', 3808, 'pure'); //That's more than yesterday. Great work!
					}
					sentence = Lincko.Translation.get('app', 3807, 'pure', data); //Hi [{username}]: You completed <span find="101">[{101}] task(s)</span> today![{motivation}]You have <span find="130">[{130}] task(s)</span> due tomorrow. You currently have <span find="105">[{105}] overdue task(s)</span>.
				}
			} else if(base==700){
				if(type==1){
					data['whatweek'] = '';
					if(typeof data[701] != 'undefined' && data[701]>=2){ //At least 2 completed tasks during the week
						data['whatweek'] = Lincko.Translation.get('app', 3812, 'pure'); //What a week!
					}
					data['motivation'] = '';
					if(typeof data[732] != 'undefined' && data[732]>0){
						data['motivation'] = Lincko.Translation.get('app', 3810, 'pure'); //That's more than last week! You're really making progress.
					}
					sentence = Lincko.Translation.get('app', 3809, 'pure', data); //Hi [{username}]: [{whatweek}]You completed <span find="701">[{701}] task(s)</span> this week.[{motivation}]You have <span find="730">[{730}] task(s)</span> due next week... but it's the weekend so make sure to take a break. You currently have <span find="705">[{705}] overdue task
				}
			}
		}

		if(uid==0){
			sentence = sentence + '<div find="result" link="" class="ellipsis"></div>';
			var span = $('<span>').html(sentence);
		} else {
			var span = $('<span>').addClass('app_models_resume_individual_span');
			var cell_shhh = $('<span>').addClass('app_models_resume_individual_shhh').html("["+Lincko.Translation.get('app', 3805, 'pure')+"]"); //Shhh
			var cell_info = $('<span>');

			var private = $('<div>').addClass('app_models_resume_individual_private ellipsis').html(Lincko.Translation.get('app', 3806, 'pure')); //Private Message - Only you can see this.
			cell_info.append(private);
			cell_info.append(sentence);
			span.append(cell_shhh);
			span.append(cell_info);
			span.append('<div find="result" link="" class="ellipsis"></div>');
		}
		span.addClass('app_models_resume_span unselectable report');
		span.attr('find', 'anchor_'+comments_id);
		var result = {};
		//Attach event click
		//Task list
		links = {
			
			101: ['tasks', 'app_models_resume_tasks', ],
			701: ['tasks', 'app_models_resume_tasks', ],

			102: ['tasks', 'app_models_resume_tasks', ],
			702: ['tasks', 'app_models_resume_tasks', ],
			
			103: ['tasks', 'app_models_resume_tasks', ],
			703: ['tasks', 'app_models_resume_tasks', ],

			104: ['tasks', 'app_models_resume_tasks', ],
			704: ['tasks', 'app_models_resume_tasks', ],
			
			105: ['tasks', 'app_models_resume_tasks_overdue', ],
			705: ['tasks', 'app_models_resume_tasks_overdue', ],

			111: ['notes', 'app_models_resume_notes', ],
			711: ['notes', 'app_models_resume_notes', ],

			121: ['files', 'app_models_resume_files', ],
			721: ['files', 'app_models_resume_files', ],

			130: ['tasks', 'app_models_resume_tasks', ],
			730: ['tasks', 'app_models_resume_tasks', ],

			131: ['tasks', 'app_models_resume_tasks', ],
			731: ['tasks', 'app_models_resume_tasks', ],

		};

		for(var i in links){
			if(typeof list[i] == 'object'){
				if(list[i].length<=0){
					continue;
				}
				result = {};
				result[links[i][0]] = list[i];
				span.find("[find="+i+"]")
				.click([span, result, links[i][1], i, comments_id], function(event){
					app_models_resume_listup(event.data[0], event.data[1], event.data[2], event.data[3], event.data[4]);
				})
				.addClass(links[i][1]);
			}
		}
		return span;

	} else if(format == 'onboarding'){
		var text = wrapper_to_html(Lincko.Translation.get('app', sentence, 'html'));
		text = base_lincko_tag_to_html(text);
		var span = $('<span>').html(text);
		span.addClass('onboarding');
		var span_arr = [];
		var j = 0;
		var next = false;
		if($.type(list) == 'object'){
			for(var i in list){
				var answer = list[i];
				var next = answer[1];
				text = wrapper_to_html(Lincko.Translation.get('app', i, 'html'));
				span_arr[j] = $('<span>').html(text).addClass('app_models_resume_onboarding_answer');
				if(answer[0]=='action'){
					span_arr[j].click([comments_id, answer, i], function(event){
						var current = event.data[0];
						var answer = event.data[1];
						var next = answer[1];
						var text_id = event.data[2];
						var param = [];
						for(var k in answer){
							if(k>=2){
								param.push(answer[k]);
							}
						}
						if(param.length>0){
							//This function must call "app_models_resume_onboarding_continue(current, next)" once the action is completed
							onboarding.action_launch(current, next, text_id, param);
						} else {
							app_models_resume_onboarding_continue(current, next, text_id);
						}
					});
				} else if(answer[0]=='now'){
					span_arr[j] = null;
					delete span_arr[j];
					setTimeout(function(data){
						var sub = span.submenu_getWrapper(); 
						if(sub && sub[0]['param']['type'] == 'history'){ //We launch it in activity feed only
							var current = data[0];
							var answer = data[1];
							var next = answer[1];
							var text_id = data[2];
							var param = [];
							for(var k in answer){
								if(k>=2){
									param.push(answer[k]);
								}
							}
							if(param.length>0){
								//This function must call "app_models_resume_onboarding_continue(current, next)" once the action is completed
								onboarding.action_launch(current, next, text_id, param);
							} else {
								app_models_resume_onboarding_continue(current, next, text_id);
							}
						}
					}, 2000, [comments_id, answer, i]); //Delay 2s to launch the action
				} else {
					span_arr[j].click([comments_id, answer, i], function(event){
						var current = event.data[0];
						var answer = event.data[1];
						var next = answer[1];
						var text_id = event.data[2];
						app_models_resume_onboarding_continue(current, next, text_id);
					});
				}
				j = span_arr.length;
			}
		}
		if(span_arr.length>0){
			//This function should be internally launched once the DOM of the chat is finished to be drawn, otherwise we may not be able to find the position where to insert the answers
			app_models_evan_fn(comments_id, span_arr); //toto
		}
		return span;
	} else if(format == 'quote'){
		//A random quote (will be the same for the same comment ID)
		var random_quote = parseInt(comments_id, 10);
		var random_quote = 9901 + random_quote - (46 * Math.floor( random_quote / 46));

		return $('<span>')
			.addClass('unselectable')
			.html(wrapper_to_html(
				Lincko.Translation.get('app', random_quote, 'html') //“Knowing trees, I understand the meaning of patience. Knowing grass, I can appreciate persistence.” – Hal Borland
			));
	} else if(!format){
		return $('<span>').html(base_lincko_tag_to_html(wrapper_to_html(comment)));
	}

	return false;

};

var app_models_resume_format_answer = function(text) {
	try {
		var temp = JSON.parse(text);
		if($.type(temp) == 'object' && temp['answer']){
			text = Lincko.Translation.get('app', temp['answer'], 'pure');
		}
	} catch(err) {}
	return text;
}


var app_models_evan_fn = function(current, span_arr){
	setTimeout(function(current,span_arr){
		var dom = $('[onboarding_id='+current+']');
		var answer = $('#models_history_answer_options_'+current);
		if(dom.length > 0 )
		{
			if(answer.length == 0)
			{
				var options = $('#-models_history_answer_options').clone();
				options.prop('id','models_history_answer_options_'+current)
				options.addClass('models_history_self');
				for(var i in span_arr)
				{
					options.find('[find=answers_wrapper]').append(span_arr[i]);
				}

				dom.after(options);
				
				options.velocity("bruno.slideRightIn", { 
					duration: 1000,
				});

				var submenu = dom.submenu_getWrapper()[0];
				var overthrow_id = "overthrow_"+submenu.id;
				var iScroll = myIScrollList[overthrow_id];
				var last = $('#'+submenu.id+'_help_iscroll').get(0);
				submenu_resize_content();
				iScroll.scrollToElement(last, 0);
			}
		}
	},5,current,span_arr);
};

$("body").on("click", '.app_models_resume_onboarding_answer',function(){
	var options = $(this).closest('.models_history_answer_options');
	options.velocity("bruno.slideRightOut", { 
		duration: 500,
		complete:function(){
			options.recursiveRemove();
			var dom = $('[onboarding_id='+current+']');
			if(dom.length > 0 )
			{
				var submenu = dom.submenu_getWrapper()[0];
				var overthrow_id = "overthrow_"+submenu.id;
				var iScroll = myIScrollList[overthrow_id];
				var last = $('#'+submenu.id+'_help_iscroll').get(0);
				submenu_resize_content();
				iScroll.scrollToElement(last, 0);
			}
		} 
	});	
});

$("body").on("click",".onboarding img",function(){
	previewer['pic']($(this).attr("src"));
});

var app_models_resume_onboarding_continue = function(current, next, text_id){
	var answer = false;
	if(typeof text_id != 'undefined'){
		//answer = Lincko.Translation.get('app', text_id, 'pure');
		answer = JSON.stringify({answer: text_id,}); //Give a code to be able to translate in live the answers
	}
	var data = {
		current: current,
		next: next,
		answer: answer,
	};
	wrapper_sendAction(data, 'post', 'onboarding/next');
};

var app_models_resume_listup = function(Elem, list, color, link, comments_id){
	var div = Elem.find("[find=result]");
	if(div.attr('link')==''){
		div.attr('link', link);
		for(var type in list){
			for(var i in list[type]){
				var id = list[type][i]
				var sub = $('<div>');
				var title = Lincko.storage.getPlus(type, id);
				if(title){
					$('<br>').appendTo(div);
					sub
					 .html(wrapper_to_html(title))
					 .click([type, id], function(event){
						var type = event.data[0];
						var id = event.data[1];
						var preview = false;
						var layer = true;
						var wrapper = $(this).closest('.submenu_wrapper');
						if(wrapper.length > 0){
							if(wrapper.hasClass('submenu_wrapper_preview')){
								preview = true;
							}
							var submenu = submenu_getById(wrapper[0].id);
							if(submenu){
								layer = submenu.layer+1;
							}
						}
						submenu_Build(
							'taskdetail',
							layer,
							null,
							{
								type: type,
								id: id,
							},
							preview
						);
					})
					 .addClass(color)
					 .addClass('app_models_resume_links ellipsis');
					sub.appendTo(div);
				}
			}
		}
		div.velocity("slideDown", {
			mobileHA: hasGood3Dsupport,
			duration: 200,
			complete: function(){
				var wrapper = $(this).closest('.submenu_wrapper');
				if(wrapper.length > 0){
					var iScroll = myIScrollList["overthrow_"+wrapper[0].id];
					if(iScroll){
						iScroll.refresh();
						var scrollTo = document.getElementById(wrapper[0].id).querySelector("[find=anchor_"+comments_id+"]");
						iScroll.scrollToElement(scrollTo, 600, 0, -34, IScroll.utils.ease.circular);
					}
				}
			},
		});
	} else {
		var link_old = div.attr('link');
		div.velocity("slideUp", {
			mobileHA: hasGood3Dsupport,
			duration: 300,
			complete: function(){
				$(this).empty();
				div.attr('link', '');
				if(link != link_old){
					app_models_resume_listup(Elem, list, color, link, comments_id);
				} else {
					wrapper_IScroll();
				}
			},
		});
	}
};
var toto;

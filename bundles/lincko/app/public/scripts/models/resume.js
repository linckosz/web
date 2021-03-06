//Category 38
/*
	app_models_resume_format_sentence(9984);
	app_models_resume_format_sentence(9984, 1);
*/
var app_models_resume_format_sentence_answers = {};
var app_models_resume_format_sentence = function(comments_id, type, subm) {
	if(typeof type == 'undefined'){ type = 1; }
	if(typeof subm == 'undefined'){ subm = false; }

	var item = Lincko.storage.get('comments', comments_id);
	var comment = item['+comment'];
	var created_by = item['created_by'];
	var sentence = '';
	var format = false; //Display it as a text by default
	var base = 0;
	var uid = 0;
	var show = false;
	var list = {};
	if(comment){
		try {
			var temp = JSON.parse(comment);
			if($.type(temp) != 'object'){
				if(created_by==0){
					format = 'quote';
				}
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
		} else if(list[800]){
			base = 800; //Weekly
		}

		var data = {};
		for (var i = base; i < base+100; i++) { //0->99
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
		
		show = false;
		if(uid==0){
			if(base==100){
				if(type==1){
					sentence = Lincko.Translation.get('app', 3801, 'pure', data); //The team completed <span find="101">[{101}] task(s)</span> yesterday. This represents [{106}]% of the total tasks remaining in the project. The team also added <span find="111">[{111}] note(s)</span> and <span find="121">[{121}] file(s)</span> yesterday. Currently, <span find="105">[{105}] task(s)</span> are overdue.
					if(typeof data[108] != 'undefined' && data[108]!=0){
						sentence = sentence + ' ' + Lincko.Translation.get('app', 3802, 'pure', data); //[{108}] completed the most tasks yesterday!
					}
					show = true;
				}
			} else if(base==700){
				if(type==1){
					sentence = Lincko.Translation.get('app', 3803, 'pure', data); //The team completed <span find="701">[{701}] task(s)</span> last week. The project is currently [{709}]% complete. Currently, <span find="705">[{705}] task(s)</span> are overdue.
					if(typeof data[708] != 'undefined' && data[708]!=0){
						sentence = sentence + ' ' + Lincko.Translation.get('app', 3804, 'pure', data); //[{708}] completed the most tasks last week!
					}
					show = true;
				}
			} else if(base==800){
				if(type==1){
					sentence = Lincko.Translation.get('app', 3819, 'pure', data); //There was no activity last week. <span find="805">[{805}] task(s)</span> are overdue.
					show = true;
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
					show = true;
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
					show = true;
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
			805: ['tasks', 'app_models_resume_tasks_overdue', ],

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
					span_arr[j].click([comments_id, answer, i, subm], function(event){
						$(this).off(); //Avoid double answer sending
						app_models_resume_onboarding_continue_temp_id = md5(Math.random());
						var current = event.data[0];
						var answer = event.data[1];
						var next = answer[1];
						var text_id = event.data[2];
						var subm = event.data[3];
						var param = [];
						for(var k in answer){
							if(k>=2){
								param.push(answer[k]);
							}
						}
						if(param.length>0){
							//This function must call "app_models_resume_onboarding_continue(current, next)" once the action is completed
							setTimeout(function(current, next, text_id, param, subm){
									onboarding.action_launch(current, next, text_id, param, subm);
							}, 800, current, next, text_id, param, subm);
						} else {
							//app_models_resume_onboarding_continue(current, next, text_id, subm);
							//This function must call "app_models_resume_onboarding_continue(current, next)" once the action is completed
							setTimeout(function(current, next, text_id, param, subm){
									onboarding.action_launch(current, next, text_id, param, subm);
							}, 800, current, next, text_id, param, subm);
						}
					});
				} else if(answer[0]=='now'){
					app_models_resume_onboarding_continue_temp_id = md5(Math.random());
					span_arr[j] = null;
					delete span_arr[j];
					setTimeout(function(data){
						var subm = data[3];
						if(subm && subm['param']['type'] == 'history'){ //We launch it in activity feed only
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
								setTimeout(function(current, next, text_id, param, subm){
									onboarding.action_launch(current, next, text_id, param, subm);
								}, 800, current, next, text_id, param, subm);
							} else {
								app_models_resume_onboarding_continue(current, next, text_id, subm);
							}
						}
					}, 1000, [comments_id, answer, i, subm]); //Delay 1s to launch the action
				} else {
					span_arr[j].click([comments_id, answer, i, subm], function(event){
						app_models_resume_onboarding_continue_temp_id = md5(Math.random());
						$(this).off(); //Avoid double answer sending
						var current = event.data[0];
						var answer = event.data[1];
						var next = answer[1];
						var text_id = event.data[2];
						var subm = event.data[3];
						app_models_resume_onboarding_continue(current, next, text_id, subm);
					});
				}
				j = span_arr.length;
			}
		}
		if(span_arr.length>0){
			//This function should be internally launched once the DOM of the chat is finished to be drawn, otherwise we may not be able to find the position where to insert the answers
			app_models_evan_fn(comments_id, span_arr, subm);
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


var app_models_onboarding_msg_queue = [];//for onboarding
var app_models_evan_fn = function(current, span_arr, subm){
	setTimeout(function(current, span_arr, subm){
		var dom = $('[onboarding_id='+current+']');
		var subm_elem = dom.submenu_getWrapper()[0];
		var subm_dom = dom.submenu_getWrapper()[1];
		var answer = $('#models_history_answer_options_'+current);
		answer.attr("question",current);
		if(dom.length > 0 )
		{
			if(answer.length == 0)
			{
				var flag = false;
				for(var i in app_models_onboarding_msg_queue)
				{
					if(app_models_onboarding_msg_queue[i] == current)
					{
						flag = true;
					}
				}
				if(!flag)
				{
					var options = $('#-models_history_answer_options').clone();
					options.prop('id','models_history_answer_options_'+current)
					options.addClass('models_history_self');
					for(var i in span_arr)
					{
						span_arr[i].attr("index",i);
						options.find('[find=answers_wrapper]').append(span_arr[i]);
					}

					dom.after(options);
					var overthrow_id = "overthrow_"+subm_elem.id;
					var iScroll = myIScrollList[overthrow_id];
					submenu_resize_content();
					var last = $('#'+subm_elem.id+'_help_iscroll').get(0);
					if(last){
						iScroll.scrollToElement(last, 300);
					}
					
					options.velocity("bruno.slideRightBigIn", {
					//options.velocity("bruno.slideRightIn", {
						duration: 1000,
						/*
						begin: function(){
							var overthrow_id = "overthrow_"+subm_bis.id;
							var iScroll = myIScrollList[overthrow_id];
							submenu_resize_content();
							var last = $('#'+subm_bis.id+'_help_iscroll').get(0);
							if(last){
								iScroll.scrollToElement(last, 300);
							}
						},
						*/
					});
					
				}
			}
		}
	}, 800, current, span_arr, subm);
};





var app_models_resume_onboarding_continue_temp_id = '';
var app_models_resume_onboarding_continue = function(current, next, text_id, subm){

	var answer = false;
	if(typeof text_id != 'undefined' && text_id>0){
		//answer = Lincko.Translation.get('app', text_id, 'pure');
		answer = JSON.stringify({answer: text_id,}); //Give a code to be able to translate in live the answers
	}
	var data = {
		current: current,
		next: next,
		answer: answer,
		temp_id: app_models_resume_onboarding_continue_temp_id,
	};
	if(typeof app_models_resume_format_sentence_answers[next] == 'undefined'){
		wrapper_sendAction(data, 'post', 'onboarding/next');
	}
	app_models_resume_format_sentence_answers[next] = true; //Don't reply twice
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

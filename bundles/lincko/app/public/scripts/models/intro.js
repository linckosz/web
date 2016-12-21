var intro = {
	current_step : 0,
	step :{
		welcome:0,
		main_menu:1,
		new_project:2,
		linckobot_chat:3,
		sample_project:4,
		project_items:5,
		feel_free:6,
	},
	script :[
		[//intro.step.welcome:0
			{
				line:12001,//"I’m here to start you on your journey using Lincko.",
				lazy:1500,
				options:[ 
					{
						line:13001,//"Who are you, LinckoBot?",
						delay:500,
						pointType:"script",
						pointTo:1,
						finger:"show",
					},
				],
				head:"show",
			},//0
			{
				line:12002,//"I'm your guide in the way of projects and collaboration. I'll give you updates on how your projects are going.",
				lazy:2000,
				head:"hidden",
			},//1
			{
				line:12003,//"Let me show you quickly how to get around.",
				lazy:2000,
				options:[ 
					{
						line:13002,//"next",7
						delay:200,
						pointType:"step",
						pointTo:1,
						finger:"show",
					}
				],
				head:"hidden",
			},//2
		],
		[//intro.step.new_project:1
			{
				line:12004,//"Access the main menu by clicking here.",
				lazy:1500,
				options:[ 
					{
						line:13002,//"next",
						delay:200,
						pointType:"step",
						pointTo:2,
						finger:"hidden",
					}
				],
				finger:"hidden",
				head:"show",
			},
		],
		[//intro.step.main_menu:2
			{
				line:12005,//"You can create new projects here.",
				lazy:1500,
				options:[ 
					{
						line:13002,//"next",
						delay:200,
						pointType:"step",
						pointTo:3,
						finger:"hidden",
					}
				],
				finger:"hidden",
				head:"show",
			},
		],
		[//intro.step.linckobot_chat:3
			{
				line:12006,//"I'm also located here - find me in the Chats section.",
				lazy:1500,
				options:[ 
					{
						line:13002,//"next",
						delay:200,
						pointType:"step",
						pointTo:4,
						finger:"hidden",
					}
				],
				finger:"hidden",
				head:"show",
			},
		],
		[//intro.step.sample_project:4
			{
				line:12007,//"Here's a sample project. You can invite teammates and change project settings here.",
				lazy:1500,
				options:[ 
					{
						line:13002,//"next",
						delay:200,
						pointType:"step",
						pointTo:5,
						finger:"hidden",
					}
				],
				finger:"hidden",
				head:"show",
			},
		],
		[//intro.step.project_items:5
			{
				line:12008,//"Each project has areas for Tasks, Notes, Chats, and Files.",
				lazy:1500,
				head:"show",
				autoNext:false,

			},
			{
				line:12009,//"Use tasks to set the goals and tasks of the project team.",
				lazy:1000,
				head:"hidden",
				autoNext:false,
			},
			{
				line:12010,//"Use notes to store important information for the team - like meeting notes, processes, or designs. ",
				lazy:1000,
				head:"hidden",
				autoNext:false,
			},
			{
				line:12011,//"Use Chats for quick communication and to track project activity. ",
				lazy:1000,
				head:"hidden",
				autoNext:false,
				
			},
			{
				line:12012,//"Use Files for all your important documents and images - any file uploaded to a project chat is also stored here. ",
				lazy:1000,
				head:"hidden",
				autoNext:false,
			},
			{
				line:12013,//"Let's add your first task.",
				lazy:2000,
				options:[ 
					{
						line:13003,//"Let's do this!",
						delay:200,
						pointType:"step",
						pointTo:6,
						finger:"hidden",
					}
				],
				head:"hidden",
			},
			
		],
	

		[//feel_free:6
			{
				line:12014,//"Type a task name. You can type @ to assign an owner, and + to assign a date.",
				lazy:1500,
				head:"show",
			},
			{
				line:12016,//'My New Task <span find="name" class="burger_tag">MonkeyKing</span><span find="dateWrapper" class="burger_tag">today</span>',
				lazy:3000,
				head:"hidden",
			},
			{
				line:12015,//"Feel free to explore the sample project.",
				lazy:1500,
				head:"hidden",
				options:[ 
					{
						line:13005,//"Start using Lincko!
						delay:1000,
						pointType:"step",
						pointTo:-1,
						finger:"show",
					}
				],
			},
		],	


	],
	hidePanel:function(){
		if($("#body_models_intro_wrapper").length != 0)
		{
			$("#body_models_intro_wrapper").hide();
		}
	},
	showPanel:function(){
		if($("#body_models_intro_wrapper").length == 0)
		{
			var target = $("#-models_intro_wrapper").clone();
			target.prop("id","body_models_intro_wrapper");
			//$("body").append(target);
		}
		else
		{
			$("#body_models_intro_wrapper").show();
		}
		return target;
	},	
	startStep:function(fn){
		intro.showPanel();
		intro.gotoStep(0,fn);
	},
	gotoStep:function(step_index,fn){
		$("#"+onboarding.id_welcome_bubble).css("height","auto");
		if(typeof fn != "undefined" || fn == null)
		{
			var index = intro.script[step_index].length-1;
			if(intro.script[step_index][index].hasOwnProperty("options"))
			{
				for(var i in intro.script[step_index][index]["options"])
				{
					intro.script[step_index][index]["options"][i]["callback"] = fn;
				}	
			}
		}
		intro.current_step = step_index;
		intro.startScript();
	},
	startScript:function(){
		var wrapper = $("#body_models_intro_wrapper");
		wrapper.find("[find=script_list]").html('');
		intro.gotoScript(0);
	},
	gotoScript:function(script_index){
		var wrapper = $("#body_models_intro_wrapper");
		var target = $("#-models_intro_item").clone();
		target.prop("id","models_intro_item_step_" + intro.current_step + "_script_" + script_index);
		target.addClass("models_intro_others");
		wrapper.find("[find=script_list]").append(target);

		//profile
		if(intro.script[intro.current_step][script_index]["head"]=="show")
		{
			var ico = target.find("[find=profile_ico]");
			var name = target.find("[find=profile_name]");
			ico.css("border-color", "transparent");
			ico.css("background-image","url('" +  app_application_icon_roboto.src + "')");
			name.html(Lincko.Translation.get("app", 0, "html"));  //LinckoBot
		}
		else{
			target.find("[find=profile]").addClass("display_none");
		}
		
		//profile animation
		var timer = 0;
		if(typeof intro.script[intro.current_step][script_index]["lazy"] != "undefined"){
			timer = intro.script[intro.current_step][script_index]["lazy"];
		}
		//lazy
		var content = target.find("[find=content]");
		var lazy = intro.lazyLoading(timer);
		content.append(lazy);

		if(responsive.test('maxMobileL'))
		{
			var h = $("#body_models_intro_wrapper").outerHeight() + $("#app_content_menu").outerHeight();
			var height = $(window).height();
			if(h > height)
			{	
				$('#'+onboarding.id_welcome_bubble).css("height",$(window).height()-$("#app_content_menu").outerHeight() - 14);
				$("#body_models_intro_wrapper").addClass("overthrow");
				wrapper_IScroll();
			}
		}

		if(typeof myIScrollList["body_models_intro_wrapper"] !== "undefined")
		{
			myIScrollList["body_models_intro_wrapper"].refresh();
			var iscroll_help = wrapper.find("[find=iscroll_helper]").get(0);
			myIScrollList["body_models_intro_wrapper"].scrollToElement(iscroll_help, 0);
		}

		var step = intro.current_step;
		//line
		setTimeout(function(){
			if(step == intro.current_step)
			{
				var line = intro.script[intro.current_step][script_index]["line"];
				line = Lincko.Translation.get('app', line, 'js');
				content.html(line);

				if(typeof myIScrollList["body_models_intro_wrapper"] !== "undefined")
				{
					myIScrollList["body_models_intro_wrapper"].refresh();
					var iscroll_help = wrapper.find("[find=iscroll_helper]").get(0);
					myIScrollList["body_models_intro_wrapper"].scrollToElement(iscroll_help, 0);
				}
				if(intro.script[intro.current_step][script_index].hasOwnProperty("options"))
				{
					intro.collectOptions(intro.script[intro.current_step][script_index]["options"]);
				}
				else if(script_index + 1 < intro.script[intro.current_step].length 
					&& (typeof intro.script[intro.current_step][script_index]["autoNext"] == "undefined" 
					|| intro.script[intro.current_step][script_index]["autoNext"]))
				{
					intro.gotoScript(script_index + 1);
				}
				if(typeof myIScrollList["body_models_intro_wrapper"] !== "undefined")
				{
					myIScrollList["body_models_intro_wrapper"].refresh();
					var iscroll_help = wrapper.find("[find=iscroll_helper]").get(0);
					myIScrollList["body_models_intro_wrapper"].scrollToElement(iscroll_help, 0);
				}
			}
			// else{
			// 	intro.startStep(position);
			// }
		},timer);
		//content.append(intro.script[step_index][script_index]["line"];
	},
	lazyLoading:function(timer){
		var target = $("#-models_intro_lazy").clone();
		var speed = 300;
		var times = timer / speed ;
		var color_group = ["#eeeeee","#cccccc","#aaaaaa"];
		var count = 0;
		var lazy_interval = setInterval(function(){
			$(target.find(".models_intro_lazy_pot")).each(function(){
				var index = $(this).attr("index");
				index = (index + 1) % color_group.length; 
				$(this).css("background-color",color_group[index]);
				$(this).attr("index",index);
			});
			count ++;
			if(count > times)
			{
				clearInterval(lazy_interval);
			}
		},speed);
		return target;
	},
	collectOptions:function(options,flag){
		var wrapper = $("#body_models_intro_wrapper");
		var target = $("#-models_intro_options").clone();
		target.prop("id","models_intro_options");
		target.addClass("models_intro_self");
		
		wrapper.find("[find=script_list]").append(target);

		//options
		for(var i in options)
		{
			var delay = 0;
			if(typeof options[i]["delay"] != "undefined")
			{
				delay = options[i]["delay"];
			}
			setTimeout(function(){
				var item = $("#-models_intro_options_item").clone();
				item.prop("id","models_intro_options_item_" + i);
				var timer = 0;
				if(typeof options[i]["lazy"] != "undefined"){
					timer = options[i]["lazy"];
				}

				var content = target.find("[find=content]");
				var lazy = intro.lazyLoading(timer);
				item.append(lazy);

				
				target.find("[find=options_content]").append(item);

				setTimeout(function(i,options,item,target){
					var line = options[i]["line"];
					line = Lincko.Translation.get('app', line, 'js');
					item.html(line);

					var fn = null;
					if(options[i].hasOwnProperty("callback"))
					{
						fn = options[i].callback;
					}
					item.click({pointTo:options[i].pointTo,pointType:options[i].pointType,fn:fn,target:target},function(event){
						item.off("click");
						var pointTo = event.data.pointTo;
						var pointType = event.data.pointType;
						var fn = event.data.fn;
						var target = event.data.target;
						if(pointType == "script")
						{
							intro.gotoScript(pointTo);
							//intro.replaceOption($(this).html(),target);
							//target.remove();
						}
						else if(pointType == "step")
						{
							if(fn != null)
							{
								fn();
							}
						}

						$(this).closest('[find=options_content]').find("[find=finger]").remove();
					});

				},timer,i,options,item,target);

				//finger()
				if(options[i]["finger"]=="show")
				{
					var finger = $("#-models_intro_options_finger").clone();
					finger.prop("id","");
					item.before(finger);
					var hand = finger.find("[find=hand]");
					hand.addClass("display_none");
					setTimeout(function(){
						hand.removeClass("display_none");
						hand.velocity({ left: "10px" }, {duration: 800,loop: true,});
					},0);
				}
			},delay);
		}
	},
	replaceOption:function(line,last){
		var target = $("#-models_intro_item").clone();
		target.prop("id","");
		target.addClass("models_intro_self");

		last.before(target);
		//target.before(last);

		var profile = Lincko.storage.getLinkThumbnail(Lincko.storage.get("users",wrapper_localstorage.uid,'profile_pic'));

		if(!profile){
				profile = app_application_icon_single_user.src;
		}

		var ico = target.find("[find=profile_ico]");
		var name = target.find("[find=profile_name]");
		ico.css("background-image","url('" +  profile + "')");
		var user_name = Lincko.storage.get('users', wrapper_localstorage.uid ,'username');
		name.html(user_name);  //LinckoBot

		var content = target.find("[find=content]");
		content.html(line);
	}

	
}



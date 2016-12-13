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
				options:[ 
					{
						line:13001,//"Who are you, LinckoBot?",
						pointType:"script",
						pointTo:1,
					}
				],
			},//0
			{
				line:12002,//"I'm your guide in the way of projects and collaboration. I'll give you updates on how your projects are going.",
			},//1
			{
				line:12003,//"Let me show you quickly how to get around.",
				options:[ 
					{
						line:13002,//"next",
						pointType:"step",
						pointTo:1,
					}
				],
			},//2
		],
		[//intro.step.new_project:1
			{
				line:12004,//"Access the main menu by clicking here.",
				options:[ 
					{
						line:13002,//"next",
						pointType:"step",
						pointTo:2,
					}
				],
			},
		],
		[//intro.step.main_menu:2
			{
				line:12005,//"You can create new projects here.",
				options:[ 
					{
						line:13002,//"next",
						pointType:"step",
						pointTo:3,
					}
				],
			},
		],
		[//intro.step.linckobot_chat:3
			{
				line:12006,//"I'm also located here - find me in the Chats section.",
				options:[ 
					{
						line:13002,//"next",
						pointType:"step",
						pointTo:4,
					}
				],
			},
		],
		[//intro.step.sample_project:4
			{
				line:12007,//"Here's a sample project. You can invite teammates and change project settings here.",
				options:[ 
					{
						line:13002,//"next",
						pointType:"step",
						pointTo:5,
					}
				],
			},
		],
		[//intro.step.project_items:5
			{
				line:12008,//"Each project has areas for Tasks, Notes, Chats, and Files.",
			},
			{
				line:12009,//"Use tasks to set the goals and tasks of the project team.",
			},
			{
				line:12010,//"Use notes to store important information for the team - like meeting notes, processes, or designs. ",
			},
			{
				line:12011,//"Use Chats for quick communication and to track project activity. ",
				
			},
			{
				line:12012,//"Use Files for all your important documents and images - any file uploaded to a project chat is also stored here. ",
			},
			{
				line:12013,//"Let's add your first task.",
				options:[ 
					{
						line:13003,//"Let's do this!",
						pointType:"step",
						pointTo:7,
					}
				],
			},
			
		],
	

		[//feel_free:6
			{
				line:12014,//"Type a task name. You can type @ to assign an owner, and + to assign a date.",
			},
			{
				line:12016,//'My New Task <span find="name" class="burger_tag">MonkeyKing</span><span find="dateWrapper" class="burger_tag">today</span>',
			},
			{
				line:12015,//"Feel free to explore the sample project.",
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
		var ico = target.find("[find=profile_ico]");
		var name = target.find("[find=profile_name]");
		ico.css("border-color", "transparent");
		ico.css("background-image","url('" +  app_application_icon_roboto.src + "')");
		name.html(Lincko.Translation.get("app", 0, "html"));  //LinckoBot

		//profile animation

		var timer = 2000;
		//lazy
		var content = target.find("[find=content]");
		var lazy = intro.lazyLoading(timer);
		content.append(lazy);

		var step = intro.current_step;
		//line
		setTimeout(function(){
			if(step == intro.current_step)
			{
				var line = intro.script[intro.current_step][script_index]["line"];
				line = Lincko.Translation.get('app', line, 'js');
				content.html(line);
				if(intro.script[intro.current_step][script_index].hasOwnProperty("options"))
				{
					intro.collectOptions(intro.script[intro.current_step][script_index]["options"]);
				}
				else if(script_index + 1 < intro.script[intro.current_step].length)
				{
					intro.gotoScript(script_index + 1);
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
	collectOptions:function(options){
		var wrapper = $("#body_models_intro_wrapper");
		var target = $("#-models_intro_options").clone();
		target.prop("id","models_intro_options");
		target.addClass("models_intro_self");
		
		wrapper.find("[find=script_list]").append(target);

		//finger()
		var finger = $("#-models_intro_options_finger").clone();
		finger.prop("id","");

		target.find("[find=options_content]").append(finger);

		var hand = finger.find("[find=hand]");

		hand.velocity("fadeIn", {duration: 1000,})
			.velocity({ left: "10px" }, {duration: 800,loop: true,});
	
		//options
		for(var i in options)
		{
			var item = $("#-models_intro_options_item").clone();
			item.prop("id","models_intro_options_item_" + i);

			var line = options[i]["line"];
			line = Lincko.Translation.get('app', line, 'js');
			item.html(line);
			target.find("[find=options_content]").append(item);

			var fn = null;
			if(options[i].hasOwnProperty("callback"))
			{
				fn = options[i].callback;
			}

			item.click({pointTo:options[i].pointTo,pointType:options[i].pointType,fn:fn},function(event){
				item.off("click");
				var pointTo = event.data.pointTo;
				var pointType = event.data.pointType;
				var fn = event.data.fn;
				if(pointType == "script")
				{
					intro.gotoScript(pointTo);
				}
				else if(pointType == "step")
				{
					if(fn != null)
					{
						fn();
					}
				}
			});
		}
	}
}

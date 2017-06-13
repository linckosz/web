/*category 19*/
function app_layers_dashboard_launchPage(param){
	if(typeof param === 'undefined'){ param = null; }
	app_layers_dashboard_feedPage();
}

//keep track of chart instances here, then properly destroy on closePage function
var app_layers_dashboard_chartInst = [];
function app_layers_dashboard_closePage(){
	$(window).off("resize.app_layers_dashboard");
	$.each(app_layers_dashboard_chartInst, function(i, inst){
		app_layers_dashboard_chartInst[i].destroy();
	});
	app_layers_dashboard_chartInst = [];
};

var app_layers_dashboard_resize_timeout;
var app_layers_dashboard_resize = function(){
	clearTimeout(app_layers_dashboard_resize_timeout);
	app_layers_dashboard_resize_timeout = setTimeout(function(){
		var p_height = $(window).height();
		if(responsive.test("maxMobileL")){
			p_height -= $('#app_content_menu').outerHeight();
		}
		p_height -= $('#app_content_top').outerHeight();
		$('#app_layers_dashboard').css('height', p_height);

		if(myIScrollList['app_layers_dashboard_overthrow']){
			myIScrollList['app_layers_dashboard_overthrow'].refresh();
		}
	},500);
}

var app_layers_dashboard_feedPage = function(param){
	if(typeof param === 'undefined'){ param = null; }
	var position = $('#app_layers_dashboard');
	position.recursiveEmpty();

	var elem_overthrow = $('<div>').prop('id', 'app_layers_dashboard_overthrow').addClass('overthrow');
	position.append(elem_overthrow);

	$(window).on("resize.app_layers_dashboard", function(){
		app_layers_dashboard_resize();		
	});
	app_layers_dashboard_resize();

	var s_1day = 86400;
	var pid = app_content_menu.projects_id;
	var burndown_steps = 6; //7 bars
	var taskHistory_steps = 7; //8 data points



	var elem_header = $('#-app_layers_dashboard_header').clone().prop('id', '');
	elem_overthrow.append(elem_header);

	//today's date
	elem_header.find('[find=date]').append((new wrapper_date()).display("date_medium_simple"));

	//progress
	elem_header.find('[find=progressBar]').html(app_models_projects_progressBar(app_models_projects_getPercentComplete(pid)));


	//burndown canvas
	var elem_burndown_wrapper = $('#-app_layers_dashboard_burndown_wrapper').clone().prop('id', '');
	var ctx_burndown = elem_burndown_wrapper.find('canvas');
	elem_overthrow.append(elem_burndown_wrapper);

	//taskHistory canvas
	var elem_taskHistory_wrapper = $('#-app_layers_dashboard_taskHistory_wrapper').clone().prop('id', '');
	var ctx_taskHistory = elem_taskHistory_wrapper.find('canvas');
	elem_overthrow.append(elem_taskHistory_wrapper);

	//team canvas
	var elem_team_wrapper = $('#-app_layers_dashboard_team_wrapper').clone().prop('id', '');
	var ctx_team = elem_team_wrapper.find('canvas');
	elem_overthrow.append(elem_team_wrapper);




	var project = Lincko.storage.get('projects', pid);
	var p_created_at = project.created_at;
	var tasks = Lincko.storage.list('tasks', -1, 
		[{
			_tasksup: null, //exclude subtasks
			start: ['!=', null], //exclude no duedate
			duration: ['>', 0],			
		}], 'projects', pid, false, false);
	var p_firstDay = new wrapper_date(p_created_at).getEndofDay(); //first day of the project
	var now = new wrapper_date().timestamp;

	var duedate_last = p_firstDay;
	$.each(tasks, function(i, task){
		if(task.start && task.duration){
			var duedate = task.start + task.duration;
			if(duedate > duedate_last){ duedate_last = duedate; }
		}
	});
	duedate_last = new wrapper_date(duedate_last).getEndofDay();
	

	var burndown_stepSize_days = ((duedate_last - p_firstDay) / s_1day) / burndown_steps;
	if(burndown_stepSize_days < 1){//NOT ENOUGH DATA if stepsize is less than 1 day
		elem_burndown_wrapper.find('[find=chartContainer]').css('visibility', 'hidden');
		elem_burndown_wrapper.find('[find=noChart]').removeClass('display_none');
	} else{
		var burn_data = {
			labels: [],
			labels_timestamp: [],
			ideal:[],
			completed: [],
			open: [],
		}

		//build label and create array of 0's for bar graphs
		for(var step = p_firstDay; step <= duedate_last; step += s_1day*burndown_stepSize_days){
			burn_data.labels.push((new wrapper_date(step)).display("date_very_short"));
			burn_data.labels_timestamp.push(step);
			burn_data.ideal.push(0);
			burn_data.completed.push(0);
			burn_data.open.push(0);
		}

		$.each(burn_data.labels_timestamp, function(i, timestamp){

			//ideal line - straight line where tasks are linearly increased, starting from 0 to total number of tasks
			burn_data.ideal[i] = i*(tasks.length / (burndown_steps));

			//completed tasks - include data from project creation to data right after 'now'
			var timestamp_cutoff = now;
			if(i == 0 || (i > 0 && burn_data.labels_timestamp[i-1] < now && now < timestamp)){
				timestamp_cutoff = timestamp;
			}

			$.each(tasks, function(j, task){
				//open task (task already created and not yet approved OR approved later)
				if(task.created_at <= timestamp && (!task.approved_at || task.approved_at > timestamp)){
					burn_data.open[i]++;
				}
				else if(timestamp <= timestamp_cutoff && task.created_at <= timestamp && task.approved_at && task.approved_at <= timestamp){
					burn_data.completed[i]++;
				}
			});
		});

		var percent_bike = 0;
		percent_bike = (now - burn_data.labels_timestamp[0]) / (burn_data.labels_timestamp[burn_data.labels_timestamp.length -1] - burn_data.labels_timestamp[0]);

		var chart_burndown = app_layers_dashboard_build_burndown(ctx_burndown, burn_data.labels, burn_data.ideal, burn_data.completed, burn_data.open, percent_bike);
		app_layers_dashboard_chartInst.push(chart_burndown);
	}

	


	var taskHistory_stepSize_days = Math.floor((now - p_created_at) / s_1day / taskHistory_steps);
	if(taskHistory_stepSize_days < 1){//NOT ENOUGH DATA if stepsize is less than 1 day
		elem_taskHistory_wrapper.find('[find=chartContainer]').css('visibility', 'hidden');
		elem_taskHistory_wrapper.find('[find=noChart]').removeClass('display_none');
	} else{
		var taskHistory_data = {
			labels: [],
			team: [],
			user: [],
		}
		for(var step = p_firstDay; step < now; step += s_1day*taskHistory_stepSize_days){
			//last data point should be at 'now'
			if(step + s_1day*taskHistory_stepSize_days >= now){	continue; } 

			taskHistory_data.labels.push((new wrapper_date(step)).display("date_very_short"));
			taskHistory_data.team.push({
				x: step,
				y: 0,
			});
			taskHistory_data.user.push({
				x: step,
				y: 0,
			});
		}
		taskHistory_data.labels.push((new wrapper_date(now)).display("date_very_short"));
		taskHistory_data.team.push({
			x: now,
			y: 0,
		});
		taskHistory_data.user.push({
			x: now,
			y: 0,
		});


		$.each(tasks, function(i, task){
			var created_at = task.created_at;
			var deleted_at = task.deleted_at;
			var approved_at = task.approved_at;
			var in_charge = false;

			if(deleted_at){ return; }

			if(tasks[i]["_users"] && tasks[i]["_users"][wrapper_localstorage.uid] && tasks[i]["_users"][wrapper_localstorage.uid]["in_charge"]==true){
				in_charge = true;
			}

			$.each(taskHistory_data.team, function(j, data){
				if(created_at <= data.x){
					taskHistory_data.team[j].y++;
					if(in_charge){ taskHistory_data.user[j].y++; }
				}

				if(approved_at && approved_at <= data.x){
					taskHistory_data.team[j].y--;
					if(in_charge){ taskHistory_data.user[j].y--; }
				}
			});
		});

		
		var chart_taskHistory = app_layers_dashboard_build_taskHistory(ctx_taskHistory, taskHistory_data.labels, taskHistory_data.team, taskHistory_data.user, taskHistory_stepSize_days);
		app_layers_dashboard_chartInst.push(chart_taskHistory);

	}


	var access_list = Lincko.storage.whoHasAccess('projects', pid);
	var each_member_list = {};


	var each_tasks = Lincko.storage.list('tasks', -1, 
	[{
		_tasksup: null, //exclude subtasks
		duration: ['>', 0],			
	}], 'projects', pid, false, false);


	var data = {};
	data.users = [];
	data.count = [];
	data.completed = [];
	data.open = [];
	data.overdue = [];
	data.helper = [];
	for(var i in each_tasks){
		var approved = each_tasks[i]['approved'];
		//console.log(approved);
		$.each(each_tasks[i]['_users'],function(key,value){
			if(value.in_charge)
			{
				if(typeof each_member_list[key] == 'undefined'){
					each_member_list[key] = {
						id : key,
						user_name : Lincko.storage.get('users',key,'username'),
						count : 1,
						completed : approved ? 1 : 0 ,
						overdue : tasks_isOverdue(each_tasks[i]) ? 1 : 0,
					}
				}
				else{
					each_member_list[key].count ++ ;
					if(approved){
						each_member_list[key].completed ++ ;
					}
					if(tasks_isOverdue(each_tasks[i])){
						each_member_list[key].overdue ++ ;
					}
				}
			}
		});
	}

	$.each(each_member_list,function(key,value){
		data.users.push(key);
		data.count.push(value.count);
		data.completed.push(value.completed);
		data.open.push(value.count - value.completed);
		data.overdue.push(value.overdue);
		data.helper.push('');
	});


	elem_team_wrapper.find('[find=canvasWrapper]').prop('id','app_layers_dashboard_build_team_wrapper');
	
	elem_team_wrapper.find('[find=canvasContainer]').css('height','300px');
	elem_team_wrapper.find('[find=canvasWrapper]').css('width','100%');

	if(data.users.length > 7)
	{
		elem_team_wrapper.find('[find=canvasWrapper]').css('height','360px');
		elem_team_wrapper.find('[find=canvasContainer]').css('width',(parseInt(data.users.length  * elem_team_wrapper.find('[find=canvasWrapper]').width() / 7)  + 'px' ) );
		//elem_team_wrapper.find('[find=canvasContainer]').css('width','100%');
		//elem_team_wrapper.find('canvas').css('width', '100%');
		
		elem_team_wrapper.find('[find=canvasContainer]').css('position','relative');
		elem_team_wrapper.find('[find=canvasWrapper]').addClass('overthrow');
		wrapper_IScroll_options_new['app_layers_dashboard_build_team_wrapper'] = { 
			scrollX: true, 
			scrollY: false, 
			mouseWheel: false, 
			fadeScrollbars: true,
		};
	}
	else
	{
		elem_team_wrapper.find('[find=canvasWrapper]').css('height','300px');
		elem_team_wrapper.find('[find=canvasContainer]').css('width','100%');
	}
	

	var chart_team = app_layers_dashboard_build_team(ctx_team,data);
		app_layers_dashboard_chartInst.push(chart_team);


	



};//end of app_layers_dashboard_feedPage()

function app_layers_dashboard_build_team(ctx,data){
	var options = {
		layout: {
			padding: {
				left: 50,
				top: 10,
			},
		},
    	hover: {
			mode: 'index',
			intersect: false,
        	animationDuration: 0,
        	onHover: function(){

        	},
        },
    	tooltips: {
			mode:'index',
			intersect: false,
			callbacks: {
				label: function(tooltip, cdata){
					return ' ' + Math.round(tooltip.yLabel) + ' (' + cdata.datasets[tooltip.datasetIndex].label + ')';
				},
				labelColor:function(tooltip, cdata){
					if(tooltip.datasetIndex == 2){
						return { 
							backgroundColor:'rgb(208, 1, 27)'
						};
					}
					else{
						return { 
							backgroundColor:cdata.data.datasets[tooltip.datasetIndex].backgroundColor 
						};
					}
				},
				title : function(tooltip, cdata){
					return Lincko.storage.get('users',data.users[tooltip[0].index],'username');
				}
			}
		},
		maintainAspectRatio: false,
		legend: {
			display: false,
    	},
		cornerRadius: 10,
    	scales: {
    		yAxes: [{
    			display: false,
    			gridLines: {
    				display: false,
    				zeroLineWidth: 0,
    				zeroLineColor: "rgba(0, 0, 0, 0)",
    			}
    		}],
	        xAxes: [{
	        	gridLines: {
	        		display: false,
	        		//offsetGridLines: false,
	        		zeroLineWidth: 0,
	        	},
	    	 	barThickness: 30,
	            barPercentage: 0.5,
	            categoryPercentage: 0.1,
	        }],
		},
		datasetFill : true,   
		animation: {
			onComplete: function(){
				var dataset_meta = this.data.datasets[0]._meta[Object.keys(this.data.datasets[0]._meta)[0]];
				var dataset_meta1 = this.data.datasets[1]._meta[Object.keys(this.data.datasets[1]._meta)[0]];
				var offset = dataset_meta.data.length > 7 ? 20 :0;
 				for(var i in dataset_meta.data)
 				{
 					var dataset_x = dataset_meta.data[i]._model.x;
					var dataset_y = dataset_meta.data[i]._model.y;
					var dataset_width = dataset_meta.data[i]._model.width;

 					var show_completed_num = $('#dashboard_task_completed_index_' + i);
 					if(show_completed_num.length <= 0)
 					{
 						show_completed_num = $('<span>' + data.completed[i] + '</span>');
 						show_completed_num.prop('id','dashboard_task_completed_index_' + i);
 						$('#app_layers_dashboard .app_layers_dashboard_team_wrapper').find('canvas').after(show_completed_num); 	
 					}

 					show_completed_num.css({
						'visibility': 'visible',
						'display':'block',
						'width':dataset_width,
						'bottom': 30,
						'left': dataset_x + 5 - offset,
						'text-align':'center',
						'position':'absolute',
						'z-index':'99',
					});

 					dataset_x = dataset_meta1.data[i]._model.x;
					dataset_y = dataset_meta1.data[i]._model.y;
					dataset_width = dataset_meta1.data[i]._model.width;



					var show_all_num = $('#dashboard_task_all_index_' + i);
 					if(show_all_num.length <= 0)
 					{
 						show_all_num = $('<span>' + data.open[i] + '</span>');
 						show_all_num.prop('id','dashboard_task_all_index_' + i);
 						$('#app_layers_dashboard .app_layers_dashboard_team_wrapper').find('canvas').after(show_all_num);
 					}
 					show_all_num.css({
						'visibility': 'visible',
						'display':'block',
						'width':dataset_width - 4,
						'padding-right':4,
						'color':'#ffffff',
						'top': dataset_y,
						'left': dataset_x + 5  - offset,
						'text-align':'right',
						'position':'absolute',
						'z-index':'99',
					});
					
 					


					var show_profile = $('#dashboard_task_profile_index_' + i);
 					if(show_profile.length <= 0)
 					{
 						var url_pic = Lincko.storage.getLinkThumbnail(Lincko.storage.get("users", data.users[i], 'profile_pic'));

 						if(!url_pic){
							url_pic = app_application_icon_single_user.src;
						}

						show_profile = $('<div/>');
	 					show_profile.prop('id','dashboard_task_profile_index_' + i);
	 					$('#app_layers_dashboard .app_layers_dashboard_team_wrapper').find('canvas').after(show_profile); 	

 						show_profile.css({
							'background-image': 'url("' + url_pic + '")',
							'background-color': '#ffffff',
							'font-size': 0,
							'height': 30,
							'width': 30,
							'bottom': -10,
							'left': dataset_x ,
							'position':'absolute',
							'border': '1px solid #FBA026',
							'border-radius': '50%',
							'background-position': 'center',
							'background-size': 'cover',
							'background-repeat': 'no-repeat',
						});
		   	 		}


		   	 		show_profile.css({
						'left': dataset_x  - offset,	
					});


					var show_overdue = $('#dashboard_task_overdue_index_' + i);
					if(show_overdue.length <= 0 && data.overdue[i] > 0 ){
						show_overdue = $('<span/>');
						show_overdue.text(data.overdue[i]);
	 					show_overdue.prop('id','dashboard_task_overdue_index_' + i);
	 					$('#app_layers_dashboard .app_layers_dashboard_team_wrapper').find('canvas').after(show_overdue); 	
	 					var height = 16 + 2 * (data.overdue[i] - 1);
	 					var bottom = -30 - 2 * (data.overdue[i] - 1);
	 					// var height = 16;
	 					// var bottom = -30;
	 					var radius = 8 ;
	 					show_overdue.css({
	 						'display':'block',
	 						'width': 30,
	 						'background-color': '#d0011b',
							'height': height,
							'font-size':12,
							'line-height': height +'px',
							'bottom': bottom,
							'color': '#ffffff',
							'border-radius': radius ,
							'position':'absolute',
							'text-align':'center',
							'background-position': 'center',
							'background-size': 'cover',
							'background-repeat': 'no-repeat',
						});
					}


					show_overdue.css({
						'left': dataset_x  - offset,		
					});


 				}

			},
		},
    }



	var chart_team = new Chart(ctx, {
	    type: 'bar',
	    options: options,
	    data: {
	        labels: data.helper,
	        datasets: [	       		
		        {
					type: 'bar',
					label: Lincko.Translation.get('app', 1902, 'html'), //'Completed Tasks'
					data: data.completed,
					borderColor:'#f5a026',
					backgroundColor: '#f5a026'
		        },
				{
					type: 'bar',
					label: Lincko.Translation.get('app', 1903, 'html'), //'All The Tasks'
					data:  data.open,
					borderColor: '#d8d8d8',
					backgroundColor: '#d8d8d8'
				},
				{
					type: 'bar',
					label:Lincko.Translation.get('app', 3630, 'html'), //'Overdue'
					data:  data.overdue,
					backgroundColor: 'transparent'
				},

	        ]
	    },
	});
	
	return chart_team;
}


function app_layers_dashboard_build_burndown(ctx, labels, ideal, completed, open, percent_bike){
	if(!ctx || !labels || !ideal || !completed || !open){ return false; }
	var s_1day = 86400;

	//change bar size for mobile
	var barThickness = 30;
	var categoryPercentage = 0.1;
	if(responsive.test('maxMobile')){
		barThickness = 24;
		categoryPercentage = 0.3;
	}

	var animateBike = true;

	var options = {
		layout: {
			padding: {
				left: 50,
				top: 10,
			},
		},
    	hover: {
			mode: 'index',
			intersect: false,
        	animationDuration: 0,
        	onHover: function(){
        		animateBike = false;
        		setTimeout(function(){
        			animateBike = true;
        		}, 100);
        	},
        },
    	tooltips:{
    		mode: 'index',
    		intersect: false,
    		callbacks: {
    			label: function(tooltip, data){
        			return ' '+Math.round(tooltip.yLabel)+' ('+data.datasets[tooltip.datasetIndex].label+')';
        		},
    		},
    		custom: function(tooltip){
				// tooltip will be false if tooltip is not visible or should be hidden
				if (!tooltip) { return; }

				var padding_left = 0;
				try{
					padding_left = this._chart.config.options.layout.padding.left;
				}catch(e){}

				//dont allow tooltip to spillover to padding area. this is where custom legend is
				if(padding_left && tooltip.x < padding_left && tooltip.xAlign == 'center'){
					tooltip.xAlign = 'left';
					tooltip.x = tooltip.caretX - tooltip.xPadding - tooltip.caretSize;
				}
                
        	},
    	},
    	maintainAspectRatio: false,
    	legend: {
    		display: false,
    	},
		cornerRadius: 10,
    	scales: {
    		yAxes: [{
    			display: false,
    			gridLines: {
    				display: false,
    				zeroLineWidth: 0,
    				zeroLineColor: "rgba(0, 0, 0, 0)",
    			}
    		}],
	        xAxes: [{
	        	gridLines: {
	        		display: false,
	        		//offsetGridLines: false,
	        		zeroLineWidth: 0,
	        	},
	    	 	barThickness: barThickness,
	            barPercentage: 0.5,
	            categoryPercentage: categoryPercentage,
	        }],
		},
		animation: {
			onComplete: function(){
				if(animateBike && percent_bike && percent_bike <= 1){
					var elem_bike = $(this.chart.ctx.canvas).siblings('[find=bike]').css('opacity', 1);
					var w_bike = elem_bike.outerWidth();
					var h_bike = elem_bike.outerHeight();

					var dataset_meta = this.data.datasets[0]._meta[Object.keys(this.data.datasets[0]._meta)[0]];
					var dataset_0_x = dataset_meta.data[0]._model.x;
					var dataset_0_y = dataset_meta.data[0]._model.y;
					var dataset_last_x = dataset_meta.data[dataset_meta.data.length-1]._model.x;

					var t_bike = dataset_0_y - h_bike;
					var l_bike_begin = dataset_0_x - w_bike;
					var l_bike_end = dataset_0_x + (dataset_last_x - dataset_0_x) * percent_bike - w_bike;

					elem_bike.css({
						'visibility': 'visible',
						'top': t_bike,
						'left': l_bike_begin,
					});

					//NO RIDING BACKWARDS!
					if(l_bike_end > l_bike_begin){
						elem_bike.velocity("stop").velocity({
							'left': l_bike_end,
						}, {
							mobileHA: hasGood3Dsupport,
							duration: 1000,
							easing: "easeOutQuad",
						});
					}
				}
			},
		},
    }

    /*disable animation if necessary*/
    if(!hasGood3Dsupport){
    	options.animation.duration = 0;
    }

	var chart_burndown = new Chart(ctx, {
	    type: 'bar',
	    options: options,
	    data: {
	        labels: labels,
	        datasets: [
	        	{
	                type: 'line',
	                label: Lincko.Translation.get('app', 1901, 'html'), //'Ideal Completion'
	               	data: ideal,
	               	lineTension: 0,
	               	pointRadius: 0,
		            borderWidth: 2,
	               	fill: false,
	               	backgroundColor: '#4a90e2',
	               	borderColor: '#4a90e2',
	            },
	        	{
		         	type: 'bar',
		            label: Lincko.Translation.get('app', 1902, 'html'), //'Completed Tasks'
		            data: completed,
		            borderColor:'#f5a026',
		            backgroundColor: '#f5a026',
		        },
		        {
		        	type: 'bar',
		            label: Lincko.Translation.get('app', 1903, 'html'), //'Open Tasks'
		            data: open,
		            borderColor: '#d8d8d8',
		            backgroundColor: '#d8d8d8',
		        },
		        
		        
	        ]
	    },
	});
	return chart_burndown;
}

function app_layers_dashboard_build_taskHistory(ctx, labels, data_team, data_user, stepSize_days){
	if(!ctx || !labels || !data_team || !data_user || !stepSize_days){ return false; }
	var s_1day = 86400;
	var options = {
		layout: {
			padding: 10,
		},
    	animation: {
		    duration: 500,
		    easing: "easeOutQuart",
		    onComplete: function(){
		    	var vOffset = 0;
		    	var elem_legend = $(this.chart.ctx.canvas).siblings('[find=legend]');
		    	elem_legend.css('opacity', 1);
		    	var elem_dataset_0 = elem_legend.find('[dataset=0]');
		    	var elem_dataset_1 = elem_legend.find('[dataset=1]');

		    	var url_pic = Lincko.storage.getLinkThumbnail(Lincko.storage.get("users", wrapper_localstorage.uid, 'profile_pic'));

				elem_dataset_1.css({
	    			'background-image': 'url("'+url_pic+'")',
					'font-size': 0,
				});

		    	var dataset_0_meta = this.data.datasets[0]._meta;
		    	var dataset_0_x = dataset_0_meta[Object.keys(dataset_0_meta)[0]].data[0]._model.x;
		    	var dataset_0_y = dataset_0_meta[Object.keys(dataset_0_meta)[0]].data[0]._model.y;

		    	var dataset_1_meta = this.data.datasets[1]._meta;
		    	var dataset_1_x = dataset_1_meta[Object.keys(dataset_1_meta)[0]].data[0]._model.x;
		    	var dataset_1_y = dataset_1_meta[Object.keys(dataset_1_meta)[0]].data[0]._model.y;

		    	if(Math.abs(dataset_0_y - dataset_1_y) < elem_dataset_0.outerHeight()){
		    		vOffset = elem_dataset_0.outerHeight();
		    	}
		    	elem_dataset_0.css('top', dataset_0_y - elem_dataset_0.outerHeight()/2 - vOffset);
		    	elem_dataset_1.css('top', dataset_1_y - elem_dataset_0.outerHeight()/2);

		    	var left = dataset_0_x - elem_legend.outerWidth()/2;
				elem_legend.css('left', left);
		    	
		    },
		},
    	maintainAspectRatio: false,
    	legend: {
    		display: false,
    	},
    	hover: {
			mode: 'index',
			intersect: false,
        	animationDuration: 0,
        },
    	tooltips: {
    		intersect: false,
    		mode: 'index',
    		callbacks: {
    			title: function(tooltip, data){
    				return (new wrapper_date(tooltip[0].xLabel)).display("date_very_short");
    			},
        		label: function(tooltip, data){
        			return ' '+tooltip.yLabel+' ('+data.datasets[tooltip.datasetIndex].label+')';
        		},
    		},
    	},
        scales: {
        	yAxes: [{
    			display: false,
    		}],
            xAxes: [{
                type: 'linear',
                position: 'bottom',
                autoSkip: false,
                gridLines: {
	        		display: false,
	        	},
    			ticks: {
    				min: data_team[0].x,
    				max: data_team[data_team.length-1].x,
    				stepSize: s_1day*stepSize_days,
                    callback: function(value, index, values) {
                    	return (new wrapper_date(value)).display("date_very_short");
                    }
                },
            }],
        }
    }

    /*disable animation if necessary*/
    if(!hasGood3Dsupport){
    	options.animation.duration = 0;
    }

	var chart_taskHistory = new Chart(ctx, {
	    type: 'line',
	    options: options,
	    data: {
	    	labels: labels,
	        datasets: [
		        {
		            label: Lincko.Translation.get('app', 2101, 'html'), //total
		            data: data_team,
		            lineTension: 0,
		            borderColor: "#f5a026",
		            backgroundColor: "#f5a026",
		            fill: false,
		            pointRadius: 0,
		            borderWidth: 2,
		            hitRadius: 8,
		        },
		        {
					label: Lincko.Translation.get('app', 2102, 'html'), //me
					data: data_user,
					lineTension: 0,
					borderColor: "#475577",
					backgroundColor: "#475577",
					fill: false,
					pointRadius: 0,
					borderWidth: 2,
					hitRadius: 8,
		        },
	        ],
	    },
	});

	return chart_taskHistory;
}


function app_layers_dashboard_launchPage(param){
	if(typeof param === 'undefined'){ param = null; }
	app_layers_dashboard_feedPage();
}

//keep track of chart instances here, then properly destroy on closePage function
var app_layers_dashboard_chartInst = [];
function app_layers_dashboard_closePage(){
	$.each(app_layers_dashboard_chartInst, function(i, inst){
		app_layers_dashboard_chartInst[i].destroy();
	});
	app_layers_dashboard_chartInst = [];
};

var app_layers_dashboard_feedPage = function(param){
	if(typeof param === 'undefined'){ param = null; }
	var position = $('#app_layers_dashboard');
	position.recursiveEmpty();

	var s_1day = 86400;
	var pid = app_content_menu.projects_id;
	var burndown_steps = 6; //7 bars
	var taskHistory_steps = 7; //8 data points



	var elem_header = $('#-app_layers_dashboard_header').clone().prop('id', '');
	position.append(elem_header);

	//today's date
	elem_header.find('[find=date]').append((new wrapper_date()).display("date_medium_simple"));

	//progress
	var percent = app_models_projects_getPercentComplete(pid);
	if(!percent){
		elem_header.find('.app_project_projects_progress').addClass('app_project_projects_progress_zero');
	} else{
		elem_header.find('.app_project_projects_progress').removeClass('app_project_projects_progress_zero');
	}
	elem_header.find('[find=percent]').text(percent);
	elem_header.find('[find=bar]').css('width', percent+'%');


	//burndown canvas
	var elem_burndown_wrapper = $('#-app_layers_dashboard_burndown_wrapper').clone().prop('id', '');
	var ctx_burndown = elem_burndown_wrapper.find('canvas');
	position.append(elem_burndown_wrapper);

	//taskHistory canvas
	var elem_taskHistory_wrapper = $('#-app_layers_dashboard_taskHistory_wrapper').clone().prop('id', '');
	var ctx_taskHistory = elem_taskHistory_wrapper.find('canvas');
	position.append(elem_taskHistory_wrapper);




	var project = Lincko.storage.get('projects', pid);
	var tasks = Lincko.storage.list('tasks', -1, [{ _tasksup: null}, {deleted_at: ['!=', null]}], 'projects', pid);
	var p_created_at = project.created_at;
	var p_firstDay = new wrapper_date(p_created_at).getEndofDay(); //first day of the project
	var now = new wrapper_date().timestamp;

	var duedate_last = p_created_at;
	$.each(tasks, function(i, task){
		if(task.start && task.duration){
			var duedate = task.start + task.duration;
			if(duedate > duedate_last){ duedate_last = duedate; }
		}
	});
	

	var burndown_stepSize_days = Math.floor(((duedate_last - p_created_at) / s_1day) / burndown_steps);
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

			if(step+s_1day*burndown_stepSize_days > duedate_last){ step = duedate_last; }

			burn_data.labels.push((new wrapper_date(step)).display("date_very_short"));
			burn_data.labels_timestamp.push(step);
			burn_data.ideal.push(0);
			burn_data.completed.push(0);
			burn_data.open.push(0);
		}

		$.each(burn_data.labels_timestamp, function(i, timestamp){

			burn_data.ideal[i] = i*(tasks.length / burndown_steps);

			$.each(tasks, function(j, task){

				//open task (task already created and not yet approved OR approved later)
				if(task.created_at <= timestamp && (!task.approved_at || task.approved_at > timestamp)){
					burn_data.open[i]++;
				}
				else if(timestamp < now && task.created_at <= timestamp && task.approved_at && task.approved_at < timestamp){
					burn_data.completed[i]++;
				}

			});
		});

		var chart_burndown = app_layers_dashboard_build_burndown(ctx_burndown, burn_data.labels, burn_data.ideal, burn_data.completed, burn_data.open);
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


};//end of app_layers_dashboard_feedPage()


function app_layers_dashboard_build_burndown(ctx, labels, ideal, completed, open){
	if(!ctx || !labels || !ideal || !completed || !open){ return false; }
	var s_1day = 86400;

	var chart_burndown = new Chart(ctx, {
	    type: 'bar',
	    data: {
	        labels: labels,
	        datasets: [
	        	{
	                type: 'line',
	                label: 'Ideal Burndown',
	               	data: ideal,
	               	lineTension: 0,
	               	pointRadius: 0,
	               	fill: false,
	               	backgroundColor: '#4a90e2',
	               	borderColor: '#4a90e2',
	               	pointBackgroundColor: '#4a90e2',
	            },
	        	{
		         	type: 'bar',
		            label: 'Completed Tasks',
		            data: completed,
		            backgroundColor: '#f5a026',
		        },
		        {
		        	type: 'bar',
		            label: 'Open Tasks',
		            data: open,
		            backgroundColor: '#d8d8d8',
		        },
		        
		        
	        ]
	    },
	    options: {
	    	layout: {
				padding: 10,
			},
	    	hover: {
	        	animationDuration: 0,
	        	mode: 'x',
	        },
	    	tooltips:{
	    		mode: 'x',
	    		callbacks: {
	    			label: function(tooltip, data){
	        			return ' '+Math.round(tooltip.yLabel)+' ('+data.datasets[tooltip.datasetIndex].label+')';
	        		},
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
		        		zeroLineWidth: 0,
		        	},
		    	 	barThickness: 30,
		            barPercentage: 0.5,
		            categoryPercentage: 0.1,
		        }],
			}	    	
	    }
	});
	return chart_burndown;
}

function app_layers_dashboard_build_taskHistory(ctx, labels, data_team, data_user, stepSize_days){
	if(!ctx || !labels || !data_team || !data_user || !stepSize_days){ return false; }
	var s_1day = 86400;
	var chart_taskHistory = new Chart(ctx, {
	    type: 'line',
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
	    options: {
	    	layout: {
				padding: 10,
			},
	    	animation: {
			    duration: 500,
			    easing: "easeOutQuart",
			    onComplete: function(chartInst){
			    	var vOffset = 0;
			    	var elem_legend = $(this.chart.ctx.canvas).siblings('[find=legend]').css('opacity', 1);
			    	var elem_dataset_0 = elem_legend.find('[dataset=0]');
			    	var elem_dataset_1 = elem_legend.find('[dataset=1]');

			    	var url_pic = Lincko.storage.getLinkThumbnail(Lincko.storage.get("users", wrapper_localstorage.uid, 'profile_pic'));
			    	if(url_pic){
			    		elem_dataset_1.css({
			    			'background-image': 'url("'+url_pic+'")',
			    			'font-size': 0,
			    		});
			    	}

			    	var dataset_0_meta = this.data.datasets[0]._meta;
			    	var dataset_0_x = dataset_0_meta[Object.keys(dataset_0_meta)[0]].data[0]._model.x;
			    	var dataset_0_y = dataset_0_meta[Object.keys(dataset_0_meta)[0]].data[0]._model.y;

			    	var dataset_1_meta = this.data.datasets[1]._meta;
			    	var dataset_1_x = dataset_1_meta[Object.keys(dataset_1_meta)[0]].data[0]._model.x;
			    	var dataset_1_y = dataset_1_meta[Object.keys(dataset_1_meta)[0]].data[0]._model.y;

			    	if(Math.abs(dataset_0_y - dataset_1_y) < elem_dataset_0.outerHeight()){
			    		vOffset = elem_dataset_0.outerHeight();
			    	}
			    	elem_dataset_0.css('top', dataset_0_y - elem_dataset_0.outerHeight()/2 -vOffset);
			    	elem_dataset_1.css('top', dataset_1_y - elem_dataset_0.outerHeight()/2);

			    	

			    	var left = dataset_0_x - elem_legend.outerWidth()/2;
			    	elem_legend.css('left', left);
			    	
			    },
			},
	    	maintainAspectRatio: false,
	    	legend: {
	    		display: false,
	    	},
        	tooltips: {
        		mode: 'x',
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
	    			ticks: {
	    				max: data_team[data_team.length-1].y ,
	    			},
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
	                }
	            }],
	        }
	    }
	});

	return chart_taskHistory;
}
>>>>>>> SKY: more on dashboard layer

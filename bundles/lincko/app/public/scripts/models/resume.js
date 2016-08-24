//Category 38
/*
	app_models_resume_format_sentence(9984);
	app_models_resume_format_sentence(9984, false, 1);
	app_models_resume_format_sentence(9984, true, 1);
*/
var app_models_resume_format_sentence = function(comments_id, who, type) {
	var uid = 0;
	if(typeof who == 'boolean' && who===true){
		uid = wrapper_localstorage.uid;
	}
	if(typeof type == 'undefined'){ type = 1; }

	//We do not display message from other user (useless information)
	if(uid!=0 && uid!=wrapper_localstorage.uid){
		return false;
	}

	var comment = Lincko.storage.get('comments', comments_id, 'comment');
	var sentence = '';
	var error = false;
	var base = 100;
	if(!comment){
		error = true;
	} else {
		var temp = JSON.parse(comment);
		if($.type(temp) != 'object' || !temp[uid]){
			error = true;
		} else {
			var list = temp[uid];
			if(list[100]){
				base = 100; //Daily
			} else if(list[100]){
				base = 700; //Weekly
			} else {
				error = true;
			}
		}
	}

	if(error){
		if(base == 700){
			return $('<span>')
				.addClass('unselectable')
				.html(wrapper_to_html(
					Lincko.Translation.get('app', 3817, 'html') //There was no activity last week.
				));
		} else {
			return $('<span>')
				.addClass('unselectable')
				.html(wrapper_to_html(
					Lincko.Translation.get('app', 3811, 'html') //There was no activity yesterday.
				));
		}
	}

	var data = {};
	for (var i = base; i < base+100; i++) {
		data[i] = '0';
		if(list[i]){
			if(typeof list[i] == 'object'){
				data[i] = ''+list[i].length;
			} else if(i==108){
				data[i] = ''+Lincko.storage.get('users', list[i], 'username').ucfirst();
			} else {
				data[i] = ''+list[i];
			}
			
		}
	}
	
	if(base==100){
		if(type==1){
			sentence = Lincko.Translation.get('app', 3801, 'pure', data);
			if(data[108]!=0){
				sentence = sentence + '<br />' + Lincko.Translation.get('app', 3802, 'pure', data);
			}
		}
	}

	sentence = sentence + '<div find="result" class="ellipsis"></div>';

	var span = $('<span>').html(sentence);
	span.addClass('app_models_resume_span unselectable');
	var result = {};
	//Attach event click
	//Task list
	links = {
		101: ['tasks', 'app_models_resume_tasks', ],
		102: ['tasks', 'app_models_resume_tasks', ],
		103: ['tasks', 'app_models_resume_tasks', ],
		104: ['tasks', 'app_models_resume_tasks', ],
		105: ['tasks', 'app_models_resume_tasks_overdue', ],
		111: ['notes', 'app_models_resume_notes', ],
		121: ['files', 'app_models_resume_files', ],
	};

	for(var i in links){
		if(typeof list[i] == 'object'){
			result = {};
			result[links[i][0]] = list[i];
			span.find("[find="+i+"]")
			.click([span, result, links[i][1]], function(event){
				app_models_resume_listup(event.data[0], event.data[1], event.data[2]);
			})
			.addClass(links[i][1]);
		}
	}

	return span;
};

var app_models_resume_listup = function(Elem, list, color){
	var div = Elem.find("[find=result]");
	if(div.html()==""){
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
						var wrapper = $(this).closest('.submenu_wrapper_preview');
						if(wrapper.length > 0){
							preview = true;
						}
						submenu_Build(
							'taskdetail',
							true,
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
			duration: 500,
			complete: function(){
				wrapper_IScroll();
			},
		});
	} else {
		div.velocity("slideUp", {
			duration: 300,
			complete: function(){
				$(this).empty();
				wrapper_IScroll();
			},
		});
	}
};


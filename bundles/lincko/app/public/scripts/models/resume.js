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
			} else if(list[700]){
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
			} else if(i==base+8){
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
				sentence = sentence + ' ' + Lincko.Translation.get('app', 3802, 'pure', data);
			}
		}
	} else if(base==700){
		if(type==1){
			sentence = Lincko.Translation.get('app', 3803, 'pure', data);
			if(data[708]!=0){
				sentence = sentence + ' ' + Lincko.Translation.get('app', 3804, 'pure', data);
			}
		}
	}

	sentence = sentence + '<div find="result" link="" class="ellipsis"></div>';

	var span = $('<span>').html(sentence);
	span.addClass('app_models_resume_span unselectable');
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

	};

	for(var i in links){
		if(typeof list[i] == 'object'){
			if(list[i].length<=0){
				continue;
			}
			result = {};
			result[links[i][0]] = list[i];
			span.find("[find="+i+"]")
			.click([span, result, links[i][1], i], function(event){
				app_models_resume_listup(event.data[0], event.data[1], event.data[2], event.data[3]);
			})
			.addClass(links[i][1]);
		}
	}

	return span;
};

var app_models_resume_listup = function(Elem, list, color, link, height){
	if(typeof height == 'undefined'){ height = 0; }
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
			begin: function(){
				wrapper_IScroll();
				var offsetHeight = $(this).outerHeight() - height;
				var wrapper = $(this).closest('.submenu_wrapper_preview');
				if(wrapper.length>0){
					var iScroll = myIScrollList["overthrow_"+wrapper[0].id];
					if(iScroll){
						iScroll.scrollBy(0, -offsetHeight, 1000, IScroll.utils.ease.circular);
					}
				}
			},
			complete: function(){
				wrapper_IScroll();
			},
		});
	} else {
		var offsetHeight = div.outerHeight();
		var link_old = div.attr('link');
		div.velocity("slideUp", {
			duration: 400,
			begin: function(){
				if(link == link_old){
					var wrapper = $(this).closest('.submenu_wrapper_preview');
					if(wrapper.length>0){
						var iScroll = myIScrollList["overthrow_"+wrapper[0].id];
						if(iScroll){
							//It feels strange to move up
							//iScroll.scrollBy(0, offsetHeight, 300, IScroll.utils.ease.circular);
						}
					}
				}
			},
			complete: function(){
				$(this).empty();
				div.attr('link', '');
				if(link != link_old){
					app_models_resume_listup(Elem, list, color, link, offsetHeight);
				} else {
					wrapper_IScroll();
				}
			},
		});
	}
};
var toto;

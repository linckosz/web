/*
* chatFeed
*/
var chatFeed = function(id,type,position,submenu)
{
	this.max_id;
	this.id = id;
	this.type = type;
	this.position = position;
	this.submenu = submenu;
	this.has_today = false;

	this.page_count = 15;
	this.download_pages = 4;
	this.current_page = 0 ;
	this.page_top = false;
	this.pending_items = false;

	this.current = null;
	this.msg_over = false;
	this.top_msg_id = 0;
	this.top_time = 0;
	this.min_time = 0;
	this.last_data = false;

	this.current_data = [];
	this.next_data = [];

	this.running_last_time = 0;

	this.records = [] ;

	this.collecting = false;
	this.loading = false;

	var that = this;

	var loading_timer = false;
	wrapper_IScroll_cb_creation[that.position.prop('id')] = function(){

		var IScroll = myIScrollList[that.position.prop('id')];
		var events_list = [
			'wheel',
			'mousewheel',
			'DOMMouseScroll',
		];
		for(var i in events_list){
			that.position.on(events_list[i], IScroll, function(event){
				if(!loading_timer){
					if(IScroll.y >= 0){
						that.position.find(".models_history_loading").removeClass('models_history_loading_hide');
					} else if(IScroll.y < -30){
						that.position.find(".models_history_loading").addClass('models_history_loading_hide');
					}
					loading_timer = setTimeout(function(IScroll){
						if(IScroll){
							if(that.collecting)
							{
								setTimeout(function(){
									if(IScroll && IScroll.y >= 0){
										that.loading = true;
										that.position.find(".models_history_loading").remove();
										var first_li = that.position.find('li').eq(0); //Grab old first li element
										that.app_chat_feed_layer_display();
										IScroll.refresh();
										if(first_li.length>0){
											IScroll.scrollToElement(first_li.get(0), 0, 0, -30);
										}
									}
								}, 1000);
							}
							else
							{
								if(IScroll.y >= 0){
									that.loading = true;
									that.position.find(".models_history_loading").remove();
									var first_li = that.position.find('li').eq(0); //Grab old first li element
									that.app_chat_feed_layer_display();
									IScroll.refresh();
									if(first_li.length>0){
										IScroll.scrollToElement(first_li.get(0), 0, 0, -30);
									}
								}
							}
							clearTimeout(loading_timer);
							loading_timer = false;
						}
					}, 100, event.data);
				}
			});
			//This is used when we move the bar manually
			IScroll.on('scrollEnd', function(){
				if(!loading_timer){
					if(IScroll.y >= 0){
						that.position.find(".models_history_loading").removeClass('models_history_loading_hide');
					} else if(IScroll.y < -30){
						that.position.find(".models_history_loading").addClass('models_history_loading_hide');
					}
					loading_timer = setTimeout(function(IScroll){
						if(IScroll){
							if(that.collecting)
							{
								setTimeout(function(){
									if(IScroll && IScroll.y >= 0){
										that.loading = true;
										that.position.find(".models_history_loading").remove();
										var first_li = that.position.find('li').eq(0);
										that.app_chat_feed_layer_display();
										IScroll.refresh();
										if(first_li.length>0){
											IScroll.scrollToElement(first_li.get(0), 0, 0, -30);
										}
									}
								}, 1000);
							}
							else
							{
								if(IScroll.y >= 0){
									that.loading = true;
									that.position.find(".models_history_loading").remove();
									var first_li = that.position.find('li').eq(0); //Grab old first li element
									that.app_chat_feed_layer_display();
									IScroll.refresh();
									if(first_li.length>0){
										IScroll.scrollToElement(first_li.get(0), 0, 0, -30);
									}
								}
							}
							clearTimeout(loading_timer);
							loading_timer = false;
						}
					}, 100, this);
				}
			});
		}

	}

	this.create_iscroll_container();
	this.app_chat_feed_data_init();
	this.app_chat_feed_layer_display();
	this.app_chat_feed_temp_history();
	this.app_chat_feed_recall_init();

}


chatFeed.prototype.app_chat_feed_timeline = function(data)
{
	var today = Math.floor((new Date()).getTime() / 86400000);
	var the_date;
	for(var i in data)
	{
		if( i == 0 )
		{
			the_date = Math.floor( data[i]['timestamp'] / 86400) * 86400;
		}
		if( the_date > Math.floor( data[i]['timestamp']  / 86400) * 86400 )
		{
			data[i - 1]["timeline"]  = the_date;
			the_date = Math.floor( data[i]['timestamp']  / 86400) * 86400 ;
		}
		if( i == data.length -1 )
		{
			data[i]["timeline"]  = the_date;
		}
		if (the_date == today * 86400 & !this.has_today ) {
			this.has_today = true;
		}
	}
	return data;
}

chatFeed.prototype.create_iscroll_container = function()
{
	this.position.addClass('overthrow').addClass("submenu_chat_contents");
	this.position.empty();
	$('<div>').addClass('chat_contents_wrapper').prop('id', this.submenu.id+'_chat_contents_wrapper').appendTo(this.position).append($('#'+'-help_iscroll').clone().prop('id',this.submenu.id+'_help_iscroll'));
}


chatFeed.prototype.app_chat_feed_data_format = function(data)
{
	var records = [];
	for(var i in data)
	{
		this.current = data[i];
		var item = new BaseItemCls(data[i],this.type);
		if(item.style != '' && item.data.category != ''){
			records.push(item);
		}
	}
	return records;
}



chatFeed.prototype.app_chat_feed_data_running = function()
{
	var data = Lincko.storage.list(null, null , this.running_last_time == 0 ? null : {'created_at': [">=", this.running_last_time], '_type': ['!=', 'chats'],}, 'chats', this.id, false);
	this.running_last_time = data.length > 0 ? data[0]['created_at'] : 0 ;
	return data;
}


chatFeed.prototype.app_chat_feed_data_init = function()
{
	var item;

	//calculate the minimum timestamp according to the earliest message stored
	var data = Lincko.storage.list(null, this.page_count+1 , {'_type': ['!=', 'chats'],}, 'chats', this.id, false);
	this.running_last_time = data.length > 0 ? data[0]['created_at'] : 0 ;

	var suffix;
	for(var i in data)
	{
		if(i < this.page_count)//first page
		{
			suffix = '_' + data[i]['_type'] + '_models_thistory_' + data[i]['_id'];
			item = new BaseItemCls(data[i], this.type);
			if(item == null || item.data == null || item.style == '' || item.data.category == ''){
				continue;
			}
			this.records.push(item);
			if(data[i]['_type']=='messages')
			{
				this.top_msg_id = data[i]['_id'];
			}
			this.last_data = suffix;
			this.top_time = data[i]['created_at'];
		}
		else if(i == this.page_count)
		{
			if(this.records.length > 0)
			{
				this.records[this.records.length - 1]['lazy'] = true;
			}
			break;
		}
	}

	var display_date = true;
	for(var i in this.records){
		if(this.records[i].lazy){
			display_date = false;
		}
	}
	if(display_date){
		this.msg_over = true;
	}

}

chatFeed.prototype.app_chat_feed_more_msg = function(){
	this.records = [];
	if(!this.pending_items){
		this.pending_items = true;
		var data = Lincko.storage.list(null, this.page_count+1 , {'created_at': ['<=', this.top_time], '_type': ['!=', 'chats']}, 'chats', this.id, false);
		var suffix;
		var item;
		for(var i in data)
		{
			if(i < this.page_count)//first page
			{
				suffix = '_' + data[i]['_type'] + '_models_thistory_' + data[i]['_id'];

				var elem_id = this.submenu.id + suffix ;

				if($('#'+elem_id).length <= 0)
				{
					item = new BaseItemCls(data[i],this.type);
					if(item.style == '' || item.data.category == ''){
						continue;
					}
					if(data[i]['created_at'] < this.min_time){
						break;
					}
					this.records.push(item);
					this.top_time = data[i]['created_at'];
					this.pending_items = false;
				}
				this.last_data = suffix;
			}
			else if(i == this.page_count)
			{
				if(this.records.length > 0)
				{
					this.records[this.records.length - 1]['lazy'] = true;
				}
				break;
			}
		}
	}
	if(!this.collecting){
		if(!this.msg_over)
		{
			var that = this;
			this.collecting = true;

			wrapper_sendAction(
				{
					"parent_id": that.id, //Chats ID
					"id_max": that.top_msg_id, //OPTIONAL {false} Get all IDs below this ID (not included) , false value returns from the newest
					"row_number": (that.page_count * that.download_pages), //ODownload 2 pages at a time, OPTIONAL {30} Number of rows to get
				},
				'post',
				 'message/collect',
				function(msg, data_error, data_status, data_msg) {//result
					var length = 0;
					var min_time = false;
					var top_msg_id = 0;
					if(data_msg.partial && data_msg.partial[wrapper_localstorage.uid] && data_msg.partial[wrapper_localstorage.uid]['messages']){
						length = Object.keys(data_msg.partial[wrapper_localstorage.uid]['messages']).length;
						for(var i in data_msg.partial[wrapper_localstorage.uid]['messages']){
							if(!min_time || data_msg.partial[wrapper_localstorage.uid]['messages'][i]['created_at'] < min_time){
								min_time = data_msg.partial[wrapper_localstorage.uid]['messages'][i]['created_at'];
								top_msg_id = i;
							}
						}
					}
					if(length < that.page_count * that.download_pages)
					{
						that.msg_over = true;
					}
					if(min_time){
						that.min_time = min_time;
						that.top_msg_id = top_msg_id;
					} else {
						that.top_msg_id = 0;
					}
				},
				null,
				function(){
					that.collecting = true; //Have to reset to true in begin in case of retry ajax
				},
				function(){
					that.collecting = false;
					this.pending_items = false;
				}
			);
		}
	}

	return this.records.length;
}


chatFeed.prototype.app_chat_feed_layer_display = function()
{
	if(!this.page_top){
		for(var i in this.records)
		{
			if(typeof this.records[i]['data'] == 'undefined' || this.records[i]['data'] == null || this.records[i]['data']['category'] == null){
				continue;
			}
			var elem_id = this.submenu.id + '_' + this.records[i]['data']['category'] + '_models_thistory_' + this.records[i]['data']['id'];
			if($('#'+elem_id).length <= 0 && this.records[i].data != null)
			{
				this.records[i].item_display(this.position,this.submenu,'history');
			}
		}
		var length = this.app_chat_feed_more_msg();
		if(length<=0 && this.msg_over && !this.page_top)
		{
			var line = false;
			var timeline = new wrapper_date(this.top_time).getDayStartTimestamp();
			if(typeof this.submenu.param.prev_timeline != 'undefined'){
				//Create the line first
				var line = $("#-models_history_line").clone();
				line.prop('id','');
				var w_date = new wrapper_date(this.submenu.param.prev_timeline);
				if (w_date.happensToday()) {
					line.find(".history_time").html(Lincko.Translation.get('app', 3302, 'html').toUpperCase()); //Today
				} else if (w_date.happensSomeday(-1)) {
					line.find(".history_time").html(Lincko.Translation.get('app', 3304, 'html').toUpperCase()); //Yesterday
				} else {
					line.find(".history_time").html(new wrapper_date(this.submenu.param.prev_timeline).display('date_very_short')); // Oct 28
				}
				this.position.find(".chat_contents_wrapper").before(line);
			}
			this.page_top = true;
		}
	}
}

chatFeed.prototype.app_chat_feed_temp_history = function()
{
	var that = this;
	$.each(app_models_chats_send_queue,function(key,data){
		if(data.parent_id == that.id && data.parent_type == that.type)
		{
			data.data.item_display(that.position,that.submenu,'insert');
		}	
	});
}

chatFeed.prototype.app_chat_feed_send_msg = function(data)
{
	var profile = Lincko.storage.getLinkThumbnail(Lincko.storage.get("users",data.by,'profile_pic'));
	if(!profile){
		profile = app_application_icon_single_user.src;
	} else if(data.by==0){ //LinckoBot
		profile = app_application_icon_roboto.src;
	} else if(data.by==1){ //Monkey King
		profile = app_application_icon_monkeyking.src;
	}
	var msg = 
	{
		'user_id' : data.by,
		'user_name' : Lincko.storage.get('users',  data.by,'username'),
		'profile' : profile,
		'timestamp' : data.timestamp,
		'timeline' : this.has_today ? null : Math.floor(data.timestamp / 86400) * 86400 ,
		'style' : 'comment',
		'id' : data.id,
		'temp_id' :  data.id,
		'category' : data.category,
		'content' : data.content,
		'is_recalled' : false,
	};

	this.has_today = true;
	var item = new  BaseItemCls(msg);
	app_models_chats_send_queue[data.id] = 
	{
		'parent_type' : this.type,
		'parent_id' : this.id,
		'data' : item
	}
	item.item_display(this.position,this.submenu,'insert');
}


chatFeed.prototype.app_chat_feed_send_audio = function(data){
	var profile = Lincko.storage.getLinkThumbnail(Lincko.storage.get("users",data.by,'profile_pic'));
	if(!profile){
			profile = app_application_icon_single_user.src;
	}
	var msg = 
	{
		'user_id' : data.by,
		'user_name' : Lincko.storage.get('users',  data.by,'username'),
		'profile' : profile,
		'timestamp' : data.timestamp,
		'timeline' : this.has_today ? null : Math.floor(data.timestamp / 86400) * 86400 ,
		'style' : 'audio',
		'id' : data.id,
		'temp_id' :  data.id,
		'category' : data.category,
		'content' : data.content,
		'duration' : data.duration,
	};

	this.has_today = true;
	var item = new BaseItemCls(msg);
	item.item_display(this.position,this.submenu,'insert');
}


chatFeed.prototype.app_chat_feed_load_recent = function()
{
	var mode = 'insert';
	var data = this.app_chat_feed_data_format(this.app_chat_feed_data_running());

	for( var i = data.length - 1; i >= 0; i-- )
	{
		var elem_id = this.submenu.id + '_' + data[i].data.category + '_models_thistory_' + data[i].data.id 
				+ (typeof data[i].data.hist !== 'undefined' && data[i].data.hist != 0 ?  '_'+ data[i].data.hist : '');
		var temp_elem_id = this.submenu.id + '_' + data[i].data.category + '_models_thistory_' + data[i].data.temp_id 
				+ (typeof data[i].data.hist !== 'undefined' && data[i].data.hist != 0 ?  '_'+ data[i].data.hist : '');
		var file_temp_elem_id = this.submenu.id + '_uploading_file_models_thistory_' + data[i].data.temp_id;

		if($("#"+elem_id).length > 0)
		{
			mode = 'exist';
		}
		else if($("#"+temp_elem_id).length > 0)
		{
			mode = 'change';
		}
		else if($('#'+file_temp_elem_id).length > 0)
		{
			mode = 'replace';
		}
		else
		{
			mode = 'insert';
		}
		data[i].item_display(this.position,this.submenu,mode);
	}
}

chatFeed.prototype.app_chat_feed_uploading_file = function()
{
	var files = app_upload_files.lincko_files;

	var user_name = Lincko.storage.get('users', wrapper_localstorage.uid,'username') ;
	var profile = Lincko.storage.getLinkThumbnail(Lincko.storage.get("users", wrapper_localstorage.uid, 'profile_pic'));
	if(!profile){
		profile = app_application_icon_single_user.src;
	}

	for(var i in files)
	{
		if(files[i].lincko_parent_type != 'chats' || files[i].lincko_parent_id != this.id ) {continue;}
		var preview = null;
		try{
			preview = files[i].files[0].preview.toDataURL();
		}
		catch(e)
		{
			
		}

		var record =
		{
			'user_id' : wrapper_localstorage.uid,
			'user_name' : user_name,
			'profile' : profile,
			'timestamp' : Math.floor($.now()/1000),
			'timeline' : this.has_today ? null : Math.floor(Math.floor($.now()/1000) / 86400) * 86400 ,
			'style' : 'upload',
			'id' : files[i].lincko_temp_id,
			'temp_id' : files[i].lincko_temp_id,
			'file_name' : app_models_fileType.cutFileTitle(files[i].lincko_name,10,0),
			'progress' : files[i].lincko_progress,
			'uploading_status' : files[i].lincko_status,
			'file_size' : files[i].lincko_size,
			'preview' : preview,
			'category' : 'uploading_file',
			'ext' : app_models_fileType.getExt(files[i].lincko_name),
			'index' :files[i].lincko_files_index,
		};
		this.has_today = true;

		var item = new BaseItemCls(record);
		if(item.style == '' || item.data.category == ''){
			continue;
		}
		var temp_elem_id = this.submenu.id + '_uploading_file_models_thistory_' + record['temp_id'];

		var mode = $('#'+temp_elem_id).length > 0 || (files[i].lincko_progress >= 100 && files[i].lincko_status == 'done') ? 'refresh' : 'insert' ;
		item.item_display(this.position,this.submenu,mode);
	}
}

chatFeed.prototype.app_chat_feed_recall_init = function()
{
	var that = this;
	$.each(app_models_chats_recall_queue,function(key,data){
		var elem_id = that.submenu.id + '_comments_models_thistory_' + key;
		if($('#'+elem_id))
		{
			var target = $('#'+elem_id);
			var elem_id = target.prop('id');
			var elem = $('#-models_history_comment_recalled').clone();
			elem.prop('id',elem_id);
			elem.find("[find=timestamp]").html(app_models_chats_recall_queue[key]['timestamp']);
			elem.find("[find=msg]").text(Lincko.Translation.get('app', 3101, 'html', {username: Lincko.storage.get('users', wrapper_localstorage.uid ,'username')}));
			target.replaceWith(elem);
		}
	});
}




/* Category 31 */
var BaseItemCls = function(record,type)
{
	this.style = '';

	//according to type
	this.user_id = 0;
	this.user_name = '';
	this.profile ='';
	this.timestamp = 0;

	//according to style
	this.data = null; 
	this.timeline = null;
	this.lazy = false;

	//common data
	//style:{report,comment,ativity{comments,notes,files,tasks},file,uploading}
	//category{comments,notes,files,tasks}
	switch(type)
	{
		case "history":
			this.user_id = record["by"];
			this.user_name = record["par"]["un"];
			this.profile = Lincko.storage.getLinkThumbnail(Lincko.storage.get("users", record["by"], 'profile_pic'));
			if(!this.profile){
				this.profile = app_application_icon_single_user.src;
			}
			this.timestamp = record["timestamp"];
			if(record['type'] == 'comments' && record['par_type'] == 'projects')
			{
				this.style = record['by'] == 0 ? 'report' : 'comment';
			}
			else
			{
				this.style = 'activity';
			}
			break;
		case "chats" :
			this.user_id = record["created_by"] ;
			this.user_name = Lincko.storage.get('users', record["created_by"] ,'username');
			this.profile = Lincko.storage.getLinkThumbnail(Lincko.storage.get("users", record["created_by"],'profile_pic'));
			if(!this.profile){
				this.profile = app_application_icon_single_user.src;
			}
			this.timestamp = record["created_at"];
			if(record['_type'] == 'files')
			{
				this.style = 'file';
			}
			else if(record['_type'] == 'comments' || record['_type'] == 'messages')
			{
				this.style = 'comment';
			}
			break;
		default :
			this.user_id = record['user_id'];
			this.user_name = record['user_name'];
			this.profile = record['profile'];
			this.timestamp = record['timestamp'];
			this.timeline = record['timeline'];
			this.style = record['style'];
			break;
	}

	//style:{report,comment,ativity{comments,notes,files,tasks},file,uploading}
	switch(this.style)
	{
		case 'report' :
			this.data = new ReportContentCls(record,type);
			break;
		case 'comment' :
			this.data = new CommentContentCls(record,type);
			break;
		case 'activity' :
			this.data = this.data_category_cls(record,type);
			break;
		case 'file' :
			this.data = new FileContentCls(record,type);
			break;
		case 'upload' :
			this.data = new UploadingContentCls(record,type);
			break;
		default :
			break;
	}
}

BaseItemCls.prototype.data_category_cls = function(record,type)
{
	switch(record['type'])
	{
		case 'files' : 
			return new ActivityFileContentCls(record,type);
		case 'comments' : 
			return new ActivityCommentContentCls(record,type);
		default:
			return new ActivityContentCls(record,type);
	}
}

BaseItemCls.prototype.template_render = function()
{
	var template = '';
	switch(this.style)
	{
		case 'report' :
			template = '-models_history_comment_short';
			break;
		case 'comment' :
			template = this.data.is_recalled ? '-models_history_comment_recalled' : '-models_history_comment_short';
			break;
		case 'activity' :
			template = this.data.category == 'comments' ? '-models_history_comment_long' : '-models_history_' + this.data.category;
			break;
		case 'file' :
			template = '-models_history_files' ;
			break;
		case 'upload' :
			template = '-models_history_' + this.data.category;
		default :
			break;
	}
	return template;
} 


BaseItemCls.prototype.item_display = function(position,subm,mode)
{
	var template = this.template_render();	
	var elem_id = subm.id + '_' + this.data.category + '_models_thistory_' + this.data.id 
				+ (typeof this.data.hist !== 'undefined' && this.data.hist != 0 ?  '_'+ this.data.hist : '');
	var elem = $('#' + template).clone();
	elem.prop('id',elem_id);

	if(typeof this.data.is_recalled !==  'undefined' && this.data.is_recalled)
	{
		var date = new wrapper_date(this.timestamp);
		elem.find("[find=timestamp]").html(date.display('time_short'));
		elem.find("[find=msg]").text(Lincko.Translation.get('app', 3101, 'html', {username: this.user_name}));
	}
	else
	{
		
		elem.addClass(wrapper_localstorage.uid === parseInt(this.user_id, 10) ? 'models_history_self' : 'models_history_others');
		elem.addClass(this.data.category);

		if(this.user_id == 0){
			elem.find("[find=icon]").css('border-color', 'transparent');
			elem.find("[find=icon]").css('background-image','url("' +  app_application_icon_roboto.src + '")');
			elem.find("[find=author]").html(Lincko.Translation.get('app', 0, 'html')); 
		} else {
			var profile =  Lincko.storage.getLinkThumbnail(Lincko.storage.get("users",this.user_id , 'profile_pic'));
			elem.find("[find=icon]").css('background-image','url("' + this.profile + '")');
			var user_name = Lincko.storage.get('users', this.user_id ,'username');
			elem.find("[find=author]").text(user_name);
		}
		var date = new wrapper_date(this.timestamp);
		elem.find(".time", "[find=timestamp]").html(date.display('time_short'));
		elem.find(".date", "[find=timestamp]").html(date.display('date_short'));
		this.feed_profile_action(elem,this.user_id,subm);
		this.feed_content(elem);
		if(this.style == 'activity' || this.style == 'file') this.feed_action(elem,subm);
	}

	if(this.timeline != null)
	{
		template = "-models_history_line" ;
		var line = $("#" + template).clone();
		var today = Math.floor((new Date()).getTime() / 86400000);

		if (this.timeline  == today * 86400) {
			line.find(".history_time").html(Lincko.Translation.get('app', 3302, 'html').toUpperCase());
		}
		else if (this.timeline  == (today - 1) * 86400) {
			line.find(".history_time").html(Lincko.Translation.get('app', 3304, 'html').toUpperCase());
		}
		else{
			line.find(".history_time").html(new wrapper_date(this.timeline).display('date_very_short'));
		}
		
	}

	try{
		switch (mode)
		{
			case 'history' :
				elem.prependTo(position.find(".chat_contents_wrapper"));
				if(this.lazy)
				{
					var loading_elem =  $("#-models_history_loading").clone();
					loading_elem.removeAttr('id');
					elem.before(loading_elem);
				}
				if(this.timeline != null)
				{
					elem.before(line);
				}
				break;
			case 'insert' :
				//elem.appendTo(position.find(".chat_contents_wrapper"));
				var help = $('#' + subm.id + '_help_iscroll');
				help.before(elem);
				if(this.timeline != null)
				{
					elem.before(line);
				}
				break;
			case 'change' :
					var temp_elem_id = subm.id + '_' + this.data.category + '_models_thistory_' + this.data.temp_id 
					+ (typeof this.data.hist !== 'undefined' && this.data.hist != 0 ?  '_'+ this.data.hist : '');
					if(this.data.category == 'comments' || this.data.category == 'messages' )
					{
						$('#'+temp_elem_id).attr(this.data.category + '_id',this.data.id);

						$('#'+temp_elem_id).removeAttr('temp_id');
					}
					$('#'+temp_elem_id).prop('id',elem_id);
			case 'replace' :
				if(this.data.category == 'files')
				{
					var temp_elem_id = subm.id + '_uploading_file_models_thistory_' + this.data.temp_id 
					+ (typeof this.data.hist !== 'undefined' && this.data.hist != 0 ?  '_'+ this.data.hist : '');
					if($('#'+temp_elem_id).length > 0)
					{
						$('#'+temp_elem_id).replaceWith(elem);
					}
				}
				break;
			case 'refresh' :
				elem = $('#'+elem_id);
				this.feed_content(elem);
			default :
				break;
		}
		
	}
	catch(e){

	}
	
}

BaseItemCls.prototype.feed_profile_action = function(elem,userid,subm)
{
	elem.find("[find=icon]").click(userid,function(event){
		submenu_Build("personal_info", subm.layer + 1, false, event.data, subm.preview);
	});
}

BaseItemCls.prototype.feed_content = function(elem)
{
	this.data.feed_content(elem);
}

BaseItemCls.prototype.feed_action = function(elem,subm)
{
	this.data.feed_action(elem,subm);
}


var FileContentCls = function(record,type)
{
	this.id = record['_id'];
	this.category = record['_type'];
	this.target = Lincko.storage.get(record['_type'] , record['_id'], 'name');
	this.file_category = Lincko.storage.get(record['_type'], record['_id'],'category');
	this.file_profile =  Lincko.storage.getLinkThumbnail(record['_id']);
	this.ext = Lincko.storage.get(record['_type'], record['_id'],'ori_ext');
	this.temp_id = record['temp_id'];
}

FileContentCls.prototype.feed_content = function(elem)
{
	if(this.file_category =='image' || this.file_category =='video')
	{
		elem.find(".models_history_standard_shortcut_ico").addClass('display_none');
		elem.find(".models_history_standard_shortcut_pic").removeClass('display_none').css('background-image','url("'+this.file_profile+'")');
	} 
	else{
		elem.find(".models_history_standard_shortcut_ico").removeClass('display_none').find("i").addClass(app_models_fileType.getClass(this.ext));
		elem.find(".models_history_standard_shortcut_pic").addClass('display_none');
	}

	elem.find("[find=target]").html(this.target);
}

FileContentCls.prototype.feed_action = function(elem,subm){
	var that = this;
	elem.find("[find=shortcut]").click({'subm':subm,'type':that.category,'target_id':that.id,'file_category':that.file_category},function(event){
		var subm = event.data.subm;
		var target_id =  event.data.target_id;
		var type =  event.data.type;
		var file_category = event.data.file_category;
		if(file_category =='image') {
			previewer['pic'](target_id);
		}else if( file_category =='video'){
			previewer['video'](target_id);
		}
		else {
			submenu_Build('taskdetail', -1, null, {'type':type, 'id':target_id}, subm.preview);
		}
	});
	elem.find("[find=target]").click({'subm':subm,'type':this.category,'target_id':this.id},function(event){
		var subm = event.data.subm;
		var type = event.data.type;
		var target_id = event.data.target_id;
		submenu_Build('taskdetail', -1, null, {'type':type, 'id': target_id}, subm.preview);
	});
}

var ReportContentCls = function(record,type)
{
	this.id = record['id'];
	this.category = 'comments';
	if(app_models_resume_format_sentence(this.id) == false)
	{
		this.category = '';
	}
}

ReportContentCls.prototype.feed_content = function(elem)
{
	elem.find("[find=content]").append(app_models_resume_format_sentence(this.id));
}

ReportContentCls.prototype.feed_action = function(elem,subm){}

var CommentContentCls = function(record,type)
{
	this.id = 0;
	this.temp_id = 0;
	this.content ='';
	this.is_recalled = false;

	switch(type)
	{
		case 'history' :
			var item = Lincko.storage.get('comments',record['id']);
			this.id = item['_id'];
			this.temp_id = item['temp_id'];
			this.content = item['+comment'];
			this.is_recalled = item['recalled_by'] != null; 
			this.category = 'comments';
			break;
		case 'chats' :
			this.id = record['_id'];
			this.temp_id = record['temp_id'];
			this.content = record['+comment'];
			this.is_recalled = record['recalled_by'] != null; 
			this.category = 'messages';
			break;
		default:
			this.id = record['id'];
			this.temp_id = record['temp_id'];
			this.content = record['content'];
			this.is_recalled = record['is_recalled']; 
			this.category = record['category']; 
			break;
	}
}

CommentContentCls.prototype.feed_content = function(elem)
{
	elem.attr('category',this.category);
	elem.attr(this.category + '_id',this.id);
	if(this.id == this.temp_id)
	{
		elem.attr('temp_id',this.temp_id);
	}
	elem.find("[find=content]").append(wrapper_to_html(this.content));
}

CommentContentCls.prototype.feed_action = function(elem,subm){}

var ActivityFileContentCls = function(record,type)
{
	this.id = record['id'];
	this.temp_id = Lincko.storage.get(record['type'] , record['id'], 'temp_id');
	this.category = record['type'];
	this.target = Lincko.storage.get(record['type'] , record['id'], 'name');
	this.file_category = Lincko.storage.get(record['type'], record['id'],'category');
	this.file_profile =  Lincko.storage.getLinkThumbnail(record['id']);
	this.ext = Lincko.storage.get(record['type'], record['id'],'ori_ext');

	var history = Lincko.storage.getHistoryInfo(record);
	var clone_hist = $.extend(true, {}, history.root.history);
	var text = history.root.title;
	if(clone_hist.par.un){
		clone_hist.par.un = '';
	}
	this.action = php_nl2br(Lincko.storage.formatHistoryInfo(text, clone_hist)) + ':&nbsp;';
}

ActivityFileContentCls.prototype.feed_content = function(elem)
{
	if(this.file_category =='image' || this.file_category =='video')
	{
		elem.find(".models_history_standard_shortcut_ico").addClass('display_none');
		elem.find(".models_history_standard_shortcut_pic").removeClass('display_none').css('background-image','url("'+this.file_profile+'")');
	} 
	else{
		elem.find(".models_history_standard_shortcut_ico").removeClass('display_none').find("i").addClass(app_models_fileType.getClass(this.ext));
		elem.find(".models_history_standard_shortcut_pic").addClass('display_none');
	}
	elem.find("[find=target]").html(app_models_fileType.cutFileTitle(this.target,10,0));
	elem.find("[find=action]").html(wrapper_to_html($.trim(this.action).ucfirst()));
}

ActivityFileContentCls.prototype.feed_action = function(elem,subm){
	var that = this;
	elem.find("[find=shortcut]").click({'subm':subm,'type':that.category,'target_id':that.id,'file_category':that.file_category},function(event){
		var subm = event.data.subm;
		var target_id =  event.data.target_id;
		var type =  event.data.type;
		var file_category = event.data.file_category;
		if(file_category =='image') {
			previewer['pic'](target_id);
		}else if( file_category =='video'){
			previewer['video'](target_id);
		}
		else {
			submenu_Build('taskdetail', -1, null, {'type':type, 'id':target_id}, subm.preview);
		}
	});
	elem.find("[find=target]").click({'subm':subm,'type':this.category,'target_id':this.id},function(event){
		var subm = event.data.subm;
		var type = event.data.type;
		var target_id = event.data.target_id;
		submenu_Build('taskdetail', -1, null, {'type':type, 'id': target_id}, subm.preview);
	});
}

var ActivityContentCls = function(record,type)
{
	this.id = record['id'];
	this.category = record['type'];
	this.target_id =  record['id'];
	this.target = Lincko.storage.get(record['type'] , record['id'], 'title');
	var history = Lincko.storage.getHistoryInfo(record);
	var clone_hist = $.extend(true, {}, history.root.history);
	var text = history.root.title;
	if(clone_hist.par.un){
		clone_hist.par.un = '';
	}
	this.action = php_nl2br(Lincko.storage.formatHistoryInfo(text, clone_hist)) + ':&nbsp;';
}

ActivityContentCls.prototype.feed_content = function(elem)
{
	elem.find("[find=target]").html(this.target);
	elem.find("[find=action]").html(wrapper_to_html($.trim(this.action).ucfirst()));
}

ActivityContentCls.prototype.feed_action = function(elem,subm)
{
	var that = this;
	if(this.category != 'projects')
	{
		elem.find("[find=target]").click({'subm':subm,'type':that.category,'target_id':that.target_id},function(event){
			var subm = event.data.subm;
			var type = event.data.type;
			var target_id = event.data.target_id;
			submenu_Build('taskdetail', -1 , null,  {'type':type, 'id': target_id},  subm.preview);
		});
	}
	
}

var ActivityCommentContentCls = function(record,type)
{
	this.id = record['id'];
	this.category = record['type'];

	
	this.target_id = record['par_id'];
	this.target_category = record['par_type'];
	
	if(this.target_category == 'comments')
	{
		var root = Lincko.storage.getCommentRoot(this.target_category,this.target_id, key);
		this.target_id = root['_id'];
		this.target_category = root['_type'];
		record['par_id']  = root['_id'];
		record['par_type'] = root['_type'];
	}
	var key = this.target_category == 'files' ? '+name' : 'title';

	this.target = Lincko.storage.get(this.target_category,this.target_id, key);
	var history = Lincko.storage.getHistoryInfo(record);
	var clone_hist = $.extend(true, {}, history.root.history);
	var text = history.root.title;
	if(clone_hist.par.un){
		clone_hist.par.un = '';
	}
	this.action = php_nl2br(Lincko.storage.formatHistoryInfo(text, clone_hist)) + ':&nbsp;';
}

ActivityCommentContentCls.prototype.feed_content = function(elem)
{
	elem.find("[find=target]").html(this.target);
	elem.find("[find=action]").html(wrapper_to_html($.trim(this.action).ucfirst()));
}

ActivityCommentContentCls.prototype.feed_action = function(elem,subm)
{
	var that = this;
	elem.find("[find=target]").click({'subm':subm,'type':that.target_category,'target_id':that.target_id},function(event){
		var subm = event.data.subm;
		var type = event.data.type;
		var target_id = event.data.target_id;
		submenu_Build('taskdetail', -1 , null,  {'type':type, 'id': target_id},  subm.preview);
	});
}


var UploadingContentCls = function(record,type)
{
	this.id = record['id'];
	this.temp_id = record['temp_id'];
	this.category = record['category'];
	this.style = record['style'];
	this.file_name = record['file_name'];
	this.progress = record['progress'];
	this.uploading_status = record['uploading_status'];
	this.file_size = record['file_size'];
	this.preview = record['preview'];
	this.ext = record['ext'];
}

UploadingContentCls.prototype.feed_content = function(elem)
{

	if(this.progress >=100 && this.uploading_status === 'done'){
		elem.find('.progress_bar_wrapper').recursiveRemove();
		elem.find('[find=progress_text]').recursiveRemove();
		elem.find('.uploading_action').recursiveRemove();
	} 
	else
	{
		elem.addClass('files');
		elem.addClass(this.category);
		elem.find('[find=target]').addClass('upload_file_title').html(this.file_name);
		elem.find('[find=progress_bar]').css('width', Math.floor(this.progress) + '%');


		elem.find('[find=progress_text]').addClass('uploading_file_progress_size').html( parseInt(this.progress * this.file_size / 1024 / 100)
		+ ' K of ' + parseInt (this.file_size/1024) + 'K'); //toto => translation
		elem.find(".uploading_action").html(Lincko.Translation.get('app', 7, 'html'));

		if(this.preview == null || this.preview == '')
		{
			elem.find(".models_history_standard_shortcut_ico").removeClass('display_none');
			elem.find(".models_history_standard_shortcut_pic").addClass('display_none');
			elem.find(".models_history_standard_shortcut_ico").removeClass('display_none').find("i").addClass(app_models_fileType.getClass(this.ext));
			
		}else
		{
			elem.find(".models_history_standard_shortcut_ico").addClass('display_none');
			elem.find(".models_history_standard_shortcut_pic")
					.removeClass('display_none')
					.css('background-image','url("'+ this.preview +'")')
					.attr("preview", "1");
		}
	}
}

UploadingContentCls.prototype.feed_action = function(elem,subm)
{
	
}


/*
* chatFeed
*/
var historyFeed = function(id,type,position,submenu)
{
	this.max_id;
	this.id = id;
	this.type = type;
	this.position = position;
	this.submenu = submenu;
	this.has_today = false;

	this.page_count = 15;
	this.current_page = 0 ;

	this.current = null;
	this.pre = {
		att: null,
		by: null,
		cod: null,
		id: null,
		type: null,
		timestamp: null,
	};

	var data = this.app_chat_feed_data_init();
	data = this.app_chat_feed_timeline(data);

	this.records = data ;
	this.create_iscroll_container();
	this.app_chat_feed_layer_display();
	this.app_chat_feed_temp_history();
	this.app_chat_feed_recall_init();

	that = this;

	var loading = false;
	wrapper_IScroll_cb_creation[that.position.prop('id')] = function(){
		var IScroll = myIScrollList[that.position.prop('id')];
		IScroll.on('scrollEnd', function(){
			if(this.y == 0 && !loading){
				that.position.find(".models_history_loading").remove();
				var first_li = that.position.find('li').eq(0);
				that.app_chat_feed_layer_display();
				IScroll.refresh();
				IScroll.scrollToElement(first_li.get(0), 0, 0, -30);
				loading = false;
			}
		});
	}


}


historyFeed.prototype.app_chat_feed_timeline = function(data)
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

historyFeed.prototype.create_iscroll_container = function()
{
	this.position.addClass('overthrow').addClass("submenu_chat_contents");
	this.position.empty();
	$('<div>').addClass('chat_contents_wrapper').prop('id', this.submenu.id+'_chat_contents_wrapper').appendTo(this.position).append($('#'+'-help_iscroll').clone().prop('id',this.submenu.id+'_help_iscroll'));
}

historyFeed.prototype.app_chat_feed_data_history = function()
{
	var data = this.type == 'history' ? 
			Lincko.storage.hist(null, null , {att:['!=','recalled_by']}, 'projects',this.id, true)
			: Lincko.storage.list(null, null, {_type:'messages'}, 'chats', this.id, true);
	return data;
}

historyFeed.prototype.app_chat_feed_data_format = function(data)
{
	var records = [];
	
	for(var i in data)
	{
		this.current = data[i];
		if(
			   this.type == 'history'
			&& this.pre.cod !== null
			&& this.current.att === this.pre.att
			&& this.current.by === this.pre.by
			&& this.current.cod === this.pre.cod
			&& this.current.id === this.pre.id
			&& this.current.type === this.pre.type
			&& this.current.timestamp > this.pre.timestamp - (4*3600) //Need 4H gap
		){
			continue;
		}
		if (this.type == 'history'){
			this.pre = {
				att: this.current.att,
				by: this.current.by,
				cod: this.current.cod,
				id: this.current.id,
				type: this.current.type,
				timestamp: this.current.timestamp,
			};
		}
		var item = new BaseItemCls(data[i],this.type);
		if(item.style != '' && item.data.category !='')
		{
			records.push(item);
		}
	}
	return records;
}

historyFeed.prototype.app_chat_feed_data_cache = function()
{
	if(typeof app_models_cache_history[this.type + '_' + this.id] === 'undefined')
	{
		var data = this.app_chat_feed_data_history();
		var records = this.app_chat_feed_data_format(data);
		var last_time =  records.length > 0 ? records[0]['timestamp'] : 0 ;
		app_models_cache_history[this.type + '_' + this.id] =
		{
			'data'				: records,
			'last_time'			: last_time,
			'running_last_time' : last_time,
		} 
	}
	else
	{
		app_models_cache_history[this.type + '_' + this.id]['running_last_time'] = app_models_cache_history[this.type + '_' + this.id]['last_time'];
	}
	return app_models_cache_history[this.type + "_" + this.id];
}


historyFeed.prototype.app_chat_feed_data_running = function()
{
	var last_time = 0;
	if(typeof app_models_cache_history[this.type + '_' + this.id] !== 'undefined')
	{
		last_time = app_models_cache_history[this.type + '_' + this.id]['running_last_time'];
	}

	var data = this.type == 'history'  ? 
			Lincko.storage.hist(null, null , last_time == 0 ? {att:['!=','recalled_by']} : {att:['!=','recalled_by'],timestamp: [">=", last_time]}, 'projects', this.id, true)
			: Lincko.storage.list(null, null , last_time == 0 ? null : {'created_at': [">=", last_time]}, 'chats', this.id, true);
	if(data.length>0)
	{
		var key = this.type == 'history' ? 'timestamp' : 'created_at' ;
		app_models_cache_history[this.type + '_' + this.id]['running_last_time'] = data[0][key];
	}
	return data;
}

historyFeed.prototype.app_chat_feed_data_init = function()
{
	var cache = this.app_chat_feed_data_cache();
	var no_cache = this.app_chat_feed_data_format(this.app_chat_feed_data_running());
	if(no_cache.length > 0)
	{
		var records = [];
		for(var i in cache['data'])
		{
			if(cache['data'][i]['timestamp'] !=  cache['last_time'])
			{
				records.push(cache['data'][i]);
			}
		}
		app_models_cache_history[this.type + '_' + this.id]['data'] = records;
	}
	return no_cache.concat(app_models_cache_history[this.type + '_' + this.id]['data']);
}

historyFeed.prototype.app_chat_feed_layer_display = function()
{
	if(this.current_page * this.page_count < this.records.length )
	{
		if(this.position.find('.models_history_loading').length>0)
		{
			this.position.find('.models_history_loading').recursiveRemove();
		}
		var last_page_index = (this.current_page + 1) * this.page_count  - 1;
		for(var i = this.current_page * this.page_count; i <= last_page_index && i < this.records.length ;i ++ )
		{

			this.records[i]['lazy'] = (i == last_page_index && i < this.records.length);
			this.records[i].item_display(this.position,this.submenu,'history');
		}
		this.current_page ++ ;
	}
	
}

historyFeed.prototype.app_chat_feed_temp_history = function()
{
	var that = this;
	$.each(app_models_chats_send_queue,function(key,data){
		if(data.parent_id == that.id && data.parent_type == that.type)
		{
			data.data.item_display(that.position,that.submenu,'insert');
		}	
	});
}

historyFeed.prototype.app_chat_feed_send_msg = function(data)
{
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


historyFeed.prototype.app_chat_feed_load_recent = function()
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

historyFeed.prototype.app_chat_feed_uploading_file = function()
{
	var _type= ( this.type == "history" ? "projects":"chats" );
	var files = app_upload_files.lincko_files;

	var user_name = Lincko.storage.get('users', wrapper_localstorage.uid,'username') ;
	var profile = Lincko.storage.getLinkThumbnail(Lincko.storage.get("users", wrapper_localstorage.uid, 'profile_pic'));
	if(!profile){
		profile = app_application_icon_single_user.src;
	}

	for(var i in files)
	{
		if(files[i].lincko_parent_type != _type || files[i].lincko_parent_id != this.id ) {continue;}
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
		};
		this.has_today = true;

		var item = new BaseItemCls(record);
		var temp_elem_id = this.submenu.id + '_uploading_file_models_thistory_' + record['temp_id'];

		var mode = $('#'+temp_elem_id).length > 0 || (files[i].lincko_progress >= 100 && files[i].lincko_status == 'done') ? 'refresh' : 'insert' ;
		item.item_display(this.position,this.submenu,mode);
	}
}

historyFeed.prototype.app_chat_feed_recall_init = function()
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




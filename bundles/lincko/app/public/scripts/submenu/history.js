/* Category 31 */
var BaseItemCls = function(record,type, disableActionClick)
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
			} else if(record["by"]==0){ //LinckoBot
				this.profile = app_application_icon_roboto.src;
			} else if(record["by"]==1){ //MonkeyKing
				this.profile = app_application_icon_monkeyking.src;
			}
			this.timestamp = record["timestamp"];
			if(record['type'] == 'comments' && record['par_type'] == 'projects')
			{
				this.style = (record['by'] == 0 || record['by'] == 1) ? 'report' : 'comment';
			}
			else
			{
				if(Lincko.storage.get(record['type'], record['id'],'category') == 'voice'){
					this.style = 'audio';
				}else{
					this.style = 'activity';
				}
			}
			break;
		case "chats" :
			this.user_id = record["created_by"];
			this.user_name = Lincko.storage.get('users', record["created_by"] ,'username');
			this.profile = Lincko.storage.getLinkThumbnail(Lincko.storage.get("users", record["created_by"],'profile_pic'));
			if(!this.profile){
				this.profile = app_application_icon_single_user.src;
			} else if(record["created_by"]==0){ //LinckoBot
				this.profile = app_application_icon_roboto.src;
			} else if(record["created_by"]==1){ //MonkeyKing
				this.profile = app_application_icon_monkeyking.src;
			}
			this.timestamp = record["created_at"];
			if(record['_type'] == 'files'){
				if(record['category'] == 'voice'){
					this.style = 'audio';
				}
				else{
					this.style = 'file';
				}
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

	if(typeof disableActionClick != 'boolean'){
		var disableActionClick = false;
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
			this.data.disableActionClick = disableActionClick;
			break;
		case 'audio' :
			this.data = new AudioContentCls(record,type);
			break;
		case 'file' :
			this.data = new FileContentCls(record,type);
			this.data.disableActionClick = disableActionClick;
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
		case 'audio' :
			template = '-models_history_audio' ;
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


BaseItemCls.prototype.item_display = function(position, subm, mode, scroll_time)
{
	if(typeof scroll_time == "undefined"){ scroll_time = 300; }
	var template = this.template_render();
	var elem_id = subm.id + '_' + this.data.category + '_models_thistory_' + this.data.id 
				+ (typeof this.data.hist !== 'undefined' && this.data.hist != 0 ?  '_'+ this.data.hist : '');
	var elem = $('#' + template).clone();
	elem.prop('id',elem_id);
	elem.attr('item', this.data.category+'_'+this.data.id);

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

		if(this.user_id == 0){ //LinckoBot
			elem.find("[find=icon]").css('border-color', 'transparent');
			elem.find("[find=icon]").css('background-image','url("' +  app_application_icon_roboto.src + '")');
			elem.find("[find=author]").html(Lincko.Translation.get('app', 0, 'html'));  //LinckoBot

			elem.find("[find=icon]").attr("title",Lincko.Translation.get('app', 0, 'html'));
			elem.find("[find=author]").attr("title",Lincko.Translation.get('app', 0, 'html'));
		} else if(this.user_id == 1){ //MonkeyKing
			elem.find("[find=icon]").css('border-color', 'transparent');
			elem.find("[find=icon]").css('background-image','url("' +  app_application_icon_monkeyking.src + '")');
			elem.find("[find=author]").html(Lincko.Translation.get('app', 67, 'html')); //Monkey King

			elem.find("[find=icon]").attr("title",Lincko.Translation.get('app', 1, 'html'));
			elem.find("[find=author]").attr("title",Lincko.Translation.get('app', 1, 'html'));
		} else {
			var profile =  Lincko.storage.getLinkThumbnail(Lincko.storage.get("users",this.user_id , 'profile_pic'));
			elem.find("[find=icon]").css('background-image','url("' + this.profile + '")');
			var user_name = Lincko.storage.get('users', this.user_id ,'username');
			elem.find("[find=author]").text(user_name);

			elem.find("[find=icon]").attr("title",user_name);
			elem.find("[find=author]").attr("title",user_name);
		}
		var date = new wrapper_date(this.timestamp);
		elem.find(".time", "[find=timestamp]").html(date.display('time_short'));
		elem.find(".date", "[find=timestamp]").html(skylist_textDate(date) || date.display('date_short'));

		//add contenteditable for focus control, since now we have quick action popup for files
		// if(this.style == 'file'){
		// 	elem.find('.models_history_content').append('<div contenteditable="false" tabindex="1"></div>');
		// }

		this.feed_profile_action(elem,this.user_id,subm);
		this.feed_content(elem, subm);
		if(this.style == 'activity' || this.style == 'audio' || this.style == 'file' || this.style == 'upload') this.feed_action(elem,subm);
	}

	var timestamp = parseInt(this.timestamp, 10);
	var timeline = new wrapper_date(this.timestamp).getDayStartTimestamp();

	//Keep a record of the earliest timeline of the submenu to know
	if(typeof subm.param.earliest_timeline == 'undefined'){
		subm.param.earliest_timeline = 0;
	}

	//Keep a record of the earliest message of the submenu to know
	if(typeof subm.param.earliest_msg == 'undefined'){
		subm.param.earliest_msg = 0;
	}


	switch (mode)
	{
		case 'history' :
			elem.prependTo(position.find(".chat_contents_wrapper"));
			if(this.lazy)
			{
				var loading_elem =  $("#-models_history_loading").clone();
				loading_elem.removeAttr('id');
				loading_elem.addClass('models_history_loading_hide');
				elem.before(loading_elem);
			}
			if(typeof subm.param.prev_timeline == 'undefined'){
				subm.param.prev_timeline = timeline;
			} else if(timeline < subm.param.prev_timeline){
				//Create the line first
				var line = $("#-models_history_line").clone();
				line.prop('id','');
				var w_date = new wrapper_date(subm.param.prev_timeline);
				if (w_date.happensToday()) {
					line.find(".history_time").html(Lincko.Translation.get('app', 3302, 'html').toUpperCase()); //Today
				} else if (w_date.happensSomeday(-1)) {
					line.find(".history_time").html(Lincko.Translation.get('app', 3304, 'html').toUpperCase()); //Yesterday
				} else {
					line.find(".history_time").html(new wrapper_date(subm.param.prev_timeline).display('date_very_short')); // Oct 28
				}
				subm.param.prev_timeline = timeline;
				elem.after(line);
			}
			if(timeline > subm.param.earliest_timeline){
				subm.param.earliest_timeline = timeline;
			}
			break;
		case 'insert' :
			if($('#'+elem_id).length==0)
			{
				var help = $('#' + subm.id + '_help_iscroll');
				help.before(elem);
				if(timeline > subm.param.earliest_timeline){
					var line = $("#-models_history_line").clone();
					line.prop('id','');
					var w_date = new wrapper_date(timeline);
					if (w_date.happensToday()) {
						line.find(".history_time").html(Lincko.Translation.get('app', 3302, 'html').toUpperCase()); //Today
					} else if (w_date.happensSomeday(-1)) {
						line.find(".history_time").html(Lincko.Translation.get('app', 3304, 'html').toUpperCase()); //Yesterday
					} else {
						line.find(".history_time").html(new wrapper_date(timeline).display('date_very_short')); // Oct 28
					}
					elem.before(line);
					subm.param.earliest_timeline = timeline;
				}
			}
			var overthrow_id = "overthrow_"+subm.id;
			var help_iscroll_elem =  $('#'+subm.id+'_help_iscroll').get(0);

			if(myIScrollList[overthrow_id] && help_iscroll_elem){
				if(myIScrollList[overthrow_id].maxScrollY - myIScrollList[overthrow_id].y > -100){
					if(!supportsTouch || responsive.test("minDesktop")){ scroll_time = 300; }
					app_submenu_scrollto(myIScrollList[overthrow_id], help_iscroll_elem, scroll_time);
				}
				myIScrollList[overthrow_id].refresh();
			}
			break;
		case 'change' :
				var temp_elem_id = subm.id + '_' + this.data.category + '_models_thistory_' + this.data.temp_id 
				+ (typeof this.data.hist !== 'undefined' && this.data.hist != 0 ?  '_'+ this.data.hist : '');
				if(this.data.category == 'comments' || this.data.category == 'messages' || this.data.category == 'files')
				{
					$('#'+temp_elem_id).attr(this.data.category + '_id',this.data.id);
					$('#'+temp_elem_id).removeAttr('temp_id');
					if(this.data.category == 'files')
					{
						$('#'+temp_elem_id).find('.app_models_lincko_audio').attr('audio_id',this.data.id)
						$('#'+temp_elem_id).find('.app_models_lincko_audio').removeAttr('data');
						$('#'+temp_elem_id).find('[find=lazy]').remove();
					}
				}
				$('#'+temp_elem_id).prop('id',elem_id);
			break;
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
			this.feed_content(elem, subm);
			break;
		default :
			break;
	}
		
	
	if(timeline > subm.param.earliest_timeline){
		subm.param.earliest_timeline = timeline;
	}
	if(timestamp > subm.param.earliest_msg){
		subm.param.earliest_msg = timestamp;
	}

	subm.param.last_msg = this;
	
}

BaseItemCls.prototype.feed_profile_action = function(elem,userid,subm)
{
	elem.find("[find=icon]").click(userid,function(event){
		submenu_Build("personal_info", subm.layer + 1, false, event.data, subm.preview);
	});
}

BaseItemCls.prototype.feed_content = function(elem, subm)
{
	this.data.feed_content(elem, subm);
}

BaseItemCls.prototype.feed_action = function(elem,subm)
{
	this.data.feed_action(elem,subm);
}

var AudioContentCls = function(record,type)
{
	if(type=="chats" || type == "history")
	{
		this.id = typeof record['par'] == 'undefined' ? record['_id'] :  record['id'] ;
		this.category =  typeof record['par'] == 'undefined' ? record['_type'] :  record['type'] ;
		this.target = Lincko.storage.get(this.category , this.id, 'name');
		this.file_category = Lincko.storage.get(this.category, this.id,'category');
		this.file_profile =  Lincko.storage.getLinkThumbnail(this.id);
		this.ext = Lincko.storage.get(this.category, this.id,'ori_ext');
		this.temp_id =  Lincko.storage.get(this.category , this.id, 'temp_id');
	}
	else
	{
		this.id =  record['id'];
		this.category = 'files';
		this.temp_id  = record['id'];
		this.content = record['content'];
		this.duration = record['duration'];
	}
}

AudioContentCls.prototype.feed_content = function(elem)
{
	elem.attr('category',this.category);
	if(typeof this.content !== "undefined"){
		elem.attr('data',this.duration);
		elem.attr('data',this.content);
		elem.find('[find=audio_containner]').append(app_models_audio.build(this.id,this.content,this.duration));
	}
	else{
		elem.attr(this.category + '_id',this.id);
		elem.find('[find=audio_containner]').append(app_models_audio.build(this.id));
	}
	elem.find('[find=audio_containner]').addClass('models_history_audio');
	
	if(elem.hasClass('models_history_self'))
	{
		elem.find('[find=play]').removeClass('icon-audio').addClass('icon-audioopposite');
	}
}

AudioContentCls.prototype.feed_action = function(elem,subm){

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
	elem.attr('category',this.category);
	elem.attr(this.category + '_id',this.id);

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
	if(that.disableActionClick){ return; } //dont add click event if disabled
	elem.find("[find=shortcut]").click({'subm':subm,'type':that.category,'target_id':that.id,'file_category':that.file_category},function(event){
		event.stopPropagation();
		var subm = event.data.subm;
		var target_id =  event.data.target_id;
		var type =  event.data.type;
		var file_category = event.data.file_category;
		if(file_category =='image') {
			previewer['pic'](target_id);
		}else if( file_category =='video'){
			previewer['video'](target_id);
		}else if( file_category =='audio'){
			previewer['audio'](target_id);
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
	var item = Lincko.storage.get('comments',record['id']);
	this.content = item['+comment'];
	if(app_models_resume_format_sentence(this.id) == false)
	{
		this.category = '';
	}
}

ReportContentCls.prototype.feed_content = function(elem, subm)
{
	var content = app_models_resume_format_sentence(this.id, 1, subm);
	if(content.hasClass("onboarding"))
	{
		var obj = JSON.parse(this.content);
		var onboarding = Lincko.storage.getOnboarding();
		if(typeof onboarding.comments != 'undefined')//evan.question
		{
			if(typeof  onboarding.comments[1] != 'undefined')
			{
				var comment_id = onboarding.comments[1];
				if(this.id == comment_id)//quick create a task
				{
					elem.attr('comments_id',this.id);
					elem.attr('category',this.category);
				}
			}
		}
		elem.attr('onboarding_id',this.id);
		elem.find(".models_history_content").addClass("onboarding");
	}
	else if(content.hasClass("report"))
	{
		elem.find(".models_history_content").addClass("report");
	}

	
	
	var regExp = new RegExp("^<img[^>]+src\\s*=\\s*['\"]([^'\"]+)['\"][^>]*>$", "gi");
	if(content.html().match(regExp))
	{
		elem.addClass("remove_bg");
	}

	elem.find("[find=content]").append(content);
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
	elem.find("[find=content]").append(base_lincko_tag_to_html(wrapper_to_html(app_models_resume_format_answer(this.content))));
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
	if(typeof clone_hist.par == 'undefined'){
		clone_hist.par = {};
	}
	clone_hist.par.un = '';
	if(history.prev){
		this.prev = Lincko.Translation.get('app', 102, 'html')+': '+history.prev;
	}
	this.action = Lincko.storage.formatHistoryInfo(text, clone_hist) + ':&nbsp;';
}

ActivityFileContentCls.prototype.feed_content = function(elem)
{
	elem.attr('category',this.category);
	elem.attr(this.category + '_id',this.id);
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
	if(this.prev){
		elem.find("[find=previous]").removeClass('display_none').html(this.prev);
	}
}

ActivityFileContentCls.prototype.feed_action = function(elem,subm){
	var that = this;
	if(that.disableActionClick){ return; } //dont add click event if disabled
	elem.find("[find=shortcut]").click({'subm':subm,'type':that.category,'target_id':that.id,'file_category':that.file_category},function(event){
		var subm = event.data.subm;
		var target_id =  event.data.target_id;
		var type =  event.data.type;
		var file_category = event.data.file_category;
		if(file_category =='image') {
			previewer['pic'](target_id);
		}else if( file_category =='video'){
			previewer['video'](target_id);
		}else if( file_category =='audio'){
			previewer['audio'](target_id);
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
	if(typeof record['hist'] != 'undefined'){
		this.hist = record['hist'];
	}
	this.id = record['id'];
	this.category = record['type'];
	this.target_id =  record['id'];
	this.target = Lincko.storage.get(record['type'] , record['id'], 'title');
	var history = Lincko.storage.getHistoryInfo(record);
	var clone_hist = $.extend(true, {}, history.root.history);
	var text = history.root.title;
	if(typeof clone_hist.par == 'undefined'){
		clone_hist.par = {};
	}
	clone_hist.par.un = '';
	if(history.prev){
		this.prev = Lincko.Translation.get('app', 102, 'html')+': '+history.prev; //Previous
	}
	this.action = Lincko.storage.formatHistoryInfo(text, clone_hist) + ':&nbsp;';
}

ActivityContentCls.prototype.feed_content = function(elem)
{
	elem.find("[find=target]").html(this.target);
	elem.find("[find=action]").html(wrapper_to_html($.trim(this.action).ucfirst()));
	if(this.prev){
		elem.find("[find=previous]").removeClass('display_none').html(this.prev);
	}
}

ActivityContentCls.prototype.feed_action = function(elem,subm)
{
	var that = this;
	if(that.disableActionClick){ return; } //dont add click event if disabled
	if(this.category != 'projects')
	{

		elem.find("[find=target]").click({'subm':subm,'type':that.category,'target_id':that.target_id},
			function(event){
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
	if(typeof clone_hist.par == 'undefined'){
		clone_hist.par = {};
	}
	clone_hist.par.un = '';
	if(history.prev){
		this.prev = Lincko.Translation.get('app', 102, 'html')+': '+history.prev; //Previous
	}
	this.action = Lincko.storage.formatHistoryInfo(text, clone_hist) + ':&nbsp;';
}

ActivityCommentContentCls.prototype.feed_content = function(elem)
{
	elem.find("[find=target]").html(this.target);
	elem.find("[find=action]").html(wrapper_to_html($.trim(this.action).ucfirst()));
	if(this.prev){
		elem.find("[find=previous]").removeClass('display_none').html(this.prev);
	}
}

ActivityCommentContentCls.prototype.feed_action = function(elem,subm)
{
	var that = this;
	if(that.disableActionClick){ return; } //dont add click event if disabled
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
	this.index = record['index'];
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
		elem.attr('index',this.index);
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
	if(elem)
	{
		var index = elem.attr('index');
		elem.find(".uploading_action").click(index,function(e){
			var index = e.data;
			if(app_upload_files.lincko_files[index]){
				app_upload_files.lincko_files[index].lincko_status = 'abort';
				app_upload_files.lincko_files[index].abort();//Force to reinitialize before any start
				var e; //undefined
				$('#app_upload_fileupload').fileupload('option').destroy(e, app_upload_files.lincko_files[index]);
			}
			elem.recursiveRemove();
		});
	}
	
}


/*
* chatFeed
*/
var historyFeed = function(id, type, position, submenu, start_at)
{
	this.max_id;
	this.id = id;
	this.type = type;
	this.position = position;
	this.submenu = submenu;
	this.has_today = false;

	this.page_count = 15;
	this.current_page = 0;
	this.page_top = false;
	this.get_all = false;

	//Don't display anything before this timestamp (usually chat and project creation)
	if(typeof start_at == 'undefined'){ start_at = 0; }
	this.start_at = start_at;

	this.current = null;
	this.pre = {
		att: null,
		by: null,
		cod: null,
		id: null,
		type: null,
		timestamp: null,
	};

	this.records = this.app_chat_feed_timeline(this.app_chat_feed_data_init());
	this.create_iscroll_container();
	this.app_chat_feed_layer_display();
	this.app_chat_feed_temp_history();
	this.app_chat_feed_recall_init();

	var that = this;
	this.loading_timer = false;
	this.allow_scrollEnd = true;
	wrapper_IScroll_cb_creation[that.position.prop('id')] = function(){
		
		var IScroll = myIScrollList[that.position.prop('id')];
		var events_list = [
			'wheel',
			'mousewheel',
			'DOMMouseScroll',
		];
		for(var i in events_list){
			that.position.on(events_list[i], IScroll, function(event){
				that.allow_scrollEnd = false;
				setTimeout(function(allow_scrollEnd){
					allow_scrollEnd = true;
				}, 800, that.allow_scrollEnd); //time for scrollEnd is fixed to 400ms
				if(!that.get_all && !that.loading_timer){
					if(IScroll.y >= 0){
						that.position.find(".models_history_loading").removeClass('models_history_loading_hide');
					} else if(IScroll.y < -30){
						that.position.find(".models_history_loading").addClass('models_history_loading_hide');
					}
					
					that.loading_timer = setTimeout(function(IScroll){
						if(IScroll && IScroll.y >= 0){
							that.position.find(".models_history_loading").remove();
							if(!this.get_all){
								that.records = that.app_chat_feed_timeline(that.app_chat_feed_data_init());
							}
							var first_li = that.position.find('li').eq(0); //Grab old first li element
							that.app_chat_feed_layer_display();
							IScroll.refresh();
							if(first_li.length>0){
								IScroll.scrollToElement(first_li.get(0), 0, 0, -30);
							}
						}
						clearTimeout(that.loading_timer);
						that.loading_timer = false;
					}, 100, event.data);
				}
			});

			IScroll.on('scrollEnd', function(){
				if(!that.get_all && !that.loading_timer && that.allow_scrollEnd){
					if(IScroll.y >= 0){
						that.position.find(".models_history_loading").removeClass('models_history_loading_hide');
					} else if(IScroll.y < -30){
						that.position.find(".models_history_loading").addClass('models_history_loading_hide');
					}
					that.loading_timer = setTimeout(function(IScroll){
						if(IScroll && IScroll.y >= 0){
							that.position.find(".models_history_loading").remove();
							if(!this.get_all){
								that.records = that.app_chat_feed_timeline(that.app_chat_feed_data_init());
							}
							var first_li = that.position.find('li').eq(0); //Grab old first li element
							that.app_chat_feed_layer_display();
							IScroll.refresh();
							if(first_li.length > 0){
								IScroll.scrollToElement(first_li.get(0), 0, 0, -30);
							}
						}
						clearTimeout(that.loading_timer);
						that.loading_timer = false;
					}, 100, this);
				}
			});
		}

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

historyFeed.prototype.app_chat_feed_data_history = function(limit)
{
	if(typeof limit == 'undefined'){
		limit = null;
	}
	var data = this.type == 'history' ? 
			Lincko.storage.hist(null, limit , {att:['!=','recalled_by']}, 'projects', this.id, true)
			: Lincko.storage.list(null, limit, {_type:'messages'}, 'chats', this.id, false);
	return data;
}

historyFeed.prototype.app_chat_feed_data_format = function(data)
{
	var records = [];
	
	for(var i in data)
	{
		this.current = data[i];
		if(this.current.timestamp < this.start_at){
			continue;
		}
		if(
			   this.type == 'history'
			&& this.pre.cod !== null
			&& this.current.att === this.pre.att
			&& this.current.by === this.pre.by
			&& this.current.cod === this.pre.cod
			&& this.current.id === this.pre.id
			&& this.current.type === this.pre.type
			&& this.current.timestamp > this.pre.timestamp - (4*3600) //Need 4H gap
			&& JSON.stringify(this.current.par) == JSON.stringify(this.pre.par)
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
				par: this.current.par,
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

historyFeed.prototype.app_chat_feed_data_cache = function(limit)
{
	if(typeof limit == 'undefined'){
		limit = null;
	}
	if(limit || typeof app_models_cache_history[this.type + '_' + this.id] == 'undefined')
	{
		var data = this.app_chat_feed_data_history(limit);
		var records = this.app_chat_feed_data_format(data);
		var last_time =  records.length > 0 ? records[0]['timestamp'] : 0 ;
		if(
			   typeof app_models_cache_history[this.type + '_' + this.id] == 'object'
			&& app_models_cache_history[this.type + '_' + this.id]['data']
			&& app_models_cache_history[this.type + '_' + this.id]['data'].length != records.length
		){
			this.get_all = true;
		}

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
			: Lincko.storage.list(null, null , last_time == 0 ? null : {'created_at': [">=", last_time]}, 'chats', this.id, false);
	if(data.length>0)
	{
		var key = this.type == 'history' ? 'timestamp' : 'created_at' ;
		app_models_cache_history[this.type + '_' + this.id]['running_last_time'] = data[0][key];
	}
	return data;
}

historyFeed.prototype.app_chat_feed_data_init = function()
{
	var limit = null;
	//var limit = (this.current_page+1) * this.page_count; //If we enable this line makes no use of cache, and slighlty slower opening (still have scrolling issue), but do less calculation so it avoid iOS crashes
	var cache = this.app_chat_feed_data_cache(limit);
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
	var more = false;
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
			if(this.records[i]['lazy']){
				more = true;
			}
			this.records[i].item_display(this.position,this.submenu,'history');
		}
		this.current_page ++ ;
	}
	if(!more && !this.page_top){
		//If we reach the latest message, we display the date
		if(this.records.length>0){
			var record = this.records[this.records.length-1];
			var timeline = new wrapper_date(record.timestamp).getDayStartTimestamp();
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
		}
		this.page_top = true;
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

historyFeed.prototype.app_chat_feed_send_audio = function(data){
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
		if(files[i].lincko_parent_type != _type 
			|| files[i].lincko_parent_id != this.id 
			|| files[i].lincko_param != this.submenu.id  ) {continue;}
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
			'index' : files[i].lincko_files_index,
		};
		this.has_today = true;

		var item = new BaseItemCls(record);
		var temp_elem_id = this.submenu.id + '_uploading_file_models_thistory_' + record['temp_id'];

		var mode = $('#'+temp_elem_id).length > 0 || (files[i].lincko_progress >= 100 && files[i].lincko_status == 'done') ? 'refresh' : 'insert' ;
		item.item_display(this.position, this.submenu, mode, 0);
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




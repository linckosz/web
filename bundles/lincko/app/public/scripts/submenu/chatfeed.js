/* Category 31 */

var checkExtension = function(id) {
	var PIC_EXTENSION = ['bmp', 'gif', 'png', 'apng', 'jpg', 'jpeg'];
	var VIDEO_EXTENSION = ['mp4', 'mkv', 'mov', 'xvid', 'x264', 'wmv', 'avi'];

	var file_name = Lincko.storage.get('files', id, "+name");
	if(!file_name){
		return null;
	}
	var tmp = file_name.split(".");
	var extension = tmp[tmp.length - 1].toLowerCase();
	if ($.inArray(extension, PIC_EXTENSION)>-1) {
		return 'pic';
	} else if ($.inArray(extension, VIDEO_EXTENSION)>-1) {
		return 'video';
	} else {
		return null;
	}
};

//class
function app_submenu_chatFeed() {

	this.subm = null;

	this.is_today = false;
	
	this.SHORTCUT_HANDLERS = {
		'files': function(id, elem) {
			var file = Lincko.storage.get('files', id);
			var name = Lincko.storage.get('files', id, "+name");
			var url = Lincko.storage.getLink(id);
			var thumbnail = Lincko.storage.getLinkThumbnail(id);
			var extension = checkExtension(id);
			if (extension) {
				previewer[extension](id);
				return false;
			}
			else {
				var tmp = $(elem).parents(".submenu_wrapper").prop("id").split("_");
				var preview = JSON.parse(tmp[tmp.length-1]);
				submenu_Build('taskdetail', submenu_Getposition('taskdetail',preview), null, {'type':'files', 'id':id}, preview);
				return false;
			}
		},
		'uploading_file': function(id, elem) {
			//var file = $("#uploading_file_" + id);
			/*var file = app_upload_files.lincko_files[id];
			file.abort();
			file.lincko_status = 'abort';
			$(elem).parents(".models_history_wrapper").removeClass("uploading_file").addClass("upload_stopped_file").attr("category", "upload_stopped_file");
			return false;*/
			//todo:show preview
		},
		'upload_stopped_file': function(id, elem) {
			/*var file = app_upload_files.lincko_files[id];
			file.submit();
			file.lincko_status = 'uploading';
			$(elem).parents(".models_history_wrapper").removeClass("upload_stopped_file").addClass("uploading_file").attr("category", "uploading_file");
			return false;*/
			var file = Lincko.storage.get('files', id);
			var name = Lincko.storage.get('files', id, "+name");
			var url = Lincko.storage.getLink(id);
			var thumbnail = Lincko.storage.getLinkThumbnail(id);
			var extension = checkExtension(id);
			if (extension) {
				previewer[extension](id);
				return false;
			}
			else {
				return true;
			}
		},
	};

	this.RESOURCE_ID = {
		'tasks': function(raw_id) {
			return raw_id.split('models_thistory_')[1].split('_hist_')[0];
		},
		'files': function(raw_id) {
			return raw_id.split('models_thistory_')[1].split('_hist_')[0];
		},
		'uploading_file': function(raw_id) {
			return raw_id.split("uploading_file_")[1].split('_hist_')[0];
		},
		'upload_stopped_file': function(raw_id) {
			return raw_id.split("uploading_file_")[1].split('_hist_')[0];
		},
		'comments': function(raw_id) {
			return raw_id.split('models_thistory_')[1].split('_hist_')[0];
		},
		'notes': function(raw_id) {
			return raw_id.split('models_thistory_')[1].split('_hist_')[0];
		},
	};
	
	this.RESOURCE_HANDLERS = {
		'tasks': function(taskid, elem) {
			var tmp = $(elem).parents(".submenu_wrapper").prop("id").split("_");
			var preview = JSON.parse(tmp[tmp.length-1]);
			submenu_Build('taskdetail', submenu_Getposition('taskdetail', preview), null, {'type': 'tasks', 'id': taskid}, preview);
			return false;
		},
		'files': function(fileid, elem) {
			var tmp = $(elem).parents(".submenu_wrapper").prop("id").split("_");
			var preview = JSON.parse(tmp[tmp.length-1]);
			submenu_Build('taskdetail', submenu_Getposition('taskdetail', preview), null, {'type':'files', 'id':fileid}, preview);
			return false;
		},
		'uploading_file': function(id, elem,e) {
			if (event.target.className == "uploading_action") {
				var files = app_upload_files.lincko_files;
				for(var i in files)
				{
					if(files[i].lincko_temp_id == id)
					{
						var file = app_upload_files.lincko_files[i];
						file.lincko_status = 'deleted';
						$('#app_upload_fileupload').fileupload('option').destroy(e, file);
						$(elem).parents(".models_history_wrapper").remove();
						break;
					}
				}
			}
			return false;
		},
		'upload_stopped_file': function(id, elem) {
			if (event.target.className == "uploading_action") {
				var file = app_upload_files.lincko_files[id];
				file.lincko_status = 'abort';
				file.abort();
				$(elem).parents(".models_history_wrapper").remove();
			}
			return false;
		},
		'comments': function(commentid, elem) {
			var type = $(elem).find("[find=target_type]").attr('parent');
			var p_id = $(elem).find("[find=target_type]").attr('parent_id');
			if(typeof type != "undefined" && typeof p_id != "undefined" && typeof this[type] == 'function'){
				this[type](p_id, elem);
			}
			return false;
		},
		'notes': function(noteid, elem) {
			var tmp = $(elem).parents(".submenu_wrapper").prop("id").split("_");
			var preview = JSON.parse(tmp[tmp.length-1]);
			submenu_Build('taskdetail', submenu_Getposition('taskdetail',preview), null,  {'type': 'notes', 'id': noteid}, preview);
			return false;
		}
	};

};

app_submenu_chatFeed.prototype.checkRecentDate = function(timestamp, index) {
	var RecentDate = {};
	if (index == 0) {
		RecentDate.lastDate = Math.floor(timestamp / 86400) * 86400;
		RecentDate.recentDatestamp = RecentDate.lastDate;
	}
	if (timestamp < RecentDate.recentDatestamp) {
		var old = RecentDate.recentDatestamp;
		RecentDate.recentDatestamp = Math.floor(timestamp / 86400) * 86400;
		return old;
	}
	if (index == -1) {
		if(typeof RecentDate.recentDatestamp === "undefined")
		{
			RecentDate.lastDate = Math.floor(timestamp / 86400) * 86400;
			RecentDate.recentDatestamp = RecentDate.lastDate;
		}
		return RecentDate.recentDatestamp;/*the last item*/
	}
	if(index == -2)/*new comment*/
	{
		if(RecentDate.lastDate != Math.floor(new wrapper_date().timestamp / 86400) * 86400)
		{
			RecentDate.lastDate = Math.floor(new wrapper_date().timestamp / 86400) * 86400;
			return RecentDate.lastDate;
		}
	}
	return false;
};

app_submenu_chatFeed.prototype.cutFileTitle = function(title, prefixLength, suffixLength, type) {
	if(typeof title == 'undefined')
	{
		return title;
	}

	var dotIndex = title.lastIndexOf(".");
	var fileName = title.substring(0,dotIndex);
	var extName = title.substring(dotIndex + 1,title.length);
	if(prefixLength + suffixLength >= fileName.length)
	{
		return title;
	}

	var prefix=fileName.substring(0,prefixLength);
	var suffix=fileName.substring(fileName.length-suffixLength,fileName.length);
	if(type=="files" && extName!=""){
		title = prefix + "..." + suffix + " ." + extName;
	} else {
		title = prefix + "..." + suffix;
	}
	return title;
};

app_submenu_chatFeed.prototype.renderLine = function(timestamp) {
	var lineTemplate = "-models_history_line";
	var line = $('#' + lineTemplate).clone();
	line.removeAttr('id');
	line.addClass("models_history_line");
	var date_tp = new wrapper_date(timestamp);
	var date = date_tp.display('date_very_short');
	if(date_tp.happensSomeday(0)){
		this.is_today = true;
		date = Lincko.Translation.get('app', 3302, 'html').toUpperCase(); //Today
	}
	else if(date_tp.happensSomeday(-1)){
		date = Lincko.Translation.get('app', 3304, 'html').toUpperCase(); //Yesterday
	}
	line.find('span').html(date);
	return line;
};

app_submenu_chatFeed.prototype.app_layers_history_launchPage = function(position, type, projectId, subm) {
		this.subm = subm;
		position.addClass('overthrow').addClass("submenu_chat_contents");
		position.empty();
		this.app_layers_history_feedPage(position, type, projectId);
		wrapper_IScroll_refresh();
		wrapper_IScroll();
};

app_submenu_chatFeed.prototype.app_layers_uploading_files = function(position, type, id, submenu_wrapper_id) {
	var files = app_upload_files.lincko_files;
	var _type=type=="history"?"projects":"chats";
	for(var i in files)
	{
		if(files[i].lincko_parent_type!=_type||files[i].lincko_parent_id != id) {continue;}
		if(files[i].lincko_status=="deleted")
		{
			$("#"+submenu_wrapper_id+"_uploading_file_"+files[i].lincko_temp_id).remove();
		}
		else{
			//FIXME: Only filters files inside this chats.
			
			item = {
				'name': files[i].lincko_name,
				'_type': 'uploading_file',
				'id': files[i].lincko_temp_id,
				'timestamp': Math.floor($.now()/1000),
				'created_by': wrapper_localstorage.uid,
				'index': files[i].lincko_temp_id
			};
			this.format_items(_type, [item], position, true);	
			if(files[i].lincko_progress>=100 && files[i].lincko_status === 'done'){
				$("#"+submenu_wrapper_id+"_uploading_file_"+files[i].lincko_temp_id)
					.removeClass("uploading_file")
					.addClass("uploaded_file");
			} 
			else {
				$("#"+submenu_wrapper_id+"_uploading_file_"+files[i].lincko_temp_id)
					.find("[find=progress_bar]")
					.css('width', Math.floor(files[i].lincko_progress) + '%');
				$("#"+submenu_wrapper_id+"_uploading_file_"+files[i].lincko_temp_id)
					.find("[find=progress_text]")
					.html(files[i].lincko_progress * files[i].lincko_size +" K of "+files[i].lincko_size+" KB"); //toto => translation
			}	
			try{
				if(typeof files[i].files[0].preview.tagName !== 'undefined' && files[i].files[0].preview.tagName.toLowerCase() === 'canvas'){
					$("#"+submenu_wrapper_id+"_uploading_file_"+files[i].lincko_temp_id).find(".models_history_standard_shortcut_ico").addClass('display_none');
					$("#"+submenu_wrapper_id+"_uploading_file_"+files[i].lincko_temp_id).find(".models_history_standard_shortcut_pic")
						.removeClass('display_none')
						.css('background-image','url("'+files[i].files[0].preview.toDataURL()+'")')
						.attr("preview", "1");
				}
			}catch(e){}
		}
	}
	wrapper_IScroll_refresh();
	wrapper_IScroll();
};

app_submenu_chatFeed.prototype.getRawContents = function(type, id, range) {
	if (type == 'history') {
		return Lincko.storage.hist(null, range, null, 'projects', id, true);
	}
	else {
		return Lincko.storage.list(null, range, null, 'chats', id, false);
	}
};

app_submenu_chatFeed.prototype.getHistoryPaging = function(type, position, parentId) {
	var firstIndex = parseInt(position.find('.models_history_wrapper').first().attr('index'),10) +1;
	var lastIndex = firstIndex + 20;
	var newRange = firstIndex + "-" + lastIndex;
	var items = this.getRawContents(type, parentId, newRange);
	$('<div>').addClass('chat_contents_wrapper').prop("id", this.subm.id+'_chat_contents_wrapper').appendTo(position);
	this.format_items(type, items, position, false, false);
};

app_submenu_chatFeed.prototype.app_layers_history_feedPage = function(position, type, parentId) {
	var items = this.getRawContents(type, parentId, null);
	$('<div>').addClass('chat_contents_wrapper').prop("id", this.subm.id+'_chat_contents_wrapper').appendTo(position);
	this.format_items(type, items, position, false, false);
};

app_submenu_chatFeed.prototype.format_items = function(type, items, position, newone) {
	var pre = {
		att: null,
		by: null,
		cod: null,
		id: null,
		type: null,
		timestamp: null,
	};
	var pre_timestamp;
	var current;
	var groups;
	var Elem;
	var that = this;
	var today = (new wrapper_date()).getDayStartTimestamp();

	if(newone)
	{
		groups = {};
		groups[today] = items;
	}
	else
	{
		groups = this.items_group_by_time(items, type);
	}
	//Sort group by time from recent to older
	var temp = Object.keys(groups).sort(function(a, b) {
		return b - a;
	});
	for(var i in temp)
	{
		var timestamp = temp[i];
		for(var j in groups[timestamp])
		{
			current = groups[timestamp][j];
			//If similar modification
			if(
				   type == 'history'
				&& pre.cod !== null
				&& current.att === pre.att
				&& current.by === pre.by
				&& current.cod === pre.cod
				&& current.id === pre.id
				&& current.type === pre.type
				&& current.timestamp > pre.timestamp - (4*3600) //Need 4H gap
			){
				continue;
			}
			if (type == 'history'){
				pre = {
					att: current.att,
					by: current.by,
					cod: current.cod,
					id: current.id,
					type: current.type,
					timestamp: current.timestamp,
				};
			}
			var item = new BaseHistoryCls(current, that);
			item.setTemplate(type);
			if (type == 'history'){
				Elem = item.renderHistoryTemplate(timestamp+""+j);
			}
			else
			{
				Elem = item.renderChatTemplate(timestamp+""+j); //toto => what is the index?
			}
			if(Elem)
			{
				if(newone)
				{
					Elem.appendTo(position.find(".chat_contents_wrapper"));
					if(type == 'history'){
						Elem.attr('temp_id', current.id);
					} else {
						Elem.attr('temp_id', current._id);
					}
				}
				else
				{
					Elem.prependTo(position.find(".chat_contents_wrapper"));
				}
			}
		}

		if(newone && Elem && !this.is_today)
		{
			var line = this.renderLine(timestamp);
			Elem.before(line);
		}
		else if(!newone && Elem)
		{
			var line = this.renderLine(timestamp);
			line.prependTo(position.find(".chat_contents_wrapper"));
		}

	}
};

app_submenu_chatFeed.prototype.items_group_by_time = function(items, type) {
	var groups = {};
	var item_timestamp;
	var time_temp;
	var date = new wrapper_date();
	for(var i in items){
		if( //Exclude main object
			   typeof this.subm.param.type != 'undefined'
			&& typeof this.subm.param.id != 'undefined'
			&& this.subm.param.type == items[i].type
			&& this.subm.param.id == items[i].id
		){
			continue;
		}
		if (items[i].type == "comments"){
			var root = Lincko.storage.getRoot('comments', items[i].id);
			target = root['+title'];
			var target_type = root['_type'];
			if (root._type == 'chats'){continue;}
		}

		if(type == "history"){
			time_temp = items[i].timestamp;
		} else {
			time_temp = items[i].created_at;
		}
		item_timestamp = date.getDayStartTimestamp(time_temp);
		if(typeof groups[item_timestamp] == 'undefined'){
			groups[item_timestamp] = [];
		}
		groups[item_timestamp].push(items[i]);
	}
	return groups;
};

app_submenu_chatFeed.prototype.updateRecalled = function(parentType, parentID, position, chatType) {
	var that = this;
	var items_recalled = Lincko.storage.list('comments', null, {recalled_by:['>',null]}, parentType, parentID, false);
	$.each(items_recalled, function(i, val){
		var item = val;
		var toReplace = position.find('[comment_id='+item._id+']');
		if(toReplace && !toReplace.hasClass('models_history_comment_recalled')){
			var replaceWith = new BaseHistoryCls(item, that);
			replaceWith.setTemplate();
			replaceWith = replaceWith.renderChatTemplate(null,true);
			toReplace.before(replaceWith);
			toReplace.remove();
		}
	});
};

app_submenu_chatFeed.prototype.updateTempComments = function(parentType, parentID, position, chatType) {
	var that = this;
	var elem_comments = position.find('[temp_id]');
	$.each(elem_comments, function(i,val){
		var elem = $(val);
		var temp_id = elem.attr('temp_id');
		var item_real = Lincko.storage.list('comments', 1, {temp_id:temp_id}, parentType, parentID, false);
		if(item_real.length <= 0){
			return true;	
		}
		var replaceWith = (new BaseHistoryCls(item_real[0], that));
		replaceWith.setTemplate("chats");
		replaceWith = replaceWith.renderChatTemplate(null, true);
		elem.before(replaceWith);
		elem.removeAttr('temp_id');
		elem.remove();
	});
};

app_submenu_chatFeed.prototype.updateTempUploads = function(parentType, parentID, position, chatType) {
	var that = this;
	var elem_uploadings = position.find('[_file_id]');
	$.each(elem_uploadings, function(i,val){
		var elem = $(val);
		var _file_id = elem.attr('_file_id');
		var item_real = Lincko.storage.list('files', 1, {temp_id:_file_id}, parentType, parentID, false);
		if(item_real.length <= 0){
			return true;	
		}
		var replaceWith = (new BaseHistoryCls(item_real[0], that));
		replaceWith.setTemplate("chats");
		replaceWith = replaceWith.renderChatTemplate(null, true);
		if(chatType!='history'){
			elem.before(replaceWith);
		}
		elem.remove();
	});
};



function BaseHistoryCls(item, chatFeed) {
	this.item = item;
	this.chatFeed = chatFeed;
}











BaseHistoryCls.prototype.renderChatTemplate = function(index, replace) {
	var target;
	var action;
	var progress;
	var that = this;

	var Elem = $("#" + this.templateType).clone();
	if (this.item._type == "uploading_file") {
		var Elem_id = that.chatFeed.subm.id+"_uploading_file_"+this.item.index;
		Elem.attr('_file_id',this.item.id);
	} else {
		var Elem_id = that.chatFeed.subm.id+"_"+this.item._type+'_models_thistory_' + this.item._id;
	}

	//Do not duplicate chat messages (unless it is trying to replace the existing element e.g. during updateRecall)
	if($("#"+Elem_id).length>0){
		if(replace){
			$("#"+Elem_id).remove();
		} else {
			return false;
		}
	}
	Elem.prop('id', Elem_id);
	Elem.attr('comment_id',this.item._id);

	if(this.item.recalled_by){ //if comment was recalled
		if(this.item["timestamp"]){
			var timestamp = this.item["timestamp"];
		} else if(this.item["created_at"]){
			var timestamp = this.item["created_at"];
		}
		timestamp = new wrapper_date(timestamp);
		Elem.find("[find=timestamp]").html(timestamp.display('time_short'));
		var uname = wrapper_to_html(Lincko.storage.get('users', this.item.created_by)['-username']);
		Elem.find("[find=msg]").text(Lincko.Translation.get('app', 3101, 'html', {username: uname })); //has recalled a message
	}
	else{
		if (this.item._type == "uploading_file") {
				Elem.addClass("files");
		}
		else if (this.item._type == "files") {
			Elem.addClass("uploaded_file");
		}

		Elem.addClass(this.decoratorClass);
		Elem.addClass(this.item._type);
		Elem.attr('index', index);

		var img = Lincko.storage.getLinkThumbnail(Lincko.storage.get("users", this.item.created_by, 'profile_pic'));
		if(!img){
			img = app_application_icon_single_user.src;
		}

		Elem.find("[find=icon]").click(this.item.created_by, function(event){
			submenu_Build("personal_info", that.chatFeed.subm.layer+1, true, event.data, that.chatFeed.subm.preview);
		});

		Elem.find("[find=icon]").css('background-image','url("'+img+'")'); //toto => this slow down the paint of submenu 
		var uname = Lincko.storage.get('users', this.item.created_by)['-username'];
		Elem.find("[find=author]").text(wrapper_to_html(uname));
		Elem.find("[find=content]").html(wrapper_to_html(this.item['+comment']));
		if(this.item["timestamp"]){
			var timestamp = this.item["timestamp"];
		} else if(this.item["created_at"]){
			var timestamp = this.item["created_at"];
		}
		var date = new wrapper_date(timestamp);
		Elem.find(".time", "[find=timestamp]").html(date.display('time_short'));
		Elem.find(".date", "[find=timestamp]").html(date.display('date_short'));

		Elem.find("[find=target]").addClass("upload_file_title").html(that.chatFeed.cutFileTitle(this.item[(this.item._type == "files"?"+name":"name")], 10, 0, this.item._type));
		Elem.find("[find=progress_bar]").width("0%");
		Elem.find("[find=progress_text]").addClass("uploading_file_progress_size").html("0 K of 0 MB"); //toto => translation
		Elem.find(".uploading_action").html(Lincko.Translation.get('app', 7, 'html'));
		if (this.item._type == 'files' || this.item._type == 'uploading_file'){
			if(this.item.category=='image' || this.item.category=='video' )
			{
				var thumbnail = Lincko.storage.getLinkThumbnail(this.item._id);
				Elem.find(".models_history_standard_shortcut_ico").addClass('display_none');
				Elem.find(".models_history_standard_shortcut_pic").removeClass('display_none').css('background-image','url("'+thumbnail+'")');
			}
			else{
				var ext = app_models_fileType.getExt(this.item[(this.item._type == "files"?"+name":"name")]);
				Elem.find(".models_history_standard_shortcut_ico")
					.removeClass('display_none')
					.find("i")
					.addClass(app_models_fileType.getClass(ext));
				Elem.find(".models_history_standard_shortcut_pic").addClass('display_none');
			}		
		}
		Elem.attr('category', this.item._type);
	}

	if(Elem)
	{
		Elem.find('.models_history_standard_shortcut').click(that, function(event) {
			event.stopPropagation();
			var that = event.data;
			var parent = $(this).parents('.models_history_wrapper');
			var category = parent.attr('category');
			var id = that.chatFeed.RESOURCE_ID[category](parent.prop("id"));
			that.chatFeed.SHORTCUT_HANDLERS[category](id, this);
		});

		Elem.find('.models_history_content_wrapper').click(that, function(event) {
			var that = event.data;
			var parent = $(this).parents('.models_history_wrapper');
			var category = parent.attr('category');
			if(typeof that.chatFeed.RESOURCE_ID[category]  !== 'undefined')
			{
				var id = that.chatFeed.RESOURCE_ID[category](parent.prop("id"));
				if(typeof that.chatFeed.RESOURCE_HANDLERS[category] !== 'undefined')
				{
					that.chatFeed.RESOURCE_HANDLERS[category](id, this, event);
				}	
			}
		});
	}
	return Elem;
};

BaseHistoryCls.prototype.renderHistoryTemplate = function(index) {
	var target;
	var action = false;
	var thumbnail;
	var that = this;

	if(this.item.att == 'recalled_by'){ //if comment was recalled
		this.templateType = '-models_history_comment_recalled';
	}
	var Elem = $("#" + this.templateType).clone();
	var Elem_id = that.chatFeed.subm.id+"_"+this.item.type+'_models_thistory_' + this.item.id + (this.item.type != 'comments' ? '_hist_'+this.item.hist : '');

	//Do not duplicate chat messages
	if($("#"+Elem_id).length>0){
		return false;
	}

	Elem.prop('id', Elem_id);
	Elem.attr('index', index);

	if (this.item.type === "comments") {
		Elem.attr('comment_id',this.item.id);
		var root = Lincko.storage.getRoot('comments', this.item.id);
		target = root['+title'];
		var target_type = root['_type'];
		if (root._type == 'chats'){
			return null;
		}
		else if(this.item.att == 'recalled_by'){ //if comment was recalled
			if(this.item["timestamp"]){
				var timestamp = this.item["timestamp"];
			} else if(this.item["created_at"]){
				var timestamp = this.item["created_at"];
			}
			timestamp = new wrapper_date(timestamp);
			Elem.find("[find=timestamp]").html(timestamp.display('time_short'));
			var uname = wrapper_to_html(Lincko.storage.get('users', this.item.by)['-username']);
			Elem.find("[find=msg]").text(Lincko.Translation.get('app', 3101, 'html', {username: uname }));
			return Elem;
		}
	}

	Elem.addClass(this.decoratorClass);
	Elem.addClass(this.item.type);
	var history = Lincko.storage.getHistoryInfo(this.item);
	// We don't need to use wrapper_to_html for 'history' because the text is already protected in history format method
	if(!history){
		return null;
	}

	if (!action) {
		var clone_hist = $.extend(true, {}, history.root.history);
		var text = history.root.title;
		if(clone_hist.par.un){
			clone_hist.par.un = '';
		}
		action = php_nl2br(Lincko.storage.formatHistoryInfo(text, clone_hist)) + ":&nbsp;";
	}

	//var user = this.item.type == "history" ? this.item.by: this.item.created_by;
	var img = Lincko.storage.getLinkThumbnail(Lincko.storage.get("users", this.item.by, 'profile_pic'));
	if(!img){
		img = app_application_icon_single_user.src;
	}

	if(this.item.type=='comments' && this.item.by==0){
		Elem.find("[find=content]").removeAttr('contenteditable');
		img = app_application_icon_roboto.src;
		Elem.find("[find=icon]").css('border-color', 'transparent');
		Elem.find("[find=author]").html(Lincko.Translation.get('app', 0, 'html')); //Roboto
	} else {
		Elem.find("[find=author]").html(php_nl2br(this.item.par.un));
	}

	Elem.find("[find=icon]").click(this.item.by, function(event){
		submenu_Build("personal_info", that.chatFeed.subm.layer+1, true, event.data, that.chatFeed.subm.preview);
	});

	Elem.find("[find=icon]").css('background-image','url("'+img+'")');
	Elem.find("[find=action]").html(wrapper_to_html($.trim(action).ucfirst()));

	var cutLength = 200;

	if (this.item.type == "comments" || this.item.type == "projects") {
		Elem.find('.models_history_content').css('cursor', 'default');
	}

	if (this.item.type === "comments") {
		var root = Lincko.storage.getRoot('comments', this.item.id);
		target = root['+title'];
		var target_type = root['_type'];
		if (root._type == 'chats'){
			return null;
		}
	} else {
		if (this.item.type != 'files') {
			target = Lincko.storage.get(this.item.type, this.item.id, "+title");
		}
		else{
			target = Lincko.storage.get(this.item.type, this.item.id, "+name");
			thumbnail = Lincko.storage.getLinkThumbnail(this.item.id);
			cutLength = 10;
		}
	}
	if (root) {
		Elem.find("[find=target_type]").attr('parent', target_type)
			.attr("parent_id", root['_id'])
			.html(wrapper_to_html(Lincko.storage.data._history_title[target_type][0]));
	}

	Elem.find("[find=target]").html(that.chatFeed.cutFileTitle(target, cutLength, 0, this.item.type));
	if(typeof history.content == 'object'){
		Elem.find("[find=content]").append(history.content);
	} else {
		Elem.find("[find=content]").html(wrapper_to_html(history.content));
	}
	var date = new wrapper_date(this.item.timestamp);
	Elem.find(".time", "[find=timestamp]").html(date.display('time_short'));
	Elem.find(".date", "[find=timestamp]").html(date.display('date_short'));
		
	if (this.item.type == 'files'){
	    var file = Lincko.storage.get('files', this.item.id);
		if(file.category =='image' || file.category =='video')
		{
			Elem.find(".models_history_standard_shortcut_ico").addClass('display_none');
			Elem.find(".models_history_standard_shortcut_pic").removeClass('display_none').css('background-image','url("'+thumbnail+'")');
		} 
		else{
			var ext = app_models_fileType.getExt(target);
			Elem.find(".models_history_standard_shortcut_ico").removeClass('display_none').find("i").addClass(app_models_fileType.getClass(ext));
			Elem.find(".models_history_standard_shortcut_pic").addClass('display_none');
		}
	}
	Elem.attr('category', this.item.type);

	if(Elem)
	{
		Elem.find('.models_history_standard_shortcut').click(that, function(event) {
			event.stopPropagation();
			var that = event.data;
			var parent = $(this).parents('.models_history_wrapper');
			var category = parent.attr('category');
			var id = that.chatFeed.RESOURCE_ID[category](parent.prop("id"));
			that.chatFeed.SHORTCUT_HANDLERS[category](id, this);
		});

		Elem.find('.models_history_content_wrapper').click(that, function(event) {
			var that = event.data;
			var parent = $(this).parents('.models_history_wrapper');
			var category = parent.attr('category');
			if(typeof that.chatFeed.RESOURCE_ID[category]  !== 'undefined')
			{
				var id = that.chatFeed.RESOURCE_ID[category](parent.prop("id"));
				if(typeof that.chatFeed.RESOURCE_HANDLERS[category] !== 'undefined')
				{
					that.chatFeed.RESOURCE_HANDLERS[category](id, this, event);
				}	
			}
		});
	}
	return Elem;
};

BaseHistoryCls.prototype.setTemplate = function(type) {
	if (type=='history') {
		this.decoratorClass = wrapper_localstorage.uid === parseInt(this.item.by, 10) ? "models_history_self" : "models_history_others";
		if (this.item.type === "comments") {
			if(this.item.att == 'recalled_by'){
				this.templateType = '-models_history_comment_recalled';
			}
			else{
				var parent = Lincko.storage.getParent('comments', this.item.id);
				if (parent._type === 'projects') {
					this.templateType = '-models_history_comment_short';
				} else {
					this.templateType = '-models_history_comment_long';
				}
			}
			return;
		}
		this.templateType = "-models_history_" + this.item.type;
	}
	else {
		this.decoratorClass = wrapper_localstorage.uid === parseInt(this.item.created_by, 10) ? "models_history_self" : "models_history_others";
		switch(this.item._type) {
			case "comments":
				if(this.item.recalled_by){
					this.templateType = '-models_history_comment_recalled';
				}
				else{
					this.templateType = "-models_history_comment_short";
				}
				break;
			case "uploading_files":
				this.templateType = "-models_history_uploading_file";
				break;
			case "files":
				this.templateType = "-models_history_uploaded_file";
				break;
			default:
				this.templateType = "-models_history_" + this.item._type;
		}
	}
};

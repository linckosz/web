/* Category 31 */
var chatFeed = (function() {
	var subm = null;
	var SHORTCUT_HANDLERS = {
		'files': function(id, elem) { console.log('here');
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
	var RESOURCE_ID = {
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
	var RESOURCE_HANDLERS = {
		'tasks': function(taskid, elem) {
			var tmp = $(elem).parents(".submenu_wrapper").prop("id").split("_");
			var preview = JSON.parse(tmp[tmp.length-1]);
			submenu_Build('taskdetail', submenu_Getposition('taskdetail',preview), null, {'type': 'tasks', 'id': taskid}, preview);
			return false;
		},
		'files': function(fileid, elem) {
			var tmp = $(elem).parents(".submenu_wrapper").prop("id").split("_");
			var preview = JSON.parse(tmp[tmp.length-1]);
			submenu_Build('taskdetail', submenu_Getposition('taskdetail',preview), null, {'type':'files', 'id':fileid}, preview);
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
			if(typeof type !== "undefined" && typeof p_id !== "undefined"){
				RESOURCE_HANDLERS[type](p_id, elem);
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

	function BaseHistoryCls(item) {
		this.item = item;
	}


	function checkRecentDate(timestamp, index) {
		if (index == 0) {
			checkRecentDate.lastDate = Math.floor(timestamp / 86400) * 86400;
			checkRecentDate.recentDatestamp = checkRecentDate.lastDate;
		}
		if (timestamp < checkRecentDate.recentDatestamp) {
			var old = checkRecentDate.recentDatestamp;
			checkRecentDate.recentDatestamp = Math.floor(timestamp / 86400) * 86400;
			return old;
		}
		if (index == -1) {
			if(typeof checkRecentDate.recentDatestamp === "undefined")
			{
				checkRecentDate.lastDate = Math.floor(timestamp / 86400) * 86400;
				checkRecentDate.recentDatestamp = checkRecentDate.lastDate;
			}
			return checkRecentDate.recentDatestamp;/*the last item*/
		}
		if(index == -2)/*new comment*/
		{
			if(checkRecentDate.lastDate != Math.floor(new wrapper_date().timestamp / 86400) * 86400)
			{
				checkRecentDate.lastDate = Math.floor(new wrapper_date().timestamp / 86400) * 86400;
				return checkRecentDate.lastDate;
			}
		}
		return false;
	}

	function cutFileTitle(title, prefixLength, suffixLength, type){
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
	}

	function renderLine(timestamp) {
		var lineTemplate = "-models_history_line";
		var line = $('#' + lineTemplate).clone();
		line.removeAttr('id');
		line.addClass("models_history_line");
		var today = Math.floor((new Date()).getTime() / 86400000);
		if (timestamp == today * 86400) {
			date = Lincko.Translation.get('app', 3302, 'html').toUpperCase(); //Today
		}
		else if (timestamp == (today - 1) * 86400) {
			date = Lincko.Translation.get('app', 3304, 'html').toUpperCase(); //Yesterday
		}
		else{
			date = (new wrapper_date(timestamp).display('date_very_short'));
		}
		line.find('span').html(date);
		return line;
	}

	function checkExtension(id) {
		var PIC_EXTENSION = ['bmp', 'gif', 'png', 'apng', 'jpg', 'jpeg'];
		var VIDEO_EXTENSION = ['mp4', 'mkv', 'mov', 'xvid', 'x264', 'wmv', 'avi'];

		var file_name = Lincko.storage.get('files', id, "+name");
		var tmp = file_name.split(".");
		var extension = tmp[tmp.length - 1].toLowerCase();
		if ($.inArray(extension, PIC_EXTENSION)>-1) {
			return 'pic';
		} else if ($.inArray(extension, VIDEO_EXTENSION)>-1) {
			return 'video';
		} else {
			return null;
		}
	}
	
	BaseHistoryCls.prototype.renderChatTemplate = function(index, replace) {
		var target;
		var action;
		var progress;

		var Elem = $("#" + this.templateType).clone();
		if (this.item._type == "uploading_file") {
			var Elem_id = chatFeed.subm.id+"_uploading_file_"+this.item.index;
			Elem.attr('_file_id',this.item.id);
		} else {
			var Elem_id = chatFeed.subm.id+"_"+this.item._type+'_models_thistory_' + this.item._id;
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
			Elem.find("[find=msg]").text(Lincko.Translation.get('app', 3101, 'html', {username: uname }));
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
				submenu_Build("personal_info", chatFeed.subm.layer+1, true, event.data, chatFeed.subm.preview);
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

			Elem.find("[find=target]").addClass("upload_file_title").html(cutFileTitle(this.item[(this.item._type == "files"?"+name":"name")], 10, 0, this.item._type));
			Elem.find("[find=progress_bar]").width("70%");  //toto
			Elem.find("[find=progress_text]").addClass("uploading_file_progress_size").html("0K of 0 MB");
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
			Elem.find('.models_history_standard_shortcut').on('click', function(e) {
				e.stopPropagation();
				var parent = $(this).parents('.models_history_wrapper');
				var category = parent.attr('category');
				var id = RESOURCE_ID[category](parent.prop("id"));
				var that = this;
				SHORTCUT_HANDLERS[category](id, that);
			});

			Elem.find('.models_history_content_wrapper').on('click', function(e) {
				var parent = $(this).parents('.models_history_wrapper');
				var category = parent.attr('category');
				if(typeof RESOURCE_ID[category]  !== 'undefined')
				{
					var id = RESOURCE_ID[category](parent.prop("id"));
					var that = this;
					if(typeof RESOURCE_HANDLERS[category] !== 'undefined')
					{
						RESOURCE_HANDLERS[category](id, that, e);
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

		if(this.item.att == 'recalled_by'){ //if comment was recalled
			this.templateType = '-models_history_comment_recalled';
		}
		var Elem = $("#" + this.templateType).clone();
		var Elem_id = chatFeed.subm.id+"_"+this.item.type+'_models_thistory_' + this.item.id + (this.item.type != 'comments' ? '_hist_'+this.item.hist : '');

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
			submenu_Build("personal_info", chatFeed.subm.layer+1, true, event.data, chatFeed.subm.preview);
		});

		Elem.find("[find=icon]").css('background-image','url("'+img+'")');
		Elem.find("[find=action]").html(wrapper_to_html($.trim(action).ucfirst()));

		var cutLength = 200;

		if (this.item.type === "comments") {
			var root = Lincko.storage.getRoot('comments', this.item.id);
			target = root['+title'];
			var target_type = root['_type'];
			if (root._type == 'chats')
				return null;
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

		Elem.find("[find=target]").html(cutFileTitle(target, cutLength, 0, this.item.type));
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
			Elem.find('.models_history_standard_shortcut').on('click', function(e) {
				e.stopPropagation();
				var parent = $(this).parents('.models_history_wrapper');
				var category = parent.attr('category');
				var id = RESOURCE_ID[category](parent.prop("id"));
				var that = this;
				SHORTCUT_HANDLERS[category](id, that);
			});

			Elem.find('.models_history_content_wrapper').on('click', function(e) {
				var parent = $(this).parents('.models_history_wrapper');
				var category = parent.attr('category');
				if(typeof RESOURCE_ID[category]  !== 'undefined')
				{
					var id = RESOURCE_ID[category](parent.prop("id"));
					var that = this;
					if(typeof RESOURCE_HANDLERS[category] !== 'undefined')
					{
						RESOURCE_HANDLERS[category](id, that, e);
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


	function app_layers_history_launchPage(position, type, projectId, subm) {
			chatFeed.subm = subm;
			position.addClass('overthrow').addClass("submenu_chat_contents");
			position.empty();
			app_layers_history_feedPage(position, type, projectId);
			wrapper_IScroll();
	}

	function app_layers_uploading_files(position, type, id, submenu_wrapper_id){return; //toto
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
				format_items(_type, [item], position, true);	
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
						.html(files[i].lincko_progress * files[i].lincko_size +" K of "+files[i].lincko_size+" KB");
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
		wrapper_IScroll();
	}


	function getRawContents(type, id, range) {
		if (type == 'history') {
			return Lincko.storage.hist(null, range, null, 'projects', id, true);
		}
		else {
			return Lincko.storage.list(null, range, null, 'chats', id, false);
		}
	}

	function getHistoryPaging(type, position, parentId) {
		var firstIndex = parseInt(position.find('.models_history_wrapper').first().attr('index'),10) +1;
		var lastIndex = firstIndex + 20;
		var newRange = firstIndex + "-" + lastIndex;

		var items = getRawContents(type, parentId, newRange);
		$('<div>').addClass('chat_contents_wrapper').prop("id", chatFeed.subm.id+'_chat_contents_wrapper').appendTo(position);
		format_items(type, items, position, false, false);
	}

	function app_layers_history_feedPage(position, type, parentId) {
		var items = getRawContents(type, parentId, null);
		$('<div>').addClass('chat_contents_wrapper').prop("id", chatFeed.subm.id+'_chat_contents_wrapper').appendTo(position);
		format_items(type, items, position, false, false);
	}

	function format_items(type, items, position, newone)
	{
		var pre = {
			att: null,
			by: null,
			cod: null,
			id: null,
			type: null,
			timestamp: null,
		}
		var pre_timestamp;
		var current;
		var groups;
		var Elem;
		var today = (new wrapper_date()).getDayStartTimestamp();
		if(newone)
		{
			groups = [{'timestamp':today ,'items':items}];
		}
		else
		{
			format_items.has_today = false;
			groups = items_group_by_time(items, type);
		}
		for(var i in groups)
		{
			for(var j in groups[i].items)
			{
				current = groups[i].items[j];
				//If similar modification
				if(
					   pre.cod !== null
					&& current.att === pre.att
					&& current.by === pre.by
					&& current.cod === pre.cod
					&& current.id === pre.id
					&& current.type === pre.type
					&& current.timestamp > pre.timestamp - (4*3600) //Need 4H gap
				){
					continue;
				}
				pre = {
					att: current.att,
					by: current.by,
					cod: current.cod,
					id: current.id,
					type: current.type,
					timestamp: current.timestamp,
				}
				var item = new BaseHistoryCls(current);
				item.setTemplate(type);
				if (type == 'history'){
					Elem = item.renderHistoryTemplate(j);
				}
				else
				{
					Elem = item.renderChatTemplate(i);
				}
				if(Elem)
				{
					if(newone)
					{
						Elem.appendTo(position.find(".chat_contents_wrapper"));
					}
					else
					{
						Elem.prependTo(position.find(".chat_contents_wrapper"));
					}
				}
			}

			if(newone && !format_items.has_today && Elem)
			{
				var line = renderLine(groups[i].timestamp);
				Elem.before(line);
			}
			else if(!newone && Elem)
			{
				var line = renderLine(groups[i].timestamp);
				line.prependTo(position.find(".chat_contents_wrapper"));
			}

			if(groups[i].timestamp == today)
			{
				format_items.has_today = true;
			}
		}
	}

	function items_group_by_time(items, type)
	{
		var real_items=[];
		var timestamp_groups = [];
		var item_timestamp;
		for(var i in items)
		{
			if(items[i].hasOwnProperty('+title')){continue;}
			if (items[i].type === "comments")
			{
				var root = Lincko.storage.getRoot('comments', items[i].id);
				target = root['+title'];
				var target_type = root['_type'];
				if (root._type == 'chats'){continue;}
			}
			real_items.push(items[i]);
			item_timestamp = Math.floor( (type == "history" ? items[i].timestamp : items[i].created_at)  / 86400) * 86400;
			if(timestamp_groups.indexOf(item_timestamp) == -1)
			{
				timestamp_groups.push(item_timestamp);
			}
		}

		var groups = [];
		for(var i in timestamp_groups)
		{
			groups.push({'timestamp':timestamp_groups[i],'items':[]});
		}

		var cursor = 0;
		for(var i in real_items)
		{
			item_timestamp = Math.floor( (type == "history" ? real_items[i].timestamp : real_items[i].created_at)  / 86400) * 86400;
			if(item_timestamp == timestamp_groups[cursor])
			{
				groups[cursor].items.push(real_items[i]);
			}
			else
			{
				cursor = cursor + 1;
				groups[cursor].items.push(real_items[i]);
			}
		}
		return groups;
	}
	
	function updateRecalled(parentType, parentID, position){
		var items_recalled = Lincko.storage.list('comments', null, {recalled_by:['>',null]}, parentType, parentID, false);
			$.each(items_recalled, function(i, val){
				var item = val;
				var toReplace = position.find('[comment_id='+item._id+']');
				if(toReplace && !toReplace.hasClass('models_history_comment_recalled')){
					var replaceWith = new BaseHistoryCls(item);
					replaceWith.setTemplate();
					replaceWith = replaceWith.renderChatTemplate(null,true);
					toReplace.replaceWith(replaceWith);
				}
			});
	}

	function updateTempComments(parentType, parentID, position){
		var elem_comments = position.find('[comment_id]');
		$.each(elem_comments, function(i,val){
			var elem = $(val);
			var comment_id = elem.attr('comment_id');
			var item = Lincko.storage.get('comments', comment_id);
			if(!item){
				var item_real = Lincko.storage.list('comments',1,{temp_id:comment_id},parentType,parentID,false)[0];
				if(!item_real) return;
				var replaceWith = (new BaseHistoryCls(item_real));
				replaceWith.setTemplate("chats");
				replaceWith = replaceWith.renderChatTemplate(null,true);
				elem.replaceWith(replaceWith);
			}
		});
	}

	function updateTempUploads(parentType, parentID, position)
	{
		var elem_uploadings = position.find('[_file_id]');
		$.each(elem_uploadings, function(i,val){
			var elem = $(val);
			var _file_id = elem.attr('_file_id');
			var item_real = Lincko.storage.list('files',1,{temp_id:_file_id},parentType,parentID,false)[0];
			if(!item_real) return;
			var replaceWith = (new BaseHistoryCls(item_real));
			replaceWith.setTemplate("chats");
			replaceWith = replaceWith.renderChatTemplate(null,true);
			elem.replaceWith(replaceWith);
		});
	}

	return {
		'feedHistory': app_layers_history_launchPage,
		'feedUploadingFiles':app_layers_uploading_files,
		'feedPaging': getHistoryPaging,
		'appendItem': format_items,
		'updateRecalled': updateRecalled,
		'updateTempComments': updateTempComments,
		'updateTempUploads': updateTempUploads,
	}
})();

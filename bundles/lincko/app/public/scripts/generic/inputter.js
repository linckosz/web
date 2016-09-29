
var inputter = function(setting,position,submenu,burgerFlag,param,fnSend,fnUpload)
{
	this.position = position;
	this.submenu = submenu;
	this.burgerFlag = burgerFlag;
	this.param = param;
	this.fnSend = fnSend;
	this._setting =
	{
		type : setting != null && typeof setting.type !== 'undefined' ? setting.type :'comment',// comment or task
		feature : setting != null && typeof setting.feature !== 'undefined' ? setting.feature : ['send','attachment'], // upload+send
		margin : setting != null && typeof setting.margin !== 'undefined' ? setting.margin : 'margin_style_1_1', // upload+send
		entry_commit_able : setting != null && typeof setting.entry_commit_able !== 'undefined' ? setting.entry_commit_able : false, //true or false 
		row : setting != null && typeof setting.row !== 'undefined' ? setting.row : 3,// pc display 3 rows
		max_row : setting != null && typeof setting.max_row !== 'undefined' ? setting.max_row : 3,
		mobile_row : setting != null && typeof setting.mobile_row !== 'undefined' ? setting.mobile_row : 1,//it display 1 row default on mobile
		mobile_max_row :  setting != null && typeof setting.mobile_max_row !== 'undefined' ? setting.mobile_max_row : 3,// if overflow 1 row,it can display 3 row on mobile
		icon_float : setting != null && typeof setting.icon_float !== 'undefined' ? setting.icon_float : 'top', //when input overflow,where icons float
		style : setting != null && typeof setting.icon_float !== 'undefined' ? setting.icon_float : 'chatting',//chats or tasks or comments
	}
	this.items_build();
	this.handler_build();
}
inputter.prototype.handler_build = function(){
	var that = this;
	if(that._setting.type == 'comment')
	{
		that.position.find('[find=call_send]').click(function(){
			var msg = that.position.find('[find=chat_textarea]').html().replace(/<div>/g,"<br>").replace(/<\/div>/g,"");
			that.fnSend(msg);
			that.position.find('[find=chat_textarea]').html('');
			that.position.find('[find=call_send]').addClass('mobile_hide');
			that.position.find('[find=call_attachment]').removeClass('mobile_hide');
		});

		that.position.find('[find=call_attachment]').click(function(){
			var type = that.param.type == 'history' ? "projects":'chats';
			var id = that.param.id;
	 		app_upload_open_files(type, id,false,true);
		});

		// that.position.find('[find=chat_textarea]').on('paste',function(e,data){
		// 	var data = e.originalEvent.clipboardData.getData('text/plain');
		// 	e.stopPropagation();
  		//  e.preventDefault();
		// 	this.innerHTML = this.innerHTML.replace(/<(br).*?>/g,"<br/>").replace(/<(?!br).*?>/g,"");
		// });

		that.position.find('[find=chat_textarea]').keyup(function(e) {
			//e.stopPropagation();
			if(this.innerText.length > 0)
			{
				that.position.find('[find=call_send]').removeClass('mobile_hide');
				that.position.find('[find=call_attachment]').addClass('mobile_hide');
			}
			else
			{
				that.position.find('[find=call_send]').addClass('mobile_hide');
				that.position.find('[find=call_attachment]').removeClass('mobile_hide');
			}

			if((e.ctrlKey && e.keyCode==86) || e.keyCode==91)
			{
				this.innerHTML = this.innerHTML.replace(/<(br).*?>/g,"<br/>").replace(/<(?!br).*?>/g,"");
			}

			if(e.shiftKey && e.keyCode==13)
			{
				return;
			}
			if( e.keyCode==13)
			{
				var msg = that.position.find('[find=chat_textarea]').html().replace(/<div>/g,"<br>").replace(/<\/div>/g,"");
				if(this.innerText.length > 0)
				{
					that.fnSend(msg);
					that.position.find('[find=chat_textarea]').html('');
					that.position.find('[find=call_send]').addClass('mobile_hide');
					that.position.find('[find=call_attachment]').removeClass('mobile_hide');
					return;
				}
				else
				{
					base_show_error('不能为空', true);
				}
			}
		});

		that.position.find('[find=chat_textarea]').keyup(function(e) {
			if(e.shiftKey && e.keyCode==13)
			{
				e.returnValue=false;
				return;
			}
		});
	}
	else(this._setting.type == 'task')
	{
		this.position.find('[find=call_send]').click(function(){
			
		});

		this.position.find('[find=call_attachment]').click(function(){
			
		});
	}
}


inputter.prototype.items_build = function(){
	var wrapper = $('#-inputter_container').clone();
	wrapper.prop('id','');
	wrapper.addClass('inputter_'+this._setting.type);


	var content = $('#-inputter_content_'+this._setting.type).clone();
	content.prop('id','');
	content.appendTo(wrapper.find('[find=content_wrapper]'));
	content.addClass(this._setting.margin);
	if(this.burgerFlag){
		if(this.fnSend){
			this.param.enter_fn = this.fnSend;
		}
		burgerN.regex(content.children('[find=chat_textarea]').eq(0), null, this.param);
	}



	var menu = wrapper.find('[find=menu_wrapper]');
	var memu_row_max_length = 0;
	var mobile_row_max_length = 0;
	var has_scissors = false;
	for(var i in this._setting.feature)
	{
		var row = $('#-inputter_menu_row_wrapper').clone();
		row.prop('id','');
		if(typeof this._setting.feature[i] === 'string')
		{
			var item = $('#-inputter_call_'+this._setting.feature[i]).clone();
		 	item.prop('id','');
		 	item.appendTo(row);
		}
		else
		{
			
			for(var j = this._setting.feature[i].length - 1 ; j >= 0 ; j -- )
			{
				if(typeof this._setting.feature[i][j] === 'string')
				{
					if(this._setting.feature[i] == 'scissors')
					{
						has_scissors = true;
					}
					var item = $('#-inputter_call_'+this._setting.feature[i][j]).clone();
				 	item.prop('id','');
				 	item.appendTo(row);
				}
			}
		}
		row.appendTo(menu);
	}

	if(this._setting.type == 'comment')
	{
		menu.find('[find=call_send]').addClass('mobile_hide');
	}

	
	if(this._setting.icon_float == 'top')
	{
		menu.addClass('icon_float_up');
	}
	else
	{
		menu.addClass('icon_float_bottom');
	}

	if(this._setting.style != 'tasks')
	{
		wrapper.find('[find=uploading_wrapper]').remove();
	}
	else
	{

	}

	wrapper.appendTo(this.position);
}

inputter.prototype.files_refresh = function()
{
	
}

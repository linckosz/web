
var inputter = function(setting,position,submenu,burgerFlag,param,fnUpload,fnSend)
{
	this.position = position;
	this.submenu = submenu;
	this.burgerFlag = burgerFlag;
	this.param = param;
	this._setting =
	{
		type : setting != null && typeof setting.type !== 'undefined' ? setting.type :'task',// comment or task
		feature : setting != null && typeof setting.feature !== 'undefined' ? setting.feature : [['scissors','send'],'attachment'], // upload+send
		entry_commit_able : setting != null && typeof setting.entry_commit_able !== 'undefined' ? setting.entry_commit_able : false, //true or false 
		row : setting != null && typeof setting.row !== 'undefined' ? setting.row : 3,// pc display 3 rows
		max_row : setting != null && typeof setting.max_row !== 'undefined' ? setting.max_row : 3,
		mobile_row : setting != null && typeof setting.mobile_row !== 'undefined' ? setting.mobile_row : 1,//it display 1 row default on mobile
		mobile_max_row :  setting != null && typeof setting.mobile_max_row !== 'undefined' ? setting.mobile_max_row : 3,// if overflow 1 row,it can display 3 row on mobile
		icon_float : setting != null && typeof setting.icon_float !== 'undefined' ? setting.icon_float : 'top', //when input overflow,where icons float
		style : setting != null && typeof setting.icon_float !== 'undefined' ? setting.icon_float : 'chatting',//chats or tasks or comments
	}
	this.items_build();
}

inputter.prototype.items_build = function(){
	var wrapper = $('#-inputter_container').clone();
	wrapper.prop('id','');
	wrapper.addClass('inputter_'+this._setting.type);


	var content = $('#-inputter_content_'+this._setting.type).clone();
	content.prop('id','');
	content.appendTo(wrapper.find('[find=content_wrapper]'));
	if(this.burgerFlag){
		if(this.fnSend){
			this.param.enter_fn = this.fnSend;
		}
		burgerN.regex(content.children('[find=chat_textarea]').eq(0), null, this.param);
	}

	var menu = wrapper.find('[find=menu_wrapper]');
	var content_margin = 30 + 10;
	var memu_row_max_length = 0;
	for(var i in this._setting.feature)
	{
		var row = $('#-inputter_menu_row_wrapper').clone();
		row.prop('id','');
		if(typeof this._setting.feature[i] === 'string')
		{
			if(memu_row_max_length < 1) 
			{
				memu_row_max_length = 1;
			}
			var item = $('#-inputter_call_'+this._setting.feature[i]).clone();
		 	item.prop('id','');
		 	item.appendTo(row);
		}
		else
		{
			if(this._setting.feature[i].length > memu_row_max_length) 
			{
				memu_row_max_length = this._setting.feature[i].length;
				content_margin = (30 + 10) * memu_row_max_length + 10;
			}
			for(var j = this._setting.feature[i].length - 1 ; j >= 0 ; j -- )
			{
				if(typeof this._setting.feature[i][j] === 'string')
				{
					var item = $('#-inputter_call_'+this._setting.feature[i][j]).clone();
				 	item.prop('id','');
				 	item.appendTo(row);
				}
			}
		}
		row.appendTo(menu);
	}

	wrapper.find('[find=content_wrapper]').css('margin-right',content_margin);

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

	wrapper.appendTo(this.position);
}

inputter.prototype.files_refresh = function()
{
	
}

/**********************************************************************
***		   panel_id	: submenu id or layer id 						***
***		   position	: wrapper for inputter 							***
***	   upload_ptype	: as a parm for app_upload_open_files			***
***		 upload_pid	: as a parm for app_upload_open_files			***
***			  layer : 												*** 
***	         burger : burger object									***
***********************************************************************
***	var layer = {													***	
***			row : 3,//desktop height								***	
***			max_row : 3,//desk top max height						***	
***			mobile_row : 1,//mobile height							***	
***			mobile_max_row : 3,//mobile max height					***	
***			mobile_backgroup_flag : true,gray-true;white-false		***	
***			mobile_input_border_flag : true,input border;orange		***	
***			top_line : true,inputter top line for desktop;orange	***	
***			mobile_top_line : false,mobile inputter top line		***	
***			enter : fnSendMsg,enter event							***	
***			auto_upload : true,										***	
***			menu :													***	
***			[														***	
***				[													***	
***					{												***	
***						element : 'btScissors',						***	
***						mobile_hide : true,							***	
***					},												***	
***					{												***	
***						element : 'btSend',							***	
***						mobile_hide : true,							***	
***						empty : 'hide',								***	
***						click : fnSendMsg,							***	
***					},												***	
***				],													***	
***				[													***	
***					{												***	
***						element : 'btAttachment',					***	
***						empty : 'show',								***	
***					},												***	
***				],													***	
***			],														***	
***		};															***	
***********************************************************************
*/

var inputter = function(panel_id,position,upload_ptype,upload_pid,layer,burger)
{
	this.elements_lib = 
	{
		chkTask :
		{
			target : 'checkbox',
		},
		btSend:
		{
			target : 'send',
		},
		btScissors:
		{
			target : 'scissors',
			mobile_hide : true ,
		},
		btAttachment:
		{
			target : 'attachment',
		},
	}

	this.panel_id = panel_id;
	this.position = position;
	this.upload_ptype = upload_ptype ;
	this.upload_pid = upload_pid;
	this.layer = layer;
	this.burger = burger;
	this.hasTask = false;
	this.task_completed = false;
	this.buildLayer();
}

inputter.prototype.getContent = function()
{

	var container = $('#'+this.panel_id+'_inputter_container');
	var text = container.find('[find=chat_textarea]').get(0).innerHTML.replace(/<div>/g,"<br>").replace(/<\/div>/g,"");
	var html = container.find('[find=chat_textarea]').get(0).innerHTML;
	var files = app_upload_files.lincko_files;
	var files_index = [];
	for(var i in files)
	{
		if(files[i].lincko_parent_type == this.upload_ptype
			&&files[i].lincko_parent_id == this.upload_pid
			&&files[i].lincko_param == 'inputter_files_' + this.upload_ptype +'_'+this.upload_pid)
		{
			files_index.push(files[i].lincko_files_index);
		}
	}

	var data = {
		elem:container.find('[find=chat_textarea]'),
		text:text,
		html:html,
		files_index:files_index,
		checked:this.task_completed,
	}



	return data;
} 


inputter.prototype.clearContent = function()
{
	this.task_completed = false;

	var auto_upload = this.layer.hasOwnProperty('auto_upload') ? this.layer['auto_upload'] : true;
	if(!auto_upload)
	{
		for(var i in app_upload_files.lincko_files)
		{
			if(app_upload_files.lincko_files[i].lincko_parent_type == this.upload_ptype
				&&app_upload_files.lincko_files[i].lincko_parent_id == this.upload_pid
				&&app_upload_files.lincko_files[i].lincko_param == 'inputter_files_' + this.upload_ptype +'_'+this.upload_pid)
			{
				var e; //undefined
				$('#app_upload_fileupload').fileupload('option').destroy(e, app_upload_files.lincko_files[i]);
			}
		}
	}

	var container = $('#'+this.panel_id+'_inputter_container');
	container.find('[find=chat_textarea]').get(0).innerHTML = '';
	container.find('[find=checkbox]').removeClass('inputter_container_checked');
	container.find('[find=files_queue]').html('');


} 



inputter.prototype.buildLayer = function()
{

	var that = this ;
	var container = $('#-inputter_container').clone();
	container.prop('id',this.panel_id+'_inputter_container');


	if(this.layer.hasOwnProperty('mobile_backgroup_flag') && this.layer['mobile_backgroup_flag'])
	{
		container.addClass('inputter_mobile_backgroup_gray');
	}
	

	var line = this.layer.hasOwnProperty('top_line') && this.layer['top_line'] ? 1 : 0;
	var mobile_line = this.layer.hasOwnProperty('mobile_top_line') && this.layer['mobile_top_line'] ? 1 : 0;
	container.addClass('inputter_line_' + line + mobile_line);

	var left_menu = container.find('[find=left_menu_wrapper]');
	var right_menu = container.find('[find=right_menu_wrapper]');

	var col_count = 0;
	var max_right_col_count  = 0;
	var max_left_col_count  = 0;

	var mobile_left_col_count  = 0;
	var mobile_right_col_count  = 0;

	var left_padding_col_count = 0;
	
	if(this.layer.hasOwnProperty('left_menu'))
	{
		mobile_left_col_count = 0;
		left_padding_col_count = 0;
		for(var i in this.layer['left_menu'])
		{
			col_count = 0;
			var row = $('#-inputter_menu_row').clone();
			row.prop('id','');

			if($.isArray(this.layer['left_menu'][i]))
			{
				for(var j = this.layer['left_menu'][i].length -1 ; j >= 0 ; j-- )//in this.layer['right_menu'][i])
				{
					var tmp = this.layer['left_menu'][i][j];
					var elem = this.layer['left_menu'][i][j]['element'];
					if(typeof this.elements_lib[elem] !== 'undefined')
					{
						var item = $('#-inputter_element_'+this.elements_lib[elem]['target']).clone();
						item.prop('id',this.panel_id +'_'+ this.elements_lib[elem]['target']);
						item.appendTo(row);

						if((this.elements_lib[elem].hasOwnProperty('mobile_hide') && this.elements_lib[elem]['mobile_hide'])
						|| (this.layer['left_menu'][i][j].hasOwnProperty('mobile_hide') && this.layer['left_menu'][i][j]['mobile_hide']))
						{
							item.addClass('mobile_hide');
						}
						else if(elem != 'chkTask'){
							mobile_left_col_count ++ ;
						}
						else if (elem == 'chkTask')
						{
							left_padding_col_count++;
						}

						if(this.layer['left_menu'][i][j].hasOwnProperty('empty'))
						{
							item.addClass('empty_' + this.layer['left_menu'][i][j]['empty']);
						}

					
						switch(this.elements_lib[elem]['target'])
						{
							case 'checkbox':
								this.hasTask = true;
								item.click(function(){
									if(that.task_completed)
									{
										$(this).removeClass('inputter_container_checked');
										that.task_completed = false;
									}
									else
									{
										$(this).addClass('inputter_container_checked');
										that.task_completed = true;
									}
								});
								break;
							default :
								break;
						}
						item.appendTo(row);
						if(elem != 'chkTask')
						{
							col_count ++;
						}
						
					}
					
				}
			}

			row.appendTo(left_menu);	
			if(col_count > max_left_col_count){
				max_left_col_count  = col_count;
			}
		}
		
	}


	if(this.layer.hasOwnProperty('right_menu'))
	{
		mobile_right_col_count = 0;
		for(var i in this.layer['right_menu'])
		{
			col_count = 0;
			var row = $('#-inputter_menu_row').clone();
			row.prop('id','');

			if($.isArray(this.layer['right_menu'][i]))
			{
				for(var j = this.layer['right_menu'][i].length -1 ; j >= 0 ; j-- )//in this.layer['right_menu'][i])
				{
					var tmp = this.layer['right_menu'][i][j];
					var elem = this.layer['right_menu'][i][j]['element'];
					if(typeof this.elements_lib[elem] !== 'undefined')
					{
						var item = $('#-inputter_element_'+this.elements_lib[elem]['target']).clone();
						item.prop('id',this.panel_id +'_'+ this.elements_lib[elem]['target']);
						item.appendTo(row);

						if((this.elements_lib[elem].hasOwnProperty('mobile_hide') && this.elements_lib[elem]['mobile_hide'])
						|| (this.layer['right_menu'][i][j].hasOwnProperty('mobile_hide') && this.layer['right_menu'][i][j]['mobile_hide']))
						{
							item.addClass('mobile_hide');
						}
						else{
							mobile_right_col_count ++ ;
						}

						if(this.layer['right_menu'][i][j].hasOwnProperty('empty'))
						{
							item.addClass('empty_' + this.layer['right_menu'][i][j]['empty']);
						}

						switch(this.elements_lib[elem]['target'])
						{
							case 'send':
								if(this.layer['right_menu'][i][j].hasOwnProperty('click'))
								{
									item.click(this.layer['right_menu'][i][j]['click'],function(event){
										var fn = event.data;
										fn(that);
										$('.empty_show').removeClass('mobile_hide');
										$('.empty_hide').addClass('mobile_hide');
									});
								}
								break;
							case 'attachment' :
								var auto_upload = this.layer.hasOwnProperty('auto_upload') ? this.layer['auto_upload'] : true;
								item.click({'type':this.upload_ptype,'pid':this.upload_pid},function(event){
									var type = event.data.type ;
									var pid = event.data.pid ;
									app_upload_open_files(type, pid,false,auto_upload,'inputter_files_'+type+'_'+pid);
								});
								if(!this.layer['right_menu'][i].hasOwnProperty('click') && !auto_upload)
								{
									
									app_application_lincko.add(this.panel_id+'_inputter_container', 'upload', 
									function(){
										var files_queue = container.find('[find=files_queue]').get(0);
										var files = app_upload_files.lincko_files;

										var count = 0;
										for(var z in files)
										{
											if(files[z].lincko_parent_type == this.action_param[0]
											&&files[z].lincko_parent_id == this.action_param[1]
											&&files[z].lincko_param == 'inputter_files_' + this.action_param[0]+'_'+this.action_param[1])
											{
												if($('#inputter_element_uploading_item_'+files[z].lincko_temp_id).length == 0)
												{
													var item = $('#-inputter_element_uploading_item').clone();
													item.prop('id','inputter_element_uploading_item_'+files[z].lincko_temp_id);
													item.appendTo(files_queue);
												}
												else{
													var target = $('#inputter_element_uploading_item_'+files[z].lincko_temp_id);
													var preview = null;
													try{
														preview = files[z].files[0].preview.toDataURL();
													}
													catch(e)
													{
														
													}
													if(preview == null || preview == '')
													{
														if(count == 0)
														{
															$('#'+this.action_param[2]+'_attachment .inputter_ico').addClass('mobile_hide');

															$('#'+this.action_param[2]+'_attachment .inputter_preview')
																.find(".shortcut_pic")
																.addClass('display_none');

															$('#'+this.action_param[2]+'_attachment .inputter_preview')
																.find(".shortcut_ico")
																.removeClass('display_none')
																.find("i")
																.addClass(app_models_fileType.getClass(app_models_fileType.getExt(files[z].lincko_name)));
														}


														
														target.attr('title',files[z].lincko_name);
														target.find(".shortcut_pic").addClass('display_none');
														target.find(".shortcut_ico").removeClass('display_none').find("i").addClass(app_models_fileType.getClass(app_models_fileType.getExt(files[z].lincko_name)));
													}else
													{
														if(count == 0)
														{
															$('#'+this.action_param[2]+'_attachment .inputter_ico').addClass('mobile_hide');
															
															$('#'+this.action_param[2]+'_attachment .inputter_preview')
															    .find(".shortcut_ico")
																.addClass('display_none');

															var width =  files[z].files[0].preview.width;
															var height =  files[z].files[0].preview.height;
															var width_style  = width > height ? 30 : 'auto';
															var height_style = width > height ? 'auto': 30;
															var padding_top_style  = width > height ? (30 - (30 * height /width))/2  : 0;
															var padding_left_style  = width > height ? 0 : (30 - (30*width/height))/2;

															$('#'+this.action_param[2]+'_attachment .inputter_preview')
															    .find(".shortcut_pic")
																.removeClass('display_none')
																.attr('src',preview)
																.css('height',height_style)
																.css('width',width_style)
																.css('padding-top',padding_top_style)
																.css('padding-left',padding_left_style);

														}
														target.attr('title',files[z].lincko_name);
														target.find(".shortcut_ico").addClass('display_none');
														target.find(".shortcut_pic")
																.removeClass('display_none')
																.attr('src',preview);
													}
												}
												count ++;
											}
											
										}
										if(count == 0)
										{
											$('#'+this.action_param[2]+'_attachment .inputter_ico').removeClass('mobile_hide');

											$('#'+this.action_param[2]+'_attachment .inputter_preview')
																.find(".shortcut_pic")
																.addClass('display_none')
																.attr('src','');

											$('#'+this.action_param[2]+'_attachment .inputter_preview')
												.find('.shortcut_ico')
												.addClass('display_none')
												.find('i')
												.removeClass()
												.addClass('fa')
												.addClass('inputter_preview_icon');
										}
										
									},[this.upload_ptype,this.upload_pid,this.panel_id]);
									
									
								}
								break;
						}
						item.appendTo(row);
						col_count ++;
					}
					
				}
			}

			row.appendTo(right_menu);	
			if(col_count  > max_right_col_count){
				max_right_col_count  = col_count;
			}
		}
		
	}

	var content = container.find('[find=content_wrapper]');

	content.addClass('margin-left-' + max_left_col_count);
	content.addClass('mobile-margin-left-' + mobile_left_col_count);

	content.addClass('margin-right-' + max_right_col_count);
	content.addClass('mobile-margin-right-' + mobile_right_col_count);

	var input = $('#-inputter_element_content').clone();
	input.prop('id','');
	input.appendTo(content);
	input.find('[find=chat_textarea]').keyup(function(){});

	input.find('[find=chat_textarea]').addClass('padding-left-' + left_padding_col_count);


	if(this.layer.hasOwnProperty('row'))
	{
		input.find('[find=chat_textarea]').addClass('inputter_min_row_'+this.layer['row']);
	}

	if(this.layer.hasOwnProperty('max_row'))
	{
		input.find('[find=chat_textarea]').addClass('inputter_max_row_'+this.layer['max_row']);
	}


	if(this.layer.hasOwnProperty('mobile_row'))
	{
		input.find('[find=chat_textarea]').addClass('inputter_mobile_min_row_'+this.layer['mobile_row']);
	}

	if(this.layer.hasOwnProperty('mobile_max_row'))
	{
		input.find('[find=chat_textarea]').addClass('inputter_mobile_max_row_'+this.layer['mobile_max_row']);
	}


	if(this.layer.hasOwnProperty('mobile_input_border_flag'))
	{
		if(this.layer['mobile_input_border_flag'])
		{
			input.find('[find=chat_textarea]').addClass('inputter_mobile_input_border_orange');
		}
	}

	input.find('[find=chat_textarea]').on('keyup',function(){
		if($.trim(this.innerText).length > 0)
		{
			$('.empty_show').addClass('mobile_hide');
			$('.empty_hide').removeClass('mobile_hide');
		}
		else
		{
			$('.empty_show').removeClass('mobile_hide');
			$('.empty_hide').addClass('mobile_hide');
		}
	});

	input.find('[find=chat_textarea]').on('paste',function(e,data){
		var target = this;
		setTimeout(function(){
			target.innerHTML = target.innerHTML.replace(/<(br).*?>/g,"<br/>").replace(/<(?!br).*?>/g,"");
		},5);
	});



	input.find('[find=chat_textarea]').keypress(function(e){
		e.stopPropagation();
		if(e.keyCode==13)
		{
			if(e.shiftKey)
			{
				e.returnValue=false;
				return;
			}	
			else
			{
				e.preventDefault();
				if(this.innerText.length > 0 && that.layer.hasOwnProperty('enter'))
				{
					if(that.burger == null)
					{
						var fn = that.layer['enter'];
						fn(that);
					}
					$('.empty_show').removeClass('mobile_hide');
					$('.empty_hide').addClass('mobile_hide');
					return;
				}
				else
				{
					base_show_error(Lincko.Translation.get('app', 64, 'js'), true);//no empty
				}
			}
			
		}
	});



	if(!supportsTouch && !this.hasTask){
		setTimeout(function(){
		input.find('[find=chat_textarea]').get(0).focus();
		},200);
	}

	if(this.hasTask)
	{
		var defaultPhrase = Lincko.Translation.get('app', 2204, 'html'); //type here to add a task
		input.find('[find=chat_textarea]').get(0).innerText = defaultPhrase;

		var cancelBlur = false;
		input.find('[find=chat_textarea]').focus(function(event, param){
			if(typeof param == 'object' && param.cancelBlur){ cancelBlur = true; }

			//$(this).closest('[find=toggleOpacity]').removeClass('burger_typeTask_opacity');
			if($(this).html() == defaultPhrase){
				$(this).text('');
				burgerN.placeCaretAtEnd($(this));
			}
		});
		input.find('[find=chat_textarea]').blur(function(event){
			if(cancelBlur){
				event.preventDefault();
				cancelBlur = false;
				return;
			}
			
			//$(this).closest('[find=toggleOpacity]').addClass('burger_typeTask_opacity');
			if($(this).html() == ''){
				$(this).html(defaultPhrase);
			}
		});
	}
	


	
	if(this.burger != null){
		if(that.burger.enter_fn_param == 'inputter')
		{
			that.burger.enter_fn_param = this;
		}	
		burgerN.regex(input.find('[find=chat_textarea]').eq(0), null, that.burger);	
	}

	container.appendTo(this.position);


}






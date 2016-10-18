
var inputter = function(submenu,position,type,pid,layer,burger)
{
	this.elements_lib = 
	{
		chkTaskFinish :
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

	this.submenu = submenu;
	this.position = position;
	this.type = type ;
	this.pid = pid;
	this.layer = layer;
	this.burger = burger;
	this.buildLayer();
	
	
}

inputter.prototype.buildLayer = function()
{

	var that = this ;
	var container = $('#-inputter_container').clone();
	container.prop('id',this.submenu.id+'_inputter_container');


	if(this.layer.hasOwnProperty('mobile_backgroup_flag') && this.layer['mobile_backgroup_flag'])
	{
		container.addClass('inputter_mobile_backgroup_gray');
	}
	

	var line = this.layer.hasOwnProperty('top_line') && this.layer['top_line'] ? 1 : 0;
	var mobile_line = this.layer.hasOwnProperty('mobile_top_line') && this.layer['mobile_top_line'] ? 1 : 0;
	container.addClass('inputter_line_' + line + mobile_line);


	var menu = container.find('[find=menu_wrapper]');

	var col_count = 0;
	var max_col_count  = 0;

	var mobile_col_count  = 0;
	
	if(this.layer.hasOwnProperty('menu'))
	{
		mobile_col_count = 0;
		for(var i in this.layer['menu'])
		{
			col_count = 0;
			var row = $('#-inputter_menu_row').clone();
			row.prop('id','');

			if($.isArray(this.layer['menu'][i]))
			{
				for(var j = this.layer['menu'][i].length -1 ; j >= 0 ; j-- )//in this.layer['menu'][i])
				{
					var tmp = this.layer['menu'][i][j];
					var elem = this.layer['menu'][i][j]['element'];
					if(typeof this.elements_lib[elem] !== 'undefined')
					{
						var item = $('#-inputter_element_'+this.elements_lib[elem]['target']).clone();
						item.prop('id',this.submenu.id +'_'+ this.elements_lib[elem]['target']);
						item.appendTo(row);

						if((this.elements_lib[elem].hasOwnProperty('mobile_hide') && this.elements_lib[elem]['mobile_hide'])
						|| (this.layer['menu'][i][j].hasOwnProperty('mobile_hide') && this.layer['menu'][i][j]['mobile_hide']))
						{
							item.addClass('mobile_hide');
						}
						else{
							mobile_col_count ++ ;
						}

						if(this.layer['menu'][i][j].hasOwnProperty('empty'))
						{
							item.addClass('empty_' + this.layer['menu'][i][j]['empty']);
						}

					
						switch(this.elements_lib[elem]['target'])
						{
							case 'send':
								if(this.layer['menu'][i][j].hasOwnProperty('click'))
								{
									var fn = this.layer['menu'][i][j]['click'];
									item.click(fn,function(event){
										var msg = container.find('[find=chat_textarea]').get(0).innerHTML.replace(/<div>/g,"<br>").replace(/<\/div>/g,"");
										var fn = event.data;
										fn(msg);
										
										container.find('[find=chat_textarea]').get(0).innerHTML = '';
										
										$('.empty_show').removeClass('mobile_hide');
										$('.empty_hide').addClass('mobile_hide');
									});
								}
								break;
							case 'attachment' :
								var auto_upload = this.layer.hasOwnProperty('auto_upload') ? this.layer['auto_upload'] : true;
								item.click({'type':this.type,'pid':this.pid},function(event){
									var type = event.data.type ;
									var pid = event.data.pid ;
									app_upload_open_files(type, pid,false,auto_upload,'inputter_files_'+type+'_'+pid);
								});
								if(!this.layer['menu'][i].hasOwnProperty('click') && !auto_upload)
								{
									
									app_application_lincko.add(this.submenu.id+'_inputter_container', 'upload', 
									function(){
										var files_queue = container.find('[find=files_queue]').get(0);
										var files = app_upload_files.lincko_files;
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
														target.find(".shortcut_pic").addClass('display_none');
														target.find(".shortcut_ico").removeClass('display_none').find("i").addClass(app_models_fileType.getClass(app_models_fileType.getExt(files[z].lincko_name)));
														
													}else
													{
														target.find(".shortcut_ico").addClass('display_none');
														target.find(".shortcut_pic")
																.removeClass('display_none')
																.attr('src',preview);
													}
												}
											}
											
										}
										
									},[this.type,this.pid]);
									
									
								}
								break;
						}
						item.appendTo(row);
						col_count ++;
					}
					
				}
			}
			else
			{
				var elem = this.layer['menu'][i]['element'];
				if(typeof this.elements_lib[elem] !== 'undefined')
				{
					var item = $('#-inputter_element_'+this.elements_lib[elem]['target']).clone();
					item.prop('id',this.submenu.id +'_'+ this.elements_lib[elem]['target']);
					if((this.elements_lib[elem].hasOwnProperty('mobile_hide') && this.elements_lib[elem]['mobile_hide'])
						|| (this.layer['menu'][i].hasOwnProperty('mobile_hide') && this.layer['menu'][i]['mobile_hide']))
					{
						item.addClass('mobile_hide');
					}
					else{
						mobile_col_count ++ ;
					}

					if(this.layer['menu'][i].hasOwnProperty('empty'))
					{
						item.addClass('empty_' + this.layer['menu'][i]['empty']);
					}

					

					switch(this.elements_lib[elem]['target'])
					{
						case 'send':
							if(this.layer['menu'][i].hasOwnProperty('click'))
							{
								var fn = this.layer['menu'][i]['click'];
								item.click(fn,function(event){
									var msg = container.find('[find=chat_textarea]').get(0).innerHTML.replace(/<div>/g,"<br>").replace(/<\/div>/g,"");
									var fn = event.data;
									fn(msg);
									container.find('[find=chat_textarea]').get(0).innerHTML = '';
									
									$('.empty_show').removeClass('mobile_hide');
									$('.empty_hide').addClass('mobile_hide');
								});
							}
							break;
						case 'attachment' :
							var auto_upload = this.layer.hasOwnProperty('auto_upload') ? this.layer['auto_upload'] : true;
							item.click({'type':this.type,'pid':this.pid},function(event){
								var type = event.data.type ;
								var pid = event.data.pid ;
								app_upload_open_files(type, pid,false,auto_upload,'inputter_files_'+type+'_'+pid);
							});
							if(!this.layer['menu'][i].hasOwnProperty('click') && !auto_upload)
							{
								app_application_lincko.add(this.submenu.id+'_inputter_container', 'upload', 
								function(){
									var files_queue = container.find('[find=files_queue]').get(0);
									var files = app_upload_files.lincko_files;
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
													target.find(".shortcut_pic").addClass('display_none');
													target.find(".shortcut_ico").removeClass('display_none').find("i").addClass(app_models_fileType.getClass(app_models_fileType.getExt(files[z].lincko_name)));
													
												}else
												{
													target.find(".shortcut_ico").addClass('display_none');
													target.find(".shortcut_pic")
															.removeClass('display_none')
															.attr('src',preview);
												}
											}
										}
										
									}
									
								},[this.type,this.pid]);
							}
							break;
					}

					item.appendTo(row);
					col_count ++;
				}
			}
			row.appendTo(menu);	
			if(col_count  > max_col_count){
				max_col_count  = col_count;
			}
		}
		
	}

	var content = container.find('[find=content_wrapper]');
	content.addClass('margin-right-' + max_col_count);
	content.addClass('mobile-margin-right-' + mobile_col_count);

	var input = $('#-inputter_element_content').clone();
	input.prop('id','');
	input.appendTo(content);
	input.find('[find=chat_textarea]').keyup(function(){});


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
		input.find('[find=chat_textarea]').addClass('inputter_mobile_input_border_orange');
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
				var msg = this.innerHTML.replace(/<div>/g,"<br>").replace(/<\/div>/g,"");

				if(this.innerText.length > 0 && that.layer.hasOwnProperty('enter'))
				{
					var fn = that.layer['enter'];
					fn(msg);
					$(this).html('');
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

	setTimeout(function(){
		input.find('[find=chat_textarea]').get(0).focus();
	},200);


	input.find('[find=chat_textarea]').focus(function(){
		submenu_resize_content();
	});
	
	


	if(this.burger){
		burgerN.regex(input.find('[find=chat_textarea]').eq(0), null, {'type':this.type,'id':pid});	
	}

	container.appendTo(this.position);
}


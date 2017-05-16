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
		btSwitch :
		{
			target : 'switch',
		},
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
	this.focus_flag = false;
	this.touch_now = false;
	this.buildLayer();


	this.inputter_current_audio_touch_clientY = 0;
	this.inputter_start_audio_touch_clientY = 0;
	this.inputter_audio_operation_interval;
	this.inputter_audio_operation_status = 0; //1:send;2:cancel;
	this.inputter_audio_operation_icon_interval;
	this.inputter_audio_duration = 0;
	this.inputter_audio_duration_interval;
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
			&& files[i].lincko_parent_id == this.upload_pid
			&& files[i].lincko_param == this.panel_id)
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

inputter.prototype.destroy = function()
{
	var auto_upload = this.layer.hasOwnProperty('auto_upload') ? this.layer['auto_upload'] : true;
	if(!auto_upload)
	{
		for(var i in app_upload_files.lincko_files)
		{
			if(app_upload_files.lincko_files[i].lincko_parent_type == this.upload_ptype
				&& app_upload_files.lincko_files[i].lincko_parent_id == this.upload_pid
				&& app_upload_files.lincko_files[i].lincko_param == this.panel_id)
			{
				var e; //undefined
				$('#app_upload_fileupload').fileupload('option').destroy(e, app_upload_files.lincko_files[i]);
			}
		}
	}
	$('#'+this.panel_id+'_inputter_container').recursiveRemove();
	delete this;
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
				&& app_upload_files.lincko_files[i].lincko_parent_id == this.upload_pid
				&& app_upload_files.lincko_files[i].lincko_param == this.panel_id)
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

inputter.prototype.clearText = function()
{
	this.task_completed = false;
	var container = $('#'+this.panel_id+'_inputter_container');
	container.find('[find=chat_textarea]').get(0).innerHTML = '';
} 



inputter.prototype.buildLayer = function()
{
	var that = this ;
	var container = $('#-inputter_container').clone();
	container.prop('id',this.panel_id + '_inputter_container');

	if(this.layer.hasOwnProperty('mobile_backgroup_flag') && this.layer['mobile_backgroup_flag'])
	{
		container.addClass('inputter_mobile_backgroup_gray');
	}
	

	var line = this.layer.hasOwnProperty('top_line') && this.layer['top_line'] ? 1 : 0;
	var mobile_line = this.layer.hasOwnProperty('mobile_top_line') && this.layer['mobile_top_line'] ? 1 : 0;
	container.addClass('inputter_line_' + line + mobile_line);

	container.find("[find=files_queue_wrapper]").eq(0).prop("id",this.panel_id + "_files_queue_wrapper");

	var left_menu = container.find('[find=left_menu_wrapper]');
	var right_menu = container.find('[find=right_menu_wrapper]');

	var col_count = 0;
	var max_right_col_count  = 0;
	var max_left_col_count  = 0;

	var mobile_left_col_count  = 0;
	var mobile_right_col_count  = 0;

	var left_margin_col_count = 0;
	
	if(this.layer.hasOwnProperty('left_menu'))
	{
		mobile_left_col_count = 0;
		left_margin_col_count = 0;
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
					if(typeof this.layer['left_menu'][i][j]['compatibility'] !== 'undefined')
					{
						if(this.layer['left_menu'][i][j]['compatibility'] == 'app' && !isMobileApp())
						{
							break;
						}
						else if (isMobileApp() && device_type() == 'android' && typeof android.audio_cancel == 'undefined')
						{
							break;
						}
						else if (isMobileApp() && device_type() == 'ios' &&  ios_app_version < 7)//for audio check ios version
						{
							break;
						}
					}
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
							left_margin_col_count++;
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

									if(supportsTouch)
									{
										if(that.focus_flag){
											input.find('[find=chat_textarea]').trigger('focus', {cancelBlur: true});

											var range = document.createRange();
											range.selectNodeContents(input.find('[find=chat_textarea]').get(0));
											range.collapse(false);
											var sel = window.getSelection();
											sel.removeAllRanges();
											sel.addRange(range);
										}
									}
									else
									{
										input.find('[find=chat_textarea]').trigger('focus', {cancelBlur: true});

										var range = document.createRange();
										range.selectNodeContents(input.find('[find=chat_textarea]').get(0));
										range.collapse(false);
										var sel = window.getSelection();
										sel.removeAllRanges();
										sel.addRange(range);	
									}
									that.touch_now = false;
								});
								item.on("touchstart mousedown",function(){
									that.touch_now = true;
								});
								break;
							case 'switch':
								item.addClass('audio');
								item.find('.inputter_ico').addClass('inputter_audio icon-audio');
								item.click(function(){
									if($(this).hasClass('audio'))
									{
										$(this).removeClass('audio');
										$(this).find('.inputter_ico').removeClass('inputter_audio icon-audio');
										$(this).addClass('keyboard');
										$(this).find('.inputter_ico').addClass('inputter_keyboard fa fa-keyboard-o');

										content.find('[find=chat_audio]').removeClass('display_none');
										content.find('[find=chat_textarea]').addClass('display_none');
									}
									else if($(this).hasClass('keyboard'))
									{
										$(this).removeClass('keyboard');
										$(this).find('.inputter_ico').removeClass('inputter_keyboard fa fa-keyboard-o');
										$(this).addClass('audio');
										$(this).find('.inputter_ico').addClass('inputter_audio icon-audio');

										content.find('[find=chat_textarea]').removeClass('display_none');
										content.find('[find=chat_audio]').addClass('display_none');
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
								if(this.hasTask)
								{
									item.attr("title",Lincko.Translation.get('app', 4001, 'js'));//Create the task
									item.find(".inputter_ico").addClass("icon-Big-Add inputter_icon_blue inputter_icon_big_size inputter_icon_add_fix");
								}
								else
								{
									item.attr("title",Lincko.Translation.get('app', 4002, 'js'));//Send
									item.find(".inputter_ico").addClass("fa fa-send-o");
								}
								
								if(this.layer['right_menu'][i][j].hasOwnProperty('click'))
								{
									item.click(this.layer['right_menu'][i][j]['click'],function(event){
									var files = app_upload_files.lincko_files;
									var files_count = 0;
									for(var i in files)
									{
										if(files[i].lincko_parent_type == that.upload_ptype
											&& files[i].lincko_parent_id == that.upload_pid
											&& files[i].lincko_param == that.panel_id)
										{
											files_count++;
										}
									}
									var innerText = content.find('[find=chat_textarea]').get(0).innerText;
									if(that.hasTask)
									{
										
										if(innerText == Lincko.Translation.get('app', 2204, 'html'))//type here to add a task
										{
											content.find('[find=chat_textarea]').get(0).innerText = '';
											innerText = '';
										}
									}
									if(
										(innerText.length > 0 && that.layer.hasOwnProperty('enter') && !that.hasTask)
										|| ((innerText.length > 0 || files_count > 0) && that.layer.hasOwnProperty('enter') && that.hasTask)
									  )
										{
											var fn = event.data;
											fn(that);

											content.removeClass('mobile-margin-right-' + mobile_show_count);

											$('.empty_show').removeClass('mobile_hide');
											$('.empty_hide').addClass('mobile_hide');

											mobile_show_count = right_menu.find("li:not(.mobile_hide)").length;
											content.addClass('mobile-margin-right-' + mobile_show_count);
										}
										else
										{
											base_show_error(Lincko.Translation.get('app', 64, 'js'), true);//can not be empty
										}

										if(that.hasTask)
										{
											content.find('[find=chat_textarea]').get(0).innerText = Lincko.Translation.get('app', 2204, 'html');//type here to add a task
											myIScrollList[that.panel_id+"_files_queue_wrapper"].refresh();
											content.find('[find=chat_textarea]').focus();
										}
									});
								}
								break;
							case 'attachment' :

								if(this.hasTask)
								{
									item.find(".inputter_ico").addClass("icon-links");
								}
								else
								{
									item.find(".inputter_ico").addClass("icon-Add");
								}

								item.attr("title",Lincko.Translation.get('app', 4003, 'js'));//Attach a new file 
								var auto_upload = this.layer.hasOwnProperty('auto_upload') ? this.layer['auto_upload'] : true;
								item.click({'type':this.upload_ptype,'pid':this.upload_pid,'panel_id':this.panel_id,'position':this.position},function(event){
									
									var type = event.data.type ;
									var pid = event.data.pid ;
									var panel_id = event.data.panel_id ;
									var position = event.data.position ;

									if(supportsTouch)
									{
										var files_queue = container.find('[find=files_queue]');
										if(files_queue.find('li').length == 0)
										{
											app_upload_open_files(type, pid,false,auto_upload,panel_id);
										}
										else{
											var parm_upload = {
												upload_type:type,
												upload_pid:pid,
												upload_param:panel_id,
												upload_flag:null,
												old_upload_flag:null,
											};
											submenu_Build('filemanager', true, null, parm_upload, true);
										}
									}
									else
									{
										app_upload_open_files(type, pid,false,auto_upload,panel_id);
									}
								});

								item.find('.inputter_preview').addClass('display_none');
								if(!this.layer['right_menu'][i].hasOwnProperty('click') && !auto_upload)
								{
									
									app_application_lincko.add(this.panel_id+'_inputter_container', 'upload', 
									function(){
										var files_queue = container.find('[find=files_queue]').get(0);
										var files = app_upload_files.lincko_files;

										var count = 0;

										var upload_flag = {};
										for(var z in files)
										{

											if(files[z].lincko_parent_type == this.action_param[0]
											&& files[z].lincko_parent_id == this.action_param[1]
											&& files[z].lincko_param == this.action_param[2])
											{

												var file_index = files[z]["lincko_files_index"];
												upload_flag[file_index]=true;

												$('#'+this.action_param[2]+'_attachment .inputter_preview').removeClass('display_none');
												if($('#inputter_element_uploading_item_'+files[z].lincko_temp_id).length == 0)
												{
													var item = $('#-inputter_element_uploading_item').clone();
													item.prop('id','inputter_element_uploading_item_'+files[z].lincko_temp_id);
													item.attr("file-index",file_index);
													item.appendTo(files_queue);

													//remove button
													var target_id = 'inputter_element_uploading_item_'+files[z].lincko_temp_id;
													item.find('[find=shortcut_remove]').click({target_id:target_id,index:z},function(event){
															event.stopPropagation();
															var id = event.data.target_id;
															var index = event.data.index;
															app_upload_files.lincko_files[index].lincko_status = 'deleted';
															$('#app_upload_fileupload').fileupload('option').destroy(event, app_upload_files.lincko_files[index]);
															$('#'+id).recursiveRemove(0);
													});
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
																.find("i")
																.addClass(app_models_fileType.getClass(app_models_fileType.getExt(files[z].lincko_name)));
																$('#'+this.action_param[2]+'_attachment .inputter_preview')
																.find(".shortcut_ico").removeClass("display_none");
														}
														else
														{
															$('#'+this.action_param[2]+'_attachment .inputter_preview').removeClass('display_none');
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
															var margin_left_style  = width > height ? 0 : (30 - (30 * width/height))/2;

															$('#'+this.action_param[2]+'_attachment .inputter_preview')
																.find(".shortcut_pic")
																.removeClass('display_none')
																.attr('src',preview)
																.css('height',height_style)
																.css('width',width_style)
																.css('padding-top',padding_top_style)
																.css('margin-left',margin_left_style);

														}
														else
														{
															$('#'+this.action_param[2]+'_attachment .inputter_preview').removeClass('display_none');
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

										//setTimeout(function(){
											$.each($(files_queue).find('li'),function(){
												var item_index = $(this).attr("file-index");
												if(typeof upload_flag[item_index] === "undefined")
												{
													$(this).recursiveRemove(0);
												}
											});
										//},0,upload_flag)
											
									
										if(count == 0)
										{
											$('#'+this.action_param[2]+'_attachment .inputter_ico').removeClass('mobile_hide');

											$('#'+this.action_param[2]+'_attachment .inputter_preview')
												.addClass('display_none');

											$('#'+this.action_param[2]+'_attachment .inputter_preview')
																.find(".shortcut_pic")
																.addClass('display_none')
																.attr('src','');

											$('#'+this.action_param[2]+'_attachment .inputter_preview')
												.find('.shortcut_ico')
												.addClass('display_none')
												.find('i')
												.addClass('fa')
												.addClass('inputter_preview_icon');
										}


										setTimeout(function(panel_id){
											if(typeof myIScrollList[panel_id+"_files_queue_wrapper"] != "undefined")
											{
												myIScrollList[panel_id+"_files_queue_wrapper"].refresh();
											}
										},0,this.action_param[2]);
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

	content.addClass('margin-left-' + left_margin_col_count);
	content.addClass('margin-right-' + max_right_col_count);
	content.addClass('mobile-margin-right-' + mobile_right_col_count);

	

	var input = $('#-inputter_element_content').clone();
	input.prop('id','');
	input.appendTo(content);



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

	if(this.layer.hasOwnProperty('auto_upload'))
	{
		if(this.layer['auto_upload'])
		{
			container.find('[find=uploading_wrapper]').hide();
		}
	}

	var mobile_show_count = 0 ;
	mobile_show_count = mobile_right_col_count;

	input.find('[find=chat_textarea]').on('keyup',function(e){
		if(!flag && e.keyCode == 13 && that.hasTask){
			e.which = null;
			e.keyCode = null;
			e.preventDefault();
		}


		if(!(e.keyCode == 13 && that.hasTask))
		{
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
		}


		content.removeClass('mobile-margin-right-' + mobile_show_count);
		//content.addClass('mobile-margin-right-' + mobile_right_col_count);

		var left_menu = container.find('[find=left_menu_wrapper]');
		var right_menu = container.find('[find=right_menu_wrapper]');
		mobile_show_count = right_menu.find("li:not(.mobile_hide)").length;
		content.addClass('mobile-margin-right-' + mobile_show_count);
	});


	function cleanHtmlTag(source){
		if(typeof removeBr == 'undefined') {
			removeBr = true;
		}

		source = source.replace(/<\!\-\-([\s\S]*?)\-\->/gi,"");
		//source = source.replace(/<(?!img|br|p|\/p).*?>/gi,"");
		source = source.replace(/<(?!br|p|\/p).*?>/gi,"");
		source = source.replace(/<p([\s\S]*?)>([\s\S]*?)<\/p>/gi,"$2<br/>");
		source = source.replace(/[\r\n]/g, "");
		return source;
	}

	input.find('[find=chat_textarea]').on('paste',function(e,data){
		var target = this;
		setTimeout(function(){
			target.innerHTML = cleanHtmlTag(target.innerHTML);
			// target.innerHTML = cleanAndPaste(target.innerHTML
			// 	.replace(/<(br).*?>/g,"<br/>")
			// 	.replace(/<(?!br).*?>/g,"")
			// 	.replace(/[\r\n]/g, ""));
			$('.empty_show').addClass('mobile_hide');
			$('.empty_hide').removeClass('mobile_hide');

			content.removeClass('mobile-margin-right-' + mobile_show_count);
			//content.addClass('mobile-margin-right-' + mobile_right_col_count);

			var left_menu = container.find('[find=left_menu_wrapper]');
			var right_menu = container.find('[find=right_menu_wrapper]');
			mobile_show_count = right_menu.find("li:not(.mobile_hide)").length;
			content.addClass('mobile-margin-right-' + mobile_show_count);
		},0);
	});

	input.find('[find=chat_audio]').on('touchcancel',function(event){
		$(this).css('background-color','#fba026');
		var inputter_record_impression = $('#inputter_record_impression');
		inputter_record_impression.addClass('display_none');
		clearInterval(that.inputter_audio_operation_interval);
		clearInterval(that.inputter_audio_operation_icon_interval);
		clearInterval(that.inputter_audio_duration_interval);

		if(device_type() == 'ios'){
			window.webkit.messageHandlers.iOS.postMessage(
			{
				action: 'audio_cancel',
			});
		}
		else if(device_type() == 'android'){
			android.audio_cancel();
		}
	});

	input.find('[find=chat_audio]').on('touchstart',function(event){
		event.preventDefault();
		$(this).css('background-color','#f7cf99');
		var showInfo = false;
		
		if(device_type() == 'ios'){
			window.webkit.messageHandlers.iOS.postMessage(
			{
				action: 'audio_start',
			});
			showInfo = true;
		}
		else if(device_type() == 'android'){
			if(android.getAndroidOS()>=23){
				showInfo = android.hasAudioPermission();
				if(android.hasAudioPermission()){
					android.audio_start();
				}
			}
			else{
				showInfo = false;
				android.audio_start();
			}	
		}

		that.inputter_audio_duration = 0;
		that.inputter_current_audio_touch_clientY = 0;
		that.inputter_start_audio_touch_clientY = 0;
		that.inputter_audio_operation_status = 1;

		if(showInfo)
		{
			var inputter_record_impression;
			if($('#inputter_record_impression').length == 0){
				inputter_record_impression = $('#-inputter_record_impression').clone();
				inputter_record_impression.prop('id','inputter_record_impression');//toto:need to name a good id

				$('body').append(inputter_record_impression);
			}
			else{
				inputter_record_impression = $('#inputter_record_impression');		
			}

			inputter_record_impression.removeClass('display_none');
			inputter_record_impression.find('[find=icon] span').removeClass('fa fa-undo inputter_record_impression_icon_samll');
			inputter_record_impression.find('[find=icon] span').addClass('icon-audio');	
			inputter_record_impression.find('[find=text]').text(Lincko.Translation.get('app', 113, 'js'));//Swipe up to cancel

			inputter_record_impression.css("top",($(window).height()-inputter_record_impression.height())/2);
			inputter_record_impression.css("left",($(window).width()-inputter_record_impression.width())/2);
			that.inputter_current_audio_touch_clientY = event.originalEvent.changedTouches[0].clientY;
			that.inputter_start_audio_touch_clientY = that.inputter_current_audio_touch_clientY;

			var icon_index = ['1','2',''];
			var index = 0;

			clearInterval(that.inputter_audio_operation_icon_interval);
			that.inputter_audio_operation_icon_interval = setInterval(function(){
				inputter_record_impression.find('[find=icon] span')
					.removeClass('icon-audio' + icon_index[((index+1) % 3)]);
				inputter_record_impression.find('[find=icon] span')
					.removeClass('icon-audio' + icon_index[((index+2) % 3)]);
				inputter_record_impression.find('[find=icon] span')
					.addClass('icon-audio' + icon_index[(index % 3)]);
				index++;
			},400);			
		}

		clearInterval(that.inputter_audio_duration_interval);
		that.inputter_audio_duration_interval = setInterval(function(){
				that.inputter_audio_duration += 1000;
		},1000);
	});




	input.find('[find=chat_audio]').on('touchmove',function(event){
		var inputter_record_impression = $('#inputter_record_impression');
		that.inputter_current_audio_touch_clientY = event.originalEvent.changedTouches[0].clientY;

		if(that.inputter_start_audio_touch_clientY - that.inputter_current_audio_touch_clientY >= 40){
			if(that.inputter_audio_operation_status!==2)
			{
				clearInterval(that.inputter_audio_operation_icon_interval);
				that.inputter_audio_operation_icon_interval = 0;
				inputter_record_impression.find('[find=text]').text(that.inputter_audio_operation_icon_interval);
				that.inputter_audio_operation_status = 2;
				inputter_record_impression.find('[find=icon] span').removeClass('icon-audio');
				inputter_record_impression.find('[find=icon] span').removeClass('icon-audio1');
				inputter_record_impression.find('[find=icon] span').removeClass('icon-audio2');
				inputter_record_impression.find('[find=icon] span').addClass('fa fa-undo inputter_record_impression_icon_samll');
				inputter_record_impression.find('[find=text]').text(Lincko.Translation.get('app', 112, 'js'));//Release to cancel
			}
		}
		else{
			if(that.inputter_audio_operation_status!==1)
			{
				that.inputter_audio_operation_status = 1;
				inputter_record_impression.find('[find=icon] span').removeClass('fa fa-undo inputter_record_impression_icon_samll');
				inputter_record_impression.find('[find=icon] span').addClass('icon-audio');	
				inputter_record_impression.find('[find=text]').text(Lincko.Translation.get('app', 113, 'js'));//Swipe up to cancel

				var icon_index = ['1','2',''];
				var index = 0;

				if(that.inputter_audio_operation_icon_interval == 0)
				{
					clearInterval(that.inputter_audio_operation_icon_interval);
					that.inputter_audio_operation_icon_interval = setInterval(function(){
						inputter_record_impression.find('[find=icon] span')
							.removeClass('icon-audio' + icon_index[((index+1) % 3)]);
						inputter_record_impression.find('[find=icon] span')
							.removeClass('icon-audio' + icon_index[((index+2) % 3)]);
						inputter_record_impression.find('[find=icon] span')
							.addClass('icon-audio' + icon_index[(index % 3)]);
						index++;
					},400);
				}
			}
		}
	});


	input.find('[find=chat_audio]').on('touchend',function(){
		$(this).css('background-color','#fba026');
		var inputter_record_impression = $('#inputter_record_impression');
		inputter_record_impression.addClass('display_none');
		clearInterval(that.inputter_audio_operation_interval);
		clearInterval(that.inputter_audio_operation_icon_interval);
		clearInterval(that.inputter_audio_duration_interval);

		if(that.inputter_audio_operation_status==1){
			if(device_type() == 'ios'){
				window.webkit.messageHandlers.iOS.postMessage(
				{
					action: 'audio_send',
					value:{
						call_back:'audio_native_callback',
						type:that.upload_ptype,
						pid:that.upload_pid,
						container:input.submenu_getWrapper()[0].id,
						duration:that.inputter_audio_duration,
					}
				});
			}
			else if(device_type() == 'android'){
				android.audio_send('audio_native_callback',that.upload_ptype,that.upload_pid,input.submenu_getWrapper()[0].id,that.inputter_audio_duration);
			}	
		}
		else if(that.inputter_audio_operation_status==2){
			if(device_type() == 'ios'){
				window.webkit.messageHandlers.iOS.postMessage(
				{
					action: 'audio_cancel',
				});
			}
			else if(device_type() == 'android'){
				android.audio_cancel();
			}
		}
	});


	input.find('[find=chat_textarea]').on('cut',function(e,data){
		var target = this;
		setTimeout(function(){
			if(target.innerText.length > 0)
			{
				$('.empty_show').addClass('mobile_hide');
				$('.empty_hide').removeClass('mobile_hide');
			}
			else
			{
				$('.empty_show').removeClass('mobile_hide');
				$('.empty_hide').addClass('mobile_hide');
			}
		},0);
	});


	var flag = true;
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
				var files = app_upload_files.lincko_files;
				var files_count = 0;

				for(var i in files)
				{
					if(files[i].lincko_parent_type == that.upload_ptype
						&& files[i].lincko_parent_id == that.upload_pid
						&& files[i].lincko_param == that.panel_id)
					{
						files_count++;
					}
				}
				if(
					(this.innerText.length > 0 && that.layer.hasOwnProperty('enter') && !that.hasTask)
					|| (((this.innerHTML!="<br>" && this.innerText.length > 0) || files_count > 0) && that.layer.hasOwnProperty('enter') && that.hasTask)
				  )
				{
					flag = true;
					content.removeClass('mobile-margin-right-' + mobile_show_count);
					setTimeout(function(){
						var fn = that.layer['enter'];
						fn(that);
					},0);
					// if(that.burger == null)
					// {
					// 	setTimeout(function(){
					// 		var fn = that.layer['enter'];
					// 		fn(that);
					// 	},0);
					// }

					$('.empty_show').removeClass('mobile_hide');
					$('.empty_hide').addClass('mobile_hide');

					mobile_show_count = right_menu.find("li:not(.mobile_hide)").length;
					content.addClass('mobile-margin-right-' + mobile_show_count);

					$(this).focus();
					return;
				}
				else
				{
					flag = false;
					base_show_error(Lincko.Translation.get('app', 64, 'js'), true);//Can not be empty
					return false;
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
			if(typeof param == 'object' && param.cancelBlur && !responsive.test('maxMobileL')){ cancelBlur = true; }

			//$(this).closest('[find=toggleOpacity]').removeClass('burger_typeTask_opacity');
			if($(this).html() == defaultPhrase){
				$(this).text('');
				burgerN.placeCaretAtEnd($(this), false);
			}
			that.focus_flag = true;
			setTimeout(function(target){
				base_inputter_offset(target);
			}, 0, $(this));
		});
		input.find('[find=chat_textarea]').blur(function(event){
			if(cancelBlur){
				event.preventDefault();
				$(this).focus();
				cancelBlur = false;
				return;
			}
			else if(!supportsTouch)
			{
				var focus_help = $("<input readonly='readonly'/>");
				focus_help.appendTo($("body"));
				focus_help.focus();
				focus_help.recursiveRemove(0);
			}
			
			//$(this).closest('[find=toggleOpacity]').addClass('burger_typeTask_opacity');
			if($(this).html() == ''){
				$(this).html(defaultPhrase);
			}

			if(that.touch_now)
			{
				that.focus_flag = true;
			}
			else
			{
				that.focus_flag = false;
			}
		});

	}

	
	
	if(this.burger != null){
		// if(that.burger.enter_fn_param == 'inputter')
		// {
		// 	that.burger.enter_fn_param = this;
		// }	
		var shortcuts = {at: true, plus: true };
		//disable @ shortcut for personal space
		if(Lincko.storage.get('projects', app_content_menu.projects_id, 'personal_private')){
			delete shortcuts.at;
		}
		var burgerInst = new burger_keyboard(input.find('[find=chat_textarea]').eq(0), null/*lineHeight*/, shortcuts);
		//burgerN.regex(input.find('[find=chat_textarea]').eq(0), null, that.burger);	
	}

	container.appendTo(this.position);

	$('#'+this.panel_id + "_files_queue_wrapper").addClass("overthrow");
	wrapper_IScroll_options_new[this.panel_id + "_files_queue_wrapper"] = { 
		scrollX: true, 
		scrollY: false, 
		mouseWheel: true, 
		fadeScrollbars: true,
	};

}


function audio_native_callback(base64,param){
	//toto:sendAction
	if(typeof param=='string')
	{
		param = JSON.parse(param);
	}
	var temp_id = md5(Math.random());
	wrapper_sendAction({data: base64, parent_type:param.type,parent_id:param.pid,temp_id:temp_id}, 'post', 'file/voice',
		function(){
			
		},
		null,
		function(jqXHR, settings, tmp_id) {
			var data = {
				'id': temp_id,
				'by':  wrapper_localstorage.uid,
				'timestamp': Math.floor((new Date()).getTime() / 1000),
				'content' : base64,
				'duration' : param.duration,
			};
			submenu_getById(param.container).param.chatFeed.app_chat_feed_send_audio(data);
		},
		function(){
			
		}
	);
	//toto:display
}

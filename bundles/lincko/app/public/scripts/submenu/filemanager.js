submenu_list['filemanager'] = {
	//Set the title of the top
	"_title": {
		"style": "customized_title",
		"title": "选择文件",//toto
		"class": "submenu_top_itemSelector",
	},
	"left_button": {
		"style": "title_left_button",
		"title": Lincko.Translation.get('app', 7, 'html'), //Cancel
		'hide': true,
		"class": "base_pointer",
		"action": function(Elem, subm) {
			
		},
	},
	"right_button": {
		"style": "title_right_button",
		"title": Lincko.Translation.get('app', 52, 'html'), //Select
		'hide': true,
		"class": "base_pointer",
		"action": function(Elem, subm) {
			
		},
	},
	"content": {
		"style": "filemanager_content",
		"title": "filemanagerStyle",
		"class": "",
	},
}


Submenu_select.filemanager_content = function(subm){
	subm.AddFilemanagerContent();
};

/*
	available parameters
	param = {
		item: //(optional) the parent item
		hideType: { //(optional) default is available, true means will be hidden
			files: true/false,
			notes: true/false,
		}
	}
*/


Submenu.prototype.AddFilemanagerContent = function() {
	var that = this;
	var border_size = 2;
	var attribute = this.attribute;

	//container
	var submenu_wrapper = this.Wrapper();
	submenu_wrapper.css("width","100%");
	var submenu_content = submenu_wrapper.find("[find=submenu_wrapper_content]");
	submenu_content.prop('id','filemanager_'+that.id);
	
	//elem build & style
	var target = $("#-file_manager_container").clone();
	target.prop("id","file_manager_container");
	target.removeClass("display_none");
	
	var elem_add = $("#-file_manager_file_add").clone();
	elem_add.prop("id","file_manager_file_add");
	target.find("[find=file_list]").append(elem_add);

	//-6 for border;
	var item_width = ($(window).width())/3;//toto:for mobile,if the filemanager just called on mobile,we can remove this toto;
	var item_height = item_width;
	target.find(".file_manager_file_item").height(item_height);
	target.find(".file_manager_file_item").css("line-height",Math.floor(item_height)+"px");
	target.find(".icon_file_manager_file_add").css("font-size",Math.floor(item_width/3)+"px");

	submenu_content.append(target);

	//event
	target.find("[find=file_add]").click({"upload_type":that.param.upload_type,"upload_pid":that.param.upload_pid, "upload_param":that.param.upload_param},function(e){
		var upload_type = e.data.upload_type;
		var upload_pid = e.data.upload_pid;
		var upload_param = e.data.upload_param;
		app_upload_open_files(upload_type, upload_pid,false,false,upload_param);
	});


	var file_refresh =  function(upload_type,upload_pid,upload_param,upload_flag,target,item_width,item_height,border_size)
	{
		var files = app_upload_files.lincko_files;
		for(var i in files)
		{
			if(files[i].lincko_parent_type == upload_type
			&& files[i].lincko_parent_id == upload_pid
			&& files[i].lincko_param == upload_param)
			{
				var item = $("#file_manager_file_item_"+files[i].lincko_temp_id);
				if(item.length == 0)
				{
					item = $("#-file_manager_file_item").clone();
					item.prop("id","file_manager_file_item_"+files[i].lincko_temp_id);
					target.find("[find=file_add]").before(item);

					item.height(item_height);
					item.css("line-height",Math.floor(item_height)+"px");
					item.find(".icon_file_manager_file_add").css("font-size",Math.floor(item_height/3)+"px");
				}
				var preview = null;
				try{
					preview = files[i].files[0].preview.toDataURL();
				}
				catch(e)
				{

				}
				if(preview == null || preview == ''){

				}
				else
				{
					item.find("[find=file_content]").attr("src",preview);
					var org_img_width = preview.width;//item.find("[find=file_content]").eq(0).width();
					var org_img_height = preview.height;//item.find("[find=file_content]").eq(0).height();
					if(typeof item.attr("resize") == "undefined" && org_img_width != 0 && org_img_height != 0)
					{
						org_img_width = item.find("[find=file_content]").eq(0).width();
						org_img_height = item.find("[find=file_content]").eq(0).height();

						if(org_img_width  > org_img_height){
							var img_height = item_height;
							var img_width = img_height / org_img_height * org_img_width ;
							item.find("[find=file_content]").eq(0).css("height",Math.floor(img_height)+"px");

							item.find(".file_manager_file_content_wrapper").css("width",item_width+"px");
							item.find(".file_manager_file_content_wrapper").css("height",item_height+"px");

							item.find(".file_manager_file_item_border").css("width",(item_width - border_size * 2)+"px");
							item.find(".file_manager_file_item_border").css("height",(item_height - border_size * 2)+"px");
							item.find(".file_manager_file_item_border").css("top",-item_height);
							item.find(".file_manager_file_item_border").css("border-width",border_size+"px");
							item.find(".file_manager_file_item_border").attr("file-index",files[i]["lincko_files_index"]);

							item.find("[find=file_content]").eq(0).css("margin-left",Math.floor((item_width - img_width)/2)+"px");
						}
						else{
							var img_width = item_width;
							var img_height = img_width / org_img_width * org_img_height;
							item.find("[find=file_content]").eq(0).css("width",Math.floor(img_width)+"px");

							item.find(".file_manager_file_content_wrapper").css("width",item_width+"px");
							item.find(".file_manager_file_content_wrapper").css("height",item_height+"px");

							item.find(".file_manager_file_item_border").css("width",(item_width - border_size * 2)+"px");
							item.find(".file_manager_file_item_border").css("height",(item_height - border_size * 2)+"px");
							item.find(".file_manager_file_item_border").css("top",-item_height);
							item.find(".file_manager_file_item_border").css("border-width",border_size+"px");
							item.find(".file_manager_file_item_border").attr("file-index",files[i]["lincko_files_index"]);

							item.find("[find=file_content]").css("margin-top",Math.floor((item_width - img_width)/2)+"px");
						}
						if(upload_flag[files[i]["lincko_files_index"]] == "undefined")
						{
							upload_flag[files[i]["lincko_files_index"] = true;
						}
						item.attr("resize",true);
					}
				}
				
			}
		}
	}


	that.param.upload_flag = {};

	setTimeout(function(){
		file_refresh(that.param.upload_type,that.param.upload_pid,that.param.upload_param,that.param.upload_flag,target,item_width,item_height,border_size);
	},200);
	


	//sysn
	app_application_lincko.add('filemanager_'+that.id, "upload",function(){
		var upload_type = this.action_param[0];
		var upload_pid = this.action_param[1];
		var upload_param = this.action_param[2];
		var upload_flag = this.action_param[3];
		var target = this.action_param[4];
		var item_width = this.action_param[5];
		var item_height = this.action_param[6];

		file_refresh(upload_type,upload_pid,upload_param,target,item_width,item_height,border_size);
		wrapper_IScroll_refresh();
		wrapper_IScroll();

	},[that.param.upload_type,that.param.upload_pid,that.param.upload_param,that.param.upload_flag,target,item_width,item_height]);

	
	// $("body").on("touchend", '.file_manager_file_item_border', function(event) {
	// 	if($(this).css("border-width")=="0px")
	// 	{
	// 		$(this).css("border-width",border_size+"px");
	// 	}
	// 	else
	// 	{
	// 		$(this).css("border-width","0px");
	// 	}
	// });

	delete submenu_wrapper;
	return true;
}



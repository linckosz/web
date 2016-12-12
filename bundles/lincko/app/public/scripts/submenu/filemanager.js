submenu_list['filemanager'] = {
	//Set the title of the top
	"_title": {
		"style": "customized_title",
		"title": "选择文件",//toto
		"class": "submenu_top_itemSelector",
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

	var item_width = $(window).width()/3;//toto:for mobile,if the filemanager just called on mobile,we can remove this toto;
	var item_height = item_width;
	target.find(".file_manager_file_item").height(item_width);
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


	
	var file_refresh =  function(upload_type,upload_pid,upload_param,target,item_width,item_height)
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
					var org_img_width = item.find("[find=file_content]").eq(0).width();
					var org_img_height = item.find("[find=file_content]").eq(0).height();

					if(typeof item.attr("resize") == "undefined" && org_img_width != 0 && org_img_height != 0)
					{
						org_img_width = item.find("[find=file_content]").eq(0).width();
						org_img_height = item.find("[find=file_content]").eq(0).height();

						if(org_img_width  > org_img_height){
							var img_height = item_height;
							var img_width = img_height / org_img_height * org_img_width;
							item.find("[find=file_content]").eq(0).css("height",Math.floor(img_height)+"px");
							item.find("[find=file_content]").eq(0).css("margin-left",Math.floor((item_width - img_width)/2)+"px");
						}
						else{
							var img_width = item_width;
							var img_height = img_width / org_img_width * org_img_height;
							item.find("[find=file_content]").eq(0).css("width",Math.floor(img_width)+"px");
							item.find("[find=file_content]").css("margin-top",Math.floor((item_width - img_width)/2)+"px");
						}
						item.attr("resize",true);
					}
				}
				
			}
		}
	}

	setTimeout(function(){
		file_refresh(that.param.upload_type,that.param.upload_pid,that.param.upload_param,target,item_width,item_height);
	},200);
	


	//sysn
	app_application_lincko.add('filemanager_'+that.id, "upload",function(){
		var upload_type = this.action_param[0];
		var upload_pid = this.action_param[1];
		var upload_param = this.action_param[2];
		var target = this.action_param[3];
		var item_width = this.action_param[4];
		var item_height = this.action_param[5];

		file_refresh(upload_type,upload_pid,upload_param,target,item_width,item_height);
		wrapper_IScroll_refresh();
		wrapper_IScroll();

	},[that.param.upload_type,that.param.upload_pid,that.param.upload_param,target,item_width,item_height]);


	//bottom
	var submenu_bottom = submenu_wrapper.find("[find=submenu_wrapper_bottom]").addClass('submenu_bottom');
	var bottom_menu = $("#-file_manager_menu").clone();
	bottom_menu.prop("id","");
	submenu_bottom.append(bottom_menu);

	submenu_bottom.find("[find=menu_cancel]").click(function(){
		submenu_Clean(that.layer, false, that.preview);
	});

	submenu_bottom.find("[find=menu_attch]").click(function(){
		submenu_Clean(that.layer, false, that.preview);
	});
	
	//Free memory
	//submenu_wrapper = null; //In some placea it bugs because it's used in a lower scope
	delete submenu_wrapper;
	return true;
}


var filemanager = function(position,upload_type, upload_pid, upload_param){
	this.target;
	this.position = position;
	this.upload_type = upload_type;
	this.upload_pid = upload_pid;
	this.upload_param =upload_param;
	this.layout();
	this.event();
	this.sysn();
}

filemanager.prototype.show = function(){
	this.target.removeClass("display_none");
}


filemanager.prototype.layout = function(){
	var target = $("#-file_manager_container").clone();
	target.prop("id","file_manager_container");
	
	var bt_add = $("#-file_manager_file_add").clone();
	bt_add.prop("id","file_manager_file_add");
	target.find("[find=file_list]").append(bt_add);

	target.find(".file_manager_file_item").height(this.position.width()/3);
	target.find(".file_manager_file_item").css("line-height",Math.floor(this.position.width()/3)+"px");
	target.find(".icon_file_manager_file_add").css("font-size",Math.floor(this.position.width()/9)+"px");

	this.position.append(target);

	this.position.resize(this.position,function(e){
		target.find(".file_manager_file_item").height($(this).width()/3);
		target.find(".file_manager_file_item").css("line-height",Math.floor($(this).width()/3)+"px");
		target.find(".icon_file_manager_file_add").css("font-size",Math.floor(e.data.width()/9)+"px");
	});

	this.target = target;
}

filemanager.prototype.event = function(){
	var target = this.target;
	target.find("[find=file_add]").click({"upload_type":this.upload_type,"upload_pid":this.upload_pid, "upload_param":this.upload_param},function(e){
		var upload_type = e.data.upload_type;
		var upload_pid = e.data.upload_pid;
		var upload_param = e.data.upload_param;
		app_upload_open_files(upload_type, upload_pid,false,false,upload_param);
	});
}


filemanager.prototype.sysn = function(){
	app_application_lincko.add(this.target.prop("id"), "upload",function(){
		var upload_type = this.action_param[0];
		var upload_pid = this.action_param[1];
		var upload_param = this.action_param[2];
		var target = this.action_param[3];
		var position = this.action_param[4];

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

					item.height(position.width()/3);
					item.css("line-height",Math.floor(position.width()/3)+"px");
					item.find(".icon_file_manager_file_add").css("font-size",Math.floor(position.width()/9)+"px");
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
					if(typeof item.attr("resize") == "undefined")
					{
						if(item.find("[find=file_content]").get(0).width > item.find("[find=file_content]").get(0).height){
							item.find("[find=file_content]").eq(0).height(target.find(".file_manager_file_item").height());
							item.find("[find=file_content]").css("margin-left",(target.find(".file_manager_file_item").width()-item.find("[find=file_content]").width())/2);
							
						}
						else{
							item.find("[find=file_content]").eq(0).width(target.find(".file_manager_file_item").width());
							item.find("[find=file_content]").css("margin-top",(target.find(".file_manager_file_item").height()-item.find("[find=file_content]").height())/2);
						}
						item.attr("resize",true);
					}
				}
				
			}
		}
	},[this.upload_type,this.upload_pid,this.upload_param,this.target,this.position]);
}




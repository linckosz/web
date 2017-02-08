var sharepanel = function(category,target_id)
{
	var that = this;
	this.shareDom = $("#app_public_sharepanel");
	this.category = category;
	this.target_id = target_id;
	this.feature_libs = [
		{
			name : 'copy_link',
			ico : 'ico-remove',
			title : '复制链接',
			action : function(event){
				//debugger;
				var url = top.location.protocol+'//'+app_application_dev_link()+document.domain + '/#' + that.category + '-' + btoa(that.target_id);
				//console.log(event);
				base_show_error('复制成功！'); //toto
				$("#app_public_sharepanel").hide();
			}
		},
	];
}



sharepanel.prototype.show_panel = function(position){
	var that = this;
	if(typeof position == 'undefined')
	{
		position = {
			x:0,
			y:0
		}
	}

	if ($("#app_public_sharepanel").length > 0){
		$("#app_public_sharepanel").remove();
	}

	var panel = $("#-public_sharepanel").clone();
	panel.prop("id","app_public_sharepanel");
	var item_contrainer = panel.find("[find=sharepanel_items]");
	for(var i in this.feature_libs)
	{
		var item = $("#-sharepanel_item").clone();
		item.prop("id","");
		item.find("[find=ico]")
			.addClass(this.feature_libs[i].ico);
		item.find("[find=title]")
			.html(this.feature_libs[i].title);
		item.click(i,function(event)
		{
			var i = event.data;
			that.feature_libs[i].action(event,data);
		});
		item_contrainer.append(item);
	}
	if(this.feature_libs.length>0)
	{
		panel.appendTo($("body"));
		panel.css("top",position.y);
		panel.css("left",position.x);
	}
	else
	{
		delete panel;
	}
	
} 

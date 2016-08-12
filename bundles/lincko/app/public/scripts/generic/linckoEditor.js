/*-----linckoEditor------------------------------------*/
function linckoEditor(elem, toolbarID, param){
	//editorInst = CKEDITOR.replace(elem);
	editorInst = CKEDITOR.inline( elem, {
			// To enable source code editing in a dialog window, inline editors require the "sourcedialog" plugin.
			extraPlugins: 'sharedspace,imageuploader,indentblock,autolink',//,timestamp',
			removePlugins: 'floatingspace,maximize,resize,about',
			sharedSpaces: {
				top: toolbarID,
			}
		} );

	//clicking on links will open in new tab/window
    $(editorInst.element.$).click(function(event) {
        if(typeof event.target.href != 'undefined') {
        	window.open(event.target.href, '_blank');
        }
    });


	editorInst.Lincko_param = {};
	editorInst.Lincko_param = param;
	editorInst.Lincko_param.files = {};


	var submenu_content = $('#'+editorInst.Lincko_param.submenuInst.id).find("[find=submenu_wrapper_content]");
	if(submenu_content.length && submenu_content.hasClass('overthrow')){

		//use fixed position
		editorInst.Lincko_param.iscrollInst = myIScrollList[submenu_content.prop('id')];
		$('#'+editorInst.Lincko_param.submenuInst.id).find('.submenu_top').css('z-index',100);
		/*$(editorInst.Lincko_param.iscrollInst.scroller).css({
			'position':'fixed',
			'left':'0px',
			'right':'0px',
		});*/

		submenu_content.on('paste cut', function(event){
			wrapper_IScroll();
		});
	}



	editorInst.addCommand("insertImg", { // create named command
	    exec: function(editor) {
	        var picID  = Lincko.storage.get("users", wrapper_localstorage.uid, 'profile_pic');
            var thumb_url = app_application_icon_single_user.src;
            if(picID){
                thumb_url = Lincko.storage.getLinkThumbnail(picID);
            }
           
            //editor.insertHtml( '<img style="background-image: url("'+thumb_url+'")" />' );
            //editor.insertHtml(elem_img[0].outerHTML);
            var elem_img = $('<img>').css('background-image','url("'+thumb_url+'")');
            //editor.insertHtml('<img src="'+thumb_url+'">');

            index = Object.keys(app_upload_files.lincko_files).length;
            var elem_img_id = editor.Lincko_param.submenuInst.id+'_editor_img_'+index;

            //lincko_files_index use this
            editor.Lincko_param.files[elem_img_id] = {
            	index: index,
            	local_url: '',
            	temp_id: null,
            	progress: 0,
            };

            app_application_lincko.add(elem, 'upload', function(){
            	//use this.action_param, unique to each anonymous function
            	$.each(editor.Lincko_param.files, function(elem_img_id,val){
            		if(!val.temp_id){
	            		editor.insertHtml('<span id="'+elem_img_id+'" contenteditable="false" class="submenu_taskdetail_description_img_progress">Image</span>');
	            		if(!app_upload_files.lincko_files[val.index]){return; }//there is an issue here
	            		editor.Lincko_param.files[elem_img_id].temp_id = app_upload_files.lincko_files[val.index].lincko_temp_id;
	            	}
	            	if(	$('#'+elem_img_id)
	            		&& $('#'+elem_img_id).prop('style')
	            		&& !$('#'+elem_img_id).prop('style').length 
	            		&& app_upload_files.lincko_files[val.index]
	            		&& app_upload_files.lincko_files[val.index].files[0] 
	            		&& app_upload_files.lincko_files[val.index].files[0].preview){
	            		var local_url = app_upload_files.lincko_files[val.index].files[0].preview.toDataURL();
	            		var img = new Image();
	            		img.src = local_url;
  						$('#'+elem_img_id).css({
  												'background-image': 'url('+local_url+')', 
												'height': img.naturalHeight, 
												'width': img.naturalWidth,
												'display': 'inline-block',
												'opacity': 0.5,
												'text-align': 'center',
												'line-height': img.naturalHeight+'px',
												'font-size': (img.naturalHeight)/3+'px',
											});
	            	}
	            	var index = editor.Lincko_param.files[elem_img_id].index;

	            	if(app_upload_files.lincko_files[val.index]
	            		&& app_upload_files.lincko_files[val.index].lincko_status == 'error'){
	            		$('#'+elem_img_id).html(Lincko.Translation.get('app', 60, 'html')/*upload failed*/);
	            	}
	            	else if(editor.Lincko_param.files[elem_img_id].progress==100
	            		&& !app_upload_files.lincko_files[val.index]){
	            		var tmp = editor.Lincko_param.files[elem_img_id].temp_id;
		            	var file = Lincko.storage.list('files',1,{temp_id: tmp})[0];
	            		var file_url = Lincko.storage.getLink(file['_id']);
	            		var elem_replace = $('<img>')
	            				.prop('src',file_url)
	            				.addClass('submenu_taskdetail_description_img')
	            				.css({
	            					'max-width': $(editor.element.$).width(),
	            				});										
	            		$('#'+elem_img_id).replaceWith(elem_replace);
	            		$('#'+editorInst.Lincko_param.submenuInst.id).trigger('canSave');
	            	}
	            	else{
	            		var progress = app_upload_files.lincko_files[index].lincko_progress;
		            	editor.Lincko_param.files[elem_img_id].progress = progress;
		            	$('#'+elem_img_id).html(progress);
	            	}

	            	
            	});
            	
            	
            	
            } /*access value here by this.action_param*/);
            if(editor.Lincko_param.submenuInst.param.id == 'new' && editor.Lincko_param.submenuInst.param.uniqueID){
            	//app_upload_open_files(editor.Lincko_param.submenuInst.param.projID, editor.Lincko_param.submenuInst.param.uniqueID);//, false, true);
            	app_upload_open_files('projects', editor.Lincko_param.submenuInst.param.projID, false, true, 'link_queue');
            }
            else{
            	app_upload_open_files(editor.Lincko_param.submenuInst.param.type, editor.Lincko_param.submenuInst.param.id, false, true);
        	}

	    }
	});

	editorInst.ui.addButton('imgBtn', { // add new button and bind our command
	    label: "Click me",
	    command: 'insertImg',
	    toolbar: 'insert',
	    icon: "/lincko/app/images/app/linckoeditor/imageupload.png",
	});


	return editorInst;



	var options = {
		buttons: [ 'h', 'h1', 'h2', 'h3', 'h4', 'p', 'bold', 'italic', 'list', 'alignleft', 'aligncenter', 'alignright', 'x', 'image'],
		buttonsHtml: {
			'italic': '<i class="fa fa-italic"></i>',
			'header': '<i class="fa fa-header"></i>',
			'header-1': '<h1>header 1</h1>',
			'header-2': '<h2>header 2</h2>',
			'header-3': '<h3>header 3</h3>',
			'header-4': '<h4>header 4</h4>',
			'paragraph': '<p>paragraph</p>',
			'align-left': '<i class="fa fa-align-left"></i>',
			'align-center': '<i class="fa fa-align-center"></i>',
			'align-right': '<i class="fa fa-align-right"></i>',
			'insert-image': '<i class="fa fa-picture-o" title="Coming Soon!"></i>',
			'remove-formatting': '<i class="fa fa-ban"></i>'
		},
		overwriteButtonSettings: {
			'header-2': {
				childOf: 'header',
			},
			'header-3': {
				childOf: 'header',
			},
			'header-4': {
				childOf: 'header',
			},
		}
	};

	var editorInst = new EasyEditor(elem, options);
	editorInst.$toolbarContainer.addClass('submenu_taskdetail_paddingLeft');
	$(editorInst.elem).addClass('base_DescriptionText');

	
	$(editorInst.elem).on('paste', function(){
		$(window).resize();
	});

	return editorInst;
}

EasyEditor.prototype.font = function(){
	var _this = this;
	var settings = {
		buttonIdentifier: 'font',
		buttonHtml: 'Font',
		clickHandler: function(){
			_this.openDropdownOf('font');
		},
		hasChild: true
	};

	_this.injectButton(settings);
};

EasyEditor.prototype.calibri = function(){
	var _this = this;
	var settings = {
		buttonIdentifier: 'calibri',
		buttonHtml: 'Calibri',
		clickHandler: function(){
			_this.wrapSelectionWithNodeName({ nodeName: 'span', style: 'font-family: Calibri,sans-serif', keepHtml: true });
		},
		childOf: 'font'
	};

	_this.injectButton(settings);
};

EasyEditor.prototype.georgia = function(){
	var _this = this;
	var settings = {
		buttonIdentifier: 'georgia',
		buttonHtml: 'Georgia',
		clickHandler: function(){
			_this.wrapSelectionWithNodeName({ nodeName: 'span', style: 'font-family: Georgia,serif', keepHtml: true });
		},
		childOf: 'font'
	};

	_this.injectButton(settings);
};

EasyEditor.prototype.h = function(){
	var _this = this;
	var settings = {
		buttonIdentifier: 'header',
		buttonHtml: 'H',
		clickHandler: function(){
			if($(this).next('ul').css('display') != 'none'){
				$(_this.elem).click();
			}
			else {
				_this.openDropdownOf('header');
			}
		},
		hasChild: true
	};

	_this.injectButton(settings);
};

EasyEditor.prototype.h1 = function(){
	var _this = this;
	var settings = {
		buttonIdentifier: 'header-1',
		buttonHtml: 'H1',
		clickHandler: function(){
			_this.wrapSelectionWithNodeName({ nodeName: 'h1', blockElement: true });
		},
		childOf: 'header'
	};

	_this.injectButton(settings);
};

EasyEditor.prototype.p = function(){
	var _this = this;
	var settings = {
		buttonIdentifier: 'paragraph',
		buttonHtml: 'p',
		clickHandler: function(){
			_this.wrapSelectionWithNodeName({ nodeName: 'p'});
		},
		childOf: 'header'
	};

	_this.injectButton(settings);
};

EasyEditor.prototype.image = function(){
	var _this = this;
	var settings = {
		buttonIdentifier: 'insert-image',
		buttonHtml: 'Insert image',
		clickHandler: function(){
			return;
			_this.openModal('#easyeditor-modal-1');
		}
	};

	_this.injectButton(settings);
};

/*------END OF linckoEditor---------------------------*/

/*-----linckoEditorEasy------------------------------------*/
function linckoEditorEasy(elem){
	var options = {
		buttons: [ 'h', 'h1', 'h2', 'h3', 'h4', 'p', 'bold', 'italic', 'list', 'alignleft', 'aligncenter', 'alignright', 'x', 'image'],
		buttonsHtml: {
			'italic': '<i class="fa fa-italic"></i>',
			'header': '<i class="fa fa-header"></i>',
			'header-1': '<h1>header 1</h1>',
			'header-2': '<h2>header 2</h2>',
			'header-3': '<h3>header 3</h3>',
			'header-4': '<h4>header 4</h4>',
			'paragraph': '<p>paragraph</p>',
			'align-left': '<i class="fa fa-align-left"></i>',
			'align-center': '<i class="fa fa-align-center"></i>',
			'align-right': '<i class="fa fa-align-right"></i>',
			'insert-image': '<i class="fa fa-picture-o" title="Coming Soon!"></i>',
			'remove-formatting': '<i class="fa fa-ban"></i>'
		},
		overwriteButtonSettings: {
			'header-2': {
				childOf: 'header',
			},
			'header-3': {
				childOf: 'header',
			},
			'header-4': {
				childOf: 'header',
			},
		}
	};

	var editorInst = new EasyEditor(elem, options);
	editorInst.$toolbarContainer.addClass('submenu_taskdetail_paddingLeft');
	$(editorInst.elem).addClass('base_DescriptionText');

	
	$(editorInst.elem).on('paste', function(){
		$(window).resize();
	});

	return editorInst;
}

EasyEditor.prototype.font = function(){
	var _this = this;
	var settings = {
		buttonIdentifier: 'font',
		buttonHtml: 'Font',
		clickHandler: function(){
			_this.openDropdownOf('font');
		},
		hasChild: true
	};

	_this.injectButton(settings);
};

EasyEditor.prototype.calibri = function(){
	var _this = this;
	var settings = {
		buttonIdentifier: 'calibri',
		buttonHtml: 'Calibri',
		clickHandler: function(){
			_this.wrapSelectionWithNodeName({ nodeName: 'span', style: 'font-family: Calibri,sans-serif', keepHtml: true });
		},
		childOf: 'font'
	};

	_this.injectButton(settings);
};

EasyEditor.prototype.georgia = function(){
	var _this = this;
	var settings = {
		buttonIdentifier: 'georgia',
		buttonHtml: 'Georgia',
		clickHandler: function(){
			_this.wrapSelectionWithNodeName({ nodeName: 'span', style: 'font-family: Georgia,serif', keepHtml: true });
		},
		childOf: 'font'
	};

	_this.injectButton(settings);
};

EasyEditor.prototype.h = function(){
	var _this = this;
	var settings = {
		buttonIdentifier: 'header',
		buttonHtml: 'H',
		clickHandler: function(){
			if($(this).next('ul').css('display') != 'none'){
				$(_this.elem).click();
			}
			else {
				_this.openDropdownOf('header');
			}
		},
		hasChild: true
	};

	_this.injectButton(settings);
};

EasyEditor.prototype.h1 = function(){
	var _this = this;
	var settings = {
		buttonIdentifier: 'header-1',
		buttonHtml: 'H1',
		clickHandler: function(){
			_this.wrapSelectionWithNodeName({ nodeName: 'h1', blockElement: true });
		},
		childOf: 'header'
	};

	_this.injectButton(settings);
};

EasyEditor.prototype.p = function(){
	var _this = this;
	var settings = {
		buttonIdentifier: 'paragraph',
		buttonHtml: 'p',
		clickHandler: function(){
			_this.wrapSelectionWithNodeName({ nodeName: 'p'});
		},
		childOf: 'header'
	};

	_this.injectButton(settings);
};

EasyEditor.prototype.image = function(){
	var _this = this;
	var settings = {
		buttonIdentifier: 'insert-image',
		buttonHtml: 'Insert image',
		clickHandler: function(){
			return;
			_this.openModal('#easyeditor-modal-1');
		}
	};

	_this.injectButton(settings);
};

/*------END OF linckoEditor---------------------------*/

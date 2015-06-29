var submenu_zindex = 2000;
var submenu_obj = {};

//Modify the scaling of some effects
$.Velocity.RegisterEffect.packagedEffects["transition.expandIn"].calls[0][0].scaleX = [ 1, 0.75 ];
$.Velocity.RegisterEffect.packagedEffects["transition.expandIn"].calls[0][0].scaleY = [ 1, 0.75 ];
$.Velocity.RegisterEffect.packagedEffects["transition.expandOut"].calls[0][0].scaleX = 0.8;
$.Velocity.RegisterEffect.packagedEffects["transition.expandOut"].calls[0][0].scaleY = 0.8;

function Submenu(menu, next, param) {
	this.obj = submenu_list[menu];
	this.menu = menu;
	this.layer = 1;
	if(typeof next === 'number'){
		if(next === 0){
			this.layer = submenu_Getfull();
		} else {
			this.layer = next;
		}
	} else if(typeof next !== 'undefined' && next === true){
		this.layer = submenu_Getposition(menu);
	}
	if(typeof param === 'undefined'){
		this.param = null;
	}
	this.id = this.layer+"_submenu_wrapper_"+md5(Math.random());
	this.zIndex = submenu_zindex+this.layer;
	this.wrapper = null;
	this.display = true;
	function Constructor(Elem){
		Elem.wrapper = $('#-submenu_wrapper').clone();
		Elem.wrapper.prop("id",Elem.id);
		//Back button
		Elem.wrapper.find("[find=submenu_wrapper_back]").click(function(){
			submenu_Clean(Elem.layer, true);
		});
		Elem.wrapper.css('z-index', Elem.zIndex);
		//This is because we can only place 3 menus on Desktop mode, so after 3 layers we switch to full width mode
		if(Elem.layer>3) { Elem.wrapper.addClass('submenu_wrapper_important'); }
		Elem.wrapper.insertBefore('#end_submenu');
		var attribute = null;
		var exist = false;
		for(var att in Elem.obj){
			attribute = Elem.obj[att];
			if("style" in attribute && "title" in attribute){
				//Standard
				if(attribute.style=="title"){
					Elem.AddMenuTitle(attribute);
				} else if(attribute.style=="button"){
					Elem.AddMenuButton(attribute);
				} else if(attribute.style=="next"){
					Elem.AddMenuNext(attribute);
				} else if(attribute.style=="radio"){
					Elem.AddMenuRadio(attribute);
				} else if(attribute.style=="form"){
					Elem.AddMenuForm(attribute);
				} else if(attribute.style=="title_small"){
					Elem.AddTitleSmall(attribute);
				} else if(attribute.style=="input_text"){
					Elem.AddInputText(attribute);
				} else if(attribute.style=="input_textarea"){
					Elem.AddInputTextarea(attribute);
				}
				 else if(attribute.style=="select_multiple"){
					Elem.AddSelectMultiple(attribute);
				}
				//app_upload_all
				else if(attribute.style=="app_upload_all"){
					if(typeof app_application_objects !== 'undefined'){
						for(var index in app_application_objects.lincko_record){
							if(app_application_objects.lincko_record[index].id === Elem.id){
								exist = true;
							}
						}
						if(!exist){
							app_application_objects.lincko_record[app_application_objects.lincko_record_index++] = {
								id: Elem.id,
								action: function(){
									Elem.AddMenuAppUploadAllForm();
									Elem.AddMenuAppUploadAllFile();
								},
							};
							Elem.AddMenuAppUploadAllForm();
							Elem.AddMenuAppUploadAllFile();
							app_application_objects.lincko_record_update();
						}
					}
				}
				//app_upload_single
				else if(attribute.style=="app_upload_sub"){
					if(typeof app_application_objects !== 'undefined' && typeof app_upload_files !== 'undefined' && typeof app_upload_files.lincko_files[attribute.value] !== 'undefined'){
						for(var index in app_application_objects.lincko_record){
							if(app_application_objects.lincko_record[index].id === Elem.id){
								exist = true;
							}
						}
						if(!exist){
							app_application_objects.lincko_record[app_application_objects.lincko_record_index++] = {
								id: Elem.id,
								action: function(){
									Elem.AddMenuAppUploadSubFile();
								},
							};
							Elem.AddMenuAppUploadSubFile(attribute);
							app_application_objects.lincko_record_update();
						}
					} else {
						Elem.display = false;
					}
				}
			}
		}
		if(Elem.display){
			Elem.Show();
		} else {
			Elem.Hide();
		}
	}
	Constructor(this);
}
 
Submenu.prototype = {
	AddMenuTitle: function(attribute) {
		this.wrapper.find("[find=submenu_wrapper_title]").html(attribute.title);
		return true;
	},
	AddTitleSmall: function(attribute) {
		var Elem = $('#-submenu_title_small').clone();
		Elem.prop("id", '');
		Elem.find("[find=submenu_title]").html(attribute.title);
		if("class" in attribute){
			Elem.addClass(attribute.class);
		}
		this.wrapper.find("[find=submenu_wrapper_content]").append(Elem);
		return true;
	},
	AddMenuButton: function(attribute) {
		var Elem = $('#-submenu_button').clone();
		Elem.prop("id", '');
		Elem.find("[find=submenu_button_title]").html(attribute.title);
		if("value" in attribute){
			Elem.find("[find=submenu_button_value]").html(attribute.value);
		}
		if("hide" in attribute){
			if(attribute.hide) {
				Elem.click(function(){ submenu_Hideall(); });
			}
		}
		if("action" in attribute){
			Elem.click(attribute.action);
		}
		if("class" in attribute){
			Elem.addClass(attribute.class);
		}
		this.wrapper.find("[find=submenu_wrapper_content]").append(Elem);
		return true;
	},
	AddMenuNext: function(attribute) {
		var Elem = $('#-submenu_next').clone();
		var that = this;
		Elem.prop("id", '');
		if("value" in attribute){
			Elem.find("[find=submenu_next_value]").html(attribute.value);
		}
		if("next" in attribute){
			if(attribute.next in submenu_list){
				if(attribute.style=="title"){
					Elem.AddMenuTitle(attribute);
				}
				for(var att in submenu_list[attribute.next]){
					next_attribute = submenu_list[attribute.next][att];
					if("style" in next_attribute && "title" in next_attribute){
						if(next_attribute.style == "title"){
							attribute.title = next_attribute.title;
						}
					}
				}
				$("<img class='submenu_icon submenu_icon_next' src='/lincko/app/images/generic/submenu/next.png' />").appendTo(Elem.find("[find=submenu_next_value]"));
				Elem.click(function(){
					$.each(that.wrapper.find('.submenu_deco_next'), function() {
						$(this).removeClass('submenu_deco_next');
					});
					submenu_Build(attribute.next, that.layer+1);
					Elem.addClass('submenu_deco_next');
				});
			}
		}
		Elem.find("[find=submenu_next_title]").html(attribute.title);
		if("class" in attribute){
			Elem.addClass(attribute.class);
		}
		this.wrapper.find("[find=submenu_wrapper_content]").append(Elem);
		return true;
	},
	AddMenuRadio: function(attribute) {
		var Elem = $('#-submenu_radio').clone();
		Elem.prop("id", '');
		Elem.find("[find=submenu_radio_title]").html(attribute.title);
		if("selected" in attribute){
			if(attribute.selected){
				Elem.find("[find=submenu_radio_value]").html("<img class='submenu_icon' src='/lincko/app/images/generic/submenu/check.png' />");
			}
		}
		if("hide" in attribute){
			if(attribute.hide) {
				Elem.click(function(){ submenu_Hideall(); });
			}
		}
		if("action" in attribute){
			Elem.click(attribute.action);
		}
		if("class" in attribute){
			Elem.addClass(attribute.class);
		}
		this.wrapper.find("[find=submenu_wrapper_content]").append(Elem);
		return true;
	},
	AddInputText: function(attribute) {
		var Elem = $('#-submenu_input').clone();
		var Input = $('<input type="text" />');
		Elem.prop("id", '');
		Elem.find("[find=submenu_title]").html(attribute.title);
		Elem.prop('for', attribute.name);
		Input.prop('name', attribute.name);	
		Elem.append(Input);
		if("value" in attribute){
			Elem.find("[find=submenu_input]").prop('value', attribute.value);
		}
		if("class" in attribute){
			Elem.addClass(attribute.class);
		}
		this.wrapper.find("[find=submenu_wrapper_content]").append(Elem);
		return true;
	},
	AddInputTextarea: function(attribute) {
		var Elem = $('#-submenu_input').clone();
		var Value = '';
		if("value" in attribute){
			Value = attribute.value;
		}
		var Input = $('<textarea>'+Value+'</textarea>');
		Elem.prop("id", '');
		Elem.find("[find=submenu_title]").html(attribute.title);
		Elem.prop('for', attribute.name);
		Input.prop('name', attribute.name);
		Elem.append(Input);
		if("class" in attribute){
			Elem.addClass(attribute.class);
		}
		this.wrapper.find("[find=submenu_wrapper_content]").append(Elem);
		return true;
	},
	AddSelectMultiple: function(attribute) {
		var Elem = $('#-submenu_select').clone();
		var that = this;
		var Num = 0;
		Elem.prop("id", '');
		if("value" in attribute){
			Elem.find("[find=submenu_select_value]").html(attribute.value);
		}
		if("next" in attribute){
			if(attribute.next in submenu_list){
				if(attribute.style=="title"){
					Elem.AddMenuTitle(attribute);
				}
				for(var att in submenu_list[attribute.next]){
					next_attribute = submenu_list[attribute.next][att];
					if("style" in next_attribute && "title" in next_attribute){
						if(next_attribute.style == "title"){
							attribute.title = next_attribute.title;
						}
					}
					if("selected" in next_attribute){
						if(next_attribute.selected){
							Num++;
						}
					}
				}
				Elem.find("[find=submenu_select_value]").html(Num);
				$("<img class='submenu_icon submenu_icon_next' src='/lincko/app/images/generic/submenu/next.png' />").appendTo(Elem.find("[find=submenu_select_value]"));
				Elem.click(function(){
					$.each(that.wrapper.find('.submenu_deco_next'), function() {
						$(this).removeClass('submenu_deco_next');
					});
					submenu_Build(attribute.next, that.layer+1);
					Elem.addClass('submenu_deco_next');
				});
			}
		}
		Elem.find("[find=submenu_select_title]").html(attribute.title);
		if("class" in attribute){
			Elem.addClass(attribute.class);
		}
		this.wrapper.find("[find=submenu_wrapper_content]").append(Elem);
		return true;
	},
	AddMenuForm: function(attribute) {
		var Elem = $('#-submenu_form').clone();
		var that = this;
		Elem.prop("id", '');
		this.wrapper.find("[find=submenu_wrapper_bottom]").addClass('submenu_bottom');
		this.wrapper.find("[find=submenu_wrapper_content]").css('bottom', this.wrapper.find("[find=submenu_wrapper_bottom]").height());
		if("hide" in attribute){
			if(attribute.hide) {
				Elem.find("[find=submenu_form_button]").click(function(){ submenu_Hideall(); });
			}
		}
		Elem.find("[find=submenu_form_title]").html(attribute.title)
		Elem.find("[find=submenu_form_button]").click(function(){
			$('#'+that.id+'_submenu_form').submit();
		});
		if("class" in attribute){
			Elem.addClass(attribute.class);
		}
		this.wrapper.find("[find=submenu_wrapper_bottom]").html(Elem);

		var ElemForm = $("<form method='post' action='' submit='e.preventDefault(); return false;'></form>");
		ElemForm.prop("id", this.id+'_submenu_form');
		if("action" in attribute){
			ElemForm.prop("action", attribute.action);
		}
		if("submit" in attribute){
			ElemForm.on('submit', function(e) {
				e.preventDefault();
				attribute.submit(this);
			});
		}
		this.wrapper.find("[find=submenu_wrapper_content]").wrap(ElemForm);

		return true;
	},

	AddMenuAppUploadAllForm: function() {
		var Elem = null;
		var Elem_bt = null;
		var that = this;

		//Upload function buttons
		if($('#'+this.id+'_submenu_app_upload_function').length <= 0){
			Elem = $('#-submenu_app_upload_function').clone();

			Elem.prop("id", this.id+'_submenu_app_upload_function');

			this.wrapper.find("[find=submenu_wrapper_bottom]").addClass('submenu_bottom');
			this.wrapper.find("[find=submenu_wrapper_content]").css('bottom', this.wrapper.find("[find=submenu_wrapper_bottom]").height());

			Elem_bt = $('#-submenu_app_upload_function_button').clone();
			Elem_bt.prop("id", this.id+'_submenu_app_upload_function_button'+'_start');
			Elem_bt.html(Lincko.Translation.get('app', 5, 'html')); //Start
			Elem_bt.click(function(){
				$('#app_upload_fileupload').fileupload('option')._startHandler();
			});
			Elem.append(Elem_bt);

			Elem_bt = $('#-submenu_app_upload_function_button').clone();
			Elem_bt.prop("id", this.id+'_submenu_app_upload_function_button'+'_stop');
			Elem_bt.html(Lincko.Translation.get('app', 12, 'html')); //Stop
			Elem_bt.click(function(){
				$('#app_upload_fileupload').fileupload('option')._cancelHandler();
			});
			Elem_bt.hide();
			Elem.append(Elem_bt);

			Elem_bt = $('#-submenu_app_upload_function_button').clone();
			Elem_bt.prop("id", this.id+'_submenu_app_upload_function_button'+'_cancel');
			Elem_bt.html(Lincko.Translation.get('app', 22, 'html')); //Delete
			Elem_bt.click(function(){
				if(app_upload_files.lincko_numberOfFiles>0){
					$('#app_upload_fileupload').fileupload('option')._deleteHandler();
				} else {
					$('#'+that.id).find("[find=submenu_wrapper_back]").click();
				}
			});
			Elem.append(Elem_bt);

			this.wrapper.find("[find=submenu_wrapper_bottom]").append(Elem);
		}

		if($('#'+this.id+'_submenu_app_upload_title').length <= 0){
			Elem = $('#-submenu_app_upload_title').clone();
			Elem.prop("id", this.id+'_submenu_app_upload_title');
			this.wrapper.find("[find=submenu_wrapper_content]").append(Elem);
		} else {
			Elem = $('#'+this.id+'_submenu_app_upload_title');
		}

		Elem.find("[find=submenu_app_upload_all_progress_pc]").css('width',
			Math.floor(app_upload_files.lincko_progressall) + '%'
		);
		Elem.find("[find=submenu_app_upload_all_progress_pc_text]").html(
			function(){
				if(app_upload_files.lincko_progressall>=100 && app_upload_files.lincko_numberOfFiles<=0){
					return Lincko.Translation.get('app', 8, 'html') //Complete
				} else {
					return Math.floor(app_upload_files.lincko_progressall) + '%'
				}
			}
		);
		Elem.find("[find=submenu_app_upload_all_size]").html(
			app_upload_files.lincko_size
		);
		Elem.find("[find=submenu_app_upload_all_speed]").html(
			app_upload_files.lincko_britate
		);
		Elem.find("[find=submenu_app_upload_all_time]").html(
			app_upload_files.lincko_time
		);
		Elem.find("[find=submenu_app_upload_all_files]").html(
			function(){
				if(app_upload_files.lincko_numberOfFiles<=1){
					return app_upload_files.lincko_numberOfFiles + ' ' + Lincko.Translation.get('app', 19, 'html'); //file
				} else {
					return app_upload_files.lincko_numberOfFiles + ' ' + Lincko.Translation.get('app', 20, 'html'); //files
				}
			}
		);

		return true;
	},

	AddMenuAppUploadAllFile: function(e) {
		var that = this;
		var Elem = null;
		var pause = true;
		var finish = true;
		var retry = true;
		//Each
		if(typeof app_upload_files !== 'undefined'){
			$.each(app_upload_files.lincko_files, function(index, data){
				if(typeof data === 'object'){
					if(typeof data.lincko_type !== 'undefined' && data.lincko_type === 'file'){
						if($('#'+that.id+'_submenu_app_upload_single_'+index).length <= 0){
							Elem = $('#-submenu_app_upload_single').clone();
							Elem.prop("id", that.id+'_submenu_app_upload_single_'+index);
							Elem.find("[find=submenu_app_upload_name]").html(
								data.lincko_name
							);
							Elem.find("[find=submenu_app_upload_name]").prop('title',
								data.lincko_name
							);
							Elem.find("[find=submenu_app_upload_size]").html(
								$('#app_upload_fileupload').fileupload('option')._formatFileSize(data.lincko_size)
							);
							Elem.find("[find=submenu_app_upload_where]").html(
								'My placeholder'
							);
							Elem.find("[find=submenu_app_upload_single_cancel]").click(function(e){
								e.stopPropagation();
								if(typeof data.lincko_type !== 'undefined' && data.lincko_type === 'file' && data.lincko_status !== 'deleted'){
									data.lincko_status = 'deleted';
									$('#app_upload_fileupload').fileupload('option').destroy(e, data);
								}
							});
							Elem.click(function(){
								if(typeof app_upload_files.lincko_files[index] !== 'undefined' && data.lincko_status !== 'deleted' && data.lincko_status !== 'done'){
									submenu_list['app_upload_sub'].app_upload_sub.value = index;
									submenu_Build("app_upload_sub", that.layer+1);
								}
							});
							that.wrapper.find("[find=submenu_wrapper_content]").append(Elem);
						} else {
							Elem = $('#'+that.id+'_submenu_app_upload_single_'+index);
						}

						if(data.files[0].preview && $.trim(Elem.find("[find=submenu_app_upload_preview_image]").html()) === ''){
							var canvas_preview = null;
							if(typeof data.files[0].preview.tagName !== 'undefined' && data.files[0].preview.tagName.toLowerCase() === 'canvas'){
								canvas_preview = base_cloneCanvas(data.files[0].preview);
							} else {
								Elem.find("[find=submenu_app_upload_preview_image]").html(
									data.files[0].preview
								);
								canvas_preview = Elem.find("[find=submenu_app_upload_preview_image]").html();
							}
							Elem.find("[find=submenu_app_upload_preview_image]").html(
								canvas_preview
							);
						}

						Elem.find("[find=submenu_app_upload_progress_pc]").css('width',
							Math.floor(data.lincko_progress) + '%'
						);

						if(data.lincko_progress>=100 && data.lincko_status === 'done'){
							Elem.find("[find=submenu_app_upload_single_cancel]").hide();
							Elem.find("[find=submenu_app_upload_progress_pc_text]").html(
								Lincko.Translation.get('app', 8, 'html') //Complete
							);
						} else {
							Elem.find("[find=submenu_app_upload_progress_pc_text]").html(
								Math.floor(data.lincko_progress) + '%'
							);
						}

						if(data.lincko_status === 'abort'){
							Elem.find("[find=submenu_app_upload_progress_full]").addClass('submenu_app_upload_progress_full_abort');
							Elem.find("[find=submenu_app_upload_progress_pc_text]").html(
								Lincko.Translation.get('app', 11, 'html') //Stopped
							);
						} else if(data.lincko_status === 'failed'){
							Elem.find("[find=submenu_app_upload_progress_full]").addClass('submenu_app_upload_progress_full_failed');
							Elem.find("[find=submenu_app_upload_progress_pc_text]").html(
								data.lincko_error
							);
						} else if(data.lincko_status === 'error'){
							Elem.find("[find=submenu_app_upload_progress_full]").addClass('submenu_app_upload_progress_full_failed');
							Elem.find("[find=submenu_app_upload_progress_pc_text]").html(
								data.lincko_error
							);
						} else if(data.lincko_status === 'deleted'){
							Elem.find("[find=submenu_app_upload_single_cancel]").hide();
							Elem.find("[find=submenu_app_upload_progress_full]").addClass('submenu_app_upload_progress_full_failed');
							Elem.find("[find=submenu_app_upload_progress_pc_text]").html(
								Lincko.Translation.get('app', 23, 'html') //Canceled
							);
						} else {
							Elem.find("[find=submenu_app_upload_progress_full]").removeClass('submenu_app_upload_progress_full_abort');
							Elem.find("[find=submenu_app_upload_progress_full]").removeClass('submenu_app_upload_progress_full_failed');
						}

						if(data.lincko_status === 'uploading'){
							pause = false;
						}

						if(data.lincko_status !== 'done' && data.lincko_status !== 'deleted'){
							finish = false;
						}

						if(data.lincko_status !== 'abort' && data.lincko_status !== 'failed' && data.lincko_status !== 'error'  && data.lincko_status !== 'deleted'){
							retry = false;
						}

						if(data.lincko_status === 'done' || data.lincko_status === 'deleted'){
							var delay = 1000;
							if(data.lincko_status === 'deleted'){
								delay = 1500;
							}
							var Sequence = [
								{ e: Elem, p: 'slideUp', o: { delay: delay } },
								{ e: Elem.children(), p: 'transition.fadeOut', o: { delay: delay, sequenceQueue: false } },
							];
							$.Velocity.RunSequence(Sequence);
						}
					}
				}
			});
			
			if(pause){
				$('#'+that.id+'_submenu_app_upload_function_button_stop').hide();
				$('#'+that.id+'_submenu_app_upload_function_button_start').show();
			} else {
				$('#'+that.id+'_submenu_app_upload_function_button_start').hide();
				$('#'+that.id+'_submenu_app_upload_function_button_stop').show();
			}

			if(retry){
				$('#'+that.id+'_submenu_app_upload_function_button_start').html(
					Lincko.Translation.get('app', 24, 'html') //Retry
				);
			} else {
				$('#'+that.id+'_submenu_app_upload_function_button_start').html(
					Lincko.Translation.get('app', 5, 'html') //Start
				);
			}

			if(finish){
				$('#'+that.id+'_submenu_app_upload_function_button_cancel').html(
					Lincko.Translation.get('app', 25, 'html') //Close
				);
				$('#'+that.id+'_submenu_app_upload_function_button_start').css('visibility', 'hidden');
			} else {
				$('#'+that.id+'_submenu_app_upload_function_button_cancel').html(
					Lincko.Translation.get('app', 22, 'html') //Delete
				);
				$('#'+that.id+'_submenu_app_upload_function_button_start').css('visibility', 'visible');
			}

		}
		return true;
	},

	AddMenuAppUploadSubFile: function(attribute) {
		if(typeof attribute === 'undefined'){ attribute = {}; }
		var Elem = null;
		var Elem_bt = null;
		var that = this;
		var pause = true;
		var retry = true;
		var finish = true;
		var lincko_files_index = -1;
		var data;

		if(typeof app_upload_files === 'object'){
			
			//Upload function buttons
			if($('#'+this.id+'_submenu_app_upload_function').length <= 0){
				
				if(typeof attribute.value === 'undefined'){
					return true;
				}
				lincko_files_index = attribute.value;
				if(typeof app_upload_files.lincko_files[lincko_files_index] === 'undefined'){
					return true;
				}

				Elem = $('#-submenu_app_upload_function').clone();

				Elem.prop("id", this.id+'_submenu_app_upload_function');

				this.wrapper.find("[find=submenu_wrapper_title]").html(
					app_upload_files.lincko_files[lincko_files_index].lincko_name
				);
				this.wrapper.find("[find=submenu_wrapper_bottom]").addClass('submenu_bottom');
				this.wrapper.find("[find=submenu_wrapper_content]").css('bottom', this.wrapper.find("[find=submenu_wrapper_bottom]").height());

				Elem_bt = $('#-submenu_app_upload_function_button').clone();
				Elem_bt.prop("id", this.id+'_submenu_app_upload_function_button'+'_start');
				Elem_bt.html(Lincko.Translation.get('app', 5, 'html')); //Start
				Elem_bt.click(function(){
					if(app_upload_files.lincko_files[lincko_files_index]){
						app_upload_files.lincko_files[lincko_files_index].submit();
					}
				});
				Elem.append(Elem_bt);

				Elem_bt = $('#-submenu_app_upload_function_button').clone();
				Elem_bt.prop("id", this.id+'_submenu_app_upload_function_button'+'_stop');
				Elem_bt.html(Lincko.Translation.get('app', 12, 'html')); //Stop
				Elem_bt.click(function(){
					if(app_upload_files.lincko_files[lincko_files_index]){
						app_upload_files.lincko_files[lincko_files_index].lincko_status = 'abort';
						app_upload_files.lincko_files[lincko_files_index].abort();
					}
				});
				Elem_bt.hide();
				Elem.append(Elem_bt);

				Elem_bt = $('#-submenu_app_upload_function_button').clone();
				Elem_bt.prop("id", this.id+'_submenu_app_upload_function_button'+'_cancel');
				Elem_bt.html(Lincko.Translation.get('app', 22, 'html')); //Delete
				Elem_bt.click(function(){
					if(app_upload_files.lincko_files[lincko_files_index]){
						var e; //undefined
						$('#app_upload_fileupload').fileupload('option').destroy(e, app_upload_files.lincko_files[lincko_files_index]);
					} else {
						$('#'+that.id).find("[find=submenu_wrapper_back]").click();
					}
				});
				Elem.append(Elem_bt);

				this.wrapper.find("[find=submenu_wrapper_bottom]").append(Elem);
			} else {
				lincko_files_index = this.wrapper.find("[find=submenu_app_upload_sub_index]").val();
			}

			if(typeof app_upload_files.lincko_files[lincko_files_index] === 'object'){
				data = app_upload_files.lincko_files[lincko_files_index];
				if($('#'+that.id+'_submenu_app_upload_sub').length <= 0){
					Elem = $('#-submenu_app_upload_sub').clone();
					Elem.prop("id", that.id+'_submenu_app_upload_sub');
					Elem.find("[find=submenu_app_upload_size]").html(
						$('#app_upload_fileupload').fileupload('option')._formatFileSize(data.lincko_size)
					);
					Elem.find("[find=submenu_app_upload_sub_index]").val(
						lincko_files_index
					);
					that.wrapper.find("[find=submenu_wrapper_content]").append(Elem);
				} else {
					Elem = $('#'+that.id+'_submenu_app_upload_sub');
				}

				if(data.files[0].preview && $.trim(Elem.find("[find=submenu_app_upload_preview_image]").html()) === ''){
					var canvas_preview = null;
					if(typeof data.files[0].preview.tagName !== 'undefined' && data.files[0].preview.tagName.toLowerCase() === 'canvas'){
						canvas_preview = base_cloneCanvas(data.files[0].preview);
						Elem.find("[find=submenu_app_upload_preview_image]").addClass('submenu_app_upload_sub_preview_canvas')
					} else {
						Elem.find("[find=submenu_app_upload_preview_image]").html(
							data.files[0].preview
						);
						if(typeof data.files[0].preview.tagName !== 'undefined' && data.files[0].preview.tagName.toLowerCase() === 'video'){
							Elem.find("[find=submenu_app_upload_preview_image]").addClass('submenu_app_upload_sub_preview_player');
						}
						canvas_preview = Elem.find("[find=submenu_app_upload_preview_image]").html();
					}
					Elem.find("[find=submenu_app_upload_preview_image]").html(
						canvas_preview
					);
				}

				Elem.find("[find=submenu_app_upload_progress_pc]").css('width',
					Math.floor(data.lincko_progress) + '%'
				);

				if(data.lincko_progress>=100 && data.lincko_status === 'done'){
					Elem.find("[find=submenu_app_upload_progress_pc_text]").html(
						Lincko.Translation.get('app', 8, 'html') //Complete
					);
				} else {
					Elem.find("[find=submenu_app_upload_progress_pc_text]").html(
						Math.floor(data.lincko_progress) + '%'
					);
				}

				if(data.lincko_status === 'abort'){
					Elem.find("[find=submenu_app_upload_progress_full]").addClass('submenu_app_upload_progress_full_abort');
					Elem.find("[find=submenu_app_upload_progress_pc_text]").html(
						Lincko.Translation.get('app', 11, 'html') //Stopped
					);
				} else if(data.lincko_status === 'failed'){
					Elem.find("[find=submenu_app_upload_progress_full]").addClass('submenu_app_upload_progress_full_failed');
					Elem.find("[find=submenu_app_upload_progress_pc_text]").html(
						data.lincko_error
					);
				} else if(data.lincko_status === 'error'){
					Elem.find("[find=submenu_app_upload_progress_full]").addClass('submenu_app_upload_progress_full_failed');
					Elem.find("[find=submenu_app_upload_progress_pc_text]").html(
						data.lincko_error
					);
				} else if(data.lincko_status === 'deleted'){
					Elem.find("[find=submenu_app_upload_progress_full]").addClass('submenu_app_upload_progress_full_failed');
					Elem.find("[find=submenu_app_upload_progress_pc_text]").html(
						Lincko.Translation.get('app', 23, 'html') //Canceled
					);
				} else {
					Elem.find("[find=submenu_app_upload_progress_full]").removeClass('submenu_app_upload_progress_full_abort');
					Elem.find("[find=submenu_app_upload_progress_full]").removeClass('submenu_app_upload_progress_full_failed');
				}

				if(data.lincko_status === 'uploading'){
					pause = false;
				}

				if(data.lincko_status !== 'done' && data.lincko_status !== 'deleted'){
					finish = false;
				}

				if(data.lincko_status !== 'abort' && data.lincko_status !== 'failed' && data.lincko_status !== 'error'  && data.lincko_status !== 'deleted'){
					retry = false;
				}

				if(pause){
					$('#'+that.id+'_submenu_app_upload_function_button_stop').hide();
					$('#'+that.id+'_submenu_app_upload_function_button_start').show();
				} else {
					$('#'+that.id+'_submenu_app_upload_function_button_start').hide();
					$('#'+that.id+'_submenu_app_upload_function_button_stop').show();
				}

				if(retry){
					$('#'+that.id+'_submenu_app_upload_function_button_start').html(
						Lincko.Translation.get('app', 24, 'html') //Retry
					);
				} else {
					$('#'+that.id+'_submenu_app_upload_function_button_start').html(
						Lincko.Translation.get('app', 5, 'html') //Start
					);
				}

				if(finish){
					$('#'+that.id+'_submenu_app_upload_function_button_cancel').html(
						Lincko.Translation.get('app', 25, 'html') //Close
					);
					$('#'+that.id+'_submenu_app_upload_function_button_start').css('visibility', 'hidden');
				} else {
					$('#'+that.id+'_submenu_app_upload_function_button_cancel').html(
						Lincko.Translation.get('app', 22, 'html') //Delete
					);
					$('#'+that.id+'_submenu_app_upload_function_button_start').css('visibility', 'visible');
				}
			}
		}
		return true;
	},

	FocusForm: function(){
		var Elem = this.wrapper;
		var that = this;
		if(responsive.test("minDesktop")){
			setTimeout(function(){
				var ElemFocus = Elem.find("input:enabled:visible:first");
				if(ElemFocus.length>=1){
					ElemFocus.focus();
					return true;
				}
				ElemFocus = Elem.find("textarea:enabled:visible:first");
				if(ElemFocus.length>=1){
					ElemFocus.focus();
					return true;
				}
				ElemFocus = Elem.find("select:enabled:visible:first");
				if(ElemFocus.length>=1){
					ElemFocus.focus();
					return true;
				}
			},1);
		}
	},

	Show: function(){
		var Elem = this.wrapper;
		var that = this;
		var time = 200;
		if(responsive.test("minDesktop")){
			if(that.layer<=3){ Elem.css('z-index', submenu_zindex); }
			Elem.velocity(
				"transition.slideLeftBigIn",
				{
					duration: time,
					easing: [ .38, .1, .13, .9 ],
					begin: function(){
						Elem.hide().show(0);
						$(window).trigger('resize');
						if(responsive.test("minDesktop")){
							if(wrapper_broswer('webkit')){ $('#app_content_dynamic').velocity({ blur: 2 }, time); }
						}
					},
					complete: function(){
						Elem.find("[find=submenu_wrapper_content]").focus();
						//The line below avoid a bug in Chrome that could make the scroll unavailable in some areas
						Elem.hide().show(0);
						Elem.css('z-index', that.zIndex);
						$(window).trigger('resize');
						that.FocusForm();
					}
				}
			);
		} else {
			Elem.velocity(
				"transition.expandIn",
				{
					duration: time,
					easing: [ .38, .1, .13, .9 ],
					begin: function(){
						Elem.hide().show(0);
						$(window).trigger('resize');
					},
					complete: function(){
						Elem.find("[find=submenu_wrapper_content]").focus();
						//The line below avoid a bug in Chrome that could make the scroll unavailable in some areas
						Elem.hide().show(0);
						$(window).trigger('resize');
						that.FocusForm();
					}
				}
			);
		}
	},
	Hide: function (animate){
		var Elem = this.wrapper;
		var that = this;
		var time = 160;
		if(typeof animate === 'undefined'){ animate = false; }
		delete submenu_obj[that.layer];
		//Reset menu selection if(menu in submenu_list){
		if((that.layer-1) in submenu_obj){
			$.each(submenu_obj[that.layer-1].wrapper.find('.submenu_deco_next'), function() {
				$(this).removeClass('submenu_deco_next');
			});
		}
		if(animate){
			if(responsive.test("minDesktop")){
				if(that.layer<=3){ Elem.css('z-index', submenu_zindex); }
				Elem.velocity(
					"transition.slideLeftBigOut",
					{
						duration: time,
						easing: [ .38, .1, .13, .9 ],
						complete: function(){
							Elem.hide().remove();
							if(submenu_Getnext()<=1){
								$('#app_content_dynamic').removeClass('app_application_submenu_blur');
								$('#app_application_submenu_block').hide();
							}
						}
					}
				);
			} else {
				Elem.velocity(
					"transition.expandOut",
					{
						duration: time,
						easing: [ .38, .1, .13, .9 ],
						complete: function(){
							Elem.hide().remove();
							if(submenu_Getnext()<=1){
								$('#app_content_dynamic').removeClass('app_application_submenu_blur');
								$('#app_application_submenu_block').hide();
							}
						}
					}
				);
			}
		} else {
			time = 0;
			Elem.hide().remove();
			if(submenu_Getnext()<=1){
				$('#app_content_dynamic').removeClass('app_application_submenu_blur');
				$('#app_application_submenu_block').hide();
			}
		}
		if(submenu_Getnext()<=1){
			//Checking animate helps only to know if we pushed the button close
			if(wrapper_broswer('webkit')){ $('#app_content_dynamic').velocity({ blur: 0 }, time, function(){
				//We need to check again if there is another menu replace the old one, so we keep it blur
				if(submenu_Getnext()>1){
					$('#app_content_dynamic').velocity({ blur: 2 }, 100);
				}
			}); }
		}
	},
};

function submenu_Hideall(){
	for(var index in submenu_obj){
		submenu_Clean();
	}
}

//Return the next layer to display full screen
function submenu_Getfull(){
	var next = submenu_Getnext();
	if(next<4){
		next = 4;
	}
	return next;
}

// "1" means that there is no submenu displayed
function submenu_Getnext(){
	submenu_layer = 0;
	for(var index in submenu_obj){
		if(submenu_obj[index].layer > submenu_layer){
			submenu_layer = submenu_obj[index].layer;
		}
	}
	submenu_layer++;
	return submenu_layer;
}

function submenu_Getposition(menu){
	submenu_position = submenu_Getnext();
	for(var index in submenu_obj){
		if(submenu_obj[index].menu === menu){
			submenu_position = submenu_obj[index].layer;
		}
	}
	return submenu_position;
}

function submenu_Clean(layer, animate){
	if(typeof layer !== 'number' || layer<1){
		layer = 1;
	}
	if(typeof animate === 'undefined'){ animate = false; }
	for(var index in submenu_obj){
		if(submenu_obj[index].layer >= layer){
			submenu_obj[index].Hide(animate);
		}
	}
}

function submenu_Build(menu, next){
	if(typeof next === 'undefined'){ next = 1; }
	if(menu in submenu_list){
		var temp = new Submenu(menu, next);
		submenu_Clean(temp.layer);
		$('#app_application_submenu_block').show();
		$('#app_content_dynamic').addClass('app_application_submenu_blur');
		submenu_obj[temp.layer] = temp;
		temp = null;
	}
}

enquire.register(responsive.minDesktop, function() { 
	if(wrapper_broswer('webkit') && submenu_Getnext()>1 && $('#app_content_dynamic').hasClass('app_application_submenu_blur')){
		$('#app_content_dynamic').velocity({ blur: 2 }, 200);
	}
});
enquire.register(responsive.maxTablet, function() { 
	if(wrapper_broswer('webkit') && submenu_Getnext()>1 && $('#app_content_dynamic').hasClass('app_application_submenu_blur')){
		$('#app_content_dynamic').velocity({ blur: 0 }, 200);
	}
});

function submenu_wrapper_width() {
	var width = Math.floor($('#app_application_content').width()/3);
	$('.submenu_wrapper').css('width', width);
}
submenu_wrapper_width();
$(window).resize(submenu_wrapper_width);



var submenu_form_cb_success = function(msg, err){
	var field = 'undefined';
	var msgtp = Lincko.Translation.get('wrapper', 3, 'html'); //Unknown error
	if(err){
		if(typeof msg.field === 'string') { field = msg.field; }
		if(typeof msg.msg === 'string') { msgtp = php_nl2br(msg.msg); }
		base_show_error(msgtp);
		base_form_field_show_error(wrapper_objForm.find("[name="+field+"]"));
		wrapper_objForm.find("[name="+field+"]").focus();
	}
	Lincko.storage.pull(msg);
};

var submenu_form_cb_error = function(xhr_err, ajaxOptions, thrownError){
	var msgtp = Lincko.Translation.get('wrapper', 1, 'html'); //Communication error
	base_show_error(msgtp);
};

var submenu_form_cb_begin = function(){
	var submit_progress_bar = wrapper_objForm.parent().find("[find=submit_progress_bar]");
	base_form_field_hide_error();
	$(document.body).css('cursor', 'progress');
	base_format_form_single(submit_progress_bar);
	submit_progress_bar.show();
};

var submenu_form_cb_complete = function(){
	var submit_progress_bar = wrapper_objForm.parent().find("[find=submit_progress_bar]");
	$(document.body).css('cursor', '');
	base_format_form_single(submit_progress_bar);
	submit_progress_bar.hide();
};
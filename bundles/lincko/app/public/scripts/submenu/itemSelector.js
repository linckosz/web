submenu_list['itemSelector'] = {
	//Set the title of the top
	"_title": {
		"style": "customized_title",
		"title": Lincko.Translation.get('app', 3901, 'html'), //Add Links
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
		"title": Lincko.Translation.get('app', 52, 'html'), //"Select", 
		'hide': true,
		"class": "base_pointer",
		"action": function(Elem, subm) {
			if(!subm.param || !subm.param.selection || !subm.param.item){return;}

			var selection = subm.param.selection;
			//if nothing is selected, then return
			if(Object.keys(selection.files).length < 1 && Object.keys(selection.notes).length < 1){ return; }

			//handle fake parents using taskdetail_linkQueue
			if( (!subm.param.item['_id'] || subm.param.item['_id'] == 'new' || subm.param.item['fake']) && subm.param.uniqueID ){
				$.each(selection, function(type, obj){
					$.each(obj, function(id, bool){
						taskdetail_linkQueue.queue[id] = {
							uniqueID: subm.param.uniqueID,
							parent_type: subm.param.item['_type'],
							id: id,
							type: type,
						}

						/*var tempID = Lincko.storage.get(type, id)['temp_id'];
						if(tempID){
							taskdetail_linkQueue.queue[tempID] = {
								uniqueID: subm.param.uniqueID,
								parent_type: subm.param.item['_type'],
								id: id,
								type: type,
							}
						}*/
					});
				});
				app_application_lincko.prepare('show_queued_links', true);
			}
			else{
				var item_current = Lincko.storage.data[subm.param.item['_type']][subm.param.item['_id']];
				if(!item_current['_files']){
					item_current['_files'] = {};
				}
				$.each(selection.files, function(id, bool){
					item_current['_files'][id] = { access: true };
				});

				if(!item_current['_notes']){
					item_current['_notes'] = {};
				}
				$.each(selection.notes, function(id, bool){
					item_current['_notes'][id] = { access: true };
				});

				
				var param_prepare_sub = {};
				if(!$.isEmptyObject(selection.files)){ param_prepare_sub._files = true; }
				if(!$.isEmptyObject(selection.notes)){ param_prepare_sub._notes = true; }
				var param_prepare = {};
				param_prepare[subm.param.item['_type']+'_'+subm.param.item['_id']] = param_prepare_sub;
				app_application_lincko.prepare(subm.param.item['_type']+'_'+subm.param.item['_id'], true, param_prepare);

				wrapper_sendAction({
					id: subm.param.item['_id'],
					'files>access': selection.files,
					'notes>access': selection.notes,
				}, 'post', subm.param.item['_type'].slice(0, -1)+'/update');
			}
		},
	},
	"itemSelector": {
		"style": "itemSelector",
		"title": "itemSelector",
		"class": "",
	},
}


Submenu_select.itemSelector = function(subm){
	subm.Add_itemSelector();
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
Submenu.prototype.Add_itemSelector = function() {
	var that = this;
	var attribute = this.attribute;
	//this.id is id of submenu
	var submenu_wrapper = this.Wrapper();
	var submenu_content = submenu_wrapper.find("[find=submenu_wrapper_content]");
	submenu_content.prop('id','itemSelector_'+that.id).removeClass('overthrow');
	var submenu_itemSelector = $('#-submenu_itemSelector').clone().prop('id','submenu_itemSelector_'+that.id);
	var elem_menubar = submenu_itemSelector.find('[find=menubar]');
	var elem_searchbar_wrapper = submenu_itemSelector.find('[find=searchbar_wrapper]');
	var elem_list_wrapper = submenu_itemSelector.find('[find=list_wrapper]');
	var elem_list = submenu_itemSelector.find('[find=list]').prop('id',submenu_content.prop('id')+'_list').addClass('overthrow');
	var elem_list_files = elem_list.find('[find=files]');
	var elem_list_notes = elem_list.find('[find=notes]');
	var elem_cards_all = null;

	var elem_submit = submenu_wrapper.find('.submenu_title.submenu_top_side_right').addClass('display_none');





//variables---------------------------------------------------------------------------------------------------------
	//default view is files
	var currentView = 'files';

	//hide notes/files if specified
	if(that.param.hideType){
		$.each(that.param.hideType, function(type, bool){
			elem_menubar.find('[find='+type+']').addClass('display_none');
			elem_list.find('[find=header_'+type+']').addClass('display_none');
		});
	}

	//check for parent item
	var item_parent = null;
	if(that.param.item){
		item_parent = that.param.item;	
	}

	var projectID = app_content_menu.projects_id;
	if(item_parent && item_parent['_parent'] && item_parent['_parent'][0] == 'projects'){
		projectID = item_parent['_parent'][1];
	}

	//can be accessible within submenu instance
	that.param.selection = {
		files: {},
		notes: {},
	}
	var selection = that.param.selection; 

	//selection counter
	var selectionCount = {
		files: function(){
			return (Object.keys(selection.files)).length;
		},
		notes: function(){
			return (Object.keys(selection.notes)).length;
		},
		selected: function(){
			return this.files() + this.notes();
		},
		update: function(){
			var filesCount = this.files();
			var notesCount = this.notes();
			//var selectedCount = filesCount + notesCount;
			this.elem_filesCount.text(filesCount);
			this.elem_notesCount.text(notesCount);
			//this.elem_selectedCount.text(selectedCount);
			if(filesCount < 1){ this.elem_filesCount.addClass('display_none'); }
			else{ this.elem_filesCount.removeClass('display_none'); }
			if(notesCount < 1){ this.elem_notesCount.addClass('display_none'); }
			else{ this.elem_notesCount.removeClass('display_none'); }
			/*if(selectedCount < 1){ this.elem_selectedCount.addClass('display_none'); }
			else{ this.elem_selectedCount.removeClass('display_none'); }*/
			if(filesCount + notesCount > 0){
				elem_submit.removeClass('display_none');
			}
			else{
				elem_submit.addClass('display_none');
			}
		},
	}
	selectionCount.elem_filesCount = elem_menubar.find('[find=files] .submenu_itemSelector_menubar_counter');
	selectionCount.elem_notesCount = elem_menubar.find('[find=notes] .submenu_itemSelector_menubar_counter');
	//selectionCount.elem_selectedCount = elem_menubar.find('[find=selected] .submenu_itemSelector_menubar_counter');
//variables END-------------------------------------------------------------------------------------------------------------


	//adjust iscroll on resize
	var setListWrapperHeight = function(){
		var searchbar_height = 0;
		if(elem_searchbar_wrapper.height() > 0){
			searchbar_height = elem_searchbar_wrapper.outerHeight();
		}
		elem_list_wrapper.height(submenu_content.height() - elem_menubar.outerHeight() - searchbar_height);
	}
	var setListWrapperHeight_timeout;
	$(window).resize(function(){
		clearTimeout(setListWrapperHeight_timeout);
		setListWrapperHeight_timeout = setTimeout(function(){
			setListWrapperHeight();
		}, 450);
	});

	//refresh list iscroll
	var iscrollRefresh = function(){
		setListWrapperHeight();
		if(myIScrollList[elem_list.prop('id')]){
			myIScrollList[elem_list.prop('id')].refresh();
		}
	}


	//build files and notes array
	var items_files = null;
	var items_notes = null;
	if(!that.param.hideType || !that.param.hideType.files){
		items_files = Lincko.storage.list('files', null, null, 'projects', projectID, false);
	}
	if(!that.param.hideType || !that.param.hideType.notes){
		items_notes = Lincko.storage.list('notes', null, null, 'projects', projectID, false);
	}
	//use items_all to check for whether files/notes are hidden
	var items_all = {
		files: items_files,
		notes: items_notes,
	}


	//build searchbar
	var searchbarInst = null;
	var searchbar_keyup = function(words){
		var filteredIDs = [];
		if(!words.length){
			elem_cards_all.removeClass('display_none');
		}
		else{
			$.each(searchbar.filterLinckoItems(items_all[currentView], words), function(i, item){
				filteredIDs.push(item['_id']);
			});

			$.each(elem_cards_all, function(i, elem){
				var elem = $(elem);
				var type = elem.attr('type');
				var id = parseInt(elem.attr('_id'),10);
				if(type != currentView){ return; }
				
				if(filteredIDs.indexOf(id) != -1){ //if exists
					elem.removeClass('display_none');
				}
				else{
					elem.addClass('display_none');
				}
			});
		}
		iscrollRefresh();
	}
	searchbarInst = searchbar.construct(searchbar_keyup);
	elem_searchbar_wrapper.append(searchbarInst.elem);

	

	//build menubar
	var toggleView = function(elem){
		if(elem.hasClass('submenu_itemSelector_menuSelected')){ return; }
		elem_menubar.find('>span').removeClass('submenu_itemSelector_menuSelected');
		elem.addClass('submenu_itemSelector_menuSelected');
		searchbarInst.clear();
		elem_cards_all.removeClass('display_none');

		currentView = elem.attr('find');
		if(currentView == 'files'){
			elem_list_files.removeClass('display_none');
			elem_list_notes.addClass('display_none');
			submenu_itemSelector.removeClass('submenu_itemSelector_showSelectedOnly');
		}
		else if(currentView == 'notes'){
			elem_list_notes.removeClass('display_none');
			elem_list_files.addClass('display_none');
			submenu_itemSelector.removeClass('submenu_itemSelector_showSelectedOnly');
		}
		else{
			elem_list_files.removeClass('display_none');
			elem_list_notes.removeClass('display_none');
			submenu_itemSelector.addClass('submenu_itemSelector_showSelectedOnly');
		}
		iscrollRefresh();

	}
	elem_menubar.find('>span').click(function(){
		toggleView($(this));
		
	});
	/*elem_menubar.find('[find=notes]').click(function(){
		toggleMenuIconClass($(this));
	});
	elem_menubar.find('[find=selected]').click(function(){
		toggleMenuIconClass($(this));
	});*/




	/*
		build list
	*/
	var card_click = function(){
		var elem_card = $(this);
		elem_card.toggleClass('submenu_itemSelector_cardSelected');
		if(elem_card.hasClass('submenu_itemSelector_cardSelected')){
			selection[elem_card.attr('type')][elem_card.attr('_id')] = true;
		}
		else{
			delete selection[elem_card.attr('type')][elem_card.attr('_id')];
		}
		selectionCount.update();
	}

	if(items_all.files){
		$.each(items_all.files, function(i, item){
			//if it is already linked, skip
			if(!item || (item_parent && item_parent['_files'] && item_parent['_files'][item['_id']])){
				items_all.files[i] = null;
				return;
			}

			var elem_card = skylist.draw_fileCard(item).attr('type',item['_type']).attr('_id',item['_id']).click(card_click);
			elem_card.find('[find=card_leftOptions]').recursiveRemove();
			elem_card.find('[find=card_rightOptions]').recursiveRemove();

			elem_list_files.append(elem_card);
			elem_list_files.addClass('app_layers_files_fileslist');
		});
	}

	if(items_all.notes){
		$.each(items_notes, function(i, item){
			//if it is already linked, skip
			if(!item || (item_parent && item_parent['_notes'] && item_parent['_notes'][item['_id']])){
				items_all.notes[i] = null;
				return;
			}

			var elem_card = skylist.draw_noteCard(item).attr('type',item['_type']).attr('_id',item['_id']).click(card_click);
			elem_card.find('[find=card_leftOptions]').recursiveRemove();
			elem_card.find('[find=card_rightOptions]').recursiveRemove();

			elem_list_notes.append(elem_card);
			elem_list_notes.addClass('app_layers_notes_noteslist');
		});
	}

	elem_cards_all = elem_list.find('[find=card]').append($('<span find="check"></span>').addClass('fa fa-check'));








	//build submenu_content
	submenu_content.append(submenu_itemSelector);


	/*------enquireJS--------------------------------------------------------------------*/
	var itemSelector_enquire = {};
	itemSelector_enquire.maxMobileL = {
		match: function(){
			elem_list_wrapper.addClass('skylist_maxMobileL');
		},
		unmatch: function(){
			if(!elem_list_wrapper.hasClass('skylist_maxMobileL_force')){
				elem_list_wrapper.removeClass('skylist_maxMobileL');
			}
		}
	};
	enquire.register(responsive.maxMobileL, itemSelector_enquire.maxMobileL);
	/*-----END OF enquireJS----------------------------------------------------------------*/

	app_application_lincko.add(
		that.id,
		'submenu_hide_'+that.id,
		function(){
			console.log('submenu hide');
			enquire.unregister(responsive.maxMobileL, itemSelector_enquire.maxMobileL);
		}
	);


	//Free memory
	//submenu_wrapper = null; //In some placea it bugs because it's used in a lower scope
	delete submenu_wrapper;
	return true;
}

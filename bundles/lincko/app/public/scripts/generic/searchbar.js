var searchbar = {
	keyup_delay: 400,

	construct: function(keyup_fn, keyup_fn_delay){
		var that = this;
		if(!keyup_fn_delay){
			var keyup_fn_delay = that.keyup_delay;
		}
		var keyupTimeout = null;
		var searchTerms = null;
		var elem_searchbar = $('#-searchbar').clone().removeAttr('id');

		var elem_input = elem_searchbar.find('input');
		var elem_clear_btn = elem_searchbar.find('[find=clear_btn]');
		var elem_overlay = elem_searchbar.find('[find=overlay]');

		elem_input.focus(function(){
			elem_overlay.addClass('display_none');
		});
		elem_input.blur(function(){
			if($(this).val() == ''){
				elem_overlay.removeClass('display_none');
			}	
		});
		elem_input.keyup(function(){
			clearTimeout(keyupTimeout);
			var elem_input = $(this);
			if(elem_input.val() == ''){
				elem_clear_btn.addClass('display_none');
			}
			else{
				elem_clear_btn.removeClass('display_none');
			}
			keyupTimeout = setTimeout(function(){
				if(elem_input.val() == searchTerms){return;}
				searchTerms = elem_input.val();
				if(keyup_fn && typeof keyup_fn == 'function'){
					keyup_fn($.trim(searchTerms).split(/\s+/));
				}
			}, keyup_fn_delay);
		});

		elem_clear_btn.click(function(event){
			event.preventDefault();
			clearTimeout(keyupTimeout);
			elem_input.val('');
			$(this).addClass('display_none');
			keyup_fn('');
			elem_input.blur();
		});

		return {
			elem_overlay: elem_overlay,
			elem_clear_btn: elem_clear_btn,
			elem_input: elem_input,
			elem: elem_searchbar,
			clear: function(){
				if(!this.cleared()){
					this.elem_clear_btn.click();
					//this.elem_input.blur();
				}
			},
			cleared: function(){
				return !this.elem_overlay.hasClass('display_none');
			},
		};
	},

	//items must be array of Lincko.storage.data items such as tasks, notes, files, etc
	filterLinckoItems: function(items, searchTerms){
		if(!items){return false;}
		else if( !searchTerms.length ){ //if searchTerm is empty string ""
			return items;
		}
		var items_filtered = [];
		var item = null;
		var push = false;
		var word = null;
		var userid_array = null;
		var userid = null;
		for( var i=0; i < items.length; i++){ //for each item
			item = items[i];
			if(!item){continue;}
			push = false;

			for( var j=0; j < searchTerms.length; j++){ //for each word
				word = searchTerms[j];
				var burgerOnly = false;
				if( word[0] == '@'){
					word = word.slice(1);
					burgerOnly = '@';
				}
				else if(word.substring(0,2) == '++'){
					word = word.slice(2);
					burgerOnly = '++';
				}

				userid_array = searchbar.searchByUsername(word);
				if(!word.length || (Lincko.storage.searchArray('word', word, [item]).length > 0 && !burgerOnly) ){
					push = true;
					break;
				}
				else if( userid_array.length && (burgerOnly == false || burgerOnly == '@') ){ //userOnly both true/false
					for( var k=0; k < userid_array.length; k++){
						userid = userid_array[k];
						if( item['_type'] == 'tasks' ){
							if(!item['_users']){ //not assigned
								break;
							}
							else if( userid in item['_users'] && item['_users'][userid]['in_charge'] ){
								push = true;
								break;
							}
						}
						else if( item['_type'] == 'notes' || item['_type'] == 'files' ){
							if( item['updated_by'] == userid ){
								push = true;
								break;
							}
						}
					}//END OF for each userid_array
					if(push){
						break;
					}
				}
				else if( searchbar.isDueThisTime(item, word) && (burgerOnly == false || burgerOnly == '++') ){
					push = true;
					break;
				}
			}//END OF for word

			if(push){
				items_filtered.push(item);
			}

		}//END OF for items
		return items_filtered;
	},

	searchByUsername: function(username){
		var userid_array = [];
		var result = Lincko.storage.search('word', username, 'users');
		if($.isEmptyObject(result)){
			return false;
		}
		else{
			$.each( result.users, function( key, value ) {
				userid_array.push(key);
			});
			return userid_array;
		}
	},

	//for tasks
	isDueThisTime: function(item, time){
		if(typeof item != 'object' || item._type != 'tasks' || !item.duration || !item.start || !time){
			return false;
		}

		var isDueThisTime = false;
		var months_obj = {
			long: (new wrapper_date()).month,
			short: (new wrapper_date()).month_short,
			shortNum: (new wrapper_date()).month_short_num,
		};

		var dueMonthIndex = new Date((item.start + item.duration)*1000).getMonth();

		$.each(months_obj, function(key,val){
			if(val[dueMonthIndex].toLowerCase().includes(time.toLowerCase())){
				isDueThisTime = true;
				return false;
			}
		});
		
		return isDueThisTime;
	},

}

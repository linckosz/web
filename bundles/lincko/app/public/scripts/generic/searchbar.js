var searchbar = {
	keyup_delay: 1000,

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
		elem_input.on('keyup paste', function(){
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

	search: function(items, searchTerms, or_logic){
		if(or_logic || typeof searchTerms == 'string' || ($.type(searchTerms) === 'array' && searchTerms.length == 1)){
			//OR logic
			return this.filterLinckoItems(items, searchTerms);
		} else {
			//AND logic
			var filtered = items;
			for(var i in searchTerms){
				filtered = this.filterLinckoItems(filtered, searchTerms[i]);
			}
			return filtered;
		}
	},

	typeSearch: {
		generic: function(item, burgerOnly, word, param_pinyin){
			var push = false;
			if(!burgerOnly || burgerOnly == 'at'){
				//can be tweaked to filter based on permission level
				if(item._perm && searchbar.searchByUsername(word, Object.keys(item._perm), param_pinyin).length){
					push = true;
				}
			}
			return push;
		},
		users: function(item, burgerOnly, word, param_pinyin){
			var push = false;
			var namecard, id_namecard, id_work;
			var namecard_first = null; //workspace namecard
			var namecard_second = null; //shared namecard
			if((!burgerOnly || burgerOnly == 'at')
				&& item._children && typeof item._children.namecards == 'object'){
				id_work = Lincko.storage.getWORKID();
				for(id_namecard in item._children.namecards){
					namecard = Lincko.storage.get('namecards', id_namecard);
					if(namecard){
						if(!namecard_first){ 
							namecard_first = namecard;
						}
						else if(id_work && namecard.workspaces_id == id_work){
							namecard_second = namecard_first;
							namrcard_first = namecard;
						} else {
							namecard_second = namecard;
						}
					}
				}

				//namecard_first has priority in search result
				for(var attr in namecard_first){
					if(attr[0] == '-' || attr[0] == '+'){
						if(Lincko.storage.searchArray('word', word, [namecard_first], attr, param_pinyin).length){
							push = true;
							break;
						}
					}
				}

				if(!push && namecard_second){
					for(var attr in namecard_second){
						//if field is defined in namecard_first, skip
						if((typeof namecard_first[attr] == null || typeof typeof namecard_first[attr] == 'undefined') 
							&& (attr[0] == '-' || attr[0] == '+')){
							if(Lincko.storage.searchArray('word', word, [namecard_second], attr, param_pinyin).length){
								push = true;
								break;
							}
						}
					}
				}
			}
			return push;
		},
		projects: function(item, burgerOnly, word, param_pinyin){
			var push = false;
			if(burgerOnly == false || burgerOnly == 'at'){
				//can be tweaked to filter based on permission level
				if(item._perm && searchbar.searchByUsername(word, Object.keys(item._perm), param_pinyin).length){
					push = true;
				}
			}
			return push;
		},
		tasks: function(item, burgerOnly, word, param_pinyin){
			var push = false;
			var userid_array = [];

			if(!burgerOnly || burgerOnly == 'at'){
				userid_array = item._perm ? searchbar.searchByUsername(word, Object.keys(item._perm), param_pinyin) : [];
			}

			var str_unassigned =  Lincko.Translation.get('app', 3608, 'js').toLowerCase();
			if(	burgerOnly == 'at'
				&& ( word == str_unassigned
					||(app_language_short.indexOf('zh') !== -1 && word == Pinyin.getPinyin(str_unassigned))) ){ //@unassigned search
				push = true;
				if(item._users){
					$.each(item._users, function(uid,obj){
						if(obj.in_charge){ push = false; return false; }
					});
				}
			}
			else if((!burgerOnly || burgerOnly == 'at') && userid_array.length){ //userOnly both true/false
				for( var k=0; k < userid_array.length; k++){
					userid = userid_array[k];
					if( item['_type'] == 'tasks' ){
						if(!item['_users']){ 
							break; 
						}
						else if( userid in item['_users'] && item['_users'][userid]['in_charge'] ){
							push = true;
							break;
						}
					}
				}
			}

			//date search for tasks
			if(!push){
				var str_overdue = Lincko.Translation.get('app', 3630, 'js').toLowerCase(); //overdue
				var str_none = Lincko.Translation.get('app', 103, 'js').toLowerCase(); //none
				if( burgerOnly == 'plus' 
					&&( word == str_overdue
						||(app_language_short.indexOf('zh') !== -1 && word == Pinyin.getPinyin(str_overdue))) ){ //+overdue
					if(searchbar.isOverDue(item)){ push = true; }
				}
				else if( burgerOnly == 'plus' 
						 &&( word == str_none 
						 	||(app_language_short.indexOf('zh') !== -1 && word == Pinyin.getPinyin(str_none))) ){ //+none
					if(searchbar.isNoneDue(item)){ push = true; }
				}
				else if((burgerOnly == false || burgerOnly == 'plus') && searchbar.isDueThisTime(item, word)){
					push = true;
				}
			}

			return push;
		},
		files: function(item, burgerOnly, word, param_pinyin){
			var push = false;
			var userid_array = [];

			if(!burgerOnly || burgerOnly == 'at'){
				var user = Lincko.storage.get('users', item['created_by']);
				if(user && Lincko.storage.searchArray('word', word, [user], true, param_pinyin).length){
					push = true;
				}
			}

			return push;
		},
		notes: this.files, //same rules as files

	},

	//items must be array of Lincko.storage.data items such as tasks, notes, files, etc
	filterLinckoItems: function(items, searchTerms){
		if(!items){return false;}
		if(typeof searchTerms == 'string'){ searchTerms = [searchTerms]; }
		if( searchTerms.length == 1 && !searchTerms[0].length ){ //if searchTerm is empty string ""
			return items;
		}
		
		var items_filtered = [];
		var item = null;
		
		var word = null;
		var userid_array = null;
		var userid = null;

		for( var j=0; j < searchTerms.length; j++){ //for each word
			word = searchTerms[j].toLowerCase();

			var burgerOnly = false;
			if( word[0] == burger_shortcuts.at ){
				word = word.slice(1);
				burgerOnly = 'at';
			}
			else if(word[0] == burger_shortcuts.plus || word[0] == burger_shortcuts.plusAlt){
				//word = word.slice(2);
				word = word.slice(1);
				burgerOnly = 'plus';
			}


			//var param_pinyin = Pinyin.getPinyin(word);
			var param_pinyin = null; //one way pinyin search

			//regular text search
			if(!word.length || !burgerOnly){
				$.merge(items_filtered, Lincko.storage.searchArray(
					'word', word, items, 
					['+title', '+name', '-comment', '-username', '-firstname', '-lastname', '-email'], 
					param_pinyin
				));
			}

			//username and date search
			$.each(items, function(i, item){
				//check if it has been already pushed from regular text search
				var already_pushed = false;
				$.each(items_filtered, function(j, item_filtered){
					if(item_filtered._id == item._id && item_filtered._type == item._type){ 
						already_pushed = true;
						return false; 
					}
				});
				if(already_pushed){ return; }

				var push = false;
				if(typeof searchbar.typeSearch[item._type] == 'function'){
					push = searchbar.typeSearch[item._type](item, burgerOnly, word, param_pinyin);
				} else {
					push = searchbar.typeSearch.generic(item, burgerOnly, word, param_pinyin);
				}
				

				if(push){
					items_filtered.push(item);
				}

			});
		}//END OF for word


		//reorder the filtered items list to match the original items list order
		var items_filtered_reordered = [];
		$.each(items, function(i, item_orig){
			$.each(items_filtered, function(j, item_filtered){
				if(item_orig._id == item_filtered._id && item_orig._type == item_filtered._type){
					items_filtered_reordered.push(item_filtered);
					return false;
				}
			});
		});

		return items_filtered_reordered;
	},

	//search only within the given ids in arr_ids
	searchByUsername: function(word, arr_ids, param_pinyin){
		if(typeof arr_ids != 'object' || !arr_ids){ return false; }

		var uid_result = []; //final list to be returned
		var user_list = [];
		$.each(arr_ids, function(i, id){ //get user object for each id
			var user = Lincko.storage.get('users', id);
			if(user){ user_list.push(user); }
		});

		var user_obj;
		for(var i in user_list){
			user_obj = user_list[i];
			if(Lincko.storage.searchArray('word', word, [user_obj], true, param_pinyin).length){
				uid_result.push(user_obj._id);
				continue;
			}
		}
		return uid_result;
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
			if(val[dueMonthIndex].toLowerCase().indexOf(time.toLowerCase()) > -1){
				isDueThisTime = true;
				return false;
			}
		});
		return isDueThisTime;
	},

	//for tasks
	isOverDue: function(item){
		if(typeof item != 'object' || item._type != 'tasks' || !item.duration || !item.start || item.approved_at){
			return false;
		}else if(tasks_isOverdue(item._id)){
			return true;
		}
		return false;
	},

	//for tasks
	isNoneDue: function(item){
		if(typeof item == 'object' && item._type == 'tasks' && (!item.duration || !item.start)){
			return true;
		} else {
			return false;
		}
	},

}

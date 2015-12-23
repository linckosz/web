var storage_first_request = true; //Help to launch getSchema within getLatest only once at the beginning to insure nothing is missing

/* PRIVATE METHOD */
/*
	NOTE: Do not add this callback to wrapper_sendAction, because wrapper_ajax already launches it internally
*/
var storage_cb_success = function(msg, err, status, data){
	var schema = true;
	var info = false;
	if($.type(data) === 'object' && $.type(data.info) === 'string'){
		info = data.info;
	}

	if($.type(data) === 'object' && $.type(data.partial) === 'object' && $.type(data.partial[wrapper_localstorage.uid]) === 'object'){
		if(Lincko.storage.update(data.partial[wrapper_localstorage.uid], info) && typeof data.lastvisit === 'number'){
			if(info === 'reset'){
				Lincko.storage.schema(data.partial[wrapper_localstorage.uid]);
				schema = false;
			}
			//Update the last visit day only if we are sure the update is finish
			Lincko.storage.setLastVisit(data.lastvisit);
		}
	}
	if(schema && $.type(data) === 'object' && $.type(data.schema) === 'object' && $.type(data.schema[wrapper_localstorage.uid]) === 'object'){
		Lincko.storage.schema(data.schema[wrapper_localstorage.uid]);
	}
	Lincko.storage.firstLatest();
};

/* PRIVATE METHOD */
Lincko.storage.getCOMID = function(){
	if(Lincko.storage.COMID !== null){
		return Lincko.storage.COMID;
	} else if(Lincko.storage.searchCOMID() !== false){
		return Lincko.storage.COMID;
	} else if($.isEmptyObject(Lincko.storage.data)){
		return false;
	} else {
		throw new Error(Lincko.Translation.get('app', 34, 'brut')); //We could not define in which workspace you are.
		return false;
	}
};

/* PRIVATE METHOD */
Lincko.storage.searchCOMID = function(){
	if(
		   Lincko.storage.data
		&& Lincko.storage.data['_']
		&& Lincko.storage.data['_']['companies']
	){
		var object = Lincko.storage.data['_']['companies'];
		for(var key in object) {
			if(object[key].personal_private>0 && object[key].personal_private==wrapper_localstorage.uid && wrapper_localstorage.company === ''){
				Lincko.storage.COMID = parseInt(key, 10);
				app_application_lincko.update('companies');
				return Lincko.storage.COMID;
			} else if(object[key].personal_private==0 && object[key].url && object[key].url == wrapper_localstorage.company){
				Lincko.storage.COMNAME = object[key].name;
				Lincko.storage.COMID = parseInt(key, 10);
				app_application_lincko.update('companies');
				return Lincko.storage.COMID;
			}
		}
		base_show_error(Lincko.Translation.get('app', 33, 'html')); //You are not allowed to access this company's workspace.
		return false;
	}
	return false;
};

//Function that check for latest updates
/* PRIVATE METHOD */
Lincko.storage.getLastVisit = function(){
	//We parse the value to insure it will be an integer
	if(typeof Lincko.storage.last_visit !== 'undefined' && Lincko.storage.last_visit !== null){
		return Lincko.storage.last_visit;
	} else if (wrapper_localstorage.decrypt('lastvisit')){
		return Lincko.storage.last_visit = parseInt(wrapper_localstorage.decrypt('lastvisit'), 10);
	} else {
		return Lincko.storage.last_visit = 0;
	}
};

//Function that check for latest updates
/* PRIVATE METHOD */
Lincko.storage.setLastVisit = function(timestamp){
	timestamp = parseInt(timestamp, 10);
	if(timestamp>=0){
		Lincko.storage.last_visit = timestamp;
		wrapper_localstorage.encrypt('lastvisit', timestamp);
	}
};

//Function update all objects displayed
/* PRIVATE METHOD */
Lincko.storage.display = function(force){
	if(typeof app_application_lincko !== 'undefined'){
		if(typeof force !== 'undefined' && force){
			//Force to list all fields to insure all elements are up to date according to the storage
			var fields_full = [];
			var companies = ['_']; //Always include the default folder
			var company;
			companies.push(Lincko.storage.getCOMID());
			for(var i in companies) {
				company = companies[i];
				if($.type(Lincko.storage.data[company]) === 'object'){
					for(var category in Lincko.storage.data[company]) {
						if($.type(Lincko.storage.data[company][category]) === 'object'){
							app_application_lincko.setFields(category);
						}
					}
				}
			}
			app_application_lincko.update(true);
		} else {
			app_application_lincko.update();
		}
		wrapper_load_progress.move(100);
	}
};


//Function that check for latest updates
/* PRIVATE METHOD */
Lincko.storage.getLatest = function(){
	var arr = {
		'lastvisit': Lincko.storage.getLastVisit(),
		'show_error': false,
	};
	wrapper_sendAction(arr, 'post', 'data/latest', null);
};

//Function that check for latest updates
/* PRIVATE METHOD */
Lincko.storage.getSchema = function(){
	storage_first_request = false; //No need to launch firstLatest()
	var arr = {
		'show_error': false,
	};
	wrapper_sendAction(arr, 'post', 'data/schema', null);
};

//Function that check for latest updates
/* PRIVATE METHOD */
Lincko.storage.getMissing = function(missing){
	if($.type(missing) === 'object'){
		var arr = {
			'partial': {},
			'show_error': false,
		};
		arr.partial[wrapper_localstorage.uid] = missing;
		wrapper_sendAction(arr, 'post', 'data/missing', null);
	}
};

//Function that update the localweb database
/* PRIVATE METHOD */
Lincko.storage.update = function(partial, info){
	var item;
	var update = false;
	var newField = false;
	for(var i in partial) {
		items = partial[i];
		for(var j in items) {
			//Check if the object hierarchy exists
			if(!Lincko.storage.data){
				Lincko.storage.data = {};
				newField = true;
			}
			if(!Lincko.storage.data[i]){
				Lincko.storage.data[i] = {};
				newField = true;
			}
			if(!Lincko.storage.data[i][j]){
				Lincko.storage.data[i][j] = {};
				newField = true;
				app_application_lincko.setFields(j);
			}
			//We merge/update proporties, we do know overwritte the complete object (because history record are dowloaded separatly)
			Lincko.storage.data[i][j] = $.extend(Lincko.storage.data[i][j], items[j]);
			update = true;
		}
		if(update){
			app_application_lincko.prepare(j);
		}
	}
	if(update){
		Lincko.storage.orderRecents(partial);
		Lincko.storage.display();
		wrapper_localstorage.encrypt('data', JSON.stringify(Lincko.storage.data));
		if(newField && !info){
			Lincko.storage.getSchema();
		}
		return true;
	}
	return false;
};

//Function that check the javascript database schema
/* PRIVATE METHOD */
Lincko.storage.schema = function(schema){
	var update = false;
	var missing = {};

	storage_first_request = false; //No need to launch firstLatest()

	//Step 1: Delete all unlinked items
	for(var i in Lincko.storage.data) {
		if(!schema[i]){
			delete Lincko.storage.data[i];
			update = true;
			continue;
		} else {
			for(var j in Lincko.storage.data[i]) {
				category = false;
				if(!schema[i][j]){
					delete Lincko.storage.data[i][j];
					update = true;
					app_application_lincko.prepare(j);
					continue;
				} else {
					for(var k in Lincko.storage.data[i][j]) {
						if(!schema[i][j][k]){
							delete Lincko.storage.data[i][j][k];
							update = true;
							app_application_lincko.prepare(j);
							continue;
						}
					}
				}
			}
		}
	}

	//Step 2: Get all missing data
	//No need update=true because later will it call update() which has it
	for(var i in schema) {
		if(!Lincko.storage.data[i]){
			missing[i] = schema[i];
			continue;
		} else {
			for(var j in schema[i]) {
				if(!Lincko.storage.data[i][j]){
					if(typeof missing[i]==='undefined'){ missing[i] = {}; }
					missing[i][j] = schema[i][j];
					app_application_lincko.setFields(j);
					continue;
				} else {
					for(var k in schema[i][j]) {
						if(typeof Lincko.storage.data[i][j][k] === 'undefined'){
							if(typeof missing[i]==='undefined'){ missing[i] = {}; }
							if(typeof missing[i][j]==='undefined'){ missing[i][j] = {}; }
							missing[i][j][k] = schema[i][j][k];
							app_application_lincko.setFields(j);
							continue;
						}
					}
				}
			}
		}
	}

	if(!$.isEmptyObject(missing)){
		Lincko.storage.getMissing(missing);
	}

	if(update){
		Lincko.storage.orderRecents(Lincko.storage.data, true);
		Lincko.storage.display();
		wrapper_localstorage.encrypt('data', JSON.stringify(Lincko.storage.data));
		return true;
	}
	
	return false;
};

/* PRIVATE METHOD */
Lincko.storage.firstLatest = function(){
	if(storage_first_request){
		storage_first_request = false;
		Lincko.storage.getSchema();
		if(!$.isEmptyObject(Lincko.storage.data)){
			Lincko.storage.display(true);
		} else {
			//If we cannot get data object, we force to download the whole object
			Lincko.storage.setLastVisit(0);
		}
	}
};

/* PRIVATE METHOD */
Lincko.storage.setHistory = function(category, id, stop_order){
	if(typeof force_order === 'undefined'){ stop_order = false; }
	var temp = {};
	var new_key = false;
	var company = Lincko.storage.getCOMID();
	var item;
	var username;

	if($.type(Lincko.storage.data[company]) === 'object' && $.type(Lincko.storage.data[company][category]) === 'object' && $.type(Lincko.storage.data[company][category][id]) === 'object'){
		item = Lincko.storage.data[company][category][id];
		if(typeof item['created_at'] !== 'undefined' && typeof item['created_by'] !== 'undefined' && $.type(item['history']) === 'object'){
			for(var h_created_at in item['history']) {
				for(var h_id in item['history'][h_created_at]) {
					h_item = item['history'][h_created_at][h_id];

					if(typeof Lincko.storage.data_recent[h_created_at] === 'undefined'){ Lincko.storage.data_recent[h_created_at] = {}; new_key = true;  }
					if(typeof Lincko.storage.data_recent[h_created_at][category] === 'undefined'){ Lincko.storage.data_recent[h_created_at][category] = {}; }
					if(typeof Lincko.storage.data_recent[h_created_at][category][id] === 'undefined'){ Lincko.storage.data_recent[h_created_at][category][id] = {}; }

					Lincko.storage.data_recent[h_created_at][category][id][h_id] = {
						by: h_item['by'],
						att: h_item['att'],
					};
					if(typeof h_item['old'] !== 'undefined' && typeof h_item['new'] !== 'undefined'){
						Lincko.storage.data_recent[h_created_at][category][id][h_id]['old'] = h_item['old'];
					}
					Lincko.storage.data_recent[h_created_at][category][id][h_id]['par'] = {};
					if(typeof h_item['par'] !== 'undefined'){
						Lincko.storage.data_recent[h_created_at][category][id][h_id]['par'] = h_item['par'];
					}
					if(username = Lincko.storage.get('users', h_item['by'], 'username')){
						Lincko.storage.data_recent[h_created_at][category][id][h_id]['par']['un'] = username; 
					}
				}
			}
		}
	}

	if(new_key && !stop_order){
		//Sort by key value (timestamp), Object.keys gets only an array of the keys, sort() sorts the array from big to small
		var desc_order = Object.keys(Lincko.storage.data_recent).sort(function(a, b) { return b - a; });
		for(i in desc_order){
			if($.type(Lincko.storage.data_recent[desc_order[i]]) === 'object'){
				temp[desc_order[i]] = Lincko.storage.data_recent[desc_order[i]];
			}
		}
		Lincko.storage.data_recent = temp;
	}

	return true;
}

/* PRIVATE METHOD */
Lincko.storage.orderRecents = function(data, clean){
	var temp = {};
	if(typeof clean === 'undefined'){ clean = false; }
	if(clean){
		Lincko.storage.data_recent = {}; //Clean the history before to rebuild it
	}
	var company = Lincko.storage.getCOMID();
	for(var category in data[company]) {
		for(var id in data[company][category]) {
			Lincko.storage.setHistory(category, id, true);
		}
	}
	
	//Sort by key value (timestamp), Object.keys gets only an array of the keys, sort() sorts the array from big to small
	var desc_order = Object.keys(Lincko.storage.data_recent).sort(function(a, b) { return b - a; });
	for(i in desc_order){
		if($.type(Lincko.storage.data_recent[desc_order[i]]) === 'object'){
			temp[desc_order[i]] = Lincko.storage.data_recent[desc_order[i]];
		}
	}
	Lincko.storage.data_recent = temp;
	app_application_lincko.update(true);
	return true;
};

//Return an object or it's attribute regardless the prefix
/*
	Lincko.storage.get("projects", 5); => get full item
	Lincko.storage.get("tasks", 4); => get full item
	Lincko.storage.get("tasks", 4, "created_at"); => get item attribute
*/
Lincko.storage.get = function(category, id, attribute){
	var companies = ['_']; //Always include the default folder
	companies.push(Lincko.storage.getCOMID());
	if(typeof category === 'string' && category.indexOf('_')!==0){
		category = category.toLowerCase();
	} else {
		return false;
	}
	if(typeof id === 'string'){ id = parseInt(id, 10); }
	if(typeof id !== 'number'){ return false; }

	for(var i in companies) {
		if($.type(Lincko.storage.data[companies[i]]) === 'object' && $.type(Lincko.storage.data[companies[i]][category]) === 'object' && $.type(Lincko.storage.data[companies[i]][category][id]) === 'object'){
			var result = Lincko.storage.data[companies[i]][category][id];
			//Add info to element, use "_" to recognize that it has been added by JS
			result['_id'] = id;
			result['_type'] = category;
			if(typeof attribute === 'string'){
				if(typeof Lincko.storage.data[companies[i]][category][id][attribute] !== 'undefined'){
					result = Lincko.storage.data[companies[i]][category][id][attribute];
				} else if(typeof Lincko.storage.data[companies[i]][category][id]['-'+attribute] !== 'undefined'){
					result = Lincko.storage.data[companies[i]][category][id]['-'+attribute];
				} else if(typeof Lincko.storage.data[companies[i]][category][id]['+'+attribute] !== 'undefined'){
					result = Lincko.storage.data[companies[i]][category][id]['+'+attribute];
				} else if(typeof Lincko.storage.data[companies[i]][category][id]['_'+attribute] !== 'undefined'){
					result = Lincko.storage.data[companies[i]][category][id]['_'+attribute];
				} else {
					result = false;
				}
			}
			return result;
		}
	}
	return false;
};

/* PRIVATE METHOD */
Lincko.storage.isHistoryReady = function(){
	return ($.type(Lincko.storage.data['_']) === 'object' && $.type(Lincko.storage.data['_']['_history_title']) === 'object');
}

/*
	Return an object { title, content }
	Lincko.storage.getHistoryInfo( Lincko.storage.time('latest') ) => Return formatted information about the time object passed in parameter. For a list of time objects like “Lincko.storage.time('recent')”, use a loop.
*/
Lincko.storage.getHistoryInfo = function(history){
	var result = {
		title: null,
		content: null,
	};
	var company = Lincko.storage.getCOMID();

	if(
		   $.type(Lincko.storage.data['_']) === 'object'
		&& $.type(Lincko.storage.data['_']['_history_title']) === 'object'
		&& $.type(Lincko.storage.data['_']['_history_title'][history.type]) === 'object'
		&& (typeof Lincko.storage.data['_']['_history_title'][history.type][history.att] !== 'undefined'
		 || typeof Lincko.storage.data['_']['_history_title'][history.type]['_'] !== 'undefined')
	){
		if(typeof Lincko.storage.data['_']['_history_title'][history.type][history.att] !== 'undefined'){
			result.title = Lincko.storage.data['_']['_history_title'][history.type][history.att];
		} else if(typeof Lincko.storage.data['_']['_history_title'][history.type]['_'] !== 'undefined'){
			result.title = Lincko.storage.data['_']['_history_title'][history.type]['_'];
		}

		result.title = Lincko.storage.formatHistoryInfo(result.title, history);
		var date = new wrapper_date(history.timestamp);
		result.title = '[ '+date.display('date_short')+' ] '+result.title.ucfirst();
		
		var item = Lincko.storage.data[company][history.type][history.id];
		//Add to the content the main title (such as "project name")
		for(var prop in item) {
			if(prop.indexOf('+')===0){
				result.content = item[prop];
				break;
			}
		}
		//Add to the content an optional detail if any (such as "project description")
		if(history.att.indexOf('-')===0 && item[history.att]){
			if(result.content){
				result.content = result.content+' &#8680; '+item[history.att];
			} else {
				result.content = item[history.att];
			}
		}
		result.content = Lincko.storage.formatHistoryInfo(result.content, history);
	}
	
	return result;
};

/* PRIVATE METHOD */
Lincko.storage.formatHistoryInfo = function(text, history){
	var search;
	var replacement;
	var array_needle = text.match(/\[\{.+?\}\]/g);
	var array;
	var filter;

	if(array_needle){
		for(var i in array_needle){
			search = array_needle[i];
			needle = array_needle[i].replace(/\[\{|\}\]/g, '');
			if(history.par && history.par[needle]){
				replacement = history.par[needle];
				text = text.replaceAll(search, replacement);
				continue;
			} else {
				array = needle.split("|");
				needle = array[0].toLowerCase();
				array.shift(); //Remove the first element
				if(array.length>0 && history.par && history.par[needle]){
					replacement = history.par[needle]
					if(typeof array === 'object'){
						for(var i in array){
							filter = array[i].toLowerCase();
							if(filter === 'lower'){
								replacement = replacement.toLowerCase();
							} else if(filter === 'upper'){
								replacement = replacement.toUpperCase();
							} else if(filter === 'ucfirst'){
								replacement = replacement.ucfirst();
							}
						}
					}
					text = text.replaceAll(search, replacement);
					continue;
				}
			}
			text = text.replaceAll(search, '"'+Lincko.Translation.get('app', 21, 'html')+'"');
		}
	}
	return wrapper_to_html(text);
};

/*
	Samples:
	Lincko.storage.search('word', 'autocut'); //Find the word 'autocut' in all categories
	Lincko.storage.search('word', 'a', 'projects'); //Find the word 'a' in the category 'projects'
	Lincko.storage.search('category', null, 'projects'); //Return all items of the category
*/
Lincko.storage.search = function(type, param, category){
	var results = {};
	var find = [];
	var save_result = false;
	var companies = ['_']; //Always include the default folder
	companies.push(Lincko.storage.getCOMID());
	type = type.toLowerCase();
	if(typeof param === 'string'){ param = param.toLowerCase(); }
	if(typeof category === 'string'){
		category = category.toLowerCase();
		if(category.indexOf('_')===0){
			return false;
		}
	}

	//List all items in a category that contain a word
	find['word'] = function(item){
		var save_result = false;
		//Scan each property of an item (don't forget to include "+")
		for(var prop in item) {
			if((prop.indexOf('-')===0 || prop.indexOf('+')===0) && typeof item[prop]==='string'){
				if(item[prop].toLowerCase().indexOf(param)!==-1){
					save_result = true;
				}
			}
		}
		if(save_result){
			return item;
		}
		return false;
	};

	//List all item in a category
	find['category'] = function(item){
		return item;
	};

	if(typeof find[type] === 'function'){
		for(var i in companies) {
			key = companies[i];
			if($.type(Lincko.storage.data[key]) === 'object'){
				categories = {};
				if(typeof category !== 'undefined'){
					if($.type(Lincko.storage.data[key][category]) === 'object'){
						categories = {}
						categories[category] = Lincko.storage.data[key][category];
					}
				} else {
					categories = Lincko.storage.data[key];
				}
				for(var cat in categories) {
					if(cat.indexOf('_')!==0){ //Exclude system object which start by an underscore
						//Scan each item in a category
						for(var item in categories[cat]) {
							save_result = false;
							if(save_result = find[type](categories[cat][item])){
								if(!$.isEmptyObject(save_result)){
									if(
										typeof save_result['personal_private']==='undefined'
										|| ((typeof save_result['personal_private']==='string' || typeof save_result['personal_private']==='number') && parseInt(save_result['personal_private'], 10)===0)
									){
										if(typeof results[cat] === 'undefined'){ results[cat] = {}; }
										results[cat][item] = save_result;
									}
								}
							}
						}
					}
				}
			}
		}
	}
	return results;
};


/*
	We only work with item inside a company, not the common folder '_'
	Lincko.storage.favorite('projects', 2, true); //Save the favorite
	Lincko.storage.favorite('projects', 2); //Request the favorite
	Lincko.storage.favorite('projects', 2, false); //Delete the favorite
*/
Lincko.storage.favorite = function(category, id, save){
	if(typeof category === 'string' && category.indexOf('_')!==0){
		category = category.toLowerCase();
	} else {
		return false;
	}
	if(typeof id !== 'string' && typeof id !== 'number'){ return false; }
	var company = Lincko.storage.getCOMID();
	var index;

	//Before saving it, we do not need to double check if the items exist because it can be temporary hidden by another user 
	
	if(typeof save === 'undefined'){
		if(typeof Lincko.storage.data_favorite[company] !== 'undefined' && typeof Lincko.storage.data_favorite[company][category] !== 'undefined' && $.inArray(id, Lincko.storage.data_favorite[company][category])!=-1){
			return $.inArray(id, Lincko.storage.data_favorite[company][category]);
		}
	} else if(save){
		//Do not save unexisting items
		if(typeof Lincko.storage.data[company] === 'undefined' || typeof Lincko.storage.data[company][category] === 'undefined' || typeof Lincko.storage.data[company][category][id] === 'undefined'){
			return false
		}
		if(typeof Lincko.storage.data_favorite[company] === 'undefined'){
			Lincko.storage.data_favorite[company] = {};
		}
		if(typeof Lincko.storage.data_favorite[company][category] === 'undefined'){
			Lincko.storage.data_favorite[company][category] = [];
		}
		
		index = $.inArray(id, Lincko.storage.data_favorite[company][category]);
		if(index == -1){
			Lincko.storage.data_favorite[company][category].push(id);
			app_application_lincko.update(category);
			wrapper_localstorage.encrypt('data_favorite', JSON.stringify(Lincko.storage.data_favorite));
			//Return it's index position
			return $.inArray(id, Lincko.storage.data_favorite[company][category]);
		} else {
			//Return it's current index position
			return index;
		}
	} else if(!save){
		if(typeof Lincko.storage.data_favorite[company] !== 'undefined' && typeof Lincko.storage.data_favorite[company][category] !== 'undefined'){
			index = $.inArray(id, Lincko.storage.data_favorite[company][category]);
			if(index != -1){
				Lincko.storage.data_favorite[company][category].splice(index, 1); //splice delte and reconstruct the table indexation
				app_application_lincko.update(category);
				wrapper_localstorage.encrypt('data_favorite', JSON.stringify(Lincko.storage.data_favorite));
				return true;
			}
		}
	}
	return false;
};

/*
	If available, move the items into the category to it's new position
	Lincko.storage.moveFavorite('projects', 5, 2) => Move the project No5 to the 2nd favorite position, and then record it to localstorage
	NOTE: the 2nd position equals to the index 1 of an array (the list starts from index 0)
*/
Lincko.storage.moveFavorite = function(category, id, order){
	if(typeof category === 'string' && category.indexOf('_')!==0){
		category = category.toLowerCase();
	} else {
		return false;
	}
	if(typeof id !== 'string' && typeof id !== 'number'){ return false; }
	if(typeof order !== 'number' || order <= 0){ return false; }
	var company = Lincko.storage.getCOMID();
	var index;
	var position;
	var item;
	order = order-1; //We decrease the number to fit array position starting from 0
	if(typeof Lincko.storage.data_favorite[company] === 'object' && typeof Lincko.storage.data_favorite[company][category] === 'object'){
		index = $.inArray(id, Lincko.storage.data_favorite[company][category]);
		if(index != -1){
			item = Lincko.storage.data_favorite[company][category][index];
			if(order != index){
				//We delete the item first
				Lincko.storage.data_favorite[company][category].splice(index, 1);
				//then we reinsert to it's new position
				Lincko.storage.data_favorite[company][category].splice(order, 0, item);
				app_application_lincko.update(category);
				wrapper_localstorage.encrypt('data_favorite', JSON.stringify(Lincko.storage.data_favorite));
				return $.inArray(id, Lincko.storage.data_favorite[company][category]);
			}
		}
	}
	return false;
};

/*
	Return a simple table with item as value;
	Lincko.storage.getFavorites('projects'); => Return all favorite projects
	Lincko.storage.getFavorites('projects', 5); => Return 5 favorite projects
	Lincko.storage.getFavorites('projects', 5, true); => Return 5 favorite projects, and combine with newest created projects if not enough favorites to reach 5 items
	Lincko.storage.getFavorites('projects', null, true); => Return all favorite projects, and combine with all projects from newest to oldest
*/
Lincko.storage.getFavorites = function(category, param, extend){
	var results = [];
	var id_record = {}; //Avoid double record
	var company = Lincko.storage.getCOMID();
	var list;
	var item_tp;
	if(typeof category === 'string' && category.indexOf('_')!==0){
		category = category.toLowerCase();
	} else {
		return results;
	}
	if(typeof param === 'string'){ param = parseInt(id, 10); }
	if(typeof param !== 'number'){ param = -1; } //Since it's below 0, we can scan all items
	if(param == 0){ param = -1; } //0 will display all items
	if(typeof extend === 'undefined'){ extend = false; } //If true, look for creation date at second step

	if(typeof Lincko.storage.data_favorite[company] === 'object' && typeof Lincko.storage.data_favorite[company][category] === 'object'){
		list = Lincko.storage.data_favorite[company][category];
		for(var i in list){
			if(item_tp = Lincko.storage.get(category, list[i])){
				if(typeof id_record[item_tp['_id']]==='undefined' && (typeof item_tp['personal_private']==='undefined' || parseInt(item_tp['personal_private'], 10)===0)){
					//Add info to element, use "_" to recognize that it has been added by JS
					item_tp['_timestamp'] = item_tp['created_at'];
					results.push(item_tp);
					id_record[item_tp['_id']] = true;
					param--;
				}
			}
			if(param===0){
				return results;
			}
		}
	}

	if(extend){
		//Then it will scan creation date until it match the limitation number (param)
		list = Lincko.storage.time('recent_created_at', param, category);
		for(var i in list){
			if(item_tp = Lincko.storage.get(category, list[i].id)){
				if(typeof id_record[item_tp['_id']]==='undefined' && (typeof item_tp['personal_private']==='undefined' || parseInt(item_tp['personal_private'], 10)===0)){
					//Add info to element, use "_" to recognize that it has been added by JS
					item_tp['_timestamp'] = item_tp['created_at'];
					results.push(item_tp);
					id_record[item_tp['_id']] = true;
					param--;
				}
			}
			if(param===0){
				return results;
			}
		}
	}

	return results;
};

//Return a single item which is the earliest My Placeholder project
/* PRIVATE METHOD */
Lincko.storage.getMyPlaceholder = function(){
	var company = Lincko.storage.getCOMID();
	var category = 'projects';
	var item_tp;

	if($.type(Lincko.storage.data[company]) === 'object' && $.type(Lincko.storage.data[company][category]) === 'object'){
		for(var id in Lincko.storage.data[company][category]){
			item_tp = Lincko.storage.data[company][category][id];
			if((typeof item_tp['personal_private']==='string' || typeof item_tp['personal_private']==='number') && parseInt(item_tp['personal_private'], 10)===wrapper_localstorage.uid){
				return Lincko.storage.get(category, id);
			}
		}
	}
	return false;
};

/*
	Return a simple table with item as value;
	Lincko.storage.time('latest'); => Return the latest operation as a single object.
	Lincko.storage.time('recent'); => Return an array of the 50 (default value) latest operations.
	Lincko.storage.time('recent', 10); => Return an array of the 10 latest operations.
	Lincko.storage.time('recent', -1); => Return an array of all operations. (It can be very long!)
	Lincko.storage.time('recent', -1, 'tasks'); => Return an array of all operations done of “tasks”.
	Lincko.storage.time('recent', null, 'tasks'); => Return an array of the 50 (default value) latest operations done of “tasks”.
	Lincko.storage.time(recent_created_at, -1); => Return an array of all object creation operations. Actually “recent_created_at” works with same parameters as “recent”, but it lists only creation operations.
	Lincko.storage.time('between'); => Return an array of all operations done the last 24H.
	Lincko.storage.time('between', null, 'tasks'); => Return an array of all operations done on “tasks” the last 24H.
	Lincko.storage.time('between', null, 'tasks'); => Return an array of all operations done on “tasks” the last 24H.
	Lincko.storage.time('between', {min: 1448487687, max: 1448530609}); => Return an array of all operations done between 2 timestamps (UTC).
	Lincko.storage.time('between', {min: 1448487687, max: 1448530609}, 'projects'); => Return an array of all operations done on “projects” between 2 timestamps (UTC).
*/
Lincko.storage.time = function(type, param, category){
	var results = [];
	var find = [];
	type = type.toLowerCase();
	if(typeof param === 'string'){ param = param.toLowerCase(); }
	if(typeof category === 'string'){ category = category.toLowerCase(); }

	//Return a table of most recent updates
	find['recent'] = function(restriction){
		var most_recent = 50; //Get the 50 latest updated
		var items = {};
		var arr;
		var par;
		var timestamp;
		//Sort by key value (timestamp), Object.keys gets only an array of the keys, sort() sorts the array from big to small
		var desc_order = Object.keys(Lincko.storage.data_recent).sort(function(a, b) { return b - a; });
		if(typeof param === 'number' && param >= 0){ most_recent = param; }
		for(var i in desc_order){
			timestamp = desc_order[i];
			for(var cat in Lincko.storage.data_recent[timestamp]){
				items = {};
				if(typeof category === 'string'){
					if(cat.toLowerCase() === category){
						items = Lincko.storage.data_recent[timestamp][cat];
					}
				} else {
					items = Lincko.storage.data_recent[timestamp][cat];
				}
				for(var item_id in items){
					for(var history_id in items[item_id]){
						if(typeof restriction === 'undefined' || (typeof restriction === 'string' && restriction.toLowerCase() === items[item_id][history_id]['att'])){
							if(most_recent>0 || param<0){
								arr = {
									timestamp: timestamp,
									type: cat,
									id: item_id,
									by: items[item_id][history_id]['by'],
									att: items[item_id][history_id]['att'],
								};
								//We do not keep copy of new and old in data_recent, we just need to keep it from origin 'data' item, because there is 2 cases scenario:
								// 1) Get Old and New from item itself
								// 2) Old and New not available offline, so we download them before displaying (POST | 'data/history')
								if(typeof items[item_id][history_id]['par'] !== 'undefined'){
									par = items[item_id][history_id]['par'];
									if($.type(par) === 'object' && !$.isEmptyObject(par)){
										arr['par'] = par;
									}
								}
								results.push(arr);
							} else {
								return results.length;
							}
							most_recent--;
						}
					}
				}
			}	
		}
		return results.length;
	};

	find['recent_created_at'] = function(){
		find['recent']('created_at');
		return results.length;
	};

	//Return a table of most recent updates
	find['between'] = function(){
		var items = {};
		var arr;
		var par;
		var timestamp;
		var check_param = false;
		if($.type(param) === 'object'){
			if(typeof param.min === 'number' && typeof param.max === 'number' && param.max > param.min){
				check_param = true;
			}
		}
		if(!check_param){
			param = {
				min: Math.floor(Date.now() / 1000) - (3600*24), //24H before
				max: Math.floor(Date.now() / 1000),
			};
		}

		//Sort by key value (timestamp), Object.keys gets only an array of the keys, sort() sorts the array from big to small
		var desc_order = [];
		var temp = Object.keys(Lincko.storage.data_recent).sort(function(a, b) { return b - a; });
		for(var i in temp){
			if(temp[i]>=param.min && temp[i]<=param.max){
				desc_order.push(temp[i]);
			}
		}
		
		for(var i in desc_order){
			timestamp = desc_order[i];
			for(var cat in Lincko.storage.data_recent[timestamp]){
				items = {};
				if(typeof category === 'string'){
					if(cat.toLowerCase() === category){
						items = Lincko.storage.data_recent[timestamp][cat];
					}
				} else {
					items = Lincko.storage.data_recent[timestamp][cat];
				}
				for(var item_id in items){
					for(var history_id in items[item_id]){
						arr = {
							timestamp: timestamp,
							type: cat,
							id: item_id,
							by: items[item_id][history_id]['by'],
							att: items[item_id][history_id]['att'],
						};
						//We do not keep copy of new and old in data_recent, we just need to keep it from origin 'data' item, because there is 2 cases scenario:
						// 1) Get Old and New from item itself
						// 2) Old and New not available offline, so we download them before displaying (POST | 'data/history')
						if(typeof items[item_id][history_id]['par'] !== 'undefined'){
							par = items[item_id][history_id]['par'];
							if($.type(par) === 'object' && !$.isEmptyObject(par)){
								arr['par'] = par;
							}
						}
						results.push(arr);
					}
				}
			}	
		}
		return results.length;
	};

	//Return only the latest update, not a table
	find['latest'] = function(){
		param = 1;
		if(find['recent']()>0){
			results = results[0];
		} else {
			results = false;
		}
		return 1;
	};

	if(typeof find[type] === 'function'){
		if($.type(Lincko.storage.data_recent) === 'object'){
			find[type]();
		}
	}

	return results;
};

/*
	Lincko.storage.list('tasks'); => List all tasks, order from newest to oldest
	Lincko.storage.list('tasks', 5); => List 5 latest tasks
	Lincko.storage.list('tasks', 5, {'projects_id': 5}); => List 5 latest tasks from the project No5, the conditions must be an object
	Lincko.storage.list('tasks', null, {'projects_id': 5, 'created_by': 1}); => List all tasks from the project No5, and created by the user No 1
*/
Lincko.storage.list = function(category, limit, conditions){
	var temp = {};
	var results = [];
	if(typeof category !== 'string' || category.indexOf('_')===0){ return results; }
	if(typeof limit !== 'number' || !limit || limit <= 0){ limit = -1 } //All items
	if($.type(conditions) !== 'object'){ conditions = {}; }

	category = category.toLowerCase();
	var companies = ['_']; //Always include the default folder
	var company;
	var items;
	var item;
	var save = false;
	var timestamp = 0;
	companies.push(Lincko.storage.getCOMID());
	for(var i in companies) {
		company = companies[i];
		if($.type(Lincko.storage.data[company]) === 'object' && $.type(Lincko.storage.data[company][category]) === 'object'){
			items = Lincko.storage.data[company][category];
			for(var j in items) {
				//'_id
				item = items[j];
				//Add info to element, use "_" to recognize that it has been added by JS
				item['_id'] = j;
				item['_type'] = category;
				save = true;
				timestamp = 0;
				if(typeof item['created_at'] !== 'undefined'){
					timestamp = item['created_at'];
				} else if(typeof item['updated_at'] !== 'undefined'){
					timestamp = item['updated_at'];
				}
				for(var property in conditions) {
					if(typeof item[property] !== 'undefined' && item[property]!=conditions[property]){
						save = false;
					}
				}
				if(save){
					if(typeof temp[timestamp] === 'undefined'){ temp[timestamp] = {};}
					temp[timestamp][j] = item;
				}
			}
			break;
		}
	}

	//Order by newest
	if(!$.isEmptyObject(temp)){
		//Sort by key value (timestamp), Object.keys gets only an array of the keys, sort() sorts the array from big to small (newest to oldest)
		var desc_timestamp = Object.keys(temp).sort(function(a, b) { return b - a; });
		var asc_id;
		var item_id;
		for(var i in desc_timestamp){
			timestamp = desc_timestamp[i]
			//Sort IDs from smallest to bigger
			asc_id = Object.keys(temp[timestamp]).sort(function(a, b) { return a - b; });
			for(var j in asc_id){
				item_id = asc_id[j];
				results.push(temp[timestamp][item_id]);
				limit--;
				if(limit==0){
					break;
				}
			}
			if(limit==0){
				break;
			}
		}
	}
	
	return results;
	
};



//setup a check timing procedure to not overload the backend server
var storage_check_timing_interval;
var storage_check_timing_timeout;
var storage_check_timing_speed = 1; //Default = 1, use 4 for demo purpose only
var storage_check_timing = {
	slow: Math.floor(60000/storage_check_timing_speed), //60s
	medium: Math.floor(30000/storage_check_timing_speed), //30s
	fast: Math.floor(15000/storage_check_timing_speed), //15s
	real: Math.floor(8000/storage_check_timing_speed), //8s
	
	timeout: 60000, //60s
	current: Math.floor(30000/storage_check_timing_speed), //30s

	set: function(time, clear, now, timer){
		if(typeof clear !== 'boolean'){ clear = false; }
		if(typeof now !== 'boolean'){ now = false; }
		if(typeof timer !== 'boolean'){ timer = false; }
		if(now){
			Lincko.storage.getLatest();
		}
		if(clear || storage_check_timing.current != time){
			storage_check_timing.current = time;
			storage_check_timing.launch();
		}
		if(timer){
			window.clearTimeout(storage_check_timing_timeout);
			storage_check_timing_timeout = window.setTimeout(function(){
				storage_check_timing.set(storage_check_timing.medium, true);
			}, storage_check_timing.timeout);
		}
		storage_check_timing.current = time;
	},

	launch: function(){
		window.clearTimeout(storage_check_timing_timeout);
		window.clearInterval(storage_check_timing_interval);
		storage_check_timing_interval = window.setInterval(function(){
			Lincko.storage.getLatest();
		}, storage_check_timing.current);
	},
};

$(window).on({
	//now + 60s (clear)
	blur:		function(){ storage_check_timing.set(storage_check_timing.slow, true, true); },
	//now + 30s (clear)
	focus:		function(){ storage_check_timing.set(storage_check_timing.medium, true, true); },
	//15s (clear 1st + 60s)
	keyup:		function(){ storage_check_timing.set(storage_check_timing.fast, false, false, true); },
	change:		function(){ storage_check_timing.set(storage_check_timing.fast, false, false, true); },
	copy:		function(){ storage_check_timing.set(storage_check_timing.fast, false, false, true); },
	past:		function(){ storage_check_timing.set(storage_check_timing.fast, false, false, true); },
	mousedown:	function(){ storage_check_timing.set(storage_check_timing.fast, false, false, true); },
});



JSfiles.finish(function(){
	wrapper_load_progress.move(60);
	if(Lincko.storage.last_visit_clean){
		//Force to redownload all data to get language support
		Lincko.storage.setLastVisit(0);
	} else {
		Lincko.storage.data = JSON.parse(wrapper_localstorage.decrypt('data'));
	}
	if(!Lincko.storage.data){
		Lincko.storage.data = {};
	}
	Lincko.storage.data_favorite = JSON.parse(wrapper_localstorage.decrypt('data_favorite'));
	if(!Lincko.storage.data_favorite){
		Lincko.storage.data_favorite = {};
	}
	wrapper_load_progress.move(65);
	Lincko.storage.orderRecents(Lincko.storage.data);
	wrapper_load_progress.move(70);
	if($.isEmptyObject(Lincko.storage.data)){
		Lincko.storage.setLastVisit(0);
		Lincko.storage.getLatest();
	} else {
		setTimeout(function(){
			Lincko.storage.getLatest();
		}, 1000);
		wrapper_load_progress.move(100);
	}

	//Launch the time interval for back server data check
	storage_check_timing.launch();

	//Check the schema every 30 minutes
	setInterval(function(){
		Lincko.storage.getSchema();
	}, 1800000); //30min

}, 10);

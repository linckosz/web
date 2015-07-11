var storage_quota = [];
var storage_first_request = true; //Help to launch getSchema within getLatest only once at the beginning to insure nothing is missing

var storage_cb_latest_success = function(msg, err, status, data){
	if(typeof data.storage === 'object' && typeof data.storage[Lincko.storage.getUID()] && typeof data.lastvisit === 'number'){
		if(Lincko.storage.update(data.storage[Lincko.storage.getUID()])){
			Lincko.storage.setLastVisit(data.lastvisit);
			Lincko.storage.display();
		}
	}
	Lincko.storage.firstLatest();
};

var storage_cb_schema_success = function(msg, err, status, data){
	if(typeof data.schema === 'object' && typeof data.schema[Lincko.storage.getUID()]){
		Lincko.storage.schema(data.schema[Lincko.storage.getUID()]);
		Lincko.storage.display();
	}
};

var storage_cb_missing_success = function(msg, err, status, data){
	if(typeof data.missing === 'object' && typeof data.missing[Lincko.storage.getUID()]){
		if(Lincko.storage.update(data.missing[Lincko.storage.getUID()])){
			Lincko.storage.display();
		}
	}
};

Lincko.storage.getCOMID = function(){
	if(Lincko.storage.COMID !== null){
		return Lincko.storage.COMID;
	} else if(Lincko.storage.searchCOMID() !== false){
		return Lincko.storage.COMID;
	} else {
		throw new Error(Lincko.Translation.get('app', 34, 'brut')); //We could not define in which workspace you are.
		return false;
	}
};

Lincko.storage.searchCOMID = function(){
	if(Lincko.storage.getCOM() === ''){
		return Lincko.storage.COMID = 0;
	} else if(
		   Lincko.storage.data
		&& Lincko.storage.data['_']
		&& Lincko.storage.data['_']['companies']
	){
		var object = Lincko.storage.data['_']['companies'];
		for(var key in object) {
			if(object[key].url && object[key].url == Lincko.storage.getCOM()){
				return Lincko.storage.COMID = parseInt(key, 10);
			}
		}
		base_show_error(Lincko.Translation.get('app', 33, 'html')); //You are not allowed to access this company's workspace.
		return false;
	}
	return false;
};

Lincko.storage.getPrefix = function(){
	return '_'+Lincko.storage.getUID()+'_';
};

//Function that check for latest updates
Lincko.storage.getLastVisit = function(){
	//We parse the value to insure it will be an integer
	if(Lincko.storage.last_visit && Lincko.storage.last_visit !== null){
		return Lincko.storage.last_visit;
	} else if (Lincko.storage.decrypt('lastvisit')){
		return Lincko.storage.last_visit = parseInt(Lincko.storage.decrypt('lastvisit'), 10);
	} else {
		return Lincko.storage.last_visit = 0;
	}
};

//Function that check for latest updates
Lincko.storage.setLastVisit = function(timestamp){
	timestamp = parseInt(timestamp, 10);
	if(timestamp>0){
		Lincko.storage.last_visit = timestamp;
		Lincko.storage.encrypt('lastvisit', timestamp);
	}
};

//Function update all objects displayed
Lincko.storage.display = function(){
	if(typeof app_application_objects !== 'undefined'){
		app_application_objects.lincko_record_update();
	}
};


//Function that check for latest updates
Lincko.storage.getLatest = function(){
	var arr = {
		'lastvisit': Lincko.storage.getLastVisit(),
	};
	wrapper_sendAction(arr, 'post', 'data/latest', storage_cb_latest_success);
};

//Function that check for latest updates
Lincko.storage.getSchema = function(){
	wrapper_sendAction('', 'get', 'data/schema', storage_cb_schema_success);
};

//Function that check for latest updates
Lincko.storage.getMissing = function(missing){
	if(typeof missing === 'object'){
		var arr = {
			'missing': {},
		};
		arr.missing[Lincko.storage.getUID()] = missing;
		wrapper_sendAction(arr, 'post', 'data/missing', storage_cb_missing_success);
	}
};

Lincko.storage.encrypt = function (link, txt){
	var result = false;
	//If we over quota once, we do not continue to avoid CPU usage, it slow down the first loading but it's an easy solution
	//A more complex solution would be to progressively delete few elements, and only load them at start, but it's a CPU consumer method
	if(typeof storage_quota[link] !== 'undefined' && !storage_quota[link]){
		return true;
	} else {
		try {
			txt = Lincko.storage.getSha()+btoa(utf8_encode(txt));
			var time = 1000*3600*24*31; //Keep the value for 1 month
			result = amplify.store(Lincko.storage.getPrefix()+link, txt, { expires: time });
		} catch(e) {
			storage_quota[link] = false;
			amplify.store(Lincko.storage.getPrefix()+link, null);
			console.log(e);
		}
	}
	return result;
}

Lincko.storage.decrypt = function (link){
	var txt = false;
	var temp;
	var sha = Lincko.storage.getSha();
	try {
		temp = amplify.store(Lincko.storage.getPrefix()+link);
		if(temp.indexOf(Lincko.storage.getSha())===0){
			txt = temp.substr(sha.length);
			return utf8_decode(atob(txt));
		}
	} catch(e) {
		amplify.store(Lincko.storage.getPrefix()+link, null);
		txt = false;
	}
	return txt;
}


//Function that update the localweb database
Lincko.storage.update = function(schema){
	var item;
	var update = false;
	for(var i in schema) {
		items = schema[i];
		for(var j in items) {
			//Check if the object hierarchy exists
			if(!Lincko.storage.data){
				Lincko.storage.data = {};
			}
			if(!Lincko.storage.data[i]){
				Lincko.storage.data[i] = {};
			}
			Lincko.storage.data[i][j] = items[j];
			update = true;
		}
	}
	if(update){
		Lincko.storage.orderRecents(schema);
		Lincko.storage.encrypt('data', JSON.stringify(Lincko.storage.data));
		return true;
	}
	return false;
};

//Function that check the javascript database schema
Lincko.storage.schema = function(schema){
	var item;
	var update = false;
	var missing = {};

	//Step 1: Delete all unlinked items
	for(var i in Lincko.storage.data) {
		items = false;
		if(!schema[i]){
			delete Lincko.storage.data[i];
			update = true;
			continue;
		} else {
			items = Lincko.storage.data[i];
		}
		if(items){
			for(var j in items) {
				if(!schema[i][j]){
					delete Lincko.storage.data[i][j];
					update = true;
					continue;
				}
			}
		}
	}

	//Step 2: Get all missing data
	for(var i in schema) {
		items = false;
		if(!Lincko.storage.data[i]){
			missing[i] = schema[i];
			continue;
		} else {
			items = schema[i];
		}
		if(items){
			for(var j in items) {
				if(!Lincko.storage.data[i] || !Lincko.storage.data[i][j]){
					if(typeof missing[i]==='undefined'){ missing[i] = {}; }
					missing[i][j] = schema[i][j];
					continue;
				}
			}
		}
	}
	
	if(!$.isEmptyObject(missing)){
		Lincko.storage.getMissing(missing);
	}

	if(update){
		Lincko.storage.data_recent = {}; //Clean the history before to rebuild it
		Lincko.storage.orderRecents(Lincko.storage.data);
		Lincko.storage.encrypt('data', JSON.stringify(Lincko.storage.data));
		return true;
	}
	
	return false;
};

Lincko.storage.firstLatest = function(){
	if(storage_first_request){
		storage_first_request = false;
		Lincko.storage.getSchema();
	}
};

//Force to delete all data that are not linked to the user for security reason and to release some space
Lincko.storage.cleanLocal = function(){
	$.each(amplify.store(), function (storeKey) {
		if(storeKey.indexOf(Lincko.storage.getPrefix())!==0){
			amplify.store(storeKey, null);
		}
	});
};

/*
	Samples:
	Lincko.storage.search('word', 'autocut');
	Lincko.storage.search('word', 'a', 'projects');
*/
Lincko.storage.search = function(type, param, category){
	var results = {};
	var find = [];
	var save_result = false;
	var companies = ['_']; //Always include the default folder
	companies.push(Lincko.storage.getCOMID());
	type = type.toLowerCase();
	if(typeof param === 'string'){ param = param.toLowerCase(); }
	if(typeof category === 'string'){ category = category.toLowerCase(); }

	find['word'] = function(item){
		var save_result = false;
		//Scan each property of an item
		for(var prop in item) {
			if(prop.indexOf('-')===0 && typeof item[prop]==='string'){
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

	if(typeof find[type] === 'function'){
		for(var i in companies) {
			key = companies[i];
			if(typeof Lincko.storage.data[key] === 'object'){
				categories = {};
				if(typeof category !== 'undefined'){
					if(typeof Lincko.storage.data[key][category] === 'object'){
						categories = {}
						categories[category] = Lincko.storage.data[key][category];
					}
				} else {
					categories = Lincko.storage.data[key];
				}
				for(var cat in categories) {
					//Scan each item in a category
					for(var item in categories[cat]) {
						save_result = false;
						if(save_result = find[type](categories[cat][item])){
							if(!$.isEmptyObject(save_result)){
								if(typeof results[cat] === 'undefined'){ results[cat] = {}; }
								results[cat][item] = save_result;
							}
						}
					}
				}
			}
		}
	}
	return results;
}

Lincko.storage.orderRecents = function(data){
	var temp = {};
	categories = data[Lincko.storage.getCOMID()];
	for(var cat in categories) {
		for(var item in categories[cat]) {
			if(typeof categories[cat][item]['created_at'] !== 'undefined' && typeof categories[cat][item]['created_by'] !== 'undefined' && typeof categories[cat][item]['history'] === 'object'){
				Elem = categories[cat][item];

				if(typeof Lincko.storage.data_recent[Elem['created_at']] === 'undefined'){ Lincko.storage.data_recent[Elem['created_at']] = {}; }
				if(typeof Lincko.storage.data_recent[Elem['created_at']][cat] === 'undefined'){ Lincko.storage.data_recent[Elem['created_at']][cat] = {}; }
				if(typeof Lincko.storage.data_recent[Elem['created_at']][cat][item] === 'undefined'){ Lincko.storage.data_recent[Elem['created_at']][cat][item] = {}; }

				Lincko.storage.data_recent[Elem['created_at']][cat][item][0] = {
					created_by: Elem['created_by'],
					attribute: 'created_at',
					old: null,
					new: null,
				};

				for(var h_created_at in Elem['history']) {
					for(var h_id in Elem['history'][h_created_at]) {
						h_Elem = Elem['history'][h_created_at][h_id];

						if(typeof Lincko.storage.data_recent[h_created_at] === 'undefined'){ Lincko.storage.data_recent[h_created_at] = {}; }
						if(typeof Lincko.storage.data_recent[h_created_at][cat] === 'undefined'){ Lincko.storage.data_recent[h_created_at][cat] = {}; }
						if(typeof Lincko.storage.data_recent[h_created_at][cat][item] === 'undefined'){ Lincko.storage.data_recent[h_created_at][cat][item] = {}; }

						Lincko.storage.data_recent[h_created_at][cat][item][h_id] = {
							created_by: h_Elem['created_by'],
							attribute: h_Elem['attribute'],
							old: null,
							new: null,
						};
					}
				}
			}
		}
	}
	//Sort by key value (timestamp), Object.keys gets only an array of the keys, sort() sorts the array from big to small
	var table = Object.keys(Lincko.storage.data_recent).sort(function(a, b) { return b - a; });
	for(i in table){
		if(typeof Lincko.storage.data_recent[table[i]] === 'object'){
			temp[table[i]] = Lincko.storage.data_recent[table[i]];
		}
	}
	Lincko.storage.data_recent = temp;
	return true;
}

Lincko.storage.time = function(type, param, category){
	var results = {};
	var find = [];
	company = Lincko.storage.getCOMID();
	type = type.toLowerCase();
	if(typeof param === 'string'){ param = param.toLowerCase(); }
	if(typeof category === 'string'){ category = category.toLowerCase(); }

	return results;
}

//Update every 30s automatically
setInterval(function(){
	//Lincko.storage.getLatest();
}, 30000);

//Check the schema every 5 minutes
setInterval(function(){
	//Lincko.storage.getSchema();
}, 300000);

JSfiles.finish(function(){
	Lincko.storage.data = JSON.parse(Lincko.storage.decrypt('data'));
	if(!Lincko.storage.data){
		Lincko.storage.data = {};
	}
	Lincko.storage.orderRecents(Lincko.storage.data);
	Lincko.storage.cleanLocal();
	Lincko.storage.getLatest();
});


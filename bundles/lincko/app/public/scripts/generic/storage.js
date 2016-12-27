var storage_first_request = true; //Help to launch getSchema within getLatest only once at the beginning to insure nothing is missing
var storage_first_launch = true;
var storage_first_onboarding = true;
var storage_keep_messages = false; //At false in .schema we delete messages, but at true we keep them because we may return only a part of
var storage_items_updated = {};
/* PRIVATE METHOD */
/*
	NOTE: Do not add this callback to wrapper_sendAction, because wrapper_ajax already launches it internally
*/
var storage_cb_success = function(msg, err, status, data){
	var schema = true;
	var info = false;
	var lastvisit_prev = Lincko.storage.getLastVisit();
	storage_items_updated = {};
	var allow_set_lastvisit = true;
	if($.type(data) === 'object' && $.type(data.info) === 'string'){
		info = data.info;
	}

	//Need to keep ".iud" to insure we receive the same user data
	if($.type(data) === 'object' && $.type(data.partial) === 'object' && $.type(data.partial[wrapper_localstorage.uid]) === 'object' && !$.isEmptyObject(data.partial[wrapper_localstorage.uid])){
		if(Lincko.storage.update(data.partial[wrapper_localstorage.uid], info)){
			if(info === 'reset'){
				Lincko.storage.schema(data.partial[wrapper_localstorage.uid]);
				storage_local_storage.launch_data();
				wrapper_localstorage.cleanLocalWorkspace();
				schema = false;
			}
		} else {
			allow_set_lastvisit = false;
		}
	}

	//Notify the user on desktop
	app_models_history.notification(storage_items_updated, lastvisit_prev);
	storage_items_updated = {};

	if(schema && $.type(data) === 'object' && $.type(data.schema) === 'object' && $.type(data.schema[wrapper_localstorage.uid]) === 'object' && !$.isEmptyObject(data.schema[wrapper_localstorage.uid])){
		Lincko.storage.schema(data.schema[wrapper_localstorage.uid]);
	}
	//Update the last visit day only if we are sure the update is finish
	if(allow_set_lastvisit && $.type(data) === 'object' && typeof data.lastvisit === 'number'){
		storage_local_storage.launch_lastvist(data.lastvisit);
	}

	if(storage_first_request){
		Lincko.storage.firstLatest();
	} else if(data && data.partial && data.partial.uncomplete){
		Lincko.storage.getSchema();
	}
};

//Launch the onboadring sync the first time it receive the database
var storage_launch_onboarding = function(){
	if(storage_first_onboarding){
		setTimeout(function(){
			app_application_lincko.prepare('launch_onboarding', true);
		}, 300); //The few ms help to make sure we finish previous operation that may make the focus lost
		storage_first_onboarding = false;
		return true;
	}
	return false;
}

//Help to record local_storage in another thread and with a delay to limit impact on immediate JS updates
var storage_local_storage = {
	data: false,
	lastvisit: false,
	timeout: null,

	//toto => tmp to avoid browser crash
	browser_cleaner: function(data){
		var result = {};
		if(!wrapper_limit_json){
			for(var cat in Lincko.storage.data){
				if(cat=='chats' || cat=='messages'){ //Exclude everything about chats, it can be very heavy messages are downloaded in live
					continue;
				}
				result[cat] = data[cat];
			}
		} else {
			for(var cat in Lincko.storage.data){
				//Just keep the minimum to consult offline the most important
				if(typeof cat == 'string' && (cat.indexOf('_')===0 || cat=='workspaces' || cat=='projects' || cat=='tasks' || cat=='files')){
					result[cat] = data[cat];
				}
			}
		}
		return result;
	},

	launch_data: function(){
		storage_local_storage.data = true;
		storage_local_storage.timer();
	},

	launch_lastvist: function(lastvisit){
		storage_local_storage.lastvisit = lastvisit;
		storage_local_storage.timer();
	},

	timer: function(){
		clearTimeout(storage_local_storage.timeout);
		storage_local_storage.timeout = setTimeout(function(){
			if(storage_local_storage.data!==false){
				var data = storage_local_storage.browser_cleaner(Lincko.storage.data);
				wrapper_localstorage.encrypt('data', data);
			}
			if(storage_local_storage.lastvisit!==false){
				Lincko.storage.setLastVisit(storage_local_storage.lastvisit);
			}
			storage_local_storage.data = false;
			storage_local_storage.lastvisit = false;
		}, 3000);
	},

};

Lincko.storage.getParent = function(type, id, attr) {
	var parent = false;
	var elem = Lincko.storage.get(type, id);
	if(elem){
		var parent_type = elem._parent[0];
		var parent_id = elem._parent[1];
		if (elem && parent_type && parent_id) {
			parent = Lincko.storage.get(parent_type, parent_id, attr);
		}
	}
	return parent;
};

Lincko.storage.getLastNotif = function(type, id) {
	var elem = Lincko.storage.get(type, id);
	if(elem && elem["_users"] && elem["_users"][wrapper_localstorage.uid] && elem["_users"][wrapper_localstorage.uid]["noticed"]){
		return parseInt(elem["_users"][wrapper_localstorage.uid]["noticed"], 10);
	}
	return 0;
};

/* PRIVATE METHOD */
Lincko.storage.getWORKID = function(){
	if(Lincko.storage.WORKID !== null){
		return Lincko.storage.WORKID;
	} else if(Lincko.storage.searchWORKID() !== false){
		return Lincko.storage.WORKID;
	} else if($.isEmptyObject(Lincko.storage.data)){
		return false;
	} else {
		throw new Error(Lincko.Translation.get('app', 34, 'brut')); //We could not define in which workspace you are.
		return false;
	}
};

/* PRIVATE METHOD */
Lincko.storage.getWORKNAME = function(){
	if(Lincko.storage.WORKID !== null){
		return Lincko.storage.WORKNAME;
	} else if(Lincko.storage.searchWORKID() !== false){
		return Lincko.storage.WORKNAME;
	} else if($.isEmptyObject(Lincko.storage.data)){
		return false;
	} else {
		throw new Error(Lincko.Translation.get('app', 34, 'brut')); //We could not define in which workspace you are.
		return false;
	}
};

/* PRIVATE METHOD */
Lincko.storage.searchWORKID = function(){
	if(wrapper_localstorage.workspace == ''){
		Lincko.storage.WORKID = 0;
		Lincko.storage.WORKNAME = Lincko.Translation.get('app', 40, 'js');
		app_application_lincko.prepare('workspaces_'+Lincko.storage.WORKID, true);
		return Lincko.storage.WORKID;
	} else if(
		   Lincko.storage.data
		&& Lincko.storage.data['workspaces']
	){
		var object = Lincko.storage.data['workspaces'];
		for(var key in object) {
			if(object[key].url && object[key].url.length > 0 && object[key].url.toLowerCase() == wrapper_localstorage.workspace.toLowerCase()){
				Lincko.storage.WORKNAME = object[key].name;
				Lincko.storage.WORKID = parseInt(key, 10);
				app_application_lincko.prepare('workspaces_'+Lincko.storage.WORKID, true);
				return Lincko.storage.WORKID;
			}
		}
	}
	base_show_error(Lincko.Translation.get('app', 33, 'js')); //You are not allowed to access this workspace.
	return false;
};

//Function that check for latest updates
/* PRIVATE METHOD */
Lincko.storage.getLastVisit = function(){
	//We parse the value to insure it will be an integer
	if(typeof Lincko.storage.last_visit != 'undefined' && Lincko.storage.last_visit !== null){
		return Lincko.storage.last_visit;
	}
	var decrypt_lastvisit = wrapper_localstorage.decrypt('lastvisit');
	if(decrypt_lastvisit){
		return Lincko.storage.last_visit = parseInt(decrypt_lastvisit, 10);
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
Lincko.storage.display = function(prepare, force){
	if(typeof prepare != 'undefined'){ prepare  = false; }
	if(typeof force != 'undefined'){ force  = false; }
	if(typeof app_application_lincko != 'undefined'){
		if(force){
			app_application_lincko.prepare(prepare, true); //Update now
		} else {
			app_application_lincko.prepare(prepare); //Wait for timer
		}
		setTimeout(function(){
			wrapper_load_progress.move(100);
		},200);
	}
};

//Function that check for latest updates
/* PRIVATE METHOD */
var storage_ajax_latest = {};
Lincko.storage.getLatest = function(force){
	var lastvisit = Lincko.storage.getLastVisit();
	if(typeof force == 'boolean' && force == true){
		lastvisit = 0; //Force to get the whole database
	}
	var arr = {
		'lastvisit': lastvisit,
		'show_error': false,
	};
	//This helps to avoid too many backend runs
	//http://www.ajax-tutor.com/130/handle-response/
	if(storage_ajax_latest[lastvisit] && storage_ajax_latest[lastvisit]['readyState']!=4){
		return true; //Don't launch anymore latest if one is already running
	} else {
		for(var i in storage_ajax_latest){
			if('abort' in storage_ajax_latest[i]){
				storage_ajax_latest[i].abort();
			}
			storage_ajax_latest[i] = null;
			delete storage_ajax_latest[i];
		}
		wrapper_sendAction(arr, 'post', 'data/latest', function(){
			var lastvisit = arr.lastvisit;
			storage_ajax_latest[lastvisit] = null;
			delete storage_ajax_latest[lastvisit];
			storage_launch_onboarding();
		});
		storage_ajax_latest[lastvisit] = wrapper_xhr;
	}
};

//Function that check for latest updates
/* PRIVATE METHOD */
Lincko.storage.getSchema = function(){
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
		wrapper_sendAction(arr, 'post', 'data/missing', function(){
			storage_launch_onboarding();
		});
	}
};

//Function that update the localweb database
/* PRIVATE METHOD */
Lincko.storage.update = function(partial, info){
	var item;
	var item_old;
	var item_new;
	var update = false;
	var update_real = false;
	var new_item = false;
	var updatedAttributes = {};
	var currentRange = '';
	var children_list = {};
	var _children = {};
	for(var category in Lincko.storage.data) {
		children_list[category] = {};
		for(var id in Lincko.storage.data[category]) {
			if(typeof Lincko.storage.data[category][id]['_children'] != 'undefined'){
				children_list[category][id] = JSON.stringify(Lincko.storage.data[category][id]['_children']);
			}
		}
	}
	for(var i in partial) {
		//Check if the object hierarchy exists
		if(typeof Lincko.storage.data == 'undefined'){ Lincko.storage.data = {}; }
		if(typeof Lincko.storage.data[i] == 'undefined'){ Lincko.storage.data[i] = {}; }
		for(var j in partial[i]) {
			update_real = false;
			new_item = false;
			currentRange = i+'_'+j;
			updatedAttributes = {};
			updatedAttributes[currentRange] = {};
			//If only update_at (parent->touch), we do not prepare for update
			if(typeof Lincko.storage.data[i][j] != 'undefined'){
				for(var k in partial[i][j]){
					//if(k!="_children" && k!="_id" && k!="type" && k!="history" && k!="created_at" && k!="created_by" && k!="updated_at" && k!="updated_by"){
					if(k!="_children" && k!="_id" && k!="type" && k!="history" && k!="created_at" && k!="created_by" && k!="updated_by"){
						if(typeof Lincko.storage.data[i][j][k] == 'undefined'){ //New field
							update_real = true;
							updatedAttributes[currentRange][k] = true;
							//break; --> must keep going to get all the attribute that has been changed
						} else if(typeof Lincko.storage.data[i][j][k] == 'object'){ //Different object
							if(JSON.stringify(Lincko.storage.data[i][j][k]) != JSON.stringify(partial[i][j][k])){
								update_real = true;
								updatedAttributes[currentRange][k] = true;
								//break;
							}
						} else if(Lincko.storage.data[i][j][k] != partial[i][j][k]){ //Different value
							update_real = true;
							updatedAttributes[currentRange][k] = true;
							//break;
						}
					}
				}
			} else {
				update_real = true;
				new_item = true;
			}

			if(Lincko.storage.data && Lincko.storage.data[i] && Lincko.storage.data[i][j] && Lincko.storage.data[i][j]['_children']){ //to keep _children. partial doesnt include _children. later, childrenList() will rebuild this anyways
				_children = Lincko.storage.data[i][j]['_children'];
				Lincko.storage.data[i][j] = partial[i][j];
				Lincko.storage.data[i][j]._children = _children;
			}
			else{
				Lincko.storage.data[i][j] = partial[i][j];
			}

			/*
			//build "new" for item
			Lincko.storage.data[i][j]['new'] = false; //If the table need to be shown as viewed, if it doesn't exist we consider it's already viewed
			if(typeof Lincko.storage.data[i][j]['viewed_by'] != 'undefined'){
				if(Lincko.storage.data[i][j]['viewed_by'].indexOf(';'+wrapper_localstorage.uid+';') == -1){
					Lincko.storage.data[i][j]['new'] = true;
				}
				delete Lincko.storage.data[i][j]['viewed_by'];
			}
			*/
			/*
			//build "not" for history
			Lincko.storage.data[i][j]['_not'] = false;
			if(typeof Lincko.storage.data[i][j]['history'] != 'undefined'){
				for(var timestamp in Lincko.storage.data[i][j]['history']){
					for(var k in Lincko.storage.data[i][j]['history'][timestamp]){
						Lincko.storage.data[i][j]['history'][timestamp][k]['not'] = false;
						if(typeof Lincko.storage.data[i][j]['history'][timestamp][k]['notid'] != 'undefined'){
							if(Lincko.storage.data[i][j]['history'][timestamp][k]['notid'].indexOf(';'+wrapper_localstorage.uid+';') == -1){
								Lincko.storage.data[i][j]['history'][timestamp][k]['not'] = true;
								Lincko.storage.data[i][j]['_not'] = true;
							}
						}
						delete Lincko.storage.data[i][j]['history'][timestamp][k]['notid'];
					}
				}
			}
			*/
			if(update_real){
				//console.log("update ==> "+i+'_'+j);
				storage_items_updated[i] = true;
				app_models_history.refresh(i, j); //It helps to force updating any history info tab in the application
				app_application_lincko.prepare(i+'_'+j, false, updatedAttributes);
			}
			if(new_item && (i=='projects' || i=='chats')){
				app_models_history.reset();
			}
			update = true;
		}
	}

	if(update){
		setTimeout(function(){
			//Lincko.storage.childrenList(partial, children_list);
			Lincko.storage.childrenList(); //We should not scan the whole database, it slows down the list but Sky had an issue of getting _children visible for notes when adding a comment
			Lincko.storage.display();
		}, 300);
		storage_local_storage.launch_data();
		if(storage_first_launch){
			storage_first_launch = false; //Help to trigger some action once the database is downloaded
			app_application_lincko.prepare('first_launch', true);
			setTimeout(function(){
				wrapper_load_progress.move(100);
			}, 200);
		}
		return true;
	}
	return false;
};

//Function that check the javascript database schema
/* PRIVATE METHOD */
Lincko.storage.schema = function(schema){
	if(typeof schema=='undefined'){ schema = {}; }

	var update = false;
	var missing = {};

	storage_first_request = false; //No need to launch firstLatest()

	//Step 1: Delete all unlinked items (only check 2 levels deep)
	for(var i in Lincko.storage.data) {
		if(i=='_history'){
			//don't delete history records
			continue;
		}
		if(!schema[i]){
			delete Lincko.storage.data[i];
			update = true;
			continue;
		} else {
			for(var j in Lincko.storage.data[i]) {
				category = false;
				//We clean at the very first schema, but then we keep messages because the user may go up in history
				if(typeof schema[i][j] == 'messages' && storage_keep_messages){
					continue;
				}
				if(
					   typeof schema[i][j] == 'undefined'
					//|| (typeof Lincko.storage.data[i][j]['deleted_at'] != 'undefined' && Lincko.storage.data[i][j]['deleted_at']==null && schema[i][j]==false) //We keep deleted items
					|| (typeof Lincko.storage.data[i][j]['deleted_at'] != 'undefined' && $.isNumeric(Lincko.storage.data[i][j]['deleted_at']) && schema[i][j]==true)
				){
					delete Lincko.storage.data[i][j];
					update = true;
					app_application_lincko.prepare(i+"_"+j);
					continue;
				}
			}
		}
	}

	storage_keep_messages = true;

	//Step 2: Get all missing data
	//No need update=true because later will it call update() which has it
	for(var i in schema) {
		if(!$.isEmptyObject(schema[i])){
			if(!Lincko.storage.data[i]){
				missing[i] = schema[i];
				app_application_lincko.prepare(i);
				continue;
			} else {
				for(var j in schema[i]) {
					if(!Lincko.storage.data[i][j]){
						if(typeof missing[i]=='undefined'){ missing[i] = {}; }
						missing[i][j] = schema[i][j];
						app_application_lincko.prepare(i+"_"+j);
						continue;
					}
				}
			}
		}
	}

	if(!$.isEmptyObject(missing)){
		Lincko.storage.getMissing(missing);
	}

	if(update){
		setTimeout(function(){
			Lincko.storage.childrenList();
			Lincko.storage.display();
		}, 300);
		return true;
	}
	
	return false;
};

/* PRIVATE METHOD */
Lincko.storage.firstLatest = function(){
	if(storage_first_request){
		storage_first_request = false;
		storage_keep_messages = false; //The first time we open the application, we clean the local database
		Lincko.storage.getSchema();
		if(!$.isEmptyObject(Lincko.storage.data)){
			Lincko.storage.display(true, true); //I don't think we need to force, probability of mismatching is almost null
		} else {
			//If we cannot get data object, we force to download the whole object
			Lincko.storage.setLastVisit(0);
		}
	}
};

/* PRIVATE METHOD */
//toto => we are not using data here, so for any update we are rebuilding the whole children list
Lincko.storage.childrenList = function(data, children_list, category_focus, category_id){
	var parent_type = null;
	var parent_id = 0;
	var change = false;
	if(typeof children_list != 'object'){
		children_list = {};
		//Clean children
		for(var category in Lincko.storage.data) {
			//if category_focus is given, skip all other categories
			if(typeof category_focus == 'string' && category != category_focus){
				continue;
			}
			children_list[category] = {};
			for(var id in Lincko.storage.data[category]) {
				//if category_id is given, skip all other ids
				if(category_id && id != category_id){
					continue;
				}
				if(typeof Lincko.storage.data[category][id]['_children'] != 'undefined'){ 
					children_list[category][id] = JSON.stringify(Lincko.storage.data[category][id]['_children']);
				}
				delete Lincko.storage.data[category][id]['_children'];
			}
		}
	}

	//Rebuild children tree
	for(var category in Lincko.storage.data) {
		//if category_focus is given, skip all other categories
		if(typeof category_focus == 'string' && category == category_focus){
			continue;
		}
		for(var id in Lincko.storage.data[category]) {
			if(typeof Lincko.storage.data[category][id]['_parent']!='undefined' && typeof Lincko.storage.data[category][id]['_parent'][0]=='string' && Lincko.storage.data[category][id]['_parent'][1]){
				parent_type = Lincko.storage.data[category][id]['_parent'][0];
				parent_id = Lincko.storage.data[category][id]['_parent'][1];
				
				//if category_id is given, skip all other ids
				if(category_id && parent_id != category_id){
					continue;
				}
				if(Lincko.storage.data[parent_type] && Lincko.storage.data[parent_type][parent_id]){
					if(!Lincko.storage.data[parent_type][parent_id]['_children']){
						Lincko.storage.data[parent_type][parent_id]['_children'] = {};
					}
					if(!Lincko.storage.data[parent_type][parent_id]['_children'][category]){
						Lincko.storage.data[parent_type][parent_id]['_children'][category] = {};
					}
					Lincko.storage.data[parent_type][parent_id]['_children'][category][id] = true;
				}
			}
		}
	}

	//Check which children list has been updated
	for(var category in Lincko.storage.data) {
		//if category_focus is given, skip all other categories
		if(typeof category_focus == 'string' && category != category_focus){
			continue;
		}
		if(typeof children_list[category] == 'undefined'){
			app_application_lincko.prepare(true); //Update everything
			change = true;
			continue;
		}
		for(var id in Lincko.storage.data[category]) {
			//if category_id is given, skip all other ids
			if(category_id && id != category_id){
				continue;
			}
			if(typeof Lincko.storage.data[category][id]['_children'] != 'undefined'){
				var updatedAttributes = {};
				updatedAttributes[category+'_'+id] = {'_children': true };
				if(typeof children_list[category][id] == 'undefined'){
					app_application_lincko.prepare(category+'_'+id, false, updatedAttributes); //Update everything
					change = true;
				} else if(children_list[category][id] != JSON.stringify(Lincko.storage.data[category][id]['_children'])){
					app_application_lincko.prepare(category+'_'+id, false, updatedAttributes); //Update everything
					change = true;
				}
			}
		}
	}

	//Rebuild exclude item for chats list
	Lincko.storage.cache.init();

	if(change){
		storage_local_storage.launch_data();
	}
	
	app_application_lincko.prepare(false, true); //Launch updates
	return true;
};

//Return an object or it's attribute regardless the prefix
/*
	Lincko.storage.get("projects", 5); => get full item
	Lincko.storage.get("tasks", 4); => get full item
	Lincko.storage.get("tasks", 4, "created_at"); => get item attribute
*/
Lincko.storage.get = function(category, id, attribute, deleted){
	if(typeof category === 'string' && category.indexOf('_')!==0){
		category = category.toLowerCase();
	} else {
		return false;
	}
	if(typeof id === 'string'){ id = parseInt(id, 10); }
	if(typeof id !== 'number'){ return false; }
	if(typeof deleted != 'boolean'){ deleted = false; }

	if($.type(Lincko.storage.data) === 'object' && $.type(Lincko.storage.data[category]) === 'object' && $.type(Lincko.storage.data[category][id]) === 'object'){
		var result = Lincko.storage.data[category][id];
		
		/*
		toto => If we do not allow to get a deleted element by default creates several issue to fix
		if(!deleted && typeof result['deleted_at'] != 'undefined' && $.isNumeric(result['deleted_at'])){
			//Don't get deleted elements
			return false;
		}
		*/
		
		//Add info to element, use "_" to recognize that it has been added by JS
		result['_id'] = parseInt(id, 10);
		result['_type'] = category;
		if(typeof attribute === 'string'){
			if(typeof Lincko.storage.data[category][id][attribute] !== 'undefined'){
				result = Lincko.storage.data[category][id][attribute];
			} else if(typeof Lincko.storage.data[category][id]['-'+attribute] !== 'undefined'){
				result = Lincko.storage.data[category][id]['-'+attribute];
			} else if(typeof Lincko.storage.data[category][id]['+'+attribute] !== 'undefined'){
				result = Lincko.storage.data[category][id]['+'+attribute];
			} else if(typeof Lincko.storage.data[category][id]['_'+attribute] !== 'undefined'){
				result = Lincko.storage.data[category][id]['_'+attribute];
			} else {
				result = false;
			}
		}
		return result;
	}
	return false;
};

//Return the main information of the file like +title, +name, etc
/*
	Lincko.storage.getPlus("projects", 5);
*/
Lincko.storage.getPlus = function(category, id){
	if(typeof category === 'string' && category.indexOf('_')!==0){
		category = category.toLowerCase();
	} else {
		return false;
	}
	if(typeof id === 'string'){ id = parseInt(id, 10); }
	if(typeof id !== 'number'){ return false; }

	if($.type(Lincko.storage.data) === 'object' && $.type(Lincko.storage.data[category]) === 'object' && $.type(Lincko.storage.data[category][id]) === 'object'){
		var result = Lincko.storage.data[category][id];
		for(var att in result){
			if(att.indexOf('+')===0){
				return result[att];
			}
		}
	}
	return false;
};

Lincko.storage.whoHasAccess = function(category, id){
	var list =  [];
	var perm = Lincko.storage.get(category, id, '_perm');
	if(perm){
		for(var users_id in perm){
			list.push(parseInt(users_id, 10));
		}
	}
	return list;
};

Lincko.storage.canI = function(rcud, category, id, child_type){
	if(typeof rcud == 'string'){
		if(rcud=='read'){ rcud=0; }
		else if(rcud=='create'){ rcud=1; }
		else if(rcud=='edit'){ rcud=2; }
		else if(rcud=='delete'){ rcud=3; }
		else if(rcud=='restore'){ rcud=3; }
	}
	if($.isNumeric(rcud)){ rcud = parseInt(rcud, 10); }
	if(rcud==1 && typeof child_type == 'string'){ id = parseInt(id, 10); }
	if(rcud<0 || rcud>3){
		return false;
	}
	var perm = Lincko.storage.get(category, id, '_perm');
	if(perm){
		if(typeof perm[wrapper_localstorage.uid] != 'undefined'){
			if(rcud == 1){ //create works with child type and role of current element
				var role = Lincko.storage.get('roles', perm[wrapper_localstorage.uid][1]);
				if(role){
					for(var att in role){
						if(typeof role['perm_'+child_type] != 'undefined'){
							if(rcud <= role['perm_'+child_type]){
								return true;
							}
						} else if(typeof role['perm_all'] != 'undefined'){
							if(rcud <= role['perm_all']){
								return true;
							}
						}
					}
				}
			} else if(rcud <= perm[wrapper_localstorage.uid][0]){
				return true;
			}
		}
	}
	return false;
};

Lincko.storage.getSettings = function(){
	var settings = false;
	if(typeof Lincko.storage.settingsLocal === 'object'){
		settings = Lincko.storage.settingsLocal;
	}
	else{
		settings = Lincko.storage.get("settings", wrapper_localstorage.uid, "setup");
		if(settings){
			settings = JSON.parse(settings);
		}
	}
	
	return settings;
}

Lincko.storage.getOnboarding = function(){
	var onboarding = Lincko.storage.get("settings", wrapper_localstorage.uid, "onboarding");
	if(onboarding){
		onboarding = JSON.parse(onboarding);
	}
	return onboarding;
}

Lincko.storage.list_latestProjects = function(){
	var settings = Lincko.storage.getSettings();
	if(!settings.latestvisitProjects){
		return [];
	}

	var projects_array = [];
	for(var i = 0; i < settings.latestvisitProjects.length; i++){
		projects_array.push(Lincko.storage.get('projects', settings.latestvisitProjects[i]));
	}

	return projects_array;	
}


/* PRIVATE METHOD */
Lincko.storage.isHistoryReady = function(){
	return ($.type(Lincko.storage.data) === 'object' && $.type(Lincko.storage.data['_history_title']) === 'object');
};

/*
	Return an object { title, content }
	Lincko.storage.getHistoryInfo( Lincko.storage.hist(null, 1); ) => Return formatted information about the time object passed in parameter. For a list of time objects like “Lincko.storage.hist(null, 50);”, use a loop.
*/
Lincko.storage.getHistoryInfo = function(history){
	var result = {
		title: '',
		date: '',
		content: '',
		root: {
			title: '',
			history: null,
		},
	};

	if(
		   $.type(Lincko.storage.data) === 'object'
		&& $.type(Lincko.storage.data['_history_title']) === 'object'
		&& $.type(Lincko.storage.data['_history_title'][history.type]) === 'object'
		&& (typeof Lincko.storage.data['_history_title'][history.type][history.cod] !== 'undefined'
		 || typeof Lincko.storage.data['_history_title'][history.type] !== 'undefined')
	){
		if(typeof Lincko.storage.data['_history_title'][history.type][history.cod] !== 'undefined'){
			result.title = Lincko.storage.data['_history_title'][history.type][history.cod];
		} else if(typeof Lincko.storage.data['_history_title'][history.type] !== 'undefined'){
			result.title = Lincko.storage.data['_history_title'][history.type];
		}

		result.root = {
			title: result.title,
			history: history,
		};

		if(history.par){
			result.title = Translation_filter(result.title, history.par, true);
		}

		var date = new wrapper_date(history.timestamp);
		result.title = result.title.ucfirst();
		result.date = date.display('date_very_short');

		//console.log(history);
		if(history.type=="comments" && (history.by==0 || history.by==1)){
			result.content = app_models_resume_format_sentence(history.id);
			return result;
		}
		result.content = app_models_resume_format_answer(result.content);
		
		var item = Lincko.storage.data[history.type][history.id];
		//Add to the content the main title (such as "project name")
		for(var prop in item) {
			if(prop.indexOf('+')===0){
				result.content = item[prop];
				break;
			}
		}
		//Add to the content an optional detail if any (such as "project description")
		if(history.att.indexOf('-')!=0){
			attribute = "-"+history.att;
		} else {
			attribute = history.att;
		}
		if(attribute.indexOf('-')===0 && item[attribute]){
			if(result.content){
				result.content = result.content+' &#8680; '+item[attribute];
			} else {
				result.content = item[attribute];
			}
		}
		
		if(history.par){
			result.content = Translation_filter(result.content, history.par,false);
		}
		
	}
	return result;
};

/* PRIVATE METHOD */
Lincko.storage.formatHistoryInfo = function(text, history){
	if(typeof text != 'string'){ return ''; }
	var search;
	var replacement;
	var array_needle = text.match(/\[\{.+?\}\]/g);
	var array;
	var filter;

	if(array_needle){
		for(var i in array_needle){
			search = String(array_needle[i]);
			needle = search.replace(/\[\{|\}\]/g, '');
			if(history.par && typeof history.par[needle] != 'undefined'){
				replacement = history.par[needle];
				text = text.replaceAll(search, replacement);
				continue;
			} else {
				array = needle.split("|");
				needle = array[0].toLowerCase();
				array.shift(); //Remove the first element
				if(history.par && typeof history.par[needle] != 'undefined'){
					replacement = history.par[needle];
					if(array.length>0 && typeof array === 'object'){
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
			text = text.replaceAll(search, Lincko.Translation.get('app', 21, 'html'));
		}
	}
	return text; // normaly we should not use wrapper_to_html(text) here
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
				else{
					try{
						if((Pinyin.GetQP(item[prop])).indexOf(Pinyin.GetQP(param)) !== -1){ //convert hanzi into pinyin and match
							save_result = true;
						}
					}
					catch(e){/*pinyin error*/}
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
			if($.type(Lincko.storage.data) === 'object'){
				categories = {};
				if(typeof category !== 'undefined'){
					if($.type(Lincko.storage.data[category]) === 'object'){
						categories = {}
						categories[category] = Lincko.storage.data[category];
					}
				} else {
					categories = Lincko.storage.data;
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
										|| ((typeof save_result['personal_private']==='string' || typeof save_result['personal_private']==='number') && (save_result['personal_private']==null || save_result['personal_private']==0))
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
	return results;
};

/*
	array - array of items to conduct search
	results - will return array not object
	attr - optional: (str or array) specific attribute to search
	pinyin - optional: default is false. whether to apply pinyin match
*/
Lincko.storage.searchArray = function(type, param, array, attr, pinyin){
	var results = [];
	var find = [];
	var save_result = false;
	type = type.toLowerCase();
	if(typeof param === 'string'){ param = param.toLowerCase(); }
	if(typeof pinyin != 'boolean'){ var pinyin = false; }

	//List all items in a category that contain a word
	find['word'] = function(item){
		var save_result = false;
		//Scan each property of an item (don't forget to include "+")
		for(var prop in item) {

			//if specific attr is wanted, but doesnt match the prop, continue
			if(attr){
				if(typeof attr == 'string' && prop != attr){ continue; }
				if($.type(attr) == 'array' && $.inArray(prop, attr) == -1){ continue; }
			}

			if((prop.indexOf('-')===0 || prop.indexOf('+')===0) && typeof item[prop]==='string'){
				if(item[prop].toLowerCase().indexOf(param)!==-1){
					save_result = true;
				}
				else{
					try{
						if((Pinyin.GetQP(item[prop])).indexOf(Pinyin.GetQP(param)) !== -1){ //convert hanzi into pinyin and match
							save_result = true;
						}
					}
					catch(e){/*pinyin error*/}
				}
			}
		}
		if(save_result){
			return item;
		}
		return false;
	};

	if(typeof find[type] === 'function'){
			if($.type(array) === 'array'){
				//Scan each item in a category
				for(var item in array){
					save_result = false;
					if(save_result = find[type](array[item])){
						if(!$.isEmptyObject(save_result)){
							if(
								typeof save_result['personal_private']==='undefined'
								|| ((typeof save_result['personal_private']==='string' || typeof save_result['personal_private']==='number') && (save_result['personal_private']==null || save_result['personal_private']==0))
							){
								if(typeof results === 'undefined'){ results = []; }
								results.push(save_result);
							}
						}
					}
				}

			}
	}
	return results;
};


/*
	Return a integer
	Lincko.storage.getAllow('projects', 5); => Return the maximum allowed to the user
*/

Lincko.storage.getAllow = function(category, id){
	category = category.toLowerCase();
	var category_ori = category;
	var item;
	var role;
	var limit = 100; //by security limit to 100 loops
	alert('Add comparison with authoization table, grant and owner, no need to scanne if maxi 0');
	while(item = Lincko.storage.get(category, id) && limit>0){
		if(typeof item['_perm']!=='undefined'){
			if(typeof item['_perm']['single']!=='undefined'){
				return item['_perm']['single'];
			} else if(typeof item['_perm']['roles_id']!=='undefined'){
				if(role = Lincko.storage.get('roles', item['_perm']['roles_id'])){
					if(role['perm_grant']){
						return 2; //Maximum permission
					} else if(typeof role['perm_'+category_ori]){
						return role['perm_'+category_ori];
					} else {
						return role['perm_all'];
					}
				}
			}
		} else if(item['parent']!=null && item['parent_id']!=null){
			category = item['parent'];
			id = item['parent_id'];
		}
		limit--;
	}
	return 0;
};

//Return a single item which is the earliest My Placeholder project
/* PRIVATE METHOD */
Lincko.storage.getMyPlaceholder = function(){
	var category = 'projects';
	var item_tp;

	if($.type(Lincko.storage.data[category]) === 'object'){
		for(var id in Lincko.storage.data[category]){
			item_tp = Lincko.storage.data[category][id];
			if((typeof item_tp['personal_private']==='string' || typeof item_tp['personal_private']==='number') && parseInt(item_tp['personal_private'], 10)===wrapper_localstorage.uid){
				return Lincko.storage.get(category, id);
			}
		}
	}
	return false;
};

Lincko.storage.getRoot = function(type, id) {
	var current = Lincko.storage.get(type, id);
	var parent = Lincko.storage.getParent(type, id);
	while(parent){
		type = parent["_type"];
		id = parent["_id"];
		current = parent;
		if(type=="workspaces"){ //Do not scan until workspace
			break;
		}
		parent = Lincko.storage.getParent(type, id);
	}
	return current;
}

Lincko.storage.getCommentRoot = function(type, id) {
	var current = Lincko.storage.get(type, id);
	var parent = Lincko.storage.getParent(type, id);
	while(parent){
		type = parent["_type"];
		id = parent["_id"];
		if(type=="workspaces" || type=="chats" || type == "projects" ){ //Do not scan until workspace
			break;
		}
		current = parent;
		parent = Lincko.storage.getParent(type, id);
	}
	return current;
}

Lincko.storage.isProjectActivity = function(type, id) {
	var current = Lincko.storage.get(type, id);
	var parent = Lincko.storage.getParent(type, id);
	while(parent){
		type = parent["_type"];
		id = parent["_id"];
		current = parent;
		if(type=="chats"){ //Exclude chats in projects
			return false;
		} else if(type=="projects"){ //Is a project activity
			return id;
		}
		parent = Lincko.storage.getParent(type, id);
	}
	return false; //Anything else is not a project activity
}

//It helps to access some value faster to avoid many calls
Lincko.storage.cache = {
	
	first_init: false,
	
	exclude_chats: {},
	getExcludeChats: function(){
		if(!this.first_init){
			this.first_init = this.init();
		}
		return $.extend(true, {}, this.exclude_chats);
	},
	
	exclude_projects: {},
	getExcludeProjects: function(){
		if(!this.first_init){
			this.first_init = this.init();
		}
		return $.extend(true, {}, this.exclude_projects);
	},
	
	notify: {},
	getNotify: function(type, id){
		if(!this.first_init){
			this.first_init = this.init();
		}
		if(this.notify[type] && this.notify[type][id]){
			return this.notify[type][id];
		}
		return false;
	},

	statistics: {},
	getStatistics: function(type, id, cat){
		if(!this.first_init){
			this.first_init = this.init();
		}
		if(this.statistics[type] && this.statistics[type][id] && this.statistics[type][id][cat]){
			return this.statistics[type][id][cat];
		}
		return 0;
	},

	init: function(type_reset, id_reset){
		var item_cat;
		var children;
		var single;
		var last_notif;

		if(typeof type_reset == 'undefined' && typeof id_reset == 'undefined'){
			this.exclude_chats = {};
			this.exclude_projects = {};
			this.notify = {};
			this.statistics = {};
		}

		if(storage_first_launch){
			return false;
		}

		item_cat = "chats";
		if(typeof type_reset == 'undefined' || type_reset==item_cat){
			for(var item_id in Lincko.storage.data[item_cat]){
				if(typeof type_reset != 'undefined' && typeof id_reset != 'undefined' && id_reset!=item_id){
					continue;
				}
				last_notif = Lincko.storage.getLastNotif(item_cat, item_id);
				children = Lincko.storage.tree(item_cat, item_id, "children", false, true);
				if(typeof this.exclude_projects[item_cat] == "undefined"){ this.exclude_projects[item_cat] = {}; }
				this.exclude_projects[item_cat][item_id] = true; //For all projects exclude all chats items
				if(Lincko.storage.get(item_cat, item_id, "single")){
					if(typeof this.exclude_chats[item_cat] == "undefined"){ this.exclude_chats[item_cat] = {}; }
					this.exclude_chats[item_cat][item_id] = true; //no need to display chats creation for single ones
				}
				if(children){
					for(var cat in children){
						for(var id in children[cat]){
							//For projects, exclude everything (also deleted_at) which is about chats
							if(typeof this.exclude_projects[cat] == "undefined"){ this.exclude_projects[cat] = {}; }
							this.exclude_projects[cat][id] = true;
							//For chats exlude everything else (also deleted_at) which is not level 1 children
							if(typeof Lincko.storage.data[cat][id]["_parent"] != "undefined" && Lincko.storage.data[cat][id]["_parent"][0]!="chats"){
								if(typeof this.exclude_chats[cat] == "undefined"){ this.exclude_chats[cat] = {}; }
								this.exclude_chats[cat][id] = true;
							}
							//Skip excluded
							if(this.exclude_chats[cat] && this.exclude_chats[cat][id]){
								continue;
							}
							//Record notifications
							if(!Lincko.storage.data[cat][id]['deleted_at'] && Lincko.storage.data[cat][id]['history']){
								for(var hist_timestamp in Lincko.storage.data[cat][id]['history']){
									if(hist_timestamp > last_notif){
										for(var hist_id in Lincko.storage.data[cat][id]['history'][hist_timestamp]){
											if(
												   Lincko.storage.data[cat][id]['history'][hist_timestamp][hist_id]['by'] != wrapper_localstorage.uid
												&& app_models_history.validHist(
														Lincko.storage.data[item_cat][item_id],
														Lincko.storage.data[cat][id],
														Lincko.storage.data[cat][id]['history'][hist_timestamp][hist_id]
													)
												){
												if(typeof this.notify[item_cat] == "undefined"){ this.notify[item_cat] = {}; }
												if(typeof this.notify[item_cat][item_id] == "undefined"){
													this.notify[item_cat][item_id] = 1;
												} else {
													this.notify[item_cat][item_id]++;
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}

		item_cat = "projects";
		if(typeof type_reset == 'undefined' || type_reset==item_cat){
			for(var item_id in Lincko.storage.data[item_cat]){
				if(typeof type_reset != 'undefined' && typeof id_reset != 'undefined' && id_reset!=item_id){
					continue;
				}
				last_notif = Lincko.storage.getLastNotif(item_cat, item_id);
				children = Lincko.storage.tree(item_cat, item_id, "children", true, true);
				if(children){
					for(var cat in children){
						for(var id in children[cat]){
							//Skip excluded
							if(this.exclude_projects[cat] && this.exclude_projects[cat][id]){
								continue;
							}
							//Record notifications
							if(!Lincko.storage.data[cat][id]['deleted_at'] && Lincko.storage.data[cat][id]['history']){
								for(var hist_timestamp in Lincko.storage.data[cat][id]['history']){
									if(hist_timestamp > last_notif){
										for(var hist_id in Lincko.storage.data[cat][id]['history'][hist_timestamp]){
											if(
												   Lincko.storage.data[cat][id]['history'][hist_timestamp][hist_id]['by'] != wrapper_localstorage.uid
												&& app_models_history.validHist(
														Lincko.storage.data[item_cat][item_id],
														Lincko.storage.data[cat][id],
														Lincko.storage.data[cat][id]['history'][hist_timestamp][hist_id]
													)
												){
												if(typeof this.notify[item_cat] == "undefined"){ this.notify[item_cat] = {}; }
												if(typeof this.notify[item_cat][item_id] == "undefined"){
													this.notify[item_cat][item_id] = 1;
												} else {
													this.notify[item_cat][item_id]++;
												}
											}
										}
									}
								}
							}
							//Record statistics tasks/notes/files
							if(
								!Lincko.storage.data[cat][id]['deleted_at']
								&& (
									   (cat=="tasks" && !Lincko.storage.data[cat][id]['approved'] && !Lincko.storage.data[cat][id]['_tasksup'])
									||  cat=="notes"
									||  cat=="files"
								)
							){
								if(typeof this.statistics[item_cat] == "undefined"){ this.statistics[item_cat] = {}; }
								if(typeof this.statistics[item_cat][item_id] == "undefined"){ this.statistics[item_cat][item_id] = {}; }
								if(typeof this.statistics[item_cat][item_id][cat] == "undefined"){
									this.statistics[item_cat][item_id][cat] = 1;
								} else {
									this.statistics[item_cat][item_id][cat]++;
								}
							}
						}
					}
				}
			}
		}

		return true;
	},
};

var app_generic_cache_garbage = app_application_garbage.add();
app_application_lincko.add(app_generic_cache_garbage, 'first_launch', function() {
	if(Lincko.storage.cache.init()){
		app_application_garbage.remove(app_generic_cache_garbage);
	}
});

// "include" [default: true] at true it includes the object itself
/*
	"include" [default: true] at true it includes the object itself
	"extend": [default: true] at true it scan the whole hierarchy, at false only the level 1
	Lincko.storage.tree('projects', 5); => All elements that belongs to, and are parent of, the project No5
	Lincko.storage.tree('projects', 5, 'children'); => All elements that belongs to the project No5
	Lincko.storage.tree('projects', 5, 'parents'); => All elements that are parent of the project No5
*/
Lincko.storage.tree = function(category, id, direction, include, extend){
	var results = false;
	var children = {};
	var parents = {};
	var temp;
	if(typeof category !== 'string' || category.indexOf('_')===0){ return results; } else { category = category.toLowerCase(); }
	if(!$.isNumeric(id)){ return results; } else { id = parseInt(id, 10); }
	if(typeof direction !== 'string'){ direction = 'all'; }
	direction = direction.toLowerCase();
	if(direction!='all' && direction!='children' && direction!='parents'){ return results; }
	if(typeof include !== 'boolean'){ include = true; }
	if(typeof extend !== 'boolean'){ extend = true; }
	if(typeof Lincko.storage.data[category] == 'undefined'){ return results; }
	if(typeof Lincko.storage.data[category][id] == 'undefined'){ return results; }

	results = {};

	//Include the object itself
	if(include){
		results[category] = {};
		results[category][id] = true;
	}
	//Include all children (level 1)
	if(direction=='all' || direction=='children'){
		if(Lincko.storage.data[category][id]['_children']){
			var items = Lincko.storage.data[category][id]['_children'];
			for(var child_cat in items){
				for(var child_id in items[child_cat]){
					child_id = parseInt(child_id, 10);
					if(Lincko.storage.get(child_cat, child_id)){ //Check existance
						if(typeof results[child_cat]=='undefined'){
							results[child_cat] = {};
						}
						results[child_cat][child_id] = true;
						if(extend){
							temp = Lincko.storage.tree(child_cat, child_id, 'children', false);
							for(var temp_cat in temp){
								for(var temp_id in temp[temp_cat]){
									if(typeof results[temp_cat]=='undefined'){
										results[temp_cat] = {};
									}
									results[temp_cat][temp_id] = true;
								}
							}
						}
					}
				}
			}
		}
	}
	//Include the parent (level 1)
	if(direction=='all' || direction=='parents'){
		if(Lincko.storage.data[category][id]['_parent']){
			if(typeof Lincko.storage.data[category][id]['_parent'] == 'object'){
				var item = Lincko.storage.data[category][id]['_parent'];
				var par_cat = item[0];
				var par_id = parseInt(item[1], 10);
				if(Lincko.storage.get(par_cat, par_id)){ //Check existance
					if(typeof results[par_cat]=='undefined'){
						results[par_cat] = {};
					}
					results[par_cat][par_id] = true;
					if(extend){
						temp = Lincko.storage.tree(par_cat, par_id, 'parents', false);
						for(var temp_cat in temp){
							for(var temp_id in temp[temp_cat]){
								if(typeof results[temp_cat]=='undefined'){
									results[temp_cat] = {};
								}
								results[temp_cat][temp_id] = true;
							}
						}
					}
				}
			}
		}
	}

	if($.isEmptyObject(results)){
		results = false;
	}

	return results;
}

/*
	list() => return a list of elements
	hist() => return a list of notifications
	Lincko.storage.list(); => List all tasks, order from newest to oldest
	Lincko.storage.list(null, 5, { created_by: 3, }, 'projects', 3, true); => List all kind of element belonging to Project No3 and created by the User 3, and includes nested elements, limited the the 5 newest elements
	Lincko.storage.list('tasks', '5-10'); => pagination from the 5th to the 10th Task element
	Lincko.storage.list(null, -1, null, null, null, false); => Default value, it list everything
	Lincko.storage.list('tasks', -1, { created_at: ['>', 123456789], }); => Return all tasks which have been created after a timestamp, the array condition object can be design for all kind of attribute
	More examples: (list can be replaced by hist)

	Lincko.storage.list();
	Lincko.storage.list('comments', -1, null, 'projects', 3, true);
	Lincko.storage.list('comments', -1, null, 'projects', 3, false);
	Lincko.storage.list(null, 10, null, 'projects', 3, true);
	Lincko.storage.list(null, '5-10', null, 'projects', 3, true);
	Lincko.storage.list('tasks', -1, null, 'projects', 3);
	Lincko.storage.list('tasks', -1, {created_by: 3}, 'projects', 3);
	Lincko.storage.list('tasks', -1, [{created_at: ['<', 1449451377]}, {created_at: ['>', 1449107022]}], 'projects', 3);
	Lincko.storage.list('tasks', -1, [{created_by: 3}, {created_at: ['<', 1449451377]}, {created_at: ['>', 1449107022]}], 'projects', 3);
	Lincko.storage.list('tasks', '2-5', [{created_by: 3}, {created_at: ['<', 1449451377]}, {created_at: ['>', 1449107022]}], 'projects', 3, false);

	Lincko.storage.hist();
	Lincko.storage.hist('comments', -1, null, 'projects', 3, true);
	Lincko.storage.hist('comments', -1, null, 'projects', 3, false);
	Lincko.storage.hist(null, 10, null, 'projects', 3, true);
	Lincko.storage.hist(null, '5-10', null, 'projects', 3, true);
	Lincko.storage.hist('tasks', -1, null, 'projects', 3);
	Lincko.storage.hist('tasks', -1, {att: 'created_at'}, 'projects', 3);
	Lincko.storage.hist('tasks', -1, [{timestamp: ['<', 1449451377]}, {timestamp: ['>', 1449107022]}], 'projects', 3);
	Lincko.storage.hist('tasks', -1, [{att: 'created_at'}, {timestamp: ['<', 1449451377]}, {timestamp: ['>', 1449107022]}], 'projects', 3);
	Lincko.storage.hist('tasks', '2-5', [{att: 'created_at'}, {timestamp: ['<', 1449451377]}, {timestamp: ['>', 1449107022]}], 'projects', 3, false);
*/
Lincko.storage.list = function(category, page_end, conditions, parent_type, parent_id, children, deleted){
	if(typeof deleted != 'boolean'){ deleted = false; } //By default, exclude deleted items
	return Lincko.storage.list_multi(null, category, page_end, conditions, parent_type, parent_id, children, deleted);
}
Lincko.storage.hist = function(category, page_end, conditions, parent_type, parent_id, children, deleted, exclude){
	if(typeof deleted != 'boolean'){ deleted = true; } //By default, include deleted items
	if(typeof exclude != 'boolean'){ exclude = true; } //By default, we exclude chats from projects activity
	return Lincko.storage.list_multi('notifications', category, page_end, conditions, parent_type, parent_id, children, deleted, exclude);
}
Lincko.storage.list_multi = function(type, category, page_end, conditions, parent_type, parent_id, children, deleted, exclude){
	var temp;
	var attribute;
	var only_items = false;
	var results = [];
	var page_start = 1;
	var pagination = null;
	if(type != 'notifications'){ type = null; }
	if(typeof category == 'string' && category.indexOf('_')===0){//We exclude excluse everything which is not an object (start by an underscore)
		return results;
	} else if(typeof category == 'string'){
		category = category.toLowerCase();
	} else {
		category = null;
	}
	if(typeof page_end == 'undefined'){ page_end = null; }
	if($.type(conditions) == 'object'){ conditions = [conditions]; }
	if($.type(conditions) != 'array'){ conditions = []; }
	if(typeof parent_type != 'string'){ parent_type = null; } else { parent_type = parent_type.toLowerCase(); }
	if(!$.isNumeric(parent_id)){ parent_id = null; } else { parent_id = parseInt(parent_id, 10); }
	if(typeof children != 'boolean'){ children = null; }
	if(typeof deleted != 'boolean'){ deleted = false; }
	if(typeof exclude != 'boolean'){ exclude = true; }

	if(parent_type!=null && parent_id!=null){
		if(children){
			only_items = Lincko.storage.tree(parent_type, parent_id, 'children');
		} else {
			only_items = Lincko.storage.tree(parent_type, parent_id, 'children', true, false);
		}
		if(category){
			if(typeof only_items[category] != 'undefined'){
				temp = only_items[category];
				only_items = {};
				only_items[category] = temp;
			} else {
				only_items = {};
			}
		}
		if(!only_items){ //Must return an empty object to be sure we reject all
			only_items = {};
		}
	}
	
	if($.isNumeric(page_end)){
		page_end = parseInt(page_end, 10);
		if(page_end<0){
			page_end = -1;
		}
	} else if(typeof page_end == 'string'){
		pagination = page_end.match(/(\d+)-(\d+)/);
		if($.type(pagination) == 'array'){
			page_start = parseInt(pagination[1], 10);
			page_end = parseInt(pagination[2], 10);
			if(page_end < page_start){
				return results;
			}
		} else {
			return results;
		}
	}

	var items;
	var item;
	var parent;
	var save = false;
	var condition_alert = false;
	var timestamp = 0;
	var history_items = {}
	var array_items = [];

	//notifications
	if(type=='notifications'){
		//For single Projects activity only, exclude chats activity and onboarding history before completion
		if(exclude && only_items && parent_type=="projects"){
			var exclude_projects = Lincko.storage.cache.getExcludeProjects();
			for(var cat in exclude_projects){
				if(typeof only_items[cat]!="undefined"){
					for(var id in exclude_projects[cat]){
						delete only_items[cat][id];
					}
				}
			}
		}
		for(var cat in Lincko.storage.data){
			if(only_items && typeof only_items[cat]=='undefined'){
				continue;
			}
			if((category==null || cat==category) && cat.indexOf('_')!==0){
				items = Lincko.storage.data[cat];
				for(var id in items) {
					if(only_items && (typeof only_items[cat]=='undefined' || typeof only_items[cat][id]=='undefined')){
						continue;
					}
					if(!deleted){ //If at false we exclude deleted items
						if(typeof items[id]['deleted_at'] != 'undefined' && $.isNumeric(items[id]['deleted_at'])){
							continue;
						}
					}
					if(typeof history_items[cat] == 'undefined'){ history_items[cat] = {};}
					history_items[cat][id] = items[id];
				}
			}
		}

		//Exclude onborading temporarly
		var onboarding = Lincko.storage.getOnboarding();
		var exclude_onboarding = {};
		if(onboarding && onboarding.projects){
			for(var i in onboarding.projects){
				if(onboarding.sequence && onboarding.sequence[i]){ //Skip some histories for onrunning projects
					exclude_onboarding = Lincko.storage.tree('projects', onboarding.projects[i], "children", true, true);
				}
			}
		}

		for(var cat in history_items){
			for(var id in history_items[cat]){
				parent = [null, 0];
				if(typeof history_items[cat][id]['_parent'] != 'undefined'){
					parent = history_items[cat][id]['_parent'];
				}
				if(typeof history_items[cat][id]['history'] != 'undefined'){
					for(var timestamp in history_items[cat][id]['history']){
						for(var history_id in history_items[cat][id]['history'][timestamp]){
							//We do not keep copy of Old in Lincko.storage.data, we just need to keep it from origin 'data' item, because there is 2 cases scenario:
							// 1) Get Old from item itself
							// 2) Old is not available offline, so we download it before displaying (POST | 'data/history')
							item = $.extend({}, history_items[cat][id]['history'][timestamp][history_id]);
							item.hist = parseInt(history_id, 10);
							item.type = cat;
							item.par_type = parent[0];
							item.par_id = parent[1];
							item.id = parseInt(id, 10);
							item.timestamp = parseInt(timestamp, 10);
							if(item['by']<=1 && item['type']=='comments'){
								save = true; //For auto resume (Roboto user)
							} else if(
								   item['by']<=1 //Exclude LinckoBot and MonkeyKing
								|| typeof Lincko.storage.data['users']=='undefined'
								|| (item['by']>1 && typeof Lincko.storage.data['users'][item['by']]=='undefined')
								|| timestamp<=0
								|| typeof Lincko.storage.data['_history_title']=='undefined'
								|| typeof Lincko.storage.data['_history_title'][cat]=='undefined'
								|| typeof Lincko.storage.data['_history_title'][cat][item['cod']]=='undefined'
								|| ((item.cod!=201 || item.par_type!="projects") && exclude_onboarding && exclude_onboarding[cat] && exclude_onboarding[cat][id])
								|| (cat=="chats" && item.cod!=101) //Keep creation of chats (shared and single)
							){
								save = false;
								break;
							}
							save = true;
							for(var i in conditions) {
								save = true;
								for(var att in conditions[i]) { //And condition
									if(typeof item[att] == 'undefined'){
										//condition_alert = true;
										save = false;
										break;
									}
									attribute = att;
									if(save){
										if($.type(conditions[i][att]) == 'array' && conditions[i][att].length==2){
											save = false;
											if(conditions[i][att][0] == "<" && item[attribute] < conditions[i][att][1]){
												save = true;
											} else if(conditions[i][att][0] == "<=" && item[attribute] <= conditions[i][att][1]){
												save = true;
											} else if(conditions[i][att][0] == "==" && item[attribute] == conditions[i][att][1]){
												save = true;
											} else if(conditions[i][att][0] == "!=" && item[attribute] != conditions[i][att][1]){
												save = true;
											} else if(conditions[i][att][0] == ">=" && item[attribute] >= conditions[i][att][1]){
												save = true;
											} else if(conditions[i][att][0] == ">" && item[attribute] > conditions[i][att][1]){
												save = true;
											} else if(conditions[i][att][0] == "in" && $.inArray(item[attribute], conditions[i][att][1]) >= 0){ //Conditions must be an array
												save = true;
											} else if(conditions[i][att][0] == "!in" && $.inArray(item[attribute], conditions[i][att][1]) < 0){ //Conditions must be an array
												save = true;
											}
											if(!save){
												break;
											}
										} else if(item[attribute]!=conditions[i][att]){
											save = false;
											break;
										} 
									}
								}
								if(save){ //Or condition
									break;
								}
							}
							if(save){
								if(typeof item.par=='undefined' || typeof item.par.un=='undefined'){
									if(typeof item.par=='undefined'){
										item.par = {};
									}
									if(typeof item.par.un=='undefined'){
										if(username = Lincko.storage.get('users', item['by'], 'username')){
											item.par.un = username;
										}
									}
								}
								array_items.push(item);
							}
						}
					}
				}
			}
		}
	} else { //elements
		for(var cat in Lincko.storage.data){
			if(only_items && typeof only_items[cat]=='undefined'){
				continue;
			}
			if((category==null || cat==category) && cat.indexOf('_')!==0){
				items = Lincko.storage.data[cat]
				for(var id in items) {
					save = true;
					if(only_items && typeof only_items[cat][id]=='undefined'){
						save = false;
						continue;
					}
					if(!deleted){ //If at false we exclude deleted items
						if(typeof items[id]['deleted_at'] != 'undefined' && $.isNumeric(items[id]['deleted_at'])){
							save = false;
							continue;
						}
					}
					item = items[id];
					//Add info to element, use "_" to recognize that it has been added by JS
					item['_id'] = parseInt(id, 10);
					item['_type'] = cat;
					timestamp = 0;
					if(typeof item['created_at'] != 'undefined'){
						timestamp = item['created_at'];
					} else if(typeof item['updated_at'] != 'undefined'){
						timestamp = item['updated_at'];
						item['created_at'] = timestamp; //This should never happen, but it's just in case, we need it to sort items
					}
					save = true;
					for(var i in conditions) {
						save = true;
						for(var att in conditions[i]) { //And condition
							if(typeof item[att] != 'undefined'){
								attribute = att;
							} else if(typeof item["+"+att] != 'undefined'){
								attribute = "+"+att;
							} else if(typeof item["-"+att] != 'undefined'){
								attribute = "-"+att;
							} else {
								//condition_alert = true;
								save = false;
								break;
							}
							if(save){
								if($.type(conditions[i][att]) == 'array' && conditions[i][att].length==2){
									save = false;
									if(conditions[i][att][0] == "<" && item[attribute] < conditions[i][att][1]){
										save = true;
									} else if(conditions[i][att][0] == "<=" && item[attribute] <= conditions[i][att][1]){
										save = true;
									} else if(conditions[i][att][0] == "==" && item[attribute] == conditions[i][att][1]){
										save = true;
									} else if(conditions[i][att][0] == "!=" && item[attribute] != conditions[i][att][1]){
										save = true;
									} else if(conditions[i][att][0] == ">=" && item[attribute] >= conditions[i][att][1]){
										save = true;
									} else if(conditions[i][att][0] == ">" && item[attribute] > conditions[i][att][1]){
										save = true;
									} else if(conditions[i][att][0] == "in" && $.inArray(item[attribute], conditions[i][att][1]) >= 0){ //Conditions must be an array
										save = true;
									} else if(conditions[i][att][0] == "!in" && $.inArray(item[attribute], conditions[i][att][1]) < 0){ //Conditions must be an array
										save = true;
									}
									if(!save){
										break;
									}
								} else if(item[attribute]!=conditions[i][att]){
									save = false;
									break;
								} 
							}
						}
						if(save){ //Or condition
							break;
						}
					}
					if(save){
						array_items.push(item);
					}
				}
			}
		}
	}

	if(wrapper_show_error && condition_alert){
		console.log(conditions);
		console.log('The parameters requested have an issue.');
	}

	if(array_items.length>0){
		if(type=='notifications'){
			results = Lincko.storage.sort_items(array_items, 'id', page_start, page_end, false); //From newest (big timestamp) to oldest (small timestamp)
			results = Lincko.storage.sort_items(results, 'timestamp', page_start, page_end, false); //From newest (big timestamp) to oldest (small timestamp)
		} else {
			results = Lincko.storage.sort_items(array_items, 'created_at', page_start, page_end, false); //From newest (big timestamp) to oldest (small timestamp)
		}
	}
	return results;
	
};

//links are not URL links, but files linked to a task etc.
Lincko.storage.list_links = function(type, id/*, projectID*/){

	var links = {};
	/* old code, for when we could not find links from the file item itself
	//used to find links in reverse, checking children of every item and see if it has the specified file
	if(!projectID){ projectID = app_content_menu.projects_id; }
	var project_children = Lincko.storage.tree('projects', projectID, 'children', false, true);
	if(typeof project_children !== 'object'){ return false; }
	for(var category in project_children){
		//skip for comments and files
		if(category == 'comments' || category == 'files'){ continue; }

		for(var item_id in project_children[category]){
			var item = Lincko.storage.get(category, item_id);
			if(typeof item === 'object' && item._files && id in item._files){
				if(!links[category]){ links[category] = {}; }
				links[category][item_id] = item;
			}
		}
	}// end of category loop
	*/

	$.each(['files', 'notes', 'tasks'], function(i, cat){
		var _cat = Lincko.storage.get(type, id, '_'+cat);
		if(_cat){
			$.each(_cat, function(id, obj){
				var fileToAdd = Lincko.storage.get(cat, id);
				if(fileToAdd){
					if(!links[cat]){ links[cat] = {}; }
					links[cat][id] = fileToAdd;
				}
			});
		}
	});

	if($.isEmptyObject(links)){ links = false; }
	return links;
}

Lincko.storage.generateMyQRcode = function(){
	var user = Lincko.storage.get('users', wrapper_localstorage.uid);
	if(user){
		var workid = Lincko.storage.getWORKID();
		var sha = wrapper_localstorage.sha;
		var type = "qrcode";
		var uid = wrapper_localstorage.uid;
		var name = btoa(wrapper_localstorage.sha);
		name = name.replace(/[^\d\w]/g, "");
		if(name==''){ name = 'user'; }
		var created_at = Lincko.storage.get('users', wrapper_localstorage.uid, 'created_at');
		var url = top.location.protocol+'//'+document.linckoBack+'file.'+document.domainRoot+':'+document.linckoBackPort+'/file';
		return url+"/"+workid+"/"+sha+"/"+type+"/"+uid+"/"+name+".png?"+created_at;
	}
	return false;
}

Lincko.storage.generateMyURL = function(){
	return top.location.protocol+'//'+document.linckoFront+document.linckoBack+document.domainRoot+"/uid/"+wrapper_localstorage.ucode;
}

Lincko.storage.getProfile = function(uid){
	var profile = app_application_icon_single_user.src;
	if(uid==0){ //LinckoBot
		profile = app_application_icon_roboto.src;
	} else if(uid==1){ //Monkey King
		profile = app_application_icon_monkeyking.src;
	} else {
		var id = Lincko.storage.get('users', uid, 'profile_pic');
		if(id){
			var file = Lincko.storage.get('files', id);
			if(file){
				if((file['category']=='image' || file['category']=='video') && file['thu_type']!=null){
					profile = Lincko.storage.getProfileRaw(uid, file['updated_at']);
				}
			}
		}
	}
	return profile;
}
Lincko.storage.getProfileRaw = function(uid, timestamp){
	if(typeof timestamp == 'undefined'){
		timestamp = new wrapper_date().timestamp; //Always refresh
	}
	var workid = Lincko.storage.getWORKID();
	return top.location.protocol+'//'+document.linckoBack+'file.'+document.domainRoot+':'+document.linckoBackPort+'/file/profile/'+workid+'/'+uid+'?'+timestamp;
}


Lincko.storage.getLink = function(id){
	var file = Lincko.storage.get('files', id);
	if(file){
		var workid = Lincko.storage.getWORKID();
		var sha = Lincko.storage.get('files', id, 'sha');
		var type = "link";
		var name = wrapper_to_url(Lincko.storage.get('files', id, 'name'));
		var updated_at = Lincko.storage.get('files', id, 'updated_at');
		var url = top.location.protocol+'//'+document.linckoBack+'file.'+document.domainRoot+':'+document.linckoBackPort+'/file';
		return url+"/"+workid+"/"+sha+"/"+type+"/"+id+"/"+name+"?"+updated_at;
	}
	return false;
}

//Force download
Lincko.storage.getDownload = function(id){
	var file = Lincko.storage.get('files', id);
	if(file){
		var workid = Lincko.storage.getWORKID();
		var sha = Lincko.storage.get('files', id, 'sha');
		var type = "download";
		var name = wrapper_to_url(Lincko.storage.get('files', id, 'name'));
		var updated_at = Lincko.storage.get('files', id, 'updated_at');
		var url = top.location.protocol+'//'+document.linckoBack+'file.'+document.domainRoot+':'+document.linckoBackPort+'/file';
		return url+"/"+workid+"/"+sha+"/"+type+"/"+id+"/"+name+"?"+updated_at;
	}
	return false;
}

//A thumbnail is always a picture
Lincko.storage.getLinkThumbnail = function(id){
	var file = Lincko.storage.get('files', id);
	var thumbnail = false;
	if(file){
		thumbnail = Lincko.storage.thumbnail[file['category']];
		if((file['category']=='image' || file['category']=='video') && file['thu_type']!=null){
			var workid = Lincko.storage.getWORKID();
			var sha = Lincko.storage.get('files', id, 'sha');
			var type = "thumbnail";
			var name = wrapper_to_url(Lincko.storage.get('files', id, 'name'));
			var updated_at = Lincko.storage.get('files', id, 'updated_at');
			var url = top.location.protocol+'//'+document.linckoBack+'file.'+document.domainRoot+':'+document.linckoBackPort+'/file';
			thumbnail = url+"/"+workid+"/"+sha+"/"+type+"/"+id+"/"+name+"?"+updated_at;
		}
	}
	return thumbnail;
}

/*
	Sort items by an attribute, reject items that doesn't have the attribute
	"array_items": must in the format array_items[]
*/
Lincko.storage.sort_items = function(array_items, att, page_start, page_end, ascendant){
	var results = [];
	var temp = {};
	var item;
	var value;
	var save = false;
	var type = "number";
	
	if(typeof page_start == 'undefined'){ page_start = 0 } else { page_start = parseInt(page_start, 10); }
	if(typeof page_end == 'undefined'){ page_end = -1 } else { page_end = parseInt(page_end, 10); }
	if(typeof ascendant != 'boolean'){ ascendant = true; }
	
	if(page_end==0){
		return results;
	} else if(page_end<0){
		page_start = 0;
		page_end = -1;
	}
	page_start = page_start-1; //Because we start from 1st, not 0
	page_end = page_end-1; //Because we start from 1st, not 0
	if(page_end < page_start){
		page_start = 0;
		page_end = -1;
	}

	for(var i in array_items){
		item = array_items[i];
		save = false;
		if(typeof item[att] != 'undefined'){
			save = true;
			value = item[att];
		} else if(typeof item["+"+att] != 'undefined'){
			save = true;
			value = item["+"+att];
		} else if(typeof item["-"+att] != 'undefined'){
			save = true;
			value = item["-"+att];
		} else {
			continue;
		}
		if(save){
			if(typeof value != 'number'){
				var type = "string";
			}
			if(typeof value == 'boolean'){
				value = value ? 1 : 0;
			} else if(!value){
				value = 0;
			} else {
				value = value.toString();
				if(!value){
					value = 0;
				}
			}
			value = value.toString().toLowerCase();
			if(typeof temp[value] == 'undefined'){ temp[value] = [];}
			temp[value].push(item);
		}
	}
	
	pagination = 0;
	if(!$.isEmptyObject(temp)){
		if(ascendant){
			//Sort by key value (attribute), Object.keys gets only an array of the keys, sort() sorts the array from small to big
			var desc_att = Object.keys(temp).sort(function(a, b) {
				if(type=="string"){
					return a.localeCompare(b);
				} else {
					return a - b;
				}
			});
		} else {
			//Sort by key value (attribute), Object.keys gets only an array of the keys, sort() sorts the array from big to small
			var desc_att = Object.keys(temp).sort(function(a, b) {
				if(type=="string"){
					return b.localeCompare(a);
				} else {
					return b - a;
				}
			});
		}
		
		var asc_id;
		var item_id;
		//Pagination
		for(var i in desc_att){
			attribute = desc_att[i];
			
			//Sort IDs from smallest to bigger
			asc_id = Object.keys(temp[attribute]).sort(function(a, b) {
				return a - b;
			});
			for(var j in asc_id){
				item_id = asc_id[j];
				if(pagination >= page_start){
					results.push(temp[attribute][item_id]);
				}
				pagination++;
				if(page_end >= page_start && page_start+pagination > page_end){
					break;
				}
			}
			if(page_end >= page_start && page_start+pagination > page_end){
				break;
			}
			
		}
		
	}
	return results;
}

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
	blur:		function(){ storage_check_timing.set(storage_check_timing.slow, false, false); },
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
		Lincko.storage.data = wrapper_localstorage.decrypt('data');
	}
	if(!Lincko.storage.data){
		Lincko.storage.data = {};
	}
	if(!Lincko.storage.settingsLocal){
		Lincko.storage.settingsLocal = Lincko.storage.getSettings();
	}

	wrapper_load_progress.move(70);
	if($.isEmptyObject(Lincko.storage.data)){
		Lincko.storage.setLastVisit(0);
		Lincko.storage.getLatest();
	} else {
		storage_first_launch = false; //Help to trigger some action once the database is downloaded
		setTimeout(function(){
			//app_application_lincko.prepare('first_launch', true);
			app_application_lincko.prepare('first_launch');
			Lincko.storage.display(true, true);
			wrapper_load_progress.move(100);
		}, 100);

		//Try to extra Children list process because heavy CPU usage
		setTimeout(function(){
			Lincko.storage.childrenList();
		}, 300);

		setTimeout(function(){
			Lincko.storage.getLatest();
		}, 1000);

	}
	//Launch the time interval for back server data check
	storage_check_timing.launch();

	//Check the schema every 30 minutes
	setInterval(function(){
		Lincko.storage.getSchema();
	}, 1800000); //30min

}, 10);

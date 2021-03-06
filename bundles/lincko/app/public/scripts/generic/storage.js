var storage_first_request = true; //Help to launch getSchema within getLatest only once at the beginning to insure nothing is missing
var storage_first_launch = true;
var storage_remember_workspace = true;
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
	if($.type(data) == 'object' && $.type(data.info) == 'string'){
		info = data.info;
	}

	//Need to keep ".iud" to insure we receive the same user data
	if($.type(data) == 'object' && $.type(data.partial) == 'object' && $.type(data.partial[wrapper_localstorage.uid]) == 'object' && !$.isEmptyObject(data.partial[wrapper_localstorage.uid])){
		if(Lincko.storage.update(data.partial[wrapper_localstorage.uid], info)){
			if(info == 'reset'){
				Lincko.storage.schema(data.partial[wrapper_localstorage.uid]);
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

	if(schema && $.type(data) == 'object' && $.type(data.schema) == 'object' && $.type(data.schema[wrapper_localstorage.uid]) == 'object' && !$.isEmptyObject(data.schema[wrapper_localstorage.uid])){
		Lincko.storage.schema(data.schema[wrapper_localstorage.uid]);
	}
	//Update the last visit day only if we are sure the update is finish
	if(allow_set_lastvisit && $.type(data) == 'object' && typeof data.lastvisit == 'number'){
		Lincko.storage.setLastVisit(data.lastvisit);
	}
	
	if(info == "getlatest"){
		Lincko.storage.getLatest();
	}
	if(info == "forcelatest"){
		Lincko.storage.getLatest(true);
	}
};

//Launch the onboadring sync the first time it receive the database
var storage_launch_onboarding_timeout;
var storage_launch_onboarding = function(){
	if(storage_first_onboarding){
		clearTimeout(storage_launch_onboarding_timeout);
		storage_launch_onboarding_timeout = setTimeout(function(){
			storage_first_onboarding = !onboarding.launch();
			//app_application_lincko.prepare('launch_onboarding', true);
		}, 300); //The few ms help to make sure we finish previous operation that may make the focus lost
		return true;
	}
	return false;
}

//Help to record local_storage in another thread and with a delay to limit impact on immediate JS updates
var storage_local_storage = {
	data: {},
	timeout: null,
	timing: 30000,

	prepare: function(field){
		storage_local_storage.data[field] = true;
		storage_local_storage.timer();
	},
	stop: function(){
		clearTimeout(storage_local_storage.timeout);
		storage_local_storage.timeout = null;
	},
	timer: function(){
		if(!wrapper_localstorage.encrypt_ok || storage_local_storage.timeout){
			return false;
		}
		if(!isIOS){
			storage_local_storage.timing = 6000;
		}
		storage_local_storage.timeout = setTimeout(function(){
			if(storage_first_launch){
				storage_local_storage.stop();
				storage_local_storage.timer();
			}
			for(var field in storage_local_storage.data){
				var category = field;
				var parent = false;
				var item = false;
				var link = 'data_'+field;
				//@ is for sublevel
				if(field.indexOf('@')>0){ //@ equals to a subfolder, it helps to limit the caculation for local storage
					var match = field.split("@");
					if(match.length==2){
						category = match[0];
						item = match[1];
					}
				}
				//# is to regroup by parent
				if(field.indexOf('#')>0){ //@ equals to a subfolder, it helps to limit the caculation for local storage
					var match = field.split("#");
					if(match.length==2){
						category = match[0];
						var match_bis = match[1].split("-");
						if(match_bis.length==2 && Lincko.storage.get(match_bis[0], match_bis[1])){
							parent = [
								match_bis[0],
								match_bis[1]
							];
						}
					}
				}
				if(Lincko.storage.data && Lincko.storage.data[category]){
					if(category.indexOf('_')<=-1 && parent){ //For models only that have _parent as attrobute
						var data = {};
						for(var item_id in Lincko.storage.data[category]){
							if(
								   typeof Lincko.storage.data[category][item_id]['_parent'] == 'object'
								&& Lincko.storage.data[category][item_id]['_parent'][0] == parent[0]
								&& Lincko.storage.data[category][item_id]['_parent'][1] == parent[1]
							){
								data[item_id] = Lincko.storage.data[category][item_id];
							}
						}
						wrapper_localstorage.encrypt(link, data);
					} else if(item && Lincko.storage.data[category][item]){
						wrapper_localstorage.encrypt(link, Lincko.storage.data[category][item]);
					} else {
						wrapper_localstorage.encrypt(link, Lincko.storage.data[category]);
					}
				} else {
					amplify.store(wrapper_localstorage.prefix+link, null); //Delete from Local storage
				}
				delete storage_local_storage.data[field];
			}
			if(typeof Lincko.storage.last_visit != 'undefined' && Lincko.storage.last_visit !== null){
				wrapper_localstorage.encrypt('lastvisit', Lincko.storage.last_visit);
			}
			storage_local_storage.stop();
			storage_local_storage.timing = 6000;
		}, storage_local_storage.timing);
	},

};

Lincko.storage.getParent = function(type, id, attr) {
	var parent = false;
	var elem = Lincko.storage.get(type, id);
	if(elem && elem._parent){
		var parent_type = elem._parent[0];
		var parent_id = elem._parent[1];
		if (elem && parent_type && parent_id) {
			parent = Lincko.storage.get(parent_type, parent_id, attr);
		}
	}
	return parent;
};

Lincko.storage.getProjectParentID = function(type, id){
	var item = Lincko.storage.get(type, id);
	if(!item || !item._parent || !item._parent[0]){ return false; }
	if(item._parent[0] == 'projects'){ return item._parent[1]; }
	else {
		return this.getProjectParentID(item._parent[0],item._parent[1]);
	}
}

Lincko.storage.hasProjectParent = function(type, id){
	return Lincko.storage.getProjectParentID(type, id) ? true : false;
}

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
		if(isMobileApp() && device_type()=='ios'){ //ios
			//This help to reset  native notification
			window.webkit.messageHandlers.iOS.postMessage(
				{
					action: 'hidenotif',
					value: false,
				}
			);
		}
	}
};

Lincko.storage.iosHideNotif = {
	data: false,
	set: function(value){
		if(value){
			Lincko.storage.iosHideNotif.data = true;
		} else {
			Lincko.storage.iosHideNotif.data = false;
		}
	},
};

//Function update all objects displayed
/* PRIVATE METHOD */
var storage_run_hash = true;
Lincko.storage.display = function(prepare, force){
	if(typeof prepare == 'undefined'){ prepare  = false; }
	if(typeof force == 'undefined'){ force  = false; }
	if(typeof app_application_lincko != 'undefined'){
		if(force){
			app_application_lincko.prepare(prepare, true); //Update now
		} else {
			app_application_lincko.prepare(prepare); //Wait for timer
		}
		//if(!storage_first_request){
		if(force || !storage_first_request){ //It's risky because the user may open an outdated item, but the page opening is much more faster
			setTimeout(function(){
				wrapper_load_progress.move(100);
			}, 100);
		}
		if(!storage_first_launch && storage_run_hash && app_application_hashtag){
			storage_run_hash = false;
			onboarding.forceOff = true;
			onboarding.clear(false, false); //Just hide the onboarding process
			document.location.hash = app_application_hashtag;
		}
	}
};

//Function that check for latest updates
/* PRIVATE METHOD */
var storage_ajax_latest = {};
Lincko.storage.getting_latest = false;
Lincko.storage.getting_timer = null;
Lincko.storage.getting_waiting = false;
Lincko.storage.getting_timeout = false;
Lincko.storage.getLatest = function(force, callback){
	if(typeof force != 'boolean'){ force = false; }
	var timer = 30000;
	if(force || storage_first_request){
		timer = 0;
	}
	if(force){
		clearTimeout(Lincko.storage.getting_timeout);
		Lincko.storage.getting_waiting = false;
	} else if(Lincko.storage.getting_waiting){
		return false;
	}
	Lincko.storage.getting_waiting = true;
	Lincko.storage.getting_timeout = setTimeout(function(force, callback){
		Lincko.storage.getting_waiting = false;
		var lastvisit = Lincko.storage.getLastVisit();
		if(typeof force == 'boolean' && force == true){
			lastvisit = 0; //Force to get the whole database
		} else {
			force = false;
		}
		if(typeof callback != 'function'){
			callback = null;
		}

		if(!force && Lincko.storage.getting_latest && callback==null){
			return true; //Don't launch anymore latest if in a middle of latest request by update or creation
		} else if(storage_ajax_latest[lastvisit] && storage_ajax_latest[lastvisit]['readyState']!=4 && !force && callback==null){
			return true; //Don't launch anymore latest if one is already running
		}
		
		if(force){
			for(var i in storage_ajax_latest){
				if('abort' in storage_ajax_latest[i]){
					storage_ajax_latest[i].abort();
				}
				storage_ajax_latest[i] = null;
				delete storage_ajax_latest[i];
			}
		}
		var arr = {
			'lastvisit': lastvisit,
			'show_error': false,
		};

		clearTimeout(Lincko.storage.getting_timer);
		//Make sure we clean it every minute to avoid having the getLatest blocked while the mobile phone is idle
		Lincko.storage.getting_timer = setTimeout(function(){
			Lincko.storage.getting_latest = false;
		}, 60000);
		wrapper_sendAction(
			arr,
			'post',
			'data/latest',
			 function(){
			 	Lincko.storage.firstLatest();
				var lastvisit = arr.lastvisit;
				storage_ajax_latest[lastvisit] = null;
				delete storage_ajax_latest[lastvisit];
				storage_launch_onboarding();
			},
			function(xhr_err, ajaxOptions, thrownError){
				//Just keep calling getLatest if timeout
				if(ajaxOptions=="timeout"){
					setTimeout(function(){
						Lincko.storage.getLatest();
					}, 5000);
				} else {
					var lastvisit = arr.lastvisit;
					storage_ajax_latest[lastvisit] = null;
					delete storage_ajax_latest[lastvisit];
					storage_launch_onboarding();
				}
			},
			function(jqXHR){
				Lincko.storage.getting_latest = true;
				storage_ajax_latest[lastvisit] = jqXHR;
			},
			function(){
				Lincko.storage.getting_latest = false;
				if(typeof callback == 'function'){
					callback();
				}
			}
		);
	}, timer, force, callback);
};

//Function that get history
/* PRIVATE METHOD */
Lincko.storage.refreshHistory = function(){
	var arr = {
		'show_error': false,
	};
	wrapper_sendAction(arr, 'post', 'data/refresh_history', null, null, null, function(){
		Lincko.storage.getSchema();
	});
};

//Function that check for latest updates
/* PRIVATE METHOD */
Lincko.storage.getSchema = function(){
	var arr = {
		'show_error': false,
	};
	wrapper_sendAction(arr, 'post', 'data/schema');
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

//Make sure we don't work with array, it's trouble
Lincko.storage.cleanData = function(){
	for(var category in Lincko.storage.data) {
		if($.type(Lincko.storage.data[category]) == "array"){
			//convert to object
			var obj = {};
			for(var id in Lincko.storage.data[category]) {
				if(Lincko.storage.data[category][id]!=null && $.type(Lincko.storage.data[category]) == "object"){
					obj[id] = Lincko.storage.data[category][id];
				}
			}
			delete Lincko.storage.data[category];
			Lincko.storage.data[category] = {};
			for(var id in obj) {
				Lincko.storage.data[category][id] = obj[id];
			}
		} else {
			for(var id in Lincko.storage.data[category]) {
				if(Lincko.storage.data[category][id]==null){
					delete Lincko.storage.data[category][id];
				}
			}
		}
	}
}

//Function that update the localweb database
/* PRIVATE METHOD */
Lincko.storage.update = function(partial, info){
	var item;
	var item_old;
	var item_new;
	var update = false;
	var update_real = false;
	var update_real_main = false;
	var new_item = false;
	var updatedAttributes = {};
	var currentRange = '';
	var children_list = {};
	var item_search = false;
	Lincko.storage.cleanData();
	for(var category in Lincko.storage.data) {
		children_list[category] = {};
		for(var id in Lincko.storage.data[category]) {
			if(Lincko.storage.data[category][id] != null && typeof Lincko.storage.data[category][id]['_children'] != 'undefined'){
				children_list[category][id] = JSON.stringify(Lincko.storage.data[category][id]['_children']);
			}
		}
	}
	for(var i in partial) {
		//Check if the object hierarchy exists
		if(typeof Lincko.storage.data[i] == 'undefined'){ Lincko.storage.data[i] = {}; }

		if(i.indexOf('_')!==0){ //Items
			for(var j in partial[i]) {

				//remove line breaks added by php for 'comment' attribute of notes, and tasks objects
				//If not, it will continously update a task comment each time we consult it because CKeditor does not have return lines
				if(i == 'notes' || i == 'tasks'){
					if(typeof partial[i][j]['-comment'] != 'undefined' && partial[i][j]['-comment']){
						//if(typeof Lincko.storage.data_nocache[i] == 'undefined'){ Lincko.storage.data_nocache[i] = {}; }
						//if(typeof Lincko.storage.data_nocache[i][j] == 'undefined'){ Lincko.storage.data_nocache[i][j] = {}; }
						partial[i][j]['-comment'] = base_removeLineBreaks(partial[i][j]['-comment']);
						//Lincko.storage.data_nocache[i][j]['-comment'] = partial[i][j]['-comment'];
						//delete partial[i][j]['-comment'];
					}
				}

				update_real = false;
				new_item = false;
				currentRange = i+'_'+j;
				updatedAttributes = {};
				updatedAttributes[currentRange] = {};
				//If only update_at (parent->touch), we do not prepare for update

				if(typeof Lincko.storage.data[i][j] != 'undefined'){
					for(var k in partial[i][j]){
						if(k!="_children" && k!="_id" && k!="type" && k!="created_at" && k!="created_by" && k!="updated_by"){
							if(typeof Lincko.storage.data[i][j][k] == 'undefined'){ //New field
								update_real = true;
								updatedAttributes[currentRange][k] = true;
							} else if(typeof Lincko.storage.data[i][j][k] == 'object'){ //Different object
								//if(JSON.stringify(Lincko.storage.data[i][j][k]) != JSON.stringify(partial[i][j][k])){
								if(md5(Lincko.storage.data[i][j][k]) != md5(partial[i][j][k])){ //md5 is faster
									update_real = true;
									updatedAttributes[currentRange][k] = true;
								}
							} else if(Lincko.storage.data[i][j][k] != partial[i][j][k]){ //Different value
								update_real = true;
								updatedAttributes[currentRange][k] = true;
							}
						}
					}
				} else {
					update_real = true;
					new_item = true;
				}
				//delete partial[i][j]['search'];

				var _children = false;
				var hist_at = false;
				var hist_by = false;

				if(Lincko.storage.data && Lincko.storage.data[i] && Lincko.storage.data[i][j]){
					if(Lincko.storage.data[i][j]['_children']){ //to keep _children. partial doesnt include _children. later, childrenList() will rebuild this anyways
						_children = Lincko.storage.data[i][j]['_children'];
					}

					if(Lincko.storage.data[i][j]['hist_at']){
						hist_at = Lincko.storage.data[i][j]['hist_at'];
					}
					if(Lincko.storage.data[i][j]['hist_by']){
						hist_by = Lincko.storage.data[i][j]['hist_by'];
					}
				}

				Lincko.storage.data[i][j] = partial[i][j];

				Lincko.storage.buildABC(i, j);

				if(_children){ Lincko.storage.data[i][j]._children = _children; }

				//if no hist_at, then latest hist is creation
				if(hist_at){ Lincko.storage.data[i][j].hist_at = hist_at; }
				else if(Lincko.storage.data[i][j]['created_at']){ 
					Lincko.storage.data[i][j].hist_at = Lincko.storage.data[i][j]['created_at']; 
				}

				if(hist_by){ Lincko.storage.data[i][j].hist_by = hist_by; }
				else if(Lincko.storage.data[i][j]['created_by']){ 
					Lincko.storage.data[i][j].hist_by = Lincko.storage.data[i][j]['created_by']; 
				}

				// if(Lincko.storage.data && Lincko.storage.data[i] && Lincko.storage.data[i][j] && Lincko.storage.data[i][j]['_children']){ //to keep _children. partial doesnt include _children. later, childrenList() will rebuild this anyways
				// 	_children = Lincko.storage.data[i][j]['_children'];
				// 	Lincko.storage.data[i][j] = partial[i][j];
				// 	Lincko.storage.data[i][j]._children = _children;
				// }
				// else{
				// 	Lincko.storage.data[i][j] = partial[i][j];
				// }

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

				if(update_real){
					update_real_main = true;
					//console.log("update ==> "+i+'_'+j);
					//Lincko.storage.update_data_abc(i, j, updatedAttributes[i+'_'+j]);
					storage_items_updated[i] = true;
					app_models_history.refresh(i, j); //It helps to force updating any history info tab in the application
					app_application_lincko.prepare(i+'_'+j, false, updatedAttributes);
				}
				if(new_item){
					if(i=='files'){
						//Preload images if it's a file
						Lincko.storage.thumbnailPreload(partial[i][j]['_id']);
					}
				}
				if(update_real || new_item){
					if(typeof partial[i][j]['_parent'] == 'object'){
						var suffix = partial[i][j]['_parent'][0]+'-'+partial[i][j]['_parent'][1];
						storage_local_storage.prepare(i+"#"+suffix);
						//Add parent for the sync because we won't update it from backend
						//app_models_history.refresh(partial[i][j]['_parent'][0], partial[i][j]['_parent'][1]); //It helps to force updating any history info tab in the application
						//app_application_lincko.prepare(partial[i][j]['_parent'][0]+'_'+partial[i][j]['_parent'][1]);
					}
				}
				update = true;
			}
		} else if(i=='_history_title' || i=='_history'){
			if(typeof Lincko.storage.data[i] != 'object'){ Lincko.storage.data[i] = {}; }
			for(var j in partial[i]) {
				if(typeof Lincko.storage.data[i][j] != 'object'){ Lincko.storage.data[i][j] = {}; }
				for(var k in partial[i][j]) {
					var hist = partial[i][j][k];
					//We add, we don't overwrite
					Lincko.storage.data[i][j][k] = hist;

					if(i == '_history' && hist.type && hist.id && hist.timestamp && Lincko.storage.get(hist.type, hist.id)){
						//add hist_at and hist_by to the appropriate object
						if(!Lincko.storage.data[hist.type][hist.id].hist_at 
						|| hist.timestamp > Lincko.storage.data[hist.type][hist.id].hist_at){
							Lincko.storage.data[hist.type][hist.id].hist_at = hist.timestamp;
							Lincko.storage.data[hist.type][hist.id].hist_by = hist.by;
						}
					}
				}
				storage_local_storage.prepare(i+"@"+j); //We split the history storage to limit CPU calculation
				update = true;
			}
		}
	}

	if(update){
		//loop through partial to update hist_at based on _children and other soft links
		for(var i in partial){
			if( i == 'tasks' || i == 'notes' || i == 'files' || i == 'comments'){ //other categories may be added later, if necessary
				for(var j in partial[i]){

					//for comments, update the hist of the parent
					if( i == 'comments'){
						var hist_at_new = Lincko.storage.data[i][j].hist_at;
						if(!hist_at_new){ hist_at_new = Lincko.storage.data[i][j].created_at; }
						var hist_by_new = Lincko.storage.data[i][j].hist_by;
						if(!hist_by_new){ hist_by_new = Lincko.storage.data[i][j].created_by; }

						var comments_tree = Lincko.storage.tree('comments', j, 'parents'); //include itself
						if(comments_tree && comments_tree.comments){
							comments_tree = comments_tree.comments;
							$.each(comments_tree, function(id, b){
								var comment_parent = Lincko.storage.get('comments', id);
								if(!comment_parent){
									return false;
								}

								//update all parent comment hist_at values
								if(comment_parent && (!comment_parent.hist_at || comment_parent.hist_at < hist_at_new)){
									Lincko.storage.data['comments'][id].hist_at = hist_at_new;
									Lincko.storage.data['comments'][id].hist_by = hist_by_new;
								}

								//if any of parent comments' parent is a non-comment item, then update hist_at as well
								if(comment_parent._parent[0] != 'comments'){
									var comment_parent_parent = Lincko.storage.get(comment_parent._parent[0], comment_parent._parent[1]);
									if(comment_parent_parent && (!comment_parent_parent.hist_at || comment_parent_parent.hist_at < hist_at_new)){
										Lincko.storage.data[comment_parent._parent[0]][comment_parent._parent[1]].hist_at = hist_at_new;
										Lincko.storage.data[comment_parent._parent[0]][comment_parent._parent[1]].hist_by = hist_by_new;
									}
								}
							});
						}
					}
					else{ //tasks notes files
						//update parent hist_at if soft link objects have higher hist_at
						var link_type_arr = ['_tasks', '_notes', '_files'];
						for( var ii in link_type_arr){
							var link_type = link_type_arr[ii];
							if(Lincko.storage.data[i][j][link_type]){
								var hist_at_parent = Lincko.storage.data[i][j].hist_at;
								$.each(Lincko.storage.data[i][j][link_type], function(id_child, b){
									var child = Lincko.storage.get(link_type.replace("_", ""), id_child);
									//at this point, updated_at should be the time link was made
									if(child && child.updated_at && child.updated_at > hist_at_parent){
										Lincko.storage.data[i][j].hist_at = child.updated_at;
										delete Lincko.storage.data[i][j].hist_by;
										if(child.updated_by){
											Lincko.storage.data[i][j].hist_by = child.updated_by;
										}
									}
								});
							}
						}
					}
				}
			}
		}

		//Make sure we overwrite the usernmae/firstname/lastname by the namecard for company workspace
		if(typeof partial['namecards'] == 'object' && Lincko.storage.getWORKID()>0){
			for(var i in partial['namecards']){
				if(partial['namecards'][i]['workspaces_id'] == Lincko.storage.getWORKID()){
					var user = Lincko.storage.get('users', partial['namecards'][i]['_parent'][1]);
					if(user){
						if(typeof partial['namecards'][i]['-username'] != 'undefined' && partial['namecards'][i]['-username']!=null){ user['-username'] = partial['namecards'][i]['-username']; };
						if(typeof partial['namecards'][i]['-firstname'] != 'undefined' && partial['namecards'][i]['-firstname']!=null){ user['-firstname'] = partial['namecards'][i]['-firstname']; };
						if(typeof partial['namecards'][i]['-lastname'] != 'undefined' && partial['namecards'][i]['-lastname']!=null){ user['-lastname'] = partial['namecards'][i]['-lastname']; };
					}
				}
			}
		}

		setTimeout(function(update_real_main){
			//Lincko.storage.childrenList(partial, children_list);
			Lincko.storage.childrenList(); //We should not scan the whole database, it slows down the list but Sky had an issue of getting _children visible for notes when adding a comment
			Lincko.storage.display();
			if(update_real_main){
				app_application_lincko.prepare('update');
			}
		}, 300, update_real_main);
	}
	if(storage_first_launch){
		storage_first_launch = false; //Help to trigger some action once the database is downloaded
		app_application_lincko.prepare('first_launch', true);
		setTimeout(function(){
			wrapper_load_progress.move(100);
		}, 200);
	}
	if(storage_remember_workspace){
		storage_remember_workspace = false;
		//Remember the workspace for next login
		wrapper_sendAction({workspace: wrapper_localstorage.workspace}, 'post', 'user/workspace');
	}
	return update;
};

Lincko.storage.buildABC = function(category, id){
	for(var k in Lincko.storage.data[category][id]){
		if(k.indexOf('-')===0 || k.indexOf('+')===0){
			if(typeof Lincko.storage.data_abc[category] == 'undefined'){ Lincko.storage.data_abc[category] = {}; }
			if(typeof Lincko.storage.data_abc[category][id] == 'undefined'){ Lincko.storage.data_abc[category][id] = {}; }
			if(typeof Lincko.storage.data[category][id]['search'] == 'object' && Lincko.storage.data[category][id]['search'] != null && typeof Lincko.storage.data[category][id]['search'][k] == 'string'){
				Lincko.storage.data_abc[category][id][k] = Lincko.storage.data[category][id]['search'][k];
			} else if(typeof Lincko.storage.data[category][id][k] == 'string' && Lincko.storage.data[category][id][k]){
				delete Lincko.storage.data_abc[category][id][k];
				//Lincko.storage.data_abc[category][id][k] = $('<div>'+Lincko.storage.data[category][id][k]+'</div>').text().toLowerCase(); //toto => using jquery text convertion is killing CPU perf
			}
		}
	}
};

Lincko.storage.buildABCall = function(){
	for(var category in Lincko.storage.data){
		for(var id in Lincko.storage.data[category]){
			Lincko.storage.buildABC(category, id);
		}
	}
};

Lincko.storage.export = function(category, id){
	if(typeof id != 'undefined'){
		var items = [Lincko.storage.get(category, id)];
	} else if(category=='users'){
		var items = Lincko.storage.sort_items(Lincko.storage.list('users', null, [{ _id: wrapper_localstorage.uid}, {_visible: true}]), '-username');
	} else {
		var items = Lincko.storage.list(category);
	}
	var data = [];
	if(items){
		for(var i in items){
			var item = items[i];
			if(category=='users'){
				data[i] = {
					id: item['_id'],
					username: item['-username'],
					firstname: item['-firstname'],
					lastname: item['-lastname'],
					email: item['-email'],
					address: '',
					phone: '',
					business: '',
					additional: '',
					linkedin: '',
				};
				var namecards = Lincko.storage.list('namecards', -1, null, 'users', item['_id']);
				namecards = Lincko.storage.sort_items(namecards, 'workspaces_id', 0, -1, true); //From shared (0) to current (higher ID)
				for(var j in namecards){
					var namecard = namecards[j];
					if(namecard['workspaces_id']>0){
						if(typeof namecard['-username'] != 'undefined' && namecard['-username']!=null){ data[i]['username'] = namecard['-username']; }
						if(typeof namecard['-firstname'] != 'undefined' && namecard['-firstname']!=null){ data[i]['firstname'] = namecard['-firstname']; }
						if(typeof namecard['-lastname'] != 'undefined' && namecard['-lastname']!=null){ data[i]['lastname'] = namecard['-lastname']; }
					}
					if(typeof namecard['-email'] != 'undefined' && namecard['-email']!=null){ data[i]['email'] = namecard['-email']; }
					if(typeof namecard['-address'] != 'undefined' && namecard['-address']!=null){ data[i]['address'] = $('<div>').text(namecard['-address']).text(); }
					if(typeof namecard['-phone'] != 'undefined' && namecard['-phone']!=null){ data[i]['phone'] = namecard['-phone']; }
					if(typeof namecard['-business'] != 'undefined' && namecard['-business']!=null){ data[i]['business'] = $('<div>').text(namecard['-business']).text(); }
					if(typeof namecard['-additional'] != 'undefined' && namecard['-additional']!=null){ data[i]['additional'] = $('<div>').text(namecard['-additional']).text(); }
					if(typeof namecard['-linkedin'] != 'undefined' && namecard['-linkedin']!=null){ data[i]['linkedin'] = namecard['-linkedin']; }
				}
			}
		}
		if(data.length>0){
			wrapper_export(data);
			return true;
		}
	}
	return false;
};

Lincko.storage.update_data_abc_all = function(){
	$.each(Lincko.storage.data, function(type, items_obj){
		if(type.indexOf('_')!==0){ //items only
			$.each(items_obj, function(id, item){
				Lincko.storage.update_data_abc(type, id, true);
			});
		}
	});
};

Lincko.storage.update_data_abc = function(type, id, updated){
	return false; //it has been replaced by a php solution
	var allowedTypes = {
		tasks: true,
		notes: true,
		files: true,
		users: true,
		projects: true,
		namecards: true,

		chats: false,
		comments: false,
		messages: false,
	}
	if(!allowedTypes[type]){ return false; }
	var item = Lincko.storage.get(type, id);
	if(!item){ return false; }
	if(!Lincko.storage.data_abc){ Lincko.storage.data_abc = {}; }
	if(typeof updated != 'object' || Object.keys(updated) < 1){ var updated = true; }

	var attributes = [
		'+title',
		'-comment',
		'-firstname',
		'-lastname',
		'-username',
		'-additional',
		'-address',
		'-business',
	];

	//for first/last/usernames, don't keep std chars
	var keepStdChar = {
		'-username': true,
		'-firstname': true,
		'-lastname': true,
	};

	var attr, s_orig, s_abc;
	for(var i in attributes){
		attr = attributes[i];
		if(updated[attr] || updated === true){
			s_orig = Lincko.storage.get(type, id, attr);
			if(s_orig===false){
				if(
					   Lincko.storage.data_abc[type] 
					&& Lincko.storage.data_abc[type][id] 
					&& Lincko.storage.data_abc[type][id][attr]
				){
					delete Lincko.storage.data_abc[type][id][attr];
				}
				continue;
			}

			webworker.postMessage({
				action: 'update_data_abc',
				data: {
					type: type,
					id: id,
					s_orig: s_orig,
					attr: attr,
					keep_stdchar: keepStdChar[attr] ? true : false,
				},
			});
		}
	}
};

//Function that check the javascript database schema
/* PRIVATE METHOD */
Lincko.storage.schema = function(schema){
	if(typeof schema=='undefined'){ schema = {}; }

	var update = false;
	var missing = {};

	if(storage_first_request){
		return false; //Must wait that the first getLatest is received
	}

	//Step 1: Delete all unlinked items (only check 2 levels deep)
	for(var i in Lincko.storage.data) {
		if(i=='_history'){
			//don't delete history records
			continue;
		}
		if(!schema[i]){
			delete Lincko.storage.data[i];
			$.each(amplify.store(), function (storeKey) {
				//Delete all storage starting from 'tasks' for example to rebuild it
				if(storeKey.indexOf(wrapper_localstorage.prefix+'data_'+i)===0){
					amplify.store(wrapper_localstorage.prefix+'data_'+i, null);
				}
			});
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
					$.each(amplify.store(), function (storeKey) {
						//Delete all storage starting from 'tasks' for example to rebuild it
						if(storeKey.indexOf(wrapper_localstorage.prefix+'data_'+i)===0){
							amplify.store(wrapper_localstorage.prefix+'data_'+i, null);
						}
					});
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
		Lincko.storage.refreshHistory();
		if(!$.isEmptyObject(Lincko.storage.data)){
			Lincko.storage.update_data_abc_all();
			Lincko.storage.display(true, true); //I don't think we need to force, probability of mismatching is almost null
		} else {
			//If we cannot get data object, we force to download the whole object
			Lincko.storage.setLastVisit(0);
		}
		Lincko.storage.saveNosql();
	}
};

/* PRIVATE METHOD */
//toto => we are not using data here, so for any update we are rebuilding the whole children list
Lincko.storage.childrenList = function(data, children_list, category_focus, category_id){
	var parent_type = null;
	var parent_id = 0;
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
			continue;
		}
		for(var id in Lincko.storage.data[category]) {
			//if category_id is given, skip all other ids
			if(category_id && id != category_id){
				continue;
			}
			if(typeof Lincko.storage.data[category][id]['_children'] != 'undefined'){
				var parent = false;
				if(typeof Lincko.storage.data[category][id]['_parent'] != 'undefined'){
					parent = Lincko.storage.data[category][id]['_parent'][0]+"-"+Lincko.storage.data[category][id]['_parent'][1];
				}
				var updatedAttributes = {};
				updatedAttributes[category+'_'+id] = {'_children': true };
				if(typeof children_list[category][id] == 'undefined'){
					app_application_lincko.prepare(category+'_'+id, false, updatedAttributes); //Update everything
					if(parent){
						storage_local_storage.prepare(category+'#'+parent);
					}
				} else if(children_list[category][id] != JSON.stringify(Lincko.storage.data[category][id]['_children'])){
					app_application_lincko.prepare(category+'_'+id, false, updatedAttributes); //Update everything
					if(parent){
						storage_local_storage.prepare(category+'#'+parent);
					}
				}
			}
		}
	}

	//Rebuild exclude item for chats list
	Lincko.storage.cache.init();
	
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
	if(typeof perm == 'object'){
		for(var users_id in perm){
			list.push(parseInt(users_id, 10));
		}
	}
	return list;
};

Lincko.storage.amIsuper = function(){
	var users = Lincko.storage.get('workspaces', Lincko.storage.getWORKID(), '_users');
	if(users && users[wrapper_localstorage.uid] && users[wrapper_localstorage.uid]['super']){
		return true;
	}
	return false;
}

Lincko.storage.amIadmin = function(category, id){
	if(Lincko.storage.amIsuper()){
		return true;
	}
	if(typeof category == 'undefined' || typeof id == 'undefined'){
		category = 'workspaces';
		id = Lincko.storage.getWORKID();
	}
	var role = Lincko.storage.userRole(wrapper_localstorage.uid, category, id);
	if(role && role['_id']==1){
		return true;
	}
	return false;
}

Lincko.storage.userRole = function(user_id, category, id){
	if(typeof user_id == 'undefined'){
		user_id = wrapper_localstorage.uid;
	}
	if(typeof category == 'undefined' || typeof id == 'undefined'){
		category = 'workspaces';
		id = Lincko.storage.getWORKID();
	}
	var roles_id = 3; //Viewer by default
	if(Lincko.storage.getWORKID()==0){
		roles_id = 2; //Manager by default for shared workspace
	}
	var role = Lincko.storage.get('roles', roles_id);
	var perm = Lincko.storage.get(category, id, '_perm');
	if(perm && typeof perm[user_id] == 'object'){
		var temp = Lincko.storage.get('roles', perm[user_id][1]);
		if(temp){
			role = temp;
		}
	}
	return role;
};

// _perm => array(rcud, roles_id)
Lincko.storage.canI = function(rcud, category, id){
	if(typeof rcud == 'string'){
		if(rcud=='read'){ rcud=0; }
		else if(rcud=='create'){ rcud=1; }
		else if(rcud=='edit'){ rcud=2; }
		else if(rcud=='delete'){ rcud=3; }
		else if(rcud=='restore'){ rcud=3; }
	}
	if($.isNumeric(rcud)){ rcud = parseInt(rcud, 10); }
	if(rcud<0 || rcud>3){
		return false;
	}
	var val = 0;
	var perm = Lincko.storage.get(category, id, '_perm');
	if(perm && typeof perm[wrapper_localstorage.uid] == 'object'){
		val = parseInt(perm[wrapper_localstorage.uid][0], 10);
	} else {
		var role = Lincko.storage.userRole(wrapper_localstorage.uid, category, id);
		if(role){
			if(typeof role['perm_'+category] != 'undefined'){
				val = parseInt(role['perm_'+category], 10);
			} else if(typeof role['perm_all'] != 'undefined'){
				val = parseInt(role['perm_all'], 10);
			}
		}
	}
	if(rcud <= val){
		return true;
	}
	return false;
};

//Ths helps to avoid having too many settings calls each time a move is done
Lincko.storage.settings_running = false;
Lincko.storage.settings_timer = null;
Lincko.storage.setSettings = function(settings_new){
	Lincko.storage.settingsLocal = settings_new;
	var settings = Lincko.storage.get("settings", wrapper_localstorage.uid);
	if(settings && typeof settings['setup'] != 'undefined'){
		settings['setup'] = JSON.stringify(Lincko.storage.settingsLocal);
	}
	wrapper_localstorage.encrypt('settings', settings);
	if(!Lincko.storage.settings_running){
		Lincko.storage.settings_running = true;
		Lincko.storage.settings_timer = setTimeout(function(){
			wrapper_sendAction({settings: JSON.stringify(Lincko.storage.settingsLocal)}, 'post', 'data/settings', null, null, null, function(){
				Lincko.storage.settings_running = false;
			});
		}, 10000);
	}
};

Lincko.storage.settingsLocal = false;
Lincko.storage.getSettings = function(){
	if(!Lincko.storage.settingsLocal){
		var settings = Lincko.storage.get("settings", wrapper_localstorage.uid);
		if(settings && typeof settings['setup'] != 'undefined'){
			try {
				Lincko.storage.settingsLocal = JSON.parse(settings['setup']);
			} catch(e) {
				Lincko.storage.settingsLocal = false;
			}
		}
	}
	return Lincko.storage.settingsLocal;
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
Lincko.storage.getHistoryInfo = function(hist){
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
		&& $.type(Lincko.storage.data['_history_title'][hist.type]) === 'object'
		&& (typeof Lincko.storage.data['_history_title'][hist.type][hist.cod] !== 'undefined'
		 || typeof Lincko.storage.data['_history_title'][hist.type] !== 'undefined')
	){
		if(typeof Lincko.storage.data['_history_title'][hist.type][hist.cod] !== 'undefined'){
			result.title = Lincko.storage.data['_history_title'][hist.type][hist.cod];
		} else if(typeof Lincko.storage.data['_history_title'][hist.type] !== 'undefined'){
			result.title = Lincko.storage.data['_history_title'][hist.type];
		}

		result.root = {
			title: result.title,
			history: hist,
		};

		if(hist.par){
			result.title = Translation_filter(result.title, hist.par, true);
		}

		var date = new wrapper_date(hist.timestamp);
		result.title = result.title.ucfirst();
		result.date = date.display('date_very_short');
		
		//Format previous result
		if(typeof hist.old != 'undefined'){
			//Format data displayed
			if(hist.cod==506 || hist.cod==507){ //modified a task due date
				if(hist.par && typeof hist.par.dd != 'undefined'){
					if($.isNumeric(hist.par.dd)){
						result.prev = (new wrapper_date(hist.par.dd)).display('date_medium_simple');
					} else {
						result.prev = Lincko.Translation.get('app', 103, 'html'); //None
					}
				}
			} else {
				result.prev = hist.old;
			}
		}

		//console.log(hist);
		if(hist.type=="comments" && (hist.by==0 || hist.by==1)){
			result.content = app_models_resume_format_sentence(hist.id);
			return result;
		}
		result.content = app_models_resume_format_answer(result.content);
		
		var item = Lincko.storage.data[hist.type][hist.id];
		//Add to the content the main title (such as "project name")
		for(var prop in item) {
			if(prop.indexOf('+')===0){
				result.content = item[prop];
				break;
			}
		}
		//Add to the content an optional detail if any (such as "project description")
		if(hist.att.indexOf('-')!=0){
			attribute = "-"+hist.att;
		} else {
			attribute = hist.att;
		}
		if(attribute.indexOf('-')===0 && item[attribute]){
			if(result.content){
				result.content = result.content+' &#8680; '+item[attribute];
			} else {
				result.content = item[attribute];
			}
		}
		
		if(hist.par){
			result.content = Translation_filter(result.content, hist.par,false);
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

	param_pinyin
	true (two way pinyin comparison, both search term and search target)
		- will use pinyin lib to convert search term into pinyin, then search storage.data_abc
		- if data_abc is missing, then search original target with converted pinyin search term
		- e.g. search '你好' and 'nihao' with both match both '你好' and 'nihao'
	false (no pinyin comparison)
		- will not use pinyin lib and will not look inside storage.data_abc
		- e.g. '你好' match '你好', 'nihao' match 'nihao' only
	string (two way pinyin comparison, but search term is translated outside the function)
		- will not use pinyin lib, but will use this string to compare inside storage.data_abc
		- if data_abc is missing, then search original target with converted pinyin search term
		- result is same as "true", except the pinyin is passed in from outside
	null/undefined (one way pinyin comparison, search term not converted, but compare pinyin target)
		- this is the default behavior.
		- will not use pinyin lib, but look inside storage.data_abc with original search term
		- e.g. search '你好' will only match '你好', search 'nihao' will match '你好' and 'nihao'
*/
Lincko.storage.searchArray = function(type, param, array, attr, param_pinyin){
	var results = [];
	var find = [];
	var save_result = false;
	type = type.toLowerCase();

	//case insentitive search
	if(typeof param === 'string'){ param = param.toLowerCase(); }
	else{ return []; }

	//set pinyin options
	if(param_pinyin === true){
		param_pinyin = Pinyin.getPinyin(param);
	}
	else if(typeof param_pinyin != 'boolean' && typeof param_pinyin != 'string'){
		var param_pinyin = param;
	}

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
				if(item[prop].toLowerCase().indexOf(param)!==-1){ //straight search (no pinyin matching)
					save_result = true;
				}
				else if(param_pinyin){
					var id_item = item['_id'];
					var type_item = item['_type'];
					if(Lincko.storage.data_abc 
						&& Lincko.storage.data_abc[type_item] 
						&& Lincko.storage.data_abc[type_item][id_item]
						&& Lincko.storage.data_abc[type_item][id_item][prop]){
						if(Lincko.storage.data_abc[type_item][id_item][prop].indexOf(param_pinyin) !== -1){
							save_result = true;
						}else{}
					}
					else if(param != param_pinyin 
						&& item[prop].toLowerCase().indexOf(param_pinyin) !== -1){
						save_result = true;
					}
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
							if(typeof results === 'undefined'){ results = []; }
							results.push(save_result);
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
	//console.log('Add comparison with authorization table, grant and owner, no need to scan if max 0');
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

	getExcludeAll: function(){
		if(!this.first_init){
			this.first_init = this.init();
		}
		var list = $.extend(true, {}, this.exclude_chats);
		return $.extend(true, list, this.exclude_projects);
	},
	
	notify: {},
	notify_total: 0,
	getNotify: function(type, id){
		if(!this.first_init){
			this.first_init = this.init();
		}
		if(this.notify[type] && this.notify[type][id]){
			return this.notify[type][id];
		} else if((type=='projects' || type=='chats') && Lincko.storage.get(type, id) && Lincko.storage.cache.init(type, id)){ //Refresh
			if(this.notify[type] && this.notify[type][id]){
				return this.notify[type][id];
			}
		}
		return false;
	},
	getTotalNotifyCount: function(){
		var c_total = 0;
		$.each(Lincko.storage.cache.notify, function(type, obj){
			if(typeof obj == 'object'){
				$.each(obj, function(id, count){
					var item = Lincko.storage.get(type, id);
					//don't add count for deleted/muted items
					if(count < 1 || !item || item.deleted_at
						|| !item._users 
						|| !item._users[wrapper_localstorage.uid] 
						|| item._users[wrapper_localstorage.uid].silence ){ return; }
					else {
						c_total = c_total + count;
					}
				});
			}
		});
		return c_total;
	},

	statistics: {},
	getStatistics: function(type, id, cat){
		if(!this.first_init){
			this.first_init = this.init();
		}
		if(this.statistics[type] && this.statistics[type][id] && this.statistics[type][id][cat]){
			return this.statistics[type][id][cat];
		} else if(type=='projects' && Lincko.storage.get(type, id) && Lincko.storage.cache.init(type, id)){ //Refresh
			if(this.statistics[type] && this.statistics[type][id] && this.statistics[type][id][cat]){
				return this.statistics[type][id][cat];
			}
		}
		return 0;
	},

	init: function(type_reset, id_reset){
		var item_cat;
		var children;
		var single;
		var last_notif;
		var exclude_notify = {};

		if(typeof type_reset == 'undefined' && typeof id_reset == 'undefined'){
			this.exclude_chats = {};
			this.exclude_projects = {};
			this.notify = {};
			this.statistics = {};
		} else if(Lincko.storage.get(type_reset, id_reset)){
			if(typeof this.notify[type_reset]!='undefined' && typeof this.notify[type_reset][id_reset]!='undefined'){
				delete this.notify[type_reset][id_reset];
			}
			if(typeof this.statistics[type_reset]!='undefined' && typeof this.statistics[type_reset][id_reset]!='undefined'){
				delete this.statistics[type_reset][id_reset];
			}
		}

		if(storage_first_launch){
			return false;
		}

		item_cat = "chats";
		if(typeof type_reset == 'undefined' || type_reset==item_cat){
			for(var item_id in Lincko.storage.data[item_cat]){
				//Exclude mute
				var item = Lincko.storage.get(item_cat, item_id);
				if(
					   item
					&& item._users
					&& item._users[wrapper_localstorage.uid]
					&& item._users[wrapper_localstorage.uid].silence
				){
					continue;
				}
				if(typeof type_reset != 'undefined' && typeof id_reset != 'undefined' && id_reset!=item_id){
					continue;
				}
				var start_at = item.created_at;
				last_notif = Lincko.storage.getLastNotif(item_cat, item_id);
				
				if(typeof this.exclude_projects[item_cat] == "undefined"){ this.exclude_projects[item_cat] = {}; }
				this.exclude_projects[item_cat][item_id] = true; //For all projects exclude all chats items
				if(Lincko.storage.get(item_cat, item_id, "single")){
					if(typeof this.exclude_chats[item_cat] == "undefined"){ this.exclude_chats[item_cat] = {}; }
					this.exclude_chats[item_cat][item_id] = true; //no need to display chats creation for single ones
				}

				/*
				We don't use _history for chats
				if(typeof Lincko.storage.data['_history'] == 'undefined' || typeof Lincko.storage.data['_history'][item_cat+'-'+item_id] == 'undefined'){
					continue;
				}
				*/

				children = Lincko.storage.tree(item_cat, item_id, "children", false, true);
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
							} else {
								//Creation notification
								var item = Lincko.storage.get(cat, id);
								if(
									   item
									&& item['created_at'] >= start_at
									&& item['created_at'] > last_notif
									&& item['created_by'] != wrapper_localstorage.uid
									&& (typeof exclude_notify[cat] == "undefined" || typeof exclude_notify[cat][id] == "undefined")
									&& (typeof item['recalled_by'] == "undefined" || item['recalled_by']==null)
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

				/*
				for(var hist_id in Lincko.storage.data['_history'][item_cat+'-'+item_id]){
					var hist = Lincko.storage.data['_history'][item_cat+'-'+item_id][hist_id];
					if(
						   hist['timestamp'] > last_notif
						&& hist['by'] != wrapper_localstorage.uid
						&& app_models_history.validHist(
								Lincko.storage.data[item_cat][item_id], //Root
								Lincko.storage.get(hist['type'], hist['id']), //Item
								hist //History
							)
						&& (!this.exclude_chats[hist['type']] || !this.exclude_chats[hist['type']][hist['id']])
						){
						if(typeof this.notify[item_cat] == "undefined"){ this.notify[item_cat] = {}; }
						if(typeof this.notify[item_cat][item_id] == "undefined"){
							this.notify[item_cat][item_id] = 1;
						} else {
							this.notify[item_cat][item_id]++;
						}
					}
				}
				*/
			}
			if(typeof type_reset != 'undefined' && typeof id_reset != 'undefined' && type_reset == 'chats'){
				app_application_lincko.prepare('chats_'+id_reset);
			} else {
				app_application_lincko.prepare('chats');
			}
		}

		item_cat = "projects";
		if(typeof type_reset == 'undefined' || type_reset==item_cat){
			for(var item_id in Lincko.storage.data[item_cat]){
				//Exclude mute
				var item = Lincko.storage.get(item_cat, item_id);
				if(
					   item
					&& item._users
					&& item._users[wrapper_localstorage.uid]
					&& item._users[wrapper_localstorage.uid].silence
				){
					continue;
				}
				if(typeof type_reset != 'undefined' && typeof id_reset != 'undefined' && id_reset!=item_id){
					continue;
				}
				var start_at = item.created_at;
				last_notif = Lincko.storage.getLastNotif(item_cat, item_id);
				if(typeof Lincko.storage.data['_history'] != 'undefined' && typeof Lincko.storage.data['_history'][item_cat+'-'+item_id] != 'undefined'){
					for(var hist_id in Lincko.storage.data['_history'][item_cat+'-'+item_id]){
						var hist = Lincko.storage.data['_history'][item_cat+'-'+item_id][hist_id];
						if(
							   hist['timestamp'] > last_notif
							&& hist['by'] != wrapper_localstorage.uid
							&& app_models_history.validHist(
									Lincko.storage.data[item_cat][item_id], //Root
									Lincko.storage.get(hist['type'], hist['id']), //Item
									hist //History
								)
							&& (!this.exclude_projects[hist['type']] || !this.exclude_projects[hist['type']][hist['id']])
							&& (typeof exclude_notify[hist['type']] == "undefined" || typeof exclude_notify[hist['type']][hist['id']] == "undefined")
						){
							if(typeof this.notify[item_cat] == "undefined"){ this.notify[item_cat] = {}; }
							if(typeof this.notify[item_cat][item_id] == "undefined"){
								this.notify[item_cat][item_id] = 1;
							} else {
								this.notify[item_cat][item_id]++;
							}
						} else {
							if(typeof exclude_notify[hist['type']] == "undefined"){ exclude_notify[hist['type']] = {}; }
							exclude_notify[hist['type']][hist['id']] = true; //For all projects exclude all chats items
						}
					}
				}

				children = Lincko.storage.tree(item_cat, item_id, "children", true, true);
				if(children){
					for(var cat in children){
						for(var id in children[cat]){
							//Skip excluded
							if(this.exclude_projects[cat] && this.exclude_projects[cat][id]){
								continue;
							}
							/*
							//Creation notification
							var item = Lincko.storage.get(cat, id);
							if(
								   item
								&& item['created_at'] >= start_at
								&& item['created_at'] > last_notif
								&& item['created_by'] != wrapper_localstorage.uid
								&& (typeof exclude_notify[cat] == "undefined" || typeof exclude_notify[cat][id] == "undefined")
								&& app_models_history.validHist(
									Lincko.storage.data[item_cat][item_id], //Root
									Lincko.storage.get(cat, id), //Item
									Lincko.storage.getCreationHistory(cat, id) //History
								)
							){
								if(typeof this.notify[item_cat] == "undefined"){ this.notify[item_cat] = {}; }
								if(typeof this.notify[item_cat][item_id] == "undefined"){
									this.notify[item_cat][item_id] = 1;
								} else {
									this.notify[item_cat][item_id]++;
								}
							}
							*/
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
			if(typeof type_reset != 'undefined' && typeof id_reset != 'undefined' && type_reset == 'projects'){
				app_application_lincko.prepare('projects_'+id_reset);
			} else {
				app_application_lincko.prepare('projects');
			}
		}

		//update notification count
		var updateMobileApp = false;
		var redDotCount = Lincko.storage.cache.getTotalNotifyCount();
		//if new count is different from existing total, then update
		if(redDotCount != Lincko.storage.cache.notify_total){
			if(isMobileApp()){ updateMobileApp = true; }	
			if(redDotCount > Lincko.storage.cache.notify_total){
				app_application_menu_icon_toggle(true);
			}
			else if(redDotCount == 0){
				app_application_menu_icon_toggle(false);
			}			
			Lincko.storage.cache.notify_total = redDotCount;
		}

		//red notification dot update for app
		if(updateMobileApp){
			if(typeof android == 'object' && typeof android.applyRedCount == 'function'){ //android
				android.applyRedCount(redDotCount); //call native java function
			}
			else if(device_type()=='ios'){ //ios
				window.webkit.messageHandlers.iOS.postMessage(
					{
						action: 'reddot',
						count: redDotCount,
					}
				);
			}
		}

		return true;
	},
};

Lincko.storage.saveNosql_timer = false;
Lincko.storage.saveNosql = function(){
	clearTimeout(Lincko.storage.saveNosql_timer);
	if(storage_first_request){
		//We need to make sure we get the latest data before to update the cache
		return false;
	}
	//If Desktop, always send out
	//If mobile, make sure we are using wifi first
	if(wrapper_user_info[1]!="Desktop" && (!wrapper_connection_type || wrapper_connection_type != 'wifi')){
		Lincko.storage.saveNosql_timer = setTimeout(function(){
			Lincko.storage.saveNosql();
		}, 60000); //Try every minute
		return false;
	}
	var last_visit = Lincko.storage.getLastVisit();
	if(last_visit<=0){
		Lincko.storage.saveNosql_timer = setTimeout(function(){
			Lincko.storage.saveNosql();
		}, 5000); //Try every 5s
		return false;
	}
	var date_nosql = new wrapper_date(Lincko.storage.data_nosql);
	var date_now = new wrapper_date();
	//Skip if the same day
	if ( date_nosql.getYear()+"-"+date_nosql.getMonth()+"-"+date_nosql.getDate() == date_now.getYear()+"-"+date_now.getMonth()+"-"+date_now.getDate() ){
		//return false;
	}
	var param = {
		lastvisit: last_visit,
		data: Lincko.storage.data,
	};
	$.ajax({
		url: '/nosql/data',
		type: 'POST',
		data: JSON.stringify(param),
		contentType: 'application/json; charset=UTF-8',
		dataType: 'json',
		timeout: 60000,
	});
}

var app_generic_cache_garbage = app_application_garbage.add();
app_application_lincko.add(app_generic_cache_garbage, 'first_launch', function() {
	if(Lincko.storage.cache.init()){
		app_application_garbage.remove(app_generic_cache_garbage);
		setTimeout(function(){
			Lincko.storage.saveNosql_timer = Lincko.storage.saveNosql();
		}, 2000);
		setInterval(function(){
			Lincko.storage.saveNosql();
		}, 1000*3600*5); //Every 5H to insure to not match always the same schedule (in case on the road without wifi)
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

//Create history tem for creation
Lincko.storage.getCreationHistory = function(type, id){
	var hist = false;
	var item = Lincko.storage.get(type, id);
	if(item){
		parent = item["_parent"];
		hist = {
			att: "created_at",
			par_type: parent[0],
			par_id: parseInt(parent[1], 10),
			by: parseInt(item["created_by"], 10),
			timestamp: item["created_at"],
			type: type,
			id: parseInt(id, 10),
			hist: type+"-"+id,
			cod: parseInt(item['histcode'], 10), //Creation code
		};
	}
	return hist;
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

	if(type=='notifications'){

		if(typeof Lincko.storage.data['_history'] == 'undefined'){
			return results;
		}

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

		var all = false;
		var hist_root_array = [];
		if(parent_type && parent_id){
			hist_root_array.push(parent_type+"-"+parent_id);
		} else {
			all = true;
			for(var key in Lincko.storage.data['_history']){
				hist_root_array.push(key);
			}
		}

		for(var i in hist_root_array){
			hist_root = hist_root_array[i];
			if(Lincko.storage.data['_history'] && Lincko.storage.data['_history'][hist_root]){
				for(var j in Lincko.storage.data['_history'][hist_root]){
					var cat = Lincko.storage.data['_history'][hist_root][j]['type'];
					var id = Lincko.storage.data['_history'][hist_root][j]['id'];
					if(typeof history_items[cat] == 'undefined' || typeof history_items[cat][id] == 'undefined'){
						continue;
					}
					if(only_items && (typeof only_items[cat] == 'undefined' || typeof only_items[cat][id] == 'undefined')){
						continue;
					}
					parent = [null, 0];
					if(typeof history_items[cat][id]['_parent'] != 'undefined'){
						parent = history_items[cat][id]['_parent'];
					}
					//We do not keep copy of Old in Lincko.storage.data, we just need to keep it from origin 'data' item, because there is 2 cases scenario:
					// 1) Get Old from item itself
					// 2) Old is not available offline, so we download it before displaying (POST | 'data/history')
					item = $.extend({}, Lincko.storage.data['_history'][hist_root][j]); //Clone
					item.hist = parseInt(j, 10);
					item.par_type = parent[0];
					item.par_id = parent[1];
					if(item['by']<=1 && item['type']=='comments'){
						save = true; //For auto resume (Roboto user)
					} else if(
						   item['by']<1 //Exclude LinckoBot
						|| typeof Lincko.storage.data['users']=='undefined'
						|| (item['by']>1 && typeof Lincko.storage.data['users'][item['by']]=='undefined')
						|| item.timestamp<=0
						|| typeof Lincko.storage.data['_history_title']=='undefined'
						|| typeof Lincko.storage.data['_history_title'][cat]=='undefined'
						|| typeof Lincko.storage.data['_history_title'][cat][item['cod']]=='undefined'
						//|| ((item.cod!=201 || item.par_type!="projects") && exclude_onboarding && exclude_onboarding[cat] && exclude_onboarding[cat][id])
						|| (cat=="chats" && item.cod!=101) //Keep creation of chats (shared and single)
					){
						save = false;
						continue;
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

		//We add creation here, it save data stored and calculation on backend
		for(var cat in Lincko.storage.data){
			//Only build things related to Chats
			if(cat!='messages' && cat!='files' && cat!='chats'){
				continue;
			}
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
					var model = Lincko.storage.get(cat, id);
					if(
						   !model || !model['histcode']
						|| typeof history_items[cat] == 'undefined' || typeof history_items[cat][id] == 'undefined'
					){
						continue;
					}
					
					parent = [null, 0];
					if(typeof history_items[cat][id]['_parent'] != 'undefined'){
						parent = history_items[cat][id]['_parent'];
					}

					if(cat!='chats' && parent[0]!='chats'){
						continue;
					}
					
					item = {
						att: "created_at",
						par_type: parent[0],
						par_id: parseInt(parent[1], 10),
						by: parseInt(model["created_by"], 10),
						timestamp: model["created_at"],
						type: cat,
						id: parseInt(id, 10),
						hist: cat+"-"+id,
						cod: parseInt(model['histcode'], 10), //Creation code
					};
					if(item['by']<=1 && (item['type']=='comments' || item['type']=='messages')){
						save = true; //For auto resume (Roboto user) and alerts
					} else if(
						   item['by']<1 //Exclude LinckoBot
						|| typeof Lincko.storage.data['users']=='undefined'
						|| (item['by']>1 && typeof Lincko.storage.data['users'][item['by']]=='undefined')
						|| item.timestamp<=0
						//|| ((item.cod!=201 || item.par_type!="projects") && exclude_onboarding && exclude_onboarding[cat] && exclude_onboarding[cat][id])
						|| (cat=="chats" && item.cod!=101) //Keep creation of chats (shared and single)
					){
						save = false;
						continue;
					}
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
			results = Lincko.storage.sort_items(array_items, 'id', 0, -1, false); //From newest (big timestamp) to oldest (small timestamp)
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

Lincko.storage.generateMyQRcode = function(guest_access){
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
		var link = url+"/"+workid+"/"+sha+"/"+type+"/"+uid+"/"+name+".png?"+created_at;
		if(guest_access && typeof guest_access == 'string'){
			link = link+"&guest_access="+guest_access;
		}
		return link;
	}
	return false;
}

Lincko.storage.generateLinkQRcode = function(mini){
	if(typeof mini == "undefined"){ mini = false; }
	var workid = Lincko.storage.getWORKID();
	var sha = wrapper_localstorage.sha;
	var updated_at = Lincko.storage.get('users', wrapper_localstorage.uid, 'updated_at');
	var url = top.location.protocol+'//'+document.linckoBack+'file.'+document.domainRoot+':'+document.linckoBackPort+'/file/link_from_qrcode';
	return url+"/"+workid+"/"+sha+"/"+mini+"?"+updated_at;
}

Lincko.storage.generateProjectQRcode = function(id){
	var url = wrapper_neutral.src;
	var project = Lincko.storage.get("projects", id);
	if(project){
		var name = project['+title'];
		name = name.replace(/[^\d\w]/g, "_");
		if(name==''){ name = 'open_project'; }
		var updated_at = project['updated_at'];
		var workid = Lincko.storage.getWORKID();
		var url = top.location.protocol+'//'+document.linckoBack+'file.'+document.domainRoot+':'+document.linckoBackPort+'/file/project_qrcode/'+workid+'/'+id+'/'+name+'.png?'+updated_at;
	}
	return url;
}

Lincko.storage.generateMyURL = function(guest_access){
	var link = top.location.protocol+'//'+document.linckoFront+document.linckoBack+document.domainRoot+"/uid/"+wrapper_localstorage.ucode;
	if(guest_access && typeof guest_access == 'string'){
		link = link+"_"+guest_access;
	}
	return link;
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

Lincko.storage.getWorkspaceRaw = function(timestamp){
	if(typeof timestamp == 'undefined'){
		timestamp = new wrapper_date().timestamp; //Always refresh
	}
	var workid = Lincko.storage.getWORKID();
	return top.location.protocol+'//'+document.linckoBack+'file.'+document.domainRoot+':'+document.linckoBackPort+'/file/workspace/'+workid+'?'+timestamp;
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
		return url+"/"+workid+"/"+sha+"/"+type+"/"+id+"/"+name+"?"+updated_at + '&pukpic='+encodeURIComponent(getCookie('pukpic')); //Must pass temporary encrypted credential as get parameter to get authorization via external downloader
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

//Help to prepload the thumbnail faster
Lincko.storage.thumbnailPreloaded = {}; //Keep a record of what as been preloaded to not double the calls
Lincko.storage.thumbnailPreload = function(id, extend){
	if(typeof extend == 'undefined'){ extend = false; }
	if(typeof Lincko.storage.thumbnailPreloaded[id] != 'undefined'){
		if(extend){
			Lincko.storage.imagePreload(id);
		}
		return true;
	}
	Lincko.storage.thumbnailPreloaded[id] = true;
	var url = Lincko.storage.getLinkThumbnail(id);
	if(url){
		Lincko.storage.thumbnailPreloaded[id] = new Image();
		//The Timeout is there to avoid the code to freeze
		setTimeout(function(url, id, extend){
			if(extend){
				//Also prepare the original picture
				$(Lincko.storage.thumbnailPreloaded[id]).on('load', id, function(event) {
					Lincko.storage.imagePreload(event.data);
				});
			}
			Lincko.storage.thumbnailPreloaded[id].src = url;
		}, 100, url, id, extend);
	}
}

//Help to prepload the thumbnail faster
Lincko.storage.imagePreloaded = {}; //Keep a record of what as been preloaded to not double the calls
Lincko.storage.imagePreload = function(id){
	if(typeof Lincko.storage.imagePreloaded[id] != 'undefined'){
		return true;
	}
	Lincko.storage.imagePreloaded[id] = true;
	//We disable this feature for mobile because oftenly used in non wifi mode
	if(
		   wrapper_connection_type != 'wifi'
		&& (
			   isMobileBrowser()
			|| isMobileApp()
		)
	){
		return true;
	}
	if(Lincko.storage.get('files', id, 'category') != 'image'){ //If it's an image, we also preload it's original picture
		return true;
	}
	var url = Lincko.storage.getLink(id);
	if(url){
		Lincko.storage.imagePreloaded[id] = new Image();
		//The Timeout is there to avoid the code to freeze
		setTimeout(function(url, id){
			Lincko.storage.imagePreloaded[id] = new Image();
			Lincko.storage.imagePreloaded[id].src = url;
		}, 100, url, id);
	}
}

/*
	Sort items by an attribute, reject items that doesn't have the attribute
	"array_items": must in the format array_items[]
*/
Lincko.storage.sort_items = function(array_items, att, page_start, page_end, ascendant){
	var results = [];
	var temp = {};
	var item;
	var item_abc;
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

		item_abc = {}; //save abc translation to this object if available
		if( Lincko.storage.data_abc
			&& Lincko.storage.data_abc[item._type]
			&& Lincko.storage.data_abc[item._type][item._id]){
			item_abc = Lincko.storage.data_abc[item._type][item._id];
		}

		if(typeof item[att] != 'undefined'){
			save = true;
			value = item_abc[att] || item[att];
		} else if(typeof item["+"+att] != 'undefined'){
			save = true;
			value = item_abc["+"+att] || item["+"+att];
		} else if(typeof item["-"+att] != 'undefined'){
			save = true;
			value = item_abc["-"+att] || item["-"+att];
		} else {
			//ATTENTION: this does not keep any item that do not have this attribe
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
	/*
	slow: Math.floor(60000/storage_check_timing_speed), //60s
	medium: Math.floor(30000/storage_check_timing_speed), //30s
	fast: Math.floor(15000/storage_check_timing_speed), //15s
	real: Math.floor(8000/storage_check_timing_speed), //8s

	timeout: 60000, //60s (how long do we have to wait before entering into idle mode)
	current: Math.floor(30000/storage_check_timing_speed), //30s
	*/

	slow: Math.floor(600000/storage_check_timing_speed), //10min
	medium: Math.floor(120000/storage_check_timing_speed), //2min
	fast: Math.floor(60000/storage_check_timing_speed), //1min
	real: Math.floor(15000/storage_check_timing_speed), //15s

	timeout: 60000, //60s (how long do we have to wait before entering into idle mode)
	current: Math.floor(120000/storage_check_timing_speed), //2min

	set: function(time, clear, now, timer){
		if(typeof clear !== 'boolean'){ clear = false; }
		if(typeof now !== 'boolean'){ now = false; }
		if(typeof timer !== 'boolean'){ timer = false; }
		if(now){
			setTimeout(function(){
				Lincko.storage.getLatest();
			}, 3000); //In case we do send an action, there will be no flashing
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
	paste:		function(){ storage_check_timing.set(storage_check_timing.fast, false, false, true); },
	mousedown:	function(){ storage_check_timing.set(storage_check_timing.fast, false, false, true); },
});

JSfiles.finish(function(){
	wrapper_load_progress.move(60);
	if(Lincko.storage.last_visit_clean){
		//Force to redownload all data to get language support
		Lincko.storage.setLastVisit(0);
	} else {
		var cleanall = false;
		$.each(amplify.store(), function (storeKey) {
			if(storeKey.indexOf(wrapper_localstorage.prefix+"data_")===0){
				var field = storeKey.substring((wrapper_localstorage.prefix+"data_").length);
				var category = field;
				var item = false;
				var loop = false;
				if(field.indexOf('@')>0){ //@ equals to a subfolder, it helps to limit the caculation for local storage
					var match = field.split("@");
					if(match.length==2){
						category = match[0];
						item = match[1];
						loop = false;
					}
				}
				if(field.indexOf('#')>0){ //@ equals to a subfolder, it helps to limit the caculation for local storage
					var match = field.split("#");
					if(match.length==2){
						category = match[0];
						loop = true;
					}
				}
				if(item){
					var decrypt = wrapper_localstorage.decrypt("data_"+field);
					if(decrypt){
						if(typeof Lincko.storage.data[category] == "undefined"){
							Lincko.storage.data[category] = {};
						}
						Lincko.storage.data[category][item] = decrypt;
					} else {
						cleanall = true;
					}
				} else {
					var decrypt = wrapper_localstorage.decrypt("data_"+field);
					if($.type(decrypt)=='array'){
						loop = true; // make sure we use array
					}
					if(decrypt){
						if(loop){
							if(typeof Lincko.storage.data[category] == "undefined"){
								Lincko.storage.data[category] = {};
							}
							for(var id in decrypt){
								Lincko.storage.data[category][id] = decrypt[id];
							}
						} else {
							Lincko.storage.data[category] = decrypt;
						}
					} else {
						cleanall = true;
					}
				}
			}
			Lincko.storage.buildABCall();
		});
		if(cleanall){
			wrapper_localstorage.emptyStorage();
			Lincko.storage.setLastVisit(0);
		}
	}
	if(!Lincko.storage.data){
		Lincko.storage.data = {};
	} else {
		Lincko.storage.cleanData();
	}

	wrapper_load_progress.move(70);
	if($.isEmptyObject(Lincko.storage.data)){
		Lincko.storage.setLastVisit(0);
	} else {
		if(Lincko.storage.prepare_data){
			for(var category in Lincko.storage.data){
				for(var id in Lincko.storage.data[category]){
					if(category=='_history_title' || category=='_history'){
						storage_local_storage.prepare(category+"@"+id); //We split the history storage to limit CPU calculation
					} else {
						if(typeof Lincko.storage.data[category][id]['_parent'] == 'object'){
							var suffix = Lincko.storage.data[category][id]['_parent'][0]+'-'+Lincko.storage.data[category][id]['_parent'][1];
							storage_local_storage.prepare(category+"#"+suffix);
						}
					}
				}
			}
		}
		storage_first_launch = false; //Help to trigger some action once the database is downloaded
		setTimeout(function(){
			//Preload thumbnail and images for users
			var users = Lincko.storage.list('users', null, {profile_pic: ['!=', null]});
			for(var i in users){
				Lincko.storage.thumbnailPreload(users[i]['profile_pic']);
			}
			app_application_lincko.prepare('first_launch');
			Lincko.storage.display(true, true);
			wrapper_load_progress.move(90);
		}, 100);

		//Try to extra Children list process because heavy CPU usage
		setTimeout(function(){
			Lincko.storage.childrenList();
		}, 300);

		setTimeout(function(){
			Lincko.storage.getLatest();
		}, 1000);

	}
	Lincko.storage.prepare_data = false;
	Lincko.storage.getLatest();
	//Launch the time interval for back server data check
	storage_check_timing.launch();

	//Check the schema every 30 minutes
	setInterval(function(){
		Lincko.storage.getSchema();
	}, 1800000); //30min

}, 10);

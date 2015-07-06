Lincko.storage.data = {};

var storage_cb_latest_success = function(msg, err, status, data){
	console.log(data);
	if(typeof data.storage === 'object' && typeof data.lastvisit === 'number'){
		if(Lincko.storage.pull(data.storage)){
			Lincko.storage.setLastVisit(data.lastvisit);
			Lincko.storage.display();
		}
	}
};

var storage_cb_schema_success = function(msg, err, status, data){
	console.log(data);
	if(typeof data.schema === 'object'){
		Lincko.storage.schema(data.schema);
	}
};

Lincko.storage.getCOMID = function(){
	if(Lincko.storage.COMID !== null){
		return Lincko.storage.COMID;
	} else if(Lincko.storage.searchCOMID() !== false){
		return Lincko.storage.COMID;
	} else {
		Lincko.storage.getLatest();
		throw new Error(Lincko.Translation.get('app', 34, 'brut')); //We could not define in which workspace you are.
		return false;
	}
};

Lincko.storage.searchCOMID = function(){
	if(Lincko.storage.getCOM() === ''){
		return Lincko.storage.COMID = 0;
	} else if(Lincko.storage.data
		&& Lincko.storage.data[Lincko.storage.getUID()]
		&& Lincko.storage.data[Lincko.storage.getUID()]['_']
		&& Lincko.storage.data[Lincko.storage.getUID()]['_']['companies']
	){
		var object = Lincko.storage.data[Lincko.storage.getUID()]['_']['companies'];
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

Lincko.storage.getPrefix = function(comid){
	if(typeof comid === "undefined"){ comid = Lincko.storage.getCOMID(); }
	return '_'+Lincko.storage.getUID()+'_'+comid+'_';
};

//Function that check for latest updates
Lincko.storage.getLastVisit = function(){
	//We parse the value to insure it will be an integer
	return parseInt(amplify.store(Lincko.storage.getPrefix('')+'lastvisit'), 10);
};

//Function that check for latest updates
Lincko.storage.setLastVisit = function(timestamp){
	timestamp = parseInt(timestamp, 10);
	if(timestamp>0){
		amplify.store(Lincko.storage.getPrefix('')+'lastvisit', timestamp);
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
	//wrapper_sendAction(arr, 'get', 'test', storage_cb_schema_success);
};




//Function that update the localweb database
Lincko.storage.pull = function(storage){
	//This will get the message Json from the server,
	//then it will check how the message is structured to get all data to store,
	//it can be a direct data, or a collection of objects.
	//Then store the data to AmplifyJS by using for exemple
	//amplify.store('_userid_table_name', { 'id':1, 'name':'Bruno', 'age':'36'});

		//Need to push data (create or update), and not overwritte each time
		//Need a function in case of deletion
		console.log('Start to proceed data');

		Lincko.storage.data = storage;
		

	return true;
};

//Function that check the javascript database schema
Lincko.storage.schema = function(storage){
	console.log('Start to check schema');
	return true;
};


//Update every 30s automatically
setInterval(function(){
	//Lincko.storage.getLatest();
}, 30000);

//Check the schema every 5 minutes
setInterval(function(){
	//Lincko.storage.getSchema();
}, 300000);

JSfiles.finish(function(){
	Lincko.storage.getSchema();
	Lincko.storage.getLatest();
});

//http://stackoverflow.com/questions/8517089/js-search-in-object-values

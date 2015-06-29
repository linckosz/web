
var storage_cb_success = function(msg, err, status, data){
	console.log(data);
	if(typeof data.storage === 'object' && typeof data.lastvisit === 'number'){
		if(Lincko.storage.pull(data.storage)){
			Lincko.storage.setLastVisit(data.lastvisit);
		}
	}
};

//Function that check for latest updates
Lincko.storage.getLastVisit = function(){
	//We parse the value to insure it will be an integer
	return parseInt(amplify.store('_'+Lincko.storage.getUID()+'_lastvisit'), 10);
};

//Function that check for latest updates
Lincko.storage.setLastVisit = function(timestamp){
	timestamp = parseInt(timestamp, 10);
	if(timestamp>0){
		amplify.store('_'+Lincko.storage.getUID()+'_lastvisit', timestamp);
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
	wrapper_sendAction(arr,'post','data/latest', storage_cb_success);
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
		

	return true;
};





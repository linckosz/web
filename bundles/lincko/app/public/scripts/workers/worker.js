self.addEventListener("message", function(e){
	var object = false;
	try {
		object = JSON.parse(e.data);
		if(typeof object != "object"){
			object = false;
		}
	} catch(e){
		object = false;
	}
	if(object && object.action){
		var data = null;
		if(typeof object.data != "undefined"){
			data = object.data;
		}
		webworker_operation[object.action](data);
	}
});

var webworker_operation = {

	libraries: {},

	//webworker.postMessage(JSON.stringify({action: 'test', data: 123,}));
	test: function(obj_data){
		self.postMessage(JSON.stringify({action: 'test', data: obj_data,}));
	},

	importscript: function(link){
		//Make sure we only improt the library once only
		if(typeof this.libraries[link] == 'undefined'){
			this.libraries[link] = true;
			importScripts(link);
		}
	},

	compress: function(obj_data){
		var link = obj_data.link;
		var data = obj_data.data;
		var tryit = obj_data.tryit;
		var sha = obj_data.sha;
		var prefix = obj_data.prefix;
		try {
			//var compressed_data = sha+btoa(utf8_encode(data)); //Don't use btoa, it's too heavy
			//var compressed_data = LZString.compressToUTF16(JSON.stringify(data)); //Good
			//var compressed_data = LZipper.compress(link+sha+utf8_encode(JSON.stringify(obj_data.data))); //Best
			var compressed_data = LZipper.compress(link+sha+JSON.stringify(obj_data.data)); //Best
			obj_data.data = compressed_data;
			self.postMessage(JSON.stringify({action: 'LocalStorageIn', data: obj_data,}));
		} catch(e) {
			self.postMessage(JSON.stringify({action: 'LocalStorageInFailed', data: obj_data,}));
		}
	},

};


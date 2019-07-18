var linckoSocket = function(){
	this.socket = null;
	this.server_url = ((location.protocol == 'https:' ? 'wss:' : 'ws:') + '//wss.' + document.domainRoot + ':7443');
	this.timer = 0;
}

linckoSocket.prototype.connect = function(){
	var that = this;

	if(location.protocol == "http:"){
		console.log("WebSocket communication disabled in Non-SSL protocol")
		return false;
	}

	if(typeof WebSocket !== "function")
	{
		return this.socket;
	}

	try{
		this.socket = new WebSocket(this.server_url);

		this.socket.addEventListener('open', function (e){ 
			var data = {
				uid : wrapper_localstorage.uid,
				sha : wrapper_localstorage.sha
			};
			that.socket.send(JSON.stringify(data));
			that.timer ++ ;
			storage_check_timing_speed = 1;
		});

		this.socket.addEventListener('message', function (e){ 
			if(e.data != 'ping'){
				try{
					//wrapper_ajax_success(JSON.parse(e.data));
					var response = JSON.parse(e.data);
					//debugger;
					var data = {};
					data.partial = {};
					data.partial[wrapper_localstorage.uid] = response.msg;
					data.info = response.info;
					storage_cb_success('', response.error, response.status, data);
				}catch(e){}
			}
		});

		this.socket.addEventListener('close', function(e){ 
			storage_check_timing_speed = 3;
			setTimeout(function(){
				if(that.timer <= 1000)
				{
					that.socket = that.connect();
				}
			},2000);
		});
		return this.socket;
	}catch(e){
		storage_check_timing_speed = 3;
		var instance = "Other";
		if (e instanceof TypeError) {
			instance = "TypeError";
		} else if (e instanceof RangeError) {
			instance = "RangeError";
		} else if (e instanceof EvalError) {
			instance = "EvalError";
		} else if (e instanceof ReferenceError) {
			instance = "ReferenceError";
		}
		var message = "";
		if(e.message){ message = e.message; }
		var name = "";
		if(e.name){ name = e.name; }
		var fileName = "";
		if(e.fileName){ fileName = e.fileName; }
		var lineNumber = 0;
		if(e.lineNumber){ lineNumber = e.lineNumber; }
		var columnNumber = 0;
		if(e.columnNumber){ columnNumber = e.columnNumber; }
		var stack = "";
		if(e.stack){
			stack = e.stack;
		}
		JSerror.sendError(stack, fileName+" "+message, lineNumber, columnNumber, instance+" "+name);
		return null;
	}

	
	
}

linckoSocket.prototype.connection = function(){
	return this.socket;
}

linckoSocket.prototype.close = function(){
	this.socket.close();
	this.socket = null;
}

var socket;
JSfiles.finish(function(){
	//Do not use Websocket because it's buggy (was working before)
	storage_check_timing_speed = 3;
	return true;
	
	socket = new linckoSocket();
	if(socket != null)
	{
		socket.connect();
		storage_check_timing_speed = 1;
	}
});

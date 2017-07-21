var linckoSocket = function(){
	this.socket = null;
	this.server_url = (location.protocol == 'https:' ? 'wss:' : 'ws:' + '//wss.' + document.domainRoot + ':7443');
}

linckoSocket.prototype.connect = function(){
	var that = this;
	this.socket = new WebSocket(this.server_url);

	this.socket.addEventListener('open', function (e){ 
		var data = {
			uid : wrapper_localstorage.uid,
			sha : wrapper_localstorage.sha
		};
		that.socket.send(JSON.stringify(data));
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
		setTimeout(function(){
			that.socket = that.connect();
		},500);
	});
	return this.socket;
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
	socket = new linckoSocket();
	socket.connect();
});

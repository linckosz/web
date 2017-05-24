/*
	Another way to compress fatser may be to use PNG compression tool
	https://github.com/ethankaminski/Canvas-Text-Compress-JS
*/

//performance.now() Polyfill
function perfnow(e){"performance"in e||(e.performance={});var o=e.performance;e.performance.now=o.now||o.mozNow||o.msNow||o.oNow||o.webkitNow||Date.now||function(){return(new Date).getTime()}}perfnow(self);

//Only keep special characters line unicode
var base_remove_stdchar = function(str){
	if(typeof str != 'string'){ return ""; }
	return str.replace(/[\u0000-\u007F]/gm, "");
}

self.addEventListener("message", function(e){
	var object = e.data;
	if(object && object.action){
		var data = null;
		if(typeof object.data != "undefined"){
			data = object.data;
		}
		if(typeof webworker_operation[object.action] == 'function'){
			webworker_operation[object.action](data);
		}
	}
});

var webworker_operation = {

	libraries: {},

	//webworker.postMessage(JSON.stringify({action: 'test', data: 123,}));
	test: function(obj_data){
		self.postMessage({action: 'test', data: obj_data,});
	},

	importscript: function(link){
		//Make sure we only improt the library once only
		if(typeof this.libraries[link] == 'undefined'){
			this.libraries[link] = true;
			importScripts(link);
		}
	},

	//It need LZipperLite.js, php.js
	compress: function(obj_data){
		if(typeof obj_data == 'undefined' || typeof obj_data.link == 'undefined'){
			return false;
		}
		var link = obj_data.link;
		var data = obj_data.data;
		var tryit = obj_data.tryit;
		var sha = obj_data.sha;
		var prefix = obj_data.prefix;
		try {
				//var compressed_data = sha+btoa(utf8_encode(data)); //Don't use btoa, it's too heavy
				//var compressed_data = LZString.compressToUTF16(JSON.stringify(data)); //Good
				//var compressed_data = LZipper.compress(link+sha+utf8_encode(JSON.stringify(obj_data.data))); //Best
			if(navigator.userAgent.match(/iPhone|iPad|iPod/i)){
				var compressed_data = link+sha+JSON.stringify(obj_data.data); //Do not compress because IOS crash
			} else {
				var compressed_data = LZipper.compress(link+sha+JSON.stringify(obj_data.data)); //Best
			}
			obj_data.data = compressed_data;
			self.postMessage({action: 'LocalStorageIn', data: obj_data,});
		} catch(e) {
			delete obj_data.data;
			self.postMessage({action: 'LocalStorageInFailed', data: obj_data,});
		}
	},

	//https://www.sitepoint.com/measuring-javascript-functions-performance/
	checkPerformance: function(){
		var letters = 'a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z';
		for (var i = 0; i < 30; i++) {
			letters = letters+',a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z';
		}
		letters = letters.split(',');
		var numbers = false;
		var t0 = performance.now();
		for (var i = 0; i < letters.length; i++) {
			var needle = letters[i];
			letters.forEach(function(element) {
				if (element.toLowerCase() === needle.toLowerCase()) {
					found = true;
				}
			});
		}
		var t1 = performance.now();
		var indice = t1 - t0;
		self.postMessage({action: 'indicePerformance', data: indice,});
	},

	//need blueimp.md5.min.js, ChinesePY.js and ChinesePY.extensions.js
	update_data_abc: function(obj_data){
		var s_orig = base_remove_stdchar(obj_data.s_orig);
		
		if(!s_orig){
			var s_abc = false;
		} else {
			if(obj_data.keep_stdchar){
				s_orig = obj_data.s_orig;
			}
			var s_abc = Pinyin.getPinyin(s_orig);
			if(md5(s_orig) == md5(s_abc)){ s_abc = false; }
		}
		obj_data.s_abc = s_abc;
		self.postMessage({action: 'update_data_abc', data: obj_data,});
	}
};


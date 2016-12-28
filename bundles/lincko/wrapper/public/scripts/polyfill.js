//http://stackoverflow.com/questions/18020265/object-create-not-supported-in-ie8
if (!Object.create) {
	Object.create = function(o, properties) {
		if (typeof o !== 'object' && typeof o !== 'function') throw new TypeError('Object prototype may only be an Object: ' + o);
		else if (o === null) throw new Error("This browser's implementation of Object.create is a shim and doesn't support 'null' as the first argument.");
		if (typeof properties != 'undefined') throw new Error("This browser's implementation of Object.create is a shim and doesn't support a second argument.");
		function F() {}
		F.prototype = o;
		return new F();
	};
}

//Polyfill of Date.now(), because of IE8-
if (!Date.now) {
	Date.now = function() { return new Date().getTime(); }
}


if (!Math.sign) {
	Math.sign = function (x) {
		x = +x;
		if (x === 0 || isNaN(x)) {
			return x;  
		}
		return x > 0 ? 1 : -1;
	};
}

/*
//Depreciation of window.MediaStreamTrack.getSources
if(typeof window.MediaStreamTrack == 'undefined'){
	window.MediaStreamTrack = {};
}
if(typeof window.MediaStreamTrack.getSources == 'function'){
	window.MediaStreamTrack.getSources = function(fn1){
		console.log(e)
		navigator.mediaDevices.enumerateDevices().then(
			fn1
		)
	};
}
*/

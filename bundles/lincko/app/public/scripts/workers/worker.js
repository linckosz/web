var a = 5;

importScripts("/lincko/app/scripts/workers/test.js?2");

self.addEventListener("message", function(e){
	self.postMessage(a);
})

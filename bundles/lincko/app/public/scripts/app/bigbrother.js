
var app_bigbrother = {

	latitude: false,
	longitude: false,
	position: null,

	geoOptions: {
		maximumAge: 5 * 60 * 1000, //5min check
		timeout: 10 * 1000,
	},

	getLocation: function(){
		if(navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(this.geoSuccess, this.geoError, this.geoOptions);
		}
	},

	geoSuccess: function(position){
		$('#app_content_top_title_menu').html(position.coords.latitude);
		app_bigbrother.latitude = position.coords.latitude;
		app_bigbrother.longitude = position.coords.longitude;
		app_bigbrother.position = position;
		alert(position.coords.latitude);
	},

	geoError: function(position) {
	},

};

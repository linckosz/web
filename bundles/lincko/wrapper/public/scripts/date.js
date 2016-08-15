$.extend(wrapper_date.prototype, {
	
	time: false,
	timestamp: false,
	timezone_offset: 0,

	Constructor: function(timestamp){
		if(typeof timestamp != 'number' && typeof timestamp != 'string'){
			this.timestamp = Math.floor((new Date()).getTime() / 1000);
		} else {
			this.timestamp = timestamp;
		}
		this.timezone_offset = (new Date()).getTimezoneOffset();
		this.time = new Date(1000*parseInt(this.timestamp, 10)); //Convert in milliseconds
	},

	setTime: function(timestamp){
		this.Constructor(timestamp);
	},

	//Always call this function inside other functions that manipulate dates, it will return now() or a registered timestamp
	//var time = this.getTime();
	getTime: function(){
		if(this.time){
			return this.time;
		} else {
			return new Date();
		}
	},

	//returns the timestamp of the end of day (23:59:59:00) based on this.timestamp
	getEndofDay: function(){
		var endofday = new Date(this.timestamp*1000).setHours(23,59,59,0)/1000;
		return endofday;
	},

	//Return literal day
	getStrDay: function(){
		var time = this.getTime();
		var day = time.getDay();
		day = this.day[day];
		return day;
	},

	//Return literal short day
	getStrDayShort: function(){
		var time = this.getTime();
		var day_short = time.getDay();
		day_short = this.day_short[day_short];
		return day_short;
	},

	//Return literal month
	getStrMonth: function(){
		var time = this.getTime();
		var month = time.getMonth();
		month = this.month[month];
		return month;
	},

	//Return literal short month
	getStrMonthShort: function(){
		var time = this.getTime();
		var month_short = time.getMonth();
		month_short = this.month_short[month_short];
		return month_short;
	},

	//Return 2 digits year
	getYear: function(){
		var time = this.getTime();
		var year = ''+time.getFullYear();
		year = year.substr(-2);
		return year;
	},
	//Return 2 digits month
	getMonth: function(){
		var time = this.getTime();
		var month = '0' + (1+time.getMonth());
		month = month.substr(-2);
		return month;
	},

	//Return 2 digits date
	getDate: function(){
		var time = this.getTime();
		var date = '0' + time.getDate();
		date = date.substr(-2);
		return date;
	},

	//Return 2 digits hours
	getHours: function(){
		var time = this.getTime();
		var hours = '0' + time.getHours();
		hours = hours.substr(-2);
		return hours;
	},

	//Return 2 digits hours in US 12-H format
	getHoursUS: function(){
		var time = this.getTime();
		var hours = time.getHours()% 12 || 12;
		hours = '0' + hours;
		hours = hours.substr(-2);
		return hours;
	},

	//Return AM/PM of 12-H clock
	getAMPM: function(){
		var time = this.getTime();
		var ampm = time.getHours();
		ampm = ampm >= 12 ? 'PM' : 'AM';
		return ampm;
	},

	//Return 2 digits minutes
	getMinutes: function(){
		var time = this.getTime();
		var minutes = '0' + time.getMinutes();
		minutes = minutes.substr(-2);
		return minutes;
	},

	//Return 2 digits seconds
	getSeconds: function(){
		var time = this.getTime();
		var seconds = '0' + time.getSeconds();
		seconds = seconds.substr(-2);
		return seconds;
	},

	//Return ordinal suffix
	getOrdinal: function(){
		var time = this.getTime();
		var ordinal = time.getDate();
		ordinal = this.ordinal[ordinal];
		return ordinal;
	},

	//Return ordinal suffix in HTML superstring
	getOrdinalSuper: function(){
		var time = this.getTime();
		var ordinal = time.getDate();
		ordinal = '<sup>'+this.ordinal[ordinal]+'</sup>';
		return ordinal;
	},

	display: function(format){
		if(typeof format === 'string' && this.format[format]){
			format = this.format[format];
		} else {
			format = this.format['date_short']; //date_short [Jul 8th]
		}
		format = this.regex(format);
		return format;
	},

	happensToday: function() {
		var dateStampToday = Math.floor(Date.now() / 86400000) * 86400000;
		dateStampToday = dateStampToday + (this.timezone_offset*1000);
		var dateStampTomorrow = dateStampToday + 86400000;
		if ((this.timestamp*1000 >= dateStampToday) && (this.timestamp*1000 < dateStampTomorrow))
			return true;
		else
			return false;
	},

	happensSomeday: function(int) {
		var dateStampPrev = Math.floor(Date.now() / 86400000) * 86400000;
		dateStampPrev = dateStampPrev + (this.timezone_offset*1000);
		if(int != 0){
			dateStampPrev += int*86400000;
		}
		var dateStampNext = dateStampPrev + 86400000;
		if ((this.timestamp*1000 >= dateStampPrev) && (this.timestamp*1000 < dateStampNext))
			return true;
		else
			return false;
	},

	getDayStartTimestamp: function() {
		var day = Math.floor( new wrapper_date().timestamp  / 86400) * 86400;
		day = day + this.timezone_offset;
		return day;
	},

	//Transform the format sentence into a readable date
	regex: function(format){
		var that = this;
		format = format.replace(/(\[\S+?\])|(\{\S+?\})/gi, function(match, internal, external){
			if(internal){
				internal = internal.replace(/[\[\]]/gi, '');
				if(typeof that[internal] === 'function'){
					internal = that[internal]();
				} else {
					internal = '';
				}
				return internal;
			} else if(external){
				external = external.replace(/[\{\}]/gi, '');
				if(typeof that.time[external] === 'function'){
					if(external=='getMonth'){ //Because Month in JS starts from 0
						external = parseInt(that.time[external](), 10)+1;
					} else {
						external = that.time[external]();
					}
				} else {
					external = '';
				}
				return external;
			}
			return '';

		});
		return format;
	},


});

Lincko.now = new wrapper_date();

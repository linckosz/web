

/*GLOBAL VARIABLES-------------------------------------------------------------------------*/
var app_layers_files_fileslist = null;

/*GLOBAL VARIABLES END----------------------------------------------------------------------*/


function app_layers_files_launchPage(param){
	if(typeof param === 'undefined'){ param = null; }
	app_layers_files_feedPage();
}

function app_layers_files_closePage(){
	if(app_layers_files_fileslist){
		app_layers_files_fileslist.destroy();
	}
};

var app_layers_files_feedPage = function(param){
	if(typeof param === 'undefined'){ param = null; }
	var position = $('#app_layers_files');
	var Elem;
	position.recursiveEmpty();

	Elem = $('#-app_layers_files_fileslist').clone();
	Elem.prop('id','app_layers_files_fileslist');
	Elem.appendTo(position);


	app_layers_files_fileslist = new skylist(
		'files',
		$('#app_layers_files_fileslist'),
		null,
		false,
		false,
		false,
		'layer_files'
	);


};//end of app_layers_files_feedPage()


function app_layers_files_bitConvert(value){
	var sizeUnit = 'Bit';
	var kilo = 1024;
	var oneKB = kilo;
	var oneMB = Math.pow(kilo,2);
	var oneGB = Math.pow(kilo,3);
	var oneTB = Math.pow(kilo,4);

	if(value > oneTB){
		value = value/oneTB;
		sizeUnit = 'TB';
	}
	else if( value > oneGB ){
		value = value/oneGB;
		sizeUnit = 'GB';
	}
	else if( value > oneMB ){
		value = value/oneMB;
		sizeUnit = 'MB';
	}
	else if( value > oneKB ){
		value = value/oneKB;
		sizeUnit = 'KB';
	}
	else{
		if(value>1){ sizeUnit += 's'; }
	}
	return {val: Math.round(value), unit: sizeUnit};
}


function app_layers_files_size_convert(value,unit){
	var sizeUnit = 'Bit';
	var kilo = 1024;
	var oneKB = kilo;
	var oneMB = Math.pow(kilo,2);
	var oneGB = Math.pow(kilo,3);
	var oneTB = Math.pow(kilo,4);

	if(unit=="TB"){
		value = value/oneTB;
		sizeUnit = 'TB';
	}
	else if(unit=="GB"){
		value =value/oneGB;
		sizeUnit = 'GB';
	}
	else if(unit=="MB"){
		value =value/oneMB;
		sizeUnit = 'MB';
	}
	else if(unit=="KB"){
		value = value/oneKB;
		sizeUnit = 'KB';
	}
	else{
		if(value>1){ sizeUnit += 's'; }
	}
	return {val: Math.round(value), unit: sizeUnit};
}

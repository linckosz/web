

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
	position.empty();

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
	var oneKB = 8*kilo;
	var oneMB = 8*Math.pow(kilo,2);
	var oneGB = 8*Math.pow(kilo,3);
	var oneTB = 8*Math.pow(kilo,4);

	if(value > oneTB){
		value = Math.round(value/oneTB);
		sizeUnit = 'TB';
	}
	else if( value > oneGB ){
		value = Math.round(value/oneGB);
		sizeUnit = 'GB';
	}
	else if( value > oneMB ){
		value = Math.round(value/oneMB);
		sizeUnit = 'MB';
	}
	else if( value > oneKB ){
		value = Math.round(value/oneKB);
		sizeUnit = 'KB';
	}
	else if( value > 8 ){
		value = Math.round(value/8);
		sizeUnit = 'Byte';
		if(value>1){ sizeUnit += 's'; }
	}
	else{
		value = Math.round(value);
		if(value>1){ sizeUnit += 's'; }
	}
	return {val: value, unit: sizeUnit};
}

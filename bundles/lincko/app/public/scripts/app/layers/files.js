

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
	if(value > 8*Math.pow(10,12)){
		value = Math.round(value/8*Math.pow(10,12));
		sizeUnit = 'TB';
	}
	else if( value > 8*Math.pow(10,9) ){
		value = Math.round(value/8*Math.pow(10,9));
		sizeUnit = 'GB';
	}
	else if( value > 8*Math.pow(10,6) ){
		value = Math.round(value/8*Math.pow(10,6));
		sizeUnit = 'MB';
	}
	else if( value > 8000 ){
		value = Math.round(value/8000);
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

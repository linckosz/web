var alphaScroll = function(iscroll){
	var that = this;
	this.iscroll = iscroll; if(!iscroll.hasVerticalScroll){ return false; }
	this.elem_iscroll_wrapper = $(iscroll.wrapper);
	this.currentVal = '';
	this.sliderData = [];
	this.elem_slider;

	//build slider
	this.buildSliderData();
	this.buildSlider();

	//add event handlers
	this.elem_slider.on('mousedown touchstart', this, this.event_handlers.start);
	this.elem_slider.on('mouseup mouseleave touchend', this, this.event_handlers.end);
	this.elem_slider.on('mousemove touchmove', this, this.event_handlers.move);


	this.centerSlider();
}

alphaScroll.prototype.buildSlider = function(){
	var that = this;
	that.elem_slider = $('<ul>').addClass('alphaScroll_slider needsclick').removeAttr('id');
	$.each(that.sliderData, function(i, data){
		that.elem_slider.append('<li alphaScroll-slider-val="'+data.val+'">'+data.show+'</li>');
	});
	this.elem_iscroll_wrapper.append(that.elem_slider);
}

alphaScroll.prototype.buildSliderData = function(){
	var that = this;
	that.sliderData.push({
		val: "top",
		show: '<span class="fa fa-arrow-up"></span>', //arrow symbol for going to top
	});
	for(var i = 65; i <= 90; i++){ //A to Z
		var letter = String.fromCharCode(i); //capital alpha
		that.sliderData.push({
			val: letter,
			show: letter,
		});
	}
}

alphaScroll.prototype.centerSlider = function(){
	var that = this;


	var h_slider = that.elem_slider.outerHeight();
	var elem_children = that.elem_slider.children();
	var count = elem_children.length;

	var h_inner = 0;
	$.each(elem_children, function(i, elem){
		h_inner += $(elem).outerHeight();
	});

	if(h_inner > h_slider){
		return false;
	} else {
		var padding = (h_slider-h_inner)/2;
		that.elem_slider.css({
			'padding-top': padding,
			'padding-bottom': padding,
		});
		return true;
	}
}

alphaScroll.prototype.event_handlers = {
	start: function(e){
		var that = e.data;
		e.stopPropagation(); //don't scroll iscroll when using alphaScroll
		$(this).addClass('alphaScroll_slider_active');
		that.scrollToVal($(e.target).attr('alphaScroll-slider-val'), $(e.target).html());
	},
	end: function(e){
		if(e instanceof $.Event){
			var that = e.data;
			if(e.type == 'mouseleave' && that.elem_iscroll_wrapper.find(e.toElement).length){
				return;
			}
		}
		else if(e instanceof alphaScroll){ var that = e; }
		
		that.currentVal = '';
		$('#'+that.iscroll.wrapper.getAttribute('id')+'_alphaScroll_popup').remove();
		$(this).removeClass('alphaScroll_slider_active');
	},
	move: function(e){
		var that = e.data;
		e.preventDefault(); //for iOS, prevent grabbing and attempting to scroll entire document
		if(e.which == 1 || e.type == 'touchmove'){ //mouse is down
			var elem_target;
			if(e.type == 'touchmove'){
				var touches = e.originalEvent.touches[0];
				elem_target = $(document.elementFromPoint(touches.clientX, touches.clientY));
			} else {
				elem_target = $(e.target);
			}
			that.scrollToVal(elem_target.attr('alphaScroll-slider-val'), elem_target.html());
		}
		else if(that.currentVal && e.type == 'mousemove' && e.which != 1){
			that.event_handlers.end(that);
		}
	},
}

alphaScroll.prototype.showPopup = function(val, show){
	var that = this;
	var id_popup = that.iscroll.wrapper.getAttribute('id')+'_alphaScroll_popup';
	if($('#'+id_popup).length){
		$('#'+id_popup).html(show).attr('popup-val',val);
	} else {
		var elem_popup = $('<div>').prop('id',id_popup).attr('val',val).html(show).addClass('alphaScroll_popup');
		$(that.iscroll.wrapper).append(elem_popup);
	}
}

alphaScroll.prototype.scrollToVal = function(val, show){
	var that = this;
	if(!val || that.currentVal == val){ return false; } //dont scroll if it is already there
	this.currentVal = val;
	that.showPopup(val, show);
	
	if(val == 'top'){
		that.iscroll.scrollTo(0,0,150,IScroll.utils.ease.quadratic);
	} else {
		var elem_scrollTo = that.elem_iscroll_wrapper.find('[alphaScroll='+val+']');
		if(elem_scrollTo.length){
			that.iscroll.scrollToElement(elem_scrollTo.get(0),150,0,0,IScroll.utils.ease.quadratic);
		}
	}
}
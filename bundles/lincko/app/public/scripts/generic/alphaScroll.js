var alphaScroll = function(iscroll){
	var that = this;
	this.iscroll = iscroll; if(!iscroll.hasVerticalScroll){ return false; }
	this.elem_iscroll_wrapper = $(iscroll.wrapper);
	this.currentVal = '';
	this.sliderData = [];
	this.elem_slider;
	this.move_timer = null;
	this.move_running = false;

	//build slider
	this.buildSliderData();
	this.buildSlider();

	//add event handlers
	this.elem_slider.on('mousedown touchstart', this, this.event_handlers.start);
	this.elem_slider.on('mouseup mouseleave touchend', this, this.event_handlers.end);
	this.elem_slider.on('mousemove touchmove', this, this.event_handlers.move);

	//vertically center the alphabet
	this.centerSlider();
}

alphaScroll.prototype.buildSlider = function(){
	var that = this;
	that.elem_slider = $('<ul>').addClass('alphaScroll_slider needsclick').removeAttr('id');
	$.each(that.sliderData, function(i, data){
		var li = $('<li alphaScroll-slider-val="'+data.val+'"><span alphaScroll-slider-val="'+data.val+'" class="alphaScroll_slider_text">'+data.show+'</span></li>');
		that.elem_slider.append(li);
	});
	this.elem_iscroll_wrapper.append(that.elem_slider);
}

alphaScroll.prototype.buildSliderData = function(){
	var that = this;
	that.sliderData.push({
		val: "top",
		show: '<span alphaScroll-slider-val="top" class="fa fa-arrow-up"></span>', //arrow symbol for going to top
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
	that.elem_slider.removeAttr('style');

	var h_slider = that.elem_slider.outerHeight();
	var elem_children = that.elem_slider.children();
	var count = elem_children.length;

	var h_inner = 0;
	$.each(elem_children, function(i, elem){
		h_inner += $(elem).outerHeight();
	});

	if(h_inner - h_slider > 4){ //4px is approximately quarter of a letter height
		that.elem_slider.css('font-size','10px');
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
		var val = $(e.target).attr('alphaScroll-slider-val');
		if(val=='top'){
			var text = '<span class="fa fa-arrow-up"></span>';
		} else {
			var text = $(e.target).text();
		}
		that.scrollToVal(val, text);
	},
	end: function(e){
		if(e instanceof $.Event){
			var that = e.data;
		}
		else if(e instanceof alphaScroll){ var that = e; }
		
		that.currentVal = '';
		$('#'+that.iscroll.wrapper.getAttribute('id')+'_alphaScroll_popup').remove();
		that.elem_slider.removeClass('alphaScroll_slider_active');
		clearTimeout(that.move_timer);
		that.move_running = false;
	},
	move: function(e){
		e.preventDefault(); //for iOS, prevent grabbing and attempting to scroll entire document
		var that = e.data;
		if(that.move_running){
			return true;
		}
		clearTimeout(that.move_timer);
		that.move_running = true;
		that.move_timer = setTimeout(function(event){
			var that = e.data;
			if(e.which == 1 || e.type == 'touchmove'){ //mouse is down
				var elem_target = false;
				if(e.type == 'touchmove'){
					var touches = e.originalEvent.touches[0];
					elem_target = $(document.elementFromPoint(touches.clientX, touches.clientY));
				} else {
					elem_target = $(e.target);
				}
				if(elem_target){
					var val = elem_target.attr('alphaScroll-slider-val');
					if(val=='top'){
						var text = '<span class="fa fa-arrow-up"></span>';
					} else {
						var text = elem_target.text();
					}
					that.scrollToVal(val, text);
				}
			}
			else if(that.currentVal && e.type == 'mousemove' && e.which != 1){
				that.event_handlers.end(that);
			}
			that.move_running = false;
		}, isIOS?70:10, that);
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


$('body').on('mouseup mouseleave touchend', alphaScroll, alphaScroll.event_handlers.end);

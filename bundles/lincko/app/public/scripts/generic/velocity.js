$.Velocity.RegisterEffect.packagedEffects["bruno.expandIn"] = {
	defaultDuration: 700,
	calls: [
		[ { opacity: [ 1, 0 ], transformOriginX: [ "50%", "50%" ], transformOriginY: [ "50%", "50%" ], scaleX: [ 1, 0.75 ], scaleY: [ 1, 0.75 ], translateZ: 0 } ]
	]
};

$.Velocity.RegisterEffect.packagedEffects["bruno.expandOut"] = {
	defaultDuration: 700,
	calls: [
		[ { opacity: [ 0, 1 ], transformOriginX: [ "50%", "50%" ], transformOriginY: [ "50%", "50%" ], scaleX: 0.8, scaleY: 0.8, translateZ: 0 } ]
	],
	reset: { scaleX: 1, scaleY: 1 }
};

$.Velocity.RegisterEffect.packagedEffects["bruno.slideRightIn"] = {
	defaultDuration: 750,
	calls: [
		[ { translateX: [ 0, '100%' ] }, 1, { easing: "easeOutCirc" } ]
	]
};

$.Velocity.RegisterEffect.packagedEffects["bruno.slideRightOut"] = {
	defaultDuration: 750,
	calls: [
		[ { translateX: [ '100%', 0 ] }, 1, { easing: "easeInCirc" } ]
	]
};

$.Velocity.RegisterEffect.packagedEffects["bruno.slideRightBigIn"] = {
	defaultDuration: 800,
	calls: [
		[ { opacity: [ 1, 0 ], translateX: [ 0, '30%' ], translateZ: 0 } ]
	]
};

$.Velocity.RegisterEffect.packagedEffects["bruno.slideRightBigOut"] = {
	defaultDuration: 750,
	calls: [
		[ { opacity: [ 0, 1 ], translateX: '30%', translateZ: 0 } ]
	],
	reset: { translateX: 0 }
};

$.Velocity.RegisterEffect.packagedEffects["bruno.fadeIn"] = {
	defaultDuration: 500,
	calls: [
		[ { opacity: [ 1, 0.7 ] } ]
	]
};

$.Velocity.RegisterEffect.packagedEffects["bruno.fadeOut"] = {
	defaultDuration: 500,
	calls: [
		[ { opacity: [ 0.7, 1 ] } ]
	]
};

$.Velocity.RegisterEffect.packagedEffects["cloud.bombIn"] = {
	defaultDuration: 500,
	calls: [ 
		[ { opacity: '0', scale: '0.7', boxShadowBlur: '40px' }, 1]
    ]
};

$.Velocity.RegisterEffect.packagedEffects["evan.slideLeftIn"] = {
	defaultDuration: 750,
	calls: [
		[ { translateX: [ 0,'100%' ] }, 1, { easing: "easeInCirc" } ]
	]
};



for (var effectName in $.Velocity.RegisterEffect.packagedEffects) {
	$.Velocity.RegisterEffect(effectName, $.Velocity.RegisterEffect.packagedEffects[effectName]);
}

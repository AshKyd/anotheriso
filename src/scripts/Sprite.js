var tex = require('./Tex');

var behaviours = {
	automation: require('./behaviours/Automation')
};

var Sprite = function(opts){
	if(opts){
		this.init(opts);
	}
	this.behaviours = [];
};

Sprite.prototype.init = function(opts){
	var _this = this;
	_this.pos = opts.pos || [0,0,0];

	if(opts.img){
		_this.img = opts.img;
	} else {
		_this.img = document.createElement('img');
		_this.img.src = opts.src;
	}

	this.anchor = opts.anchor || {
		x: 0.5,
		y: 1
	};

	this.setGrid(opts.grid);
};

Sprite.prototype.setPos = function(newPos){
	this.pos = newPos;
	this.callHook('update');
};

Sprite.prototype.setGrid = function(grid){
	this.grid = grid;
};

Sprite.prototype.tick = function(now){
	for(var i=0; i<this.behaviours.length; i++){
		this.behaviours[i].tick(now);
	}
};

/**
 * Add this sprite to a grid. Helper function makes chaining easier.
 */
Sprite.prototype.addTo = function(grid){
	grid.addSprite(this);
	return this;
};


Sprite.prototype.addBehaviour = function(behaviour){
	if(behaviours[behaviour]){
		this[behaviour] = new behaviours[behaviour](this);
		this.behaviours.push(this[behaviour]);
	}
	return this[behaviour];
};


Sprite.prototype.on = function(name,fn){
	this.events = this.events || {};
	this.events[name] = this.events[name] || [];
	this.events[name].push(fn);
};

Sprite.prototype.callHook = function(name, values){
	if(this.events && this.events[name]){
		this.events[name].forEach(function(callback){
			callback(values);
		});
	}
};


module.exports = Sprite;
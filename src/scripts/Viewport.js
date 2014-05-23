var RenderSurface = require('./RenderSurface');
var _ = require('underscore');
var PIXI = require('pixi.js');
var RenderSprite = require('./RenderSprite');

var getCursorPos = function(e) {
	if(typeof e.touches != 'undefined' && e.touches.length == 1){ // Only deal with one finger
		var touch = e.touches[0]; // Get the information for finger #1
		return[touch.pageX, touch.pageY];
	}

	return [e.pageX, e.pageY];
};

var Viewport = function(opts){
	var _this = this;
	this.grid = opts.grid;
	this.offset = [0,0];
	this.zoom = 1;
	this.sprites = [];


	this.stage = new PIXI.Stage(0x000000, true);
	this.stage.interactive = true;
 
    // create a renderer instance.
    this.renderer = PIXI.autoDetectRenderer(opts.parent.width, opts.parent.height);
 	this.sprites = [];

 	this.viewport = new PIXI.DisplayObjectContainer();
 	this.viewport.interactive = true;

 	this.stage.addChild(this.viewport);
 	this.viewport.anchor = {
 		x: 0.5,
 		y: 0.5
 	};

    // add the renderer view element to the DOM
    opts.parent.appendChild(this.renderer.view);

	this.initGrid();
	this.initHandlers();
    this.render();
};

Viewport.prototype.drawPath = function(opts){
	var _this = this;
 	var g = opts.g || new PIXI.Graphics();
	this.viewport.addChild(g);

    g.lineStyle(5, opts.color||0xFFFFFF, 1);

    var moveTo = true;
    opts.path.forEach(function(point,i){
    	var pos = _this.tile2xy(point);
    	var op = moveTo?'moveTo':'lineTo';
    	g[op](pos[0], pos[1]);
    	moveTo = false;
    });

    if(opts.nodes){
		this.drawPoints({
			path:opts.path,
			g:g
		});
    }

    return g;
};

Viewport.prototype.drawPoints = function(opts){
	var _this = this;
 	var g = opts.g || new PIXI.Graphics();
	this.viewport.addChild(g);

    g.beginFill(opts.color || 0xFFFFFF, 1);
    opts.path.forEach(function(point,i){
    	var pos = _this.tile2xy(point);
    	g.drawCircle(pos[0], pos[1], 6);
    });

    return g;
};


Viewport.prototype.setPos = function(pos){
	this.viewport.position.x = pos[0];
	this.viewport.position.y = pos[1];
	this.setZoom(this.zoom);
};

Viewport.prototype.setZoom = function(zoom){
	this.viewport.scale.x = zoom;
	this.viewport.scale.y = zoom;
};

Viewport.prototype.render = function(){
    // render the stage
    this.renderer.render(this.stage);
};

Viewport.prototype.initHandlers = function(){
	var _this = this;

	//create event handlers.
	var handlers = {};
	_.each(['start','stop','move','click', 'zoom'],function(action){
		handlers[action] = function(e){
			return _this.handlerClick(e,action);
		};
	});
	
	// and set them
	_.each({
		onmousedown : handlers.start,
		onmouseup : handlers.stop,
		onmouseout : handlers.stop,
		onmousemove : handlers.move,
		onclick : handlers.click,
		ontouchstart : handlers.start,
		ontouchstop : handlers.stop,
		ontouchmove : handlers.move,
		onmousewheel: handlers.zoom
	},function(fn,event){
		_this.renderer.view[event] = fn;
	});
};

/**
 * Event handler for the canvas. Could do with a tidy-up.
 * @param e Event object.
 * @param action Type of event this is.
 */
Viewport.prototype.handlerClick = function(e,action){
	this.cursorPos = getCursorPos(e);
	var zoomFactor = 1.01;
	switch(action) {
		case 'zoom':
			if(e.wheelDelta && e.wheelDelta > 0 || e.detail && e.detail < 0){
				// this.offset[0] += (this.renderer.width/2)*this.zoom;
				// this.offset[1] += (this.renderer.height/2)*this.zoom;
				this.zoom *= zoomFactor;
			} else {
				// this.offset[0] += (0-this.renderer.width/2)*this.zoom;
				// this.offset[1] += (0-this.renderer.height/2)*this.zoom;
				this.zoom /= zoomFactor;
			}
			console.log(this.offset);
			this.callHook('change', this.cursorPos);
			break;
		case 'start':
			this.start = Date.now();
			this.startPos = this.cursorPos;
			break;
		case 'stop':
		case 'move':
			this.callHook('move', this.cursorPos);
			if(typeof this.startPos == 'undefined'){
				return false;
			}
			var period = Date.now() - this.start;
			
			var xOffset = this.startPos[0]- this.cursorPos[0];
			var yOffset = this.startPos[1]- this.cursorPos[1];

			this.offset[0]+= xOffset*this.zoom;
			this.offset[1]+= yOffset*this.zoom;

			
			if(xOffset || yOffset) {
				this.inputEvent = 'move';
			}
			
			this.startPos = this.cursorPos;
			if(action=='stop') {
				delete this.startPos;
			}

			this.callHook('change', this.cursorPos);
			// e.preventDefault();
			break;
		case 'click':
			if(this.inputEvent != 'move') {
				this.callHook('click',this.cursorPos);
			}
			
			this.callHook('click', this.cursorPos);
			delete this.inputEvent;
			break;
	}
	e.preventDefault();
};

Viewport.prototype.tile2xy = function(pos){
	var tx, ty, tz;
	tz = pos[0];
	tx = pos[1];
	ty = pos[2];

	var px = this.grid.tilesPerX * (tx + ty);
	var py = this.grid.tilesPerY * (tx - ty);
	
	// Account for a z height
	if(tz > 0){
		py -= this.grid.tilesPerY*tz;
	}

	return [px,py];
};

Viewport.prototype.xy2Tile = function(cursorPos){
	var px, py;
	px = cursorPos[0];
	py = cursorPos[1];

	// Acount for canvas offset. TODO.
	var pageOffset = [0,0];
	
	// Compensate for zoom and offset.
	px = px * this.zoom + this.offset[0];
	py = py * this.zoom + this.offset[1];
	
	// cursor position + map offset + canvas offset (from edge of page)
	px = (px - pageOffset[0]) / this.grid.tilesPerX;
	py = (py - pageOffset[1]) / this.grid.tilesPerY;
	
	// Tile number
	var tx = (px + py) / 2;
	var ty = (px - py) / 2;
	
	tx = (tx)+0.5;
	ty = (ty)+0.5;
	
	// Tile x, Tile y, Subtile x, Subtile y
	return [tx,ty];
};

/**
 * Initialises the grid int he viewport, adds all 
 */
Viewport.prototype.initGrid = function(){
	var _this = this;
	_this.grid.each(function(tile){
		_this._addSprite(tile);
	});
	_this.grid.on('addsprite',function(sprite){
		_this._addSprite(sprite);
	});
	_this.on('change',function(){
		_this.setPos([(0-_this.offset[0])/_this.zoom, (0-_this.offset[1])/_this.zoom]);
		_this.setZoom(_this.zoom);
	});
};

Viewport.prototype._addSprite = function(sprite){
	var _this = this;
	var rsprite = new RenderSprite(sprite);
	rsprite.pSprite.interactive = true;
	if(sprite.hitArea){
		rsprite.pSprite.hitArea = new PIXI.Polygon(sprite.hitArea);
	}
	rsprite.setPos(this.tile2xy(rsprite.sprite.pos));
	sprite.on('update',function(){
		rsprite.setPos(_this.tile2xy(rsprite.sprite.pos));
	});
	this.viewport.addChild(rsprite.pSprite);
};

Viewport.prototype.on = function(name,fn){
	this.events = this.events || {};
	this.events[name] = this.events[name] || [];
	this.events[name].push(fn);
	return this;
};

Viewport.prototype.callHook = function(name, values){
	if(this.events && this.events[name]){
		this.events[name].forEach(function(callback){
			callback(values);
		});
	}
};

module.exports = Viewport;
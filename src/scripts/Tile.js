var tex = require('./Tex');
var Sprite = require('./Sprite');

var Tile = function(opts){
	var _this = this;

	var img = document.createElement('canvas');
	img.width = opts.width;
	img.height = opts.width;

	_this.init({
		pos: opts.pos,
		img: img,
		anchor: {
			x: 0.5,
			y: 0.75
		}
	});

	tex.make({
		corners: opts.corners || [false, false, false, false],
		src: opts.src,
		can: _this.img,
		done: function(){
			_this.callHook('update');
		}
	});

	this.hitArea = tex.getMask({
		corners: opts.corners || [false, false, false, false],
		width: opts.width
	});
};

Tile.prototype = new Sprite();
Tile.prototype.constructor = Tile;

module.exports = Tile;
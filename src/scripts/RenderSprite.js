var PIXI = require('pixi.js');

var RenderSprite = function(sprite){
	var _this = this;
	this.sprite = sprite;

	_this.pTexture = new PIXI.Texture.fromCanvas(sprite.img);
	
	this.pSprite = new PIXI.Sprite(_this.pTexture);
	this.pSprite.anchor.x = sprite.anchor.x;
	this.pSprite.anchor.y = sprite.anchor.y;
};

RenderSprite.prototype.setPos = function(pos){
	this.pSprite.position.x = pos[0];
	this.pSprite.position.y = pos[1];
};

module.exports = RenderSprite;
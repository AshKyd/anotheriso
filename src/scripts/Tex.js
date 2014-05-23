var Cache = require('./Cache');

/**
 * Textured tile
 */
var make = function(options){
	var cacheKey = options.texture+JSON.stringify(options.corners);
	var cacheObject = Cache.getObject('textile',cacheKey);
	if(cacheObject){
		options.done(cacheObject);
		return;
	}
	Cache.loadImage(options.src, function(texture){
		var tile = renderTile(
			options.corners[0],
			options.corners[1],
			options.corners[2],
			options.corners[3],
			texture,
			options.can
		);
		Cache.setObject('textile',cacheKey,tile);
		options.done();
		
	});
};

var getMask = function(opts){
	var w = opts.width;

	// Just to make things more readable.
	var combo = String(!!opts.corners[0]) + !!opts.corners[1] +
	            !!opts.corners[2] + !!opts.corners[3];
	
	// Here'es the transform(s) for each elevation combo.
	if(combo == 'truetruefalsefalse'){

	}else if(combo == 'falsetruetruefalse'){

	}else if(combo == 'falsefalsetruetrue'){

	}else if(combo == 'truefalsefalsetrue'){

	}else if(combo == 'falsetruefalsefalse'){

	} else if(combo=='falsefalsetruefalse'){

	} else if(combo=='truefalsefalsefalse'){

	} else if(combo=='truetruetruefalse'){

	} else if(combo=='truetruefalsetrue'){
		
	} else if(combo == 'truefalsetruetrue'){

	} else if(combo == 'falsetruetruetrue'){

	} else {
		return [
			w*0.25,0-w*0.25,
			w*0.5,0,
			w*0.25,w*0.25,
			0-w*0.5, 0

		];
	}
	return false;
};


/**
 * Manipulates a base texture and draws a tile in the desired
 * configuration.
 * @param {boolean} a Is the top-left corner raised?
 * @param {boolean} b Is the top-right corner raised?
 * @param {boolean} c Is the bottom-right corner raised?
 * @param {boolean} d Is the bottom-left corner raised?
 * @param {tile} The texture to use. Returned tile will be double the size.
 */
var renderTile = function(a,b,c,d,tile,can){
	// Make up a new canvas to play on.
	if(!can){
		can = document.createElement('canvas');
		can.width = tile.width*2;
		can.height = tile.height*2;
	}

	var ctx = can.getContext('2d');
	ctx.clearRect(0,0,can.width,can.height);
	ctx.save();

	// Also create a buffer so we can manipulate textures before drawing
	var canBuff = document.createElement('canvas');
	canBuff.width = can.width;
	canBuff.height = can.width;
	var ctxBuff = canBuff.getContext('2d');
	
	// Just to make things more readable.
	var combo = String(!!a)+!!b+!!c+!!d;
	
	// Here'es the transform(s) for each elevation combo.
	if(combo == 'truetruefalsefalse'){
		// 1100
		ctx.transform(1,-0.5,1,1,0,tile.height);
		ctx.drawImage(tile,0,0);
	}else if(combo == 'falsetruetruefalse'){
		// 0110
		ctx.transform(1,-1,1,0.5,0,tile.height*1.5);
		ctx.drawImage(tile,0,0);
	}else if(combo == 'falsefalsetruetrue'){
		// 0011
		ctx.transform(1,-0.5,1,0,0,tile.height*1.5);
		ctx.drawImage(tile,0,0);
	}else if(combo == 'truefalsefalsetrue'){
		// 1001
		ctx.transform(1,0,1,0.5,0,tile.height);
		ctx.drawImage(tile,0,0);
	}else if(combo == 'falsetruefalsefalse'){
		// 0100
		// Tip corner raised.
		ctx.transform(1,-0.5,1,0.5,0,tile.height*1.5);
		ctx.drawImage(tile,0,0);
		ctx.restore();
		
		ctxBuff.transform(1,-1,1,1,0,tile.height*1.5);
		ctxBuff.drawImage(tile,0,0);
		
		ctx.drawImage(canBuff,0,0,tile.width*2,tile.height*1.5,0,0,tile.width*2,tile.height*1.5);
	} else if(combo=='falsefalsetruefalse'){
		// 0010
		// Upper right-hand corner.
		ctx.transform(1,-1,1,0,0,tile.height*2);
		ctx.drawImage(tile,0,0);
		ctx.restore();
		ctx.clearRect(0,tile.height,tile.width,tile.height);
		
		ctxBuff.transform(1,-0.5,1,0.5,0,tile.height*1.5);
		ctxBuff.drawImage(tile,0,0);
		ctx.drawImage(canBuff,0,tile.height,tile.width,tile.height,0,tile.height,tile.width,tile.height);
	} else if(combo=='truefalsefalsefalse'){
		// 1000
		// Left point raised.
		ctx.transform(1,0,1,1,0,tile.height);
		ctx.drawImage(tile,0,0);
		ctx.restore();
		ctx.clearRect(tile.width,tile.height,tile.width,tile.height);
		
		ctxBuff.transform(1,-0.5,1,0.5,0,tile.height*1.5);
		ctxBuff.drawImage(tile,0,0);
		ctx.drawImage(canBuff,tile.width,tile.height,tile.width,tile.height,tile.width,tile.height,tile.width,tile.height);
	} else if(combo=='truetruetruefalse'){
		// 1110
		ctx.transform(1,-0.5,1,1,0,tile.height);
		ctx.drawImage(tile,0,0);
		ctx.restore();
		ctx.clearRect(tile.width,0,tile.width,tile.height*2);
		
		ctxBuff.transform(1,-1,1,0.5,0,tile.height*1.5);
		ctxBuff.drawImage(tile,0,0);
		ctx.drawImage(canBuff,tile.width,0,tile.width,tile.height*2,tile.width,0,tile.width,tile.height*2);
	} else if(combo=='truetruefalsetrue'){
		// 1101
		ctxBuff.save();
		ctxBuff.transform(1,-0.5,1,1,0,tile.height);
		ctxBuff.drawImage(tile,0,0);
		
		/* Mask the tile so as to only draw the required portion */
		ctxBuff.globalCompositeOperation = 'destination-in';
		ctxBuff.beginPath();
		ctxBuff.moveTo(0,0);
		ctxBuff.lineTo(tile.width,0);
		ctxBuff.lineTo(tile.width,tile.height);
		ctxBuff.fill();
		
		ctxBuff.restore();
		ctx.drawImage(canBuff,0,0);
		
		ctxBuff.transform(1,0,1,0.5,0,tile.height);
		ctxBuff.drawImage(tile,0,0);
		ctxBuff.globalCompositeOperation = 'destination-in';
		
		ctxBuff.beginPath();
		ctxBuff.moveTo(0,0);
		ctxBuff.lineTo(tile.width,tile.height);
		ctxBuff.lineTo(0,tile.height);
		ctxBuff.fill();
		
		ctx.drawImage(canBuff,0,0);
		
	} else if(combo == 'truefalsetruetrue'){
		// 1011
		ctxBuff.save();
		ctxBuff.transform(1,0,-1,0.5,tile.width,tile.height*1.5);
		ctxBuff.drawImage(tile,0,0);
		
		/* Mask the tile so as to only draw the required portion */
		ctxBuff.globalCompositeOperation = 'destination-in';
		ctxBuff.beginPath();
		ctxBuff.moveTo(tile.width,0);
		ctxBuff.lineTo(0,0);
		ctxBuff.lineTo(tile.width,tile.height);
		ctxBuff.fill();
		
		ctxBuff.restore();
		ctx.drawImage(canBuff,0,0-tile.height/2);
		
		
		ctxBuff.transform(1,0,1,0.5,0,tile.height*1.5);
		ctxBuff.drawImage(tile,0,0);
		
		/* Mask the tile so as to only draw the required portion */
		ctxBuff.globalCompositeOperation = 'destination-in';
		ctxBuff.beginPath();
		ctxBuff.moveTo(0,tile.height);
		ctxBuff.lineTo(0,0);
		ctxBuff.lineTo(tile.width,0);
		ctxBuff.fill();
		
		ctx.drawImage(canBuff,0,0-tile.height/2);
	} else if(combo == 'falsetruetruetrue'){
		// 0111
		ctxBuff.save();
		ctxBuff.transform(1,-1,1,0.5,0,tile.height*1.5);
		ctxBuff.drawImage(tile,0,0);
		
		/* Mask the tile so as to only draw the required portion */
		ctxBuff.globalCompositeOperation = 'destination-in';
		ctxBuff.beginPath();
		ctxBuff.moveTo(tile.width,0);
		ctxBuff.lineTo(0,0);
		ctxBuff.lineTo(tile.width,tile.height);
		ctxBuff.fill();
		
		ctxBuff.restore();
		ctx.drawImage(canBuff,0,0);
		
		
		ctxBuff.save();
		ctxBuff.transform(1,0,-1,0.5,tile.width,tile.height);
		ctxBuff.drawImage(tile,0,0);
		
		/* Mask the tile so as to only draw the required portion */
		ctxBuff.globalCompositeOperation = 'destination-in';
		ctxBuff.beginPath();
		ctxBuff.moveTo(tile.width,0);
		ctxBuff.lineTo(tile.width,tile.height);
		ctxBuff.lineTo(0,tile.height);
		ctxBuff.fill();
		
		ctx.drawImage(canBuff,0,0);
	} else {
		// combo == 'falsefalsefalsefalse'
		// 0000
		// 0001
		ctx.transform(1,-0.5,1,0.5,0,tile.height*1.5);
		ctx.drawImage(tile,0,0);
	}
	
	return can;
	
}

module.exports = {
	make: make,
	getMask: getMask,
	renderTile: renderTile
};
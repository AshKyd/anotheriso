var RenderSprite = require('./RenderSprite');
var Tile = require('./Tile');
var PF = require('pathfinding');
var finder = new PF.AStarFinder();
var _ = require('underscore');

var Grid = function(opts){
	var _this = this;
	this.tileWidth = opts.tileWidth || 256;
	this.tilesPerX = this.tileWidth/2; 
	this.tilesPerY = this.tileWidth/4;
	this.setup(opts);


	this.updateSpriteRefScope = function(){
		_this.updateSpriteRef();
	};
};

Grid.prototype.setup = function(opts){
	this.tiles = [];
	this.spriteCount = 0;
	this.sprites = {};
};

/**
 * Get a tile by coordinate
 * Iterates every tile. Not optimised. We should index this, but this is easier.
 * @param {Array} pos Position object to find a tile for. Leave z undefined to return all.
 */
Grid.prototype.getTileFromPos = function(pos){
	var startTime = Date.now();
	for(var i=0; i<this.tiles.length; i++){
		if(this.tiles[i].pos[1] == pos[1] && this.tiles[i].pos[2] == pos[2]){
			if(typeof pos[0] != 'number' || this.tiles[i].pos[0] == pos[0]){
				return i;
			}
		}
	}
};

Grid.prototype.createTile = function(opts){
	this.tiles.push(new Tile({
		src: opts.img,
		pos: opts.pos,
		width: this.tileWidth,
		grid: this,
		corners: opts.corners
	}));
};

Grid.prototype.loadTerrain = function(terrain, maxHeight){
	var p1, p2, p3, p4, z, tile;
	maxHeight = maxHeight || 5;

	function pointHeight(point){
		// Sometimes generator returns values <-1
		return Math.floor((1+Math.max(-1,point))/2*maxHeight);
	}
	for(var i=terrain.length-2; i>=0; i--){
		for(var j=0; j<=terrain[i].length-2; j++){
			p1 = pointHeight(terrain[i][j]);
			p2 = pointHeight(terrain[i+1][j]);
			p3 = pointHeight(terrain[i+1][j+1]);
			p4 = pointHeight(terrain[i][j+1]);

			z = Math.min(p1,p2,p3,p4);
			p1 = p1 > z;
			p2 = p2 > z;
			p3 = p3 > z;
			p4 = p4 > z;

			if(z ==0 && !p1 && !p2 && !p3 && !p4){
				tile = 'images/water.png';
			} else {
				tile = 'images/tile.png';
			}

			this.createTile({
				img: tile,
				pos: [z, j, i],
				corners: [
					p1,
					p2,
					p3,
					p4
				]
			});
			
		}
	}
};

Grid.prototype.each = function(callback){
	for(var z=0; z<this.tiles.length; z++){
		callback(this.tiles[z]);
	}
	for(z in this.sprites){
		callback(this.sprites[z]);
	}
};

Grid.prototype.addSprite = function(sprite){
	sprite.setGrid(this);
	this.sprites[this.spriteCount] = sprite;
	this.spriteCount++;
	this.callHook('addsprite', sprite);
};



Grid.prototype.on = function(name,fn){
	this.events = this.events || {};
	this.events[name] = this.events[name] || [];
	this.events[name].push(fn);
};

Grid.prototype.callHook = function(name, values){
	if(this.events && this.events[name]){
		this.events[name].forEach(function(callback){
			callback(values);
		});
	}
};

Grid.prototype.getTraversalMap = function(unittype){

	var _this = this;
	var start = false;
	var dest = false;

	var nodes = [];

	function mapTile(thisTile, offset, thisCorner, otherCorner){
		var tThisTile = _this.tiles[thisTile];
		var otherTile = _this.getTileFromPos({
			z: tThisTile.pos.z+offset.z,
			x: tThisTile.pos.x+offset.x,
			y: tThisTile.pos.y+offset.y
		});

		var tOtherTile = _this.tiles[otherTile];
		if(!tOtherTile){
			return;
		}

		if(
			// Corners match ont he same zoom level
			(tThisTile.corner[thisCorner] == tOtherTile.corner[otherCorner] && tOtherTile.pos.z == tThisTile.pos.z) ||

			// Corners match where other tile is one level higher
			(tThisTile.corner[thisCorner]===true && tOtherTile.corner===false && tOtherTile.pos.z == tThisTile.pos.z+1) ||

			// Corners match where other tile is one level lower.
			(tThisTile.corner[thisCorner]===false && tOtherTile.corner===true && tOtherTile.pos.z == tThisTile.pos.z-1)
		){
			// Add pathfinding link.
			nodes[thisTile].neighbours.push(nodes[otherTile]);
		}
	}

	for(var i=0; i<this.tiles.length; i++){
		nodes[i] = new PF.Node(
			this.tiles[i].pos.z,
			this.tiles[i].pos.x,
			this.tiles[i].pos.y
		);
	}

	// work out how to do this. FIXME
	for(i=0; i<this.tiles.length; i++){
		// mapTile(i, {x:0,y:0,z:0}, 0, 3);
		

		// true, false, false, false
		
		
		// false, true, false, false
		// false, false, true, false
		// false, false, true, false
		// true, true, false, false
		
		// false, false, true, true
		// false, true, true, false
		// true, false, false true
		// true, true, false, false
		
		// false, true, true, true
		// true, false, true, true
		// true, true false true
		// true, true, true, false
	}

	var width, height;
	width = this.width*3;
	height = this.height*3;
	return new PF.Grid(width, height);
};

/**
 * Find a path.
 * Note the division by three weirdness, this is because of my dumb assumptions
 * re 3D grid stuff and will be fixed later.
 * Also note that the pathfinder returns coords as [x,y,z] whereas we're using
 * [z,x,y] because we're noobs.
 */
Grid.prototype.findPath = function(start, end, callback){
	var grid = this.getTraversalMap();
	window.grid = grid;
	var startNode = grid.getNodeAt(start[1]*3, start[2]*3);
	var endNode = grid.getNodeAt(end[1]*3,end[2]*3);
	var path = finder.findPath(startNode, endNode, grid);
	path = _.map(path, function(point){
		return [point[2]/3,point[0]/3,point[1]/3];
	});
	callback(path);
};

Grid.prototype.tick = function(now){
	this.each(function(sprite){
		sprite.tick(now);
	});
};

module.exports = Grid;
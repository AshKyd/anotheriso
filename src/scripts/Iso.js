var Grid = require('./Grid');
var Viewport = require('./Viewport');
var Sprite = require('./Sprite');
var SuperLoop = require('../../../superloop/index.js');
//var CANNON = require('cannon');
var generateTerrain = require('fractal-terrain-generator').generateTerrain;

var Iso = function(opts){
	var i, _this;
	_this = this;

	_this.grid = new Grid({
		size: [1,16,16]
	});


	// var demoTerr = [
	// 	[-1,-1,1,1],
	// 	[-1,-1,1,1],
	// 	[-1,-1,-1,-1],
	// 	[-1,-1,-1,-1],
	// ];


	// var demoTerr = [
	// 	[1,1,-1,-1],
	// 	[1,1,-1,-1],
	// 	[-1,-1,-1,-1],
	// 	[-1,-1,-1,-1],
	// ];

	var terrain = generateTerrain(10, 10, 1.5);

	_this.grid.loadTerrain(terrain,1);

	// Set up viewports
	_this.viewports = [];
	var viewport = new Viewport({
		grid: this.grid,
		parent: opts.parent
	});
	_this.viewports.push(viewport);

	

	// var mrGrumpy = new Sprite({
	// 		src: 'images/grumpy.png',
	// 		pos: [0,0,0]
	// 	})
	// 	.addTo(_this.grid)
	// 	.addBehaviour('automation')
			// .goto({
			// 	dest: [0,5,5]
			// });

	viewport.on('move',function(e){
		// console.log(viewport.xy2Tile(e));
	});


	// // Setup our world
	// var world = new CANNON.World();
	// world.gravity.set(0,0,-9.82);
	// world.broadphase = new CANNON.NaiveBroadphase();

	// // Create a sphere
	// var mass = 1, radius = 1;
	// var sphereShape = new CANNON.Sphere(radius);
	// sphereShape.motionstate = CANNON.Body.DYNAMIC;
	// var sphereBody = new CANNON.RigidBody(mass,sphereShape);

	// sphereBody.position.set(5,0,10);
	// window.setTimeout(function(){
	// 	sphereBody.force.set(20,0,0);
	// 	sphereBody.linearDamping = -0.5;
	// },5000);


	// world.add(sphereBody);

	// // Create a plane
	// var groundShape = new CANNON.Plane();
	// var groundBody = new CANNON.RigidBody(0,groundShape);
	// world.add(groundBody);


	// _this.grid.findPath([0,0,0],[0,4,4],function(path){
	// 	viewport.drawPath({
	// 		path:path,
	// 		nodes: true
	// 	});
	// });

	// _this.grid.findPath([0,4,4],[0,0,0],function(path){
	// 	console.log(path);
	// 	viewport.drawPath({
	// 		path:path,
	// 		nodes: true
	// 	});
	// });

	// set up game loop
	_this.loop = new SuperLoop({
	    ontick: function(now){
			// world.step(1.0/60.0);
			// grumpySprite.setPos([
			// 	sphereBody.position.z-1,
			// 	sphereBody.position.x,
			// 	sphereBody.position.y
			// ]);
			_this.grid.tick(now);
	    },
	    onrender: function(){
	        for(i=0; i<_this.viewports.length; i++){
	        	_this.viewports[i].render();
	        }
	    }
	});
	_this.loop.start();

};

module.exports = Iso;
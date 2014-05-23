var Automation = function(parent){
	this.parent = parent;
	this.speed = 0.005;
};

Automation.prototype.tick = function(now){
	if(this.path && !this.startTime){
		// Let's go!
		this.startTime = now;
		this.endTime = now + this.duration;
		console.log('starting moving sprite',now);
	}
	if(this.path){
		var newPos = this.getPosition(this.startTime, this.duration, now, this.path);
		// console.log('new pos:',newPos);
		this.parent.setPos(newPos);
		// console.log('moving to',newPos)

		if(now > this.endTime){
			console.log('finished moving!',now);
			delete this.path;
			return;
		}
	}
};

Automation.prototype.getPosition = function(startTime,duration,now,path){
	now = now-startTime;
	if(now > duration){
		return path[path.length-1];
	} else if(now <= 0){
		return path[0];
	}
	var index = now/duration*path.length;

	// Dead code
	var a = path[Math.floor(index)];
	var b = path[Math.ceil(index)];
	index = index%1;

	if(!b){
		return a;
	}

	return [
		(b[0] - a[0])*index + a[0],
		(b[1] - a[1])*index + a[1],
		(b[2] - a[2])*index + a[2]
	];

};

Automation.prototype.goto = function(opts){
	var _this  = this;
	_this.parent.grid.findPath(this.parent.pos, opts.dest, function(path){
		if(!path){
			return;
		}
		_this.path = path;
		_this.startTime = false;
		_this.duration = _this.calculateTime(_this.speed, path.length);
	});

	return this;
};

Automation.prototype.calculateTime = function(speed,distance){
	return distance / speed;
};

module.exports = Automation;
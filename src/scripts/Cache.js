var cache = {};

var loadImage = function(src,callback){
	var img = new Image();
	img.onload = function(){
		callback(img);
	};
	img.src = src;
};

var setObject = function(namespace,key,value){
	if(!cache[namespace]){
		cache[namespace] = {};
	}
	cache[namespace][key] = value;
};

var getObject = function(namespace,key){
	if(cache[namespace] && cache[namespace][key]){
		return cache[namespace][key];
	}
	return undefined;
};


module.exports = {
	loadImage: loadImage,
	setObject: setObject,
	getObject: getObject
};
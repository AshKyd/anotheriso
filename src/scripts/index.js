var Iso = require('./Iso');
window.onload = function(){
	document.body.height = window.innerHeight - 100;
	document.body.width = window.innerWidth - 100;
	new Iso({
		parent: document.body
	});
};
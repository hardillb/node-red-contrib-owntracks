module.exports = function(RED) {
	"use strict";

	var sodium = require('libsodium-wrappers');

	var owntracks = function(n) {
		RED.nodes.createNode(this,n);
		var node = this;
		var secret = this.credentials.secret;

		this.on('input',function(msg){
			if (msg.payload._type === 'encrypted') {
				if (secret) {
					var cypherText = new Buffer(msg.payload.data, 'base64');
					var nonce = cypherText.slice(0,24);
	      			var key = new Buffer(32);
	      			key.fill(0);
	      			key.write(secret);
	      			var clearText = sodium.crypto_secretbox_open_easy(cypherText.slice(24),nonce,key,"text");
	      			var clearObj = JSON.parse(clearText);
	      			msg.payload = clearObj;
      			} else {
      				node.status({fill:'red',shape:'dot',text:'No secret'});
      				node.send(msg);
      				return;
      			}
			}
			if (msg.payload._type === 'location') {
				msg.location = {
					lat: msg.payload.lat,
					lon: msg.payload.lon
				};
			}

			node.send(msg);

		});

	};
	RED.nodes.registerType("owntracks", owntracks, { credentials: {
		secret: {type: 'text'}
	}});
}
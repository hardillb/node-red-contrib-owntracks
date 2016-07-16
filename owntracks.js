/**
 * Copyright 2016 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
module.exports = function(RED) {
    "use strict";

    var sodium = require('libsodium-wrappers');

    var owntracks = function(n) {
        RED.nodes.createNode(this,n);
        var node = this;
        node.secret = this.credentials.secret;
        node.topic = n.topic;
        node.broker = RED.nodes.getNode(n.broker);

        if(node.broker) {
          node.broker.register(this);
          node.broker.subscribe(node.topic, 0, function(topic, payload, packet) {
            var msg = {topic:topic, payload:payload, qos: packet.qos, retain: packet.retain};
            msg.payload = JSON.parse(msg.payload);
            if(msg.payload._type === 'encrypted') {
              if(node.secret) {
                var cypherText = new Buffer(msg.payload.data, 'base64');
                var nonce = cypherText.slice(0,24);
                var key = new Buffer(32);
                var clearText, clearObj;
                key.fill(0);
                key.write(node.secret);
                try {
                    clearText = sodium.crypto_secretbox_open_easy(cypherText.slice(24),nonce,key,"text");
                } catch (e) {
                    node.warn("error decrypting payload");
                    return;
                }
                try{
                    clearObj = JSON.parse(clearText);
                } catch (e) {
                    node.warn("decrypted message not JSON");
                    return;
                }
                msg.payload = clearObj;
              } else {
                node.warn("No secret provided.");
                return;
              }
            }
            if (msg.payload._type === 'location') {
                msg.location = {
                    lat: msg.payload.lat,
                    lon: msg.payload.lon,
                    name: msg.payload.tid
                };
                msg.payload.name = msg.payload.name || msg.payload.tid;
            }
            node.send(msg);
          }, node.id);

          node.on('close', function(done) {
            if(node.broker) {
              node.broker.unsubscribe(node.topic, node.id);
              node.broker.deregister(node, done);
            }
          });
        }
    };
    RED.nodes.registerType("owntracks", owntracks, { credentials: {
        secret: {type: 'text'}
    }});
};

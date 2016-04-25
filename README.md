# Owntracks node

A Node-RED node to decrypt encrypted Owntracks location messages and to add the 
msg.location field to the on going message so it can be used with things like the
geofence node or the mapping output.


## Usage

Connect a MQTT in node to the input side and decrypted messages will be sent to the output 
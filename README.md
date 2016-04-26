# Owntracks node

A Node-RED node to decrypt encrypted OwnTracks location messages and to add the 
msg.location field to the on going message so it can be used with things like the
geofence node or the mapping output.

##Install

To install globally:

`npm install -g node-red-contrib-owntracks`

To install for just the current user

```
cd ~/.node-red
npm install node-red-contrib-owntracks
```

## Usage

Connect a MQTT input node to the input side, enter the shared secret in the setting 
dialog and decrypted messages will be sent to the output.
//Cap
var Cap = require('cap').Cap;
var decoders = require('cap').decoders;
var protocol = decoders.PROTOCOL;

var os = require('os');

// find IP to connect to
var ip = "";
var ifaces = os.networkInterfaces();
Object.keys(ifaces).forEach(function(iface) {
  ifaces[iface].forEach(function(i) {
    if(i.family === 'IPv4' && i.internal === false) {
      ip = i.address;
    }
  });
});


console.log(ip);



//Cap
var Cap = require('cap').Cap;
var decoders = require('cap').decoders;
var protocol = decoders.PROTOCOL;

var os = require('os');
var Connection = require('./models/Connection');
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

//Set up connect to cap
var c = new Cap();
var device = Cap.findDevice(ip);
var filter = 'tcp and dst port 80';
var bufSize = 8 * 1024 * 1024;
var buffer = new Buffer(65535);

var linkType = c.open(device, filter, bufSize, buffer);
c.setMinBytes && c.setMinBytes(0);

var data = {};
var recent = [];

c.on('packet', function(nbytes, trunc) {
  //console.log(trunc)
  if (linkType === 'ETHERNET') {
    var layer2 = decoders.Ethernet(buffer);
    if (layer2.info.type === protocol.ETHERNET.IPV4) {
      var layer3 = decoders.IPV4(buffer, layer2.offset);
      if (layer3.info.protocol === protocol.IP.TCP) {
        var datalen = layer3.info.totallen - layer3.hdrlen;
        var layer4 = decoders.TCP(buffer, layer3.offset);
        datalen -= layer4.hdrlen;
        // r = buffer.toString('binary', layer2.offset, layer4.offset + datalen).length;
        // console.log(r)
        setData(layer2, layer3, layer4, "TCP", nbytes);

      } else if (layer2.info.protocol === protocol.IP.UDP) {
        var layer4 = decoders.UDP(buffer, layer3.offset);
        setData(layer2, layer3, layer4, "UDP", nbytes)
      }
    }
  }
})
function setData(l2, l3, l4, type, bytes) {
  var iptu = l3.info.srcaddr;
  var por = l4.info.srcport;
  if(l3.info.srcaddr === ip) {
    iptu = l3.info.dstaddr;
    por = l4.info.dstport;
  }
  if(data[iptu] === undefined) {
    data[iptu] = new Connection();
  }
  var d = {
    ip: iptu,
    ports: [l4.info.srcport, l4.info.dstport],
    length: bytes * 10,
  }
  data[iptu].add(d)
  if(recent.length >= 1000) {
    recent.pop();
  }
  recent.unshift(d)
  console.log(iptu + ": " + data[iptu].amount())

}


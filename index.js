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
var filter = '';
var bufSize = 10 * 1024 * 1024;
var buffer = new Buffer(65535);

var linkType = c.open(device, filter, bufSize, buffer);
c.setMinBytes && c.setMinBytes(0);

var data = {};

c.on('packet', function(nbytes, trunc) {
  if (linkType === 'ETHERNET') {
    var layer2 = decoders.Ethernet(buffer);
    if (layer2.info.type === protocol.ETHERNET.IPV4) {
      var layer3 = decoders.IPV4(buffer, layer2.offset);
      //console.log(ret)
      if (layer3.info.protocol === protocol.IP.TCP) {
        var datalen = layer3.info.totallen - layer3.hdrlen;
        var layer4 = decoders.TCP(buffer, layer3.offset);
        //console.log(ret)
        datalen -= layer3.hdrlen;
        setData(layer2, layer3, layer4, "TCP");

      } else if (layer2.info.protocol === protocol.IP.UDP) {
        var layer4 = decoders.UDP(buffer, layer3.offset);
        setData(layer2, layer3, layer4, "UDP")
      }
    }
  }
})

function setData(l2, l3, l4, type) {
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
    ports: [l4.srcport, l4.dstport],
    length: l3.info.totallen - l3.hdrlen - l4.hdrlen,
  }
  data[iptu].add(d)
  console.log(data[iptu])
  //console.log(data[iptu])

}


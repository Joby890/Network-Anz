var IPToASN = require('ip-to-asn');
 
var client = new IPToASN();

//Cap
var Cap = require('cap').Cap;
var decoders = require('cap').decoders;
var protocol = decoders.PROTOCOL;

var os = require('os');
var Connection = require('./models/Connection');
var mdata = require('./models/MasterData');
var server = require('./server')(mdata);
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
//var filter = 'tcp and dst port 80';
var filter = '';
var bufSize = 8 * 1024 * 1024;
var buffer = new Buffer(65535);

var linkType = c.open(device, filter, bufSize, buffer);
c.setMinBytes && c.setMinBytes(0);


c.on('packet', function(nbytes, trunc) {
  if (linkType === 'ETHERNET') {
    var layer2 = decoders.Ethernet(buffer);
    if (layer2.info.type === protocol.ETHERNET.IPV4) {
      var layer3 = decoders.IPV4(buffer, layer2.offset);
      if (layer3.info.protocol === protocol.IP.TCP) {
        var datalen = layer3.info.totallen - layer3.hdrlen;
        var layer4 = decoders.TCP(buffer, layer3.offset);
        datalen -= layer4.hdrlen;
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
  if(iptu === '192.168.1.127') {
    return;
  }
  if(mdata.data[iptu] === undefined) {
    mdata.data[iptu] = new Connection();
  }


  var d = {
    ip: iptu,
    ports: [l4.info.srcport, l4.info.dstport],
    length: bytes * 10,
  }

  if(mdata.ipTOwner[iptu] === undefined) {
    mdata.ipTOwner[iptu] = null;
    client.query([iptu], function(err, geoData) {
      if(err) {
        console.error(err);
        return;
      }
      mdata.ipTOwner[iptu] = geoData.description;
    })
    
  } 


  mdata.data[iptu].add(d)
  if(mdata.recent.length >= 500) {
    mdata.recent.pop();
  }
  mdata.recent.unshift(d)
}


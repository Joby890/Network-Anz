module.exports = function() {
  this.packets = [];
  
}


module.exports.prototype.add = function(packet) {
 this.packets.push(packet)
}
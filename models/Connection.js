module.exports = function() {
  this.packets = [];
  
}


module.exports.prototype.add = function(packet) {
 this.packets.push(packet)
}

module.exports.prototype.average = function() {

  return this.amount() / this.packets.length;
}

module.exports.prototype.amount = function() {
  var amount = 0;
  for(var i = 0; i < this.packets.length; i++) {
    amount += this.packets[i].length;
  }
  return amount;
}
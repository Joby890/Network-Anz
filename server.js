module.exports =  function(data) {
  var express = require('express');
  var bodyParser = require('body-parser');

  var app = express();
  // app.use(bodyParser.json());
  // app.use(bodyParser.urlencoded({ extended: true }));
  app.use(express.static(__dirname + '/client'));
  app.get('/', function(req, res) {
    res.sendFile('client/index.html')
  });

  app.get('/data/recent', function(req, res) {
    res.send(JSON.stringify(data.recent))
  })

  app.get('/data/all', function(req, res) {
    res.send(JSON.stringify(data.data))
  })

  app.get('/data/ips', function(req, res) {
    res.send(JSON.stringify(data.ipTOwner))
  })

  app.get('/data/*/amount', function(req, res) {
    var url = req.path.split("/")[2];
    res.send(JSON.stringify({amount: data.data[url].amount()}))
  });
  app.get('/data/*/average', function(req, res) {
    var url = req.path.split("/")[2];
    res.send(JSON.stringify({amount: data.data[url].average()}))
  });

  app.get('/data/*', function(req, res) {
    var url = req.path.split("/")[2];
    res.send(JSON.stringify(data.data[url]))
  })


  app.listen(8080);
  console.log("Server started")

}
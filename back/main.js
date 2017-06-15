
var nordpool = require('nordpool')
var prices = new nordpool.Prices()

var http = require('http');
var express = require('express'),
    app = module.exports.app = express();

var server = http.createServer(app);
var io = require('socket.io').listen(server);
server.listen(80);

app.get('/', function (req, res) {
  res.send('Hello, world!');
});


setInterval(() => {
    getLatestMarketValue((latestMarketValue) => {
        io.sockets.emit('currentPriceUpdate', { price: latestMarketValue });
    });
}, 2000);


var getLatestMarketValue = (callback) => {
  prices.hourly({currency: 'EUR'}, (error, results) => {
    if(error) console.log(error);
    
    var estonianResults = results.filter((result) => {
      if(result.area === "EE"){
        return result;
      }
    });
    return callback(estonianResults[estonianResults.length-1].value);
  });
}
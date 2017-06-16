
var nordpool = require('nordpool')
var prices = new nordpool.Prices()

var http = require('http');
var express = require('express'),
    app = module.exports.app = express();

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'electric'
});


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

var server = http.createServer(app);
var io = require('socket.io').listen(server);
server.listen(3000);

app.get('/', function (req, res) {
  res.send('Hello, world!');
});

app.get('/getGeneratorsInfo', (req, res) => {
    getGeneratorsInfo((error, generators) => {
      if(error) return res.send(500);

      return res.send(generators);
    });
});

setInterval(() => {
    getLatestMarketValue((latestMarketValue) => {
        io.sockets.emit('currentPriceUpdate', { price: latestMarketValue });
    });
}, 2000);


var getLatestMarketValue = (callback) => {
  prices.hourly({currency: 'EUR'}, (error, results) => {
    if(error) console.log(error);
    
    if(!results) return callback({error: 'No results'});
    var estonianResults = results.filter((result) => {
      if(result.area === "EE"){
        return result;
      }
    });
    return callback(null, estonianResults[estonianResults.length-1].value);
  });
}

var getGeneratorsInfo = (callback) => {
  connection.query('SELECT * FROM generators ORDER BY id', (error, results) => {
        if(error) return callback({error: 'query error'});
        
        console.log(results);
        return callback(null, results);
    });
}
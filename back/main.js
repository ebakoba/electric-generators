
var nordpool = require('nordpool');
var prices = new nordpool.Prices();

var rpio = require('rpio');
rpio.open(7, rpio.OUTPUT, rpio.HIGH);
rpio.open(11, rpio.OUTPUT, rpio.HIGH);

var bodyParser = require('body-parser');
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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

var server = http.createServer(app);
var io = require('socket.io').listen(server);
server.listen(3000);

app.post('/updatePrices', function (req, res) {
  updateGeneratorsPrices(req.body.prices.split(','), (error) => {
    if(error) return res.sendStatus(500);

    io.sockets.emit('pricesUpdated', req.body.prices.split(','));
    return res.sendStatus(200);
  });
});

setInterval(() => {
    getLatestMarketValue((error, latestMarketValue) => {
        if (error) return null;

        updateGeneratorsStatuses(latestMarketValue, (error, updatedGenerators) => {
          getGeneratorsInfo((error, generators) => {
            applyGeneratorsStatuses(generators);
            io.sockets.emit('generatorsInfoUpdate', generators);
          })
        });

        io.sockets.emit('currentPriceUpdate', { price: latestMarketValue });
    });
}, 1000);


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
        
        return callback(null, results);
    });
}

var updateGeneratorsStatuses = (latestMarketValue, callback) => {
  connection.query('UPDATE generators SET turnedOn=TRUE WHERE price<?', [latestMarketValue], (error, results) => {
    if(error) return callback(error);
    connection.query('UPDATE generators SET turnedOn=FALSE WHERE price>?', [latestMarketValue], (error, results) => {
      if(error) return callback(error);

      return callback(null);
    });
  });
}

var updateGeneratorsPrices = (prices, callback) => {
  prices.forEach((price, index) => {
    connection.query('UPDATE generators SET price=? WHERE id=?', [price, index+1], (error, result) => {
      if(error) return callback(error);

      if(index+1 == prices.length) return callback();
    });
  });
}

var applyGeneratorsStatuses = (generators) => {
  var pinoutList = [7, 11];
  generators.forEach((generator, index) => {
    console.log(generator);
    if(generator.turnedOn){
      rpio.write(pinoutList[index], rpio.LOW);
    } else {
      rpio.write(pinoutList[index], rpio.HIGH);
    }
  });
}
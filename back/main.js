
var nordpool = require('nordpool')
var prices = new nordpool.Prices()

var app = require('express').createServer();
var io = require('socket.io')(app);


app.listen(80);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
    setInterval(() => {
        getLatestMarketValue((latestMarketValue) => {
            socket.emit('currentPriceUpdate', { price: latestMarketValue });
        });
    }, 2000);
});


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
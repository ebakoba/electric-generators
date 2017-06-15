var nordpool = require('nordpool')
var prices = new nordpool.Prices()
 
setInterval(() => {
  getLatestMarketValue((latestMarketValue) => {
    console.log(latestMarketValue);
  })
}, 2000)


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
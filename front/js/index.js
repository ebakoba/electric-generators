
Array.from(document.getElementsByClassName('generator-switch')).forEach((generatorSwitch) => {
    generatorSwitch.onclick = (event) => {
        event.preventDefault();
    };
});

loadGeneratorInfo((generatorInfo) => {
    console.log(generatorInfo);
})


var socket = io.connect('http://localhost:3000');

socket.on('currentPriceUpdate', function (data) {
    document.getElementById('livePrice').innerText = data.price + ' €/MWh';
});


function loadGeneratorInfo(callback) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText)
            return callback(this.responseText);
        }
    };
    xhttp.open("GET", "http://localhost:3000/getGeneratorsInfo", true);
    xhttp.send();
}
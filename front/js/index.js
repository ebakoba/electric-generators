
Array.from(document.getElementsByClassName('generator-switch')).forEach((generatorSwitch) => {
    generatorSwitch.onclick = (event) => {
        event.preventDefault();
    };
});


var socket = io.connect('http://localhost');

socket.on('currentPriceUpdate', function (data) {
    document.getElementById('livePrice').innerText = data.price + ' €/MWh';
});



var socket = io.connect('http://localhost:3000');

socket.on('currentPriceUpdate', function (data) {
    document.getElementById('livePrice').innerText = data.price + ' €/MWh';
});

loadGeneratorInfo((generatorInfo) => {
    useGeneratorInfo(generatorInfo);
});


 function changeGeneratorState(state, buttonElement, textElement) {
     if(state){
        buttonElement.className = "mdl-chip__contact mdl-color--teal mdl-color-text--white generator-button";
        buttonElement.innerText = 'O';
        textElement.innerText = 'ON';
     } else {
        buttonElement.className = "mdl-chip__contact mdl-color--red mdl-color-text--white generator-button";
        buttonElement.innerText = 'X';
        textElement.innerText = 'OFF';
     }
 }

function useGeneratorInfo(generatorInfo) {
    generatorInfo.forEach((generator, index) => {
        var buttonElements = document.getElementsByClassName('generator-button');
        var textElements = document.getElementsByClassName('generator-text');
        changeGeneratorState(generator.turnedOn, buttonElements[index], textElements[index]);

        var priceInputs = document.getElementsByClassName('price-input');
        populatePrices(generator.price, priceInputs[index]);
    });
}

function populatePrices(price, inputElement) {
    inputElement.MaterialTextfield.change(price);
}

function loadGeneratorInfo(callback) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            return callback(JSON.parse(this.responseText));
        }
    };
    xhttp.open("GET", "http://localhost:3000/getGeneratorsInfo", true);
    xhttp.send();
}
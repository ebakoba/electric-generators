
firstTime = true;
var socket = io.connect('http://localhost:3000');

socket.on('currentPriceUpdate', (data) => {
    document.getElementById('livePrice').innerText = data.price + ' €/MWh';
});

socket.on('generatorsInfoUpdate', (generators) => {
    console.log(generators);
    useGeneratorInfo(generators);
});

socket.on('pricesUpdated', (prices) => {
    prices.forEach((price, index) => {
        var priceTextfields = document.getElementsByClassName('price-textfield');
        populatePrices(price, priceTextfields[index]);
    });
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

        if(firstTime){
            var priceTextfields = document.getElementsByClassName('price-textfield');
            populatePrices(generator.price, priceTextfields[index]);
            if(index+1 == generatorInfo.length){
                firstTime = !firstTime;
            }
        }
    });
}

function populatePrices(price, inputElement) {
    inputElement.MaterialTextfield.change(price);
}

function getPriceInfo() {
    var priceInputs = document.getElementsByClassName('price-input');

    var inputValues = [];
    for (var i = 0; i < priceInputs.length; i++) {
        var input = priceInputs[i];
        
        inputValues[i] = input.value;
    }
    return inputValues;
}

function postPrices() {
    
    var priceInfo = getPriceInfo();
    
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "http://" + location.host + ":3000/updatePrices", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send('prices=' + getPriceInfo());
}
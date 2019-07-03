// Initialize Firebase
const Config = {
    apiKey: "AIzaSyCsZ3wNbJL4YxJs49j6tBUYcPmtwTFZFNQ",
    authDomain: "stockmonitor-37fc2.firebaseapp.com",
    databaseURL: "https://stockmonitor-37fc2.firebaseio.com",
    projectId: "stockmonitor-37fc2",
    storageBucket: "",
    messagingSenderId: "158264431131",
    appId: "1:158264431131:web:44a1b828a85e9390"
  };
firebase.initializeApp(Config);

let stockObj = {};
stockObj.stockName = "Apple";
stockObj.quantity = 10;
stockObj.price = 10.56;
stockObj.purchaseDate = "mm/dd/yyyy";
stockObj.user = 1;

let userObj = {};
userObj.userName = "Sam";
userObj.email = "name@gmail.com";
userObj.user = 1;

let stockRef = firebase.database();

stockRef.ref('/stocks').on('child_added',function(childObj, prevChildKeyObj){
    console.log(childObj.key);
    console.log(childObj.val());

});
console.log(stockObj);
stockRef.ref('/stocks').push(stockObj);


 

$(document).ready(function(eventObj){
    console.log(eventObj);

let baseUrl="https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&interval=5min&outputsize=full";
let stockSymbolName="&symbol="
let stockNames=["MSFT","TSLA","AXP"];
let stockApiKey="&apikey=9C5L7VDS9B25DUYZ";
    
function getStockData(stockElement){

    $.ajax({
        url : baseUrl + stockSymbolName + stockElement + stockApiKey,
        method: "GET"
    }).then(function(resObj){
        console.log(baseUrl + stockSymbolName + stockElement + stockApiKey);
        console.log(resObj);
        console.log(resObj["Meta Data"]);
        console.log(resObj["Meta Data"]["2. Symbol"]);
        console.log(resObj["Meta Data"]["3. Last Refreshed"]);
        console.log(resObj["Time Series (Daily)"]["2019-06-28"]["4. close"]);

        $("#stockTable > tbody").append($("<tr>"),$("<td>").text(resObj["Meta Data"]["2. Symbol"]));
    
    
    });

}

for(let i=0;i<stockNames.length;i++){
    getStockData(stockNames[i]);
}




});

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
    
    
    });

}

for(let i=0;i<stockNames.length;i++){
    getStockData(stockNames[i]);
}


});

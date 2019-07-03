
// Initialize Firebase
var firebaseConfig = {
    apiKey: "AIzaSyAqQmRiWzcO2f_3AKXt_KnWoYzwBDFQL34",
    authDomain: "fir-project-c0c9a.firebaseapp.com",
    databaseURL: "https://fir-project-c0c9a.firebaseio.com",
    projectId: "fir-project-c0c9a",
    storageBucket: "fir-project-c0c9a.appspot.com",
    messagingSenderId: "820221888907",
    appId: "1:820221888907:web:f8331d7565f1bdf7"
  };

   // Initialize Firebase
  firebase.initializeApp(firebaseConfig);


let stockObj = {};
let userObj = {};
userObj.userName = "Sam";
userObj.email = "name@gmail.com";
userObj.user = 1;

let stockRef = firebase.database();

stockRef.ref('/stocks').on('child_added',function(childObj, prevChildKeyObj){
    console.log(childObj.key);
    console.log(childObj.val());

    let  childObjData=childObj.val();

    tbRow=$("<tr>");
    tbRow.append($("<td>").text(childObjData.stockName),
    $("<td>").text(childObjData.price),
    $("<td>").text(childObjData.quantity),
    $("<td>").text(childObjData.purchaseDate),
    $("<td>").text(0),
    $("<td>").text(0)
    );

$("#stockTable > tbody").append(tbRow);


});



$(document).ready(function (eventObj) {

    let baseUrl = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&interval=5min&outputsize=full";
    let stockSymbolName = "&symbol="
    let stockNames = ["AXP", "AAPL", "MSFT"];
    let stockApiKey = "&apikey=9C5L7VDS9B25DUYZ";
    let stockData = [];
    let stockDataMonthly = [];
    let prevDates = [];

    function getMonthEndDates() {
        let currentYear = moment().format("YYYY");
        let currMonth = moment().format("MM");
        let currDayName = moment().format("dddd");
        let currDayNumber = moment().format("DD");

        if (currDayName == "Sunday") {
            currDayNumber -= 2;
        }
        else if (currDayName == "Saturday") {
            currDayNumber -= 1;
        }

        prevDates.push({
            month_end_date: moment(currentYear + "-" + currMonth + "-" + currDayNumber).format("YYYY-MM-DD"),
            month_end_day: moment(currentYear + "-" + currMonth + "-" + currDayNumber).format("dddd")
        });

        currMonth--;

        for (let i = 0; i < 6; i++) {
            let currMonthEndDay = moment(currentYear + "-" + currMonth, "YYYY-MM").daysInMonth();
            let currMonthEndName = moment(currentYear + "-" + currMonth + "-" + currMonthEndDay).format("dddd");

            if (currMonthEndName == "Sunday") {
                currMonthEndDay -= 2;
            }
            else if (currMonthEndName == "Saturday") {
                currMonthEndDay -= 1;
            }

            prevDates.push({
                month_end_date: moment(currentYear + "-" + currMonth + "-" + currMonthEndDay).format("YYYY-MM-DD"),
                month_end_day: moment(currentYear + "-" + currMonth + "-" + currMonthEndDay).format("dddd")
            });
            currMonth--;
            if (currMonth <= 0) {
                currMonth = 12;
                --currentYear;
            }
        }
        console.log(prevDates);
    }

    getMonthEndDates();


    function getStockData(stockElement) {
        let stockDate = moment().format("YYYY-MM-DD");
        let stockDateDay = moment().format("dddd");

        if (stockDateDay == "Sunday") {
            stockDate = moment().subtract(2, 'days').format("YYYY-MM-DD");
        }
        else if (stockDateDay == "Saturday") {
            stockDate = moment().subtract(1, 'days').format("YYYY-MM-DD");
        }

        $.ajax({
            url: baseUrl + stockSymbolName + stockElement + stockApiKey,
            method: "GET"
        }).then(function (resObj) {
            console.log(baseUrl + stockSymbolName + stockElement + stockApiKey);
            console.log(resObj["Meta Data"]["2. Symbol"]);
            console.log(resObj["Meta Data"]["3. Last Refreshed"]);
            console.log(resObj["Time Series (Daily)"][stockDate]["4. close"]);
        });

    }

    function getStockDataGlobalQuote(stockElement) {
        let baseUrlGlobal = "https://www.alphavantage.co/query?function=GLOBAL_QUOTE";
        $.ajax({
            url: baseUrlGlobal + stockSymbolName + stockElement + stockApiKey,
            method: "GET"
        }).then(function (resObj) {
            console.log(baseUrlGlobal + stockSymbolName + stockElement + stockApiKey);
            stockData.push({
                symbol: resObj["Global Quote"]["01. symbol"],
                price: resObj["Global Quote"]["05. price"],
                "latest trading day": resObj["Global Quote"]["07. latest trading day"],
                "previous close": resObj["Global Quote"]["08. previous close"]
            })
        });

    }

    function getStockDataMonthly(stockElement) {
        let baseUrlMonthly = "https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY_ADJUSTED";
        $.ajax({
            url: baseUrlMonthly + stockSymbolName + stockElement + stockApiKey,
            method: "GET"
        }).then(function (resObj) {
            console.log(baseUrlMonthly + stockSymbolName + stockElement + stockApiKey);

            for (let i = 0; i < prevDates.length; i++) {
                stockDataMonthly.push({
                    "symbol": resObj["Meta Data"]["2. Symbol"],
                    "Monthly avg price": resObj["Monthly Adjusted Time Series"][prevDates[i].month_end_date]["4. close"],
                    "Dividend amount": resObj["Monthly Adjusted Time Series"][prevDates[i].month_end_date]["7. dividend amount"],
                    "Month EndDate": prevDates[i].month_end_date
                })

            }

        });

    }


    $("#addBtn").click(function (eventObj) {
        console.log(eventObj);
        stockObj.stockName = $("#stockId").val();
        stockObj.quantity = $("#sPrice").val();
        stockObj.price = $("#sQuantity").val();
        stockObj.purchaseDate = $("#sPurchase").val();
        stockObj.user = 1;
        console.log(stockObj);
        stockRef.ref('/stocks').push(stockObj);
        alert("Added the stock");
        $("#stockId").val("");
        $("#sPrice").val("");
        $("#sQuantity").val("");
        $("#sPurchase").val("");
    });




    // let myChart = document.getElementById("stockCharts").getContext('2d');
    // let barChart = new Chart(myChart, {
    //     type: 'bar',
    //     data: {
    //         labels: stockNames,
    //         datasets: [{
    //             label: 'population1',
    //             data: [1, 2, 3],
    //             backgroundColor: ["red", "green"]
    //         },
    //         {
    //             label: 'population2',
    //             data: [4, 5, 6],
    //             backgroundColor: ["red", "green"]
    //         }
    //             ,
    //         {
    //             label: 'population3',
    //             data: [7, 8, 9],
    //             backgroundColor: ["red", "green"]
    //         }
    //         ]
    //     },
    //     options: {
    //         scales: {
    //             xAxes: [{
    //                 barPercentage: 0.5,
    //                 barThickness: 6,
    //                 maxBarThickness: 8,
    //                 minBarLength: 0,
    //                 gridLines: {
    //                     offsetGridLines: true
    //                 }
    //             }]
    //         }
    //     }
    // });


// "Meta Data": {
//     "1. Information": "Monthly Adjusted Prices and Volumes",
//     "2. Symbol": "MSFT",
//     "3. Last Refreshed": "2019-06-28",
//     "4. Time Zone": "US/Eastern"
//     },
//     "Monthly Adjusted Time Series": {
//     "2019-06-28": {
//     "1. open": "123.8500",
//     "2. high": "138.4000",
//     "3. low": "119.0100",
//     "4. close": "133.9600",
//     "5. adjusted close": "133.9600",
//     "6. volume": "508298497",
//     "7. dividend amount": "0.0000"
//     },






//Sample Response for GLOBAL_QUOTE API Call 
// {
//     "Global Quote": {
//         "01. symbol": "MSFT",
//         "02. open": "134.5700",
//         "03. high": "134.6000",
//         "04. low": "133.1600",
//         "05. price": "133.9600",
//         "06. volume": "30042969",
//         "07. latest trading day": "2019-06-28",
//         "08. previous close": "134.1500",
//         "09. change": "-0.1900",
//         "10. change percent": "-0.1416%"
//     }
// }

for (let i = 0; i < stockNames.length; i++) {
    // getStockDataGlobalQuote(stockNames[i]);
    getStockDataMonthly(stockNames[i]);
}

// console.log(stockData);
console.log(stockDataMonthly);

});
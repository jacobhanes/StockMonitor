$(document).ready(function (eventObj) {
    console.log(eventObj);

    let baseUrl = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&interval=5min&outputsize=full";
    let stockSymbolName = "&symbol="
    let stockNames = ["AAPL", "MSFT", "AXP"];
    let stockApiKey = "&apikey=9C5L7VDS9B25DUYZ";
    let stockData = [];

    function getMonthEndDates() {
        let currentYear = moment().format("YYYY");
        let currMonth = moment().format("MM");
        let currDayName = moment().format("dddd");
        let currDayNumber = moment().format("DD");
        let prevDates = [];

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

        for (let i = 0; i < 12; i++) {
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
        let baseUrlGlobal = "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&interval=5min&outputsize=full";
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
        getStockData(stockNames[i]);
        getStockDataGlobalQuote(stockNames[i]);
    }

    console.log(stockData);

});

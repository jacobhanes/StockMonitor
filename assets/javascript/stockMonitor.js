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

let baseUrl = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&interval=5min&outputsize=full";
let baseUrlGlobal = "https://www.alphavantage.co/query?function=GLOBAL_QUOTE";
let stockSymbolName = "&symbol="
let stockApiKey = "&apikey=";
let stockData = [];
let stockDataMonthly = [];
let prevDates = [];
let stockObj = {};
let stocksObjValues = [];
let stocksObjKeys = [];
let userObj = {};
let stockUpdateObj = {};
let stockRef = firebase.database();
let creatKeysList = [];
let creatKeysListFlat = [];
let createKeys = ["VT479283HRD9511X", "9C5L7VDS9B25DUYZ", "FJPWPV1DDCA9J3QK", "YXIQMDMCNYDARZH7"];
let countApiCall = 1;

function createKeysListfn() {
    // The fill() method fills (modifies) all the elements of an array from a start index (default zero) to an end 
    // index (default array length) with a static value. It returns the modified array.
    for (let i = 0; i < createKeys.length; i++) {
        const temp = new Array(4);
        temp.fill(createKeys[i]);
        creatKeysList.push(temp);
    }
    //The flat() method creates a new array with all sub-array elements concatenated into it recursively up to the specified depth.
    //The depth level specifying how deep a nested array structure should be flattened. Defaults to 1.
    //The flat method removes empty slots in arrays
    creatKeysListFlat = creatKeysList.flat(Infinity);
    console.log(creatKeysListFlat);
}

function clearElements() {
    //Clearing the Input Field values
    $("#stockId").val("");
    $("#stockPrice").val("");
    $("#stockQuantity").val("");
    $("#stockPurchase").val("");
}

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
}

function stockDoughnut() {
    console.log(stocksObjValues);
    let stockNames = [];
    let stockNamesData = [];

    for (let i = 0; i < stocksObjValues.length; i++) {
        stockNames.push(stocksObjValues[i].stockId);
        stockNamesData.push(stocksObjValues[i].totalValue);
    }
    console.log(stockNames, stockNamesData);
    var ctx = document.getElementById('allPie').getContext('2d');
    var allPie = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: stockNames,
            datasets: [{
                label: "All",
                data: stockNamesData,
                backgroundColor: [
                    'rgba(255, 99, 132, .5)',
                    'rgba(54, 162, 235, .5)',
                    'rgba(255, 206, 86, .5)',
                    'rgba(0, 255, 0, .5)',
                    'rgba(127, 0, 255, .5)',
                    'rgba(255, 255, 0, .5)',
                    'rgba(255, 0, 127, .5)',
                    'rgba(0, 255, 255, .5)',
                    'rgba(255, 128, 0, .5)',
                    'rgba(0, 0, 255, .5)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(0, 255, 0, 1)',
                    'rgba(127, 0, 255, 1)',
                    'rgba(255, 255, 0, 1)',
                    'rgba(255, 0, 127, 1)',
                    'rgba(0, 255, 255, 1)',
                    'rgba(255, 128, 0, 1)',
                    'rgba(0, 0, 255, 1)',
                ]
            }],
        }

    });

}

function getStockDataGlobalQuote(stockElementKey, stockElement, codeVal) {
    $.ajax({
        url: baseUrlGlobal + stockSymbolName + stockElement.stockId + stockApiKey + creatKeysListFlat[countApiCall],
        method: "GET"
    }).then(function (resObj) {

        stockRef.ref("/countApiCall").on("value", function (snapValueObj) {
            if (snapValueObj.val()) {
                countApiCall = snapValueObj.val().countApiCalls;
                console.log("countApiCall value Before : " + countApiCall);
            }
            else {
                console.log(countApiCall);
            }
        });
        countApiCall++;
        if (countApiCall >= 14) {
            countApiCall = 0;
        }
        stockRef.ref("/countApiCall").set({ "countApiCalls": countApiCall })

        if (codeVal == "Add") {
            console.log(baseUrlGlobal + stockSymbolName + stockElement.stockId + stockApiKey + creatKeysListFlat[countApiCall]);
            stockElement.price = Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(resObj["Global Quote"]["05. price"]);
            stockElement.totalValue = stockElement.stockQuantity * resObj["Global Quote"]["05. price"];
            console.log("Inside the Add");
            console.log(stockElement);
            stocksObjValues.push(stockElement);
            stocksObjKeys.push(stockElementKey);
            stockData.push({
                symbol: resObj["Global Quote"]["01. symbol"],
                price: resObj["Global Quote"]["05. price"],
                "latest trading day": resObj["Global Quote"]["07. latest trading day"],
                "previous close": resObj["Global Quote"]["08. previous close"]
            })
            tbRow = $("<tr>").attr({ 'id': stockElementKey }).append($("<td>").text(stockElement.stockId),
                $("<td>").text(Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stockElement.stockPrice)),
                $("<td>").text(stockElement.stockQuantity),
                $("<td>").text(moment.unix(stockElement.stockPurchase).format("MM/DD/YYYY")),
                $("<td>").text(Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(resObj["Global Quote"]["05. price"])),
                $("<td>").text(Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stockElement.stockQuantity * resObj["Global Quote"]["05. price"]))
                    .append($("<button>").attr({ 'id': stockElementKey, class: "deleteBtn" }).css({ float: "right" }).text("X")));
            $("#stockTable > tbody").append(tbRow);
            stockDoughnut();
        }
        else {
            const snapChangedObjIndex = stocksObjKeys.indexOf(stockElementKey);
            stockElement.price = Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(resObj["Global Quote"]["05. price"]);
            stockElement.totalValue = stockElement.stockQuantity * resObj["Global Quote"]["05. price"];
            console.log("Inside the Update");
            console.log(stockElement);
            console.log(snapChangedObjIndex);
            //Remove 1 element from index and insert new element..it is like element replace
            stocksObjValues.splice(snapChangedObjIndex, 1, stockElement);
            tbRow = $("<tr>").attr({ 'id': stockElementKey }).append($("<td>").text(stockElement.stockId),
                $("<td>").text(Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stockElement.stockPrice)),
                $("<td>").text(stockElement.stockQuantity),
                $("<td>").text(moment.unix(stockElement.stockPurchase).format("MM/DD/YYYY")),
                $("<td>").text(Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(resObj["Global Quote"]["05. price"])),
                $("<td>").text(Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stockElement.stockQuantity * resObj["Global Quote"]["05. price"]))
                    .append($("<button>").attr({ 'id': stockElementKey, class: "deleteBtn" }).css({ float: "right" }).text("X")));
            //replace the content of above row html to the exisitng tr row
            const tRow2 = $("#" + stockElementKey);
            tRow2.html($(tbRow).html());
            stockDoughnut();
        }
        console.log(stocksObjKeys, stocksObjValues);
    });

}


//firebase methods starts here 

stockRef.ref("/countApiCall").once("value", function (snapReadonceObj) {
    if (snapReadonceObj.val()) {
        countApiCall = snapReadonceObj.val().countApiCalls;
        console.log("countApiCall value Before : " + countApiCall);
    }
    else {
        console.log(countApiCall);
    }
});

stockRef.ref("/stocks").on('child_removed', function (snapChildRemovedObj) {
    const snapRemovedObjIndex = stocksObjKeys.indexOf(snapChildRemovedObj.key);
    //The splice() method changes the contents of an array by removing or replacing existing elements and/or adding new elements
    //Remove 1 element from an index 
    stocksObjKeys.splice(snapRemovedObjIndex, 1);
    stocksObjValues.splice(snapRemovedObjIndex, 1);
    //Remove the element from DOM
    console.log("Inside Delete");
    console.log(snapRemovedObjIndex);
    console.log(stocksObjKeys, stocksObjValues);
    $("tr").remove("#" + snapChildRemovedObj.key);
});

stockRef.ref('/stocks').on('child_added', function (snapChildAddedObj, prevChildKeyObj) {
    //call api function for the stock from fire base 
    getStockDataGlobalQuote(snapChildAddedObj.key, snapChildAddedObj.val(), 'Add');
});

stockRef.ref('/stocks').on('child_changed', function (snapChangedObj) {
    //call api function for the stock from fire base 
    getStockDataGlobalQuote(snapChangedObj.key, snapChangedObj.val(), 'Update');

});


//firebase methods Ends here 

$(document).ready(function (eventObj) {

    $("#stockPurchase").attr({ max: moment().format("YYYY-MM-DD") });
    createKeysListfn();

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


    function getStockDataMonthly(stockElement, selectMonths) {
        let baseUrlMonthly = "https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY_ADJUSTED";
        $.ajax({
            url: baseUrlMonthly + stockSymbolName + stockElement + stockApiKey + creatKeysListFlat[countApiCall],
            method: "GET"
        }).then(function (resObj) {
            console.log(baseUrlMonthly + stockSymbolName + stockElement + stockApiKey + creatKeysListFlat[countApiCall]);
            console.log(resObj);
            const stockDataMonthlyChart = resObj["Monthly Adjusted Time Series"];
            console.log(stockDataMonthlyChart);
            const stockDataMonthlyChartKeysTemp = [];
            const stockDataMonthlyChartValuesTemp = [];
            let stockDataMonthlyChartKeys = Object.keys(stockDataMonthlyChart);
            let stockDataMonthlyChartValues = Object.values(stockDataMonthlyChart);
            for (let i = 0; i < selectMonths; i++) {
                stockDataMonthlyChartKeysTemp.push(stockDataMonthlyChartKeys[i]);
                stockDataMonthlyChartValuesTemp.push(stockDataMonthlyChartValues[i]["4. close"]);
            }
            console.log(stockDataMonthlyChartKeysTemp, stockDataMonthlyChartValuesTemp);
            for (let i = 0; i < prevDates.length; i++) {
                stockDataMonthly.push({
                    "symbol": resObj["Meta Data"]["2. Symbol"],
                    "Monthly avg price": resObj["Monthly Adjusted Time Series"][prevDates[i].month_end_date]["4. close"],
                    "Dividend amount": resObj["Monthly Adjusted Time Series"][prevDates[i].month_end_date]["7. dividend amount"],
                    "Month EndDate": prevDates[i].month_end_date
                })
            }

            var ctx = document.getElementById('allLine').getContext('2d');
            var chart = new Chart(ctx, {
                // The type of chart we want to create
                type: 'line',

                // The data for our dataset
                data: {
                    labels: stockDataMonthlyChartKeysTemp,
                    datasets: [{
                        label: stockElement,
                        backgroundColor: 'rgb(77, 166, 255)',
                        borderColor: 'rgb(255, 99, 132)',
                        data: stockDataMonthlyChartValuesTemp
                    }]
                },

                // Configuration options go here
                options: {}
            });



        });

    }

    $(document).on('click', ".deleteBtn", function (deleteBtnObj) {
        console.log(deleteBtnObj);
        stockRef.ref("/stocks").child($(this).attr('id')).remove();
    });


    $("#goBtn").click(function (eventgoObj) {
        console.log(eventgoObj);
        let updateMonths = $("#updateMonths").val();
        let UpdatestockId = $("#UpdatestockId").val();
        console.log(updateMonths, UpdatestockId);
        getStockDataMonthly(UpdatestockId, updateMonths);
        //clear elements 
        $("#updateMonths").val("");
        $("#UpdatestockId").val("");

    });

    // Update stock button starts here 
    $("#updateBtn").click(function (eventUpdateObj) {
        eventUpdateObj.preventDefault();
        let foundChild = false;
        let stockIdKey = "";
        stockUpdateObj = {};
        let validInputsUpdate = true;
        let stockRef = firebase.database();

        stockUpdateObj.stockId = $("#stockId").val().trim().toUpperCase();

        if (stockUpdateObj.stockId == "") {
            validInputsUpdate = false;
            $("#stockId").focus();
        }
        else if (stockUpdateObj.stockId != "") {
            validInputsUpdate = true;
            console.log(validInputsUpdate);
        }

        $("form :input").each(function (index, element) {
            // console.log("index: " + index, element, "attribute:" + $(this).attr('id'), "Value: " + $(this).val().trim());
            if ($(this).val().trim() != "") {
                //Select element by ID
                const element = $(this).attr('id');
                stockUpdateObj[element] = $(this).val().trim();

            }
        });

        // Validate if the stockPurchase has a value 
        if (stockUpdateObj.stockPurchase) {
            console.log("inside the  stockPurchase date update ");
            stockUpdateObj.stockPurchase = moment($("#stockPurchase").val(), "YYYY-MM-DD").format("X");
        }
        if (stockUpdateObj.stockId) {
            stockUpdateObj.stockId = stockUpdateObj.stockId.toUpperCase();
        }

        console.log(stockUpdateObj);

        if (validInputsUpdate) {
            stockRef.ref("/stocks").once('value')
                .then(function (snapReadonceObj) {
                    snapReadonceObj.forEach(function (childSnapObj) {
                        let stockUpdateObjlocal = {};
                        stockUpdateObjlocal = childSnapObj.val();
                        if (stockUpdateObjlocal.stockId == $("#stockId").val().trim().toUpperCase()) {
                            foundChild = true;
                            stockIdKey = childSnapObj.key;
                            console.log(foundChild, stockIdKey);
                        }
                    });

                    if (foundChild) {
                        if (Object.keys(stockUpdateObj).length == 1) {
                            alert("Update atleast one input element fields");
                        }
                        else {
                            //Firebase method to update the child object 
                            stockRef.ref("/stocks").child(stockIdKey).update(stockUpdateObj);
                            //call clearElements() method to clear the DOM 
                            clearElements();
                        }
                    }
                    else {
                        alert("Enter valid stockId to Update!!");
                    }
                });
        }

    });

    // Update stock button Ends here 

    // Addd stock button Starts here 
    $("#addBtn").click(function (eventAddObj) {
        console.log(eventAddObj);
        eventAddObj.preventDefault();
        validInputsAdd = true;

        $("form :input").each(function (index, element) {
            //  console.log("index: " + index,element,"attribute:" + $(this).attr('id'),"Value: " + $(this).val().trim());
            if ($(this).val().trim() == "") {
                //Select element by ID
                $("#" + $(this).attr('id')).focus();
                validInputsAdd = false;
                return validInputsAdd;
            }
        });

        stockObj.stockId = $("#stockId").val().trim().toUpperCase();
        stockObj.stockQuantity = $("#stockQuantity").val();
        stockObj.stockPrice = $("#stockPrice").val();
        stockObj.stockPurchase = moment($("#stockPurchase").val(), "YYYY-MM-DD").format("X");

        if (validInputsAdd) {
            stockRef = firebase.database();
            console.log(stockObj);
            stockRef.ref('/stocks').push(stockObj);
            //call clearElements() method to clear the DOM 
            clearElements();
        }

    });
    // Addd stock button Ends here 



    function getNews(Response) {
        //ajax call to current api to grab news and links
        const name = $("#searchBar").val();
        const newsURL =
            "https://newsapi.org/v2/top-headlines?country=us&q=" + name + "&category=business&category=technology&pageSize=5&apiKey=2bc02802e5f74edfa7dc731b454fe6a3";

        $.ajax({
            url: newsURL,
            method: "GET"
        }).then(function (Response) {

            for (let i = 0; i < Response.articles.length; i++) {
                const article = Response.articles[i].title;
                const articleLink = Response.articles[i].url;

                console.log(Response.articles[i]);
                console.log(articleLink);

                console.log(Response);

                $(".artList").append(`<li>${article} <a href="${articleLink}">${articleLink}</a></li>`);

            }

        })
    }

    $("#searchButton").on("click", function () {
        //this adds/ empty articles
        console.log("yay");
        $(".artList").empty();
        getNews();
    })


    function hideAbout() {
        $("#aboutInfo").hide();
    }
    hideAbout()
    $("#aboutButton").on("click", function () {
        $("#aboutInfo").toggle();
    })


});




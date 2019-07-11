
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
let stockNames = ["AXP", "AAPL", "MSFT"];
let stockApiKey = "&apikey=VT479283HRD9511X";
let stockData = [];
let stockDataMonthly = [];
let prevDates = [];
let stockObj = {};
let stocksObjValues=[];
let stocksObjKeys=[];
let userObj = {};
let stockUpdateObj={};
userObj.userName = "Sam";
userObj.email = "name@gmail.com";
userObj.user = 1;
let stockRef = firebase.database();


function clearElements(){
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
    console.log(prevDates);
}





function getStockDataGlobalQuote(stockElementKey, stockElement,codeVal) {  
    $.ajax({
        url: baseUrlGlobal + stockSymbolName + stockElement.stockId + stockApiKey,
        method: "GET"
    }).then(function (resObj) {
        console.log(baseUrlGlobal + stockSymbolName + stockElement.stockId + stockApiKey);
        stockData.push({
            symbol: resObj["Global Quote"]["01. symbol"],
            price: resObj["Global Quote"]["05. price"],
            "latest trading day": resObj["Global Quote"]["07. latest trading day"],
            "previous close": resObj["Global Quote"]["08. previous close"]
        })
        
       if(codeVal=="Add"){
        tbRow = $("<tr>").attr({'id': stockElementKey}).append($("<td>").text(stockElement.stockId),
        $("<td>").text(Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stockElement.stockPrice)),
        $("<td>").text(stockElement.stockQuantity),
        $("<td>").text(moment.unix(stockElement.stockPurchase).format("MM/DD/YYYY")),
        $("<td>").text(Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(resObj["Global Quote"]["05. price"])),
        $("<td>").text(Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stockElement.stockQuantity*resObj["Global Quote"]["05. price"]))
        .append($("<button>").attr({'id': stockElementKey,class:"deleteBtn"}).css({float:"right"}).text("X")));  
         $("#stockTable > tbody").append(tbRow);
        console.log(stockData);
        stockDoughnut();
       }
       else
       {
        tbRow = $("<tr>").attr({'id': stockElementKey}).append($("<td>").text(stockElement.stockId),
        $("<td>").text(Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stockElement.stockPrice)),
        $("<td>").text(stockElement.stockQuantity),
        $("<td>").text(moment.unix(stockElement.stockPurchase).format("MM/DD/YYYY")),
        $("<td>").text(Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(resObj["Global Quote"]["05. price"])),
        $("<td>").text(Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stockElement.stockQuantity*resObj["Global Quote"]["05. price"]))
        .append($("<button>").attr({'id': stockElementKey,class:"deleteBtn"}).css({float:"right"}).text("X")));  
        //replace the content of above row html to the exisitng tr row
        const tRow2 = $("#" + stockElementKey);
        tRow2.html($(tbRow).html());
       }
    });

}


//firebase methods starts here 
stockRef.ref("/stocks").on('child_removed',function(snapChildRemovedObj){
    console.log(snapChildRemovedObj.key);
    console.log(snapChildRemovedObj.val());
    const snapRemovedObjIndex = stocksObjKeys.indexOf(snapChildRemovedObj.key);
        //The splice() method changes the contents of an array by removing or replacing existing elements and/or adding new elements
        //Remove 1 element from an index 
        stocksObjKeys.splice(snapRemovedObjIndex, 1);
        stocksObjValues.splice(snapRemovedObjIndex, 1);
      //Remove the element from DOM
      console.log(stocksObjKeys,stocksObjValues);
  $("tr").remove("#"+snapChildRemovedObj.key);
});

stockRef.ref('/stocks').on('child_added', function (snapChildAddedObj, prevChildKeyObj) {
    console.log(snapChildAddedObj.key);
    console.log(snapChildAddedObj.val());
    console.log(prevChildKeyObj);
    
    stocksObjValues.push(snapChildAddedObj.val());
    stocksObjKeys.push(snapChildAddedObj.key);
   console.log(stocksObjKeys,stocksObjValues);
   //call api function for the stock from fire base 
   getStockDataGlobalQuote(snapChildAddedObj.key,snapChildAddedObj.val(),'Add');
});

stockRef.ref('/stocks').on('child_changed',function(snapChangedObj){

    let snapChangedValueObj = {};
    let snapChangedKeyObj={};
    snapChangedValueObj = snapChangedObj.val();
    snapChangedKeyObj=snapChangedObj.key;

    const snapChangedObjIndex = stocksObjKeys.indexOf(snapChangedKeyObj);
    console.log("Inside the child_changed function Start");
    console.log(snapChangedKeyObj);
    console.log(snapChangedValueObj);
    console.log(stockUpdateObj);
    //Remove 1 element from index and insert new element..it is like element replace
    stocksObjValues.splice(snapChangedObjIndex,1,snapChangedValueObj);
    console.log(stocksObjValues);
     //call api function for the stock from fire base 
   getStockDataGlobalQuote(snapChangedKeyObj,snapChangedValueObj,'Update');

});


//firebase methods Ends here 

$(document).ready(function (eventObj) {

    $("#stockPurchase").attr({max:moment().format("YYYY-MM-DD")});

    getMonthEndDates();

    function stockDoughnut(){
        console.log(stocksObjValues) ;
          console.log(stockData);
           let stockNames=[];
           let stockTotalValues=[];
       
           for(let i=0;i<stocksObjValues.length;i++){
               console.log(stocksObjValues.length);
               console.log(stocksObjValues[i].stockId);
               console.log(stocksObjValues[i].stockPrice);
               console.log(stocksObjValues[i].stockQuantity);
               console.log("Inside for loop" + i);
             stockNames.push(stocksObjValues[i].stockId);
            for(let j=0;j<stockData.length;j++){
                console.log("Insider loop 2");
                console.log(stockData[j]);
                if(stockData[j].symbol==stocksObjValues[i].stockId.toUpperCase()){
                    console.log("found");
                    stockTotalValues.push(Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stocksObjValues[i].stockQuantity*stockData[j].price));
                }
            }   
             console.log(stockNames,stockTotalValues);
           }
       
           var ctx = document.getElementById('allPie').getContext('2d');
       var allPie = new Chart(ctx, {
           type: 'doughnut',
           data: {
               labels: stockNames,
               datasets: [{
                   label: "All",
                   data: stockTotalValues,
                   backgroundColor: [
                       'rgba(255, 99, 132, 0.2)',
                       'rgba(54, 162, 235, 0.2)',
                       'rgba(255, 206, 86, 0.2)',
                       'rgba(255, 99, 132, 0.2)',
                       'rgba(54, 162, 235, 0.2)',
                       'rgba(255, 206, 86, 0.2)',
                       'rgba(255, 99, 132, 0.2)',
                       'rgba(54, 162, 235, 0.2)',
                       'rgba(255, 206, 86, 0.2)',
                       'rgba(255, 99, 132, 0.2)',
                   ],
               }],
           }
           // options: options
       });
         }

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
   
    $(document).on('click',".deleteBtn",function(deleteBtnObj){
        console.log(deleteBtnObj);
        stockRef.ref("/stocks").child($(this).attr('id')).remove();
    });

// Update stock button starts here 
$("#updateBtn").click(function(eventUpdateObj){
    eventUpdateObj.preventDefault();
     let foundChild=false;
     let stockIdKey="";
     stockUpdateObj={};
     let validInputsUpdate=true;
     let  stockRef = firebase.database();

     stockUpdateObj.stockId = $("#stockId").val().trim();

    if (stockUpdateObj.stockId == "") {
        validInputsUpdate = false;
        $("#stockId").focus();
    }
    else if (stockUpdateObj.stockId != "") {
        validInputsUpdate = true;
        console.log(validInputsUpdate);
    }

    console.log(stockUpdateObj);

    $("form :input").each(function (index, element) {
        // console.log("index: " + index, element, "attribute:" + $(this).attr('id'), "Value: " + $(this).val().trim());
        if ($(this).val().trim() != "") {
            //Select element by ID
            const element = $(this).attr('id');
            stockUpdateObj[element] = $(this).val().trim();

        }
    });

    if(stockUpdateObj.stockPurchase){
        console.log("inside the  stockPurchase date update ");
        stockUpdateObj.stockPurchase = moment($("#stockPurchase").val(),"YYYY-MM-DD").format("X");
    }
    
    console.log(stockUpdateObj);

    if (validInputsUpdate) {
        stockRef.ref("/stocks").once('value')
            .then(function (snapReadonceObj) {
                snapReadonceObj.forEach(function (childSnapObj) {
                    let stockUpdateObjlocal = {};
                    stockUpdateObjlocal = childSnapObj.val();
                    if (stockUpdateObjlocal.stockId == $("#stockId").val().trim()) {
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

    $("#addBtn").click(function (eventAddObj) {
        console.log(eventAddObj);
        eventAddObj.preventDefault();
        validInputsAdd=true;

        $("form :input").each(function (index, element) {
            //  console.log("index: " + index,element,"attribute:" + $(this).attr('id'),"Value: " + $(this).val().trim());
            if ($(this).val().trim() == "") {
                //Select element by ID
                $("#" + $(this).attr('id')).focus();
                validInputsAdd = false;
                return validInputsAdd;
            }
        });

        stockObj.stockId = $("#stockId").val().trim();
        stockObj.stockQuantity = $("#stockQuantity").val();
        stockObj.stockPrice = $("#stockPrice").val();
        console.log($("#stockPurchase").val());
        stockObj.stockPurchase = moment($("#stockPurchase").val(),"YYYY-MM-DD").format("X");

        if(validInputsAdd){
            stockRef = firebase.database();
            console.log(stockObj);
            stockRef.ref('/stocks').push(stockObj);
             //call clearElements() method to clear the DOM 
             clearElements();
        }

    });




function getNews (Response){
    //ajax call to current api to grab news and links
    const name = $("#searchBar").val();
    const newsURL = 
    "https://newsapi.org/v2/top-headlines?country=us&q=" + name + "&category=business&category=technology&pageSize=5&apiKey=2bc02802e5f74edfa7dc731b454fe6a3";

    $.ajax({
        url: newsURL,
        method: "GET"
    }).then(function(Response){

    for(let i = 0; i < Response.articles.length; i++){
        const article = Response.articles[i].title;
        const articleLink = Response.articles[i].url;
        
        console.log(Response.articles[i]);
        console.log(articleLink);
        
        console.log(Response);
        
        $(".artList").append(`<li>${article} <a href="${articleLink}">${articleLink}</a></li>`);
        
    }  
        
    })
}
             
$("#searchButton").on("click", function(){
    //this adds/ empty articles
    console.log("yay");
    $(".artList").empty();
    getNews();
})





function hideAbout(){
    $("#aboutInfo").hide();
}    
hideAbout()
$("#aboutButton").on("click",function(){
    $("#aboutInfo").toggle();
   
    
})

function hideCharts (){
  $("#topThree").hide();
  $("#topFive").hide()  
  $("#topTen").hide()  
  $("#allPie").hide()  
}
hideCharts();
//showing charts
$("select.selectpicker").change(function(){
    const selectedMonth = $(this).children("option:selected").val();
    // const selectedStock = $(".stockId").val();

    console.log(selectedMonth)
    if (selectedMonth === "0"){
        hideCharts();
    }
    if (selectedMonth === "3"){
        
        $("#topThree").show();
        $("#topFive").hide();
        $("#topTen").hide();
        $("#allPie").hide();
    };
    if (selectedMonth === "5"){

        $("#topFive").show();
        $("#topThree").hide();
        $("#topTen").hide();
        $("#allPie").hide();
    };
    if (selectedMonth === "10"){ 
        $("#topTen").show();
        $("#topFive").hide();
        $("#topThree").hide();
        $("#allPie").hide();
    };    
    if (selectedMonth === ""){
        $("#allPie").show();
        $("#topFive").hide();
        $("#topTen").hide();
        $("#topThree").hide();
    };
});



var ctx = document.getElementById('topThree').getContext('2d');
var topThree = new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: stockNames,
        datasets: [{
            label: "Top Three",
            data: [10, 5, 7],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)'
            ],
        }],
    }
    // options: options
});




var ctx = document.getElementById('topFive').getContext('2d');
var topFive = new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: stockNames,
        datasets: [{
            label: "Top Five",
            data: [10, 5, 7, 10, 12],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
            ],
        }],
    }
    // options: options
});

var ctx = document.getElementById('topTen').getContext('2d');
var topTen = new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: stockNames,
        datasets: [{
            label: "Top Ten",
            data: [10, 5, 7, 10, 12, 1, 15, 17, 12, 1],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(255, 99, 132, 0.2)',
            ],
        }],
    }
    // options: options
});




var ctx = document.getElementById('allPie').getContext('2d');
var allPie = new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: stockNames,
        datasets: [{
            label: "All",
            data: [10, 5, 7, 10, 12, 1, 15, 17, 12, 1],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(255, 99, 132, 0.2)',
            ],
        }],
    }
    // options: options
});


var empty = true;
$('input[type="text"]').each(function(){
   if($(this).val()!=""){
       empty = false;
      
      return false;
    }
 });


});

        


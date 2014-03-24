$(".ui-loader").hide();
$(document).ready(function() {
    $(".ui-loader").hide();
    // are we running in native app or in a browser?
    window.isphone = false;
    if(document.URL.indexOf("http://") === -1 
        && document.URL.indexOf("https://") === -1) {
        window.isphone = true;
    }

    if(document.URL="file:///C:/Users/Joe/Dropbox/GIt%20Hub/barcodedemo/index.html") {
        window.isphone = false;
        console.log ('testing locally');
    }

    if( window.isphone ) {
        console.log ('phone');
        document.addEventListener("deviceready", onDeviceReady, false);
    } else {
        console.log('not phone');
        onDeviceReady();
        $(".ui-loader").hide();
    }
});
$( document ).ajaxError(function() {
  $( "#info" ).append( "Triggered ajaxError handler." );
});
/*
Seeing if I can remove jQuery mobile because its a pain in my ass
$(document).bind("mobileinit", function(){
    console.log('mobileinit function');
    $(".ui-loader").hide();
    // - didnt work - $.mobile.loadingMessage = 'potato';
    $.mobile.allowCrossDomainPages = true;
    $.support.cors = true;
});
*/
$('.order').click(function(){
    orderID = this.id;
    itemID = $('#item').val();
    var db = window.openDatabase("Database", "1.0", "The Database", 200000);
    db.transaction(populateDb, errorCB, successCB);        
});

$('#new-Order').click(function(){
    $('#createNewOrder-Form').show();
});
$('#createNewOrder').click(function(){
    orderName = $('#orderName').value();
    if (orderName != ""
        && window.isphone)
    {  
        var db = window.openDatabase("Database", "1.0", "The Database", 200000);
        db.transaction(function(){
        tx.executeSql('create table if not exists orders (Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, name, isSubmitted, date)');
        tx.executeSql('insert into orders(name) values ('+orderName+')');
        },
        errorCB, 
        successCB);
    }
});

function onDeviceReady() {
    if( window.isphone ) {
    var db = window.openDatabase("Database", "1.0", "The Database", 200000);
    db.transaction(getOrders, errorCB, successCB);
    }
    
    $(".ui-loader").hide();
    // do everything here.
    console.log('deviceready');
    $('#deviceready .listening').hide();
    $('#deviceready .received').show();

    $('#scan').click(function(){
        var scanner = cordova.require("cordova/plugin/BarcodeScanner");
        scanner.scan( function (result) { 

            alert("We got a barcode\n" + 
            "Result: " + result.text + "\n" + 
            "Format: " + result.format + "\n" + 
            "Cancelled: " + result.cancelled);  

           console.log("Scanner result: \n" +
                "text: " + result.text + "\n" +
                "format: " + result.format + "\n" +
                "cancelled: " + result.cancelled + "\n");
            console.log(result);
            /*$( "#info" ).append( result.text + "\n");*/
            /* The scan data doesn't need to be sent to a php script
            *  The scan data will be the bercor number
            $.mobile.allowCrossDomainPages = true;
            $.support.cors = true;
            */
            $.ajax({
                url: "http://50.204.18.115/apps/BarcodeDemo2/php/test.php",
                data: "qs=" + result.text,
                crossDomain: true,
                statusCode: {
                    404: function() {
                    alert( "page not found" );
                    }} 
                })
                .done(function( returnData ) {
                    console.log(returnData);
                    $( "#info" ).append( returnData );
                });

        }, function (error) { 
            console.log("Scanning failed: ", error); 
        } );
    });
}

function getOrders(tx) {
        tx.executeSql('SELECT Id, name FROM orders WHERE isSubmitted = 0', [], getOrdersSuccess, errorCB);
    }

    // Query the success callback
    //
function getOrdersSuccess(tx, results) {
        var len = results.rows.length;
        console.log("Orders table: " + len + " rows found.");
        for (var i=0; i<len; i++){
            console.log("Row = " + i + " ID = " + results.rows.item(i).id + " Name =  " + results.rows.item(i).name);
            $('.dropdown-menu').prepend('<li><a href="#" id="'+results.rows.item(i).id+'">'+results.rows.item(i).name+'</a></li>');
        }
    }
function populateDB(tx) {
            tx.executeSql('create table if not exists order_item (order_Id, item_Id)');
            tx.executeSql('insert into order_item (order_Id, item_Id) values ('+orderID+','+itemID+')');
        }

function errorCB(err) {
            alert("Error processing SQL: "+err.code);
        }

function successCB() {
            alert("success!");
        }    

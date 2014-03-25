$(document).ready(function() {
    // are we running in native app or in a browser?
    window.isphone = false;
    if(document.URL.indexOf("http://") === -1 
        && document.URL.indexOf("https://") === -1) {
        window.isphone = true;
    }

    if( window.isphone ) {
        $('#log').append('<p>phone</p>');
        document.addEventListener("deviceready", onDeviceReady, false);
    } else {
        $('#log').append('<p>not phone</p>');
        onDeviceReady();
    }
});
$( document ).ajaxError(function() {
  $( "#log" ).append( "Triggered ajaxError handler." );
});
/*
Seeing if I can remove jQuery mobile because its a pain in my ass
$(document).bind("mobileinit", function(){
    $('#log').append('mobileinit function');
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
        $('#createNewOrder-Form').hide();     
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
    $('#log').append("<p>var db = " + db + "</p>");
    db.transaction(getOrders, errorCB, successCB);
    }
    // do everything here.
    $('#deviceready .listening').hide();
    $('#deviceready .received').show();

    $('#scan').click(function(){
        var scanner = cordova.require("cordova/plugin/BarcodeScanner");
        scanner.scan( function (result) { 

            alert("We got a barcode\n" + 
            "Result: " + result.text + "\n" + 
            "Format: " + result.format + "\n" + 
            "Cancelled: " + result.cancelled);  

           $('#log').append("Scanner result: \n" +
                "text: " + result.text + "\n" +
                "format: " + result.format + "\n" +
                "cancelled: " + result.cancelled + "\n");
            $('#log').append(result);
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
                    $('#log').append("<p>"+returnData+"</p>");
                    $( "#info" ).append( returnData );
                });

        }, function (error) { 
            $('#log').append("<p>Scanning failed: " + error + "</p>"); 
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
        $('#log').append("<p>Orders table: " + len + " rows found.</p>");
        for (var i=0; i<len; i++){
            $('#log').append("<p>Row = " + i + " ID = " + results.rows.item(i).id + " Name =  " + results.rows.item(i).name + "</p>");
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

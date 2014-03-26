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
    var order = {name:$("#orderName").val()}; 
                    //body:$("#noteBody").val(),
                    //id:$("#noteId").val()
        //};
    if (order.name != ""
        && window.isphone)
    {  
        $('#createNewOrder-Form').hide();
        saveOrder(order,getOrders);
    }
});

function onDeviceReady() {
    if( window.isphone ) {
    var db = window.openDatabase("Database", "1.0", "The Database", 200000);
    db.transaction(setupTable, errorCB, getOrders);
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

function setupTable(tx){
    $('#log').append("<p>setupTable</p>");
        tx.executeSql('create table if not exists orders (Id INTEGER PRIMARY KEY, name, isSubmitted, date)');
}

function getOrders() {
        $('#log').append("<p>getOrders</p>");
        db.transaction(function(tx){
        tx.executeSql('SELECT Id, name FROM orders', [], getOrdersSuccess, errorCB);
        }, errorCB);
    }

function getOrdersSuccess(tx, results) {
        var len = results.rows.length;
        if (len == 0) {
            $('#log').append("<p>Orders table: " + len + " rows found.</p>");
        }else{
            $('#log').append("<p>Orders table: " + len + " rows found.</p>");
            $('.dropdown-menu').html('');
            for (var i=0; i<len; i++){
                $('#log').append("<p>Row = " + i + " ID = " + results.rows.item(i).Id + " Name =  " + results.rows.item(i).name + "</p>");
                $('.dropdown-menu').prepend('<li><a href="#" id="'+results.rows.item(i).Id+'">'+results.rows.item(i).name+'</a></li>');
            }
        }
    }
function saveOrder(order, cb) {
    $('#log').append("<p>saveOrder</p>");
        db.transaction(function(tx){
            tx.executeSql('insert into orders(name,isSubmitted, date) values(?,?,?)',[order.name,"0",new Date()]);
        },errorCB, cb);
    } 
function errorCB(err) {
            $('#log').append("<p>Error processing SQL: "+err.code+"</p>");
        }

function successCB() {
            $('#log').append("<p>success!</p>");
        }    

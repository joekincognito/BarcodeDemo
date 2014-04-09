var db;
var order={};
var item={};

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

$('.panel-heading').click(function(){
    $('#log').toggle();
});

$('#addToOrder').click(function(){
    $('#log').html('');
    $('#log').append('addToOrder Clicked<br>');
    //item = {bercor:$('#item').val()};
    item.bercor=$('#item').val();
        addToOrder(item);      
});

$('#clearDB').click(function(){
    db.transaction(clearDB, errorCB, getCurrentOrder);
});

function onDeviceReady() {
    $('#deviceready .listening').hide();
    $('#deviceready .received').show();
    $('#log').hide();
    if( window.isphone ) {
        db = window.openDatabase("Database", "1.0", "The Database", 200000);
        db.transaction(setupTables, errorCB, getCurrentOrder);
    }
}

function setupTables(tx){
    $('#log').append("<p>setupTable</p>");
    tx.executeSql('create table if not exists orders (Id INTEGER PRIMARY KEY, name, isSubmitted, date)');
    tx.executeSql('create table if not exists orderItems (orderID, bercor, desc, qty)');
}

function clearDB(tx){
    tx.executeSql('drop table if exists orders');
    tx.executeSql('drop table if exists orderItems');
}

function addToOrder(item) {
        $('#log').append("inside add to order function<br>");
        //need to decide how to figure out what the order number is
        //i guess there should only be 1 that is not submitted for now
        //while doing 1 order at a time, that will work
        $('#log').append("item.bercor ish " + item.bercor + " item.desc is " + item.desc + " order.Id is " + order.Id);
        
        db.transaction(function(tx){
            tx.executeSql('select * from orderItems where orderID = ? and bercor = ?',[order.Id,item.bercor],addToOrderResults,errorCB)
        },errorCB, null);//this was cb instead of null
} 

function addToOrderResults(tx,results){
    $('#log').append("<p>results rows length:"+results.rows.length+"</p>");
    db.transaction(function(tx){
        if (results.rows.length > 0){
            newQty = results.rows.item(0).qty + 1;
            $('#log').append("<p>newQty: " +newQty+"</p>");
                tx.executeSql('update orderItems set qty=? where orderID=? and bercor=?',[newQty, order.ID,item.bercor]);
            }
        else
            {
                tx.executeSql('insert into orderItems(orderID, bercor, desc, qty) values(?,?,?,?)',[order.Id,item.bercor,'"'+item.desc+'"',1]);
            }
    },errorCB, atoCB);
}  

function atoCB(){
    $('#info').html('item successfully added to the order in progress');
    $('#item').val('');
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
            for (var i=0; i<len; i++){
                $('#log').append("<p>Row = " + i + " ID = " + results.rows.item(i).Id + " Name =  " + results.rows.item(i).name + "</p>");
                $('.dropdown-menu').prepend('<li><a href="#" id="'+results.rows.item(i).Id+'">'+results.rows.item(i).name+'</a></li>');
            }
        }
}

function getCurrentOrder() {
        $('#log').append("<p>getCurrentOrder</p>");
        db.transaction(function(tx){
        tx.executeSql('SELECT Id FROM orders', [], getCurrentOrderSuccess, errorCB);
        }, errorCB);
}

function getCurrentOrderSuccess(tx, results) {
        var len = results.rows.length;
        $('#log').append("<p>Orders table: " + len + " rows found.</p>");
        if (len == 0) {
            $('#log').append("adding row");
            newOrder(getCurrentOrder);
        }else{
            $('#log').append("<p>Orders table: " + len + " rows found.</p>");
            for (var i=0; i<len; i++){
                $('#log').append("<p>Row = " + i + " ID = " + results.rows.item(i).Id + " Name =  " + results.rows.item(i).name + "</p>");
                order.Id=results.rows.item(i).Id;
            }
        }
}

function newOrder(cb){
    db.transaction(function(tx){
            tx.executeSql('insert into orders(name,isSubmitted, date) values(?,?,?)',["","0",new Date()]);
        },errorCB, cb);
}

function saveOrder(order, cb) {
    $('#log').append("<p>saveOrder</p>");
        db.transaction(function(tx){
            tx.executeSql('insert into orders(name,isSubmitted, date) values(?,?,?)',[order.name,"0",new Date()]);
        },errorCB, cb);
} 

function errorCB(err) {
            $('#log').append("<p>Error processing SQL: "+err.message+"</p>");
}

function successCB() {
            $('#log').append("<p>success!</p>");
}    

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
        if(!(result.text.toString().length===15)){
            alert("Scan Error or invalid barcode\n" +
             "Please Try Again!");
        }
        else 
        {
            ajax(result.text,null);
        }
    }, function (error) { 
        $('#log').append("<p>Scanning failed: " + error + "</p>"); 
    });
    
});

function ajax(number){ //number will be either scan data or bercor
        $.ajax({
            //url: "http://50.204.18.115/apps/BarcodeDemo/php/test.php",
            url: "http://10.1.1.1:10080/apps/BarcodeDemo/php/test.php",
            //data: "qs=" + result.text,
            data: "qs=" + number,
            statusCode: {
                404: function() {
                alert( "page not found" );
                }} 
            })
            .done(function( returnData ) {
                item = jQuery.parseJSON( returnData );
                $('#log').append("<p>"+item.bercor+"</p>");
                $('#info').html("");
                $( "#info" ).append( "<p>" + item.desc + "</p>" );
                $('#item').val( item.bercor);
            });    
}
var db;
var order = {};
var item = {};
var customer = {};
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
    item.qty=parseInt($('#qty').val());
    
    addToOrder(item);      
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
    tx.executeSql('create table if not exists customer (customerID)');
    //db.transaction(function(tx){
            tx.executeSql('select * from customer',[],function(tx,results){
                if(results.rows.length==0){window.location="customer.html";}
            },errorCB)
    //    },errorCB, null);
}

function addToOrder(item) {
        $('#log').append("inside add to order function<br>");
        //only doing 1 order at a time for now
        //In future version it will be expanded to have more than 1 order
        $('#log').append("item.qty " + item.qty + "item.bercor ish " + item.bercor + " item.desc is " + item.desc + " order.Id is " + order.Id);
        //check to see if the bercor already exists on the order
        db.transaction(function(tx){
            tx.executeSql('select * from orderItems where orderID = ? and bercor = ?',[order.Id,item.bercor],addToOrderResults,errorCB)
        },errorCB, null);//this was cb instead of null
} 

function addToOrderResults(tx,results){
    $('#log').append("<p>results rows length:"+results.rows.length+"</p>");
    db.transaction(function(tx){
        if (results.rows.length > 0){ 
            //if the bercor already exists on the order, add to the qty
            newQty = parseInt(results.rows.item(0).qty) + item.qty;
            $('#log').append("<p>newQty: " +newQty+"   orderID: "+order.Id+"  item.bercor: "+item.bercor+"</p>");
                tx.executeSql('update orderItems set qty=? where (orderID=? and bercor=?)',[parseInt(newQty), order.Id,item.bercor]);
            }
        else
            {
                //if the bercor does not exist on the order, add it to the order
                tx.executeSql('insert into orderItems(orderID, bercor, desc, qty) values(?,?,?,?)',[order.Id,item.bercor,'"'+item.desc+'"',item.qty]);
            }
    },errorCB, atoCB);
}  

function atoCB(){
    $('#info').html('item successfully added to the order in progress');
    $('#item').val('');
}

/* not using these functions right now
*  they will be for future version when more than 1 pending order is supported
function getOrders() {
        $('#log').append("<p>getOrders</p>");
        db.transaction(function(tx){
        tx.executeSql('SELECT Id, name FROM orders where isSubmitted = 0', [], getOrdersSuccess, errorCB);
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
*/

function getCurrentOrder() {
        $('#log').append("<p>getCurrentOrder</p>");
        db.transaction(function(tx){
        tx.executeSql('SELECT Id FROM orders where isSubmitted = 0', [], getCurrentOrderSuccess, errorCB);
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
            tx.executeSql('insert into orders(name,isSubmitted, date) values(?,?,?)',["",0,new Date()]);
        },errorCB, cb);
}

function saveOrder(order, cb) {
    $('#log').append("<p>saveOrder</p>");
        db.transaction(function(tx){
            tx.executeSql('insert into orders(name,isSubmitted, date) values(?,?,?)',[order.name,0,new Date()]);
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

       $('#log').append("Scanner result: \n" +
            "text: " + result.text + "\n" +
            "format: " + result.format + "\n" +
            "cancelled: " + result.cancelled + "\n");
        $('#log').append(result);

        if(!(result.text.toString().length===15)){
            navigator.notification.alert(
                "Scan Error or invalid barcode\n" +
             "Please Try Again!", //message
             null,  //callback
             'Scan Error', //title
             'OK'  //buttonname);
        }
        else 
        {
            ajax(result.text,null);
        }
    }, function (error) { 
        $('#log').append("<p>Scanning failed: " + error + "</p>"); 
    });
    
});

function ajax(number){ //number will be either scan data or bercor in future versions
        $.ajax({
            //url: "http://50.204.18.115/apps/BarcodeDemo/php/test.php", //real url - public
            url: "http://10.1.1.1:10080/apps/BarcodeDemo/php/test.php",  //testing url - local
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
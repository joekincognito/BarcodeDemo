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
        //$('#log').append ('<p>phone<p>');
        document.addEventListener("deviceready", onDeviceReady, false);
    } else {
        //$('#log').append('<p>not phone</p>');
        onDeviceReady();
    }
});

/*$('.panel-heading').click(function(){
    //$('#log').toggle();
});*/

function onDeviceReady() {
    //$('#log').hide();
    if( window.isphone ) {
        db = window.openDatabase("Database", "1.0", "The Database", 200000);
        db.transaction(setupTable, errorCB, getInventoryItems);
    }
}
function setupTable(tx){
    //$('#log').append("<p>setupTable</p>");
    tx.executeSql('create table if not exists inventory (bercor, onHand, min, max)');
    /*
    tx.executeSql('create table if not exists orders (Id INTEGER PRIMARY KEY, name, isSubmitted, date)');
    tx.executeSql('create table if not exists orderItems (orderID, bercor, desc, qty)');
    tx.executeSql('create table if not exists customer (customerID)');
    tx.executeSql('select * from customer', [], function(tx,results){
        if(results.rows.length>=1){order.custID = results.rows.item(0).customerID}
    },errorCB);
    */
}
function getInventoryItems() {
    //$('#log').append("<p>getInventory</p>");
    db.transaction(function(tx){
        tx.executeSql('SELECT * FROM inventory', [], getInventorySuccess, errorCB);
        //tx.executeSql('SELECT orders.Id, orders.name, orderItems.bercor, orderItems.desc, orderItems.qty FROM orders JOIN orderItems ON (orders.Id = orderItems.orderID) WHERE orderItems.qty >> 0', [], getOrdersSuccess, errorCB);
    }, errorCB);
}

function getInventorySuccess(tx, results) {
    //$('#log').append("<p>getInventorySuccess</p>");
        var len = results.rows.length;
        //$('#log').append("<p>Inventory table: " + len + " rows found.</p>");
        $('tbody').html('');
        for (var i=0; i<len; i++){
            ////$('#log').append("<p>itemDesc: "+itemDesc+" itemDesc.charAt(0): "+itemDesc.charAt(0)+" itemDesc.charAt(1): "+itemDesc.charAt(1)+"</p>");        
            $('tbody').append('<tr id='+results.rows.item(i).Id+'><td>'+results.rows.item(i).bercor+'</td><td>'+results.rows.item(i).onHand+'</td><td>'+results.rows.item(i).min+'</td><td>'+results.rows.item(i).max+'</td></tr>');
    }
}

function errorCB(err) {
    //$('#log').append("<p>Error processing SQL: "+err.message+"</p>");
}

function successCB() {
    //$('#log').append("<p>success!</p>");
} 


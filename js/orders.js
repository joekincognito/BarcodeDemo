$(document).ready(function() {
    // are we running in native app or in a browser?
    window.isphone = false;
    if(document.URL.indexOf("http://") === -1 
        && document.URL.indexOf("https://") === -1) {
        window.isphone = true;
    }

    if( window.isphone ) {
        $('#log').append ('<p>phone<p>');
        document.addEventListener("deviceready", onDeviceReady, false);
    } else {
        $('#log').append('<p>not phone</p>');
        onDeviceReady();
    }
});
var db;
function onDeviceReady() {
    if( window.isphone ) {
    db = window.openDatabase("Database", "1.0", "The Database", 200000);
    db.transaction(setupTable, errorCB, getOrders);
    }
}
function setupTable(tx){
    $('#log').append("<p>setupTable</p>");
    tx.executeSql('create table if not exists orders (Id INTEGER PRIMARY KEY, name, isSubmitted, date)');
    tx.executeSql('create table if not exists orderItems (orderID, bercor, qty)');
}
    function getOrders() {
            $('#log').append("<p>getOrders</p>");
            db.transaction(function(tx){
                tx.executeSql('SELECT Id, name, bercor, qty FROM orders NATURAL JOIN orderItems', [], getOrdersSuccess, errorCB);
            }, errorCB);
        }
        // Query the success callback
        //
    function getOrdersSuccess(tx, results) {
        $('#log').append("<p>getOrdersSuccess</p>");
            var len = results.rows.length;
            $('#log').append("<p>Orders table: " + len + " rows found.</p>");
            $('#current').html('');
            for (var i=0; i<len; i++){
                $('#log').append("<p>Row = " + i + " ID = " + results.rows.item(i).Id + " Name =  " + results.rows.item(i).name + " Bercor = " + results.rows.item(i).bercor + " Qty = " + results.rows.item(i).qty + "</p>");
                $('#current').append('<p>'+results.rows.item(i).Id+'---'+results.rows.item(i).name++ " Bercor = " + results.rows.item(i).bercor + " Qty = " + results.rows.item(i).qty + "</p>");
            }
        }
function errorCB(err) {
            $('#log').append("<p>Error processing SQL: "+err.code+"</p>");
        }

function successCB() {
            $('#log').append("<p>success!</p>");
        } 
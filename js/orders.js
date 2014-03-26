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
function onDeviceReady() {
    if( window.isphone ) {
    var db = window.openDatabase("Database", "1.0", "The Database", 200000);
    db.transaction(setupTable, errorCB, getOrders);
    }
}
function setupTable(tx){
        tx.executeSql('create table if not exists orders (Id INTEGER PRIMARY KEY, name, isSubmitted, date)');
}
function getOrders() {
        db.transaction(function(tx){
        tx.executeSql('SELECT Id, name FROM orders', [], getOrdersSuccess, errorCB);
        },errorCB);
    }
    // Query the success callback
    //
function getOrdersSuccess(tx, results) {
        var len = results.rows.length;
        $('#log').append("<p>Orders table: " + len + " rows found.</p>");
        $('.dropdown-menu').html('');
        for (var i=0; i<len; i++){
            $('#log').append("<p>Row = " + i + " ID = " + results.rows.item(i).Id + " Name =  " + results.rows.item(i).name + "</p>");
            $('#current').append('<p>'+results.rows.item(i).Id+'---'+results.rows.item(i).name+'</p>');
        }
    }
function populateDB(tx) {
            tx.executeSql('create table if not exists order_item (order_Id, item_Id)');
            tx.executeSql('insert into order_item (order_Id, item_Id) values ('+orderID+','+itemID+')');
        }

function errorCB(err) {
            $('#log').append("<p>Error processing SQL: "+err.code+"</p>");
        }

function successCB() {
            $('#log').append("<p>success!</p>");
        } 
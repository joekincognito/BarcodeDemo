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
    db.transaction(getOrders, errorCB, successCB);
    }
}
function getOrders(tx) {
        tx.executeSql('SELECT Id, name FROM orders', [], getOrdersSuccess, errorCB);
    }
    // Query the success callback
    //
function getOrdersSuccess(tx, results) {
        var len = results.rows.length;
        $('#log').append("<p>Orders table: " + len + " rows found.</p>");
        for (var i=0; i<len; i++){
            $('#log').append("<p>Row = " + i + " ID = " + results.rows.item(i).id + " Name =  " + results.rows.item(i).name + "</p>");
            $('#current').appepend('<li>'+results.rows.item(i).id+'---'+results.rows.item(i).name+'</li>');
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
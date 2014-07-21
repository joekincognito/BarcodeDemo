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
        $('#log').append ('<p>phone<p>');
        document.addEventListener("deviceready", onDeviceReady, false);
    } else {
        $('#log').append('<p>not phone</p>');
        onDeviceReady();
    }
});

$('.panel-heading').click(function(){
    $('#log').toggle();
});

function onDeviceReady() {
    $('#log').hide();
    if( window.isphone ) {
        db = window.openDatabase("Database", "1.0", "The Database", 200000);
        db.transaction(setupTable, errorCB, getOrders);
    }
}
function setupTable(tx){
    $('#log').append("<p>setupTable</p>");
    tx.executeSql('create table if not exists orders (Id INTEGER PRIMARY KEY, name, isSubmitted, date)');
    tx.executeSql('create table if not exists orderItems (orderID, bercor, desc, qty)');
}
function getOrders() {
    $('#log').append("<p>getInventory</p>");
    db.transaction(function(tx){
        tx.executeSql('SELECT * FROM orders inner join orderItems on Id = orderID', [], getOrdersSuccess, errorCB);
        //need a join here for orderItems
    }, errorCB);
}

function getOrdersSuccess(tx, results) {
    $('#log').append("<p>getInventorySuccess</p>");
        var len = results.rows.length;
        $('#log').append("<p>Order table: " + len + " rows found.</p>");
        
        var name = results.rows.item(0).name;
        $('#orderHistory').append('<table class="table table-bordered"><thead><tr><th>'+results.rows.item(0).date+'</th><th>Order Name</th><th>'+ name + '</th></tr></thead><tbody>');
        $('#orderHistory').append('<tr><td>QTY</td><td>Bercor</td><td>Desc</td></tr>');
        for (var i=0; i<len; i++){
            var result=results.rows.item(i);
            if (name == results.rows.item(i).name)
            {
                $('#orderHistory').append('<tr><td>'+results.rows.item(i).qty+'</td><td>'+results.rows.item(i).bercor+'</td><td>'+results.rows.item(i).desc+'</td></tr>');
                //$('#orderHistory').append('<span>'+ result.desc + '</span>');   
            }
            else
            {
                $('#orderHistory').append('</tbody></table>');
                var name = result.name;
                $('#orderHistory').append('<table class="table table-bordered"><thead><tr><th>'+results.rows.item(i).date+'</th><th>Order Name</th><th>'+ name + '</th></tr></thead><tbody>');
               $('#orderHistory').append('<tr><td>QTY</td><td>Bercor</td><td>Desc</td></tr>');
                 $('#orderHistory').append('<tr><td>'+results.rows.item(0).qty+'</td><td>'+results.rows.item(0).bercor+'</td><td>'+results.rows.item(0).desc+'</td></tr>');
                //$('#orderHistory').append('<p>'+ name + '</p>');        
            }
            //$('#orderHistory').append('<ul><li>'+ result.name + '</li></ul>');

            //order name
            //each order item  --< hidden...expand to reveal
            //$('tbody').append('<tr id='+results.rows.item(i).Id+'><td>'+results.rows.item(i).bercor+'</td><td>'+results.rows.item(i).onHand+'</td><td>'+results.rows.item(i).min+'</td><td>'+results.rows.item(i).max+'</td></tr>');
        }
        $('#orderHistory').append('</tbody></table>');
        $('body').append($('#orderHistory').html());
}

function errorCB(err) {
    $('#log').append("<p>Error processing SQL: "+err.message+"</p>");
}

function successCB() {
    $('#log').append("<p>success!</p>");
} 


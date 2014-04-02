var order = {};
var item = {};
var db;
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

$('#current tbody').on("change", "#itemQTY", function(){
    //add changed class to the tr if it doesnt already have it
    $('#log').append("<p>#itemQTY change function triggered</p>");
    if (!$(this).parent().parent().hasClass("changed")){
        $('#log').append("<p>addClass</p>");
        $(this).parent().parent().addClass("changed");
    }
});
$('#update').click(function(){
    //update records where the tr has the changed class
    $('#log').append("<p>Update Clicked</p>");
    $('.changed').each(function(){
        order.Id=$(this).attr('id');
        item.qty=$(this).children().children().filter('#itemQTY').val();
        item.bercor=$(this).children().filter('#bercor').text();
        $('#log').append("<p>item.qty= " + item.qty + " and order.Id = " + order.Id + "item.bercor = " + item.bercor + " </p>" );
        db.transaction(function(tx){
            tx.executeSql('update orderItems set qty=? where orderID=? and bercor=?',[item.qty,order.Id,item.bercor]);
        },errorCB,getOrders);
    }); 
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
            $('#log').append("<p>getOrders</p>");
            db.transaction(function(tx){
                tx.executeSql('SELECT Id, name, bercor, desc, qty FROM orders NATURAL JOIN orderItems', [], getOrdersSuccess, errorCB);
            }, errorCB);
        }
        // Query the success callback
        //
    function getOrdersSuccess(tx, results) {
        $('#log').append("<p>getOrdersSuccess</p>");
            var len = results.rows.length;
            $('#log').append("<p>Orders table: " + len + " rows found.</p>");
            $('#current tbody').html('');
            for (var i=0; i<len; i++){
                $('#log').append("<p>Row = " + i + " ID = " + results.rows.item(i).Id + " Name =  " + results.rows.item(i).name + " Bercor = " + results.rows.item(i).bercor + " Qty = " + results.rows.item(i).qty + " desc = " + results.rows.item(i).desc + "</p>");
                $('#current tbody').append('<tr id='+results.rows.item(i).Id+'><td><input id="itemQTY" class="input-group" name="quantity" type="number" min="1" max="200" style="color:black;" value="'+results.rows.item(i).qty+'""></td><td id="bercor">'+results.rows.item(i).bercor+ "</td><td>" + results.rows.item(i).desc + "</td></tr>");
            }
        }
function errorCB(err) {
            $('#log').append("<p>Error processing SQL: "+err.message+"</p>");
        }

function successCB() {
            $('#log').append("<p>success!</p>");
        } 
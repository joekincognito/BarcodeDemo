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

$('#current tbody').on("change", "#itemQTY", function(){
    //add changed class to the tr if it doesnt already have it
    $('#log').append("<p>#itemQTY change function triggered</p>");
    if (!$(this).parent().parent().hasClass("changed")){
        $('#log').append("<p>addClass</p>");
        $(this).parent().parent().addClass("changed");
    }
});
$('#po').change(function(){
    $('#log').append("<p>dat der order nambre hast bein change</p>");
    if (!$(this).hasClass("poChanged")){
        $(this).addClass("poChanged");
    }
});

$('#update').click(function(){
    //update records where the tr has the changed class
    $('#log').append("<p>Update Clicked</p>");
    if ($('#po').hasClass("poChanged")){
        order.name=$('#po').val();
        db.transaction(function(tx){
            tx.executeSql('update orders set name=? where Id=?',[order.name,order.Id]);    
        });
    }
    db.transaction(function(tx){
        $('.changed').each(function(){
            //Moved---order.Id=$(this).attr('id');
            item.qty=$(this).children().children().filter('#itemQTY').val();
            item.bercor=$(this).children().filter('#bercor').text();
            $('#log').append("<p>item.qty= " + item.qty + " and order.Id = " + order.Id + "item.bercor = " + item.bercor + " </p>" );
            //All three log correctly
                tx.executeSql('update orderItems set qty=? where (orderID=? and bercor=?)',[item.qty, order.Id,item.bercor],null,errorCB);
            //All three log success
        });
    },errorCB,successCB);
});

$('#placeOrder').click(function(){
    processOrder();
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
    tx.executeSql('create table if not exists customer (customerID)');
}
function getOrders() {
    $('#log').append("<p>getOrders</p>");
    db.transaction(function(tx){
        tx.executeSql('SELECT Id, name, bercor, desc, qty FROM orders NATURAL JOIN orderItems WHERE qty > 0', [], getOrdersSuccess, errorCB);
        //tx.executeSql('SELECT orders.Id, orders.name, orderItems.bercor, orderItems.desc, orderItems.qty FROM orders JOIN orderItems ON (orders.Id = orderItems.orderID) WHERE orderItems.qty >> 0', [], getOrdersSuccess, errorCB);
    }, errorCB);
}

function getOrdersSuccess(tx, results) {
    $('#log').append("<p>getOrdersSuccess</p>");
        var len = results.rows.length;
        $('#log').append("<p>Orders table: " + len + " rows found.</p>");
        $('#current tbody').html('');
        order.Id = results.rows.item(0).Id;
        order.name = results.rows.item(0).name;
        $('#po').val(order.name);
        for (var i=0; i<len; i++){
            $('#log').append("<p>Row = " + i + " ID = " + results.rows.item(i).Id + " Name =  " + results.rows.item(i).name + " Bercor = " + results.rows.item(i).bercor + " Qty = " + results.rows.item(i).qty + " desc = " + results.rows.item(i).desc + "</p>");
            $('#current tbody').append('<tr id='+results.rows.item(i).Id+'><td><input id="itemQTY" class="input-group" name="quantity" type="number" min="1" max="200" style="color:black;" value="'+results.rows.item(i).qty+'""></td><td id="bercor">'+results.rows.item(i).bercor+ "</td><td>" + results.rows.item(i).desc + "</td></tr>");
    }
}

function processOrder()
{
    db.transaction(function(tx){
        tx.executeSql('SELECT Id, name, bercor, desc, qty FROM orders NATURAL JOIN orderItems WHERE qty > 0', [], processOrderSuccess, errorCB);
    }, errorCB);    
}

function processOrderSuccess(tx, results) {
    //function processOrderSuccess() {---BROWSER TESTING
        var orderJSON = "";
        var itemsJSON = "";
        var len = results.rows.length;
        order.Id = results.rows.item(0).Id;
        order.name = results.rows.item(0).name;
        order.custID = '2501';
        orderJSON = '{';
        /* --------WAS FOR TESTING IN BROWSER
        orderJSON += '"ID":"1",';      
        orderJSON += '"name":"test order",';
        orderJSON += '"CustID":"2501",';
        */
        orderJSON += '"ID":"'+order.Id+'",';
        orderJSON += '"name":"'+order.name+'",';
        orderJSON += '"CustID":"'+order.custID+'",';

        /* --------WAS FOR TESTING IN BROWSER
        var items = [];
        console.log('wtf');        
        items[0] = new itemf('0','12345','2');
        items[1] = new itemf('1','33345','4');
        items[2] = new itemf('2','12345','1');
        console.log('wtf2');
        */

        itemsJSON = '"items":[';
        for (var i=0; i<len; i++){
            itemsJSON += '{';
            itemsJSON += '"line":"'+i+'",';
            itemsJSON += '"bercor":"'+results.rows.item(i).bercor+'",';
            itemsJSON += '"qty":"'+results.rows.item(i).qty+'"';
            itemsJSON += '}';
            if (!(i==(len-1))){itemsJSON += ',';}
        }
        
        /* --------WAS FOR TESTING IN BROWSER
        for (var i=0; i<items.length;i++)
        {
            itemsJSON += '{';
            itemsJSON += '"line":"'+items[i].idd+'",';
            itemsJSON += '"bercor":"'+items[i].bercor+'",';
            itemsJSON += '"qty":"'+items[i].qty+'"';
            itemsJSON += '}';
            if (!(i==(items.length-1))){itemsJSON += ',';}
        }
        */
        itemsJSON += ']';
        orderJSON += itemsJSON;
        orderJSON += '}';
        placeOrder(orderJSON);
        //alert(orderJSON);
        //console.log(orderJSON);
        //dump(items[0]);
        //var itemJSON = $.toJSON(items);
        //dump(itemJson);
}
function placeOrder(JSONstring)
{
    $.ajax({
            //url: "http://50.204.18.115/apps/BarcodeDemo/php/order.php",
            url: "http://10.1.1.1:10080/apps/BarcodeDemo/php/order.php",
            //data: "qs=" + result.text,
            data: "qs=" + JSONstring,
            statusCode: {
                404: function() {
                alert( "page not found" );
                }} 
            })
            .done(function( returnData ) {
                //item = jQuery.parseJSON( returnData );
                $('#log').append("<p>returndata is"+returnData+"</p>");
            });
}
/* --------WAS FOR TESTING IN BROWSER
function itemf(idd,bercor,qty)
{
    this.idd=idd;
    this.bercor=bercor;
    this.qty=qty;
}
*/
function errorCB(err) {
    $('#log').append("<p>Error processing SQL: "+err.message+"</p>");
}

function successCB() {
    $('#log').append("<p>success!</p>");
} 

function dump(obj) {
    var out = '';
    for (var i in obj) {
        out += i + ": " + obj[i] + "\n";
    }

    alert(out);

    // or, if you wanted to avoid alerts...

    //var pre = document.createElement('pre');
    //pre.innerHTML = out;
    //document.body.appendChild(pre)
}
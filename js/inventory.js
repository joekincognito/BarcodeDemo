var db;
var item = {};
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
        db.transaction(setupTable, errorCB);
    }
}
function setupTable(tx){
    $('#log').append("<p>setupTable</p>");
    tx.executeSql('create table if not exists inventory (bercor, onHand, min, max)');
}
/*********************************/
/*********SCAN IN OUT*************/
/*********************************/
$('#incInv').click(function(){
    bercor = $(this).parent().parent().children('.panel-body').children('.input-group').children('#bercor').val();
    qty = $(this).parent().parent().children('.panel-body').children('.form-group').children('#qty').val();
    incInv(bercor,qty);
});
function incInv(bercor,qty){
        db.transaction(
            function(tx){
                tx.executeSql('select onHand from inventory where bercor = ?',[bercor],
            function(tx,results){
                $('#log').append("<p>results rows length:"+results.rows.length+"</p>");
                if (results.rows.length > 0){ 
                    //if the bercor already exists, add to the qty
                    newQty = parseInt(results.rows.item(0).qty) + qty;
                    $('#log').append("<p>newQty: " +newQty+"bercor: "+bercor+"</p>");
                    tx.executeSql('update inventory set qty=? where (bercor=?)',[parseInt(newQty), bercor]);
                }
                else
                {
                    //if the bercor does not exist, add it with the qty
                    tx.executeSql('insert into inventory(bercor, qty) values(?,?)',[bercor,parseInt(qty)]);
                }
            },errorCB);
        },errorCB,null);
}
$('#decInv').click(function(){
    bercor = $(this).parent().parent().children('.panel-body').children('.input-group').children('#bercor').val();
    qty = $(this).parent().parent().children('.panel-body').children('.form-group').children('#qty').val();
});
function decInv(bercor,qty){
    
}
/*********************************/
/*********MIN MAX*****************/
/*********************************/
$('#mmUpdate').click(function(){
    bercor = $(this).parent().parent().children('.panel-body').children('.input-group').children('#bercor').val();
    min = $(this).parent().parent().children('.panel-body').children('.form-group').children('#min').val();    
    max = $(this).parent().parent().children('.panel-body').children('.form-group').children('#max').val();    
});
function setMinMax(bercor,min,max) {

}
$('#mmCheck').click(function(){
    bercor = $(this).parent().parent().children('.panel-body').children('.input-group').children('#bercor').val();
    
    min = $(this).parent().parent().children('.panel-body').children('.form-group').children('#min');    
    max = $(this).parent().parent().children('.panel-body').children('.form-group').children('#max')();   
    min.val(result.min);
    max.val(result.max);
});
function getMinMax(bercor,min,max) {

}
/*********************************/
/*********ON HAND*****************/
/*********************************/
$('#ohUpdate').click(function(){
    bercor = $(this).parent().parent().children('.panel-body').children('.input-group').children('#bercor').val();
    oh = $(this).parent().parent().children('.panel-body').children('.form-group').children('#onHand');
    //oh.val(result.onHand); 
});
function setOH(bercor,qty) {

}
$('#ohCheck').click(function(){
    bercor = $(this).parent().parent().children('.panel-body').children('.input-group').children('#bercor').val();
    oh = $(this).parent().parent().children('.panel-body').children('.form-group').children('#onHand');    
    oh.val = getOH(bercor);
});
function getOH(bercor) {
    qty=0;
    db.transaction(
            function(tx){
                tx.executeSql('select onHand from inventory where bercor = ?',[bercor])
            },
            function(tx,results){
                $('#log').append("<p>results rows length:"+results.rows.length+"</p>");
                if (results.rows.length > 0){ 
                    //if the bercor already exists, add to the qty
                    qty = parseInt(results.rows.item(0).qty);
                }                  
            },
            errorCB
        );
    return qty;
}
/******************************/
/*********SCAN*****************/
/******************************/
$('.scan').click(function(){
    var scanner = cordova.require("cordova/plugin/BarcodeScanner");
    thisBercor = $(this).parent().parent().find('#bercor');
    scanner.scan( function (result) { 

       $('#log').append("Scanner result: \n" +
            "text: " + result.text + "\n");
        $('#log').append(result);
        
        if(!(result.text.toString().length===5)){
            alert("Scan Error or invalid barcode\n" +
             "Please Try Again!");
        }
        else 
        {
            thisBercor.val(result.text);
        }
    }, function (error) { 
        $('#log').append("<p>Scanning failed: " + error + "</p>"); 
    });
    
});


function getOrders() {
    $('#log').append("<p>getOrders</p>");
    db.transaction(function(tx){
        tx.executeSql('SELECT Id, name, isSubmitted, bercor, desc, qty FROM orders JOIN orderItems ON (orders.Id = orderItems.orderID) WHERE (qty > 0 and isSubmitted = 0)', [], getOrdersSuccess, errorCB);
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
            $('#log').append("<p>isSubmitted= "+typeof(results.rows.item(i).isSubmitted)+" "+results.rows.item(i).isSubmitted+" Row = " + i + " ID = " + results.rows.item(i).Id + " Name =  " + results.rows.item(i).name + " Bercor = " + results.rows.item(i).bercor + " Qty = " + typeof(results.rows.item(i).qty)+" "+results.rows.item(i).qty + " desc = " + results.rows.item(i).desc + "</p>");
            $('#current tbody').append('<tr id='+results.rows.item(i).Id+'><td><input id="itemQTY" class="input-group" name="quantity" type="number" min="1" max="200" style="color:black;" value="'+results.rows.item(i).qty+'""></td><td id="bercor">'+results.rows.item(i).bercor+ "</td><td>" + results.rows.item(i).desc + "</td></tr>");
    }
}

function processOrder()
{
    $('#log').append("<p>In processOrder function</p>")
    db.transaction(function(tx){
        tx.executeSql('SELECT Id, name, isSubmitted, bercor, desc, qty FROM orders JOIN orderItems ON (orders.Id = orderItems.orderID) WHERE (qty > 0 and isSubmitted = 0)', [], processOrderSuccess, errorCB);
    }, errorCB);    
}

function processOrderSuccess(tx, results) {
    //function processOrderSuccess() {---BROWSER TESTING
        $('#log').append("<p>processOrderSuccess function</p>");
        var orderJSON = "";
        var itemsJSON = "";
        var len = results.rows.length;
        order.Id = results.rows.item(0).Id;
        order.name = results.rows.item(0).name;
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
    $('#log').append("<p>place order function</p>");
    $.ajax({
            url: "http://50.204.18.115/apps/BarcodeDemo/php/order.php",
            //url: "http://10.1.1.1:10080/apps/BarcodeDemo/php/order.php",
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
                if (returnData == "Order Placed Successfully!"){
                    db.transaction(function(tx){
                        tx.executeSql('update orders set isSubmitted=? where Id=?',[1,order.Id],function(){
                            navigator.notification.alert(
                                    returnData, //message
                                    function(){window.location="index.html"}, //callback
                                    'Order Success!',   //Title
                                    'OK'                //buttonName
                                );},errorCB);    
                        });
                }
                else
                {
                    navigator.notification.alert(
                                    'Order Processing Error', //message
                                    function(){window.location="index.html"}, //callback
                                    'Order ',   //Title
                                    'OK'                //buttonName
                                );
                }
            });
}

function errorCB(err) {
    $('#log').append("<p>Error processing SQL: "+err.message+"</p>");
}

function successCB() {
    $('#log').append("<p>success!</p>");
} 


var db;
var gQTY; //global scoped qty
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
                    newQty = parseInt(results.rows.item(0).onHand) + parseInt(qty);
                    $('#log').append("<p>newQty: " +newQty+"bercor: "+bercor+"</p>");
                    tx.executeSql('update inventory set onHand=? where (bercor=?)',[parseInt(newQty), bercor]);
                }
                else
                {
                    //if the bercor does not exist, add it with the qty
                    tx.executeSql('insert into inventory(bercor, onhand) values(?,?)',[bercor,parseInt(qty)]);
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
    ohQTY = getOH(bercor);
    oh.val(ohQTY);
});
function getOH(bercor) {
    db.transaction(
            function(tx){
                tx.executeSql('select onHand from inventory where bercor = ?',[bercor],
            function(tx,results){
                $('#log').append("<p>results rows length:"+results.rows.length+"</p>");
                if (results.rows.length > 0){ 
                    //if the bercor already exists, add to the qty
                    gQTY = parseInt(results.rows.item(0).onHand);
                    $('#log').append("<p>qty: "+gQTY+"</p>");
                }                  
            },errorCB);
        },errorCB,function(){return gQTY;});
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

function errorCB(err) {
    $('#log').append("<p>Error processing SQL: "+err.message+"</p>");
}

function successCB() {
    $('#log').append("<p>success!</p>");
} 


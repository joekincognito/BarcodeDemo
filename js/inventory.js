var db;
var gQTY; //global scoped qty
var oh; //global scoped onHand qty field
var gqmin; //global scoped min quantity
var gqmax;//global scoped max quantity
var min;//global scoped min field
var max;//global scoped max field
var item = {};
var order = {};
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

$('.bercor').change(function(){$('.bercor').val($(this).val())});

function onDeviceReady() {
    ////$('#log').hide();
    if( window.isphone ) {
        db = window.openDatabase("Database", "1.0", "The Database", 200000);
        db.transaction(setupTable, errorCB, getCurrentOrder);
    }
}
function setupTable(tx){
    //$('#log').append("<p>setupTable</p>");
    //tx.executeSql('drop table if exists inventory');
    tx.executeSql('create table if not exists inventory (bercor, onHand, min, max)');
    tx.executeSql('create table if not exists orders (Id INTEGER PRIMARY KEY, name, isSubmitted, date)');
    tx.executeSql('create table if not exists orderItems (orderID, bercor, desc, qty)');
}

function getCurrentOrder() {
        //$('#log').append("<p>getCurrentOrder</p>");
        db.transaction(function(tx){
        tx.executeSql('SELECT Id FROM orders where isSubmitted = 0', [], getCurrentOrderSuccess, errorCB);
        }, errorCB);
}

function getCurrentOrderSuccess(tx, results) {
        var len = results.rows.length;
        //$('#log').append("<p>Orders table: " + len + " rows found.</p>");
        if (len == 0) {
            //$('#log').append("adding row");
            newOrder(getCurrentOrder);
        }else{
            //$('#log').append("<p>Orders table: " + len + " rows found.</p>");
            for (var i=0; i<len; i++){
                //$('#log').append("<p>Row = " + i + " ID = " + results.rows.item(i).Id + " Name =  " + results.rows.item(i).name + "</p>");
                order.Id=results.rows.item(i).Id;
            }
        }
}

/*********************************/
/*********SCAN IN OUT*************/
/*********************************/
$('#incInv').click(function(){
    bercor = $(this).parent().parent().children('.panel-body').children('.input-group').children('.bercor').val();
    qty = $(this).parent().parent().children('.panel-body').children('.form-group').children('#qty').val();
    if(!qty){
        $('#qty').siblings('span').toggleClass('glyphicon-warning-sign');
        $('#qty').parent().toggleClass('has-warning has-feedback');
        setTimeout(function(){$('#qty').siblings('span').toggleClass('glyphicon-warning-sign');$('#qty').parent().toggleClass('has-warning has-feedback')},3000);
    }
    else{
        incInv(bercor,parseInt(qty));
    }
});
function incInv(bercor,qty){
        db.transaction(
            function(tx){
                tx.executeSql('select onHand from inventory where bercor = ?',[bercor],
            function(tx,results){
                //$('#log').append("<p>results rows length:"+results.rows.length+"</p>");
                if (results.rows.length > 0){ 
                    //if the bercor already exists, add to the qty
                    newQty = results.rows.item(0).onHand + qty;
                    //$('#log').append("<p>newQty: " +newQty+"bercor: "+bercor+"</p>");
                    tx.executeSql('update inventory set onHand=? where bercor=?',[parseInt(newQty), bercor]);
                }
                else
                {
                    //if the bercor does not exist, add it with the qty
                    tx.executeSql('insert into inventory(bercor, onhand) values(?,?)',[bercor,qty]);
                }
            },errorCB);
        },errorCB,function(){$('#qty').siblings('span').toggleClass('glyphicon-ok');$('#qty').parent().toggleClass('has-success has-feedback');setTimeout(function(){$('#qty').siblings('span').toggleClass('glyphicon-ok');$('#qty').parent().toggleClass('has-success has-feedback');$('#qty').val('')},3000)});
}
$('#decInv').click(function(){
    bercor = $(this).parent().parent().children('.panel-body').children('.input-group').children('.bercor').val();
    qty = $(this).parent().parent().children('.panel-body').children('.form-group').children('#qty').val();
    if(!qty){
        $('#qty').siblings('span').toggleClass('glyphicon-warning-sign');
        $('#qty').parent().toggleClass('has-warning has-feedback');
        setTimeout(function(){$('#qty').siblings('span').toggleClass('glyphicon-warning-sign');$('#qty').parent().toggleClass('has-warning has-feedback')},3000);
    }
    else{
        decInv(bercor,parseInt(qty));
    }
});
function decInv(bercor,qty){
   db.transaction(
            function(tx){
                tx.executeSql('select * from inventory where bercor = ?',[bercor],
            function(tx,results){
                //$('#log').append("<p>results rows length:"+results.rows.length+"</p>");
                if (results.rows.length > 0){ 
                    //if the bercor already exists, add to the qty
                    onHand = parseInt(results.rows.item(0).onHand);
                    newQty = onHand - qty;
                    //Check min and max
                    min = parseInt(results.rows.item(0).min);
                    max = parseInt(results.rows.item(0).max);
                    if(newQty < min){
                        item.qty = max - newQty;
                        item.bercor = bercor;
                        order.order = true;
                    }
                    //$('#log').append("<p>newQty: " +newQty+" bercor: "+bercor+"</p>");
                    tx.executeSql('update inventory set onHand=? where bercor=?',[newQty, bercor]);
                }
                else
                {
                    //if the bercor does not exist, do nothing
                    //tx.executeSql('insert into inventory(bercor, onhand) values(?,?)',[bercor,qty]);
                }
            },errorCB);
        },errorCB,function(){$('#qty').siblings('span').toggleClass('glyphicon-ok');$('#qty').parent().toggleClass('has-success has-feedback');setTimeout(function(){$('#qty').siblings('span').toggleClass('glyphicon-ok');$('#qty').parent().toggleClass('has-success has-feedback');$('#qty').val('')},3000);if(order.order){ajax(item.bercor,item.qty)}});
}
/*********************************/
/*********MIN MAX*****************/
/*********************************/
$('#mmUpdate').click(function(){
    bercor = $(this).parent().parent().children('.panel-body').children('.input-group').children('.bercor').val();
    min = $(this).parent().parent().children('.panel-body').children('.form-group').children('#min').val();    
    max = $(this).parent().parent().children('.panel-body').children('.form-group').children('#max').val();    
    
    if(min&&max){
        setMinMax(bercor,min,max);
    }
    else{ 
        if(!min){
            $('#min').siblings('span').toggleClass('glyphicon-warning-sign');
            $('#min').parent().toggleClass('has-warning has-feedback');
            setTimeout(function(){$('#min').siblings('span').toggleClass('glyphicon-warning-sign');$('#min').parent().toggleClass('has-warning has-feedback')},3000);
        }
        if(!max){
            $('#max').siblings('span').toggleClass('glyphicon-warning-sign');
            $('#max').parent().toggleClass('has-warning has-feedback');
            setTimeout(function(){$('#max').siblings('span').toggleClass('glyphicon-warning-sign');$('#max').parent().toggleClass('has-warning has-feedback')},3000);
        }
    }
});
function setMinMax(bercor,min,max) {
     db.transaction(
            function(tx){
                tx.executeSql('select * from inventory where bercor = ?',[bercor],
            function(tx,results){
                //$('#log').append("<p>results rows length:"+results.rows.length+"</p>");
                if (results.rows.length > 0){ 
                    //if the bercor already exists, change onhand
                    //$('#log').append("<p>changing to min: "+min+"</p>");
                    tx.executeSql('update inventory set min=?, max=? where bercor=?',[min, max, bercor]);
                }
                else
                {
                    tx.executeSql('insert into inventory(bercor, min, max) values(?,?,?)',[bercor, min, max]);
                }                  
            },errorCB);
        },errorCB,function(){$('#min').siblings('span').toggleClass('glyphicon-ok');$('#max').siblings('span').toggleClass('glyphicon-ok');$('#min').parent().toggleClass('has-success has-feedback');$('#max').parent().toggleClass('has-success has-feedback');setTimeout(function(){$('#max').siblings('span').toggleClass('glyphicon-ok');$('#min').siblings('span').toggleClass('glyphicon-ok');$('#min').parent().toggleClass('has-success has-feedback');$('#max').parent().toggleClass('has-success has-feedback');$('#min').val('');$('#max').val('');},3000);});
}
$('#mmCheck').click(function(){
    bercor = $(this).parent().parent().children('.panel-body').children('.input-group').children('.bercor').val();
    min = $(this).parent().parent().children('.panel-body').children('.form-group').children('#min');    
    max = $(this).parent().parent().children('.panel-body').children('.form-group').children('#max');
    if(bercor){
        getMinMax(bercor);       
    }
});
function getMinMax(bercor) {
    db.transaction(
            function(tx){
                tx.executeSql('select * from inventory where bercor = ?',[bercor],
            function(tx,results){
                //$('#log').append("<p>results rows length:"+results.rows.length+"</p>");
                if (results.rows.length > 0){ 
                    //if the bercor already exists, change onhand
                    gqmin = parseInt(results.rows.item(0).min);
                    gqmax = parseInt(results.rows.item(0).max);
                }             
            },errorCB);
        },errorCB,function(){min.val(gqmin); max.val(gqmax);});

}
/*********************************/
/*********ON HAND*****************/
/*********************************/
$('#ohUpdate').click(function(){
    bercor = $(this).parent().parent().children('.panel-body').children('.input-group').children('.bercor').val();
    oh = $(this).parent().parent().children('.panel-body').children('.form-group').children('#onHand').val(); 
    if(!oh){
        $('#onHand').siblings('span').toggleClass('glyphicon-warning-sign');
        $('#onHand').parent().toggleClass('has-warning has-feedback');
        setTimeout(function(){$('#onHand').siblings('span').toggleClass('glyphicon-warning-sign');$('#onHand').parent().toggleClass('has-warning has-feedback')},3000);
    }
    else{
        setOH(bercor,parseInt(oh));
    }
});
/*
function decInv(bercor,qty){
   db.transaction(
            function(tx){
                tx.executeSql('select * from inventory where bercor = ?',[bercor],
            function(tx,results){
                //$('#log').append("<p>results rows length:"+results.rows.length+"</p>");
                if (results.rows.length > 0){ 
                    //if the bercor already exists, add to the qty
                    onHand = parseInt(results.rows.item(0).onHand);
                    newQty = onHand - qty;
                    //Check min and max
                    min = parseInt(results.rows.item(0).min);
                    max = parseInt(results.rows.item(0).max);
                    if(newQty < min){
                        item.qty = max - newQty;
                        item.bercor = bercor;
                        order.order = true;
                    }
                    //$('#log').append("<p>newQty: " +newQty+" bercor: "+bercor+"</p>");
                    tx.executeSql('update inventory set onHand=? where bercor=?',[newQty, bercor]);
                }
                else
                {
                    //if the bercor does not exist, do nothing
                    //tx.executeSql('insert into inventory(bercor, onhand) values(?,?)',[bercor,qty]);
                }
            },errorCB);
        },errorCB,function(){$('#qty').siblings('span').toggleClass('glyphicon-ok');$('#qty').parent().toggleClass('has-success has-feedback');setTimeout(function(){$('#qty').siblings('span').toggleClass('glyphicon-ok');$('#qty').parent().toggleClass('has-success has-feedback');$('#qty').val('')},3000);if(order.order){ajax(item.bercor,item.qty)}});
}
*/
function setOH(bercor,qty) {
     db.transaction(
            function(tx){
                tx.executeSql('select * from inventory where bercor = ?',[bercor],
            function(tx,results){
                //$('#log').append("<p>results rows length:"+results.rows.length+"</p>");
                if (results.rows.length > 0){ 
                    //Check min and max
                    min = parseInt(results.rows.item(0).min);
                    max = parseInt(results.rows.item(0).max);
                    if(qty < min){
                        item.qty = max - qty;
                        item.bercor = bercor;
                        order.order = true;
                    }
                    //$('#log').append("<p>changing to qty: "+qty+"</p>");
                    tx.executeSql('update inventory set onHand=? where bercor=?',[qty, bercor]);
                }
                else
                {
                    tx.executeSql('insert into inventory(bercor, onhand) values(?,?)',[bercor,qty]);
                }                  
            },errorCB);
        },errorCB,function(){$('#onHand').siblings('span').toggleClass('glyphicon-ok');$('#onHand').parent().toggleClass('has-success has-feedback');setTimeout(function(){$('#onHand').siblings('span').toggleClass('glyphicon-ok');$('#onHand').parent().toggleClass('has-success has-feedback');$('#onHand').val('');},3000);if(order.order){ajax(item.bercor,item.qty)}});
}
$('#ohCheck').click(function(){
    bercor = $(this).parent().parent().children('.panel-body').children('.input-group').children('.bercor').val();
    oh = $(this).parent().parent().children('.panel-body').children('.form-group').children('#onHand');    
    if(bercor){
        getOH(bercor);
    }
});
function getOH(bercor) {
    db.transaction(
            function(tx){
                tx.executeSql('select onHand from inventory where bercor = ?',[bercor],
            function(tx,results){
                //$('#log').append("<p>results rows length:"+results.rows.length+"</p>");
                if (results.rows.length > 0){ 
                    //if the bercor already exists, add to the qty
                    gQTY = parseInt(results.rows.item(0).onHand);
                    //$('#log').append("<p>qty: "+gQTY+"</p>");
                }                  
            },errorCB);
        },errorCB,function(){oh.val(gQTY)});
}
/******************************/
/*********SCAN*****************/
/******************************/
$('.scan').click(function(){
    var scanner = cordova.require("cordova/plugin/BarcodeScanner");
    //thisBercor = $(this).parent().parent().find('.bercor');
    scanner.scan( function (result) { 

       /*$('#log').append("Scanner result: \n" +
            "text: " + result.text + "\n");*/
        //$('#log').append(result);
        
        if(!(result.text.toString().length===5)){
            alert("Scan Error or invalid barcode\n" +
             "Please Try Again!");
        }
        else 
        {
            $('.bercor').val(result.text);
        }
    }, function (error) { 
        //$('#log').append("<p>Scanning failed: " + error + "</p>"); 
    });
    
});

//tx.executeSql('insert into orderItems(orderID, bercor, desc, qty) values(?,?,?,?)',[order.Id,item.bercor,'"'+item.desc+'"',item.qty]);

function ajax(number,itemQTY){ //number will bercor
        $.ajax({
            url: "http://50.204.18.115/apps/BarcodeDemo/php/test.php", //real url - public
            //url: "http://10.1.1.1:10080/apps/BarcodeDemo/php/test.php",  //testing url - local
            //data: "qs=" + result.text,
            data: "qs=" + number,
            statusCode: {
                404: function() {
                alert( "page not found" );
                }} 
            })
            .done(function( returnData ) {
                item = jQuery.parseJSON( returnData );
                //$('#log').append("<p>"+order.Id+" "+item.bercor+" "+item.desc+" "+itemQTY+"</p>");
                db.transaction(
                    function(tx){
                        tx.executeSql('select * from orderItems where orderID = ? and bercor = ?',[order.Id,item.bercor],
                    function(tx,results){
                        //$('#log').append("<p>results rows length:"+results.rows.length+"</p>");
                        if (results.rows.length > 0)
                        { 
                            //if the bercor already exists on the order, 
                            tx.executeSql('update orderItems set qty=?, desc=? where (orderID=? and bercor=?)',[itemQTY,'"*'+item.desc+'"',order.Id,item.bercor]);
                         }
                        else
                        {
                            //if the bercor does not exist on the order, add it to the order
                            tx.executeSql('insert into orderItems(orderID, bercor, desc, qty) values(?,?,?,?)',[order.Id,item.bercor,'"*'+item.desc+'"',itemQTY]);
                        }                  
                    },errorCB);
                    },errorCB,function(){/*$('#log').append("<p>order add success</p>")*/}
                );
            });    
}

function errorCB(err) {
    //$('#log').append("<p>Error processing SQL: "+err.message+"</p>");
}

function successCB() {
    //$('#log').append("<p>success!</p>");
} 


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
    $('#orderHistory').on("click", ".order-heading", function(){
        $(this).siblings('.order-body').toggleClass('hidden');
    });
});

/*$('.panel-heading').click(function(){
    //$('#log').toggle();
});*/

function onDeviceReady() {
    //$('#log').hide();
    if( window.isphone ) {
        db = window.openDatabase("Database", "1.0", "The Database", 200000);
        db.transaction(setupTable, errorCB, getOrders);
    }
}
function setupTable(tx){
    //$('#log').append("<p>setupTable</p>");
    tx.executeSql('create table if not exists orders (Id INTEGER PRIMARY KEY, name, isSubmitted, date)');
    tx.executeSql('create table if not exists orderItems (orderID, bercor, desc, qty)');
}
function getOrders() {
    //$('#log').append("<p>getInventory</p>");
    db.transaction(function(tx){
        tx.executeSql('SELECT * FROM orders inner join orderItems on Id = orderID WHERE (qty > 0 and isSubmitted = 1)', [], getOrdersSuccess, errorCB);
        //need a join here for orderItems
    }, errorCB);
}

function getOrdersSuccess(tx, results) {
    //$('#log').append("<p>getInventorySuccess</p>");
        var len = results.rows.length;
        //$('#log').append("<p>Order table: " + len + " rows found.</p>");
        
        var name = results.rows.item(0).name;
        var orderholder = '<div class="panel panel-primary">'+
                            '<div class="panel-heading order-heading">'+
                              '<h4 style="margin-top:0px;margin-bottom:0px" class="row">' +
                              '<span class="col-md-5">'+results.rows.item(0).date.substring(4,15)+'</span><span class="col-md-5">'+ name + '</span>'+
                              '<span class="col-md-2"><span class="caret pull-right" style="border-top: 8px solid; border-right: 8px solid transparent; border-left: 8px solid transparent;"></span></span></h4>'+
                            '</div>';
            orderholder += '<div class="panel-body order-body hidden">'+
                              '<div class="table-responsive">'+
                                '<table class="table table-bordered" style="font-size:16px">'+
                                  '<thead>'+
                                    '<tr><th>#</th><th>Bercor</th><th>Desc</th></tr>'+
                                  '</thead>'+
                                  '<tbody>';
        for (var i=0; i<len; i++){
            var result=results.rows.item(i);
            if (name == results.rows.item(i).name)
            {
                orderholder +='<tr><td>'+results.rows.item(i).qty+'</td><td>'+results.rows.item(i).bercor+'</td><td>'+results.rows.item(i).desc+'</td></tr>';
                //orderholder +='<span>'+ result.desc + '</span>');   
            }
            else
            {
                orderholder +='</tbody></table></div></div></div>';
                var name = result.name;
                orderholder += '<div class="panel panel-primary">'+
                                 '<div class="panel-heading order-heading">'+
                                   '<h4 style="margin-top:0px;margin-bottom:0px" class="row">' +
                              '<span class="col-md-5">'+results.rows.item(i).date.substring(4,15)+'</span><span class="col-md-5">'+ name + '</span>'+
                              '<span class="col-md-2"><span class="caret pull-right" style="border-top: 8px solid; border-right: 8px solid transparent; border-left: 8px solid transparent;"></span></span></h4>'+
                            '</div>';
                orderholder +=    '<div class="panel-body order-body hidden">'+
                                     '<div class="table-responsive">'+
                                        '<table class="table table-bordered" style="font-size:16px">'+
                                          '<thead>'+
                                            '<tr><th>#</th><th>Bercor</th><th>Desc</th></tr>'+
                                          '</thead>'+
                                          '<tbody>';
                 orderholder +='<tr><td>'+results.rows.item(i).qty+'</td><td>'+results.rows.item(i).bercor+'</td><td>'+results.rows.item(i).desc+'</td></tr>';
                //orderholder +='<p>'+ name + '</p>');        
            }
            //orderholder +='<ul><li>'+ result.name + '</li></ul>');

            //order name
            //each order item  --< hidden...expand to reveal
            //$('tbody').append('<tr id='+results.rows.item(i).Id+'><td>'+results.rows.item(i).bercor+'</td><td>'+results.rows.item(i).onHand+'</td><td>'+results.rows.item(i).min+'</td><td>'+results.rows.item(i).max+'</td></tr>');
        }
        orderholder +='</tbody></table></div></div></div>';
        $('#orderHistory').append(orderholder);
        //$('#orderHistory').text($('#orderHistory').html());
}

function errorCB(err) {
    //$('#log').append("<p>Error processing SQL: "+err.message+"</p>");
}

function successCB() {
    //$('#log').append("<p>success!</p>");
} 


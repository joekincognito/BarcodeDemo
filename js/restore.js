var db;
function getCustomerNumber()
{
    var def = new $.Deferred();
	db.transaction(function(tx) {
    tx.executeSql('select * from customer', [], function(tx,results){
	        if(results.rows.length>=1)
	        {
	        	var custID = setCustID(results);
                def.resolve(custID);
	        }
	        else
	        {
	        	$('#log').append("<p>Error retreiving customer number</p>");
	        }
		});
    }, dbError);

    return def;
}

function setCustID(resultSet){
    result = resultSet.rows.item(0).customerID;
    return result;
}

$(document).on("click", "#doRestoreBtn", function(e) {
	e.preventDefault();
	$('#log').append("<p>Begin restore process</p>");
	
    $.when(getCustomerNumber()).then(function(custID){ajaxRestore(custID)});
});

function ajaxRestore(custID)
{
	$('#log').append("<p>Begin Ajax</p>");
    $('#log').append("<p>Customer Number is: "+custID+"</p>");
    $.ajax({
            url: "http://apps.gwberkheimer.com/index.php/scan_app/restore",
            data: "qs=" + custID,
            statusCode: {
                404: function() {
                alert( "page not found" );
                }} 
            })
            .done(function( returnData ) {
                if(returnData){
                	restoreData = JSON.parse(returnData);
                    db.transaction(function(tx){
                        tx.executeSql('drop table if exists inventory');
                        tx.executeSql('create table if not exists inventory (bercor, onHand, min, max)');
                        $.each( restoreData.inventory, function( key, value ) {
                                tx.executeSql('insert into inventory(bercor, onHand, min, max) values(?,?,?,?)',[value.bercor,value.onHand,value.min,value.max]);
                        });
                    },dbError,restoreSuccess);
                }
                else
                {
                	$('#log').append("<p>data error</p>");
                }
            });
}
function dbError(err) 
{
    $('#log').append("<p>Error: "+err.message+"</p>");
}
function restoreSuccess()
{
     navigator.notification.alert(
                                    "Restore Success", //message
                                    function(){window.location="view_inventory.html"}, //callback
                                    'Restore Success!',   //Title
                                    'OK'                //buttonName
                                );
}
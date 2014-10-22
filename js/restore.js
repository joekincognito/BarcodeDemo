var db;
var custID
function getCustomerNumber()
{
	tx.executeSql('select * from customer', [], function(tx,results){
	        if(results.rows.length>=1)
	        {
	        	custID = results.rows.item(0).customerID;
	        	$('#log').append("<p>Customer Number is: "+custID+"</p>");
	        }
	        else
	        {
	        	$('#log').append("<p>Error retreiving customer number</p>");
	        }
		});
}

$(document).on("click", "#doRestoreBtn", function(e) {
	e.preventDefault();
	$('#log').append("<p>Begin restore process</p>");
	db.transaction(getCustomerNumber, dbError, ajax(custID));
});

function ajax(custID)
{
	var inventory;
	$('#log').append("<p>Begin Ajax</p>");
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
                	
                	inventory = jQuery.parseJSON(returnData);

                	$.each( inventory, function( key, value ) {
					$('#log').append("<p>"+key+":"+value+"</p>");
                	});

                	$('#log').append("<p>returndata is"+returnData+"</p>");
                	$('#log').append("<p>foo is"+inventory.foo+"</p>");
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
var db;

$(document).on("click", "#doRestoreBtn", function(e) {
	e.preventDefault();
	var custID;
	$('#log').append("<p>Begin restore process</p>");
	db.transaction(function(tx) {
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
	}, dbError);
	ajax(custID);
});

function ajax(custID)
{
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
                	$('#log').append("<p>returndata is"+returnData+"</p>");
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
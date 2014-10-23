var db;
var custID
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
	
    $.when(getCustomerNumber).then(function(custID){ajaxRestore(custID)});
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
                	inventory = JSON.parse(returnData);

                	/*
                	$.each( inventory, function( key, value ) {
					$('#log').append("<p>"+key+":"+value+"</p>");
                	});
					*/

                	//$('#log').append("<p>return data is"+returnData+"</p>");
                	$('#log').append("<p>wtf</p>");
                	$('#log').append(inventory.inventory[0].bercor);
                	$('#log').append("<p>ikr</p>");
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
var db;
//var custID;

function restore(table) {
	
}

$(document).on("click", "#doRestoreBtn", function(e) {
	e.preventDefault();
	//$('#log').append("<p>setupTable</p>");
	//db = window.openDatabase("Database", "1.0", "The Database", 200000);
	$('#log').append("<p>Begin restore process</p>");
    /*    db.transaction(function(tx){
        	tx.executeSql('select * from customer', [], function(tx,results){
        		if(results.rows.length>=1){custID = results.rows.item(0).customerID}
    		},dbError);
        },dbError, null);
	$('#log').append("<p>customer id"+custID+"</p>");
	*/
	db.transaction(function(tx) {
		 tx.executeSql('select * from customer', [], function(tx,results){
        if(results.rows.length>=1){custID = results.rows.item(0).customerID}
	}, dbError);
	ajax(custID);

});

function ajax(custID)
{
    //$('#log').append("<p>place order function</p>");
    $.ajax({
            url: "http://apps.gwberkheimer.com/index.php/scan_app/restore",
            //url: "http://10.1.1.1:10080/apps/BarcodeDemo/php/order.php",
            //data: "qs=" + result.text,
            data: "qs=" + custID,
            //dataType: 'json',
            statusCode: {
                404: function() {
                alert( "page not found" );
                }} 
            })
            .done(function( returnData ) {
                //item = jQuery.parseJSON( returnData );
                if(returnData){
                	$('#log').append("<p>returndata is"+returnData+"</p>");
                }
                else
                {
                	$('#log').append("<p>data error</p>");
                }
            });
}

function convertResults(resultset) {
	var results = [];
	/*for(var i=0,len=resultset.rows.length;i<len;i++) {
		var row = resultset.rows.item(i);
		var result = {};
		for(var key in row) {
			result[key] = row[key];
		}
		results.push(result);
	}
	return results;
	*/
}

function dbError(err) {
    $('#log').append("<p>Error: "+err.message+"</p>");
}
function backup(table) {
	var def = new $.Deferred();
	db.transaction(function(tx) {
		tx.executeSql("select * from "+table, [], function(tx,results) {
			var data = convertResults(results);
			$('#log').append(data);
			//console.dir(data);
			def.resolve(data);
		});
	}, dbError);

	return def;
}

$(document).on("click", "#doBackupBtn", function(e) {
	e.preventDefault();
	//$('#log').append("<p>setupTable</p>");
	$('#log').append("<p>Begin backup process</p>");

	$.when(
		backup("inventory"), 
		backup("orders"),
		backup("orderItems")
	).then(function(inventory, orders, orderItems) {
		$('#log').append("All done");
		//Convert to JSON
		var data = {inventory:inventory, orders:orders, orderItems:orderItems};
		var serializedData = JSON.stringify(data);
		ajax(serializedData);
		//$('#log').append('<p>'+serializedData+'</p>');
	});

});

function ajax(JSONstring)
{
    //$('#log').append("<p>place order function</p>");
    $.ajax({
            url: "http://apps.gwberkheimer.com/index.php/scan_app/backup",
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
                }
                else
                {
                $('#log').append("<p>backup error</p>");
                }
            });
}

function convertResults(resultset) {
	var results = [];
	for(var i=0,len=resultset.rows.length;i<len;i++) {
		var row = resultset.rows.item(i);
		var result = {};
		for(var key in row) {
			result[key] = row[key];
		}
		results.push(result);
	}
	return results;
}

function dbError(err) {
    $('#log').append("<p>Error: "+err.message+"</p>");
}
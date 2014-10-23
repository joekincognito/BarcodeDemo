var db;

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

	$.when(
		backup("customer"),
		backup("inventory"), 
		backup("orders"),
		backup("orderItems")
	).then(function(customer, inventory, orders, orderItems) {
		$('#log').append("All done");
		//Convert to JSON
		var data = {customer:customer, inventory:inventory, orders:orders, orderItems:orderItems};
		var serializedData = JSON.stringify(data);
		ajax(serializedData);
	});

});

function ajax(JSONstring)
{
    $.ajax({
            url: "http://apps.gwberkheimer.com/index.php/scan_app/backup",
            data: "qs=" + JSONstring,
            //dataType: 'json',
            statusCode: {
                404: function() {
                alert( "page not found" );
                }} 
            })
            .done(function( returnData ) {
                //item = jQuery.parseJSON( returnData );
                if(returnData){
                //$('#log').append("<p>backup return data is"+returnData+"</p>");
                navigator.notification.alert(
			            returnData, //message
			            function(){window.location="view_inventory.html"}, //callback
			           'Backup Status!',   //Title
			           'OK'                //buttonName
			    	);
                }
                else
                {
                    navigator.notification.alert(
			            "Backup Error", //message
			            function(){window.location="view_inventory.html"}, //callback
			           'Error!',   //Title
			           'OK'                //buttonName
			    	);
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
    navigator.notification.alert(
            err.message, //message
            function(){window.location="view_inventory.html"}, //callback
           'Error!',   //Title
           'OK'                //buttonName
    );
}
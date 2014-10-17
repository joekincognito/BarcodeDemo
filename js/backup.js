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
		$('#log').append('<p>'+serializedData+'</p>');
	});

});

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
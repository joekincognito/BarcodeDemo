<?php
	$qs = $_GET['qs'];
	$qs = "9114901075742714812669";
	$data = array(
		"9114901075742714812669" =>"12345",								
		"4746904837" =>"99999",
		"047469048372" =>"88888"	
		);
//return json_encode(returnData);
	foreach ($data as $key => $value){
		if($key==$qs){
			$returnData = $value;
		}
	}
echo $returnData;
?>
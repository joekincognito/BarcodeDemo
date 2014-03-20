<?php
	$qs = $_GET['qs']; 
	$data = array(
		'071091016058' =>'123456',
		'9114901075742714812669' =>'12345',								
		'4746904837' =>'99999',
		'047469048372' =>'88888'	
		);
	foreach ($data as $key => $value){
		if($key===$qs){
			$returnData = $value;
		}
	}
if($returnData = ""){
	$returnData = "Number not found";
}	
echo $returnData;
?>
<?php
include_once 'authorization.php';
include_once zend_deployment_library_path('PHP Toolkit for IBMI i') . DIRECTORY_SEPARATOR . 'ToolkitService.php';
     try { 
         $obj = ToolkitService::getInstance($db, $user, $pass); 
     } 

     catch (Exception $e) {              
        echo  $e->getMessage(), "\n"; 
        exit(); 
    } 
     
    $obj->setToolkitServiceParams(array('InternalKey'=>"/tmp/$user", 
                                        'debug'=>true));                                      
	
	$sql = 'Select IMFREF, ISIZE, IGDESC from QS36F.OE0301 where ITEM#B = ?';
	$conn = db2_connect($db, $user, $pass);
	$stmt = db2_prepare($conn, $sql);

	$qs = $_GET['qs']; 
	//echo $qs;
	$bercor = substr($qs, 0, -3);
	//echo $bercor;
	db2_bind_param($stmt, 1, "bercor", DB2_PARAM_IN);
	$desc = "";	
	if (db2_execute($stmt)) {
    	while ($row = db2_fetch_array($stmt)) {
        	$desc = "{$row[0]} {$row[1]} {$row[2]}";
        	//http://www.php.net/manual/en/function.db2-bind-param.php
    	}
	}
echo $bercor . ' - ' . $desc;
?>
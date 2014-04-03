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
    if (strlen($qs) === 15){ //if the strlen is 15 then its scan data
	   $bercor = substr($qs, -8, -3);
    }
    else 
    {
       $bercor = $qs;  //if the strlen is 5 then its a bercor already....possibly
    }
	//echo $bercor;
	db2_bind_param($stmt, 1, "bercor", DB2_PARAM_IN);
	$desc = "";	
	if (db2_execute($stmt)) {
    	while ($row = db2_fetch_array($stmt)) {
        	$desc = "{$row[0]} {$row[1]} {$row[2]}";
        	//http://www.php.net/manual/en/function.db2-bind-param.php
    	}
	}
   // $item["item"]= array(
     $item = array(
            "bercor" => $bercor,
            "desc" => $desc
            );
echo json_encode($item);
//echo $bercor . ' - ' . $desc;
?>
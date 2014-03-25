<?php
session_start();
 
$db = '*LOCAL';           //i5 side
$user = 'JCK';
$pass = 'j187324j';
$test_lib = 'QGPL';

if (isset( $_SESSION['dbname']))//S0663764
	$db =   $_SESSION['dbname'];
if (isset( $_SESSION['user']))
	$user = $_SESSION['user'];   

if (isset( $_SESSION['pass']))
	$pass = $_SESSION['pass'];
	  
if (isset( $_SESSION['tmplib']))
	$test_lib = $_SESSION['tmplib'];
?>
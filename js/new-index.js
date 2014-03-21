console.log ('?');
$(".ui-loader").hide();
$(document).ready(function() {
    $(".ui-loader").hide();
    // are we running in native app or in a browser?
    window.isphone = false;
    if(document.URL.indexOf("http://") === -1 
        && document.URL.indexOf("https://") === -1) {
        window.isphone = true;
    }

    if(document.URL="file:///C:/Users/Joe/Dropbox/GIt%20Hub/barcodedemo/index.html") {
        window.isphone = false;
        console.log ('testing locally');
    }

    if( window.isphone ) {
        console.log ('phone');
        document.addEventListener("deviceready", onDeviceReady, false);
    } else {
        console.log('not phone');
        onDeviceReady();
        $(".ui-loader").hide();
    }
});

$(document).bind("mobileinit", function(){
    console.log('mobileinit function');
    $(".ui-loader").hide();
    // - didnt work - $.mobile.loadingMessage = 'potato';
    $.mobile.allowCrossDomainPages = true;
    $.support.cors = true;
});

function onDeviceReady() {
    $(".ui-loader").hide();
    // do everything here.
    console.log('deviceready');
    $('#deviceready .listening').hide();
    $('#deviceready .received').show();

    $('#scan').click(function(){
        var scanner = cordova.require("cordova/plugin/BarcodeScanner");
        scanner.scan( function (result) { 

            alert("We got a barcode\n" + 
            "Result: " + result.text + "\n" + 
            "Format: " + result.format + "\n" + 
            "Cancelled: " + result.cancelled);  

           console.log("Scanner result: \n" +
                "text: " + result.text + "\n" +
                "format: " + result.format + "\n" +
                "cancelled: " + result.cancelled + "\n");
            console.log(result);
            /*$( "#info" ).append( result.text + "\n");*/
            /* The scan data doesn't need to be sent to a php script
            *  The scan data will be the bercor number
            $.mobile.allowCrossDomainPages = true;
            $.support.cors = true;
            */
            $.ajax({
                url: "50.204.18.115/apps/BarcodeDemo2/php/test.php",
                data: "qs=" + result.text
                })
                .done(function( returnData ) {
                    console.log(returnData);
                    $( "#info" ).append( returnData );
                });

        }, function (error) { 
            console.log("Scanning failed: ", error); 
        } );
    });
}

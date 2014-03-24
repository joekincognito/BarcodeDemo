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
function onDeviceReady() {
    
}
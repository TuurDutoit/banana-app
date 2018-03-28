document.addEventListener('deviceready', function() {

    navigator.camera.cleanup(cleanupSuccess, cleanupFail);

    navigator.camera.getPicture(cameraSuccess, cameraFail, {

    });

    function cleanupSuccess() {
        console.log('Camera: cleanup succeeded');
    }

    function cleanupFail(message) {
        console.error('Camera: cleanup failed: ' + message);
    }

    function cameraFail(message) {
        alert('Something went wrong when trying to take a picture.');
        console.error('Camera: capture failed: ' + message);
    }

    function cameraSuccess(url) {
        var $main = document.querySelector('main');

        var $img = document.createElement('div');
        $img.className = 'frame';
        $img.style.backgroundImage = 'url(' + url + ')';
        $main.appendChild($img);

        // Retrieve food items from Watson
        // Retrieve nutritional info form Nutritionix
    }

}, false);
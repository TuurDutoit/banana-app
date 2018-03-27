//bron https://tutorialzine.com/2016/07/take-a-selfie-with-js
document.addEventListener("DOMContentLoaded", function(event) {

var hidden_canvas = document.querySelector('canvas'),
    video = document.querySelector('video.camera_stream'),
    image = document.querySelector('img.photo');
    
navigator.getUserMedia(
    {
        video: true
    },
    function(stream){
        video.src = window.URL.createObjectURL(stream);
        video.play();

    },function(err){
        alert("permition denied");
    }
);

function takeSnapshot(){

    var 

        // Get the exact size of the video element.
        width = video.videoWidth,
        height = video.videoHeight,

        // Context object for working with the canvas.
        context = hidden_canvas.getContext('2d');

    // Set the canvas to the same dimensions as the video.
    hidden_canvas.width = width;
    hidden_canvas.height = height;

    // Draw a copy of the current frame from the video on the canvas.
    context.drawImage(video, 0, 0, width, height);

    // Get an image dataURL from the canvas.
    var imageDataURL = hidden_canvas.toDataURL('image/png');

    // Set the dataURL as source of an image element, showing the captured photo.
    image.setAttribute('src', imageDataURL); 

}
    function test(){
        navigator.camera.getPicture(onSucces, onFail,{
            quality:50,
            destinationType:camera.DestinationType.DATA_URL,
            saveToPhotoAlbum: true
        });
        function onSucces(imageURI){
            image.src = "data:image/jpeg;base64," + imageURI;
        }
        function onFail(){
             alert("permition denied");
        }
    }
/*function takeSnapshot(){

    //...

    // Get an image dataURL from the canvas.
    var imageDataURL = hidden_canvas.toDataURL('image/png');

    // Set the href attribute of the download button.
    document.querySelector('#dl-btn').href = imageDataURL;
}*/
});
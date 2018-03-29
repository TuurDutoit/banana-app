var username,logins,check,url,spam;
spam=0;
window.setInterval(
     function () {
         if(spam > 0){
            spam = spam - 1;
         }
     }, 3000);
CreateUser();

function CreateUser(){
    event.preventDefault();
    
    if(!localStorage.getItem("username")){
        username = document.getElementById("username").value;
        check=true;
        spam+=1;
        //empty
        if((username.length !== 0 || username.trim()) && spam <= 2){
            getJSON('https://openwhisk.eu-gb.bluemix.net/api/v1/web/1062096%40ucn.dk_dev/default/read-document-user-sequence.json').then(function(data) {
                if(data != null && data.docs.length !== 0){
                    logins = Object.keys(data.docs);

                    for(var a=0;a<logins.length;a++){
                        if(data.docs[logins[a]].username === username){
                            localStorage.setItem("username", username);
                            window.location.replace("calorie-counter.html");
                            check=false;
                            a=logins.length;
                        }
                    }
                    if(check){
                        url = "https://openwhisk.eu-gb.bluemix.net/api/v1/web/1062096%40ucn.dk_dev/default/save-document-user-sequence.json?username=";
                        username = escapeHTML(username);
                        getJSON(url+escapeHTML(username));
                        localStorage.setItem("username", username);
                        window.location.replace("settings.html");
                    }
                }
            });
        }
    }else{
        window.location.replace("calorie-counter.html");
    }
}

function getJSON(url) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('get', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      var status = xhr.status;
      if (status == 200) {
        resolve(xhr.response);
      } else {
        reject(status);
      }
    };
    xhr.send();
  });
}
function escapeHTML (unsafe_str) {
    return unsafe_str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/\'/g, '&#39;')
      .replace(/\//g, '&#x2F;')
}

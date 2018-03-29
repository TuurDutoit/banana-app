function getProfile(){
        var username = localStorage.getItem("username"),
        heigth = document.getElementsByTagName("input")[0],
        weigth = document.getElementsByTagName("input")[1],
        age = document.getElementsByTagName("input")[2],
        gender = document.getElementsByTagName("select")[0],
        activity = document.getElementById("range"),gender;
    
     getJSON('https://openwhisk.eu-gb.bluemix.net/api/v1/web/1062096%40ucn.dk_dev/default/read-document-user-sequence.json?username='+ username).then(function(data) {
                if(data != null){
                    weigth.value = data.docs[0].weight;
                    heigth.value = data.docs[0].height;
                    age.value = data.docs[0].age;
                    
                    if(data.docs[0].sex === "male"){
                        gender.value = "male";
                    }else if(data.docs[0].sex === "female"){
                        gender.value = "female";
                    }
                    activity.value = data.docs[0].excercise;
                }
     });
    
}

function sendProfile(){
    event.preventDefault();
    
    var username = localStorage.getItem("username"),
        heigth = document.getElementsByTagName("input")[0].value,
        weigth = document.getElementsByTagName("input")[1].value,
        age = document.getElementsByTagName("input")[2].value,
        gender = document.getElementsByTagName("select")[0].value,
        activity = document.getElementById("range").value;
        console.log(weigth);
    
        if(heigth != 0){
           if(weigth != 0){
                if(age != 0){
                    getJSON('https://openwhisk.eu-gb.bluemix.net/api/v1/web/1062096%40ucn.dk_dev/default/update-document-user-sequence.json?username='+ username + '&height='+ heigth+ '&weight='+ weigth+'&age='+ age+ '&sex='+ gender + '&excercise='+ activity)
                        .then(() => location = 'calorie-counter.html');
                } else {
                    alert("Your age is missing");
                }
            }else{
                alert("Your weigth is missing");
            }
        }else{
            alert("Your heigth is missing");
        }
}

var getJSON = function(url) {
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

document.addEventListener('deviceready', function() {

    var username = localStorage.getItem('username');
    
    if(!username) {
        console.log('user not found in localStorage; using a demo user');
        username = '';
        //window.location = 'login.html';
    }
    
    var historyUrl = 'https://openwhisk.eu-gb.bluemix.net/api/v1/web/1062096%40ucn.dk_dev/default/read-document-history-sequence.json?username=' + encodeURIComponent(username);
    fetch(historyUrl)
        .then(res => res.json())
        .then(data => data.error ? Promise.reject(data.error) : data.doc)
        .then(items => {
            items.forEach(item => {
                item.timestamp = new Date(new Date(item.timestamp));
                item.calories = +item.calories;
            });
            items.sort((a, b) => b.timestamp - a.timestamp);

            var $main = document.querySelector('main');
            
            var pros = document.getElementById("pros");
            console.log(items);
        
            pros.style.width="80%";
        
            // Total calorie count
            var $header = document.createElement('header');
            $header.className = 'calorie-count';
            $main.appendChild($header);

            var $title = document.createElement('h1');
            $title.className = 'calorie-count-num';
            $title.textContent = items.reduce((total, item) => total + item.calories, 0);
            $header.appendChild($title);

            var $titleSub = document.createElement('span');
            $titleSub.className = 'calorie-count-sub';
            $titleSub.textContent = 'kcal';
            $header.appendChild($titleSub);

            // Items list
            var $items = document.createElement('ol');
            $items.className = 'items';
            $main.appendChild($items);

            items.forEach(item => {
                var $item = document.createElement('li');
                $item.className = 'item';
                $items.appendChild($item);

                var $name = document.createElement('span');
                $name.className = 'item-name item-left';
                $name.textContent = item.name;
                $item.appendChild($name);

                var $itemRight = document.createElement('div');
                $itemRight.className = 'item-right';
                $item.appendChild($itemRight);

                var $cals = document.createElement('span');
                $cals.className ='item-cals';
                $itemRight.appendChild($cals);

                var $calsNum = document.createElement('span');
                $calsNum.className = 'item-cals-num';
                $calsNum.textContent = item.calories;
                $cals.appendChild($calsNum);

                var $calsSub = document.createElement('span');
                $calsSub.className = 'item-cals-sub';
                $calsSub.textContent = 'kcal';
                $cals.appendChild($calsSub);

                var $time = document.createElement('span');
                $time.className = 'item-time';
                $time.textContent = item.timestamp.getHours().toString().padStart(2, "0") + ':' + item.timestamp.getMinutes().toString().padStart(2, "0");
                $itemRight.appendChild($time);
            });
        })
    var username = localStorage.getItem('username'),
historyUrl = 'https://openwhisk.eu-gb.bluemix.net/api/v1/web/1062096%40ucn.dk_dev/default/read-document-history-sequence.json?username=' + encodeURIComponent(username),
    total,maxtotal;

    fetch(historyUrl)
        .then(res => res.json())
        .then(data => data.error ? Promise.reject(data.error) : data.doc)
        .then(items => {
                    items.forEach(item => {
                        item.timestamp = new Date(new Date(item.timestamp));
                        item.calories = +item.calories;
                    });
        
            total = items.reduce((total, item) => total + item.calories, 0);
        
            getJSON('https://openwhisk.eu-gb.bluemix.net/api/v1/web/1062096%40ucn.dk_dev/default/read-document-user-sequence.json?username='+ username).then(function(data) {
                    if(data != null){
                        if (data.docs.length === 0) {
                            console.log(data);
                        }else{
                            var userInfo = data.docs[0],
                                prosElement = document.getElementById("pros"),
                                pros = Number(total)/Number(maxtotal),
                                prosView = document.getElementsByClassName("procentage")[0];
                                pros=1;
                            
                            if(data.docs[0].sex === "male"){ 
                                maxtotal = 66 + (13.7 * userInfo.weight) + (5 * userInfo.height) - (6.8 * userInfo.age);
                            }else{
                                maxtotal = 655 + (9.6 * userInfo.weight) + (1.8 * luserInfo.height) - (4.7 * userInfo.age);
                            }
                                if(pros < 99.99){
                                    prosElement.style.width = pros+"%";
                                    prosView.innerHTML= pros+'%';
                                }else{
                                    prosElement.style.width = "100%";
                                }
                                prosView.innerHTML= pros+'%';
                            
                        }
                    }
            });

        .catch(console.error);
        });
    
}, false);

function getJSON(url){
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

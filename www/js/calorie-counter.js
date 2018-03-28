document.addEventListener('deviceready', function() {

    var user = localStorage.getItem('user');

    if(!user) {
        console.log('user not found in localStorage; using a demo user');
        user = {
            "weight": "0",
            "username": "test",
            "_id": "3f6f384894b57ecf18742661f30205ea",
            "excercise": "5",
            "height": "0",
            "age": "0",
            "sex": "yes",
            "_rev": "3-1b10b527faf000dc4e91ade4bfe4bf34"
        };
        //window.location = 'login.html';
    }
    
    var historyUrl = 'https://openwhisk.eu-gb.bluemix.net/api/v1/web/1062096%40ucn.dk_dev/default/read-document-history-sequence.json?username=' + encodeURIComponent(user.username);
    
    fetch(historyUrl)
        .then(res => res.json())
        .then(data => data.error ? Promise.reject(data.error) : data.doc)
        .then(items => {
            items.forEach(item => {
                // This weird construct is required to convert to the local timezone
                item.timestamp = new Date(new Date(item.timestamp));
                item.calories = +item.calories;
            });
            items.sort((a, b) => b.timestamp - a.timestamp);

            var $main = document.querySelector('main');

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
        .catch(console.error);

}, false);
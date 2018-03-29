var NUTRITIONIX_API_URL = 'https://www.nutritionix.com/track-api/v2/natural/nutrients';
var HISTORY_API_URL = 'https://openwhisk.eu-gb.bluemix.net/api/v1/web/1062096%40ucn.dk_dev/default/save-document-history-sequence.json';
var WATSON_API_URL = 'https://banana-server.eu-gb.mybluemix.net/uploadpic';


document.addEventListener('deviceready', function() {

    navigator.camera.getPicture(cameraSuccess, cameraFail);

    function cameraFail(message) {
        console.error('Camera: capture failed: ' + message);
        if(message !== 'No Image Selected') {
            alert('Something went wrong when trying to take a picture.');
        }
    }

    function cameraSuccess(url) {
        var $main = document.querySelector('main');

        var $img = document.createElement('div');
        $img.className = 'frame';
        $img.style.backgroundImage = 'url(' + url + ')';
        $main.appendChild($img);

        getLabelsFromImage(url)
            .then(res => JSON.parse(res.response))
            .then(data => {
                if(data.classes.length === 0 || data.classes[0] === 'non-food') {
                    createUIForFoods();
                }
                else {
                    return fetch(NUTRITIONIX_API_URL, nutritionixOptionsForLabels(data.classes))
                        .then(res => res.json())
                        .then(createUIForFoods)
                }
            })
            .catch(e => {
                console.error(e);
                alert('An occurred when processing image');
            });
    }

    function nutritionixOptionsForLabels(labels) {
        return {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: labels.join(', '),
                line_delimited: false,
                use_raw_foods: true,
                use_branded_foods: false
            })
        }
    }

    function createUIForFoods(data) {
        var $main = document.querySelector('main');

        if(data == null) {
            var $nonFood = document.createElement('p');
            $nonFood.className = 'non-food';
            $nonFood.textContent = 'Watson didn\'t recognize any food in this picture.';
            $main.appendChild($nonFood);
            return;
        }

        var foods = data.foods;

        // Create the form for amount / unit input
        var $wrapper = document.createElement('form');
        $wrapper.className = 'foods-form';
        $wrapper.addEventListener('submit', onSubmitItems);
        $main.appendChild($wrapper);

        var $foods = document.createElement('ul');
        $foods.className = 'foods-list';
        $wrapper.appendChild($foods);

        // List all foods in picture
        foods.forEach((food, i) => {
            food.alt_measures.sort((a, b) => a.seq - b.seq);
            var calsPerG = food.nf_calories / food.serving_weight_grams;

            var $food = document.createElement('li');
            $food.className = 'food';
            $foods.appendChild($food);

            var $foodTop = document.createElement('div');
            $foodTop.className = 'food-top';
            $food.appendChild($foodTop);

            var $name = document.createElement('h2');
            $name.className = 'food-name';
            $name.textContent = food.food_name;
            $foodTop.appendChild($name);

            var $del = document.createElement('span')
            $del.className = 'food-del';
            $del.textContent = 'x';
            $del.addEventListener('click', () => { $foods.removeChild($food); updateCals(); });
            $foodTop.appendChild($del);

            // Input[type=number] for ampount and select for serving size
            var $formula = document.createElement('div');
            $formula.className = 'food-formula';
            $food.appendChild($formula);

            var $amount = document.createElement('input');
            $amount.type = 'number';
            $amount.min = 1;
            $amount.step = 1;
            $amount.name = 'amount-' + i;
            $amount.value = food.serving_qty;
            $amount.className = 'food-amount';
            $amount.addEventListener('input', updateCals);
            $formula.appendChild($amount);

            var $measures = document.createElement('select');
            $measures.className = 'food-measures';
            $measures.addEventListener('change', updateCals);
            $formula.appendChild($measures);

            food.alt_measures.forEach(measure => {
                var $measure = document.createElement('option');
                $measure.textContent = measure.measure + ' (' + (measure.serving_weight / measure.qty) + 'g)';
                $measure.value = measure.measure;

                if(measure.measure === food.serving_unit) {
                    $measure.selected = 'selected';
                }

                $measures.appendChild($measure);
            });

            // Show number of calories
            // Updates as amount and/or serving size are updated
            var $cals = document.createElement('div');
            $cals.className = 'food-cals';
            $food.appendChild($cals);

            var $calsPrefix = document.createElement('span');
            $calsPrefix.className = 'food-cals-prefix';
            $calsPrefix.textContent = '=';
            $cals.appendChild($calsPrefix);

            var $calsNum = document.createElement('span');
            $calsNum.className = 'food-cals-num';
            $calsNum.textContent = Math.round(food.nf_calories);
            $cals.appendChild($calsNum);

            var $calsUnit = document.createElement('span');
            $calsUnit.className = 'food-cals-unit';
            $calsUnit.textContent = 'kcal';
            $cals.appendChild($calsUnit);

            function updateCals() {
                var index = $measures.selectedIndex;
                var measure = food.alt_measures[index];
                $calsNum.textContent = Math.round(measure.serving_weight / measure.qty * $amount.value * calsPerG);
                updateTotalCals();
            }
        });

        // Bottom row:
        // Shows total calories and the save button
        var $bottom = document.createElement('div');
        $bottom.className = 'food-bottom';
        $wrapper.appendChild($bottom);

        var $total = document.createElement('div');
        $total.className = 'food-total';
        $bottom.appendChild($total);

        var $totalKey = document.createElement('span');
        $totalKey.className = 'food-total-key';
        $totalKey.textContent = 'TOTAL:';
        $total.appendChild($totalKey);

        var $totalNum = document.createElement('span');
        $totalNum.className = 'food-total-num';
        $total.appendChild($totalNum);

        var $totalUnit = document.createElement('span');
        $totalUnit.className = 'food-total-unit';
        $totalUnit.textContent = 'kcal';
        $total.appendChild($totalUnit);

        var $submit = document.createElement('button');
        $submit.className = 'btn food-btn';
        $submit.textContent = 'Save';
        $bottom.appendChild($submit);

        updateTotalCals();

        function updateTotalCals() {
            var $cals = Array.from($wrapper.querySelectorAll('.food-cals-num'));
            $totalNum.textContent = $cals.reduce((total, $cal) => total + parseInt($cal.textContent), 0);
        }
    }

    function getLabelsFromImage(url) {
        return Promise.resolve({response: JSON.stringify({classes: ['Apple', 'Banana']})});
        return new Promise((resolve, reject) => {
            var options = new FileUploadOptions();
            options.fileKey = 'myPhoto';
            options.fileName = url.substr(url.lastIndexOf('/') + 1);
            options.mimeType = 'image/jpeg';
            options.chunkedMode = false;
    
            var ft = new FileTransfer();
            ft.upload(url, encodeURI(WATSON_API_URL), resolve, reject, options);
        });
    }

    function onSubmitItems(e) {
        e.preventDefault();
        var $wrapper = e.target;
        var username = localStorage.getItem('username');
        var $items = $wrapper.querySelectorAll('.food');
        var items = Array.from($items).map(($item, i) => {
            var measure = $item.querySelector('.food-measures').value;
            var amount = +$item.querySelector('.food-amount').value;
            var name = $item.querySelector('.food-name').textContent;
            var serving =  amount + ' ' + measure;
            var calories = +$item.querySelector('.food-cals-num').textContent;

            return { name, serving, calories, username };
        });

        saveItems(items)
            .then(() => window.location = 'calorie-counter.html')
            .catch(e => {
                console.error(e);
                alert('Something went wrong when saving your meal.');
            });
    }

    function saveItems(items) {
        return Promise.all(items.map(item => {
            return fetch(HISTORY_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(item)
            });
        }));
    }

}, false);
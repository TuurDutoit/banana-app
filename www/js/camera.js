var NUTRITIONIX_API_URL = 'https://www.nutritionix.com/track-api/v2/natural/nutrients';
var WATSON_API_URL = '';
var DB_API_URL = '';


document.addEventListener('deviceready', function() {

    navigator.camera.getPicture(cameraSuccess, cameraFail);

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

        getLabelsFromImage(url)
            .then(labels => fetch(NUTRITIONIX_API_URL, nutritionixOptionsForLabels(labels)))
            .then(res => res.json())
            .then(createUIForFoods)
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
        var foods = data.foods;
        var $main = document.querySelector('main');

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

            var $name = document.createElement('h2');
            $name.className = 'food-name';
            $name.textContent = food.food_name;
            $food.appendChild($name);

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
        $submit.textContent = 'Save';
        $bottom.appendChild($submit);

        updateTotalCals();

        function updateTotalCals() {
            var $cals = Array.from($wrapper.querySelectorAll('.food-cals-num'));
            $totalNum.textContent = $cals.reduce((total, $cal) => total + parseInt($cal.textContent), 0);
        }
    }

    function getLabelsFromImage(url) {
        return Promise.resolve(['Apple', 'Banana']);
    }

    function onSubmitItems(e) {
        e.preventDefault();
        var $wrapper = e.target;
        var username = localStorage.getItem('username');
        var $items = $wrapper.querySelectorAll('.food');
        var items = Array.from($items).map(($item, i) => {
            var measure = $item.querySelector('.food-measures').value;
            var amount = +$item.querySelector('.food-amount').textContent;
            var name = $item.querySelector('.food-name').textContent;
            var serving =  amount + ' ' + measure;
            var calories = +$item.querySelector('.food-cals-num').textContent;

            return { name, serving, calories, username };
        });

        saveItems(items)
            .then(() => window.location = 'calorie-counter.html');
    }

    function saveItems(items) {
        console.log(items);
        return Promise.resolve();
    }

}, false);
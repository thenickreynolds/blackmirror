const second_ms = 1000;
const minute_ms = 60 * second_ms;
const hour_ms = 60 * minute_ms;

$('document').ready(function(){
    $('#loading').show();
	$('.content').hide();
	
	const saluation_tick = hour_ms;
	const time_tick = 10 * second_ms;
	const reload_tick = hour_ms;

	updateSaluation();
	setInterval(updateSaluation, saluation_tick);
	updateTime();
	setInterval(updateTime, time_tick);

	setInterval(function() { location.reload(); }, reload_tick);

	loadFromNetwork();
});

// const icons = {
// 	key: chanceflurries.png,
// 	key: chancerain.png,
// 	key: chancesleet.png,
// 	key: chancesnow.png,
// 	key: chancetstorms.png,
// 	key: clear.png,
// 	key: cloudy.png,
// 	key: flurries.png,
// 	key: fog.png,
// 	key: hazy.png,
// 	key: mostlycloudy.png,
// 	key: mostlysunny.png,
// 	key: nt_chanceflurries.png,
// 	key: nt_chancerain.png,
// 	key: nt_chancesleet.png,
// 	key: nt_chancesnow.png,
// 	key: nt_chancetstorms.png,
// 	key: nt_clear.png,
// 	key: nt_cloudy.png,
// 	key: nt_flurries.png,
// 	key: nt_fog.png,
// 	key: nt_hazy.png,
// 	key: nt_mostlycloudy.png,
// 	key: nt_mostlysunny.png,
// 	key: nt_partlycloudy.png,
// 	key: nt_partlysunny.png,
// 	key: nt_rain.png,
// 	key: nt_sleet.png,
// 	key: nt_snow.png,
// 	key: nt_sunny.png,
// 	key: nt_tstorms.png,
// 	key: nt_unknown.png,
// 	key: partlycloudy.png,
// 	key: partlysunny.png,
// 	key: rain.png,
// 	key: sleet.png,
// 	key: snow.png,
// 	key: sunny.png,
// 	key: tstorms.png,
// 	key: unknown.png,
// }

const weather_icons = {
	'00d': 'unknown.png',
	'01d': 'clear.png',
	'02d': 'cloudy.png',
	'03d': 'partlycloudy.png',
	'04d': 'partlysunny.png',
	'09d': 'chancerain.png',
	'10d': 'rain.png',
	'11d': 'tstorms.png',
	'13d': 'snow.png',
	'50d': 'hazy.png',
	'00n': 'nt_unknown.png',
	'01n': 'nt_clear.png',
	'02n': 'nt_cloudy.png',
	'03n': 'nt_partlycloudy.png',
	'04n': 'nt_partlysunny.png',
	'09n': 'nt_chancerain.png',
	'10n': 'nt_rain.png',
	'11n': 'nt_tstorms.png',
	'13n': 'nt_snow.png',
	'50n': 'nt_hazy.png',
};

const saluation_nouns = [ "person", "angel", "fox", "brute" ];
const saluation_adjectives = [ "sexy", "beautiful", "handsome", "amazing", "glorious", "picturesque", "admirable" ];

function random_between(low, high) {
	const range = high - low + 1;
	return Math.floor(Math.random() * range) + low;
}

function random_element(arr) {
	const elem = random_between(0, arr.length - 1);
	return arr[elem];
}

function getSalutationPrefix(time) {
	const morningSalutation = "Good morning you ";
	const daySalutation = "Good day you ";
	const eveningSalutation = "Good afternoon you ";
	const nightSalutation = "Good night you ";

	const hour = time.hour() + 1;

	if (hour >= 5 && hour <= 11) {
		return morningSalutation;
	}

	if (hour <= 13) {
		return daySalutation;
	}

	if (hour <= 18) {
		return eveningSalutation;
	}

	return nightSalutation;
}

function getSalutation(time) {
	const prefix = getSalutationPrefix(time);
	const noun = random_element(saluation_nouns);
	const adjective = random_element(saluation_adjectives);

	return prefix + adjective + " " + noun + "!";
}

function updateSaluation() {
	$('#salutation').text(getSalutation(moment()));
}

function updateTime() {
	const time = moment();

	$('#date').text(time.format("ddd Do MMM"));
	$('#time').text(time.format("h:mm"));
};

function calculateTemp(kelvin) {
	const celsius = Math.round(kelvin - 273.15);
	const fahrenheit = Math.round(((kelvin - 273.15) * 1.8) + 32);
	return {
		kelvin: kelvin,
		celsius: celsius,
		fahrenheit: fahrenheit
	};
}

function formatWeatherDescription(json) {
	const temp = calculateTemp(json.main.temp);
	const weather = json.weather[0];
	return temp.celsius + "&deg;C (" + temp.fahrenheit + "&deg;F) " + weather.main;
}

function getWeatherIcon(weather, force_day = false) {
	var icon_key = weather.icon;
	if (force_day) {
		icon_key = icon_key.replace("n", "d");
	}
	return "weather_icons/" + (weather_icons[icon_key] != undefined ? weather_icons[icon_key] : weather_icons['00d']);
}

function loadQuote() {
	$.getJSON("https://www.reddit.com/r/showerthoughts/top.json?sort=top&t=month&limit=20",function(json) {
		var rand=Math.floor(Math.random() * 20);
		var post=json.data.children[rand].data;
		var quote=post.title;
		var author=post.author;
		var quoteUrl="http://www.reddit.com"+post.permalink;

		$('#quote').html("\""+quote+"\"");
		$('#author').html(" - <a href='"+quoteUrl+"' target='_blank'>u/"+author+"</a>");
	});
}

function loadWeather() {
	$.ajax('http://api.openweathermap.org/data/2.5/weather?zip=94110,us&appid=21911463fcda2cf5698e65f90ed064f2', {
		dataType: 'jsonp',
		success: function(json) {
			$('#weather_city').text(json.name)

			$('#weather_image').attr('src', getWeatherIcon(json.weather[0]));
			$('#weather_description').html(formatWeatherDescription(json));
		}
	});

	$.ajax('http://api.openweathermap.org/data/2.5/forecast?zip=94110,us&appid=21911463fcda2cf5698e65f90ed064f2', {
		dataType: 'jsonp',
		success: function(json) {
			var tempDataset = [];
			var tempNameDataset = [];
			var now = moment();

			const container = $('#weather_forecast');
			container.empty();

			for (var i = 0; i < json.list.length; i++) {
				var forecast = json.list[i];
				var time = moment(forecast.dt_txt);

				if (time.hour() == 12) {
					var cell = $('<div class="weather_forecast_cell"></div>')
					cell.css('background-image', 'url(' + getWeatherIcon(forecast.weather[0], true) + ')');
					cell.text(time.format('ddd'));
					container.append(cell);
				}

				if (time.diff(now) < 24 * hour_ms) {
					var temp = calculateTemp(forecast.main.temp);
					tempDataset.push(temp.celsius);
					tempNameDataset.push(time.format('ha'));
				}
			}

			// new Chartist.Line('#weather_chart',
			// 	{ labels: tempNameDataset, series: [ tempDataset ] },
			// 	{
			// 		width: 800,
			// 		height: 150,
			// 		showArea: true,
			// 		lineSmooth: true,
			// 	});
		}
	});
}

function createCryptoText(json, symbol) {
	const quote = json['RAW'][symbol]['USD'];

	const price = quote['PRICE'];
	const change = quote['CHANGEPCT24HOUR'];

	return '<i class="cc ' + symbol + '"></i> $' + price + ', ' + '<span class="' + (change >= 0 ? 'positive' : 'negative') + '">' + Number(change).toFixed(1) + '%</span>';
}

function createStockText(stocks, symbol) {
	const quote = stocks[symbol].quote;
	const precentage = Number(quote.changePercent * 100).toFixed(1);
	return symbol + ': $' + quote.latestPrice + ", " + '<span class="' + (quote.changePercent >= 0 ? 'positive' : 'negative') + '">' + precentage + "%</span>";
}

function loadCrypto() {
	const coins = [ 'ETH', 'BTC', 'BCH', 'LTC' ];
	$.ajax('https://min-api.cryptocompare.com/data/pricemultifull?fsyms=' + coins.join(',') + '&tsyms=USD', {
		success: function(json) {
			const container = $('#crypto');
			container.html($.map(coins, function(coin) { return createCryptoText(json, coin); }).join(' | '));
		}
	});
	
	const stocks = [ 'TSLA', 'FB', 'TWTR', 'ZNGA' ];
	$.ajax('https://api.iextrading.com/1.0/stock/market/batch?symbols=' + stocks.join(',') + '&types=quote,chart&range=1m&last=5', {
		success: function(json) {
			const container = $('#stocks');
			container.html($.map(stocks, function(stock) { return createStockText(json, stock); }).join(' | '));
		}
	});
}

function loadFromNetwork() {
	loadQuote();
	loadWeather();
	loadCrypto();

	// TODO remove or actually fix loading
	$('#loading').fadeOut("fast");
	$('.content').fadeIn("slow");
};
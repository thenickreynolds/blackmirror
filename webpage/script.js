'use strict';

var second_ms = 1000;
var minute_ms = 60 * second_ms;
var hour_ms = 60 * minute_ms;

var stock_divider = '<span class="stock_divider"> | </span>';

var weather_icons = {
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
	'50n': 'nt_hazy.png'
};

var saluation_nouns = ["person", "angel", "fox", "brute"];
var saluation_adjectives = ["sexy", "beautiful", "handsome", "amazing", "glorious", "picturesque", "admirable"];

$('document').ready(function () {
	$('#loading').show();
	$('.content').hide();

	var saluation_tick = hour_ms;
	var time_tick = 10 * second_ms;
	var reload_tick = hour_ms;

	updateSaluation();
	setInterval(updateSaluation, saluation_tick);
	updateTime();
	setInterval(updateTime, time_tick);

	setInterval(function () {
		return location.reload();
	}, reload_tick);

	loadFromNetwork();
});

function random_between(low, high) {
	var range = high - low + 1;
	return Math.floor(Math.random() * range) + low;
}

function random_element(arr) {
	var elem = random_between(0, arr.length - 1);
	return arr[elem];
}

function getSalutationPrefix(time) {
	var morningSalutation = "Good morning you ";
	var daySalutation = "Good day you ";
	var eveningSalutation = "Good afternoon you ";
	var nightSalutation = "Good night you ";

	var hour = time.hour() + 1;

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
	var prefix = getSalutationPrefix(time);
	var noun = random_element(saluation_nouns);
	var adjective = random_element(saluation_adjectives);

	return prefix + adjective + " " + noun + "!";
}

function updateSaluation() {
	$('#salutation').text(getSalutation(moment()));
}

function updateTime() {
	var time = moment();

	$('#date').text(time.format("ddd Do MMM"));
	$('#time').text(time.format("h:mm"));
};

function calculateTemp(kelvin) {
	var celsius = Math.round(kelvin - 273.15);
	var fahrenheit = Math.round((kelvin - 273.15) * 1.8 + 32);
	return {
		kelvin: kelvin,
		celsius: celsius,
		fahrenheit: fahrenheit
	};
}

function formatWeatherDescription(json) {
	var temp = calculateTemp(json.main.temp);
	var weather = json.weather[0];
	return temp.celsius + "&deg;C (" + temp.fahrenheit + "&deg;F) " + weather.main;
}

function getWeatherIcon(weather) {
	var force_day = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

	var icon_key = weather.icon;
	if (force_day) {
		icon_key = icon_key.replace("n", "d");
	}
	return "weather_icons/" + (weather_icons[icon_key] != undefined ? weather_icons[icon_key] : weather_icons['00d']);
}

function loadQuote() {
	$.getJSON("https://www.reddit.com/r/showerthoughts/top.json?sort=top&t=month&limit=20", function (json) {
		var rand = Math.floor(Math.random() * 20);
		var post = json.data.children[rand].data;
		var quote = post.title;
		var author = post.author;
		var quoteUrl = "http://www.reddit.com" + post.permalink;

		$('#quote').html("\"" + quote + "\"");
		$('#author').html(" - <a href='" + quoteUrl + "' target='_blank'>u/" + author + "</a>");
	});
}

function loadWeather() {
	$.ajax('http://api.openweathermap.org/data/2.5/weather?zip=94110,us&appid=21911463fcda2cf5698e65f90ed064f2', {
		dataType: 'jsonp',
		success: function success(json) {
			$('#weather_city').text(json.name);

			$('#weather_image').attr('src', getWeatherIcon(json.weather[0]));
			$('#weather_description').html(formatWeatherDescription(json));
		}
	});

	$.ajax('http://api.openweathermap.org/data/2.5/forecast?zip=94110,us&appid=21911463fcda2cf5698e65f90ed064f2', {
		dataType: 'jsonp',
		success: function success(json) {
			var container = $('#weather_forecast');
			container.empty();

			for (var i = 0; i < json.list.length; i++) {
				var forecast = json.list[i];
				var time = moment(forecast.dt_txt);

				if (time.hour() == 12) {
					var cell = $('<div class="weather_forecast_cell"></div>');
					cell.css('background-image', 'url(' + getWeatherIcon(forecast.weather[0], true) + ')');
					cell.text(time.format('ddd'));
					container.append(cell);
				}
			}
		}
	});
}

function createAmountHtml(symbolHtml, amount, percentChange) {
	var className = percentChange >= 0 ? 'positive' : 'negative';
	var colorOpen = '<span class="' + className + '">';
	var colorClose = '</span>';
	var changeHtml = Number(percentChange).toFixed(1) + '%';
	return symbolHtml + ' ' + colorOpen + changeHtml + colorClose + ' $' + amount;
}

function createCryptoText(json, symbol) {
	var quote = json['RAW'][symbol]['USD'];
	return createAmountHtml('<i class="cc ' + symbol + '"></i>&nbsp;', quote['PRICE'], quote['CHANGEPCT24HOUR']);
}

function createStockText(stocks, symbol) {
	var quote = stocks[symbol].quote;
	return createAmountHtml('<b>' + symbol + '</b>', quote.latestPrice, quote.changePercent * 100);
}

function loadCrypto() {
	var coins = ['ETH', 'BTC', 'BCH', 'LTC'];
	$.ajax('https://min-api.cryptocompare.com/data/pricemultifull?fsyms=' + coins.join(',') + '&tsyms=USD', {
		success: function success(json) {
			var container = $('#crypto');
			container.html($.map(coins, function (coin) {
				return createCryptoText(json, coin);
			}).join(stock_divider));
		}
	});

	var stocks = ['TSLA', 'FB', 'TWTR', 'ZNGA'];
	$.ajax('https://api.iextrading.com/1.0/stock/market/batch?symbols=' + stocks.join(',') + '&types=quote,chart&range=1m&last=5', {
		success: function success(json) {
			var container = $('#stocks');
			container.html($.map(stocks, function (stock) {
				return createStockText(json, stock);
			}).join(stock_divider));
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


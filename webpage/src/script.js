const second_ms = 1000;
const minute_ms = 60 * second_ms;
const hour_ms = 60 * minute_ms;

const stock_divider = '<span class="stock_divider"> | </span>';

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

$('document').ready(() => {
    $('#loading').show();
	$('.content').hide();
	
	const saluation_tick = hour_ms;
	const time_tick = 10 * second_ms;
	const reload_tick = hour_ms;

	updateSaluation();
	setInterval(updateSaluation, saluation_tick);
	updateTime();
	setInterval(updateTime, time_tick);

	setInterval(() => location.reload(), reload_tick);

	loadFromNetwork();
});

function random_between(low, high) {
	const range = high - low + 1;
	return Math.floor(Math.random() * range) + low;
}

function random_element(arr) {
	const elem = random_between(0, arr.length - 1);
	return arr[elem];
}

function getSalutationPrefix(time) {
	const morningSalutation = "Good morning you";
	const daySalutation = "Good day you";
	const eveningSalutation = "Good afternoon you";
	const nightSalutation = "Good night you";

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

	return `${prefix} ${adjective} ${noun}!`;
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
	return `${temp.celsius}&deg;C (${temp.fahrenheit}&deg;F) ${weather.main}`;
}

function getWeatherIcon(weather, force_day = false) {
	const icon_key = force_day ? weather.icon : weather.icon.replace("n", "d");
	const icon_file = weather_icons[icon_key] != undefined ? weather_icons[icon_key] : weather_icons['00d'];
	return `weather_icons/${icon_file}`;
}

function loadQuote() {
	$.getJSON("https://www.reddit.com/r/showerthoughts/top.json?sort=top&t=month&limit=20", json => {
		const rand = Math.floor(Math.random() * 20);
		const post = json.data.children[rand].data;
		const quote = post.title;
		const author = post.author;
		const quoteUrl = "http://www.reddit.com"+post.permalink;

		$('#quote').html(`&quot;${quote}&quot;`);
		$('#author').html(` - <a href="${quoteUrl}" target="_blank">u/${author}</a>`);
	});
}

function loadWeather() {
	$.ajax('http://api.openweathermap.org/data/2.5/weather?zip=94110,us&appid=21911463fcda2cf5698e65f90ed064f2', {
		dataType: 'jsonp',
		success: json => {
			$('#weather_city').text(json.name)

			$('#weather_image').attr('src', getWeatherIcon(json.weather[0]));
			$('#weather_description').html(formatWeatherDescription(json));
		}
	});

	$.ajax('http://api.openweathermap.org/data/2.5/forecast?zip=94110,us&appid=21911463fcda2cf5698e65f90ed064f2', {
		dataType: 'jsonp',
		success: json => {
			json.list.forEach(forecast => forecast.moment = moment(forecast.dt_txt));
			const elements = json.list
				.filter(forecast => forecast.moment.hour() == 12)
				.map(forecast => {
					const icon = getWeatherIcon(forecast.weather[0], true);
					return $('<div class="weather_forecast_cell"></div>')
						.css('background-image', `url(${icon})`)
						.text(forecast.moment.format('ddd'));
				});
			$('#weather_forecast').empty().append(elements);
		}
	});
}

function createAmountHtml(symbolHtml, amount, percentChange) {
	const className = percentChange >= 0 ? 'positive' : 'negative';
	const formattedNumber = Number(percentChange).toFixed(1);
	return `${symbolHtml} <span class="${className}">${formattedNumber}%</span>`;
}

function createCryptoHtml(json, symbol) {
	const quote = json['RAW'][symbol]['USD'];
	return createAmountHtml(`<i class="cc ${symbol}"></i>&nbsp;`, quote['PRICE'], quote['CHANGEPCT24HOUR']);
}

function createStockHtml(stocks, symbol) {
	const quote = stocks[symbol].quote;
	return createAmountHtml(`<b>${symbol}</b>`, quote.latestPrice, quote.changePercent * 100);
}

function loadCrypto() {
	const coins = [ 'ETH', 'BTC', 'BCH', 'LTC' ];
	$.ajax(`https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${coins.join(',')}&tsyms=USD`, {
		success: json => {
			const container = $('#crypto');
			container.html($.map(coins, coin => createCryptoHtml(json, coin)).join(stock_divider));
		}
	});
	
	const stocks = [ 'TSLA', 'FB', 'TWTR', 'ZNGA' ];
	$.ajax(`https://api.iextrading.com/1.0/stock/market/batch?symbols=${stocks.join(',')}&types=quote,chart&range=1m&last=5`, {
		success: json => {
			const container = $('#stocks');
			container.html($.map(stocks, stock => createStockHtml(json, stock)).join(stock_divider));
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
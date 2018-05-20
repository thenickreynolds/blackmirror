
$('document').ready(function(){
    $('#loading').show();
	$('.content').hide();

	const clock_tick = 10 * 1000;
	const reload_tick = 60 * 60 * 1000;

	updateTime();

	setInterval(function() { updateTime(); }, clock_tick);

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

function updateTime() {
	const time = moment();

	$('#salutation').text(getSalutation(time));

	$('#date').text(time.format("ddd - Do MMM").toUpperCase());
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

function getWeatherIcon(json) {
	const icon_key = json.weather[0].icon;
	return "weather_icons/" + (weather_icons[icon_key] != undefined ? weather_icons[icon_key] : weather_icons['00d']);
}

function convertCrypto(json) {
	const btc_raw = json.USD;

	const btc = Math.round(json.USD);
	const bch = Math.round(btc_raw / json.BCH);
	const eth = Math.round(btc_raw / json.ETH);
	const xrp = Math.round(btc_raw / json.XRP);
	const ltc = Math.round(btc_raw / json.LTC);
	
	return {
		btc: btc,
		bch: bch,
		eth: eth,
		xrp: xrp,
		ltc: ltc,
	}
}

function loadFromNetwork() {
	$.getJSON("https://www.reddit.com/r/showerthoughts/top.json?sort=top&t=month&limit=20",function(json) {
		var rand=Math.floor(Math.random() * 20);
		var post=json.data.children[rand].data;
		var quote=post.title;
		var author=post.author;
		var quoteUrl="http://www.reddit.com"+post.permalink;

		$('#quote').html("\""+quote+"\"");
		$('#author').html(" - <a href='"+quoteUrl+"' target='_blank'>u/"+author+"</a>");
	});

	//http://api.openweathermap.org/data/2.5/weather?zip=94040,us&appid=21911463fcda2cf5698e65f90ed064f2
	//http://api.openweathermap.org/data/2.5/forecast?zip=94040,us&appid=21911463fcda2cf5698e65f90ed064f2
	$.ajax('http://api.openweathermap.org/data/2.5/weather?zip=94040,us&appid=21911463fcda2cf5698e65f90ed064f2', {
		dataType: 'jsonp',
		success: function(json) {
			$('#weather_city').text(json.name)
			$('#weather_image').attr('src', getWeatherIcon(json));
			$('#weather_description').html(formatWeatherDescription(json));
		}
	});

	// TODO add stocks, add arrows or green/red indicator
	$.ajax('https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=ETH,BTC,XRP,BCH,USD,LTC', {
		success: function(json) {
			const values = convertCrypto(json);
			
			$('#stock').text("ETH: $" + values.eth + ", BTC: $" + values.btc + ", BCH: $" + values.bch + ", LTC: $" + values.ltc);
		}
	});

	$('#loading').fadeOut("fast");
	$('.content').fadeIn("slow");
};
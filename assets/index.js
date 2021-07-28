
const key = '8437d2962b91cf6eeb3cb5ece2aa05e2';
const dateFormat = 'MM/DD/YYYY';

var current = {}

$('#search').on('click',function(event){
    var city = $('#city').val();
    updateCity(city);
})

function updateCity(city){
    var queryURL = "http://api.openweathermap.org/data/2.5/weather?units=imperial&q=" + city + "&appid=" + key;
    fetch(queryURL)
    .then(response => response.json())
    .then(function(data){
        var lat = data.coord.lat;
        var lon = data.coord.lon;
        console.log('data', data);

        fetch(`https://api.openweathermap.org/data/2.5/onecall?units=imperial&lat=${lat}&lon=${lon}&exclude=hourly,minutely&appid=${key}`)
        .then(response => response.json())
        .then(function(data2){
            console.log('data2', data2);

            renderToday({
                city: data.name,
                temp: data2.current.temp,
                wind: data2.current.wind_speed,
                humidity: data2.current.humidity,
                uvIndex: data2.current.uvi,
                icon: 'http://openweathermap.org/img/wn/' + data2.current.weather[0].icon + '.png'
            });
            renderFiveDay(data2.daily);

        });
    });
    //console.log($('#city').val());
}

function renderToday(data){
    var todayEl = $('#today');

    var cityEl = $('<p>').addClass('h2').text(`${data.city}(${moment().format(dateFormat)})`);
    cityEl.append($('<img>').attr('src', data.icon));

    todayEl.empty()
        .append(cityEl)
        .append($('<p>').text(`Temp: ${data.temp}°F`))
        .append($('<p>').text(`Wind: ${data.wind} MPH`))
        .append($('<p>').text(`Humidity: ${data.humidity} %`))
        .append($('<p>').text(`UV Index: ${data.uvIndex}`));
}

function renderFiveDay(data){
    console.log('renderFiveDay', data);
    var days = [];
    for(var i=0; i < 5; i++){
        var dayEl = $('<div>').addClass('day')
        .append($('<p>').text(moment().add(i+1, 'days').format(dateFormat)))
        .append($('<p>').append($('<img>').attr('src', iconUrl(data[i].weather[0].icon))))
        .append($('<p>').text(`Temp: ${data[i].temp.day}°F`))
        .append($('<p>').text(`Wind: ${data[i].wind_speed} MPH`))
        .append($('<p>').text(`Humidity: ${data[i].humidity} %`))
        days.push(dayEl);
    }

    $('#five-day').empty().append(days);
}


function iconUrl(data){
    return 'http://openweathermap.org/img/wn/' + data + '.png';
}
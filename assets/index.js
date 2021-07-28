
const key = '8437d2962b91cf6eeb3cb5ece2aa05e2';
const dateFormat = 'MM/DD/YYYY';

var current = {}

function between(x, min, max) {
    return x >= min && x <= max;
  }

function updateCity(city){
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?units=imperial&q=" + city + "&appid=" + key;
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
                icon: iconUrl(data2.current.weather[0].icon)
            });
            renderFiveDay(data2.daily);

            addCityToLS(data.name);
            renderCityHistory();

        });
    });
    //console.log($('#city').val());
}

function renderToday(data){
    $('.day-header').removeClass('hidden');

    var todayEl = $('#today');

    var cityEl = $('<p>').addClass('h4').text(`${data.city}(${moment().format(dateFormat)})`);
    cityEl.append($('<img>').attr('src', data.icon));

    todayEl.empty()
        .append(cityEl)
        .append($('<p>').text(`Temp: ${data.temp}°F`))
        .append($('<p>').text(`Wind: ${data.wind} MPH`))
        .append($('<p>').text(`Humidity: ${data.humidity} %`))
        .append($('<p>').text('UV Index: ')
            .append($('<span>').text(data.uvIndex).addClass('uv-index')));

    // update uv index color
    if(between(data.uvIndex, 0, 2.99)){
        $('.uv-index').css('background-color', '#289500').css('color', 'white');
    }
    if(between(data.uvIndex, 3, 5.99)){
        $('.uv-index').css('background-color', '#F7E401').css('color', 'black');
    }
    if(between(data.uvIndex, 6, 7.99)){
        $('.uv-index').css('background-color', '#F85900').css('color', 'white');
    }
    if(between(data.uvIndex, 8, 10.99)){
        $('.uv-index').css('background-color', '#D80010').css('color', 'white');
    }
    if(between(data.uvIndex, 11, 100)){
        $('.uv-index').css('background-color', '#6B49C8').css('color', 'white');
    }



}

function renderFiveDay(data){
    console.log('renderFiveDay', data);
    var days = [];
    for(var i=0; i < 5; i++){
        var dayEl = $('<div>').addClass('day')
        .append($('<p>').addClass('font-weight-bold').text(moment().add(i+1, 'days').format(dateFormat)))
        .append($('<p>').append($('<img>').attr('src', iconUrl(data[i].weather[0].icon))))
        .append($('<p>').text(`Temp: ${data[i].temp.day}°F`))
        .append($('<p>').text(`Wind: ${data[i].wind_speed} MPH`))
        .append($('<p>').text(`Humidity: ${data[i].humidity} %`))
        days.push(dayEl);
    }

    $('#five-day').empty().append(days);
}


function iconUrl(data){
    return 'https://openweathermap.org/img/wn/' + data + '.png';
}


function readLS(){
    // read from local storage
    var weatherHistory = JSON.parse(localStorage.getItem('weatherHistory'));
    // verify data integrity
    if(!weatherHistory || weatherHistory.version != '1.0'){
        weatherHistory = {};
        weatherHistory.version = '1.0';
        weatherHistory.cities = [];
    }
    return weatherHistory;
}


function addCityToLS(city)
{
    var weatherHistory = readLS();
    var i = weatherHistory.cities.indexOf(city);
    if(i === -1){
        // city does not exist in list
        weatherHistory.cities.unshift(city);
        if(weatherHistory.cities.length > 5){
            weatherHistory.cities.splice(4, weatherHistory.cities.length - 5);
        }

    }else{
        // city is already on the list
        // move to top
        weatherHistory.cities.splice(i, 1);
        weatherHistory.cities.unshift(city);
    }
    // save to local storage
    localStorage.setItem('weatherHistory', JSON.stringify(weatherHistory));
}

function renderCityHistory(){
    var weatherHistory = readLS();
    var cities = weatherHistory.cities;

    var historyEl = $('#city-history');
    var citiesEl = [];

    cities.forEach(function (city){
        var c = $('<div>').addClass('row')
        .append(
            $('<div>').addClass('col-12')
            .append(
                $('<input>').addClass('btn btn-secondary col-12 m-1 btn-history').attr('type', 'button').attr('value', city)
                )
            );
        citiesEl.push(c);
    });

    historyEl.empty().append(citiesEl);

}

$('main').on('click', '.btn-history', function(event){
    //console.log(event);
    var city = $(event.target).val();
    //console.log('Clicked City', city);
    updateCity(city);

});

$(document).ready(function(){
    $('#city').keypress(function(e){
      if(e.keyCode==13)
      $('#search').click();
    });
});


$('#search').on('click',function(event){
    var city = $('#city').val();
    $('#city').val('');
    updateCity(city);
})

renderCityHistory();

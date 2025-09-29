async function getCity() {
  const city = document.getElementById("city").value;
  const apiKey = "757acea68ff28cefc163ada583d895d5";
  const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${apiKey}`;

  const response = await fetch(geoUrl);
  const data = await response.json();

  if (data.length === 0) {
    alert("City not found.");
    return;
  }

  if (data.length === 1) {
    const { lat, lon } = data[0];
    getWeatherAndForecast(lat, lon);
  } else {
    let message = "Multiple matches found. Please select one:\n";
    data.forEach((place, i) => {
      message += `${i + 1}. ${place.name}, ${place.state || ''}, ${place.country}\n`;
    });

    const choice = prompt(message);
    const selected = data[parseInt(choice) - 1];

    if (selected) {
      getWeatherAndForecast(selected.lat, selected.lon);
    } else {
      alert("Invalid selection.");
    }
  }
}

async function getWeatherAndForecast(lat, lon) {
  const apiKey = "757acea68ff28cefc163ada583d895d5";

  // URLs for current weather and forecast
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

  try {
    // Fetch both simultaneously
    const [weatherResponse, forecastResponse] = await Promise.all([
      fetch(weatherUrl),
      fetch(forecastUrl)
    ]);

    const weatherData = await weatherResponse.json();
    const forecastData = await forecastResponse.json();

    if (weatherData.cod !== 200) {
      document.getElementById("weather").innerHTML = `<p>Error: ${weatherData.message}</p>`;
      return;
    }

    if (forecastData.cod !== "200") {
      document.getElementById("weather").innerHTML = `<p>Error: ${forecastData.message}</p>`;
      return;
    }

    displayWeatherAndForecast(weatherData, forecastData);

  } catch (error) {
    document.getElementById("weather").innerHTML = `<p>Error fetching data</p>`;
    console.error(error);
  }
}

function getWeatherIconClass(iconCode) {
  const iconMap = {
    "01d": "wi-day-sunny",
    "01n": "wi-night-clear",
    "02d": "wi-day-cloudy",
    "02n": "wi-night-alt-cloudy",
    "03d": "wi-cloud",
    "03n": "wi-cloud",
    "04d": "wi-cloudy",
    "04n": "wi-cloudy",
    "09d": "wi-showers",
    "09n": "wi-showers",
    "10d": "wi-day-rain",
    "10n": "wi-night-alt-rain",
    "11d": "wi-thunderstorm",
    "11n": "wi-thunderstorm",
    "13d": "wi-snow",
    "13n": "wi-snow",
    "50d": "wi-fog",
    "50n": "wi-fog",
  };

  return iconMap[iconCode] || "wi-na";
}

function displayWeatherAndForecast(weatherData, forecastData) {
  const weatherDiv = document.getElementById("weather");
  weatherDiv.innerHTML = ''; // clear previous content

  // Current weather
  const location = `${weatherData.name}, ${weatherData.sys.country}`;
  const description = weatherData.weather[0].description;
  const temp = weatherData.main.temp;
  const feelsLike = weatherData.main.feels_like;
  const humidity = weatherData.main.humidity;
  const windSpeed = weatherData.wind.speed;
  const iconCode = weatherData.weather[0].icon;
  const iconClass = getWeatherIconClass(iconCode);

  const currentWeatherHTML = `
    <div style="text-align:center; margin-bottom: 30px;">
      <h3>Current Weather</h3>
      <p><strong>${location}</strong></p>
      <i class="wi ${iconClass}" style="font-size: 72px; color: #f39c12;"></i>
      <p style="text-transform: capitalize;">${description}</p>
      <p><strong>Temperature:</strong> ${temp}\u00B0C</p>
      <p><strong>Feels Like:</strong> ${feelsLike}\u00B0C</p>
      <p><strong>Humidity:</strong> ${humidity}%</p>
      <p><strong>Wind Speed:</strong> ${windSpeed} m/s</p>
    </div>
  `;

  weatherDiv.insertAdjacentHTML('beforeend', currentWeatherHTML);

  // 5-day forecast (midday forecasts)
  const dailyForecasts = forecastData.list.filter(item => item.dt_txt.includes("12:00:00"));

  let forecastHTML = `<h3>5-Day Forecast</h3><div style="display: flex; justify-content: space-between;">`;

  dailyForecasts.forEach(day => {
    const date = new Date(day.dt * 1000);
    const dayString = date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    const iconCode = day.weather[0].icon;
    const iconClass = getWeatherIconClass(iconCode);
    const temp = Math.round(day.main.temp);
    const desc = day.weather[0].description;

    forecastHTML += `
      <div style="background: rgba(255, 255, 255, 0.2); border-radius: 12px; padding: 10px; width: 70px; text-align: center; font-size: 0.85rem;">
        <strong>${dayString}</strong><br>
        <i class="wi ${iconClass}" style="font-size: 36px; color: #f39c12;"></i><br>
        <span style="text-transform: capitalize;">${desc}</span><br>
        <span><strong>${temp}\u00B0C</strong></span>
      </div>
    `;
  });

  forecastHTML += `</div>`;

  weatherDiv.insertAdjacentHTML('beforeend', forecastHTML);
}

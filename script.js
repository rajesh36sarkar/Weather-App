// ===============================
// SEARCH INPUT
// ===============================
const searchbox = document.querySelector(".search-box");
const weatherDisplay = document.getElementById("weather-display");
const forecastContainer = document.getElementById("forecast");
const forecastCards = document.getElementById("forecast-cards");
const loadingSpinner = document.getElementById("loading");
const errorMessage = document.getElementById("error-message");
const errorText = document.getElementById("error-text");

// -------------------------------
searchbox.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    getCityWeather(searchbox.value);
    searchbox.value = ""
  }
});

// ===============================
// AUTO LOCATION ON LOAD
// ===============================
window.onload = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        fetchWeather(pos.coords.latitude, pos.coords.longitude, "Your Location");
      },
      () => getCityWeather("London")
    );
  } else {
    getCityWeather("London");
  }
};

// ===============================
// GET CITY → Lat/Lon
// ===============================
function getCityWeather(city) {
  resetUI();

  fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`)
    .then(r => r.json())
    .then(data => {
      if (!data.results) throw new Error("City not found");

      const c = data.results[0];
      fetchWeather(c.latitude, c.longitude, c.name);
    })
    .catch(err => displayError(err.message));
}

// ===============================
// FETCH WEATHER
// ===============================
function fetchWeather(lat, lon, locationName) {
  resetUI();

  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`
    + `&current_weather=true`
    + `&daily=temperature_2m_max,temperature_2m_min,weathercode`
    + `&hourly=relativehumidity_2m,pressure_msl,apparent_temperature,windspeed_10m`
    + `&timezone=auto`;

  fetch(url)
    .then(r => r.json())
    .then(data => {
      displayCurrentWeather(data, locationName);
      displayForecast(data.daily);
    })
    .catch(() => displayError("Weather data unavailable"))
    .finally(() => loadingSpinner.classList.add("hidden"));
}

// ===============================
function resetUI() {
  weatherDisplay.classList.add("hidden");
  forecastContainer.classList.add("hidden");
  errorMessage.classList.add("hidden");
  loadingSpinner.classList.remove("hidden");
}

// ===============================
// DISPLAY CURRENT WEATHER
// ===============================
function displayCurrentWeather(data, locationName) {
  const cur = data.current_weather;
  const daily = data.daily;
  const hourly = data.hourly;

  document.getElementById("city").innerText = locationName;
  document.getElementById("date").innerText = new Date().toDateString();

  document.getElementById("temp").innerHTML =
    `${Math.round(cur.temperature)}<span class="text-5xl">°C</span>`;

  document.getElementById("weather").innerText = convertWeatherCode(cur.weathercode);
  document.getElementById("hi-low").innerText =
    `${Math.round(daily.temperature_2m_min[0])}°C / ${Math.round(daily.temperature_2m_max[0])}°C`;

  document.getElementById("humidity").innerText = hourly.relativehumidity_2m[0];
  document.getElementById("wind").innerText = cur.windspeed;
  document.getElementById("feels-like").innerText = Math.round(hourly.apparent_temperature[0]);
  document.getElementById("pressure").innerText = Math.round(hourly.pressure_msl[0]);

  weatherDisplay.classList.remove("hidden");

  updateBackground(convertWeatherCode(cur.weathercode));
}

// ===============================
// 7 DAY FORECAST
// ===============================
function displayForecast(daily) {
  forecastCards.innerHTML = "";

  for (let i = 0; i < 7; i++) {

    const day = new Date(daily.time[i]).toLocaleDateString("en-US", { weekday: "short" });
    const icon = weatherIcon(daily.weathercode[i]);

    forecastCards.innerHTML += `
      <div class="bg-white/20 backdrop-blur-md p-4 rounded-xl text-center fade-in-slow">
        <div class="font-semibold">${day}</div>
        <div class="text-5xl my-2">${icon}</div>
        <div class="font-bold">${Math.round(daily.temperature_2m_max[i])}°C</div>
        <div class="text-xs text-white/70">${convertWeatherCode(daily.weathercode[i])}</div>
      </div>
    `;
  }

  forecastContainer.classList.remove("hidden");
}

// ===============================
// CONVERT WEATHER CODE
// ===============================
function convertWeatherCode(code) {
  const map = {
    0: "Clear",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Cloudy",
    45: "Fog",
    48: "Icy Fog",
    51: "Light Drizzle",
    61: "Light Rain",
    63: "Rain",
    65: "Heavy Rain",
    71: "Snow",
    80: "Rain Showers",
    95: "Thunderstorm"
  };
  return map[code] || "Unknown";
}

// ICONS (Emoji style)
function weatherIcon(code) {
  const icons = {
    0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️",
    45: "🌫️", 48: "🌫️",
    51: "🌦️",
    61: "🌧️", 63: "🌧️", 65: "🌧️",
    71: "❄️",
    80: "🌧️",
    95: "🌩️"
  };
  return icons[code] || "❓";
}

// ===============================
// SMOOTH HD BACKGROUND SYSTEM
// ===============================
function updateBackground(condition) {
  const b = document.body;
  const c = condition.toLowerCase();

  const bg = {
    clear: "https://images.unsplash.com/photo-1501973801540-537f08ccae7b",
    cloud: "https://images.unsplash.com/photo-1499346030926-9a72daac6c63",
    rain:  "https://images.unsplash.com/photo-1526676037777-3490f52a3e59",
    snow:  "https://images.unsplash.com/photo-1516455207990-7a41ce80f7ee",
    fog:   "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66"
  };

  let img = bg.clear;

  if (c.includes("rain")) img = bg.rain;
  else if (c.includes("cloud")) img = bg.cloud;
  else if (c.includes("snow")) img = bg.snow;
  else if (c.includes("fog")) img = bg.fog;

  b.classList.add("fade-bg");
  setTimeout(() => {
    b.style.backgroundImage = `url('${img}')`;
    b.classList.remove("fade-bg");
  }, 400);
}

// ===============================
function displayError(msg) {
  errorText.innerText = msg;
  errorMessage.classList.remove("hidden");
}

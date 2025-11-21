// API config
const api = {
  key: "fcc8de7015bbb202209bbf0261babf4c",
  base: "https://api.openweathermap.org/data/2.5/"
};

// DOM elements
const searchbox = document.querySelector(".search-box");
const weatherDisplay = document.getElementById("weather-display");
const loadingSpinner = document.getElementById("loading");
const errorMessage = document.getElementById("error-message");
const errorText = document.getElementById("error-text");

// Listener for Enter key
searchbox.addEventListener("keypress", (e) => {
  if (e.key === "Enter") getResults(searchbox.value);
});

// Fetch weather
function getResults(query) {
  weatherDisplay.classList.add("hidden");
  errorMessage.classList.add("hidden");
  loadingSpinner.classList.remove("hidden");

  fetch(`${api.base}weather?q=${query}&units=metric&appid=${api.key}`)
    .then(res => {
      if (!res.ok) {
        return res.json().then(err => {
          throw new Error(err.message || "City not found.");
        });
      }
      return res.json();
    })
    .then(displayResults)
    .catch(err => displayError(err.message))
    .finally(() => loadingSpinner.classList.add("hidden"));
}

// Show weather on UI
function displayResults(data) {
  document.getElementById("city").innerText = `${data.name}, ${data.sys.country}`;
  document.getElementById("date").innerText = dateBuilder(new Date());

  document.getElementById("temp").innerHTML =
    `${Math.round(data.main.temp)}<span class="text-5xl">°C</span>`;

  document.getElementById("weather").innerText = data.weather[0].main;
  document.getElementById("hi-low").innerText =
    `${Math.round(data.main.temp_min)}°C / ${Math.round(data.main.temp_max)}°C`;

  // Detailed stats
  document.getElementById("humidity").innerText = data.main.humidity;
  document.getElementById("wind").innerText = (data.wind.speed * 3.6).toFixed(1);
  document.getElementById("feels-like").innerText = Math.round(data.main.feels_like);
  document.getElementById("pressure").innerText = data.main.pressure;

  // Reveal card
  weatherDisplay.classList.remove("hidden");

  // Background update
  setDynamicBackground(data.weather[0].main);

  // Extreme heat alert
  if (data.main.temp > 40) {
    displayError("🔥 Extreme Temperature Alert! Over 40°C!");
  }
}

// Create readable date
function dateBuilder(d) {
  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  const days = [
    "Sunday","Monday","Tuesday","Wednesday",
    "Thursday","Friday","Saturday"
  ];

  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// Background changer
function setDynamicBackground(condition) {
  const body = document.body;
  const c = condition.toLowerCase();
  let img = "bg.jpg";

  if (c.includes("rain")) img = "https://placehold.co/1920x1080/4F4457/ffffff?text=Rainy";
  else if (c.includes("cloud")) img = "https://placehold.co/1920x1080/778899/ffffff?text=Cloudy";
  else if (c.includes("clear")) img = "https://placehold.co/1920x1080/4682B4/ffffff?text=Clear";
  else if (c.includes("snow")) img = "https://placehold.co/1920x1080/B0E0E6/ffffff?text=Snowy";
  else if (c.includes("mist") || c.includes("fog") || c.includes("haze"))
    img = "https://placehold.co/1920x1080/A9A9A9/ffffff?text=Misty";

  body.style.backgroundImage = `url('${img}')`;
}

// Error message
function displayError(msg) {
  errorText.innerText = msg;
  errorMessage.classList.remove("hidden");
  weatherDisplay.classList.add("hidden");
}

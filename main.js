// --- API Configuration ---
const api = {
  // Your OpenWeatherMap API key. Replace with your actual key if different.
  key: "fcc8de7015bbb202209bbf0261babf4c",
  // Base URL for OpenWeatherMap API weather data
  base: "https://api.openweathermap.org/data/2.5/",
};

// --- DOM Element References ---
// Selecting the search input box
const searchbox = document.querySelector(".search-box");
// Selecting the div that displays weather information
const weatherDisplay = document.getElementById("weather-display");
// Selecting the loading spinner element
const loadingSpinner = document.getElementById("loading");
// Selecting the error message container
const errorMessage = document.getElementById("error-message");
// Selecting the span inside the error message to display text
const errorText = document.getElementById("error-text");

// --- Event Listeners ---
// Attaches an event listener to the search box to detect 'keypress' events.
// When the 'Enter' key is pressed, the setQuery function is called.
searchbox.addEventListener("keypress", setQuery);

// --- Functions ---

/**
 * Handles the keypress event on the search input.
 * If the 'Enter' key is pressed, it triggers the weather data fetch.
 * @param {KeyboardEvent} evt - The keyboard event object.
 */
function setQuery(evt) {
  if (evt.key === "Enter") {
    getResults(searchbox.value);
  }
}

/**
 * Fetches weather data from the OpenWeatherMap API based on the provided query (city name).
 * Displays a loading spinner during the fetch operation and handles success/error states.
 * @param {string} query - The city name to search for.
 */
function getResults(query) {
  // Hide previous weather data and any existing error messages
  weatherDisplay.classList.add("hidden");
  errorMessage.classList.add("hidden");
  // Show the loading spinner to indicate data is being fetched
  loadingSpinner.classList.remove("hidden");

  // Construct the API URL with the query, units (metric), and API key
  fetch(`${api.base}weather?q=${query}&units=metric&APPID=${api.key}`)
    .then((response) => {
      // Check if the HTTP response was successful (status code 200-299)
      if (!response.ok) {
        // If not successful, parse the error message from the API response (if available)
        // and throw an error with a custom or API-provided message.
        return response.json().then((err) => {
          throw new Error(
            err.message || "City not found. Please enter a valid city name."
          );
        });
      }
      // If successful, parse the JSON response body
      return response.json();
    })
    .then((data) => {
      // If data fetch is successful, display the results on the UI
      displayResults(data);
    })
    .catch((error) => {
      // Catch any errors during the fetch or JSON parsing and display an error message
      displayError(error.message);
    })
    .finally(() => {
      // Always hide the loading spinner, regardless of success or failure
      loadingSpinner.classList.add("hidden");
    });
}

/**
 * Displays the fetched weather data on the web page.
 * Updates city, date, temperature, weather condition, and high/low temperatures.
 * Also triggers background image change and checks for extreme temperatures.
 * @param {object} weather - The weather data object received from the API.
 */
function displayResults(weather) {
  // Update city and country
  document.getElementById(
    "city"
  ).innerText = `${weather.name}, ${weather.sys.country}`;
  // Update the current date
  document.getElementById("date").innerText = dateBuilder(new Date());

  // Update temperature with a degree symbol
  document.getElementById("temp").innerHTML = `${Math.round(
    weather.main.temp
  )}<span class="font-medium text-4xl sm:text-5xl">°c</span>`;
  // Update weather condition (e.g., "Clouds", "Rain")
  document.getElementById("weather").innerText = weather.weather[0].main;
  // Update high and low temperatures
  document.getElementById("hi-low").innerText = `${Math.round(
    weather.main.temp_min
  )}°c / ${Math.round(weather.main.temp_max)}°c`;

  // Make the weather display card visible with a fade-in animation
  weatherDisplay.classList.remove("hidden");

  // Call function to dynamically change background based on weather condition
  setDynamicBackground(weather.weather[0].main);

  // Check for extreme temperature and display an alert if over 40°C
  if (weather.main.temp > 40) {
    displayError("🔥 Extreme Temperature Alert! It's over 40°C!");
  }
}

/**
 * Builds a formatted date string from a Date object.
 * Example: "Saturday 17 August 2025"
 * @param {Date} d - The Date object to format.
 * @returns {string} The formatted date string.
 */
function dateBuilder(d) {
  let months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  let day = days[d.getDay()];
  let date = d.getDate();
  let month = months[d.getMonth()];
  let year = d.getFullYear();

  return `${day} ${date} ${month} ${year}`;
}

/**
 * Changes the background image of the body based on the weather condition.
 * Uses placeholder images for specific conditions and 'bg.jpg' as fallback.
 * @param {string} weatherCondition - The main weather condition (e.g., "Clouds", "Rain").
 */
function setDynamicBackground(weatherCondition) {
  const body = document.body;
  let imageUrl;

  const condition = weatherCondition.toLowerCase();

  // Assign specific placeholder images based on keywords in the weather condition
  if (condition.includes("rain")) {
    imageUrl = "https://placehold.co/1920x1080/4F4457/ffffff?text=Rainy";
  } else if (condition.includes("cloud")) {
    imageUrl = "https://placehold.co/1920x1080/778899/ffffff?text=Cloudy";
  } else if (condition.includes("clear") || condition.includes("sun")) {
    imageUrl = "https://placehold.co/1920x1080/4682B4/ffffff?text=Clear+Sky";
  } else if (condition.includes("snow")) {
    imageUrl = "https://placehold.co/1920x1080/B0E0E6/ffffff?text=Snowy";
  } else if (
    condition.includes("mist") ||
    condition.includes("haze") ||
    condition.includes("fog")
  ) {
    imageUrl = "https://placehold.co/1920x1080/A9A9A9/ffffff?text=Misty";
  } else {
    // Fallback to the default 'bg.jpg' if no specific condition matches
    imageUrl = "bg.jpg";
  }

  // Apply the chosen background image
  body.style.backgroundImage = `url('${imageUrl}')`;
}

/**
 * Displays an error message on the page.
 * Hides the weather display if an error occurs.
 * @param {string} message - The error message to display.
 */
function displayError(message) {
  errorText.innerText = message;
  errorMessage.classList.remove("hidden"); // Show the error message container
  weatherDisplay.classList.add("hidden"); // Hide the weather display when an error occurs
}

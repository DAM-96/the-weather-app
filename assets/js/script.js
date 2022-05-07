// Define page elements
let citySearchTextbox = document.getElementById("search-city-textbox");
let citySearchButton = document.getElementById("search-city-button");

let htmlCityData = {
    cityName : document.getElementById("city-name"),
    forecastIcon : document.getElementById("curr-city-weather-icon"),
    temperature : document.getElementById("temperature-data"),
    wind : document.getElementById("wind-data"),
    humidity : document.getElementById("humidity-data"),
    uvIndex : document.getElementById("uv-index-data"),
    forecastContainer : document.getElementById("future-weather-container"),
    infoPanels : document.getElementsByClassName("info-panel")
};

let searchHistoryContainer = document.getElementById("search-history");

let recentSearches = localStorage.getItem("recentCitySearches");

// API Configurations
 
const apiKey = "3746ad040f2bba488df537172b0ffc19";

let geolocationAPI = {
    baseURL : "https://api.openweathermap.org/geo/1.0/direct?q=",
    cityQuery : "Atlanta",
    country : "",
    state : "",
    resultsLimit : {
        limit : 2,
        get query(){
            return `&limit=${this.limit}`;
        }
    },
    apiKeyString : `&appid=${apiKey}`,
    get fullQuery() {
        return `${this.baseURL}${this.cityQuery}${this.resultsLimit.query}${this.apiKeyString}`;
    }
}

let weatherDataAPI = {
    baseURL : "https://api.openweathermap.org/data/2.5/onecall?",
    location : {
        lat : "",
        lon : ""
    },
    units : "metric",
    apiKeyString : `&appid=${apiKey}`,
    get fullQuery() {
        return `${this.baseURL}lat=${this.location.lat}&lon=${this.location.lon}${this.apiKeyString}&units=${this.units}`;
    }
}

let weatherData = {};
const initialDisplayedCity = "Atlanta";

// Function declarations

function startSite() {
    citySearchButton.addEventListener("click", searchCity);
    renderSearchHistory();
}

function searchCity(event) {

    event.preventDefault();

    let cityQuery = citySearchTextbox.value;
    console.log("Searching for city info: ", cityQuery);
    if(cityQuery == "" || cityQuery == null) {
        displayInvalidSearch();
    } else {
        console.log("City Query: ",cityQuery)
        getCityInfo(cityQuery)
    }
}

function displayInvalidSearch(noResults = false) {
    if(noResults){
        console.log("No entries were found for this search");
    } else {
        console.log("Unable to search for this entry");
    }
}

function getCityInfo(cityQuery = initialDisplayedCity) {
    // Search for city info
    geolocationAPI.cityQuery = cityQuery;
    fetch(geolocationAPI.fullQuery).then(response => {
        return response.json();
    }).then( data => {
        console.log(data);

        // Get city lat and lon; and search for weather data
        try {
            geolocationAPI.cityQuery = data[0].name;
            geolocationAPI.country = data[0].country;
            geolocationAPI.state = data[0].state;
            weatherDataAPI.location.lat = data[0].lat;
            weatherDataAPI.location.lon = data[0].lon;
            fetch(weatherDataAPI.fullQuery).then(response => {
                return response.json();
            }).then(data => {
                renderWeatherData(data);
                renderForecastCards(data.daily);
            });
        } catch(err) {
            console.error("Error: No entries were found for this query\n", err);
            displayInvalidSearch(true)
        }
    });
}

function renderWeatherData(data) {
    const currDate = new Date();
    console.log(data)
    let country = "";
    let state = "";

    // Poplate weather data in HTML

    //Title
    if (geolocationAPI.country != "" && geolocationAPI.country != null) country = `, ${geolocationAPI.country}`;
    if (geolocationAPI.state != "" && geolocationAPI.state != null) state = `, ${geolocationAPI.state}`;
    let actualSearch = `${geolocationAPI.cityQuery}${state}${country}`
    htmlCityData.cityName.textContent = `${actualSearch} (${currDate.getDate()}/${currDate.getMonth()}/${currDate.getFullYear()})`;
    htmlCityData.forecastIcon.src = `https://openweathermap.org/img/wn/${data.current.weather[0].icon}@2x.png`;

    //Data
    htmlCityData.temperature.textContent = `Temperature: ${data.current.temp}° C`;
    htmlCityData.wind.textContent = `Wind Speed: ${data.current.wind_speed} m/s`;
    htmlCityData.humidity.textContent = `Humidity: ${data.current.humidity} %`;
    htmlCityData.uvIndex.textContent = `UV Index: ${data.current.uvi}`;

    changeElementsDisplay(htmlCityData.infoPanels, "flex");
    
    console.log("Adding the following term to the search history: ", actualSearch);
    addToSearchHistory(actualSearch);
}

function renderForecastCards(daysData) {
    htmlCityData.forecastContainer.innerHTML = "";
    // Render 5 forecast cards
    for( let i = 1; i < 6; i++) {
        const dayDataDiv = document.createElement("div");
        let dayDate = new Date(daysData[i].dt*1000)
        const dayDateH3 = document.createElement("h3");
        const dayWeatherImg = document.createElement("img");
        const dayMaxTemperatureP = document.createElement("p");
        const dayMinTemperatureP = document.createElement("p");
        const dayWindDataP = document.createElement("p");
        const dayHumidityDataP = document.createElement("p");
        const dayDateText = document.createTextNode(`(${dayDate.getDate()}/${dayDate.getMonth()}/${dayDate.getFullYear()})`);
        dayWeatherImg.src = `https://openweathermap.org/img/wn/${daysData[i].weather[0].icon}@2x.png`;
        const dayMaxTemperatureText = document.createTextNode(`Max Temp: ${daysData[i].temp.max}° C`);
        const dayMinTemperatureText = document.createTextNode(`Min Temp: ${daysData[i].temp.min}° C`);
        const dayWindDataText = document.createTextNode(`Wind Speed: ${daysData[i].wind_speed} m/s`);
        const dayHumidityDataText = document.createTextNode(`Humidity: ${daysData[i].humidity} %`);

        dayDateH3.appendChild(dayDateText);
        dayMaxTemperatureP.appendChild(dayMaxTemperatureText);
        dayMinTemperatureP.appendChild(dayMinTemperatureText);
        dayWindDataP.appendChild(dayWindDataText);
        dayHumidityDataP.appendChild(dayHumidityDataText);

        dayDataDiv.appendChild(dayDateH3);
        dayDataDiv.appendChild(dayWeatherImg);
        dayDataDiv.appendChild(dayMaxTemperatureP);
        dayDataDiv.appendChild(dayMinTemperatureP);
        dayDataDiv.appendChild(dayWindDataP);
        dayDataDiv.appendChild(dayHumidityDataP);

        dayDataDiv.classList.add("card-body");

        htmlCityData.forecastContainer.appendChild(dayDataDiv);
    }
}

function addToSearchHistory(entry) {
    let recentSearches = localStorage.getItem("recentCitySearches");
    let tempHistory;
    if(recentSearches != null) {
        tempHistory = JSON.parse(recentSearches);
    } else {
        tempHistory = [];
    }
    console.log("Loading search history: ", tempHistory);
    if(tempHistory.indexOf(entry) == -1) tempHistory.push(entry);
    console.log("Saving search history: ", tempHistory);
    localStorage.setItem("recentCitySearches", JSON.stringify(tempHistory));

    renderSearchHistory();
}

function renderSearchHistory(){
    searchHistoryContainer.innerHTML = "";
    let recentSearches = localStorage.getItem("recentCitySearches");
    if(recentSearches != null) {
        tempHistory = JSON.parse(recentSearches);
    } else {
        tempHistory = [];
    }
    //Delete duplicates
    let cleanHistory = [...new Set(tempHistory)];

    console.log("Rendering search history from the following data: ", cleanHistory);
    //Create a button for each element in local storage
    for(let i = 0; i < cleanHistory.length; i++) {
        let quickSearchBtn = document.createElement("button");
        let quickSearchBtnText = document.createTextNode(cleanHistory[i]);
        quickSearchBtn.id = `quick-search-${i+1}`;
        quickSearchBtn.classList.add("quick-search")
        quickSearchBtn.classList.add("p-2")
        
        quickSearchBtn.appendChild(quickSearchBtnText);
        searchHistoryContainer.appendChild(quickSearchBtn);
    }

    runQuickSearch();
}

function runQuickSearch(){
    const quickSearchButtons = document.getElementsByClassName("quick-search");
    Array.from(quickSearchButtons).forEach(element => {
        element.addEventListener("click", event => {
            console.log("Searching for: ", event.target.innerText)
            getCityInfo(event.target.innerText)
            renderSearchHistory();
        });
    });
}

// Input a query with multiple document elements and set a display style
function changeElementsDisplay(elementsList, style) {
    Array.from(elementsList).forEach(element => {
        element.style.display = style;
    });
}

startSite()
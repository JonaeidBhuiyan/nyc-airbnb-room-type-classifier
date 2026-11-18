
/* =====================================
   FASTAPI CONFIGURATION
===================================== */

// Do not add /predict here.
const API_BASE_URL = "https://nyc-airbnb-room-type-classifier-oghy.onrender.com";


/* =====================================
   HTML ELEMENTS
===================================== */

const form = document.getElementById("prediction-form");
const submitButton = document.getElementById("submit-button");
const buttonLabel = submitButton.querySelector(".button-label");
const formError = document.getElementById("form-error");

const resultTitle = document.getElementById("result-title");
const resultDescription = document.getElementById("result-description");
const waitingPill = document.getElementById("waiting-pill");

const probabilitySection = document.getElementById("probability-section");
const probabilityList = document.getElementById("probability-list");
const resultMain = document.getElementById("result-main");


/* =====================================
   ERROR HANDLING
===================================== */

function showError(message) {
    formError.textContent = message;
}

function clearError() {
    formError.textContent = "";
}


/* =====================================
   LOADING BUTTON
===================================== */

function setLoading(isLoading) {
    submitButton.disabled = isLoading;

    buttonLabel.textContent = isLoading
        ? "Predicting..."
        : "Predict room type";

    submitButton.querySelector(".button-arrow").textContent =
        isLoading ? "…" : "↗";
}


/* =====================================
   GET FORM DATA
===================================== */

function getPayload(formData) {

    const number = (name) => {
        const value = formData.get(name);

        return value === "" ? null : Number(value);
    };

    return {
        latitude: number("latitude"),
        longitude: number("longitude"),
        price: number("price"),
        minimum_nights: number("minimum_nights"),
        number_of_reviews: number("number_of_reviews"),
        reviews_per_month: number("reviews_per_month"),
        calculated_host_listings_count: number("calculated_host_listings_count"),
        availability_365: number("availability_365"),

        neighbourhood_group: formData.get("neighbourhood_group"),

        neighbourhood: String(
            formData.get("neighbourhood") || ""
        ).trim()
    };
}


/* =====================================
   DISPLAY PREDICTION PROBABILITIES
===================================== */

function renderProbabilities(probabilities) {

    probabilityList.innerHTML = "";

    if (!probabilities || typeof probabilities !== "object") {
        probabilitySection.hidden = true;
        return;
    }

    const entries = Object.entries(probabilities)
        .sort((a, b) => Number(b[1]) - Number(a[1]));

    if (!entries.length) {
        probabilitySection.hidden = true;
        return;
    }

    probabilitySection.hidden = false;

    entries.forEach(([label, rawValue]) => {

        const value = Math.max(
            0,
            Math.min(1, Number(rawValue) || 0)
        );

        const percent = value * 100;

        const row = document.createElement("div");
        row.className = "prob-row";

        const labelLine = document.createElement("div");
        labelLine.className = "prob-label";

        const name = document.createElement("span");
        name.textContent = label;

        const percentage = document.createElement("b");
        percentage.textContent = `${percent.toFixed(1)}%`;

        const track = document.createElement("div");
        track.className = "prob-track";

        const fill = document.createElement("div");
        fill.className = "prob-fill";
        fill.style.width = `${percent}%`;

        labelLine.append(name, percentage);
        track.append(fill);
        row.append(labelLine, track);

        probabilityList.append(row);
    });
}


/* =====================================
   DISPLAY PREDICTION RESULT
===================================== */

function showResult(data) {

    const prediction =
        data.Predicted_room_type ??
        data.prediction ??
        data.predicted_room_type;

    if (!prediction) {
        throw new Error(
            "The API response did not contain a room type prediction."
        );
    }

    resultTitle.textContent = String(prediction);

    resultDescription.textContent =
        "This is the room type predicted by your trained machine-learning model for the listing details you entered.";

    waitingPill.hidden = true;

    const probabilities =
        data.Probability ?? data.probabilities;

    renderProbabilities(probabilities);

    resultMain.classList.add("has-result");

    document.querySelector(".result-panel").scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });
}


/* =====================================
   FORM SUBMISSION / API REQUEST
===================================== */

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    clearError();

    if (!form.reportValidity()) {
        return;
    }

    const payload = getPayload(new FormData(form));

    const requiredNumeric = [
        "latitude",
        "longitude",
        "price",
        "minimum_nights",
        "number_of_reviews",
        "calculated_host_listings_count",
        "availability_365"
    ];

    if (
        requiredNumeric.some(
            (key) => payload[key] === null
        )
    ) {
        showError("Please complete all required numeric fields.");
        return;
    }

    setLoading(true);

    try {

        const response = await fetch(
            `${API_BASE_URL.replace(/\/$/, "")}/predict`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(payload)
            }
        );

        let data;

        try {
            data = await response.json();
        } catch {
            throw new Error(
                "The API returned an unreadable response. Please try again."
            );
        }

        if (!response.ok) {

            const detail =
                typeof data.detail === "string"
                    ? data.detail
                    : "The prediction request failed.";

            throw new Error(detail);
        }

        showResult(data);

    } catch (error) {

        showError(
            error.name === "TypeError"
                ? "Could not connect to the prediction API. Check the API URL, CORS settings, and whether your Render service is awake."
                : error.message
        );

    } finally {

        setLoading(false);

    }
});


/* =====================================
   INTERACTIVE NYC MAP
===================================== */

const latitudeInput = form.querySelector('[name="latitude"]');
const longitudeInput = form.querySelector('[name="longitude"]');

let locationMap = null;
let locationMarker = null;


function initializeMap() {

    const mapElement = document.getElementById("location-map");

    // Check whether the map element exists.
    if (!mapElement) {
        console.error("Map container was not found.");
        return;
    }

    // Check whether Leaflet has loaded.
    if (typeof L === "undefined") {
        console.error("Leaflet map library could not load.");
        return;
    }

    // Default location: New York City.
    const defaultLocation = [40.7128, -74.0060];

    // Create the map.
    locationMap = L.map("location-map").setView(
        defaultLocation,
        11
    );

    // Load OpenStreetMap tiles.
    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',

            maxZoom: 19
        }
    ).addTo(locationMap);

    // Add the initial marker.
    locationMarker = L.marker(defaultLocation).addTo(locationMap);

    locationMarker.bindPopup(
        "Select your Airbnb listing location"
    );


    /* ---------------------------------
       CLICK MAP TO SELECT LOCATION
    --------------------------------- */

    locationMap.on("click", function(event) {

        const latitude = event.latlng.lat;
        const longitude = event.latlng.lng;

        // Fill latitude and longitude inputs.
        latitudeInput.value = latitude.toFixed(6);
        longitudeInput.value = longitude.toFixed(6);

        // Move marker to selected location.
        locationMarker.setLatLng(event.latlng);

        locationMarker
            .bindPopup(
                `Latitude: ${latitude.toFixed(6)}<br>
                 Longitude: ${longitude.toFixed(6)}`
            )
            .openPopup();

    });


    /* ---------------------------------
       UPDATE MAP FROM INPUT FIELDS
    --------------------------------- */

    function updateMarkerFromInputs() {

        const latitude = Number(latitudeInput.value);
        const longitude = Number(longitudeInput.value);

        if (
            latitudeInput.value === "" ||
            longitudeInput.value === "" ||
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude) ||
            latitude < -90 ||
            latitude > 90 ||
            longitude < -180 ||
            longitude > 180
        ) {
            return;
        }

        const newLocation = [latitude, longitude];

        locationMarker.setLatLng(newLocation);

        locationMap.setView(newLocation, 13);
    }

    latitudeInput.addEventListener(
        "change",
        updateMarkerFromInputs
    );

    longitudeInput.addEventListener(
        "change",
        updateMarkerFromInputs
    );

}


// Start the map.
initializeMap();

/*
  Set this to your deployed FastAPI service URL.
  Example: https://your-airbnb-api.onrender.com
  Do not add /predict here.
*/
const API_BASE_URL = "http://127.0.0.1:8000";

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

function showError(message) {
  formError.textContent = message;
}

function clearError() {
  formError.textContent = "";
}

function setLoading(isLoading) {
  submitButton.disabled = isLoading;
  buttonLabel.textContent = isLoading ? "Predicting..." : "Predict room type";
  submitButton.querySelector(".button-arrow").textContent = isLoading ? "…" : "↗";
}

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
    neighbourhood: String(formData.get("neighbourhood") || "").trim()
  };
}

function renderProbabilities(probabilities) {
  probabilityList.innerHTML = "";
  if (!probabilities || typeof probabilities !== "object") {
    probabilitySection.hidden = true;
    return;
  }

  const entries = Object.entries(probabilities).sort((a, b) => Number(b[1]) - Number(a[1]));
  if (!entries.length) {
    probabilitySection.hidden = true;
    return;
  }

  probabilitySection.hidden = false;
  entries.forEach(([label, rawValue]) => {
    const value = Math.max(0, Math.min(1, Number(rawValue) || 0));
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

function showResult(data) {
  const prediction = data.Predicted_room_type ?? data.prediction ?? data.predicted_room_type;
  if (!prediction) {
    throw new Error("The API response did not contain a room type prediction.");
  }

  resultTitle.textContent = String(prediction);
  resultDescription.textContent = "This is the room type predicted by your trained machine-learning model for the listing details you entered.";
  waitingPill.hidden = true;

  const probabilities = data.Probability ?? data.probabilities;
  renderProbabilities(probabilities);

  resultMain.classList.add("has-result");
  document.querySelector(".result-panel").scrollIntoView({ behavior: "smooth", block: "nearest" });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearError();

  if (API_BASE_URL.includes("YOUR-FASTAPI-SERVICE")) {
    showError("Add your deployed FastAPI URL in app.js before making predictions.");
    return;
  }

  if (!form.reportValidity()) return;

  const payload = getPayload(new FormData(form));
  if (Object.values(payload).some((value) => value === null || value === "")) {
    // reviews_per_month is optional; all other null values indicate missing numeric inputs.
    if (payload.reviews_per_month === null) {
      // Keep the optional field as null for the API's Optional[float] field.
    }
    const requiredNumeric = [
      "latitude", "longitude", "price", "minimum_nights",
      "number_of_reviews", "calculated_host_listings_count", "availability_365"
    ];
    if (requiredNumeric.some((key) => payload[key] === null)) {
      showError("Please complete all required numeric fields.");
      return;
    }
  }

  setLoading(true);
  try {
    const response = await fetch(`${API_BASE_URL.replace(/\/$/, "")}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error("The API returned an unreadable response. Please try again.");
    }

    if (!response.ok) {
      const detail = typeof data.detail === "string" ? data.detail : "The prediction request failed.";
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

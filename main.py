
from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import Literal, Optional
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import joblib


app = FastAPI()


app. add_middleware(
CORSMiddleware,
allow_origins=["*"],
allow_methods=["*"],
allow_headers=["*"]
)








COLUMNS = [
    "latitude",
    "longitude",
    "price",
    "minimum_nights",
    "number_of_reviews",
    "reviews_per_month",
    "calculated_host_listings_count",
    "availability_365",
    "neighbourhood_group",
    "neighbourhood"
]


class Features(BaseModel):

    latitude: float = Field(
        ...,
        ge=-90,
        le=90,
        description="Latitude coordinate of the Airbnb property"
    )

    longitude: float = Field(
        ...,
        ge=-180,
        le=180,
        description="Longitude coordinate of the Airbnb property"
    )

    price: float = Field(
        ...,
        gt=0,
        description="Price per night in USD"
    )

    minimum_nights: int = Field(
        ...,
        ge=1,
        le=365,
        description="Minimum nights required for booking"
    )

    number_of_reviews: int = Field(
        ...,
        ge=0,
        description="Total number of reviews"
    )

    reviews_per_month: Optional[float] = Field(
        None,
        ge=0,
        description="Average number of reviews per month"
    )

    calculated_host_listings_count: int = Field(
        ...,
        ge=0,
        description="Total listings managed by the host"
    )

    availability_365: int = Field(
        ...,
        ge=0,
        le=365,
        description="Number of available days per year"
    )

    neighbourhood_group: Literal[
        "Brooklyn",
        "Manhattan",
        "Queens",
        "Staten Island",
        "Bronx"
    ] = Field(
        ...,
        description="New York City borough"
    )

    neighbourhood: str = Field(
        ...,
        min_length=1,
        description="Specific neighbourhood name"
    )


from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
model = joblib.load(BASE_DIR / "Model_Pipeline.pkl")



@app.get("/")
def message():
    return {
        "message": "NYC Airbnb Room Type Classification API is working"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model_loaded": model is not None
    }


@app.post("/predict")
def predict(features: Features):

    row = pd.DataFrame(
        [features.model_dump()],
        columns=COLUMNS
    )

    try:
        prediction = model.predict(row)

        result = {
            "Predicted_room_type": str(prediction[0])
        }

        if hasattr(model, "predict_proba"):

            probability = model.predict_proba(row)

            result["Probability"] = {
                str(label): float(prob)
                for label, prob in zip(
                    model.classes_,
                    probability[0]
                )
            }

        return result

    except Exception as e:
        from fastapi import HTTPException

        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )


































































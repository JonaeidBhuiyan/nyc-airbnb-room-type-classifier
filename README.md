# NYC Airbnb Room Type Classifier

A Machine Learning web application that predicts the type of Airbnb room in New York City based on listing information.

## Project Overview

This project uses Machine Learning to classify Airbnb listings into three room categories:

- Entire home/apt
- Private room
- Shared room

Users can enter property details through a web interface and receive a predicted room type along with class probabilities.

## Live Demo

- **Frontend:** Add your deployed frontend URL here
- **Backend API:** Add your deployed FastAPI URL here
- **API Documentation:** Add your backend URL followed by `/docs`

## Tech Stack

**Machine Learning**
- Python
- Pandas
- NumPy
- Scikit-learn
- Random Forest Classifier
- Joblib

**Backend**
- FastAPI
- Pydantic
- Uvicorn

**Frontend**
- HTML
- CSS
- JavaScript

**Deployment**
- Render

## Dataset

Dataset: [New York City Airbnb Open Data](https://www.kaggle.com/datasets/dgomonov/new-york-city-airbnb-open-data)

The dataset contains Airbnb listing information from New York City.

## Input Features

The model uses the following features:

- Latitude
- Longitude
- Price
- Minimum Nights
- Number of Reviews
- Reviews Per Month
- Calculated Host Listings Count
- Availability 365
- Neighbourhood Group
- Neighbourhood

## Machine Learning Workflow

1. Data Loading
2. Exploratory Data Analysis (EDA)
3. Data Cleaning and Preprocessing
4. Handling Missing Values
5. Feature Transformation
6. One-Hot Encoding
7. Feature Scaling
8. Model Training
9. Model Comparison
10. Hyperparameter Tuning using RandomizedSearchCV
11. Model Evaluation
12. Saving the Final ML Pipeline

## Model Pipeline

The project uses a Scikit-learn Pipeline with:

- SimpleImputer
- PowerTransformer
- StandardScaler
- OneHotEncoder
- ColumnTransformer
- Random Forest Classifier

The trained pipeline is saved as `Model_Pipeline.pkl`.

## Project Structure

```text
NYC-Airbnb-Room-Type/
│
├── main.py
├── Model_Pipeline.pkl
├── requirements.txt
├── index.html
├── styles.css
├── app.js
├── README.md
└── .gitignore
```

## Run Locally

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Navigate to the project folder

```bash
cd "NYC Airbnb Room Type"
```

### 3. Create a virtual environment

```bash
python -m venv .venv
```

### 4. Activate the environment

Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

### 5. Install dependencies

```bash
pip install -r requirements.txt
```

### 6. Start the FastAPI server

```bash
python -m uvicorn main:app --reload
```

### 7. Open API documentation

Visit:

```text
http://127.0.0.1:8000/docs
```

Open `index.html` using VS Code Live Server to use the frontend locally.

## API Endpoint

**POST** `/predict`

Accepts Airbnb listing features and returns:

- Predicted room type
- Probability for each room category

## Future Improvements

- Improve model performance
- Add more advanced machine learning models
- Improve user experience
- Add additional evaluation metrics
- Expand the application to support more locations

## Author

Developed as a Machine Learning and Deployment Project.

**Technologies:** Python | Scikit-learn | FastAPI | HTML | CSS | JavaScript

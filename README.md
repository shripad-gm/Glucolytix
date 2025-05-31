
# GlucoLytix - Diabetes Management System

## Overview
GlucoLytix is a comprehensive diabetes management platform that helps users track their glucose levels, receive personalized health insights, and get AI-powered recommendations for diet and lifestyle adjustments. The system combines traditional diabetes prediction models with cutting-edge AI analysis for a holistic health management solution.

## Key Features
- **User Authentication**: Secure signup/login with JWT token-based authentication
- **Glucose Tracking**: Record and monitor blood glucose readings over time
- **AI-Powered Analytics**: Get detailed statistical analysis of glucose patterns
- **Personalized Recommendations**: Receive customized diet and exercise suggestions
- **Diabetes Prediction**: Machine learning model predicts diabetes risk based on health metrics
- **Comprehensive Dashboard**: View all health data in one place

## Technology Stack

### Backend
- Node.js with Express framework
- MongoDB for data storage
- Mongoose ODM
- Google Gemini API for AI-powered insights
- JWT for authentication

### Diabetes Prediction Service
- Python Flask microservice
- Scikit-learn machine learning model
- Joblib for model persistence
- PyMongo for database interaction

## System Architecture
The application follows a modern 3-tier architecture:
- **Presentation Layer**: Frontend (not included in this repo)
- **Application Layer**: Node.js backend handling business logic
- **Data Layer**: MongoDB for persistent storage
- **AI Services**:
  - Python prediction microservice
  - Google Gemini API integration

## Installation

### Prerequisites
- Node.js (v16+)
- MongoDB (v4.4+)
- Python (v3.8+)
- npm (v8+)

### Backend Setup
Clone the repository and navigate to the backend directory:
```bash
cd backend
```

Install dependencies:
```bash
npm install
```

Create a `.env` file with the following variables:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
PORT=5000
```

Start the server:
```bash
npm run dev
```

### Diabetes Prediction Service Setup
Navigate to the diabetes_prediction directory:
```bash
cd diabetes_prediction
```

Install required Python packages:
```bash
pip install flask pymongo scikit-learn joblib
```

Start the Flask server:
```bash
python app.py
```

## API Endpoints

### Authentication
- POST /api/auth/signup - User registration
- POST /api/auth/login - User login
- POST /api/auth/logout - User logout

### User Operations
- GET /api/user - Get user profile
- PUT /api/user - Update user profile
- DELETE /api/user - Delete user account

### Diabetes Operations
- GET /api/diabetesOpr/getDiabetesDetails - Get diabetes data
- PUT /api/diabetesOpr/updateDiabetesDetails - Update diabetes metrics
- POST /api/diabetesOpr/addGlucoseReading - Add new glucose reading
- GET /api/diabetesOpr/analyticsChart - Get glucose analytics

### Recommendations
- GET /api/recommendations/getRecommendations - Get personalized health recommendations

## Data Flow Analysis

**User Registration:**
- Frontend sends user details to /api/auth/signup
- Backend validates data, hashes password, creates user in MongoDB
- Returns JWT token for authentication

**Glucose Tracking:**
- Authenticated user submits glucose reading to /api/diabetesOpr/addGlucoseReading
- Backend stores reading with timestamp in Diabetes collection
- Readings are associated with user via userId

**AI Analytics:**
- User requests analytics via /api/diabetesOpr/analyticsChart
- Backend retrieves all glucose readings
- Sends formatted data to Google Gemini API
- Processes and returns structured analytics

**Diabetes Prediction:**
- Python service pulls user health data from MongoDB
- Preprocesses data and feeds to trained ML model
- Updates prediction in database
- Returns prediction result to frontend

**Recommendations:**
- Backend aggregates user health metrics
- Generates prompt for Gemini API
- Returns formatted recommendations to user

## Machine Learning Model
The diabetes prediction model is trained on the Pima Indians Diabetes Dataset with the following features:
- Pregnancies
- Glucose
- Blood Pressure
- Skin Thickness
- Insulin
- BMI
- Diabetes Pedigree Function
- Age

The model achieves 78% accuracy in predicting diabetes risk.

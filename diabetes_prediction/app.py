from flask import Flask, jsonify
from pymongo import MongoClient
from bson.objectid import ObjectId
import joblib

app = Flask(__name__)

client = MongoClient('mongodb://localhost:27017/')
db = client['test']
users_collection = db["User"]
diabetes_collection = db["Diabetes"]

model = joblib.load('diabetes_model.pkl')

@app.route('/predict/<user_id>', methods=['GET'])
def predict_diabetes(user_id):
    try:
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"error": "User not found"}), 404

        diabetes_data = diabetes_collection.find_one({"userId": ObjectId(user_id)})
        if not diabetes_data:
            return jsonify({"error": "Diabetes data not found for user"}), 404

        glucose_readings = diabetes_data.get("glucoseReadings", [])
        if not glucose_readings:
            return jsonify({"error": "No glucose readings found"}), 404
        latest_glucose = glucose_readings[-1]["value"]

        height = user.get("height")
        weight = user.get("weight")
        age = user.get("age")
        bmi = weight / ((height / 100) ** 2)

        pregnancies = diabetes_data.get("pregnancies", 0)
        blood_pressure = diabetes_data.get("bloodPressure", 72)
        skin_thickness = diabetes_data.get("skinThickness", 20)
        insulin = diabetes_data.get("insulin", 0)
        diabetes_pedigree_function = diabetes_data.get("diabetesPedigreeFunction", 0.5)

        features = [[
            pregnancies,
            latest_glucose,
            blood_pressure,
            skin_thickness,
            insulin,
            bmi,
            diabetes_pedigree_function
        ]]

        prediction = model.predict(features)[0]
        prediction_label = 'diabetic' if prediction == 1 else 'non-diabetic'
        is_diabetic = prediction == 1

        
        diabetes_collection.update_one(
            {"userId": ObjectId(user_id)},
            {
                "$set": {
                    "prediction": prediction_label,
                    "isDiabetic": is_diabetic
                }
            }
        )

        response = {
            "pregnancies": pregnancies,
            "latest_glucose": latest_glucose,
            "blood_pressure": blood_pressure,
            "skin_thickness": skin_thickness,
            "insulin": insulin,
            "bmi": bmi,
            "diabetes_pedigree_function": diabetes_pedigree_function,
            "prediction": prediction_label
        }

        return jsonify(response), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(debug=True)

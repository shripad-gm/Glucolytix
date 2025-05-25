import express from 'express';
import fetch from 'node-fetch';
import User from '../models/user.model.js';
import DiabetesData from '../models/diabetes.model.js';
import { protectRoute } from '../middleware/protectedRoute.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

router.get('/getRecommendations', protectRoute, async (req, res) => {
    const userId = req.user._id;

    try {
        const user = await User.findById(userId);
        const diabetesData = await DiabetesData.findOne({ userId });
        if (!user || !diabetesData) {
            return res.status(404).json({ error: "User or diabetes data not found" });
        }

        const bmi = user.weight / ((user.height / 100) ** 2);
        const latestGlucose = diabetesData.glucoseReadings.slice(-1)[0]?.value;

        const prompt = `
You are a health assistant specializing in gestational diabetes.
Patient profile:
- Age: ${user.age}
- Gender: ${user.gender}
- BMI: ${bmi.toFixed(2)}
- Pregnancies: ${diabetesData.pregnancies}
- Latest glucose: ${latestGlucose} mg/dL
- Blood pressure: ${diabetesData.bloodPressure} mmHg
- Insulin: ${diabetesData.insulin}
- Diabetes pedigree function: ${diabetesData.diabetesPedigreeFunction}

Provide a detailed, personalized daily diet and exercise recommendation.
`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: prompt }]
                        }
                    ]
                })
            }
        );

        if (!response.ok) {
            const error = await response.json();
            console.error('Gemini API error:', error);
            return res.status(500).json({ error: 'Failed to get recommendation' });
        }

        const data = await response.json();
        const recommendations = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No recommendation generated.';

        res.status(200).json({
            message: 'Recommendations generated successfully',
            recommendations
        });

    } catch (error) {
        console.error('Error generating recommendations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;

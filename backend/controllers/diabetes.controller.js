import User from "../models/user.model.js";
import DiabetesData from "../models/diabetes.model.js";
import dotenv from "dotenv";

dotenv.config();

export const getDiabetesDetails = async (req, res) => {
    const userId = req.user._id;  

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const diabetesData = await DiabetesData.findOne({ userId });
        if (!diabetesData) {
            return res.status(404).json({ error: "No diabetes data found for user" });
        }

        res.status(200).json({
            message: "Diabetes data retrieved successfully",
            data: diabetesData
        });

    } catch (error) {
        console.error("Error in getDiabetesDetails controller:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
export const updateDiabetesDetails = async (req, res) => {
    const userId = req.user._id;  
    const { glucoseReadings, pregnancies, bloodPressure, skinThickness, insulin, diabetesPedigreeFunction } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const isFemale = user.gender === 'female';

        const updateFields = {
            glucoseReadings,
            bloodPressure: bloodPressure || 72,
            skinThickness: skinThickness || 20,
            insulin: insulin || 80,
            diabetesPedigreeFunction: diabetesPedigreeFunction || 0.5,
        };

        if (isFemale) {
            updateFields.pregnancies = pregnancies || 0;
        }

        const diabetesData = await DiabetesData.findOneAndUpdate(
            { userId },
            { $set: updateFields },
            { new: true, upsert: true }  
        );

        res.status(200).json({
            message: "Diabetes data updated successfully",
            data: diabetesData
        });

    } catch (error) {
        console.log("Error in updateDiabetesDetails controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const addGlucoseReading = async (req, res) => {
    const userId = req.user._id;  
    const { value } = req.body;

    if (typeof value !== 'number') {
        return res.status(400).json({ error: 'Glucose value must be a number' });
    }

    try {
        let diabetesData = await DiabetesData.findOne({ userId });

        if (!diabetesData) {
            diabetesData = new DiabetesData({
                userId,
                glucoseReadings: [{ value }],
            });
        } else {
            diabetesData.glucoseReadings.push({ value });
        }

        await diabetesData.save();

        res.status(200).json({
            message: 'Glucose reading added successfully',
            data: diabetesData
        });
    } catch (error) {
        console.error('Error adding glucose reading:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const analyticsChart = async (req, res) => {
    const userId = req.user._id;

    try {
        const user = await User.findById(userId);
        const diabetesData = await DiabetesData.findOne({ userId });

        if (!user || !diabetesData) {
            return res.status(404).json({ error: "User or diabetes data not found" });
        }

        const glucoseReadings = diabetesData.glucoseReadings;

        if (!glucoseReadings || glucoseReadings.length === 0) {
            return res.status(404).json({ error: "No glucose readings found" });
        }

        // Prepare array for LLM
        const formattedReadings = glucoseReadings.map(r => ({
            value: r.value,
            timestamp: r.timestamp
        }));

        const prompt = `
You are a highly specialized medical data analysis agent.

Task:
Analyze the following blood glucose readings over time.
Each entry includes:
- value (mg/dL)
- timestamp (ISO format)

Your output MUST be STRICT JSON like:
{
  "statistics": {
    "mean": ...,
    "median": ...,
    "std_deviation": ...,
    "min": ...,
    "max": ...,
    "variability_index": ...,
    "average_time_gap_minutes": ...,
    "percent_in_target_range": ...,  // percent of readings between 80-140 mg/dL
    "percent_hyperglycemia": ...,    // percent above 140 mg/dL
    "percent_hypoglycemia": ...      // percent below 70 mg/dL
  },
  "patterns": [
    "Describe time-of-day trends (e.g., mornings higher, evenings lower)",
    "Detect sequences or streaks (e.g., several consecutive highs or lows)",
    "Identify variability patterns (e.g., sudden jumps, sharp drops)",
    "Any weekday vs weekend differences (if detectable)"
  ],
  "concerns": [
    "Flag frequent hypo or hyperglycemia events",
    "Flag large unexplained variability",
    "Flag unusual gaps or clusters in data"
  ],
  "final_summary": "Write 3 short lines summarizing the glucose trend, highlight any major concerns or patterns."
}

ONLY output raw JSON, no markdown, no explanation, no extra text.

Input data:
${JSON.stringify(formattedReadings)}
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
            return res.status(500).json({ error: 'Failed to get analytics insights' });
        }

        const data = await response.json();
        const insights = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!insights) {
            console.error('No insights returned from LLM');
            return res.status(500).json({ error: 'No insights returned from LLM' });
        }

        // Clean the LLM response: strip ```json or ``` blocks if present
        let cleanedInsights = insights;

        if (cleanedInsights.startsWith('```json')) {
            cleanedInsights = cleanedInsights.replace(/^```json/, '').replace(/```$/, '').trim();
        } else if (cleanedInsights.startsWith('```')) {
            cleanedInsights = cleanedInsights.replace(/^```/, '').replace(/```$/, '').trim();
        }

        let parsedInsights;
        try {
            parsedInsights = JSON.parse(cleanedInsights);
        } catch (parseErr) {
            console.error('Failed to parse LLM response as JSON:', parseErr);
            console.error('LLM raw response was:', insights);
            return res.status(500).json({ error: 'Invalid insights format from LLM' });
        }

        res.status(200).json({
            message: 'Analytics insights generated successfully',
            insights: parsedInsights
        });

    } catch (error) {
        console.error('Error generating glucose analytics:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
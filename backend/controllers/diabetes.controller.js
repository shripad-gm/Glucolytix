import User from "../models/user.model.js";
import DiabetesData from "../models/diabetes.model.js";


export const getDiabetesDetails = async (req, res) => {
    const { userId } = req.params;

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
        console.error("Error in getUserDiabetesData controller:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
export const updateDiabetesDetails = async (req, res) => {
    const { userId, glucoseReadings, pregnancies, bloodPressure, skinThickness, insulin, diabetesPedigreeFunction } = req.body;
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
            {$set:updateFields},
            { upsert: true }
        );
        if (!diabetesData) {
            return res.status(404).json({ error: "Diabetes data not found" });
        }
        res.status(200).json(diabetesData);
    } catch (error) {
        console.log("Error in updateDiabetesDetails controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
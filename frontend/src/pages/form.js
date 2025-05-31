import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import Footer from "../components/footer";

export default function DiabetesForm() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    userId: "", // Will be populated from localStorage
    gender: "",
    glucoseReadings: "", // This will be the single input for current reading
    pregnancies: "",
    bloodPressure: "",
    skinThickness: "",
    insulin: "",
    diabetesPedigreeFunction: "",
    age: "",
  });

  const [predictionResult, setPredictionResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastDisplayedGlucose, setLastDisplayedGlucose] = useState(null); // To display the previously saved glucose

  // Effect to load user info and initial diabetes data
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setFormData((prev) => ({
          ...prev,
          userId: parsedUser._id,
          gender: parsedUser.gender || "",
          age: parsedUser.age || "",
        }));

        // Fetch existing diabetes data to pre-fill the form
        const fetchInitialDiabetesData = async (currentUserId) => {
          setLoading(true);
          setError(null);
          try {
            const response = await fetch(
              "http://localhost:8000/api/diabetesOpr/getDiabetesDetails",
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  // 'Authorization': `Bearer ${parsedUser?.token || ''}`, // Uncomment if using JWT auth
                },
                credentials: 'include', // Important for sending cookies
              }
            );

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
              const textError = await response.text();
              throw new Error(`Expected JSON response, but received: ${textError.substring(0, 100)}... (status: ${response.status})`);
            }

            const result = await response.json();

            if (!response.ok) {
              throw new Error(result.message || result.error || `HTTP error! Status: ${response.status}`);
            }

            if (result.data) {
                setFormData((prev) => ({
                    ...prev,
                    gender: result.data.gender || parsedUser.gender || "",
                    pregnancies: result.data.pregnancies || 0,
                    bloodPressure: result.data.bloodPressure || 72,
                    skinThickness: result.data.skinThickness || 20,
                    insulin: result.data.insulin || 80,
                    diabetesPedigreeFunction: result.data.diabetesPedigreeFunction || 0.5,
                    age: result.data.age || parsedUser.age || "",
                    // Initialize glucose input with the last recorded glucose
                    glucoseReadings: result.data.lastRecordedGlucose !== undefined ? result.data.lastRecordedGlucose.toString() : "",
                }));
                setLastDisplayedGlucose(result.data.lastRecordedGlucose);
            } else {
                // If no data, ensure form is still populated with user defaults
                setFormData((prev) => ({
                    ...prev,
                    gender: parsedUser.gender || "",
                    age: parsedUser.age || "",
                }));
            }

          } catch (err) {
            console.error("Error fetching initial diabetes details:", err);
            setError(err.message || "Failed to load existing data.");
          } finally {
            setLoading(false);
          }
        };

        fetchInitialDiabetesData(parsedUser._id);

      } catch (e) {
        console.error("Error parsing user from localStorage:", e);
        setError("User data is corrupted in local storage. Please log in again.");
      }
    }
  }, []); // Empty dependency array means this runs once on mount

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setPredictionResult("");
    setError(null);
  };

  // Handler for updating ALL diabetes details
  const handleSubmitAllDetails = async (e) => {
    e.preventDefault(); // Prevent default form submission for the main form
    setLoading(true);
    setError(null);
    setPredictionResult("");

    console.log("Current formData before processing:", formData);

    const glucoseValue = formData.glucoseReadings !== "" ? parseFloat(formData.glucoseReadings) : undefined;

    // Client-side validation for ALL fields for this submission
    if (!formData.userId) { setError("User ID is missing. Please ensure you are logged in."); setLoading(false); return; }
    if (!formData.gender) { setError("Please select a gender."); setLoading(false); return; }
    if (isNaN(parseFloat(formData.age)) || parseFloat(formData.age) <= 0) { setError("Please enter a valid positive age."); setLoading(false); return; }
    if (formData.gender === "female" && (isNaN(parseFloat(formData.pregnancies)) || parseFloat(formData.pregnancies) < 0)) { setError("Pregnancy count must be a non-negative number for females."); setLoading(false); return; }
    // Validate glucose only if it's provided (not undefined/empty string)
    if (glucoseValue !== undefined && (isNaN(glucoseValue) || glucoseValue < 0)) { setError("Please enter a valid non-negative glucose reading."); setLoading(false); return; }


    const dataToSend = {
      user: formData.userId,
      gender: formData.gender,
      age: parseFloat(formData.age),
      glucoseReadings: glucoseValue, // Send parsed value or undefined if empty
      pregnancies: formData.gender === "female" ? parseFloat(formData.pregnancies || 0) : 0,
      bloodPressure: parseFloat(formData.bloodPressure || 72),
      skinThickness: parseFloat(formData.skinThickness || 20),
      insulin: parseFloat(formData.insulin || 80),
      diabetesPedigreeFunction: parseFloat(formData.diabetesPedigreeFunction || 0.5),
    };

    console.log("Submitting ALL details to backend:", dataToSend);

    try {
      const response = await fetch(
        "http://localhost:8000/api/diabetesOpr/updateDiabetesDetails",
        {
          method: "PUT", // Matches backend router.put
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSend),
          credentials: 'include'
        }
      );

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textError = await response.text();
        console.error("Non-JSON response received:", textError);
        throw new Error(`Expected JSON response, but received: ${textError.substring(0, 100)}... (status: ${response.status})`);
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || `HTTP error! Status: ${response.status}`);
      }

      console.log("API Response (All Details Update):", result);
      let message = result.message || "Diabetes details updated successfully!";
      if (result.prediction !== undefined) {
        message += ` ${result.prediction === 1 ? 'Prediction: High chance of diabetes. Please consult a doctor.' : 'Prediction: Low chance of diabetes.'}`;
      }
      setPredictionResult(message);
      // Update last recorded glucose display if the backend sends it back
      if (result.data && result.data.lastRecordedGlucose !== undefined) {
        setLastDisplayedGlucose(result.data.lastRecordedGlucose);
      }

    } catch (err) {
      console.error("Error updating all diabetes details:", err);
      setError(err.message || "An unexpected error occurred while updating all details.");
    } finally {
      setLoading(false);
    }
  };

  // Handler for adding ONLY a new glucose reading
  const handleAddGlucoseReading = async () => {
    setLoading(true);
    setError(null);
    setPredictionResult("");

    const glucoseValue = parseFloat(formData.glucoseReadings); // Get the value from the glucose input field

    if (!formData.userId) {
      setError("User ID is missing. Please ensure you are logged in.");
      setLoading(false);
      return;
    }
    if (isNaN(glucoseValue) || glucoseValue < 0) {
      setError("Please enter a valid non-negative glucose reading to add.");
      setLoading(false);
      return;
    }

    console.log("Adding new glucose reading to backend:", { userId: formData.userId, value: glucoseValue });

    try {
      const response = await fetch(
        "http://localhost:8000/api/diabetesOpr/addGlucoseReading",
        {
          method: "POST", // Matches backend router.post for addGlucoseReading
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: formData.userId, value: glucoseValue }), // Send userId and the new glucose value
          credentials: 'include'
        }
      );

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textError = await response.text();
        throw new Error(`Expected JSON response, but received: ${textError.substring(0, 100)}... (status: ${response.status})`);
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || `HTTP error! Status: ${response.status}`);
      }

      console.log("API Response (Add Glucose Reading):", result);
      setPredictionResult("New glucose reading added successfully!");
      setLastDisplayedGlucose(result.data.lastRecordedGlucose); // Update last recorded glucose display
      setFormData((prev) => ({ ...prev, glucoseReadings: "" })); // Clear the input after adding

    } catch (err) {
      console.error("Error adding glucose reading:", err);
      setError(err.message || "An unexpected error occurred while adding glucose reading.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx>{`
        /* Your CSS remains the same */
        * {
          box-sizing: border-box;
        }
        html, body, #root {
          margin: 0; padding: 0; height: 100%; width: 100%;
          background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #00ffc8;
          overflow-x: hidden;
        }
        .page-wrapper {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        form {
          background: rgba(0, 255, 200, 0.1);
          padding: 30px;
          border-radius: 20px;
          box-shadow: 0 12px 30px rgba(0, 255, 200, 0.25);
          max-width: 480px;
          width: 100%;
          color: #00ffc8;
          margin-top: 30px;
        }
        h2 {
          text-align: center;
          margin-bottom: 25px;
          text-shadow: 0 0 8px #00ffc8aa;
        }
        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          text-shadow: 0 0 6px #00ffc8aa;
        }
        input, select {
          width: 100%;
          padding: 10px 12px;
          margin-bottom: 20px;
          border-radius: 10px;
          border: none;
          outline: none;
          background: rgba(0,255,200,0.05);
          color: #00ffc8;
          font-size: 1rem;
          box-shadow: inset 0 0 8px #00ffc8aa;
          transition: box-shadow 0.3s ease;
        }
        input:focus, select:focus {
          box-shadow: 0 0 12px #00ffc8cc;
          background: rgba(0,255,200,0.15);
        }
        .button-group {
            display: flex;
            gap: 10px;
            margin-top: 20px;
            flex-wrap: wrap;
            justify-content: center;
        }
        button {
          background: #00ffc8;
          color: #002022;
          font-weight: 700;
          padding: 12px;
          flex: 1; /* Allow buttons to grow */
          min-width: 150px; /* Minimum width for buttons */
          border: none;
          border-radius: 15px;
          cursor: pointer;
          font-size: 1.1rem;
          box-shadow: 0 6px 18px #00ffc8aa;
          transition: background-color 0.3s ease, box-shadow 0.3s ease;
        }
        button:hover:not(:disabled) {
          background: #00e0b0;
          box-shadow: 0 8px 24px #00ffc8dd;
        }
        button:disabled {
          background: #5c7f76;
          cursor: not-allowed;
          box-shadow: none;
        }
        .message-container {
          margin-top: 20px;
          padding: 15px;
          max-width: 480px;
          width: 100%;
          background: rgba(0, 255, 200, 0.15);
          border-radius: 15px;
          box-shadow: 0 8px 24px rgba(0, 255, 200, 0.3);
          color: #00ffc8;
          font-weight: 600;
          text-align: center;
          font-size: 1.1rem;
        }
        .error-message {
          color: #ff4d4d;
          background: rgba(255, 77, 77, 0.15);
          box-shadow: 0 8px 24px rgba(255, 77, 77, 0.3);
        }
        .current-glucose-display {
            margin-bottom: 20px;
            font-size: 0.9em;
            color: #b0fff0;
            text-align: center;
        }
        @media (max-width: 500px) {
          form {
            padding: 20px;
          }
        }
      `}</style>

      <div className="page-wrapper">
        <Header />
        <Navbar user={user} />
        <br />
        <motion.form
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          // onSubmit is now linked to handleSubmitAllDetails
          onSubmit={handleSubmitAllDetails}
          autoComplete="off"
          spellCheck="false"
        >
          <h2>Update Diabetes Details</h2>

          <label htmlFor="gender">Gender</label>
          <select
            name="gender"
            id="gender"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            <option value="" disabled>
              Select gender
            </option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>

          {/* Show pregnancy count only if female */}
          {formData.gender === "female" && (
            <>
              <label htmlFor="pregnancies">Pregnancy Count</label>
              <input
                type="number"
                id="pregnancies"
                name="pregnancies"
                min="0"
                value={formData.pregnancies}
                onChange={handleChange}
                placeholder="Number of pregnancies or 0 if not pregnant"
              />
            </>
          )}

          {/* Glucose input field - used by both buttons */}
          <label htmlFor="glucoseReadings">Current Glucose Reading</label>
          {lastDisplayedGlucose !== null && (
              <div className="current-glucose-display">
                  Last recorded: {lastDisplayedGlucose} mg/dL
              </div>
          )}
          <input
            type="number"
            id="glucoseReadings"
            name="glucoseReadings"
            value={formData.glucoseReadings}
            onChange={handleChange}
            min="0"
            step="any"
            placeholder="Enter current glucose reading (e.g., 102)"
          />
          {/* New button to update ONLY glucose */}
          <button
            type="button" // Important: set type to "button" to prevent default form submission
            onClick={handleAddGlucoseReading}
            disabled={loading}
            style={{ marginBottom: '20px' }} // Add some spacing
          >
            {loading ? "Adding Glucose..." : "ADD NEW GLUCOSE READING"}
          </button>


          <label htmlFor="bloodPressure">Blood Pressure</label>
          <input
            type="number"
            id="bloodPressure"
            name="bloodPressure"
            value={formData.bloodPressure}
            onChange={handleChange}
            min="0"
            step="any"
            placeholder="Blood pressure (e.g., 72)"
          />

          <label htmlFor="skinThickness">Skin Thickness</label>
          <input
            type="number"
            id="skinThickness"
            name="skinThickness"
            value={formData.skinThickness}
            onChange={handleChange}
            min="0"
            step="any"
            placeholder="Skin thickness (e.g., 20)"
          />

          <label htmlFor="insulin">Insulin</label>
          <input
            type="number"
            id="insulin"
            name="insulin"
            value={formData.insulin}
            onChange={handleChange}
            min="0"
            step="any"
            placeholder="Insulin level (e.g., 80)"
          />

          <label htmlFor="diabetesPedigreeFunction">Diabetes Pedigree Function</label>
          <input
            type="number"
            id="diabetesPedigreeFunction"
            name="diabetesPedigreeFunction"
            value={formData.diabetesPedigreeFunction}
            onChange={handleChange}
            min="0"
            max="2"
            step="0.01"
            placeholder="Diabetes pedigree function (e.g., 0.5)"
          />

          <label htmlFor="age">Age</label>
          <input
            type="number"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleChange}
            required
            min="0"
            placeholder="Your age"
          />

          {/* Original button for updating all details */}
          <button type="submit" disabled={loading}>
            {loading ? "Updating All..." : "UPDATE ALL DETAILS"}
          </button>
        </motion.form>

        {/* Display prediction result or error message */}
        {predictionResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="message-container"
          >
            {predictionResult}
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="message-container error-message"
          >
            Error: {error}
          </motion.div>
        )}

        <Footer />
      </div>
    </>
  );
}

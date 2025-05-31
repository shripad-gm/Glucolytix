import React, { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import Footer from "../components/footer";
import Chart from "chart.js/auto";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // New states for controlling modal visibility
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showRecommendationsModal, setShowRecommendationsModal] = useState(false);

  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsMessage, setAnalyticsMessage] = useState("");
  const [analyticsInsights, setAnalyticsInsights] = useState(null);
  const [recommendations, setRecommendations] = useState(null);

  const [currentPage, setCurrentPage] = useState(0); // For carousel pagination
  const [carouselHeight, setCarouselHeight] = useState('auto'); // For dynamic carousel height
  const currentCardRef = useRef(null); // Ref for measuring current card height

  const chartRef = useRef(null); // Ref for the Analytics Chart canvas
  const chartInstanceRef = useRef(null); // Ref to hold the Analytics Chart.js instance

  // Refs for the Patient Data Analysis Chart
  const patientDataChartRef = useRef(null);
  const patientDataChartInstanceRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          "http://localhost:8000/api/diabetesOpr/getDiabetesDetails",
          {
            method: "GET",
            credentials: "include",
          }
        );
        const result = await response.json();
        if (!response.ok) {
          setError(result.error || "Error fetching initial diabetes data");
          setData(null);
        } else {
          setError("");
          setData(result.data || result);
        }
      } catch (err) {
        console.error("Fetch initial diabetes data error:", err);
        setError("Server error while fetching initial data.");
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const safeAnalyticsArray = (data) => {
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object") return Object.values(data);
    return [];
  };

  const handleFetchAnalyticsChart = async () => {
    setLoading(true);
    setError("");
    setAnalyticsData(null); // Clear previous data
    setAnalyticsMessage("");
    setAnalyticsInsights(null);
    setShowRecommendationsModal(false); // Ensure other modal is closed

    try {
      const response = await fetch(
        "http://localhost:8000/api/diabetesOpr/analyticsChart",
        {
          method: "GET",
          credentials: "include",
        }
      );
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Error fetching analytics chart");
        setAnalyticsData(null);
        setAnalyticsMessage("");
        setAnalyticsInsights(null);
      } else {
        setError("");
        setAnalyticsMessage(
          result.message || "Analytics insights generated successfully"
        );
        setAnalyticsInsights(result.insights || null);
        if (result.insights && result.insights.statistics) {
          const stats = result.insights.statistics;
          const chartArray = Object.entries(stats).map(([key, val]) => ({
            label: key.replace(/_/g, " "),
            value: val,
          }));
          setAnalyticsData(chartArray);
        } else {
          setAnalyticsData(null);
        }
        setShowAnalyticsModal(true); // Open the modal
      }
    } catch (err) {
      console.error("Fetch analytics chart error:", err);
      setError("Server error while fetching analytics chart");
      setAnalyticsData(null);
      setAnalyticsMessage("");
      setAnalyticsInsights(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // This effect now only runs if the modal is open and data is present
    if (showAnalyticsModal && analyticsData && chartRef.current) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      const safeData = safeAnalyticsArray(analyticsData);

      const labels = safeData.map((item) => item.label || item.timestamp);
      const values = safeData.map((item) => item.value);

      chartInstanceRef.current = new Chart(chartRef.current, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Analytics Data",
              data: values,
              fill: false,
              borderColor: "#00fff7",
              backgroundColor: "#00fff7",
              tension: 0.3,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: "#00fff7" } },
            tooltip: {
              backgroundColor: "#0f2027",
              titleColor: "#00fff7",
              bodyColor: "#00fff7",
            },
          },
          scales: {
            x: {
              ticks: { color: "#00fff7" },
              grid: { color: "rgba(0,255,247,0.2)" },
            },
            y: {
              ticks: { color: "#00fff7" },
              grid: { color: "rgba(0,255,247,0.2)" },
              beginAtZero: true,
            },
          },
        },
      });
    } else {
      // Destroy chart when modal is closed or data is gone
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    }
  }, [showAnalyticsModal, analyticsData]); // Depend on modal visibility

  // Effect for Patient Data Analysis Chart - now always renders if data is available
  useEffect(() => {
    if (data && data.glucoseReadings && data.glucoseReadings.length > 0 && patientDataChartRef.current) {
      if (patientDataChartInstanceRef.current) {
        patientDataChartInstanceRef.current.destroy();
      }

      const sortedGlucoseReadings = [...data.glucoseReadings].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      const labels = sortedGlucoseReadings.map(item =>
        new Date(item.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      );
      const values = sortedGlucoseReadings.map(item => item.value);

      const ctx = patientDataChartRef.current.getContext('2d');
      patientDataChartInstanceRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Historical Glucose Levels (mg/dL)',
              data: values,
              fill: false,
              borderColor: '#FFD700', // Gold color for glucose line
              backgroundColor: '#FFD700',
              tension: 0.3,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: "#00fff7" } },
            tooltip: {
              backgroundColor: "#0f2027",
              titleColor: "#00fff7",
              bodyColor: "#00fff7",
              callbacks: {
                label: function(context) {
                  return `Glucose: ${context.raw} mg/dL`;
                }
              }
            },
          },
          scales: {
            x: {
              ticks: { color: "#00fff7" },
              grid: { color: "rgba(0,255,247,0.2)" },
              title: {
                display: true,
                text: 'Date',
                color: '#00fff7'
              }
            },
            y: {
              ticks: { color: "#00fff7" },
              grid: { color: "rgba(0,255,247,0.2)" },
              beginAtZero: true,
              title: {
                display: true,
                text: 'Glucose Level (mg/dL)',
                color: '#00fff7'
              }
            },
          },
        },
      });
    } else {
      if (patientDataChartInstanceRef.current) {
        patientDataChartInstanceRef.current.destroy();
        patientDataChartInstanceRef.current = null;
      }
    }
  }, [data]); // Redraw when data changes

  // Clear all states related to analytics and recommendations when modals are closed
  useEffect(() => {
    if (!showAnalyticsModal && chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
      setAnalyticsData(null);
      setAnalyticsMessage("");
      setAnalyticsInsights(null);
    }
  }, [showAnalyticsModal]);

  useEffect(() => {
    if (!showRecommendationsModal && recommendations) {
      setRecommendations(null);
      setCurrentPage(0);
      setCarouselHeight('auto');
    }
  }, [showRecommendationsModal]);

  const handleGetRecommendations = async () => {
    setLoading(true);
    setError("");
    setRecommendations(null); // Clear previous recommendations
    setCurrentPage(0); // Reset page on new recommendations fetch
    setShowAnalyticsModal(false); // Ensure other modal is closed
    setCarouselHeight('auto'); // Reset height when fetching new recs

    try {
      const response = await fetch(
        "http://localhost:8000/api/recommendations/getRecommendations",
        {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );

      const recData = await response.json();

      if (!response.ok) {
        setError(recData.error || "Failed to fetch recommendations");
        setRecommendations(null);
      } else {
        if (
          recData.recommendations &&
          typeof recData.recommendations === "object" &&
          Object.keys(recData.recommendations).length > 0
        ) {
          setRecommendations(recData.recommendations);
          setError("");
          setShowRecommendationsModal(true); // Open the modal
        } else {
          setError("Recommendations data is empty or malformed from the server.");
          setRecommendations(null);
        }
      }
    } catch (err) {
      console.error("Frontend: Server error while fetching recommendations:", err);
      setError("Server error while fetching recommendations. Check console for details.");
      setRecommendations(null);
    } finally {
      setLoading(false);
    }
  };

  const getAllRecommendationCards = () => {
    if (!recommendations) return [];
    const { analysis_summary, ...otherRecommendations } = recommendations;

    const cards = [];

    if (analysis_summary) {
      cards.push(
        <div key="analysis" className="recommendation-card analysis-card">
          <h5 className="rec-category">Analysis Summary</h5>
          {Array.isArray(analysis_summary) ? (
            <ul className="rec-details">
              {analysis_summary.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          ) : (
            <p className="rec-summary">{analysis_summary}</p>
          )}
        </div>
      );
    }

    Object.entries(otherRecommendations).forEach(([category, rec], idx) => {
      cards.push(
        <div key={category} className="recommendation-card">
          <h5 className="rec-category">
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </h5>
          <p className="rec-summary">{rec.summary}</p>
          {rec.details && rec.details.length > 0 && (
            <ul className="rec-details">
              {rec.details.map((detail, i) => (
                <li key={i}>{detail}</li>
              ))}
            </ul>
          )}
        </div>
      );
    });
    return cards;
  };

  const handleNextPage = () => {
    const totalPages = getAllRecommendationCards().length;
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const handlePrevPage = () => {
    const totalPages = getAllRecommendationCards().length;
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const allRecommendationCards = getAllRecommendationCards();
  const totalPages = allRecommendationCards.length;
  const currentCardWithRef = allRecommendationCards[currentPage] ?
    React.cloneElement(allRecommendationCards[currentPage], { ref: currentCardRef }) : null;

  useEffect(() => {
    if (currentCardRef.current) {
      const height = currentCardRef.current.clientHeight;
      setCarouselHeight(`${height}px`);
    } else {
      setCarouselHeight('auto');
    }
  }, [currentPage, recommendations, totalPages, showRecommendationsModal]); // Add showRecommendationsModal to dependency

  return (
    <>
      {/* GLOBAL BACKGROUND STYLE - ADDED/UPDATED */}
      <style>{`
        html, body, #root {
          margin: 0;
          padding: 0;
          width: 100%;
          overflow-x: hidden;
          /* New radial gradient background */
          background: radial-gradient(circle at center, #0a1128 0%, #03081e 100%);
          color: #00fff7; /* Keep existing text color for consistency */
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          box-sizing: border-box;
        }
      `}</style>

      <Header />
      <Navbar user={user} />

      {/* New top-level container for dashboard and buttons */}
      <div className="main-content-wrapper">
        <main className="dashboard">
          <h2 className="dashboard-title">Diabetes Prediction Dashboard</h2>

          {user && (
            <div className="welcome-user">
              Welcome <strong>{user.name || user.username || "User"}</strong>
              {user.age && (
                <span>
                  {" "}
                  | Age: <strong>{user.age}</strong> years
                </span>
              )}
            </div>
          )}

          {loading && <p className="loading-text">Loading data...</p>}
          {error && (
            <p className="error-text">
              {error}{" "}
            </p>
          )}

          {/* This container now holds the prediction card and related elements */}
          <div className="dashboard-main-area">
            {data && (
              <div className="prediction-card">
                <h3>Prediction: {data.isDiabetic ? "Diabetes" : "No Diabetes"}</h3>
                {/* Patient Data Analysis Chart Canvas - Displayed directly if data exists */}
                {data.glucoseReadings && data.glucoseReadings.length > 0 && (
                  <div className="patient-data-chart-section">
                    <canvas ref={patientDataChartRef} width="600" height="300"></canvas>
                  </div>
                )}

                {/* Patient Data Analysis section - always visible within prediction-card */}
                <div className="patient-data-analysis">
                  <h4>Patient Data Analysis</h4>
                  <ul>
                    <li>
                      <strong>Pregnancies:</strong> {data.pregnancies}
                    </li>
                    <li>
                      <strong>Latest Glucose:</strong> {data.glucoseReadings && data.glucoseReadings.length > 0 ? data.glucoseReadings.slice(-1)[0]?.value : 'N/A'} mg/dL
                    </li>
                    <li>
                      <strong>Blood Pressure:</strong> {data.bloodPressure} mmHg
                    </li>
                    <li>
                      <strong>Skin Thickness:</strong> {data.skinThickness} mm
                    </li>
                    <li>
                      <strong>Insulin:</strong> {data.insulin}
                    </li>
                    {/* Added Height and Weight */}
                    <li>
                      <strong>Height:</strong> {user?.height ? `${user.height} cm` : 'N/A'}
                    </li>
                    <li>
                      <strong>Weight:</strong> {user?.weight ? `${user.weight} kg` : 'N/A'}
                    </li>
                    <li>
                      <strong>BMI:</strong> {user?.weight && user?.height ? Math.round(user.weight / ((user.height / 100) ** 2)) : 'N/A'}
                    </li>
                    <li>
                      <strong>Diabetes Pedigree Function:</strong>{" "}
                      {data.diabetesPedigreeFunction}
                    </li>
                    <li>
                      <strong>Age:</strong> {user.age} years
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Action buttons container - now outside the dashboard main tag, parallel to it */}
        <div className="action-buttons-sidebar">
          <button className="toggle-full-data" onClick={handleFetchAnalyticsChart}>
            Analytics Chart
          </button>

          <button
            className="toggle-full-data"
            onClick={handleGetRecommendations}
          >
            Get Recommendations
          </button>
        </div>
      </div>

      {/* Analytics Chart Modal */}
      {showAnalyticsModal && analyticsData && (
        <div className="modal-backdrop">
          <div className="modal-content analytics-chart-modal">
            <button className="close-modal" onClick={() => setShowAnalyticsModal(false)}>
              &times;
            </button>
            <h4>Analytics Chart</h4>
            <canvas ref={chartRef} width="600" height="400" />

            {analyticsMessage && (
              <p className="analytics-message">
                {analyticsMessage}
              </p>
            )}

            {analyticsInsights && (
              <div className="analytics-insights">
                <h5>Statistics:</h5>
                <ul style={{ listStyleType: "none", padding: "0" }}>
                  {analyticsInsights.statistics &&
                    Object.entries(analyticsInsights.statistics).map(
                      ([key, value]) => (
                        <li key={key} style={{ marginBottom: "5px" }}>
                          <strong>{key.replace(/_/g, " ")}:</strong>{" "}
                          {value}
                        </li>
                      )
                    )}
                </ul>

                <h5>Patterns:</h5>
                <ul style={{ paddingLeft: "20px" }}>
                  {analyticsInsights.patterns &&
                    analyticsInsights.patterns.map((pattern, i) => (
                      <li key={i}>{pattern}</li>
                    ))}
                </ul>

                <h5>Concerns:</h5>
                <ul style={{ paddingLeft: "20px" }}>
                  {analyticsInsights.concerns &&
                    analyticsInsights.concerns.map((concern, i) => (
                      <li key={i}>{concern}</li>
                    ))}
                </ul>

                <h5>Final Summary:</h5>
                <p>{analyticsInsights.final_summary}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recommendations Modal */}
      {showRecommendationsModal && recommendations && (
        <div className="modal-backdrop">
          <div className="modal-content recommendations-modal">
            <button className="close-modal" onClick={() => setShowRecommendationsModal(false)}>
              &times;
            </button>
            <h4>Recommendations</h4>
            <div className="pagination-container">
              <button
                onClick={handlePrevPage}
                disabled={totalPages <= 1}
                className="pagination-arrow prev-arrow"
              >
                &#9664;
              </button>

              <div className="recommendations-carousel" style={{ height: carouselHeight }}>
                {currentCardWithRef}
              </div>

              <button
                onClick={handleNextPage}
                disabled={totalPages <= 1}
                className="pagination-arrow next-arrow"
              >
                &#9654;
              </button>
            </div>
            {totalPages > 0 && (
              <div className="page-indicator">
                Page {currentPage + 1} of {totalPages}
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />

      <style jsx>{`
        .main-content-wrapper {
          display: flex;
          justify-content: center;
          align-items: flex-start; /* Align to the top */
          gap: 30px; /* Space between dashboard and sidebar */
          max-width: 1200px; /* Max width for the whole layout */
          margin: 20px auto; /* Center the wrapper */
          padding: 0 20px; /* Add some padding on sides */
          box-sizing: border-box;
        }

        .dashboard {
          padding: 20px;
          color: #00fff7;
          /* UPDATED: Apply the new radial gradient background */
          background: radial-gradient(circle at center, #0a1128 0%, #03081e 100%);
          min-height: 80vh;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          flex-grow: 1; /* Allow dashboard to take available space */
          border-radius: 10px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          align-items: center;
          max-width: 900px; /* Limit dashboard width, will grow as needed by flex-grow */
          box-shadow: 0 0 15px rgba(0, 255, 247, 0.4); /* Added subtle shadow */
        }
        .dashboard-title {
          text-align: center;
          font-size: 2rem;
          margin-bottom: 15px;
          text-shadow: 0 0 8px #00fff7;
        }
        .welcome-user {
          text-align: center;
          font-size: 1.1rem;
          margin-bottom: 20px;
        }
        .loading-text {
          text-align: center;
          font-size: 1rem;
          color: #00ffcc;
        }
        .error-text {
          text-align: center;
          color: #ff004c;
          margin-bottom: 20px;
          font-weight: bold;
          white-space: pre-wrap;
        }

        /* Container for prediction card, charts, recommendations inside dashboard */
        .dashboard-main-area {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px; /* Space between prediction card, analytics, recommendations */
        }

        .prediction-card {
          background: rgba(0, 255, 247, 0.1);
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 0 12px #00fff7aa;
          text-align: center;
          width: 100%; /* Take full width of dashboard-main-area */
          max-width: 600px; /* Limit its max width */
          box-sizing: border-box; /* Include padding in width */
        }
        .prediction-card h3 {
          font-size: 1.6rem;
          margin-bottom: 15px;
          text-shadow: 0 0 6px #00fff7;
        }

        /* NEW: Sidebar for buttons, truly outside the dashboard's internal structure */
        .action-buttons-sidebar {
          display: flex;
          flex-direction: column; /* Stack buttons vertically */
          gap: 15px;
          padding: 20px 0; /* Add padding similar to dashboard for visual alignment */
          min-width: 180px; /* Minimum width for buttons */
          align-self: flex-start; /* Align to the top of the main-content-wrapper */
        }
        /* Style for the individual buttons */
        .toggle-full-data {
          cursor: pointer;
          padding: 10px 20px;
          border-radius: 25px;
          border: 2px solid #00fff7;
          background: transparent;
          color: #00fff7;
          font-weight: 600;
          transition: all 0.3s ease;
          min-width: 140px;
          user-select: none;
          text-align: center; /* Center text in buttons */
        }
        .toggle-full-data:hover {
          background-color: #00fff7;
          color: #002b36;
          box-shadow: 0 0 8px #00fff7;
        }
        .dashboard ul {
          list-style-type: none;
          padding: 0;
          max-width: 400px;
          margin: 0 auto 20px auto;
          text-align: left;
          font-size: 1rem;
          line-height: 1.5;
        }
        ul li {
          margin-bottom: 8px;
        }

        /* Patient Data Analysis Section */
        .patient-data-analysis {
          background: rgba(0, 255, 247, 0.05);
          border-radius: 8px;
          padding: 15px;
          margin-top: 20px;
          margin-bottom: 20px;
          box-shadow: inset 0 0 5px rgba(0, 255, 247, 0.2);
          width: 100%; /* Ensure it takes full width within prediction-card */
          max-width: 600px; /* Keep consistent max-width */
          box-sizing: border-box;
          margin-left: auto; /* Center the block */
          margin-right: auto; /* Center the block */
        }
        .patient-data-analysis h4 {
          font-size: 1.3rem;
          margin-bottom: 10px;
          color: #00fff7;
          text-shadow: 0 0 4px #00fff7;
          text-align: center;
        }
        .patient-data-analysis ul {
          list-style-type: none;
          padding: 0;
          margin: 0 auto;
          max-width: 350px;
          text-align: left;
        }
        .patient-data-analysis ul li {
          margin-bottom: 5px;
          font-size: 0.95rem;
          color: #bbf7f0;
        }
        .patient-data-analysis ul li strong {
          color: #00ffc8;
        }
        .patient-data-chart-section {
          margin-top: 20px;
          padding: 10px;
          background: rgba(0, 255, 247, 0.03);
          border-radius: 8px;
          border: 1px solid rgba(0, 255, 247, 0.1);
          width: 100%; /* Ensure it takes full width within its parent */
          max-width: 600px; /* Limit chart width */
          box-sizing: border-box;
          margin-left: auto; /* Center the chart */
          margin-right: auto; /* Center the chart */
        }
        .patient-data-chart-section canvas {
          max-width: 100%;
          height: auto;
        }

        /* --- Recommendations Section Styles (now within modal) --- */
        .recommendations-modal h4 {
          text-align: center;
          margin-bottom: 20px;
          font-size: 1.5rem;
          text-shadow: 0 0 5px #00fff7;
        }

        /* --- Pagination Container (for arrows and carousel) --- */
        .pagination-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          flex-grow: 1;
          position: relative;
          padding: 20px 0;
        }

        /* --- Individual Recommendation Card (Carousel Item) --- */
        .recommendations-carousel {
          flex-grow: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100px;
          height: auto;
          transition: height 0.5s ease-in-out;
          overflow: hidden;
          position: relative;
          width: 100%;
        }
        .recommendation-card {
          background: #002b36cc;
          border-radius: 12px;
          padding: 20px 25px;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 0 12px #00fff7aa;
          color: #a0f7f0;
          min-height: 150px;
          height: auto;
          display: flex;
          flex-direction: column;
          text-align: center;
          transition: transform 0.5s ease-in-out, opacity 0.5s ease-in-out;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          opacity: 1;
          box-sizing: border-box;
        }
        /* Style for Analysis Summary card specifically */
        .analysis-card {
          border: 2px solid #00fff7;
          box-shadow: 0 0 15px #00fff7ff;
        }
        .rec-category {
          font-weight: 700;
          font-size: 1.3rem;
          margin-bottom: 10px;
          text-align: center;
          color: #00fff7;
          text-shadow: 0 0 6px #00fff7;
        }
        .rec-summary {
          font-weight: 600;
          margin-bottom: 10px;
          text-align: center;
          line-height: 1.4;
          max-height: unset;
          overflow: visible;
        }
        .rec-details {
          list-style-type: disc;
          padding-left: 20px;
          font-size: 0.95rem;
          color: #bbf7f0;
          margin-top: auto;
          text-align: left;
          max-height: unset;
          overflow: visible;
        }
        .rec-details li {
          margin-bottom: 6px;
        }

        /* --- Pagination Arrows --- */
        .pagination-arrow {
          background: rgba(0, 255, 247, 0.2);
          border: 2px solid #00fff7;
          border-radius: 50%;
          color: #00fff7;
          font-size: 2rem;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background-color 0.3s ease, transform 0.3s ease;
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          user-select: none;
        }
        .pagination-arrow:hover:not(:disabled) {
          background-color: #00fff7;
          color: #002b36;
          transform: translateY(-50%) scale(1.1);
        }
        .pagination-arrow:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: translateY(-50%) scale(1);
        }
        .prev-arrow {
          left: -25px;
        }
        .next-arrow {
          right: -25px;
        }

        /* --- Page Indicator --- */
        .page-indicator {
          margin-top: 15px;
          font-size: 1rem;
          color: #a0f7f0;
          text-align: center;
        }

        /* Analytics Chart Section (now within modal) */
        .analytics-chart-modal h4 {
          text-align: center;
          font-size: 1.4rem;
          margin-bottom: 15px;
          color: #00fff7;
        }
        .analytics-chart-modal canvas {
          max-width: 100%;
          height: auto;
        }
        .analytics-insights {
          margin-top: 20px;
          color: #00fff7;
          text-align: left;
          border: 1px solid rgba(0, 255, 247, 0.3);
          border-radius: 8px;
          padding: 15px;
          background: rgba(0, 255, 247, 0.05);
        }
        .analytics-insights h5 {
          color: #00ffc8;
          margin-top: 10px;
          margin-bottom: 8px;
        }
        .analytics-insights ul {
            list-style-type: none; /* Override default list style for statistics */
            padding: 0;
            margin: 0;
            text-align: left;
        }
        .analytics-insights ul li {
            margin-bottom: 5px;
        }

        /* --- Modal Styles --- */
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(0, 0, 0, 0.7); /* Dark semi-transparent background */
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000; /* Ensure it's on top of everything */
          backdrop-filter: blur(5px); /* Optional: blur background content */
        }

        .modal-content {
          /* UPDATED: Apply the new radial gradient background */
          background: radial-gradient(circle at center, #0a1128 0%, #03081e 100%);
          color: #00fff7;
          padding: 30px;
          border-radius: 15px;
          box-shadow: 0 5px 25px rgba(0, 255, 247, 0.6);
          position: relative;
          max-width: 800px; /* Max width for modals */
          width: 90%; /* Responsive width */
          max-height: 90vh; /* Max height to prevent overflow on smaller screens */
          overflow-y: auto; /* Enable scrolling for long content */
          animation: fadeInScale 0.3s ease-out;
        }

        .close-modal {
          position: absolute;
          top: 15px;
          right: 15px;
          background: none;
          border: none;
          font-size: 2rem;
          color: #ff004c;
          cursor: pointer;
          padding: 5px 10px;
          border-radius: 5px;
          transition: color 0.2s ease, background-color 0.2s ease;
        }

        .close-modal:hover {
          color: #ff3366;
          background-color: rgba(255, 0, 76, 0.1);
        }

        /* Animations */
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9) translate(-50%, -50%);
          }
          to {
            opacity: 1;
            transform: scale(1) translate(-50%, -50%);
          }
        }

        /* Responsive adjustments for smaller screens */
        @media (max-width: 900px) {
          .main-content-wrapper {
            flex-direction: column; /* Stack dashboard and sidebar vertically */
            align-items: center; /* Center items when stacked */
            gap: 20px; /* Reduce gap when stacked */
          }
          .dashboard {
            width: 100%; /* Take full width when stacked */
            max-width: 600px; /* Adjust max-width for smaller screens */
            margin: 0 auto; /* Center the dashboard */
          }
          .action-buttons-sidebar {
            width: 100%; /* Take full width when stacked */
            flex-direction: row; /* Arrange buttons horizontally */
            justify-content: center; /* Center buttons horizontally */
            flex-wrap: wrap; /* Allow buttons to wrap */
            padding-top: 0; /* Remove top padding */
          }
          .toggle-full-data {
            min-width: unset; /* Allow buttons to size naturally */
            flex-grow: 1; /* Allow buttons to grow to fill space */
            margin: 5px; /* Add margin between horizontal buttons */
          }
          .modal-content {
              padding: 20px;
              width: 95%; /* Make modals slightly wider on small screens */
          }
          .recommendation-card {
            min-height: 180px;
            padding: 15px;
          }
          .rec-category {
            font-size: 1.1rem;
          }
          .rec-details {
            font-size: 0.9rem;
          }
          .pagination-arrow {
            width: 40px;
            height: 40px;
            font-size: 1.5rem;
            left: -15px;
            right: -15px;
          }
        }
      `}</style>
    </>
  );
}
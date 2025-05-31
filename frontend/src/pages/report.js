import React, { useEffect, useState, useRef } from "react";
import Lottie from "lottie-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Chart from "chart.js/auto"; // Ensure Chart.js is imported
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import Footer from "../components/footer";

export default function Report() {
  const [animationData, setAnimationData] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null); // Overall analytics insights
  const [details, setDetails] = useState(null); // Patient's diabetes details + historical data
  const [recommendations, setRecommendations] = useState(null); // LLM recommendations
  const [error, setError] = useState(null);

  // Refs for hidden chart canvases and their Chart.js instances
  const overallAnalyticsChartCanvasRef = useRef(null);
  const overallAnalyticsChartInstanceRef = useRef(null);

  const historicalGlucoseChartCanvasRef = useRef(null);
  const historicalGlucoseChartInstanceRef = useRef(null);

  // Lottie animation data fetch
  useEffect(() => {
    fetch("https://assets1.lottiefiles.com/packages/lf20_tuwo7o.json")
      .then((res) => res.json())
      .then((data) => setAnimationData(data));
  }, []);

  // User data from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // --- Chart Drawing Functions (for hidden canvases) ---

  // Draw Overall Analytics Chart
  const drawOverallAnalyticsChart = (insights) => {
    // If no insights or canvas ref is not ready, destroy any existing chart
    if (!insights || !insights.statistics || !overallAnalyticsChartCanvasRef.current) {
      if (overallAnalyticsChartInstanceRef.current) {
        overallAnalyticsChartInstanceRef.current.destroy();
        overallAnalyticsChartInstanceRef.current = null;
      }
      return;
    }

    // Destroy existing chart instance to prevent duplicates
    if (overallAnalyticsChartInstanceRef.current) {
      overallAnalyticsChartInstanceRef.current.destroy();
    }

    const stats = insights.statistics;
    const chartDataArray = Object.entries(stats).map(([key, val]) => ({
      label: key.replace(/_/g, " ").replace(/\b\w/g, char => char.toUpperCase()), // Format labels
      value: typeof val === 'number' ? val : parseFloat(val), // Ensure numerical value
    }));

    const labels = chartDataArray.map((item) => item.label);
    const values = chartDataArray.map((item) => item.value);

    const ctx = overallAnalyticsChartCanvasRef.current.getContext('2d');
    overallAnalyticsChartInstanceRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Overall Analytics Data",
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
        maintainAspectRatio: false, // Essential for fixed size image generation
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
  };

  // Draw Historical Glucose Chart
  const drawHistoricalGlucoseChart = (historicalData) => {
    // If no data or canvas ref is not ready, destroy any existing chart
    if (!historicalData || historicalData.length === 0 || !historicalGlucoseChartCanvasRef.current) {
      if (historicalGlucoseChartInstanceRef.current) {
        historicalGlucoseChartInstanceRef.current.destroy();
        historicalGlucoseChartInstanceRef.current = null;
      }
      return;
    }

    // Destroy existing chart instance to prevent duplicates
    if (historicalGlucoseChartInstanceRef.current) {
      historicalGlucoseChartInstanceRef.current.destroy();
    }

    // Sort data by timestamp to ensure correct line chart progression
    const sortedData = [...historicalData].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const labels = sortedData.map(item =>
      new Date(item.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    );
    const values = sortedData.map(item => item.value);

    const ctx = historicalGlucoseChartCanvasRef.current.getContext('2d');
    historicalGlucoseChartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Historical Glucose Levels (mg/dL)',
            data: values,
            fill: false,
            borderColor: '#FFD700', // Gold color for glucose
            backgroundColor: '#FFD700',
            tension: 0.3,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // Essential for fixed size image generation
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
  };

  // UseEffects to trigger chart drawing when data changes
  useEffect(() => {
    if (report && report.insights) {
      drawOverallAnalyticsChart(report.insights);
    } else {
      // Clear chart if no data
      if (overallAnalyticsChartInstanceRef.current) {
        overallAnalyticsChartInstanceRef.current.destroy();
        overallAnalyticsChartInstanceRef.current = null;
      }
    }
  }, [report]);

  useEffect(() => {
    // Access historical glucose from details.historical_glucose_readings
    const historicalGlucose = details?.historical_glucose_readings;
    if (historicalGlucose && Array.isArray(historicalGlucose)) {
      drawHistoricalGlucoseChart(historicalGlucose);
    } else {
      // Clear chart if no data
      if (historicalGlucoseChartInstanceRef.current) {
        historicalGlucoseChartInstanceRef.current.destroy();
        historicalGlucoseChartInstanceRef.current = null;
      }
    }
  }, [details]);


  const handleGenerateReport = async () => {
    setLoading(true);
    setReport(null);
    setDetails(null);
    setRecommendations(null);
    setError(null);

    // Destroy existing chart instances immediately to prevent stale charts
    if (overallAnalyticsChartInstanceRef.current) {
      overallAnalyticsChartInstanceRef.current.destroy();
      overallAnalyticsChartInstanceRef.current = null;
    }
    if (historicalGlucoseChartInstanceRef.current) {
      historicalGlucoseChartInstanceRef.current.destroy();
      historicalGlucoseChartInstanceRef.current = null;
    }

    try {
      const [analyticsRes, detailsRes, recRes] = await Promise.all([
        fetch("http://localhost:8000/api/diabetesOpr/analyticsChart", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }),
        fetch("http://localhost:8000/api/diabetesOpr/getDiabetesDetails", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }),
        fetch("http://localhost:8000/api/recommendations/getRecommendations", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }),
      ]);

      if ([analyticsRes, detailsRes, recRes].some(res => res.status === 401)) {
        setError("Unauthorized. Please login again.");
        setLoading(false);
        return;
      }

      const analyticsData = await analyticsRes.json();
      const detailsData = await detailsRes.json();
      const recData = await recRes.json();

      if (analyticsRes.ok && analyticsData.insights) {
        setReport(analyticsData.insights);
      } else {
        if (!error) setError("Failed to generate analytics report.");
      }

      if (detailsRes.ok && detailsData.data) {
        setDetails(detailsData.data);
      } else {
        if (!error) setError("Failed to fetch diabetes details.");
      }

      if (recRes.ok && recData.recommendations) {
        setRecommendations(recData.recommendations);
      } else {
        if (!error) setError("Failed to fetch recommendations.");
      }

    } catch (error) {
      console.error("Error:", error);
      setError("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!report && !details && !recommendations) {
      alert("No data available to generate PDF report.");
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    const textMaxWidth = pageWidth - 2 * margin;
    let nextY = margin; // Start from top margin

    // Helper to add a new page if content exceeds current page
    const addPageIfNeeded = (heightNeeded) => {
      if (nextY + heightNeeded > doc.internal.pageSize.height - margin) {
        doc.addPage();
        nextY = margin;
      }
    };

    // --- Title ---
    addPageIfNeeded(15);
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0); // Black
    doc.text("Glucose Analytics Report", pageWidth / 2, nextY, { align: 'center' });
    nextY += 15;

    // --- User Information ---
    const storedUser = localStorage.getItem("user");
    const currentUser = storedUser ? JSON.parse(storedUser) : null;

    if (currentUser) {
      addPageIfNeeded(60); // Estimate height for user info
      doc.setFontSize(14);
      doc.setTextColor(0, 128, 128); // Teal
      doc.text("User Information", margin, nextY);
      nextY += 8;

      doc.setFontSize(12);
      doc.setTextColor(50, 50, 50); // Dark gray

      const userName = currentUser.name || currentUser.username || 'Not Provided';
      const userEmail = currentUser.email || 'Not Provided';
      const userGender = currentUser.gender || 'Not Provided';
      const userAge = currentUser.age?.$numberInt || currentUser.age || 'Not Provided';
      const userWeight = currentUser.weight?.$numberInt || currentUser.weight || 'Not Provided';
      const userHeight = currentUser.height?.$numberInt || currentUser.height || 'Not Provided';

      const userData = [
        `Name: ${userName}`,
        `Email: ${userEmail}`,
        `Gender: ${userGender}`,
        `Age: ${userAge} years`,
        `Weight: ${userWeight} kg`,
        `Height: ${userHeight} cm`,
      ].filter(Boolean);

      userData.forEach((info) => {
        doc.text(info, margin + 4, nextY);
        nextY += 6;
      });
      nextY += 8;
    }

    // Reset text color for subsequent sections
    doc.setTextColor(0, 0, 0);

    // --- Overall Analytics Insights ---
    if (report) {
      addPageIfNeeded(50);
      doc.setFontSize(14);
      doc.setTextColor(0, 128, 128); // Teal
      doc.text("Overall Analytics Insights:", margin, nextY);
      nextY += 5;

      const insightBody = [];
      if (report.statistics) {
        Object.entries(report.statistics).forEach(([k, v]) => {
          insightBody.push([k.replace(/_/g, " ").replace(/\b\w/g, char => char.toUpperCase()), String(v)]);
        });
      }
      if (report.patterns && Array.isArray(report.patterns)) {
        report.patterns.forEach((p, idx) => {
          insightBody.push([`Pattern ${idx + 1}`, doc.splitTextToSize(p, textMaxWidth - 40).join('\n')]); // Wrap pattern text
        });
      }
      if (report.concerns && Array.isArray(report.concerns)) {
        report.concerns.forEach((c, idx) => {
          insightBody.push([`Concern ${idx + 1}`, doc.splitTextToSize(c, textMaxWidth - 40).join('\n')]); // Wrap concern text
        });
      }
      if (report.final_summary) {
        insightBody.push(["Final Summary", doc.splitTextToSize(report.final_summary, textMaxWidth - 40).join('\n')]); // Wrap summary
      }

      autoTable(doc, {
        startY: nextY + 5,
        head: [["Field", "Value"]],
        body: insightBody,
        styles: { fontSize: 10, textColor: [0, 0, 0], cellPadding: 2, overflow: 'linebreak' },
        headStyles: { fillColor: [0, 128, 128], textColor: [255, 255, 255] },
        margin: { left: margin, right: margin },
      });
      nextY = doc.lastAutoTable.finalY + 10;
    }

    // --- Overall Analytics Chart Image ---
    if (overallAnalyticsChartCanvasRef.current && overallAnalyticsChartInstanceRef.current) {
      // Give Chart.js a moment to render on the hidden canvas
      await new Promise(resolve => setTimeout(resolve, 100));
      const imgData = overallAnalyticsChartCanvasRef.current.toDataURL('image/png');
      const imgWidth = 180; // Fixed width for chart image in PDF
      const imgHeight = (overallAnalyticsChartCanvasRef.current.height * imgWidth) / overallAnalyticsChartCanvasRef.current.width;

      addPageIfNeeded(imgHeight + 25); // Height for image + title + margin
      doc.setFontSize(14);
      doc.setTextColor(0, 128, 128);
      doc.text("Overall Analytics Chart:", margin, nextY);
      nextY += 5;
      doc.addImage(imgData, 'PNG', margin + 5, nextY, imgWidth, imgHeight); // Slightly indented
      nextY += imgHeight + 10;
    }


    // --- Patient Details ---
    if (details) {
      addPageIfNeeded(50);
      doc.setFontSize(14);
      doc.setTextColor(0, 128, 128); // Teal
      doc.text("Patient Details:", margin, nextY);
      nextY += 5;

      const detailsBody = [];
      detailsBody.push(["Prediction", details.isDiabetic ? "Diabetes" : "No Diabetes"]); // Corrected from 'prediction' to 'isDiabetic'
      detailsBody.push(["Pregnancies", String(details.pregnancies || 'N/A')]);
      detailsBody.push(["Latest Glucose", `${String(details.glucoseReadings && details.glucoseReadings.length > 0 ? details.glucoseReadings.slice(-1)[0]?.value : 'N/A')} mg/dL`]); // Corrected to use glucoseReadings
      detailsBody.push(["Blood Pressure", `${String(details.bloodPressure || 'N/A')} mmHg`]);
      detailsBody.push(["Skin Thickness", `${String(details.skinThickness || 'N/A')} mm`]);
      detailsBody.push(["Insulin", String(details.insulin || 'N/A')]);
      detailsBody.push(["BMI", user?.weight && user?.height ? Math.round(user.weight / ((user.height / 100) ** 2)) : 'N/A']); // BMI from user
      detailsBody.push(["Diabetes Pedigree Function", String(details.diabetesPedigreeFunction || 'N/A')]);
      detailsBody.push(["Age", `${String(user.age || 'N/A')} years`]); // Age from user
      detailsBody.push(["Height", `${String(user.height || 'N/A')} cm`]); // Height from user
      detailsBody.push(["Weight", `${String(user.weight || 'N/A')} kg`]); // Weight from user


      autoTable(doc, {
        startY: nextY + 5,
        head: [["Field", "Value"]],
        body: detailsBody,
        styles: { fontSize: 10, textColor: [0, 0, 0], cellPadding: 2, overflow: 'linebreak' },
        headStyles: { fillColor: [0, 128, 128], textColor: [255, 255, 255] },
        margin: { left: margin, right: margin },
      });
      nextY = doc.lastAutoTable.finalY + 10;

      // --- Historical Glucose Readings (Formatted) ---
      const historicalGlucose = details.glucoseReadings; // Use details.glucoseReadings directly
      if (historicalGlucose && Array.isArray(historicalGlucose) && historicalGlucose.length > 0) {
        addPageIfNeeded(40 + historicalGlucose.length * 8); // Estimate height for table
        doc.setFontSize(14);
        doc.setTextColor(0, 128, 128);
        doc.text("Historical Glucose Readings:", margin, nextY);
        nextY += 5;

        const glucoseTableBody = historicalGlucose.map(item => [
          new Date(item.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          `${item.value} mg/dL`
        ]);

        autoTable(doc, {
          startY: nextY + 5,
          head: [["Timestamp", "Glucose Value"]],
          body: glucoseTableBody,
          styles: { fontSize: 10, textColor: [0, 0, 0], cellPadding: 2, overflow: 'linebreak' },
          headStyles: { fillColor: [0, 128, 128], textColor: [255, 255, 255] },
          margin: { left: margin, right: margin },
        });
        nextY = doc.lastAutoTable.finalY + 10;
      }
    }

    // --- Historical Glucose Chart Image ---
    if (historicalGlucoseChartCanvasRef.current && historicalGlucoseChartInstanceRef.current) {
      // Give Chart.js a moment to render on the hidden canvas
      await new Promise(resolve => setTimeout(resolve, 100));
      const imgData = historicalGlucoseChartCanvasRef.current.toDataURL('image/png');
      const imgWidth = 180; // Fixed width for chart image in PDF
      const imgHeight = (historicalGlucoseChartCanvasRef.current.height * imgWidth) / historicalGlucoseChartCanvasRef.current.width;

      addPageIfNeeded(imgHeight + 25); // Height for image + title + margin
      doc.setFontSize(14);
      doc.setTextColor(0, 128, 128);
      doc.text("Historical Glucose Trends Chart:", margin, nextY);
      nextY += 5;
      doc.addImage(imgData, 'PNG', margin + 5, nextY, imgWidth, imgHeight); // Slightly indented
      nextY += imgHeight + 10;
    }


    // --- Recommendations Section ---
    if (recommendations) {
      addPageIfNeeded(50);
      doc.setFontSize(14);
      doc.setTextColor(0, 128, 128); // Teal
      doc.text("Recommendations:", margin, nextY);
      nextY += 8;

      // Diet Recommendations
      if (recommendations.diet && recommendations.diet.details && Array.isArray(recommendations.diet.details)) {
        addPageIfNeeded(30 + recommendations.diet.details.length * 7); // Estimate height for table
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0); // Black
        const dietSummaryText = `Diet: ${recommendations.diet.summary || ''}`;
        const splitDietSummary = doc.splitTextToSize(dietSummaryText, textMaxWidth - 10);
        doc.text(splitDietSummary, margin, nextY);
        nextY += (splitDietSummary.length * doc.getLineHeight()) + 5;

        const dietBody = recommendations.diet.details.map((rec, idx) => [`${idx + 1}.`, doc.splitTextToSize(rec, textMaxWidth - 40).join('\n')]);
        autoTable(doc, {
          startY: nextY,
          head: [["#", "Diet Recommendation"]],
          body: dietBody,
          styles: { fontSize: 10, textColor: [0, 0, 0], cellPadding: 2, overflow: 'linebreak' },
          headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0] }, // Light gray header
          margin: { left: margin + 10, right: margin },
        });
        nextY = doc.lastAutoTable.finalY + 10;
      }

      // Exercise Recommendations
      if (recommendations.exercise && recommendations.exercise.details && Array.isArray(recommendations.exercise.details)) {
        addPageIfNeeded(30 + recommendations.exercise.details.length * 7); // Estimate height for table
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0); // Black
        const exerciseSummaryText = `Exercise: ${recommendations.exercise.summary || ''}`;
        const splitExerciseSummary = doc.splitTextToSize(exerciseSummaryText, textMaxWidth - 10);
        doc.text(splitExerciseSummary, margin, nextY);
        nextY += (splitExerciseSummary.length * doc.getLineHeight()) + 5;

        const exerciseBody = recommendations.exercise.details.map((rec, idx) => [`${idx + 1}.`, doc.splitTextToSize(rec, textMaxWidth - 40).join('\n')]);
        autoTable(doc, {
          startY: nextY,
          head: [["#", "Exercise Recommendation"]],
          body: exerciseBody,
          styles: { fontSize: 10, textColor: [0, 0, 0], cellPadding: 2, overflow: 'linebreak' },
          headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0] },
          margin: { left: margin + 10, right: margin },
        });
        nextY = doc.lastAutoTable.finalY + 10;
      }

      // Analysis Summary
      if (recommendations.analysis_summary) {
        addPageIfNeeded(40); // Estimate height for summary
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0); // Black
        doc.text("Analysis Summary:", margin, nextY);
        nextY += 8;
        doc.setFontSize(10);
        const analysisText = recommendations.analysis_summary;
        const splitText = doc.splitTextToSize(analysisText, textMaxWidth - 10);
        doc.text(splitText, margin + 6, nextY); // Indent slightly
        nextY += (splitText.length * doc.getLineHeight()) + 5;
      }
    }

    doc.save("glucose_report.pdf");
  };

  return (
    <>
      <style>{`
        html, body, #root {
          margin: 0;
          padding: 0;
          width: 100%;
          overflow-x: hidden;
          background: radial-gradient(circle at center, #001f27 0%, #000a12 100%);
          color: #00ffc8;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          box-sizing: border-box;
        }
      `}</style>

      <div style={styles.wrapper}>
        <Header />
        <Navbar user={user} />

        <div style={styles.container}>
          <div style={styles.leftSection}>
            <h2 style={styles.heading}>Generate Glucose Analytics</h2>

            <button
              onClick={handleGenerateReport}
              disabled={loading}
              style={{ ...styles.button, opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "Generating..." : "Generate Report"}
            </button>

            {error && (
              <p style={{ color: "red", marginTop: 10, textAlign: "center", whiteSpace: "pre-wrap" }}>
                {error}
              </p>
            )}

            {/* ===== Recommendations Section for DISPLAY ===== */}
            <div style={{ marginTop: 30 }}>
              <h3 style={{ ...styles.reportTitle, marginBottom: 10, textAlign: "center" }}>
                Recommendations
              </h3>
              <div style={styles.reportBox}>
                {recommendations && (recommendations.diet || recommendations.exercise || recommendations.analysis_summary) ? (
                  <>
                    {/* Diet Recommendations */}
                    {recommendations.diet && recommendations.diet.details && Array.isArray(recommendations.diet.details) && (
                      <>
                        <h4 style={styles.subHeading}>Diet: {recommendations.diet.summary}</h4>
                        <ul style={{ paddingLeft: 16, margin: 0 }}>
                          {recommendations.diet.details.map((rec, idx) => (
                            <li key={`diet-${idx}`} style={styles.reportText}>{rec}</li>
                          ))}
                        </ul>
                      </>
                    )}

                    {/* Exercise Recommendations */}
                    {recommendations.exercise && recommendations.exercise.details && Array.isArray(recommendations.exercise.details) && (
                      <>
                        <h4 style={styles.subHeading}>Exercise: {recommendations.exercise.summary}</h4>
                        <ul style={{ paddingLeft: 16, margin: 0 }}>
                          {recommendations.exercise.details.map((rec, idx) => (
                            <li key={`exercise-${idx}`} style={styles.reportText}>{rec}</li>
                          ))}
                        </ul>
                      </>
                    )}

                    {/* Analysis Summary */}
                    {recommendations.analysis_summary && (
                      <>
                        <h4 style={styles.subHeading}>Analysis Summary:</h4>
                        <p style={styles.reportText}>{recommendations.analysis_summary}</p>
                      </>
                    )}
                  </>
                ) : (
                  <p style={{ color: "#aaa" }}>
                    Recommendations will appear after generating the report.
                  </p>
                )}
              </div>
            </div>

            <div style={styles.animation}>
              {animationData && (
                <Lottie
                  animationData={animationData}
                  loop
                  style={{ maxWidth: "100%", maxHeight: 400 }}
                />
              )}
            </div>
          </div>

          <div style={styles.rightSection}>
            <h3 style={styles.reportTitle}>Report Output</h3>
            <div style={styles.reportBox}>
              {report ? (
                <>
                  <h4 style={styles.subHeading}>Statistics:</h4>
                  <ul style={{ paddingLeft: 16, margin: 0 }}>
                    {report.statistics && Object.entries(report.statistics).map(([key, value]) => (
                      <li key={key} style={styles.reportText}>
                        <strong>{key.replace(/_/g, " ").replace(/\b\w/g, char => char.toUpperCase())}:</strong> {String(value)}
                      </li>
                    ))}
                  </ul>

                  <h4 style={styles.subHeading}>Patterns:</h4>
                  <ul style={{ paddingLeft: 16, margin: 0 }}>
                    {report.patterns && Array.isArray(report.patterns) && report.patterns.map((pattern, i) => (
                      <li key={`pattern-${i}`} style={styles.reportText}>{pattern}</li>
                    ))}
                  </ul>

                  <h4 style={styles.subHeading}>Concerns:</h4>
                  <ul style={{ paddingLeft: 16, margin: 0 }}>
                    {report.concerns && Array.isArray(report.concerns) && report.concerns.map((concern, i) => (
                      <li key={`concern-${i}`} style={styles.reportText}>{concern}</li>
                    ))}
                  </ul>

                  <h4 style={styles.subHeading}>Final Summary:</h4>
                  <p style={styles.reportText}>{report.final_summary}</p>
                </>
              ) : (
                <p style={{ color: "#aaa" }}>
                  Click the button to generate and view your glucose report.
                </p>
              )}
            </div>

            <h3 style={{ ...styles.reportTitle, marginTop: 30 }}>Details</h3>
            <div style={styles.reportBox}>
              {details ? (
                <>
                  <h4 style={styles.subHeading}>Prediction: {details.isDiabetic ? "Diabetes" : "No Diabetes"}</h4>
                  <ul style={{ paddingLeft: 16, margin: 0 }}>
                    <li style={styles.reportText}><strong>Pregnancies:</strong> {details.pregnancies || 'N/A'}</li>
                    <li style={styles.reportText}><strong>Latest Glucose:</strong> {details.glucoseReadings && details.glucoseReadings.length > 0 ? `${details.glucoseReadings.slice(-1)[0]?.value} mg/dL` : 'N/A'}</li>
                    <li style={styles.reportText}><strong>Blood Pressure:</strong> {details.bloodPressure || 'N/A'} mmHg</li>
                    <li style={styles.reportText}><strong>Skin Thickness:</strong> {details.skinThickness || 'N/A'} mm</li>
                    <li style={styles.reportText}><strong>Insulin:</strong> {details.insulin || 'N/A'}</li>
                    <li style={styles.reportText}><strong>Diabetes Pedigree Function:</strong> {details.diabetesPedigreeFunction || 'N/A'}</li>
                    <li style={styles.reportText}><strong>Age:</strong> {user?.age || 'N/A'} years</li>
                    <li style={styles.reportText}><strong>Height:</strong> {user?.height ? `${user.height} cm` : 'N/A'}</li>
                    <li style={styles.reportText}><strong>Weight:</strong> {user?.weight ? `${user.weight} kg` : 'N/A'}</li>
                    <li style={styles.reportText}><strong>BMI:</strong> {user?.weight && user?.height ? Math.round(user.weight / ((user.height / 100) ** 2)) : 'N/A'}</li>
                  </ul>

                  {details.glucoseReadings && details.glucoseReadings.length > 0 && (
                    <>
                      <h4 style={styles.subHeading}>Historical Glucose Readings:</h4>
                      <ul style={{ paddingLeft: 16, margin: 0 }}>
                        {details.glucoseReadings.map((reading, i) => (
                          <li key={`glucose-${i}`} style={styles.reportText}>
                            {new Date(reading.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}: {reading.value} mg/dL
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </>
              ) : (
                <p style={{ color: "#aaa" }}>
                  Details will appear after generating the report.
                </p>
              )}
            </div>

            <button
              onClick={downloadPDF}
              disabled={!report && !details && !recommendations}
              style={{ ...styles.button, marginTop: 20 }}
            >
              Download PDF
            </button>
          </div>
        </div>

        <Footer />
      </div>

      {/* Hidden Canvases for Chart Generation - DO NOT REMOVE OR HIDE */}
      <canvas ref={overallAnalyticsChartCanvasRef} width="600" height="300" style={{ display: 'none', position: 'absolute', top: -9999, left: -9999 }}></canvas>
      <canvas ref={historicalGlucoseChartCanvasRef} width="600" height="300" style={{ display: 'none', position: 'absolute', top: -9999, left: -9999 }}></canvas>
    </>
  );
}

const styles = {
  wrapper: {
    width: "100vw",
    minHeight: "100vh",
    margin: 0,
    padding: 0,
    background: "radial-gradient(circle at center, #001f27 0%, #000a12 100%)",
    color: "#00ffc8",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    boxSizing: "border-box",
    overflowX: "hidden",
  },
  container: {
    maxWidth: 1200,
    margin: "0 auto",
    width: "100%",
    padding: "24px",
    boxSizing: "border-sizing",
    minHeight: "calc(100vh - 120px)",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "40px",
  },
  heading: {
    textAlign: "center",
    fontWeight: "700",
    fontSize: 28,
    color: "#00ffc8",
    marginBottom: 20,
    letterSpacing: "1px",
  },
  button: {
    padding: 14,
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(90deg, #00ffc8, #005f5f)",
    color: "#002222",
    fontWeight: "700",
    fontSize: 16,
    cursor: "pointer",
    marginBottom: 30,
    width: "100%",
    transition: "background 0.3s ease, opacity 0.3s ease",
    "&:hover": {
        background: "linear-gradient(90deg, #00e0b8, #004f4f)",
    },
  },
  leftSection: {
    flex: "1 1 400px",
    minWidth: "300px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "rgba(0, 255, 200, 0.08)",
    padding: "24px",
    borderRadius: 16,
    border: "1.5px solid #00ffc8",
    backdropFilter: "blur(10px)",
    boxShadow: "0 0 12px #00ffc88c",
  },
  rightSection: {
    flex: "1 1 500px",
    minWidth: "300px",
    padding: "24px",
    backgroundColor: "rgba(0, 255, 200, 0.06)",
    borderRadius: 16,
    border: "1.5px solid #00ffc8",
    boxShadow: "0 0 10px #00ffc888",
    display: "flex",
    flexDirection: "column",
  },
  reportTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 14,
    color: "#00ffc8",
    textAlign: "center",
  },
  subHeading: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 10,
    color: "#00ffc8",
  },
  reportBox: {
    minHeight: "200px",
    maxHeight: "300px",
    overflowY: "auto",
    backgroundColor: "#001f27",
    border: "1px solid #00ffc8",
    borderRadius: "10px",
    padding: "16px",
    flexGrow: 1,
  },
  reportText: {
    color: "#00ffc8",
    fontSize: 14,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  animation: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
};

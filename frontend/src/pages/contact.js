import React, { useEffect, useState } from "react";
import Lottie from "lottie-react";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import Footer from "../components/footer";

export default function Contact() {
  const [animationData, setAnimationData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("https://assets10.lottiefiles.com/packages/lf20_3rwasyjy.json")
      .then((res) => res.json())
      .then((data) => setAnimationData(data));
  }, []);

   const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user info from localStorage or other source
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Your Web3Forms Access Key here (replace with your actual key)
  const ACCESS_KEY = "f3b27878-bea6-4fa1-8527-ebb2449f2ec8";

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);

    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (json.success) {
        alert("Your message has been sent successfully!");
        e.target.reset();
      } else {
        alert("Failed to send message. Please try again later.");
      }
    } catch (error) {
      alert("An error occurred. Please try again later.");
      console.error(error);
    }

    setLoading(false);
  }

  if (!animationData)
    return (
      <div
        style={{ ...styles.wrapper, display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <p>Loading animation...</p>
      </div>
    );

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
        <Navbar user={user}/>

        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            width: "100%",
            padding: "24px",
            boxSizing: "border-box",
            minHeight: "calc(100vh - 120px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={styles.main}>
            <form style={styles.form} onSubmit={handleSubmit}>
              {/* Web3Forms access key hidden input */}
              <input type="hidden" name="access_key" value={ACCESS_KEY} />
              {/* Optional: redirect URL after success */}
              {/* <input type="hidden" name="redirect" value="https://yourwebsite.com/thank-you" /> */}

              <h2 style={styles.heading}>Contact Us</h2>

              <input type="text" name="name" placeholder="Your Name" required style={styles.input} />
              <input type="email" name="email" placeholder="Your Email" required style={styles.input} />
              <textarea
                name="message"
                rows={6}
                placeholder="Your Message"
                required
                style={{ ...styles.input, resize: "vertical" }}
              />

              <button
                type="submit"
                style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>

            <div style={styles.animation}>
              <Lottie animationData={animationData} loop={true} style={{ maxWidth: "100%", maxHeight: 400 }} />
            </div>
          </div>
        </div>
        <Footer/>
      </div>
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
  main: {
    display: "flex",
    flexWrap: "wrap",
    gap: "40px",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  form: {
    flex: "1 1 400px",
    minWidth: "300px",
    backgroundColor: "rgba(0, 255, 200, 0.1)",
    boxShadow: "0 0 15px #00ffc8aa",
    borderRadius: 16,
    padding: 36,
    backdropFilter: "blur(14px)",
    border: "1.5px solid #00ffc8",
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  heading: {
    textAlign: "center",
    fontWeight: "700",
    fontSize: 30,
    color: "#00ffc8",
    marginBottom: 10,
    letterSpacing: "1.5px",
  },
  input: {
    padding: 14,
    borderRadius: 10,
    border: "1.5px solid #00ffc8",
    backgroundColor: "rgba(0, 255, 200, 0.12)",
    color: "#00ffc8",
    fontWeight: "600",
    fontSize: 16,
    outline: "none",
    transition: "border-color 0.3s ease",
  },
  button: {
    padding: 16,
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(90deg, #00ffc8, #005f5f)",
    color: "#002222",
    fontWeight: "700",
    fontSize: 18,
    cursor: "pointer",
    transition: "background 0.4s ease",
  },
  animation: {
    flex: "1 1 400px",
    minWidth: "300px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
};

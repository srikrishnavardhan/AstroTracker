import { useEffect, useState } from "react";

function App() {
  const [data, setData] = useState([]);
  const [selectedLaunch, setSelectedLaunch] = useState(null);
  const [countdown, setCountdown] = useState("");
  const [loading, setLoading] = useState(true);

  // Persist section across refresh
  const [section, setSection] = useState(() => {
    const saved = localStorage.getItem("astro-section");
    return saved ? saved : "launches";
  });

  useEffect(() => {
    localStorage.setItem("astro-section", section);
  }, [section]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // ===============================
  // Fetch Data
  // ===============================
  useEffect(() => {
    setLoading(true);
    setCurrentPage(1);

    let url = "";

    switch (section) {
      case "launches":
        url = "http://localhost:8080/api/events/external/launches";
        break;
      case "asteroids":
        url = "http://localhost:8080/api/events/external/neo";
        break;
      case "weather":
        url = "http://localhost:8080/api/events/external/donki";
        break;
      case "solar":
        url = "http://localhost:8080/api/events/external/solar";
        break;
      default:
        url = "";
    }

    fetch(url)
      .then(res => res.json())
      .then(result => {
        if (section === "launches") {
          setData(result.results || []);
        } else if (section === "asteroids") {
          const objects = Object.values(result.near_earth_objects || {}).flat();
          setData(objects);
        } else if (section === "weather") {
        setData({
          cme: JSON.parse(result.cme),
          flr: JSON.parse(result.flr),
          gst: JSON.parse(result.gst),
          sep: JSON.parse(result.sep)
        });
        } else if (section === "solar") {
          setData(result.bodies || []);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [section]);

  // ===============================
  // Countdown (Launches Only)
  // ===============================
  useEffect(() => {
    if (section !== "launches" || !data.length) return;

    const timer = setInterval(() => {
      const launchTime = new Date(data[0].window_start).getTime();
      const now = new Date().getTime();
      const diff = launchTime - now;

      if (diff <= 0) {
        setCountdown("🚀 Launched!");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [data, section]);

  const getStatusColor = (status) => {
    if (!status) return "#64748b";
    if (status.toLowerCase().includes("success")) return "#22c55e";
    if (status.toLowerCase().includes("flight")) return "#f59e0b";
    if (status.toLowerCase().includes("fail")) return "#ef4444";
    return "#3b82f6";
  };

  // Pagination logic
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = data.slice(startIndex, startIndex + itemsPerPage);

  return (
    <>
      <div className="space-bg"></div>

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo">AstroTracker</div>
        <div className="nav-links">
          {["launches", "asteroids", "weather", "solar"].map((item) => (
            <button
              key={item}
              className={`nav-link ${section === item ? "active" : ""}`}
              onClick={() => setSection(item)}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>
      </nav>

      <div className="app-container">

        <section className="hero">
          <h1>Track the Universe in Real Time</h1>
          <p>Live space launches, cosmic events & solar system data</p>
        </section>

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Fetching cosmic data...</p>
          </div>
        )}

        {/* ===============================
            LAUNCHES
        =============================== */}
        {!loading && section === "launches" && data.length > 0 && (
          <>
            <section className="highlight">
              <img src={data[0].image} alt={data[0].name} />
              <div className="highlight-info">
                <h2>{data[0].name}</h2>
                <div className="countdown-big">{countdown}</div>
                <p>{data[0].mission?.description?.substring(0, 200)}...</p>
              </div>
            </section>

            <div className="launch-grid">
              {data.map((launch) => (
                <div
                  key={launch.id}
                  className="launch-card"
                  onClick={() => setSelectedLaunch(launch)}
                >
                  {launch.image && (
                    <img
                      src={launch.image}
                      alt={launch.name}
                      className="launch-image"
                    />
                  )}
                  <div className="card-content">
                    <h2>{launch.name}</h2>
                    <div
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(launch.status?.name) }}
                    >
                      {launch.status?.name}
                    </div>
                    <p>
                      {launch.window_start
                        ? new Date(launch.window_start).toLocaleString()
                        : "TBD"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ===============================
            ASTEROIDS
        =============================== */}
        {!loading && section === "asteroids" && (
          <>
            <div className="launch-grid">
              {currentItems.map((asteroid, index) => {
                const approach = asteroid.close_approach_data?.[0];
                return (
                  <div key={index} className="launch-card">
                    <div className="card-content">
                      <h2>{asteroid.name}</h2>
                      <p>📅 {approach?.close_approach_date || "N/A"}</p>
                      <p>
                        🚀 {approach?.relative_velocity?.kilometers_per_hour
                          ? Math.round(approach.relative_velocity.kilometers_per_hour) + " km/h"
                          : "N/A"}
                      </p>
                      <p>
                        📏 {asteroid.estimated_diameter?.meters?.estimated_diameter_max
                          ? asteroid.estimated_diameter.meters.estimated_diameter_max.toFixed(2) + " m"
                          : "N/A"}
                      </p>
                      <p style={{
                        color: asteroid.is_potentially_hazardous_asteroid ? "#ef4444" : "#22c55e",
                        fontWeight: "bold"
                      }}>
                        {asteroid.is_potentially_hazardous_asteroid ? "⚠ Hazardous" : "✅ Safe"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                >
                  Previous
                </button>
                <span>Page {currentPage} / {totalPages}</span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* ===============================
            WEATHER + SOLAR
        =============================== */}
        {/* ===============================
    WEATHER (DONKI)
=============================== */}
{/* ===============================
    WEATHER (NASA DONKI)
================================ */}
{!loading && section === "weather" && (
  <>
    <h2 style={{ marginBottom: "40px" }}>🌌 Space Weather Activity</h2>

    <div className="launch-grid">

      {/* CME */}
      {data.cme?.slice(0, 5).map((event, index) => (
        <div key={"cme"+index} className="launch-card">
          <div className="card-content">
            <h2>🌞 CME</h2>
            <p>📅 {new Date(event.startTime).toLocaleString()}</p>
            <p>📍 Source: {event.sourceLocation || "Unknown"}</p>
            <p>
              🚀 Speed: {
                event.cmeAnalyses?.[0]?.speed
                  ? event.cmeAnalyses[0].speed + " km/s"
                  : "N/A"
              }
            </p>
            <p>{event.note?.substring(0,150) || "No details available"}</p>
          </div>
        </div>
      ))}

      {/* Solar Flares */}
      {data.flr?.slice(0, 5).map((event, index) => (
        <div key={"flr"+index} className="launch-card">
          <div className="card-content">
            <h2>🔥 Solar Flare</h2>
            <p>📅 {new Date(event.beginTime).toLocaleString()}</p>
            <p>⚡ Class: {event.classType}</p>
            <p>📍 Source: {event.sourceLocation || "Unknown"}</p>
          </div>
        </div>
      ))}

      {/* Geomagnetic Storm */}
      {data.gst?.slice(0, 5).map((event, index) => (
        <div key={"gst"+index} className="launch-card">
          <div className="card-content">
            <h2>🌍 Geomagnetic Storm</h2>
            <p>📅 {new Date(event.startTime).toLocaleString()}</p>
            <p>
              🌡 Kp Index: {
                event.allKpIndex?.[0]?.kpIndex ?? "N/A"
              }
            </p>
          </div>
        </div>
      ))}

      {/* Solar Energetic Particle */}
      {data.sep?.slice(0, 5).map((event, index) => (
        <div key={"sep"+index} className="launch-card">
          <div className="card-content">
            <h2>☢ Solar Energetic Particle</h2>
            <p>📅 {new Date(event.eventTime).toLocaleString()}</p>
            <p>📍 Source: {event.sourceLocation || "Unknown"}</p>
          </div>
        </div>
      ))}

    </div>
  </>
)}



{/* ===============================
    SOLAR SYSTEM
=============================== */}
{!loading && section === "solar" && (
  <div className="launch-grid">
    {currentItems.map((item, index) => (
      <div key={index} className="launch-card">
        <div className="card-content">
          <h2>{item.englishName || "Unknown Body"}</h2>

          <p>🌍 Gravity: {item.gravity || "N/A"} m/s²</p>
          <p>📏 Radius: {item.meanRadius || "N/A"} km</p>

          {item.mass && (
            <p>
              ⚖ Mass: {item.mass.massValue} ×10^{item.mass.massExponent} kg
            </p>
          )}
        </div>
      </div>
    ))}
  </div>
)}


      </div>

      {/* MODAL */}
      {selectedLaunch && (
        <div className="modal-overlay" onClick={() => setSelectedLaunch(null)}>
          <div className="modal-content">
            <h2>{selectedLaunch.name}</h2>
            <p>{selectedLaunch.mission?.description}</p>
            <button
              className="close-btn"
              onClick={() => setSelectedLaunch(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;

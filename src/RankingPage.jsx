import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

function RankingPage() {

  const { code } = useParams();

  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==============================
  // FETCH RANKING
  // ==============================
  useEffect(() => {

    fetch(`${API}/api/exams/ranking/${code}`)
      .then((res) => res.json())
      .then((data) => {

        setRanking(data || []);

        setLoading(false);

      })
      .catch(() => {

        setLoading(false);

      });

  }, [code]);

  // ==============================
  // LOADING
  // ==============================
  if (loading) {

    return (

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#071028",
          color: "white",
          fontSize: 30,
          fontWeight: "bold"
        }}
      >
        Loading Ranking...
      </div>

    );
  }

  return (

    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#071028,#111827)",
        padding: 20
      }}
    >

      <div
        style={{
          maxWidth: 1100,
          margin: "auto"
        }}
      >

        {/* TOP */}
        <div
          style={{
            background:
              "linear-gradient(135deg,#2563eb,#7c3aed)",
            padding: 30,
            borderRadius: 28,
            marginBottom: 30,
            color: "white",
            textAlign: "center"
          }}
        >

          <h1
            style={{
              fontSize: "clamp(30px,5vw,60px)",
              marginBottom: 10
            }}
          >
            🏆 Ranking Board
          </h1>

          <p
            style={{
              fontSize: 18,
              opacity: 0.9
            }}
          >
            Exam Code: {code}
          </p>

        </div>

        {/* EMPTY */}
        {ranking.length === 0 && (

          <div
            style={{
              background: "white",
              padding: 40,
              borderRadius: 24,
              textAlign: "center",
              fontSize: 22,
              fontWeight: "bold"
            }}
          >
            এখনও কেউ পরীক্ষা দেয়নি
          </div>

        )}

        {/* LIST */}
        <div
          style={{
            display: "grid",
            gap: 18
          }}
        >

          {ranking.map((item, index) => (

            <div
              key={index}
              style={{
                background: "white",
                borderRadius: 24,
                padding: 22,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 16,
                boxShadow:
                  "0 10px 25px rgba(0,0,0,0.08)"
              }}
            >

              {/* LEFT */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18
                }}
              >

                {/* POSITION */}
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    background:
                      index === 0
                        ? "#facc15"
                        : index === 1
                        ? "#d1d5db"
                        : index === 2
                        ? "#fdba74"
                        : "#2563eb",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "white",
                    fontSize: 24,
                    fontWeight: "bold"
                  }}
                >
                  #{index + 1}
                </div>

                {/* INFO */}
                <div>

                  <h2
                    style={{
                      fontSize: 24,
                      marginBottom: 4,
                      color: "#0f172a"
                    }}
                  >
                    {item.name}
                  </h2>

                  <p
                    style={{
                      color: "#64748b",
                      fontSize: 16
                    }}
                  >
                    Roll: {item.roll}
                  </p>

                </div>

              </div>

              {/* SCORE */}
              <div
                style={{
                  background:
                    "linear-gradient(135deg,#22c55e,#16a34a)",
                  color: "white",
                  padding: "14px 24px",
                  borderRadius: 18,
                  fontSize: 24,
                  fontWeight: "bold"
                }}
              >
                🎯 {item.score}
              </div>

            </div>

          ))}

        </div>

      </div>

    </div>

  );
}

export default RankingPage;
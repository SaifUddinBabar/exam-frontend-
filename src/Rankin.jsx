import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

function Ranking() {
  const { code } = useParams();
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(`${API}/api/exams/ranking/${code}`)
      .then(res => res.json())
      .then(data => setData(data));
  }, [code]);

  if (!data.length) return <h2 style={{ textAlign: "center" }}>No Data</h2>;

  const top3 = data.slice(0, 3);
  const rest = data.slice(3);

  return (
    <div style={{
      padding: 20,
      maxWidth: 500,
      margin: "auto",
      background: "#064e3b",
      minHeight: "100vh",
      color: "white"
    }}>

      <h2 style={{ textAlign: "center" }}>🏆 Ranking</h2>

      {/* TOP 3 */}
      <div style={{
        display: "flex",
        justifyContent: "space-around",
        alignItems: "end",
        marginTop: 30
      }}>

        {/* 2nd */}
        {top3[1] && (
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: 70,
              height: 70,
              borderRadius: "50%",
              background: "#fff",
              margin: "auto",
              border: "4px solid orange"
            }} />
            <p>{top3[1].name}</p>
            <p>{top3[1].score} pts</p>
          </div>
        )}

        {/* 1st */}
        {top3[0] && (
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: 90,
              height: 90,
              borderRadius: "50%",
              background: "#fff",
              margin: "auto",
              border: "5px solid gold"
            }} />
            <h3>👑 {top3[0].name}</h3>
            <p>{top3[0].score} pts</p>
          </div>
        )}

        {/* 3rd */}
        {top3[2] && (
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: 70,
              height: 70,
              borderRadius: "50%",
              background: "#fff",
              margin: "auto",
              border: "4px solid bronze"
            }} />
            <p>{top3[2].name}</p>
            <p>{top3[2].score} pts</p>
          </div>
        )}
      </div>

      {/* LIST */}
      <div style={{ marginTop: 30 }}>
        {rest.map((item, index) => (
          <div
            key={index}
            style={{
              padding: 12,
              marginTop: 10,
              borderRadius: 10,
              background: "#065f46",
              display: "flex",
              justifyContent: "space-between"
            }}
          >
            <span>#{index + 4} {item.name}</span>
            <span>{item.score} pts</span>
          </div>
        ))}
      </div>

    </div>
  );
}

export default Ranking;
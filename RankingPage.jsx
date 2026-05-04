import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function RankingPage() {
  const { code } = useParams(); // URL থেকে exam code নেবে
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/exams/ranking/${code}`)
      .then(res => res.json())
      .then(data => setData(data))
      .catch(err => console.error(err));
  }, [code]);

  return (
    <div style={{ padding: 20 }}>
      <h2>📊 Ranking</h2>

      {data.length === 0 && <p>No submissions yet</p>}

      {data.map((s, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <strong>#{i + 1}</strong> — {s.name} ({s.roll}) → {s.score}
        </div>
      ))}
    </div>
  );
}

export default RankingPage;
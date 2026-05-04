import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function Ranking() {
  const { code } = useParams();
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/exams/ranking/${code}`)
      .then(res => res.json())
      .then(data => setData(data));
  }, [code]);

  return (
    <div style={{ padding: 20 }}>
      <h2>🏆 Ranking</h2>

      {data.length === 0 && <p>No data yet</p>}

      {data.map((item, index) => (
        <div key={index}>
          #{index + 1} | {item.name} | Score: {item.score}
        </div>
      ))}
    </div>
  );
}

export default Ranking;
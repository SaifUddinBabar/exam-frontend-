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

  return (
    <div>
      <h2>Ranking</h2>
      {data.map((item, i) => (
        <div key={i}>
          #{i + 1} {item.name} - {item.score}
        </div>
      ))}
    </div>
  );
}

export default Ranking;
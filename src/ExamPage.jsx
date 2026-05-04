import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

function ExamPage() {
  const { code } = useParams();

  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const [name, setName] = useState("");
  const [roll, setRoll] = useState("");
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    fetch(`${API}/api/exams/${code}`)
      .then(res => res.json())
      .then(data => setExam(data));
  }, [code]);

  const selectAnswer = (qid, option) => {
    setAnswers({ ...answers, [qid]: option });
  };

  const submitExam = async () => {
    const res = await fetch(`${API}/api/exams/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        examCode: exam.examCode,
        name,
        roll,
        answers
      })
    });

    const data = await res.json();
    setScore(data.score);
    setReviewData(data);
  };

  if (!exam) return <h2>Loading...</h2>;

  const q = exam.questions[current];

  return (
    <div>
      <h2>{exam.title}</h2>

      <input placeholder="Name" onChange={e => setName(e.target.value)} />
      <input placeholder="Roll" onChange={e => setRoll(e.target.value)} />

      <h3>{q.question}</h3>

      {q.options.map((opt, i) => (
        <div key={i}>
          <input
            type="radio"
            checked={answers[q._id] === opt}
            onChange={() => selectAnswer(q._id, opt)}
          />
          {opt}
        </div>
      ))}

      <button onClick={submitExam}>Submit</button>

      {score && <h2>Score: {score}</h2>}
    </div>
  );
}

export default ExamPage;
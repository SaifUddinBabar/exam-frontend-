import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

function ExamPage() {
  const { code } = useParams();

  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const [name, setName] = useState("");
  const [roll, setRoll] = useState("");
  const [current, setCurrent] = useState(0);

  // 🔥 Load exam
  useEffect(() => {
    fetch(`http://localhost:5000/api/exams/${code}`)
      .then(res => res.json())
      .then(data => setExam(data));
  }, [code]);

  // 🔥 Select answer
  const selectAnswer = (qid, option) => {
    setAnswers({
      ...answers,
      [qid]: option
    });
  };

  // 🔥 Navigation
  const next = () => {
    if (current < exam.questions.length - 1) {
      setCurrent(current + 1);
    }
  };

  const prev = () => {
    if (current > 0) {
      setCurrent(current - 1);
    }
  };

  // 🔥 Submit
  const submitExam = async () => {
    const res = await fetch("http://localhost:5000/api/exams/submit", {
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
    <div style={{ padding: 20 }}>

      <h2>{exam.title}</h2>

      {/* User Info */}
      <input
        placeholder="Name"
        onChange={e => setName(e.target.value)}
      /><br />

      <input
        placeholder="Roll"
        onChange={e => setRoll(e.target.value)}
      /><br />

      {/* Question Tracker */}
      <div style={{ margin: "20px 0" }}>
        {exam.questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            style={{
              margin: 3,
              padding: "5px 10px",
              background: answers[exam.questions[i]._id]
                ? "#22c55e"
                : i === current
                ? "#3b82f6"
                : "#ccc",
              color: "white",
              border: "none"
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Question */}
      <h3>
        Q{current + 1}: {q.question}
      </h3>

      {/* Options */}
      {q.options.map((opt, i) => (
        <label key={i} style={{ display: "block" }}>
          <input
            type="radio"
            name={q._id}
            checked={answers[q._id] === opt}
            onChange={() => selectAnswer(q._id, opt)}
          />
          {opt}
        </label>
      ))}

      {/* Navigation */}
      <div style={{ marginTop: 20 }}>
        <button onClick={prev}>⬅ Prev</button>
        <button onClick={next} style={{ marginLeft: 10 }}>
          Next ➡
        </button>
      </div>

      {/* Submit */}
      <div style={{ marginTop: 20 }}>
        <button onClick={submitExam}>Submit Exam</button>
      </div>

      {/* Score */}
      {score !== null && (
        <h2>
          🎯 Score: {score} / {exam.questions.length}
        </h2>
      )}

      {/* 🔥 Review */}
      {reviewData && (
        <div style={{ marginTop: 30 }}>
          <h2>📊 Review</h2>

          {reviewData.questions.map((q, index) => {
            const userAns = reviewData.answers[q._id];
            const correct = q.correctAnswer;

            return (
              <div key={index} style={{ marginBottom: 15 }}>
                <p>Q{index + 1}: {q.question}</p>

                {q.options.map((opt, i) => {
                  let color = "";

                  if (opt === correct) color = "green";
                  if (opt === userAns && opt !== correct) color = "red";

                  return (
                    <div key={i} style={{ color }}>
                      {opt}
                      {opt === correct && " ✅"}
                      {opt === userAns && opt !== correct && " ❌"}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

export default ExamPage;
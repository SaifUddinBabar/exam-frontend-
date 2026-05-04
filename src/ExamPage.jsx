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

  // ================= LOAD EXAM =================
  useEffect(() => {
    fetch(`${API}/api/exams/${code}`)
      .then(res => res.json())
      .then(data => setExam(data));
  }, [code]);

  // ================= BLOCK CLOSE =================
  useEffect(() => {
    const block = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", block);
    return () => window.removeEventListener("beforeunload", block);
  }, []);

  // ================= BLOCK BACK =================
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    const handlePop = () => {
      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  // ================= SELECT =================
  const selectAnswer = (qid, option) => {
    setAnswers({ ...answers, [qid]: option });
  };

  // ================= SUBMIT =================
  const submitExam = async () => {
    if (!window.confirm("Submit exam?")) return;

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

  // ================= LOCK + REVIEW =================
  if (score !== null && reviewData) {
    return (
      <div style={{
        minHeight: "100vh",
        padding: 20,
        background: "#0f172a",
        color: "white"
      }}>
        <h1>✅ Exam Submitted</h1>
        <h2>🎯 Score: {score} / {reviewData.questions.length}</h2>

        <p style={{ color: "#f87171" }}>
          🚫 You cannot leave this page
        </p>

        <h3 style={{ marginTop: 20 }}>📊 Review</h3>

        {reviewData.questions.map((q, index) => {
          const userAns = reviewData.answers[q._id];
          const correct = q.correctAnswer;

          return (
            <div key={index} style={{
              marginBottom: 20,
              padding: 15,
              background: "#1e293b",
              borderRadius: 10
            }}>
              <p>Q{index + 1}: {q.question}</p>

              {q.options.map((opt, i) => {
                let bg = "#334155";

                if (opt === correct) bg = "#16a34a"; // correct
                if (opt === userAns && opt !== correct) bg = "#dc2626"; // wrong

                return (
                  <div key={i} style={{
                    marginTop: 8,
                    padding: 8,
                    borderRadius: 6,
                    background: bg
                  }}>
                    {opt}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  }

  // ================= LOADING =================
  if (!exam || !exam.questions)
    return <h2 style={{ textAlign: "center" }}>Loading...</h2>;

  const q = exam.questions[current];
  const progress = Math.round(
    (Object.keys(answers).length / exam.questions.length) * 100
  );

  // ================= UI =================
  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "auto" }}>

      {/* HEADER */}
      <div style={{
        position: "sticky",
        top: 0,
        background: "#0f172a",
        padding: 10,
        borderRadius: 10,
        marginBottom: 20,
        color: "white"
      }}>
        <h2>{exam.title}</h2>

        <div style={{
          height: 8,
          background: "#334155",
          borderRadius: 10
        }}>
          <div style={{
            width: `${progress}%`,
            background: "#22c55e",
            height: "100%"
          }} />
        </div>

        <p>{progress}% Completed</p>
      </div>

      {/* USER INFO */}
      <div style={{ marginBottom: 20 }}>
        <input placeholder="Name" onChange={e => setName(e.target.value)} />
        <input placeholder="Roll" onChange={e => setRoll(e.target.value)} />
      </div>

      {/* QUESTION NAV */}
      <div style={{ marginBottom: 20 }}>
        {exam.questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            style={{
              margin: 4,
              padding: "6px 12px",
              borderRadius: 6,
              border: "none",
              background:
                answers[exam.questions[i]._id]
                  ? "#22c55e"
                  : i === current
                  ? "#3b82f6"
                  : "#94a3b8",
              color: "white"
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* QUESTION */}
      <div style={{
        padding: 20,
        borderRadius: 10,
        background: "#f1f5f9"
      }}>
        <h3>Q{current + 1}: {q.question}</h3>

        {q.options.map((opt, i) => (
          <div
            key={i}
            onClick={() => selectAnswer(q._id, opt)}
            style={{
              padding: 10,
              marginTop: 10,
              borderRadius: 8,
              cursor: "pointer",
              background:
                answers[q._id] === opt ? "#3b82f6" : "#e2e8f0",
              color: answers[q._id] === opt ? "white" : "black"
            }}
          >
            {opt}
          </div>
        ))}
      </div>

      {/* NAV */}
      <div style={{ marginTop: 20 }}>
        <button onClick={() => setCurrent(prev => Math.max(prev - 1, 0))}>
          ⬅ Prev
        </button>

        <button
          onClick={() =>
            setCurrent(prev =>
              Math.min(prev + 1, exam.questions.length - 1)
            )
          }
          style={{ marginLeft: 10 }}
        >
          Next ➡
        </button>
      </div>

      {/* SUBMIT */}
      <div style={{ marginTop: 20 }}>
        <button
          onClick={submitExam}
          style={{
            padding: "10px 20px",
            background: "#16a34a",
            color: "white",
            borderRadius: 8
          }}
        >
          🚀 Submit Exam
        </button>
      </div>
    </div>
  );
}

export default ExamPage;
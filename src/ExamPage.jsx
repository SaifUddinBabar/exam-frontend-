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
  const [timeLeft, setTimeLeft] = useState(600); // 🔥 10 min default

  // ================= LOAD EXAM =================
  useEffect(() => {
    fetch(`${API}/api/exams/${code}`)
      .then(res => res.json())
      .then(data => {
        setExam(data);
        if (data.duration) {
          setTimeLeft(data.duration * 60);
        }
      });
  }, [code]);

  // ================= TIMER =================
  useEffect(() => {
    if (timeLeft <= 0) {
      submitExam();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = () => {
    const min = Math.floor(timeLeft / 60);
    const sec = timeLeft % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  // ================= FULLSCREEN =================
  useEffect(() => {
    document.documentElement.requestFullscreen?.();
  }, []);

  // ================= TAB SWITCH DETECT =================
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        alert("⚠️ Don't switch tabs!");
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
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

  // ================= REVIEW =================
  if (score !== null && reviewData) {
    return (
      <div style={{ padding: 20 }}>
        <h1>✅ Submitted</h1>
        <h2>Score: {score}</h2>
      </div>
    );
  }

  if (!exam) return <h2>Loading...</h2>;

  const q = exam.questions[current];
  const progress =
    (Object.keys(answers).length / exam.questions.length) * 100;

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "auto" }}>

      {/* HEADER */}
      <div style={{
        position: "sticky",
        top: 0,
        background: "#0f172a",
        color: "white",
        padding: 15,
        borderRadius: 10
      }}>
        <h2>{exam.title}</h2>

        <h3>⏱️ {formatTime()}</h3>

        <div style={{ height: 8, background: "#333", borderRadius: 10 }}>
          <div style={{
            width: `${progress}%`,
            background: "#22c55e",
            height: "100%"
          }} />
        </div>
      </div>

      {/* QUESTION */}
      <div style={{ marginTop: 20 }}>
        <h3>Q{current + 1}: {q.question}</h3>

        {q.options.map((opt, i) => (
          <div
            key={i}
            onClick={() => selectAnswer(q._id, opt)}
            style={{
              padding: 12,
              marginTop: 10,
              borderRadius: 10,
              cursor: "pointer",
              background:
                answers[q._id] === opt ? "#3b82f6" : "#eee",
              color:
                answers[q._id] === opt ? "white" : "black"
            }}
          >
            {opt}
          </div>
        ))}
      </div>

      {/* NAV */}
      <div style={{ marginTop: 20 }}>
        <button onClick={() => setCurrent(c => Math.max(c - 1, 0))}>
          Prev
        </button>
        <button
          onClick={() =>
            setCurrent(c =>
              Math.min(c + 1, exam.questions.length - 1)
            )
          }
        >
          Next
        </button>
      </div>

      {/* SUBMIT */}
      <button onClick={submitExam} style={{ marginTop: 20 }}>
        Submit
      </button>
    </div>
  );
}

export default ExamPage;